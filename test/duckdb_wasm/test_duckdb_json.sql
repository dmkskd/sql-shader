-- DuckDB JSON Parameter Test
-- This tests if DuckDB can handle ?::JSON parameters correctly
-- Expected: Should return a single row with test values

WITH uniforms AS (
  SELECT ?::JSON AS iUniforms
),
parsed AS (
  SELECT
    CAST(json_extract(iUniforms, '$.iResolution[0]') AS BIGINT) AS width,
    CAST(json_extract(iUniforms, '$.iResolution[1]') AS BIGINT) AS height,
    CAST(json_extract(iUniforms, '$.iTime') AS DOUBLE) AS iTime,
    CAST(json_extract(iUniforms, '$.iMouse[0]') AS DOUBLE) AS mx,
    CAST(json_extract(iUniforms, '$.iMouse[1]') AS DOUBLE) AS my
  FROM uniforms
)
SELECT 
  width,
  height, 
  iTime,
  mx,
  my,
  'DuckDB JSON test passed' AS status
FROM parsed;