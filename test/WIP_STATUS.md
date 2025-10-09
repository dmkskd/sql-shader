# Test Infrastructure Standardization - WIP

## ✅ What's Done

### New Test Infrastructure
- **BaseTestRunner** pattern for dual-mode (browser + CLI) tests
- **CLI runner** with `just test [folder]` command
- **Shared CSS** (Nordic minimalist design)
- **Auto-discovery** in CLI (folder-based, no manual registry)
- **Hardcoded list** in browser (index.html) - can't read directories

### Tests Migrated (5 suites)
1. ✅ `example/test_example.html` - 3 reference tests
2. ✅ `clickhouse/test_clickhouse_formats.html` - 10 data format tests
3. ✅ `duckdb_wasm/test_duckdb_stats.html` - 2 DuckDB stats tests
4. ✅ `clickhouse/test_sql_execution.html` - 4 ClickHouse shader tests
5. ✅ `duckdb_wasm/test_sql_execution.html` - 3 DuckDB shader tests

### Naming Convention
- **Single pattern:** `test_*.html` only (no more mixed patterns)
- Example: `test_example.html`, `test_sql_execution.html`

### Documentation
- Short READMEs in each test category folder
- No fluff, just what/how to run

## 🔄 Still TODO

### Tests Not Yet Migrated
- ⏳ `parameter_system/test_parameter_system.html` - Works but old pattern
- ⏳ `clickhouse/test_opentelemetry.html` - Advanced manual test, keep as-is
- ⏳ `clickhouse/test_opentelemetry_min.html` - Advanced manual test, keep as-is
- ⏳ `strudel/strudel_test.html` - Manual audio test, keep as-is
- ⏳ `strudel/test_strudel_multiline.html` - Manual audio test, keep as-is

### Known Limitations
- **Browser index.html:** Test list is hardcoded (browsers can't read directories)
- **Need to update list manually** when adding new tests
- CLI runner works perfectly (Node.js can read directories)

## 📋 Usage

### CLI (Recommended)
```bash
just test              # Run all tests
just test example      # Run specific category
just test duckdb_wasm
just test clickhouse
```

### Browser
1. Start server: `just run`
2. Open: `http://localhost:8000/test/`
3. Click test links
4. Click "Run Tests" button

## 🎯 Philosophy

- "Tests are a chore" → Keep it simple
- Folder-based organization, no complex registry
- Hardcoded defaults for non-interactive testing
- Focus on automatable CI/CD tests

## 📝 To Add a New Test

1. Create `test/category/test_name.js` extending BaseTestRunner
2. Create `test/category/test_name.html` with standard structure
3. Add to hardcoded list in `test/index.html` (browser limitation)
4. That's it! CLI auto-discovers it.

## 🚀 Ready for Commit

This is a good starting point. Infrastructure works, core tests migrated, clear path forward.
