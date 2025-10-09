-- Simple ClickHouse ?::JSON Test
-- Test if ClickHouse supports ?::JSON directly

WITH uniforms AS (
  SELECT ?::JSON AS iUniforms
)
SELECT 
  iUniforms,
  'ClickHouse direct JSON test' AS status
FROM uniforms;