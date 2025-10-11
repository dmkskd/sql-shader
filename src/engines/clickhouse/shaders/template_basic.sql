-- Basic Template
-- A simple starter template for creating new shaders

WITH
    {width:UInt32} AS width,
    {height:UInt32} AS height,
    {iTime:Float64} AS iTime,
    {mx:Float64} AS mx,
    {my:Float64} AS my
SELECT
    -- Normalized coordinates (0.0 to 1.0)
    x / width AS u,
    y / height AS v,
    
    -- TODO: Add your shader logic here
    -- Example: simple gradient based on position
    toUInt8(u * 255) AS r,
    toUInt8(v * 255) AS g,
    toUInt8(128) AS b
FROM
    (
        SELECT number AS y
        FROM system.numbers LIMIT height
    ) AS t_y
    CROSS JOIN (
        SELECT number AS x
        FROM system.numbers LIMIT width
    ) AS t_x
ORDER BY
    y ASC,
    x ASC;
