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
import { ClickHouseProfilerQueryTree } from './profiler/querytree.js';
import { ClickHouseProfilerExplainAST } from './profiler/explainast.js';
import { ClickHouseProfilerExplain } from './profiler/explain.js';

/**
 * ClickHouse Profiler - orchestrates profiling modules for query analysis.
 * 
 * Architecture: Each module is autonomous and follows a standard interface:
 *   - fetchData(client, queryId, cleanedSql, statusCallback) - fetch and store data internally
 *   - render() - return HTML string for the module's tab content
 *   - setupEventHandlers(containerId) - attach event listeners after render
 * 
 * To add a new module:
 *   1. Create a class in ./profiler/ following the interface above
 *   2. Import and instantiate it in constructor
 *   3. Add to this.dataModules array (if it fetches data after query execution)
 *   4. Add a tab entry in renderProfile()'s tabsConfig array
 * 
 * The profiler doesn't know about module internals - modules own their data lifecycle.
 */
export class ClickHouseProfiler {
  constructor(engine) {
    this.engine = engine;
    this.client = engine.client;
    
    // Initialize all profiler modules
    this.pipeline = new ClickHouseProfilerPipelineGraph();
    this.explainplan = new ClickHouseProfilerExplainPlan();
    this.querytree = new ClickHouseProfilerQueryTree();
    this.explainast = new ClickHouseProfilerExplainAST();
    this.flamegraph = new ClickHouseProfilerFlamegraph();
    this.callgraph = new ClickHouseProfilerCallGraph();
    this.querysummary = new ClickHouseProfilerQuerySummary();
    this.events = new ClickHouseProfilerEvents();
    this.tracelogs = new ClickHouseProfilerTraceLogs();
    this.opentelemetry = new ClickHouseProfilerOpenTelemetry();
    
    // Explain orchestrator groups Plan, Query Tree, AST, and Pipeline
    this.explain = new ClickHouseProfilerExplain(this.explainplan, this.querytree, this.explainast, this.pipeline);
    
    // Array of modules that fetch data after query execution
    this.dataModules = [
      this.flamegraph,
      this.callgraph,
      this.querysummary,
      this.events,
      this.tracelogs,
      this.opentelemetry,
    ];
  }

  /**
   * Runs the query with profiling enabled and collects various performance metrics.
   * @param {string} sql The raw SQL of the shader to profile.
   * @param {Array<any>} params The parameters for the query.
   * @param {function(string): void} [statusCallback=(() => {})] Optional callback to report progress.
   * @returns {Promise<object>} A data object containing plans, logs, and traces.
   */
  async profile(sql, params, statusCallback = () => {}) {
    statusCallback('Profiling...');
    const cleanedSql = sql.replace(/{[^}]+}/g, '1');
    const queryId = `${crypto.randomUUID()}`;
    let profileData = {};

    // Fetch EXPLAIN data before query execution (orchestrator handles all three)
    await this.explain.fetchData(this.client, queryId, cleanedSql, statusCallback);

    // Execute the actual query with profiling enabled
    let finalSql = sql
      .replace('{width:UInt32}', params[0])
      .replace('{height:UInt32}', params[1])
      .replace('{iTime:Float64}', params[2])
      .replace('{mx:Float64}', params[3])
      .replace('{my:Float64}', params[4]);

    statusCallback('Profiling: Executing...');

    try {
      await this.client.exec({
        query: finalSql,
        query_id: queryId,
        clickhouse_settings: {
          opentelemetry_start_trace_probability: '1.0',
          log_queries: 1,
        }
      });
    } catch (e) {
      if (e.response && e.response.logs) {
        profileData.serverTextLog = e.response.logs;
      }
    }

    // Flush ClickHouse log buffers to system tables
    const storedSettings = JSON.parse(localStorage.getItem('sqlshader.clickhouse-settings')) || {};
    const waitDuration = parseInt(storedSettings.logFlushWait || '1500', 10);
    statusCallback(`Profiling: Flushing logs (waiting ${waitDuration}ms)...`);
    try {
      await this.client.command({ query: 'SYSTEM FLUSH LOGS' });
      await new Promise(resolve => setTimeout(resolve, waitDuration));
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Fetch profiling data from all modules in parallel
    await Promise.all(
      this.dataModules.map(module => 
        module.fetchData(this.client, queryId, cleanedSql, statusCallback)
      )
    );

    return profileData;
  }

  /**
   * Returns empty recommendations - we don't pretend to optimize ClickHouse.
   */
  generateQueryPerformanceRecommendations(totalMs, jitMs, memoryMB) {
    return [];
  }

  /**
   * Renders the profiler UI with all module tabs.
   * Each module provides render() and setupEventHandlers() methods.
   * 
   * @param {object} profileData Unused - kept for API compatibility.
   * @param {HTMLElement} mainContainer The container element for the profiler UI.
   * @returns {Promise<void>}
   */
  async renderProfile(profileData, mainContainer) {
    // Configure all profiler tabs
    const tabsConfig = [
      { id: 'query-summary', title: 'Query Summary', module: this.querysummary, header: `Generated via: <code>SELECT * FROM system.query_log WHERE query_id = '...'</code>` },
      { id: 'trace-log', title: 'Trace Log', module: this.tracelogs, header: `Generated via: <code>SELECT ... FROM system.text_log WHERE query_id = '...'</code>` },
      { id: 'events', title: 'Events', module: this.events, header: 'Performance counters from <code>system.query_log.ProfileEvents</code>' },
      { id: 'explain', title: 'Explain', module: this.explain, header: '' },
      { id: 'flamegraph', title: 'FlameGraph', module: this.flamegraph, header: 'Generated via: <code>SELECT ... FROM system.trace_log</code>' },
      { id: 'call-graph', title: 'Call Graph', module: this.callgraph, header: 'Aggregated view of all function calls. Each function appears once, with its value representing total time spent.' },
      { id: 'opentelemetry', title: 'OpenTelemetry', module: this.opentelemetry, header: 'Distributed tracing spans from system.opentelemetry_span_log' },
    ];

    // Generate tab buttons and content containers
    let tabsHtml = '<div class="profiler-tabs">';
    let contentHtml = '';

    tabsConfig.forEach((tab, index) => {
      const activeClass = index === 0 ? 'active' : '';
      tabsHtml += `<button class="profiler-tab ${activeClass}" data-tab="${tab.id}">${tab.title}</button>`;
      
      // Use provided content or call module's render method
      const tabContent = tab.content || (tab.module ? tab.module.render() : '');
      
      contentHtml += `<div id="profile-content-${tab.id}" class="profiler-tab-content ${activeClass}">`;
      
      // Add module-specific controls if available
      if (tab.module && typeof tab.module.getControlsHtml === 'function') {
        contentHtml += tab.module.getControlsHtml();
      }
      
      contentHtml += `  <div class="tab-inner-content">${tabContent}</div>
                      </div>`;
    });
    tabsHtml += '</div>';

    // Inject HTML into container
    mainContainer.innerHTML = tabsHtml + contentHtml;

    // Setup event handlers for all modules
    tabsConfig.forEach(tab => {
      if (tab.module && typeof tab.module.setupEventHandlers === 'function') {
        tab.module.setupEventHandlers(`profile-content-${tab.id}`);
      }
    });

    // Setup tab switching functionality
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

        // Show/hide graph controls based on active tab
        mainContainer.querySelectorAll('.graph-controls').forEach(controls => {
          const isForActiveTab = controls.dataset.forTab === tab.dataset.tab;
          controls.style.display = isForActiveTab ? 'flex' : 'none';
        });
      });
    });
  }
}