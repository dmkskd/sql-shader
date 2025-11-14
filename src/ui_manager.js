/**
 * This module is responsible for all direct DOM manipulation,
 * UI state management, and event handling.
 */

export const dom = {
    engineSelect: document.getElementById('engine-select'),
    versionSpan: document.getElementById('version-span'),
    canvas: document.getElementById('shader-canvas'),
    debugPanel: document.getElementById('debug-panel'),
    editorPane: document.querySelector('.editor-pane'),
    editorTextarea: document.getElementById('sql-editor'),
    statsPanel: document.getElementById('stats-panel'),
    errorPanel: document.getElementById('error-panel'),
    resizeHandle: document.getElementById('resize-handle'),
    restartButton: document.getElementById('restart-button'),
    playToggleButton: document.getElementById('play-toggle-button'),
    runQueryButton: document.getElementById('run-query-button'),
    shaderSelectButton: document.getElementById('shader-select-button'),
    newShaderButton: document.getElementById('new-shader-button'),
    saveShaderButton: document.getElementById('save-shader-button'),
    restoreShaderButton: document.getElementById('restore-shader-button'),
    resolutionSelect: document.getElementById('resolution-select'),
    zoomSelect: document.getElementById('zoom-select'),
    profileButton: document.getElementById('profile-button'),
    effectSelect: document.getElementById('effect-select'),
    toggleEditorButton: document.getElementById('toggle-editor-button'),
    shareButton: document.getElementById('share-button'),
    profileModal: document.getElementById('profile-modal'),
    profileContentRawPlan: document.getElementById('profile-content-raw-plan'),
    profileContentStructuredPlan: document.getElementById('profile-content-structured-plan'),
    profileContentPipelinePlan: document.getElementById('profile-content-pipeline-plan'),
    profileContentFlamegraph: document.getElementById('profile-content-flamegraph'),
    profileContentTraceLog: document.getElementById('profile-content-trace-log'),
    profileContentQuerySummary: document.getElementById('profile-content-query-summary'),
    profileModalClose: document.querySelector('.modal-close-button'),
    zoomInButton: document.getElementById('zoom-in-button'),
    zoomOutButton: document.getElementById('zoom-out-button'),
    zoomResetButton: document.getElementById('zoom-reset-button'),
    expandAllButton: document.getElementById('expand-all-button'),
    collapseAllButton: document.getElementById('collapse-all-button'),
    switchGraphDirectionButton: document.getElementById('switch-graph-direction-button'),
    settingsButton: document.getElementById('settings-button'),
    settingsModal: document.getElementById('settings-modal'),
    settingsModalClose: document.querySelector('#settings-modal .modal-close-button'),
    engineSettingsContainer: document.getElementById('engine-specific-settings'),
    saveSettingsButton: document.getElementById('save-settings-button'),
    clearStateButton: document.getElementById('clear-state-button'),
    clearStateModal: document.getElementById('clear-state-modal'),
    clearStateModalClose: document.querySelector('#clear-state-modal .modal-close-button'),
    confirmClearStateButton: document.getElementById('confirm-clear-state-button'),
    cancelClearStateButton: document.getElementById('cancel-clear-state-button'),
    shareModal: document.getElementById('share-modal'),
    shareModalClose: document.querySelector('#share-modal .modal-close-button'),
    shareLinkInput: document.getElementById('share-link-input'),
    copyLinkButton: document.getElementById('copy-link-button'),
    unsavedChangesModal: document.getElementById('unsaved-changes-modal'),
    unsavedChangesDiscardButton: document.getElementById('unsaved-changes-discard-button'),
    unsavedChangesCancelButton: document.getElementById('unsaved-changes-cancel-button'),
    // Audio control
    audioPatternButton: document.getElementById('audio-pattern-button'),
    // Debug mode
    debugToggleButton: document.getElementById('debug-toggle-button'),
};

export const updateInitStatus = (message) => {
    dom.statsPanel.textContent = message;
};

/**
 * Updates the text content of the main profile button.
 * @param {string} text The text to display on the button.
 */
export const updateProfileButtonText = (text) => {
    dom.profileButton.textContent = text;
};

