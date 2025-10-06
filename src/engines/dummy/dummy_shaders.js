// This file defines the shaders available for the Dummy engine.

const inlineShaders = [
    {
        name: 'dummy shader',
        sql: '-- This is a dummy shader.\n-- It does not affect the output, which is always a single grey pixel.'
    }
];

export const SHADERS = [...inlineShaders];

/**
 * Asynchronously "loads" the content of a shader.
 * For the dummy engine, all shaders are inline, so we just return the SQL.
 * @param {{name: string, sql: string}} shader The shader object.
 * @returns {Promise<string>} The SQL content of the shader.
 */
export async function loadShaderContent(shader) {
  return Promise.resolve(shader.sql);
}