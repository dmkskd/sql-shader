> **⚠️ Work in Progress**

# Overview

A browser-based SQL shader editor that uses database engines as pixel shaders.

Write `SQL queries` that run on every frame to generate real-time, procedural graphics.

The application is designed to be a coding tool for exploring the performance and capabilities of different database engines on cpu-bound queries.

By playign with SQL queries, 

Heavily inspired by [Shadertoy](https://www.shadertoy.com/)

# How to use it

Run:

 `just run`

See [README quick-start](../README.md#quick-start) for details.

The `Caddy` service as part of `just run` should take care of most of the CORS pain points.

Use `Help` for context-based help (`CMD+/` on `Mac` or `CTRL+/` on `Windows/Linux`)

# Engines

The application has been architected to support multiple SQL Engines.

## DuckDB-WASM
[DuckDB](duckdb_wasm.md)

https://github.com/user-attachments/assets/adefdca8-7139-406a-8286-08e09161bddd

## ClickHouse

https://github.com/user-attachments/assets/2320e576-05a8-4df9-a505-290de2ec25eb

[Clickhouse](clickhouse.md)


### Adding a new engine
If you want to experiment [adding a new engine](adding_a_new_engine.md).

## Engine Feature Matrix

|Feature|DuckDB-WASM|ClickHouse|
|:------|:----------|:---------|
| Firefox| :check: | C |
| Chrome| :check: | C |
| Safari| :check: | C |
| Audio | :check: | C |

# Architecture
If you are intereted to know how it works or making changes, have a look at the [architecture](architecture.md) document.

# Roadmap
- finalise supported uniforms
- load / save shaders outside the browser local storage
- add full audio support
