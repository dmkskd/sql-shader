/**
 * Uniform Builder - Creates a generic uniform structures
 */
export class UniformBuilder {
  constructor() {
    this.frameCount = 0;
    this.lastFrame = performance.now();
    this.startTime = performance.now();
  }

  /**
   * Build uniforms (no engine-specific logic)
   * @param {Object} params - Input parameters
   * @returns {Object} uniform object
   */
  build(params) {
    const now = performance.now();
    const currentDate = new Date();
    
    const uniforms = {
      // Core uniforms
      iResolution: [params.width || 800, params.height || 600, 1.0],
      iTime: params.iTime || 0.0,
      iTimeDelta: params.iTimeDelta || (now - this.lastFrame) / 1000.0,
      iFrameRate: params.iFrameRate || 60.0,
      iFrame: this.frameCount++,
      
      // Mouse
      iMouse: [
        params.mouseX || 0.0,
        params.mouseY || 0.0,
        params.mouseClickX || 0.0,
        params.mouseClickY || 0.0
      ],
      
      // Date
      iDate: [
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate(),
        currentDate.getHours() * 3600 + currentDate.getMinutes() * 60 + currentDate.getSeconds()
      ],
      
      // Audio - both grouped and individual parameters for shader compatibility
      iSampleRate: params.sampleRate || 44100.0,
      iAudio: {
        volume: (params.audio?.isActive) ? (params.audio.volume || 0.0) : 0.0,
        bass: (params.audio?.isActive) ? (params.audio.bass || 0.0) : 0.0,
        mid: (params.audio?.isActive) ? (params.audio.mid || 0.0) : 0.0,
        treble: (params.audio?.isActive) ? (params.audio.treble || 0.0) : 0.0,
        isActive: params.audio?.isActive || false
      },
      
      // Individual audio parameters for direct shader use
      iAudioVolume: (params.audio?.isActive) ? (params.audio.volume || 0.0) : 0.0,
      iAudioBass: (params.audio?.isActive) ? (params.audio.bass || 0.0) : 0.0,
      iAudioMid: (params.audio?.isActive) ? (params.audio.mid || 0.0) : 0.0,
      iAudioTreble: (params.audio?.isActive) ? (params.audio.treble || 0.0) : 0.0
    };
    
    this.lastFrame = now;
    return uniforms;
  }
}