import { createClient } from '@clickhouse/client-web';

const resultsEl = document.getElementById('results');
let currentSummaryContainer = null;
let currentDetailsContainer = null;

const log = (message, type = 'info', target) => {
  const div = document.createElement('div');
  div.className = `test-case ${type}`;
  div.textContent = message;
  (target || currentDetailsContainer || resultsEl).appendChild(div);
  console.log(`[Test] ${message}`);
};

const logPre = (title, data, type = 'info', target) => {
  const div = document.createElement('div');
  div.className = `test-case ${type}`;
  div.innerHTML = `<strong>${title}:</strong><pre>${JSON.stringify(data, null, 2)}</pre>`;
  (target || currentDetailsContainer || resultsEl).appendChild(div);
  console.log(`[Test] ${title}:`, data);
};

const logRaw = (title, text, type = 'info', target) => {
  const div = document.createElement('div');
  div.className = `test-case ${type}`;
  div.innerHTML = `<strong>${title}:</strong><pre>${text}</pre>`;
  (target || currentDetailsContainer || resultsEl).appendChild(div);
  console.log(`[Test] ${title}:`, text);
};

function renderSummaryTable(summaries) {
  if (!currentSummaryContainer) return;
  currentSummaryContainer.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = 'OpenTelemetry Test Summary';
  currentSummaryContainer.appendChild(h);
  // Legend explaining strategies and test cases
  const legend = document.createElement('div');
  legend.style.fontSize = '12px';
  legend.style.color = '#bbb';
  legend.style.marginBottom = '8px';
  legend.innerHTML = `
    <div><strong>Legend — Strategies:</strong>
      <span class="badge na" title="Uses @clickhouse/client-web exec() and passes settings via the HTTP client (no extra headers)">exec(settings)</span>
      <span class="badge na" title="Runs SQL with SETTINGS clause via client.exec(); settings parsed on server">query(SETTINGS)</span>
      <span class="badge na" title="Direct browser fetch() with Basic auth and X-ClickHouse-Query-Id; SQL includes SETTINGS">fetch(SETTINGS)</span>
      <span class="badge na" title="Same as fetch(SETTINGS) but adds a W3C traceparent header; may be blocked by CORS or ignored by server">fetch(traceparent)</span>
    </div>
    <div style="margin-top:4px;"><strong>Legend — Test Cases:</strong>
      <span class="badge na" title="Very small SELECT to check basic span creation">Simple SELECT</span>
      <span class="badge na" title="Reads from system.metrics; validates spans for system table reads">System table query</span>
      <span class="badge na" title="SELECT from system.numbers LIMIT 1000; light compute">Numbers query</span>
      <span class="badge na" title="Heavier math over numbers; intended to generate more spans">Complex math query</span>
    </div>
  `;
  currentSummaryContainer.appendChild(legend);
  const table = document.createElement('table');
  table.className = 'summary-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Test</th>
        <th>Description</th>
        <th>Query ID</th>
        <th>Spans</th>
        <th>Span Count</th>
        <th>Strategies (OK/Total)</th>
        <th>Strategy Results</th>
      </tr>
    </thead>
    <tbody></tbody>`;
  const tbody = table.querySelector('tbody');
  const shortName = (id) => ({
    client_exec_with_settings: 'exec(settings)',
    client_query_with_sql_settings: 'query(SETTINGS)',
    direct_fetch_query_param: 'fetch(param)',
    direct_fetch_sql_settings: 'fetch(SETTINGS)',
    direct_fetch_traceparent_best_effort: 'fetch(traceparent)'
  }[id] || id);
  const stratExplain = (id) => ({
    client_exec_with_settings: 'client-web exec() with clickhouse_settings (HTTP)',
    client_query_with_sql_settings: 'client-web exec() of SQL with SETTINGS clause',
    direct_fetch_query_param: 'fetch() with query_id in URL (no custom headers)',
    direct_fetch_sql_settings: 'fetch() + Basic auth + X-ClickHouse-Query-Id; SQL has SETTINGS',
    direct_fetch_traceparent_best_effort: 'fetch() + traceparent header (may be CORS-blocked or ignored)'
  }[id] || id);
  for (const s of summaries) {
    const row = document.createElement('tr');
    const badge = s.spansFound ? '<span class="badge pass">PASS</span>' : '<span class="badge fail">FAIL</span>';
    const stratBadges = (s.strategyResults || []).map(r => {
      const status = r.ok ? 'OK' : `FAIL${r.error ? ' (' + r.error + ')' : ''}`;
      return `${shortName(r.id)}: ${status}`;
    }).join('<br>');
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.description || ''}</td>
      <td>${s.queryId.slice(0, 8)}...</td>
      <td>${badge}</td>
      <td>${s.spanCount}</td>
      <td>${s.strategyOk}/${s.strategyTotal}</td>
      <td>${stratBadges}</td>`;
    tbody.appendChild(row);
  }
  currentSummaryContainer.appendChild(table);
}

