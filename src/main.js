import { dom, setupUI, updateUICallbacks, updateInitStatus, updateStatsPanel, updateErrorPanel, openSettingsModal, updateProfileButtonText, showUnsavedChangesModal } from './ui_manager.js';
import mermaid from 'mermaid';
import { ShaderManager } from './shader_manager.js';
import { AssetManager } from './asset_manager.js';
import { AudioManager } from './audio_manager.js';
import { UniformBuilder } from './uniform_builder.js';

import { PerformanceMonitor } from './performance_monitor.js';
console.log('Executing main.js - Debug Version: 1.4.0');

/**
 * A module-level variable to hold the currently active engine instance.
 * This allows us to access it for cleanup without needing to re-import during page unload.
 */
let activeEngine = null;

const APP_VERSION = '1.1.0';
const STORAGE_PREFIX = 'pixelql.';

const main = async (engine) => {
  activeEngine = engine; // Store the reference to the initialized engine.
  dom.versionSpan.textContent = `v${APP_VERSION}`; // Mermaid is now initialized in index.html

  // --- Generic First-Time Configuration Check ---
  // This logic is now inside main(), ensuring all UI callbacks are set up
  // before we potentially open the settings modal.
  const engineMeta = (await (await fetch('src/engines/engines.json')).json()).find(e => e.id === dom.engineSelect.value);
  if (engineMeta && engineMeta.requiresConfiguration) {
      const hasConfig = !!localStorage.getItem(`${STORAGE_PREFIX}${dom.engineSelect.value}-settings`);
      if (!hasConfig) {
          console.log(`[Init] First-time use of '${dom.engineSelect.value}'. Opening settings panel...`);
          openSettingsModal(activeEngine);
          // We don't return here. We let the app initialize fully so the modal is interactive.
          // The user is expected to save and reload.
      }
  }

  // --- Set up UI with real callbacks ---
  // This is now the single source of truth for setting up UI interaction.
  // It's called after the engine is loaded and all state is ready.
  setupUI({
    onOpenSettings: () => {
        openSettingsModal(activeEngine);
    },
    onAudioToggle: async () => {
        const audioButton = document.getElementById('audio-toggle-button');
        const audioStatus = audioButton.querySelector('.perf-status');
        const micButton = document.getElementById('microphone-button');
        const fileButton = document.getElementById('audio-file-button');
        
        if (!audioManager.isInitialized) {
            try {
                await audioManager.initialize();
                audioStatus.textContent = 'ON';
                audioStatus.className = 'perf-status perf-status-on';
                micButton.style.display = 'inline-block';
                fileButton.style.display = 'inline-block';
            } catch (error) {
                console.error('Failed to initialize audio:', error);
                alert('Failed to initialize audio: ' + error.message);
            }
        } else {
            audioManager.stop();
            audioStatus.textContent = 'OFF';
            audioStatus.className = 'perf-status perf-status-off';
            micButton.style.display = 'none';
            fileButton.style.display = 'none';
        }
    },
    onMicrophoneToggle: async () => {
        try {
            await audioManager.connectMicrophone();
        } catch (error) {
            console.error('Failed to connect microphone:', error);
            alert('Failed to connect microphone: ' + error.message);
        }
    },
    onAudioFileLoad: async (file) => {
        try {
            await audioManager.connectAudioFile(file);
        } catch (error) {
            console.error('Failed to load audio file:', error);
            alert('Failed to load audio file: ' + error.message);
        }
    },
  });

  updateInitStatus('Initializing...');

  let ctx = dom.canvas.getContext('2d', { willReadFrequently: true });
  let resolution = { width: dom.canvas.width, height: dom.canvas.height };
  let imageData; // Will be initialized within the main try block
  // Initialize the performance monitor with its canvas
  const perfMonitor = new PerformanceMonitor(document.getElementById('timing-chart-canvas'));

  // Initialize audio manager for music reactivity
  const audioManager = new AudioManager();
  
  // Initialize uniform builder (pure JS uniforms, no engine logic)
  const uniformBuilder = new UniformBuilder();
  
  let isPerfVisible = true;
  let statsPollIntervalId = null;
  let isAutocompileOn = true;
  let isOverlayModeOn = false;

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
    const assetManager = new AssetManager(engine);

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

            // --- Zombie Tooltip Cleanup ---
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

    const handleShaderSelection = (newIndex) => {
        // [STATE_DEBUG] This block can be removed after testing.
        console.log(`[STATE_DEBUG] handleShaderSelection called for index: ${newIndex}. Proceeding to load.`);
        // The dirty check is now handled *before* the asset manager is opened.
        // We can just proceed to load the new shader.
        const shader = shaderManager.getShaders()[newIndex];
        const engineName = dom.engineSelect.options[dom.engineSelect.selectedIndex].textContent;
        document.title = `PixelQL - ${shader.name} (${engineName})`;
        dom.shaderSelectButton.textContent = shader.name; // Update button text
        shaderManager.loadShader(newIndex, RESOLUTIONS, ZOOM_LEVELS);
    };

    updateUICallbacks({ // This updates the callbacks for the already-set-up UI
        onOpenAssetManager: async () => {
            if (shaderManager.isDirty()) {
                const choice = await showUnsavedChangesModal();
                if (choice === 'cancel') {
                    return; // User cancelled, so we don't open the asset manager.
                }
            }
            try {
                // Prepare shader info for the asset manager
                const shaderDefs = shaderManager.getShaders();
                const shaderInfos = await Promise.all(shaderDefs.map(async (shader) => {
                    const sql = await shaderManager.engine.loadShaderContent(shader);
                    return {
                        name: shader.name,
                        sql: sql,
                        description: shaderManager.extractDescription(sql),
                    };
                }));

                // Open the manager and wait for a selection
                const selectedIndex = await assetManager.open(shaderInfos);
                handleShaderSelection(selectedIndex);
            } catch (error) {
                // This catch block handles the user cancelling the modal.
                console.log('[STATE_DEBUG] Asset selection cancelled.');
            }
        },
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
                // Update button state after toggling
                const isHidden = dom.editorPane.classList.contains('editor-hidden');
                if (isHidden) {
                    dom.toggleEditorButton.innerHTML = 'Editor: <span class="perf-status perf-status-off">OFF</span>';
                } else {
                    dom.toggleEditorButton.innerHTML = 'Editor: <span class="perf-status perf-status-on">ON</span>';
                }

                updateCanvasSizeAndResolution();
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
        onTogglePerf: () => {
            isPerfVisible = !isPerfVisible;
            const perfBar = document.getElementById('performance-bar');
            const toggleButton = document.getElementById('toggle-perf-button');
            if (isPerfVisible) {
                perfBar.style.display = 'flex';
                toggleButton.innerHTML = 'Stats: <span class="perf-status perf-status-on">ON</span>';
                // Restart polling
                startStatsPolling(engine, perfMonitor);
            } else {
                perfBar.style.display = 'none';
                toggleButton.innerHTML = 'Stats: <span class="perf-status perf-status-off">OFF</span>';
                // Stop polling
                if (statsPollIntervalId) clearInterval(statsPollIntervalId);
            }
        },
        onToggleAutocompile: () => {
            isAutocompileOn = !isAutocompileOn;
            const toggleButton = document.getElementById('autocompile-toggle-button');
            const compileButton = document.getElementById('compile-button');
            if (isAutocompileOn) {
                toggleButton.innerHTML = 'Autocompile: <span class="perf-status perf-status-on">ON</span>';
                compileButton.style.display = 'none';
            } else {
                toggleButton.innerHTML = 'Autocompile: <span class="perf-status perf-status-off">OFF</span>';
                compileButton.style.display = 'inline-block';
            }
        },
        onCompile: () => {
            shaderManager.updateShader(false, stats);
        },
        onToggleOverlay: () => {
            isOverlayModeOn = !isOverlayModeOn;
            const toggleButton = document.getElementById('overlay-toggle-button');
            const opacitySlider = document.getElementById('overlay-opacity-slider');
            dom.editorPane.classList.toggle('overlay-mode', isOverlayModeOn);
            if (isOverlayModeOn) {
                toggleButton.innerHTML = 'Overlay: <span class="perf-status perf-status-on">ON</span>';
                opacitySlider.style.display = 'inline-block';
                // Apply the initial opacity value when turning the overlay on.
                dom.editorPane.style.setProperty('--overlay-opacity', 1.1 - parseFloat(opacitySlider.value));
            } else {
                toggleButton.innerHTML = 'Overlay: <span class="perf-status perf-status-off">OFF</span>';
                opacitySlider.style.display = 'none';
            }
            editor.refresh(); // Refresh editor to adapt to new layout
        },
        onOverlayOpacityChange: (value) => {
            // Invert the slider's value. The slider goes from 0.1 (min) to 1 (max).
            // We want max on the slider (right) to be MINIMUM opacity, and vice-versa.
            const invertedValue = 1.1 - parseFloat(value);
            // Update the CSS custom property on the editor pane element
            dom.editorPane.style.setProperty('--overlay-opacity', invertedValue);
        },
        onSaveSettings: () => {
            // Save general settings
            const generalSettings = {
                pollInterval: document.getElementById('stats-poll-interval').value,
            };
            localStorage.setItem('pixelql.general-settings', JSON.stringify(generalSettings));

            if (activeEngine && typeof activeEngine.saveSettings === 'function') {
                activeEngine.saveSettings();
            }
            // Hide the modal before reloading for a cleaner UX.
            dom.settingsModal.style.display = 'none';
            window.location.reload();
        }
    });

    const SHADERS = shaderManager.getShaders();
    const savedSql = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedIndex = localStorage.getItem(SHADER_SELECT_KEY) || 0;

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
        option.textContent = `${level}x`;
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
            const engineName = dom.engineSelect.options[dom.engineSelect.selectedIndex].textContent;
            document.title = `PixelQL - ${shaderName} (${engineName})`;
            dom.shaderSelectButton.textContent = shaderName;
            shaderManager.loadShader(shaderIndex, RESOLUTIONS, ZOOM_LEVELS);
        } else {
            console.warn(`Shared shader "${shaderName}" not found. Loading default.`);
            dom.shaderSelectButton.textContent = SHADERS[0].name;
            shaderManager.loadShader(0, RESOLUTIONS, ZOOM_LEVELS);
        }
    } else {
        // Default behavior: load from local storage
        const initialShader = SHADERS[savedIndex];
        dom.shaderSelectButton.textContent = initialShader.name;
        // Set title on initial load
        const engineName = dom.engineSelect.options[dom.engineSelect.selectedIndex].textContent;
        document.title = `PixelQL - ${initialShader.name} (${engineName})`;

        // Always load the shader from its source on startup to establish a clean pristine state.
        // Do not use the potentially stale 'savedSql' from localStorage.
        shaderManager.loadShader(savedIndex, RESOLUTIONS, ZOOM_LEVELS);
    }

    console.log('[Init] UI setup complete.');

    // Before the first compile, ensure the editor contains a valid shader for the current engine.
    // This prevents a race condition where an old, incompatible shader from a previous session
    // is compiled against the new engine, causing an error.
    // We need to determine the correct index to load, respecting URL params over localStorage.
    const urlParamsForInitialLoad = new URLSearchParams(window.location.search);
    const initialShaderName = urlParamsForInitialLoad.get('shader');
    const initialIndex = initialShaderName ? SHADERS.findIndex(s => s.name === decodeURIComponent(initialShaderName)) : savedIndex;
    await shaderManager.loadShader(initialIndex > -1 ? initialIndex : 0, RESOLUTIONS, ZOOM_LEVELS);

    console.log('[Init] Initializing database engine connection...');
    updateInitStatus('Compiling initial shader...'); // Pass true for the initial compile
    await engine.initialize(updateInitStatus);
    shaderManager.engineReady = true; // Signal that the engine is now ready for use
    // Initial shader compilation. If it fails, we stop before starting the render loop.
    const initialCompileSuccess = await shaderManager.updateShader(true, stats);
    if (!initialCompileSuccess) {
      updateErrorPanel(stats); // Ensure the error is displayed.
      throw new Error("Initial shader compilation failed. Please fix the SQL and refresh.");
    }

    /** Starts the engine stats polling interval. */
    const startStatsPolling = (engine, perfMonitor) => {
        if (statsPollIntervalId) clearInterval(statsPollIntervalId); // Clear any existing interval

        const generalSettings = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}general-settings`)) || {};
        const pollInterval = parseInt(generalSettings.pollInterval, 10) || 250;

        if (typeof engine.pollEngineStats === 'function') {
            statsPollIntervalId = setInterval(async () => {
                const engineName = dom.engineSelect.options[dom.engineSelect.selectedIndex].text;
                const engineStats = await engine.pollEngineStats();
                perfMonitor.updateEngineStats(engineName, engineStats);
            }, pollInterval);
        }
    }
    startStatsPolling(engine, perfMonitor);

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
      updateStatsPanel(stats, resolution, audioManager ? audioManager.getLastAudioParams() : null);
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
      
      // Update audio analysis
      const audioParams = audioManager.update();

      // If there is no valid prepared statement (e.g., due to a compilation error),
      // skip rendering but keep the animation loop alive.
      if (!shaderManager.prepared || shaderManager.hasCompilationError) {
        // Still update stats so the UI doesn't get stuck on "Initializing..."
        updateStatsPanel(stats, resolution, audioParams); // Use imported function
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
        
        // === ENGINE-AGNOSTIC: Build pure JS uniforms ===
        const uniforms = uniformBuilder.build({
          width: frameWidth,
          height: frameHeight,
          iTime: iTime,
          mouseX: iMouse.x,
          mouseY: iMouse.y,
          audio: audioParams
        });
        
        // Pass pure JS uniforms to engine - engine handles its own translation
        const queryResult = await shaderManager.prepared.query(uniforms);        const { table: result, timings } = queryResult;
        const t1 = performance.now();
        stats.queryTime = t1 - t0;
        
        // Update the performance monitor with detailed timings
        if (isPerfVisible) {
            perfMonitor.update({
                query: timings.query || stats.queryTime, // Use detailed if available
                network: timings.network,
                processing: timings.processing,
                draw: stats.drawTime,
            });
        }

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
      updateStatsPanel(stats, resolution, audioManager ? audioManager.getLastAudioParams() : null); // Use imported function

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
        const currentShaderSelectKey = `${STORAGE_PREFIX}shader-index-for-${currentEngineName}`;
        // IMPORTANT: Only save the *index* of the current shader. Do not save the raw SQL content,
        // as this was overwriting the pristine state and breaking the "dirty" check.
        localStorage.setItem(currentShaderSelectKey, shaderManager.getCurrentShaderIndex());

        clearTimeout(shaderManager.debounceTimer);
        if (isAutocompileOn) {
            shaderManager.debounceTimer = setTimeout(() => shaderManager.updateShader(false, stats), 300);
        }
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
    // --- 1. Load the engine manifest ---
    const engineManifest = await (await fetch('src/engines/engines.json')).json();

    // --- 2. Populate the engine dropdown from the manifest ---
    const engineSelect = document.getElementById('engine-select');
    engineSelect.innerHTML = ''; // Clear hardcoded options
    engineManifest.forEach(engineMeta => {
        const option = document.createElement('option');
        option.value = engineMeta.id;
        option.textContent = engineMeta.name;
        engineSelect.appendChild(option);
    });

    // --- 3. Determine which engine to load ---
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

    // --- 5. Proceed with normal engine initialization ---
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

// --- Engine Cleanup on Page Unload ---
// This is critical for engines that use web workers (like DuckDB-WASM).
// When switching engines, the page reloads. We must ensure the old worker
// is terminated to prevent resource conflicts. Using a synchronous call with the
// stored `activeEngine` reference is more reliable than a dynamic import.
window.addEventListener('beforeunload', () => {
    if (activeEngine && typeof activeEngine.terminate === 'function') {
        // Note: This is a "fire and forget" call. We can't reliably `await`
        // an async operation during page unload.
        activeEngine.terminate();
    }
});
initializeEngine();