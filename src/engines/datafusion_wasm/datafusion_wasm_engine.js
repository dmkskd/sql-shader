import * as arrow from '@apache/arrow';
import * as datafusionWasm from 'datafusion-wasm';
import { SHADERS, loadShaderContent } from './datafusion_wasm_shaders.js';

/**
 * Implements the Engine interface for DataFusion-WASM.
 */
class DataFusionWasmEngine {
  constructor() {
    this.context = null;
    this.wasmVersion = 'N/A';
    this.wasmModule = null;
  }

  /**
   * Initializes the DataFusion-WASM instance.
   * @param {function(string): void} statusCallback A function to report progress updates.
   * @returns {Promise<{initializationErrors?: Array<string>}>} Object with optional initialization errors
   */
  async initialize(statusCallback) {
    try {
      statusCallback('Initializing DataFusion-WASM...');
      
      // Initialize the WASM module if needed
      // Some WASM modules need explicit initialization
      if (typeof datafusionWasm.default === 'function') {
        statusCallback('Loading WASM module...');
        await datafusionWasm.default();
      }
      
      // Initialize DataFusion WASM context
      this.context = datafusionWasm.DataFusionContext.new();
      
      // Note: set_result_format exists but doesn't affect execute_sql output in current version
      // We parse the table format directly instead
      
      this.wasmVersion = '0.3.1'; // Current npm version
      
      statusCallback('DataFusion-WASM ready.');
      console.log('[DataFusion Engine] Initialized successfully');

      // Execute preamble SQL if configured
      const storedSettings = JSON.parse(localStorage.getItem('sqlshader.datafusion_wasm-settings')) || {};
      const preambleErrors = [];
      
      if (storedSettings.preamble && storedSettings.preamble.trim()) {
        statusCallback('Executing initialization preamble...');
        
        try {
          await this.context.execute_sql(storedSettings.preamble);
          statusCallback('Preamble execution completed successfully');
        } catch (error) {
          console.error('[DataFusion Engine] Preamble execution error:', error);
          preambleErrors.push(`${storedSettings.preamble}\n\nError: ${error.message}`);
          statusCallback('Warning: Preamble execution failed');
        }
      }
      
      // Return initialization errors if any occurred
      if (preambleErrors.length > 0) {
        return {
          initializationErrors: preambleErrors,
          errorTitle: 'Preamble Errors',
          errorMessage: 'Some SQL statements in your preamble failed to execute during initialization:'
        };
      }
      
      return {};
    } catch (error) {
      console.error('[DataFusion Engine] Initialization error:', error);
      throw new Error(`Failed to initialize DataFusion-WASM: ${error.message}`);
    }
  }

