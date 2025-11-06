// This file defines the shaders available for the QuestDB engine.

const fileShaders = [
    './src/engines/questdb/shaders/squircle_2.sql',
    './src/engines/questdb/shaders/template_basic.sql'
];

const inlineShaders = [];

// Load file-based shaders
const loadedShaders = fileShaders.map(path => {
    const name = path.split('/').pop().replace('.sql', '').replace(/_/g, ' ');
    return { name, path, sql: `-- Loading from ${path}...` };
});

export const SHADERS = [...loadedShaders, ...inlineShaders];

/**
 * Asynchronously loads the content of a shader.
 * For file-based shaders, fetches from the path. For inline shaders, returns the SQL directly.
 * @param {{name: string, path?: string, sql: string}} shader The shader object.
 * @returns {Promise<string>} The SQL content of the shader.
 */
export async function loadShaderContent(shader) {
    // If the shader has a path and its SQL is the placeholder, fetch it
    if (shader.path && shader.sql.startsWith('-- Loading')) {
        try {
            const response = await fetch(shader.path);
            shader.sql = await response.text(); // Cache the result
            return shader.sql;
        } catch (error) {
            console.error(`Failed to load shader from ${shader.path}:`, error);
            return `-- Error loading shader: ${error.message}`;
        }
    }
    return Promise.resolve(shader.sql);
}
