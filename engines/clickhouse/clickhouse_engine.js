import { createClient } from '@clickhouse/client-web';
import { Table, Float32, makeTable } from '@apache/arrow';
import mermaid from 'mermaid';
import * as d3 from 'd3';
// Use a namespace import to robustly handle this non-standard module.
import * as d3_flame_graph from 'd3-flame-graph';
import { SHADERS } from './clickhouse_shaders.js';

/**
 * Implements the Engine interface for ClickHouse.
 */
class ClickHouseEngine {
  constructor() {
    this.client = null;
  }

  /**
   * Initializes the ClickHouse client and pings the server to ensure connectivity.
   * @param {function(string): void} statusCallback A function to report progress updates.
   * @returns {Promise<void>}
   */
  async initialize(statusCallback) {
    statusCallback('Initializing ClickHouse engine...');

    // Default connection details. These can be overridden by URL parameters
    // e.g., http://localhost:8000/?ch_host=...&ch_port=...
    const storedSettings = JSON.parse(localStorage.getItem('pixelql.clickhouse-settings')) || {};
    const urlParams = new URLSearchParams(window.location.search);

    // Priority: 1. Stored Settings, 2. URL Params, 3. Defaults
    const url = storedSettings.url || urlParams.get('ch_host') || 'http://localhost:8123';
    const username = storedSettings.username || urlParams.get('ch_user') || 'default';
    const password = storedSettings.password || urlParams.get('ch_password') || '';

    this.client = createClient({
      url: url, // Deprecated 'host' is replaced by 'url'
      username: username,
      password: password,
    });

    statusCallback(`Pinging ClickHouse server at ${url}...`);
    try {
      const response = await this.client.ping();
      if (!response.success) {
        throw new Error('Ping failed.');
      }
      statusCallback('ClickHouse engine ready.');
    } catch (e) {
      statusCallback(`ClickHouse connection failed: ${e.message}. Is it running at ${url}?`);
      // Instead of throwing, we return a specific error to be handled by the caller.
      throw new Error(`Could not connect to ClickHouse at ${url}. Please check the URL and ensure the server is running.`);
    }
  }

  /**
   * "Prepares" a query by returning an object that can execute it.
   * For the HTTP client, this is a lightweight operation.
   * @param {string} sql The SQL query string.
   * @returns {Promise<{query: function(...any): Promise<Table>}>} An object with a `query` method.
   */
  async prepare(sql) {
    // For the ClickHouse HTTP client, there's no "prepare" step.
    // We return an object that holds the SQL and can execute it.
    return {
      query: async (...args) => this.executeQuery(sql, args),
    };
  }

  /**
   * Executes a "prepared" query with the given parameters.
   * @param {string} sql The SQL query string from the prepare step.
   * @param {Array<any>} params The parameters for the query.
   * @returns {Promise<Table>} An Apache Arrow Table containing the result.
   */
  async executeQuery(sql, params) {
    // New Strategy: Manually substitute parameters to avoid client library issues.
    let finalSql = sql
      .replace('{width:UInt32}', params[0])
      .replace('{height:UInt32}', params[1])
      .replace('{iTime:Float64}', params[2])
      .replace('{mx:Float64}', params[3])
      .replace('{my:Float64}', params[4]);

    const resultSet = await this.client.query({
      query: finalSql,
      format: 'JSONEachRow'
    });
    const rows = await resultSet.json();

    // Convert the JSON result into an Arrow Table, which the renderer expects.
    const r = new Float32Array(rows.length);
    const g = new Float32Array(rows.length);
    const b = new Float32Array(rows.length);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      r[i] = row.r;
      g[i] = row.g;
      b[i] = row.b;
    }