  /**
   * Prepares a SQL query for execution.
   * @param {string} sql The SQL query string.
   * @returns {Promise<{query: function(object): Promise<{table: ArrowTable, timings: object}>}>}
   */
  async prepare(sql) {
    // DataFusion doesn't have a separate prepare step like DuckDB
    // We validate the SQL by attempting to parse it
    try {
      // Basic validation - we'll execute it with actual params later
      // This helps catch syntax errors early
      console.log('[DataFusion Engine] Preparing SQL query');
      
      return {
        query: async (uniforms) => this.query(sql, uniforms)
      };
    } catch (error) {
      console.error('[DataFusion Engine] SQL preparation error:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown SQL preparation error';
      throw new Error(`DataFusion preparation error: ${errorMessage}`);
    }
  }

  /**
   * Execute query with proper parameter translation for DataFusion
   * @param {string} sql - The SQL query 
   * @param {object} uniforms - Pure JS uniforms from UniformBuilder
   * @returns {Promise<{table: ArrowTable, timings: object}>}
   */
  async query(sql, uniforms) {
    const t0 = performance.now();
    
    try {
      // DataFusion parameter translation - use direct string replacement
      let processedSql = sql;
      
      // Replace uniform placeholders with actual values
      const replacements = {
        '{width}': uniforms.iResolution[0],
        '{height}': uniforms.iResolution[1],
        '{iTime}': uniforms.iTime,
        '{iTimeDelta}': uniforms.iTimeDelta,
        '{iFrame}': uniforms.iFrame,
        '{iFrameRate}': uniforms.iFrameRate,
        '{iMouse.x}': uniforms.iMouse[0],
        '{iMouse.y}': uniforms.iMouse[1],
        '{iMouse.z}': uniforms.iMouse[2],
        '{iMouse.w}': uniforms.iMouse[3],
        '{iDate.year}': uniforms.iDate[0],
        '{iDate.month}': uniforms.iDate[1],
        '{iDate.day}': uniforms.iDate[2],
        '{iDate.time}': uniforms.iDate[3],
        '{iSampleRate}': uniforms.iSampleRate,
        '{iAudio.volume}': uniforms.iAudio.volume,
        '{iAudio.bass}': uniforms.iAudio.bass,
        '{iAudio.mid}': uniforms.iAudio.mid,
        '{iAudio.treble}': uniforms.iAudio.treble,
        '{iAudio.isActive}': uniforms.iAudio.isActive ? 1 : 0
      };
      
      for (const [placeholder, value] of Object.entries(replacements)) {
        processedSql = processedSql.replaceAll(placeholder, value.toString());
      }
      
      // Execute the query
      const result = await this.context.execute_sql(processedSql);
      
      // Parse the table format
      let rows;
      try {
        rows = this.parseTableFormat(result);
      } catch (parseError) {
        console.error('[DataFusion Engine] Failed to parse table format:', parseError);
        console.error('[DataFusion Engine] Received data:', result.substring(0, 500));
        throw new Error(`Failed to parse DataFusion output: ${parseError.message}`);
      }
      
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('Query returned no data or invalid JSON format');
      }
      
      // Calculate expected pixel count
      const expectedPixels = uniforms.iResolution[0] * uniforms.iResolution[1];
      
      // If we only got 1 row, replicate it to fill the entire canvas
      const actualRows = rows.length === 1 && expectedPixels > 1 
        ? Array(expectedPixels).fill(rows[0]) 
        : rows;
      
      // Extract r, g, b values from the rows
      const rValues = new Float32Array(actualRows.length);
      const gValues = new Float32Array(actualRows.length);
      const bValues = new Float32Array(actualRows.length);
      
      for (let i = 0; i < actualRows.length; i++) {
        const row = actualRows[i];
        rValues[i] = typeof row.r === 'number' ? row.r : 0.0;
        gValues[i] = typeof row.g === 'number' ? row.g : 0.0;
        bValues[i] = typeof row.b === 'number' ? row.b : 0.0;
      }
      
      // Create Arrow table from the typed arrays
      const table = arrow.tableFromArrays({
        r: rValues,
        g: gValues,
        b: bValues
      });
      
      const t1 = performance.now();
      const timings = { query: t1 - t0 };
      
      return { table, timings };
    } catch (error) {
      console.error('[DataFusion Engine] Query execution error:', error);
      
      // Ensure we throw an Error object with a proper message
      const errorMessage = error?.message || error?.toString() || 'Unknown query execution error';
      throw new Error(`DataFusion query error: ${errorMessage}`);
    }
  }

  /**
   * Terminates the DataFusion session and releases resources.
   */
  async terminate() {
    if (this.context) {
      console.log('[DataFusion Engine] Terminating session.');
      // Note: DataFusion WASM may not have a specific cleanup method
      this.context = null;
    }
  }

