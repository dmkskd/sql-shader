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

        // To manage the ESC key listener
        this.boundHandleKeyDown = null;
    }

    /**
     * Opens the modal and returns a promise that resolves with the selected index.
     * @param {Array<object>} shaderInfos - The list of shaders with names, descriptions, and SQL.
     * @returns {Promise<number>} A promise that resolves with the index of the selected shader.
     */
    open(shaderInfos) {
        return new Promise((resolve, reject) => {
            this.dom.listContainer.innerHTML = ''; // Clear previous content

            shaderInfos.forEach((shaderInfo, index) => {
                const row = this._createAssetRow(shaderInfo, () => {
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

        // --- Cleanup Event Listeners ---
        // Remove listeners to prevent memory leaks and duplicate events.
        // A simple way to remove all listeners is to replace the node with a clone.
        this.dom.closeButton.replaceWith(this.dom.closeButton.cloneNode(true));
        window.removeEventListener('keydown', this.boundHandleKeyDown);
    }

    _createAssetRow(shaderInfo, onSelect) {
        const row = document.createElement('div');
        row.className = 'asset-item';
        row.addEventListener('click', onSelect);

        const thumbnail = document.createElement('div');
        thumbnail.className = 'asset-thumbnail';
        thumbnail.textContent = 'Generating...';
        this._enqueueThumbnail(shaderInfo, thumbnail);

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