    return makeTable({
      r: r,
      g: g,
      b: b,
    });
  }

  /**
   * Runs the query with profiling enabled and collects various performance metrics.
   * @param {string} sql The raw SQL of the shader to profile.
   * @param {Array<any>} params The parameters for the query.
   * @returns {Promise<object>} A data object containing plans, logs, and traces.
   */
  async profile(sql, params) {
    console.log('[engine.profile] Starting advanced ClickHouse profiling...');
    const cleanedSql = sql.replace(/{[^}]+}/g, '1');
    const queryId = `pixelql-${Date.now()}`;
    let profileData = {};

    // 1. Get EXPLAIN PIPELINE graph
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

    console.log(`[Debug] 1. Running main query with query_id: ${queryId}`);
    console.log(finalSql);

    try {
      // Execute the query. We rely on the server-side user profile to have the
      // correct profiling settings enabled, but we also explicitly enable server-side trace logging.
      const mainQueryResultSet = await this.client.query({
        query: finalSql,
        query_id: queryId,
        format: 'JSONEachRow',
        clickhouse_settings: {
          send_logs_level: 'trace', // Enable server-side trace logging to be sent to the client
        },
      });
      profileData.serverTraceLog = mainQueryResultSet.logs;
      console.log(`[Debug] Captured ${profileData.serverTraceLog ? profileData.serverTraceLog.length : 0} server trace log entries streamed from the main query execution.`);
    } catch (e) {
      console.warn('Shader query failed during profiling, but attempting to fetch logs anyway.', e);
    }

    // Force ClickHouse to flush its log buffers to the system tables.
    // This is more reliable than waiting with a timeout and ensures the logs are available.
    try {
      await this.client.command({ query: 'SYSTEM FLUSH LOGS' });
      console.log('[engine.tracing] Flushed system logs successfully.');
    } catch (e) {
      console.warn('Failed to execute SYSTEM FLUSH LOGS, falling back to a timeout. This might happen due to user permissions.', e);
      await new Promise(resolve => setTimeout(resolve, 500)); // Use a slightly longer fallback timeout
    }

    // 4. Poll for both query_log and trace_log entries in a single loop.
    // This is more robust against race conditions where one log flushes before the other.
    const maxRetries = 8;
    const retryDelay = 250; // ms

    try {
      for (let i = 0; i < maxRetries; i++) {
        // Attempt to fetch query_log if we don't have it yet
        if (!profileData.queryLog) {
          const queryLogQuery = `SELECT * FROM system.query_log WHERE query_id = '${queryId}' AND type = 'QueryFinish' LIMIT 1`;
          const queryLogResultSet = await this.client.query({ query: queryLogQuery, format: 'JSONEachRow' });
          const queryLogData = await queryLogResultSet.json();
          if (queryLogData.length > 0) {
            profileData.queryLog = queryLogData[0];
            console.log(`[engine.tracing] Found query_log entry after ${i + 1} attempt(s).`);
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
          const traceResultSet = await this.client.query({ query: traceQuery.trim(), format: 'JSONEachRow', clickhouse_settings: { allow_introspection_functions: 1 } });
          const resolvedTraces = await traceResultSet.json();
          if (resolvedTraces.length > 0) {
            profileData.traceLog = resolvedTraces.map(row => ({ trace: row.stack.split(';'), value: row.value }));
            console.log(`[engine.tracing] Found trace_log entries after ${i + 1} attempt(s).`);
          }
        }

        // If we have all the data we need, we can stop waiting
        // We no longer poll for query_thread_log.
        const hasAllLogs = profileData.queryLog && profileData.traceLog && profileData.traceLog.length > 0;
        if (hasAllLogs) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    } catch (e) {
      console.error('Failed during log polling:', e);
    }

    // Add final status logging after polling is complete.
    console.log(`[Debug] Polling finished. Query Log found: ${!!profileData.queryLog}`);
    console.log(`[Debug] Polling finished. Server Trace Log entries found: ${profileData.serverTraceLog ? profileData.serverTraceLog.length : 0}`);
    console.log(`[Debug] Polling finished. Trace Log entries found: ${profileData.traceLog ? profileData.traceLog.length : 0}`);

    console.log('[engine.profile] Profiling data collection complete.');
    return profileData;
  }

  /**
   * Renders the multi-faceted profile data into the modal.
   * @param {object} profileData The data object from the profile() method.
   * @param {object} containers The DOM elements to render into.
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
    let serverTraceLogContent;
    if (profileData.serverTraceLog && profileData.serverTraceLog.length > 0) {
      serverTraceLogContent = '<table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 12px;">';
      serverTraceLogContent += '<thead><tr style="text-align: left; border-bottom: 1px solid #777;"><th>Time</th><th>Source</th><th>Level</th><th>Message</th></tr></thead>';
      serverTraceLogContent += '<tbody>';
      for (const log of profileData.serverTraceLog) {
        serverTraceLogContent += `<tr style="border-bottom: 1px solid #444; padding: 3px 0;">
                                    <td style="white-space: nowrap;">${new Date(log.time).toISOString()}</td>
                                    <td>${log.source}</td>
                                    <td>${log.level}</td>
                                    <td style="white-space: pre-wrap;">${log.message}</td>
                                  </tr>`;
      }
      serverTraceLogContent += '</tbody></table>';
    } else {
      serverTraceLogContent = '<p>No server trace logs were sent. This may be disabled by the server configuration.</p>';
    }

    // --- Dynamically build the HTML for the profiler ---
    const tabsConfig = [
      { id: 'raw-plan', title: 'Raw Plan', content: `<pre>${profileData.actionsPlan || 'No data.'}</pre>`, header: 'Generated via: <code>EXPLAIN actions = 1, indexes = 1</code>'},
      { id: 'structured-plan', title: 'Structured Plan', content: `<pre>${formattedHtml}</pre>`, header: 'Generated via: <code>EXPLAIN actions = 1, indexes = 1</code>'},
      { id: 'pipeline-plan', title: 'Pipeline Plan', content: pipelinePlanContent, header: 'Generated via: <code>EXPLAIN PIPELINE graph = 1</code>' },
      { id: 'flamegraph', title: 'FlameGraph', content: '', header: 'Generated via: <code>SELECT ... FROM system.trace_log</code>' },
      { id: 'call-graph', title: 'Call Graph', content: '', header: 'Aggregated view of all function calls. Each function appears once, with its value representing total time spent.' },
      { id: 'trace-log', title: 'Trace Log', content: serverTraceLogContent, header: "Server logs streamed to the client by setting <code>send_logs_level = 'trace'</code>" },
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
          flamegraphContainer.innerHTML = ''; // Clear before rendering
          this.renderFlamegraph(profileData.traceLog, flamegraphContainer);
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
   */
  renderFlamegraph(traceLog, container) {
    if (!traceLog || traceLog.length === 0) {
      container.innerHTML = '<p>No CPU trace data found.</p>';
      return;
    }

    const root = { name: "root", value: 0, children: [], original: { value: 0 } };
    let totalValue = 0;
    traceLog.forEach(row => {
      totalValue += row.value;
      let currentNode = root;
      const stack = row.trace.reverse(); // Build stack from bottom up
      stack.forEach(address => {
        const functionName = address || 'unknown';
        let childNode = currentNode.children.find(c => c.name === functionName);
        if (!childNode) {
          childNode = { name: functionName, value: 0, children: [], original: { value: 0 } };
          currentNode.children.push(childNode);
        }
        // The value of a parent is the sum of its children. We add the sample
        // value to every node in the stack to correctly aggregate total time.
        childNode.value += row.value;
        currentNode = childNode;
      });
    });
    root.value = totalValue;
    root.original.value = totalValue;

    console.log('[Debug] Flamegraph data structure:', JSON.stringify(root, null, 2));

    // container.innerHTML = ''; // Container is now managed by the caller
    // Create a color scale from "cold" (green) to "hot" (red) based on sample count.
    // We use a sqrt scale to better differentiate the smaller values.
    const colorScale = d3.scaleSequential(d3.interpolateRgb("hsl(120, 50%, 35%)", "hsl(0, 80%, 45%)")).domain([0, Math.sqrt(root.value)]);

    // Define a function to create rich HTML tooltips
    const labelHandler = (d) => {
      const percent = totalValue > 0 ? ((d.data.value / totalValue) * 100).toFixed(2) : 0;
      // Assuming a 1ms sample interval (1,000,000 ns), samples are roughly equivalent to milliseconds.
      const estimatedMs = d.data.value;
      return `<strong>${d.data.name}</strong><br>
              Time (est.): ${estimatedMs.toLocaleString()} ms (${percent}%)<br>Samples: ${d.data.value.toLocaleString()}`;
    };

    const flamegraphChart = d3_flame_graph.flamegraph()
      .width(container.clientWidth)
      .cellHeight(18)
      .setColorMapper(d => colorScale(Math.sqrt(d.data.value))) // Color by sample count
      .label(labelHandler); // Use our custom tooltip function

    d3.select(container).datum(root).call(flamegraphChart);
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

    // --- NEW: Aggregation Logic ---
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

    this.setupSelectionZoom(container, traceLog, direction);
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
   * Sets up the drag-to-select zoom functionality for a Mermaid graph.
   * @param {HTMLElement} container The container holding the SVG graph.
   * @param {Array<object>} traceLog The raw trace log data for re-rendering.
   * @param {string} direction The current graph direction ('TD' or 'BT').
   */
  setupSelectionZoom(container, traceLog, direction) {
    const svg = container.querySelector('svg');
    if (!svg) return;

    // Force enable mouse events on the SVG, as Mermaid may disable them by default.
    svg.style.pointerEvents = 'auto';

    // Create a selection box element if it doesn't exist
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

    container.addEventListener('mousedown', (e) => {
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
      if (selectionRect.width < 10 || selectionRect.height < 10) return; // Ignore tiny selections

      const selectedNodeNames = new Set();
      svg.querySelectorAll('.node').forEach(nodeEl => {
        const nodeRect = nodeEl.getBoundingClientRect();
        // Check for intersection
        if (
          selectionRect.left < nodeRect.right &&
          selectionRect.right > nodeRect.left &&
          selectionRect.top < nodeRect.bottom &&
          selectionRect.bottom > nodeRect.top
        ) {
          // The node's name is stored in the title of the inner div
          const title = nodeEl.querySelector('div[title]')?.title;
          if (title) selectedNodeNames.add(title);
        }
      });

      if (selectedNodeNames.size > 0) {
        const filteredTraceLog = traceLog.filter(row => row.trace.some(funcName => selectedNodeNames.has(funcName)));
        this.renderCallGraph(filteredTraceLog, container, direction);
      }
    });

    // Add a double-click listener to reset the zoom
    svg.addEventListener('dblclick', () => {
      this.renderCallGraph(traceLog, container, direction);
    });
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

  /**
   * Returns the list of example shaders available for this engine.
   * @returns {Array<{name: string, sql: string}>}
   */
  getShaders() {
    return SHADERS;
  }
}

export const engine = new ClickHouseEngine();