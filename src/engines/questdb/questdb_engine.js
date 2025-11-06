import * as arrow from '@apache/arrow';
import { SHADERS, loadShaderContent } from './questdb_shaders.js';
import { profileQuery, renderProfile as renderProfileImpl } from './questdb_profiler.js';

/**
 * Implements the Engine interface for QuestDB.
 * This is a minimal test implementation.
 */
class QuestDBEngine {
  constructor() {
    this.baseUrl = 'http://localhost:8000/questdb';
    this.serverVersion = null;
    this.protocol = 'http'; // 'http' or 'pg' (PostgreSQL wire protocol)
    this.pgClient = null; // Will be initialized if protocol is 'pg'
  }

  /**
   * Initializes the QuestDB connection.
   * @param {function(string): void} statusCallback A function to report progress updates.
   * @returns {Promise<void>}
   */
  async initialize(statusCallback) {
    statusCallback('Initializing QuestDB engine...');

    // Load settings from localStorage
    const storedSettings = JSON.parse(localStorage.getItem('sqlshader.questdb-settings')) || {};
    console.log('[QuestDB] Loaded settings from localStorage:', storedSettings);
    
    this.protocol = storedSettings.protocol || 'http';
    this.baseUrl = storedSettings.url || 'http://localhost:8000/questdb';
    
    // PostgreSQL settings (only used if protocol is 'pg')
    this.pgHost = storedSettings.pgHost || 'localhost';
    this.pgPort = storedSettings.pgPort || 8813; // WebSocket proxy port on host
    this.pgDatabase = storedSettings.pgDatabase || 'qdb';
    this.pgUser = storedSettings.pgUser || 'admin';
    this.pgPassword = storedSettings.pgPassword || 'quest';

    console.log(`[QuestDB] Protocol: ${this.protocol}`);
    console.log(`[QuestDB] pgHost: ${this.pgHost}, pgPort: ${this.pgPort}`);
    if (this.protocol === 'http') {
      console.log('[QuestDB] HTTP URL:', this.baseUrl);
    } else {
      console.log('[QuestDB] PostgreSQL:', `${this.pgHost}:${this.pgPort}/${this.pgDatabase}`);
    }

    // Test connection based on protocol
    try {
      if (this.protocol === 'http') {
        const response = await fetch(`${this.baseUrl}/exec?query=SELECT%20version()`, {
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.dataset && data.dataset.length > 0) {
          this.serverVersion = data.dataset[0][0];
          console.log('[QuestDB] Server version:', this.serverVersion);
        }
      } else if (this.protocol === 'pg') {
        // Initialize PostgreSQL WebSocket connection
        await this.initializePgConnection();
        statusCallback('Testing PostgreSQL connection...');
        
        // Test the connection
        const versionResult = await this.queryViaPg('SELECT version()');
        if (versionResult && versionResult.length > 0) {
          this.serverVersion = versionResult[0].version;
          console.log('[QuestDB] PostgreSQL version:', this.serverVersion);
        }
      }

      statusCallback('QuestDB engine ready.');
    } catch (e) {
      console.error('[QuestDB] Connection error:', e.message);
      const errorMsg = `Could not connect to QuestDB: ${e.message}`;
      statusCallback(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Prepares a query by returning an object that can execute it.
   * Validates the SQL syntax by executing it with dummy parameters.
   * @param {string} sql The SQL query string.
   * @returns {Promise<{query: function(...any): Promise<{table: import('@apache/arrow').Table, timings: object}>}>}
   */
  async prepare(sql) {
    // Validate SQL by doing a test query with dummy uniforms
    // This catches syntax errors during compilation instead of runtime
    const dummyUniforms = {
      iResolution: [320, 240],
      iTime: 0,
      iMouse: [0, 0],
      iFrame: 0,
      iTimeDelta: 0,
      iFrameRate: 60
    };
    
    try {
      // Test the query to validate syntax
      await this.query(sql, null, dummyUniforms);
    } catch (e) {
      // Re-throw the error so it's caught as a compilation error
      throw new Error(`SQL syntax error: ${e.message}`);
    }
    
    // Return a query executor
    return {
      query: async (uniforms) => this.query(sql, null, uniforms)
    };
  }

  /**
   * Initializes PostgreSQL WebSocket connection.
   * 
   * Note: Browsers cannot make raw TCP connections to PostgreSQL directly.
   * This requires a WebSocket-to-PostgreSQL proxy server such as:
   * - pgwire-ws: npm install -g pgwire-ws && pgwire-ws --host localhost --port 8812
   * - Custom proxy using Node.js 'ws' and 'pg' packages
   * 
   * The proxy should accept WebSocket connections and forward them as PostgreSQL
   * wire protocol messages. The message format is simplified JSON:
   * - Auth: {type: 'auth', database, user, password}
   * - Query: {type: 'query', id, sql}
   * - Response: {type: 'result'|'error', id, rows, message}
   * 
   * @private
   */
  async initializePgConnection() {
    // Create a simple WebSocket-based PostgreSQL client
    // This assumes a WebSocket proxy is running (e.g., on ws://localhost:8813)
    const wsUrl = `ws://${this.pgHost}:${this.pgPort}`;
    
    return new Promise((resolve, reject) => {
      try {
        this.pgClient = new WebSocket(wsUrl);
        
        this.pgClient.onopen = () => {
          console.log('[QuestDB] PostgreSQL WebSocket connection opened');
          // Send authentication message (simplified PostgreSQL wire protocol)
          const authMsg = JSON.stringify({
            type: 'auth',
            database: this.pgDatabase,
            user: this.pgUser,
            password: this.pgPassword
          });
          this.pgClient.send(authMsg);
        };
        
        this.pgClient.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.type === 'ready') {
            console.log('[QuestDB] PostgreSQL connection authenticated');
            resolve();
          } else if (msg.type === 'error') {
            reject(new Error(msg.message));
          }
        };
        
        this.pgClient.onerror = (error) => {
          console.error('[QuestDB] WebSocket error:', error);
          reject(new Error('WebSocket connection failed. Make sure a PostgreSQL WebSocket proxy is running.'));
        };
        
        // Timeout after 5 seconds
        setTimeout(() => {
          if (this.pgClient.readyState !== WebSocket.OPEN) {
            reject(new Error('PostgreSQL connection timeout. Make sure the WebSocket proxy is running.'));
          }
        }, 5000);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Executes a query via PostgreSQL WebSocket connection.
   * @private
   * @param {string} sql The SQL query string
   * @returns {Promise<Array<object>>} Query result rows
   */
  async queryViaPg(sql) {
    return new Promise((resolve, reject) => {
      if (!this.pgClient || this.pgClient.readyState !== WebSocket.OPEN) {
        reject(new Error('PostgreSQL connection not established'));
        return;
      }
      
      const queryId = Date.now();
      const queryMsg = JSON.stringify({
        type: 'query',
        id: queryId,
        sql: sql
      });
      
      const messageHandler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === queryId) {
          this.pgClient.removeEventListener('message', messageHandler);
          if (msg.type === 'result') {
            resolve(msg.rows);
          } else if (msg.type === 'error') {
            reject(new Error(msg.message));
          }
        }
      };
      
      this.pgClient.addEventListener('message', messageHandler);
      this.pgClient.send(queryMsg);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        this.pgClient.removeEventListener('message', messageHandler);
        reject(new Error('Query timeout'));
      }, 30000);
    });
  }

  /**
   * Executes a query against QuestDB.
   * Routes to HTTP or PostgreSQL based on protocol setting.
   * @param {string} sql The SQL query string
   * @param {any} preparedStatement Not used for QuestDB
   * @param {object} uniforms The uniform object with ShaderToy-style parameters
   * @returns {Promise<{table: import('@apache/arrow').Table, timings: object}>}
   */
  async query(sql, preparedStatement, uniforms) {
    if (this.protocol === 'pg') {
      return await this.queryViaPgWire(sql, uniforms);
    } else {
      return await this.queryViaHttp(sql, uniforms);
    }
  }

  /**
   * Executes a query against QuestDB via HTTP/REST.
   * @private
   * @param {string} sql The SQL query string
   * @param {object} uniforms The uniform object with ShaderToy-style parameters
   * @returns {Promise<{table: import('@apache/arrow').Table, timings: object}>}
   */
  async queryViaHttp(sql, uniforms) {
    const startTime = performance.now();

    // QuestDB requires constants for long_sequence(), so we need to substitute values directly
    // We'll replace placeholder tokens in the SQL with actual values
    const width = uniforms.iResolution[0];
    const height = uniforms.iResolution[1];
    const totalPixels = width * height;
    
    // Replace uniform placeholders in the SQL
    // Users can use: {width}, {height}, {iTime}, {mouseX}, {mouseY}, {iFrame}, {pixels}
    let finalSql = sql
      .replace(/{width}/g, width)
      .replace(/{height}/g, height)
      .replace(/{pixels}/g, totalPixels)
      .replace(/{iTime}/g, uniforms.iTime)
      .replace(/{mouseX}/g, uniforms.iMouse[0])
      .replace(/{mouseY}/g, uniforms.iMouse[1])
      .replace(/{iFrame}/g, uniforms.iFrame)
      .replace(/{iTimeDelta}/g, uniforms.iTimeDelta)
      .replace(/{iFrameRate}/g, uniforms.iFrameRate);

    try {
      console.log('[QuestDB] Executing SQL:', finalSql);
      
      const response = await fetch(`${this.baseUrl}/exec?query=${encodeURIComponent(finalSql)}`, {
        method: 'GET'
      });

      const networkTime = performance.now() - startTime;

      // Log the response for debugging
      const responseText = await response.text();
      console.log('[QuestDB] Response status:', response.status);
      console.log('[QuestDB] Response text:', responseText.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[QuestDB] Failed to parse JSON response:', parseError);
        console.error('[QuestDB] Response was:', responseText);
        throw new Error(`Invalid JSON response from QuestDB: ${parseError.message}`);
      }
      
      // Check for errors in the response
      if (!response.ok || data.error) {
        const errorMsg = data.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('[QuestDB] Query failed:', errorMsg);
        console.error('[QuestDB] SQL:', finalSql);
        throw new Error(`QuestDB error: ${errorMsg}`);
      }

      const processingStart = performance.now();

      // Convert QuestDB JSON response to Arrow table
      // Expected format: { columns: [...], dataset: [[...], [...]], count: N }
      if (!data.columns || !data.dataset) {
        throw new Error('Invalid response format from QuestDB');
      }

      // Find r, g, b columns
      const rIdx = data.columns.findIndex(col => col.name === 'r');
      const gIdx = data.columns.findIndex(col => col.name === 'g');
      const bIdx = data.columns.findIndex(col => col.name === 'b');

      if (rIdx === -1 || gIdx === -1 || bIdx === -1) {
        const foundColumns = data.columns.map(col => col.name).join(', ');
        throw new Error(`Query must return columns named r, g, b. Found columns: ${foundColumns}`);
      }

      // Extract color values
      const r = new Float32Array(data.dataset.length);
      const g = new Float32Array(data.dataset.length);
      const b = new Float32Array(data.dataset.length);

      for (let i = 0; i < data.dataset.length; i++) {
        r[i] = parseFloat(data.dataset[i][rIdx]) || 0;
        g[i] = parseFloat(data.dataset[i][gIdx]) || 0;
        b[i] = parseFloat(data.dataset[i][bIdx]) || 0;
      }

      const table = arrow.makeTable({ r, g, b });
      const processingTime = performance.now() - processingStart;
      const totalTime = performance.now() - startTime;

      return {
        table,
        timings: {
          query: totalTime,
          network: networkTime,
          processing: processingTime
        }
      };
    } catch (e) {
      console.error('[QuestDB] HTTP Query error:', e);
      throw e;
    }
  }

  /**
   * Executes a query against QuestDB via PostgreSQL wire protocol (WebSocket).
   * @private
   * @param {string} sql The SQL query string
   * @param {object} uniforms The uniform object with ShaderToy-style parameters
   * @returns {Promise<{table: import('@apache/arrow').Table, timings: object}>}
   */
  async queryViaPgWire(sql, uniforms) {
    const startTime = performance.now();

    // Replace uniform placeholders in the SQL (same as HTTP version)
    const width = uniforms.iResolution[0];
    const height = uniforms.iResolution[1];
    const totalPixels = width * height;
    
    let finalSql = sql
      .replace(/{width}/g, width)
      .replace(/{height}/g, height)
      .replace(/{pixels}/g, totalPixels)
      .replace(/{iTime}/g, uniforms.iTime)
      .replace(/{mouseX}/g, uniforms.iMouse[0])
      .replace(/{mouseY}/g, uniforms.iMouse[1])
      .replace(/{iFrame}/g, uniforms.iFrame)
      .replace(/{iTimeDelta}/g, uniforms.iTimeDelta)
      .replace(/{iFrameRate}/g, uniforms.iFrameRate);

    try {
      console.log('[QuestDB] Executing SQL via PostgreSQL:', finalSql);
      
      const rows = await this.queryViaPg(finalSql);
      const networkTime = performance.now() - startTime;
      
      const processingStart = performance.now();
      
      // Convert PostgreSQL result rows to Arrow table format
      // Expected: rows = [{r: 0.5, g: 0.3, b: 0.8}, ...]
      if (!rows || rows.length === 0) {
        throw new Error('No data returned from PostgreSQL query');
      }
      
      // Check that the first row has r, g, b columns
      const firstRow = rows[0];
      if (!('r' in firstRow) || !('g' in firstRow) || !('b' in firstRow)) {
        const foundColumns = Object.keys(firstRow).join(', ');
        throw new Error(`Query must return columns named r, g, b. Found columns: ${foundColumns}`);
      }
      
      // Extract color values
      const r = new Float32Array(rows.length);
      const g = new Float32Array(rows.length);
      const b = new Float32Array(rows.length);
      
      for (let i = 0; i < rows.length; i++) {
        r[i] = parseFloat(rows[i].r) || 0;
        g[i] = parseFloat(rows[i].g) || 0;
        b[i] = parseFloat(rows[i].b) || 0;
      }
      
      const table = arrow.makeTable({ r, g, b });
      const processingTime = performance.now() - processingStart;
      const totalTime = performance.now() - startTime;
      
      return {
        table,
        timings: {
          query: totalTime,
          network: networkTime,
          processing: processingTime
        }
      };
    } catch (e) {
      console.error('[QuestDB] PostgreSQL Query error:', e);
      throw e;
    }
  }

  /**
   * Returns engine statistics.
   * @returns {Promise<Array<object>>}
   */
  async pollEngineStats() {
    const protocolLabel = this.protocol === 'pg' ? 'PostgreSQL' : 'HTTP/REST';
    const stats = [
      {
        label: 'Version',
        value: this.serverVersion || 'Unknown',
        rawValue: this.serverVersion,
        description: 'QuestDB server version.'
      },
      {
        label: 'Protocol',
        value: protocolLabel,
        rawValue: this.protocol,
        description: 'Connection protocol (HTTP or PostgreSQL wire protocol).'
      },
      {
        label: 'Status',
        value: 'Connected',
        rawValue: 1,
        description: 'Connection status to QuestDB server.'
      }
    ];

    return stats;
  }

  /**
   * Profiles a query using QuestDB's EXPLAIN and system statistics.
   * @param {string} sql The SQL query.
   * @param {Array} params Uniforms passed to the query ([width, height, time, mouseX, mouseY]).
   * @returns {Promise<object>} Profile data including EXPLAIN plan and timing.
   */
  async profile(sql, params) {
    return profileQuery(this, sql, params);
  }

  /**
   * Renders the profile data with EXPLAIN plan and performance metrics.
   * @param {object} profileData The data from profile().
   * @param {HTMLElement} mainContainer The container to render into.
   */
  async renderProfile(profileData, mainContainer) {
    return renderProfileImpl(profileData, mainContainer);
  }

  getShaders() {
    return SHADERS;
  }

  async loadShaderContent(shader) {
    return loadShaderContent(shader);
  }

  getProfiler() {
    return null;
  }

  /**
   * Terminates the engine and cleans up resources.
   * This is called when switching engines or before page unload.
   */
  async terminate() {
    if (this.pgClient && this.pgClient.readyState === WebSocket.OPEN) {
      console.log('[QuestDB] Closing PostgreSQL WebSocket connection');
      this.pgClient.close();
      this.pgClient = null;
    }
  }

  /**
   * Returns HTML for the settings panel.
   * @returns {string} HTML string for settings.
   */
  getSettingsPanel() {
    return `
      <h3>QuestDB Connection</h3>
      <p style="font-size: 0.9em; color: #ccc; margin-top: 0; border-left: 3px solid #ffc980; padding-left: 10px;">
        <b>Note:</b> QuestDB supports both HTTP/REST and PostgreSQL wire protocol.<br>
        Choose based on your setup and performance requirements.
      </p>
      
      <div class="settings-form-group">
        <label for="questdb-protocol">Protocol</label>
        <select id="questdb-protocol">
          <option value="http" selected>HTTP/REST</option>
          <option value="pg">PostgreSQL Wire Protocol</option>
        </select>
        <p style="font-size: 0.8em; color: #aaa; margin-top: 5px;">
          <b>HTTP/REST:</b> Text-based JSON protocol, works directly from browser.<br>
          <b>PostgreSQL:</b> Binary wire protocol with stateful connection, requires WebSocket proxy.
        </p>
      </div>
      
      <div id="questdb-http-settings">
        <h4>HTTP/REST Settings</h4>
        <div class="settings-form-group">
          <label for="questdb-url">Server URL</label>
          <input type="text" id="questdb-url" placeholder="http://localhost:8000/questdb">
          <p style="font-size: 0.8em; color: #aaa; margin-top: 5px;">
            URL of QuestDB HTTP API. Default uses Caddy proxy at port 8000 for CORS support.
          </p>
        </div>
      </div>
      
      <div id="questdb-pg-settings" style="display: none;">
        <h4>PostgreSQL Wire Protocol Settings <span style="color: #ff9800; font-size: 0.8em;">(Experimental)</span></h4>
        <p style="font-size: 0.9em; color: #ffc980; margin-top: 0;">
          <b>⚠️ Experimental:</b> Binary protocol with connection pooling.<br>
          Requires WebSocket proxy running: <code>just start-questdb-ws-proxy</code>
        </p>
        <div class="settings-form-group">
          <label for="questdb-pg-host">Host</label>
          <input type="text" id="questdb-pg-host" placeholder="localhost">
        </div>
        <div class="settings-form-group">
          <label for="questdb-pg-port">Port (WebSocket Proxy)</label>
          <input type="number" id="questdb-pg-port" placeholder="8813" min="1" max="65535">
          <p style="font-size: 0.8em; color: #aaa; margin-top: 5px;">
            WebSocket proxy port (not QuestDB's direct PostgreSQL port). Default: 8813
          </p>
        </div>
        <div class="settings-form-group">
          <label for="questdb-pg-database">Database</label>
          <input type="text" id="questdb-pg-database" placeholder="qdb">
        </div>
        <div class="settings-form-group">
          <label for="questdb-pg-user">Username</label>
          <input type="text" id="questdb-pg-user" placeholder="admin">
        </div>
        <div class="settings-form-group">
          <label for="questdb-pg-password">Password</label>
          <input type="password" id="questdb-pg-password" placeholder="quest">
        </div>
      </div>
    `;
  }

  /**
   * Returns default settings values.
   * @returns {object} Default settings.
   */
  getSettingsDefaults() {
    return {
      protocol: 'http',
      url: 'http://localhost:8000/questdb',
      pgHost: 'localhost',
      pgPort: 8813,
      pgDatabase: 'qdb',
      pgUser: 'admin',
      pgPassword: 'quest'
    };
  }

  /**
   * Populates the settings UI with stored or default values.
   * @param {object} storedSettings Settings from localStorage.
   * @param {object} defaults Default settings.
   */
  populateSettings(storedSettings, defaults) {
    if (document.getElementById('questdb-protocol')) {
      document.getElementById('questdb-protocol').value = storedSettings.protocol || defaults.protocol;
    }
    if (document.getElementById('questdb-url')) {
      document.getElementById('questdb-url').value = storedSettings.url || defaults.url;
    }
    if (document.getElementById('questdb-pg-host')) {
      document.getElementById('questdb-pg-host').value = storedSettings.pgHost || defaults.pgHost;
    }
    if (document.getElementById('questdb-pg-port')) {
      document.getElementById('questdb-pg-port').value = storedSettings.pgPort || defaults.pgPort;
    }
    if (document.getElementById('questdb-pg-database')) {
      document.getElementById('questdb-pg-database').value = storedSettings.pgDatabase || defaults.pgDatabase;
    }
    if (document.getElementById('questdb-pg-user')) {
      document.getElementById('questdb-pg-user').value = storedSettings.pgUser || defaults.pgUser;
    }
    if (document.getElementById('questdb-pg-password')) {
      document.getElementById('questdb-pg-password').value = storedSettings.pgPassword || defaults.pgPassword;
    }
    
    // Add event listener to toggle settings visibility based on protocol
    const protocolSelect = document.getElementById('questdb-protocol');
    const httpSettings = document.getElementById('questdb-http-settings');
    const pgSettings = document.getElementById('questdb-pg-settings');
    
    if (protocolSelect && httpSettings && pgSettings) {
      protocolSelect.addEventListener('change', () => {
        if (protocolSelect.value === 'http') {
          httpSettings.style.display = 'block';
          pgSettings.style.display = 'none';
        } else {
          httpSettings.style.display = 'none';
          pgSettings.style.display = 'block';
        }
      });
      
      // Trigger initial visibility
      protocolSelect.dispatchEvent(new Event('change'));
    }
  }

  /**
   * Saves settings from the UI to localStorage.
   */
  saveSettings() {
    const defaults = this.getSettingsDefaults();
    const questdbSettings = {
      protocol: document.getElementById('questdb-protocol').value || defaults.protocol,
      url: document.getElementById('questdb-url').value || defaults.url,
      pgHost: document.getElementById('questdb-pg-host').value || defaults.pgHost,
      pgPort: parseInt(document.getElementById('questdb-pg-port').value, 10) || defaults.pgPort,
      pgDatabase: document.getElementById('questdb-pg-database').value || defaults.pgDatabase,
      pgUser: document.getElementById('questdb-pg-user').value || defaults.pgUser,
      pgPassword: document.getElementById('questdb-pg-password').value || defaults.pgPassword
    };
    localStorage.setItem('sqlshader.questdb-settings', JSON.stringify(questdbSettings));
    console.log('[QuestDB] Settings saved:', questdbSettings);
  }
}

export const engine = new QuestDBEngine();
