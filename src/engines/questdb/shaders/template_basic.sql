-- Basic Template
-- A simple starter template for creating new shaders
-- @run: resolution=320x240, zoom=1

SELECT
    -- Colors are calculated based on time and pixel coordinates.
    (0.5 + (0.5 * cos({iTime} + (x / {width} * 5.0)))) AS r,
    (0.5 + (0.5 * sin({iTime} + (y / {height} * 5.0)))) AS g,
    (0.5 + (0.5 * cos({iTime} + 0.5))) AS b
FROM
(
    -- Generate a grid of pixels using QuestDB's long_sequence
    SELECT 
        cast((y_seq.x - 1) as double) AS y,
        cast((x_seq.x - 1) as double) AS x
    FROM long_sequence({height}) y_seq
    CROSS JOIN long_sequence({width}) x_seq
)
ORDER BY y ASC, x ASC;
