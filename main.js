import * as duckdb from '@duckdb/duckdb-wasm';
import { SHADERS } from './shaders.js';

console.log('Executing main.js - Debug Version: 1.4.0');

const APP_VERSION = '1.1.0';

const main = async () => {
  // --- DOM Elements ---
  const dom = {
    versionSpan: document.getElementById('version-span'),
    canvas: document.getElementById('shader-canvas'),
    editorPane: document.querySelector('.editor-pane'),
    editorTextarea: document.getElementById('sql-editor'),
    statsPanel: document.getElementById('stats-panel'),
    errorPanel: document.getElementById('error-panel'),
    resizeHandle: document.getElementById('resize-handle'),
    restartButton: document.getElementById('restart-button'),
    playToggleButton: document.getElementById('play-toggle-button'),
    shaderSelect: document.getElementById('shader-select'),
    resolutionSelect: document.getElementById('resolution-select'),
    toggleEditorButton: document.getElementById('toggle-editor-button'),
  };
  dom.versionSpan.textContent = `v${APP_VERSION}`;

  // Helper function to show startup progress in the stats panel
  const updateInitStatus = (message) => {
    dom.statsPanel.textContent = message;
  };
  updateInitStatus('Initializing...');

  const ctx = dom.canvas.getContext('2d', { willReadFrequently: true });
  let resolution = { width: dom.canvas.width, height: dom.canvas.height };
  let imageData; // Will be initialized within the main try block

  // This function is called whenever the canvas size changes.
  const onResizeEnd = () => {
    resolution = { width: dom.canvas.clientWidth, height: dom.canvas.clientHeight };
    dom.canvas.width = resolution.width;
    dom.canvas.height = resolution.height;
    imageData = ctx.createImageData(resolution.width, resolution.height);
  };

  // --- Initialize CodeMirror ---
  const editor = CodeMirror.fromTextArea(dom.editorTextarea, {
    // This 'mode' property tells CodeMirror to use its SQL syntax highlighter.
    mode: 'text/x-sql',
    theme: 'material-darker',
    lineNumbers: true,
    lineWrapping: true,
  });

  // Move the error panel to be part of the CodeMirror DOM structure for correct layout
  // editor.getWrapperElement().parentNode.appendChild(errorPanel);

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
    dom.shaderSelect.appendChild(option);
  });
  dom.shaderSelect.value = savedIndex;
  editor.setValue(savedSql || SHADERS[savedIndex].sql.trim());

  dom.shaderSelect.addEventListener('change', () => {
    editor.setValue(SHADERS[dom.shaderSelect.value].sql.trim());
  });

  // --- Populate Resolution Dropdown ---
  const RESOLUTIONS = [
    { name: 'Tiny (64x48)', width: 64 },
    { name: 'Small (320x240)', width: 320 },
    { name: 'Default (640x480)', width: 640 },
    { name: 'Large (800x600)', width: 800 },
  ];
  const DEFAULT_RESOLUTION_INDEX = 2;

  RESOLUTIONS.forEach((res, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = res.name;
    dom.resolutionSelect.appendChild(option);
  });
  dom.resolutionSelect.value = DEFAULT_RESOLUTION_INDEX;

  dom.resolutionSelect.addEventListener('change', () => {
    const selectedRes = RESOLUTIONS[dom.resolutionSelect.value];
    // Update the grid layout to the new fixed width for the canvas
    dom.editorPane.style.gridTemplateColumns = `${selectedRes.width}px 6px 1fr`;
    // A small timeout ensures the browser has finished the reflow before we update the canvas
    setTimeout(() => {
      onResizeEnd();
    }, 50);
  });

  try {
    updateInitStatus('Initializing DuckDB-WASM...');
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

    updateInitStatus('Connecting to database...');
    // Establish a persistent connection
    const c = await db.connect();

    let prepared; // Will hold the currently valid prepared statement

    // --- Performance & Stats ---
    const stats = {
      fps: 0,
      prepareTime: 0,
      queryTime: 0,
      errorMessage: null,
      pixelX: 0,
      pixelY: 0,
      pixelR: 0,
      pixelG: 0,
      pixelB: 0,
      elapsedTime: 0,
    };
    let frameCount = 0;
    let lastStatsUpdate = performance.now();

    const updateStatsPanel = () => {
      // This function now only handles performance stats
      let statsText = `FPS: ${stats.fps.toFixed(1)} | Prepare: ${stats.prepareTime.toFixed(2)}ms | Query: ${stats.queryTime.toFixed(2)}ms | Resolution: ${resolution.width}x${resolution.height} | Time: ${stats.elapsedTime.toFixed(2)}s`;
      if (stats.pixelR !== null) {
        statsText += ` | Pixel (${stats.pixelX}, ${stats.pixelY}): R=${stats.pixelR.toFixed(3)} G=${stats.pixelG.toFixed(3)} B=${stats.pixelB.toFixed(3)}`;
      }
      dom.statsPanel.textContent = statsText;
      updateErrorPanel();
    };

    const updateErrorPanel = () => {
      if (stats.errorMessage) {
        dom.errorPanel.textContent = `Compilation Error:\n${stats.errorMessage}`;
        dom.errorPanel.className = 'error';
      } else {
        dom.errorPanel.textContent = `Compilation Successful in ${stats.prepareTime.toFixed(2)}ms`;
        dom.errorPanel.className = 'success';
      }
    };

    // --- Live Editor Logic ---
    let debounceTimer;
    const updateShader = async () => {
      const sql = editor.getValue();
      updateInitStatus('Compiling shader...');
      try {
        const t0 = performance.now();
        // "Prepare" the SQL: This parses, validates, and creates an optimized
        // execution plan for the query. It's the "compilation" step.
        const newPrepared = await c.prepare(sql);
        const t1 = performance.now();

        // If successful, replace the old statement and clear errors
        prepared = newPrepared;
        stats.prepareTime = t1 - t0;
        stats.errorMessage = null;
        updateErrorPanel();
      } catch (e) {
        // On failure, display the error and keep the old prepared statement
        stats.errorMessage = e.message;
        console.error("Shader compilation error:", e);
        // Return false to indicate failure.
        return false;
      }
      // Return true to indicate success.
      return true;
    };

    editor.on('change', () => {
      // Save the current content to localStorage on every change
      localStorage.setItem(LOCAL_STORAGE_KEY, editor.getValue());
      localStorage.setItem(SHADER_SELECT_KEY, dom.shaderSelect.value);

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateShader, 300); // Debounce to avoid re-compiling on every keystroke
    });

    updateInitStatus('Compiling initial shader...');
    // Initial shader compilation. If it fails, we stop before starting the render loop.
    const initialCompileSuccess = await updateShader();
    if (!initialCompileSuccess) {
      updateErrorPanel(); // Ensure the error is displayed.
      throw new Error("Initial shader compilation failed. Please fix the SQL and refresh.");
    }

    // --- Animation & Rendering Loop ---
    let imageData = ctx.createImageData(resolution.width, resolution.height); // ctx is from canvas
    let startTime = performance.now();
    let lastR, lastG, lastB; // Store the last rendered color data
    const iMouse = { x: resolution.width / 2, y: resolution.height / 2 };

    dom.canvas.addEventListener('mousemove', (event) => {
      const rect = dom.canvas.getBoundingClientRect();
      const x = Math.floor(event.clientX - rect.left);
      const y = Math.floor(event.clientY - rect.top);
      iMouse.x = x;
      iMouse.y = y;

      // Update pixel inspector stats if we have rendered data
      if (lastR && x >= 0 && x < resolution.width && y >= 0 && y < resolution.height) {
        const index = y * resolution.width + x;
        stats.pixelX = x;
        stats.pixelY = y;
        stats.pixelR = lastR[index];
        stats.pixelG = lastG[index];
        stats.pixelB = lastB[index];
      } else {
        stats.pixelR = null; // Indicate mouse is outside the valid area
      }
      // Directly update the UI on mouse move for real-time feedback
      updateStatsPanel();
    });

    // --- Toggle Editor Logic ---
    dom.toggleEditorButton.addEventListener('click', () => {
      dom.editorPane.classList.toggle('editor-hidden');
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
    dom.restartButton.addEventListener('click', () => {
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

    dom.playToggleButton.addEventListener('click', () => {
      isPlaying = !isPlaying; // Toggle the state
      if (isPlaying) {
        dom.playToggleButton.innerHTML = '❚❚ Stop';
        // We also reset the stats timer to avoid a large jump in FPS calculation.
        lastStatsUpdate = performance.now();
        requestAnimationFrame(renderFrame); // Kickstart the loop if it was stopped
      } else {
        dom.playToggleButton.innerHTML = '▶ Play';
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
          const canvasRect = dom.canvas.getBoundingClientRect();
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
    setupResizer(dom.resizeHandle, dom.editorPane);

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
      // Store the latest color data for the pixel inspector
      lastR = r;
      lastG = g;
      lastB = b;

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

      // If there is no valid prepared statement (e.g., due to a compilation error),
      // skip rendering but keep the animation loop alive.
      if (!prepared) {
        // Still update stats so the UI doesn't get stuck on "Initializing..."
        updateStatsPanel();
        // Keep the animation loop going to allow for live editing.
        if (isPlaying) requestAnimationFrame(renderFrame); 
        return;
      }

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
      // Calculate FPS, but only update the stats object once per second
      if (now - lastStatsUpdate > 1000) {
        stats.fps = frameCount / ((now - lastStatsUpdate) / 1000);
        lastStatsUpdate = now;
        frameCount = 0;
      }
      // Update the stats panel on every frame for real-time feedback
      updateStatsPanel();

      if (isPlaying) {
        requestAnimationFrame(renderFrame); // Continue the loop only if playing
      }
    };

    requestAnimationFrame(renderFrame); // Start the animation
  } catch (e) {
    console.error(e);
    dom.statsPanel.textContent = `FATAL ERROR: ${e.message}`;
  }
};

main();