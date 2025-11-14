import { ShaderLoader } from '../shader_loader.js';

const fileShaderPaths = [
    { path: './src/engines/datafusion/shaders/template_basic.sql', isTemplate: true },
    './src/engines/datafusion/shaders/template_basic.sql',

  ];

const inlineShaders = [];

const shaderLoader = new ShaderLoader(fileShaderPaths, inlineShaders);

export const SHADERS = shaderLoader.getShaders();

export async function loadShaderContent(shader) {
  return shaderLoader.loadShaderContent(shader);
}
