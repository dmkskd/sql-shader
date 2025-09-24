export const SHADERS = [
  {
    name: 'Interactive Waves',
    sql: `
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
SELECT r, g, b FROM colors ORDER BY y, x;`
  },
  {
    name: 'Cosmic Time',
    sql: `
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
SELECT r, g, b FROM colors ORDER BY y, x;`
  }
,
  {
    name: 'Raymarched Sphere',
    sql: `
-- DuckDB Raymarching Sphere + Box with Metaball Blending
-- Returns RGB color values for each pixel
-- @run: resolution=80x60, zoom=4

WITH
uniforms AS (
  SELECT
    ?::BIGINT AS width, ?::BIGINT AS height,
    ?::DOUBLE AS iTime, ?::DOUBLE AS mx, ?::DOUBLE AS my
),

-- Generate all pixels and calculate everything in one go
pixels AS (
    SELECT 
        x, y,
        u.width, u.height, u.iTime,
        
        -- Convert to normalized coordinates (-1 to 1)
        (x::DOUBLE / u.width) * 2.0 - 1.0 as screen_x,
        (y::DOUBLE / u.height) * 2.0 - 1.0 as screen_y,
        
        -- Simple camera setup
        0.0 as cam_x,
        0.0 as cam_y, 
        -3.0 as cam_z,
        
        -- ANIMATED sphere
        sin(u.iTime * 1.2) * 0.8 as sphere_x,              
        cos(u.iTime * 0.8) * 0.4 as sphere_y,        
        sin(u.iTime * 0.5) * 0.3 as sphere_z,        
        0.6 + sin(u.iTime * 2.0) * 0.2 as sphere_radius,
        
        -- ANIMATED spinning box (counter-orbiting with rotation)
        -sin(u.iTime * 0.9) * 0.9 as box_center_x,          
        sin(u.iTime * 1.1) * 0.5 as box_center_y,           
        cos(u.iTime * 0.7) * 0.4 as box_center_z,           
        0.4 + sin(u.iTime * 1.8) * 0.15 as box_size,
        
        -- Box rotation angles
        u.iTime * 1.3 as box_rot_x,  -- Spin around X axis
        u.iTime * 0.8 as box_rot_y,  -- Spin around Y axis  
        u.iTime * 1.1 as box_rot_z,  -- Spin around Z axis
        
        -- Metaball blending strength
        0.3 as blend_strength
        
    FROM uniforms u
    CROSS JOIN generate_series(0, u.width - 1) as t(x)
    CROSS JOIN generate_series(0, u.height - 1) as s(y)
),

-- Raymarching with metaball SDF blending
hits AS (
    SELECT 
        x, y, iTime,
        
        -- Find the hit point using metaball blending
        COALESCE(
            (SELECT step * 0.025
             FROM (
                SELECT 
                    step,
                    -- Current ray position
                    cam_x + screen_x + screen_x * (step * 0.025) as ray_x,
                    cam_y + screen_y + screen_y * (step * 0.025) as ray_y,
                    cam_z + 1.0 * (step * 0.025) as ray_z,
                    
                    -- Distance to sphere (SDF)
                    sqrt(
                        power(cam_x + screen_x + screen_x * (step * 0.025) - sphere_x, 2) +
                        power(cam_y + screen_y + screen_y * (step * 0.025) - sphere_y, 2) + 
                        power(cam_z + 1.0 * (step * 0.025) - sphere_z, 2)
                    ) - sphere_radius as sphere_dist,
                    
                    -- Distance to spinning box (SDF with rotation)
                    -- First translate to box center
                    cam_x + screen_x + screen_x * (step * 0.025) - box_center_x as box_local_x,
                    cam_y + screen_y + screen_y * (step * 0.025) - box_center_y as box_local_y,
                    cam_z + 1.0 * (step * 0.025) - box_center_z as box_local_z,
                    
                    -- Apply rotation (simplified - just Y rotation for performance)
                    (cam_x + screen_x + screen_x * (step * 0.025) - box_center_x) * cos(box_rot_y) - 
                    (cam_z + 1.0 * (step * 0.025) - box_center_z) * sin(box_rot_y) as rotated_box_x,
                    
                    cam_y + screen_y + screen_y * (step * 0.025) - box_center_y as rotated_box_y,
                    
                    (cam_x + screen_x + screen_x * (step * 0.025) - box_center_x) * sin(box_rot_y) + 
                    (cam_z + 1.0 * (step * 0.025) - box_center_z) * cos(box_rot_y) as rotated_box_z,
                    
                    -- Box SDF on rotated coordinates
                    GREATEST(
                        abs((cam_x + screen_x + screen_x * (step * 0.025) - box_center_x) * cos(box_rot_y) - 
                            (cam_z + 1.0 * (step * 0.025) - box_center_z) * sin(box_rot_y)) - box_size,
                        abs(cam_y + screen_y + screen_y * (step * 0.025) - box_center_y) - box_size,
                        abs((cam_x + screen_x + screen_x * (step * 0.025) - box_center_x) * sin(box_rot_y) + 
                            (cam_z + 1.0 * (step * 0.025) - box_center_z) * cos(box_rot_y)) - box_size
                    ) as box_dist,
                    
                    -- METABALL BLENDING: Smooth minimum function
                    -- smin(a,b,k) = -log(exp(-k*a) + exp(-k*b))/k
                    -- Approximation: min(a,b) - smoothstep blend
                    LEAST(
                        sqrt(
                            power(cam_x + screen_x + screen_x * (step * 0.025) - sphere_x, 2) +
                            power(cam_y + screen_y + screen_y * (step * 0.025) - sphere_y, 2) + 
                            power(cam_z + 1.0 * (step * 0.025) - sphere_z, 2)
                        ) - sphere_radius,
                        GREATEST(
                            abs((cam_x + screen_x + screen_x * (step * 0.025) - box_center_x) * cos(box_rot_y) - 
                                (cam_z + 1.0 * (step * 0.025) - box_center_z) * sin(box_rot_y)) - box_size,
                            abs(cam_y + screen_y + screen_y * (step * 0.025) - box_center_y) - box_size,
                            abs((cam_x + screen_x + screen_x * (step * 0.025) - box_center_x) * sin(box_rot_y) + 
                                (cam_z + 1.0 * (step * 0.025) - box_center_z) * cos(box_rot_y)) - box_size
                        )
                    ) - 
                    -- Smooth blending term
                    blend_strength * exp(-
                        power(
                            sqrt(
                                power(cam_x + screen_x + screen_x * (step * 0.025) - sphere_x, 2) +
                                power(cam_y + screen_y + screen_y * (step * 0.025) - sphere_y, 2) + 
                                power(cam_z + 1.0 * (step * 0.025) - sphere_z, 2)
                            ) - sphere_radius -
                            GREATEST(
                                abs((cam_x + screen_x + screen_x * (step * 0.025) - box_center_x) * cos(box_rot_y) - 
                                    (cam_z + 1.0 * (step * 0.025) - box_center_z) * sin(box_rot_y)) - box_size,
                                abs(cam_y + screen_y + screen_y * (step * 0.025) - box_center_y) - box_size,
                                abs((cam_x + screen_x + screen_x * (step * 0.025) - box_center_x) * sin(box_rot_y) + 
                                    (cam_z + 1.0 * (step * 0.025) - box_center_z) * cos(box_rot_y)) - box_size
                            ), 2
                        ) / 0.5
                    ) as metaball_dist
                    
                FROM generate_series(0, 100) as t(step)
             ) distances
             WHERE metaball_dist <= 0.05
             ORDER BY step
             LIMIT 1),
            -1.0
        ) as hit_distance,
        
        cam_x + screen_x as ray_start_x,
        cam_y + screen_y as ray_start_y,
        cam_z as ray_start_z,
        
        sphere_x, sphere_y, sphere_z, sphere_radius,
        box_center_x, box_center_y, box_center_z, box_size, box_rot_x, box_rot_y, box_rot_z,
        screen_x, screen_y
        
    FROM pixels
),

-- Calculate lighting for the blended surface
lighting AS (
    SELECT 
        x, y, iTime,
        CASE WHEN hit_distance > 0 THEN 1 ELSE 0 END as hit,
        hit_distance,
        
        -- Hit position in world space
        ray_start_x + screen_x * hit_distance as hit_x,
        ray_start_y + screen_y * hit_distance as hit_y,
        ray_start_z + 1.0 * hit_distance as hit_z,
        
        -- Approximate surface normal (gradient of the metaball field)
        CASE WHEN hit_distance > 0 THEN
            -- Blend between sphere and box normals based on proximity
            CASE 
                WHEN sqrt(power(ray_start_x + screen_x * hit_distance - sphere_x, 2) + 
                         power(ray_start_y + screen_y * hit_distance - sphere_y, 2) + 
                         power(ray_start_z + 1.0 * hit_distance - sphere_z, 2)) - sphere_radius < 
                     GREATEST(abs((ray_start_x + screen_x * hit_distance - box_center_x) * cos(box_rot_y) - 
                                 (ray_start_z + 1.0 * hit_distance - box_center_z) * sin(box_rot_y)) - box_size,
                             abs(ray_start_y + screen_y * hit_distance - box_center_y) - box_size,
                             abs((ray_start_x + screen_x * hit_distance - box_center_x) * sin(box_rot_y) + 
                                 (ray_start_z + 1.0 * hit_distance - box_center_z) * cos(box_rot_y)) - box_size)
                THEN
                    -- Closer to sphere - use sphere normal
                    (ray_start_x + screen_x * hit_distance - sphere_x) / sphere_radius * 0.7
                ELSE
                    -- Closer to spinning box - use rotated box normal  
                    CASE 
                        WHEN abs((ray_start_x + screen_x * hit_distance - box_center_x) * cos(box_rot_y) - 
                                 (ray_start_z + 1.0 * hit_distance - box_center_z) * sin(box_rot_y)) >= 
                             GREATEST(abs(ray_start_y + screen_y * hit_distance - box_center_y), 
                                     abs((ray_start_x + screen_x * hit_distance - box_center_x) * sin(box_rot_y) + 
                                         (ray_start_z + 1.0 * hit_distance - box_center_z) * cos(box_rot_y)))
                        THEN SIGN((ray_start_x + screen_x * hit_distance - box_center_x) * cos(box_rot_y) - 
                                  (ray_start_z + 1.0 * hit_distance - box_center_z) * sin(box_rot_y)) * 0.5
                        ELSE 0.0
                    END
            END
        ELSE 0.0 END as normal_x,
        
        CASE WHEN hit_distance > 0 THEN
            CASE 
                WHEN sqrt(power(ray_start_x + screen_x * hit_distance - sphere_x, 2) + 
                         power(ray_start_y + screen_y * hit_distance - sphere_y, 2) + 
                         power(ray_start_z + 1.0 * hit_distance - sphere_z, 2)) - sphere_radius < 
                     GREATEST(abs((ray_start_x + screen_x * hit_distance - box_center_x) * cos(box_rot_y) - 
                                 (ray_start_z + 1.0 * hit_distance - box_center_z) * sin(box_rot_y)) - box_size,
                             abs(ray_start_y + screen_y * hit_distance - box_center_y) - box_size,
                             abs((ray_start_x + screen_x * hit_distance - box_center_x) * sin(box_rot_y) + 
                                 (ray_start_z + 1.0 * hit_distance - box_center_z) * cos(box_rot_y)) - box_size)
                THEN
                    (ray_start_y + screen_y * hit_distance - sphere_y) / sphere_radius * 0.7
                ELSE
                    CASE 
                        WHEN abs(ray_start_y + screen_y * hit_distance - box_center_y) >= 
                             GREATEST(abs((ray_start_x + screen_x * hit_distance - box_center_x) * cos(box_rot_y) - 
                                         (ray_start_z + 1.0 * hit_distance - box_center_z) * sin(box_rot_y)), 
                                     abs((ray_start_x + screen_x * hit_distance - box_center_x) * sin(box_rot_y) + 
                                         (ray_start_z + 1.0 * hit_distance - box_center_z) * cos(box_rot_y)))
                        THEN SIGN(ray_start_y + screen_y * hit_distance - box_center_y) * 0.5
                        ELSE 0.0
                    END
            END
        ELSE 0.0 END as normal_y,
        
        CASE WHEN hit_distance > 0 THEN
            CASE 
                WHEN sqrt(power(ray_start_x + screen_x * hit_distance - sphere_x, 2) + 
                         power(ray_start_y + screen_y * hit_distance - sphere_y, 2) + 
                         power(ray_start_z + 1.0 * hit_distance - sphere_z, 2)) - sphere_radius < 
                     GREATEST(abs((ray_start_x + screen_x * hit_distance - box_center_x) * cos(box_rot_y) - 
                                 (ray_start_z + 1.0 * hit_distance - box_center_z) * sin(box_rot_y)) - box_size,
                             abs(ray_start_y + screen_y * hit_distance - box_center_y) - box_size,
                             abs((ray_start_x + screen_x * hit_distance - box_center_x) * sin(box_rot_y) + 
                                 (ray_start_z + 1.0 * hit_distance - box_center_z) * cos(box_rot_y)) - box_size)
                THEN
                    (ray_start_z + 1.0 * hit_distance - sphere_z) / sphere_radius * 0.7
                ELSE
                    CASE 
                        WHEN abs((ray_start_x + screen_x * hit_distance - box_center_x) * sin(box_rot_y) + 
                                 (ray_start_z + 1.0 * hit_distance - box_center_z) * cos(box_rot_y)) >= 
                             GREATEST(abs((ray_start_x + screen_x * hit_distance - box_center_x) * cos(box_rot_y) - 
                                         (ray_start_z + 1.0 * hit_distance - box_center_z) * sin(box_rot_y)), 
                                     abs(ray_start_y + screen_y * hit_distance - box_center_y))
                        THEN SIGN((ray_start_x + screen_x * hit_distance - box_center_x) * sin(box_rot_y) + 
                                  (ray_start_z + 1.0 * hit_distance - box_center_z) * cos(box_rot_y)) * 0.5
                        ELSE 0.0
                    END
            END
        ELSE 0.0 END as normal_z,
        
        -- Animated light direction 
        -0.6 + sin(iTime * 0.8) * 0.3 as light_x,
        0.8 + cos(iTime * 0.6) * 0.2 as light_y, 
        -0.5 + sin(iTime * 1.1) * 0.2 as light_z
        
    FROM hits
)

-- Generate beautiful RGB colors
SELECT 
    CASE 
        WHEN hit = 1 THEN
            -- Metaball surface with beautiful colors
            GREATEST(0.0, LEAST(1.0, 
                0.15 + GREATEST(0.0, normal_x * light_x + normal_y * light_y + normal_z * light_z) * 
                (0.6 + sin(lighting.iTime * 1.2 + hit_x * 3.0 + hit_y * 2.0) * 0.3)
            ))
        ELSE 
            -- Animated background
            0.05 + (x::DOUBLE / uniforms.width) * 0.1 + sin(lighting.iTime * 0.4) * 0.03
    END as r,
    
    CASE 
        WHEN hit = 1 THEN
            GREATEST(0.0, LEAST(1.0,
                0.1 + GREATEST(0.0, normal_x * light_x + normal_y * light_y + normal_z * light_z) * 
                (0.5 + cos(lighting.iTime * 1.5 + hit_x * 2.5 + hit_z * 3.0) * 0.3)
            ))
        ELSE 
            0.08 + (y::DOUBLE / uniforms.height) * 0.15 + cos(lighting.iTime * 0.3) * 0.04
    END as g,
    
    CASE 
        WHEN hit = 1 THEN
            GREATEST(0.0, LEAST(1.0,
                0.2 + GREATEST(0.0, normal_x * light_x + normal_y * light_y + normal_z * light_z) * 
                (0.4 + sin(lighting.iTime * 1.8 + hit_y * 4.0 + hit_z * 2.0) * 0.4)
            ))
        ELSE 
            0.1 + ((x + y)::DOUBLE / (uniforms.width + uniforms.height)) * 0.2 + sin(lighting.iTime * 0.6) * 0.02
    END as b

FROM lighting
CROSS JOIN uniforms
ORDER BY y, x;`
  }
,
  {
    name: 'Alien Beacon',
    sql: `
-- "Alien Beacon" - SQL port of a shader by Iñigo Quílez.
-- Original: https://www.shadertoy.com/view/ltsyWl
-- License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported.

WITH RECURSIVE
  uniforms AS (
    SELECT
      ?::BIGINT AS width, ?::BIGINT AS height,
      ?::DOUBLE AS iTime, ?::DOUBLE AS mx, ?::DOUBLE AS my
  ),
  -- Define the scene's distance function (SDF) as a macro for reusability.
  -- This combines multiple shapes (tori, sphere, cylinder) to build the scene.
  map(pos) AS (
    min(
      max(
        min(
          length([length([pos[1], pos[3]]) - 1.0, pos[2] - 0.4]) - 0.1, -- sdTorus
          length([pos[1], pos[2] - 0.4, pos[3]]) - 0.2 -- sdSphere
        ),
        -(length([pos[1], pos[3]]) - 0.3) -- inverted sdCylinder
      ),
      length([length([pos[1], pos[3]]) - 2.0, pos[2] - 0.4]) - 0.1 -- sdTorus
    )
  ),
  -- Setup initial state for each pixel's ray
  initial_state AS (
    SELECT
      i::DOUBLE AS x, j::DOUBLE AS y,
      (SELECT iTime FROM uniforms) AS iTime,
      -- Ray Origin (camera position)
      [
        3.5 * cos(0.2 * iTime),
        1.5 + 1.0 * cos(0.3 * iTime),
        3.5 * sin(0.2 * iTime)
      ] AS ro,
      -- Ray Direction (look at target)
      normalize([
        -3.5 * cos(0.2 * iTime),
        -0.5 - 1.0 * cos(0.3 * iTime),
        -3.5 * sin(0.2 * iTime)
      ]) AS rd
    FROM generate_series(0, (SELECT width - 1 FROM uniforms)) AS t(i)
    CROSS JOIN generate_series(0, (SELECT height - 1 FROM uniforms)) AS t2(j)
  ),
  -- The Raymarching Loop
  raymarch(x, y, ro, rd, iTime, step, t) AS (
    -- Base case: Start at step 0 with distance 0
    SELECT x, y, ro, rd, iTime, 0::DOUBLE, 0.0::DOUBLE
    FROM initial_state
    UNION ALL
    -- Recursive step: March each ray forward
    SELECT
      x, y, ro, rd, iTime, step + 1.0,
      t + map(ro + list_apply(rd, val -> val * t))
    FROM raymarch
    WHERE
      step < 64.0 AND
      t < 20.0 AND
      map(ro + list_apply(rd, val -> val * t)) > 0.001
  ),
  -- Find the final state for each ray
  hits AS (
    SELECT x, y, ro, rd, iTime, step, t,
      ROW_NUMBER() OVER (PARTITION BY x, y ORDER BY step DESC) as rn
    FROM raymarch
  ),
  -- Calculate the final color for each pixel
  colors AS (
    SELECT
      h.x, h.y,
      (
        WITH
          -- Only calculate lighting if we hit something
          hit_pos AS (SELECT h.ro + list_apply(h.rd, val -> val * h.t)),
          -- Calculate the normal at the hit position
          eps AS (SELECT [0.001, 0.0, 0.0]),
          nor AS (
            SELECT normalize([
              map(hit_pos + [eps[1], eps[2], eps[2]]) - map(hit_pos - [eps[1], eps[2], eps[2]]),
              map(hit_pos + [eps[2], eps[1], eps[2]]) - map(hit_pos - [eps[2], eps[1], eps[2]]),
              map(hit_pos + [eps[2], eps[2], eps[1]]) - map(hit_pos - [eps[2], eps[2], eps[1]])
            ])
          ),
          -- Basic lighting calculation
          light_pos AS (SELECT [1.0, 1.0, 1.0]),
          light_dir AS (SELECT normalize(light_pos - hit_pos)),
          diffuse AS (SELECT greatest(0.0, list_dot_product(nor, light_dir)))
        SELECT
          -- If the ray missed (ran max steps), color it black. Otherwise, apply lighting.
          CASE WHEN h.step < 63.0 THEN [0.2, 0.5, 0.8] * diffuse ELSE [0.0, 0.0, 0.0] END
      ) AS col
    FROM hits h
    WHERE h.rn = 1
  )
SELECT
  col[1] AS r,
  col[2] AS g,
  col[3] AS b
FROM colors
ORDER BY y, x;`
  }
];