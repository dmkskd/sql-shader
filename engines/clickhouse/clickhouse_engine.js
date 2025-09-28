import { createClient } from '@clickhouse/client-web';
import { Table, Float32, makeTable } from '@apache/arrow';
import mermaid from 'mermaid';
import * as d3 from 'd3';
// Use a namespace import to robustly handle this non-standard module.
import * as d3_flame_graph from 'd3-flame-graph';
import { SHADERS } from './clickhouse_shaders.js';

/**
 * Implements the Engine interface for ClickHouse.
 */
class ClickHouseEngine {
  constructor() {
    this.client = null;
  }

  /**
   * Initializes the ClickHouse client and pings the server to ensure connectivity.
   * @param {function(string): void} statusCallback A function to report progress updates.
   * @returns {Promise<void>}
   */
  async initialize(statusCallback) {
    statusCallback('Initializing ClickHouse engine...');

    // Default connection details. These can be overridden by URL parameters
    // e.g., http://localhost:8000/?ch_host=...&ch_port=...
    const storedSettings = JSON.parse(localStorage.getItem('pixelql.clickhouse-settings')) || {};
    const urlParams = new URLSearchParams(window.location.search);

    // Priority: 1. Stored Settings, 2. URL Params, 3. Defaults
    const url = storedSettings.url || urlParams.get('ch_host') || 'http://localhost:8123';
    const username = storedSettings.username || urlParams.get('ch_user') || 'default';
    const password = storedSettings.password || urlParams.get('ch_password') || '';

    this.client = createClient({
      url: url, // Deprecated 'host' is replaced by 'url'
      username: username,
      password: password,
    });

    statusCallback(`Pinging ClickHouse server at ${url}...`);
    try {
      const response = await this.client.ping();
      if (!response.success) {
        throw new Error('Ping failed.');
      }
      statusCallback('ClickHouse engine ready.');
    } catch (e) {
      statusCallback(`ClickHouse connection failed: ${e.message}. Is it running at ${url}?`);
      // Instead of throwing, we return a specific error to be handled by the caller.
      throw new Error(`Could not connect to ClickHouse at ${url}. Please check the URL and ensure the server is running.`);
    }
  }

  /**
   * "Prepares" a query by returning an object that can execute it.
   * For the HTTP client, this is a lightweight operation.
   * @param {string} sql The SQL query string.
   * @returns {Promise<{query: function(...any): Promise<Table>}>} An object with a `query` method.
   */
  async prepare(sql) {
    // For the ClickHouse HTTP client, there's no "prepare" step.
    // We return an object that holds the SQL and can execute it.
    return {
      query: async (...args) => this.executeQuery(sql, args),
    };
  }

  /**
   * Executes a "prepared" query with the given parameters.
   * @param {string} sql The SQL query string from the prepare step.
   * @param {Array<any>} params The parameters for the query.
   * @returns {Promise<Table>} An Apache Arrow Table containing the result.
   */
  async executeQuery(sql, params) {
    // New Strategy: Manually substitute parameters to avoid client library issues.
    let finalSql = sql
      .replace('{width:UInt32}', params[0])
      .replace('{height:UInt32}', params[1])
      .replace('{iTime:Float64}', params[2])
      .replace('{mx:Float64}', params[3])
      .replace('{my:Float64}', params[4]);

    const resultSet = await this.client.query({
      query: finalSql,
      format: 'JSONEachRow'
    });
    const rows = await resultSet.json();

    // Convert the JSON result into an Arrow Table, which the renderer expects.
    const r = new Float32Array(rows.length);
    const g = new Float32Array(rows.length);
    const b = new Float32Array(rows.length);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      r[i] = row.r;
      g[i] = row.g;
      b[i] = row.b;
    }

