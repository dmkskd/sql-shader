-- Squircle 2 by @XorDev - Converted to ClickHouse SQL
-- https://www.shadertoy.com/view/WfySDD
-- Shader dimensions: 160x64

WITH
    {width:UInt32} AS W,
    {height:UInt32} AS H,
    {t0:Float64} AS t0,
    toUnixTimestamp64Milli(now64(3)) / 1000.0 - t0 AS iTime,

    /* ASCII ramp from dark to bright */
    ' .:-=+*#%@' AS RAMP,
    lengthUTF8(RAMP) AS N,

    /* border */
    arrayStringConcat(arrayMap(_ -> '─', range(W)), '') AS HBAR,
    '┌' AS TL, '┐' AS TR, '└' AS BL, '┘' AS BR, '│' AS VBAR

SELECT
    concat(
      concat(TL, HBAR, TR), '\n',
      arrayStringConcat(
        arrayMap(t -> concat(VBAR, t.2, VBAR),
                 arrayReverse(arraySort(groupArray((y, line)))))
        , '\n'
      ),
      '\n',
      concat(BL, HBAR, BR)
    ) AS art
FROM
(
    SELECT
        y,
        arrayStringConcat(
            arrayMap(t -> t.2, arraySort(groupArray((x, ch))))
          , ''
        ) AS line
    FROM
    (
        SELECT
            y, x,
            -- Center coordinates and scale to fit vertically
            (x * 2.0 - W) / H AS p_x,
            (y * 2.0 - H) / H AS p_y,
            
            -- Shortened time variable with rotation
            iTime / 4.0 - sin(iTime) / 4.0 AS angle,
            
            -- Rotate coordinates
            p_x * cos(angle) + p_y * cos(angle + 11.0) AS c_x,
            p_x * cos(angle + 33.0) + p_y * cos(angle) AS c_y,
            
            -- Distance field: sqrt of sum of squares
            cos(sqrt(pow(c_x, 4) + pow(c_y, 4)) / 0.1 - iTime) AS l,
            
            -- Color wave components
            sin(0.0 * sqrt(c_x * c_x + c_y * c_y) + 2.0 * c_y + iTime + 6.0) AS w_r,
            sin(3.0 * sqrt(c_x * c_x + c_y * c_y) + 2.0 * c_y + iTime + 1.0) AS w_g,
            sin(3.0 * sqrt(c_x * c_x + c_y * c_y) + 2.0 * c_y + iTime + 2.0) AS w_b,
            
            -- Tonemap each color channel
            tanh((0.6 + 0.5 * w_r) / greatest(l / 0.2, -l)) AS r,
            tanh((0.6 + 0.5 * w_g) / greatest(l / 0.2, -l)) AS g,
            tanh((0.6 + 0.5 * w_b) / greatest(l / 0.2, -l)) AS b,
            
            -- Average for intensity to pick character
            (r + g + b) / 3.0 AS intensity,
            
            -- Convert RGB to 0-255 range
            toUInt8(greatest(0, least(255, floor(r * 255)))) AS r8,
            toUInt8(greatest(0, least(255, floor(g * 255)))) AS g8,
            toUInt8(greatest(0, least(255, floor(b * 255)))) AS b8,
            
            -- Pick ASCII character based on intensity
            substringUTF8(RAMP, 1 + toUInt8(floor(greatest(0.0, least(1.0, intensity)) * (N - 1))), 1) AS base_ch,
            
            -- Create ANSI colored character: ESC[38;2;R;G;Bm + char + ESC[0m
            concat('\x1b[38;2;', toString(r8), ';', toString(g8), ';', toString(b8), 'm', base_ch, '\x1b[0m') AS ch
        FROM
            (SELECT arrayJoin(range(H)) AS y) AS yy
        CROSS JOIN
            (SELECT arrayJoin(range(W)) AS x) AS xx
    )
    GROUP BY y
);