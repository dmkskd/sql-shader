# Default password for the ClickHouse container. Change if needed.
ch_password := 'sql_shader'

# Default ports for the services. Can be overridden from the command line, e.g., `just caddy_port=8080 run`
ch_http_port    := '8123'
ch_tcp_port     := '9000'
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

# Starts all required services for development (ClickHouse and Caddy).
run: start-clickhouse start-caddy
	@echo ""
	@echo "SQL Shader avaiable at http://localhost:{{caddy_port}}"
	@echo ""

# Starts the ClickHouse server in a Docker container.
start-clickhouse:
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🗄️  Starting ClickHouse Database"
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

# Starts the Caddy web server in a Docker container.
# It mounts the current directory and uses the Caddyfile for configuration.
start-caddy:
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🌐 Starting Caddy Web Server"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Ensuring port {{caddy_port}} is free by stopping any container using it..."
	@docker ps -q --filter "publish={{caddy_port}}" | xargs -r docker stop > /dev/null 2>&1 || true
	@echo "Starting new Caddy web server on port {{caddy_port}}..."
	@docker run \
		--rm -d \
		--name pixelql-caddy \
		-p {{caddy_port}}:8000 \
		-v "{{justfile_directory()}}:/srv" \
		-v "{{justfile_directory()}}/docker/caddy/Caddyfile:/etc/caddy/Caddyfile" \
		caddy > /dev/null
	@echo "✅ Caddy started successfully"
	@echo ""

# Stops all running services.
stop: stop-clickhouse stop-caddy
	@echo ""
	@echo "✅ All services stopped"
	@echo ""

# Stops the ClickHouse container.
stop-clickhouse:
	@echo ""
	@echo "🛑 Stopping ClickHouse (port {{ch_http_port}})..."
	@docker ps -q --filter "publish={{ch_http_port}}" | xargs -r docker stop > /dev/null 2>&1 || true

# Stops the Caddy web server container.
stop-caddy:
	@echo "🛑 Stopping Caddy web server (port {{caddy_port}})..."
	@docker ps -q --filter "publish={{caddy_port}}" | xargs -r docker stop > /dev/null 2>&1 || true

# Run all automated tests, or filter by folder/category (e.g., `just test example` or `just test duckdb`)
test filter="":
	@echo "Running automated test suite..."
	@node test/run-tests.js {{filter}}