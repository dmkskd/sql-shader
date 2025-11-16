# DataFusion Engine

## Overview

DataFusion is a query execution engine written in Rust that runs as an HTTP server in a Docker container. It provides native SQL support with Arrow columnar format for high-performance data transfer.

## Architecture

The DataFusion integration consists of:
- **Rust HTTP Server** (`docker/datafusion/src/main.rs`): Axum-based web server wrapping DataFusion
- **Docker Container**: Runs the server on port 8124
- **Arrow IPC Format**: Binary columnar data format for efficient serialization
- **Client Integration** (`src/engines/datafusion/datafusion_engine.js`): Browser-side engine implementation

## Performance Metrics

The DataFusion engine provides comprehensive performance metrics for every query execution:

### Timing Metrics

- **Parse/Plan**: Time spent parsing SQL and creating the query execution plan (lazy, no data processing)
- **Execution**: Time spent actually executing the query and collecting results (the real computational work)
- **Serialization**: Time spent converting Arrow RecordBatch results to Arrow IPC binary format on the server
- **HTTP Overhead**: Network latency + client-side Arrow parsing time (calculated as total round-trip minus server time)
- **Total Time**: End-to-end query execution time from browser request to usable data

### Data Metrics

- **Rows**: Total number of rows returned by the query
- **Result Size**: Total memory used by the result set in megabytes
- **Bytes/Row**: Average bytes per row (typically ~24 bytes for RGB shader output: 3 Float64 columns)

### Parallelism Metrics

- **CPU Cores**: Number of CPU cores available on the server (static, hardware configuration)
- **Rows/Batch**: Average number of rows per Arrow RecordBatch (affects parallelism, typically ~8,000)

### Throughput Metric

- **Throughput**: Query execution throughput in thousands of rows per second (K rows/sec)

## Query Execution Pipeline

DataFusion uses a two-phase execution model:

1. **Parse/Plan Phase**: `ctx.sql(query)` creates a logical plan (lazy, no execution)
2. **Execution Phase**: `df.collect()` executes the plan and materializes results

This separation allows for query optimization before execution.

## Arrow IPC Format

DataFusion returns results in Arrow IPC (Inter-Process Communication) format:
- **Columnar Layout**: Data organized by column, not row (cache-friendly)
- **Binary Format**: Compact binary representation (~10x smaller than JSON)
- **Zero-Copy**: Can be memory-mapped for efficient transfers
- **Batched**: Results split into batches for streaming and parallelism

## Metrics Transport

Metrics are sent via HTTP response headers to minimize overhead:
- `X-DataFusion-Parse-Ms`: Parse/plan timing (fractional milliseconds)
- `X-DataFusion-Execution-Ms`: Execution timing
- `X-DataFusion-Serialization-Ms`: Serialization timing
- `X-DataFusion-Total-Ms`: Total server-side time
- `X-DataFusion-Rows`: Row count
- `X-DataFusion-Batches`: Batch count
- `X-DataFusion-Bytes`: Memory usage
- `X-DataFusion-Columns`: Column count
- `X-DataFusion-CPU-Count`: Server CPU cores
- `X-DataFusion-Rows-Per-Batch`: Rows per batch average

All timing metrics use fractional milliseconds with 2 decimal places (0.01ms precision).

## Typical Performance Profile

For a 640×480 pixel shader (307,200 rows):
- **Parse/Plan**: ~1-2ms (SQL parsing + query planning)
- **Execution**: ~100-120ms (actual computation)
- **Serialization**: ~0.5-1ms (Arrow IPC encoding)
- **HTTP Overhead**: ~30-40ms (mostly client-side Arrow parsing)
- **Total**: ~150-170ms end-to-end

Execution time dominates, which is expected - this is where the actual shader computation happens.

## Docker Setup

The DataFusion server runs in a Docker container:
```bash
just start-datafusion  # Starts on port 8124
```

The container is connected to the `sql-shader-network` for communication with Caddy reverse proxy.

## Configuration

- **Port**: 8124 (internal), proxied via Caddy at `/datafusion/*`
- **CORS**: Permissive (allows all origins)
- **Format**: Arrow IPC (default) or JSON (for debugging)
- **Logging**: Configurable via `RUST_LOG` environment variable
