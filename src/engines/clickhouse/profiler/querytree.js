/**
 * ClickHouse Query Tree Module
 * Handles rendering of EXPLAIN QUERY TREE data with raw and structured views.
 */
export class ClickHouseProfilerQueryTree {
  constructor() {
    // Module owns its data - profiler doesn't need to know about it
    this.data = null;
  }

  /**
   * Fetches EXPLAIN QUERY TREE data from ClickHouse and stores it internally.
   * 
   * @param {ClickHouseClient} client - The ClickHouse client instance
   * @param {string} queryId - The unique query ID (unused for EXPLAIN queries)
   * @param {string} cleanedSql - The SQL query with placeholders replaced
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(client, queryId, cleanedSql, statusCallback = () => {}) {
    statusCallback('Fetching query tree...');
    
    try {
      const queryTreeSql = `EXPLAIN QUERY TREE dump_passes = 1 ${cleanedSql}`;
      const resultSet = await client.query({ query: queryTreeSql, format: 'JSONEachRow' });
      const rows = await resultSet.json();
      this.data = rows.map(row => row.explain).join('\n');
    } catch (e) {
      console.error('[QueryTree] Error fetching query tree:', e.message);
      this.data = `Error: ${e.message}`;
    }
  }

  /**
   * Processes and formats query tree text with collapsible first-level nodes.
   * Only top-level nodes (QUERY, LIST, etc.) are collapsible, content inside is fully expanded.
   * @param {string} treeText Raw query tree text.
   * @returns {string} Formatted HTML with collapsible tree structure.
   */
  formatStructuredTree(treeText) {
    // First, remove all Pass sections completely
    const lines = treeText.split('\n');
    const filteredLines = [];
    let skipUntilEmptyLine = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect start of Pass section
      if (line.match(/^Pass \d+/)) {
        skipUntilEmptyLine = true;
        continue;
      }
      
      // If we're skipping, check if we hit an empty line or start of tree (QUERY/LIST at column 0)
      if (skipUntilEmptyLine) {
        if (line.trim() === '' || line.match(/^(QUERY|LIST|IDENTIFIER|CONSTANT|FUNCTION|COLUMN|LAMBDA|ALIAS|JOIN|SORT|FILTER)/)) {
          skipUntilEmptyLine = false;
          if (line.trim() !== '') {
            filteredLines.push(line); // Include the tree start line
          }
        }
        continue;
      }
      
      filteredLines.push(line);
    }

    // Now process the filtered lines to create collapsible structure
    let formattedHtml = '';
    let inTopLevelNode = false;

    for (let i = 0; i < filteredLines.length; i++) {
      const line = filteredLines[i];
      
      // Empty lines pass through
      if (line.trim() === '') {
        if (inTopLevelNode) {
          formattedHtml += '\n';
        }
        continue;
      }

      // Calculate indentation level
      const indent = line.search(/\S/);
      
      // Check if this is a top-level node (indent = 0 or 2, depending on format)
      const isTopLevelNode = indent <= 2 && line.match(/^\s*(QUERY|LIST|FUNCTION|JOIN|SORT|FILTER|LAMBDA|IDENTIFIER|CONSTANT|COLUMN)/);
      
      // Close previous top-level node if we're starting a new one
      if (isTopLevelNode && inTopLevelNode) {
        formattedHtml += '</pre></details>\n';
        inTopLevelNode = false;
      }
      
      // Highlight common query tree elements
      let processedLine = line
        .replace(/(QUERY|LIST|IDENTIFIER|CONSTANT|FUNCTION|COLUMN|LAMBDA|ALIAS|JOIN|SORT|FILTER)/g, '<span class="time-warm">$1</span>')
        .replace(/(\(type: [^)]+\))/g, '<span class="time-info">$1</span>')
        .replace(/(\(name: [^)]+\))/g, '<span class="time-cold">$1</span>');

      if (isTopLevelNode) {
        // Start a new top-level collapsible section
        formattedHtml += `<details><summary>${processedLine}</summary><pre>`;
        inTopLevelNode = true;
      } else if (inTopLevelNode) {
        // Content inside a top-level node - show as-is without nesting
        formattedHtml += processedLine + '\n';
      } else {
        // Content before any top-level node (shouldn't happen but handle it)
        formattedHtml += processedLine + '\n';
      }
    }
    
    // Close any remaining open details tag
    if (inTopLevelNode) {
      formattedHtml += '</pre></details>';
    }

    return formattedHtml;
  }

  /**
   * Simple interface: renders query tree with raw and structured views.
   * Module uses its internal data from fetchData().
   * @returns {string} HTML representation of query tree with tabs.
   */
  render() {
    if (!this.data) {
      return '<p>No query tree data available.</p>';
    }

    const treeText = this.data;
    const formattedHtml = this.formatStructuredTree(treeText);
    
    return `
      <div class="inner-tabs">
        <button class="inner-tab active" data-inner-tab="raw-query-tree">Raw</button>
        <button class="inner-tab" data-inner-tab="structured-query-tree">Structured</button>
      </div>
      <div id="inner-content-raw-query-tree" class="inner-tab-content active">
        <div class="inner-tab-info">Generated via: <code>EXPLAIN QUERY TREE dump_passes = 1</code></div>
        <pre>${this.escapeHtml(treeText)}</pre>
      </div>
      <div id="inner-content-structured-query-tree" class="inner-tab-content">
        <div class="inner-tab-info">Generated via: <code>EXPLAIN QUERY TREE dump_passes = 1</code></div>
        ${this.getControlsHtml()}
        <div class="tab-inner-content">
          <pre>${formattedHtml}</pre>
        </div>
      </div>
    `;
  }

  /**
   * Sets up event handlers for inner tabs and expand/collapse controls.
   * @param {string} containerId The ID of the container element.
   */
  setupEventHandlers(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

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
    const expandAllBtn = container.querySelector('#qt-expand-all-button');
    const collapseAllBtn = container.querySelector('#qt-collapse-all-button');
    
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
   * Generates HTML controls for the structured query tree tab.
   * @returns {string} HTML string for query tree controls.
   */
  getControlsHtml() {
    return `<div class="graph-controls" data-for-tab="structured-query-tree">
              <button id="qt-expand-all-button" title="Expand All Nodes">Expand All</button>
              <button id="qt-collapse-all-button" title="Collapse All Nodes">Collapse All</button>
           </div>`;
  }

  /**
   * Helper to escape HTML special characters.
   * @param {string} text Text to escape.
   * @returns {string} Escaped text.
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
