# SQL Shader

**[Try the DuckDB-WASM Live Demo Here](https://dmkskd.github.io/sql-shader/)**.

A browser-based SQL shader editor that uses database engines as pixel shaders.

Write SQL queries that run on every frame to generate real-time, procedural graphics. The application is designed to be a coding tool for exploring the performance and capabilities of different database engines on cpu-bound queries.

If you are familiar with [Shadertoy](https://www.shadertoy.com/) - that's Shadertoy, in SQL.

It currently supports two database engines:
*   **DuckDB-WASM**: Runs entirely in the browser using WebAssembly. No server required! Can run your on phone as well!
*   **ClickHouse**: Connects to a 'remote' (as external to the browser) ClickHouse server via its HTTP interface. It can be a local instance running on your machine. See [quickstart](#quick-start-recommended) on how to run it in docker.

See [adding a new engine](docs/adding_a_new_engine.md) if you want to integrate a new database engine.

⚠️ Please note, most of the API are not stable yet and can break backward compatibility at any time.

## Features

*   **Live SQL Editor**: editor with SQL syntax highlighting, autocompiling as you type.
*   **Real-time Rendering**: render the shader every frame based on your SQL query's output.
*   **Performance Profiling**: profile your query with a simple click.
*   **Configurable Environment**: adjust resolution, zoom, editor and more to your flow.

https://github.com/user-attachments/assets/2320e576-05a8-4df9-a505-290de2ec25eb

## Quick Start

This project uses `just` as a command runner to simplify starting the required services (Caddy web server and ClickHouse).

1.  **Prerequisites**:
    *   Install Docker.
    *   Install `just`.

2.  **Configure** (Optional):
    *   Open the `justfile` in the project root.
    *   Set the `ch_password` variable to your desired ClickHouse password. Default is `sql_shader`

3.  **Run**:
    *   Start all services (Caddy web server and ClickHouse):
        ```bash
        just run
        ```
    *   Point your browser to `http://localhost:8000`.

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
The main idea is to keep a very tight loop between making a change and see its impact by providing an easy way to access the profiling info each engine offers.

Some prior inspiring work:
- [MySQL Raytracer](https://www.pouet.net/prod.php?which=83222)
- [DuckDB-Doom](https://github.com/patricktrainer/duckdb-doom)
- [Building a DOOM-like multiplayer shooter in pure SQL](https://cedardb.com/blog/doomql/)
- [Shadertoy](https://www.shadertoy.com/)
- [Inigo Quilez's shaders articles](https://iquilezles.org/articles/)
- [chdig](https://github.com/azat/chdig)

The tool was built while trying to create a simple ASCII based SQL shader renderer and the subsequent need to improve its performance.
How to turn 10 lines shell script into a full blown webapp 🤦

You can stil invoke it by running
```
just terminal-shader
```

https://github.com/user-attachments/assets/64457df0-e19b-444e-b66a-cae5d83d7282

## License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

### Third-Party Dependencies

SQL Shader uses several open-source libraries with different licenses. See [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md) for complete details.

**⚠️ Important Notice about Strudel Audio Integration:**

The optional Strudel audio feature (accessed via the "Audio" button) is licensed under **AGPL-3.0**, which has copyleft requirements. The Strudel integration is:
- **Optional** - not required for core SQL Shader functionality
- **Isolated** - contained in `src/inputs/strudel_input.js`
- **Loaded dynamically** - from https://strudel.cc

If you modify and deploy SQL Shader as a network service with Strudel enabled, you must comply with AGPL-3.0. For details, see the [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md) file.
