# DuckDB-WASM Tests

Browser-only tests for DuckDB WebAssembly engine.

## Tests

- ✅ **test_sql_execution.js** - Shader SQL execution (automated)
- ✅ **test_duckdb_stats.js** - Stats API (automated)

## Notes

- Zero setup - runs entirely in browser
- Needs SharedArrayBuffer (Cross-Origin Isolation via coi-serviceworker.js)
- Auto-selects multi-threaded or single-threaded bundle