export const updateStatsPanel = (stats, resolution, audioParams = null) => {
    const statsText = `FPS: ${stats.fps.toFixed(1)} | Prepare: ${stats.prepareTime.toFixed(2)}ms | Query: ${stats.queryTime.toFixed(2)}ms | Draw: ${stats.drawTime.toFixed(2)}ms | Resolution: ${resolution.width}x${resolution.height} | Time: ${stats.elapsedTime.toFixed(2)}s`;
    
    let pixelInspectorHtml = '';

    // Use `!= null` to check for both `null` and `undefined` in a single, safe check.
    // This prevents a race condition when resizing the canvas.
    if (stats.pixelR != null) {
        const r = Math.floor(stats.pixelR * 255);
        const g = Math.floor(stats.pixelG * 255);
        const b = Math.floor(stats.pixelB * 255);
        pixelInspectorHtml = ` | Pixel (${stats.pixelX}, ${stats.pixelY}): R=${stats.pixelR.toFixed(3)} G=${stats.pixelG.toFixed(3)} B=${stats.pixelB.toFixed(3)} <span style="display: inline-block; width: 14px; height: 14px; background-color: rgb(${r}, ${g}, ${b}); border: 1px solid #888; vertical-align: middle; margin: 0 5px;"></span>`;
    }

    // Use innerHTML to render the color swatch span
    dom.statsPanel.innerHTML = statsText + pixelInspectorHtml;
    updateErrorPanel(stats);
};

// Flag to temporarily block error panel updates (e.g., during save message display)
let blockErrorPanelUpdates = false;
let blockErrorPanelTimeout = null;

export const setErrorPanelMessage = (message, isError = false) => {
    const statusBar = document.getElementById('editor-status-bar');
    dom.errorPanel.textContent = message;
    statusBar.style.backgroundColor = isError ? '#5c2828' : '#2a4a3a';
    
    // Block updates for 3 seconds
    blockErrorPanelUpdates = true;
    if (blockErrorPanelTimeout) clearTimeout(blockErrorPanelTimeout);
    blockErrorPanelTimeout = setTimeout(() => {
        blockErrorPanelUpdates = false;
    }, 3000);
};

export const updateErrorPanel = (stats) => {
    // Skip update if blocked (e.g., showing save message)
    if (blockErrorPanelUpdates) return;
    
    const statusBar = document.getElementById('editor-status-bar');
    if (stats.errorMessage) {
        if (stats.errorMessage.startsWith('Runtime Error')) {
            dom.errorPanel.textContent = stats.errorMessage;
        } else {
            dom.errorPanel.textContent = `Compilation Error:\n${stats.errorMessage}`;
        }
        statusBar.style.backgroundColor = '#5c2828'; // Dark red
    } else {
        dom.errorPanel.textContent = `Compilation Successful in ${stats.prepareTime.toFixed(2)}ms`;
        statusBar.style.backgroundColor = '#2a4a3a'; // Dark green
    }
};

/** A module-level variable to hold the callbacks. */
let uiCallbacks = {};

/** Updates the callbacks used by the UI event listeners. */
export const updateUICallbacks = (newCallbacks) => {
    uiCallbacks = { ...uiCallbacks, ...newCallbacks };
};

/**
 * Shows a custom confirmation modal for unsaved changes.
 * @returns {Promise<'discard' | 'cancel'>} A promise that resolves with the user's choice.
 */
export const showUnsavedChangesModal = () => {
    return new Promise((resolve) => {
        dom.unsavedChangesModal.style.display = 'flex';

        // Define named handlers to be able to remove them later.
        const onDiscard = () => close('discard');
        const onCancel = () => close('cancel');

        function close(choice) {
            dom.unsavedChangesModal.style.display = 'none';
            dom.unsavedChangesDiscardButton.removeEventListener('click', onDiscard);
            dom.unsavedChangesCancelButton.removeEventListener('click', onCancel);
            resolve(choice);
        }

        dom.unsavedChangesDiscardButton.addEventListener('click', onDiscard);
        dom.unsavedChangesCancelButton.addEventListener('click', onCancel);
    });
};

/**
 * Sets up all UI event listeners and initial states.
 */
