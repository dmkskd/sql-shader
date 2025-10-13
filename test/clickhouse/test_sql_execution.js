import { BaseTestRunner } from '../assets/test-runner.js';

/**
 * ClickHouse SQL Execution Test Suite
 * Tests actual shader SQL execution with ClickHouse
 */
export class ClickHouseSQLExecutionTestSuite extends BaseTestRunner {
  constructor() {
    super('ClickHouse SQL Execution Tests');
    this.client = null;
    this.createClient = null;
  }

  async runTests() {
    this.log('Starting ClickHouse SQL execution tests...', 'test');

    // Import ClickHouse client (browser only)
    if (typeof window !== 'undefined') {
      const chModule = await import('@clickhouse/client-web');
      this.createClient = chModule.createClient;
    }

    // Initialize ClickHouse with hardcoded defaults
    if (!(await this.initializeClickHouse())) {
      return;
    }

    // Run all tests
    await this.testConnection();
    await this.testDirectJSONAccess();
    await this.testLegacyParameterShader();
    await this.testJSONParameterShader();

    this.log('All tests completed.', 'success');
  }

  async initializeClickHouse() {
    this.log('Initializing ClickHouse client...', 'test');
    
    try {
      // Use hardcoded defaults
      this.client = this.createClient({
        url: 'http://localhost:8123',
        username: 'default',
        password: 'sql_shader',
        compression: {
          response: true,
          request: false
        }
      });
      
      // Test connection
      await this.client.query({ query: 'SELECT 1 as test' });
      
      this.addResult('ClickHouse Initialization', 'PASS', 'Connected successfully');
      this.log('✓ ClickHouse client initialized successfully', 'success');
      return true;
      
    } catch (error) {
      this.addResult('ClickHouse Initialization', 'FAIL', null, error.message);
      this.log(`✗ Failed to initialize ClickHouse: ${error.message}`, 'error');
      return false;
    }
  }

