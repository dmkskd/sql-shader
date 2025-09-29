import mermaid from 'mermaid';
import * as d3 from 'd3';
// Use a namespace import to robustly handle this non-standard module.
import * as d3_flame_graph from 'd3-flame-graph';

export class ClickHouseProfiler {
  constructor(client) {
    this.client = client;
  }

  /**
   * Runs the query with profiling enabled and collects various performance metrics.
   * @param {string} sql The raw SQL of the shader to profile.
   * @param {Array<any>} params The parameters for the query.
   * @param {function(string): void} [statusCallback=(() => {})] Optional callback to report progress.
   * @returns {Promise<object>} A data object containing plans, logs, and traces.
   */
  async profile(sql, params, statusCallback = () => {}) {
    // Use the provided status callback, or a no-op function if none is given.
    statusCallback('Profiling...'); // Initial message
    const cleanedSql = sql.replace(/{[^}]+}/g, '1');
    const queryId = `pixelql-${Date.now()}`;
    let profileData = {};

    // 1. Get EXPLAIN PIPELINE graph
    statusCallback('Profiling: Pipeline...');
    try {
      const graphSql = `EXPLAIN PIPELINE graph = 1 ${cleanedSql}`;
      const graphResultSet = await this.client.query({ query: graphSql, format: 'JSONEachRow' });
      const graphRows = await graphResultSet.json();
      profileData.pipelineGraph = graphRows.map(row => row.explain).join('\n');
    } catch (e) {
      console.error('Failed to get EXPLAIN PIPELINE graph:', e);
      profileData.pipelineGraph = `Error: ${e.message}`;
    }

    // 2. Get EXPLAIN actions, indexes
    statusCallback('Profiling: Actions...');
    try {
      const actionsSql = `EXPLAIN actions = 1, indexes = 1 ${cleanedSql}`;
      const actionsResultSet = await this.client.query({ query: actionsSql, format: 'JSONEachRow' });
      const actionsRows = await actionsResultSet.json();
      profileData.actionsPlan = actionsRows.map(row => row.explain).join('\n');
    } catch (e) {
      console.error('Failed to get EXPLAIN actions/indexes:', e);
      profileData.actionsPlan = `Error: ${e.message}`;
    }

    // 3. Execute the actual query and fetch logs
    let finalSql = sql
      .replace('{width:UInt32}', params[0])
      .replace('{height:UInt32}', params[1])
      .replace('{iTime:Float64}', params[2])
      .replace('{mx:Float64}', params[3])
      .replace('{my:Float64}', params[4]);

    statusCallback('Profiling: Executing...');

    try {
      // Execute the query. We rely on the server-side user profile to have the
      // correct profiling settings enabled, but we also explicitly enable server-side trace logging.
      const mainQueryResultSet = await this.client.query({
        query: finalSql,
        query_id: queryId,
        format: 'JSONEachRow',
      });
      // We no longer rely on streamed logs. They will be fetched from system.text_log later.
      await mainQueryResultSet.json(); // Still need to consume the result set.
    } catch (e) {
      // If the query fails, we might still have received logs before the error.
      if (e.response && e.response.logs) {
        profileData.serverTextLog = e.response.logs;
        console.log(`[Debug] Captured ${profileData.serverTextLog.length} server text log entries from a failed query.`);
      }
      console.warn('Shader query failed during profiling, but attempting to fetch logs anyway.', e);
    }

    // Force ClickHouse to flush its log buffers to the system tables.
    // This is more reliable than waiting with a timeout and ensures the logs are available.
    statusCallback('Profiling: Flushing...');
    try {
      await this.client.command({ query: 'SYSTEM FLUSH LOGS' });
      // Add an explicit, long wait to test the theory that logs need more time to propagate.
      const waitDuration = 3000; // 3 seconds
      console.log(`[Debug] Waiting for ${waitDuration}ms to ensure all server logs are flushed...`);
      await new Promise(resolve => setTimeout(resolve, waitDuration));
      console.log('[engine.tracing] Flushed system logs successfully.');
    } catch (e) {
      console.warn('Failed to execute SYSTEM FLUSH LOGS, falling back to a timeout. This might happen due to user permissions.', e);
      await new Promise(resolve => setTimeout(resolve, 500)); // Use a slightly longer fallback timeout
    }

    // 4. Poll for both query_log and trace_log entries in a single loop.
    // This is more robust against race conditions where one log flushes before the other.
    statusCallback('Profiling: Polling...');
    const maxRetries = 8;
    const retryDelay = 250; // ms

