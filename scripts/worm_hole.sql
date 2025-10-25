-- Shader dimensions: 160x100
WITH
    {width:UInt32} AS W,
    {height:UInt32} AS H,

    {t0:Float64} AS t0,
    toUnixTimestamp64Milli(now64(3)) / 1000.0 - t0 AS iTime,

    /* tunnel controls */
    14   AS NUM,
    0.25 AS DZ,
    0.30 AS SPEED,
    0.60 AS Z0,
    0.60 AS FOV,

    /* center traces a circle */
    0.28 AS AX,
    0.28 AS AY,
    0.30 AS OMEGA,

    /* outline + intensity */
    0.025 AS BAND,
    0.90  AS DEPTH_GAIN,
    ' .:-=+*#%@' AS RAMP,
    --' ･ｰｧｨｩｪｫｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ' AS RAMP,

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
            (x / (W - 1.0)) * 2 - 1 AS nx,
            (y / (H - 1.0)) * 2 - 1 AS ny,
            ny * (W * 1.0 / H) AS ny_fix,

            toFloat64(floor(SPEED * iTime / DZ)) AS base,

            /* best = (d_min, z_at_d_min) via lexicographic min over tuples */
            arrayMin(
              arrayMap(k ->
                tuple(
                  abs(
                    sqrt(
                      (nx - AX * cos( OMEGA * ( ((toFloat64(k)+base)*DZ) / SPEED ) )) *
                      (nx - AX * cos( OMEGA * ( ((toFloat64(k)+base)*DZ) / SPEED ) )) +
                      (ny_fix - AY * sin( OMEGA * ( ((toFloat64(k)+base)*DZ) / SPEED ) )) *
                      (ny_fix - AY * sin( OMEGA * ( ((toFloat64(k)+base)*DZ) / SPEED ) ))
                    )
                    - ( FOV / ( ((toFloat64(k)+base)*DZ - SPEED*iTime) + Z0 ) )
                  ),
                  ((toFloat64(k)+base)*DZ - SPEED*iTime)
                ),
                range(NUM)
              )
            ) AS best,

            best.1 AS d,
            best.2 AS z_near,

            /* intensity from band proximity and depth */
            greatest(0.0, 1.0 - abs(d)/BAND) AS w_band,
            greatest(0.0, least(1.0, (1.0/(z_near + Z0)) * DEPTH_GAIN)) AS w_depth,
            greatest(0.0, least(1.0, w_band * w_depth)) AS t,

            if(abs(d) <= BAND,
               substringUTF8(RAMP, 1 + toUInt8(floor(t * (N - 1))), 1),
               ' '
            ) AS ch
        FROM
            (SELECT arrayJoin(range(H)) AS y) AS yy
        CROSS JOIN
            (SELECT arrayJoin(range(W)) AS x) AS xx
    )
    GROUP BY y
);
