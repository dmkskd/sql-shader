-- "Template basic" - A simple time-based pattern for DataFusion
-- Note: DataFusion WASM has limited SQL support compared to DuckDB
-- This is a minimal demonstration shader

-- DataFusion doesn't support generate_series or many dynamic features
-- For now, this creates a single pixel as a proof of concept
-- A full pixel shader would require pre-generating data or using external tables

SELECT 
  CAST(0.5 + 0.5 * sin({iTime}) AS DOUBLE) AS r,
  CAST(0.5 + 0.5 * cos({iTime}) AS DOUBLE) AS g,
  CAST(0.5 AS DOUBLE) AS b;
