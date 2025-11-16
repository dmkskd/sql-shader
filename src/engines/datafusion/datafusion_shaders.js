import { ShaderLoader } from '../shader_loader.js';

const fileShaderPaths = [
    './src/engines/datafusion/shaders/squircle2.sql',
    './src/engines/datafusion/shaders/template_basic.sql',
    { path: './src/engines/datafusion/shaders/template_basic.sql', isTemplate: true },
  ];

const inlineShaders = [];

const shaderLoader = new ShaderLoader(fileShaderPaths, inlineShaders);

export const SHADERS = shaderLoader.getShaders();

export async function loadShaderContent(shader) {
  return shaderLoader.loadShaderContent(shader);
}
