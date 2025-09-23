import { engine } from './duckdb_wasm_engine.js';

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
    zoomSelect: document.getElementById('zoom-select'),
    profileButton: document.getElementById('profile-button'),
    toggleEditorButton: document.getElementById('toggle-editor-button'),
    profileModal: document.getElementById('profile-modal'),
    profileContainer: document.getElementById('profile-container'),
    profileModalClose: document.querySelector('.modal-close-button'),
  };
  dom.versionSpan.textContent = `v${APP_VERSION}`;

  // Helper function to show startup progress in the stats panel
  const updateInitStatus = (message) => {
    dom.statsPanel.textContent = message;
  };
  updateInitStatus('Initializing...');

  let ctx = dom.canvas.getContext('2d', { willReadFrequently: true });
  let resolution = { width: dom.canvas.width, height: dom.canvas.height };
  let imageData; // Will be initialized within the main try block
  const iMouse = { x: resolution.width / 2, y: resolution.height / 2 };

  // --- Initialize CodeMirror ---
  const editor = CodeMirror.fromTextArea(dom.editorTextarea, {
    mode: 'text/x-sql',
    theme: 'material-darker',
    lineNumbers: true,
    lineWrapping: true,
  });

  const LOCAL_STORAGE_KEY = 'duckdb-shader-sql';
  const SHADER_SELECT_KEY = 'duckdb-shader-select-index';

  /**
   * Sets up all UI event listeners and initial states.
   * @param {object} options - Contains dependencies like the editor instance.
   */
  const setupUI = (options) => {
    const { editor, iMouse } = options;

    const SHADERS = engine.getShaders();
    const savedSql = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedIndex = localStorage.getItem(SHADER_SELECT_KEY) || 0;

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

    // --- Resolution & Zoom Dropdowns ---
    const RESOLUTIONS = [
      { name: 'Tiny (64x48)', width: 64, height: 48 },
      { name: 'Small (320x240)', width: 320, height: 240 },
      { name: 'Default (640x480)', width: 640, height: 480 },
      { name: 'Large (800x600)', width: 800, height: 600 },
    ];
    const DEFAULT_RESOLUTION_INDEX = 2;

    RESOLUTIONS.forEach((res, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = res.name;
      dom.resolutionSelect.appendChild(option);
    });
    dom.resolutionSelect.value = DEFAULT_RESOLUTION_INDEX;

    const ZOOM_LEVELS = [1, 2, 4, 8, 16];
    ZOOM_LEVELS.forEach(level => {
      const option = document.createElement('option');
      option.value = level;
      option.textContent = `${level}x Zoom`;
      dom.zoomSelect.appendChild(option);
    });
    dom.zoomSelect.value = 1;

    const updateCanvasSizeAndResolution = () => {
      const selectedRes = RESOLUTIONS[dom.resolutionSelect.value];
      const selectedZoom = parseInt(dom.zoomSelect.value, 10);

      resolution = { width: selectedRes.width, height: selectedRes.height };
      dom.canvas.width = resolution.width;
      dom.canvas.height = resolution.height;
      ctx = dom.canvas.getContext('2d', { willReadFrequently: true });

      const displayWidth = resolution.width * selectedZoom;
      dom.editorPane.style.gridTemplateColumns = `${displayWidth}px 6px 1fr`;

      setTimeout(() => editor.refresh(), 50);

      iMouse.x = resolution.width / 2;
      iMouse.y = resolution.height / 2;
    };

    dom.resolutionSelect.addEventListener('change', updateCanvasSizeAndResolution);
    dom.zoomSelect.addEventListener('change', updateCanvasSizeAndResolution);

    // Set initial size
    updateCanvasSizeAndResolution();
  };

  // Initialize all UI components
  setupUI({ editor, iMouse });

  try {
    await engine.initialize(updateInitStatus);

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
    const updateShader = async (isInitialCompile = false) => {
      const sql = editor.getValue();
      updateInitStatus('Compiling shader...');
      try {
        const t0 = performance.now();
        // "Prepare" the SQL: This parses, validates, and creates an optimized
        // execution plan for the query. It's the "compilation" step.
        const newPrepared = await engine.prepare(sql);
        const t1 = performance.now();

        // If successful, replace the old statement and clear errors
        prepared = newPrepared;
        stats.prepareTime = t1 - t0;
        stats.errorMessage = null;
        updateErrorPanel();
      } catch (e) {
        // On failure, display the error and keep the old prepared statement
        stats.errorMessage = e.message;
        // Only log to console if it's not the very first load, to keep the console clean.
        if (!isInitialCompile) {
            console.error("Shader compilation error:", e);
        }
        updateErrorPanel(); // Immediately update the UI to show the error
        // Return false to indicate failure.
        return false;
      }
      // Return true to indicate success.
      return true;
    };

    // --- Profiler Logic ---
    dom.profileButton.addEventListener('click', async () => {
      if (!prepared) {
        console.error("Cannot profile: No valid shader is compiled.");
        return;
      }
      dom.profileButton.disabled = true;
      dom.profileButton.textContent = 'Profiling...';
      try {
        console.log('[main.js] Profile button clicked. Calling engine.profile().');
        updateInitStatus('Profiling... (check console for output)');
        const profileData = await engine.profile(editor.getValue(), [
          resolution.width, resolution.height,
          stats.elapsedTime, iMouse.x, iMouse.y
        ]);
        console.log('[main.js] engine.profile() returned successfully.');
        
        // Parse and color-code the plan before displaying it.
        const formattedPlan = colorCodeQueryPlan(profileData);
        dom.profileContainer.innerHTML = `<pre>${formattedPlan}</pre>`;
        dom.profileModal.style.display = 'flex';

        // The status panel is now less important for profiling feedback
        updateInitStatus('Profiling complete.');
        setTimeout(() => updateStatsPanel(), 3000);
      } catch (e) {
        console.error("Profiling failed:", e);
        updateInitStatus(`Profiling failed: ${e.message}`);
        setTimeout(() => updateStatsPanel(), 3000);
      } finally {
        // Ensure the button is always re-enabled
        dom.profileButton.disabled = false;
        dom.profileButton.textContent = 'Profile';
      }
    });

    /**
     * Parses the EXPLAIN ANALYZE output and color-codes the timing information.
     * @param {string} planText The raw text from EXPLAIN ANALYZE.
     * @returns {string} An HTML string with color-coded timings.
     */
    const colorCodeQueryPlan = (planText) => {
      // This regex is designed to find timing information in two common formats:
      // 1. The simple form, e.g., `(0.00s)`
      // 2. The detailed form, e.g., `(actual time: 0.000s)`
      return planText.replace(/(\(actual time: ([\d.]+)s|\(([\d.]+)s\))/g, (match, _, timeStr1, timeStr2) => {
        const time = parseFloat(timeStr1 || timeStr2);
        let colorClass = 'time-good'; // Default to green for fast operations
        if (time > 0.1) {
          colorClass = 'time-hot'; // Red for times > 100ms
        } else if (time > 0.01) {
          colorClass = 'time-warm'; // Orange for times > 10ms
        }
        return `<span class="${colorClass}">${match}</span>`;
      });
    };

    // Add listeners to close the modal
    const closeModal = () => dom.profileModal.style.display = 'none';
    dom.profileModalClose.addEventListener('click', closeModal);
    dom.profileModal.addEventListener('click', (e) => {
        if (e.target === dom.profileModal) closeModal(); // Close only if clicking the overlay
    });

    // Add listener for the ESC key to close the modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.profileModal.style.display !== 'none') {
        closeModal();
      }
    });

    editor.on('change', async () => {
      // Save the current content to localStorage on every change
      localStorage.setItem(LOCAL_STORAGE_KEY, editor.getValue());
      localStorage.setItem(SHADER_SELECT_KEY, dom.shaderSelect.value);

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => updateShader(false), 300); // Debounce to avoid re-compiling on every keystroke
    });

    updateInitStatus('Compiling initial shader...'); // Pass true for the initial compile
    // Initial shader compilation. If it fails, we stop before starting the render loop.
    const initialCompileSuccess = await updateShader(true);
    if (!initialCompileSuccess) {
      updateErrorPanel(); // Ensure the error is displayed.
      throw new Error("Initial shader compilation failed. Please fix the SQL and refresh.");
    }

    // --- Animation & Rendering Loop ---
    let imageData = ctx.createImageData(resolution.width, resolution.height); // ctx is from canvas
    let startTime = performance.now();
    let lastR, lastG, lastB; // Store the last rendered color data

    dom.canvas.addEventListener('mousemove', (event) => {
      const rect = dom.canvas.getBoundingClientRect();

      // Mouse position relative to the displayed canvas element
      const mouseXOnCanvas = event.clientX - rect.left;
      const mouseYOnCanvas = event.clientY - rect.top;

      // Calculate the scaling factor between display size and internal resolution
      const scaleX = resolution.width / rect.width;
      const scaleY = resolution.height / rect.height;

      // Scale the mouse coordinates to the internal resolution space for the shader
      const x = Math.floor(mouseXOnCanvas * scaleX);
      const y = Math.floor(mouseYOnCanvas * scaleY);
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

    // This function is called when the resizer handle is used.
    const onResizeEnd = () => {
      // When manually resizing, we don't use zoom. The display size IS the resolution.
      resolution = { width: dom.canvas.clientWidth, height: dom.canvas.clientHeight };
      dom.canvas.width = resolution.width;
      dom.canvas.height = resolution.height;
      // Re-get the context, as resizing can invalidate it.
      ctx = dom.canvas.getContext('2d', { willReadFrequently: true });

      // Reset the default mouse position to the new center
      iMouse.x = resolution.width / 2;
      iMouse.y = resolution.height / 2;
    };
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
     * @param {ImageData} targetImageData The ImageData buffer for this specific frame.
     */
    const drawResultToCanvas = (resultTable, targetImageData) => {
      // Get direct access to the underlying typed arrays for each column.
      // This is significantly faster than converting to JS objects.
      const r = resultTable.getChild('r').toArray();
      const g = resultTable.getChild('g').toArray();
      const b = resultTable.getChild('b').toArray();
      // Store the latest color data for the pixel inspector
      lastR = r; // This can still be global for the inspector
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

      try {
        // Capture the resolution at the start of the frame to prevent race conditions.
        const frameWidth = resolution.width;
        const frameHeight = resolution.height;

        // Create a fresh ImageData buffer that is local to this frame.
        const localImageData = ctx.createImageData(frameWidth, frameHeight);

        const t0 = performance.now();
        const result = await prepared.query(
          frameWidth,
          frameHeight,
          iTime,
          iMouse.x,
          iMouse.y
        );
        const t1 = performance.now();
        stats.queryTime = t1 - t0;

        drawResultToCanvas(result, localImageData);
        // If the query was successful, clear any previous runtime error.
        if (stats.errorMessage && !stats.errorMessage.startsWith('Compilation')) stats.errorMessage = null;
      } catch (e) {
        console.error("Query runtime error:", e);
        stats.errorMessage = `Runtime Error:\n${e.message}`;
        isPlaying = false; // Stop the animation on a runtime error
        dom.playToggleButton.innerHTML = '▶ Play';
      }

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