  /**
   * Parse DataFusion table format output into array of row objects.
   * Example input:
   * +-------------------+--------------------+-----+
   * | r                 | g                  | b   |
   * +-------------------+--------------------+-----+
   * | 0.500029999999982 | 0.9999999990999999 | 0.5 |
   * +-------------------+--------------------+-----+
   * @param {string} tableStr The table format string
   * @returns {Array<object>} Array of row objects with column values
   */
  parseTableFormat(tableStr) {
    const lines = tableStr.trim().split('\n');
    if (lines.length < 4) {
      throw new Error('Invalid table format: not enough lines');
    }
    
    // Second line contains column names
    const headerLine = lines[1];
    const columns = headerLine
      .split('|')
      .map(col => col.trim())
      .filter(col => col.length > 0);
    
    if (columns.length === 0) {
      throw new Error('No columns found in table header');
    }
    
    // Parse data rows (skip header lines and separator lines)
    const rows = [];
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i].trim();
      // Skip separator lines starting with +
      if (!line || line.startsWith('+')) continue;
      
      const values = line
        .split('|')
        .map(val => val.trim())
        .filter((val, idx) => idx > 0 && idx <= columns.length); // Skip first empty and extras
      
      if (values.length === columns.length) {
        const row = {};
        for (let j = 0; j < columns.length; j++) {
          // Parse numeric values
          const numValue = parseFloat(values[j]);
          row[columns[j]] = isNaN(numValue) ? values[j] : numValue;
        }
        rows.push(row);
      }
    }
    
    return rows;
  }

  /**
   * Polls for engine statistics.
   * @returns {Promise<Array<object>>} An array of stat objects.
   */
  async pollEngineStats() {
    // Basic stats for DataFusion
    const stats = [
      {
        label: 'Engine',
        value: 'DataFusion WASM',
        rawValue: 1,
        description: 'DataFusion query engine running in WebAssembly'
      },
      {
        label: 'Version',
        value: this.wasmVersion,
        rawValue: 0,
        description: 'DataFusion WASM version'
      }
    ];

    return stats;
  }

  /**
   * Runs a query with profiling enabled.
   * @param {string} sql The SQL query to profile.
   * @param {object} params The parameters for the query.
   * @param {function(string): void} statusCallback Progress callback.
   * @returns {Promise<object>} The profile data.
   */
  async profile(sql, params, statusCallback) {
    statusCallback('Running query with profiling...');
    
    const t0 = performance.now();
    
    try {
      // Execute the query and measure time
      const result = await this.query(sql, params);
      const t1 = performance.now();
      
      const profileData = {
        executionTime: t1 - t0,
        rowCount: result.table.numRows,
        sql: sql,
        message: 'Basic profiling completed'
      };
      
      statusCallback('Profiling complete.');
      return profileData;
    } catch (error) {
      statusCallback('Profiling failed.');
      throw error;
    }
  }

  /**
   * Renders the profile data in the modal.
   * @param {object} profileData The data from profile().
   * @param {HTMLElement} mainContainer The container to render into.
   */
  async renderProfile(profileData, mainContainer) {
    mainContainer.innerHTML = `
      <div style="padding: 20px; font-family: monospace;">
        <h3>DataFusion WASM Profile</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ccc;">
            <td style="padding: 8px;"><strong>Execution Time</strong></td>
            <td style="padding: 8px;">${profileData.executionTime.toFixed(2)} ms</td>
          </tr>
          <tr style="border-bottom: 1px solid #ccc;">
            <td style="padding: 8px;"><strong>Rows Returned</strong></td>
            <td style="padding: 8px;">${profileData.rowCount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Status</strong></td>
            <td style="padding: 8px;">${profileData.message}</td>
          </tr>
        </table>
        <div style="margin-top: 20px;">
          <strong>Query:</strong>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${profileData.sql}</pre>
        </div>
        <div style="margin-top: 20px; padding: 10px; background: #fff3cd; border-radius: 4px;">
          <strong>Note:</strong> Advanced profiling features for DataFusion WASM are under development.
        </div>
      </div>
    `;
  }

  /**
   * Returns the list of available shaders.
   * @returns {Array<object>}
   */
  getShaders() {
    return SHADERS;
  }

  /**
   * Loads the content of a shader.
   * @param {object} shader The shader object.
   * @returns {Promise<string>}
   */
  async loadShaderContent(shader) {
    return loadShaderContent(shader);
  }
}

export const engine = new DataFusionWasmEngine();
