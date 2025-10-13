/**
 * ClickHouse OpenTelemetry Tracing Module
 * Handles collection and rendering of OpenTelemetry trace data from ClickHouse system tables.
 */
export class ClickHouseProfilerOpenTelemetry {
  constructor() {
    // Module owns its data - profiler doesn't need to know about it
    this.data = null;
  }

  /**
   * Fetches OpenTelemetry tracing data from ClickHouse and stores it internally.
   * This is the new pull-based interface where the module owns its data fetching logic.
   * 
   * @param {ClickHouseClient} client - The ClickHouse client instance
   * @param {string} queryId - The unique query ID for filtering OpenTelemetry spans
   * @param {string} cleanedSql - The SQL query (unused)
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(client, queryId, cleanedSql, statusCallback = () => {}) {
    statusCallback('Fetching OpenTelemetry traces...');
    this.data = await this.collectOpenTelemetryTracing(client, queryId);
  }

  /**
   * Collects OpenTelemetry tracing data from ClickHouse system tables.
   * @param {object} client The ClickHouse client instance.
   * @param {string} queryId The query ID to look for in trace spans.
   * @returns {Promise<object>} OpenTelemetry span data from system.opentelemetry_span_log.
   */
  async collectOpenTelemetryTracing(client, queryId) {
    // Query for OpenTelemetry spans related to our query
    const spanQuery = `
      SELECT 
        trace_id,
        span_id,
        parent_span_id,
        operation_name,
        start_time_us,
        finish_time_us,
        (finish_time_us - start_time_us) * 1000 as duration_ns,
        attribute
      FROM system.opentelemetry_span_log 
      WHERE trace_id IN (
        SELECT trace_id 
        FROM system.opentelemetry_span_log 
        WHERE attribute['clickhouse.query_id'] = '${queryId}'
      )
      ORDER BY start_time_us ASC
      LIMIT 100
    `;

    try {
      const spanResult = await client.query({ 
        query: spanQuery, 
        format: 'JSONEachRow'
      });
      const spans = await spanResult.json();

      // No fallback - if we don't find our query, something is wrong
      if (spans.length === 0) {
        return {
          error: `No OpenTelemetry spans found for query_id '${queryId}'`,
          note: "This means either: 1) The query didn't generate traces, 2) opentelemetry_start_trace_probability setting failed, or 3) There's a timing issue with span logging",
          queryId: queryId,
        };
      }

      // Also get span overview without ARRAY JOIN to see span structure
      const spanOverviewQuery = `
        SELECT 
          trace_id,
          span_id,
          parent_span_id,
          operation_name,
          start_time_us,
          finish_time_us,
          (finish_time_us - start_time_us) * 1000 as duration_ns,
          length(mapKeys(attribute)) as num_attributes
        FROM system.opentelemetry_span_log 
        WHERE finish_time_us >= now() - INTERVAL 5 MINUTE
        ORDER BY start_time_us DESC
        LIMIT 50
      `;

      const overviewResult = await client.query({ 
        query: spanOverviewQuery, 
        format: 'JSONEachRow'
      });
      const overview = await overviewResult.json();

      return {
        spans: spans,
        overview: overview,
        queryId: queryId,
      };
    } catch (e) {
      // OpenTelemetry might not be enabled
      return {
        error: `OpenTelemetry not available: ${e.message}`,
        note: "OpenTelemetry tracing must be enabled in ClickHouse config (opentelemetry_span_log element)",
        spans: [],
        overview: []
      };
    }
  }

  /**
   * Simple interface: renders OpenTelemetry tracing data.
   * Module uses its internal data from fetchData().
   * @returns {string} HTML representation of OpenTelemetry traces.
   */
  render() {
    return this.renderOpenTelemetry(this.data || {});
  }

  /**
   * Simple interface: sets up event handlers for OpenTelemetry panel.
   * Module uses its internal data from fetchData().
   * @param {string} containerId The ID of the container element.
   */
  setupEventHandlers(containerId) {
    // OpenTelemetry panel embeds JavaScript in template literals for export functions
    // The event handlers are part of the rendered HTML and auto-initialize
    // No additional setup needed as exportToSpeedscope() and exportToJSON() are inline
  }

