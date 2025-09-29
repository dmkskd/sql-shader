/**
 * This module manages the application's core state,
 * shader compilation, and performance hints.
 */


import { dom, updateErrorPanel, updateInitStatus } from './ui_manager.js';

export class ShaderManager {
    constructor(engine, editor, onHintChange) {
        this.engine = engine;
        this.editor = editor;
        this.onHintChange = onHintChange;

        this.prepared = null;
        this.hasCompilationError = false;
        this.isPlaying = true;
        this.engineReady = false;
        this.wasPlayingBeforeError = true;

        this.debounceTimer = null;
    }

    /**
     * Retrieves the list of example shaders from the current engine.
     * This is part of the engine interface contract.
     * @returns {Array<{name: string, sql: string}>}
     */
    getShaders() {
        return this.engine.getShaders();
    }

    /**
     * Loads a specific shader into the editor by its index.
     */
    async loadShader(shaderIndex, RESOLUTIONS, ZOOM_LEVELS) {
        // CRITICAL: Cancel any pending compilation from a previous shader change.
        // This prevents a race condition where an old, complex shader (like Alien Beacon)
        // could be recompiled after a new, simple one has already been loaded.
        clearTimeout(this.debounceTimer);
        const shader = this.getShaders()[shaderIndex];
        if (!shader) return;

        // Asynchronously load the shader content if it's from a file.
        // The engine is responsible for implementing this loader function.
        const sql = (await this.engine.loadShaderContent(shader)).trim();

        // Now that we have the actual SQL, set it in the editor.
        this.editor.setValue(sql);

        if (this.applyPerformanceHints(sql, RESOLUTIONS, ZOOM_LEVELS)) {
            this.onHintChange();
        }
    }

    /**
     * Parses performance hints (like @run: resolution=...) from the SQL comment block
     * and applies them to the UI controls.
     * @returns {boolean} True if any UI settings were changed.
     */
    applyPerformanceHints(sql, RESOLUTIONS, ZOOM_LEVELS) {
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

                    // Check if this custom resolution already exists to prevent duplicates.
                    const existingIndex = RESOLUTIONS.findIndex(r => r.width === width && r.height === height);

                    if (existingIndex !== -1) {
                        // It already exists, just select it.
                        if (dom.resolutionSelect.value != existingIndex) {
                            dom.resolutionSelect.value = existingIndex;
                            settingsChanged = true;
                        }
                    } else {
                        // It's a new custom resolution, so add it.
                        const option = document.createElement('option');
                        option.value = RESOLUTIONS.length;
                        option.textContent = customResName;
                        dom.resolutionSelect.appendChild(option);
                        RESOLUTIONS.push({ name: customResName, width, height });
                        dom.resolutionSelect.value = option.value;
                        settingsChanged = true;
                    }
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
    }

    /**
     * Compiles the current SQL in the editor by calling the engine's `prepare` method.
     * This is a critical part of the engine interface contract.
     * @param {boolean} isInitialCompile - True if this is the first compile on page load.
     * @param {object} stats - The global stats object to update with prepare time.
     */
    async updateShader(isInitialCompile = false, stats) {
        const sql = this.editor.getValue();
        if (!this.engineReady) return false;

        updateInitStatus('Compiling shader...');
        this.hasCompilationError = true;

        try {
            const t0 = performance.now();
            const newPrepared = await this.engine.prepare(sql);
            const t1 = performance.now();

            this.prepared = newPrepared;
            stats.prepareTime = t1 - t0;
            this.hasCompilationError = false;
            stats.errorMessage = null;
            updateErrorPanel(stats);

            if (this.wasPlayingBeforeError && !this.isPlaying) {
                this.isPlaying = true;
                dom.playToggleButton.innerHTML = '❚❚ Stop';
            }
        } catch (e) {
            this.wasPlayingBeforeError = this.isPlaying;
            // If the error is an HTTP error during the prepare phase, it's a compilation error.
            if (e.message && (e.message.includes('HTTP') || e.message.includes('ClickHouse server'))) {
                stats.errorMessage = `Compilation Error: ${e.message}`;
            } else {
                stats.errorMessage = e.message;
            }
            if (!isInitialCompile) console.error("Shader compilation error:", e);
            updateErrorPanel(stats);
            return false;
        }
        return true;
    }
}