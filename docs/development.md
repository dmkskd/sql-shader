# SQL Shader Development Guide

This document provides an architectural overview of the SQL Shader application for developers working on the codebase.

## Core Concept

The application treats SQL databases as GPU-like shader processors. SQL queries generate pixel grids using `generate_series()` cross joins, with each row representing a pixel's RGB values. The result is rendered directly to an HTML5 canvas for real-time graphics.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       Application Architecture                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │   HTML UI   │    │   main.js    │    │   Engine Layer  │    │
│  │             │◄──►│              │◄──►│                 │    │
│  │ - Canvas    │    │ - Render     │    │ - DuckDB WASM   │    │
│  │ - Editor    │    │   Loop       │    │ - ClickHouse    │    │
│  │ - Controls  │    │ - UI Mgmt    │    │ - Custom Engines│    │
│  └─────────────┘    └──────────────┘    └─────────────────┘    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     Supporting Modules                         │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Shader      │  │ Uniform     │  │ Performance │            │
│  │ Manager     │  │ Builder     │  │ Monitor     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Rendering Pipeline

The core rendering pipeline follows this flow every frame:

```
Frame Start
     │
     ▼
┌─────────────────┐
│ UniformBuilder  │  ← Build ShaderToy-style uniforms
│ .build({        │    (iTime, iResolution, iMouse, etc.)
│   width,        │
│   height,       │    
│   iTime,        │
│   mouseX,       │
│   mouseY,       │
│   audio         │
│ })              │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Engine.query()  │  ← Engine-specific parameter translation
│                 │
│ DuckDB:         │    DuckDB: Flatten to JSON dot notation
│  iResolution.x  │              {"iResolution.x": 800, ...}
│  iResolution.y  │    
│                 │    ClickHouse: JSON string or placeholders
│ ClickHouse:     │                   '{"iResolution":[800,600]}'
│  JSON string    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ SQL Execution   │  ← Database processes pixel grid query
│                 │
│ WITH pixels AS  │    Example: 800x600 = 480,000 rows
│ (SELECT i::DOUBLE AS x, j::DOUBLE AS y                 │
│  FROM generate_series(0, 799) AS t(i)                  │
│  CROSS JOIN generate_series(0, 599) AS t2(j))          │
│ SELECT r, g, b FROM pixels, uniforms WHERE ...         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Arrow Table     │  ← Result: Arrow table with r,g,b columns
│ Result          │    Type: Float32Array for each color
│                 │
│ {               │    Format: Each row = one pixel
│   table: Arrow, │           Ordered by: y, x
│   timings: {}   │           Values: 0.0 to 1.0
│ }               │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Canvas Drawing  │  ← Direct transfer to ImageData
│                 │
│ for (i=0; i<len; i++) {                     │
│   imageData[i*4+0] = r[i] * 255; // Red    │
│   imageData[i*4+1] = g[i] * 255; // Green  │
│   imageData[i*4+2] = b[i] * 255; // Blue   │
│   imageData[i*4+3] = 255;        // Alpha  │
│ }                                          │
│ ctx.putImageData(imageData, 0, 0);         │
└─────────┬───────┘
          │
          ▼
     Frame Complete
```

## Engine Interface Flow

Each engine implements a consistent interface but handles preparation and execution differently:

```
                    Engine Interface
                         │
                         ▼
            ┌─────────────────────────┐
            │  engine.prepare(sql)    │
            └─────────┬───────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ DuckDB  │   │ ClickH. │   │ Dummy   │
   │         │   │         │   │         │
   │ REAL    │   │ SYNTAX  │   │ NO-OP   │
   │ PREPARE │   │ CHECK   │   │         │
   │         │   │         │   │         │
   │ await   │   │ EXPLAIN │   │ return  │
   │ conn.   │   │ PLAN    │   │ {}      │
   │ prepare │   │         │   │         │
   │ (sql)   │   │         │   │         │
   └─────────┘   └─────────┘   └─────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
            ┌─────────────────────────┐
            │  Return Closure:        │
            │  {                      │
            │    query: async (uniforms) => │
            │      this.query(sql,    │
            │        preparedStmt,    │
            │        uniforms)        │
            │  }                      │
            └─────────┬───────────────┘
                      │
                      ▼
            ┌─────────────────────────┐
            │  Later: prepared.query()│
            │                         │
            │  Calls engine's internal│
            │  query() method with    │
            │  captured context       │
            └─────────────────────────┘
```

## Key Components

### 1. Main Application (`main.js`)
- **Size**: 757 lines (monolithic, could be refactored)
- **Responsibilities**:
  - Engine initialization and switching
  - Render loop coordination
  - UI event handling
  - Canvas management
  - Performance monitoring

### 2. Engine Layer (`src/engines/`)
- **Pattern**: Dynamic loading via `engines.json` manifest
- **Interface**: Duck-typed, consistent across all engines
- **Examples**: DuckDB-WASM (stateful), ClickHouse (stateless), Dummy (testing)

### 3. Shader Manager (`shader_manager.js`)
- **Purpose**: SQL compilation and state management
- **Features**: Dirty checking, performance hints, error handling
- **Pattern**: Manages lifecycle from editor to prepared statements

### 4. Uniform Builder (`uniform_builder.js`)
- **Purpose**: Creates pure JavaScript uniform objects
- **Format**: ShaderToy-compatible (iTime, iResolution, iMouse, etc.)
- **Engine-agnostic**: Each engine translates as needed

## Initialization Flow

