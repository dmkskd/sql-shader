import { ShaderLoader } from '../shader_loader.js';

const fileShaderPaths = [
    './engines/duckdb_wasm/shaders/interactive_waves.sql',
    './engines/duckdb_wasm/shaders/cosmic_time.sql',
    './engines/duckdb_wasm/shaders/raymarched_sphere.sql',
];

const inlineShaders = [];

const shaderLoader = new ShaderLoader(fileShaderPaths, inlineShaders);

export const SHADERS = shaderLoader.getShaders();

export async function loadShaderContent(shader) {
  return shaderLoader.loadShaderContent(shader);
}