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

export const updateInitStatus = (message) => {
    dom.statsPanel.textContent = message;
};

export const updateStatsPanel = (stats, resolution) => {
    let statsText = `FPS: ${stats.fps.toFixed(1)} | Prepare: ${stats.prepareTime.toFixed(2)}ms | Query: ${stats.queryTime.toFixed(2)}ms | Resolution: ${resolution.width}x${resolution.height} | Time: ${stats.elapsedTime.toFixed(2)}s`;
    if (stats.pixelR !== null) {
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

export const colorCodeQueryPlan = (planText) => {
    const selectedEngine = dom.engineSelect.value;

    if (selectedEngine === 'duckdb_wasm') {
        return planText.replace(/(\(actual time: ([\d.]+)s|\(([\d.]+)s\))/g, (match, _, timeStr1, timeStr2) => {
            const time = parseFloat(timeStr1 || timeStr2);
            let colorClass = 'time-good';
            if (time > 0.1) {
                colorClass = 'time-hot';
            } else if (time > 0.01) {
                colorClass = 'time-warm';
            }
            return `<span class="${colorClass}">${match}</span>`;
        });
    } else if (selectedEngine === 'clickhouse') {
        return planText.replace(/(Expression|Filter|Sort|Sorting|Join|Projection|ReadFromSystemNumbers)/g, (match) => {
            return `<span class="time-warm">${match}</span>`;
        });
    } else {
        return planText;
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
    } = callbacks;

    // Profiler Modal
    const closeModal = () => dom.profileModal.style.display = 'none';
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

    // Settings Modal
    const openSettingsModal = () => {
        const selectedEngine = dom.engineSelect.value;
        if (selectedEngine === 'clickhouse') {
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

    // Main Controls
    dom.shaderSelect.addEventListener('change', () => onShaderSelect(dom.shaderSelect.value));
    dom.resolutionSelect.addEventListener('change', onResolutionChange);
    dom.zoomSelect.addEventListener('change', onZoomChange);
    dom.playToggleButton.addEventListener('click', onPlayToggle);
    dom.restartButton.addEventListener('click', onRestart);
    dom.toggleEditorButton.addEventListener('click', onToggleEditor);

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