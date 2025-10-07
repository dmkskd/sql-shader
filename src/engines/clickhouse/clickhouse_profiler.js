import mermaid from 'mermaid';
import * as d3 from 'd3';
// Use a namespace import to robustly handle this non-standard module.
import * as d3_flame_graph from 'd3-flame-graph';
import { makeTable } from '@apache/arrow';
import { ClickHouseProfilerFlamegraph } from './profiler/flamegraph.js';
import { ClickHouseProfilerCallGraph } from './profiler/callgraph.js';
import { ClickHouseProfilerPipelineGraph } from './profiler/pipeline.js';

export class ClickHouseProfiler {
  constructor(engine) {
    this.engine = engine;
    this.client = engine.client; // Keep a direct reference to the client for commands
    this.flamegraph = new ClickHouseProfilerFlamegraph();
    this.callgraph = new ClickHouseProfilerCallGraph(this.flamegraph);
    this.pipeline = new ClickHouseProfilerPipelineGraph();
  }

  /**
   * Runs the query with profiling enabled and collects various performance metrics.
   * @param {string} sql The raw SQL of the shader to profile.
   * @param {Array<any>} params The parameters for the query.
   * @param {function(string): void} [statusCallback=(() => {})] Optional callback to report progress.
   * @returns {Promise<object>} A data object containing plans, logs, and traces.
   */
  async profile(sql, params, statusCallback = () => {}) {
    // Use the provided status callback, or a no-op function if none is given.
    statusCallback('Profiling...'); // Initial message
    const cleanedSql = sql.replace(/{[^}]+}/g, '1');
    // Try using a standard UUID format instead of custom query_id
    const queryId = `${crypto.randomUUID()}`;
    let profileData = {};

    // 1. Get EXPLAIN PIPELINE graph
    statusCallback('Profiling: Pipeline...');
    try {
      const graphSql = `EXPLAIN PIPELINE graph = 1 ${cleanedSql}`;
      const graphResultSet = await this.client.query({ query: graphSql, format: 'JSONEachRow' });
      const graphRows = await graphResultSet.json();
      profileData.pipelineGraph = graphRows.map(row => row.explain).join('\n');
    } catch (e) {
      profileData.pipelineGraph = `Error: ${e.message}`;
    }

    // 2. Get EXPLAIN actions, indexes
    statusCallback('Profiling: Actions...');
    try {
      const actionsSql = `EXPLAIN actions = 1, indexes = 1 ${cleanedSql}`;
      const actionsResultSet = await this.client.query({ query: actionsSql, format: 'JSONEachRow' });
      const actionsRows = await actionsResultSet.json();
      profileData.actionsPlan = actionsRows.map(row => row.explain).join('\n');
    } catch (e) {
      profileData.actionsPlan = `Error: ${e.message}`;
    }

    // 3. OpenTelemetry data will be collected after query execution

    // 4. Execute the actual query and fetch logs
    let finalSql = sql
      .replace('{width:UInt32}', params[0])
      .replace('{height:UInt32}', params[1])
      .replace('{iTime:Float64}', params[2])
      .replace('{mx:Float64}', params[3])
      .replace('{my:Float64}', params[4]);

    // No need to append SETTINGS - OpenTelemetry is configured at client level

    statusCallback('Profiling: Executing...');

    try {
      // Execute the shader query - OpenTelemetry is configured at client level
      await this.client.exec({
        query: finalSql,
        query_id: queryId,
        clickhouse_settings: {
          // This setting must be a string "1.0" to be correctly interpreted by the server via HTTP.
          opentelemetry_start_trace_probability: '1.0',
          log_queries: 1,
        }
      });
    } catch (e) {
      // If the query fails, we might still have received logs before the error.
      if (e.response && e.response.logs) {
        profileData.serverTextLog = e.response.logs;
      }
    }

