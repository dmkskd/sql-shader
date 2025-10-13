/**
 * ClickHouse Explain Plan Module
 * Handles rendering of explain plan data with raw and structured views.
 */
export class ClickHouseProfilerExplainPlan {
  constructor() {
    // Module owns its data - profiler doesn't need to know about it
    this.data = null;
  }

  /**
   * Fetches EXPLAIN plan data from ClickHouse and stores it internally.
   * This is the new pull-based interface where the module owns its data fetching logic.
   * 
   * @param {ClickHouseClient} client - The ClickHouse client instance
   * @param {string} queryId - The unique query ID (unused for EXPLAIN queries)
   * @param {string} cleanedSql - The SQL query with placeholders replaced
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(client, queryId, cleanedSql, statusCallback = () => {}) {
    statusCallback('Fetching explain plan...');
    
    try {
      const actionsSql = `EXPLAIN actions = 1, indexes = 1, header = 1 ${cleanedSql}`;
      const actionsResultSet = await client.query({ query: actionsSql, format: 'JSONEachRow' });
      const actionsRows = await actionsResultSet.json();
      this.data = actionsRows.map(row => row.explain).join('\n');
    } catch (e) {
      console.error('[ExplainPlan] Error fetching explain plan:', e.message);
      this.data = `Error: ${e.message}`;
    }
  }

  /**
   * Processes and formats explain plan text with syntax highlighting and collapsible sections.
   * @param {string} planText Raw explain plan text.
   * @returns {string} Formatted HTML with collapsible sections.
   */
  formatStructuredPlan(planText) {
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

    return formattedHtml;
  }

  /**
   * Renders the explain plan with inner tabs for raw and structured views.
   * @param {string} planText Raw explain plan text.
   * @returns {string} HTML representation of explain plan with nested tabs.
   */
  /**
   * Simple interface: renders explain plan with raw and structured views.
   * Module uses its internal data from fetchData().
   * @returns {string} HTML representation of explain plan with tabs.
   */
  render() {
    const planText = this.data || 'No data.';
    const formattedHtml = this.formatStructuredPlan(planText);
    
    return `
      <div class="inner-tabs">
        <button class="inner-tab active" data-inner-tab="raw-explain">Raw</button>
        <button class="inner-tab" data-inner-tab="structured-explain">Structured</button>
      </div>
      <div id="inner-content-raw-explain" class="inner-tab-content active">
        <div class="inner-tab-info">Generated via: <code>EXPLAIN actions = 1, indexes = 1, header = 1</code></div>
        <pre>${planText}</pre>
      </div>
      <div id="inner-content-structured-explain" class="inner-tab-content">
        <div class="inner-tab-info">Generated via: <code>EXPLAIN actions = 1, indexes = 1, header = 1</code></div>
        ${this.getControlsHtml()}
        <div class="tab-inner-content">
          <pre>${formattedHtml}</pre>
        </div>
      </div>
    `;
  }

  /**
   * Simple interface: sets up event handlers for explain plan panel.
   * Module uses its internal data from fetchData().
   * @param {string} containerId The ID of the container element.
   */
  setupEventHandlers(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Tab switching for Raw/Structured views
    const innerTabs = container.querySelectorAll('.inner-tab');
    innerTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-inner-tab');
        
        // Update active tab
        innerTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show/hide content
        container.querySelectorAll('.inner-tab-content').forEach(content => {
          content.classList.remove('active');
        });
        const targetContent = container.querySelector(`#inner-content-${targetTab}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });

    // Expand/Collapse controls for structured view
    const expandAllBtn = container.querySelector('#ch-expand-all-button');
    const collapseAllBtn = container.querySelector('#ch-collapse-all-button');
    
    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', () => {
        container.querySelectorAll('details').forEach(details => details.open = true);
      });
    }
    
    if (collapseAllBtn) {
      collapseAllBtn.addEventListener('click', () => {
        container.querySelectorAll('details').forEach(details => details.open = false);
      });
    }
  }

  /**
   * Legacy interface: delegates to render() for backward compatibility.
   * @param {string} planText Raw explain plan text.
   * @returns {string} HTML representation of explain plan with tabs.
   */
  renderExplainPlan(planText) {
    return this.render(planText);
  }

  /**
   * Generates HTML controls for the structured explain plan tab.
   * @returns {string} HTML string for explain plan controls.
   */
  getControlsHtml() {
    return `<div class="graph-controls" data-for-tab="structured-plan">
              <button id="ch-expand-all-button" title="Expand All Nodes">Expand All</button>
              <button id="ch-collapse-all-button" title="Collapse All Nodes">Collapse All</button>
           </div>`;
  }
}