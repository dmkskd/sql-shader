import * as duckdb from '@duckdb/duckdb-wasm';
import { SHADERS, loadShaderContent } from './duckdb_wasm_shaders.js';
import { DuckDBWasmProfiler } from './duckdb_wasm_profiler.js';

/**
 * Implements the Engine interface for DuckDB-WASM.
 */
class DuckDBWasmEngine {
  constructor() {
    this.db = null;
    this.connection = null;
    this.profiler = null;
    this.bundleInfo = 'N/A'; // Will hold the name of the selected bundle file.
  }

  /**
   * Initializes the DuckDB-WASM instance, worker, and database connection.
   * This is a required method for the engine interface.
   * @param {function(string): void} statusCallback A function to report progress updates.
   * @returns {Promise<void>}
   */
  async initialize(statusCallback) {
    statusCallback('Initializing DuckDB-WASM...');
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

    // Log the decision-making process for bundle selection.
    console.log('[DuckDB Engine] Available bundles:', JSDELIVR_BUNDLES);
    console.log("[DuckDB Engine] Requesting 'mt' (multi-threaded) bundle...");

    // Explicitly select the multi-threaded bundle if the environment supports it.
    // This ensures we get maximum performance when cross-origin isolation is enabled.
    // It will gracefully fall back to a single-threaded version if not supported.
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES, 'mt');

    // Determine if the selected bundle is multi-threaded for descriptive logging and stats.
    const isMultiThreaded = bundle.mainWorker.includes('-mt') || bundle.mainWorker.includes('-mvp');
    const filename = bundle.mainWorker.split('/').pop();

    // Store the bundle information for display in the stats panel.
    this.bundleInfo = `${filename} (${isMultiThreaded ? 'Multi-Threaded' : 'Single-Threaded'})`;
    console.log(`[DuckDB Engine] Selected bundle: ${filename}`, bundle);

