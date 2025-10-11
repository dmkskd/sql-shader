import { ShaderLoader } from '../shader_loader.js';

const fileShaderPaths = [
    { path: './src/engines/clickhouse/shaders/template_basic.sql', isTemplate: true },
    './src/engines/clickhouse/shaders/squircle_2.sql',
    './src/engines/clickhouse/shaders/interactive_waves.sql',
    './src/engines/clickhouse/shaders/cosmic_time.sql',
    './src/engines/clickhouse/shaders/volumetric_fog.sql',
    './src/engines/clickhouse/shaders/volumetric_fog_parallel.sql',
    './src/engines/clickhouse/shaders/mandelbrot.sql',
  ];

const inlineShaders = [];

const shaderLoader = new ShaderLoader(fileShaderPaths, inlineShaders);

export const SHADERS = shaderLoader.getShaders();

export async function loadShaderContent(shader) {
  return shaderLoader.loadShaderContent(shader);
}