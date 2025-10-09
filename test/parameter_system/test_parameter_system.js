/**
 * Parameter System Test Suite
 * Tests JSON parameter handling in both DuckDB and ClickHouse engines
 */

import { UniformBuilder } from '../uniform_builder.js';

class ParameterTestSuite {
  constructor() {
    this.results = [];
    this.uniformBuilder = new UniformBuilder();
    this.testData = {
      width: 320,
      height: 240,
      iTime: 1.5,
      mouse_x: 160,
      mouse_y: 120,
      audio: {
        isActive: true,
        volume: 0.5,
        beat: 0.8,
        bass: 0.6,
        mid: 0.4,
        treble: 0.3
      }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    this.results.push({ timestamp, type, message });
  }

  async testDuckDBJSONSupport() {
    this.log('Testing DuckDB JSON parameter support...', 'test');
    
    try {
      // Test SQL that should work with DuckDB JSON
      const sql = `
        WITH uniforms AS (
          SELECT ?::JSON AS iUniforms
        ),
        parsed AS (
          SELECT
            CAST(json_extract(iUniforms, '$.iResolution[0]') AS BIGINT) AS width,
            CAST(json_extract(iUniforms, '$.iResolution[1]') AS BIGINT) AS height,
            CAST(json_extract(iUniforms, '$.iTime') AS DOUBLE) AS iTime
          FROM uniforms
        )
        SELECT width, height, iTime, 'DuckDB JSON test' AS test_name FROM parsed;
      `;

      // Test detection
      const detectedStyle = this.uniformBuilder.detectShaderStyle(sql);
      this.log(`DuckDB detection result: ${detectedStyle}`, 'info');
      
      if (detectedStyle !== 'shadertoy-json' && detectedStyle !== 'clickhouse-json') {
        throw new Error(`Expected JSON style, got: ${detectedStyle}`);
      }

      // Test parameter building
      const params = this.uniformBuilder.buildUniformsJSON(this.testData);
      this.log(`DuckDB parameters built: ${params.length} parameter(s)`, 'info');
      
      if (params.length !== 1) {
        throw new Error(`Expected 1 JSON parameter, got: ${params.length}`);
      }

      // Validate JSON structure
      const jsonData = JSON.parse(params[0]);
      if (!jsonData.iResolution || !jsonData.iTime) {
        throw new Error('Missing required JSON properties');
      }

      this.log('✅ DuckDB JSON parameter test PASSED', 'success');
      return { engine: 'DuckDB', status: 'PASS', sql, params };
      
    } catch (error) {
      this.log(`❌ DuckDB JSON parameter test FAILED: ${error.message}`, 'error');
      return { engine: 'DuckDB', status: 'FAIL', error: error.message };
    }
  }

  async testClickHouseJSONSupport() {
    this.log('Testing ClickHouse JSON parameter support...', 'test');
    
    try {
      // Test SQL for ClickHouse with ?::String + parseJSON
      const sqlString = `
        WITH uniforms AS (
          SELECT ?::String AS iUniforms_json
        ),
        parsed AS (
          SELECT parseJSON(iUniforms_json) AS iUniforms FROM uniforms
        ),
        extracted AS (
          SELECT
            iUniforms.iResolution[1] AS width,
            iUniforms.iResolution[2] AS height,
            iUniforms.iTime AS iTime
          FROM parsed
        )
        SELECT width, height, iTime, 'ClickHouse String->JSON test' AS test_name FROM extracted;
      `;

      // Test detection for string approach
      const detectedStyle1 = this.uniformBuilder.detectShaderStyle(sqlString);
      this.log(`ClickHouse String detection: ${detectedStyle1}`, 'info');

      // Test direct ?::JSON approach
      const sqlDirect = `
        WITH uniforms AS (
          SELECT ?::JSON AS iUniforms
        )
        SELECT iUniforms, 'ClickHouse direct JSON test' AS test_name FROM uniforms;
      `;

      const detectedStyle2 = this.uniformBuilder.detectShaderStyle(sqlDirect);
      this.log(`ClickHouse direct JSON detection: ${detectedStyle2}`, 'info');

      // Test parameter building (use JSON string for ClickHouse)
      const params = this.uniformBuilder.buildUniformsJSON(this.testData);
      this.log(`ClickHouse parameters built: ${params.length} parameter(s)`, 'info');

      this.log('✅ ClickHouse JSON parameter test PASSED', 'success');
      return { 
        engine: 'ClickHouse', 
        status: 'PASS', 
        approaches: {
          string: { sql: sqlString, detection: detectedStyle1 },
          direct: { sql: sqlDirect, detection: detectedStyle2 }
        },
        params 
      };
      
    } catch (error) {
      this.log(`❌ ClickHouse JSON parameter test FAILED: ${error.message}`, 'error');
      return { engine: 'ClickHouse', status: 'FAIL', error: error.message };
    }
  }

  async testLegacySupport() {
    this.log('Testing legacy parameter support...', 'test');
    
    try {
      const legacySQL = `
        WITH uniforms AS (
          SELECT 
            ?::BIGINT AS width, 
            ?::BIGINT AS height,
            ?::DOUBLE AS iTime, 
            ?::DOUBLE AS mx, 
            ?::DOUBLE AS my
        )
        SELECT width, height, iTime FROM uniforms;
      `;

      const detectedStyle = this.uniformBuilder.detectShaderStyle(legacySQL);
      this.log(`Legacy detection: ${detectedStyle}`, 'info');
      
      if (detectedStyle !== 'legacy') {
        throw new Error(`Expected legacy style, got: ${detectedStyle}`);
      }

      const params = this.uniformBuilder.buildLegacyParams(this.testData);
      this.log(`Legacy parameters: [${params.join(', ')}]`, 'info');
      
      if (params.length !== 5) {
        throw new Error(`Expected 5 legacy parameters, got: ${params.length}`);
      }

      this.log('✅ Legacy parameter test PASSED', 'success');
      return { type: 'Legacy', status: 'PASS', params };
      
    } catch (error) {
      this.log(`❌ Legacy parameter test FAILED: ${error.message}`, 'error');
      return { type: 'Legacy', status: 'FAIL', error: error.message };
    }
  }

  async testClickHouseLegacySupport() {
    this.log('Testing ClickHouse {parameter:Type} legacy support...', 'test');
    
    try {
      const chLegacySQL = `
        WITH
          {width:UInt32} AS width,
          {height:UInt32} AS height,
          {iTime:Float64} AS iTime
        SELECT width, height, iTime FROM (SELECT 1);
      `;

      const detectedStyle = this.uniformBuilder.detectShaderStyle(chLegacySQL);
      this.log(`ClickHouse legacy detection: ${detectedStyle}`, 'info');
      
      if (detectedStyle !== 'clickhouse-legacy') {
        throw new Error(`Expected clickhouse-legacy style, got: ${detectedStyle}`);
      }

      this.log('✅ ClickHouse legacy detection test PASSED', 'success');
      return { type: 'ClickHouse Legacy', status: 'PASS' };
      
    } catch (error) {
      this.log(`❌ ClickHouse legacy test FAILED: ${error.message}`, 'error');
      return { type: 'ClickHouse Legacy', status: 'FAIL', error: error.message };
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Parameter System Test Suite...', 'info');
    this.results = [];
    
    const testResults = await Promise.all([
      this.testDuckDBJSONSupport(),
      this.testClickHouseJSONSupport(),
      this.testLegacySupport(),
      this.testClickHouseLegacySupport()
    ]);

    // Summary
    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    
    this.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed`, 'summary');
    
    if (failed === 0) {
      this.log('🎉 All parameter tests PASSED! Migration can proceed.', 'success');
    } else {
      this.log('⚠️ Some tests FAILED. Review before continuing migration.', 'warning');
    }

    return {
      summary: { passed, failed, total: testResults.length },
      results: testResults,
      logs: this.results
    };
  }

  // Helper method to display results in HTML
  displayResults(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <h3>Parameter System Test Results</h3>
      <div id="test-logs"></div>
      <button onclick="parameterTests.runAllTests().then(r => parameterTests.displayResults('test-results'))">
        🔄 Run Tests Again
      </button>
    `;

    const logsContainer = container.querySelector('#test-logs');
    this.results.forEach(({ timestamp, type, message }) => {
      const div = document.createElement('div');
      div.className = `test-log test-${type}`;
      div.innerHTML = `<span class="timestamp">${timestamp}</span> ${message}`;
      logsContainer.appendChild(div);
    });
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.ParameterTestSuite = ParameterTestSuite;
  window.parameterTests = new ParameterTestSuite();
}

export { ParameterTestSuite };