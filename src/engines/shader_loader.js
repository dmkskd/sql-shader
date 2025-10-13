/**
 * A utility class to standardize the loading of shaders for different engines.
 * It handles both file-based and inline shaders, removing boilerplate from
 * individual engine implementations.
 */
export class ShaderLoader {
    /**
     * @param {Array<string|object>} fileShaderPaths - An array of paths to .sql shader files, or objects with {path, isTemplate, etc}.
     * @param {Array<object>} [inlineShaders=[]] - An optional array of inline shader objects.
     */
    constructor(fileShaderPaths, inlineShaders = []) {
        const loadedShaders = fileShaderPaths.map(item => {
            // Support both string paths and objects with metadata
            let path, isTemplate = false;
            if (typeof item === 'string') {
                path = item;
            } else {
                path = item.path;
                isTemplate = item.isTemplate || false;
            }
            
            const name = path.split('/').pop().replace('.sql', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            // The SQL will be fetched later when the shader is selected.
            // We store the path so we know where to fetch it from.
            return { name: `${name}`, path: path, sql: `-- Loading from ${path}...`, isTemplate: isTemplate };
        });

        // Combine the dynamically loaded shaders with any inline shaders.
        this.SHADERS = [...loadedShaders, ...inlineShaders];
    }

    /**
     * Returns the combined list of all shaders.
     * @returns {Array<object>}
     */
    getShaders() {
        return this.SHADERS;
    }

    /**
     * Asynchronously fetches the content of a shader if it's file-based.
     * @param {{name: string, path?: string, sql: string}} shader The shader object.
     * @returns {Promise<string>} The SQL content of the shader.
     */
    async loadShaderContent(shader) {
        // If the shader has a path and its SQL is the placeholder, fetch it.
        if (shader.path && shader.sql.startsWith('-- Loading')) {
            try {
                const response = await fetch(shader.path);
                shader.sql = await response.text(); // Cache the result
            } catch (e) {
                console.error(`Failed to fetch shader from ${shader.path}`, e);
                shader.sql = `-- ERROR: Could not load shader from ${shader.path}`;
            }
        }
        return shader.sql;
    }
}