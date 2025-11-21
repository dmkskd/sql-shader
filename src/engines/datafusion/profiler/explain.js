import mermaid from 'mermaid';
import { formatPhysicalPlan } from './physical_plan_formatter.js';

/**
 * DataFusion Explain Plan Module
 * Handles rendering of DataFusion query plans with multiple views:
 * - Logical Plan (optimized)
 * - Physical Plan (execution strategy)
 * - Verbose Plan (with schema details)
 * 
 * References:
 * - https://datafusion.apache.org/user-guide/sql/explain.html
 * - https://docs.rs/datafusion/latest/datafusion/#plan-representations
 */
export class DataFusionProfilerExplain {
  constructor() {
    // Module owns its data
    this.logicalPlan = null;
    this.physicalPlan = null;
    this.pgjson = null; // Postgres-compatible JSON for PEV2 visualizer
    this.error = null;
  }

  /**
   * Fetches EXPLAIN plan data from DataFusion server and stores it internally.
   * 
   * DataFusion EXPLAIN variants:
   * - EXPLAIN <query> - Optimized logical plan
   * - EXPLAIN ANALYZE <query> - Execution plan with stats (if available)
   * 
   * @param {string} baseUrl - The DataFusion server base URL
   * @param {string} sql - The SQL query with uniforms already substituted
   * @param {Object} uniforms - The uniforms object (for reference)
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(baseUrl, sql, uniforms, statusCallback = () => {}) {
    statusCallback('Fetching DataFusion explain plans...');
    
    // Remove leading comments and whitespace from SQL
    // This is necessary because EXPLAIN gets prepended, and comments confuse the parser
    const cleanedSql = sql.replace(/^(\s*--.*\n)+/, '').trim();
    
    console.log('[DataFusion Explain] Original SQL length:', sql.length);
    console.log('[DataFusion Explain] Cleaned SQL length:', cleanedSql.length);
    console.log('[DataFusion Explain] First 100 chars of cleaned SQL:', cleanedSql.substring(0, 100));
    
    try {
      // Fetch logical plan - just EXPLAIN
      statusCallback('Fetching logical plan...');
      const logicalSql = `EXPLAIN ${cleanedSql}`;
      const logicalData = await this.executeExplain(baseUrl, logicalSql);
      this.logicalPlan = logicalData;

      // Fetch physical plan - EXPLAIN ANALYZE returns execution plan
      statusCallback('Fetching physical plan...');
      
      // Try different EXPLAIN syntaxes based on DataFusion version
      // Some versions may not support EXPLAIN ANALYZE
      let indentData = null;
      
      // Try ANALYZE first (shows execution plan with stats)
      try {
        const analyzeSql = `EXPLAIN ANALYZE ${cleanedSql}`;
        indentData = await this.executeExplain(baseUrl, analyzeSql);
        console.log('[DataFusion Explain] Got EXPLAIN ANALYZE plan');
      } catch (analyzeError) {
        console.log('[DataFusion Explain] EXPLAIN ANALYZE not available:', analyzeError.message);
        
        // Fallback: just use the logical plan for now
        // Physical plan may not be available in all DataFusion versions
        indentData = null;
      }
      
      this.physicalPlan = indentData || 'Physical plan not available in this DataFusion version. Try updating to a newer version that supports EXPLAIN ANALYZE.';

      // Fetch PGJSON format for PEV2 visualizer
      statusCallback('Fetching Postgres-compatible JSON...');
      try {
        const pgjsonSql = `EXPLAIN FORMAT PGJSON ${cleanedSql}`;
        console.log('[DataFusion Explain] Fetching PGJSON plan');
        const pgjsonData = await this.executeExplain(baseUrl, pgjsonSql);
        
        console.log('[DataFusion Explain] PGJSON raw data:', pgjsonData);
        
        // The PGJSON output comes as a JSON string in the 'plan' column
        // Parse it to get the actual plan array
        const jsonMatch = pgjsonData.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('[DataFusion Explain] Parsed PGJSON successfully');
          console.log('[DataFusion Explain] PGJSON[0]?.Plan:', !!parsed[0]?.Plan);
          this.pgjson = parsed;
        } else {
          console.warn('[DataFusion Explain] Could not extract JSON from PGJSON output');
          this.pgjson = null;
        }
      } catch (pgjsonError) {
        console.error('[DataFusion Explain] PGJSON format error:', pgjsonError.message);
        this.pgjson = null;
      }

      statusCallback('Explain plans fetched.');
    } catch (e) {
      console.error('[DataFusion Explain] Error fetching explain plans:', e.message);
      this.error = `Error: ${e.message}`;
      this.logicalPlan = this.error;
      this.physicalPlan = this.error;
      this.pgjson = null;
    }
  }

  /**
   * Execute an EXPLAIN query via the standard /query endpoint.
   * @param {string} baseUrl - The DataFusion server base URL
   * @param {string} explainSql - The EXPLAIN SQL statement
   * @returns {Promise<string>} - The explain plan text
   */
  async executeExplain(baseUrl, explainSql) {
    console.log('[DataFusion Explain] Executing:', explainSql);
    
    const response = await fetch(`${baseUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: explainSql,
        format: 'json'
      }),
    });
    
    console.log('[DataFusion Explain] Response status:', response.status);
    console.log('[DataFusion Explain] Response headers:', response.headers.get('content-type'));
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('[DataFusion Explain] Error response:', responseText);
      
      // Try to parse as JSON error
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      } catch (jsonError) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
    }
    
    const responseText = await response.text();
    console.log('[DataFusion Explain] Response text length:', responseText.length);
    console.log('[DataFusion Explain] Response preview:', responseText.substring(0, 200));
    
    if (!responseText) {
      throw new Error('Empty response from server');
    }
    
    const data = JSON.parse(responseText);
    console.log('[DataFusion Explain] Parsed data:', data);
    
    return this.extractPlanText(data);
  }

  /**
   * Extract physical plan from EXPLAIN FORMAT INDENT result.
   * The result contains rows with plan_type and plan columns.
   * @param {string} indentData - The full FORMAT INDENT output
   * @returns {string} - Just the physical plan text
   */
  extractPhysicalPlan(indentData) {
    // FORMAT INDENT outputs both plans, but we parse it as a single string
    // Look for the physical_plan section
    // The response from executeExplain is already just the plan text
    // But FORMAT INDENT has both logical and physical in one output
    
    // For now, return the full output - it will contain both plans
    // We could parse it further, but DataFusion's format is already readable
    return indentData;
  }

  /**
   * Extract plan text from DataFusion response.
   * The response format from /query endpoint returns data as array of row objects.
   * @param {Object} data - Response data from server
   * @returns {string} - Extracted plan text
   */
  extractPlanText(data) {
    // Response format: { data: [{plan: "..."}, ...], rows: N, schema: [...] }
    if (data.data && Array.isArray(data.data)) {
      const lines = data.data.map(row => {
        // EXPLAIN returns a column - could be 'plan', 'explain', or first column
        if (row.plan) return row.plan;
        if (row.explain) return row.explain;
        // Get first value from the row object
        const values = Object.values(row);
        return values.length > 0 ? values[0] : '';
      });
      
      // Expand "SAME TEXT AS ABOVE" references
      // DataFusion uses this to compress repeated lines
      const expandedLines = [];
      let lastLine = '';
      
      for (const line of lines) {
        if (line === 'SAME TEXT AS ABOVE' || line.trim() === 'SAME TEXT AS ABOVE') {
          expandedLines.push(lastLine);
        } else {
          expandedLines.push(line);
          lastLine = line;
        }
      }
      
      return expandedLines.join('\n');
    }
    
    // If data is already a string
    if (typeof data === 'string') {
      return data;
    }
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Extract physical plan from EXPLAIN FORMAT INDENT result.
   * The result contains rows with plan_type and plan columns.
   * @param {string} indentData - The full FORMAT INDENT output
   * @returns {string} - Just the physical plan text
   */
  extractPhysicalPlan(indentData) {
    // FORMAT INDENT outputs both plans in the same result
    // We could try to split it, but for now just return all
    // (it's already formatted nicely by DataFusion)
    return indentData;
  }

  /**
   * Format plan text with syntax highlighting for DataFusion operators.
   * @param {string} planText - Raw plan text
   * @returns {string} - HTML with syntax highlighting
   */
  formatPlan(planText) {
    if (!planText) return '<pre style="color: #888;">No data available.</pre>';
    
    // Highlight DataFusion operator names
    const operators = [
      'Projection', 'Filter', 'Aggregate', 'Sort', 'Limit',
      'Join', 'CrossJoin', 'Union', 'TableScan', 'EmptyRelation',
      'Repartition', 'Window', 'SubqueryAlias', 'Analyze',
      'Explain', 'CreateMemoryTable', 'DropTable', 'Values',
      'CoalesceBatches', 'RepartitionExec', 'SortExec',
      'ProjectionExec', 'FilterExec', 'HashJoinExec',
      'AggregateExec', 'CoalescePartitionsExec'
    ];
    
    let highlighted = planText;
    
    // Highlight operators
    operators.forEach(op => {
      const regex = new RegExp(`\\b${op}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="time-warm">${op}</span>`);
    });
    
    // Highlight schema info (in verbose mode)
    highlighted = highlighted.replace(/(\[.*?\])/g, '<span style="color: #80ff80;">$1</span>');
    
    return `<pre>${highlighted}</pre>`;
  }

  /**
   * Renders the explain plan with inner tabs for different plan types.
   * @returns {string} HTML representation of explain plans with tabs.
   */
  render() {
    const tabs = [];
    
    if (this.logicalPlan) {
      tabs.push({ 
        id: 'logical', 
        title: 'Logical Plan', 
        content: this.formatPlan(this.logicalPlan),
        info: 'Generated via: <code>EXPLAIN &lt;query&gt;</code>'
      });
    }
    
    if (this.physicalPlan) {
      // Use the visual formatter for physical plan
      const formattedPhysical = formatPhysicalPlan(this.physicalPlan);
      
      tabs.push({ 
        id: 'physical', 
        title: 'Physical Plan Timeline', 
        content: formattedPhysical,
        info: 'Generated via: <code>EXPLAIN ANALYZE &lt;query&gt;</code>'
      });
      
      // Also add raw physical plan as a separate tab
      tabs.push({ 
        id: 'physical-raw', 
        title: 'Physical Plan (Raw)', 
        content: this.formatPlan(this.physicalPlan),
        info: 'Raw physical plan text from DataFusion'
      });
    }
    
    if (tabs.length === 0) {
      return '<p style="color: #888;">No explain data available. Try profiling a query first.</p>';
    }
    
    // Build inner tabs HTML
    let html = '<div class="inner-tabs">';
    tabs.forEach((tab, index) => {
      const activeClass = index === 0 ? 'active' : '';
      html += `<button class="inner-tab ${activeClass}" data-inner-tab="${tab.id}">${tab.title}</button>`;
    });
    html += '</div>';
    
    // Build content HTML
    tabs.forEach((tab, index) => {
      const activeClass = index === 0 ? 'active' : '';
      html += `<div id="inner-content-${tab.id}" class="inner-tab-content ${activeClass}">`;
      html += `  <div class="inner-tab-info">${tab.info}</div>`;
      html += `  <div class="tab-inner-content">${tab.content}</div>`;
      html += `</div>`;
    });
    
    return html;
  }

  /**
   * Sets up event handlers for the explain plan panel.
   * @param {string} containerId - The ID of the container element.
   */
  setupEventHandlers(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Tab switching for different plan types
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
  }
}
