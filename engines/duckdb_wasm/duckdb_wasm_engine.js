import * as duckdb from '@duckdb/duckdb-wasm';
import { SHADERS } from './duckdb_wasm_shaders.js';

/**
 * Implements the Engine interface for DuckDB-WASM.
 */
class DuckDBWasmEngine {
  constructor() {
    this.db = null;
    this.connection = null;
  }

  /**
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

  }

  /**
   * @param {string} sql
   * @returns {Promise<any>} A handle to the prepared query.
   */
  async prepare(sql) {
    return await this.connection.prepare(sql);
  }

  /**
   * Runs a query with profiling enabled and returns the structured profile data.
   * @param {string} sql The raw SQL of the shader to profile.
   * @param {Array<any>} params The parameters for the query.
   * @returns {Promise<object>} The parsed JSON profile output.
   */
  profile = async (sql, params) => {
    console.log('[engine.profile] Step 1: Using new EXPLAIN ANALYZE strategy.');

    // The EXPLAIN ANALYZE command cannot use parameters directly.
    // We must manually substitute the '?' placeholders in the SQL string.
    // This is safe here because the parameters are all numbers controlled by our app.
    let explainedSql = `EXPLAIN ANALYZE ${sql}`;
    console.log('[engine.profile] Step 2: Substituting parameters into the query.');
    for (const param of params) {
      explainedSql = explainedSql.replace('?', param);
    }

    console.log(`[engine.profile] Step 3: Executing query: ${explainedSql.substring(0, 100)}...`);
    // We use the main connection, as this is a simple, non-interfering query.
    const result = await this.connection.query(explainedSql);

    // The result of EXPLAIN ANALYZE is an Arrow Table. The easiest way to get
    // a human-readable query plan is to call its `toString()` method.
    const plan = result.toString();
    console.log('[engine.profile] Step 4: Successfully retrieved query plan. Returning to caller.');
    return plan;
  };

  /**
   * Renders the profile data into an HTML string.
   * @param {string} profileData The raw query plan text.
   * @returns {Promise<string>} A string containing formatted HTML.
   */
  async renderProfile(profileData) {
    const colorCoded = profileData.replace(/(\(actual time: ([\d.]+)s|\(([\d.]+)s\))/g, (match, _, timeStr1, timeStr2) => {
        const time = parseFloat(timeStr1 || timeStr2);
        let colorClass = 'time-good';
        if (time > 0.1) {
            colorClass = 'time-hot';
        } else if (time > 0.01) {
            colorClass = 'time-warm';
        }
        return `<span class="${colorClass}">${match}</span>`;
    });

    return `<pre>${colorCoded}</pre>`;
  }

  /**
   * @returns {Array<{name: string, sql: string}>}
   */
  getShaders() {
    return SHADERS;
  }
}

export const engine = new DuckDBWasmEngine();