import mermaid from 'mermaid';
import * as d3 from 'd3';
import { DataFusionProfilerExplain } from './profiler/explain.js';
import { DataFusionProfilerMetrics } from './profiler/metrics.js';

/**
 * DataFusion Profiler - orchestrates profiling modules for query analysis.
 * 
 * Architecture: Each module is autonomous and follows a standard interface:
 *   - fetchData(baseUrl, sql, statusCallback) - fetch and store data internally
 *   - render() - return HTML string for the module's tab content
 *   - setupEventHandlers(containerId) - attach event listeners after render
 * 
 * DataFusion profiling capabilities:
 *   - EXPLAIN: Logical plan representation
 *   - Execution metrics: Can be exposed from the Rust server
 * 
 * To add a new module:
 *   1. Create a class in ./profiler/ following the interface above
 *   2. Import and instantiate it in constructor
 *   3. Add to this.modules array
 *   4. Add a tab entry in renderProfile()'s tabsConfig array
 */
export class DataFusionProfiler {
  constructor(engine) {
    this.engine = engine;
    this.baseUrl = engine.baseUrl;
    
    // Initialize all profiler modules
    this.explain = new DataFusionProfilerExplain();
    this.metrics = new DataFusionProfilerMetrics();
    
    // Array of all profiler modules
    this.modules = [
      this.explain,
      this.metrics,
    ];
  }

  /**
   * Runs the query with profiling enabled and collects various performance metrics.
   * @param {string} sql The raw SQL of the shader to profile.
   * @param {Object} uniforms The uniforms object containing all shader parameters.
   * @param {function(string): void} [statusCallback=(() => {})] Optional callback to report progress.
   * @returns {Promise<object>} A data object containing plans and metrics.
   */
  async profile(sql, uniforms, statusCallback = () => {}) {
    statusCallback('Profiling DataFusion query...');
    
    // Prepare the SQL with uniforms substituted
    let finalSql = this.substituteUniforms(sql, uniforms);
    
    // Fetch data from all modules in parallel
    statusCallback('Fetching explain plans and metrics...');
    await Promise.all(
      this.modules.map(module => 
        module.fetchData(this.baseUrl, finalSql, uniforms, statusCallback)
      )
    );

    statusCallback('Profiling complete.');
    return {};
  }

  /**
   * Substitute uniform parameters into SQL query.
   * @param {string} sql The SQL query with placeholders.
   * @param {Object} uniforms The uniforms object.
   * @returns {string} SQL with substituted values.
   */
  substituteUniforms(sql, uniforms) {
    let finalSql = sql;
    
    const replacements = {
      '$width': uniforms.iResolution[0],
      '$height': uniforms.iResolution[1],
      '$iTime': uniforms.iTime,
      '$mx': uniforms.iMouse[0],
      '$my': uniforms.iMouse[1],
      '$iFrame': uniforms.iFrame,
    };
    
    for (const [key, value] of Object.entries(replacements)) {
      finalSql = finalSql.replace(new RegExp('\\' + key + '\\b', 'g'), value.toString());
    }
    
    return finalSql;
  }

  /**
   * Returns empty recommendations - we don't pretend to optimize DataFusion.
   */
  generateQueryPerformanceRecommendations(totalMs, memoryMB) {
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
      { 
        id: 'explain', 
        title: 'Explain Plan', 
        module: this.explain, 
        header: 'DataFusion logical and physical query plans generated via <code>EXPLAIN</code> statements'
      },
      { 
        id: 'metrics', 
        title: 'Query Metrics', 
        module: this.metrics, 
        header: 'Execution metrics from DataFusion query execution'
      },
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
      
      if (tab.header) {
        contentHtml += `<p style="margin-bottom: 15px; padding: 10px; background: rgba(255,201,128,0.1); border-left: 3px solid #ffc980;">${tab.header}</p>`;
      }
      
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
