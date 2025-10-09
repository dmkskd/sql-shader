/**
 * DuckDB-WASM SQL Shader Execution Test Suite
 * Tests actual shader SQL execution with DuckDB-WASM
 * 
 * Tests: Legacy 5-param shader, JSON parameter shader, Simple JSON extraction
 */

import { BaseTestRunner } from '../assets/test-runner.js';

export class DuckDBSQLExecutionTestSuite extends BaseTestRunner {
  constructor() {
    super('DuckDB-WASM SQL Execution');
    this.duckdb = null;
    this.connection = null;
  }

  async runTests() {
    // Dynamic import to avoid browser loading issues
    const duckdb = await import('https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@latest/+esm');
    
    // Initialize DuckDB
    if (!(await this.initializeDuckDB(duckdb))) {
      this.addResult('Initialization', 'FAIL', 'Failed to initialize DuckDB-WASM');
      return;
    }
    
    // Run tests sequentially
    await this.testSimpleJSONAccess();
    await this.testLegacyParameterShader();
    await this.testJSONParameterShader();
    
    // Cleanup
    if (this.connection) {
      await this.connection.close();
    }
  }

  async initializeDuckDB(duckdb) {
    this.log('Initializing DuckDB-WASM...');
    
    try {
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
      const worker = await duckdb.createWorker(bundle.mainWorker);
      const logger = new duckdb.ConsoleLogger();
      
      this.duckdb = new duckdb.AsyncDuckDB(logger, worker);
      await this.duckdb.instantiate(bundle.mainModule);
      this.connection = await this.duckdb.connect();
      
      this.log('DuckDB-WASM initialized successfully');
      return true;
    } catch (error) {
      this.log(`Failed to initialize DuckDB: ${error.message}`);
      return false;
    }
  }

