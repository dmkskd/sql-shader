# Default password for the ClickHouse container. Change if needed.
ch_password := 'sql_shader'

# Default ports for the services. Can be overridden from the command line, e.g., `just caddy_port=8080 run`
ch_http_port    := '8123'
ch_tcp_port     := '9000'
questdb_http_port := '9001'  # Changed from 9000 to avoid clash with ClickHouse TCP
questdb_pg_port   := '8812'
questdb_ilp_port  := '9009'
caddy_port := '8000'

# The default task when running `just` is to show the help message.
default: help

# Show this help message.
help:
	@just --list

# Download vendored frontend dependencies into the ./vendor directory
vendor:
	@echo "Downloading vendored dependencies..."
	@mkdir -p vendor
	@curl -fL "https://unpkg.com/vue@3.2.45/dist/vue.global.prod.js" -o "assets/vendor/vue.global.prod-3.2.45.js" # For main app if needed
	@curl -fL "https://unpkg.com/vue@3.2.45/dist/vue.esm-browser.prod.js" -o "assets/vendor/vue.esm-browser.prod-3.2.45.js" # For profiler
	@curl -fL "https://unpkg.com/duckdb-explain-visualizer@1.1.4/dist/duckdb-explain-visualizer.mjs" -o "assets/vendor/duckdb-explain-visualizer.es.js"
	@curl -fL "https://unpkg.com/duckdb-explain-visualizer@1.1.4/dist/duckdb-explain-visualizer.css" -o "assets/vendor/style.css"
	@echo "✅ Vendored dependencies downloaded successfully."

# Starts all required services for development (ClickHouse, QuestDB, and Caddy).
run: start-clickhouse start-questdb start-caddy
	@echo ""
	@echo "SQL Shader available at http://localhost:{{caddy_port}}"
	@echo ""

# Starts the ClickHouse server in a Docker container.
start-clickhouse:
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "   Starting ClickHouse Database"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Ensuring port {{ch_http_port}} is free by stopping any container using it..."
	@docker ps -q --filter "publish={{ch_http_port}}" | xargs -r docker stop > /dev/null 2>&1 || true
	@echo "Starting new ClickHouse container on port {{ch_http_port}}..."
	@bash -c 'pw="{{ch_password}}"; first="${pw:0:1}"; last="${pw: -1}"; echo "Using password: ${first}***${last} (change ch_password in justfile to customize)"'
	@docker run \
		--rm -d \
		--name pixelql-clickhouse \
		-p {{ch_http_port}}:8123 \
		-p {{ch_tcp_port}}:9000 \
		--ulimit nofile=262144:262144 \
		-e CLICKHOUSE_PASSWORD={{ch_password}} \
		-v "{{justfile_directory()}}/docker/clickhouse/enable_system_log_tables.xml:/etc/clickhouse-server/config.d/enable_system_log_tables.xml" \
		-v "{{justfile_directory()}}/docker/clickhouse/enable_profiling.xml:/etc/clickhouse-server/users.d/enable_profiling.xml" \
		clickhouse/clickhouse-server > /dev/null
	@echo "✅ ClickHouse started successfully"
	@echo ""

# Starts the QuestDB server in a Docker container.
start-questdb:
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "   Starting QuestDB Database"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Ensuring port {{questdb_http_port}} is free by stopping any container using it..."
	@docker ps -q --filter "publish={{questdb_http_port}}" | xargs -r docker stop > /dev/null 2>&1 || true
	@echo "Starting new QuestDB container on port {{questdb_http_port}}..."
	@docker run \
		--rm -d \
		--name pixelql-questdb \
		-p {{questdb_http_port}}:9000 \
		-p {{questdb_pg_port}}:8812 \
		-p {{questdb_ilp_port}}:9009 \
		questdb/questdb > /dev/null
	@echo "✅ QuestDB started successfully"
	@echo "   HTTP API: http://localhost:{{questdb_http_port}}"
	@echo "   PostgreSQL wire: localhost:{{questdb_pg_port}}"
	@echo ""

