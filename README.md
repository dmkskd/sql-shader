# PixelQL

**[Try the Live Demo Here](https://dmkskd.github.io/sql-shader/)**

This project is a browser-based, live shader editor that uses SQL as a shading language. It allows you to write SQL queries that run on every frame to generate real-time, procedural graphics. The application is designed to be a creative coding environment and a tool for exploring the performance and capabilities of different analytical database engines for per-pixel computations.

It currently supports two database engines:
*   **DuckDB-WASM**: Runs entirely in the browser using WebAssembly. No server required.
*   **ClickHouse**: Connects to a 'remote' (as external to the browser) ClickHouse server via its HTTP interface. It can be a local instance running on your machine.

## Features

*   **Live SQL Editor**: CodeMirror-based editor with SQL syntax highlighting.
*   **Real-time Rendering**: The canvas updates on every frame based on your SQL query's output.
*   **Dynamic Uniforms**: Your queries have access to `iTime`, `width`, `height`, and mouse coordinates (`mx`, `my`).
*   **Engine Agnostic**: Switch between DuckDB and ClickHouse to compare syntax and performance.
*   **Performance Profiling**: An `EXPLAIN ANALYZE` / `EXPLAIN PLAN` feature to inspect the query plan.
*   **Configurable Environment**: Adjustable resolution, zoom, and connection settings.
*   **Persistent State**: Your last-used shader and connection settings are saved in `localStorage`.

## Local Development Setup

This is a pure front-end application. You do not need `npm` or any build tools to run it. You only need a simple local web server.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd sql-shader
    ```

2.  **Run a local web server.**
    A simple way is to use Python's built-in server.
    ```bash
    python3 -m http.server
    ```
    Alternatively, you can use other tools like `npx serve`.

3.  **Open your browser** to `http://localhost:8000`.

### Engine-Specific Setup

#### DuckDB-WASM

No additional setup is required. The DuckDB engine runs entirely in the browser. The necessary libraries are loaded from a CDN.

#### ClickHouse

To use the ClickHouse engine, you need a running ClickHouse server that is accessible from your browser.

1.  **Run ClickHouse using Docker (Recommended):**
    This command will start a ClickHouse server and expose its HTTP interface on port 8123.
    The `-e CLICKHOUSE_PASSWORD=your_password` flag is necessary for recent versions of the image to enable network access for the `default` user.
    Replace `your_password` with a password of your choice.
    ```bash
    docker run -p 8123:8123  --ulimit nofile=262144:262144 -e CLICKHOUSE_PASSWORD=your_password clickhouse/clickhouse-server
    ```

2.  **Configure Connection in the App:**
    *   Select "ClickHouse" from the engine dropdown in the application header.
    *   If your server is not at the default `http://localhost:8123`, click the "Settings" button to configure the URL, username, and password.
    *   The settings are saved to `localStorage` and will persist across sessions.

## Architecture Overview

The application is built with vanilla JavaScript modules, emphasizing a clean separation of concerns.

*   `main.js`: The application entry point. It initializes the modules, manages the core rendering loop (`renderFrame`), and orchestrates the overall application flow.
*   `ui_manager.js`: Handles all direct DOM manipulation, UI state, and event listeners. It is the "view" layer of the application.
*   `shader_manager.js`: The "controller" layer. It manages the application's state (e.g., `isPlaying`, `hasCompilationError`), handles shader compilation via the engine, and parses performance hints from the SQL code.
*   `engines/`: This directory contains the engine-specific logic. Each sub-directory implements a common interface (`initialize`, `prepare`, `profile`, `getShaders`) for a specific database.
    *   `engines/duckdb_wasm/`: Contains the implementation for DuckDB-WASM.
    *   `engines/clickhouse/`: Contains the implementation for connecting to a ClickHouse server.

## How It Works

1.  **Initialization**: `main.js` loads the selected engine module.
2.  **UI Setup**: `ui_manager.js` populates dropdowns and attaches all event listeners.
3.  **Engine Init**: The selected engine initializes its connection (either to the WASM worker or the remote server).
4.  **Compilation**: The `shader_manager.js` takes the SQL from the editor and sends it to the engine's `prepare` method.
5.  **Render Loop**: On each animation frame, `main.js` calls the prepared query with updated uniforms (`iTime`, mouse coordinates, etc.).
6.  **Drawing**: The result of the query (an Arrow table of RGB values) is efficiently drawn to the HTML5 canvas pixel by pixel.