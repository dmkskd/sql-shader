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
-- "Raymarched Sphere" - Renders a 3D scene using a raymarching loop.
-- This is implemented with a RECURSIVE Common Table Expression (CTE).

WITH RECURSIVE
  uniforms AS (
    SELECT
      ?::BIGINT AS width, ?::BIGINT AS height,
      ?::DOUBLE AS iTime, ?::DOUBLE AS mx, ?::DOUBLE AS my
  ),
  -- 1. Define the unnormalized ray direction for each pixel
  rays_unnormalized AS (
    SELECT
      i::DOUBLE AS x,
      j::DOUBLE AS y,
      [
        (i - (SELECT width / 2.0 FROM uniforms)) / (SELECT width FROM uniforms),
        (j - (SELECT height / 2.0 FROM uniforms)) / (SELECT height FROM uniforms),
        -1.0
      ] AS unnormalized_rd
    FROM generate_series(0, (SELECT width - 1 FROM uniforms)) AS t(i)
    CROSS JOIN generate_series(0, (SELECT height - 1 FROM uniforms)) AS t2(j)
  ),
  -- 2. For each pixel, define a ray with an origin (ro) and a normalized direction (rd)
  rays AS (
    SELECT
      x, y,
      (SELECT iTime FROM uniforms) AS iTime,
      [0.0, 0.0, -5.0] AS ro, -- Ray Origin (camera position), moved in front of the scene
      list_apply(unnormalized_rd, val -> val / length(unnormalized_rd)) AS rd -- Manually normalize the vector
    FROM rays_unnormalized
  ),
  -- 3. The Raymarching Loop, implemented as a recursive CTE
  raymarch(x, y, ro, rd, iTime, step, t) AS (
    -- Base case: Start at step 0 with distance 0 for every ray
    SELECT x, y, ro, rd, iTime, 0::DOUBLE, 0.0::DOUBLE
    FROM rays
    UNION ALL
    -- This is the correct and direct recursive step.
    -- The SDF is calculated once and used in both SELECT and WHERE.
    SELECT
      x, y, ro, rd, iTime, step + 1,
      t + (length([(ro + list_apply(rd, val -> val * t))[1] - 0.0, (ro + list_apply(rd, val -> val * t))[2] - 0.0, (ro + list_apply(rd, val -> val * t))[3] - 1.0]) - (0.5 + 0.25 * sin(iTime * 2.0)))
    FROM raymarch
    -- Conditions to continue marching:
    WHERE step < 50 AND t < 100.0 AND (length([(ro + list_apply(rd, val -> val * t))[1] - 0.0, (ro + list_apply(rd, val -> val * t))[2] - 0.0, (ro + list_apply(rd, val -> val * t))[3] - 1.0]) - (0.5 + 0.25 * sin(iTime * 2.0))) > 0.001
  ),
  -- 4. Find the final state for each ray (the point where it hit or missed)
  hits AS (
    SELECT x, y, step, t,
      -- Use ROW_NUMBER to find the last step for each pixel's ray
      ROW_NUMBER() OVER (PARTITION BY x, y ORDER BY step DESC) as rn
    FROM raymarch
  ),
  -- 5. Calculate the final color for each pixel
  colors AS (
    SELECT
      -- If the ray hit the sphere (step < max_steps), color it based on distance. Otherwise, black.
      greatest(CASE WHEN step < 50 THEN 1.0 - (t / 10.0) ELSE 0.0 END, 0.0) AS r,
      greatest(CASE WHEN step < 50 THEN 1.0 - (t / 12.0) ELSE 0.0 END, 0.0) AS g,
      greatest(CASE WHEN step < 50 THEN 1.0 - (t / 8.0) ELSE 0.0 END, 0.0) AS b,
      x, y
    FROM hits
    WHERE rn = 1 -- Only consider the final step for each ray
  )
SELECT r, g, b FROM colors ORDER BY y, x;`
  }
,
  {
    name: 'Debug Raymarch (Directions)',
    sql: `
-- "Debug Raymarch" - A debugging tool to visualize ray directions.
-- This query is fast because it removes the slow recursive raymarching loop.
-- It colors pixels based on the initial ray direction (rd) vector.
-- Red = rd.x, Green = rd.y, Blue = rd.z

