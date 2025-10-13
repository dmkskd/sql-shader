#!/usr/bin/env python3
"""
Minimal Python tests to prove ClickHouse OpenTelemetry span generation.

Modes:
  - HTTP (default): stdlib urllib to POST to 8123
  - TCP (stateful): clickhouse-driver over port 9000 (if installed)
  - BOTH: run TCP first (if available), then HTTP

Install TCP driver (optional):
  pip install clickhouse-driver

Examples:
  python3 test/clickhouse/test_opentelemetry_python.py --mode http \\
    --url http://localhost:8123 --user default --password sql_shader

  python3 test/clickhouse/test_opentelemetry_python.py --mode tcp \\
    --host 127.0.0.1 --tcp-port 9000 --user default --password sql_shader
"""

import argparse
import base64
import json
import os
import sys
import time
import uuid
from urllib import request, error

try:
    from clickhouse_driver import Client as CHClient  # type: ignore
except Exception:
    CHClient = None  # optional dependency


def b64_basic(user: str, password: str) -> str:
    token = f"{user}:{password}".encode("utf-8")
    return base64.b64encode(token).decode("ascii")


def http_post(url: str, sql: str, auth_basic: str, headers: dict | None = None) -> bytes:
    hdrs = {
        "Authorization": f"Basic {auth_basic}",
        "Content-Type": "text/plain",
    }
    if headers:
        hdrs.update(headers)
    req = request.Request(url, data=sql.encode("utf-8"), headers=hdrs, method="POST")
    with request.urlopen(req, timeout=30) as resp:
        return resp.read()


def http_get(url: str, auth_basic: str) -> bytes:
    req = request.Request(url, headers={"Authorization": f"Basic {auth_basic}"}, method="GET")
    with request.urlopen(req, timeout=15) as resp:
        return resp.read()


def parse_jsoneachrow(data: bytes) -> list[dict]:
    rows = []
    for line in data.decode("utf-8", "replace").splitlines():
        line = line.strip()
        if not line:
            continue
        rows.append(json.loads(line))
    return rows


def run_http_mode(url: str, user: str, password: str, retries: int, timeout_sec: float) -> int:
    auth = b64_basic(user, password)
    base_url = url.rstrip("/")

    try:
        pong = http_get(f"{base_url}/ping", auth)
        print(f"[HTTP] Ping: {pong.decode().strip()}")
    except Exception as e:
        print(f"[HTTP] ERROR: ping failed: {e}")
        return 1

    query_id = uuid.uuid4().hex
    print(f"[HTTP] Query ID: {query_id}")
    test_sql = (
        "SELECT 'otel-python' AS message, now() AS ts "
        "SETTINGS opentelemetry_start_trace_probability = 1, log_queries = 1"
    )

    try:
        # Avoid custom headers; pass query_id via URL param
        http_post(f"{base_url}/?query_id={query_id}", test_sql, auth)
        print("[HTTP] Exec: OK")
    except error.HTTPError as e:
        print(f"[HTTP] ERROR: exec failed: HTTP {e.code} {e.reason}")
        return 2
    except Exception as e:
        print(f"[HTTP] ERROR: exec failed: {e}")
        return 2

    try:
        http_post(f"{base_url}/", "SYSTEM FLUSH LOGS", auth)
        print("[HTTP] Flush logs: OK")
    except Exception as e:
        print(f"[HTTP] Warning: flush logs failed: {e}")

    count = 0
    for i in range(retries):
        q = (
            "SELECT count() AS c FROM system.opentelemetry_span_log "
            f"WHERE attribute['clickhouse.query_id'] = '{query_id}'"
        )
        try:
            data = http_post(f"{base_url}/?default_format=JSONEachRow", q, auth)
            rows = parse_jsoneachrow(data)
            count = int(rows[0].get("c", 0)) if rows else 0
        except Exception as e:
            print(f"[HTTP] Warning: span poll failed on attempt {i+1}: {e}")
            count = 0
        if count > 0:
            break
        time.sleep(max(timeout_sec / max(retries, 1), 0.2))

    if count > 0:
        print(f"[HTTP] RESULT: OK — spans found: {count}")
        detail = (
            "SELECT trace_id, span_id, operation_name, start_time_us, finish_time_us "
            "FROM system.opentelemetry_span_log "
            f"WHERE attribute['clickhouse.query_id'] = '{query_id}' ORDER BY start_time_us ASC"
        )
        data = http_post(f"{base_url}/?default_format=JSONEachRow", detail, auth)
        rows = parse_jsoneachrow(data)
        for r in rows[:5]:
            op = r.get("operation_name")
            start = r.get("start_time_us")
            finish = r.get("finish_time_us")
            print(f"  [HTTP] span op={op} start={start} finish={finish}")
        return 0
    else:
        print("[HTTP] RESULT: FAIL — no spans found")
        return 3


