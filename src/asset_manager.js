/**
 * This module encapsulates all functionality for the Asset Manager modal,
 * including populating it with shaders and generating their thumbnails.
 */
import { UniformBuilder } from './uniform_builder.js';

export class AssetManager {
    constructor(engine) {
        this.engine = engine;
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
    }

    /**
     * Opens the modal and returns a promise that resolves with the selected index.
     * @param {Array<object>} shaderInfos - The list of shaders with names, descriptions, and SQL.
     * @param {number} currentShaderIndex - The index of the currently running shader.
     * @returns {Promise<number>} A promise that resolves with the index of the selected shader.
     */
    open(shaderInfos, currentShaderIndex = -1) {
        return new Promise((resolve, reject) => {
            this.dom.listContainer.innerHTML = ''; // Clear previous content

            shaderInfos.forEach((shaderInfo, index) => {
                const isCurrentlyRunning = index === currentShaderIndex;
                const row = this._createAssetRow(shaderInfo, isCurrentlyRunning, () => {
                    this._close();
                    resolve(index);
                });
                this.dom.listContainer.appendChild(row);
            });

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