  async testLegacyParameterShader() {
    this.log('Testing legacy 5-parameter shader...');
    
    const legacySQL = `
      WITH uniforms AS (
        SELECT 
          ?::BIGINT AS width, 
          ?::BIGINT AS height,
          ?::DOUBLE AS iTime, 
          ?::DOUBLE AS mx, 
          ?::DOUBLE AS my
      ),
      pixels AS (
        SELECT 
          i::DOUBLE AS x, 
          j::DOUBLE AS y
        FROM generate_series(0, (SELECT width - 1 FROM uniforms)) AS t(i)
        CROSS JOIN generate_series(0, (SELECT height - 1 FROM uniforms)) AS t2(j)
      ),
      colors AS (
        SELECT
          0.5 + 0.5 * sin((p.x / 10.0) + u.iTime) AS r,
          0.5 + 0.5 * cos((p.y / 10.0) + u.iTime) AS g,
          0.5 + 0.5 * sin(u.iTime) AS b,
          x, y
        FROM pixels AS p, uniforms AS u
      )
      SELECT r, g, b FROM colors ORDER BY y, x;
    `;

    try {
      const prepared = await this.connection.prepare(legacySQL);
      this.log('Legacy shader SQL compiled successfully');
      
      const result = await prepared.query(4, 4, 1.0, 2.0, 2.0);
      const rowCount = result.numRows;
      
      if (rowCount !== 16) {
        throw new Error(`Expected 16 pixels, got ${rowCount}`);
      }
      
      const columnNames = result.schema.fields.map(f => f.name);
      const expectedColumns = ['r', 'g', 'b'];
      for (const col of expectedColumns) {
        if (!columnNames.includes(col)) {
          throw new Error(`Missing column: ${col}`);
        }
      }
      
      const rColumn = result.getChild('r');
      const gColumn = result.getChild('g');
      const bColumn = result.getChild('b');
      
      for (let i = 0; i < rowCount; i++) {
        const r = rColumn.get(i);
        const g = gColumn.get(i);
        const b = bColumn.get(i);
        
        if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1) {
          throw new Error(`Invalid color values at row ${i}: r=${r}, g=${g}, b=${b}`);
        }
      }
      
      this.addResult('Legacy Parameter Shader', 'PASS', `${rowCount} pixels with valid RGB values`);
      
    } catch (error) {
      this.addResult('Legacy Parameter Shader', 'FAIL', error.message, error);
    }
  }

  async testJSONParameterShader() {
    this.log('Testing JSON parameter shader...');
    
    const jsonSQL = `
      WITH uniforms AS (
        SELECT ?::JSON AS iUniforms
      ),
      parsed AS (
        SELECT
          CAST(json_extract(iUniforms, '$.iResolution[0]') AS BIGINT) AS width,
          CAST(json_extract(iUniforms, '$.iResolution[1]') AS BIGINT) AS height,
          CAST(json_extract(iUniforms, '$.iTime') AS DOUBLE) AS iTime,
          CAST(json_extract(iUniforms, '$.iMouse[0]') AS DOUBLE) AS mx,
          CAST(json_extract(iUniforms, '$.iMouse[1]') AS DOUBLE) AS my
        FROM uniforms
      ),
      pixels AS (
        SELECT 
          i::DOUBLE AS x, 
          j::DOUBLE AS y
        FROM generate_series(0, (SELECT width - 1 FROM parsed)) AS t(i)
        CROSS JOIN generate_series(0, (SELECT height - 1 FROM parsed)) AS t2(j)
      ),
      colors AS (
        SELECT
          0.5 + 0.5 * sin((p.x / 10.0) + u.iTime) AS r,
          0.5 + 0.5 * cos((p.y / 10.0) + u.iTime) AS g,
          0.5 + 0.5 * sin(u.iTime) AS b,
          x, y
        FROM pixels AS p, parsed AS u
      )
      SELECT r, g, b FROM colors ORDER BY y, x;
    `;

    try {
      const prepared = await this.connection.prepare(jsonSQL);
      this.log('JSON shader SQL compiled successfully');
      
      const jsonParams = {
        iResolution: [4, 4, 1.0],
        iTime: 1.0,
        iMouse: [2.0, 2.0, 0.0, 0.0]
      };
      
      const result = await prepared.query(JSON.stringify(jsonParams));
      const rowCount = result.numRows;
      
      if (rowCount !== 16) {
        throw new Error(`Expected 16 pixels, got ${rowCount}`);
      }
      
      const columnNames = result.schema.fields.map(f => f.name);
      const expectedColumns = ['r', 'g', 'b'];
      for (const col of expectedColumns) {
        if (!columnNames.includes(col)) {
          throw new Error(`Missing column: ${col}`);
        }
      }
      
      const rColumn = result.getChild('r');
      const gColumn = result.getChild('g');
      const bColumn = result.getChild('b');
      
      for (let i = 0; i < rowCount; i++) {
        const r = rColumn.get(i);
        const g = gColumn.get(i);
        const b = bColumn.get(i);
        
        if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1) {
          throw new Error(`Invalid color values at row ${i}: r=${r}, g=${g}, b=${b}`);
        }
      }
      
      this.addResult('JSON Parameter Shader', 'PASS', `${rowCount} pixels with valid RGB values`);
      
    } catch (error) {
      this.addResult('JSON Parameter Shader', 'FAIL', error.message, error);
    }
  }

  async testSimpleJSONAccess() {
    this.log('Testing simple JSON extraction...');
    
    const simpleSQL = `
      SELECT 
        json_extract(?::JSON, '$.iResolution[0]') AS width,
        json_extract(?::JSON, '$.iTime') AS time_val,
        json_extract(?::JSON, '$.iMouse[0]') AS mouse_x
    `;

    try {
      const prepared = await this.connection.prepare(simpleSQL);
      const jsonParams = {
        iResolution: [320, 240, 1.0],
        iTime: 2.5,
        iMouse: [100, 50, 0, 0]
      };
      
      const result = await prepared.query(JSON.stringify(jsonParams));
      
      if (result.numRows !== 1) {
        throw new Error(`Expected 1 row, got ${result.numRows}`);
      }
      
      const width = result.getChild('width').get(0);
      const timeVal = result.getChild('time_val').get(0);
      const mouseX = result.getChild('mouse_x').get(0);
      
      if (width !== 320) {
        throw new Error(`Expected width 320, got ${width}`);
      }
      if (Math.abs(timeVal - 2.5) > 0.001) {
        throw new Error(`Expected time 2.5, got ${timeVal}`);
      }
      if (mouseX !== 100) {
        throw new Error(`Expected mouseX 100, got ${mouseX}`);
      }
      
      this.addResult('Simple JSON Access', 'PASS', `width=${width}, time=${timeVal}, mouseX=${mouseX}`);
      
    } catch (error) {
      this.addResult('Simple JSON Access', 'FAIL', error.message, error);
    }
  }

}

// CLI execution
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('test_sql_execution.js')) {
  const suite = new DuckDBSQLExecutionTestSuite();
  suite.execute().then(results => {
    console.log(JSON.stringify(results, null, 2));
    process.exit(results.summary.failed > 0 ? 1 : 0);
  });
}