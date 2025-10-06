import * as arrow from '@apache/arrow';
import { SHADERS, loadShaderContent } from './dummy_shaders.js';

/**
 * @typedef {import('@apache/arrow').Table} ArrowTable
 */

/**
 * @interface Engine
 * @description Defines the contract for a database engine that can be used by PixelQL.
 * This ensures that the main application can interact with any backend in a consistent way.
 */
/**
 * @function
 * @name Engine#initialize
 * @param {function(string): void} statusCallback - A function to report progress updates.
 * @returns {Promise<void>}
 */
/**
 * @function
 * @name Engine#prepare
 * @param {string} sql - The SQL query string.
 * @returns {Promise<{query: function(...any): Promise<{table: ArrowTable, timings: object}>}>}
 */
/**
 * @function
 * @name Engine#pollEngineStats
 * @returns {Promise<Array<object>>}
 */
/**
 * @function
 * @name Engine#profile
 * @param {string} sql - The SQL query to profile.
 * @param {Array<any>} params - The runtime parameters for the query.
 * @param {function(string): void} statusCallback - A function to report profiling progress.
 * @returns {Promise<object>} - Engine-specific profiling data.
 */

/**
 * Implements the Engine interface for a minimal "dummy" engine.
 * This serves as a template and a test for the application's abstractions.
 * @implements {Engine}
 */
class DummyEngine {
  constructor() {
    // No client needed for this engine.
    this.dummyCounter = 0; // A simple counter for our dummy stat.
  }

  /**
   * A minimal initialization function.
   * @param {function(string): void} statusCallback A function to report progress updates.
   * @returns {Promise<void>}
   */
  async initialize(statusCallback) {
    statusCallback('Dummy engine ready.');
    return Promise.resolve();
  }

  /**
   * A minimal prepare function that does no validation.
   * @param {string} sql The SQL query string.
   * @returns {Promise<{query: function(...any): Promise<{table: ArrowTable, timings: object}>}>}
   */
  async prepare(sql) {
    return {
      query: async (uniforms) => this.query(sql, null, uniforms)
    };
  }

  /**
   * "Executes" a query by returning a static, pre-defined Arrow table.
   * This always returns a single grey pixel, regardless of the input SQL.
   * @param {string} sql The SQL query string (ignored)
   * @param {any} preparedStatement Not used for dummy engine (always null)
   * @param {object} uniforms The uniform object (ignored)
   * @returns {Promise<{table: ArrowTable, timings: object}>}
   */
  async query(sql, preparedStatement, uniforms) {
    // Create a 1x1 pixel table with a grey color.
    const r = new Float32Array([0.5]);
    const g = new Float32Array([0.5]);
    const b = new Float32Array([0.5]);
    const table = arrow.makeTable({ r, g, b });

    // Return minimal timing data.
    return { table, timings: { query: 0.1, network: 0, processing: 0.1 } };
  }

  /**
   * Returns a placeholder for engine-specific stats.
   * @returns {Promise<Array<object>>} An array containing a dummy statistic.
   */
  async pollEngineStats() {
    // Increment the counter by a random amount to make the stat dynamic.
    this.dummyCounter += Math.floor(Math.random() * 10);
    return [
      { 
        label: 'Dummy Counter', 
        value: this.dummyCounter.toLocaleString(), 
        rawValue: this.dummyCounter, 
        description: "A dummy statistic that increments randomly to test the stats UI." 
      }
    ];
  }

  /**
   * Returns a placeholder for profiling.
   * @returns {Promise<object>}
   */
  async profile(sql, params) {
    return { raw: 'Profiling is not supported for the Dummy engine.' };
  }

  /**
   * Renders the placeholder profile data.
   * @param {object} profileData The data from profile().
   * @param {HTMLElement} mainContainer The container to render into.
   */
  async renderProfile(profileData, mainContainer) {
    mainContainer.innerHTML = `<pre>${profileData.raw}</pre>`;
  }

  getShaders() {
    return SHADERS;
  }

  async loadShaderContent(shader) {
    return loadShaderContent(shader);
  }
}

export const engine = new DummyEngine();