/**
 * DataFusion Query Metrics Module
 * Displays execution metrics collected from the DataFusion query execution.
 * 
 * This module can display:
 * - Query execution time
 * - Number of rows processed
 * - Memory usage (if available from server)
 * - Partition information
 * - Any custom metrics exposed by the Rust server
 */
export class DataFusionProfilerMetrics {
  constructor() {
    this.metrics = null;
    this.error = null;
  }

  /**
   * Fetches query metrics from DataFusion server.
   * 
   * @param {string} baseUrl - The DataFusion server base URL
   * @param {string} sql - The SQL query with uniforms already substituted
   * @param {Object} uniforms - The uniforms object
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(baseUrl, sql, uniforms, statusCallback = () => {}) {
    statusCallback('Fetching query metrics...');
    
    try {
      // Execute the query with metrics collection
      const startTime = performance.now();
      
      const response = await fetch(`${baseUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: sql,
          format: 'json',
          collect_metrics: true  // Server needs to support this
        }),
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        // Store basic metrics
        this.metrics = {
          executionTime: executionTime,
          rowCount: data.rows || 0,
          // Additional metrics from server response
          serverMetrics: data.metrics || null,
          schema: data.schema || null,
        };
      } else {
        const errorData = await response.json();
        this.error = errorData.error || 'Unknown error';
      }
      
      statusCallback('Metrics fetched.');
    } catch (e) {
      console.error('[DataFusion Metrics] Error fetching metrics:', e.message);
      this.error = `Error: ${e.message}`;
    }
  }

  /**
   * Renders the metrics as a formatted table.
   * @returns {string} HTML representation of query metrics.
   */
  render() {
    if (this.error) {
      return `<div style="padding: 20px; color: #ff8080;">
                <h4>Error fetching metrics</h4>
                <pre>${this.error}</pre>
              </div>`;
    }
    
    if (!this.metrics) {
      return '<p style="color: #888;">No metrics available. Try profiling a query first.</p>';
    }
    
    let html = '<div class="metrics-container" style="padding: 10px;">';
    
    // Basic metrics
    html += '<h4>Query Execution Metrics</h4>';
    html += '<table class="metrics-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
    html += '<thead><tr><th style="text-align: left; padding: 8px; border-bottom: 2px solid #ffc980;">Metric</th><th style="text-align: right; padding: 8px; border-bottom: 2px solid #ffc980;">Value</th></tr></thead>';
    html += '<tbody>';
    
    html += `<tr><td style="padding: 8px;">Execution Time</td><td style="text-align: right; padding: 8px;">${this.metrics.executionTime.toFixed(2)} ms</td></tr>`;
    html += `<tr><td style="padding: 8px;">Rows Returned</td><td style="text-align: right; padding: 8px;">${this.metrics.rowCount.toLocaleString()}</td></tr>`;
    
    if (this.metrics.schema && this.metrics.schema.length > 0) {
      html += `<tr><td style="padding: 8px;">Columns</td><td style="text-align: right; padding: 8px;">${this.metrics.schema.length}</td></tr>`;
    }
    
    html += '</tbody></table>';
    
    // Schema information
    if (this.metrics.schema && this.metrics.schema.length > 0) {
      html += '<h4>Result Schema</h4>';
      html += '<table class="schema-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
      html += '<thead><tr><th style="text-align: left; padding: 8px; border-bottom: 2px solid #ffc980;">Column Name</th><th style="text-align: left; padding: 8px; border-bottom: 2px solid #ffc980;">Data Type</th></tr></thead>';
      html += '<tbody>';
      
      this.metrics.schema.forEach(col => {
        html += `<tr><td style="padding: 8px; font-family: monospace;">${col.name}</td><td style="padding: 8px; color: #80ff80;">${col.type}</td></tr>`;
      });
      
      html += '</tbody></table>';
    }
    
    // Server-provided metrics (if available)
    if (this.metrics.serverMetrics) {
      html += '<h4>Server Metrics</h4>';
      html += '<pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 4px; overflow-x: auto;">';
      html += JSON.stringify(this.metrics.serverMetrics, null, 2);
      html += '</pre>';
    }
    
    html += '</div>';
    
    return html;
  }

  /**
   * Sets up event handlers for the metrics panel.
   * Currently no interactive elements, but kept for consistency.
   * @param {string} containerId - The ID of the container element.
   */
  setupEventHandlers(containerId) {
    // No interactive elements currently
  }
}
