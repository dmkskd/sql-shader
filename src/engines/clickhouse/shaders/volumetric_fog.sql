-- Simplified Volumetric Fog Effect - 10-way parallel
-- @run: resolution=320x240, zoom=2

WITH
    {width:UInt32} AS width,
    {height:UInt32} AS height,
    {iTime:Float64} AS iTime,
    {mx:Float64} AS mx,
    {my:Float64} AS my,
    
-- Generate all pixel coordinates in 10 parallel slices
all_pixel_coords AS (

    SELECT  y,x 
        FROM
        (
            SELECT number AS y
            FROM system.numbers LIMIT height
        ) AS t_y
        CROSS JOIN (SELECT number AS x FROM system.numbers LIMIT width) AS t_x
        
),

-- Generate pixels with ray direction (shader logic defined once)
pixels AS (
    SELECT 
        x, y,
        
        -- Normalized pixel coordinates (-1 to 1)
        (x / toFloat64(width)) * 2.0 - 1.0 as px,
        ((y / toFloat64(height)) * 2.0 - 1.0) * (toFloat64(height) / toFloat64(width)) as py,
        
        -- Ray direction
        (x / toFloat64(width)) * 2.0 - 1.0 as ray_x,
        ((y / toFloat64(height)) * 2.0 - 1.0) * (toFloat64(height) / toFloat64(width)) as ray_y,
        1.5 as ray_z
        
    FROM all_pixel_coords
),

-- Raymarch with fixed steps
raymarch_steps AS (
    SELECT
        p.x, p.y, p.px, p.py, p.ray_x, p.ray_y, p.ray_z,
        s.step,
        
        -- Distance along ray
        s.step * 0.2 as t,
        
        -- Current position along ray - VERY SLOW
        p.ray_x * (s.step * 0.2) as px_raw,
        p.ray_y * (s.step * 0.2) as py_raw,
        p.ray_z * (s.step * 0.2) + iTime * 0.1 as pz_raw,  -- MUCH SLOWER: 0.1 instead of 0.3
        
        -- Rotation - VERY SLOW
        cos(iTime * 0.05) as rot_cos,  -- MUCH SLOWER: 0.05 instead of 0.15
        sin(iTime * 0.05) as rot_sin
        
    FROM pixels p
    CROSS JOIN (
        SELECT toUInt32(number) AS step
        FROM system.numbers LIMIT 50
    ) AS s
),

-- Calculate rotated positions and density
densities AS (
    SELECT
        x, y, step, t,
        
        -- Apply rotation to xz plane
        px_raw * rot_cos - pz_raw * rot_sin as p_x,
        py_raw as p_y,
        px_raw * rot_sin + pz_raw * rot_cos as p_z,
        
        -- Noise with VERY SLOW animation
        -- Octave 1 - big structures
        sin(px_raw * 2.0 + iTime * 0.2) *   -- MUCH SLOWER: 0.2 instead of 0.5
        sin(py_raw * 2.0) * 
        sin(pz_raw * 2.0 + iTime * 0.2) * 0.5 as noise1,
        
        -- Octave 2 - medium details
        sin(px_raw * 5.0 + iTime * 0.3) *   -- MUCH SLOWER: 0.3 instead of 0.7
        sin(py_raw * 5.0) * 
        sin(pz_raw * 5.0 + iTime * 0.3) * 0.25 as noise2,
        
        -- Octave 3 - fine details
        sin(px_raw * 10.0 + iTime * 0.4) *  -- MUCH SLOWER: 0.4 instead of 1.0
        sin(py_raw * 10.0) * 
        sin(pz_raw * 10.0 + iTime * 0.4) * 0.125 as noise3,
        
        -- Combined density
        py_raw + noise1 + noise2 + noise3 as density,
        
        px_raw, py_raw, pz_raw
        
    FROM raymarch_steps
),

-- Accumulate volumetric fog per pixel
accumulation AS (
    SELECT
        x, y,
        
        -- Fog with color variation - add spatial color shifts (slowed down)
        sum(
            if(density > -0.5 AND density < 0.5,
                exp(-abs(density) * 3.0) * 0.4 * (1.0 - abs(density) * 0.5) * (1.0 + sin(p_z * 0.1 + p_x * 0.08) * 0.4),
                0.0
            )
        ) as fog_r,
        
        sum(
            if(density > -0.5 AND density < 0.5,
                exp(-abs(density) * 2.5) * 0.3 * (1.0 - abs(density) * 0.4) * (1.0 + cos(p_z * 0.12 - p_y * 0.1) * 0.5),
                0.0
            )
        ) as fog_g,
        
        sum(
            if(density > -0.5 AND density < 0.5,
                exp(-abs(density) * 3.5) * 0.5 * (1.0 - abs(density) * 0.6) * (1.0 + sin(p_x * 0.09 + p_y * 0.11) * 0.6),
                0.0
            )
        ) as fog_b,
        
        -- Animated floor glow - VERY SLOW
        sum(
            if(p_y < -1.0 AND p_y > -2.0,
                (1.0 + sin(p_x * 3.0 + iTime * 0.2) * 0.5) * 0.3,  -- MUCH SLOWER: 0.2 instead of 0.6
                0.0
            )
        ) as floor_glow
        
    FROM densities
    GROUP BY x, y
)

-- Final color
SELECT 
    tanh((fog_r + floor_glow) * 0.45) as r,
    tanh(fog_g * 0.4) as g,
    tanh(fog_b * 0.55) as b
    
FROM accumulation
ORDER BY y, x