    try {
      for (let i = 0; i < maxRetries; i++) {
        // Attempt to fetch query_log if we don't have it yet
        if (!profileData.queryLog) {
          const queryLogQuery = `SELECT * FROM system.query_log WHERE query_id = '${queryId}' AND type = 'QueryFinish' LIMIT 1`;
          console.log('[Profiler] Executing Query Summary query:', queryLogQuery);
          const queryLogResultSet = await this.client.query({ query: queryLogQuery, format: 'JSONEachRow' });
          const queryLogData = await queryLogResultSet.json();
          if (queryLogData.length > 0) {
            profileData.queryLog = queryLogData[0];
            console.log(`[Profiler] Found Query Summary data in system.query_log after ${i + 1} attempt(s).`);
          }
        }

        // Attempt to fetch trace_log if we don't have it yet
        if (!profileData.traceLog || profileData.traceLog.length === 0) {
          const traceQuery = `
            SELECT arrayStringConcat(arrayMap(x -> demangle(addressToSymbol(x)), trace), ';') AS stack, count() AS value
            FROM system.trace_log
            WHERE query_id = '${queryId}' AND trace_type = 'CPU'
            GROUP BY trace
          `;
          console.log('[Profiler] Executing CPU Trace (FlameGraph) query:', traceQuery.trim());
          const traceResultSet = await this.client.query({ query: traceQuery.trim(), format: 'JSONEachRow', clickhouse_settings: { allow_introspection_functions: 1 } });
          const resolvedTraces = await traceResultSet.json();
          if (resolvedTraces.length > 0) {
            profileData.traceLog = resolvedTraces.map(row => ({ trace: row.stack.split(';'), value: row.value }));
            console.log(`[Profiler] Found CPU Trace data for FlameGraph in system.trace_log after ${i + 1} attempt(s).`);
          }
        }

        // Attempt to fetch server logs from system.text_log if we don't have them yet
        if (!profileData.serverTextLog || profileData.serverTextLog.length === 0) {
          const serverLogQuery = `SELECT event_time_microseconds, logger_name as source, thread_name, thread_id, level, message FROM system.text_log WHERE query_id = '${queryId}' ORDER BY event_time_microseconds`;
          console.log('[Profiler] Executing Server Text Log (Trace Log tab) query:', serverLogQuery);
          const serverLogResultSet = await this.client.query({ query: serverLogQuery, format: 'JSONEachRow' });
          const serverLogData = await serverLogResultSet.json();
          if (serverLogData.length > 0) {
            profileData.serverTextLog = serverLogData;
            console.log(`[Profiler] Found Server Text Log data for the 'Trace Log' tab in system.text_log after ${i + 1} attempt(s).`);
          }
        }

        // If we have all the data we need, we can stop waiting
        // We no longer poll for query_thread_log.
        const hasQueryLog = !!profileData.queryLog;
        const hasTraceLog = profileData.traceLog && profileData.traceLog.length > 0;
        if (hasQueryLog && hasTraceLog) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    } catch (e) {
      console.error('Failed during log polling:', e);
    }

    // Add final status logging after polling is complete.
    console.log(`[Profiler] Polling finished. Found Query Summary data: ${!!profileData.queryLog}`);
    console.log(`[Profiler] Polling finished. Found Server Text Log entries (for 'Trace Log' tab): ${profileData.serverTextLog ? profileData.serverTextLog.length : 0}`);
    console.log(`[Profiler] Polling finished. Found CPU Trace entries (for FlameGraph): ${profileData.traceLog ? profileData.traceLog.length : 0}`);

    statusCallback('Profiling: Rendering...');
    console.log('[engine.profile] Profiling data collection complete.');
    return profileData;
  }

  /**
   * Renders the multi-faceted profile data into the modal.
   * @param {object} profileData The data object from the profile() method.
   * @param {HTMLElement} mainContainer The single container element for the profiler UI.
   * @returns {Promise<void>}
   */
  async renderProfile(profileData, mainContainer) {


    // --- Tab 2: Structured Plan ---
    // The parsed, collapsible, and highlighted version of the actions plan
    const planText = profileData.actionsPlan || 'No data.';
    let formattedHtml = '';
    let inActionsBlock = false;
    const lines = planText.split('\n');

    for (const line of lines) {
      let processedLine = line.replace(/(Expression|Join|Sorting|ReadFromSystemNumbers|FUNCTION|COLUMN|ALIAS)/g, '<span class="time-warm">$1</span>');

      if (line.trim().startsWith('Actions:')) {
        inActionsBlock = true;
        // Start a collapsible section. The summary is the "Actions:" line itself.
        formattedHtml += `<details><summary>${processedLine}</summary><pre>`;
      } else if (inActionsBlock) {
        // Check for the end of the Actions block. It ends when a line is not indented
        // or is the 'Positions:' line.
        if (!line.startsWith(' ') || line.trim().startsWith('Positions:')) {
          inActionsBlock = false;
          formattedHtml += `</pre></details>`; // Close the collapsible section
          formattedHtml += processedLine + '\n'; // Add the current line outside
        } else {
          formattedHtml += line + '\n'; // Add action line inside the <pre>
        }
      } else {
        formattedHtml += processedLine + '\n';
      }
    }
    // In case the file ends while inside an actions block
    if (inActionsBlock) formattedHtml += `</pre></details>`;

    // --- Tab 3: Query Summary (from system.query_log) ---
    let querySummaryContent;
    if (profileData.queryLog && !profileData.queryLog.error) {
      querySummaryContent = `<p><strong>Query Time:</strong> ${(profileData.queryLog.query_duration_ms / 1000).toFixed(4)}s</p>
                             <p><strong>Memory Usage:</strong> ${(profileData.queryLog.memory_usage / 1024 / 1024).toFixed(2)} MB</p>
                             <p><strong>Rows Read:</strong> ${profileData.queryLog.read_rows.toLocaleString()}</p>
                             <p><strong>Bytes Read:</strong> ${(profileData.queryLog.read_bytes / 1024 / 1024).toFixed(2)} MB</p>`;
    } else {
      querySummaryContent = `<p>No query log data found. Ensure query logging is enabled on your server.</p>`;
      if (profileData.queryLog && profileData.queryLog.error) {
        querySummaryContent += `<pre>${JSON.stringify(profileData.queryLog, null, 2)}</pre>`;
      }
    }

    // --- Tab 4: Pipeline Plan (from EXPLAIN PIPELINE) ---
    let pipelinePlanContent;
    if (profileData.pipelineGraph && profileData.pipelineGraph.trim().startsWith('digraph')) {
      const mermaidGraph = this.dotToMermaid(profileData.pipelineGraph);
      // We render the graph inside the post-render logic to attach event listeners.
      // For now, we just prepare the content.
      pipelinePlanContent = '';
    } else {
      pipelinePlanContent = `<p>Could not generate graph.</p><pre>${profileData.pipelineGraph || 'No data.'}</pre>`;
    }

    // --- Tab 6: Server Trace Log (from send_logs_level='trace') ---
    let serverTextLogContent;
    if (profileData.serverTextLog && profileData.serverTextLog.length > 0) {
      serverTextLogContent = '<table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 12px;">';
      serverTextLogContent += '<thead><tr style="text-align: left; border-bottom: 1px solid #777;"><th>Timestamp</th><th>Source</th><th>Thread</th><th>Level</th><th>Message</th></tr></thead>';
      serverTextLogContent += '<tbody>';

      // Helper function to get a color based on log level
      const getLevelColor = (level) => {
        switch (level) {
          case 'Error': return '#ff8080'; // Red
          case 'Warning': return '#ffc980'; // Orange
          case 'Information': return '#80ff80'; // Green
          case 'Debug': return '#80bfff'; // Blue
          case 'Trace': return '#b3b3b3'; // Gray
          default: return '#eee'; // Default text color
        }
      };

      // Helper function to generate a consistent color from a string (for the source)
      const stringToHslColor = (str, s = 75, l = 55) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = hash % 360;
        return `hsl(${h}, ${s}%, ${l}%)`;
      };

      for (const log of profileData.serverTextLog) {
        serverTextLogContent += `<tr style="border-bottom: 1px solid #444; padding: 3px 0;">
                                    <td style="white-space: nowrap;">${log.event_time_microseconds}</td>
                                    <td style="color: ${stringToHslColor(log.source)}; font-weight: bold;">${log.source}</td>
                                    <td style="white-space: nowrap;">${log.thread_name}(${log.thread_id})</td>
                                    <td style="color: ${getLevelColor(log.level)}; font-weight: bold;">${log.level}</td>
                                    <td style="white-space: pre-wrap;">${log.message}</td>
                                  </tr>`;
      }
      serverTextLogContent += '</tbody></table>';
    } else {
      serverTextLogContent = '<p>No server text logs were found. This may be disabled by the server configuration.</p>';
    }

