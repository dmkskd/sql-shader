-- "Interactive Waves" - A pattern that reacts to mouse movement and time.

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
    0.5 + 0.5 * sin(sqrt(pow(p.x - u.mx, 2) + pow(p.y - u.my, 2)) * 0.1 - u.iTime * 2.0) AS r,
    0.5 + 0.5 * sin(u.iTime * 1.5) AS g,
    0.5 + 0.5 * cos(sqrt(pow(p.x - u.mx, 2) + pow(p.y - u.my, 2)) * 0.1 - u.iTime * 2.0) AS b,
    x, y
  FROM pixels AS p, uniforms AS u
)
SELECT r, g, b FROM colors ORDER BY y, x;