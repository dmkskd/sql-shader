/**
 * This module encapsulates all functionality for the Asset Manager modal,
 * including populating it with shaders and generating their thumbnails.
 */
import { UniformBuilder } from './uniform_builder.js';

export class AssetManager {
    constructor(engine, shaderStateManager = null) {
        this.engine = engine;
        this.shaderStateManager = shaderStateManager;
        this.dom = {
            modal: document.getElementById('asset-manager-modal'),
            closeButton: document.querySelector('#asset-manager-modal .modal-close-button'),
            listContainer: document.getElementById('asset-list-container'),
        };

        // --- Thumbnail Generation Logic (merged from ThumbnailGenerator) ---
        this.thumbnailResolution = { width: 160, height: 120 };
        this.queue = [];
        this.isProcessing = false;

        // Uniform builder for preview rendering
        this.uniformBuilder = new UniformBuilder();

        // Track all active preview animations for cleanup
        this.activePreviews = new Set();

        // To manage the ESC key listener
        this.boundHandleKeyDown = null;

        // Callbacks for main.js to handle UI updates
        this.onShaderDeleted = null;
        this.onShaderRestored = null;
        this.onShaderDuplicated = null;

        // Store parameters for refreshing the list
        this._currentShaderInfos = null;
        this._currentShaderIndex = -1;
        this._currentResolve = null;
        this._currentReject = null;
        this._currentIndexMapping = null;
        
        // Store parameters needed to rebuild the shader list
        this._allShaderDefs = null;
        this._loadShaderContentFn = null;
        this._extractDescriptionFn = null;
    }

    /**
     * Creates a duplicate callback for a shader.
     * Extracted to avoid code duplication.
     *
     * @param {string} shaderName - Original shader name
     * @param {string} sql - Shader SQL to duplicate
     * @returns {Function} Async callback function
     */
    _createDuplicateCallback(shaderName, sql) {
        return async (info) => {
            const newName = prompt(
                `Enter a name for the duplicate shader:`,
                `${shaderName} (Copy)`
            );
            if (!newName || newName.trim() === '') return;

            const result = this.shaderStateManager.saveShader({
                name: newName.trim(),
                sql: sql,
                type: 'user-created',
                originalName: null
            });

            if (result.success) {
                console.log('[Duplicate] Created duplicate shader:', newName.trim());
                if (this.onShaderDuplicated) {
                    this.onShaderDuplicated(newName.trim(), sql);
                }
            } else {
                alert(`Failed to duplicate: ${result.error}`);
            }
        };
    }