    // --- Dynamically build the HTML for the profiler ---
    const tabsConfig = [
      { id: 'raw-plan', title: 'Raw Plan', content: `<pre>${profileData.actionsPlan || 'No data.'}</pre>`, header: 'Generated via: <code>EXPLAIN actions = 1, indexes = 1</code>'},
      { id: 'structured-plan', title: 'Structured Plan', content: `<pre>${formattedHtml}</pre>`, header: 'Generated via: <code>EXPLAIN actions = 1, indexes = 1</code>'},
      { id: 'pipeline-plan', title: 'Pipeline Plan', content: pipelinePlanContent, header: 'Generated via: <code>EXPLAIN PIPELINE graph = 1</code>' },
      { id: 'flamegraph', title: 'FlameGraph', content: '', header: 'Generated via: <code>SELECT ... FROM system.trace_log</code>' },
      { id: 'call-graph', title: 'Call Graph', content: '', header: 'Aggregated view of all function calls. Each function appears once, with its value representing total time spent.' },
      { id: 'trace-log', title: 'Trace Log', content: serverTextLogContent, header: `Generated via: <code>SELECT ... FROM system.text_log WHERE query_id = '...'</code>` },
      { id: 'query-summary', title: 'Query Summary', content: querySummaryContent, header: `Generated via: <code>SELECT * FROM system.query_log WHERE query_id = '...'</code>` },
    ];

    let tabsHtml = '<div class="profiler-tabs">';
    let contentHtml = '';

    tabsConfig.forEach((tab, index) => {
      const activeClass = index === 0 ? 'active' : '';
      tabsHtml += `<button class="profiler-tab ${activeClass}" data-tab="${tab.id}">${tab.title}</button>`;
      contentHtml += `<div id="profile-content-${tab.id}" class="profiler-tab-content ${activeClass}">
                        <h3>${tab.title}</h3>
                        <p>${tab.header}</p>`;
      // Add tree-view controls specifically for the structured plan tab
      if (tab.id === 'structured-plan') {
        contentHtml += `<div class="graph-controls" style="display: none;" data-for-tab="structured-plan">
                          <button id="ch-expand-all-button" title="Expand All Nodes">Expand All</button>
                          <button id="ch-collapse-all-button" title="Collapse All Nodes">Collapse All</button>
                       </div>`;
      }
      if (tab.id === 'pipeline-plan') {
        contentHtml += `<div class="graph-controls" style="display: none;" data-for-tab="pipeline-plan">
                          <button id="ch-zoom-in-button" title="Zoom In">+</button>
                          <button id="ch-zoom-out-button" title="Zoom Out">-</button>
                          <button id="ch-zoom-reset-button" title="Reset Zoom">1:1</button>
                       </div>`;
      }
      if (tab.id === 'flamegraph') {
        contentHtml += `<div class="graph-controls" style="display: none;" data-for-tab="flamegraph">
                          <label for="ch-flamegraph-group-by">Group By: </label>
                          <select id="ch-flamegraph-group-by">
                            <option value="none" selected>None</option>
                            <option value="method">Method Name</option>
                            <option value="class">By Class</option>
                            <option value="system">By System</option>
                          </select>
                          <span style="font-size: 0.8em; color: #ffc980;"> (Experimental)</span>
                       </div>`;
      }
      if (tab.id === 'call-graph') {
        contentHtml += `<div class="graph-controls" style="display: none;" data-for-tab="call-graph">
                          <button id="cg-zoom-in-button" title="Zoom In">+</button>
                          <button id="cg-zoom-out-button" title="Zoom Out">-</button>
                          <button id="cg-zoom-reset-button" title="Reset Zoom">1:1</button>
                          <button id="cg-switch-direction-button" title="Switch Graph Direction">Switch Direction</button>
                       </div>`;
      }
      contentHtml += `  <div class="tab-inner-content">${tab.content || ''}</div>
                      </div>`;
    });
    tabsHtml += '</div>';

