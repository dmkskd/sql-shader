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
    this.dataFormat = storedSettings.dataFormat || 'JSONEachRow';

    if (this.dataFormat === 'Arrow') {
      console.log(`[ClickHouse Engine] Initialized with data format: Arrow (Direct Fetch)`);
    } else {
      console.log(`[ClickHouse Engine] Initialized with data format: ${this.dataFormat}`);
    }

    this.client = createClient({
      url: url, // Deprecated 'host' is replaced by 'url'
      username: username,
      password: password,
    });

    this.profiler = new ClickHouseProfiler(this); // Pass the engine instance itself

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
   * @returns {Promise<{query: function(...any): Promise<{table: import('@apache/arrow').Table, timings: object}>}>} An object with a `query` method.
   */
  async prepare(sql) {
    // For the ClickHouse HTTP client, there's no "prepare" step.
    // We return an object that holds the SQL and can execute it.
    return {
      // The query function will now return both the result table and detailed timings.
      query: async (...args) => this.executeQuery(sql, args)
    };
  }

  /**
   * Executes a "prepared" query with the given parameters.
   * @param {string} sql The SQL query string from the prepare step.
   * @param {Array<any>} params The parameters for the query.
   * @returns {Promise<{table: import('@apache/arrow').Table, timings: object}>} An object containing the result table and a breakdown of timings.
   */
  async executeQuery(sql, params) {
    let finalSql = sql
      .replace('{width:UInt32}', params[0])
      .replace('{height:UInt32}', params[1])
      .replace('{iTime:Float64}', params[2])
      .replace('{mx:Float64}', params[3])
      .replace('{my:Float64}', params[4]);

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
    const resultSet = await this.client.query({
      query: finalSql,
      format: 'JSONEachRow', // Use the dedicated format option.
    });
    const rows = await resultSet.json();

    // Convert the JSON result into an Arrow Table, which the renderer expects.
    const r = new Float32Array(rows.map(row => row.r));
    const g = new Float32Array(rows.map(row => row.g));
    const b = new Float32Array(rows.map(row => row.b));

    const table = arrow.makeTable({ r, g, b });
    return { table, timings: {} }; // Wrap in object for consistency
  }

  /**
   * Executes the query using the high-performance, binary Arrow format by bypassing
   * the client library and using the native `fetch` API directly.
   * @param {string} finalSql The final SQL query with parameters substituted.
   * @returns {Promise<{table: import('@apache/arrow').Table, timings: object}>}
   */
  async executeQueryAsArrow(finalSql) {
    // Retrieve connection settings directly from localStorage, just like in initialize().
    const storedSettings = JSON.parse(localStorage.getItem('pixelql.clickhouse-settings')) || {};
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

    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);

    const arrow_buffer = await resp.arrayBuffer();
    const table = await arrow.tableFromIPC(arrow_buffer);
    return { table, timings: {} }; // Wrap in object for consistency
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
}

export const engine = new ClickHouseEngine();