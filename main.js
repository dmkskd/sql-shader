import { dom, setupUI, updateInitStatus, updateStatsPanel, updateErrorPanel, openSettingsModal, updateProfileButtonText } from './ui_manager.js';
import mermaid from 'mermaid';
import { ShaderManager } from './shader_manager.js';

import { PerformanceMonitor } from './performance_monitor.js';
console.log('Executing main.js - Debug Version: 1.4.0');

const APP_VERSION = '1.1.0';
const STORAGE_PREFIX = 'pixelql.';

const main = async (engine) => {
  dom.versionSpan.textContent = `v${APP_VERSION}`; // Mermaid is now initialized in index.html

  updateInitStatus('Initializing...');

  let ctx = dom.canvas.getContext('2d', { willReadFrequently: true });
  let resolution = { width: dom.canvas.width, height: dom.canvas.height };
  let imageData; // Will be initialized within the main try block
  // Initialize the performance monitor with its canvas
  const perfMonitor = new PerformanceMonitor(document.getElementById('timing-chart-canvas'));

  const iMouse = { x: resolution.width / 2, y: resolution.height / 2 };

  // --- Initialize CodeMirror ---
  const editor = CodeMirror.fromTextArea(dom.editorTextarea, {
    mode: 'text/x-sql',
    theme: 'material-darker',
    lineNumbers: true,
    lineWrapping: true,
  });

  // Initialize all UI components
  try {
    // Use engine-specific keys to prevent loading incompatible shaders after switching engines.
    const engineName = dom.engineSelect.value;
    const LOCAL_STORAGE_KEY = `${STORAGE_PREFIX}sql-for-${engineName}`;
    const SHADER_SELECT_KEY = `${STORAGE_PREFIX}shader-index-for-${engineName}`;
    const RESOLUTIONS = [
      { name: 'Tiny (64x48)', width: 64, height: 48 },
      { name: 'Small (320x240)', width: 320, height: 240 },
      { name: 'Default (640x480)', width: 640, height: 480 },
      { name: 'Large (800x600)', width: 800, height: 600 },
    ];
    const ZOOM_LEVELS = [1, 2, 4, 8, 16];

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
      drawTime: 0,
    };
    let frameCount = 0;
    let lastStatsUpdate = performance.now();

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

    const shaderManager = new ShaderManager(engine, editor, updateCanvasSizeAndResolution);

    // --- Final Initialization Steps ---
    console.log('[Init] Setting up UI and event listeners...');

    const onProfile = async () => {
        if (!shaderManager.prepared) {
            console.error("Cannot profile: No valid shader is compiled.");
            return;
        }
        dom.profileButton.disabled = true;
        try {
            let profileData;
            try {
                profileData = await engine.profile(
                    editor.getValue(),
                    [resolution.width, resolution.height, stats.elapsedTime, iMouse.x, iMouse.y],
                    // Pass the function that updates the button text. This is visible
                    // even while the main stats bar is being updated by the render loop.
                    updateProfileButtonText
                );
            } catch (e) {
                // This specifically catches errors from the profile data generation.
                throw new Error(`Failed to generate profile data: ${e.message}`);
            }

            // Clear previous content
            const profilerContentContainer = document.getElementById('profiler-content-container');
            profilerContentContainer.innerHTML = 'Loading profile...';
            
            // --- CRITICAL: Zombie Tooltip Cleanup ---
            // The d3-flame-graph library can leave a tooltip attached to the document body,
            // which captures mouse events globally and causes massive performance degradation.
            // We must explicitly find and remove it before rendering any new profile.
            document.querySelectorAll('.d3-flame-graph-tip').forEach(tip => {
                console.log('[Cleanup] Removing orphaned flamegraph tooltip to prevent performance issues.');
                tip.remove();
            });

            // The tooltip container inside the modal is also cleared to be safe.
            const tooltipContainer = document.getElementById('flamegraph-tooltip-container');
            if (tooltipContainer) {
                tooltipContainer.innerHTML = '';
            }
            
            // Delegate the entire rendering process to the engine.
            // The engine now has full control over how to display its profile data.
            await engine.renderProfile(profileData, profilerContentContainer);

            dom.profileModal.style.display = 'flex';
            updateInitStatus('Profiling complete.');
            setTimeout(() => updateStatsPanel(stats, resolution), 3000); // Use imported function
        } catch (e) {
            const errorMessage = `Profiling failed: ${e.message}`;
            console.error("Profiling failed:", e);
            updateInitStatus(errorMessage);
            // Do not update stats panel immediately, let the error message show.
        } finally {
            dom.profileButton.disabled = false;
            dom.profileButton.textContent = 'Profile';
        }
    };

    setupUI({
        onShaderSelect: (index) => shaderManager.loadShader(index, RESOLUTIONS, ZOOM_LEVELS),
        onResolutionChange: updateCanvasSizeAndResolution,
        onZoomChange: updateCanvasSizeAndResolution,
        onProfile: onProfile,
        onPlayToggle: () => {
            shaderManager.isPlaying = !shaderManager.isPlaying;
            if (shaderManager.isPlaying) {
                dom.playToggleButton.innerHTML = '❚❚ Stop';
                lastStatsUpdate = performance.now();
                requestAnimationFrame(renderFrame);
            } else {
                dom.playToggleButton.innerHTML = '▶ Play';
            }
        },
        onRestart: () => {
            startTime = performance.now();
            if (!shaderManager.isPlaying) {
                (async () => {
                    try { await renderFrame(); } catch (e) { console.error('Error on restart:', e); }
                })();
            }
        },
        onToggleEditor: () => {
            dom.editorPane.classList.toggle('editor-hidden');
            setTimeout(() => {
                onResizeEnd();
                editor.refresh();
            }, 50);
        },
        onResizeEnd: () => {
            resolution = { width: dom.canvas.clientWidth, height: dom.canvas.clientHeight };
            dom.canvas.width = resolution.width;
            dom.canvas.height = resolution.height;
            ctx = dom.canvas.getContext('2d', { willReadFrequently: true });
            iMouse.x = resolution.width / 2;
            iMouse.y = resolution.height / 2;
        },
        onClearState: () => {
            console.log('Clearing all items from localStorage...');
            const keysToRemove = [];
            // Find all keys that belong to this application using the prefix.
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(STORAGE_PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            alert('All application state has been cleared. The page will now reload.');
            window.location.reload();
        },
        onShare: () => {
            const baseUrl = window.location.origin + window.location.pathname;
            const engineName = dom.engineSelect.value;
            const shaderName = dom.shaderSelect.options[dom.shaderSelect.selectedIndex].textContent;

            const shareUrl = `${baseUrl}?engine=${engineName}&shader=${encodeURIComponent(shaderName)}`;
            return shareUrl;
        },
    });

    const SHADERS = shaderManager.getShaders();
    const savedSql = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedIndex = localStorage.getItem(SHADER_SELECT_KEY) || 0;

    dom.shaderSelect.innerHTML = '';
    SHADERS.forEach((shader, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = shader.name;
        dom.shaderSelect.appendChild(option);
    });

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

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('shader')) {
        // A shared link was used, override local storage
        console.log('[Init] Loading state from URL parameters.');
        const shaderName = decodeURIComponent(urlParams.get('shader'));
        const shaderIndex = SHADERS.findIndex(s => s.name === shaderName);

        if (shaderIndex !== -1) {
            dom.shaderSelect.value = shaderIndex; // Set the dropdown to the correct shader
            shaderManager.loadShader(shaderIndex, RESOLUTIONS, ZOOM_LEVELS);
        } else {
            console.warn(`Shared shader "${shaderName}" not found. Loading default.`);
            shaderManager.loadShader(0, RESOLUTIONS, ZOOM_LEVELS);
        }
    } else {
        // Default behavior: load from local storage
        dom.shaderSelect.value = savedIndex;
        if (savedSql) {
            editor.setValue(savedSql);
        } else {
            shaderManager.loadShader(savedIndex, RESOLUTIONS, ZOOM_LEVELS);
        }
        if (shaderManager.applyPerformanceHints(editor.getValue(), RESOLUTIONS, ZOOM_LEVELS)) {
            updateCanvasSizeAndResolution();
        }
    }

    console.log('[Init] UI setup complete.');

    console.log('[Init] Initializing database engine...');
    updateInitStatus('Compiling initial shader...'); // Pass true for the initial compile
    await engine.initialize(updateInitStatus);
    shaderManager.engineReady = true; // Signal that the engine is now ready for use
    // Initial shader compilation. If it fails, we stop before starting the render loop.
    const initialCompileSuccess = await shaderManager.updateShader(true, stats);
    if (!initialCompileSuccess) {
      updateErrorPanel(stats); // Ensure the error is displayed.
      throw new Error("Initial shader compilation failed. Please fix the SQL and refresh.");
    }

    // --- Engine Stats Polling ---
    // Periodically fetch and display engine-specific stats.
    const generalSettings = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}general-settings`)) || {};
    const pollInterval = parseInt(generalSettings.pollInterval, 10) || 250;

    if (typeof engine.pollEngineStats === 'function') {
        setInterval(async () => {
            const engineName = dom.engineSelect.options[dom.engineSelect.selectedIndex].text;
            const engineStats = await engine.pollEngineStats();
            perfMonitor.updateEngineStats(engineName, engineStats);
        }, pollInterval);
    } else {
        perfMonitor.updateEngineStats('N/A', []); // Clear stats for engines that don't support it
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
      updateStatsPanel(stats, resolution);
    });

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
      const t0 = performance.now();
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
      stats.drawTime = performance.now() - t0;
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
      if (!shaderManager.prepared || shaderManager.hasCompilationError) {
        // Still update stats so the UI doesn't get stuck on "Initializing..."
        updateStatsPanel(stats, resolution); // Use imported function
        // Keep the animation loop going to allow for live editing.
        if (shaderManager.isPlaying) requestAnimationFrame(renderFrame); 
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
        const { table: result, timings } = await shaderManager.prepared.query(
          frameWidth,
          frameHeight,
          iTime,
          iMouse.x,
          iMouse.y
        );
        const t1 = performance.now();
        stats.queryTime = t1 - t0;
        
        // Update the performance monitor with detailed timings
        perfMonitor.update({
            query: timings.query || stats.queryTime, // Use detailed if available
            network: timings.network,
            processing: timings.processing,
            draw: stats.drawTime,
        });

        drawResultToCanvas(result, localImageData);
        lastGoodResult = result; // Store the successful result
      } catch (e) {
        console.error("Query runtime error:", e);
        stats.errorMessage = `Runtime Error:\n${e.message}`;
        shaderManager.isPlaying = false; // Stop the animation on a runtime error
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
      updateStatsPanel(stats, resolution); // Use imported function

      if (shaderManager.isPlaying) {
        requestAnimationFrame(renderFrame); // Continue the loop only if playing
      }
    };

    requestAnimationFrame(renderFrame); // Start the animation

    // Attach the editor's change listener only AFTER the initial setup is complete.
    // This prevents a race condition where a change event fires before the engine is ready.
    editor.on('change', async () => {
        // Dynamically determine the correct storage key at the moment of saving.
        // This prevents saving a shader to the wrong engine's storage slot after switching.
        const currentEngineName = dom.engineSelect.value;
        const currentLocalStorageKey = `${STORAGE_PREFIX}sql-for-${currentEngineName}`;
        const currentShaderSelectKey = `${STORAGE_PREFIX}shader-index-for-${currentEngineName}`;
        localStorage.setItem(currentLocalStorageKey, editor.getValue());
        localStorage.setItem(currentShaderSelectKey, dom.shaderSelect.value);
        if (shaderManager.applyPerformanceHints(editor.getValue(), RESOLUTIONS, ZOOM_LEVELS)) {
            updateCanvasSizeAndResolution();
        }
        clearTimeout(shaderManager.debounceTimer);
        shaderManager.debounceTimer = setTimeout(() => shaderManager.updateShader(false, stats), 300);
    });
  } catch (e) {
    console.error(e);
    dom.statsPanel.textContent = `FATAL ERROR: ${e.message}`;
  }
};

/**
 * Dynamically loads and initializes the selected database engine.
 */
const initializeEngine = async () => {
    // First, set up the UI and all its event listeners to ensure the application is responsive.
    // This is a temporary measure until the full main() function is called.
    setupUI({
        onShaderSelect: () => {},
        onResolutionChange: () => {},
        onZoomChange: () => {},
        onProfile: () => {},
        onPlayToggle: () => {},
        onRestart: () => {},
        onToggleEditor: () => {},
        onResizeEnd: () => {},
        onClearState: () => {},
        onShare: () => {},
    });

    const engineSelect = document.getElementById('engine-select');    
    const urlParams = new URLSearchParams(window.location.search);
    let selectedEngine;

    if (urlParams.has('engine')) {
        // If a shared link is used, its engine parameter takes top priority.
        selectedEngine = urlParams.get('engine');
    } else {
        selectedEngine = localStorage.getItem(`${STORAGE_PREFIX}selected-engine`) || engineSelect.value;
    }
    // Ensure the dropdown visually matches the engine being loaded.
    engineSelect.value = selectedEngine;

    // If switching to ClickHouse for the first time, show the settings modal.
    if (selectedEngine === 'clickhouse') {
        const hasConfiguredClickHouse = !!localStorage.getItem(`${STORAGE_PREFIX}clickhouse-settings`);
        if (!hasConfiguredClickHouse) {
            openSettingsModal();
            // Stop further execution. The user will save settings and the page will reload.
            return; 
        }
    }

    try {
        console.log(`[Init] Attempting to load engine: ${selectedEngine}`);
        updateInitStatus(`Loading ${selectedEngine} engine...`);
        const engineModule = await import(`./engines/${selectedEngine}/${selectedEngine}_engine.js`);
        await main(engineModule.engine);
    } catch (e) {
        // This catch block will now handle critical loading errors, like a failed import.
        const errorMessage = `FATAL: Could not load engine module for '${selectedEngine}'. ${e.message}`;
        console.error(errorMessage, e);
        document.getElementById('stats-panel').textContent = errorMessage;
    }
};

// --- Service Worker Hot-Fix ---
// This addresses a potential race condition where a stale service worker
// serves JS files without the correct Content-Type, causing a SyntaxError.
// This code forces the worker to unregister and the page to reload if needed.
if (window.navigator && navigator.serviceWorker) {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg && !navigator.serviceWorker.controller) {
      console.warn('Stale service worker detected. Forcing deregistration and reload.');
      reg.unregister().then(() => window.location.reload());
    }
  });
}

// We must attach the engine-switching listener immediately on script load.
const engineSelect = document.getElementById('engine-select');
if (engineSelect) {
    engineSelect.addEventListener('change', (event) => {
        const newEngine = event.target.value;
        localStorage.setItem(`${STORAGE_PREFIX}selected-engine`, newEngine);

        // When manually switching engines, clear any URL parameters to start fresh.
        // The page will reload and use the 'selected-engine' from localStorage.
        // This prevents a shared link's engine from overriding the user's manual selection.
        const url = new URL(window.location.href);
        window.location.href = url.origin + url.pathname;
    });
}
initializeEngine();