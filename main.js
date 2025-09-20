import * as duckdb from '@duckdb/duckdb-wasm';

const main = async () => {
  // Get the canvas and its context
  const canvas = document.getElementById('shader-canvas');
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const resolution = { width: canvas.width, height: canvas.height };

  // A simple SQL "shader" that creates a moving color pattern
  // It generates a grid of pixels and calculates RGB values based on
  // coordinates (x, y) and the current time (iTime).
  const SHADER_SQL = `
    -- Use CTEs (Common Table Expressions) to structure the logic
    WITH
    
    -- 1. Generate a grid of pixel coordinates from (0,0) to (width, height)
    pixels AS (
      SELECT
        i::DOUBLE AS x,
        j::DOUBLE AS y
      FROM generate_series(0, ?::BIGINT) AS t(i)     -- width - 1
      CROSS JOIN generate_series(0, ?::BIGINT) AS t2(j) -- height - 1
    ),
    
    -- 2. Run the "shader" logic for each pixel
    colors AS (
      SELECT
        -- Normalize coordinates to the 0.0 to 1.0 range
        x / ? AS u, -- width
        y / ? AS v, -- height
        
        -- Calculate RGB values using sine waves and iTime for animation
        -- iMouse (mx, my) to influence the pattern.
        0.5 + 0.5 * sin(SQRT(POW(x - ?::DOUBLE, 2) + POW(y - ?::DOUBLE, 2)) * 0.1 - ? * 2.0) AS r, -- mx, my, iTime
        0.5 + 0.5 * sin(? * 1.5) AS g, -- iTime
        0.5 + 0.5 * cos(SQRT(POW(x - ?::DOUBLE, 2) + POW(y - ?::DOUBLE, 2)) * 0.1 - ? * 2.0) AS b, -- mx, my, iTime
        
        -- Keep original coordinates for ordering
        x, y
      FROM pixels
    )
    
    -- 3. Select the final color values, ensuring they are in the correct order for rendering
    SELECT r, g, b
    FROM colors
    ORDER BY y, x;
  `;

  try {
    // --- Database Initialization ---
    // Use the official JSDelivr bundles
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
    );
    const worker = new Worker(workerUrl);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(workerUrl); // Clean up the blob URL

    // Establish a persistent connection
    const c = await db.connect();
    const prepared = await c.prepare(SHADER_SQL);

    // --- Animation Loop ---
    const imageData = ctx.createImageData(resolution.width, resolution.height);
    const startTime = performance.now();
    const iMouse = { x: resolution.width / 2, y: resolution.height / 2 };

    // Add a mouse move listener to update the iMouse coordinates
    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      iMouse.x = event.clientX - rect.left;
      iMouse.y = event.clientY - rect.top;
    });

    const renderFrame = async () => {
      const iTime = (performance.now() - startTime) / 1000.0;

      // Execute the prepared SQL statement with current parameters
      const result = await prepared.query(
        resolution.width - 1, resolution.height - 1, // generate_series
        resolution.width, resolution.height,         // normalization
        iMouse.x, iMouse.y, iTime,                   // r channel
        iTime,                                       // g channel
        iMouse.x, iMouse.y, iTime                    // b channel
      );

      // --- High-Performance Data Transfer ---
      // Instead of converting to an array of JS objects, we get direct access
      // to the underlying typed arrays for each column (r, g, b).
      // This is significantly faster and avoids memory allocation in the loop.
      const r = result.getChild('r').toArray();
      const g = result.getChild('g').toArray();
      const b = result.getChild('b').toArray();

      for (let i = 0; i < r.length; i++) {
        const pixelIndex = i * 4;
        imageData.data[pixelIndex + 0] = r[i] * 255; // Red
        imageData.data[pixelIndex + 1] = g[i] * 255; // Green
        imageData.data[pixelIndex + 2] = b[i] * 255; // Blue
        imageData.data[pixelIndex + 3] = 255;        // Alpha
      }
      ctx.putImageData(imageData, 0, 0);

      requestAnimationFrame(renderFrame); // Loop
    };

    requestAnimationFrame(renderFrame); // Start the animation
  } catch (e) {
    console.error(e);
  }
};

main();