WITH
  uniforms AS (
    SELECT
      ?::BIGINT AS width, ?::BIGINT AS height,
      ?::DOUBLE AS iTime, ?::DOUBLE AS mx, ?::DOUBLE AS my
  ),
  rays_unnormalized AS (
    SELECT
      i::DOUBLE AS x, j::DOUBLE AS y,
      [
        (i - (SELECT width / 2.0 FROM uniforms)) / (SELECT width FROM uniforms),
        (j - (SELECT height / 2.0 FROM uniforms)) / (SELECT height FROM uniforms),
        -1.0
      ] AS unnormalized_rd
    FROM generate_series(0, (SELECT width - 1 FROM uniforms)) AS t(i)
    CROSS JOIN generate_series(0, (SELECT height - 1 FROM uniforms)) AS t2(j)
  ),
  rays_normalized AS (
    SELECT
      x, y,
      list_apply(unnormalized_rd, val -> val / length(unnormalized_rd)) AS rd
    FROM rays_unnormalized
  ),
  colors AS (
    SELECT
      x, y,
      -- Manually normalize the vector and map its components to colors
      -- Map the normalized vector components to RGB colors
      rd[1] * 0.5 + 0.5 AS r,
      rd[2] * 0.5 + 0.5 AS g,
      abs(rd[3]) AS b
    FROM rays_normalized
  )
SELECT r, g, b FROM colors ORDER BY y, x;`
  }
,
  {
    name: 'Debug Raymarch (Steps)',
    sql: `
-- "Debug Raymarch (Steps)" - Visualizes the number of steps each ray takes.
-- This helps debug if rays are hitting the object or timing out.
-- Bright areas = max steps (miss). Dark areas = fewer steps (hit).

WITH RECURSIVE
  uniforms AS (
    SELECT
      ?::BIGINT AS width, ?::BIGINT AS height,
      ?::DOUBLE AS iTime, ?::DOUBLE AS mx, ?::DOUBLE AS my
  ),
  rays_unnormalized AS (
    SELECT i::DOUBLE AS x, j::DOUBLE AS y, [ (i - (SELECT width / 2.0 FROM uniforms)) / (SELECT width FROM uniforms), (j - (SELECT height / 2.0 FROM uniforms)) / (SELECT height FROM uniforms), -1.0 ] AS unnormalized_rd
    FROM generate_series(0, (SELECT width - 1 FROM uniforms)) AS t(i)
    CROSS JOIN generate_series(0, (SELECT height - 1 FROM uniforms)) AS t2(j)
  ),
  rays AS (
    SELECT x, y, (SELECT iTime FROM uniforms) AS iTime, [0.0, 0.0, -5.0] AS ro, list_apply(unnormalized_rd, val -> val / length(unnormalized_rd)) AS rd
    FROM rays_unnormalized
  ),
  raymarch(x, y, ro, rd, iTime, step, t) AS (
    SELECT x, y, ro, rd, iTime, 0::DOUBLE, 0.0::DOUBLE FROM rays
    UNION ALL
    SELECT x, y, ro, rd, iTime, step + 1, t + sdf_dist
    FROM (
      SELECT *,
        length([(ro + list_apply(rd, val -> val * t))[1] - 0.0, (ro + list_apply(rd, val -> val * t))[2] - 0.0, (ro + list_apply(rd, val -> val * t))[3] - 1.0]) - (0.5 + 0.25 * sin(iTime * 2.0)) AS sdf_dist
      FROM raymarch
    )
    WHERE step < 50 AND t < 100.0 AND sdf_dist > 0.001
  ),
  hits AS (
    SELECT x, y, step,
      ROW_NUMBER() OVER (PARTITION BY x, y ORDER BY step DESC) as rn
    FROM raymarch
  ),
  colors AS (
    SELECT
      -- Visualize the number of steps taken, normalized to a 0-1 range.
      step / 50.0 AS r,
      step / 50.0 AS g,
      step / 50.0 AS b,
      x, y
    FROM hits
    WHERE rn = 1
  )
SELECT r, g, b FROM colors ORDER BY y, x;`
  }
,
  {
    name: 'Debug SDF (1st Step)',
    sql: `
-- "Debug SDF (1st Step)" - Visualizes the result of the FIRST SDF calculation.
-- This is a fast, critical debugging tool. It removes the slow recursion.
-- A dark circle in the middle means the SDF calculation is correct.

