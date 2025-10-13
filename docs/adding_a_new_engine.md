# How to Add a New Engine to PixelQL

# How to Add a New Engine to SQL Shader

This guide explains how to integrate a new database engine into SQL Shader. The architecture is designed to be modular, allowing for different SQL-based backends to be used as rendering engines.

## Core Concept: The Engine Interface

The application interacts with different databases through an "Engine" interface.

An engine's responsibilities include:

- its own initialization
- query execution
- profiling
- providing a list of shaders.

The best starting point is to review the `src/engines/dummy/dummy_engine.js` file. It provides a minimal, non-functional implementation of the engine interface that is useful as a template.

## 1. File Structure

First, create a new directory for your engine inside the `src/engines/` folder. The directory name should match the `value` you will use in the main `index.html` dropdown.

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

*   **CORS Considerations for Remote Engines**:
    *   **The Problem**: When accessing remote databases from the browser, CORS (Cross-Origin Resource Sharing) can block requests. The browser enforces same-origin policy, preventing JavaScript from reading responses from different origins unless the server explicitly allows it with `Access-Control-Allow-Origin` headers.
    *   **Solution 1 - Browser-Aware Client Library**: Some databases provide browser-specific client libraries that handle CORS automatically. **ClickHouse** uses `@clickhouse/client-web`, a specialized browser client that properly configures fetch requests to work with CORS. This is the cleanest solution when available.
    *   **Solution 2 - Reverse Proxy with CORS Headers**: For databases without browser clients (like **QuestDB**), use a reverse proxy (e.g., Caddy) that adds CORS headers:
        ```
        handle /questdb/* {
            reverse_proxy questdb-server:9000 {
                header_down Access-Control-Allow-Origin *
                header_down Access-Control-Allow-Methods "GET, POST, OPTIONS"
            }
        }
        ```
        The engine then connects to `http://localhost:8000/questdb` instead of directly to the database.
    *   **Development vs Production**: During development, you can use permissive CORS (`Access-Control-Allow-Origin: *`). In production, specify exact origins for security.

---

#### `async prepare(sql)`

- **Purpose**: To validate the provided SQL and prepare it for execution. It should return an object with a `query` method.
- **Return Value**: `Promise<{ query: function(uniforms): Promise<{table: ArrowTable, timings: object}> }>`
- **Details**: This method is the ideal place to perform syntax validation. A good implementation will catch compilation errors here, rather than during the render loop.
- **Differences**:
  - **Stateful Engines**: Engines that support prepared statements (like DuckDB-WASM) can perform validation and return a closure that captures the prepared statement.
  - **Stateless Engines**: For engines with a stateless request/response model (like many HTTP-based APIs), there may not be a formal "prepare" step. In this case, to provide good editor feedback, it is best practice to run a lightweight validation query (e.g., `EXPLAIN PLAN`). This allows the engine to catch syntax errors before the main render loop begins. See `clickhouse_engine.js` for an example of this pattern.

---

#### `async query(uniforms)`

- **Purpose**: To run the actual query with runtime parameters and return the pixel data. This method is typically called by the function returned from `prepare`.
- **`uniforms`**: A ShaderToy-style [uniform](../src/uniform_builder.js) object containing:
  - `iResolution`: `[width, height, depth]` - Canvas resolution
  - `iTime`: Current time in seconds
  - `iMouse`: `[mouseX, mouseY, clickX, clickY]` - Mouse coordinates
  - `iDate`: `[year, month, day, timeOfDay]` - Current date/time
  - `iFrame`: Frame counter
  - ... And other ShaderToy-compatible uniforms
  
- **Return Value**: `Promise<{table: ArrowTable, timings: object}>`. The `table` must be an Apache Arrow Table with `r`, `g`, and `b` columns (Float32). The `timings` object can provide a breakdown of execution time (e.g., `query`, `network`, `processing`).
- **Note**: Each engine implements this method internally. The public interface only uses the `query` function returned by `prepare()`.

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

#### `getSettingsPanel()` (Optional)

*   **Purpose**: To provide a string of HTML for the engine's settings panel.
*   **Return Value**: An HTML string. If the engine has no settings, this method can be omitted.
*   **Details**: This allows an engine to define its own configuration UI, which will be dynamically injected into the settings modal. This keeps the UI manager generic and avoids hardcoded logic for specific engines. See `clickhouse_engine.js` for an example.

---

#### `populateSettings(storedSettings, defaultSettings)` (Optional)

*   **Purpose**: To populate the fields in the engine's settings panel with values from `localStorage` or the engine's defaults.
*   **Details**: This method is called by the UI manager after the settings panel has been injected into the DOM. It is responsible for finding the elements it created (e.g., via `document.getElementById`) and setting their `value`. This keeps the UI manager completely agnostic about the structure of an engine's settings.

---

#### `saveSettings()` (Optional)

*   **Purpose**: To read the current values from the engine's settings form (provided by `getSettingsPanel`) and save them to `localStorage`.
*   **Details**: This method is called when the user clicks the "Save and Reload" button in the settings modal. It is responsible for retrieving the values from the DOM elements it created and persisting them. This keeps the UI manager completely agnostic about the structure and content of engine-specific settings.

---

#### `getShaders()`

*   **Purpose**: To return the list of available example shaders for the engine.
*   **Return Value**: An array of shader objects, e.g., `[{ name: 'My Shader', sql: 'SELECT ...' }]`.

---

#### `async loadShaderContent(shader)`

*   **Purpose**: To asynchronously load the SQL content for a shader, typically from a file.
*   **Details**: This allows the UI to populate the shader dropdown immediately while fetching the actual SQL content on demand when a user selects a shader.

## 3. The Shaders File (`my_new_engine_shaders.js`)

This file is responsible for defining the shaders available for your engine. To simplify this process and avoid code duplication, you should use the `ShaderLoader` utility class.

Your shaders file should do the following:
1.  Import `ShaderLoader` from `../shader_loader.js`.
2.  Define an array of paths to your engine's `.sql` files.
3.  Instantiate the `ShaderLoader` with this array.
4.  Export `SHADERS` and `loadShaderContent` from the loader instance.

See `engines/duckdb_wasm/duckdb_wasm_shaders.js` for a clear example.

## 4. Integration

The final steps are to register your engine in the manifest and update the UI.

#### Add to `engines/engines.json`

Add a new entry for your engine in the `engines/engines.json` file. This manifest drives the engine selection UI and initialization logic.

```json
{
  "id": "my_new_engine",
  "name": "My New Engine",
  "requiresConfiguration": true
}
```
*   `id`: Must match the directory name you created.
*   `name`: The user-friendly name for the dropdown.
*   `requiresConfiguration`: Set to `true` if your engine needs settings (like a URL or credentials) to be configured by the user before it can initialize.

The `main.js` script uses the `id` to dynamically construct the import path (e.g., `./engines/my_new_engine/my_new_engine_engine.js`).

By following this structure, you can integrate any SQL-based engine that can return data in the required Arrow format, leveraging the application's existing UI and rendering pipeline.
