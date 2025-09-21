import * as duckdb from '@duckdb/duckdb-wasm';

const APP_VERSION = '0.1.0';

const main = async () => {
  // --- DOM Elements ---
  const versionSpan = document.getElementById('version-span');
  versionSpan.textContent = `v${APP_VERSION}`;

  const canvas = document.getElementById('shader-canvas');
  const editorPane = document.querySelector('.editor-pane');
  const editorTextarea = document.getElementById('sql-editor');
  const statsPanel = document.getElementById('stats-panel');
  const errorPanel = document.getElementById('error-panel');
  const resizeHandle = document.getElementById('resize-handle');
  const restartButton = document.getElementById('restart-button');
  const playToggleButton = document.getElementById('play-toggle-button');
  const shaderSelect = document.getElementById('shader-select');
  const toggleEditorButton = document.getElementById('toggle-editor-button');

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let resolution = { width: canvas.width, height: canvas.height };

  // --- Initialize CodeMirror ---
  const editor = CodeMirror.fromTextArea(editorTextarea, {
    // This 'mode' property tells CodeMirror to use its SQL syntax highlighter.
    mode: 'text/x-sql',
    theme: 'material-darker',
    lineNumbers: true,
    lineWrapping: true,
  });

  // Move the error panel to be part of the CodeMirror DOM structure for correct layout
  // editor.getWrapperElement().parentNode.appendChild(errorPanel);

  // --- Example Shaders ---
  const SHADERS = [
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
  ];

  // --- Persist Code with localStorage ---
  const LOCAL_STORAGE_KEY = 'duckdb-shader-sql';
  const SHADER_SELECT_KEY = 'duckdb-shader-select-index';
  const savedSql = localStorage.getItem(LOCAL_STORAGE_KEY);
  const savedIndex = localStorage.getItem(SHADER_SELECT_KEY) || 0;

  // --- Populate Shader Dropdown ---
  SHADERS.forEach((shader, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = shader.name;
    shaderSelect.appendChild(option);
  });
  shaderSelect.value = savedIndex;
  editor.setValue(savedSql || SHADERS[savedIndex].sql.trim());

  shaderSelect.addEventListener('change', () => {
    editor.setValue(SHADERS[shaderSelect.value].sql.trim());
  });
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
      localStorage.setItem(SHADER_SELECT_KEY, shaderSelect.value);

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateShader, 300); // Debounce to avoid re-compiling on every keystroke
    });

    await updateShader(); // Initial shader compilation

    // --- Animation & Rendering Loop ---
    let imageData = ctx.createImageData(resolution.width, resolution.height);
    let startTime = performance.now();
    const iMouse = { x: resolution.width / 2, y: resolution.height / 2 };

    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      iMouse.x = event.clientX - rect.left;
      iMouse.y = event.clientY - rect.top;
    });

    const onResizeEnd = () => {
      resolution = { width: canvas.clientWidth, height: canvas.clientHeight };
      canvas.width = resolution.width;
      canvas.height = resolution.height;
      imageData = ctx.createImageData(resolution.width, resolution.height);
    };

    // --- Toggle Editor Logic ---
    toggleEditorButton.addEventListener('click', () => {
      editorPane.classList.toggle('editor-hidden');
      // After the layout change, we need to update the canvas resolution.
      // A small timeout ensures the browser has finished the reflow.
      setTimeout(() => {
        onResizeEnd();
        // CodeMirror needs to be refreshed to render correctly after being hidden and shown.
        editor.refresh();
      }, 50);
    });

    // --- Play/Stop Controls ---
    let isPlaying = true;
    restartButton.addEventListener('click', () => {
      startTime = performance.now(); // Reset the elapsed time
      if (!isPlaying) {
        // If paused, render a single frame to show the reset.
        // Wrap in an async function to handle the promise correctly.
        (async () => {
          try {
            await renderFrame();
          } catch (e) {
            console.error('Error during single frame render on restart:', e);
          }
        })();
      }
    });

    playToggleButton.addEventListener('click', () => {
      isPlaying = !isPlaying; // Toggle the state
      if (isPlaying) {
        playToggleButton.innerHTML = '❚❚ Stop';
        // We also reset the stats timer to avoid a large jump in FPS calculation.
        lastStatsUpdate = performance.now();
        requestAnimationFrame(renderFrame); // Kickstart the loop if it was stopped
      } else {
        playToggleButton.innerHTML = '▶ Play';
      }
    });

    /**
     * Sets up the logic for the draggable resize handle.
     * @param {HTMLElement} handleEl The resize handle element.
     * @param {HTMLElement} paneEl The grid pane element to resize.
     */
    const setupResizer = (handleEl, paneEl) => {
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
    setupResizer(resizeHandle, editorPane);

    /**
     * Efficiently transfers query result data to the canvas ImageData.
     * @param {import('@apache/arrow').Table} resultTable The Arrow Table from DuckDB.
     * @param {ImageData} targetImageData The canvas ImageData to modify.
     */
    const drawResultToCanvas = (resultTable, targetImageData) => {
      // Get direct access to the underlying typed arrays for each column.
      // This is significantly faster than converting to JS objects.
      const r = resultTable.getChild('r').toArray();
      const g = resultTable.getChild('g').toArray();
      const b = resultTable.getChild('b').toArray();

      for (let i = 0; i < r.length; i++) {
        const pixelIndex = i * 4;
        targetImageData.data[pixelIndex + 0] = r[i] * 255; // Red
        targetImageData.data[pixelIndex + 1] = g[i] * 255; // Green
        targetImageData.data[pixelIndex + 2] = b[i] * 255; // Blue
        targetImageData.data[pixelIndex + 3] = 255;        // Alpha
      }
      ctx.putImageData(targetImageData, 0, 0);
    };

    const renderFrame = async (t) => {
      const iTime = (performance.now() - startTime) / 1000.0;
      stats.elapsedTime = iTime;

      const t0 = performance.now();
      const result = await prepared.query(
        resolution.width,
        resolution.height,
        iTime,
        iMouse.x,
        iMouse.y
      );
      const t1 = performance.now();
      stats.queryTime = t1 - t0;

      drawResultToCanvas(result, imageData);

      // --- FPS Calculation ---
      frameCount++;
      const now = performance.now();
      if (now - lastStatsUpdate > 1000) {
        stats.fps = frameCount / ((now - lastStatsUpdate) / 1000);
        lastStatsUpdate = now;
        frameCount = 0;
        updateStatsPanel();
      }

      if (isPlaying) {
        requestAnimationFrame(renderFrame); // Continue the loop only if playing
      }
    };

    requestAnimationFrame(renderFrame); // Start the animation
  } catch (e) {
    console.error(e);
    statsPanel.textContent = `FATAL ERROR: ${e.message}`;
  }
};

main();