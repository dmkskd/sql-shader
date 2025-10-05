/**
 * This module encapsulates all functionality for the Asset Manager modal,
 * including populating it with shaders and generating their thumbnails.
 */
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

            this.dom.closeButton.addEventListener('click', handleClose, { once: true });
            this.dom.modal.addEventListener('click', (e) => {
                if (e.target === this.dom.modal) handleClose();
            }, { once: true });

            this.dom.modal.style.display = 'flex';
        });
    }

    _close() {
        this.dom.modal.style.display = 'none';
        // Stop any ongoing thumbnail generation by clearing the queue
        this.queue = [];
        this.isProcessing = false;
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
        requestIdleCallback(async (deadline) => {
            while (deadline.timeRemaining() > 0 && this.queue.length > 0) {
                const { shaderInfo, thumbnailElement } = this.queue.shift();
                try {
                    const imageDataUrl = await this._generateThumbnail(shaderInfo.sql);
                    thumbnailElement.style.backgroundImage = `url(${imageDataUrl})`;
                    thumbnailElement.textContent = '';
                } catch (e) {
                    console.error(`Failed to generate thumbnail for ${shaderInfo.name}:`, e);
                    thumbnailElement.textContent = 'Render Failed';
                }
            }
            if (this.queue.length > 0) this._processQueue();
            else this.isProcessing = false;
        });
    }

    async _generateThumbnail(sql) {
        const prepared = await this.engine.prepare(sql);
        const { table } = await prepared.query(this.thumbnailResolution.width, this.thumbnailResolution.height, 5, this.thumbnailResolution.width / 2, this.thumbnailResolution.height / 2);

        const imageData = new ImageData(this.thumbnailResolution.width, this.thumbnailResolution.height);
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

        const canvas = new OffscreenCanvas(this.thumbnailResolution.width, this.thumbnailResolution.height);
        canvas.getContext('2d').putImageData(imageData, 0, 0);
        const blob = await canvas.convertToBlob();
        return URL.createObjectURL(blob);
    }
}