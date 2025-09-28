/**
 * This module is responsible for all direct DOM manipulation,
 * UI state management, and event handling.
 */

export const dom = {
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
    clickhouseSettings: document.getElementById('clickhouse-settings'),
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
};

export const updateInitStatus = (message) => {
    dom.statsPanel.textContent = message;
};

export const updateStatsPanel = (stats, resolution) => {
    let statsText = `FPS: ${stats.fps.toFixed(1)} | Prepare: ${stats.prepareTime.toFixed(2)}ms | Query: ${stats.queryTime.toFixed(2)}ms | Resolution: ${resolution.width}x${resolution.height} | Time: ${stats.elapsedTime.toFixed(2)}s`;
    // Use `!= null` to check for both `null` and `undefined` in a single, safe check.
    // This prevents a race condition when resizing the canvas.
    if (stats.pixelR != null) {
        statsText += ` | Pixel (${stats.pixelX}, ${stats.pixelY}): R=${stats.pixelR.toFixed(3)} G=${stats.pixelG.toFixed(3)} B=${stats.pixelB.toFixed(3)}`;
    }
    dom.statsPanel.textContent = statsText;
    updateErrorPanel(stats);
};

export const updateErrorPanel = (stats) => {
    if (stats.errorMessage) {
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

/**
 * Sets up all UI event listeners and initial states.
 */
export const setupUI = (callbacks) => {
    const {
        onShaderSelect,
        onResolutionChange,
        onZoomChange,
        onProfile,
        onEditorChange,
        onPlayToggle,
        onRestart,
        onToggleEditor,
        onResizeEnd,
        onClearState,
        onShare,
    } = callbacks;

    // Profiler Modal
    const closeModal = () => {
        dom.profileModal.style.display = 'none';

        // --- CRITICAL CLEANUP ---
        // The d3-flame-graph library's tooltip (`d3-tip`) appends the tooltip element to the document body.
        // If we don't manually remove it when the modal closes, it becomes an invisible overlay
        // that blocks clicks on the header. This is the definitive fix for that issue.
        const orphanedTooltip = document.querySelector('body > #flamegraph-tooltip');
        if (orphanedTooltip) orphanedTooltip.remove();
    };
    dom.profileModalClose.addEventListener('click', closeModal);
    dom.profileModal.addEventListener('click', (e) => {
        if (e.target === dom.profileModal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dom.profileModal.style.display !== 'none') {
            closeModal();
        }
    });
    dom.profileButton.addEventListener('click', onProfile);

    // Set the initial name for the graph plan tab based on the selected engine.
    const graphPlanTab = document.querySelector('.profiler-tab[data-tab="pipeline-plan"]');
    if (graphPlanTab && dom.engineSelect.value === 'duckdb_wasm') {
        graphPlanTab.textContent = 'Graph Plan';
    }

    // --- Profiler Tabs Logic ---
    const profilerTabs = document.querySelectorAll('.profiler-tab');
    const profilerTabContents = document.querySelectorAll('.profiler-tab-content');
    profilerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            profilerTabs.forEach(t => t.classList.remove('active'));
            profilerTabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const contentId = `profile-content-${tab.dataset.tab}`; // e.g., profile-content-raw-plan
            document.getElementById(contentId).classList.add('active');

            // Show/hide zoom controls based on tab
            const isGraphView = tab.dataset.tab === 'pipeline-plan' || tab.dataset.tab === 'graph-plan' || tab.dataset.tab === 'graph';
            const isStructuredView = tab.dataset.tab === 'structured-plan' || tab.dataset.tab === 'structured';

            // Visibility for Mermaid graph zoom controls
            const showZoom = isGraphView; // Only for DuckDB graph view for now
            dom.zoomInButton.style.display = showZoom ? 'inline-block' : 'none';
            dom.zoomOutButton.style.display = showZoom ? 'inline-block' : 'none';
            dom.zoomResetButton.style.display = showZoom ? 'inline-block' : 'none';
            dom.switchGraphDirectionButton.style.display = isGraphView ? 'inline-block' : 'none';

            // Visibility for Tree view controls
            dom.expandAllButton.style.display = isStructuredView ? 'inline-block' : 'none';
            dom.collapseAllButton.style.display = isStructuredView ? 'inline-block' : 'none';
        });
    });

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
        localStorage.setItem('pixelql.clickhouse-settings', JSON.stringify(settings));
        window.location.reload();
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
        onClearState(); // Execute the callback to clear state
    });

    // --- Share Modal Logic ---
    const openShareModal = () => {
        const shareUrl = onShare(); // Get the URL from the main logic
        dom.shareLinkInput.value = shareUrl;
        dom.shareModal.style.display = 'flex';
        dom.shareLinkInput.select();
    };
    const closeShareModal = () => dom.shareModal.style.display = 'none';

    dom.shareButton.addEventListener('click', openShareModal);
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
    dom.shaderSelect.addEventListener('change', () => onShaderSelect(dom.shaderSelect.value));
    dom.resolutionSelect.addEventListener('change', onResolutionChange);
    dom.zoomSelect.addEventListener('change', onZoomChange);
    dom.playToggleButton.addEventListener('click', onPlayToggle);
    dom.restartButton.addEventListener('click', onRestart);
    dom.toggleEditorButton.addEventListener('click', onToggleEditor);
    
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
                onResizeEnd();
            };
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        });
    };
    setupResizer(dom.resizeHandle, dom.editorPane);
};

// Exported function to handle opening the settings modal
export const openSettingsModal = () => {
    const selectedEngine = dom.engineSelect.value;
    if (selectedEngine === 'clickhouse') {
        const storedSettings = JSON.parse(localStorage.getItem('pixelql.clickhouse-settings')) || {};
        document.getElementById('ch-url').value = storedSettings.url || '';
        document.getElementById('ch-user').value = storedSettings.username || '';
        document.getElementById('ch-password').value = storedSettings.password || '';
        dom.clickhouseSettings.style.display = 'block';
        dom.settingsModal.style.display = 'flex';
    } else {
        alert('No specific settings for the DuckDB WASM engine.');
    }
};