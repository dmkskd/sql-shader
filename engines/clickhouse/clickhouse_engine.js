import { createClient } from '@clickhouse/client-web';
import { Table, Float32, makeTable } from '@apache/arrow';
import mermaid from 'mermaid';
import * as d3 from 'd3';
import { flamegraph } from 'd3-flame-graph';
import { SHADERS } from './clickhouse_shaders.js';

/**
 * Implements the Engine interface for ClickHouse.
 */
class ClickHouseEngine {
  constructor() {
    this.client = null;
  }

  async initialize(statusCallback) {
    statusCallback('Initializing ClickHouse engine...');

    // Default connection details. These can be overridden by URL parameters
    // e.g., http://localhost:8000/?ch_host=...&ch_port=...
    const storedSettings = JSON.parse(localStorage.getItem('clickhouse-settings')) || {};
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

  async prepare(sql) {
    // For the ClickHouse HTTP client, there's no "prepare" step.
    // We return an object that holds the SQL and can execute it.
    return {
      query: async (...args) => this.executeQuery(sql, args),
    };
  }

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

    try {
      await this.client.query({ query: finalSql, query_id: queryId, format: 'JSONEachRow' });
    } catch (e) {
      console.warn('Shader query failed during profiling, but attempting to fetch logs anyway.', e);
    }

    // Give ClickHouse a moment to flush the logs
    await new Promise(resolve => setTimeout(resolve, 300));

    // 4. Get system.query_log entry
    try {
      const queryLogQuery = `SELECT * FROM system.query_log WHERE query_id = '${queryId}' AND type = 'QueryFinish' LIMIT 1`;
      const queryLogResultSet = await this.client.query({ query: queryLogQuery, format: 'JSONEachRow' });
      const queryLogData = await queryLogResultSet.json();
      profileData.queryLog = queryLogData[0];
    } catch (e) {
      console.error('Failed to query system.query_log:', e);
      profileData.queryLog = { error: `Failed to query system.query_log: ${e.message}` };
    }

    // 5. Get system.trace_log entries for FlameGraph
    try {
      const traceLogQuery = `SELECT trace, count() as value FROM system.trace_log WHERE query_id = '${queryId}' AND trace_type = 'CPU' GROUP BY trace`;
      const traceLogResultSet = await this.client.query({ query: traceLogQuery, format: 'JSONEachRow' });
      profileData.traceLog = await traceLogResultSet.json();
    } catch (e) {
      console.error('Failed to query system.trace_log:', e);
      profileData.traceLog = [];
    }

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
    const { rawPlanContainer, structuredPlanContainer, graphPlanContainer, flamegraphContainer, querySummaryContainer, tabs } = containers;

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
      let summaryHtml = '<h3>Query Summary</h3>';
      summaryHtml += `<p><strong>Query Time:</strong> ${(profileData.queryLog.query_duration_ms / 1000).toFixed(4)}s</p>`;
      summaryHtml += `<p><strong>Memory Usage:</strong> ${(profileData.queryLog.memory_usage / 1024 / 1024).toFixed(2)} MB</p>`;
      summaryHtml += `<p><strong>Rows Read:</strong> ${profileData.queryLog.read_rows.toLocaleString()}</p>`;
      summaryHtml += `<p><strong>Bytes Read:</strong> ${(profileData.queryLog.read_bytes / 1024 / 1024).toFixed(2)} MB</p>`;
      querySummaryContainer.innerHTML = summaryHtml;
      tabs.querySummary.style.display = 'block';
    } else {
      let errorMessage = `<p>No query log data found. Ensure query logging is enabled on your server.</p>`;
      if (profileData.queryLog && profileData.queryLog.error) {
        errorMessage += `<pre>${JSON.stringify(profileData.queryLog, null, 2)}</pre>`;
      }
      querySummaryContainer.innerHTML = errorMessage;
      tabs.querySummary.style.display = 'block';
    }

    // --- Tab 4: Graph Plan (from EXPLAIN PIPELINE) ---
    if (profileData.pipelineGraph && profileData.pipelineGraph.trim().startsWith('digraph')) {
      const mermaidGraph = this.dotToMermaid(profileData.pipelineGraph);
      const { svg } = await mermaid.render('ch-mermaid-graph', mermaidGraph);
      graphPlanContainer.innerHTML = svg;
      tabs.graphPlan.style.display = 'block';
    } else {
      graphPlanContainer.innerHTML = `<p>Could not generate graph.</p><pre>${profileData.pipelineGraph || 'No data.'}</pre>`;
      tabs.graphPlan.style.display = 'block';
    }

    // --- Tab 5: FlameGraph (from system.trace_log) ---
    if (profileData.traceLog && profileData.traceLog.length > 0) {
      this.renderFlamegraph(profileData.traceLog, flamegraphContainer);
      tabs.flamegraph.style.display = 'block';
    } else {
      flamegraphContainer.innerHTML = '<p>No CPU trace data found. Ensure `query_profiler_cpu_time_period_ns` is set on your server and that the query is long enough to be sampled.</p>';
      tabs.flamegraph.style.display = 'block';
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
        let childNode = currentNode.children.find(c => c.name === address);
        if (!childNode) {
          childNode = { name: address, value: 0, children: [], original: { value: 0 } };
          currentNode.children.push(childNode);
        }
        currentNode = childNode;
      });
      currentNode.value += row.value;
      currentNode.original.value += row.value;
    });
    root.value = totalValue;
    root.original.value = totalValue;

    container.innerHTML = '';
    // Define a function to create rich HTML tooltips
    const labelHandler = (d) => {
      const percent = totalValue > 0 ? ((d.data.value / totalValue) * 100).toFixed(2) : 0;
      return `<strong>${d.data.name}</strong><br>
              Samples: ${d.data.value.toLocaleString()} (${percent}%)`;
    };

    const flamegraphChart = flamegraph()
      .width(container.clientWidth)
      .cellHeight(18)
      .selfValue(true) // In ClickHouse traces, the value is per-function, not cumulative
      .setColorMapper(d => d.highlight ? "#E600E6" : "#606060") // Simple highlight or grey
      .html(true) // Enable HTML in tooltips
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

  getShaders() {
    return SHADERS;
  }
}

export const engine = new ClickHouseEngine();