    mainContainer.innerHTML = tabsHtml + contentHtml;

    // --- Post-render logic for dynamic content ---

    // Re-attach tab switching logic
    const profilerTabs = mainContainer.querySelectorAll('.profiler-tab');
    const profilerTabContents = mainContainer.querySelectorAll('.profiler-tab-content');
    profilerTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        profilerTabs.forEach(t => t.classList.remove('active'));
        profilerTabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const contentId = `#profile-content-${tab.dataset.tab}`;
        const activeContent = mainContainer.querySelector(contentId);
        activeContent.classList.add('active');

        // Show/hide the tree controls based on the active tab
        mainContainer.querySelectorAll('.graph-controls').forEach(controls => {
            const isForActiveTab = controls.dataset.forTab === tab.dataset.tab;
            controls.style.display = isForActiveTab ? 'inline-block' : 'none';
        });
      });
    });

    // On-demand rendering for the flame graph
    if (profileData.traceLog && profileData.traceLog.length > 0) {
      const flamegraphTab = mainContainer.querySelector('.profiler-tab[data-tab="flamegraph"]');
      const flamegraphContainer = mainContainer.querySelector('#profile-content-flamegraph .tab-inner-content');

      const renderFlamegraphOnFirstClick = () => {
        requestAnimationFrame(() => {
          console.log(`[Debug] Rendering ClickHouse flame graph in container with width: ${flamegraphContainer.clientWidth}px`);
          this.renderFlamegraph(profileData.traceLog, flamegraphContainer, 'none');
          // Set up the grouping dropdown listener
          const groupBySelect = mainContainer.querySelector('#ch-flamegraph-group-by');
          groupBySelect.addEventListener('change', () => {
            this.renderFlamegraph(profileData.traceLog, flamegraphContainer, groupBySelect.value);
          });
          flamegraphTab.removeEventListener('click', renderFlamegraphOnFirstClick);
        });
      };
      flamegraphTab.addEventListener('click', renderFlamegraphOnFirstClick);
    } else {
        const flamegraphContainer = mainContainer.querySelector('#profile-content-flamegraph');
        if (flamegraphContainer) {
            flamegraphContainer.querySelector('.tab-inner-content').innerHTML = '<p>No CPU trace data found. Ensure profiling is enabled on your server and that the query is long enough to be sampled.</p>';
        }
        const traceLogContainer = mainContainer.querySelector('#profile-content-trace-log');
        if (traceLogContainer) {
            traceLogContainer.querySelector('.tab-inner-content').innerHTML = '<p>No CPU trace data found.</p>';
        }
    }

    // Render the Call Graph from the flame graph data
    if (profileData.traceLog && profileData.traceLog.length > 0) {
        const callGraphContainer = mainContainer.querySelector('#profile-content-call-graph .tab-inner-content');
        this.renderCallGraph(profileData.traceLog, callGraphContainer, 'TD'); // Initial render is Top-Down
        this.setupCallGraphControls(profileData.traceLog, callGraphContainer);
    } else {
        const flamegraphContainer = mainContainer.querySelector('#profile-content-flamegraph');
        if (flamegraphContainer) {
            flamegraphContainer.querySelector('.tab-inner-content').innerHTML = '<p>No CPU trace data found. Ensure profiling is enabled on your server and that the query is long enough to be sampled.</p>';
        }
        const traceLogContainer = mainContainer.querySelector('#profile-content-trace-log');
        if (traceLogContainer) {
            traceLogContainer.querySelector('.tab-inner-content').innerHTML = '<p>No CPU trace data found.</p>';
        }
    }

    // Add event listeners for the newly created tree-view buttons
    const expandBtn = mainContainer.querySelector('#ch-expand-all-button');
    if (expandBtn) {
        expandBtn.addEventListener('click', () => mainContainer.querySelector('#profile-content-structured-plan').querySelectorAll('details').forEach(d => d.open = true));
        mainContainer.querySelector('#ch-collapse-all-button').addEventListener('click', () => mainContainer.querySelector('#profile-content-structured-plan').querySelectorAll('details').forEach(d => d.open = false));
    }

    // Render the Pipeline Plan graph and set up its controls
    if (profileData.pipelineGraph && profileData.pipelineGraph.trim().startsWith('digraph')) {
      const pipelineContainer = mainContainer.querySelector('#profile-content-pipeline-plan .tab-inner-content');
      this.renderPipelineGraph(profileData.pipelineGraph, pipelineContainer);
    }


    // Add event listeners for the newly created graph-view buttons
    const zoomInBtn = mainContainer.querySelector('#ch-zoom-in-button');
    if (zoomInBtn) {
        let currentGraphZoom = 1.0;
        const zoomStep = 0.4; // Increased for more aggressive zoom
        const pipelineContainer = mainContainer.querySelector('#profile-content-pipeline-plan .tab-inner-content');
        const updateGraphZoom = () => {
            const svg = pipelineContainer.querySelector('svg');
            if (svg) {
                svg.style.transform = `scale(${currentGraphZoom})`;
                svg.style.transformOrigin = 'top left';
            }
        };
        zoomInBtn.addEventListener('click', () => {
            currentGraphZoom += zoomStep;
            updateGraphZoom();
        });
        mainContainer.querySelector('#ch-zoom-out-button').addEventListener('click', () => {
            currentGraphZoom = Math.max(0.2, currentGraphZoom - zoomStep);
            updateGraphZoom();
        });
        mainContainer.querySelector('#ch-zoom-reset-button').addEventListener('click', () => {
            currentGraphZoom = 1.0;
            updateGraphZoom();
        });
    }

    // Add event listeners for the newly created call-graph-view buttons
    const cgZoomInBtn = mainContainer.querySelector('#cg-zoom-in-button');
    if (cgZoomInBtn) {
        let currentGraphZoom = 1.0;
        const zoomStep = 0.6; // Make zoom even more aggressive
        const callGraphContainer = mainContainer.querySelector('#profile-content-call-graph .tab-inner-content');
        const updateGraphZoom = () => {
            const svg = callGraphContainer.querySelector('svg');
            if (svg) {
                svg.style.transform = `scale(${currentGraphZoom})`;
                svg.style.transformOrigin = 'top left';
            }
        };
        cgZoomInBtn.addEventListener('click', () => {
            currentGraphZoom += zoomStep;
            updateGraphZoom();
        });
        mainContainer.querySelector('#cg-zoom-out-button').addEventListener('click', () => {
            currentGraphZoom = Math.max(0.2, currentGraphZoom - zoomStep);
            updateGraphZoom();
        });
        mainContainer.querySelector('#cg-zoom-reset-button').addEventListener('click', () => {
            currentGraphZoom = 1.0;
            updateGraphZoom();
        });
    }
  }

  /**
   * Renders the Pipeline graph and sets up its interactive features.
   * @param {string} dotString The raw DOT graph string from EXPLAIN.
   * @param {HTMLElement} container The container to render into.
   * @param {Set<string>} [nodesToRender=null] An optional set of node IDs to filter the graph.
   */
  async renderPipelineGraph(dotString, container, nodesToRender = null) {
    const mermaidGraph = this.dotToMermaid(dotString, nodesToRender);
    const { svg } = await mermaid.render('ch-mermaid-graph', mermaidGraph);
    container.innerHTML = svg;
    this.setupPipelineGraphZoom(dotString, container);
  }

  /**
   * Sets up zoom and selection controls for the Pipeline graph.
   * @param {string} dotString The original DOT string for re-rendering.
   * @param {HTMLElement} container The container holding the SVG graph.
   */
  setupPipelineGraphZoom(dotString, container) {
    const svg = container.querySelector('svg');
    if (!svg) return;

    // Force enable mouse events on the SVG
    svg.style.pointerEvents = 'auto';

    // --- Box Selection Logic ---
    let selectionBox = document.getElementById('graph-selection-box');
    if (!selectionBox) {
      selectionBox = document.createElement('div');
      selectionBox.id = 'graph-selection-box';
      selectionBox.style.position = 'absolute';
      selectionBox.style.border = '1px dashed #ffc980';
      selectionBox.style.backgroundColor = 'rgba(255, 201, 128, 0.2)';
      selectionBox.style.pointerEvents = 'none';
      selectionBox.style.display = 'none';
      document.body.appendChild(selectionBox);
    }

    let isDragging = false;
    let startX, startY;

    // Attach the listener to the SVG itself, as it's the element that receives the initial events.
    // The container div might not receive them if the SVG covers it completely.
    svg.addEventListener('mousedown', (e) => {
      if (e.target.closest('.node')) return; // Don't start drag if clicking on a node itself
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
      selectionBox.style.display = 'block';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const currentX = e.clientX;
      const currentY = e.clientY;
      const width = currentX - startX;
      const height = currentY - startY;

      selectionBox.style.width = `${Math.abs(width)}px`;
      selectionBox.style.height = `${Math.abs(height)}px`;
      selectionBox.style.left = `${width > 0 ? startX : currentX}px`;
      selectionBox.style.top = `${height > 0 ? startY : currentY}px`;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      selectionBox.style.display = 'none';

      const selectionRect = selectionBox.getBoundingClientRect();
      if (selectionRect.width < 10 || selectionRect.height < 10) return;

      const selectedNodeIds = new Set();
      svg.querySelectorAll('.node').forEach(nodeEl => {
        const nodeRect = nodeEl.getBoundingClientRect();
        if (selectionRect.left < nodeRect.right && selectionRect.right > nodeRect.left &&
            selectionRect.top < nodeRect.bottom && selectionRect.bottom > nodeRect.top) {
          selectedNodeIds.add(nodeEl.id);
        }
      });

      if (selectedNodeIds.size > 0) {
        this.renderPipelineGraph(dotString, container, selectedNodeIds);
      }
    });

    // Double-click to reset zoom
    svg.addEventListener('dblclick', () => {
      this.renderPipelineGraph(dotString, container, null);
    });
  }

  /**
   * Renders a FlameGraph from the ClickHouse trace log.
   * @param {Array<object>} traceLog The data from system.trace_log.
   * @param {HTMLElement} container The DOM element to render the chart into.
   * @param {string} groupBy The grouping strategy ('none', 'method', 'class', 'system').
   */
  renderFlamegraph(traceLog, container, groupBy = 'none') {
    if (!traceLog || traceLog.length === 0) {
      container.innerHTML = '<p>No CPU trace data to render.</p>';
      return;
    }

    container.innerHTML = '';

    // --- Step 1: Build the full, ungrouped flame graph data structure ---
    const root = { name: "root", value: 0, children: [], original: { fullName: "root" } };
    let totalValue = 0;
    traceLog.forEach(row => {
      totalValue += row.value;
      let currentNode = root;
      const stack = row.trace.reverse(); // Build stack from bottom up
      stack.forEach(address => {
        const functionName = address || 'unknown';
        let childNode = currentNode.children.find(c => c.original.fullName === functionName);
        if (!childNode) {
          childNode = {
            name: this.simplifyFunctionName(functionName),
            value: 0, // This is self-time, exclusive of children
            children: [],
            original: { fullName: functionName }
          };
          currentNode.children.push(childNode);
        }
        currentNode = childNode;
      });
      currentNode.value += row.value; // Add sample value to the leaf's self-time
    });

    // After building the tree with self-times, propagate the values up to the parents
    // to get the inclusive time for each node.
    function sumValues(node) {
      const childrenValue = node.children.reduce((sum, child) => sum + sumValues(child), 0);
      // The node's total value is its self-time plus the total time of all its children.
      node.value += childrenValue;
      return node.value; // Return the total inclusive value
    }
    sumValues(root);

    // --- Step 2: If grouping is enabled, collapse the full graph ---
    if (groupBy !== 'none') {
      const getGroupName = (name) => {
        if (!name) return 'unknown';
        if (groupBy === 'method') return this.simplifyFunctionName(name);
        if (groupBy === 'class') return this.getClassName(name);
        if (groupBy === 'system') return this.getSystemCategory(name);
        return name;
      };

      // This recursive function collapses nodes from the bottom up.
      const collapseNode = (node) => {
        if (!node.children || node.children.length === 0) return;

        node.children.forEach(collapseNode); // Recurse to collapse children first (bottom-up)

        const nodeGroupName = getGroupName(node.original.fullName);
        let hasChanged = true;
        // Use a while loop to repeatedly collapse until no more changes are made in one pass.
        // This correctly handles deeply nested stacks of the same group.
        while (hasChanged) {
          hasChanged = false;
          const newChildren = [];
          for (const child of node.children) {
            const childGroupName = getGroupName(child.original.fullName);
            if (childGroupName === nodeGroupName) {
              newChildren.push(...child.children); // Absorb grandchildren
              hasChanged = true;
            } else {
              newChildren.push(child);
            }
          }
          node.children = newChildren;
        }
        node.name = nodeGroupName; // Update the display name to the group name
      };
      collapseNode(root);
    }

    console.log(`[Debug] Rendering flamegraph with grouping: ${groupBy}.`);

    // Create a color scale from "cold" (green) to "hot" (red) based on sample count.
    // We use a sqrt scale to better differentiate the smaller values.
    const colorScale = d3.scaleSequential(d3.interpolateRgb("hsl(120, 50%, 35%)", "hsl(0, 80%, 45%)")).domain([0, Math.sqrt(root.value)]);

    // Define a function to create rich HTML tooltips
    const labelHandler = (d) => {
      const percent = totalValue > 0 ? ((d.data.value / totalValue) * 100).toFixed(2) : 0;
      // Assuming a 1ms sample interval (1,000,000 ns), samples are roughly equivalent to milliseconds.
      const estimatedMs = d.data.value;
      let nameForTooltip = d.data.original.fullName || d.data.name;

      // For grouped views, provide a more descriptive tooltip.
      if (groupBy === 'class' || groupBy === 'system') {
        nameForTooltip = `All methods in: <strong>${d.data.name}</strong>`;
      }

      return `${nameForTooltip}<br>Time (est.): ${estimatedMs.toLocaleString()} ms (${percent}%)<br>Samples: ${d.data.value.toLocaleString()}`;
    };

    const flamegraphChart = d3_flame_graph.flamegraph()
      .width(container.clientWidth)
      .cellHeight(18)
      .setColorMapper(d => colorScale(Math.sqrt(d.data.value))) // Color by sample count
      .label(labelHandler); // Use our custom tooltip function

    d3.select(container).datum(root).call(flamegraphChart);

    return root; // Return the root for testing purposes
  }

  /**
   * Extracts the C++ class/namespace from a full function name.
   * @param {string} name The full function name.
   * @returns {string} The class or namespace.
   */
  getClassName(name) {
    if (!name) return 'unknown';

    // Step 1: Isolate the function signature from its arguments by finding the first '('.
    const openParenIndex = name.indexOf('(');
    const signature = (openParenIndex !== -1) ? name.substring(0, openParenIndex) : name;

    // Step 2: On the signature without arguments, find the last '::'.
    const lastSeparatorIndex = signature.lastIndexOf('::');
    if (lastSeparatorIndex > 0) {
      // Step 3: Return the substring before the last '::' which is the full class/namespace.
      return signature.substring(0, lastSeparatorIndex);
    }
    return signature; // Not a class method (or no namespace), return the signature.
  }

  /**
   * Assigns a high-level system category to a function name.
   * @param {string} name The full function name.
   * @returns {string} The system category.
   */
  getSystemCategory(name) {
    if (!name) return 'Unknown';
    if (name.includes('Parser')) return 'Parsing';
    if (name.includes('Interpreter') || name.includes('Expression')) return 'Execution';
    if (name.includes('Aggregate') || name.includes('Aggregator')) return 'Aggregation';
    if (name.includes('MergeTree') || name.includes('Storage')) return 'Storage & I/O';
    if (name.includes('ReadBuffer') || name.includes('WriteBuffer')) return 'Storage & I/O';
    if (name.includes('Join') || name.includes('HashTable')) return 'Joins';
    if (name.includes('Function')) return 'Functions';
    if (name.includes('Block')) return 'Data Blocks';
    if (name.includes('JIT')) return 'JIT Compilation';
    if (name.includes('Planner') || name.includes('Analyzer')) return 'Query Planning';
    if (name.includes('std::')) return 'Standard Library';
    if (name.includes('DB::')) return 'Database Core';
    if (name.startsWith('n-') || name.startsWith('k-')) return 'Kernel/System'; // Common prefixes for kernel symbols

    return 'Other';
  }

  /**
   * Simplifies a C++ function name by removing template arguments for better display.
   * @param {string} name The full function name.
   * @returns {string} The simplified function name.
   */
  simplifyFunctionName(name) {
    if (!name) return 'unknown';
    // This function is designed to aggressively shorten complex C++ function names.
    let simplified = name;

    // 1. Remove all template arguments <...>
    simplified = simplified.replace(/<[^<>]*>/g, '()');

    // 2. Remove lambda definitions and operator() calls
    simplified = simplified.replace(/::'lambda'.*/, '');
    simplified = simplified.replace(/::operator\(\).*/, '');

    // 3. Truncate if still too long
    if (simplified.length > 60) {
        simplified = simplified.substring(0, 57) + '...';
    }

    return simplified.replace(/std::__1::/g, 'std::');
  }

  /**
   * Renders a Mermaid.js call graph from the ClickHouse trace log data.
   * @param {Array<object>} traceLog The data from system.trace_log.
   * @param {HTMLElement} container The DOM element to render the chart into.
   */
  async renderCallGraph(traceLog, container, direction = 'TD') {
    if (!traceLog || traceLog.length === 0) {
      container.innerHTML = '<p>No data to render call graph.</p>';
      return;
    }

    console.log(`[Debug] Building aggregated call graph from ${traceLog.length} unique stacks.`);
    container.innerHTML = ''; // Clear container before rendering
    // First, build the same hierarchical data structure as the flame graph.
    const root = { name: "Total CPU Time", value: 0, children: [] };
    let totalValue = 0;
    traceLog.forEach(row => {
      totalValue += row.value;
      let currentNode = root;
      const stack = row.trace.reverse();
      stack.forEach(fullName => {
        const functionName = this.simplifyFunctionName(fullName);
        let childNode = currentNode.children.find(c => c.name === functionName);
        if (!childNode) {
          childNode = { name: functionName, value: 0, children: [], fullName: fullName };
          currentNode.children.push(childNode);
        }
        childNode.value += row.value;
        currentNode = childNode;
      });
    });
    root.value = totalValue;

    // Aggregate the hierarchical data into a flat list of nodes and edges for the graph.
    const aggregatedNodes = new Map();
    const aggregatedEdges = new Map();

    function processNode(node, parentName = null) {
        const simplifiedName = node.name;

        // Aggregate node value
        if (!aggregatedNodes.has(simplifiedName)) {
            aggregatedNodes.set(simplifiedName, { value: 0, fullName: node.fullName });
        }
        aggregatedNodes.get(simplifiedName).value += node.value;

        // Aggregate edge
        if (parentName) {
            const edgeKey = `${parentName}|${simplifiedName}`;
            aggregatedEdges.set(edgeKey, (aggregatedEdges.get(edgeKey) || 0) + node.value);
        }

        (node.children || []).forEach(child => processNode(child, simplifiedName));
    }
    processNode(root);

    // --- Convert aggregated data to Mermaid syntax ---
    let mermaidSyntax = `graph ${direction};\n`;
    mermaidSyntax += 'classDef timeHot fill:#5c2828,stroke:#ff8080,stroke-width:2px,color:#fff;\n';
    mermaidSyntax += 'classDef timeWarm fill:#5a4e3a,stroke:#ffc980,stroke-width:2px,color:#fff;\n';
    mermaidSyntax += 'classDef timeGood fill:#2a4a3a,stroke:#80ff80,stroke-width:2px,color:#fff;\n';

    // Create a unique ID for each function name
    const nameToId = new Map();
    let nodeIdCounter = 0;
    for (const name of aggregatedNodes.keys()) {
        nameToId.set(name, `n${nodeIdCounter++}`);
    }

    // Generate node definitions
    for (const [name, data] of aggregatedNodes.entries()) {
      const nodeId = nameToId.get(name);
      const percent = totalValue > 0 ? ((data.value / totalValue) * 100) : 0;
      let nodeText = `<div title='${data.fullName || name}'><strong>${name}</strong><br/>${data.value.toLocaleString()} samples<br/>${percent.toFixed(1)}%</div>`;
      nodeText = nodeText.replace(/"/g, '#quot;');
      mermaidSyntax += `    ${nodeId}["${nodeText}"];\n`;

      if (percent >= 50) {
        mermaidSyntax += `    class ${nodeId} timeHot;\n`;
      } else if (percent >= 5) {
        mermaidSyntax += `    class ${nodeId} timeWarm;\n`;
      } else {
        mermaidSyntax += `    class ${nodeId} timeGood;\n`;
      }
    }

    // Generate edge definitions
    for (const [edgeKey, value] of aggregatedEdges.entries()) {
        const [parentName, childName] = edgeKey.split('|');
        const parentId = nameToId.get(parentName);
        const childId = nameToId.get(childName);
        if (parentId && childId) {
            mermaidSyntax += `    ${parentId} --> ${childId};\n`;
        }
    }

    console.log(`[Debug] Mermaid diagram size: ${mermaidSyntax.length} characters`);

    const { svg } = await mermaid.render('ch-call-graph', mermaidSyntax);
    container.innerHTML = svg;

    // --- Add Tooltip Logic for the Call Graph ---
    const tooltipEl = document.createElement('div');
    tooltipEl.id = 'ch-call-graph-tooltip';
    tooltipEl.style.position = 'fixed';
    tooltipEl.style.display = 'none';
    tooltipEl.style.background = '#2a2a2a';
    tooltipEl.style.padding = '10px';
    tooltipEl.style.border = '1px solid #777';
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.zIndex = '1003'; // Ensure it's on top
    container.appendChild(tooltipEl);

    container.querySelectorAll('.node').forEach(nodeEl => {
      nodeEl.addEventListener('mousemove', (e) => {
        const title = nodeEl.querySelector('div')?.title;
        if (title) {
          tooltipEl.innerHTML = `<strong>Full Name:</strong><br>${title}`;
          tooltipEl.style.display = 'block';
          tooltipEl.style.left = `${e.clientX + 15}px`;
          tooltipEl.style.top = `${e.clientY + 15}px`;
        }
      });
      nodeEl.addEventListener('mouseout', () => {
        tooltipEl.style.display = 'none';
      });
    });
  }

  /**
   * Sets up the event listeners for the Call Graph controls (zoom, direction).
   * @param {Array<object>} traceLog The raw trace log data needed for re-rendering.
   * @param {HTMLElement} container The container for the call graph.
   */
  setupCallGraphControls(traceLog, container) {
    const button = document.getElementById('cg-switch-direction-button');
    if (!button) return;

    let currentLayout = 'TD'; // Top-Down

    const updateButtonText = () => {
      button.textContent = (currentLayout === 'TD') ? 'Switch to Bottom Up' : 'Switch to Top Down';
    };

    // Remove any old listener before adding a new one to prevent conflicts on re-profiling.
    if (button.handler) {
      button.removeEventListener('click', button.handler);
    }

    button.handler = () => {
      currentLayout = (currentLayout === 'TD') ? 'BT' : 'TD';
      this.renderCallGraph(traceLog, container, currentLayout);
      updateButtonText();
    };

    updateButtonText();
    button.addEventListener('click', button.handler);
  }

  /**
   * Parses a DOT graph string and converts it to Mermaid syntax.
   * @param {string} dotString The raw DOT graph string.
   * @param {Set<string>} [nodesToRender=null] An optional set of node IDs to filter the graph.
   * @returns {string} A Mermaid graph definition string.
   */
  dotToMermaid(dotString, nodesToRender = null) {
    let mermaidString = 'graph LR;\n'; // LR = Left to Right
    const nodeLabels = new Map();
    const edges = [];

    const nodeRegex = /(\w+)\s+\[label="([^"]+)"\]/g;
    let match;
    while ((match = nodeRegex.exec(dotString)) !== null) {
      nodeLabels.set(match[1], match[2].replace(/"/g, '&quot;'));
    }
    
    const edgeRegex = /^\s*(\w+)\s*->\s*(\w+)/gm;
    while ((match = edgeRegex.exec(dotString)) !== null) {
      edges.push({ from: match[1], to: match[2] });
    }

    let finalNodes = nodesToRender ? new Set(nodesToRender) : new Set(nodeLabels.keys());

    // If filtering, add direct neighbors to make the graph more useful
    if (nodesToRender) {
      edges.forEach(edge => {
        if (nodesToRender.has(edge.from)) finalNodes.add(edge.to);
        if (nodesToRender.has(edge.to)) finalNodes.add(edge.from);
      });
    }

    edges.forEach(({ from: fromNode, to: toNode }) => {
      if (finalNodes.has(fromNode) && finalNodes.has(toNode)) {
      const fromLabel = nodeLabels.get(fromNode) || fromNode;
      const toLabel = nodeLabels.get(toNode) || toNode;
      mermaidString += `    ${fromNode}["${fromLabel}"] --> ${toNode}["${toLabel}"];\n`;
      }
    });

    // If no edges were added (e.g., single selected node), define the node itself.
    if (mermaidString.split('\n').length <= 2 && finalNodes.size > 0) {
        finalNodes.forEach(nodeId => {
            const label = nodeLabels.get(nodeId) || nodeId;
            mermaidString += `    ${nodeId}["${label}"];\n`;
        });
    }
    return mermaidString;
  }
}