def run_tcp_mode(host: str, port: int, user: str, password: str, retries: int, timeout_sec: float) -> int:
    if CHClient is None:
        print("[TCP] clickhouse-driver not installed. Install with: pip install clickhouse-driver")
        return 11
    try:
        client = CHClient(host=host, port=port, user=user, password=password)
        _ = client.execute("SELECT 1")
        print("[TCP] Connected and basic query OK")
    except Exception as e:
        print(f"[TCP] ERROR: connect/basic query failed: {e}")
        return 12

    query_id = uuid.uuid4().hex
    print(f"[TCP] Query ID: {query_id}")
    test_sql = "SELECT 'otel-python-tcp' AS message, now() AS ts"
    try:
        client.execute(
            test_sql,
            settings={
                'opentelemetry_start_trace_probability': 1,
                'log_queries': 1,
            },
            query_id=query_id,
        )
        print("[TCP] Exec: OK")
    except Exception as e:
        print(f"[TCP] ERROR: exec failed: {e}")
        return 13

    try:
        client.execute("SYSTEM FLUSH LOGS")
        print("[TCP] Flush logs: OK")
    except Exception as e:
        print(f"[TCP] Warning: flush logs failed: {e}")

    count = 0
    for i in range(retries):
        try:
            rows = client.execute(
                f"SELECT count() FROM system.opentelemetry_span_log WHERE attribute['clickhouse.query_id'] = '{query_id}'"
            )
            count = int(rows[0][0]) if rows else 0
        except Exception as e:
            print(f"[TCP] Warning: span poll failed on attempt {i+1}: {e}")
            count = 0
        if count > 0:
            break
        time.sleep(max(timeout_sec / max(retries, 1), 0.2))

    if count > 0:
        print(f"[TCP] RESULT: OK — spans found: {count}")
        try:
            rows = client.execute(
                f"SELECT operation_name, start_time_us FROM system.opentelemetry_span_log WHERE attribute['clickhouse.query_id'] = '{query_id}' ORDER BY start_time_us ASC LIMIT 5"
            )
            for op, start in rows:
                print(f"  [TCP] span op={op} start={start}")
        except Exception as e:
            print(f"[TCP] Warning: span details failed: {e}")
        return 0
    else:
        print("[TCP] RESULT: FAIL — no spans found")
        return 14


def main() -> int:
    parser = argparse.ArgumentParser(description="ClickHouse OTEL minimal Python test")
    parser.add_argument("--mode", choices=["http", "tcp", "both"], default=os.getenv("CH_MODE", "both"))
    parser.add_argument("--url", default=os.getenv("CH_URL", "http://localhost:8123"))
    parser.add_argument("--host", default=os.getenv("CH_HOST", "127.0.0.1"))
    parser.add_argument("--tcp-port", type=int, default=int(os.getenv("CH_TCP_PORT", "9000")))
    parser.add_argument("--user", default=os.getenv("CH_USER", "default"))
    parser.add_argument("--password", default=os.getenv("CH_PASSWORD", ""))
    parser.add_argument("--timeout", type=float, default=5.0, help="polling timeout in seconds (default: 5.0)")
    parser.add_argument("--retries", type=int, default=10, help="polling retries (default: 10)")
    args = parser.parse_args()

    exit_codes = []
    if args.mode in ("tcp", "both"):
        exit_codes.append(run_tcp_mode(args.host, args.tcp_port, args.user, args.password, args.retries, args.timeout))
    if args.mode in ("http", "both"):
        exit_codes.append(run_http_mode(args.url, args.user, args.password, args.retries, args.timeout))

    if any(code == 0 for code in exit_codes):
        return 0
    return exit_codes[-1] if exit_codes else 1


if __name__ == "__main__":
    sys.exit(main())
