import { BaseTestRunner } from '../assets/test-runner.js';

// DuckDB import - only in browser
let duckdb;
if (typeof window !== 'undefined') {
    duckdb = await import('@duckdb/duckdb-wasm');
}

export class DuckDBPreambleTestSuite extends BaseTestRunner {
    constructor() {
        super('DuckDB Preamble Tests');
        this.db = null;
        this.connection = null;
        this.engine = null;
    }

    async runTests() {
        this.log('Starting DuckDB preamble tests...', 'test');

        // Test 1: Successful preamble execution
        await this.testSuccessfulPreamble();

        // Test 2: Preamble with errors
        await this.testPreambleWithErrors();

        // Test 3: Empty preamble
        await this.testEmptyPreamble();

        // Test 4: Multi-statement preamble
        await this.testMultiStatementPreamble();

        // Test 5: Extension persistence
        await this.testExtensionPersistence();

        // Test 6: Extension install vs load behavior
        await this.testExtensionInstallBehavior();

        this.log('All preamble tests completed.', 'test');
    }

    async testSuccessfulPreamble() {
        this.log('Test 1: Valid preamble executes successfully', 'test');
        
        try {
            // Save valid preamble
            const preamble = `SELECT 1 as test`;
            const settings = { preamble };
            localStorage.setItem('sqlshader.duckdb_wasm-settings', JSON.stringify(settings));

            // Import and initialize engine
            const { engine } = await import('../../src/engines/duckdb_wasm/duckdb_wasm_engine.js');
            const result = await engine.initialize(() => {});

            if (!result || !result.initializationErrors) {
                this.addResult('Valid Preamble', 'PASS', 'Preamble executed without errors');
            } else {
                this.addResult('Valid Preamble', 'FAIL', null, 'Unexpected initialization errors');
            }

            await engine.terminate();
        } catch (error) {
            this.addResult('Valid Preamble', 'FAIL', null, error.message);
        }
    }

    async testPreambleWithErrors() {
        this.log('Test 2: Preamble with errors is handled gracefully', 'test');
        
        try {
            // Save preamble with invalid SQL
            const preamble = `INVALID SQL STATEMENT`;
            const settings = { preamble };
            localStorage.setItem('sqlshader.duckdb_wasm-settings', JSON.stringify(settings));

            // Import and initialize engine
            const { engine } = await import('../../src/engines/duckdb_wasm/duckdb_wasm_engine.js');
            const result = await engine.initialize(() => {});

            if (result && result.initializationErrors && result.initializationErrors.length > 0) {
                this.addResult('Preamble Error Handling', 'PASS', 'Errors were properly captured');
            } else {
                this.addResult('Preamble Error Handling', 'FAIL', null, 'Expected errors were not captured');
            }

            await engine.terminate();
        } catch (error) {
            this.addResult('Preamble Error Handling', 'FAIL', null, error.message);
        }
    }

    async testEmptyPreamble() {
        this.log('Test 3: Empty preamble does not cause issues', 'test');
        
        try {
            // Save empty preamble
            const settings = { preamble: '' };
            localStorage.setItem('sqlshader.duckdb_wasm-settings', JSON.stringify(settings));

            // Import and initialize engine
            const { engine } = await import('../../src/engines/duckdb_wasm/duckdb_wasm_engine.js');
            const result = await engine.initialize(() => {});

            if (!result || !result.initializationErrors) {
                this.addResult('Empty Preamble', 'PASS', 'Empty preamble handled correctly');
            } else {
                this.addResult('Empty Preamble', 'FAIL', null, 'Empty preamble caused errors');
            }

            await engine.terminate();
        } catch (error) {
            this.addResult('Empty Preamble', 'FAIL', null, error.message);
        }
    }

