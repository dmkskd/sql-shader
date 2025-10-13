#!/usr/bin/env node
// Node-based test that invokes the native clickhouse-client (TCP on 9000)
// to prove spans are generated outside HTTP from JS by shelling out.

const { spawnSync } = require('child_process');

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (res.error) throw res.error;
  if (res.status !== 0) {
    const msg = res.stderr || res.stdout || `exit ${res.status}`;
    const err = new Error(msg.trim());
    err.code = res.status;
    throw err;
  }
  return res.stdout;
}

function main() {
  const host = process.env.CH_HOST || '127.0.0.1';
  const port = process.env.CH_PORT || '9000';
  const user = process.env.CH_USER || 'default';
  const password = process.env.CH_PASSWORD || 'sql_shader';

  // Check availability
  try {
    run('clickhouse-client', ['--version']);
  } catch (e) {
    console.error('clickhouse-client not found in PATH');
    process.exit(1);
  }

  const queryId = (Date.now().toString(16) + Math.random().toString(16).slice(2, 10));
  const sql = "SELECT 'otel-cli-js' AS message, now() AS ts SETTINGS opentelemetry_start_trace_probability = 1, log_queries = 1";

  console.log(`Using query_id: ${queryId}`);

  // Execute query via native client (TCP)
  run('clickhouse-client', [
    '--host', host,
    '--port', port,
    '--user', user,
    '--password', password,
    '--query_id', queryId,
    '--query', sql,
  ]);
  console.log('Query: OK');

  // Flush logs
  try {
    run('clickhouse-client', [
      '--host', host,
      '--port', port,
      '--user', user,
      '--password', password,
      '--query', 'SYSTEM FLUSH LOGS',
    ]);
    console.log('Flush logs: OK');
  } catch (e) {
    console.warn('Flush logs failed (non-fatal):', e.message);
  }

  // Count spans
  const countOut = run('clickhouse-client', [
    '--host', host,
    '--port', port,
    '--user', user,
    '--password', password,
    '--query', `SELECT count() FROM system.opentelemetry_span_log WHERE attribute['clickhouse.query_id'] = '${queryId}'`,
  ]).trim();
  const count = parseInt(countOut, 10) || 0;
  console.log(`Span count: ${count}`);

  if (count > 0) {
    console.log('OK: Spans present');
    const details = run('clickhouse-client', [
      '--host', host,
      '--port', port,
      '--user', user,
      '--password', password,
      '--query', `SELECT operation_name, start_time_us FROM system.opentelemetry_span_log WHERE attribute['clickhouse.query_id'] = '${queryId}' ORDER BY start_time_us ASC LIMIT 5`,
    ]);
    console.log('Sample spans:\n' + details.trim());
    process.exit(0);
  } else {
    console.error('FAIL: No spans found');
    process.exit(2);
  }
}

main();

