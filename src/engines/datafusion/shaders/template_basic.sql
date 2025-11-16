-- Basic Template
-- A simple time-based pattern.

WITH
colors AS (
    SELECT
        0.5 + 0.5 * sin((p.x::DOUBLE / $width::DOUBLE) + $iTime) AS r,
        0.5 + 0.5 * cos((p.y::DOUBLE / $height::DOUBLE) + $iTime) AS g,
        0.5 + 0.5 * sin($iTime * 0.5) AS b,
        p.x,
        p.y
    FROM
        ((SELECT unnest(range($width::INT)) AS x) 
         CROSS JOIN (SELECT unnest(range($height::INT)) AS y)) AS p
)
SELECT
    CAST(r AS DOUBLE) AS r,
    CAST(g AS DOUBLE) AS g,
    CAST(b AS DOUBLE) AS b
FROM
    colors
ORDER BY
    y ASC,
    x ASC