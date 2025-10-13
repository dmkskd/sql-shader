# SQL Shader Test Suite

Testing infrastructure for the multi-engine SQL shader system.

## Quick Start

1. Open `test/index.html` in browser to see all tests
2. **Automated tests**: Run directly in browser
3. **Server tests**: Require `just run` first (starts ClickHouse + Caddy)

## Test Categories

### 🦆 DuckDB-WASM Engine Tests
**Location**: `test/duckdb_wasm/`

Pure browser tests using DuckDB WebAssembly engine. No server required.

- **SQL Shader Execution**: Real pixel shader queries rendering to canvas
- **Stats API**: Performance metrics, timing, profiling data
- **JSON Format**: Result format validation

### 🏠 ClickHouse Engine Tests
**Location**: `test/clickhouse/`

Server-backed tests using ClickHouse. Requires Docker setup.

**Prerequisites**:
```bash
just run  # Starts ClickHouse + Caddy server
```

- **SQL Shader Execution**: Real pixel shader queries with ClickHouse backend
- **Data Formats**: Arrow vs JSON format comparison and performance
- **Profiling Suite**: Advanced performance analysis tools

### 📊 Profiling & Performance
**Location**: `test/clickhouse/` (engine-specific profiling)

Performance analysis tools for ClickHouse queries.

#### OpenTelemetry
- **Full**: Complete OTEL tracing setup
- **Minimal**: Lightweight OTEL test
- **CLI**: Command-line OTEL tools (`test_opentelemetry_cli.js`)
- **Python**: Python-based OTEL testing (`test_opentelemetry_python.py`)

#### FlameGraphs
- **Grouping Test**: Visualization logic validation

### ⚙️ Uniform Parameters
**Location**: `test/parameter_system/`

Tests for passing shader uniforms (iTime, resolution, mouse, etc.) to SQL queries.

- **Parameter Binding Suite**: Tests uniform parameter passing and type conversion
- **Cross-engine validation**: Ensures consistent behavior across DuckDB and ClickHouse

### 🎵 Strudel Audio Integration
**Location**: `test/` (pending move to `test/strudel/`)

Tests for Strudel live coding audio pattern integration.

- **Integration Test**: 6 test cases for Strudel API
- **Multiline Pattern Debug**: REPL syntax conversion testing

## Test Organization Principles

### Directory Structure
```
test/
├── index.html              # Test dashboard (start here!)
├── README.md               # This file
│
├── duckdb_wasm/            # DuckDB-WASM engine tests
├── clickhouse/             # ClickHouse engine tests  
├── parameter_system/       # Cross-engine parameter tests
└── strudel/                # Audio integration tests (WIP)
```

### Naming Conventions
- `test_*.html` - Test pages
- `test_*.js` - Test logic/utilities
- `*.sql` - SQL test queries
- `*_test.html` - Alternative test naming

### Test Badges
Tests are categorized by type:

- 🟢 **Automated**: Run directly in browser, zero setup
- 🟠 **Manual**: Requires user interaction/verification
- 🔴 **Server**: Requires ClickHouse Docker container
- 🟣 **WIP**: Work in progress or pending consolidation

## Running Tests

### Automated Tests (No Setup)
```bash
# Just open in browser:
open test/index.html
# Click any test with green "Automated" badge
```

### Server-Required Tests
```bash
# 1. Start services
just run

# 2. Open test dashboard
open http://localhost:8000/test/

# 3. Click any test with red "Server" badge
```

### Stopping Services
```bash
just stop
```



## Contributing New Tests

### Adding a Test

1. **Choose appropriate directory**:
   - Engine-specific → `test/duckdb_wasm/` or `test/clickhouse/`
   - Feature-specific → `test/parameter_system/`, `test/strudel/`, etc.

2. **Follow naming convention**: `test_<feature>_<description>.html`

3. **Add to index.html**: Include in appropriate category with badge

4. **Document**: Add entry to this README

### Test Template

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Feature Test</title>
</head>
<body>
    <h1>My Feature Test</h1>
    <div id="results"></div>
    
    <script type="module">
        // Test logic here
        console.log('Test starting...');
    </script>
</body>
</html>
```

## Debugging Tests

### Common Issues

**Test won't load**:
- Check browser console for errors
- Ensure services are running (`just run` for server tests)
- Verify CORS/cross-origin isolation (some tests need `coi-serviceworker.js`)

**ClickHouse connection failed**:
- Verify Docker containers: `docker ps`
- Check ClickHouse health: `curl http://localhost:8123/ping`
- View logs: `docker logs clickhouse-server`

**DuckDB-WASM initialization failed**:
- Check browser support for WebAssembly and SharedArrayBuffer
- Try in Chrome/Edge (best compatibility)
- Check browser console for specific errors

## Advanced Topics

### Cross-Origin Isolation

Some tests (especially DuckDB-WASM with threads) require cross-origin isolation.

The `coi-serviceworker.js` file provides this capability. Include in test HTML:

```html
<script src="../coi-serviceworker.js"></script>
```

### ClickHouse Test Setup

The ClickHouse tests use a custom Docker setup with:
- Profiling enabled (`enable_profiling.xml`)
- System log tables enabled (`enable_system_log_tables.xml`)
- OpenTelemetry configuration
- Caddy reverse proxy for CORS

Config files: `docker/clickhouse/`

### Python Tests

Some ClickHouse tests use Python with uv:

```bash
cd test/clickhouse
uv sync
uv run python test_opentelemetry_python.py
```


