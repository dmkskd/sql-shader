# QuestDB Integration

This document explains how to use QuestDB with SQL Shader, including both HTTP and PostgreSQL connection options.

## Overview

QuestDB is a high-performance time-series database that supports both:
- **HTTP/REST API** - Simple, browser-compatible (default)
- **PostgreSQL Wire Protocol** - Standard PostgreSQL compatibility (requires proxy for browser)

## Quick Start (HTTP)

The default configuration uses HTTP/REST, which works directly from the browser:

```bash
# Start QuestDB and web server
just run

# Open http://localhost:8000
```

That's it! No additional setup required.

## PostgreSQL Wire Protocol Setup

To use the PostgreSQL wire protocol from the browser, you need a WebSocket proxy. 

**Good news: No Node.js installation required!** The proxy runs in a Docker container.

### 1. Start QuestDB and Proxy

```bash
# Start QuestDB
just start-questdb

# Start WebSocket proxy (Docker - no npm needed!)
just start-questdb-ws-proxy
```

The proxy automatically builds and runs in a container, connecting to QuestDB.

### 2. Configure SQL Shader

1. Open SQL Shader settings (gear icon)
2. Under "QuestDB Connection", change Protocol to "PostgreSQL Wire Protocol"
3. Save and reload

The proxy listens on `ws://localhost:8812` and forwards to QuestDB's PostgreSQL interface.

## Protocol Comparison

| Feature | HTTP/REST | PostgreSQL |
|---------|-----------|------------|
| Browser Support | ✅ Native | ⚠️ Requires WebSocket proxy |
| Setup Complexity | Simple | Moderate |
| Performance | Good | Better (binary protocol) |
| Standard Tools | QuestDB-specific | Works with pg tools |
| Recommended For | Browser apps, development | Production, existing pg infrastructure |

## Configuration

### HTTP Settings

```javascript
{
  "protocol": "http",
  "url": "http://localhost:8000/questdb"  // Via Caddy proxy for CORS
}
```

### PostgreSQL Settings

```javascript
{
  "protocol": "pg",
  "pgHost": "localhost",
  "pgPort": 8812,
  "pgDatabase": "qdb",
  "pgUser": "admin",
  "pgPassword": "quest"
}
```

## Shader Examples

Both protocols use the same SQL syntax with placeholder replacement:

```sql
-- Gradient shader
SELECT 
    cast(x - 1 as double) % {width} / {width} as r,
    floor(cast(x - 1 as double) / {width}) / {height} as g,
    sin({iTime} + x * 0.001) as b
FROM long_sequence({pixels})
ORDER BY x;
```

Available placeholders:
- `{width}` - Canvas width in pixels
- `{height}` - Canvas height in pixels
- `{pixels}` - Total pixels (width * height)
- `{iTime}` - Elapsed time in seconds
- `{mouseX}` - Mouse X coordinate
- `{mouseY}` - Mouse Y coordinate
- `{iFrame}` - Current frame number
- `{iTimeDelta}` - Time since last frame
- `{iFrameRate}` - Current FPS

## Troubleshooting

### HTTP Issues

**"Could not connect to QuestDB"**
- Ensure QuestDB container is running: `docker ps | grep questdb`
- Check Caddy proxy is running and configured correctly
- Verify http://localhost:9001 is accessible

**CORS errors**
- Make sure you're accessing via Caddy (localhost:8000)
- Don't access QuestDB directly from browser (localhost:9001)

### PostgreSQL Issues

**"WebSocket connection failed"**
- Ensure the proxy is running: `node scripts/questdb-ws-proxy.js`
- Check QuestDB PostgreSQL port (8812) is accessible
- Verify no firewall is blocking WebSocket connections

**"Authentication failed"**
- Check credentials in settings match QuestDB configuration
- Default QuestDB credentials: admin/quest

**"PostgreSQL connection timeout"**
- Ensure QuestDB container is running with PostgreSQL port exposed
- Check proxy logs for connection errors
- Try HTTP mode to isolate the issue

