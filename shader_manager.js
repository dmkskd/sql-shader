/**
 * This module manages the application's core state,
 * shader compilation, and performance hints.
 */


import { dom, updateErrorPanel, updateInitStatus } from './ui_manager.js';

const LOCAL_STORAGE_KEY = 'duckdb-shader-sql';
const SHADER_SELECT_KEY = 'duckdb-shader-select-index';

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

    getShaders() {
        return this.engine.getShaders();
    }

    loadShader(shaderIndex, RESOLUTIONS, ZOOM_LEVELS) {
        const shader = this.getShaders()[shaderIndex];
        if (!shader) return;

        const sql = shader.sql.trim();
        this.editor.setValue(sql);

        if (this.applyPerformanceHints(sql, RESOLUTIONS, ZOOM_LEVELS)) {
            this.onHintChange();
        }
    }

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
    }

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
            stats.errorMessage = e.message;
            if (!isInitialCompile) console.error("Shader compilation error:", e);
            updateErrorPanel(stats);
            return false;
        }
        return true;
    }
}