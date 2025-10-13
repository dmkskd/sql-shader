/**
 * ShaderStateManager - Manages shader persistence in localStorage
 * 
 * Responsibilities:
 * - Save/load user-created and modified shaders
 * - Track shader types (built-in vs user-created vs modified)
 * - Enforce storage limits and quota checking
 * - Handle naming conflicts
 */

class ShaderStateManager {
    constructor(engineName) {
        this.engineName = engineName;
        this.storageKey = `sqlshader.user-shaders`;
        this.maxShadersPerEngine = 20; // Configurable limit
    }

    /**
     * Get all user shaders for the current engine
     * @returns {Array} Array of shader objects
     */
    getUserShaders() {
        try {
            const allShaders = this._loadFromStorage();
            return allShaders[this.engineName] || [];
        } catch (error) {
            console.error('[ShaderStateManager] Failed to load user shaders:', error);
            return [];
        }
    }

    /**
     * Save a shader to localStorage
     * @param {Object} shaderData - Shader configuration
     * @param {string} shaderData.name - Shader name (must be unique per engine)
     * @param {string} shaderData.sql - SQL content
     * @param {string} shaderData.type - 'user-created' or 'built-in-modified'
     * @param {string} [shaderData.originalName] - Original built-in name if modified
     * @param {string} [shaderData.id] - Existing ID for updates, auto-generated for new
     * @returns {Object} Result with success status and saved shader or error
     */
    saveShader(shaderData) {
        try {
            // Validate required fields
            if (!shaderData.name || !shaderData.sql || !shaderData.type) {
                return {
                    success: false,
                    error: 'Missing required fields: name, sql, or type'
                };
            }

            // Validate shader type
            if (!['user-created', 'built-in-modified'].includes(shaderData.type)) {
                return {
                    success: false,
                    error: 'Invalid shader type. Must be "user-created" or "built-in-modified"'
                };
            }

            const allShaders = this._loadFromStorage();
            const engineShaders = allShaders[this.engineName] || [];

            // Check if updating existing shader
            const existingIndex = shaderData.id 
                ? engineShaders.findIndex(s => s.id === shaderData.id)
                : -1;

            // Check name uniqueness (skip if updating same shader)
            const nameConflict = engineShaders.find((s, idx) => 
                s.name === shaderData.name && idx !== existingIndex
            );

            if (nameConflict) {
                return {
                    success: false,
                    error: `A shader named "${shaderData.name}" already exists`
                };
            }

            // Check storage limit for new shaders
            if (existingIndex === -1 && engineShaders.length >= this.maxShadersPerEngine) {
                return {
                    success: false,
                    error: `Maximum of ${this.maxShadersPerEngine} shaders per engine reached. Delete unused shaders to save new ones.`
                };
            }

            // Create shader object
            const now = new Date().toISOString();
            const shader = {
                id: shaderData.id || `user-${Date.now()}`,
                name: shaderData.name,
                sql: shaderData.sql,
                type: shaderData.type,
                originalName: shaderData.originalName || null,
                createdAt: shaderData.createdAt || now,
                modifiedAt: now
            };

            // Update or add shader
            if (existingIndex >= 0) {
                engineShaders[existingIndex] = shader;
            } else {
                engineShaders.push(shader);
            }

            // Save to storage
            allShaders[this.engineName] = engineShaders;
            this._saveToStorage(allShaders);

            // Check localStorage usage
            this._checkStorageUsage();

            return {
                success: true,
                shader: shader
            };

        } catch (error) {
            console.error('[ShaderStateManager] Failed to save shader:', error);
            return {
                success: false,
                error: error.message || 'Failed to save shader'
            };
        }
    }

    /**
     * Delete a user shader
     * @param {string} shaderId - ID of shader to delete
     * @returns {Object} Result with success status
     */
    deleteShader(shaderId) {
        try {
            const allShaders = this._loadFromStorage();
            const engineShaders = allShaders[this.engineName] || [];

            const index = engineShaders.findIndex(s => s.id === shaderId);
            if (index === -1) {
                return {
                    success: false,
                    error: 'Shader not found'
                };
            }

            engineShaders.splice(index, 1);
            allShaders[this.engineName] = engineShaders;
            this._saveToStorage(allShaders);

            return {
                success: true,
                shaderId: shaderId
            };

        } catch (error) {
            console.error('[ShaderStateManager] Failed to delete shader:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete shader'
            };
        }
    }

