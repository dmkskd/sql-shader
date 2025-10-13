/**
 * This module manages the application's core state,
 * shader compilation, and performance hints.
 */


import { dom, updateErrorPanel, updateInitStatus } from './ui_manager.js';

export class ShaderManager {
    constructor(engine, editor, onHintChange, shaderStateManager = null) {
        this.engine = engine;
        this.editor = editor;
        this.onHintChange = onHintChange;
        this.shaderStateManager = shaderStateManager;

        this.prepared = null;
        this.hasCompilationError = false;
        this.isPlaying = true;
        this.engineReady = false;
        this.wasPlayingBeforeError = true;
        this.pristineSql = ''; // The original SQL of the loaded shader
        this.currentSQL = ''; // The currently compiled SQL
        this.currentShaderIndex = 0;

        this.debounceTimer = null;
    }

    /**
     * Checks if the editor content has been modified since the last shader was loaded.
     * @returns {boolean} True if the editor is "dirty".
     */
    isDirty() {
        // Not dirty if nothing has been loaded yet.
        if (this.pristineSql === '') return false;
        // Compare the current editor value with the stored pristine version.
        return this.editor.getValue() !== this.pristineSql;
    }

    /** @returns {number} The index of the currently loaded shader. */
    getCurrentShaderIndex() {
        return this.currentShaderIndex;
    }

    /**
     * Extracts the initial block of comments from a SQL string.
     * @param {string} sql The SQL content.
     * @returns {string} The extracted comment block, cleaned up.
     */
    extractDescription(sql) {
        if (!sql) return '';
        const lines = sql.split('\n');
        const commentLines = [];
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('--')) {
                // Remove the '--' and trim any leading/trailing space
                commentLines.push(trimmedLine.substring(2).trim());
            } else if (trimmedLine.length > 0) {
                // Stop at the first non-comment, non-empty line
                break;
            }
        }
        // Join the lines, but filter out any that are just metadata hints like @run
        return commentLines
            .filter(line => !line.startsWith('@'))
            .join(' ');
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

        this.currentShaderIndex = shaderIndex;

        // First, try to load a saved version from localStorage
        let sql = null;
        let isSavedVersion = false;
        
        if (this.shaderStateManager) {
            const savedShader = this.shaderStateManager.getShaderByName(shader.name);
            if (savedShader) {
                sql = savedShader.sql;
                isSavedVersion = true;
                console.log(`[ShaderManager] Loading saved version of "${shader.name}"`);
            }
        }
        
        // If no saved version, load the built-in version from file
        if (!sql) {
            sql = (await this.engine.loadShaderContent(shader)).trim();
        }

        // Now that we have the actual SQL, set it in the editor.
        // This also becomes the new "pristine" version to check against for changes.
        this.pristineSql = sql;
        this.editor.setValue(sql);

        // Apply performance hints - the function will call onHintChange internally if needed
        this.applyPerformanceHints(sql, RESOLUTIONS, ZOOM_LEVELS);
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
                        // Remove any existing custom resolutions first
                        for (let i = RESOLUTIONS.length - 1; i >= 0; i--) {
                            if (RESOLUTIONS[i].name.startsWith('Custom (')) {
                                RESOLUTIONS.splice(i, 1);
                                dom.resolutionSelect.removeChild(dom.resolutionSelect.options[i]);
                            }
                        }
                        
                        // Rebuild the select options indices after removal
                        for (let i = 0; i < dom.resolutionSelect.options.length; i++) {
                            dom.resolutionSelect.options[i].value = i;
                        }
                        
                        // Now add the new custom resolution
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
            
            // Call the hint change callback immediately if settings changed
            if (settingsChanged) {
                this.onHintChange();
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
            this.currentSQL = sql; // Store the SQL for parameter style detection
            stats.prepareTime = t1 - t0;
            this.hasCompilationError = false;
            stats.errorMessage = null;
            updateErrorPanel(stats);

            // If the shader was playing before the error, and it's currently stopped, resume it.
            if (this.wasPlayingBeforeError && !this.isPlaying) {
                this.isPlaying = true;
                dom.playToggleButton.innerHTML = '❚❚ Stop';
            }
            
            // Always restart the render loop when compilation succeeds after an error
            // This ensures the shader restarts correctly when autocompile fixes an error
            if (this.wasPlayingBeforeError || this.isPlaying) {
                // Dispatch a custom event to trigger render loop restart
                // This is more reliable than requestAnimationFrame with empty callback
                window.dispatchEvent(new CustomEvent('shaderCompilationSuccess'));
            }
        } catch (e) {
            // Store the current playing state, so we can restore it upon a successful compile.
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