#!/usr/bin/env bash
set -euo pipefail

# Prove spans can be generated via clickhouse-client (native TCP),
# then verify presence in system.opentelemetry_span_log by query_id.

CH_HOST="${CH_HOST:-127.0.0.1}"
CH_PORT="${CH_PORT:-9000}"
CH_USER="${CH_USER:-default}"
CH_PASSWORD="${CH_PASSWORD:-sql_shader}"

if ! command -v clickhouse-client >/dev/null 2>&1; then
  echo "Error: clickhouse-client not found in PATH" >&2
  exit 1
fi

QUERY_ID="$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || date +%s%N)"
echo "Using query_id: ${QUERY_ID}"

OTEL_SQL="SELECT 'otel-cli' AS message, now() AS ts SETTINGS opentelemetry_start_trace_probability = 1, log_queries = 1"

echo "Running query via clickhouse-client..."
clickhouse-client \
  --host "${CH_HOST}" \
  --port "${CH_PORT}" \
  --user "${CH_USER}" \
  --password "${CH_PASSWORD}" \
  --query_id "${QUERY_ID}" \
  --query "${OTEL_SQL}" >/dev/null

echo "Flushing system logs..."
clickhouse-client \
  --host "${CH_HOST}" \
  --port "${CH_PORT}" \
  --user "${CH_USER}" \
  --password "${CH_PASSWORD}" \
  --query "SYSTEM FLUSH LOGS" >/dev/null || true

echo "Checking span count for query_id..."
COUNT=$(clickhouse-client \
  --host "${CH_HOST}" \
  --port "${CH_PORT}" \
  --user "${CH_USER}" \
  --password "${CH_PASSWORD}" \
  --query "SELECT count() FROM system.opentelemetry_span_log WHERE attribute['clickhouse.query_id'] = '${QUERY_ID}'")

echo "Span count for query_id ${QUERY_ID}: ${COUNT}"

if [ "${COUNT}" -gt 0 ]; then
  echo "OK: Spans present for query_id ${QUERY_ID}"
  echo "To inspect details, run:"
  echo "  clickhouse-client --host ${CH_HOST} --port ${CH_PORT} --user ${CH_USER} --password ${CH_PASSWORD} \\
        --query \"SELECT trace_id, span_id, operation_name, start_time_us, finish_time_us FROM system.opentelemetry_span_log WHERE attribute['clickhouse.query_id'] = '${QUERY_ID}' ORDER BY start_time_us ASC\""
  exit 0
else
  echo "FAIL: No spans found for query_id ${QUERY_ID}" >&2
  echo "Recent spans (2m), sample:" >&2
  clickhouse-client \
    --host "${CH_HOST}" \
    --port "${CH_PORT}" \
    --user "${CH_USER}" \
    --password "${CH_PASSWORD}" \
    --query "SELECT operation_name, attribute['clickhouse.query_id'] AS qid, start_time_us FROM system.opentelemetry_span_log WHERE start_time_us >= now() - INTERVAL 2 MINUTE ORDER BY start_time_us DESC LIMIT 20" >&2 || true
  exit 2
fi

