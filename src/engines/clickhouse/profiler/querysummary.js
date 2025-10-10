/**
 * ClickHouse Query Summary Module
 * Handles rendering of query execution summary from system.query_log data.
 */
export class ClickHouseProfilerQuerySummary {
  constructor() {
    // Module owns its data - profiler doesn't need to know about it
    this.data = null;
  }

  /**
   * Fetches query log data from ClickHouse and stores it internally.
   * This is the new pull-based interface where the module owns its data fetching logic.
   * 
   * @param {ClickHouseClient} client - The ClickHouse client instance
   * @param {string} queryId - The unique query ID for filtering query_log
   * @param {string} cleanedSql - The SQL query (unused)
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(client, queryId, cleanedSql, statusCallback = () => {}) {
    statusCallback('Fetching query log...');
    
    try {
      const queryLogQuery = `SELECT * FROM system.query_log WHERE query_id = '${queryId}' AND type = 'QueryFinish' LIMIT 1`;
      const queryLogResultSet = await client.query({ query: queryLogQuery, format: 'JSONEachRow' });
      const queryLogData = await queryLogResultSet.json();
      
      if (queryLogData.length > 0) {
        this.data = queryLogData[0];
      } else {
        this.data = null;
      }
    } catch (e) {
      console.error('[QuerySummary] Error fetching query log:', e.message);
      this.data = { error: e.message };
    }
  }

  /**
   * Simple render method - returns HTML content for the panel.
   * Module uses its internal data from fetchData().
   * @returns {string} HTML content for query summary.
   */
  render() {
    const queryLog = this.data;
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

  /**
   * Sets up event handlers for the Query Summary panel.
   * @param {string} containerId The ID of the container where HTML was inserted.
   * @param {object} queryLog The query log data.
   */
  setupEventHandlers(containerId, queryLog) {
    // Query Summary has no interactive elements, so no event handlers needed
  }

  /**
   * Renders query summary information from system.query_log data.
   * @param {object} queryLog Query log data from system.query_log.
   * @returns {string} HTML representation of query summary.
   */
  renderQuerySummary(queryLog) {
    return this.render(queryLog); // Delegate to new simple interface
  }
}