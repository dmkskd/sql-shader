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
    this.bundleFile = 'N/A'; // Will hold the name of the selected bundle file.
    this.bundleType = 'N/A'; // Will hold the bundle type (Multi-Threaded/Single-Threaded)
    this.wasmVersion = 'N/A'; // Will hold the DuckDB-WASM wrapper version
  }

  /**
   * Initializes the DuckDB-WASM instance, worker, and database connection.
   * This is a required method for the engine interface.
   * @param {function(string): void} statusCallback A function to report progress updates.
   * @returns {Promise<{preambleErrors?: Array<string>}>} Object with optional preamble errors
   */
  async initialize(statusCallback) {
    statusCallback('Initializing DuckDB-WASM...');
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

    // Try to get the WASM wrapper version from the package
    // The version is typically exposed via the bundle configuration
    this.wasmVersion = duckdb.PACKAGE_VERSION || JSDELIVR_BUNDLES.version || '1.31.0';

    // Log the decision-making process for bundle selection.
    console.log('[DuckDB Engine] DuckDB-WASM version:', this.wasmVersion);
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
    // Remove .worker.js extension to make it more compact
    this.bundleFile = filename.replace('.worker.js', '');
    this.bundleType = isMultiThreaded ? 'Multi-Threaded' : 'Single-Threaded';
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

    // Execute preamble SQL if configured
    const storedSettings = JSON.parse(localStorage.getItem('sqlshader.duckdb_wasm-settings')) || {};
    console.log('[DuckDB Engine] Stored settings:', storedSettings);
    console.log('[DuckDB Engine] Preamble value:', storedSettings.preamble);
    const preambleErrors = [];
    
    if (storedSettings.preamble && storedSettings.preamble.trim()) {
      statusCallback('Executing initialization preamble...');
      console.log('[DuckDB Engine] Executing preamble SQL:', storedSettings.preamble);
      
      // Split preamble into individual statements and execute each one
      // This ensures INSTALL and LOAD are executed as separate statements
      const statements = storedSettings.preamble
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      console.log('[DuckDB Engine] Preamble split into', statements.length, 'statements');
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        console.log(`[DuckDB Engine] Executing statement ${i + 1}/${statements.length}:`, stmt);
        
        try {
          const result = await this.connection.query(stmt);
          console.log(`[DuckDB Engine] Statement ${i + 1} completed:`, result);
        } catch (error) {
          console.error(`[DuckDB Engine] Error in statement ${i + 1}:`, error);
          preambleErrors.push(`Statement: ${stmt}\n\nError: ${error.message}`);
        }
      }
      
      // Check what extensions are loaded after preamble
      try {
        const extensionsResult = await this.connection.query("SELECT extension_name, loaded, installed FROM duckdb_extensions();");
        const extensions = extensionsResult.toArray();
        
        console.log('[DuckDB Engine] ========== EXTENSIONS STATUS ==========');
        console.log('[DuckDB Engine] Total extensions available:', extensions.length);
        
        const loadedExts = extensions.filter(e => e.loaded);
        console.log('[DuckDB Engine] Loaded extensions:', loadedExts.length);
        loadedExts.forEach(e => {
          console.log(`[DuckDB Engine]   ✓ ${e.extension_name} (installed: ${e.installed})`);
        });
        
        const installedExts = extensions.filter(e => e.installed && !e.loaded);
        if (installedExts.length > 0) {
          console.log('[DuckDB Engine] Installed but not loaded:', installedExts.length);
          installedExts.forEach(e => {
            console.log(`[DuckDB Engine]   - ${e.extension_name}`);
          });
        }
        
        console.log('[DuckDB Engine] =======================================');
      } catch (e) {
        console.warn('[DuckDB Engine] Could not query extensions:', e.message);
      }
      
      if (preambleErrors.length === 0) {
        statusCallback('Preamble execution completed successfully');
      } else {
        statusCallback('Warning: Some preamble statements failed');
      }
    }

    this.profiler = new DuckDBWasmProfiler(this.connection);
    
    // Return initialization errors if any occurred
    if (preambleErrors.length > 0) {
      return {
        initializationErrors: preambleErrors,
        errorTitle: 'Preamble Errors',
        errorMessage: 'Some SQL statements in your preamble failed to execute during initialization:'
      };
    }
    
    return {};
  }

  /**
   * @param {string} sql
   * This is a required method for the engine interface.
   * @returns {Promise<import('@duckdb/duckdb-wasm').PreparedStatement>} A handle to the prepared query.
   * @returns {Promise<any>} A handle to the prepared query.
   */
  async prepare(sql) {
    console.log('[DuckDB Engine] Preparing SQL with connection:', this.connection ? 'Connected' : 'Not Connected');
    
    // Verify loaded extensions (for debugging)
    try {
      const extensionsResult = await this.connection.query("SELECT * FROM duckdb_extensions() WHERE loaded = true;");
      console.log('[DuckDB Engine] Currently loaded extensions:', extensionsResult.toArray());
    } catch (e) {
      console.warn('[DuckDB Engine] Could not query loaded extensions:', e.message);
    }
    
    const preparedStatement = await this.connection.prepare(sql);
    
    // Return an object that conforms to the engine interface
    return {
      query: async (uniforms) => this.query(sql, preparedStatement, uniforms)
    };
  }

  /**
   * Execute query with proper parameter translation for DuckDB
   * @param {string} sql - The SQL query 
   * @param {object} preparedStatement - DuckDB prepared statement
   * @param {object} uniforms - Pure JS uniforms from UniformBuilder
   * @returns {Promise<{table: ArrowTable, timings: object}>}
   */
  async query(sql, preparedStatement, uniforms) {
    const t0 = performance.now();
    
    // DuckDB-specific translation: flatten arrays to dot notation for json_extract
    const duckdbParams = {
      'iResolution.x': uniforms.iResolution[0],
      'iResolution.y': uniforms.iResolution[1], 
      'iResolution.z': uniforms.iResolution[2],
      'iMouse.x': uniforms.iMouse[0],
      'iMouse.y': uniforms.iMouse[1],
      'iMouse.z': uniforms.iMouse[2],
      'iMouse.w': uniforms.iMouse[3],
      'iDate.year': uniforms.iDate[0],
      'iDate.month': uniforms.iDate[1],
      'iDate.day': uniforms.iDate[2],
      'iDate.time': uniforms.iDate[3],
      'iTime': uniforms.iTime,
      'iTimeDelta': uniforms.iTimeDelta,
      'iFrameRate': uniforms.iFrameRate,
      'iFrame': uniforms.iFrame,
      'iSampleRate': uniforms.iSampleRate,
      'iAudio.volume': uniforms.iAudio.volume,
      'iAudio.bass': uniforms.iAudio.bass,
      'iAudio.mid': uniforms.iAudio.mid,
      'iAudio.treble': uniforms.iAudio.treble,
      'iAudio.isActive': uniforms.iAudio.isActive
    };
    
    // Execute with DuckDB-formatted parameters
    const table = await preparedStatement.query(JSON.stringify(duckdbParams));
    const t1 = performance.now();
    const timings = { query: t1 - t0 };
    
    return { table, timings };
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
        { label: 'Bundle', value: this.bundleFile, rawValue: 0, description: "The DuckDB-WASM bundle file currently in use (without .worker.js extension)." },
        { label: 'Type', value: this.bundleType, rawValue: 0, description: "MT = Multi-Threaded (requires cross-origin isolation), ST = Single-Threaded." },
        { label: 'WASM', value: `v${this.wasmVersion}`, rawValue: 0, description: "The version of the DuckDB-WASM JavaScript wrapper package." },
        { label: 'DB', value: version, rawValue: 0, description: "The version of the DuckDB core library (C++). From PRAGMA version." },
        { label: 'Memory', value: formatBytes(memoryUsedBytes), rawValue: memoryUsedBytes, description: "Estimated memory usage of the database buffer pool. From PRAGMA database_size." },
        { label: 'Limit', value: settings['memory_limit'], rawValue: 0, description: "The configured memory limit for the database instance. From duckdb_settings()." },
        { label: 'Threads', value: settings['threads'].toLocaleString(), rawValue: settings['threads'], description: "The number of active worker threads for parallel execution. From duckdb_settings()." },
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

  /**
   * Returns the HTML content for the engine-specific settings panel.
   * @returns {string} The HTML string for the settings UI.
   */
  getSettingsPanel() {
    return `
      <h3>DuckDB Configuration</h3>
      <div class="settings-form-group">
        <label for="duckdb-preamble">Initialization Preamble (SQL)</label>
        <textarea id="duckdb-preamble" rows="8" style="width: 800px; max-width: 100%;" placeholder="Enter SQL commands to run when DuckDB initializes&#10;Example:&#10;INSTALL stochastic FROM community;&#10;LOAD stochastic;"></textarea>
        <p style="font-size: 0.8em; color: #aaa; margin-top: 5px;">
          SQL commands that will be executed when DuckDB-WASM initializes. 
          This is useful for installing and loading extensions that should be available throughout the instance lifecycle.
          Each statement should be on a separate line. Comments starting with -- are ignored.
        </p>
      </div>
    `;
  }

  /**
   * Returns the default settings for the DuckDB engine.
   * @returns {object}
   */
  getSettingsDefaults() {
    return {
      preamble: ''
    };
  }

  /**
   * Populates the engine's settings form with stored or default values.
   * @param {object} storedSettings - The settings object from localStorage.
   * @param {object} defaultSettings - The engine's default settings.
   */
  populateSettings(storedSettings, defaultSettings) {
    const preambleElement = document.getElementById('duckdb-preamble');
    if (preambleElement) {
      preambleElement.value = storedSettings.preamble || defaultSettings.preamble || '';
    }
  }

  /**
   * Reads the current values from the settings modal and saves them to localStorage.
   */
  saveSettings() {
    const duckdbSettings = {
      preamble: document.getElementById('duckdb-preamble').value || ''
    };
    localStorage.setItem('sqlshader.duckdb_wasm-settings', JSON.stringify(duckdbSettings));
  }
}

export const engine = new DuckDBWasmEngine();