# Starts the Caddy web server in a Docker container.
# It mounts the current directory and uses the Caddyfile for configuration.
start-caddy:
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "   Starting Caddy Web Server"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Ensuring port {{caddy_port}} is free by stopping any container using it..."
	@docker ps -q --filter "publish={{caddy_port}}" | xargs -r docker stop > /dev/null 2>&1 || true
	@echo "Starting new Caddy web server on port {{caddy_port}}..."
	@docker run \
		--rm -d \
		--name pixelql-caddy \
		-p {{caddy_port}}:8000 \
		--link pixelql-questdb:pixelql-questdb \
		-v "{{justfile_directory()}}:/srv" \
		-v "{{justfile_directory()}}/docker/caddy/Caddyfile:/etc/caddy/Caddyfile" \
		caddy > /dev/null
	@echo "✅ Caddy started successfully"
	@echo "   Proxying QuestDB at http://localhost:{{caddy_port}}/questdb"
	@echo ""

# Stops all running services (including optional QuestDB WebSocket proxy).
stop: stop-clickhouse stop-questdb stop-caddy stop-questdb-ws-proxy
	@echo ""
	@echo "✅ All services stopped"
	@echo ""

# Stops the ClickHouse container.
stop-clickhouse:
	@echo ""
	@echo "🛑 Stopping ClickHouse (port {{ch_http_port}})..."
	@docker ps -q --filter "publish={{ch_http_port}}" | xargs -r docker stop > /dev/null 2>&1 || true

# Stops the QuestDB container.
stop-questdb:
	@echo "🛑 Stopping QuestDB (port {{questdb_http_port}})..."
	@docker ps -q --filter "publish={{questdb_http_port}}" | xargs -r docker stop > /dev/null 2>&1 || true

# Builds the QuestDB WebSocket proxy Docker image
build-questdb-ws-proxy:
	@echo "Building QuestDB WebSocket proxy image..."
	@docker build -t pixelql-questdb-ws-proxy docker/questdb/ws-proxy/
	@echo "✅ Proxy image built successfully"

# Starts the QuestDB WebSocket-to-PostgreSQL proxy in Docker
# This allows browser clients to connect to QuestDB's PostgreSQL wire protocol
# No Node.js installation required - runs in container
start-questdb-ws-proxy: start-questdb build-questdb-ws-proxy
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "   Starting QuestDB WebSocket Proxy"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Ensuring port 8813 is free by stopping any container using it..."
	@docker ps -q --filter "publish=8813" | xargs -r docker stop > /dev/null 2>&1 || true
	@echo "Starting QuestDB WebSocket proxy on port 8813..."
	@echo "This enables faster PostgreSQL wire protocol access from the browser."
	@docker run \
		--rm -d \
		--name pixelql-questdb-ws-proxy \
		-p 8813:8812 \
		--link pixelql-questdb:pixelql-questdb \
		pixelql-questdb-ws-proxy > /dev/null
	@echo "✅ Proxy started successfully on ws://localhost:8813"
	@echo ""

# Stops the QuestDB WebSocket proxy container
stop-questdb-ws-proxy:
	@echo "🛑 Stopping QuestDB WebSocket proxy..."
	@docker ps -q --filter "name=pixelql-questdb-ws-proxy" | xargs -r docker stop > /dev/null 2>&1 || true

# Stops the Caddy web server container.
stop-caddy:
	@echo "🛑 Stopping Caddy web server (port {{caddy_port}})..."
	@docker ps -q --filter "publish={{caddy_port}}" | xargs -r docker stop > /dev/null 2>&1 || true

# Run all automated tests, or filter by folder/category (e.g., `just test example` or `just test duckdb`)
test filter="":
	@echo "Running automated test suite..."
	@node test/run-tests.js {{filter}}

# Run the terminal-based shader using ClickHouse CLI
# Shader file must be in scripts/ directory
# Usage: 
#   just terminal-shader                 # runs squircle2.sql (default)
#   just terminal-shader worm_hole.sql   # runs worm_hole_bw.sql
terminal-shader shader="squircle2.sql":
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "   Starting Terminal Shader"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Running scripts/{{shader}} in terminal..."
	@echo "Using ClickHouse password from environment"
	@echo "Press Ctrl+C to exit"
	@echo ""
	@CLICKHOUSE_PASSWORD={{ch_password}} bash scripts/runner.sh {{shader}}