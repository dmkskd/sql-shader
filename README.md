# SQL Shader

**[Try the Live Demo Here](https://dmkskd.github.io/sql-shader/)**.

A browser-based SQL shader editor that uses database engines as pixel shaders.


Write SQL queries that run on every frame to generate real-time, procedural graphics. The application is designed to be a creative coding tool for exploring the performance and capabilities of different database engines on cpu-bound queries.


It currently supports two database engines:
*   **DuckDB-WASM**: Runs entirely in the browser using WebAssembly. No server required! Can run your on phone as well!
*   **ClickHouse**: Connects to a 'remote' (as external to the browser) ClickHouse server via its HTTP interface. It can be a local instance running on your machine. See [quickstart](#quick-start-recommended) on how to run it in docker.

See [adding a new engine](docs/adding_a_new_engine.md) on how to add a new database engine.

⚠️ Please note, most of the API are not stable yet and can break backward compatibility at any time.

## Features

*   **Live SQL Editor**: editor with SQL syntax highlighting, autocompiling as you type.
*   **Real-time Rendering**: render the shader every frame based on your SQL query's output.
*   **Performance Profiling**: profile your query with a simple click.
*   **Configurable Environment**: adjust resolution, zoom, editor and more to your flow.

## Quick Start

This project uses `just` as a command runner to simplify starting the required services (Caddy web server and ClickHouse).

1.  **Prerequisites**:
    *   Install Docker.
    *   Install `just`.

2.  **Configure** (Optional):
    *   Open the `justfile` in the project root.
    *   Set the `ch_password` variable to your desired ClickHouse password. default is `your_password`

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
## How it works

Please start from [Getting Started](docs/getting_started.md) to understand how it works.


## Why a SQL-based shader editor?

This is a very good question, and the best answer is: why not ? 😏

It's a fun way to delve into database engines internals, especially when it comes to understanding some of their modern performance optimisation techniques.
The main idea is to keep a very tight loop between making a change and see the impact it has by providing an easy way to access the profiling info each engine offers.

Some prior inspiring work:
- [MySQL Raytracer](https://www.pouet.net/prod.php?which=83222)
- [DuckDB-Doom](https://github.com/patricktrainer/duckdb-doom)
- [Building a DOOM-like multiplayer shooter in pure SQL](https://cedardb.com/blog/doomql/)
- [Shadertoy](https://www.shadertoy.com/)
- [Inigo Quilez's shaders articles](https://iquilezles.org/articles/)

The tool was built while trying to create a simple ASCII based SQL shader renderer and the subsequent need to improve its performance.
How to turn 10 lines shell script into a full blown webapp 🤦