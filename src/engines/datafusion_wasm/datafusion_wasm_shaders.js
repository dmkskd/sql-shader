import { ShaderLoader } from '../shader_loader.js';

const fileShaderPaths = [
    { path: './src/engines/datafusion_wasm/shaders/template_basic.sql', isTemplate: true },
    { path: './src/engines/datafusion_wasm/shaders/squircle_2.sql', isTemplate: false },
];

const inlineShaders = [];

const shaderLoader = new ShaderLoader(fileShaderPaths, inlineShaders);

export const SHADERS = shaderLoader.getShaders();

export async function loadShaderContent(shader) {
  return shaderLoader.loadShaderContent(shader);
}
