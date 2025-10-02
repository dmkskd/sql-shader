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

## Quick Start (Recommended)

This project uses `just` as a command runner to simplify starting the required services (Caddy web server and ClickHouse).

1.  **Prerequisites**:
    *   Install Docker.
    *   Install `just`.

2.  **Configure**:
    *   Open the `justfile` in the project root.
    *   Set the `ch_password` variable to your desired ClickHouse password.

3.  **Run**:
    *   Start all services (Caddy web server and ClickHouse):
        ```bash
        just run
        ```
    *   Open your browser to `http://localhost:8000`.

4.  **Stop**:
    *   To stop all services:
        ```bash
        just stop
        ```

5.  **Help**:
    *   To see all available commands and their descriptions:
        ```bash
        just help
        ```

## Manual Development Setup

If you prefer not to use `just`, you can run the services manually.

1.  **Run a local web server.**
    A simple way is to use Python's built-in server. Note that this will not provide the necessary COI headers for DuckDB-WASM multi-threading.
    ```bash
    python3 -m http.server 8000
    ```

2.  **Run ClickHouse using Docker:**
    ```bash
    docker run -p 8123:8123  --ulimit nofile=262144:262144 -e CLICKHOUSE_PASSWORD=your_password clickhouse/clickhouse-server
    ```

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