export const setupUI = (initialCallbacks) => {
    updateUICallbacks(initialCallbacks);

    // Profiler Modal
    const closeModal = () => {
        dom.profileModal.style.display = 'none';

        // --- Zombie Tooltip Cleanup ---
        // The d3-flame-graph library can leave tooltips attached to the document body.
        // These tooltips have global mousemove listeners that cause massive performance degradation
        // if they are not removed when the modal is closed.
        // We select all elements with this class and remove them to be safe.
        document.querySelectorAll('.d3-flame-graph-tip').forEach(tip => {
            console.log('[Cleanup] Removing orphaned flamegraph tooltip to prevent performance issues.');
            tip.remove();
        });
        
        // Cleanup any engine-specific profiler resources (like PEV2)
        if (window.currentEngine && window.currentEngine.profiler && typeof window.currentEngine.profiler.cleanup === 'function') {
            window.currentEngine.profiler.cleanup();
        }
    };

    // Attach listeners only once to prevent multiple calls.
    if (!dom.profileModal.listenerAttached) {
        dom.profileModalClose.addEventListener('click', closeModal);
        dom.profileModal.addEventListener('click', (e) => {
            if (e.target === dom.profileModal) closeModal();
        });
        dom.profileModal.listenerAttached = true;
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dom.profileModal.style.display !== 'none') {
            closeModal();
        }

        // --- Global Keyboard Shortcuts ---
        // Check if the active element is an input, textarea, or the CodeMirror editor.
        const activeEl = document.activeElement;
        const isEditing = activeEl.tagName === 'INPUT' ||
                          activeEl.tagName === 'TEXTAREA' ||
                          activeEl.closest('.CodeMirror');

        // Don't trigger shortcuts if the user is typing.
        if (isEditing) {
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault(); // Prevent the page from scrolling down.
            uiCallbacks.onPlayToggle && uiCallbacks.onPlayToggle();
        }

        // Ctrl+P / Cmd+P for Profile
        if (e.code === 'KeyP' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault(); // Prevent browser print dialog
            uiCallbacks.onProfile && uiCallbacks.onProfile();
        }
    });
    dom.profileButton.addEventListener('click', () => uiCallbacks.onProfile && uiCallbacks.onProfile());

    const closeSettingsModal = () => {
        console.log('[UI Event] Closing settings modal.');
        dom.settingsModal.style.display = 'none';
    };
    dom.settingsButton.addEventListener('click', () => {
        console.log('[UI Event] Settings button clicked.');
        uiCallbacks.onOpenSettings && uiCallbacks.onOpenSettings();
    });
    dom.settingsModalClose.addEventListener('click', closeSettingsModal);
    dom.settingsModal.addEventListener('click', (e) => {
        if (e.target === dom.settingsModal) closeSettingsModal();
    });

    // The onSaveSettings callback is now responsible for all saving logic.
    dom.saveSettingsButton.addEventListener('click', () => {
        console.log('[UI Event] Save Settings button clicked.');
        uiCallbacks.onSaveSettings && uiCallbacks.onSaveSettings();
    });

    // --- Clear State Modal Logic ---
    const openClearStateModal = () => dom.clearStateModal.style.display = 'flex';
    const closeClearStateModal = () => dom.clearStateModal.style.display = 'none';

    dom.clearStateButton.addEventListener('click', openClearStateModal);
    dom.clearStateModalClose.addEventListener('click', closeClearStateModal);
    dom.cancelClearStateButton.addEventListener('click', closeClearStateModal);
    dom.clearStateModal.addEventListener('click', (e) => {
        if (e.target === dom.clearStateModal) closeClearStateModal();
    });
    dom.confirmClearStateButton.addEventListener('click', () => {
        closeClearStateModal();
        uiCallbacks.onClearState && uiCallbacks.onClearState(); // Execute the callback to clear state
    });

    // --- Share Modal Logic ---
    // Disable share button (feature not working)
    dom.shareButton.disabled = true;
    dom.shareButton.style.opacity = '0.5';
    dom.shareButton.style.cursor = 'not-allowed';
    dom.shareButton.title = 'Share feature is currently disabled (not working)';
    
    const openShareModal = () => {
        const shareUrl = uiCallbacks.onShare ? uiCallbacks.onShare() : ''; // Get the URL from the main logic
        dom.shareLinkInput.value = shareUrl;
        dom.shareModal.style.display = 'flex';
        dom.shareLinkInput.select();
    };
    const closeShareModal = () => dom.shareModal.style.display = 'none';

    // Don't attach click handler since button is disabled
    // dom.shareButton.addEventListener('click', openShareModal);
    dom.shareModalClose.addEventListener('click', closeShareModal);
    dom.shareModal.addEventListener('click', (e) => {
        if (e.target === dom.shareModal) closeShareModal();
    });
    dom.copyLinkButton.addEventListener('click', () => {
        navigator.clipboard.writeText(dom.shareLinkInput.value).then(() => {
            dom.copyLinkButton.textContent = 'Copied!';
            setTimeout(() => { dom.copyLinkButton.textContent = 'Copy to Clipboard'; }, 2000);
        });
    });

    // Main Controls
    if (dom.shaderSelectButton) {
        dom.shaderSelectButton.addEventListener('click', () => uiCallbacks.onOpenAssetManager && uiCallbacks.onOpenAssetManager());
    }
    dom.resolutionSelect.addEventListener('change', () => uiCallbacks.onResolutionChange && uiCallbacks.onResolutionChange());
    dom.zoomSelect.addEventListener('change', () => uiCallbacks.onZoomChange && uiCallbacks.onZoomChange());
    dom.playToggleButton.addEventListener('click', () => uiCallbacks.onPlayToggle && uiCallbacks.onPlayToggle());
    dom.restartButton.addEventListener('click', () => uiCallbacks.onRestart && uiCallbacks.onRestart());
    dom.toggleEditorButton.addEventListener('click', () => uiCallbacks.onToggleEditor && uiCallbacks.onToggleEditor());
    // Find the button inside setupUI to ensure the DOM is ready.
    document.getElementById('toggle-perf-button').addEventListener('click', () => uiCallbacks.onTogglePerf && uiCallbacks.onTogglePerf());
    document.getElementById('autocompile-toggle-button').addEventListener('click', () => uiCallbacks.onToggleAutocompile && uiCallbacks.onToggleAutocompile());
    document.getElementById('overlay-toggle-button').addEventListener('click', () => uiCallbacks.onToggleOverlay && uiCallbacks.onToggleOverlay());
    document.getElementById('overlay-opacity-slider').addEventListener('input', (e) => uiCallbacks.onOverlayOpacityChange && uiCallbacks.onOverlayOpacityChange(e.target.value));
    // The compile button is now in the editor status bar, but the listener is still attached here.
    document.getElementById('compile-button').addEventListener('click', () => uiCallbacks.onCompile && uiCallbacks.onCompile());
    
    // --- Run Query Button (Debug Mode) ---
    dom.runQueryButton.addEventListener('click', () => uiCallbacks.onRunQuery && uiCallbacks.onRunQuery());
    
    // --- Audio Pattern Control ---
    dom.audioPatternButton.addEventListener('click', () => uiCallbacks.onAudioPatternToggle && uiCallbacks.onAudioPatternToggle());
    
    // --- Debug Mode Toggle ---
    dom.debugToggleButton.addEventListener('click', () => uiCallbacks.onDebugToggle && uiCallbacks.onDebugToggle());
    
    // --- Visual Effect Selector ---
    dom.effectSelect.addEventListener('change', (e) => {
        const selectedEffect = e.target.value;
        // Remove all possible effect classes first
        document.body.classList.remove('crt-effect', 'vhs-effect', 'terminal-effect');
        if (selectedEffect !== 'none') {
            document.body.classList.add(selectedEffect);
        }
    });


    // Resizer
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
                uiCallbacks.onResizeEnd && uiCallbacks.onResizeEnd();
            };
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        });
    };
    setupResizer(dom.resizeHandle, dom.editorPane);
};

// Exported function to handle opening the settings modal
export const openSettingsModal = (engine) => {
    // Populate general settings
    const storedGeneralSettings = JSON.parse(localStorage.getItem('sqlshader.general-settings')) || {};
    document.getElementById('stats-poll-interval').value = storedGeneralSettings.pollInterval || 250;
    document.getElementById('autocompile-delay').value = storedGeneralSettings.autocompileDelay || 300;

    // Clear any previous engine-specific settings
    dom.engineSettingsContainer.innerHTML = '';

    // Ask the engine for its settings UI
    if (engine && typeof engine.getSettingsPanel === 'function') {
        const settingsHtml = engine.getSettingsPanel();
        dom.engineSettingsContainer.innerHTML = settingsHtml;

        // Now populate the newly created fields
        const defaults = (typeof engine.getSettingsDefaults === 'function') ? engine.getSettingsDefaults() : {};
        const storedSettings = JSON.parse(localStorage.getItem(`sqlshader.${dom.engineSelect.value}-settings`)) || {};

        // Delegate population to the engine itself.
        if (typeof engine.populateSettings === 'function') {
            engine.populateSettings(storedSettings, defaults);
        }
    }
    dom.settingsModal.style.display = 'flex';
};