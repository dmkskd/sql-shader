import { ShaderLoader } from '../shader_loader.js';

const fileShaderPaths = [
    { path: './src/engines/duckdb_wasm/shaders/template_basic.sql', isTemplate: true },
    './src/engines/duckdb_wasm/shaders/squircle_2.sql',
    './src/engines/duckdb_wasm/shaders/interactive_waves.sql',
    './src//engines/duckdb_wasm/shaders/cosmic_time.sql',
    './src/engines/duckdb_wasm/shaders/raymarched_sphere.sql',
];

const inlineShaders = [];

const shaderLoader = new ShaderLoader(fileShaderPaths, inlineShaders);

export const SHADERS = shaderLoader.getShaders();

export async function loadShaderContent(shader) {
  return shaderLoader.loadShaderContent(shader);
}