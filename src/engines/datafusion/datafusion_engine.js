import * as arrow from '@apache/arrow';
import { SHADERS, loadShaderContent } from './datafusion_shaders.js';
import { DataFusionProfiler } from './datafusion_profiler.js';

/**
 * Implements the Engine interface for DataFusion via HTTP wrapper.
 */
class DataFusionEngine {
  constructor() {
    this.baseUrl = null;
    this.serverVersion = null;
    this.profiler = null;
    // Store timing metrics for stats display
    this.lastQueryMetrics = null;
    this.metricsHistory = [];
    this.maxHistorySize = 100; // Keep last 100 queries
  }

  /**
   * Initializes the DataFusion HTTP client and pings the server to ensure connectivity.
   * @param {function(string): void} statusCallback A function to report progress updates.
   * @returns {Promise<void>}
   */
  async initialize(statusCallback) {
    statusCallback('Initializing DataFusion engine...');

    // Default connection details. These can be overridden by URL parameters or localStorage
    const storedSettings = JSON.parse(localStorage.getItem('sqlshader.datafusion-settings')) || {};
    const urlParams = new URLSearchParams(window.location.search);

    // Priority: 1. Stored Settings, 2. URL Params, 3. Defaults
    // DataFusion is proxied through Caddy at /datafusion
    const url = storedSettings.url || urlParams.get('df_host') || 'http://localhost:8000/datafusion';
    
    this.baseUrl = url;
    console.log('[DataFusion] Connecting to:', url);

    statusCallback(`Pinging DataFusion server at ${url}...`);
    try {
      const response = await fetch(`${url}/ping`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error('Ping failed');
      }

      // Get server version
      try {
        const healthResponse = await fetch(`${url}/health`);
        const healthData = await healthResponse.json();
        if (healthData && healthData.version) {
          this.serverVersion = healthData.version;
          console.log('[DataFusion] Server version:', this.serverVersion);
        }
      } catch (versionError) {
        console.warn('[DataFusion] Could not retrieve version:', versionError.message);
        this.serverVersion = 'Unknown';
      }

      // Initialize profiler
      this.profiler = new DataFusionProfiler(this);
      console.log('[DataFusion] Profiler initialized.');

      statusCallback('DataFusion engine ready.');
    } catch (e) {
      console.error('[DataFusion] Connection error:', e.message);
      if (e.stack) {
        console.error('[DataFusion] Error stack:', e.stack);
      }
      
      const errorMsg = `Could not connect to DataFusion at ${url}: ${e.message}. Check console for details.`;
      statusCallback(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * "Prepares" a query by validating syntax using EXPLAIN.
   * @param {string} sql The SQL query string.
   * @returns {Promise<{query: function(...any): Promise<{table: import('@apache/arrow').Table, timings: object}>}>} An object with a `query` method.
   */
  async prepare(sql) {
    // Validate query syntax using EXPLAIN
    // Replace parameter placeholders with dummy values for validation
    let validationSql = sql;
    
    // Replace common parameter patterns with dummy values
    // This handles patterns like $width, $height, etc.
    validationSql = validationSql.replace(/\$\w+/g, '1.0');
    
    try {
      // Use the standard /query endpoint with EXPLAIN
      const explainSql = `EXPLAIN ${validationSql}`;
      
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: explainSql,
          format: 'json',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // If EXPLAIN succeeds, the query is valid
    } catch (e) {
      throw new Error(`DataFusion server error: ${e.message}`);
    }

    return {
      query: async (uniforms) => this.executeQuery(sql, uniforms)
    };
  }

  /**
   * Executes a query with the given uniforms.
   * @param {string} sql The SQL query string.
   * @param {Object} uniforms The uniform object containing all shader parameters.
   * @returns {Promise<{table: import('@apache/arrow').Table, timings: object}>} An object containing the result table and a breakdown of timings.
   */
  async executeQuery(sql, uniforms) {
    const timings = {};
    
    // DataFusion doesn't support native parameterization like ClickHouse,
    // so we need to inject parameters directly into the SQL.
    // This is safe for our use case since we control all input values.
    let finalSql = sql;
    
    // Replace uniform parameters in the SQL
    // Common patterns: $width, $height, $iTime, etc.
    const replacements = {
      '$width': uniforms.iResolution[0],
      '$height': uniforms.iResolution[1],
      '$iTime': uniforms.iTime,
      '$mx': uniforms.iMouse[0],
      '$my': uniforms.iMouse[1],
      '$iFrame': uniforms.iFrame,
    };
    
    for (const [key, value] of Object.entries(replacements)) {
      finalSql = finalSql.replace(new RegExp('\\' + key + '\\b', 'g'), value.toString());
    }

    // Execute query and get Arrow response
    let t0 = performance.now();
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: finalSql,
        format: 'arrow',
      }),
    });
    timings.network = performance.now() - t0;

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    t0 = performance.now();
    const arrowBuffer = await response.arrayBuffer();
    const table = await arrow.tableFromIPC(arrowBuffer);
    timings.processing = performance.now() - t0;