WITH
  uniforms AS (
    SELECT
      ?::BIGINT AS width, ?::BIGINT AS height,
      ?::DOUBLE AS iTime, ?::DOUBLE AS mx, ?::DOUBLE AS my
  ),
  rays_unnormalized AS (
    SELECT i::DOUBLE AS x, j::DOUBLE AS y, [ (i - (SELECT width / 2.0 FROM uniforms)) / (SELECT width FROM uniforms), (j - (SELECT height / 2.0 FROM uniforms)) / (SELECT height FROM uniforms), -1.0 ] AS unnormalized_rd
    FROM generate_series(0, (SELECT width - 1 FROM uniforms)) AS t(i)
    CROSS JOIN generate_series(0, (SELECT height - 1 FROM uniforms)) AS t2(j)
  ),
  rays AS (
    SELECT x, y, (SELECT iTime FROM uniforms) AS iTime, [0.0, 0.0, -5.0] AS ro, list_apply(unnormalized_rd, val -> val / length(unnormalized_rd)) AS rd
    FROM rays_unnormalized
  ),
  -- Calculate the SDF for the initial ray position (t=0)
  first_step_sdf AS (
    SELECT
      x, y,
      -- Calculate SDF from the point on the view plane, not the camera origin.
      -- The point on the view plane is ro + rd * initial_distance. Let's use a distance of 4.
      length([(ro + list_apply(rd, val -> val * 4.0))[1] - 0.0, (ro + list_apply(rd, val -> val * 4.0))[2] - 0.0, (ro + list_apply(rd, val -> val * 4.0))[3] - 1.0]) - (0.5 + 0.25 * sin(iTime * 2.0)) AS sdf_dist
    FROM rays
  ),
  colors AS (
    SELECT
      -- Visualize the SDF distance, clamped to a 0-1 range.
      greatest(sdf_dist / 5.0, 0.0) AS r,
      greatest(sdf_dist / 5.0, 0.0) AS g,
      greatest(sdf_dist / 5.0, 0.0) AS b,
      x, y
    FROM first_step_sdf
  )
SELECT r, g, b FROM colors ORDER BY y, x;`
  }
,
  {
    name: 'Simple Raymarch Check',
    sql: `
-- "Simple Raymarch Check" - A simplified, non-recursive raymarcher for debugging.
-- It checks a fixed number of points along each ray to see if they intersect the sphere.

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
        
        -- Simple camera setup (fixed position)
        0.0 as cam_x,
        0.0 as cam_y, 
        -3.0 as cam_z,
        
        -- Simple sphere (fixed at origin)
        0.0 as sphere_x,
        0.0 as sphere_y,
        0.0 as sphere_z,
        1.0 as sphere_radius
        
    FROM uniforms u
    CROSS JOIN generate_series(0, u.width - 1) as t(x)
    CROSS JOIN generate_series(0, u.height - 1) as s(y)
),

-- Calculate ray directions and intersections
intersections AS (
    SELECT 
        x, y,
        screen_x, screen_y,
        
        -- Ray direction (simple orthographic-like projection)
        screen_x as ray_x,
        screen_y as ray_y,
        1.0 as ray_z,  -- Looking down positive Z
        
        cam_x, cam_y, cam_z,
        sphere_x, sphere_y, sphere_z, sphere_radius
        
    FROM pixels
),

-- Simple distance check (instead of complex quadratic)
hits AS (
    SELECT 
        x, y,
        
        -- Test multiple points along the ray
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM generate_series(0, 50) as t(step)
                WHERE sqrt(
                    power(cam_x + screen_x + ray_x * (step * 0.1) - sphere_x, 2) +
                    power(cam_y + screen_y + ray_y * (step * 0.1) - sphere_y, 2) + 
                    power(cam_z + ray_z * (step * 0.1) - sphere_z, 2)
                ) <= sphere_radius + 0.1
            ) THEN 1
            ELSE 0
        END as hit
        
    FROM intersections
)

-- Generate final RGB values
SELECT 
    CASE WHEN hit = 1 THEN 1.0 ELSE 0.2 + (x::DOUBLE / width) * 0.3 END as r,
    CASE WHEN hit = 1 THEN 0.4 ELSE 0.2 + (y::DOUBLE / height) * 0.3 END as g,
    CASE WHEN hit = 1 THEN 0.4 ELSE 0.3 + ((x + y)::DOUBLE / (width + height)) * 0.3 END as b

FROM hits
CROSS JOIN uniforms  -- Need width/height for background calculation
ORDER BY y, x;`
  }
,
  {
    name: 'Quasar',
    sql: `
-- "Quasar" - An SQL translation of a compact GLSL shader.
-- This demonstrates complex vector math and iterative refinement using a recursive CTE.

