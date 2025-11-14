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
        id: 'pev2', 
        title: 'Plan Visualizer', 
        content: '<div id="datafusion-pev2-container" style="width: 100%; min-height: 100vh; overflow: auto;"></div>', 
        header: 'Interactive query plan visualization powered by <a href="https://explain.dalibo.com/" target="_blank">PEV2</a>',
        customRender: true // Flag to handle special rendering
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
        
        // Initialize PEV2 when its tab is clicked
        if (tab.dataset.tab === 'pev2') {
          this.initializePEV2();
        }
      });
    });
  }

  /**
   * Initialize PEV2 (Postgres Explain Visualizer 2) with DataFusion's PGJSON output.
   * Loads PEV2 from CDN and renders the plan visualization.
   */
  async initializePEV2() {
    const container = document.getElementById('datafusion-pev2-container');
    if (!container) {
      console.error('[PEV2] Container not found');
      return;
    }

    // Check if we have PGJSON data
    if (!this.explain.pgjson || !this.explain.pgjson[0]?.Plan) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #888;">
          <h3>Plan visualization not available</h3>
          <p>Your DataFusion version does not support <code>EXPLAIN FORMAT PGJSON</code>.</p>
          <p><strong>Current version:</strong> DataFusion 50.3.0</p>
          <p><strong>Status:</strong> PGJSON format is documented but not yet available in released versions</p>
          <p><strong>What is PGJSON?</strong> It's a Postgres-compatible JSON format that would enable interactive visualization with PEV2.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #444;">
          <p style="font-size: 0.9em;">The PGJSON format is coming soon to DataFusion. For now, use the <strong>Explain Plan</strong> tab to view logical and physical plans in text format.</p>
          <p style="margin-top: 20px; font-size: 0.85em; color: #666;">
            Learn more: <a href="https://datafusion.apache.org/user-guide/sql/explain.html" target="_blank">DataFusion EXPLAIN Documentation</a>
          </p>
        </div>
      `;
      return;
    }

    // Check if PEV2 is already loaded
    if (!window.pev2 || !window.Vue) {
      console.log('[PEV2] Loading PEV2 from CDN...');
      
      try {
        // Load Vue 3 first
        if (!window.Vue) {
          await this.loadScript('https://unpkg.com/vue@3/dist/vue.global.prod.js');
        }
        
        // Load PEV2
        if (!window.pev2) {
          await this.loadScript('https://unpkg.com/pev2/dist/pev2.umd.js');
          await this.loadStylesheet('https://unpkg.com/pev2/dist/pev2.css');
        }
        
        // Bootstrap CSS is already loaded in index.html, no need to load it again
        
        console.log('[PEV2] PEV2 loaded successfully');
      } catch (error) {
        console.error('[PEV2] Failed to load PEV2:', error);
        container.innerHTML = `
          <div style="padding: 20px; color: #ff6b6b;">
            <h3>Failed to load PEV2 visualizer</h3>
            <p>Error: ${error.message}</p>
          </div>
        `;
        return;
      }
    }

    // Convert PGJSON array to the format PEV2 expects (JSON string)
    const planJson = JSON.stringify(this.explain.pgjson[0]);
    
    // Create Vue app with PEV2 component
    try {
      const { createApp } = window.Vue;
      
      // Clear container and create mount point with proper styling
      container.innerHTML = '<div id="pev2-app" style="width: 100%; height: 100%; min-height: 800px;"></div>';
      
      const app = createApp({
        data() {
          return {
            plan: planJson,
            query: '' // We don't have the original query text readily available
          };
        },
        template: '<pev2 :plan-source="plan" :plan-query="query" style="height: 100%; min-height: 800px;" />'
      });
      
      app.component('pev2', window.pev2.Plan);
      app.mount('#pev2-app');
      
      console.log('[PEV2] Visualization rendered');
    } catch (error) {
      console.error('[PEV2] Failed to render visualization:', error);
      container.innerHTML = `
        <div style="padding: 20px; color: #ff6b6b;">
          <h3>Failed to render visualization</h3>
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
  }

  /**
   * Helper to dynamically load a script from CDN.
   * @param {string} src - Script URL
   * @returns {Promise<void>}
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Helper to dynamically load a stylesheet from CDN.
   * @param {string} href - Stylesheet URL
   * @returns {Promise<void>}
   */
  loadStylesheet(href) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve();
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-pev2-style', 'true'); // Mark for cleanup
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
      document.head.appendChild(link);
    });
  }

  /**
   * Cleanup PEV2 resources when profiler is closed.
   * Call this when the profiler modal is closed.
   */
  cleanup() {
    console.log('[DataFusion Profiler] Cleaning up PEV2 resources');
    
    // Clear the PEV2 container content
    const container = document.getElementById('datafusion-pev2-container');
    if (container) {
      container.innerHTML = '<div id="datafusion-pev2-container" style="width: 100%; min-height: 90vh; overflow: auto;"></div>';
    }
    
    // Don't remove Bootstrap or PEV2 CSS - they're reused
    // Just clear the Vue app instance by clearing the container
  }
}