    // Force ClickHouse to flush its log buffers to the system tables.
    // This is more reliable than waiting with a timeout and ensures the logs are available.
    const storedSettings = JSON.parse(localStorage.getItem('pixelql.clickhouse-settings')) || {};
    const waitDuration = parseInt(storedSettings.logFlushWait || '1500', 10);
    statusCallback(`Profiling: Flushing logs (waiting ${waitDuration}ms)...`);
    try {
      await this.client.command({ query: 'SYSTEM FLUSH LOGS' });
      await new Promise(resolve => setTimeout(resolve, waitDuration));
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Use a slightly longer fallback timeout
    }

    // 4. Poll for both query_log and trace_log entries in a single loop.
    // This is more robust against race conditions where one log flushes before the other.
    statusCallback('Profiling: Polling...');
    const maxRetries = 8;
    const retryDelay = 250; // ms

    try {
      for (let i = 0; i < maxRetries; i++) {
        // Attempt to fetch query_log if we don't have it yet
        if (!profileData.queryLog) {
          const queryLogQuery = `SELECT * FROM system.query_log WHERE query_id = '${queryId}' AND type = 'QueryFinish' LIMIT 1`;
          const queryLogResultSet = await this.client.query({ query: queryLogQuery, format: 'JSONEachRow' });
          const queryLogData = await queryLogResultSet.json();
          if (queryLogData.length > 0) {
            profileData.queryLog = queryLogData[0];
          }
        }

        // Attempt to fetch trace_log if we don't have it yet
        if (!profileData.traceLog || profileData.traceLog.length === 0) {
          const traceQuery = `
            SELECT arrayStringConcat(arrayMap(x -> demangle(addressToSymbol(x)), trace), ';') AS stack, count() AS value
            FROM system.trace_log
            WHERE query_id = '${queryId}' AND trace_type = 'CPU'
            GROUP BY trace
          `;
          const traceResultSet = await this.client.query({
            query: traceQuery, format: 'JSONEachRow', clickhouse_settings: { allow_introspection_functions: 1 }
          });
          const resolvedTraces = await traceResultSet.json();
          if (resolvedTraces.length > 0) {
            profileData.traceLog = resolvedTraces.map(row => ({ trace: row.stack.split(';'), value: row.value }));
          }
        }

        // Attempt to fetch server logs from system.text_log if we don't have them yet
        if (!profileData.serverTextLog || profileData.serverTextLog.length === 0) {
          const serverLogQuery = `SELECT event_time_microseconds, logger_name as source, thread_name, thread_id, level, message FROM system.text_log WHERE query_id = '${queryId}' ORDER BY event_time_microseconds`;
          const serverLogResultSet = await this.client.query({ query: serverLogQuery, format: 'JSONEachRow' });
          const serverLogData = await serverLogResultSet.json();
          if (serverLogData.length > 0) {
            profileData.serverTextLog = serverLogData;
          }
        }

        // If we have all the data we need, we can stop waiting
        // We no longer poll for query_thread_log.
        const hasQueryLog = !!profileData.queryLog;
        const hasTraceLog = profileData.traceLog && profileData.traceLog.length > 0;
        if (hasQueryLog && hasTraceLog) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    } catch (e) {
      // Errors during polling are not fatal, as some logs might be missing.
    }

    // 5. Collect OpenTelemetry tracing data AFTER query execution
    statusCallback('Profiling: OpenTelemetry...');
    try {
      profileData.openTelemetry = await this.collectOpenTelemetryTracing(queryId);
    } catch (e) {
      profileData.openTelemetry = { 
        error: `OpenTelemetry collection failed: ${e.message}`,
        note: "OpenTelemetry tracing may not be enabled in ClickHouse configuration"
      };
    }
    return profileData;
  }