    return makeTable({
      r: r,
      g: g,
      b: b,
    });
  }

  /**
   * Runs the query with profiling enabled and collects various performance metrics.
   * @param {string} sql The raw SQL of the shader to profile.
   * @param {Array<any>} params The parameters for the query.
   * @returns {Promise<object>} A data object containing plans, logs, and traces.
   */
  async profile(sql, params) {
    console.log('[engine.profile] Starting advanced ClickHouse profiling...');
    const cleanedSql = sql.replace(/{[^}]+}/g, '1');
    const queryId = `pixelql-${Date.now()}`;
    let profileData = {};

    // 1. Get EXPLAIN PIPELINE graph
    try {
      const graphSql = `EXPLAIN PIPELINE graph = 1 ${cleanedSql}`;
      const graphResultSet = await this.client.query({ query: graphSql, format: 'JSONEachRow' });
      const graphRows = await graphResultSet.json();
      profileData.pipelineGraph = graphRows.map(row => row.explain).join('\n');
    } catch (e) {
      console.error('Failed to get EXPLAIN PIPELINE graph:', e);
      profileData.pipelineGraph = `Error: ${e.message}`;
    }

    // 2. Get EXPLAIN actions, indexes
    try {
      const actionsSql = `EXPLAIN actions = 1, indexes = 1 ${cleanedSql}`;
      const actionsResultSet = await this.client.query({ query: actionsSql, format: 'JSONEachRow' });
      const actionsRows = await actionsResultSet.json();
      profileData.actionsPlan = actionsRows.map(row => row.explain).join('\n');
    } catch (e) {
      console.error('Failed to get EXPLAIN actions/indexes:', e);
      profileData.actionsPlan = `Error: ${e.message}`;
    }

    // 3. Execute the actual query and fetch logs
    let finalSql = sql
      .replace('{width:UInt32}', params[0])
      .replace('{height:UInt32}', params[1])
      .replace('{iTime:Float64}', params[2])
      .replace('{mx:Float64}', params[3])
      .replace('{my:Float64}', params[4]);

    console.log(`[Debug] 1. Running main query with query_id: ${queryId}`);
    console.log(finalSql);

    try {
      // Execute the query. We rely on the server-side user profile to have the
      // correct profiling settings enabled, as sending them from the client is
      // being rejected by the server.
      await this.client.query({
        query: finalSql,
        query_id: queryId,
        format: 'JSONEachRow',
      });
    } catch (e) {
      console.warn('Shader query failed during profiling, but attempting to fetch logs anyway.', e);
    }

    // Force ClickHouse to flush its log buffers to the system tables.
    // This is more reliable than waiting with a timeout and ensures the logs are available.
    try {
      await this.client.command({ query: 'SYSTEM FLUSH LOGS' });
      console.log('[engine.tracing] Flushed system logs successfully.');
    } catch (e) {
      console.warn('Failed to execute SYSTEM FLUSH LOGS, falling back to a timeout. This might happen due to user permissions.', e);
      await new Promise(resolve => setTimeout(resolve, 500)); // Use a slightly longer fallback timeout
    }

    // 4. Poll for both query_log and trace_log entries in a single loop.
    // This is more robust against race conditions where one log flushes before the other.
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
            console.log(`[engine.tracing] Found query_log entry after ${i + 1} attempt(s).`);
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
          const traceResultSet = await this.client.query({ query: traceQuery.trim(), format: 'JSONEachRow', clickhouse_settings: { allow_introspection_functions: 1 } });
          const resolvedTraces = await traceResultSet.json();
          if (resolvedTraces.length > 0) {
            profileData.traceLog = resolvedTraces.map(row => ({ trace: row.stack.split(';'), value: row.value }));
            console.log(`[engine.tracing] Found trace_log entries after ${i + 1} attempt(s).`);
          }
        }

        // If we have both, we can stop waiting
        if (profileData.queryLog && profileData.traceLog && profileData.traceLog.length > 0) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    } catch (e) {
      console.error('Failed during log polling:', e);
    }

    // Add final status logging after polling is complete.
    console.log(`[Debug] Polling finished. Query Log found: ${!!profileData.queryLog}`);
    console.log(`[Debug] Polling finished. Trace Log entries found: ${profileData.traceLog ? profileData.traceLog.length : 0}`);

    console.log('[engine.profile] Profiling data collection complete.');
    return profileData;
  }

  /**
   * Renders the multi-faceted profile data into the modal.
   * @param {object} profileData The data object from the profile() method.
   * @param {object} containers The DOM elements to render into.
   * @returns {Promise<void>}
   */
  async renderProfile(profileData, containers) {
    const { rawPlanContainer, structuredPlanContainer, pipelinePlanContainer, flamegraphContainer, traceLogContainer, querySummaryContainer, tabs } = containers;

    // --- Tab 1: Raw Plan ---
    // Truly raw, un-parsed text output
    const rawHeaderText = `<h3>Raw Plan Output</h3><p>Generated via: <code>EXPLAIN actions = 1, indexes = 1</code></p>`;
    rawPlanContainer.innerHTML = `${rawHeaderText}<pre>${profileData.actionsPlan || 'No data.'}</pre>`;

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
    const structuredHeaderText = `<h3>Structured Plan View</h3><p>Generated via: <code>EXPLAIN actions = 1, indexes = 1</code></p>`;
    structuredPlanContainer.innerHTML = `${structuredHeaderText}<pre>${formattedHtml}</pre>`;

    // --- Tab 3: Query Summary (from system.query_log) ---
    if (profileData.queryLog && !profileData.queryLog.error) {
      let summaryHtml = `<h3>Query Summary</h3><p>Generated via: <code>SELECT * FROM system.query_log WHERE query_id = '...'</code></p>`;
      summaryHtml += `<p><strong>Query Time:</strong> ${(profileData.queryLog.query_duration_ms / 1000).toFixed(4)}s</p>`;
      summaryHtml += `<p><strong>Memory Usage:</strong> ${(profileData.queryLog.memory_usage / 1024 / 1024).toFixed(2)} MB</p>`;
      summaryHtml += `<p><strong>Rows Read:</strong> ${profileData.queryLog.read_rows.toLocaleString()}</p>`;
      summaryHtml += `<p><strong>Bytes Read:</strong> ${(profileData.queryLog.read_bytes / 1024 / 1024).toFixed(2)} MB</p>`;
      querySummaryContainer.innerHTML = summaryHtml;
      tabs.querySummary.style.display = 'block';
    } else {
      let errorMessage = `<h3>Query Summary</h3><p>No query log data found. Ensure query logging is enabled on your server.</p>`;
      if (profileData.queryLog && profileData.queryLog.error) {
        errorMessage += `<pre>${JSON.stringify(profileData.queryLog, null, 2)}</pre>`;
      }
      querySummaryContainer.innerHTML = errorMessage;
      tabs.querySummary.style.display = 'block';
    }

    // --- Tab 4: Pipeline Plan (from EXPLAIN PIPELINE) ---
    const pipelineHeaderText = `<h3>Pipeline Plan</h3><p>Generated via: <code>EXPLAIN PIPELINE graph = 1</code></p>`;
    if (profileData.pipelineGraph && profileData.pipelineGraph.trim().startsWith('digraph')) {
      const mermaidGraph = this.dotToMermaid(profileData.pipelineGraph);
      const { svg } = await mermaid.render('ch-mermaid-graph', mermaidGraph);
      pipelinePlanContainer.innerHTML = pipelineHeaderText + svg;
      tabs.pipelinePlan.style.display = 'block';
    } else {
      pipelinePlanContainer.innerHTML = `${pipelineHeaderText}<p>Could not generate graph.</p><pre>${profileData.pipelineGraph || 'No data.'}</pre>`;
      tabs.pipelinePlan.style.display = 'block';
    }

    // --- Tab 5 & 6: FlameGraph and Trace Log (from system.trace_log) ---
    if (profileData.traceLog && profileData.traceLog.length > 0) {
      // Remove any old listener before adding a new one.
      if (window.renderClickHouseFlamegraph) {
        tabs.flamegraph.removeEventListener('click', window.renderClickHouseFlamegraph);
      }

      // Defer rendering until the tab is clicked to ensure the container is visible and has a width.
      window.renderClickHouseFlamegraph = () => {
        requestAnimationFrame(() => {
          console.log(`[Debug] Rendering ClickHouse flame graph in container with width: ${flamegraphContainer.clientWidth}px`);
          this.renderFlamegraph(profileData.traceLog, flamegraphContainer);
          // Remove the listener so it only runs once.
          tabs.flamegraph.removeEventListener('click', window.renderClickHouseFlamegraph);
        });
      };
      // Add the one-time listener.
      tabs.flamegraph.addEventListener('click', window.renderClickHouseFlamegraph);

      // Render the raw trace log data into a table for the new panel
      let traceLogHtml = `<h3>Trace Log</h3><p>Generated via: <code>SELECT ... FROM system.trace_log</code></p>`;
      traceLogHtml += '<table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 12px;">';
      traceLogHtml += '<thead><tr style="text-align: left; border-bottom: 1px solid #777;"><th>Stack Trace</th><th style="width: 10%;">Samples</th></tr></thead>';
      traceLogHtml += '<tbody>';
      // Sort by most frequent samples first
      const sortedTraces = [...profileData.traceLog].sort((a, b) => b.value - a.value);
      for (const row of sortedTraces) {
        const stackHtml = row.trace.join('<br>&#8627; '); // Use a right-angle arrow for stack levels
        traceLogHtml += `<tr style="border-bottom: 1px solid #444;"><td style="padding: 5px 0;">${stackHtml}</td><td>${row.value}</td></tr>`;
      }
      traceLogHtml += '</tbody></table>';
      traceLogContainer.innerHTML = traceLogHtml;

      tabs.flamegraph.style.display = 'block';
      tabs.traceLog.style.display = 'block';
    } else {
      const noDataMessage = `<h3>CPU FlameGraph / Trace Log</h3><p>Generated via: <code>SELECT ... FROM system.trace_log</code></p><p>No CPU trace data found. Ensure profiling is enabled on your server and that the query is long enough to be sampled.</p>`;
      flamegraphContainer.innerHTML = noDataMessage;
      traceLogContainer.innerHTML = noDataMessage;
      tabs.flamegraph.style.display = 'block';
      tabs.traceLog.style.display = 'block';
    }

    // Show all the ClickHouse-specific tabs
    tabs.rawPlan.style.display = 'block';
    tabs.structuredPlan.style.display = 'block';
    // Hide the generic 'graph' and 'structured' tabs from DuckDB
    if (document.querySelector('.profiler-tab[data-tab="graph"]')) document.querySelector('.profiler-tab[data-tab="graph"]').style.display = 'none';
    if (document.querySelector('.profiler-tab[data-tab="structured"]')) document.querySelector('.profiler-tab[data-tab="structured"]').style.display = 'none';
  }

  /**
   * Renders a FlameGraph from the ClickHouse trace log.
   * @param {Array<object>} traceLog The data from system.trace_log.
   * @param {HTMLElement} container The DOM element to render the chart into.
   */
  renderFlamegraph(traceLog, container) {
    if (!traceLog || traceLog.length === 0) {
      container.innerHTML = '<p>No CPU trace data found.</p>';
      return;
    }

    const root = { name: "root", value: 0, children: [], original: { value: 0 } };
    let totalValue = 0;
    traceLog.forEach(row => {
      totalValue += row.value;
      let currentNode = root;
      const stack = row.trace.reverse(); // Build stack from bottom up
      stack.forEach(address => {
        const functionName = address || 'unknown';
        let childNode = currentNode.children.find(c => c.name === functionName);
        if (!childNode) {
          childNode = { name: functionName, value: 0, children: [], original: { value: 0 } };
          currentNode.children.push(childNode);
        }
        // The value of a parent is the sum of its children. We add the sample
        // value to every node in the stack to correctly aggregate total time.
        childNode.value += row.value;
        currentNode = childNode;
      });
    });
    root.value = totalValue;
    root.original.value = totalValue;

    console.log('[Debug] Flamegraph data structure:', JSON.stringify(root, null, 2));

    container.innerHTML = '';
    // Create a color scale from "cold" (green) to "hot" (red) based on sample count.
    // We use a sqrt scale to better differentiate the smaller values.
    const colorScale = d3.scaleSequential(d3.interpolateRgb("hsl(120, 50%, 35%)", "hsl(0, 80%, 45%)")).domain([0, Math.sqrt(root.value)]);

    // Define a function to create rich HTML tooltips
    const labelHandler = (d) => {
      const percent = totalValue > 0 ? ((d.data.value / totalValue) * 100).toFixed(2) : 0;
      // Assuming a 1ms sample interval (1,000,000 ns), samples are roughly equivalent to milliseconds.
      const estimatedMs = d.data.value;
      return `<strong>${d.data.name}</strong><br>
              Time (est.): ${estimatedMs.toLocaleString()} ms (${percent}%)<br>Samples: ${d.data.value.toLocaleString()}`;
    };

    const flamegraphChart = d3_flame_graph.flamegraph()
      .width(container.clientWidth)
      .cellHeight(18)
      .setColorMapper(d => colorScale(Math.sqrt(d.data.value))) // Color by sample count
      .label(labelHandler); // Use our custom tooltip function

    d3.select(container).datum(root).call(flamegraphChart);
  }

  /**
   * Parses a DOT graph string and converts it to Mermaid syntax.
   * @param {string} dotString The raw DOT graph string.
   * @returns {string} A Mermaid graph definition string.
   */
  dotToMermaid(dotString) {
    let mermaidString = 'graph LR;\n'; // LR = Left to Right
    const nodeLabels = new Map();

    const nodeRegex = /(\w+)\s+\[label="([^"]+)"\]/g;
    let match;
    while ((match = nodeRegex.exec(dotString)) !== null) {
      nodeLabels.set(match[1], match[2].replace(/"/g, '&quot;'));
    }

    const edgeRegex = /^\s*(\w+)\s*->\s*(\w+)/gm;
    while ((match = edgeRegex.exec(dotString)) !== null) {
      const [_, fromNode, toNode] = match;
      const fromLabel = nodeLabels.get(fromNode) || fromNode;
      const toLabel = nodeLabels.get(toNode) || toNode;
      mermaidString += `    ${fromNode}["${fromLabel}"] --> ${toNode}["${toLabel}"];\n`;
    }
    return mermaidString;
  }

  /**
   * Returns the list of example shaders available for this engine.
   * @returns {Array<{name: string, sql: string}>}
   */
  getShaders() {
    return SHADERS;
  }
}

export const engine = new ClickHouseEngine();