    // Extract server-side metrics from headers
    const serverMetrics = {
      parseMs: parseFloat(response.headers.get('X-DataFusion-Parse-Ms')) || 0,
      executionMs: parseFloat(response.headers.get('X-DataFusion-Execution-Ms')) || 0,
      serializationMs: parseFloat(response.headers.get('X-DataFusion-Serialization-Ms')) || 0,
      totalMs: parseFloat(response.headers.get('X-DataFusion-Total-Ms')) || 0,
      rows: parseInt(response.headers.get('X-DataFusion-Rows')) || 0,
      batches: parseInt(response.headers.get('X-DataFusion-Batches')) || 0,
      bytes: parseInt(response.headers.get('X-DataFusion-Bytes')) || 0,
      columns: parseInt(response.headers.get('X-DataFusion-Columns')) || 0,
      cpuCount: parseInt(response.headers.get('X-DataFusion-CPU-Count')) || 0,
      rowsPerBatch: parseInt(response.headers.get('X-DataFusion-Rows-Per-Batch')) || 0,
    };

    // Store combined metrics
    const combinedMetrics = {
      timestamp: Date.now(),
      server: serverMetrics,
      client: timings,
      totalRoundTrip: timings.network + timings.processing,
    };

    this.lastQueryMetrics = combinedMetrics;
    
    // Add to history
    this.metricsHistory.push(combinedMetrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift(); // Remove oldest
    }