```
Page Load
     │
     ▼
┌─────────────────┐
│ index.html      │  ← Load main.js as ES module
│                 │    Load COI service worker
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ main.js         │  ← Entry point
│ initializeEngine│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Load engines.   │  ← Fetch engines.json manifest
│ json            │    Populate engine dropdown
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Dynamic Import  │  ← import(`./engines/${id}/${id}_engine.js`)
│ Selected Engine │    Based on URL params or localStorage
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ engine.         │  ← Engine-specific initialization
│ initialize()    │    (DuckDB: worker setup, ClickHouse: ping)
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Initial Shader  │  ← Load default shader for engine
│ Compilation     │    Call engine.prepare(sql)
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Start Render    │  ← Begin requestAnimationFrame loop
│ Loop            │    Start stats polling
└─────────────────┘
```

## Data Flow Patterns

### Stateful Engine (DuckDB-WASM)
```
prepare(sql) → connection.prepare(sql) → PreparedStatement
                                              │
                                              ▼
query(uniforms) → preparedStatement.query(params) → ArrowTable
```

### Stateless Engine (ClickHouse)
```
prepare(sql) → EXPLAIN PLAN check → Validation Only
                                          │
                                          ▼
query(uniforms) → HTTP POST with substituted SQL → ArrowTable
```

## Performance Considerations

### Hot Path Optimization
1. **Arrow Table Direct Access**: Use `.getChild('r').toArray()` instead of `.toJSON()`
2. **Prepared Statement Reuse**: DuckDB caches compilation, ClickHouse validates once
3. **ImageData Direct Transfer**: Avoid object creation in pixel loop
4. **Parameter Translation**: Minimize object allocation per frame

### Cross-Origin Isolation
- **Required for**: DuckDB-WASM multithreading (SharedArrayBuffer)
- **Implementation**: `coi-serviceworker.js` adds COOP/COEP headers
- **Critical**: Must load before any DuckDB initialization

## File Structure

```
src/
├── main.js                 # Main application (757 lines)
├── ui_manager.js          # UI state and event handling  
├── shader_manager.js      # SQL compilation lifecycle
├── uniform_builder.js     # ShaderToy-style uniforms
├── performance_monitor.js # FPS, timing, sparklines
├── audio_manager.js       # Audio reactivity
├── asset_manager.js       # Shader browser/selector
├── coi-serviceworker.js   # Cross-origin isolation
└── engines/
    ├── engines.json       # Engine manifest
    ├── shader_loader.js   # Utility for loading .sql files
    ├── duckdb_wasm/       # Stateful WASM engine
    ├── clickhouse/        # Stateless HTTP engine  
    └── dummy/             # Testing/template engine
```

## Common Patterns

### Engine Implementation Template
```javascript
class MyEngine {
  async initialize(statusCallback) { /* Setup */ }
  
  async prepare(sql) {
    // Validation/compilation
    return {
      query: async (uniforms) => this.query(sql, preparedData, uniforms)
    };
  }
  
  async query(sql, preparedData, uniforms) {
    // Engine-specific parameter translation
    // Database execution  
    // Return {table: ArrowTable, timings: object}
  }
  
  async pollEngineStats() { /* Performance metrics */ }
  async profile(sql, uniforms, statusCallback) { /* Profiling */ }
  async renderProfile(data, container) { /* Custom UI */ }
  
  getShaders() { /* Available examples */ }
  async loadShaderContent(shader) { /* Load .sql files */ }
}

export const engine = new MyEngine();
```

### SQL Shader Template
```sql
-- Uniforms available in all engines
WITH uniforms AS (
  SELECT 
    ?::JSON AS params  -- ClickHouse JSON format
    -- OR use json_extract for DuckDB:
    -- json_extract(?, '$.iResolution.x') AS width
),

-- Generate pixel grid
pixels AS (
  SELECT 
    i::DOUBLE AS x, 
    j::DOUBLE AS y
  FROM generate_series(0, width-1) AS t(i) 
  CROSS JOIN generate_series(0, height-1) AS t2(j)
),

-- Calculate colors
colors AS (
  SELECT 
    sin(x * 0.1 + iTime) AS r,
    cos(y * 0.1 + iTime) AS g, 
    (sin(x * 0.1) + cos(y * 0.1)) * 0.5 AS b,
    x, y
  FROM pixels, uniforms
)

SELECT r, g, b 
FROM colors 
ORDER BY y, x;  -- Critical: maintain pixel order
```

## Development Workflow

### Adding a New Engine
1. Create `src/engines/my_engine/` directory
2. Implement `my_engine_engine.js` (see `dummy_engine.js` template)
3. Create `my_engine_shaders.js` using `ShaderLoader`
4. Add entry to `engines.json`
5. Test with simple shader first

### Debugging Performance
- Check render loop timing in stats panel
- Use browser DevTools Performance tab
- Monitor Arrow table allocation
- Verify prepared statement reuse

### Common Issues
- **Missing CORS headers**: Check `coi-serviceworker.js` is loaded
- **Pixel order scrambled**: Ensure `ORDER BY y, x` in SQL
- **Type errors**: Cast to `::DOUBLE` for math operations
- **Parameter mismatches**: Verify uniform translation in engine

## Future Architecture Improvements

1. **Modularize main.js**: Split into EngineManager, RenderPipeline, UIController
2. **Standardize uniform handling**: Create UniformAdapter for consistent translation
3. **Add engine test framework**: Automated validation for new engines
4. **Improve error boundaries**: Better isolation between engine and UI errors