    /**
     * Builds shader info list with metadata, filtering, and action callbacks.
     * This consolidates logic previously scattered in main.js.
     *
     * @param {Array<object>} allShaderDefs - All shader definitions from the engine
     * @param {Function} loadShaderContentFn - Function to load shader SQL: (shader) => Promise<string>
     * @param {Function} extractDescriptionFn - Function to extract description: (sql) => string
     * @returns {Promise<{shaderInfos: Array, indexMapping: Array}>} Shader infos and index mapping
     */
    async buildShaderInfos(allShaderDefs, loadShaderContentFn, extractDescriptionFn) {
        // Store parameters for potential rebuild
        this._allShaderDefs = allShaderDefs;
        this._loadShaderContentFn = loadShaderContentFn;
        this._extractDescriptionFn = extractDescriptionFn;

        // Filter out templates - they're not selectable shaders
        const selectableShaders = allShaderDefs.filter(s => !s.isTemplate);

        const shaderInfos = [];
        const indexMapping = []; // Maps display index to original shader index

        // First, add user-created shaders that aren't in the built-in list
        if (this.shaderStateManager) {
            const userShaders = this.shaderStateManager.getUserShaders().filter(s => s.type === 'user-created');

            for (const userShader of userShaders) {
                // Check if already in list (shouldn't be, but just in case)
                const alreadyExists = allShaderDefs.some(s => s.name === userShader.name);
                if (!alreadyExists) {
                    const shaderInfo = {
                        name: `📝 ${userShader.name}`,
                        sql: userShader.sql,
                        description: extractDescriptionFn(userShader.sql),
                        isUserCreated: true,
                        isModified: false,
                        shaderName: userShader.name,
                        onDuplicate: this._createDuplicateCallback(userShader.name, userShader.sql),
                        onDelete: async (info) => {
                            if (!confirm(`Delete shader "${userShader.name}"?\n\nThis cannot be undone.`)) {
                                return;
                            }

                            const result = this.shaderStateManager.deleteShader(userShader.id);
                            if (result.success) {
                                console.log('[Delete] Deleted shader:', userShader.name);
                                // Notify main.js via callback
                                if (this.onShaderDeleted) {
                                    this.onShaderDeleted(userShader.name);
                                }
                            } else {
                                console.error('[Delete] Failed to delete:', result.error);
                                alert(`Failed to delete: ${result.error}`);
                            }
                        }
                    };

                    shaderInfos.push(shaderInfo);
                    indexMapping.push(-1); // -1 indicates this is a user-created shader not in built-in list
                }
            }
        }

        // Then add built-in shaders
        for (let i = 0; i < selectableShaders.length; i++) {
            const shader = selectableShaders[i];
            const sql = await loadShaderContentFn(shader);

            // Check if this shader has a saved version
            const savedShader = this.shaderStateManager?.getShaderByName(shader.name);
            let displayName = shader.name;
            let isUserCreated = false;
            let isModified = false;

            if (savedShader) {
                if (savedShader.type === 'built-in-modified') {
                    displayName = `🔧 ${shader.name}`;
                    isModified = true;
                } else if (savedShader.type === 'user-created') {
                    displayName = `📝 ${shader.name}`;
                    isUserCreated = true;
                }
            }

            const shaderInfo = {
                name: displayName,
                sql: sql,
                description: extractDescriptionFn(sql),
                isUserCreated: isUserCreated,
                isModified: isModified,
                shaderName: shader.name
            };

            // Add duplicate callback for all shaders
            shaderInfo.onDuplicate = this._createDuplicateCallback(shader.name, sql);

            // Add delete callback for user-created shaders
            if (isUserCreated) {
                shaderInfo.onDelete = async (info) => {
                    if (!confirm(`Delete shader "${shader.name}"?\n\nThis cannot be undone.`)) {
                        return;
                    }

                    const result = this.shaderStateManager.deleteShader(savedShader.id);
                    if (result.success) {
                        console.log('[Delete] Deleted shader:', shader.name);
                        // Notify main.js via callback
                        if (this.onShaderDeleted) {
                            this.onShaderDeleted(shader.name);
                        }
                    } else {
                        console.error('[Delete] Failed to delete:', result.error);
                        alert(`Failed to delete: ${result.error}`);
                    }
                };
            }

            // Add restore callback for modified built-in shaders
            if (isModified) {
                shaderInfo.onRestore = async (info) => {
                    if (!confirm(`Restore "${shader.name}" to original version?\n\nThis will discard your saved changes.`)) {
                        return;
                    }

                    const result = this.shaderStateManager.restoreBuiltIn(shader.name);
                    if (result.success) {
                        console.log('[Restore] Restored built-in shader:', shader.name);
                        // Notify main.js via callback
                        if (this.onShaderRestored) {
                            this.onShaderRestored(shader.name);
                        }
                    } else {
                        console.error('[Restore] Failed to restore:', result.error);
                        alert(`Failed to restore: ${result.error}`);
                    }
                };
            }

            shaderInfos.push(shaderInfo);

            // Store the original index (accounting for filtered templates)
            const originalIndex = allShaderDefs.findIndex(s => s.name === shader.name);
            indexMapping.push(originalIndex);
        }

        return { shaderInfos, indexMapping };
    }