  /**
   * Collects OpenTelemetry tracing data from ClickHouse system tables.
   * @param {string} queryId The query ID to look for in trace spans.
   * @returns {Promise<object>} OpenTelemetry span data from system.opentelemetry_span_log.
   */
  async collectOpenTelemetryTracing(queryId) {
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
      const spanResult = await this.client.query({ 
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

      const overviewResult = await this.client.query({ 
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
   * Returns empty recommendations - we don't pretend to optimize ClickHouse.
   */
  generateQueryPerformanceRecommendations(totalMs, jitMs, memoryMB) {
    return [];
  }

  /**
   * Renders OpenTelemetry tracing information as interactive timeline.
   * @param {object} data OpenTelemetry tracing data.
   * @returns {string} HTML representation of OpenTelemetry traces.
   */
  renderOpenTelemetry(data) {
    if (data.error) {
      return `
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
      return `
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

  /**
   * Renders the multi-faceted profile data into the modal.
   * @param {object} profileData The data object from the profile() method.
   * @param {HTMLElement} mainContainer The single container element for the profiler UI.
   * @returns {Promise<void>}
   */
  async renderProfile(profileData, mainContainer) {


    // --- Tab 2: Structured Plan ---
    // The parsed, collapsible, and highlighted version of the actions plan
    const planText = profileData.actionsPlan || 'No data.';
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

    // --- Tab 3: Query Summary (from system.query_log) ---
    let querySummaryContent;
    if (profileData.queryLog && !profileData.queryLog.error) {
      querySummaryContent = `<p><strong>Server-Side Execution Time:</strong> ${profileData.queryLog.query_duration_ms.toLocaleString()} ms</p>
                             <p><strong>Peak Memory Usage:</strong> ${(profileData.queryLog.memory_usage / 1024 / 1024).toFixed(2)} MB</p>
                             <p><strong>Rows Read:</strong> ${profileData.queryLog.read_rows.toLocaleString()}</p>
                             <p><strong>Bytes Read:</strong> ${(profileData.queryLog.read_bytes / 1024 / 1024).toFixed(2)} MB</p>`;
    } else {
      querySummaryContent = `<p>No query log data found. Ensure query logging is enabled on your server.</p>`;
      if (profileData.queryLog && profileData.queryLog.error) {
        querySummaryContent += `<pre>${JSON.stringify(profileData.queryLog, null, 2)}</pre>`;
      }
    }

    // --- Tab 5: Profile Events (from system.query_log) ---
    let eventsContent;
    if (profileData.queryLog && profileData.queryLog.ProfileEvents) {
      // Helper function to categorize events for better organization.
      const getEventCategory = (eventName) => {
        if (eventName.includes('Time') || eventName.endsWith('Microseconds') || eventName.endsWith('Nanoseconds')) return 'Time & Duration';
        if (eventName.includes('CPU') || eventName.includes('Profiler')) return 'CPU & Profiling';
        if (eventName.includes('Read') || eventName.includes('Write') || eventName.includes('Network') || eventName.includes('IO') || eventName.includes('File')) return 'I/O & Network';
        if (eventName.includes('Memory') || eventName.includes('Alloc') || eventName.includes('Bytes')) return 'Memory & Data Transfer';
        if (eventName.includes('Lock') || eventName.includes('Concurrency') || eventName.includes('ThreadPool')) return 'Concurrency & Locking';
        if (eventName.includes('Function') || eventName.includes('Expression') || eventName.includes('Join') || eventName.includes('Sort')) return 'Execution & Functions';
        if (eventName.includes('Query') || eventName.includes('Select') || eventName.includes('Initial')) return 'Query Lifecycle';
        return 'Other';
      };

      const categorizedEvents = new Map();
      for (const [eventName, count] of Object.entries(profileData.queryLog.ProfileEvents)) {
        const category = getEventCategory(eventName);
        if (!categorizedEvents.has(category)) {
          categorizedEvents.set(category, []);
        }
        categorizedEvents.get(category).push({ name: eventName, count });
      }

      // Sort categories for a consistent order.
      const sortedCategories = Array.from(categorizedEvents.keys()).sort();

      eventsContent = '';
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
    } else {
      eventsContent = '<p>No ProfileEvents data found in the query log.</p>';
    }

    // --- Tab 4: Pipeline Plan (from EXPLAIN PIPELINE) ---
    let pipelinePlanContent;
    if (profileData.pipelineGraph && profileData.pipelineGraph.trim().startsWith('digraph')) {
      const mermaidGraph = this.pipeline.dotToMermaid(profileData.pipelineGraph);
      // We render the graph inside the post-render logic to attach event listeners.
      // For now, we just prepare the content.
      pipelinePlanContent = '';
    } else {
      pipelinePlanContent = `<p>Could not generate graph.</p><pre>${profileData.pipelineGraph || 'No data.'}</pre>`;
    }

    // --- Tab 6: Server Trace Log (from send_logs_level='trace') ---
    let serverTextLogContent;
    if (profileData.serverTextLog && profileData.serverTextLog.length > 0) {
      serverTextLogContent = '<table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 12px;">';
      serverTextLogContent += '<thead><tr style="text-align: left; border-bottom: 1px solid #777;"><th>Timestamp</th><th>Time Taken</th><th>Source</th><th>Thread</th><th>Level</th><th>Message</th></tr></thead>';
      serverTextLogContent += '<tbody>';

      // --- Pre-process logs to calculate durations ---
      let totalDurationMs = 0;
      const logsWithDuration = profileData.serverTextLog.map((log, i, arr) => {
        let durationMs = 0;
        if (i < arr.length - 1) {
          // The timestamp string needs to be parsed correctly.
          const currentTime = new Date(arr[i].event_time_microseconds.replace(' ', 'T') + 'Z').getTime();
          const nextTime = new Date(arr[i + 1].event_time_microseconds.replace(' ', 'T') + 'Z').getTime();
          durationMs = nextTime - currentTime;
        }
        return { ...log, durationMs };
      });

      // Calculate total duration after computing all individual durations
      totalDurationMs = logsWithDuration.reduce((sum, log) => sum + log.durationMs, 0);

      // Helper function to get a color class based on percentage of total time
      const getPercentColorClass = (percent) => {
        if (percent >= 50) return 'time-hot';
        if (percent >= 5) return 'time-warm';
        return 'time-good';
      };

      // Helper function to get a color based on log level
      const getLevelColor = (level) => {
        switch (level) {
          case 'Error': return '#ff8080'; // Red
          case 'Warning': return '#ffc980'; // Orange
          case 'Information': return '#80ff80'; // Green
          case 'Debug': return '#80bfff'; // Blue
          case 'Trace': return '#b3b3b3'; // Gray
          default: return '#eee'; // Default text color
        }
      };

      // Helper function to generate a consistent color from a string (for the source)
      const stringToHslColor = (str, s = 75, l = 55) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = hash % 360;
        return `hsl(${h}, ${s}%, ${l}%)`;
      };

      for (const log of logsWithDuration) {
        const percentOfTotal = totalDurationMs > 0 ? (log.durationMs / totalDurationMs) * 100 : 0;
        const colorClass = getPercentColorClass(percentOfTotal);

        serverTextLogContent += `<tr style="border-bottom: 1px solid #444; padding: 3px 0;">
                                    <td style="white-space: nowrap;">${log.event_time_microseconds}</td>
                                    <td class="${colorClass}" style="white-space: nowrap; text-align: right; padding-right: 10px;">${log.durationMs.toFixed(2)}ms (${percentOfTotal.toFixed(1)}%)</td>
                                    <td style="color: ${stringToHslColor(log.source)}; font-weight: bold;">${log.source}</td>
                                    <td style="white-space: nowrap;">${log.thread_name}(${log.thread_id})</td>
                                    <td style="color: ${getLevelColor(log.level)}; font-weight: bold;">${log.level}</td>
                                    <td style="white-space: pre-wrap;">${log.message}</td>
                                  </tr>`;
      }
      serverTextLogContent += '</tbody></table>';
    } else {
      serverTextLogContent = '<p>No server text logs were found. This may be disabled by the server configuration.</p>';
    }

    // --- Tab for Explain Plan (Raw + Structured) ---
    const explainPlanContent = `
      <div class="inner-tabs">
        <button class="inner-tab active" data-inner-tab="raw-explain">Raw</button>
        <button class="inner-tab" data-inner-tab="structured-explain">Structured</button>
      </div>
      <div id="inner-content-raw-explain" class="inner-tab-content active">
        <pre>${profileData.actionsPlan || 'No data.'}</pre>
      </div>
      <div id="inner-content-structured-explain" class="inner-tab-content">
        <div class="graph-controls" data-for-tab="structured-plan">
          <button id="ch-expand-all-button" title="Expand All Nodes">Expand All</button>
          <button id="ch-collapse-all-button" title="Collapse All Nodes">Collapse All</button>
        </div>
        <div class="tab-inner-content">
          <pre>${formattedHtml}</pre>
        </div>
      </div>
    `;

    // --- Dynamically build the HTML for the profiler ---
    const tabsConfig = [
      { id: 'query-summary', title: 'Query Summary', content: querySummaryContent, header: `Generated via: <code>SELECT * FROM system.query_log WHERE query_id = '...'</code>` },
      { id: 'trace-log', title: 'Trace Log', content: serverTextLogContent, header: `Generated via: <code>SELECT ... FROM system.text_log WHERE query_id = '...'</code>` },
      { id: 'events', title: 'Events', content: eventsContent, header: 'Performance counters from <code>system.query_log.ProfileEvents</code>' },
      { id: 'explain-plan', title: 'Explain Plan', content: explainPlanContent, header: 'Generated via: <code>EXPLAIN actions = 1, indexes = 1</code>'},
      { id: 'pipeline-plan', title: 'Explain Pipeline', content: pipelinePlanContent, header: 'Generated via: <code>EXPLAIN PIPELINE graph = 1</code>' },
      { id: 'flamegraph', title: 'FlameGraph', content: '', header: 'Generated via: <code>SELECT ... FROM system.trace_log</code>' },
      { id: 'call-graph', title: 'Call Graph', content: '', header: 'Aggregated view of all function calls. Each function appears once, with its value representing total time spent.' },
      { id: 'opentelemetry', title: 'OpenTelemetry', content: this.renderOpenTelemetry(profileData.openTelemetry || {}), header: 'Distributed tracing spans from system.opentelemetry_span_log' },
    ];

    let tabsHtml = '<div class="profiler-tabs">';
    let contentHtml = '';

    tabsConfig.forEach((tab, index) => {
      const activeClass = index === 0 ? 'active' : '';
      tabsHtml += `<button class="profiler-tab ${activeClass}" data-tab="${tab.id}">${tab.title}</button>`;
      contentHtml += `<div id="profile-content-${tab.id}" class="profiler-tab-content ${activeClass}">
                        <h3>${tab.title}</h3>
                        <p>${tab.header}</p>`;
      if (tab.id === 'pipeline-plan') {
        contentHtml += `<div class="graph-controls" style="display: none;" data-for-tab="pipeline-plan">
                          <button id="ch-zoom-in-button" title="Zoom In">+</button>
                          <button id="ch-zoom-out-button" title="Zoom Out">-</button>
                          <button id="ch-zoom-reset-button" title="Reset Zoom">1:1</button>
                       </div>`;
      }
      if (tab.id === 'flamegraph') {
        contentHtml += `<div class="graph-controls" style="display: none;" data-for-tab="flamegraph">
                          <label for="ch-flamegraph-group-by">Group By: </label>
                          <select id="ch-flamegraph-group-by">
                            <option value="none" selected>None</option>
                            <option value="method">Method Name</option>
                            <option value="class">By Class</option>
                            <option value="system">By System</option>
                          </select>
                          <span style="font-size: 0.8em; color: #ffc980;"> (Experimental)</span>
                          <div class="export-buttons" style="margin-left: 20px;">
                            <button id="ch-speedscope-export-button" class="export-btn" title="Open CPU trace in Speedscope">Open in Speedscope</button>
                            <button id="ch-perfetto-export-button" class="export-btn" title="Perfetto integration is temporarily disabled as it's not working." disabled style="background-color: #555; cursor: not-allowed;">Open in Perfetto</button>
                          </div>
                       </div>`;
      }
      if (tab.id === 'call-graph') {
        contentHtml += `<div class="graph-controls" style="display: none;" data-for-tab="call-graph">
                          <button id="cg-zoom-in-button" title="Zoom In">+</button>
                          <button id="cg-zoom-out-button" title="Zoom Out">-</button>
                          <button id="cg-zoom-reset-button" title="Reset Zoom">1:1</button>
                          <button id="cg-switch-direction-button" title="Switch Graph Direction">Switch Direction</button>
                       </div>`;
      }
      contentHtml += `  <div class="tab-inner-content">${tab.content || ''}</div>
                      </div>`;
    });
    tabsHtml += '</div>';

    mainContainer.innerHTML = tabsHtml + contentHtml;

    // --- Post-render logic for dynamic content ---

    // Re-attach tab switching logic
    const profilerTabs = mainContainer.querySelectorAll('.profiler-tab');
    const profilerTabContents = mainContainer.querySelectorAll('.profiler-tab-content');
    profilerTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        profilerTabs.forEach(t => t.classList.remove('active'));
        profilerTabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const contentId = `#profile-content-${tab.dataset.tab}`;
        const activeContent = mainContainer.querySelector(contentId);
        activeContent.classList.add('active');

        // Show/hide the graph controls based on the active tab
        mainContainer.querySelectorAll('.graph-controls').forEach(controls => {
            const isForActiveTab = controls.dataset.forTab === tab.dataset.tab;
            controls.style.display = isForActiveTab ? 'flex' : 'none';
        });

      });
    });

    // On-demand rendering for the flame graph
    if (profileData.traceLog && profileData.traceLog.length > 0) {
      const flamegraphTab = mainContainer.querySelector('.profiler-tab[data-tab="flamegraph"]');
      const flamegraphContainer = mainContainer.querySelector('#profile-content-flamegraph .tab-inner-content');

      const renderFlamegraphOnFirstClick = () => {
        requestAnimationFrame(() => {
          console.log(`[Debug] Rendering ClickHouse flame graph in container with width: ${flamegraphContainer.clientWidth}px`);
          this.flamegraph.renderFlamegraph(profileData.traceLog, flamegraphContainer, 'none');
          // Set up the grouping dropdown listener
          const groupBySelect = mainContainer.querySelector('#ch-flamegraph-group-by');
          groupBySelect.addEventListener('change', () => {
            this.flamegraph.renderFlamegraph(profileData.traceLog, flamegraphContainer, groupBySelect.value);
          });
          flamegraphTab.removeEventListener('click', renderFlamegraphOnFirstClick);
        });

        // Attach listeners for the new export buttons
        const perfettoButton = mainContainer.querySelector('#ch-perfetto-export-button');
        if (perfettoButton) {
          // The button is disabled, but we prevent any accidental clicks.
          perfettoButton.addEventListener('click', (e) => e.preventDefault());
        }
        mainContainer.querySelector('#ch-speedscope-export-button').addEventListener('click', () => {
          this.flamegraph.exportTraceToSpeedscope(profileData.traceLog, profileData.queryLog?.query_id || 'unknown-query');
        });
      };
      flamegraphTab.addEventListener('click', renderFlamegraphOnFirstClick);
    } else {
        const flamegraphContainer = mainContainer.querySelector('#profile-content-flamegraph');
        if (flamegraphContainer) {
            flamegraphContainer.querySelector('.tab-inner-content').innerHTML = '<p>No CPU trace data found. Ensure profiling is enabled on your server and that the query is long enough to be sampled.</p>';
        }
        const traceLogContainer = mainContainer.querySelector('#profile-content-trace-log');
        if (traceLogContainer) {
            traceLogContainer.querySelector('.tab-inner-content').innerHTML = '<p>No CPU trace data found.</p>';
        }
    }

    // Render the Call Graph from the flame graph data
    if (profileData.traceLog && profileData.traceLog.length > 0) {
        const callGraphContainer = mainContainer.querySelector('#profile-content-call-graph .tab-inner-content');
        this.callgraph.renderCallGraph(profileData.traceLog, callGraphContainer, 'TD'); // Initial render is Top-Down
        this.callgraph.setupCallGraphControls(profileData.traceLog, callGraphContainer);
    } else {
        const flamegraphContainer = mainContainer.querySelector('#profile-content-flamegraph');
        if (flamegraphContainer) {
            flamegraphContainer.querySelector('.tab-inner-content').innerHTML = '<p>No CPU trace data found. Ensure profiling is enabled on your server and that the query is long enough to be sampled.</p>';
        }
        const traceLogContainer = mainContainer.querySelector('#profile-content-trace-log');
        if (traceLogContainer) {
            traceLogContainer.querySelector('.tab-inner-content').innerHTML = '<p>No CPU trace data found.</p>';
        }
    }

    // Add event listeners for the newly created tree-view buttons
    const expandBtn = mainContainer.querySelector('#ch-expand-all-button');
    if (expandBtn) {
        expandBtn.addEventListener('click', () => mainContainer.querySelector('#inner-content-structured-explain').querySelectorAll('details').forEach(d => d.open = true));
        mainContainer.querySelector('#ch-collapse-all-button').addEventListener('click', () => mainContainer.querySelector('#inner-content-structured-explain').querySelectorAll('details').forEach(d => d.open = false));
    }

    // Add event listeners for the new inner tabs
    const explainPlanContainer = mainContainer.querySelector('#profile-content-explain-plan');
    if (explainPlanContainer) {
      explainPlanContainer.querySelectorAll('.inner-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          explainPlanContainer.querySelectorAll('.inner-tab').forEach(t => t.classList.remove('active'));
          explainPlanContainer.querySelectorAll('.inner-tab-content').forEach(c => c.classList.remove('active'));
          tab.classList.add('active');
          explainPlanContainer.querySelector(`#inner-content-${tab.dataset.innerTab}`).classList.add('active');
        });
      });
    }

