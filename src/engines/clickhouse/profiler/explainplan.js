/**
 * ClickHouse Explain Plan Module
 * Handles rendering of explain plan data with raw and structured views.
 */
export class ClickHouseProfilerExplainPlan {
  constructor() {
    // No dependencies needed for this module
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
  renderExplainPlan(planText) {
    const formattedHtml = this.formatStructuredPlan(planText || 'No data.');
    
    return `
      <div class="inner-tabs">
        <button class="inner-tab active" data-inner-tab="raw-explain">Raw</button>
        <button class="inner-tab" data-inner-tab="structured-explain">Structured</button>
      </div>
      <div id="inner-content-raw-explain" class="inner-tab-content active">
        <pre>${planText || 'No data.'}</pre>
      </div>
      <div id="inner-content-structured-explain" class="inner-tab-content">
        ${this.getControlsHtml()}
        <div class="tab-inner-content">
          <pre>${formattedHtml}</pre>
        </div>
      </div>
    `;
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