    async testMultiStatementPreamble() {
        this.log('Test 4: Multiple SQL statements in preamble execute correctly', 'test');
        
        try {
            // Save preamble with multiple statements (DuckDB should handle semicolons)
            const preamble = `CREATE TEMP TABLE test_table (id INTEGER, name VARCHAR);
INSERT INTO test_table VALUES (1, 'test');
SELECT COUNT(*) as count FROM test_table;`;
            const settings = { preamble };
            localStorage.setItem('sqlshader.duckdb_wasm-settings', JSON.stringify(settings));

            // Import and initialize engine
            const { engine } = await import('../../src/engines/duckdb_wasm/duckdb_wasm_engine.js');
            const result = await engine.initialize(() => {});

            if (!result || !result.initializationErrors) {
                // Verify the table was created and populated
                const verifySql = "SELECT COUNT(*) as count FROM test_table";
                const prepared = await engine.prepare(verifySql);
                const queryResult = await prepared.query({
                    iResolution: [800, 600, 1],
                    iMouse: [0, 0, 0, 0],
                    iDate: [2024, 10, 20, 0],
                    iTime: 0,
                    iTimeDelta: 0,
                    iFrameRate: 60,
                    iFrame: 0,
                    iSampleRate: 44100,
                    iAudio: { volume: 0, bass: 0, mid: 0, treble: 0, isActive: false }
                });

                if (queryResult.table && queryResult.table.numRows > 0) {
                    const row = queryResult.table.get(0);
                    if (row.count === 1) {
                        this.addResult('Multi-Statement Preamble', 'PASS', 'Multiple statements executed successfully');
                    } else {
                        this.addResult('Multi-Statement Preamble', 'FAIL', null, `Expected count=1, got count=${row.count}`);
                    }
                } else {
                    this.addResult('Multi-Statement Preamble', 'FAIL', null, 'Could not verify table data');
                }
            } else {
                this.addResult('Multi-Statement Preamble', 'FAIL', null, 'Preamble execution failed');
            }

            await engine.terminate();
        } catch (error) {
            this.addResult('Multi-Statement Preamble', 'FAIL', null, error.message);
        }
    }

    async testExtensionPersistence() {
        this.log('Test 4: Extensions loaded in preamble persist', 'test');
        
        try {
            // Save preamble that installs and loads an extension
            const preamble = `INSTALL json FROM community;\nLOAD json;`;
            const settings = { preamble };
            localStorage.setItem('sqlshader.duckdb_wasm-settings', JSON.stringify(settings));

            // Import and initialize engine
            const { engine } = await import('../../src/engines/duckdb_wasm/duckdb_wasm_engine.js');
            await engine.initialize(() => {});

            // Check if extension is loaded (and optionally installed)
            const checkExtSql = "SELECT extension_name, loaded, installed FROM duckdb_extensions() WHERE extension_name = 'json'";
            const extCheckPrep = await engine.prepare(checkExtSql);
            const extResult = await extCheckPrep.query({
                iResolution: [800, 600, 1],
                iMouse: [0, 0, 0, 0],
                iDate: [2024, 10, 20, 0],
                iTime: 0,
                iTimeDelta: 0,
                iFrameRate: 60,
                iFrame: 0,
                iSampleRate: 44100,
                iAudio: { volume: 0, bass: 0, mid: 0, treble: 0, isActive: false }
            });

            if (extResult.table && extResult.table.numRows > 0) {
                const extRow = extResult.table.get(0);
                const isLoaded = extRow.loaded;
                const isInstalled = extRow.installed;
                
                this.log(`Extension status - loaded: ${isLoaded}, installed: ${isInstalled}`, 'test');
                
                if (!isLoaded) {
                    this.addResult('Extension Persistence', 'FAIL', null, 'JSON extension not loaded after preamble');
                    await engine.terminate();
                    return;
                }
                
                // Note: installed may be false in WASM environment - this is a known limitation
                if (!isInstalled) {
                    this.log('Note: Extension loaded but not installed (expected in WASM)', 'test');
                }
            } else {
                this.addResult('Extension Persistence', 'FAIL', null, 'Could not query extension status');
                await engine.terminate();
                return;
            }

            // Test if the extension actually works
            const testSql = "SELECT json_valid('{\"test\": 1}') as is_valid";
            const prepared = await engine.prepare(testSql);
            const result = await prepared.query({
                iResolution: [800, 600, 1],
                iMouse: [0, 0, 0, 0],
                iDate: [2024, 10, 20, 0],
                iTime: 0,
                iTimeDelta: 0,
                iFrameRate: 60,
                iFrame: 0,
                iSampleRate: 44100,
                iAudio: { volume: 0, bass: 0, mid: 0, treble: 0, isActive: false }
            });

            if (result.table && result.table.numRows > 0) {
                const firstRow = result.table.get(0);
                const isValid = firstRow.is_valid;
                if (isValid) {
                    this.addResult('Extension Persistence', 'PASS', 'JSON extension loaded and functional (installed=' + extResult.table.get(0).installed + ')');
                } else {
                    this.addResult('Extension Persistence', 'FAIL', null, 'JSON function returned unexpected result');
                }
            } else {
                this.addResult('Extension Persistence', 'FAIL', null, 'No result returned from JSON test');
            }

            await engine.terminate();
        } catch (error) {
            this.addResult('Extension Persistence', 'FAIL', null, error.message);
        }
    }

