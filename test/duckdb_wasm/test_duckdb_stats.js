import { BaseTestRunner } from '../assets/test-runner.js';

// DuckDB import - only in browser
let duckdb;
if (typeof window !== 'undefined') {
    duckdb = await import('@duckdb/duckdb-wasm');
}

export class DuckDBStatsTestSuite extends BaseTestRunner {
    constructor() {
        super('DuckDB-WASM Stats API Tests');
        this.db = null;
        this.connection = null;
    }

    async runTests() {
        this.log('Starting DuckDB-WASM stats API tests...', 'test');

        // Initialize DuckDB
        try {
            this.log('Attempting to initialize DuckDB-WASM instance (with 5s timeout)...', 'test');
            
            const initPromise = (async () => {
                const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
                const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
                const workerUrl = URL.createObjectURL(
                    new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
                );
                const worker = new Worker(workerUrl);
                const logger = new duckdb.VoidLogger();
                this.db = new duckdb.AsyncDuckDB(logger, worker);
                await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
                URL.revokeObjectURL(workerUrl);
            })();

            await Promise.race([
                initPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Initialization timed out. This is likely due to the COI service worker issue.')), 5000))
            ]);

            this.connection = await this.db.connect();
            this.log('DuckDB-WASM Initialized Successfully.', 'success');
        } catch (e) {
            this.addResult('DuckDB Initialization', 'FAIL', null, e.message);
            this.log(`FATAL: Failed to initialize DuckDB-WASM. Error: ${e.message}`, 'error');
            return;
        }

        // Test 1: PRAGMA database_size
        this.log('Testing PRAGMA database_size...', 'test');
        try {
            const result = await this.connection.query('PRAGMA database_size;');
            const usedBlocks = result.getChild('used_blocks')?.get(0);
            const blockSize = result.getChild('block_size')?.get(0);
            if (typeof usedBlocks !== 'bigint' || typeof blockSize !== 'bigint') {
                throw new Error('Did not return correct block values.');
            }
            const memoryUsed = usedBlocks * blockSize;
            this.addResult('PRAGMA database_size', 'PASS', `Memory Used: ${memoryUsed} bytes`);
            this.log(`✓ SUCCESS: PRAGMA database_size. Memory Used: ${memoryUsed} bytes`, 'success');
        } catch (e) {
            this.addResult('PRAGMA database_size', 'FAIL', null, e.message);
            this.log(`✗ FAIL: PRAGMA database_size. Error: ${e.message}`, 'error');
        }

        // Test 2: duckdb_settings()
        this.log('Testing duckdb_settings() for threads and memory_limit...', 'test');
        try {
            const result = await this.connection.query("SELECT name, value FROM duckdb_settings() WHERE name IN ('threads', 'memory_limit');");
            const settings = result.toArray().map(row => row.toJSON());
            if (settings.length < 2) {
                throw new Error('Did not return all expected settings.');
            }
            this.addResult('duckdb_settings()', 'PASS', `Found ${settings.length} settings`);
            this.log(`✓ SUCCESS: duckdb_settings(). Found ${settings.length} settings.`, 'success');
        } catch (e) {
            this.addResult('duckdb_settings()', 'FAIL', null, e.message);
            this.log(`✗ FAIL: duckdb_settings(). Error: ${e.message}`, 'error');
        }

        // Cleanup
        this.log('All tests completed.', 'success');
        if (this.db) {
            await this.db.terminate();
            this.log('DuckDB worker terminated.', 'success');
        }
    }
}

// CLI execution
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('test_duckdb_stats.js')) {
    const suite = new DuckDBStatsTestSuite();
    suite.execute().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    });
}