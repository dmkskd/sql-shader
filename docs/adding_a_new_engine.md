# How to Add a New Engine to PixelQL

This document outlines the process for integrating a new database engine into the PixelQL application. The architecture is designed to be modular, allowing for different SQL-based backends to be used as rendering engines.

## Core Concept: The Engine Interface

The application interacts with different databases through a consistent "Engine" interface, which relies on duck-typing. This means that as long as your engine object provides the required methods, the application will be able to use it.

An engine's responsibilities include:

- its own initialization
- query execution
- profiling
- providing a list of its specific shaders.

The best starting point is to review the `engines/dummy/dummy_engine.js` file. It provides a minimal, non-functional implementation of the engine interface that is useful as a template.

## 1. File Structure

First, create a new directory for your engine inside the `engines/` folder. The directory name should match the `value` you will use in the main `index.html` dropdown.

```
engines/
├── my_new_engine/
│   ├── my_new_engine_engine.js   # Core engine logic
│   └── my_new_engine_shaders.js  # Shader definitions
└── ... (other engines)
```

## 2. The Engine Interface (`my_new_engine_engine.js`)

Your `my_new_engine_engine.js` file must export a constant named `engine` which is an instance of a class that implements the following methods.

---

#### `async initialize(statusCallback)`

*   **Purpose**: To set up the engine. This is where you establish a connection to a remote server or instantiate a WASM-based database.
*   **`statusCallback`**: A function that accepts a string to display progress updates in the UI (e.g., "Connecting to server...").
*   **Differences**:
    *   **WASM-based Engine**: This typically involves selecting a WASM bundle, instantiating a worker, and creating a database connection instance. This is an entirely client-side process. For a concrete example, see `duckdb_wasm_engine.js`.
    *   **Remote Engine**: This typically involves creating a client to connect to a remote endpoint (e.g., via HTTP or another protocol). It's common to include a `ping()` or similar call to verify server connectivity. This type of engine often relies on user-provided settings (URL, credentials) from `localStorage`. For a concrete example, see `clickhouse_engine.js`.

---

#### `async prepare(sql)`

*   **Purpose**: To validate the provided SQL and prepare it for execution. It should return an object with a `query` method.
*   **Return Value**: `Promise<{ query: function(...args): Promise<{table: ArrowTable, timings: object}> }>`
*   **Details**: This method is the ideal place to perform syntax validation. A good implementation will catch compilation errors here, rather than during the render loop.
*   **Differences**:
    *   **Stateful Engines**: Engines that support prepared statements (like DuckDB-WASM) can perform validation and return a prepared statement object directly.
    *   **Stateless Engines**: For engines with a stateless request/response model (like many HTTP-based APIs), there may not be a formal "prepare" step. In this case, to provide good editor feedback, it is best practice to run a lightweight validation query (e.g., `EXPLAIN PLAN`). This allows the engine to catch syntax errors before the main render loop begins. See `clickhouse_engine.js` for an example of this pattern.

---

#### `async executeQuery(sql, params)`

*   **Purpose**: To run the actual query with runtime parameters and return the pixel data. This method is typically called by the function returned from `prepare`.
*   **`params`**: An array of uniform values: `[width, height, iTime, mx, my]`.
*   **Return Value**: `Promise<{table: ArrowTable, timings: object}>`. The `table` must be an Apache Arrow Table with `r`, `g`, and `b` columns (Float32). The `timings` object can provide a breakdown of execution time (e.g., `query`, `network`, `processing`).

---

#### `async pollEngineStats()`

*   **Purpose**: To fetch real-time performance metrics from the engine for display in the performance bar. This method is polled at a regular interval.
*   **Return Value**: `Promise<Array<object>>`. Each object represents a single statistic and must have the following shape:
    ```javascript
    {
      label: 'Display Name',      // The name of the stat
      value: 'Formatted Value',   // The string value to display (e.g., "123.4 MB")
      rawValue: 123400000,        // The raw numeric value for the sparkline graph
      description: 'Tooltip text' // A helpful description for the stat
    }
    ```
*   **Differences**:
    *   **WASM-based Engine**: Stats are often fetched using `PRAGMA` commands (e.g., `PRAGMA database_size`).
    *   **Remote Engine**: Stats are often fetched by querying internal system tables (e.g., `system.metrics` or `information_schema`).

---

#### `async profile(sql, params, statusCallback)`

*   **Purpose**: To execute the query with profiling enabled and gather detailed performance data.
*   **Return Value**: `Promise<object>`. A data object containing all the raw information needed by `renderProfile`. The shape of this object is specific to your engine.

---

#### `async renderProfile(profileData, mainContainer)`

*   **Purpose**: To render the UI for the profiler modal using the data collected by the `profile` method.
*   **`mainContainer`**: The `HTMLElement` inside the modal where your profiler UI should be injected. This allows each engine to have a completely custom profiler view (e.g., with tabs, graphs, etc.).

---

#### `getShaders()`

*   **Purpose**: To return the list of available example shaders for the engine.
*   **Return Value**: An array of shader objects, e.g., `[{ name: 'My Shader', sql: 'SELECT ...' }]`.

---

#### `async loadShaderContent(shader)`

*   **Purpose**: To asynchronously load the SQL content for a shader, typically from a file.
*   **Details**: This allows the UI to populate the shader dropdown immediately while fetching the actual SQL content on demand when a user selects a shader.

## 3. The Shaders File (`my_new_engine_shaders.js`)

This file is responsible for defining the shaders available for your engine. It must export two things:

1.  **`SHADERS`**: An array of shader objects. Each object should have a `name` and either the full `sql` content or a `path` to the `.sql` file.
2.  **`loadShaderContent(shader)`**: An async function that takes a shader object and returns its SQL content. If the shader is file-based, this function should use `fetch` to load it.

## 4. Integration

The final step is to add your new engine to the dropdown list in `index.html`.

```html
<select id="engine-select">
  <option value="duckdb_wasm">DuckDB WASM</option>
  <option value="clickhouse">ClickHouse</option>
  <option value="dummy">Dummy</option>
  <option value="my_new_engine">My New Engine</option> <!-- Add your engine here -->
</select>
```

The `value` attribute must exactly match the name of the directory you created in the `engines/` folder. The `main.js` script uses this value to dynamically construct the import path (e.g., `./engines/my_new_engine/my_new_engine_engine.js`).

By following this structure, you can integrate any SQL-based engine that can return data in the required Arrow format, leveraging the application's existing UI and rendering pipeline.
