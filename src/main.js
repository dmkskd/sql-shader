/**
 * SQL Shader - Main Entry Point
 * 
 * Copyright 2025 SQL Shader Contributors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { dom, setupUI, updateUICallbacks, updateInitStatus, updateStatsPanel, updateErrorPanel, setErrorPanelMessage, openSettingsModal, updateProfileButtonText, showUnsavedChangesModal } from './ui_manager.js';
import mermaid from 'mermaid';
import { ShaderManager } from './shader_manager.js';
import { AssetManager } from './asset_manager.js';
import { AudioManager } from './audio_manager.js';
import { UniformBuilder } from './uniform_builder.js';
import { StrudelInput } from './inputs/strudel_input.js';

import { PerformanceMonitor } from './performance_monitor.js';
import { HelpOverlay } from './help_overlay.js';

/**
 * A module-level variable to hold the currently active engine instance.
 * This allows us to access it for cleanup without needing to re-import during page unload.
 */
let activeEngine = null;

const APP_VERSION = '1.1.0';
const STORAGE_PREFIX = 'sqlshader.';

/**
 * Shows a modal with initialization errors
 * @param {Array<string>} errors - Array of error messages
 * @param {string} title - Optional custom title
 * @param {string} message - Optional custom message
 */
const showInitializationErrorModal = (errors, title = 'Initialization Errors', message = 'Some errors occurred during engine initialization:') => {
  const modal = document.getElementById('initialization-error-modal');
  const titleElement = document.getElementById('initialization-error-title');
  const messageElement = document.getElementById('initialization-error-message');
  const detailsDiv = document.getElementById('initialization-error-details');
  const closeButton = modal.querySelector('.modal-close-button');
  const okButton = document.getElementById('initialization-error-ok-button');
  
  // Set custom title and message
  titleElement.textContent = `⚠️ ${title}`;
  messageElement.textContent = message;
  
  // Format errors for display
  detailsDiv.textContent = errors.join('\n\n');
  
  // Show the modal
  modal.style.display = 'flex';
  
  // Set up close handlers
  const closeModal = () => {
    modal.style.display = 'none';
  };
  
  closeButton.onclick = closeModal;
  okButton.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
};

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
    onAudioPatternToggle: async () => {
        const audioButton = document.getElementById('audio-pattern-button');
        const audioStatus = audioButton.querySelector('.perf-status');

        try {
            // Use AudioManager's generic toggle method
            const isPlaying = await audioManager.toggleAudio('strudel', 1);

            // Update UI based on result
            if (isPlaying) {
                audioStatus.textContent = 'ON';
                audioStatus.className = 'perf-status perf-status-on';
            } else {
                audioStatus.textContent = 'OFF';
                audioStatus.className = 'perf-status perf-status-off';
            }
        } catch (error) {
            console.error('Failed to toggle audio pattern:', error);
            audioStatus.textContent = 'ERROR';
            audioStatus.className = 'perf-status perf-status-off';
            alert('Failed to start audio pattern: ' + error.message);
        }
    },
    onDebugToggle: () => {
        const debugButton = document.getElementById('debug-toggle-button');
        const debugStatus = debugButton.querySelector('.perf-status');
        
        // Toggle debug mode (will be set in main after engine loads)
        if (window.shaderManager) {
            window.shaderManager.isDebugMode = !window.shaderManager.isDebugMode;
            
            // Update UI
            if (window.shaderManager.isDebugMode) {
                debugStatus.textContent = 'ON';
                debugStatus.className = 'perf-status perf-status-on';
                dom.canvas.style.display = 'none';
                dom.debugPanel.style.display = 'block';
                
                // Hide play/restart buttons in debug mode
                dom.playToggleButton.style.display = 'none';
                dom.restartButton.style.display = 'none';
                
                // Show Run Query button
                dom.runQueryButton.style.display = 'inline-block';
                
                // Disable autocompile in debug mode
                if (isAutocompileOn) {
                    window.wasAutocompileOnBeforeDebug = true;
                    isAutocompileOn = false;
                    const autocompileButton = document.getElementById('autocompile-toggle-button');
                    autocompileButton.innerHTML = 'Autocompile: <span class="perf-status perf-status-off">OFF</span>';
                    autocompileButton.disabled = true; // Prevent toggling while in debug mode
                }
                
                console.log('[Debug Mode] Enabled - Auto-compile disabled, use "Run Query" to execute');
            } else {
                debugStatus.textContent = 'OFF';
                debugStatus.className = 'perf-status perf-status-off';
                dom.canvas.style.display = 'block';
                dom.debugPanel.style.display = 'none';
                
                // Show play/restart buttons in normal mode
                dom.playToggleButton.style.display = 'inline-block';
                dom.restartButton.style.display = 'inline-block';
                
                // Hide Run Query button
                dom.runQueryButton.style.display = 'none';
                
                // Re-enable autocompile if it was on before debug mode
                if (window.wasAutocompileOnBeforeDebug) {
                    isAutocompileOn = true;
                    const autocompileButton = document.getElementById('autocompile-toggle-button');
                    autocompileButton.innerHTML = 'Autocompile: <span class="perf-status perf-status-on">ON</span>';
                    autocompileButton.disabled = false;
                    delete window.wasAutocompileOnBeforeDebug;
                } else {
                    // Just re-enable the button
                    const autocompileButton = document.getElementById('autocompile-toggle-button');
                    autocompileButton.disabled = false;
                }
                
                console.log('[Debug Mode] Disabled - Auto-compile restored, rendering to canvas');
            }
            
            // Force a recompilation when switching modes to ensure we get appropriate results
            // This prevents errors when switching from debug shader (no r,g,b) to normal mode
            if (window.shaderManager.prepared && !window.shaderManager.hasCompilationError) {
                console.log('[Debug Mode] Recompiling shader for mode switch...');
                window.shaderManager.updateShader(false, window.stats || {});
            }
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

  // Initialize and register input sources
  const strudelInput = new StrudelInput();
  audioManager.registerInputSource('strudel', strudelInput);

  // Initialize uniform builder (pure JS uniforms, no engine logic)
  const uniformBuilder = new UniformBuilder();

  // Initialize help overlay system
  const helpOverlay = new HelpOverlay();
  
  // Detect OS and display correct keyboard shortcuts
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const helpShortcut = isMac ? '⌘/' : 'Ctrl+/';
  const profileShortcut = isMac ? '⌘P' : 'Ctrl+P';
  
  const helpShortcutSpan = document.getElementById('help-shortcut');
  if (helpShortcutSpan) {
    helpShortcutSpan.textContent = `(${helpShortcut})`;
  }
  console.log(`[HelpOverlay] Initialized. Press ${helpShortcut} to toggle help mode.`);

  // Wire up help indicator button
  const helpIndicatorButton = document.getElementById('help-indicator');
  if (helpIndicatorButton) {
    helpIndicatorButton.addEventListener('click', () => {
      helpOverlay.toggle();
    });
    helpIndicatorButton.title = `Toggle help mode (${helpShortcut})`;
  }
  
  // Update profile button tooltip with keyboard shortcut
  const profileButton = document.getElementById('profile-button');
  if (profileButton) {
    profileButton.title = `Run query profiler (${profileShortcut})`;
  }

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
    extraKeys: {
      // Save shader (Ctrl+S / Cmd+S)
      'Ctrl-S': function(cm) {
        const saveButton = document.getElementById('save-shader-button');
        if (saveButton && !saveButton.disabled) {
          saveButton.click();
        }
        return false; // Prevent default browser save
      },
      'Cmd-S': function(cm) {
        const saveButton = document.getElementById('save-shader-button');
        if (saveButton && !saveButton.disabled) {
          saveButton.click();
        }
        return false; // Prevent default browser save
      },
      
      // Run/Compile shader (Ctrl+Enter / Cmd+Enter)
      'Ctrl-Enter': function(cm) {
        const compileButton = document.getElementById('compile-button');
        if (compileButton && compileButton.style.display !== 'none') {
          compileButton.click();
        }
        return false;
      },
      'Cmd-Enter': function(cm) {
        const compileButton = document.getElementById('compile-button');
        if (compileButton && compileButton.style.display !== 'none') {
          compileButton.click();
        }
        return false;
      }
    }
  });

  // Initialize all UI components
  try {
    // Use engine-specific keys to prevent loading incompatible shaders after switching engines.
    const engineName = dom.engineSelect.value;
    const LOCAL_STORAGE_KEY = `${STORAGE_PREFIX}sql-for-${engineName}`;
    const SHADER_SELECT_KEY = `${STORAGE_PREFIX}shader-index-for-${engineName}`;
    const RESOLUTIONS = [
      { name: '64x48', width: 64, height: 48 },
      { name: '320x240', width: 320, height: 240 },
      { name: '640x480', width: 640, height: 480 },
      { name: '800x600', width: 800, height: 600 },
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

      // Force a new frame render with the updated canvas size to prevent black screen
      if (shaderManager.prepared && !shaderManager.hasCompilationError) {
        requestAnimationFrame(renderFrame);
      }
    };

    // Initialize ShaderStateManager for persisting user-created and modified shaders
    const shaderStateManager = new ShaderStateManager(engineName);
    console.log(`[Init] ShaderStateManager initialized for ${engineName} (max: ${shaderStateManager.maxShadersPerEngine} shaders)`);

    const shaderManager = new ShaderManager(engine, editor, updateCanvasSizeAndResolution, shaderStateManager);
    const assetManager = new AssetManager(engine, shaderStateManager);
    
    // Expose shaderManager and stats to window for debug toggle callback
    window.shaderManager = shaderManager;
    window.stats = stats;

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

    const handleShaderSelection = async (newIndex) => {
        const shader = shaderManager.getShaders()[newIndex];
        const engineName = dom.engineSelect.options[dom.engineSelect.selectedIndex].textContent;

        // Check if this shader has a saved version and determine the display name
        const savedShader = shaderStateManager.getShaderByName(shader.name);
        let displayName = shader.name;

        // Set or clear currentUserShaderName based on shader type
        if (savedShader && savedShader.type === 'user-created') {
            currentUserShaderName = shader.name;
            displayName = `� ${shader.name}`;
        } else {
            currentUserShaderName = null;
            if (savedShader && savedShader.type === 'built-in-modified') {
                displayName = `� ${shader.name}`;
            }
        }

        document.title = `SQL Shader - ${shader.name} (${engineName})`;
        dom.shaderSelectButton.textContent = displayName; // Update button text with indicator

        await shaderManager.loadShader(newIndex, RESOLUTIONS, ZOOM_LEVELS);
    };

    // Setup callbacks for AssetManager to notify main.js of state changes
    assetManager.onShaderDeleted = async (shaderName) => {
        setErrorPanelMessage(`✓ Deleted shader "${shaderName}"`, false);

        // If the deleted shader was currently loaded, switch to first non-template shader
        if (dom.shaderSelectButton.textContent.includes(shaderName)) {
            const firstShaderIndex = SHADERS.findIndex(s => !s.isTemplate);
            if (firstShaderIndex >= 0) {
                handleShaderSelection(firstShaderIndex);
            }
        }

        // Refresh the asset manager (it will rebuild the list internally)
        await assetManager.refresh();
    };

    assetManager.onShaderRestored = async (shaderName) => {
        setErrorPanelMessage(`✓ Restored "${shaderName}" to original`, false);

        // If the restored shader was currently loaded, reload it
        if (dom.shaderSelectButton.textContent.includes(shaderName)) {
            const shaderDefs = shaderManager.getShaders();
            await handleShaderSelection(shaderDefs.findIndex(s => s.name === shaderName));
        }

        // Refresh the asset manager (it will rebuild the list internally)
        await assetManager.refresh();
    };

    assetManager.onShaderDuplicated = (shaderName, sql) => {
        setErrorPanelMessage(`✓ Created duplicate "${shaderName}"`, false);
        assetManager._close();

        // Load the duplicated shader into the editor
        editor.setValue(sql);
        shaderManager.pristineSql = sql;
        currentUserShaderName = shaderName;

        // Update shader button to show the new shader name with user-created icon
        dom.shaderSelectButton.textContent = `📝 ${shaderName}`;

        // Disable save button (just saved)
        dom.saveShaderButton.disabled = true;

        // Compile the shader
        shaderManager.updateShader(false, stats);
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
                // Use AssetManager to build shader infos (consolidates filtering, metadata, callbacks)
                const shaderDefs = shaderManager.getShaders();
                const { shaderInfos, indexMapping } = await assetManager.buildShaderInfos(
                    shaderDefs,
                    (shader) => shaderManager.engine.loadShaderContent(shader),
                    (sql) => shaderManager.extractDescription(sql)
                );

                // Determine which shader is currently loaded to highlight it in the asset manager
                // We need to find it in our display list (indexMapping)
                const currentShaderIndex = shaderManager.getCurrentShaderIndex();
                const currentShaderName = shaderManager.getShaders()[currentShaderIndex]?.name;
                let currentDisplayIndex = -1;

                // Try to find the current shader in the display list
                for (let i = 0; i < shaderInfos.length; i++) {
                    if (shaderInfos[i].shaderName === currentShaderName) {
                        currentDisplayIndex = i;
                        break;
                    }
                }

                // Open the manager and wait for a selection
                const selectedDisplayIndex = await assetManager.open(shaderInfos, currentDisplayIndex, indexMapping);

                // Map the selected display index back to the original shader index or handle user shader
                const originalIndex = indexMapping[selectedDisplayIndex];
                if (originalIndex === -1) {
                    // This is a user-created shader - load it directly
                    const selectedShaderName = shaderInfos[selectedDisplayIndex].shaderName;
                    const userShader = shaderStateManager.getShaderByName(selectedShaderName);
                    if (userShader) {
                        editor.setValue(userShader.sql);
                        shaderManager.pristineSql = userShader.sql;
                        dom.shaderSelectButton.textContent = `📝 ${userShader.name}`;
                        await shaderManager.updateShader(false, stats);
                    }
                } else {
                    // This is a built-in shader (possibly modified)
                    await handleShaderSelection(originalIndex);
                }
            } catch (error) {
                // User cancelled the modal
            }
        },
        onResolutionChange: updateCanvasSizeAndResolution,
        onZoomChange: updateCanvasSizeAndResolution,
        onProfile: onProfile,
        onPlayToggle: () => {
            shaderManager.isPlaying = !shaderManager.isPlaying;
            if (shaderManager.isPlaying) {
                // Reset emergency stop and error counter when manually starting
                emergencyStop = false;
                consecutiveErrors = 0;
                // Resuming: adjust startTime to account for pause duration
                if (pauseStartTime !== null) {
                    pausedTime += (performance.now() - pauseStartTime);
                    pauseStartTime = null;
                }
                dom.playToggleButton.innerHTML = '❚❚ Stop';
                lastStatsUpdate = performance.now();
                requestAnimationFrame(renderFrame);
            } else {
                // Pausing: record when pause started
                pauseStartTime = performance.now();
                dom.playToggleButton.innerHTML = '▶ Play';
            }
        },
        onRestart: () => {
            startTime = performance.now();
            pausedTime = 0; // Reset pause tracking
            pauseStartTime = null;
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
        onRunQuery: () => {
            // Run query manually in debug mode
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
                autocompileDelay: document.getElementById('autocompile-delay').value,
            };
            localStorage.setItem('sqlshader.general-settings', JSON.stringify(generalSettings));

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
            document.title = `SQL Shader - ${shaderName} (${engineName})`;
            dom.shaderSelectButton.textContent = shaderName;
            await shaderManager.loadShader(shaderIndex, RESOLUTIONS, ZOOM_LEVELS);
        } else {
            console.warn(`Shared shader "${shaderName}" not found. Loading default.`);
            dom.shaderSelectButton.textContent = SHADERS[0].name;
            await shaderManager.loadShader(0, RESOLUTIONS, ZOOM_LEVELS);
        }
    } else {
        // Default behavior: load from local storage
        const initialShader = SHADERS[savedIndex];
        dom.shaderSelectButton.textContent = initialShader.name;
        // Set title on initial load
        const engineName = dom.engineSelect.options[dom.engineSelect.selectedIndex].textContent;
        document.title = `SQL Shader - ${initialShader.name} (${engineName})`;

        // Always load the shader from its source on startup to establish a clean pristine state.
        // Do not use the potentially stale 'savedSql' from localStorage.
        await shaderManager.loadShader(savedIndex, RESOLUTIONS, ZOOM_LEVELS);
    }

    console.log('[Init] UI setup complete.');

    // Before the first compile, ensure the editor contains a valid shader for the current engine.
    // This prevents a race condition where an old, incompatible shader from a previous session
    // is compiled against the new engine, causing an error.
    // We need to determine the correct index to load, respecting URL params over localStorage.
    const urlParamsForInitialLoad = new URLSearchParams(window.location.search);
    const initialShaderName = urlParamsForInitialLoad.get('shader');
    let initialIndex = initialShaderName ? SHADERS.findIndex(s => s.name === decodeURIComponent(initialShaderName)) : savedIndex;

    // If no valid index, find the first non-template shader (templates should never be loaded as initial shader)
    if (initialIndex < 0 || (SHADERS[initialIndex] && SHADERS[initialIndex].isTemplate)) {
      initialIndex = SHADERS.findIndex(s => !s.isTemplate);
      if (initialIndex < 0) {
        initialIndex = 0; // Fallback to first shader if somehow all are templates
      }
    }

    await shaderManager.loadShader(initialIndex, RESOLUTIONS, ZOOM_LEVELS);

    // Update shader selector button with the loaded shader name
    const loadedShader = SHADERS[initialIndex];
    if (loadedShader) {
      const isModified = shaderStateManager.getShaderByName(loadedShader.name) !== null;
      const displayName = isModified ? `🔧 ${loadedShader.name}` : loadedShader.name;
      dom.shaderSelectButton.textContent = displayName;
    }

    console.log('[Init] Initializing database engine connection...');
    updateInitStatus('Compiling initial shader...'); // Pass true for the initial compile
    const initResult = await engine.initialize(updateInitStatus);
    shaderManager.engineReady = true; // Signal that the engine is now ready for use
    
    // Check if the engine returned initialization errors and show modal if needed
    if (initResult && initResult.initializationErrors && initResult.initializationErrors.length > 0) {
      showInitializationErrorModal(
        initResult.initializationErrors,
        initResult.errorTitle || 'Initialization Errors',
        initResult.errorMessage || 'Some errors occurred during engine initialization:'
      );
    }
    
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
    let pausedTime = 0; // Track total time spent paused
    let pauseStartTime = null; // When the current pause started
    let lastGoodResult = null;
    let lastR, lastG, lastB; // Store the last rendered color data
    let isFrameProcessing = false; // Prevent concurrent frame processing

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

    // Track current user shader name (for duplicated/new shaders)
    let currentUserShaderName = null;

    // Listen for shader compilation success to restart render loop
    window.addEventListener('shaderCompilationSuccess', () => {
      // Restart the render loop when shader compilation succeeds
      // This ensures proper restart when autocompile fixes an error
      if (shaderManager.isPlaying && shaderManager.prepared && !shaderManager.hasCompilationError) {
        requestAnimationFrame(renderFrame);
      }
    });

    // Save button handler
    dom.saveShaderButton.addEventListener('click', async () => {
      const currentSQL = editor.getValue();

      // If we're working on a user shader (duplicated or new), use that name
      // Otherwise, use the current built-in shader name
      let shaderName, isBuiltIn;
      if (currentUserShaderName) {
        shaderName = currentUserShaderName;
        isBuiltIn = false;
      } else {
        const currentShader = shaderManager.getShaders()[shaderManager.getCurrentShaderIndex()];
        shaderName = currentShader.name;
        isBuiltIn = !currentShader.isUserCreated;
      }

      // Check if this shader already exists in localStorage (to update it)
      const existingSaved = shaderStateManager.getShaderByName(shaderName);

      // For now, simple save - later we'll add a dialog
      const saveData = {
        name: shaderName,
        sql: currentSQL,
        type: isBuiltIn ? 'built-in-modified' : 'user-created',
        originalName: isBuiltIn ? shaderName : null
      };

      // If it exists, include the ID to update it
      if (existingSaved) {
        saveData.id = existingSaved.id;
        saveData.createdAt = existingSaved.createdAt; // Preserve creation time
      }

      const result = shaderStateManager.saveShader(saveData);

      if (result.success) {
        console.log('[Save] Shader saved:', result.shader);
        // Show success message (blocks error panel updates for 3 seconds)
        const action = existingSaved ? 'Updated' : 'Saved';
        setErrorPanelMessage(`✓ ${action} "${shaderName}" to browser storage`, false);
        // Mark as no longer dirty
        shaderManager.pristineSql = currentSQL;
        // Disable save button
        dom.saveShaderButton.disabled = true;
        // Update shader button to show correct indicator based on shader type
        const icon = isBuiltIn ? '🔧' : '📝';
        dom.shaderSelectButton.textContent = `${icon} ${shaderName}`;
      } else {
        console.error('[Save] Failed to save shader:', result.error);
        // Show error message (blocks error panel updates for 3 seconds)
        setErrorPanelMessage(`✗ Failed to save: ${result.error}`, true);
      }
    });

    // New shader button handler - create a new shader
    dom.newShaderButton.addEventListener('click', async () => {
      // Use AssetManager to handle all the creation logic
      const result = await assetManager.createNewShader(
        shaderManager.getShaders(),
        (shader) => shaderManager.engine.loadShaderContent(shader)
      );

      if (result.success) {
        setErrorPanelMessage(`✓ Created new shader "${result.shaderName}"`, false);

        // Close asset manager if it's open
        if (assetManager.dom.modal.style.display !== 'none') {
          assetManager._close();
        }

        // Load the new shader into the editor
        editor.setValue(result.sql);
        shaderManager.pristineSql = result.sql;

        // Update shader button to show the new shader name with user-created icon
        dom.shaderSelectButton.textContent = `📝 ${result.shaderName}`;

        // Disable save button (just saved)
        dom.saveShaderButton.disabled = true;

        // Compile the shader
        await shaderManager.updateShader(false, stats);
      } else {
        console.error('[New Shader] Failed:', result.error);
        setErrorPanelMessage(`✗ Failed to create shader: ${result.error}`, true);
      }
    });

    /**
     * Renders query results as formatted text in the debug panel.
     * Supports any Arrow table structure, not just r,g,b columns.
     * @param {import('@apache/arrow').Table} resultTable The Arrow Table from the query.
     */
    const renderDebugOutput = (resultTable) => {
      const t0 = performance.now();
      
      // Get column names from schema
      const schema = resultTable.schema;
      const columnNames = schema.fields.map(f => f.name);
      const numRows = resultTable.numRows;
      
      // Limit output to prevent browser freeze
      const MAX_ROWS = 1000;
      const rowsToDisplay = Math.min(numRows, MAX_ROWS);
      
      // Build header
      let output = `Query returned ${numRows} row(s), ${columnNames.length} column(s)\n`;
      if (numRows > MAX_ROWS) {
        output += `(Showing first ${MAX_ROWS} rows)\n`;
      }
      output += '\n';
      
      // Calculate column widths for alignment
      const colWidths = columnNames.map(name => name.length);
      for (let i = 0; i < rowsToDisplay; i++) {
        columnNames.forEach((col, idx) => {
          const value = resultTable.getChild(col).get(i);
          const strValue = value !== null && value !== undefined ? String(value) : 'NULL';
          colWidths[idx] = Math.max(colWidths[idx], strValue.length);
        });
      }
      
      // Add some padding
      const paddedWidths = colWidths.map(w => Math.min(w + 2, 50)); // Cap at 50 chars
      
      // Build table header
      const headerLine = columnNames.map((name, idx) => 
        name.padEnd(paddedWidths[idx])
      ).join(' | ');
      output += headerLine + '\n';
      output += paddedWidths.map(w => '-'.repeat(w)).join('-+-') + '\n';
      
      // Build table rows
      for (let i = 0; i < rowsToDisplay; i++) {
        const rowValues = columnNames.map((col, idx) => {
          const value = resultTable.getChild(col).get(i);
          let strValue;
          
          if (value === null || value === undefined) {
            strValue = 'NULL';
          } else if (typeof value === 'number') {
            // Format numbers with reasonable precision
            strValue = Number.isInteger(value) ? String(value) : value.toFixed(6);
          } else {
            strValue = String(value);
          }
          
          // Truncate if too long
          if (strValue.length > 50) {
            strValue = strValue.substring(0, 47) + '...';
          }
          
          return strValue.padEnd(paddedWidths[idx]);
        });
        output += rowValues.join(' | ') + '\n';
      }
      
      // Display in debug panel
      dom.debugPanel.textContent = output;
      stats.drawTime = performance.now() - t0;
    };

    /**
     * Efficiently transfers query result data to the canvas ImageData.
     * @param {import('@apache/arrow').Table} resultTable The Arrow Table from DuckDB.
     * @param {ImageData} targetImageData The ImageData buffer for this specific frame.
     */
    const drawResultToCanvas = (resultTable, targetImageData) => {
      // Validate that the table has the required r,g,b columns
      const rCol = resultTable.getChild('r');
      const gCol = resultTable.getChild('g');
      const bCol = resultTable.getChild('b');
      
      if (!rCol || !gCol || !bCol) {
        console.error('[drawResultToCanvas] Table is missing r,g,b columns. Available columns:', 
          resultTable.schema.fields.map(f => f.name).join(', '));
        throw new Error('Query must return r, g, b columns for canvas rendering. Use debug mode for other column types.');
      }
      
      // Get direct access to the underlying typed arrays for each column.
      // This is significantly faster than converting to JS objects.
      const r = rCol.toArray();
      const g = gCol.toArray();
      const b = bCol.toArray();
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

    // Circuit breaker to prevent infinite error loops
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 3;
    let emergencyStop = false;

    const renderFrame = async (t) => {
      // Emergency stop: completely halt rendering
      if (emergencyStop) {
        console.error(`[RenderFrame] Emergency stop activated`);
        return;
      }

      // Circuit breaker: stop rendering after too many consecutive errors
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.error(`[RenderFrame] Stopped due to ${consecutiveErrors} consecutive errors`);
        emergencyStop = true; // Activate emergency stop
        shaderManager.isPlaying = false;
        dom.playToggleButton.innerHTML = '▶ Play';
        return;
      }

      // Prevent concurrent frame processing
      if (isFrameProcessing) {
        // Don't schedule another frame if we're already processing one
        // This prevents infinite recursion during errors
        return;
      }
      isFrameProcessing = true;

      try {
        // --- FPS Calculation (moved to beginning to count all frame attempts) ---
        frameCount++;
        const now = performance.now();
        // Calculate FPS, but only update the stats object once per second
        if (now - lastStatsUpdate > 1000) {
          stats.fps = frameCount / ((now - lastStatsUpdate) / 1000);
          lastStatsUpdate = now;
          frameCount = 0;
        }

        const iTime = (performance.now() - startTime - pausedTime) / 1000.0;

        // Update audio analysis
        const audioParams = audioManager.update();

      // If there is no valid prepared statement (e.g., due to a compilation error),
      // skip rendering but keep the animation loop alive.
      if (!shaderManager.prepared || shaderManager.hasCompilationError) {
        // Still update stats so the UI doesn't get stuck on "Initializing..."
        updateStatsPanel(stats, resolution, audioParams); // Use imported function
        // Keep the animation loop going to allow for live editing.
        if (shaderManager.isPlaying) requestAnimationFrame(renderFrame);
        isFrameProcessing = false; // Reset the flag before returning
        return;
      }

      stats.elapsedTime = iTime;

      try {
        // Safety check: ensure canvas and context are valid
        if (!ctx || dom.canvas.width !== resolution.width || dom.canvas.height !== resolution.height) {
          console.warn('[Render] Canvas size mismatch detected, skipping frame');
          if (shaderManager.isPlaying) requestAnimationFrame(renderFrame);
          isFrameProcessing = false; // Reset the flag before returning
          return;
        }

        // Capture the resolution at the start of the frame to prevent race conditions.
        const frameWidth = resolution.width;
        const frameHeight = resolution.height;

        // Create a fresh ImageData buffer that is local to this frame.
        let localImageData;
        try {
          localImageData = ctx.createImageData(frameWidth, frameHeight);
        } catch (e) {
          console.error('CanvasRenderingContext2D.createImageData error:', e.message);
          console.error('Attempted width:', frameWidth, 'height:', frameHeight);
          console.error('Canvas width:', dom.canvas.width, 'height:', dom.canvas.height);
          console.error('Resolution object:', resolution);
          if (shaderManager.isPlaying) requestAnimationFrame(renderFrame);
          isFrameProcessing = false; // Reset the flag before returning
          return;
        }

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
        const queryResult = await shaderManager.prepared.query(uniforms);
        const { table: result, timings } = queryResult;
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

        // Use debug rendering if debug mode is enabled
        if (shaderManager.isDebugMode) {
          renderDebugOutput(result);
          lastGoodResult = result;
          consecutiveErrors = 0;
          
          // In debug mode, pause after first execution (run once)
          if (shaderManager.isPlaying) {
            shaderManager.isPlaying = false;
            dom.playToggleButton.innerHTML = '▶ Play';
            console.log('[Debug Mode] Query executed once - paused. Click Play or compile to run again.');
          }
        } else {
          drawResultToCanvas(result, localImageData);
          lastGoodResult = result; // Store the successful result
          consecutiveErrors = 0; // Reset error counter on success
        }
      } catch (e) {
        console.error("Query runtime error:", e);
        consecutiveErrors++; // Increment error counter
        stats.errorMessage = `Runtime Error:\n${e.message}`;
        updateErrorPanel(stats); // Display the error in the UI
        shaderManager.isPlaying = false; // Stop the animation on a runtime error
        dom.playToggleButton.innerHTML = '▶ Play';
      }

      // Update the stats panel on every frame for real-time feedback
      updateStatsPanel(stats, resolution, audioManager ? audioManager.getLastAudioParams() : null); // Use imported function

      // Only request the next frame after this one is completely done
      // Add extra safety check to prevent infinite recursion on errors
      if (shaderManager.isPlaying && !stats.errorMessage && !emergencyStop) {
        requestAnimationFrame(renderFrame); // Continue the loop only if playing and no errors
      }
      } finally {
        isFrameProcessing = false; // Always reset the flag
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

        // Enable/disable save button based on dirty state
        dom.saveShaderButton.disabled = !shaderManager.isDirty();

        clearTimeout(shaderManager.debounceTimer);
        
        // Skip autocompile if in debug mode - user must manually click "Run Query"
        if (isAutocompileOn && !shaderManager.isDebugMode) {
            const generalSettings = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}general-settings`)) || {};
            const autocompileDelay = parseInt(generalSettings.autocompileDelay, 10) || 300;
            shaderManager.debounceTimer = setTimeout(() => {
                // Check for @run: hints in the current editor content and apply them before compiling
                const currentSQL = editor.getValue();
                shaderManager.applyPerformanceHints(currentSQL, RESOLUTIONS, ZOOM_LEVELS);

                // Then compile the shader
                shaderManager.updateShader(false, stats);
            }, autocompileDelay);
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
        selectedEngine = localStorage.getItem(`${STORAGE_PREFIX}selected-engine`) || 'duckdb_wasm'; // Default to DuckDB WASM
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