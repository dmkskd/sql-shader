# DataFusion HTTP Wrapper

This directory contains a Rust application that wraps Apache DataFusion with HTTP endpoints, making it accessible as a remote SQL engine for SQL Shader.

## Architecture

- **DataFusion**: Embedded SQL query engine (library)
- **Axum**: HTTP server framework
- **Arrow IPC**: Binary data format for query results

## Endpoints

### `GET /health`
Health check endpoint returning server status and version.

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

### `GET /ping`
Simple ping endpoint compatible with ClickHouse-style health checks.

**Response:**
```json
{
  "success": true
}
```

### `POST /query`
Execute a SQL query and return results.

**Request:**
```json
{
  "query": "SELECT 1 as x, 2 as y",
  "format": "arrow"  // or "json" (default: "arrow")
}
```

**Response (format=arrow):**
Binary Apache Arrow IPC stream format (Content-Type: application/vnd.apache.arrow.stream)

**Response (format=json):**
```json
{
  "data": [{"x": 1, "y": 2}],
  "rows": 1,
  "schema": [
    {"name": "x", "type": "Int32"},
    {"name": "y", "type": "Int32"}
  ]
}
```

## Building

### Local build:
```bash
cargo build --release
```

### Docker build:
```bash
docker build -t datafusion-server .
```

## Running

### Local:
```bash
cargo run --release
```

### Docker:
```bash
docker run -p 8124:8124 datafusion-server
```

The server listens on `0.0.0.0:8124`.

## Development

Set log level with `RUST_LOG` environment variable:
```bash
RUST_LOG=debug cargo run
```

## SQL Capabilities

DataFusion supports:
- Standard SQL queries
- Window functions
- Common table expressions (CTEs)
- Aggregate functions
- Math functions (sin, cos, sqrt, etc.)
- String functions
- Date/time functions

See [DataFusion SQL reference](https://arrow.apache.org/datafusion/user-guide/sql/index.html) for full details.