WITH RECURSIVE
  uniforms AS (
    SELECT
      ?::BIGINT AS width, ?::BIGINT AS height,
      ?::DOUBLE AS iTime, ?::DOUBLE AS mx, ?::DOUBLE AS my
  ),
  -- 1. Setup initial state for each pixel's ray
  initial_state AS (
    SELECT
      i::DOUBLE AS x, j::DOUBLE AS y,
      (SELECT iTime FROM uniforms) AS iTime,
      -- o (output color), initialized to black [r,g,b,a]
      [0.0::DOUBLE, 0.0::DOUBLE, 0.0::DOUBLE, 0.0::DOUBLE] AS o,
      -- FC (Fragment Coordinate), normalized
      [i / (SELECT width FROM uniforms), j / (SELECT height FROM uniforms), 0.0] AS FC,
      (SELECT width FROM uniforms) as r_x,
      (SELECT height FROM uniforms) as r_y
    FROM generate_series(0, (SELECT width - 1 FROM uniforms)) AS t(i)
    CROSS JOIN generate_series(0, (SELECT height - 1 FROM uniforms)) AS t2(j)
  ),
  -- 2. The main loop, implemented as a recursive CTE
  quasar_loop(x, y, i, o, FC, r_x, r_y, iTime) AS (
    -- Base case: Start at loop counter i = 0
    SELECT x, y, 0.0::DOUBLE, o, FC, r_x, r_y, iTime
    FROM initial_state
    UNION ALL
    -- This is the optimized recursive step using a LATERAL join.
    -- It calculates all intermediate values for each row once, preventing memory explosion.
    SELECT
      ql.x, ql.y,
      ql.i + 1.0,
      -- Perform element-wise addition: o = o + increment_vec
      [ql.o[1] + calc.inc_vec[1], ql.o[2] + calc.inc_vec[2], ql.o[3] + calc.inc_vec[3], ql.o[4] + calc.inc_vec[4]],
      ql.FC, ql.r_x, ql.r_y, ql.iTime
    FROM quasar_loop AS ql,
      -- The LATERAL subquery can see columns from 'ql' (the previous item in FROM)
      LATERAL (
        SELECT inc_vec FROM (
            WITH s_cte AS (SELECT ql.iTime - (ql.i / 10.0) AS s, ql.i),
                 p_cte AS (SELECT list_apply([ql.FC[1]*2.0-ql.r_x/ql.r_y, ql.FC[2]*2.0-1.0, 1.0::DOUBLE], val -> val * (ql.i*0.2)) AS p),
                 a_cte AS (SELECT list_apply(p_cte.p, val -> val - 0.57) AS a FROM p_cte),
                 a_mixed_cte AS (
                    WITH part1 AS (SELECT list_apply(a_cte.a, val -> val * list_dot_product(a_cte.a, p_cte.p) * cos(s_cte.s)) as vec FROM a_cte, p_cte, s_cte),
                         part2 AS (SELECT list_apply([a_cte.a[2]*p_cte.p[3] - a_cte.a[3]*p_cte.p[2], a_cte.a[3]*p_cte.p[1] - a_cte.a[1]*p_cte.p[3], a_cte.a[1]*p_cte.p[2] - a_cte.a[2]*p_cte.p[1]], val -> val * sin(s_cte.s)) as vec FROM a_cte, p_cte, s_cte)
                    SELECT [part1.vec[1] - part2.vec[1], part1.vec[2] - part2.vec[2], part1.vec[3] - part2.vec[3]] AS a_mixed FROM part1, part2
                 ),
                 s_len_cte AS (SELECT sqrt(length([a_mixed_cte.a_mixed[1], a_mixed_cte.a_mixed[3]])) AS s_len FROM a_mixed_cte),
                 z_inc_cte AS (
                    WITH normalized_a AS (SELECT list_apply(a_mixed_cte.a_mixed, val -> val / length(a_mixed_cte.a_mixed)) as vec FROM a_mixed_cte)
                    SELECT length(list_apply(list_apply(a_mixed_cte.a_mixed, val -> sin(val)), val -> val + list_dot_product(a_mixed_cte.a_mixed, normalized_a.vec) * 0.2)) * s_len_cte.s_len / 20.0 AS z_inc
                    FROM a_mixed_cte, s_len_cte, normalized_a
                 )
            SELECT list_apply([z_inc_cte.z_inc, 2.0::DOUBLE, s_cte.s, 1.0::DOUBLE], val -> val / s_cte.s / (s_cte.i + 1.0)) as inc_vec
            FROM z_inc_cte, s_cte
        )
      ) AS calc
    WHERE i < 70.0 -- Loop condition: i++ < 7e1
  ),
  -- 3. Get the final color value for each pixel after the loop finishes
  final_colors AS (
    SELECT x, y, o, ROW_NUMBER() OVER (PARTITION BY x, y ORDER BY i DESC) as rn
    FROM quasar_loop
  ),
  -- 4. Normalize the output color
  colors AS (
    SELECT
      tanh(o[1] / 20.0) AS r,
      tanh(o[2] / 20.0) AS g,
      tanh(o[3] / 20.0) AS b,
      x, y
    FROM final_colors
    WHERE rn = 1
  )
SELECT r, g, b FROM colors ORDER BY y, x;`
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