## WebSocket Proxy Details

The proxy runs in a Docker container (`docker/questdb/ws-proxy/`) and provides:

- **No Node.js required** - Runs entirely in Docker
- WebSocket server exposed on port 8813 (host) → 8812 (container)
- Automatically connects to QuestDB container via Docker link
- JSON-based message protocol for simplicity
- Connection pooling per WebSocket client
- Automatic cleanup on disconnect

Message format:
```javascript
// Authentication
{type: 'auth', database: 'qdb', user: 'admin', password: 'quest'}
// Response: {type: 'ready'}

// Query
{type: 'query', id: 123, sql: 'SELECT ...'}
// Response: {type: 'result', id: 123, rows: [...]}
```

## Profiling and Performance Analysis

SQL Shader provides built-in profiling tools for QuestDB queries, accessible via the "Profile" button in the UI.

### EXPLAIN Query Plans

The profiler uses QuestDB's `EXPLAIN` command to show the query execution strategy:

```sql
EXPLAIN SELECT ...
```

The execution plan shows:

- **Execution nodes**: PageFrame (table scans), Async JIT Filter (parallel filtering), VirtualRecord (projections), GroupBy, Sort, Hash Join
- **Parallelization**: Number of worker threads used
- **JIT compilation**: Whether filters are compiled for better performance
- **Interval scans**: Optimized timestamp range queries
- **Filter conditions**: WHERE clause predicates being applied

### Profiler Features

1. **Overview Tab**
   - Query execution time (including data transfer and JS processing)
   - EXPLAIN analysis time
   - Protocol used (HTTP or PostgreSQL)

2. **Execution Plan Tab**
   - Hierarchical query plan with syntax highlighting
   - Explanations of common plan nodes
   - Performance optimization hints

3. **Server Config Tab** (HTTP only)
   - Relevant server parameters (worker threads, JIT, parallelization settings)
   - Configuration values and sources

4. **SQL Query Tab**
   - The actual SQL executed with placeholders replaced
   - Useful for debugging parameter substitution

### Using the Profiler

1. Write your shader SQL query
2. Click the "Profile" button in the UI
3. The profiler will:
   - Generate an EXPLAIN plan
   - Execute the query with timing
   - Retrieve server configuration (HTTP mode)
   - Display results in an interactive tabbed interface

### Understanding Performance

**What EXPLAIN shows:**

- The *planned* execution strategy (not the actual execution)
- Potential parallelization and optimizations
- Filter and join strategies

**What EXPLAIN doesn't show:**

- Actual runtime statistics
- Memory usage
- I/O operations

**Note:** EXPLAIN does not execute the query, so it's fast and safe to run on expensive queries.

### Performance Tips

1. **Use HTTP for development** - Simpler setup, easier debugging
2. **Use PostgreSQL for production** - Better performance with binary protocol
3. **Limit result sets** - Use `LIMIT` or appropriate WHERE clauses
4. **Index appropriately** - QuestDB automatically indexes timestamp columns
5. **Profile early** - Check execution plans before running expensive queries
6. **Watch for sequential scans** - Consider adding WHERE clauses on timestamp columns

### Advanced Profiling

For deeper analysis, you can query QuestDB's system tables directly:

```sql
-- Show all tables with metadata
SHOW TABLES;

-- Show partitions with disk size
SHOW PARTITIONS FROM your_table;

-- Show server parameters
SHOW PARAMETERS;

-- Show server version
SHOW SERVER_VERSION;
```

These queries can be executed directly in SQL Shader's SQL editor.

## Further Reading

- [QuestDB Documentation](https://questdb.io/docs/)
- [QuestDB REST API](https://questdb.io/docs/reference/api/rest/)
- [QuestDB PostgreSQL Wire Protocol](https://questdb.io/docs/reference/api/postgres/)
- [QuestDB EXPLAIN](https://questdb.io/docs/reference/sql/explain/)
- [QuestDB SHOW Commands](https://questdb.io/docs/reference/sql/show/)
