import { BaseTestRunner } from '../assets/test-runner.js';

export class ClickHouseFormatsTestSuite extends BaseTestRunner {
    constructor() {
        super('ClickHouse Data Format Tests');
        this.client = null;
        this.testResults = [];
        this.createClient = null;
        this.arrow = null;
    }

    async runTests() {
        this.log('Starting ClickHouse data format tests...', 'test');

        // Clear previous results
        this.testResults = [];

        // Import ClickHouse and Arrow (browser only)
        if (typeof window !== 'undefined') {
            const chModule = await import('@clickhouse/client-web');
            this.createClient = chModule.createClient;
            this.arrow = await import('@apache/arrow');
        }

        // Initialize ClickHouse client
        const storedSettings = typeof localStorage !== 'undefined' 
            ? JSON.parse(localStorage.getItem('sql-shader.clickhouse-settings') || '{}')
            : {};
        
        this.client = this.createClient({
            url: storedSettings.url || 'http://localhost:8123',
            username: storedSettings.username || 'default',
            password: storedSettings.password || '',
        });

        // Test SQL query
        const shaderSql = `
            WITH
                {width:UInt32} AS width,
                {height:UInt32} AS height,
                {iTime:Float64} AS iTime,
                t_x.number AS x,
                t_y.number AS y
            SELECT
                (0.5 + (0.5 * cos(iTime + (x / width * 5)))) AS r,
                (0.5 + (0.5 * sin(iTime + (y / height * 5)))) AS g,
                (0.5 + (0.5 * cos(iTime + 0.5))) AS b
            FROM system.numbers AS t_x
            CROSS JOIN system.numbers AS t_y
            WHERE x < width AND y < height
            ORDER BY y, x
        `;

        const finalSql = shaderSql
    .replace('{width:UInt32}', 320)
    .replace('{height:UInt32}', 240)
    .replace('{iTime:Float64}', 1.0);

        // Define test strategies (from test_clickhouse_formats2.js - the comprehensive version)
        const strategies = [
            {
                name: "JSONEachRow with client.query()",
                format: 'JSONEachRow',
                exec: async () => {
                    const resultSet = await this.client.query({ query: finalSql, format: 'JSONEachRow' });
                    const rows = await resultSet.json();
                    if (!rows || rows.length === 0) throw new Error("No rows returned.");
                }
            },
            {
                name: "Direct fetch with ArrowStream format",
                format: 'ArrowStream',
                exec: async () => {
                    const url = storedSettings.url || 'http://localhost:8123';
                    const resp = await fetch(`${url}/?default_format=ArrowStream`, {
                        method: "POST",
                        body: finalSql,
                        headers: {
                            'Authorization': 'Basic ' + btoa(`${storedSettings.username || 'default'}:${storedSettings.password || ''}`)
                        }
                    });
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
                    const arrow_buffer = await resp.arrayBuffer();
                    const table = this.arrow.tableFromIPC(arrow_buffer);
                    if (table.numRows === 0) throw new Error("Arrow table is empty.");
                }
            },
            {
                name: "Direct fetch with Arrow format - NO COMPRESSION",
                format: 'Arrow',
                exec: async () => {
                    const url = storedSettings.url || 'http://localhost:8123';
                    const resp = await fetch(`${url}/?default_format=Arrow&output_format_arrow_compression_method=none`, {
                        method: "POST",
                        body: finalSql,
                        headers: {
                            'Authorization': 'Basic ' + btoa(`${storedSettings.username || 'default'}:${storedSettings.password || ''}`)
                        }
                    });
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
                    const arrow_buffer = await resp.arrayBuffer();
                    const table = this.arrow.tableFromIPC(arrow_buffer);
                    if (table.numRows === 0) throw new Error("Arrow table is empty.");
                }
            },
            {
                name: "Direct fetch with Arrow format - LIKE PERSPECTIVE",
                format: 'Arrow',
                exec: async () => {
                    const url = storedSettings.url || 'http://localhost:8123';
                    const resp = await fetch(`${url}/?default_format=Arrow`, {
                        method: "POST",
                        body: finalSql,
                        headers: {
                            'Authorization': 'Basic ' + btoa(`${storedSettings.username || 'default'}:${storedSettings.password || ''}`)
                        }
                    });
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
                    const arrow_buffer = await resp.arrayBuffer();
                    const table = this.arrow.tableFromIPC(arrow_buffer);
                    if (table.numRows === 0) throw new Error("Arrow table is empty.");
                }
            },
            {
                name: "Arrow format - try as Stream instead",
                format: 'Arrow',
                exec: async () => {
                    const execResult = await this.client.exec({ query: finalSql, format: 'Arrow' });
                    if (!execResult.stream) throw new Error("execResult.stream is undefined.");
                    const reader = this.arrow.RecordBatchStreamReader.from(execResult.stream);
                    const batches = [];
                    for await (const batch of reader) {
                        batches.push(batch);
                    }
                    if (batches.length === 0) throw new Error("No batches returned.");
                    const table = new this.arrow.Table(batches);
                    if (table.numRows === 0) throw new Error("Arrow table is empty.");
                }
            },
            {
                name: "DEFINITIVE: Arrow with client.query() and resultSet.arrayBuffer()",
                format: 'Arrow',
                exec: async () => {
                    const resultSet = await this.client.query({ query: finalSql, format: 'Arrow' });
                    const buffer = await resultSet.arrayBuffer();
                    const table = await this.arrow.tableFromIPC(buffer);
                    if (table.numRows === 0) throw new Error("Arrow table is empty.");
                }
            },
            {
                name: "Arrow with client.exec() and response.body",
                format: 'Arrow',
                exec: async () => {
                    const execResult = await this.client.exec({ query: finalSql, format: 'Arrow' });
                    if (!execResult.response) throw new Error("execResult.response is undefined.");
                    const table = await this.arrow.tableFromIPC(execResult.response.body);
                    if (table.numRows === 0) throw new Error("Arrow table is empty.");
                }
            },
            {
                name: "ArrowStream with client.exec() and result.stream",
                format: 'ArrowStream',
                exec: async () => {
                    const execResult = await this.client.exec({ query: finalSql, format: 'ArrowStream' });
                    if (!execResult.stream) throw new Error("execResult.stream is undefined.");
                    const table = await this.arrow.tableFromIPC(execResult.stream);
                    if (table.numRows === 0) throw new Error("Arrow table is empty.");
                }
            },
            {
                name: "ArrowStream with client.exec() and new Response(result.stream)",
                format: 'ArrowStream',
                exec: async () => {
                    const execResult = await this.client.exec({ query: finalSql, format: 'ArrowStream' });
                    if (!execResult.stream) throw new Error("execResult.stream is undefined.");
                    const response = new Response(execResult.stream);
                    const buffer = await response.arrayBuffer();
                    const table = await this.arrow.tableFromIPC(buffer);
                    if (table.numRows === 0) throw new Error("Arrow table is empty.");
                }
            },
            {
                name: "ArrowStream with client.exec() and manual stream consumption",
                format: 'ArrowStream',
                exec: async () => {
                    const execResult = await this.client.exec({ query: finalSql, format: 'ArrowStream' });
                    if (!execResult.stream) throw new Error("execResult.stream is undefined.");
                    const reader = execResult.stream.getReader();
                    const chunks = [];
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        chunks.push(value);
                    }
                    const table = await this.arrow.tableFromIPC(chunks);
                    if (table.numRows === 0) throw new Error("Arrow table is empty.");
                }
            }
        ];

