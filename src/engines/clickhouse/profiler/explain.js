/**
 * ClickHouse Explain Orchestrator Module
 * Groups Plan, Query Tree, AST, and Pipeline explains under a single "Explain" tab.
 */
export class ClickHouseProfilerExplain {
  constructor(explainplan, querytree, explainast, pipeline) {
    this.explainplan = explainplan;
    this.querytree = querytree;
    this.explainast = explainast;
    this.pipeline = pipeline;
    this.data = null; // Not used, but keeps interface consistent
  }

  /**
   * Fetches data for all four explain modules.
   * @param {ClickHouseClient} client - The ClickHouse client instance
   * @param {string} queryId - The unique query ID
   * @param {string} cleanedSql - The SQL query with placeholders replaced
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(client, queryId, cleanedSql, statusCallback = () => {}) {
    // Fetch data for all four sub-modules
    await Promise.all([
      this.explainplan.fetchData(client, queryId, cleanedSql, statusCallback),
      this.querytree.fetchData(client, queryId, cleanedSql, statusCallback),
      this.explainast.fetchData(client, queryId, cleanedSql, statusCallback),
      this.pipeline.fetchData(client, queryId, cleanedSql, statusCallback)
    ]);
  }

  /**
   * Renders the Explain tab with middle-level tabs for Plan, Pipeline, Query Tree, and AST.
   * @returns {string} HTML representation with middle tabs.
   */
  render() {
    return `
      <div class="middle-tabs">
        <button class="middle-tab active" data-middle-tab="plan">Plan</button>
        <button class="middle-tab" data-middle-tab="pipeline">Pipeline</button>
        <button class="middle-tab" data-middle-tab="query-tree">Query Tree</button>
        <button class="middle-tab" data-middle-tab="ast">AST</button>
      </div>
      
      <div id="middle-content-plan" class="middle-tab-content active">
        ${this.explainplan.render()}
      </div>
      
      <div id="middle-content-pipeline" class="middle-tab-content">
        ${this.pipeline.render()}
      </div>
      
      <div id="middle-content-query-tree" class="middle-tab-content">
        ${this.querytree.render()}
      </div>
      
      <div id="middle-content-ast" class="middle-tab-content">
        ${this.explainast.render()}
      </div>
    `;
  }

  /**
   * Sets up event handlers for middle tabs and delegates to sub-modules.
   * @param {string} containerId The ID of the container element.
   */
  setupEventHandlers(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Middle tab switching
    const middleTabs = container.querySelectorAll('.middle-tab');
    middleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-middle-tab');
        
        // Update active tab
        middleTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show/hide content
        container.querySelectorAll('.middle-tab-content').forEach(content => {
          content.classList.remove('active');
        });
        const targetContent = container.querySelector(`#middle-content-${targetTab}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });

    // Setup event handlers for each sub-module with their specific container IDs
    this.explainplan.setupEventHandlers('middle-content-plan');
    this.querytree.setupEventHandlers('middle-content-query-tree');
    this.explainast.setupEventHandlers('middle-content-ast');
    this.pipeline.setupEventHandlers('middle-content-pipeline');
  }
}
