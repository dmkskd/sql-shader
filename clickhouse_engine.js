import { createClient } from '@clickhouse/client-web';
import { Table, Float32, makeTable } from '@apache/arrow';
import { SHADERS } from './clickhouse_shaders.js';

/**
 * Implements the Engine interface for ClickHouse.
 */
class ClickHouseEngine {
  constructor() {
    this.client = null;
  }

  async initialize(statusCallback) {
    statusCallback('Initializing ClickHouse engine...');

    // Default connection details. These can be overridden by URL parameters
    // e.g., http://localhost:8000/?ch_host=...&ch_port=...
    const storedSettings = JSON.parse(localStorage.getItem('clickhouse-settings')) || {};
    const urlParams = new URLSearchParams(window.location.search);

    // Priority: 1. Stored Settings, 2. URL Params, 3. Defaults
    const url = storedSettings.url || urlParams.get('ch_host') || 'http://localhost:8123';
    const username = storedSettings.username || urlParams.get('ch_user') || 'default';
    const password = storedSettings.password || urlParams.get('ch_password') || '';

    this.client = createClient({
      url: url, // Deprecated 'host' is replaced by 'url'
      username: username,
      password: password,
    });

    statusCallback(`Pinging ClickHouse server at ${url}...`);
    try {
      const response = await this.client.ping();
      if (!response.success) {
        throw new Error('Ping failed.');
      }
      statusCallback('ClickHouse engine ready.');
    } catch (e) {
      statusCallback(`ClickHouse connection failed: ${e.message}. Is it running at ${url}?`);
      throw new Error(`Could not connect to ClickHouse. Is it running and accessible at ${url}?`);
    }
  }

  async prepare(sql) {
    // For the ClickHouse HTTP client, there's no "prepare" step.
    // We return an object that holds the SQL and can execute it.
    return {
      query: async (...args) => this.executeQuery(sql, args),
    };
  }

  async executeQuery(sql, params) {
    // New Strategy: Manually substitute parameters to avoid client library issues.
    let finalSql = sql
      .replace('{width:UInt32}', params[0])
      .replace('{height:UInt32}', params[1])
      .replace('{iTime:Float64}', params[2])
      .replace('{mx:Float64}', params[3])
      .replace('{my:Float64}', params[4]);

    const resultSet = await this.client.query({
      query: finalSql,
      format: 'JSONEachRow'
    });
    const rows = await resultSet.json();

    // Convert the JSON result into an Arrow Table, which the renderer expects.
    const r = new Float32Array(rows.length);
    const g = new Float32Array(rows.length);
    const b = new Float32Array(rows.length);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      r[i] = row.r;
      g[i] = row.g;
      b[i] = row.b;
    }

    return makeTable({
      r: r,
      g: g,
      b: b,
    });
  }

  async profile(sql, params) {
    console.log('[engine.profile] Step 1: Using new EXPLAIN PLAN strategy for ClickHouse.');

    // The raw SQL contains parameter placeholders like {width:UInt32}.
    // The ClickHouse client will error if it sees these without a `params` object,
    // even for an EXPLAIN PLAN query. We must remove them by replacing them with
    // a dummy literal value (e.g., 1) that allows the query to be parsed.
    const cleanedSql = sql.replace(/{[^}]+}/g, '1');
    const explainedSql = `EXPLAIN PLAN ${cleanedSql}`;

    console.log(`[engine.profile] Step 2: Executing query: ${explainedSql.substring(0, 100)}...`);

    const resultSet = await this.client.query({
      query: explainedSql,
      format: 'JSONEachRow',
    });

    const rows = await resultSet.json();

    // The result of EXPLAIN PLAN is a single column named 'explain'.
    // We'll format it into a readable string.
    const plan = rows.map(row => row.explain).join('\n');
    console.log('[engine.profile] Step 3: Successfully retrieved query plan. Returning to caller.');
    return plan;
  }

  getShaders() {
    return SHADERS;
  }
}

export const engine = new ClickHouseEngine();