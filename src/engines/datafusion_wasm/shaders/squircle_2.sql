-- "Squircle 2" by @XorDev - Converted to DataFusion-WASM SQL
-- https://www.shadertoy.com/view/WfySDD
-- A lightweight shader with rotating squircle distance field and colorful waves
-- @run: resolution=640x480, zoom=1
--
-- NOTE: DataFusion WASM 0.3.1 lacks generate_series/range functions for creating pixel grids.
-- This version uses recursive CTE to generate pixel coordinates.
-- If performance is poor, consider using DuckDB WASM or ClickHouse engines instead.

WITH RECURSIVE
-- Generate y coordinates (rows)
y_coords AS (
  SELECT CAST(0 AS BIGINT) AS y
  UNION ALL
  SELECT y + 1 AS y
  FROM y_coords
  WHERE y < CAST({height} AS BIGINT) - 1
),
-- Generate x coordinates (columns)
x_coords AS (
  SELECT CAST(0 AS BIGINT) AS x
  UNION ALL
  SELECT x + 1 AS x
  FROM x_coords
  WHERE x < CAST({width} AS BIGINT) - 1
),
-- Cross join to create full pixel grid
pixels AS (
  SELECT 
    y_coords.y,
    x_coords.x
  FROM y_coords
  CROSS JOIN x_coords
),
-- Normalize coordinates
normalized AS (
  SELECT
    y,
    x,
    -- Center coordinates and scale to fit vertically
    (CAST(x AS DOUBLE) * 2.0 - CAST({width} AS DOUBLE)) / CAST({height} AS DOUBLE) AS p_x,
    (CAST(y AS DOUBLE) * 2.0 - CAST({height} AS DOUBLE)) / CAST({height} AS DOUBLE) AS p_y,
    -- Shortened time variable with rotation
    CAST({iTime} AS DOUBLE) / 4.0 - sin(CAST({iTime} AS DOUBLE)) / 4.0 AS angle
  FROM pixels
),
-- Apply rotation
rotated AS (
  SELECT
    y,
    x,
    -- Rotate coordinates using the matrix from cos with offsets
    -- Matrix is: [cos(angle+0), cos(angle+11); cos(angle+33), cos(angle+0)]
    -- Which approximates: [cos(angle), -sin(angle); sin(angle), cos(angle)]
    p_x * cos(angle) + p_y * cos(angle + 11.0) AS c_x,
    p_x * cos(angle + 33.0) + p_y * cos(angle) AS c_y
  FROM normalized
),
-- Calculate distance field and color waves
distance_field AS (
  SELECT
    y,
    x,
    c_x,
    c_y,
    -- Distance field: sqrt of sum of fourth powers
    cos(sqrt(power(c_x, 4) + power(c_y, 4)) / 0.1 - CAST({iTime} AS DOUBLE)) AS l,
    -- Color wave components - using length(c) not length(c*c)
    sin(3.0 * sqrt(c_x * c_x + c_y * c_y) + 2.0 * c_y + CAST({iTime} AS DOUBLE) + 6.0) AS w_r,
    sin(3.0 * sqrt(c_x * c_x + c_y * c_y) + 2.0 * c_y + CAST({iTime} AS DOUBLE) + 1.0) AS w_g,
    sin(3.0 * sqrt(c_x * c_x + c_y * c_y) + 2.0 * c_y + CAST({iTime} AS DOUBLE) + 2.0) AS w_b
  FROM rotated
)
-- Final color calculation with tonemapping
SELECT
  -- Tonemap with tanh - Use CASE to implement greatest() since DataFusion may not have it
  tanh((0.6 + 0.5 * w_r) / 
    CASE WHEN (l / 0.2) > (-l) THEN (l / 0.2) ELSE (-l) END) AS r,
  tanh((0.6 + 0.5 * w_g) / 
    CASE WHEN (l / 0.2) > (-l) THEN (l / 0.2) ELSE (-l) END) AS g,
  tanh((0.6 + 0.5 * w_b) / 
    CASE WHEN (l / 0.2) > (-l) THEN (l / 0.2) ELSE (-l) END) AS b
FROM distance_field
ORDER BY y ASC, x ASC;
