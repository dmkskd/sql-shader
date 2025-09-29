-- "Cosmic Time" - A simple time-based pattern without mouse interaction.

WITH
uniforms AS (
  SELECT
    ?::BIGINT AS width, ?::BIGINT AS height,
    ?::DOUBLE AS iTime, ?::DOUBLE AS mx, ?::DOUBLE AS my
),
pixels AS (
  SELECT i::DOUBLE AS x, j::DOUBLE AS y
  FROM generate_series(0, (SELECT width - 1 FROM uniforms)) AS t(i)
  CROSS JOIN generate_series(0, (SELECT height - 1 FROM uniforms)) AS t2(j)
),
colors AS (
  SELECT
    0.5 + 0.5 * sin((p.x / u.width) + u.iTime) AS r,
    0.5 + 0.5 * cos((p.y / u.height) + u.iTime) AS g,
    0.5 + 0.5 * sin(u.iTime * 0.5) AS b,
    x, y
  FROM pixels AS p, uniforms AS u
)
SELECT r, g, b FROM colors ORDER BY y, x;