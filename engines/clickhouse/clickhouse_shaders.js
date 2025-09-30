// This file demonstrates a hybrid approach to managing shaders.
// 1. It explicitly lists shaders to be loaded from the 'shaders/' directory.
// 2. It also allows for defining shaders inline for quick tests.

// Since this project doesn't use a build tool like Vite, we cannot dynamically
// discover files. Instead, we manually list the shaders to be loaded.
const fileShaderPaths = [
    './engines/clickhouse/shaders/interactive_waves.sql',
    './engines/clickhouse/shaders/cosmic_time.sql',
];

// This is a placeholder. The actual shaders will be loaded asynchronously.
// For now, we create dummy entries so the UI can populate the dropdown.
const loadedShaders = fileShaderPaths.map(path => {
  const name = path.split('/').pop().replace('.sql', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  // The SQL will be fetched later when the shader is selected.
  // We store the path so we know where to fetch it from.
  return { name: `${name}`, path: path, sql: `-- Loading from ${path}...` };
})

// You can still define shaders inline for quick testing or for shaders that
// are too simple to warrant their own file.
const inlineShaders = [
    // Example of an inline shader. You can add more here.
    // {
    //     name: 'Simple Red (Inline)',
    //     sql: 'SELECT 1.0 AS r, 0.0 AS g, 0.0 AS b'
    // }
];

// Combine the dynamically loaded shaders with any inline shaders.
export const SHADERS = [...loadedShaders, ...inlineShaders];

// --- New Asynchronous Loading Logic ---

/**
 * Asynchronously fetches the content of a shader if it's file-based.
 * @param {{name: string, path?: string, sql: string}} shader The shader object.
 * @returns {Promise<string>} The SQL content of the shader.
 */
export async function loadShaderContent(shader) {
  // If the shader has a path and its SQL is the placeholder, fetch it.
  if (shader.path && shader.sql.startsWith('-- Loading')) {
    try {
      console.log(`[Debug] Fetching shader from path: ${shader.path}`);
      const response = await fetch(shader.path);
      shader.sql = await response.text(); // Cache the result
    } catch (e) {
      console.error(`Failed to fetch shader from ${shader.path}`, e);
      shader.sql = `-- ERROR: Could not load shader from ${shader.path}`;
    }
  }
  return shader.sql;
}