        // Run all strategies
        for (const strategy of strategies) {
            await this.runStrategy(strategy);
        }

        this.log('All tests completed.', 'success');
    }

    async runStrategy(strategy) {
        this.log(`Testing strategy: "${strategy.name}"...`, 'test');
        const t0 = performance.now();
        
        try {
            await strategy.exec();
            const t1 = performance.now();
            const duration = (t1 - t0).toFixed(2);
            this.addResult(strategy.name, 'PASS', `${duration}ms`);
            this.log(`✓ SUCCESS: "${strategy.name}" completed in ${duration}ms`, 'success');
            this.testResults.push({ name: strategy.name, status: 'SUCCESS', duration });
        } catch (e) {
            const t1 = performance.now();
            const duration = (t1 - t0).toFixed(2);
            this.addResult(strategy.name, 'FAIL', `${duration}ms`, e.message);
            this.log(`✗ FAIL: "${strategy.name}" failed after ${duration}ms. Error: ${e.message}`, 'error');
            this.testResults.push({ name: strategy.name, status: 'FAIL', duration, error: e.message });
        }
    }

    // Get performance summary table data
    getPerformanceSummary() {
        return this.testResults;
    }
}

// CLI execution
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('test_clickhouse_formats.js')) {
    const suite = new ClickHouseFormatsTestSuite();
    suite.execute().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    });
}
