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

    // 1. Let modules fetch their EXPLAIN data using the new pull model
    await this.pipeline.fetchData(this.client, queryId, cleanedSql, statusCallback);
    await this.explainplan.fetchData(this.client, queryId, cleanedSql, statusCallback);

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
    const storedSettings = JSON.parse(localStorage.getItem('sqlshader.clickhouse-settings')) || {};
    const waitDuration = parseInt(storedSettings.logFlushWait || '1500', 10);
    statusCallback(`Profiling: Flushing logs (waiting ${waitDuration}ms)...`);
    try {
      await this.client.command({ query: 'SYSTEM FLUSH LOGS' });
      await new Promise(resolve => setTimeout(resolve, waitDuration));
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Use a slightly longer fallback timeout
    }

    // 4. All profiling data is now fetched by individual modules via pull model
    // No centralized polling loop needed!

    // 5. Let all modules fetch their data independently using the pull model
    await Promise.all([
      this.flamegraph.fetchData(this.client, queryId, cleanedSql, statusCallback),
      this.callgraph.fetchData(this.client, queryId, cleanedSql, statusCallback),
      this.querysummary.fetchData(this.client, queryId, cleanedSql, statusCallback),
      this.events.fetchData(this.client, queryId, cleanedSql, statusCallback),
      this.tracelogs.fetchData(this.client, queryId, cleanedSql, statusCallback),
      this.opentelemetry.fetchData(this.client, queryId, cleanedSql, statusCallback),
    ]);

    return profileData;
  }

  /**
   * Returns empty recommendations - we don't pretend to optimize ClickHouse.
   */
  generateQueryPerformanceRecommendations(totalMs, jitMs, memoryMB) {
    return [];
  }

  /**
   * Renders the multi-faceted profile data into the modal using modular architecture.
   * Each module provides render(data) for HTML content and setupEventHandlers(containerId, data) for interactions.
   * 
   * @param {object} profileData The data object from the profile() method.
   * @param {HTMLElement} mainContainer The single container element for the profiler UI.
   * @returns {Promise<void>}
   */
  async renderProfile(profileData, mainContainer) {
    // PHASE 1: CONTENT GENERATION - Each module's render() method converts raw data into HTML.
    
    // --- Tab 2: Structured Plan ---
    // Now using the new pull model where explainplan owns its data
    const explainPlanContent = this.explainplan.render();

    // --- Tab 3: Query Summary (from system.query_log) ---
    // Now using the new pull model where querysummary owns its data
    const querySummaryContent = this.querysummary.render();

    // --- Tab 5: Profile Events (from system.query_log) ---
    // Now using the new pull model where events owns its data
    const eventsContent = this.events.render();

    // --- Tab 4: Pipeline Plan (from EXPLAIN PIPELINE) ---
    // Now using the new pull model where pipeline owns its data
    let pipelinePlanContent;
    if (this.pipeline.data?.pipelineGraph && this.pipeline.data.pipelineGraph.trim().startsWith('digraph')) {
      pipelinePlanContent = this.pipeline.render();
    } else {
      pipelinePlanContent = `<p>Could not generate graph.</p><pre>${this.pipeline.data?.pipelineGraph || 'No data.'}</pre>`;
    }

    // --- Tab 6: Server Trace Log (from send_logs_level='trace') ---
    // Now using the new pull model where tracelogs owns its data
    const serverTextLogContent = this.tracelogs.render();

    // --- Tab 7: Call Graph ---
    // Call graph shares trace data from flamegraph module
    const callGraphContent = this.callgraph.render();

    // --- Tab 8: Flamegraph ---
    // Now using the new pull model where flamegraph owns its data
    const flamegraphContent = this.flamegraph.render();

    // PHASE 2: TAB CONFIGURATION - Build tabsConfig array with each tab's properties including module references.
    
    // --- Dynamically build the HTML for the profiler ---
    const tabsConfig = [
      { id: 'query-summary', title: 'Query Summary', content: querySummaryContent, header: `Generated via: <code>SELECT * FROM system.query_log WHERE query_id = '...'</code>`, module: this.querysummary },
      { id: 'trace-log', title: 'Trace Log', content: serverTextLogContent, header: `Generated via: <code>SELECT ... FROM system.text_log WHERE query_id = '...'</code>`, module: this.tracelogs },
      { id: 'events', title: 'Events', content: eventsContent, header: 'Performance counters from <code>system.query_log.ProfileEvents</code>', module: this.events },
      { id: 'explain-plan', title: 'Explain Plan', content: explainPlanContent, header: 'Generated via: <code>EXPLAIN actions = 1, indexes = 1</code>', module: this.explainplan },
      { id: 'pipeline-plan', title: 'Explain Pipeline', content: pipelinePlanContent, header: 'Generated via: <code>EXPLAIN PIPELINE graph = 1, compact = 0</code>', module: this.pipeline },
      { id: 'flamegraph', title: 'FlameGraph', content: flamegraphContent, header: 'Generated via: <code>SELECT ... FROM system.trace_log</code>', module: this.flamegraph },
      { id: 'call-graph', title: 'Call Graph', content: callGraphContent, header: 'Aggregated view of all function calls. Each function appears once, with its value representing total time spent.', module: this.callgraph },
      { id: 'opentelemetry', title: 'OpenTelemetry', content: this.opentelemetry.render(), header: 'Distributed tracing spans from system.opentelemetry_span_log', module: this.opentelemetry },
    ];

    // PHASE 3: HTML GENERATION - Generate tab buttons and content containers from the configuration.
    
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
      } else if (tab.controls) {
        contentHtml += tab.controls;
      }
      
      contentHtml += `  <div class="tab-inner-content">${tab.content || ''}</div>
                      </div>`;
    });
    tabsHtml += '</div>';

    // PHASE 4: DOM INJECTION - Replace container HTML with generated tabs and content.
    mainContainer.innerHTML = tabsHtml + contentHtml;

    // PHASE 5: EVENT HANDLER SETUP - Delegate to each module's setupEventHandlers() method.
    
    // Set up event handlers for modules using the new interface
    tabsConfig.forEach(tab => {
      if (tab.module && typeof tab.module.setupEventHandlers === 'function') {
        // New pull model: modules with internal data don't need it passed
        // Old push model: modules without internal data still receive moduleData
        if (tab.moduleData !== undefined) {
          tab.module.setupEventHandlers(`profile-content-${tab.id}`, tab.moduleData);
        } else {
          tab.module.setupEventHandlers(`profile-content-${tab.id}`);
        }
      }
    });

    // PHASE 6: CORE UI EVENT HANDLERS - Handle basic tab switching functionality.
    
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
  }
}