  async testLegacyParameterShader() {
    this.log('Testing ClickHouse legacy {parameter:Type} shader...', 'test');
    
    const legacySQL = `
      WITH
        {width:UInt32} AS width,
        {height:UInt32} AS height,
        {iTime:Float64} AS iTime,
        {mx:Float64} AS mx,
        {my:Float64} AS my
      SELECT
        0.5 + 0.5 * sin((x / 10.0) + iTime) AS r,
        0.5 + 0.5 * cos((y / 10.0) + iTime) AS g,
        0.5 + 0.5 * sin(iTime) AS b
      FROM
      (
        SELECT number AS y
        FROM system.numbers LIMIT height
      ) AS t_y
      CROSS JOIN (SELECT number AS x FROM system.numbers LIMIT width) AS t_x
      ORDER BY y ASC, x ASC
    `;

    try {
      const result = await this.client.query({
        query: legacySQL,
        query_params: {
          width: 4,
          height: 4,
          iTime: 1.0,
          mx: 2.0,
          my: 2.0
        }
      });
      
      const rows = await result.json();
      
      // Verify we got the expected number of pixels (4x4 = 16 rows)
      if (rows.length !== 16) {
        throw new Error(`Expected 16 pixels, got ${rows.length}`);
      }
      
      // Verify each row has r, g, b values
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!('r' in row) || !('g' in row) || !('b' in row)) {
          throw new Error(`Missing RGB columns in row ${i}`);
        }
        
        const { r, g, b } = row;
        if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1) {
          throw new Error(`Invalid color values at row ${i}: r=${r}, g=${g}, b=${b}`);
        }
      }
      
      this.addResult('Legacy Parameter Shader', 'PASS', `${rows.length} pixels with valid RGB`);
      this.log(`✓ Legacy ClickHouse shader executed successfully: ${rows.length} pixels`, 'success');
      
    } catch (error) {
      this.addResult('Legacy Parameter Shader', 'FAIL', null, error.message);
      this.log(`✗ Legacy shader test failed: ${error.message}`, 'error');
    }
  }

  async testJSONParameterShader() {
    this.log('Testing ClickHouse JSON parameter shader...', 'test');
    
    const jsonSQL = `
      WITH
      uniforms AS (
        SELECT ?::String AS iUniforms_json
      ),
      parsed AS (
        SELECT parseJSON(iUniforms_json) AS iUniforms FROM uniforms
      ),
      extracted AS (
        SELECT
          iUniforms.iResolution[1] AS width,
          iUniforms.iResolution[2] AS height,
          iUniforms.iTime AS iTime,
          iUniforms.iMouse[1] AS mx,
          iUniforms.iMouse[2] AS my
        FROM parsed
      )
      SELECT
        0.5 + 0.5 * sin((x / 10.0) + iTime) AS r,
        0.5 + 0.5 * cos((y / 10.0) + iTime) AS g,
        0.5 + 0.5 * sin(iTime) AS b
      FROM
      (
        SELECT number AS y
        FROM system.numbers LIMIT (SELECT width FROM extracted)
      ) AS t_y
      CROSS JOIN (
        SELECT number AS x 
        FROM system.numbers LIMIT (SELECT height FROM extracted)
      ) AS t_x
      CROSS JOIN extracted
      ORDER BY y ASC, x ASC
    `;

    try {
      // Create JSON parameter matching our expected format
      const jsonParams = {
        iResolution: [4, 4, 1.0],
        iTime: 1.0,
        iMouse: [2.0, 2.0, 0.0, 0.0]
      };
      
      const result = await this.client.query({
        query: jsonSQL,
        query_params: [JSON.stringify(jsonParams)]
      });
      
      const rows = await result.json();
      
      // Verify we got the expected number of pixels
      if (rows.length !== 16) {
        throw new Error(`Expected 16 pixels, got ${rows.length}`);
      }
      
      // Verify each row has r, g, b values
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!('r' in row) || !('g' in row) || !('b' in row)) {
          throw new Error(`Missing RGB columns in row ${i}`);
        }
        
        const { r, g, b } = row;
        if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1) {
          throw new Error(`Invalid color values at row ${i}: r=${r}, g=${g}, b=${b}`);
        }
      }
      
      this.addResult('JSON Parameter Shader', 'PASS', `${rows.length} pixels with valid RGB`);
      this.log(`✓ JSON ClickHouse shader executed successfully: ${rows.length} pixels`, 'success');
      
    } catch (error) {
      this.addResult('JSON Parameter Shader', 'FAIL', null, error.message);
      this.log(`✗ JSON shader test failed: ${error.message}`, 'error');
    }
  }

  async testDirectJSONAccess() {
    this.log('Testing ClickHouse direct JSON access...', 'test');
    
    const simpleSQL = `
      WITH uniforms AS (
        SELECT parseJSON(?::String) AS iUniforms
      )
      SELECT 
        iUniforms.iResolution[1] AS width,
        iUniforms.iTime AS time_val,
        iUniforms.iMouse[1] AS mouse_x
      FROM uniforms
    `;

    try {
      const jsonParams = {
        iResolution: [320, 240, 1.0],
        iTime: 2.5,
        iMouse: [100, 50, 0, 0]
      };
      
      const result = await this.client.query({
        query: simpleSQL,
        query_params: [JSON.stringify(jsonParams)]
      });
      
      const rows = await result.json();
      
      if (rows.length !== 1) {
        throw new Error(`Expected 1 row, got ${rows.length}`);
      }
      
      const row = rows[0];
      const { width, time_val, mouse_x } = row;
      
      if (width !== 320) {
        throw new Error(`Expected width 320, got ${width}`);
      }
      if (Math.abs(time_val - 2.5) > 0.001) {
        throw new Error(`Expected time 2.5, got ${time_val}`);
      }
      if (mouse_x !== 100) {
        throw new Error(`Expected mouseX 100, got ${mouse_x}`);
      }
      
      this.addResult('Direct JSON Access', 'PASS', `width=${width}, time=${time_val}, mouseX=${mouse_x}`);
      this.log(`✓ ClickHouse JSON access works: width=${width}, time=${time_val}`, 'success');
      
    } catch (error) {
      this.addResult('Direct JSON Access', 'FAIL', null, error.message);
      this.log(`✗ JSON access test failed: ${error.message}`, 'error');
    }
  }

  async testConnection() {
    this.log('Testing ClickHouse connection...', 'test');
    
    try {
      const result = await this.client.query({
        query: 'SELECT version() as version, \'ClickHouse connection test\' as test_name'
      });
      
      const rows = await result.json();
      
      if (rows.length !== 1) {
        throw new Error(`Expected 1 row, got ${rows.length}`);
      }
      
      const version = rows[0].version;
      this.addResult('Connection Test', 'PASS', `Version: ${version}`);
      this.log(`✓ ClickHouse connection successful: ${version}`, 'success');
      
    } catch (error) {
      this.addResult('Connection Test', 'FAIL', null, error.message);
      this.log(`✗ Connection test failed: ${error.message}`, 'error');
    }
  }
}

// CLI execution
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('test_sql_execution.js')) {
    const suite = new ClickHouseSQLExecutionTestSuite();
    suite.execute().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    });
}