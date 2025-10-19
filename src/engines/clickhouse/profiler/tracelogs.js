/**
 * ClickHouse Trace Logs Module
 * Handles processing and rendering of server text logs from system.text_log.
 */
export class ClickHouseProfilerTraceLogs {
  constructor() {
    // Module owns its data - profiler doesn't need to know about it
    this.data = null;
  }

  /**
   * Fetches server text log data from ClickHouse and stores it internally.
   * This is the new pull-based interface where the module owns its data fetching logic.
   * 
   * @param {ClickHouseClient} client - The ClickHouse client instance
   * @param {string} queryId - The unique query ID for filtering text_log
   * @param {string} cleanedSql - The SQL query (unused)
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(client, queryId, cleanedSql, statusCallback = () => {}) {
    statusCallback('Fetching server text logs...');
    
    try {
      const serverLogQuery = `SELECT event_time_microseconds, logger_name as source, thread_name, thread_id, level, message FROM system.text_log WHERE query_id = '${queryId}' ORDER BY event_time_microseconds`;
      const serverLogResultSet = await client.query({ query: serverLogQuery, format: 'JSONEachRow' });
      const serverLogData = await serverLogResultSet.json();
      
      if (serverLogData.length > 0) {
        this.data = serverLogData;
      } else {
        this.data = [];
      }
    } catch (e) {
      console.error('[TraceLogs] Error fetching text log:', e.message);
      this.data = [];
    }
  }

  /**
   * Gets a color class based on percentage of total execution time.
   * @param {number} percent Percentage of total time spent.
   * @returns {string} CSS class name for color coding.
   */
  getPercentColorClass(percent) {
    if (percent >= 50) return 'time-hot';
    if (percent >= 5) return 'time-warm';
    return 'time-good';
  }

  /**
   * Gets a color based on log level for visual distinction.
   * @param {string} level Log level (Error, Warning, Information, etc.).
   * @returns {string} Hex color code for the level.
   */
  getLevelColor(level) {
    switch (level) {
      case 'Error': return '#ff8080'; // Red
      case 'Warning': return '#ffc980'; // Orange
      case 'Information': return '#80ff80'; // Green
      case 'Debug': return '#80bfff'; // Blue
      case 'Trace': return '#b3b3b3'; // Gray
      default: return '#eee'; // Default text color
    }
  }

  /**
   * Generates a consistent HSL color from a string for source identification.
   * @param {string} str String to generate color from.
   * @param {number} s Saturation percentage (default 75%).
   * @param {number} l Lightness percentage (default 55%).
   * @returns {string} HSL color string.
   */
  stringToHslColor(str, s = 75, l = 55) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  /**
   * Generates a distinct color for thread IDs with proximity adjustment for close numbers.
   * Uses the original hash approach but adds differentiation for similar thread IDs.
   * @param {string|number} threadId Thread ID to generate color from.
   * @returns {string} HSL color string optimized for thread identification.
   */
  getThreadIdColor(threadId) {
    const id = parseInt(threadId.toString(), 10) || 0;
    
    // Base hash (for primary color component)
    let hash = 0;
    const str = threadId.toString();
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Primary hue from hash
    const baseHue = Math.abs(hash) % 360;
    
    // Proximity adjustment: use last digits to differentiate close numbers
    // For 777 vs 770, this will give different adjustments
    const proximityAdjust = (id % 100) * 3.6; // 0-99 maps to 0-356 degrees
    
    // Combine base hue with proximity adjustment
    const finalHue = (baseHue + proximityAdjust) % 360;
    
    // Keep original saturation and lightness - simple and readable
    return `hsl(${finalHue}, 75%, 55%)`;
  }

  /**
   * Processes server text logs to add duration calculations between log entries.
   * @param {Array} serverTextLog Array of log entries from system.text_log.
   * @returns {Array} Log entries with added durationMs property.
   */
  processLogsWithDuration(serverTextLog) {
    return serverTextLog.map((log, i, arr) => {
      let durationMs = 0;
      if (i < arr.length - 1) {
        // The timestamp string needs to be parsed correctly.
        const currentTime = new Date(arr[i].event_time_microseconds.replace(' ', 'T') + 'Z').getTime();
        const nextTime = new Date(arr[i + 1].event_time_microseconds.replace(' ', 'T') + 'Z').getTime();
        durationMs = nextTime - currentTime;
      }
      return { ...log, durationMs };
    });
  }

  /**
   * Simple interface: renders server text logs as an interactive table with timing analysis.
   * Module uses its internal data from fetchData().
   * @returns {string} HTML representation of server trace logs.
   */
  render() {
    const serverTextLog = this.data;
    if (!serverTextLog || serverTextLog.length === 0) {
      return '<p>No server text logs were found. This may be disabled by the server configuration.</p>';
    }

    let content = '<table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 12px;">';
    content += '<thead><tr style="text-align: left; border-bottom: 1px solid #777;"><th>Timestamp</th><th>Time Taken</th><th>Source</th><th>Thread(ID)</th><th>Level</th><th>Message</th></tr></thead>';
    content += '<tbody>';

    // Process logs to calculate durations
    const logsWithDuration = this.processLogsWithDuration(serverTextLog);
    
    // Calculate total duration after computing all individual durations
    const totalDurationMs = logsWithDuration.reduce((sum, log) => sum + log.durationMs, 0);

    for (const log of logsWithDuration) {
      const percentOfTotal = totalDurationMs > 0 ? (log.durationMs / totalDurationMs) * 100 : 0;
      const colorClass = this.getPercentColorClass(percentOfTotal);

      content += `<tr style="border-bottom: 1px solid #444; padding: 3px 0;">
                    <td style="white-space: nowrap;">${log.event_time_microseconds}</td>
                    <td class="${colorClass}" style="white-space: nowrap; text-align: right; padding-right: 10px;">${log.durationMs.toFixed(2)}ms (${percentOfTotal.toFixed(1)}%)</td>
                    <td style="color: ${this.stringToHslColor(log.source)}; font-weight: bold;">${log.source}</td>
                    <td style="white-space: nowrap;">${log.thread_name}(<span style="color: ${this.getThreadIdColor(log.thread_id)}; font-weight: bold;">${log.thread_id}</span>)</td>
                    <td style="color: ${this.getLevelColor(log.level)}; font-weight: bold;">${log.level}</td>
                    <td style="white-space: pre-wrap;">${log.message}</td>
                  </tr>`;
    }
    content += '</tbody></table>';

    return content;
  }

  /**
   * Simple interface: sets up event handlers for trace logs panel.
   * @param {string} containerId The ID of the container element.
   * @param {Array} serverTextLog Array of log entries (not used for static table display).
   */
  setupEventHandlers(containerId, serverTextLog) {
    // Trace logs uses static table display, no additional JS handlers needed
  }

  /**
   * Legacy interface: delegates to render() for backward compatibility.
   * @param {Array} serverTextLog Array of log entries from system.text_log.
   * @returns {string} HTML representation of server trace logs.
   */
  renderTraceLogs(serverTextLog) {
    return this.render(serverTextLog);
  }
}