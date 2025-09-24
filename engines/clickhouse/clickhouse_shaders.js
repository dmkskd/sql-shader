export const SHADERS = [
    {
        name: 'Interactive Waves (ClickHouse)',
        sql: `-- "Interactive Waves" - A pattern that reacts to mouse movement and time.
-- @run: resolution=Small, zoom=2
-- ClickHouse Version

WITH
    {width:UInt32} AS width,
    {height:UInt32} AS height,
    {iTime:Float64} AS iTime,
    {mx:Float64} AS mx,
    {my:Float64} AS my
SELECT
    -- Normalize coordinates to -1.0 to 1.0 range
    (x - (width / 2)) / width AS norm_x,
    (y - (height / 2)) / height AS norm_y,

    -- Calculate two moving sine waves based on time and coordinates
    sin((norm_y * 20.0) + iTime * 2.0) AS wave1,
    cos((norm_x * 30.0) + iTime * 1.5) AS wave2,

    -- Calculate distance from the mouse position
    sqrt(pow(norm_x - ((mx / width) - 0.5), 2) + pow(norm_y - ((my / height) - 0.5), 2)) AS dist_mouse,

    -- Combine the waves and mouse distance to generate colors
    (wave1 + wave2) * 0.2 + 0.3 AS r,
    (wave1 - wave2) * 0.3 + 0.5 AS g,
    pow(dist_mouse, 0.5) * cos(iTime) + wave1 * 0.2 AS b
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
`
    },
    {
        name: 'Cosmic Time (ClickHouse)',
        sql: `-- "Cosmic Time" - A simple time-based color cycling effect.
-- ClickHouse Version

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
`
    }
];