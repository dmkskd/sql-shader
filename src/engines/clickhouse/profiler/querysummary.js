/**
 * ClickHouse Query Summary Module
 * Handles rendering of query execution summary from system.query_log data.
 */
export class ClickHouseProfilerQuerySummary {
  constructor() {
    // No dependencies needed for this module
  }

  /**
   * Renders query summary information from system.query_log data.
   * @param {object} queryLog Query log data from system.query_log.
   * @returns {string} HTML representation of query summary.
   */
  renderQuerySummary(queryLog) {
    if (queryLog && !queryLog.error) {
      return `<p><strong>Server-Side Execution Time:</strong> ${queryLog.query_duration_ms.toLocaleString()} ms</p>
              <p><strong>Peak Memory Usage:</strong> ${(queryLog.memory_usage / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Rows Read:</strong> ${queryLog.read_rows.toLocaleString()}</p>
              <p><strong>Bytes Read:</strong> ${(queryLog.read_bytes / 1024 / 1024).toFixed(2)} MB</p>`;
    } else {
      let content = `<p>No query log data found. Ensure query logging is enabled on your server.</p>`;
      if (queryLog && queryLog.error) {
        content += `<pre>${JSON.stringify(queryLog, null, 2)}</pre>`;
      }
      return content;
    }
  }
}