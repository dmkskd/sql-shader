# DataFusion Profiler

## Overview

The DataFusion profiler provides query analysis and performance insights for SQL Shader queries running on Apache DataFusion.

## Architecture

The profiler follows a modular architecture similar to the ClickHouse profiler:

```
datafusion_profiler.js          # Main orchestrator
profiler/
  ├── explain.js                # EXPLAIN plan visualization
  └── metrics.js                # Query execution metrics
```

Each module is autonomous and implements a standard interface:
- `fetchData(baseUrl, sql, uniforms, statusCallback)` - Fetch and store data
- `render()` - Return HTML for tab content
- `setupEventHandlers(containerId)` - Attach event listeners

## Features

### 1. Explain Plan Module

Visualizes DataFusion query plans:

- **Logical Plan**: Optimized logical query plan via `EXPLAIN <query>`
- **Physical Plan**: Execution strategy via `EXPLAIN ANALYZE <query>` (if supported)

**DataFusion Documentation:**
- [EXPLAIN SQL command](https://datafusion.apache.org/user-guide/sql/explain.html)
- [Plan representations](https://docs.rs/datafusion/latest/datafusion/#plan-representations)

### 2. Query Metrics Module

Displays execution metrics:

- Query execution time (client-side measurement)
- Number of rows returned
- Result schema (column names and types)
- Server-provided metrics (if available)
