// Test registry for DuckDB-WASM category
export const TESTS = [
    {
        name: 'SQL Execution',
        file: 'test_sql_execution.html',
        description: 'Shader SQL with legacy + JSON parameters'
    },
    {
        name: 'Stats API',
        file: 'test_duckdb_stats.html',
        description: 'PRAGMA database_size, duckdb_settings'
    }
];
