-- "Squircle 2" by @XorDev - Converted to QuestDB SQL
-- https://www.shadertoy.com/view/WfySDD
-- A lightweight shader with rotating squircle distance field and colorful waves
-- @run: resolution=160x120, zoom=2

SELECT
    -- Tonemap with tanh and calculate final RGB colors
    (
        (0.6 + 0.5 * sin(3.0 * sqrt(c_x*c_x + c_y*c_y) + 2.0 * c_y + {iTime} + 6.0)) 
        / case when l / 0.2 > -l then l / 0.2 else -l end
    ) AS r,
    (
        (0.6 + 0.5 * sin(3.0 * sqrt(c_x*c_x + c_y*c_y) + 2.0 * c_y + {iTime} + 1.0)) 
        / case when l / 0.2 > -l then l / 0.2 else -l end
    ) AS g,
    (
        (0.6 + 0.5 * sin(3.0 * sqrt(c_x*c_x + c_y*c_y) + 2.0 * c_y + {iTime} + 2.0)) 
        / case when l / 0.2 > -l then l / 0.2 else -l end
    ) AS b
FROM
(
    SELECT
        y,
        x,
        -- Distance field: sqrt of sum of 4th powers (squircle)
        cos(sqrt(power(c_x, 4) + power(c_y, 4)) / 0.1 - {iTime}) AS l,
        c_x,
        c_y
    FROM
    (
        SELECT
            y,
            x,
            -- Rotate coordinates using rotation matrix approximation
            -- Matrix: [cos(angle+0), cos(angle+11); cos(angle+33), cos(angle+0)]
            p_x * cos(angle) + p_y * cos(angle + 11.0) AS c_x,
            p_x * cos(angle + 33.0) + p_y * cos(angle) AS c_y
        FROM
        (
            SELECT
                cast((y_seq.x - 1) as double) AS y,
                cast((x_seq.x - 1) as double) AS x,
                -- Center coordinates and scale to fit vertically
                (cast((x_seq.x - 1) as double) * 2.0 - {width}) / {height} AS p_x,
                (cast((y_seq.x - 1) as double) * 2.0 - {height}) / {height} AS p_y,
                -- Rotation angle with time-based animation
                {iTime} / 4.0 - sin({iTime}) / 4.0 AS angle
            FROM long_sequence({height}) y_seq
            CROSS JOIN long_sequence({width}) x_seq
        )
    )
)
ORDER BY y, x;