    /**
     * Get a specific user shader by ID
     * @param {string} shaderId - Shader ID
     * @returns {Object|null} Shader object or null if not found
     */
    getShaderById(shaderId) {
        const userShaders = this.getUserShaders();
        return userShaders.find(s => s.id === shaderId) || null;
    }

    /**
     * Get a specific user shader by name
     * @param {string} shaderName - Shader name
     * @returns {Object|null} Shader object or null if not found
     */
    getShaderByName(shaderName) {
        const userShaders = this.getUserShaders();
        return userShaders.find(s => s.name === shaderName) || null;
    }

    /**
     * Check if a built-in shader has been modified
     * @param {string} builtInName - Name of built-in shader
     * @returns {boolean} True if modified version exists
     */
    isBuiltInModified(builtInName) {
        const userShaders = this.getUserShaders();
        return userShaders.some(s => 
            s.type === 'built-in-modified' && s.originalName === builtInName
        );
    }

    /**
     * Get the modified version of a built-in shader
     * @param {string} builtInName - Name of built-in shader
     * @returns {Object|null} Modified shader or null
     */
    getModifiedBuiltIn(builtInName) {
        const userShaders = this.getUserShaders();
        return userShaders.find(s => 
            s.type === 'built-in-modified' && s.originalName === builtInName
        ) || null;
    }

    /**
     * Restore a built-in shader to its original state (delete modified version)
     * @param {string} builtInName - Name of built-in shader
     * @returns {Object} Result with success status
     */
    restoreBuiltIn(builtInName) {
        try {
            const modified = this.getModifiedBuiltIn(builtInName);
            if (!modified) {
                return {
                    success: false,
                    error: 'No modified version found'
                };
            }

            return this.deleteShader(modified.id);

        } catch (error) {
            console.error('[ShaderStateManager] Failed to restore built-in:', error);
            return {
                success: false,
                error: error.message || 'Failed to restore shader'
            };
        }
    }

    /**
     * Get storage statistics
     * @returns {Object} Storage usage info
     */
    getStorageStats() {
        const userShaders = this.getUserShaders();
        const allShaders = this._loadFromStorage();
        
        // Estimate storage size
        const storageStr = JSON.stringify(allShaders);
        const bytesUsed = new Blob([storageStr]).size;
        const kbUsed = (bytesUsed / 1024).toFixed(2);

        return {
            shadersCount: userShaders.length,
            maxShaders: this.maxShadersPerEngine,
            percentUsed: Math.round((userShaders.length / this.maxShadersPerEngine) * 100),
            storageKB: kbUsed,
            engineName: this.engineName
        };
    }

    /**
     * Set maximum shaders per engine limit
     * @param {number} limit - New limit
     */
    setMaxShaders(limit) {
        if (typeof limit === 'number' && limit > 0) {
            this.maxShadersPerEngine = limit;
        }
    }

    /**
     * Clear all user shaders for current engine
     * @returns {Object} Result with success status
     */
    clearAllShaders() {
        try {
            const allShaders = this._loadFromStorage();
            allShaders[this.engineName] = [];
            this._saveToStorage(allShaders);

            return {
                success: true
            };

        } catch (error) {
            console.error('[ShaderStateManager] Failed to clear shaders:', error);
            return {
                success: false,
                error: error.message || 'Failed to clear shaders'
            };
        }
    }

    // Private methods

    /**
     * Load all shaders from localStorage
     * @private
     * @returns {Object} All shaders organized by engine
     */
    _loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) {
                return {};
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('[ShaderStateManager] Failed to parse localStorage data:', error);
            return {};
        }
    }

    /**
     * Save all shaders to localStorage
     * @private
     * @param {Object} data - All shaders organized by engine
     */
    _saveToStorage(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                throw new Error('localStorage quota exceeded. Please delete some shaders or clear browser data.');
            }
            throw error;
        }
    }

    /**
     * Check localStorage usage and warn if approaching limits
     * @private
     */
    _checkStorageUsage() {
        try {
            const stats = this.getStorageStats();
            
            // Warn at 80% of shader limit
            if (stats.percentUsed >= 80) {
                console.warn(`[ShaderStateManager] Approaching shader limit: ${stats.shadersCount}/${stats.maxShaders} shaders`);
            }

            // Warn if storage size is getting large (>1MB is concerning for localStorage)
            if (parseFloat(stats.storageKB) > 1024) {
                console.warn(`[ShaderStateManager] Large localStorage usage: ${stats.storageKB}KB`);
            }

        } catch (error) {
            console.error('[ShaderStateManager] Failed to check storage usage:', error);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShaderStateManager;
}