function getVerbosity() {
  const el = document.getElementById('verbosity');
  return el ? el.value : 'minimal';
}

async function runOpenTelemetryTest() {
  resultsEl.innerHTML = '';
  // Create fresh containers per run
  currentSummaryContainer = document.createElement('div');
  currentSummaryContainer.className = 'summary';
  currentDetailsContainer = document.createElement('div');
  resultsEl.appendChild(currentSummaryContainer);
  resultsEl.appendChild(currentDetailsContainer);
  const verbosity = getVerbosity();
  log(`Starting OpenTelemetry test... (verbosity: ${verbosity})`, 'info');

  try {
    // Get stored settings or use defaults
    const storedSettings = JSON.parse(localStorage.getItem('sql-shader.clickhouse-settings')) || {};
    
    log(`Connecting to ClickHouse: ${storedSettings.url || 'http://localhost:8123'}`, 'info');
    
    // Create client
    const client = createClient({
      url: storedSettings.url || 'http://localhost:8123',
      username: storedSettings.username || 'default',
      password: storedSettings.password || '',
    });

    // Test 1: Ping the server
    log('Test 1: Pinging server...', 'info');
    const pingResult = await client.ping();
    if (!pingResult.success) {
      throw new Error('Ping failed');
    }
    log('✓ Server ping successful', 'success');

    // Test 2: Check if OpenTelemetry tables exist
    log('Test 2: Checking OpenTelemetry tables...', 'info');
    const tablesQuery = "SHOW TABLES FROM system LIKE 'opentelemetry%'";
    const tablesResult = await client.query({ query: tablesQuery, format: 'JSONEachRow' });
    const tables = await tablesResult.json();
    logPre('Available OpenTelemetry tables', tables, 'info');
    
    if (tables.length === 0) {
      log('⚠ No OpenTelemetry tables found - check ClickHouse configuration', 'warning');
      return;
    }
    log('✓ OpenTelemetry tables found', 'success');

    // Test 3: Try different query types and multiple execution strategies
    log('Test 3: Testing different query types and strategies...', 'info');

    const strategies = [
      {
        id: 'client_exec_with_settings',
        label: 'client.exec() with clickhouse_settings',
        exec: async ({ query, queryId }) => {
          await client.exec({
            query,
            query_id: queryId,
            clickhouse_settings: {
              opentelemetry_start_trace_probability: '1.0',
              log_queries: 1,
              log_queries_min_type: 'QUERY_FINISH',
              log_queries_min_query_duration_ms: 0,
            }
          });
        }
      },
      {
        id: 'client_query_with_sql_settings',
        label: 'client.query() SQL SETTINGS',
        exec: async ({ query, queryId }) => {
          const sql = `${query} SETTINGS opentelemetry_start_trace_probability = 1, log_queries = 1`;
          await client.exec({ query: sql, query_id: queryId });
        }
      },
      {
        id: 'direct_fetch_query_param',
        label: 'fetch() with query_id param (same-origin friendly)',
        exec: async ({ query, queryId }) => {
          const sql = `${query} SETTINGS opentelemetry_start_trace_probability = 1, log_queries = 1`;
          const baseUrl = (storedSettings.url || 'http://localhost:8123').replace(/\/$/, '');
          const auth = btoa(`${storedSettings.username || 'default'}:${storedSettings.password || ''}`);
          const resp = await fetch(`${baseUrl}/?query_id=${encodeURIComponent(queryId)}`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'text/plain',
            },
            body: sql,
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
          await resp.text();
        }
      },
      {
        id: 'direct_fetch_sql_settings',
        label: 'fetch() with SQL SETTINGS',
        exec: async ({ query, queryId }) => {
          const sql = `${query} SETTINGS opentelemetry_start_trace_probability = 1, log_queries = 1`;
          const auth = btoa(`${storedSettings.username || 'default'}:${storedSettings.password || ''}`);
          const resp = await fetch((storedSettings.url || 'http://localhost:8123') + '/', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'X-ClickHouse-Query-Id': queryId,
              'Content-Type': 'text/plain',
            },
            body: sql,
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
          await resp.text();
        }
      },
      {
        id: 'direct_fetch_traceparent_best_effort',
        label: 'fetch() with traceparent header (best effort)',
        exec: async ({ query, queryId }) => {
          // Best-effort: may be blocked by CORS if server doesn’t allow this header
          const auth = btoa(`${storedSettings.username || 'default'}:${storedSettings.password || ''}`);
          const randHex = (bytes) => [...crypto.getRandomValues(new Uint8Array(bytes))]
            .map((b) => b.toString(16).padStart(2, '0')).join('');
          const traceId = randHex(16);
          const spanId = randHex(8);
          const traceparent = `00-${traceId}-${spanId}-01`;
          const sql = `${query} SETTINGS opentelemetry_start_trace_probability = 1, log_queries = 1`;
          logRaw('Attempting fetch with traceparent header', traceparent, 'info');
          const resp = await fetch((storedSettings.url || 'http://localhost:8123') + '/', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'X-ClickHouse-Query-Id': queryId,
              'traceparent': traceparent,
              'Content-Type': 'text/plain',
            },
            body: sql,
          }).catch(e => {
            log(`Fetch with traceparent header failed (likely CORS): ${e.message}`, 'warning');
            throw e;
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
          await resp.text();
        }
      },
    ];

    const testQueries = [
      {
        name: "Simple SELECT (literal + now())",
        description: "Runs: SELECT 'OpenTelemetry Test Query' AS message, now() AS timestamp",
        query: "SELECT 'OpenTelemetry Test Query' as message, now() as timestamp"
      },
      {
        name: "System table query (system.metrics)",
        description: "Reads system.metrics for 'Query' and 'MemoryTracking'",
        query: "SELECT metric, value FROM system.metrics WHERE metric IN ('Query', 'MemoryTracking') LIMIT 5"
      },
      {
        name: "Numbers query (LIMIT 1000)",
        description: "SELECT number and a derived column from system.numbers",
        query: "SELECT number, number * 2 as doubled FROM system.numbers LIMIT 1000"
      },
      {
        name: "Complex math query (sin/cos over grid)",
        description: "Computes sin/cos over a 100x100 grid generated from system.numbers",
        query: "SELECT x, y, sin(x * 0.1) * cos(y * 0.1) as value FROM (SELECT number % 100 as x, number / 100 as y FROM system.numbers LIMIT 10000)"
      }
    ];

    let lastTestQueryId = null;
    const summaries = [];

    for (const testCase of testQueries) {
      log(`=== Test: ${testCase.name} ===`, 'info');
      const testQueryId = crypto.randomUUID();
      lastTestQueryId = testQueryId; // Keep track of the last query ID
      log(`Using query_id: ${testQueryId.substring(0, 8)}...`, 'info');
      let strategyOk = 0;
      let strategyTotal = 0;
      const strategyResults = [];
      
      // Log the exact query for manual replication
      const exactQuery = `${testCase.query} SETTINGS opentelemetry_start_trace_probability = 1, log_queries = 1`;
      const queryIdInstruction = `For manual testing, use: clickhouse-client --query_id='${testQueryId}' --query="${testCase.query} SETTINGS opentelemetry_start_trace_probability = 1, log_queries = 1"`;
      if (verbosity !== 'minimal') {
        logRaw(`MANUAL REPLICATION - Copy this SQL`, exactQuery, 'info');
        logRaw(`COMMAND LINE VERSION`, queryIdInstruction, 'info');
      }

      // Execute all strategies for this test query sequentially, each using the same query_id
      for (const strat of strategies) {
        strategyTotal += 1;
        log(`Strategy: ${strat.label}`, 'info');
        try {
          await strat.exec({ query: testCase.query, queryId: testQueryId });
          strategyOk += 1;
          log(`Strategy '${strat.label}' executed`, 'success');
          strategyResults.push({ id: strat.id, ok: true });
        } catch (e) {
          log(`Strategy '${strat.label}' failed: ${e.message}`, 'warning');
          strategyResults.push({ id: strat.id, ok: false, error: e.message });
        }
      }
      
      // --- Force Log Flush ---
      // This is the critical step. We command the server to flush its in-memory
      // log buffers to the system tables. This is more reliable than waiting.
      try {
        await client.command({ query: 'SYSTEM FLUSH LOGS' });
      } catch (e) {
        log(`Warning: SYSTEM FLUSH LOGS failed. This might happen due to permissions. Test may be flaky. Error: ${e.message}`, 'warning');
      }

      // --- Robust Polling for Spans ---
      // Instead of a fixed wait, we poll for the spans to appear.
      let spanCount = 0;
      const maxRetries = 10;
      const retryDelay = 500; // ms
      for (let i = 0; i < maxRetries; i++) {
        if (verbosity === 'verbose') log(`Attempt ${i + 1}/${maxRetries}: Checking for spans...`, 'info');
        // Check by query_id attribute
        const spanQuery = `SELECT count(*) as span_count FROM system.opentelemetry_span_log WHERE attribute['clickhouse.query_id'] = '${testQueryId}'`;

        if (i === 0 && verbosity !== 'minimal') {
          // Log the query only on the first attempt for clarity
          logRaw(`SPAN CHECK QUERY - Copy this to verify spans`, spanQuery, 'info');
        }

        const spanResult = await client.query({ query: spanQuery, format: 'JSONEachRow' });
        const spanData = await spanResult.json();
        spanCount = spanData[0]?.span_count || 0;

        if (spanCount > 0) {
          break; // Spans found, exit the loop
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      if (spanCount > 0) {
        log(`✓ ${testCase.name}: Generated ${spanCount} spans`, 'success');
        
        // Also show the detailed span query for manual checking
        if (verbosity !== 'minimal') {
          const detailedSpanQuery = `SELECT trace_id, span_id, operation_name, start_time_us, finish_time_us, (finish_time_us - start_time_us) / 1000 as duration_ms FROM system.opentelemetry_span_log WHERE attribute['clickhouse.query_id'] = '${testQueryId}' ORDER BY start_time_us ASC`;
          logRaw(`DETAILED SPANS QUERY - Copy this to see span details`, detailedSpanQuery, 'success');
        }
        
      } else {
        log(`✗ ${testCase.name}: No spans generated`, 'error');
        // Provide a detailed debug snapshot of recent spans to compare
        if (verbosity !== 'minimal') {
          const debugRecent = `
            SELECT
              formatDateTime(toDateTime64(start_time_us/1e6, 6), '%Y-%m-%d %H:%M:%S.%f') AS start_time,
              operation_name,
              attribute['clickhouse.query_id'] AS query_id_attr
            FROM system.opentelemetry_span_log
            WHERE start_time_us >= now() - INTERVAL 5 MINUTE
            ORDER BY start_time_us DESC
            LIMIT 20`;
          logRaw('DEBUG: Recent spans (5m)', debugRecent, 'warning');
        }
      }
      // Additional comparison to understand triggers
      const compareQuery = `
        SELECT operation_name, count() AS cnt
        FROM system.opentelemetry_span_log
        WHERE start_time_us >= now() - INTERVAL 5 MINUTE
        GROUP BY operation_name
        ORDER BY cnt DESC
        LIMIT 10`;
      if (verbosity === 'verbose') {
        const compareResult = await client.query({ query: compareQuery, format: 'JSONEachRow' });
        const compareRows = await compareResult.json();
        logPre('Top recent operations (5m)', compareRows, 'info');
      }
      summaries.push({ name: testCase.name, description: testCase.description || testCase.query, queryId: testQueryId, spansFound: spanCount > 0, spanCount, strategyOk, strategyTotal, strategyResults });
    }

    // Test 7: Trigger analysis — only in verbose mode
    if (verbosity === 'verbose') {
      log('Test 7: Trigger analysis (query_id vs none)...', 'info');
      const triggerQuery = `
        SELECT
          attribute['clickhouse.query_id'] AS query_id_attr,
          count() AS spans,
          anyLast(operation_name) AS sample_operation
        FROM system.opentelemetry_span_log
        WHERE start_time_us >= now() - INTERVAL 5 MINUTE
        GROUP BY query_id_attr
        ORDER BY spans DESC
        LIMIT 10`;
      const triggerResult = await client.query({ query: triggerQuery, format: 'JSONEachRow' });
      const triggerRows = await triggerResult.json();
      logPre('Spans by query_id presence (5m)', triggerRows, 'info');
    }
    renderSummaryTable(summaries);

    if (verbosity !== 'minimal') {
      // Use the last test query ID for remaining tests (or skip if no queries were tested)
      if (!lastTestQueryId) {
        log('No test queries were executed, skipping remaining tests', 'warning');
        renderSummaryTable(summaries);
        return;
      }

      // Test 4: Wait and check if query appears in query_log (using the last query)
      log('Test 4: Checking query_log for our last query...', 'info');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const queryLogQuery = `SELECT query_id, type, Settings['opentelemetry_start_trace_probability'] as otel_setting, substring(query, 1, 100) as query_snippet FROM system.query_log WHERE query_id = '${lastTestQueryId}' ORDER BY event_time DESC`;
      
      const queryLogResult = await client.query({ query: queryLogQuery, format: 'JSONEachRow' });
      const queryLogData = await queryLogResult.json();
      
      if (queryLogData.length === 0) {
        log('⚠ Query not found in query_log - may need more time', 'warning');
        renderSummaryTable(summaries);
        return;
      }
      
      logPre('Query in query_log', queryLogData, 'info');
      
      const finishedQuery = queryLogData.find(row => row.type === 'QueryFinish');
      if (!finishedQuery) {
        log('⚠ QueryFinish entry not found', 'warning');
        renderSummaryTable(summaries);
        return;
      }
      
      const otelEnabled = finishedQuery.otel_setting === '1' || finishedQuery.otel_setting === 1;
      if (otelEnabled) {
        log('✓ OpenTelemetry setting confirmed in query_log', 'success');
      } else {
        log(`✗ OpenTelemetry NOT enabled in query_log (setting: ${finishedQuery.otel_setting})`, 'error');
        renderSummaryTable(summaries);
        return;
      }

      // Test 5: Check for spans in opentelemetry_span_log (using the last query)
      log('Test 5: Checking for spans in opentelemetry_span_log...', 'info');
      
      const spanQuery = `
        SELECT trace_id, span_id, operation_name,
               start_time_us, finish_time_us,
               attribute['clickhouse.query_id'] as query_id_attr
        FROM system.opentelemetry_span_log
        WHERE attribute['clickhouse.query_id'] = '${lastTestQueryId}'
        ORDER BY start_time_us ASC`;
      
      const spanResult = await client.query({ query: spanQuery, format: 'JSONEachRow' });
      const spans = await spanResult.json();
      
      if (spans.length === 0) {
        log('✗ NO SPANS FOUND for our query', 'error');
        
        if (verbosity === 'verbose') {
          // Debug: Check recent spans and summarize generation characteristics
          log('Debug: Checking recent spans (analysis)...', 'info');
          const recentAggQuery = `
            SELECT 
              toStartOfMinute(toDateTime64(start_time_us/1e6, 6)) AS minute,
              count() AS spans,
              countIf(attribute['clickhouse.query_id'] != '') AS with_query_id,
              anyLast(operation_name) AS sample_operation
            FROM system.opentelemetry_span_log
            WHERE start_time_us >= now() - INTERVAL 5 MINUTE
            GROUP BY minute
            ORDER BY minute DESC
            LIMIT 5`;
          const recentAggRes = await client.query({ query: recentAggQuery, format: 'JSONEachRow' });
          const recentAgg = await recentAggRes.json();
          logPre('Recent spans summary (5m, per minute)', recentAgg, 'warning');
        }
        
      } else {
        log(`✓ SUCCESS! Found ${spans.length} spans for our query`, 'success');
        if (verbosity !== 'minimal') logPre('Generated spans', spans, 'success');
        
        // Test 6: Get all spans for our query_id (full picture)
        if (spans.length > 0 && verbosity === 'verbose') {
          log('Test 6: Getting all spans for our query_id...', 'info');
          const qAllSpans = `
            SELECT trace_id, span_id, parent_span_id, operation_name, start_time_us, finish_time_us,
                   (finish_time_us - start_time_us) / 1000 as duration_ms
            FROM system.opentelemetry_span_log
            WHERE attribute['clickhouse.query_id'] = '${lastTestQueryId}'
            ORDER BY start_time_us ASC`;
          const traceSpansResult = await client.query({ query: qAllSpans, format: 'JSONEachRow' });
          const traceSpans = await traceSpansResult.json();
          log(`✓ Found ${traceSpans.length} spans related to the query_id`, 'success');
          logPre('Complete trace spans (by query_id)', traceSpans, 'success');
        }
      }
    }

  } catch (error) {
    log(`✗ Test failed: ${error.message}`, 'error');
    console.error('Test error:', error);
  }
}

function clearResults() {
  resultsEl.innerHTML = '';
}

// Make functions globally available
window.runOpenTelemetryTest = runOpenTelemetryTest;
window.clearResults = clearResults;