  /**
   * Renders OpenTelemetry tracing data with comprehensive trace analysis.
   * @param {object} data OpenTelemetry trace data.
   * @returns {string} HTML representation of OpenTelemetry traces.
   */
  renderOpenTelemetry(data) {
    // Known issue warning
    const warningBanner = `
      <div style="background: #3d2a00; border: 2px solid #ff9800; border-radius: 4px; padding: 12px; margin-bottom: 16px; color: #ffb74d;">
        <strong>⚠️ Known Issue:</strong> OpenTelemetry tracing may not be working properly due to HTTP client invocation.
        The HTTP interface might not properly propagate trace context to query execution.
      </div>
    `;

    if (data.error) {
      return warningBanner + `
        <div class="error-container">
          <h3>OpenTelemetry Traces Not Found</h3>
          <p><strong>Error:</strong> ${data.error}</p>
          <div class="config-help">
            <h4>Possible Solutions:</h4>
            <ul>
              <li>Check console logs for query execution details</li>
              <li>Verify opentelemetry_start_trace_probability setting is working</li>
              <li>Check if query actually executed successfully</li>
              <li>Wait a few seconds and try again (span logging delay)</li>
            </ul>
          </div>
        </div>
      `;
    }

    if (!data.overview || data.overview.length === 0) {
      return warningBanner + `
        <div class="no-data">
          <h3>No OpenTelemetry Spans Found</h3>
          <p>No recent tracing spans found in system.opentelemetry_span_log</p>
          <p>Run a query to generate trace data, or check if tracing is properly configured.</p>
        </div>
      `;
    }

    // Group spans by trace_id
    const traceGroups = {};
    data.overview.forEach(span => {
      if (!traceGroups[span.trace_id]) {
        traceGroups[span.trace_id] = [];
      }
      traceGroups[span.trace_id].push(span);
    });

    let html = `
      <div style="background: #3d2a00; border: 2px solid #ff9800; border-radius: 4px; padding: 12px; margin-bottom: 16px; color: #ffb74d;">
        <strong>⚠️ Known Issue:</strong> OpenTelemetry tracing may not be working properly due to HTTP client invocation.
        The HTTP interface might not properly propagate trace context to query execution.
      </div>
      <div class="opentelemetry-container">
        <h3>OpenTelemetry Traces for Query: ${data.queryId}</h3>
        <div class="query-summary">
          <p><strong>Query ID:</strong> <code>${data.queryId}</code></p>
          <p class="success">✅ Found ${data.overview.length} spans for this specific query</p>
          ${Object.keys(traceGroups).length > 1 ? 
            `<p class="warning">⚠️ Multiple traces found: ${Object.keys(traceGroups).length} separate traces</p>` : 
            `<p>Single trace with ${data.overview.length} spans</p>`
          }
        </div>
        
        <div class="timing-summary">
          <h4>⚡ Quick Timing Summary</h4>
          ${(() => {
            // Calculate simple metrics from all spans
            const allSpans = data.overview || [];
            if (allSpans.length === 0) return '<p>No timing data available</p>';
            
            const totalDuration = Math.max(...allSpans.map(s => s.finish_time_us)) - Math.min(...allSpans.map(s => s.start_time_us));
            const totalDurationMs = totalDuration / 1000;
            
            // Find key operations
            const executeSpan = allSpans.find(s => s.operation_name.includes('execute'));
            const analyzeSpan = allSpans.find(s => s.operation_name.includes('Analyzer'));
            
            return `
              <div class="quick-stats">
                <div class="stat"><span class="label">Total Execution:</span> <span class="value">${totalDurationMs.toFixed(2)}ms</span></div>
                ${executeSpan ? `<div class="stat"><span class="label">Execution Phase:</span> <span class="value">${((executeSpan.finish_time_us - executeSpan.start_time_us) / 1000).toFixed(2)}ms</span></div>` : ''}
                ${analyzeSpan ? `<div class="stat"><span class="label">Analysis Phase:</span> <span class="value">${((analyzeSpan.finish_time_us - analyzeSpan.start_time_us) / 1000).toFixed(2)}ms</span></div>` : ''}
                <div class="stat"><span class="label">Total Spans:</span> <span class="value">${allSpans.length}</span></div>
              </div>
            `;
          })()}
        </div>
        
        <div class="export-options">
          <button onclick="exportToSpeedscope('${data.queryId}')" class="export-btn">📊 Open in Speedscope</button>
          <button onclick="exportToJSON('${data.queryId}')" class="export-btn">💾 Export JSON</button>
          <small>Export trace data for external analysis tools</small>
        </div>
    `;

    Object.entries(traceGroups).forEach(([traceId, spans]) => {
      // Sort spans by start time
      spans.sort((a, b) => a.start_time_us - b.start_time_us);
      
      const minStartTime = Math.min(...spans.map(s => s.start_time_us));
      const maxFinishTime = Math.max(...spans.map(s => s.finish_time_us));
      const totalDuration = maxFinishTime - minStartTime;

      html += `
        <div class="trace-group">
          <h4>Trace: ${traceId.substring(0, 16)}...</h4>
          <div class="trace-info">
            Total Duration: ${(totalDuration / 1000).toFixed(2)}ms | Spans: ${spans.length}
          </div>
          <div class="spans-timeline">
      `;

      spans.forEach(span => {
        const relativeStart = ((span.start_time_us - minStartTime) / totalDuration) * 100;
        const spanDuration = ((span.finish_time_us - span.start_time_us) / totalDuration) * 100;
        const durationMs = (span.finish_time_us - span.start_time_us) / 1000;
        
        // Extract ClickHouse-specific attributes if available
        const attrs = span.attribute || {};
        const queryId = attrs['clickhouse.query_id'];
        const queryStatus = attrs['clickhouse.query_status'];
        const readRows = attrs['clickhouse.read_rows'];
        const memoryUsage = attrs['clickhouse.memory_usage'];
        const dbStatement = attrs['db.statement'];

        html += `
          <div class="span-bar" style="margin-left: ${relativeStart}%; width: ${Math.max(spanDuration, 2)}%">
            <div class="span-info">
              <strong>${span.operation_name}</strong><br>
              Duration: ${durationMs.toFixed(2)}ms<br>
              ${queryId ? `Query ID: ${queryId.substring(0, 8)}...` : `Span ID: ${span.span_id.toString().substring(0, 8)}...`}<br>
              ${span.parent_span_id ? `Parent: ${span.parent_span_id.toString().substring(0, 8)}...` : 'Root span'}<br>
              ${queryStatus ? `Status: ${queryStatus}` : ''}
              ${readRows ? `<br>Rows: ${readRows}` : ''}
              ${memoryUsage ? `<br>Memory: ${(parseInt(memoryUsage) / 1024).toFixed(0)}KB` : ''}
              ${dbStatement && dbStatement.length < 50 ? `<br>SQL: ${dbStatement}` : ''}
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    html += `
      </div>
      <style>
        .opentelemetry-container {
          font-family: monospace;
          margin: 10px;
        }
        .query-summary {
          background: #2a2a2a;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
          border-left: 3px solid #4CAF50;
        }
        .query-summary .warning {
          color: #ff9800;
          font-weight: bold;
        }
        .query-summary .success {
          color: #4CAF50;
          font-weight: bold;
        }
        .timing-summary {
          background: #1a1a1a;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin: 10px 0;
        }
        .stat {
          display: flex;
          justify-content: space-between;
          padding: 5px 10px;
          background: #333;
          border-radius: 3px;
        }
        .stat .label {
          color: #888;
        }
        .stat .value {
          color: #4CAF50;
          font-weight: bold;
        }
        .export-options {
          margin: 15px 0;
          padding: 10px;
          background: #2a2a2a;
          border-radius: 4px;
          text-align: center;
        }
        .export-btn {
          background: #0066cc;
          color: white;
          border: none;
          padding: 8px 15px;
          margin: 0 5px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        }
        .export-btn:hover {
          background: #0088ff;
        }
        .trace-group {
          margin: 20px 0;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 10px;
          background: #1a1a1a;
        }
        .trace-info {
          color: #888;
          margin: 5px 0;
          font-size: 12px;
        }
        .spans-timeline {
          position: relative;
          height: auto;
          margin: 10px 0;
          background: #2a2a2a;
          border-radius: 3px;
          padding: 5px;
        }
        .span-bar {
          position: relative;
          height: 60px;
          background: linear-gradient(90deg, #0066cc, #0088ff);
          margin: 2px 0;
          border-radius: 2px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .span-bar:hover {
          opacity: 0.8;
        }
        .span-info {
          position: absolute;
          top: 2px;
          left: 4px;
          font-size: 10px;
          color: white;
          line-height: 1.2;
          pointer-events: none;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .error-container, .no-data {
          padding: 20px;
          margin: 10px;
          background: #2a2a2a;
          border-radius: 4px;
          color: #ccc;
        }
        .config-help {
          margin-top: 15px;
          padding: 10px;
          background: #1a1a1a;
          border-radius: 3px;
        }
        .config-help pre {
          background: #333;
          padding: 10px;
          border-radius: 3px;
          overflow-x: auto;
          font-size: 11px;
        }
      </style>
      
      <script>
        function exportToSpeedscope(queryId) {
          // Convert OpenTelemetry spans to Speedscope format
          const spans = ${JSON.stringify(data.overview || [])};
          const speedscopeData = {
            version: "0.0.1",
            shared: { frames: [] },
            profiles: [{
              type: "evented",
              name: "ClickHouse Query: " + queryId,
              unit: "microseconds", 
              startValue: Math.min(...spans.map(s => s.start_time_us)),
              endValue: Math.max(...spans.map(s => s.finish_time_us)),
              events: spans.flatMap(span => [
                { type: "O", frame: span.operation_name, at: span.start_time_us },
                { type: "C", frame: span.operation_name, at: span.finish_time_us }
              ])
            }]
          };
          
          // Create downloadable file
          const blob = new Blob([JSON.stringify(speedscopeData, null, 2)], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'clickhouse-trace-' + queryId + '.speedscope.json';
          a.click();
          URL.revokeObjectURL(url);
          
          alert('Exported! Open the file at https://speedscope.app');
        }
        
        function exportToJSON(queryId) {
          const data = ${JSON.stringify(data, null, 2)};
          const blob = new Blob([data], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'clickhouse-otel-' + queryId + '.json';
          a.click();
          URL.revokeObjectURL(url);
        }
      </script>
    `;

    return html;
  }
}