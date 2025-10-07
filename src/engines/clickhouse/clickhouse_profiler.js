import mermaid from 'mermaid';
import * as d3 from 'd3';
// Use a namespace import to robustly handle this non-standard module.
import * as d3_flame_graph from 'd3-flame-graph';
import { makeTable } from '@apache/arrow';
import { ClickHouseProfilerFlamegraph } from './profiler/flamegraph.js';
import { ClickHouseProfilerCallGraph } from './profiler/callgraph.js';
import { ClickHouseProfilerPipelineGraph } from './profiler/pipeline.js';
import { ClickHouseProfilerOpenTelemetry } from './profiler/opentelemetry.js';
import { ClickHouseProfilerQuerySummary } from './profiler/querysummary.js';
import { ClickHouseProfilerEvents } from './profiler/events.js';
import { ClickHouseProfilerTraceLogs } from './profiler/tracelogs.js';
import { ClickHouseProfilerExplainPlan } from './profiler/explainplan.js';

export class ClickHouseProfiler {
  constructor(engine) {
    this.engine = engine;
    this.client = engine.client; // Keep a direct reference to the client for commands
    this.flamegraph = new ClickHouseProfilerFlamegraph();
    this.callgraph = new ClickHouseProfilerCallGraph(this.flamegraph);
    this.pipeline = new ClickHouseProfilerPipelineGraph();
    this.opentelemetry = new ClickHouseProfilerOpenTelemetry();
    this.querysummary = new ClickHouseProfilerQuerySummary();
    this.events = new ClickHouseProfilerEvents();
    this.tracelogs = new ClickHouseProfilerTraceLogs();
    this.explainplan = new ClickHouseProfilerExplainPlan();
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
    // Try using a standard UUID format instead of custom query_id
    const queryId = `${crypto.randomUUID()}`;
    let profileData = {};

    // 1. Get EXPLAIN PIPELINE graph
    statusCallback('Profiling: Pipeline...');
    try {
      const graphSql = `EXPLAIN PIPELINE graph = 1 ${cleanedSql}`;
      const graphResultSet = await this.client.query({ query: graphSql, format: 'JSONEachRow' });
      const graphRows = await graphResultSet.json();
      profileData.pipelineGraph = graphRows.map(row => row.explain).join('\n');
    } catch (e) {
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
      profileData.actionsPlan = `Error: ${e.message}`;
    }

    // 3. OpenTelemetry data will be collected after query execution

    // 4. Execute the actual query and fetch logs
    let finalSql = sql
      .replace('{width:UInt32}', params[0])
      .replace('{height:UInt32}', params[1])
      .replace('{iTime:Float64}', params[2])
      .replace('{mx:Float64}', params[3])
      .replace('{my:Float64}', params[4]);

    // No need to append SETTINGS - OpenTelemetry is configured at client level

    statusCallback('Profiling: Executing...');

    try {
      // Execute the shader query - OpenTelemetry is configured at client level
      await this.client.exec({
        query: finalSql,
        query_id: queryId,
        clickhouse_settings: {
          // This setting must be a string "1.0" to be correctly interpreted by the server via HTTP.
          opentelemetry_start_trace_probability: '1.0',
          log_queries: 1,
        }
      });
    } catch (e) {
      // If the query fails, we might still have received logs before the error.
      if (e.response && e.response.logs) {
        profileData.serverTextLog = e.response.logs;
      }
    }

    // Force ClickHouse to flush its log buffers to the system tables.
    // This is more reliable than waiting with a timeout and ensures the logs are available.
    const storedSettings = JSON.parse(localStorage.getItem('pixelql.clickhouse-settings')) || {};
    const waitDuration = parseInt(storedSettings.logFlushWait || '1500', 10);
    statusCallback(`Profiling: Flushing logs (waiting ${waitDuration}ms)...`);
    try {
      await this.client.command({ query: 'SYSTEM FLUSH LOGS' });
      await new Promise(resolve => setTimeout(resolve, waitDuration));
    } catch (e) {
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
          const queryLogResultSet = await this.client.query({ query: queryLogQuery, format: 'JSONEachRow' });
          const queryLogData = await queryLogResultSet.json();
          if (queryLogData.length > 0) {
            profileData.queryLog = queryLogData[0];
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
          const traceResultSet = await this.client.query({
            query: traceQuery, format: 'JSONEachRow', clickhouse_settings: { allow_introspection_functions: 1 }
          });
          const resolvedTraces = await traceResultSet.json();
          if (resolvedTraces.length > 0) {
            profileData.traceLog = resolvedTraces.map(row => ({ trace: row.stack.split(';'), value: row.value }));
          }
        }

        // Attempt to fetch server logs from system.text_log if we don't have them yet
        if (!profileData.serverTextLog || profileData.serverTextLog.length === 0) {
          const serverLogQuery = `SELECT event_time_microseconds, logger_name as source, thread_name, thread_id, level, message FROM system.text_log WHERE query_id = '${queryId}' ORDER BY event_time_microseconds`;
          const serverLogResultSet = await this.client.query({ query: serverLogQuery, format: 'JSONEachRow' });
          const serverLogData = await serverLogResultSet.json();
          if (serverLogData.length > 0) {
            profileData.serverTextLog = serverLogData;
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
      // Errors during polling are not fatal, as some logs might be missing.
    }

    // 5. Collect OpenTelemetry tracing data AFTER query execution
    statusCallback('Profiling: OpenTelemetry...');
    try {
      profileData.openTelemetry = await this.opentelemetry.collectOpenTelemetryTracing(this.client, queryId);
    } catch (e) {
      profileData.openTelemetry = { 
        error: `OpenTelemetry collection failed: ${e.message}`,
        note: "OpenTelemetry tracing may not be enabled in ClickHouse configuration"
      };
    }
    return profileData;
  }

  /**
   * Returns empty recommendations - we don't pretend to optimize ClickHouse.
   */
  generateQueryPerformanceRecommendations(totalMs, jitMs, memoryMB) {
    return [];
  }

  /**
   * Renders the multi-faceted profile data into the modal.
   * @param {object} profileData The data object from the profile() method.
   * @param {HTMLElement} mainContainer The single container element for the profiler UI.
   * @returns {Promise<void>}
   */
  async renderProfile(profileData, mainContainer) {
    // --- Tab 2: Structured Plan ---
    // Use the explain plan module for this content
    const explainPlanContent = this.explainplan.renderExplainPlan(profileData.actionsPlan);

    // --- Tab 3: Query Summary (from system.query_log) ---
    const querySummaryContent = this.querysummary.renderQuerySummary(profileData.queryLog);

    // --- Tab 5: Profile Events (from system.query_log) ---
    const eventsContent = this.events.renderEvents(profileData.queryLog);

    // --- Tab 4: Pipeline Plan (from EXPLAIN PIPELINE) ---
    let pipelinePlanContent;
    if (profileData.pipelineGraph && profileData.pipelineGraph.trim().startsWith('digraph')) {
      const mermaidGraph = this.pipeline.dotToMermaid(profileData.pipelineGraph);
      // We render the graph inside the post-render logic to attach event listeners.
      // For now, we just prepare the content.
      pipelinePlanContent = '';
    } else {
      pipelinePlanContent = `<p>Could not generate graph.</p><pre>${profileData.pipelineGraph || 'No data.'}</pre>`;
    }

    // --- Tab 6: Server Trace Log (from send_logs_level='trace') ---
    const serverTextLogContent = this.tracelogs.renderTraceLogs(profileData.serverTextLog);

    // --- Dynamically build the HTML for the profiler ---
    const tabsConfig = [
      { id: 'query-summary', title: 'Query Summary', content: querySummaryContent, header: `Generated via: <code>SELECT * FROM system.query_log WHERE query_id = '...'</code>`, module: null },
      { id: 'trace-log', title: 'Trace Log', content: serverTextLogContent, header: `Generated via: <code>SELECT ... FROM system.text_log WHERE query_id = '...'</code>`, module: null },
      { id: 'events', title: 'Events', content: eventsContent, header: 'Performance counters from <code>system.query_log.ProfileEvents</code>', module: null },
      { id: 'explain-plan', title: 'Explain Plan', content: explainPlanContent, header: 'Generated via: <code>EXPLAIN actions = 1, indexes = 1</code>', module: null },
      { id: 'pipeline-plan', title: 'Explain Pipeline', content: pipelinePlanContent, header: 'Generated via: <code>EXPLAIN PIPELINE graph = 1</code>', module: this.pipeline },
      { id: 'flamegraph', title: 'FlameGraph', content: '', header: 'Generated via: <code>SELECT ... FROM system.trace_log</code>', module: this.flamegraph },
      { id: 'call-graph', title: 'Call Graph', content: '', header: 'Aggregated view of all function calls. Each function appears once, with its value representing total time spent.', module: this.callgraph },
      { id: 'opentelemetry', title: 'OpenTelemetry', content: this.opentelemetry.renderOpenTelemetry(profileData.openTelemetry || {}), header: 'Distributed tracing spans from system.opentelemetry_span_log', module: null },
    ];

    let tabsHtml = '<div class="profiler-tabs">';
    let contentHtml = '';

    tabsConfig.forEach((tab, index) => {
      const activeClass = index === 0 ? 'active' : '';
      tabsHtml += `<button class="profiler-tab ${activeClass}" data-tab="${tab.id}">${tab.title}</button>`;
      contentHtml += `<div id="profile-content-${tab.id}" class="profiler-tab-content ${activeClass}">
                        <h3>${tab.title}</h3>
                        <p>${tab.header}</p>`;
      
      // Add module-specific controls if the module provides them
      if (tab.module && typeof tab.module.getControlsHtml === 'function') {
        contentHtml += tab.module.getControlsHtml();
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

        // Show/hide the graph controls based on the active tab
        mainContainer.querySelectorAll('.graph-controls').forEach(controls => {
            const isForActiveTab = controls.dataset.forTab === tab.dataset.tab;
            controls.style.display = isForActiveTab ? 'flex' : 'none';
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
          this.flamegraph.renderFlamegraph(profileData.traceLog, flamegraphContainer, 'none');
          // Set up the grouping dropdown listener
          const groupBySelect = mainContainer.querySelector('#ch-flamegraph-group-by');
          groupBySelect.addEventListener('change', () => {
            this.flamegraph.renderFlamegraph(profileData.traceLog, flamegraphContainer, groupBySelect.value);
          });
          flamegraphTab.removeEventListener('click', renderFlamegraphOnFirstClick);
        });

        // Attach listeners for the new export buttons
        const perfettoButton = mainContainer.querySelector('#ch-perfetto-export-button');
        if (perfettoButton) {
          // The button is disabled, but we prevent any accidental clicks.
          perfettoButton.addEventListener('click', (e) => e.preventDefault());
        }
        mainContainer.querySelector('#ch-speedscope-export-button').addEventListener('click', () => {
          this.flamegraph.exportTraceToSpeedscope(profileData.traceLog, profileData.queryLog?.query_id || 'unknown-query');
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
        this.callgraph.renderCallGraph(profileData.traceLog, callGraphContainer, 'TD'); // Initial render is Top-Down
        this.callgraph.setupCallGraphControls(profileData.traceLog, callGraphContainer);
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
        expandBtn.addEventListener('click', () => mainContainer.querySelector('#inner-content-structured-explain').querySelectorAll('details').forEach(d => d.open = true));
        mainContainer.querySelector('#ch-collapse-all-button').addEventListener('click', () => mainContainer.querySelector('#inner-content-structured-explain').querySelectorAll('details').forEach(d => d.open = false));
    }

    // Add event listeners for the new inner tabs
    const explainPlanContainer = mainContainer.querySelector('#profile-content-explain-plan');
    if (explainPlanContainer) {
      explainPlanContainer.querySelectorAll('.inner-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          explainPlanContainer.querySelectorAll('.inner-tab').forEach(t => t.classList.remove('active'));
          explainPlanContainer.querySelectorAll('.inner-tab-content').forEach(c => c.classList.remove('active'));
          tab.classList.add('active');
          explainPlanContainer.querySelector(`#inner-content-${tab.dataset.innerTab}`).classList.add('active');
        });
      });
    }

    // Render the Pipeline Plan graph and set up its controls
    if (profileData.pipelineGraph && profileData.pipelineGraph.trim().startsWith('digraph')) {
      const pipelineContainer = mainContainer.querySelector('#profile-content-pipeline-plan .tab-inner-content');
      this.pipeline.renderPipelineGraph(profileData.pipelineGraph, pipelineContainer);
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
}