    return { table, timings };
  }

  /**
   * Polls for engine-specific performance metrics.
   * Returns simplified timing breakdown to understand where time is spent.
   * @returns {Promise<Array<{label: string, value: string, rawValue: number, description: string, noSparkline?: boolean}>>}
   */
  async pollEngineStats() {
    const stats = [];
    
    // Server health - static, no sparkline
    // Last query metrics - showing actual server-side breakdown
    if (this.lastQueryMetrics) {
      const m = this.lastQueryMetrics;
      
      // === STATIC METRICS FIRST (no sparklines) ===
      
      // Data volume metrics
      stats.push({
        label: 'Rows',
        value: m.server.rows.toLocaleString(),
        rawValue: m.server.rows,
        description: `Total rows: ${m.server.rows.toLocaleString()}`,
        noSparkline: true
      });
      
      const megabytes = m.server.bytes / (1024 * 1024);
      stats.push({
        label: 'Result Size',
        value: `${megabytes.toFixed(2)} MB`,
        rawValue: megabytes,
        description: `Total memory: ${megabytes.toFixed(2)} MB`,
        noSparkline: true
      });
      
      const bytesPerRow = m.server.rows > 0 ? m.server.bytes / m.server.rows : 0;
      stats.push({
        label: 'Bytes/Row',
        value: `${bytesPerRow.toFixed(1)} B`,
        rawValue: bytesPerRow,
        description: `Avg bytes per row: ${bytesPerRow.toFixed(1)} B`,
        noSparkline: true
      });
      
      // Parallelism configuration
      stats.push({
        label: 'CPU Cores',
        value: m.server.cpuCount.toString(),
        rawValue: m.server.cpuCount,
        description: `Server CPU cores: ${m.server.cpuCount}`,
        noSparkline: true
      });
      
      stats.push({
        label: 'Rows/Batch',
        value: m.server.rowsPerBatch.toLocaleString(),
        rawValue: m.server.rowsPerBatch,
        description: `Avg rows per batch: ${m.server.rowsPerBatch.toLocaleString()}`,
        noSparkline: true
      });
      
      // === DYNAMIC METRICS SECOND (with sparklines) ===
      
      // Server-side timing breakdown
      stats.push({
        label: 'Parse/Plan',
        value: `${m.server.parseMs.toFixed(1)} ms`,
        rawValue: m.server.parseMs,
        description: `SQL parsing + planning: ${m.server.parseMs.toFixed(2)} ms`
      });
      
      stats.push({
        label: 'Execution',
        value: `${m.server.executionMs.toFixed(1)} ms`,
        rawValue: m.server.executionMs,
        description: `Query execution: ${m.server.executionMs.toFixed(2)} ms`
      });
      
      stats.push({
        label: 'Serialization',
        value: `${m.server.serializationMs.toFixed(1)} ms`,
        rawValue: m.server.serializationMs,
        description: `Arrow IPC serialization: ${m.server.serializationMs.toFixed(2)} ms`
      });
      
      const httpOverhead = m.totalRoundTrip - m.server.totalMs;
      stats.push({
        label: 'HTTP Overhead',
        value: `${httpOverhead.toFixed(1)} ms`,
        rawValue: httpOverhead,
        description: `Network + client parsing: ${httpOverhead.toFixed(2)} ms`
      });
      
      stats.push({
        label: 'Total Time',
        value: `${m.totalRoundTrip.toFixed(1)} ms`,
        rawValue: m.totalRoundTrip,
        description: `End-to-end time: ${m.totalRoundTrip.toFixed(2)} ms`
      });
      
      // Throughput metrics - DYNAMIC, keep sparkline
      const rowsPerMs = m.server.executionMs > 0 ? m.server.rows / m.server.executionMs : 0;
      const rowsPerSec = rowsPerMs * 1000;
      
      stats.push({
        label: 'Throughput',
        value: `${(rowsPerSec / 1000).toFixed(1)}K rows/sec`,
        rawValue: rowsPerSec,
        description: 'Query execution throughput'
      });
    }

    return stats;
  }

  /**
   * Returns the metrics history for charting or analysis.
   * @returns {Array<object>} Array of metrics objects with timestamps.
   */
  getMetricsHistory() {
    return this.metricsHistory;
  }

  /**
   * Clears the metrics history.
   */
  clearMetricsHistory() {
    this.metricsHistory = [];
    this.lastQueryMetrics = null;
  }

  /**
   * Returns the list of example shaders for this engine.
   * @returns {Array} The shader list.
   */
  getShaders() {
    return SHADERS;
  }

  /**
   * Loads a specific shader's SQL content.
   * @param {string} shader The shader object or identifier.
   * @returns {Promise<string>} The SQL query text.
   */
  async loadShaderContent(shader) {
    return loadShaderContent(shader);
  }

  /**
   * Profiles a query and collects performance metrics.
   * @param {string} sql The SQL query to profile.
   * @param {Array<any>} params The parameters (width, height, iTime, mx, my).
   * @param {function(string): void} statusCallback Optional callback to report progress.
   * @returns {Promise<object>} The profile data object.
   */
  async profile(sql, params, statusCallback) {
    if (!this.profiler) {
      throw new Error('Profiler not initialized');
    }
    
    // Convert params array to uniforms object
    // params = [width, height, iTime, mx, my]
    const uniforms = {
      iResolution: [params[0], params[1]],
      iTime: params[2],
      iTimeDelta: 0.016,
      iFrame: 0,
      iMouse: [params[3], params[4], 0, 0],
      iDate: [0, 0, 0, 0],
      iAudio: {
        volume: 0,
        bass: 0,
        mid: 0,
        treble: 0,
        isActive: false
      }
    };
    
    return this.profiler.profile(sql, uniforms, statusCallback);
  }

  /**
   * Renders the profiler UI with all module tabs.
   * @param {object} profileData The data object from the profile() method.
   * @param {HTMLElement} mainContainer The container element for the profiler UI.
   * @returns {Promise<void>}
   */
  async renderProfile(profileData, mainContainer) {
    if (!this.profiler) {
      throw new Error('Profiler not initialized');
    }
    return this.profiler.renderProfile(profileData, mainContainer);
  }

  /**
   * Returns the HTML content for the engine-specific settings panel.
   * @returns {string} The HTML string for the settings UI.
   */
  getSettingsPanel() {
    return `
      <h3>DataFusion Connection</h3>
      <p style="font-size: 0.9em; color: #ccc; margin-top: 0; border-left: 3px solid #ffc980; padding-left: 10px;">
        <b>Disclaimer:</b> The DataFusion engine requires a running server instance accessible from your browser.
        By default, it attempts to connect to <code>http://localhost:8124</code> (or <code>http://localhost:8000/datafusion</code> when using the Caddy proxy).<br>
        Be aware of any <b>security implications</b> when allowing this program to connect to your DataFusion server.<br>
        Please see the project's <code>README.md</code> for instructions on running <b>DataFusion via Docker</b>.
      </p>
      <div class="settings-form-group">
        <label for="df-url">Server URL</label>
        <input type="text" id="df-url" placeholder="http://localhost:8000/datafusion">
        <p style="font-size: 0.8em; color: #aaa; margin-top: 5px;">
          The DataFusion HTTP wrapper endpoint. Use <code>http://localhost:8000/datafusion</code> when running via <code>just run</code>, or <code>http://localhost:8124</code> for direct access.
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
    if (document.getElementById('df-url')) {
      document.getElementById('df-url').value = storedSettings.url || defaultSettings.url || '';
    }
  }

  /**
   * Returns the default settings for the DataFusion engine.
   * This is used to populate the settings modal with sensible defaults.
   * @returns {object}
   */
  getSettingsDefaults() {
    return {
      url: 'http://localhost:8000/datafusion'
    };
  }

  /**
   * Reads the current values from the settings modal and saves them to localStorage.
   * This is part of the engine interface, allowing the UI to be fully generic.
   */
  saveSettings() {
    const dfSettings = {
      url: document.getElementById('df-url').value,
    };
    localStorage.setItem('sqlshader.datafusion-settings', JSON.stringify(dfSettings));
    console.log('[DataFusion Engine] Settings saved.');
  }
}

// Export a singleton instance
export const engine = new DataFusionEngine();
