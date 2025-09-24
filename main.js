console.log('Executing main.js - Debug Version: 1.4.0');

const APP_VERSION = '1.1.0';

const main = async (engine) => {
  // --- DOM Elements ---
  const dom = {
    engineSelect: document.getElementById('engine-select'),
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
    settingsButton: document.getElementById('settings-button'),
    settingsModal: document.getElementById('settings-modal'),
    settingsModalClose: document.querySelector('#settings-modal .modal-close-button'),
    clickhouseSettings: document.getElementById('clickhouse-settings'),
    saveSettingsButton: document.getElementById('save-settings-button'),
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

  const RESOLUTIONS = [
    { name: 'Tiny (64x48)', width: 64, height: 48 },
    { name: 'Small (320x240)', width: 320, height: 240 },
    { name: 'Default (640x480)', width: 640, height: 480 },
    { name: 'Large (800x600)', width: 800, height: 600 },
  ];
  const ZOOM_LEVELS = [1, 2, 4, 8, 16];

  /**
   * Parses performance hints from a SQL string and applies them to the UI.
   * @param {string} sql The SQL content to parse for hints.
   * @returns {boolean} True if any settings were changed, otherwise false.
   */
  const applyPerformanceHints = (sql) => {
    let settingsChanged = false;
    const runHintMatch = sql.match(/--\s*@run:\s*(.*)/);
    if (runHintMatch) {
      const hints = runHintMatch[1];
      const resolutionMatch = hints.match(/resolution=([^,]+)/);
      const zoomMatch = hints.match(/zoom=([\d]+)/);

      if (resolutionMatch) {
        const resValue = resolutionMatch[1].trim();
        const customSizeMatch = resValue.match(/^(\d+)x(\d+)$/);

        if (customSizeMatch) {
          const width = parseInt(customSizeMatch[1], 10);
          const height = parseInt(customSizeMatch[2], 10);
          const customResName = `Custom (${width}x${height})`;
          const option = document.createElement('option');
          option.value = RESOLUTIONS.length;
          option.textContent = customResName;
          dom.resolutionSelect.appendChild(option);
          dom.resolutionSelect.value = option.value;
          RESOLUTIONS.push({ name: customResName, width, height });
          settingsChanged = true;
        } else {
          const resIndex = RESOLUTIONS.findIndex(r => r.name.startsWith(resValue));
          if (resIndex !== -1 && dom.resolutionSelect.value != resIndex) {
            dom.resolutionSelect.value = resIndex;
            settingsChanged = true;
          }
        }
      }

      if (zoomMatch) {
        const zoomValue = parseInt(zoomMatch[1].trim(), 10);
        if (ZOOM_LEVELS.includes(zoomValue) && dom.zoomSelect.value != zoomValue) {
          dom.zoomSelect.value = zoomValue;
          settingsChanged = true;
        }
      }
    }
    return settingsChanged;
  };

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

  /**
   * Sets up all UI event listeners and initial states.
   * @param {object} options - Contains dependencies like the editor instance.
   */
  const setupUI = (options) => {
    const { editor, iMouse } = options;

    const SHADERS = engine.getShaders();
    const savedSql = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedIndex = localStorage.getItem(SHADER_SELECT_KEY) || 0;

    /**
     * Loads a shader, sets its SQL in the editor, and applies any performance hints.
     * @param {number} shaderIndex The index of the shader to load.
     */
    const loadShader = (shaderIndex) => {
      const shader = SHADERS[shaderIndex];
      if (!shader) return;

      const sql = shader.sql.trim();
      editor.setValue(sql);

      // After potentially changing dropdowns, trigger the canvas update
      if (applyPerformanceHints(sql)) {
        updateCanvasSizeAndResolution();
      }
    };

    dom.shaderSelect.innerHTML = ''; // Clear previous options
    SHADERS.forEach((shader, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = shader.name;
      dom.shaderSelect.appendChild(option);
    });

    dom.shaderSelect.addEventListener('change', () => {
      loadShader(dom.shaderSelect.value);
    });

    // --- Resolution & Zoom Dropdowns ---
    const DEFAULT_RESOLUTION_INDEX = 2;

    RESOLUTIONS.forEach((res, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = res.name;
      dom.resolutionSelect.appendChild(option);
    });
    dom.resolutionSelect.value = DEFAULT_RESOLUTION_INDEX;

    ZOOM_LEVELS.forEach(level => {
      const option = document.createElement('option');
      option.value = level;
      option.textContent = `${level}x Zoom`;
      dom.zoomSelect.appendChild(option);
    });
    dom.zoomSelect.value = 1;

    dom.resolutionSelect.addEventListener('change', updateCanvasSizeAndResolution);
    dom.zoomSelect.addEventListener('change', updateCanvasSizeAndResolution);

    // Set initial size
    dom.shaderSelect.value = savedIndex;
    if (savedSql) {
      editor.setValue(savedSql);
      // On load with saved SQL, parse hints and update if necessary
      if (applyPerformanceHints(savedSql)) {
        updateCanvasSizeAndResolution();
      } else {
        // Otherwise, just use the default/saved resolution
        updateCanvasSizeAndResolution();
      }
    } else {
      loadShader(savedIndex); // Load default shader and apply its hints
    }
  };

  // Initialize all UI components
  try {

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
        // Distinguish between compilation and runtime errors for clarity.
        if (stats.errorMessage.startsWith('Runtime Error')) {
          dom.errorPanel.textContent = stats.errorMessage;
        } else {
          dom.errorPanel.textContent = `Compilation Error:\n${stats.errorMessage}`;
        }
        dom.errorPanel.className = 'error';
      } else {
        dom.errorPanel.textContent = `Compilation Successful in ${stats.prepareTime.toFixed(2)}ms`;
        dom.errorPanel.className = 'success';
      }
    };

    // --- Live Editor Logic ---
    let debounceTimer;
    let hasCompilationError = false;
    let isPlaying = true;
    let engineReady = false;
    let wasPlayingBeforeError = true; // Assume it's playing initially
    const updateShader = async (isInitialCompile = false) => {
      const sql = editor.getValue();
      
      if (!engineReady) return false; // Do not attempt to compile if engine is not ready
      
      // --- Dynamic Hint Parsing ---

      updateInitStatus('Compiling shader...');
      // Set the compiling flag. Any subsequent renderFrame calls will now pause.
      hasCompilationError = true;

      try {
        const t0 = performance.now();
        // "Prepare" the SQL: This parses, validates, and creates an optimized
        // execution plan for the query. It's the "compilation" step.
        const newPrepared = await engine.prepare(sql);
        const t1 = performance.now();

        // If successful, replace the old statement and clear errors
        prepared = newPrepared;
        stats.prepareTime = t1 - t0;
        hasCompilationError = false;
        stats.errorMessage = null;
        updateErrorPanel();

        // If it was playing before the error, resume it automatically.
        if (wasPlayingBeforeError && !isPlaying) {
          isPlaying = true;
          dom.playToggleButton.innerHTML = '❚❚ Stop';
          requestAnimationFrame(renderFrame); // Kickstart the loop
        }
      } catch (e) {
        // On failure, display the error and keep the old prepared statement
        wasPlayingBeforeError = isPlaying; // Remember the state when the error occurred
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
      const selectedEngine = dom.engineSelect.value;

      if (selectedEngine === 'duckdb_wasm') {
        // DuckDB provides detailed timing, so we color-code it.
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
      } else if (selectedEngine === 'clickhouse') {
        // ClickHouse EXPLAIN PLAN is structural. We can highlight keywords for readability.
        return planText.replace(/(Expression|Filter|Sort|Sorting|Join|Projection|ReadFromSystemNumbers)/g, (match) => {
          let colorClass = 'time-warm'; // Use orange for keywords
          return `<span class="${colorClass}">${match}</span>`;
        });
      } else {
        // For any other engine, return the plain text.
        return planText;
      }
    };

    // --- Dynamic Hint Parsing on editor change ---
    const handleEditorChange = () => {
      if (applyPerformanceHints(editor.getValue())) {
        updateCanvasSizeAndResolution();
      }
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

    // --- Settings Modal Logic ---
    const openSettingsModal = () => {
      const selectedEngine = dom.engineSelect.value;
      if (selectedEngine === 'clickhouse') {
        // Load saved settings into the form
        const storedSettings = JSON.parse(localStorage.getItem('clickhouse-settings')) || {};
        document.getElementById('ch-url').value = storedSettings.url || '';
        document.getElementById('ch-user').value = storedSettings.username || '';
        document.getElementById('ch-password').value = storedSettings.password || '';

        dom.clickhouseSettings.style.display = 'block';
        dom.settingsModal.style.display = 'flex';
      } else {
        alert('No specific settings for the DuckDB WASM engine.');
      }
    };

    const closeSettingsModal = () => dom.settingsModal.style.display = 'none';

    dom.settingsButton.addEventListener('click', openSettingsModal);
    dom.settingsModalClose.addEventListener('click', closeSettingsModal);
    dom.settingsModal.addEventListener('click', (e) => {
      if (e.target === dom.settingsModal) closeSettingsModal();
    });

    dom.saveSettingsButton.addEventListener('click', () => {
      const settings = {
        url: document.getElementById('ch-url').value,
        username: document.getElementById('ch-user').value,
        password: document.getElementById('ch-password').value,
      };
      localStorage.setItem('clickhouse-settings', JSON.stringify(settings));
      alert('Settings saved. The application will now reload.');
      window.location.reload();
    });

    editor.on('change', async () => {
      // Save the current content to localStorage on every change
      localStorage.setItem(LOCAL_STORAGE_KEY, editor.getValue());
      localStorage.setItem(SHADER_SELECT_KEY, dom.shaderSelect.value);

      // We separate hint parsing from shader compilation for responsiveness.
      handleEditorChange();

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => updateShader(false), 300); // Debounce to avoid re-compiling on every keystroke
    });

    // --- Final Initialization Steps ---
    console.log('[Init] Setting up UI and event listeners...');
    setupUI({ editor, iMouse });
    console.log('[Init] UI setup complete.');

    console.log('[Init] Initializing database engine...');
    updateInitStatus('Compiling initial shader...'); // Pass true for the initial compile
    await engine.initialize(updateInitStatus);
    engineReady = true; // Signal that the engine is now ready for use
    // Initial shader compilation. If it fails, we stop before starting the render loop.
    const initialCompileSuccess = await updateShader(true);
    if (!initialCompileSuccess) {
      updateErrorPanel(); // Ensure the error is displayed.
      throw new Error("Initial shader compilation failed. Please fix the SQL and refresh.");
    }

    // --- Animation & Rendering Loop ---
    let imageData = ctx.createImageData(resolution.width, resolution.height); // ctx is from canvas
    let startTime = performance.now();
    let lastGoodResult = null;
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

    /**
     * A synchronous function to redraw the canvas with the last known good result.
     * Used for immediate UI updates after resizing.
     * @param {import('@apache/arrow').Table} resultTable The last successful query result.
     */
    const forceRedraw = (resultTable) => {
      const localImageData = ctx.createImageData(resolution.width, resolution.height);
      drawResultToCanvas(resultTable, localImageData);
    };

    const renderFrame = async (t) => {
      const iTime = (performance.now() - startTime) / 1000.0;

      // If there is no valid prepared statement (e.g., due to a compilation error),
      // skip rendering but keep the animation loop alive.
      if (!prepared || hasCompilationError) {
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
        lastGoodResult = result; // Store the successful result
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

/**
 * Dynamically loads and initializes the selected database engine.
 */
const initializeEngine = async () => {
    const engineSelect = document.getElementById('engine-select');
    const selectedEngine = engineSelect.value;

    try {
        const engineModule = await import(`./${selectedEngine}_engine.js`);
        await main(engineModule.engine);
    } catch (e) {
        console.error(`Failed to load engine '${selectedEngine}':`, e);
        document.getElementById('stats-panel').textContent = `FATAL: Could not load engine. ${e.message}`;
    }
};

document.getElementById('engine-select').addEventListener('change', () => window.location.reload());
initializeEngine();