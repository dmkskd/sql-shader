/**
 * ClickHouse Profile Events Module
 * Handles categorization and rendering of ProfileEvents from system.query_log.
 */
export class ClickHouseProfilerEvents {
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
    statusCallback('Fetching profile events...');
    
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
      console.error('[Events] Error fetching query log:', e.message);
      this.data = { error: e.message };
    }
  }

  /**
   * Categorizes a profile event name into logical groups.
   * @param {string} eventName The name of the profile event.
   * @returns {string} The category name for the event.
   */
  getEventCategory(eventName) {
    if (eventName.includes('Time') || eventName.endsWith('Microseconds') || eventName.endsWith('Nanoseconds')) return 'Time & Duration';
    if (eventName.includes('CPU') || eventName.includes('Profiler')) return 'CPU & Profiling';
    if (eventName.includes('Read') || eventName.includes('Write') || eventName.includes('Network') || eventName.includes('IO') || eventName.includes('File')) return 'I/O & Network';
    if (eventName.includes('Memory') || eventName.includes('Alloc') || eventName.includes('Bytes')) return 'Memory & Data Transfer';
    if (eventName.includes('Lock') || eventName.includes('Concurrency') || eventName.includes('ThreadPool')) return 'Concurrency & Locking';
    if (eventName.includes('Function') || eventName.includes('Expression') || eventName.includes('Join') || eventName.includes('Sort')) return 'Execution & Functions';
    if (eventName.includes('Query') || eventName.includes('Select') || eventName.includes('Initial')) return 'Query Lifecycle';
    return 'Other';
  }

  /**
   * Simple interface: renders ProfileEvents data as categorized, collapsible tables.
   * Module uses its internal data from fetchData().
   * @returns {string} HTML representation of categorized profile events.
   */
  render() {
    const queryLog = this.data;
    if (!queryLog || !queryLog.ProfileEvents) {
      return '<p>No ProfileEvents data found in the query log.</p>';
    }

    const categorizedEvents = new Map();
    for (const [eventName, count] of Object.entries(queryLog.ProfileEvents)) {
      const category = this.getEventCategory(eventName);
      if (!categorizedEvents.has(category)) {
        categorizedEvents.set(category, []);
      }
      categorizedEvents.get(category).push({ name: eventName, count });
    }

    // Sort categories for a consistent order.
    const sortedCategories = Array.from(categorizedEvents.keys()).sort();

    let eventsContent = '';
    for (const category of sortedCategories) {
      const events = categorizedEvents.get(category);
      // Sort events within each category by count, descending.
      events.sort((a, b) => b.count - a.count);

      eventsContent += `<details open style="margin-bottom: 10px;">
                          <summary style="font-weight: bold; cursor: pointer; font-size: 1.1em;">${category} (${events.length})</summary>
                          <table style="width: 100%; max-width: 800px; border-collapse: collapse; font-family: monospace; font-size: 12px; margin-left: 20px;">
                            <thead><tr style="text-align: left; border-bottom: 1px solid #777;"><th>Event Name</th><th style="text-align: right;">Count</th></tr></thead>
                            <tbody>`;

      for (const { name, count } of events) {
        eventsContent += `<tr style="border-bottom: 1px solid #444; padding: 3px 0;">
                            <td>${name}</td>
                            <td style="text-align: right;">${count.toLocaleString()}</td>
                          </tr>`;
      }
      eventsContent += `    </tbody>
                          </table>
                        </details>`;
    }

    return eventsContent;
  }

  /**
   * Simple interface: sets up event handlers for events panel.
   * @param {string} containerId The ID of the container element.
   * @param {object} queryLog Query log data (not used for static events display).
   */
  setupEventHandlers(containerId, queryLog) {
    // Events panel uses native HTML details elements, no additional JS handlers needed
  }

  /**
   * Legacy interface: delegates to render() for backward compatibility.
   * @param {object} queryLog Query log data containing ProfileEvents.
   * @returns {string} HTML representation of categorized profile events.
   */
  renderEvents(queryLog) {
    return this.render(queryLog);
  }
}