    // Render the Pipeline Plan graph and set up its controls
    if (profileData.pipelineGraph && profileData.pipelineGraph.trim().startsWith('digraph')) {
      const pipelineContainer = mainContainer.querySelector('#profile-content-pipeline-plan .tab-inner-content');
      this.pipeline.renderPipelineGraph(profileData.pipelineGraph, pipelineContainer);
    }


    // Add event listeners for the newly created graph-view buttons
    const zoomInBtn = mainContainer.querySelector('#ch-zoom-in-button');
    if (zoomInBtn) {
        let currentGraphZoom = 1.0;
        const zoomStep = 0.4; // Increased for more aggressive zoom
        const pipelineContainer = mainContainer.querySelector('#profile-content-pipeline-plan .tab-inner-content');
        const updateGraphZoom = () => {
            const svg = pipelineContainer.querySelector('svg');
            if (svg) {
                svg.style.transform = `scale(${currentGraphZoom})`;
                svg.style.transformOrigin = 'top left';
            }
        };
        zoomInBtn.addEventListener('click', () => {
            currentGraphZoom += zoomStep;
            updateGraphZoom();
        });
        mainContainer.querySelector('#ch-zoom-out-button').addEventListener('click', () => {
            currentGraphZoom = Math.max(0.2, currentGraphZoom - zoomStep);
            updateGraphZoom();
        });
        mainContainer.querySelector('#ch-zoom-reset-button').addEventListener('click', () => {
            currentGraphZoom = 1.0;
            updateGraphZoom();
        });
    }

    // Add event listeners for the newly created call-graph-view buttons
    const cgZoomInBtn = mainContainer.querySelector('#cg-zoom-in-button');
    if (cgZoomInBtn) {
        let currentGraphZoom = 1.0;
        const zoomStep = 0.6; // Make zoom even more aggressive
        const callGraphContainer = mainContainer.querySelector('#profile-content-call-graph .tab-inner-content');
        const updateGraphZoom = () => {
            const svg = callGraphContainer.querySelector('svg');
            if (svg) {
                svg.style.transform = `scale(${currentGraphZoom})`;
                svg.style.transformOrigin = 'top left';
            }
        };
        cgZoomInBtn.addEventListener('click', () => {
            currentGraphZoom += zoomStep;
            updateGraphZoom();
        });
        mainContainer.querySelector('#cg-zoom-out-button').addEventListener('click', () => {
            currentGraphZoom = Math.max(0.2, currentGraphZoom - zoomStep);
            updateGraphZoom();
        });
        mainContainer.querySelector('#cg-zoom-reset-button').addEventListener('click', () => {
            currentGraphZoom = 1.0;
            updateGraphZoom();
        });
    }
  }
}