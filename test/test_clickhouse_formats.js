import { createClient } from '@clickhouse/client-web';
import * as arrow from '@apache/arrow';

const resultsEl = document.getElementById('results');
const summaryEl = document.getElementById('summary');
const summaryTableBody = document.querySelector('#summary-table tbody');

const log = (message, type = 'info') => {
  const div = document.createElement('div');
  div.className = `test-case ${type}`;
  div.textContent = message;
  resultsEl.appendChild(div);
  console.log(`[Test] ${message}`);
};

const summarize = (strategyName, status, time) => {
    const row = summaryTableBody.insertRow();
    row.innerHTML = `<td>${strategyName}</td><td>${status}</td><td>${time}</td>`;
    row.classList.add(status === 'SUCCESS' ? 'pass' : 'fail');
};

async function runTests() {
  resultsEl.innerHTML = ''; // Clear previous results
  log('Starting ClickHouse data format tests...');

  const storedSettings = JSON.parse(localStorage.getItem('pixelql.clickhouse-settings')) || {};
  const client = createClient({
    url: storedSettings.url || 'http://localhost:8123',
    username: storedSettings.username || 'default',
    password: storedSettings.password || '',
  });

  const shaderSql = `
    WITH
        {width:UInt32} AS width,
        {height:UInt32} AS height,
        {iTime:Float64} AS iTime,
        t_x.number AS x,
        t_y.number AS y
    SELECT
        (0.5 + (0.5 * cos(iTime + (x / width * 5)))) AS r,
        (0.5 + (0.5 * sin(iTime + (y / height * 5)))) AS g,
        (0.5 + (0.5 * cos(iTime + 0.5))) AS b
    FROM system.numbers AS t_x
    CROSS JOIN system.numbers AS t_y
    WHERE x < width AND y < height
    ORDER BY y, x
  `;

  const finalSql = shaderSql
    .replace('{width:UInt32}', 320)
    .replace('{height:UInt32}', 240)
    .replace('{iTime:Float64}', 1.0);

  const strategies = [
    {
      name: "JSONEachRow with client.query()",
      format: 'JSONEachRow',
      exec: async () => {
        const resultSet = await client.query({ query: finalSql, format: 'JSONEachRow' });
        const rows = await resultSet.json();
        if (!rows || rows.length === 0) throw new Error("No rows returned.");
        // We don't need to convert to Arrow for this test, just confirm we got the data.
      }
    },
    {
      name: "ULTIMATE: Arrow with client.exec() and manual stream consumption",
      format: 'Arrow',
      exec: async () => {
        const execResult = await client.exec({ query: finalSql, format: 'Arrow' });
        if (!execResult.stream) throw new Error("execResult.stream is undefined.");

        // Manually consume the stream to prevent truncation errors. This is the most robust method.
        const reader = execResult.stream.getReader();
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        const table = await arrow.tableFromIPC(chunks);
        if (table.numRows === 0) throw new Error("Arrow table is empty.");
      }
    },
    {
      name: "DEFINITIVE: Arrow with client.query() and resultSet.arrayBuffer()",
      format: 'Arrow',
      exec: async () => {
        const resultSet = await client.query({ query: finalSql, format: 'Arrow' });
        // This is the correct method on the ResultSet for binary formats.
        const buffer = await resultSet.arrayBuffer();
        const table = await arrow.tableFromIPC(buffer);
        if (table.numRows === 0) throw new Error("Arrow table is empty.");
      }
    },
    {
      name: "Arrow with client.exec() and response.body",
      format: 'Arrow',
      exec: async () => {
        const execResult = await client.exec({ query: finalSql, format: 'Arrow' });
        if (!execResult.response) throw new Error("execResult.response is undefined.");
        const table = await arrow.tableFromIPC(execResult.response.body);
        if (table.numRows === 0) throw new Error("Arrow table is empty.");
      }
    },
    {
      name: "ArrowStream with client.exec() and result.stream",
      format: 'ArrowStream',
      exec: async () => {
        const execResult = await client.exec({ query: finalSql, format: 'ArrowStream' });
        if (!execResult.stream) throw new Error("execResult.stream is undefined.");
        const table = await arrow.tableFromIPC(execResult.stream);
        if (table.numRows === 0) throw new Error("Arrow table is empty.");
      }
    },
    {
      name: "ArrowStream with client.exec() and new Response(result.stream)",
      format: 'ArrowStream',
      exec: async () => {
        const execResult = await client.exec({ query: finalSql, format: 'ArrowStream' });
        if (!execResult.stream) throw new Error("execResult.stream is undefined.");
        const response = new Response(execResult.stream);
        const buffer = await response.arrayBuffer();
        const table = await arrow.tableFromIPC(buffer);
        if (table.numRows === 0) throw new Error("Arrow table is empty.");
      }
    },
    {
      name: "ArrowStream with client.exec() and manual stream consumption",
      format: 'ArrowStream',
      exec: async () => {
        const execResult = await client.exec({ query: finalSql, format: 'ArrowStream' });
        if (!execResult.stream) throw new Error("execResult.stream is undefined.");
        
        // Manually consume the stream to prevent truncation errors.
        const reader = execResult.stream.getReader();
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        // Concatenate all chunks into a single Uint8Array.
        const table = await arrow.tableFromIPC(chunks);
        if (table.numRows === 0) throw new Error("Arrow table is empty.");
      }
    }
  ];

  for (const strategy of strategies) {
    log(`Testing strategy: "${strategy.name}"...`);
    const t0 = performance.now();
    try {
      await strategy.exec();
      const t1 = performance.now();
      const duration = (t1 - t0).toFixed(2);
      log(`✅ SUCCESS: "${strategy.name}" completed in ${duration}ms.`, 'pass');
      summarize(strategy.name, 'SUCCESS', duration);
    } catch (e) {
      const t1 = performance.now();
      const duration = (t1 - t0).toFixed(2);
      log(`❌ FAIL: "${strategy.name}" failed after ${duration}ms. Error: ${e.message}`, 'fail');
      summarize(strategy.name, `FAIL: ${e.message}`, duration);
    }
  }

  summaryEl.style.display = 'block';
  log('All tests completed.');
}

runTests();
