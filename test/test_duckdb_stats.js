import * as duckdb from '@duckdb/duckdb-wasm';

const resultsEl = document.getElementById('results');

const log = (message, type = 'info') => {
  const div = document.createElement('div');
  div.className = `test-case ${type}`;
  div.textContent = message;
  resultsEl.appendChild(div);
  console.log(`[Test] ${message}`);
};

async function runTests() {
  resultsEl.innerHTML = ''; // Clear previous results
  log('Starting DuckDB-WASM stats API tests...');

  let db, connection;

  try {
    log('Attempting to initialize DuckDB-WASM instance (with 5s timeout)...');
    
    const initPromise = (async () => {
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
      const workerUrl = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
      );
      const worker = new Worker(workerUrl);
      const logger = new duckdb.VoidLogger();
      db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(workerUrl);
    })();

    await Promise.race([
        initPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Initialization timed out. This is likely due to the COI service worker issue.')), 5000))
    ]);

    connection = await db.connect();
    log('DuckDB-WASM Initialized Successfully.', 'pass');
  } catch (e) {
    log(`FATAL: Failed to initialize DuckDB-WASM. Error: ${e.message}`, 'fail');
    return;
  }

  const strategies = [
    {
      name: "PRAGMA database_size",
      exec: async () => {
        const result = await connection.query('PRAGMA database_size;');
        const usedBlocks = result.getChild('used_blocks')?.get(0);
        const blockSize = result.getChild('block_size')?.get(0);
        if (typeof usedBlocks !== 'bigint' || typeof blockSize !== 'bigint') throw new Error('Did not return correct block values.');
        return `Memory Used: ${usedBlocks * blockSize} bytes`;
      }
    },
    {
      name: "duckdb_settings() for threads and memory_limit",
      exec: async () => {
        const result = await connection.query("SELECT name, value FROM duckdb_settings() WHERE name IN ('threads', 'memory_limit');");
        const settings = result.toArray().map(row => row.toJSON());
        if (settings.length < 2) throw new Error('Did not return all expected settings.');
        return `Found ${settings.length} settings.`;
      }
    }
  ];

  for (const strategy of strategies) {
    log(`Testing strategy: "${strategy.name}"...`);
    try {
      const resultInfo = await strategy.exec();
      log(`✅ SUCCESS: "${strategy.name}". ${resultInfo}`, 'pass');
    } catch (e) {
      log(`❌ FAIL: "${strategy.name}". Error: ${e.message}`, 'fail');
    }
  }

  log('All tests completed.');
  await db.terminate();
  log('DuckDB worker terminated.');
}

runTests();