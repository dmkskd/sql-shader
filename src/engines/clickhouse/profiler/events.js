/**
 * ClickHouse Profile Events Module
 * Handles categorization and rendering of ProfileEvents from system.query_log.
 */
export class ClickHouseProfilerEvents {
  constructor() {
    // No dependencies needed for this module
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
   * Renders ProfileEvents data as categorized, collapsible tables.
   * @param {object} queryLog Query log data containing ProfileEvents.
   * @returns {string} HTML representation of categorized profile events.
   */
  renderEvents(queryLog) {
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
}