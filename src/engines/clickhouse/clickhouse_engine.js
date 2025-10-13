import { createClient } from '@clickhouse/client-web';
import * as arrow from '@apache/arrow';
import { SHADERS, loadShaderContent } from './clickhouse_shaders.js';
import { ClickHouseProfiler } from './clickhouse_profiler.js';

/**
 * Implements the Engine interface for ClickHouse.
 */
class ClickHouseEngine {
  constructor() {
    this.client = null;
    this.profiler = null;
    // This setting will control which data format is used for rendering.
    // It can be 'JSONEachRow' (stable, text-based) or 'Arrow' (fast, binary).
    // We default to the most compatible format.
    this.dataFormat = 'JSONEachRow';

    this.lastPollTime = Date.now();
    this.lastEventCounts = {};
    this.serverVersion = null;
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
    const storedSettings = JSON.parse(localStorage.getItem('sqlshader.clickhouse-settings')) || {};
    const urlParams = new URLSearchParams(window.location.search);

    // Priority: 1. Stored Settings, 2. URL Params, 3. Defaults
    const url = storedSettings.url || urlParams.get('ch_host') || 'http://localhost:8123';
    const username = storedSettings.username || urlParams.get('ch_user') || 'default';
    const password = storedSettings.password || urlParams.get('ch_password') || '';
    this.dataFormat = storedSettings.dataFormat || 'Arrow';

    console.log('[ClickHouse] Connecting to:', url, 'as user:', username);

    if (this.dataFormat === 'Arrow') {
      console.log(`[ClickHouse Engine] Initialized with data format: Arrow (Direct Fetch)`);
    } else {
      console.log(`[ClickHouse Engine] Initialized with data format: ${this.dataFormat}`);
    }

    this.client = createClient({
      url: url, // Deprecated 'host' is replaced by 'url'
      username: username,
      password: password,
      clickhouse_settings: {
        // Enable OpenTelemetry tracing for all queries from this client
        opentelemetry_start_trace_probability: 1.0,
        // Also enable query logging
        log_queries: 1,
      },
    });

    this.profiler = new ClickHouseProfiler(this); // Pass the engine instance itself

    statusCallback(`Pinging ClickHouse server at ${url}...`);
    try {
      const response = await this.client.ping();
      if (!response.success) {
        console.error('[ClickHouse] Ping failed. Full response:', response);
        let errorType = '';
        if (response.error) {
          console.error('[ClickHouse] Error message:', response.error.message);
          console.error('[ClickHouse] Error type:', response.error.type);
          errorType = response.error.type || '';
        }
        const typeInfo = errorType ? ` (${errorType})` : '';
        throw new Error(`Ping failed${typeInfo}`);
      }

      // Get server version
      try {
        const versionResult = await this.client.query({
          query: 'SELECT version() AS version',
          format: 'JSONEachRow'
        });
        const versionData = await versionResult.json();
        if (versionData && versionData.length > 0) {
          this.serverVersion = versionData[0].version;
          console.log('[ClickHouse] Server version:', this.serverVersion);
        }
      } catch (versionError) {
        console.warn('[ClickHouse] Could not retrieve version:', versionError.message);
        this.serverVersion = 'Unknown';
      }

      statusCallback('ClickHouse engine ready.');
    } catch (e) {
      // Log the full error details to console for debugging
      console.error('[ClickHouse] Connection error:', e.message);
      if (e.stack) {
        console.error('[ClickHouse] Error stack:', e.stack);
      }
      
      // Show a clean message in the status bar with error type if available
      const errorMsg = `Could not connect to ClickHouse at ${url}: ${e.message}. Check console for details.`;
      statusCallback(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * "Prepares" a query by returning an object that can execute it.
   * For the HTTP client, this is a lightweight operation.
   * @param {string} sql The SQL query string.
   * @returns {Promise<{query: function(...any): Promise<{table: import('@apache/arrow').Table, timings: object}>}>} An object with a `query` method.
   */
  async prepare(sql) {
    // To provide immediate feedback on compilation errors, we run an EXPLAIN PLAN check.
    // This validates the query syntax and table existence on the server without executing it,
    // catching a wide range of errors early.
    let syntaxCheckSql;
    
    if (sql.includes('?::JSON') || sql.includes('?::String')) {
      // For JSON format, replace ? with a dummy JSON object
      syntaxCheckSql = `EXPLAIN PLAN ${sql.replace(/\?/g, "'{\"iResolution\":[800,600,1],\"iTime\":0,\"iMouse\":[0,0,0,0]}'")}`;;
    } else {
      // For legacy format, replace {parameter:Type} with dummy values
      syntaxCheckSql = `EXPLAIN PLAN ${sql.replace(/{[^}]+}/g, '1')}`;
    }
    
    try {
      await this.client.exec({ query: syntaxCheckSql });
    } catch (e) {
      // Re-throw the error so it's caught by the ShaderManager as a compilation error.
      throw new Error(`ClickHouse server error: ${e.message}`);
    }

    return {
      // The query function will now return both the result table and detailed timings.
      query: async (uniforms) => this.executeQuery(sql, null, uniforms)
    };
  }

  /**
   * Executes a "prepared" query with the given uniforms.
   * @param {string} sql The SQL query string from the prepare step.
   * @param {any} preparedStatement Not used for ClickHouse HTTP client.
   * @param {Object} uniforms The uniform object containing all shader parameters.
   * @returns {Promise<{table: import('@apache/arrow').Table, timings: object}>} An object containing the result table and a breakdown of timings.
   */
  async executeQuery(sql, preparedStatement, uniforms) {
    let finalSql = sql;

    // Handle different parameter formats
    // 1. New JSON format: Single parameter with JSON object
    if (sql.includes('?::JSON') || sql.includes('?::String')) {
      // Convert uniforms to JSON string for ClickHouse
      const uniformsJson = JSON.stringify(uniforms);
      finalSql = sql.replace(/\?/g, `'${uniformsJson.replace(/'/g, "\\'")}'`);
    } 
    // 2. Legacy format: Individual {parameter:Type} placeholders
    else {
      // Extract individual parameters for backwards compatibility
      const width = uniforms.iResolution[0];
      const height = uniforms.iResolution[1];
      const iTime = uniforms.iTime;
      const mx = uniforms.iMouse[0];
      const my = uniforms.iMouse[1];

      finalSql = sql
        .replace('{width:UInt32}', width)
        .replace('{height:UInt32}', height)
        .replace('{iTime:Float64}', iTime)
        .replace('{mx:Float64}', mx)
        .replace('{my:Float64}', my);
    }

    // Strategy pattern to handle different data formats.
    if (this.dataFormat === 'Arrow') {
      return this.executeQueryAsArrow(finalSql);
    }
    // Default to JSONEachRow for stability.
    return this.executeQueryAsJSON(finalSql);
  }

  /**
   * Executes the query using the stable, text-based JSONEachRow format.
   * @param {string} finalSql The final SQL query with parameters substituted.
   * @returns {Promise<{table: import('@apache/arrow').Table, timings: object}>}
   */
  async executeQueryAsJSON(finalSql) {
    const timings = {};
    let t0 = performance.now();
    const resultSet = await this.client.query({
      query: finalSql,
      format: 'JSONEachRow', // Use the dedicated format option.
    });
    timings.network = performance.now() - t0;

    t0 = performance.now();
    const rows = await resultSet.json();
    timings.processing = performance.now() - t0;

    // Convert the JSON result into an Arrow Table, which the renderer expects.
    const r = new Float32Array(rows.map(row => row.r));
    const g = new Float32Array(rows.map(row => row.g));
    const b = new Float32Array(rows.map(row => row.b));

    const table = arrow.makeTable({ r, g, b });
    return { table, timings };
  }

  /**
   * Executes the query using the high-performance, binary Arrow format by bypassing
   * the client library and using the native `fetch` API directly.
   * @param {string} finalSql The final SQL query with parameters substituted.
   * @returns {Promise<{table: import('@apache/arrow').Table, timings: object}>}
   */
  async executeQueryAsArrow(finalSql) {
    const timings = {};
    let t0 = performance.now();

    // Retrieve connection settings directly from localStorage, just like in initialize().
    const storedSettings = JSON.parse(localStorage.getItem('sqlshader.clickhouse-settings')) || {};
    const url = storedSettings.url || 'http://localhost:8123';
    const username = storedSettings.username || 'default';
    const password = storedSettings.password || '';

    // Add `output_format_arrow_compression_method=none` to prevent receiving compressed data that the browser library can't handle.
    const resp = await fetch(`${url}/?default_format=Arrow&output_format_arrow_compression_method=none`, {
      method: "POST",
      body: finalSql,
      headers: {
        'Authorization': 'Basic ' + btoa(`${username}:${password}`),
      }
    });
    timings.network = performance.now() - t0;

    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);

    t0 = performance.now();
    const arrow_buffer = await resp.arrayBuffer();
    const table = await arrow.tableFromIPC(arrow_buffer);
    timings.processing = performance.now() - t0;

    return { table, timings };
  }

  /**
   * Polls system tables for engine-specific performance metrics.
   * @returns {Promise<Array<{label: string, value: string}>>} A list of stats to display.
   */
  async pollEngineStats() {
    try {
      const metricsQuery = `
        SELECT metric, value
        FROM system.metrics
        WHERE metric IN ('Query', 'MemoryTracking')
      `;
      const eventsQuery = `
        SELECT event, value
        FROM system.events
        WHERE event IN ('Query', 'SelectQuery', 'FailedQuery', 'OSCPUVirtualTimeMicroseconds')
      `;
      const asyncMetricsQuery = `
        SELECT metric, value
        FROM system.asynchronous_metrics
        WHERE metric LIKE 'OS%TimeCPU%'
      `;

      const [metricsResult, eventsResult, asyncMetricsResult] = await Promise.all([
        this.client.query({ query: metricsQuery, format: 'JSONEachRow' }),
        this.client.query({ query: eventsQuery, format: 'JSONEachRow' }),
        this.client.query({ query: asyncMetricsQuery, format: 'JSONEachRow' })
      ]);

      const metrics = await metricsResult.json();
      const events = await eventsResult.json();
      const asyncMetrics = await asyncMetricsResult.json();

      const now = performance.now();
      const elapsedMs = now - this.lastPollTime;
      this.lastPollTime = now;

      // Use separate maps to avoid name collisions between system tables (e.g., 'Query').
      const metricsMap = {};
      const eventsMap = {};
      const asyncMetricsMap = {};
      metrics.forEach(m => metricsMap[m.metric] = m.value);
      events.forEach(e => eventsMap[e.event] = e.value);
      asyncMetrics.forEach(m => asyncMetricsMap[m.metric] = m.value);

      // Calculate rates
      // Use system.events for rate calculations.
      const totalQueryCount = eventsMap['Query'] || 0;
      const selectQueryCount = eventsMap['SelectQuery'] || 0;
      const failedQueryCount = eventsMap['FailedQuery'] || 0;
      const cpuTimeMicroseconds = eventsMap['OSCPUVirtualTimeMicroseconds'] || 0;

      const queryRate = this.lastEventCounts['Query'] ? (totalQueryCount - this.lastEventCounts['Query']) / (elapsedMs / 1000) : 0;
      const selectRate = this.lastEventCounts['SelectQuery'] ? (selectQueryCount - this.lastEventCounts['SelectQuery']) / (elapsedMs / 1000) : 0;
      const failedRate = this.lastEventCounts['FailedQuery'] ? (failedQueryCount - this.lastEventCounts['FailedQuery']) / (elapsedMs / 1000) : 0;
      
      // Calculate CPU usage percentage
      const cpuTimeDelta = this.lastEventCounts['OSCPUVirtualTimeMicroseconds'] ? cpuTimeMicroseconds - this.lastEventCounts['OSCPUVirtualTimeMicroseconds'] : 0;
      const cpuUsagePercent = (cpuTimeDelta / (elapsedMs * 1000)) * 100;

      this.lastEventCounts['Query'] = totalQueryCount;
      this.lastEventCounts['SelectQuery'] = selectQueryCount;
      this.lastEventCounts['FailedQuery'] = failedQueryCount;
      this.lastEventCounts['OSCPUVirtualTimeMicroseconds'] = cpuTimeMicroseconds;
      const formatBytes = (bytes) => {
        if (bytes === null || bytes === undefined) return 'N/A';
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${['B', 'KB', 'MB', 'GB'][i]}`;
      };

      const finalStats = [
        // Server version (first stat)
        { label: 'Version', value: this.serverVersion || 'Unknown', rawValue: this.serverVersion, description: "ClickHouse server version." },
        // Core server metrics
        { label: 'Active Queries', value: (metricsMap['Query'] || 0).toLocaleString(), rawValue: metricsMap['Query'] || 0, description: "Number of concurrently executing queries. From system.metrics (metric: 'Query')." },
        { label: 'CPU Usage', value: `${cpuUsagePercent.toFixed(1)}%`, rawValue: cpuUsagePercent, description: "Total server CPU usage percentage, calculated from the change in OSCPUVirtualTimeMicroseconds. From system.events." },
        { label: 'Memory', value: formatBytes(metricsMap['MemoryTracking']), rawValue: metricsMap['MemoryTracking'] || 0, description: "Total memory tracked by the server for queries. From system.metrics (metric: 'MemoryTracking')." },
        { label: 'Queries/s', value: queryRate.toFixed(1), rawValue: queryRate, description: "Rate of all queries processed per second. From system.events (event: 'Query')." },
        { label: 'Failed/s', value: failedRate.toFixed(1), rawValue: failedRate, description: "Rate of failed queries per second. From system.events (event: 'FailedQuery')." },
      ];

      // --- Per-Core CPU Calculation ---
      const perCoreData = {
        type: 'cpu_cores', // Special type for the performance monitor to recognize
        label: 'Per-Core CPU Usage',
        cores: [],
        description: `Per-core CPU utilization breakdown. Calculated from OS*TimeCPU metrics in system.asynchronous_metrics.`
      };

      const coreUsage = {};
      asyncMetrics.forEach(metric => {
        const coreIdMatch = metric.metric.match(/CPU(\d+)/);
        if (!coreIdMatch) return;
        const coreId = coreIdMatch[1];
        const timeTypeMatch = metric.metric.match(/^OS([a-zA-Z]+)TimeCPU/);
        const timeType = timeTypeMatch ? timeTypeMatch[1] : 'Other';

        if (!coreUsage[coreId]) coreUsage[coreId] = {};
        // The value is a gauge (0-1), so we use it directly.
        coreUsage[coreId][timeType] = metric.value;
      });

      Object.keys(coreUsage).sort((a, b) => parseInt(a) - parseInt(b)).forEach(coreId => {
        // The `breakdown` now directly contains the percentage values.
        perCoreData.cores.push({ id: coreId, breakdown: coreUsage[coreId] });
      });

      if (perCoreData.cores.length > 0) finalStats.push(perCoreData);

      return finalStats.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    } catch (e) {
      console.error("Failed to poll engine stats:", e);
      return [{ label: 'Engine Stats', value: 'Error' }];
    }
  }

  /**
   * Runs the query with profiling enabled and collects various performance metrics.
   * @param {string} sql The raw SQL of the shader to profile.
   * @param {Array<any>} params The parameters for the query.
   * @param {function(string): void} [statusCallback] Optional callback to report progress.
   * @returns {Promise<object>} A data object containing plans, logs, and traces.
   */
  profile(sql, params, statusCallback) {
    return this.profiler.profile(sql, params, statusCallback);
  }

  /**
   * Renders the multi-faceted profile data into the modal.
   * @param {object} profileData The data object from the profile() method.
   * @param {HTMLElement} mainContainer The single container element for the profiler UI.
   * @returns {Promise<void>}
   */
  renderProfile(profileData, mainContainer) {
    return this.profiler.renderProfile(profileData, mainContainer);
  }

  /**
   * Renders a Mermaid.js call graph from the ClickHouse trace log data.
   * @param {Array<object>} traceLog The data from system.trace_log.
   * @param {HTMLElement} container The DOM element to render the chart into.
   */
  async renderCallGraph(traceLog, container, direction = 'TD') {
    return this.profiler.renderCallGraph(traceLog, container, direction);
  }

  /**
   * Sets up the event listeners for the Call Graph controls (zoom, direction).
   * @param {Array<object>} traceLog The raw trace log data needed for re-rendering.
   * @param {HTMLElement} container The container for the call graph.
   */
  setupCallGraphControls(traceLog, container) {
    return this.profiler.setupCallGraphControls(traceLog, container);
  }

  /**
   * Parses a DOT graph string and converts it to Mermaid syntax.
   * @param {string} dotString The raw DOT graph string.
   * @param {Set<string>} [nodesToRender=null] An optional set of node IDs to filter the graph.
   * @returns {string} A Mermaid graph definition string.
   */
  dotToMermaid(dotString, nodesToRender = null) {
    return this.profiler.dotToMermaid(dotString, nodesToRender);
  }

  /**
   * Returns the list of example shaders available for this engine.
   * @returns {Array<{name: string, sql: string}>}
   */
  getShaders() {
    return SHADERS;
  }

  /**
   * Asynchronously loads the content of a shader.
   * @param {object} shader The shader object, which may contain a path.
   * @returns {Promise<string>} The SQL content.
   */
  async loadShaderContent(shader) {
    return loadShaderContent(shader);
  }

  /**
   * Returns the HTML content for the engine-specific settings panel.
   * @returns {string} The HTML string for the settings UI.
   */
  getSettingsPanel() {
    return `
      <h3>ClickHouse Connection</h3>
      <p style="font-size: 0.9em; color: #ccc; margin-top: 0; border-left: 3px solid #ffc980; padding-left: 10px;">
        <b>Disclaimer:</b> The ClickHouse engine requires a running server instance accessible from your browser.
        By default, it attempts to connect to <code>http://localhost:8123</code>.<br>
        Be aware of any <b>security implications</b> when allowing this program to connect to your ClickHouse server.<br>
        Please see the project's <code>README.md</code> for instructions on running <b>ClickHouse via Docker</b>.
      </p>
      <div class="settings-form-group">
        <label for="ch-url">Server URL</label>
        <input type="text" id="ch-url" placeholder="http://localhost:8123">
      </div>
      <div class="settings-form-group">
        <label for="ch-user">Username</label>
        <input type="text" id="ch-user" placeholder="default">
      </div>
      <div class="settings-form-group">
        <label for="ch-password">Password</label>
        <input type="password" id="ch-password" placeholder="leave blank if none">
      </div>
      <div class="settings-form-group">
        <label for="ch-data-format">Data Format</label>
        <select id="ch-data-format">
          <option value="JSONEachRow">JSONEachRow (Stable)</option>
          <option value="Arrow" selected>Arrow (Direct Fetch)</option>
        </select>
        <p style="font-size: 0.8em; color: #aaa; margin-top: 5px;">'Arrow (Direct Fetch)' bypasses the client library for a raw binary transfer, offering the highest performance.</p>
      </div>
      <div class="settings-form-group">
        <label for="ch-log-flush-wait">Log Flush Wait (ms)</label>
        <input type="number" id="ch-log-flush-wait" value="1500" min="0" step="100">
        <p style="font-size: 0.8em; color: #aaa; margin-top: 5px;">
          Time to wait after <code>SYSTEM FLUSH LOGS</code> for logs to appear.
          Increase this for slow systems or if profiler tabs are empty.
        </p>
      </div>
    `;
  }

  /**
   * Populates the engine's settings form with stored or default values.
   * @param {object} storedSettings - The settings object from localStorage.
   * @param {object} defaultSettings - The engine's default settings.
   */
  populateSettings(storedSettings, defaultSettings) {
    if (document.getElementById('ch-url')) document.getElementById('ch-url').value = storedSettings.url || defaultSettings.url || '';
    if (document.getElementById('ch-user')) document.getElementById('ch-user').value = storedSettings.username || defaultSettings.username || '';
    if (document.getElementById('ch-password')) document.getElementById('ch-password').value = storedSettings.password || defaultSettings.password || '';
    if (document.getElementById('ch-data-format')) document.getElementById('ch-data-format').value = storedSettings.dataFormat || defaultSettings.dataFormat || 'Arrow';
    if (document.getElementById('ch-log-flush-wait')) document.getElementById('ch-log-flush-wait').value = storedSettings.logFlushWait || defaultSettings.logFlushWait || 1500;
  }
}

/**
 * The default time in milliseconds to wait for ClickHouse to flush its system logs.
 */
export const DEFAULT_LOG_FLUSH_WAIT = 1500;

/**
 * Returns the default settings for the ClickHouse engine.
 * This is used to populate the settings modal with sensible defaults.
 * @returns {object}
 */
ClickHouseEngine.prototype.getSettingsDefaults = function() {
  return {
    logFlushWait: DEFAULT_LOG_FLUSH_WAIT,
    dataFormat: 'Arrow',
    url: 'http://localhost:8123',
    username: 'default',
    password: 'sql_shader'
  };
};

/**
 * Reads the current values from the settings modal and saves them to localStorage.
 * This is part of the engine interface, allowing the UI to be fully generic.
 */
ClickHouseEngine.prototype.saveSettings = function() {
  const chSettings = {
      url: document.getElementById('ch-url').value,
      username: document.getElementById('ch-user').value,
      password: document.getElementById('ch-password').value,
      dataFormat: document.getElementById('ch-data-format').value,
      logFlushWait: document.getElementById('ch-log-flush-wait').value,
  };
  localStorage.setItem('sqlshader.clickhouse-settings', JSON.stringify(chSettings));
  console.log('[ClickHouse Engine] Settings saved.');
};

export const engine = new ClickHouseEngine();