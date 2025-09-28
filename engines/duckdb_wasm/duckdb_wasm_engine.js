import * as duckdb from '@duckdb/duckdb-wasm';
import { SHADERS } from './duckdb_wasm_shaders.js';
import { DuckDBWasmProfiler } from './duckdb_wasm_profiler.js';

/**
 * Implements the Engine interface for DuckDB-WASM.
 */
class DuckDBWasmEngine {
  constructor() {
    this.db = null;
    this.connection = null;
    this.profiler = null;
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
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
    );
    const worker = new Worker(workerUrl);
    // Use a VoidLogger to prevent excessive console output during complex queries.
    const logger = new duckdb.VoidLogger();
    this.db = new duckdb.AsyncDuckDB(logger, worker);
    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(workerUrl);

    statusCallback('Connecting to database...');
    this.connection = await this.db.connect();

    this.profiler = new DuckDBWasmProfiler(this.connection);

  }

  /**
   * @param {string} sql
   * This is a required method for the engine interface.
   * @returns {Promise<import('@duckdb/duckdb-wasm').PreparedStatement>} A handle to the prepared query.
   * @returns {Promise<any>} A handle to the prepared query.
   */
  async prepare(sql) {
    return await this.connection.prepare(sql);
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
   * Returns the list of example shaders available for this engine.
   * This is a required method for the engine interface.
   * @returns {Array<{name: string, sql: string}>}
   */
  getShaders() {
    return SHADERS;
  }
}

export const engine = new DuckDBWasmEngine();