import * as duckdb from '@duckdb/duckdb-wasm';

const main = async () => {
  // --- DOM Elements ---
  const canvas = document.getElementById('shader-canvas');
  const editorPane = document.querySelector('.editor-pane');
  const editorTextarea = document.getElementById('sql-editor');
  const statsPanel = document.getElementById('stats-panel');
  const errorPanel = document.getElementById('error-panel');
  const resizeHandle = document.getElementById('resize-handle');

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let resolution = { width: canvas.width, height: canvas.height };

  // --- Initialize CodeMirror ---
  const editor = CodeMirror.fromTextArea(editorTextarea, {
    mode: 'text/x-sql',
    theme: 'material-darker',
    lineNumbers: true,
    lineWrapping: true,
  });

  // Move the error panel to be part of the CodeMirror DOM structure for correct layout
  // editor.getWrapperElement().parentNode.appendChild(errorPanel);

  // --- Initial SQL Shader ---
  // This will be loaded into the editor.
  const INITIAL_SHADER_SQL = `
    -- Use CTEs (Common Table Expressions) to structure the logic
    WITH
    
    -- 1. Define shader "uniforms" (inputs) once to avoid repetition.
    -- This makes the parameter list from JavaScript much cleaner.
    uniforms AS (
      SELECT
        ?::BIGINT AS width,
        ?::BIGINT AS height,
        ?::DOUBLE AS iTime,
        ?::DOUBLE AS mx,
        ?::DOUBLE AS my
    ),

    -- 2. Generate a grid of pixel coordinates from (0,0) to (width, height)
    pixels AS (
      SELECT
        i::DOUBLE AS x,
        j::DOUBLE AS y
      FROM generate_series(0, (SELECT width - 1 FROM uniforms)) AS t(i)
      CROSS JOIN generate_series(0, (SELECT height - 1 FROM uniforms)) AS t2(j) -- Cross join to create a grid
    ),
    
    -- 3. Run the "shader" logic for each pixel, referencing the uniforms
    colors AS (
      SELECT
        -- Normalize coordinates to the 0.0 to 1.0 range
        p.x / u.width AS u,
        p.y / u.height AS v,
        
        -- Calculate RGB values using sine waves and iTime for animation
        0.5 + 0.5 * sin(sqrt(pow(p.x - u.mx, 2) + pow(p.y - u.my, 2)) * 0.1 - u.iTime * 2.0) AS r,
        0.5 + 0.5 * sin(u.iTime * 1.5) AS g,
        0.5 + 0.5 * cos(sqrt(pow(p.x - u.mx, 2) + pow(p.y - u.my, 2)) * 0.1 - u.iTime * 2.0) AS b,
        
        -- Keep original coordinates for ordering
        x, y
      FROM pixels AS p, uniforms AS u
    )
    
    -- 4. Select the final color values, ensuring they are in the correct order for rendering
    SELECT r, g, b
    FROM colors
    ORDER BY y, x;
  `;

  // --- Persist Code with localStorage ---
  const LOCAL_STORAGE_KEY = 'duckdb-shader-sql';
  const savedSql = localStorage.getItem(LOCAL_STORAGE_KEY);
  editor.setValue(savedSql || INITIAL_SHADER_SQL.trim());

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
    let prepared; // Will hold the currently valid prepared statement

    // --- Performance & Stats ---
    const stats = {
      fps: 0,
      prepareTime: 0,
      queryTime: 0,
      elapsedTime: 0,
    };
    let frameCount = 0;
    let lastStatsUpdate = performance.now();

    const updateStatsPanel = () => {
      // This function now only handles performance stats
      statsPanel.textContent = `FPS: ${stats.fps.toFixed(1)} | Prepare: ${stats.prepareTime.toFixed(2)}ms | Query: ${stats.queryTime.toFixed(2)}ms | Resolution: ${resolution.width}x${resolution.height} | Time: ${stats.elapsedTime.toFixed(2)}s`;
    };

    const updateErrorPanel = (errorMessage) => {
      errorPanel.textContent = errorMessage || '';
      errorPanel.style.display = errorMessage ? 'block' : 'none';
    };

    // --- Live Editor Logic ---
    let debounceTimer;
    const updateShader = async () => {
      const sql = editor.getValue();
      try {
        const t0 = performance.now();
        // "Prepare" the SQL: This parses, validates, and creates an optimized
        // execution plan for the query. It's the "compilation" step.
        const newPrepared = await c.prepare(sql);
        const t1 = performance.now();

        // If successful, replace the old statement and clear errors
        prepared = newPrepared;
        stats.prepareTime = t1 - t0;
        updateErrorPanel(null); // Clear any previous errors
      } catch (e) {
        // On failure, display the error and keep the old prepared statement
        updateErrorPanel(e.message);
        console.error("Shader compilation error:", e);
      }
      updateStatsPanel();
    };

    editor.on('change', () => {
      // Save the current content to localStorage on every change
      localStorage.setItem(LOCAL_STORAGE_KEY, editor.getValue());

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateShader, 300); // Debounce to avoid re-compiling on every keystroke
    });

    await updateShader(); // Initial shader compilation

    // --- Animation & Rendering Loop ---
    let imageData = ctx.createImageData(resolution.width, resolution.height);
    const startTime = performance.now();
    const iMouse = { x: resolution.width / 2, y: resolution.height / 2 };

    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      iMouse.x = event.clientX - rect.left;
      iMouse.y = event.clientY - rect.top;
    });

    /**
     * Sets up the logic for the draggable resize handle.
     * @param {HTMLElement} handleEl The resize handle element.
     * @param {HTMLElement} paneEl The grid pane element to resize.
     * @param {() => void} onResizeEnd A callback to execute when resizing is finished.
     */
    const setupResizer = (handleEl, paneEl, onResizeEnd) => {
      handleEl.addEventListener('mousedown', (e) => {
        e.preventDefault();

        const handleMouseMove = (moveEvent) => {
          const canvasRect = canvas.getBoundingClientRect();
          const newCanvasWidth = moveEvent.clientX - canvasRect.left;
          if (newCanvasWidth > 100) {
            paneEl.style.gridTemplateColumns = `${newCanvasWidth}px 6px 1fr`;
          }
        };

        const handleMouseUp = () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
          onResizeEnd();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      });
    };

    // Initialize the resizer with a callback to update canvas state
    setupResizer(resizeHandle, editorPane, () => {
      resolution = { width: canvas.clientWidth, height: canvas.clientHeight };
      canvas.width = resolution.width;
      canvas.height = resolution.height;
      imageData = ctx.createImageData(resolution.width, resolution.height);
    });

    const renderFrame = async (t) => {
      const iTime = (performance.now() - startTime) / 1000.0;
      stats.elapsedTime = iTime;

      const t0 = performance.now();
      // "Query" using the prepared statement: This executes the pre-compiled plan
      // with the latest parameters. It's the "run" step.
      const result = await prepared.query(
        resolution.width,
        resolution.height,
        iTime,
        iMouse.x,
        iMouse.y
      );
      const t1 = performance.now();
      stats.queryTime = t1 - t0;

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

      // --- FPS Calculation ---
      frameCount++;
      const now = performance.now();
      if (now - lastStatsUpdate > 1000) {
        stats.fps = frameCount / ((now - lastStatsUpdate) / 1000);
        lastStatsUpdate = now;
        frameCount = 0;
        updateStatsPanel();
      }

      requestAnimationFrame(renderFrame); // Loop
    };

    requestAnimationFrame(renderFrame); // Start the animation
  } catch (e) {
    console.error(e);
    statsPanel.textContent = `FATAL ERROR: ${e.message}`;
  }
};

main();