    // To avoid cross-origin issues in local development, create a Blob URL for the worker.
    // This makes the browser treat the worker as if it's from the same origin.
    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
    );
    const worker = new Worker(workerUrl);
    // Use a VoidLogger to prevent excessive console output during complex queries.
    const logger = new duckdb.VoidLogger();
    this.db = new duckdb.AsyncDuckDB(logger, worker);
    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(workerUrl); // Clean up the Blob URL after the worker is instantiated.

    statusCallback('Connecting to database...');
    this.connection = await this.db.connect();

    // Check if the selected bundle supports multi-threading before attempting to set the thread count.
    // Single-threaded builds (like -eh) will throw an error if this is attempted.
    if (isMultiThreaded) {
      // Explicitly set the number of threads to the maximum available hardware concurrency.
      // This ensures consistent performance and overrides any lower default values.
      const hardwareConcurrency = navigator.hardwareConcurrency || 4; // Default to 4 if unavailable
      await this.connection.query(`PRAGMA threads=${hardwareConcurrency};`);
      statusCallback(`DuckDB-WASM ready. Worker threads set to ${hardwareConcurrency}.`);
      console.log(`[DuckDB Engine] Multi-threaded bundle loaded. Worker threads set to ${hardwareConcurrency}.`);
    } else {
      statusCallback('DuckDB-WASM ready. (Single-threaded bundle).');
      console.log('[DuckDB Engine] Single-threaded bundle loaded. Thread count cannot be changed.');
    }

    this.profiler = new DuckDBWasmProfiler(this.connection);

  }

  /**
   * @param {string} sql
   * This is a required method for the engine interface.
   * @returns {Promise<import('@duckdb/duckdb-wasm').PreparedStatement>} A handle to the prepared query.
   * @returns {Promise<any>} A handle to the prepared query.
   */
  async prepare(sql) {
    const preparedStatement = await this.connection.prepare(sql);
    // Return an object that conforms to the new interface, which expects
    // the query result to be wrapped in an object with `table` and `timings` properties.
    return {
      query: async (...args) => {
        const t0 = performance.now();
        const table = await preparedStatement.query(...args);
        const t1 = performance.now();
        const timings = { query: t1 - t0 };
        return { table, timings };
      }
    };
  }

  /**
   * Terminates the DuckDB worker and releases resources.
   * This is crucial for ensuring a clean state when switching engines.
   */
  async terminate() {
    if (this.db) {
      console.log('[DuckDB Engine] Terminating worker.');
      await this.db.terminate();
    }
  }

  /**
   * Runs a query with profiling enabled and returns the raw and JSON profile data.
   * @param {string} sql The raw SQL of the shader to profile.
   * This is a required method for the engine interface.
   * @param {Array<any>} params The parameters for the query.
   * @returns {Promise<object>} The parsed JSON profile output.
   */
  profile(sql, params) {
    return this.profiler.profile(sql, params);
  }

  /**
   * Renders the multi-faceted profile data into the modal.
   * @param {object} profileData The profile data object from the profile() method.
   * This is a required method for the engine interface.
   * @param {HTMLElement} mainContainer The single container element for the profiler UI.
   * @returns {Promise<void>}
   */
  async renderProfile(profileData, mainContainer) {
    return this.profiler.renderProfile(profileData, mainContainer);
  }

  /**
   * Polls PRAGMA tables for engine-specific performance metrics.
   * @returns {Promise<Array<{label: string, value: string, rawValue: number}>>} A list of stats to display.
   */
  async pollEngineStats() {
    if (!this.connection) {
      return [];
    }
    try {
      const queries = {
        version: "PRAGMA version;",
        db_size: "PRAGMA database_size;",
        settings: "SELECT name, value FROM duckdb_settings() WHERE name IN ('threads', 'memory_limit');",
      };

      const [versionResult, dbSizeResult, settingsResult] = await Promise.all([
        this.connection.query(queries.version),
        this.connection.query(queries.db_size),
        this.connection.query(queries.settings),
      ]);

      const version = versionResult.getChild('library_version').get(0);

      // Extract settings into a map for easy access
      const settings = {};
      const settingsTable = settingsResult.toArray().map(row => row.toJSON());
      for (const setting of settingsTable) {
        settings[setting.name] = setting.value;
      }

      // PRAGMA database_size returns BIGINTs, which must be converted to Numbers
      // for use with Math functions and for the performance monitor's sparkline.
      const usedBlocks = Number(dbSizeResult.getChild('used_blocks').get(0));
      const blockSize = Number(dbSizeResult.getChild('block_size').get(0));
      const memoryUsedBytes = usedBlocks * blockSize;

      const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${['B', 'KB', 'MB', 'GB'][i]}`;
      };
      return [
        { label: 'Bundle', value: this.bundleInfo, rawValue: 0, description: "The DuckDB-WASM bundle file currently in use. 'mt' bundles support multi-threading." },
        { label: 'DB Version', value: version, rawValue: 0, description: "The version of the DuckDB library. From PRAGMA version." },
        { label: 'Memory Used', value: formatBytes(memoryUsedBytes), rawValue: memoryUsedBytes, description: "Estimated memory usage of the database buffer pool. From PRAGMA database_size." },
        { label: 'Memory Limit', value: settings['memory_limit'], rawValue: 0, description: "The configured memory limit for the database instance. From duckdb_settings()." },
        { label: 'Worker Threads', value: settings['threads'].toLocaleString(), rawValue: settings['threads'], description: "The number of active worker threads for parallel execution. From duckdb_settings()." },
      ];

    } catch (e) {
      console.error("Failed to poll DuckDB-WASM stats:", e);
      return [{ label: 'Engine Stats', value: 'Error', rawValue: 0 }];
    }
  }

  /**
   * Returns the list of example shaders available for this engine.
   * This is a required method for the engine interface.
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
    // Delegate to the loader function in the shaders file.
    return loadShaderContent(shader);
  }
}

export const engine = new DuckDBWasmEngine();