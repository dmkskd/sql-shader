import { createClient } from '@clickhouse/client-web';

const resultsEl = document.getElementById('results');
const log = (msg, type = 'info') => {
  const div = document.createElement('div');
  div.className = `test-case ${type}`;
  div.textContent = msg;
  resultsEl.appendChild(div);
  console.log(`[OTEL-Min] ${msg}`);
};
const logRaw = (title, text, type = 'info') => {
  const div = document.createElement('div');
  div.className = `test-case ${type}`;
  div.innerHTML = `<strong>${title}:</strong><pre>${text}</pre>`;
  resultsEl.appendChild(div);
  console.log(`[OTEL-Min] ${title}:`, text);
};

async function runMinimalOtelTest() {
  resultsEl.innerHTML = '';
  try {
    const settings = JSON.parse(localStorage.getItem('sqlshader.clickhouse-settings')) || {};
    const url = settings.url || 'http://localhost:8123';
    const user = settings.username || 'default';
    const password = settings.password || '';

    log(`Connecting to ClickHouse at ${url}`);
    const client = createClient({ url, username: user, password });

    const ping = await client.ping();
    if (!ping.success) throw new Error('Ping failed');
    log('Ping OK', 'success');

    const queryId = crypto.randomUUID();
    log(`Using query_id: ${queryId.substring(0, 8)}...`);

    const sql = "SELECT 'otel-minimal' AS message, now() AS ts SETTINGS opentelemetry_start_trace_probability = 1, log_queries = 1";
    logRaw('Query', sql);

    await client.exec({
      query: sql,
      query_id: queryId,
      clickhouse_settings: {
        opentelemetry_start_trace_probability: '1.0',
        log_queries: 1,
        log_queries_min_type: 'QUERY_FINISH',
        log_queries_min_query_duration_ms: 0,
      }
    });

    try {
      await client.command({ query: 'SYSTEM FLUSH LOGS' });
    } catch (e) {
      log(`SYSTEM FLUSH LOGS failed: ${e.message}`, 'warning');
    }

    // Poll for spans
    let count = 0;
    for (let i = 0; i < 10; i++) {
      const q = `SELECT count() AS c FROM system.opentelemetry_span_log WHERE attribute['clickhouse.query_id'] = '${queryId}'`;
      if (i === 0) logRaw('SPAN CHECK', q);
      const rs = await client.query({ query: q, format: 'JSONEachRow' });
      const rows = await rs.json();
      count = rows[0]?.c || 0;
      if (count > 0) break;
      await new Promise(r => setTimeout(r, 500));
    }

    if (count > 0) {
      log(`✓ Spans found for query_id (${count})`, 'success');
      const detail = `SELECT trace_id, span_id, operation_name, start_time_us, finish_time_us FROM system.opentelemetry_span_log WHERE attribute['clickhouse.query_id'] = '${queryId}' ORDER BY start_time_us ASC`;
      logRaw('SPAN DETAILS QUERY', detail, 'success');
    } else {
      log('✗ No spans found for query_id', 'error');
      const recent = `SELECT operation_name, attribute['clickhouse.query_id'] as qid, start_time_us FROM system.opentelemetry_span_log WHERE start_time_us >= now() - INTERVAL 2 MINUTE ORDER BY start_time_us DESC LIMIT 20`;
      logRaw('RECENT SPANS (2m)', recent, 'warning');
    }
  } catch (e) {
    log(`Failed: ${e.message}`, 'error');
    console.error(e);
  }
}

function clearResults() { resultsEl.innerHTML = ''; }

window.runMinimalOtelTest = runMinimalOtelTest;
window.clearResults = clearResults;

