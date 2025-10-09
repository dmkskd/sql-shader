-- ClickHouse JSON Parameter Test 
-- This tests if ClickHouse can handle JSON parameters correctly
-- Expected: Should return a single row with test values

-- Test 1: Using ?::String with parseJSON
WITH uniforms_string AS (
  SELECT ?::String AS iUniforms_json
),
parsed_string AS (
  SELECT
    parseJSON(iUniforms_json) AS iUniforms
  FROM uniforms_string
),
extracted_string AS (
  SELECT
    iUniforms.iResolution[1] AS width,
    iUniforms.iResolution[2] AS height,
    iUniforms.iTime AS iTime,
    'String->parseJSON approach' AS method
  FROM parsed_string
)
SELECT * FROM extracted_string

UNION ALL

-- Test 2: Direct ?::JSON if supported
SELECT 
  800 AS width,
  600 AS height, 
  1.5 AS iTime,
  'Direct JSON test (placeholder)' AS method;