    async testExtensionInstallBehavior() {
        this.log('Test 5: Document INSTALL vs LOAD behavior in WASM', 'test');
        
        try {
            // Test with INSTALL and LOAD
            const preamble = `INSTALL stochastic FROM community;\nLOAD stochastic;`;
            const settings = { preamble };
            localStorage.setItem('sqlshader.duckdb_wasm-settings', JSON.stringify(settings));

            const { engine } = await import('../../src/engines/duckdb_wasm/duckdb_wasm_engine.js');
            const initResult = await engine.initialize(() => {});

            // Check for initialization errors
            if (initResult && initResult.initializationErrors) {
                this.addResult('Extension Install Behavior', 'FAIL', null, 
                    'Preamble execution failed: ' + initResult.initializationErrors.join(', '));
                await engine.terminate();
                return;
            }

            // Query the extension status
            const checkSql = "SELECT extension_name, loaded, installed FROM duckdb_extensions() WHERE extension_name = 'stochastic'";
            const prep = await engine.prepare(checkSql);
            const result = await prep.query({
                iResolution: [800, 600, 1],
                iMouse: [0, 0, 0, 0],
                iDate: [2024, 10, 20, 0],
                iTime: 0,
                iTimeDelta: 0,
                iFrameRate: 60,
                iFrame: 0,
                iSampleRate: 44100,
                iAudio: { volume: 0, bass: 0, mid: 0, treble: 0, isActive: false }
            });

            if (result.table && result.table.numRows > 0) {
                const row = result.table.get(0);
                const loaded = row.loaded;
                const installed = row.installed;
                
                // Document the observed behavior
                const behaviorNote = `stochastic extension: loaded=${loaded}, installed=${installed}`;
                this.log(behaviorNote, 'test');
                
                if (loaded && !installed) {
                    this.addResult('Extension Install Behavior', 'PASS', 
                        'Extension loads but does not persist INSTALL in WASM (known limitation): ' + behaviorNote);
                } else if (loaded && installed) {
                    this.addResult('Extension Install Behavior', 'PASS', 
                        'Extension fully installed and loaded: ' + behaviorNote);
                } else if (!loaded) {
                    this.addResult('Extension Install Behavior', 'FAIL', null, 
                        'Extension not loaded after preamble: ' + behaviorNote);
                } else {
                    this.addResult('Extension Install Behavior', 'INFO', 
                        'Unexpected state: ' + behaviorNote);
                }
            } else {
                this.addResult('Extension Install Behavior', 'FAIL', null, 
                    'Could not query stochastic extension status');
            }

            await engine.terminate();
        } catch (error) {
            this.addResult('Extension Install Behavior', 'FAIL', null, error.message);
        }
    }

    async cleanup() {
        // Clean up localStorage
        localStorage.removeItem('sqlshader.duckdb_wasm-settings');
        
        if (this.connection) {
            await this.connection.close();
        }
        if (this.db) {
            await this.db.terminate();
        }
    }
}