    /**
     * Opens the modal and returns a promise that resolves with the selected index.
     * @param {Array<object>} shaderInfos - The list of shaders with names, descriptions, and SQL.
     * @param {number} currentShaderIndex - The index of the currently running shader.
     * @param {Array<number>} indexMapping - Mapping from display index to original shader index.
     * @returns {Promise<number>} A promise that resolves with the index of the selected shader.
     */
    open(shaderInfos, currentShaderIndex = -1, indexMapping = null) {
        return new Promise((resolve, reject) => {
            // Store parameters for potential refresh
            this._currentShaderInfos = shaderInfos;
            this._currentShaderIndex = currentShaderIndex;
            this._currentIndexMapping = indexMapping;
            this._currentResolve = resolve;
            this._currentReject = reject;

            this._renderShaderList();

            const handleClose = () => {
                this._close();
                reject(new Error('User cancelled selection.')); // Reject on cancel
            };

            // Bind the keydown handler once so it can be added and removed.
            this.boundHandleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    handleClose();
                }
            };

            this.dom.closeButton.addEventListener('click', handleClose);
            this.dom.modal.addEventListener('click', (e) => { // Click outside to close
                if (e.target === this.dom.modal) handleClose();
            });
            window.addEventListener('keydown', this.boundHandleKeyDown);
            this.dom.modal.style.display = 'flex';
        });
    }

    /**
     * Renders the shader list in the modal.
     * Extracted to support refreshing without reopening.
     */
    _renderShaderList() {
        this.dom.listContainer.innerHTML = ''; // Clear previous content

        this._currentShaderInfos.forEach((shaderInfo, index) => {
            const isCurrentlyRunning = index === this._currentShaderIndex;
            const row = this._createAssetRow(shaderInfo, isCurrentlyRunning, () => {
                this._close();
                this._currentResolve(index);
            });
            this.dom.listContainer.appendChild(row);
        });
    }

    /**
     * Refreshes the shader list without closing the modal.
     * Used after delete/restore operations to update the list.
     * Rebuilds the entire shader list with fresh callbacks.
     * Automatically finds the currently displayed shader in the new list.
     */
    async refresh() {
        if (!this._currentResolve) {
            console.warn('[AssetManager] Cannot refresh: modal not open');
            return;
        }

        if (!this._allShaderDefs || !this._loadShaderContentFn || !this._extractDescriptionFn) {
            console.warn('[AssetManager] Cannot refresh: missing rebuild parameters');
            return;
        }

        // Get the name of the currently highlighted shader (if any)
        let currentShaderName = null;
        if (this._currentShaderIndex >= 0 && this._currentShaderInfos) {
            currentShaderName = this._currentShaderInfos[this._currentShaderIndex]?.shaderName;
        }

        // Rebuild the shader infos with fresh callbacks
        const { shaderInfos, indexMapping } = await this.buildShaderInfos(
            this._allShaderDefs,
            this._loadShaderContentFn,
            this._extractDescriptionFn
        );

        // Try to find the same shader in the new list
        let newCurrentIndex = -1;
        if (currentShaderName) {
            for (let i = 0; i < shaderInfos.length; i++) {
                if (shaderInfos[i].shaderName === currentShaderName) {
                    newCurrentIndex = i;
                    break;
                }
            }
        }

        this._currentShaderInfos = shaderInfos;
        this._currentShaderIndex = newCurrentIndex;
        this._currentIndexMapping = indexMapping;
        this._renderShaderList();
    }

    _close() {
        this.dom.modal.style.display = 'none';

        // Stop any ongoing thumbnail generation by clearing the queue
        this.queue = [];
        this.isProcessing = false;

        // CRITICAL: Stop all active preview animations
        this._stopAllPreviews();

        // --- Cleanup Event Listeners ---
        // Remove listeners to prevent memory leaks and duplicate events.
        // A simple way to remove all listeners is to replace the node with a clone.
        const newCloseButton = this.dom.closeButton.cloneNode(true);
        this.dom.closeButton.replaceWith(newCloseButton);
        this.dom.closeButton = newCloseButton; // Update reference
        window.removeEventListener('keydown', this.boundHandleKeyDown);
    }

    _stopAllPreviews() {
        // Stop all active preview render loops
        for (const previewControl of this.activePreviews) {
            previewControl.stop();
        }
        this.activePreviews.clear();
    }

    /**
     * Creates a new shader from a template.
     * Prompts user for template selection (if multiple) and shader name.
     *
     * @param {Array<object>} allShaderDefs - All shader definitions from the engine
     * @param {Function} loadShaderContentFn - Function to load shader SQL: (shader) => Promise<string>
     * @returns {Promise<{success: boolean, shaderName?: string, sql?: string, error?: string}>}
     */
    async createNewShader(allShaderDefs, loadShaderContentFn) {
        // Get available templates
        const templates = allShaderDefs.filter(s => s.isTemplate);

        if (templates.length === 0) {
            alert('No templates available for this engine.');
            return { success: false, error: 'No templates available' };
        }

        // If multiple templates, let user choose; otherwise use the only one
        let selectedTemplate = templates[0];
        if (templates.length > 1) {
            const templateNames = templates.map(t => t.name).join('\n');
            const choice = prompt(`Choose a template:\n${templateNames}\n\nEnter template name:`);
            if (!choice) {
                return { success: false, error: 'User cancelled' };
            }

            selectedTemplate = templates.find(t => t.name.toLowerCase() === choice.trim().toLowerCase());
            if (!selectedTemplate) {
                alert('Invalid template name. Please try again.');
                return { success: false, error: 'Invalid template name' };
            }
        }

        // Load the template SQL
        const templateSQL = await loadShaderContentFn(selectedTemplate);

        // Prompt for shader name
        const shaderName = prompt('Enter a name for your new shader:');

        if (!shaderName || shaderName.trim() === '') {
            return { success: false, error: 'User cancelled or empty name' };
        }

        // Check if name already exists
        const existing = this.shaderStateManager?.getShaderByName(shaderName.trim());
        if (existing) {
            alert(`A shader named "${shaderName.trim()}" already exists. Please choose a different name.`);
            return { success: false, error: 'Shader name already exists' };
        }

        // Replace the template comment with the new shader name
        const customizedSQL = templateSQL.replace(/^-- .*Template/m, `-- ${shaderName}`);

        // Save the new shader
        const result = this.shaderStateManager?.saveShader({
            name: shaderName.trim(),
            sql: customizedSQL,
            type: 'user-created',
            originalName: null
        });

        if (result?.success) {
            console.log('[New Shader] Created from template:', selectedTemplate.name);
            return {
                success: true,
                shaderName: shaderName.trim(),
                sql: customizedSQL
            };
        } else {
            const error = result?.error || 'Unknown error';
            alert(`Failed to create shader: ${error}`);
            return { success: false, error };
        }
    }

    _createAssetRow(shaderInfo, isCurrentlyRunning, onSelect) {
        const row = document.createElement('div');
        row.className = 'asset-item';
        if (isCurrentlyRunning) {
            row.classList.add('asset-item-running');
        }
        row.addEventListener('click', onSelect);

        const thumbnail = document.createElement('div');
        thumbnail.className = 'asset-thumbnail';
        thumbnail.style.position = 'relative';
        thumbnail.style.overflow = 'hidden';

      // Static background (shows when not hovering or before shader loads)
      const staticBackground = document.createElement('div');
      staticBackground.className = 'asset-thumbnail-static';
      staticBackground.textContent = shaderInfo.name;

      // Preview canvas (shows when hovering)
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = 160;
      previewCanvas.height = 120;

      // Append children to thumbnail
      thumbnail.appendChild(staticBackground);
      thumbnail.appendChild(previewCanvas);

      // Preview control object
        const previewControl = {
            isRunning: false,
            animationId: null,
            prepared: null,
            stop: () => {
                previewControl.isRunning = false;
                if (previewControl.animationId) {
                    cancelAnimationFrame(previewControl.animationId);
                    previewControl.animationId = null;
                }
            }
        };

        // Hover to start live preview
        row.addEventListener('mouseenter', async () => {
            if (previewControl.isRunning) return; // Already running

            previewControl.isRunning = true;
            this.activePreviews.add(previewControl);

            // Hide static background, show canvas
            staticBackground.style.display = 'none';
            previewCanvas.style.display = 'block';

            try {
                // Prepare shader if not already done
                if (!previewControl.prepared) {
                    console.log(`[Preview] Preparing shader: ${shaderInfo.name}`);
                    previewControl.prepared = await this.engine.prepare(shaderInfo.sql);
                    console.log(`[Preview] Shader prepared: ${shaderInfo.name}`);
                }

                const ctx = previewCanvas.getContext('2d');
                const startTime = performance.now();
                let frameCount = 0;

                const render = async () => {
                    // Check if we should still be running
                    if (!previewControl.isRunning) {
                        return;
                    }

                    try {
                        const elapsed = (performance.now() - startTime) / 1000;

                        // Build uniforms
                        const uniforms = this.uniformBuilder.build({
                            width: 160,
                            height: 120,
                            iTime: elapsed,
                            mouseX: 0,
                            mouseY: 0,
                            audio: { isActive: false }
                        });

                        const { table } = await previewControl.prepared.query(uniforms);

                        // Only render if still running (check again after async operation)
                        if (!previewControl.isRunning) {
                            return;
                        }

                        // Only log on first frame
                        if (frameCount === 0) {
                            console.log(`[Preview] ${shaderInfo.name}: ${table.numRows} rows, ${table.numCols} cols`);
                        }

                        // Render to canvas - use same method as static thumbnail generation
                        const imageData = ctx.createImageData(160, 120);
                        const r = table.getChild('r').toArray();
                        const g = table.getChild('g').toArray();
                        const b = table.getChild('b').toArray();

                        for (let i = 0; i < r.length; i++) {
                            const pixelIndex = i * 4;
                            imageData.data[pixelIndex] = r[i] * 255;
                            imageData.data[pixelIndex + 1] = g[i] * 255;
                            imageData.data[pixelIndex + 2] = b[i] * 255;
                            imageData.data[pixelIndex + 3] = 255;
                        }

                        ctx.putImageData(imageData, 0, 0);
                        frameCount++;

                        // Continue loop only if still running
                        if (previewControl.isRunning) {
                            previewControl.animationId = requestAnimationFrame(render);
                        }
                    } catch (err) {
                        console.warn('Preview render error:', err);
                        previewControl.stop();
                    }
                };

                render();
            } catch (err) {
                console.error('Failed to start preview:', err);
                previewControl.stop();
                previewCanvas.style.display = 'none';
                thumbnail.textContent = 'Preview Failed';
            }
        });

        // Stop preview on mouseleave
        row.addEventListener('mouseleave', () => {
            previewControl.stop();
            this.activePreviews.delete(previewControl);
            previewCanvas.style.display = 'none';
            staticBackground.style.display = 'flex';
        });

        // Generate static thumbnail for initial display (render to staticBackground)
        this._enqueueThumbnail(shaderInfo, staticBackground);

        const name = document.createElement('div');
        name.className = 'asset-name';
        name.textContent = shaderInfo.name;

        const description = document.createElement('div');
        description.className = 'asset-description';
        description.textContent = shaderInfo.description;

        // Make row position relative for button positioning
        row.style.position = 'relative';

        // Duplicate button - available for ALL shaders
        if (shaderInfo.onDuplicate) {
            const duplicateButton = document.createElement('button');
            duplicateButton.className = 'asset-duplicate-button';
            duplicateButton.textContent = 'Duplicate';
            duplicateButton.style.cssText = 'position: absolute; top: 10px; right: 10px; padding: 5px 12px; background-color: #555; color: #eee; border: 1px solid #666; border-radius: 3px; cursor: pointer; z-index: 10; font-size: 0.9em; transition: transform 0.05s ease-in-out;';

            duplicateButton.addEventListener('mousedown', () => {
                duplicateButton.style.transform = 'translateY(1px)';
                duplicateButton.style.backgroundColor = '#4a4a4a';
            });

            duplicateButton.addEventListener('mouseup', () => {
                duplicateButton.style.transform = 'translateY(0)';
                duplicateButton.style.backgroundColor = '#555';
            });

            duplicateButton.addEventListener('mouseleave', () => {
                duplicateButton.style.transform = 'translateY(0)';
                duplicateButton.style.backgroundColor = '#555';
            });

            duplicateButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent shader selection when clicking duplicate

                // Call the onDuplicate callback if provided
                if (shaderInfo.onDuplicate) {
                    shaderInfo.onDuplicate(shaderInfo);
                }
            });

            row.appendChild(duplicateButton);
        }

        // Add action buttons for user-created or modified shaders
        if (shaderInfo.isUserCreated || shaderInfo.isModified) {
            // Delete button for user-created shaders
            if (shaderInfo.isUserCreated) {
                const deleteButton = document.createElement('button');
                deleteButton.className = 'asset-delete-button';
                deleteButton.textContent = 'Delete';
                deleteButton.style.cssText = 'position: absolute; top: 10px; right: 100px; padding: 5px 12px; background-color: #8B0000; color: #eee; border: 1px solid #A52A2A; border-radius: 3px; cursor: pointer; z-index: 10; font-size: 0.9em; transition: transform 0.05s ease-in-out;';

                deleteButton.addEventListener('mousedown', () => {
                    deleteButton.style.transform = 'translateY(1px)';
                    deleteButton.style.backgroundColor = '#660000';
                });

                deleteButton.addEventListener('mouseup', () => {
                    deleteButton.style.transform = 'translateY(0)';
                    deleteButton.style.backgroundColor = '#8B0000';
                });

                deleteButton.addEventListener('mouseleave', () => {
                    deleteButton.style.transform = 'translateY(0)';
                    deleteButton.style.backgroundColor = '#8B0000';
                });

                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent shader selection when clicking delete

                    // Call the onDelete callback if provided
                    if (shaderInfo.onDelete) {
                        shaderInfo.onDelete(shaderInfo);
                    }
                });

                row.appendChild(deleteButton);
            }

            // Restore button for modified built-in shaders
            if (shaderInfo.isModified) {
                const restoreButton = document.createElement('button');
                restoreButton.className = 'asset-restore-button';
                restoreButton.textContent = 'Restore';
                restoreButton.style.cssText = 'position: absolute; top: 10px; right: 100px; padding: 5px 12px; background-color: #CC8800; color: #eee; border: 1px solid #E6A617; border-radius: 3px; cursor: pointer; z-index: 10; font-size: 0.9em; transition: transform 0.05s ease-in-out;';

                restoreButton.addEventListener('mousedown', () => {
                    restoreButton.style.transform = 'translateY(1px)';
                    restoreButton.style.backgroundColor = '#AA7700';
                });

                restoreButton.addEventListener('mouseup', () => {
                    restoreButton.style.transform = 'translateY(0)';
                    restoreButton.style.backgroundColor = '#CC8800';
                });

                restoreButton.addEventListener('mouseleave', () => {
                    restoreButton.style.transform = 'translateY(0)';
                    restoreButton.style.backgroundColor = '#CC8800';
                });

                restoreButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent shader selection when clicking restore

                    // Call the onRestore callback if provided
                    if (shaderInfo.onRestore) {
                        shaderInfo.onRestore(shaderInfo);
                    }
                });

                row.appendChild(restoreButton);
            }
        }

        row.append(thumbnail, name, description);
        return row;
    }

    // --- Thumbnail Generation Methods ---

    _enqueueThumbnail(shaderInfo, thumbnailElement) {
        this.queue.push({ shaderInfo, thumbnailElement });
        if (!this.isProcessing) this._processQueue();
    }

    _processQueue() {
        this.isProcessing = true;

        const processNextThumbnail = async () => {
            if (this.queue.length === 0) {
                this.isProcessing = false;
                return;
            }

            const { shaderInfo, thumbnailElement } = this.queue.shift();
            try {
                console.log(`Generating thumbnail for ${shaderInfo.name}...`);
                const imageDataUrl = await this._generateThumbnail(shaderInfo.sql);
                console.log(`Thumbnail generated successfully for ${shaderInfo.name}`);
                thumbnailElement.style.backgroundImage = `url(${imageDataUrl})`;
                thumbnailElement.style.backgroundSize = 'cover';
                thumbnailElement.style.backgroundPosition = 'center';
                thumbnailElement.textContent = '';
            } catch (e) {
                console.error(`Failed to generate thumbnail for ${shaderInfo.name}:`, e);
                thumbnailElement.textContent = 'Render Failed';
                thumbnailElement.style.backgroundColor = '#3a3a3a';
            }

            // Process next thumbnail
            if (this.queue.length > 0) {
                // Use setTimeout for Safari compatibility instead of requestIdleCallback
                setTimeout(processNextThumbnail, 50);
            } else {
                this.isProcessing = false;
            }
        };

        // Safari fallback: use setTimeout instead of requestIdleCallback
        if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(processNextThumbnail);
        } else {
            setTimeout(processNextThumbnail, 0);
        }
    }

    async _generateThumbnail(sql) {
        try {
            console.log('Starting thumbnail generation - preparing SQL...');
            const prepared = await this.engine.prepare(sql);

            console.log('SQL prepared, building uniforms...');
            const uniformBuilder = new UniformBuilder();

            const thumbnailParams = {
                width: this.thumbnailResolution.width,
                height: this.thumbnailResolution.height,
                iTime: 5, // Fixed time for consistent thumbnails
                mouseX: this.thumbnailResolution.width / 2,
                mouseY: this.thumbnailResolution.height / 2,
                audio: { isActive: false } // No audio for thumbnails
            };

            // Build pure JS uniforms - engine handles its own translation
            const uniforms = uniformBuilder.build(thumbnailParams);

            console.log('Executing query...');
            // Pass to engine - engine handles translation internally
            const queryResult = await prepared.query(uniforms);
            const { table } = queryResult;

            console.log('Creating image data...');
            const imageData = new ImageData(this.thumbnailResolution.width, this.thumbnailResolution.height);
            const r = table.getChild('r').toArray();
            const g = table.getChild('g').toArray();
            const b = table.getChild('b').toArray();

            console.log(`Processing ${r.length} pixels...`);
            for (let i = 0; i < r.length; i++) {
                const pixelIndex = i * 4;
                imageData.data[pixelIndex] = r[i] * 255;
                imageData.data[pixelIndex + 1] = g[i] * 255;
                imageData.data[pixelIndex + 2] = b[i] * 255;
                imageData.data[pixelIndex + 3] = 255;
            }

            console.log('Converting to image URL...');
            // Safari fallback: Use regular Canvas instead of OffscreenCanvas
            // Safari doesn't support OffscreenCanvas.convertToBlob() in main thread
            let canvas, ctx;
            if (typeof OffscreenCanvas !== 'undefined' && OffscreenCanvas.prototype.convertToBlob) {
                console.log('Using OffscreenCanvas (modern browsers)');
                // Modern browsers with full OffscreenCanvas support
                canvas = new OffscreenCanvas(this.thumbnailResolution.width, this.thumbnailResolution.height);
                ctx = canvas.getContext('2d');
                ctx.putImageData(imageData, 0, 0);
                const blob = await canvas.convertToBlob();
                return URL.createObjectURL(blob);
            } else {
                console.log('Using regular Canvas (Safari fallback)');
                // Safari fallback: Use regular canvas and toDataURL
                canvas = document.createElement('canvas');
                canvas.width = this.thumbnailResolution.width;
                canvas.height = this.thumbnailResolution.height;
                ctx = canvas.getContext('2d');
                ctx.putImageData(imageData, 0, 0);
                return canvas.toDataURL('image/png');
            }
        } catch (error) {
            console.error('Detailed thumbnail generation error:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }
}