# ClickHouse Tests

Tests for ClickHouse server backend.

## Tests

- ✅ **test_sql_execution.js** - Shader SQL execution (automated)
- ✅ **test_clickhouse_formats.js** - Data formats comparison (automated)
- ✅ **test_flamegraph_grouping.js** - Flamegraph grouping logic (automated)
- 🔧 **test_opentelemetry.js** - OTEL trace propagation (manual)
- 🔧 **test_opentelemetry_min.js** - Quick OTEL validation (manual)

## Setup

```bash
just run  # Starts ClickHouse
```

Default: `localhost:8123`, `default/your_password`
