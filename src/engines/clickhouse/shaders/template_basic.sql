-- Basic Template
-- A simple starter template for creating new shaders

WITH
    {width:UInt32} AS width,
    {height:UInt32} AS height,
    {iTime:Float64} AS iTime
SELECT
    -- Colors are calculated based on time and pixel coordinates.
    -- The combination of sin and cos creates smooth, cycling color patterns.
    (0.5 + (0.5 * cos(iTime + (x / width * 5)))) AS r,
    (0.5 + (0.5 * sin(iTime + (y / height * 5)))) AS g,
    (0.5 + (0.5 * cos(iTime + 0.5))) AS b
FROM
(
    -- Generate a grid of pixels using system.numbers and an explicit CROSS JOIN
    SELECT number AS y
    FROM system.numbers LIMIT height
) AS t_y
CROSS JOIN (SELECT number AS x FROM system.numbers LIMIT width) AS t_x
ORDER BY
    y ASC,
    x ASC