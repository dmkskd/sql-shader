import { ShaderLoader } from '../shader_loader.js';

const fileShaderPaths = [
    './engines/clickhouse/shaders/squircle_2.sql',
    './engines/clickhouse/shaders/interactive_waves.sql',
    './engines/clickhouse/shaders/cosmic_time.sql',
    './engines/clickhouse/shaders/volumetric_fog.sql',
    './engines/clickhouse/shaders/volumetric_fog_parallel.sql',
    './engines/clickhouse/shaders/mandelbrot.sql',
  ];

const inlineShaders = [];

const shaderLoader = new ShaderLoader(fileShaderPaths, inlineShaders);

export const SHADERS = shaderLoader.getShaders();

export async function loadShaderContent(shader) {
  return shaderLoader.loadShaderContent(shader);
}