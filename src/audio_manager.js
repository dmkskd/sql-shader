/**
 * AudioManager - Generic audio analysis and shader parameter provider
 * 
 * Handles any audio source (Strudel, MP3, live input, etc.) and provides
 * standardized audio-reactive parameters for shaders.
 */
export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
    this.waveformData = null;
    this.bufferLength = 2048; // FFT size
    
    // Audio reactive parameters (similar to Shadertoy)
    this.audioParams = {
      volume: 0.0,        // Overall volume level (0-1)
      bass: 0.0,          // Bass frequencies (20-250 Hz)
      mid: 0.0,           // Mid frequencies (250-4000 Hz) 
      treble: 0.0,        // Treble frequencies (4000+ Hz)
      kick: 0.0,          // Kick drum detection
      snare: 0.0,         // Snare detection
      hihat: 0.0,         // Hi-hat detection
      spectrum: [],       // Full frequency spectrum (array)
      waveform: [],       // Raw waveform data (array)
      beat: 0.0,          // Beat detection (0-1)
      beatTime: 0.0,      // Time since last beat
      isActive: false,    // Whether audio is currently active
    };
    
    // Beat detection state
    this.beatHistory = [];
    this.lastBeatTime = 0;
    this.beatThreshold = 1.2; // Configurable beat sensitivity
    
    this.isInitialized = false;
    this.isPlaying = false;
    
    // Generic audio source management
    this.currentInputSource = null;  // Current input source (Strudel, MP3, etc.)
    this.inputSources = new Map();   // Registry of available input sources
    this.currentConnection = null;   // Current audio connection to analyser
  }

  /**
   * Initialize audio context and analyzer
   * @param {AudioContext} existingContext - Optional existing AudioContext to use
   */
  async initialize(existingContext = null) {
    try {
      // Use existing context if provided, otherwise create new one
      if (existingContext) {
        this.audioContext = existingContext;
      } else {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Create analyzer node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.bufferLength;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Create data arrays
      const bufferLength = this.analyser.frequencyBinCount;
      this.frequencyData = new Uint8Array(bufferLength);
      this.waveformData = new Uint8Array(bufferLength);
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[AudioManager] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Register an input source (Strudel, MP3 player, etc.)
   * @param {string} name - Name of the input source
   * @param {Object} inputSource - Input source instance
   */
  registerInputSource(name, inputSource) {
    this.inputSources.set(name, inputSource);
  }

  /**
   * Set the active input source
   * @param {string} name - Name of the input source to activate
   */
  async setInputSource(name) {
    if (!this.inputSources.has(name)) {
      throw new Error(`Input source '${name}' not found`);
    }

    // Stop current source
    if (this.currentInputSource) {
      this.stop();
    }

    const inputSource = this.inputSources.get(name);
    
    // Initialize the input source if it hasn't been initialized yet
    if (inputSource && typeof inputSource.initialize === 'function' && !inputSource.isReady()) {
      try {
        await inputSource.initialize(() => {});
      } catch (error) {
        console.error(`[AudioManager] Failed to initialize ${name}:`, error);
        throw error;
      }
    }

    this.currentInputSource = name;
    
    // Set up callback for when audio context is found (for lazy initialization)
    if (inputSource && typeof inputSource === 'object') {
      inputSource.onAudioContextFound = () => {
        if (typeof inputSource.connectToAnalyser === 'function') {
          const connected = inputSource.connectToAnalyser(this.analyser);
          if (connected) {
            this.isPlaying = true;
          }
        }
      };
    }
    
    // Try to connect the input source to the analyser for audio analysis
    if (inputSource && typeof inputSource.connectToAnalyser === 'function') {
      try {
        const connected = inputSource.connectToAnalyser(this.analyser);
        if (connected) {
          this.isPlaying = true;
        }
      } catch (error) {
        console.error(`[AudioManager] Error connecting ${name} to analyser:`, error);
      }
    }
  }

  /**
   * Connect an audio source to the analyser
   * @param {AudioNode} audioSource - Web Audio API audio source
   */
  connectAudioSource(audioSource) {
    if (!this.isInitialized) {
      throw new Error('AudioManager not initialized');
    }

    // Disconnect any existing source
    if (this.currentConnection) {
      this.currentConnection.disconnect();
    }

    // Connect new source to analyser
    audioSource.connect(this.analyser);
    this.currentConnection = audioSource;
    this.isPlaying = true;
    console.log('[AudioManager] Audio source connected');
  }

  /**
   * Get the current input source instance
   */
  getCurrentInputSource() {
    if (!this.currentInputSource) return null;
    return this.inputSources.get(this.currentInputSource);
  }

  /**
   * Toggle audio playback for a specific input source
   * @param {string} inputName - Name of the input source to toggle
   * @param {number} patternIndex - Optional pattern index for inputs that support multiple patterns
   * @returns {Promise<boolean>} True if audio is now playing, false if stopped
   */
  async toggleAudio(inputName = 'strudel', patternIndex = 1) {
    if (!this.inputSources.has(inputName)) {
      throw new Error(`Input source '${inputName}' not found`);
    }

    const inputSource = this.inputSources.get(inputName);
    
    // Initialize the input source if needed
    if (inputSource && !inputSource.isReady()) {
      await inputSource.initialize(() => {});
    }
    
    // Get audio context from the input if available
    const inputContext = (typeof window.strudel?.getAudioContext === 'function') 
      ? window.strudel.getAudioContext() 
      : null;
    
    // Initialize audio manager if needed
    if (!this.isInitialized) {
      if (inputContext) {
        await this.initialize(inputContext);
      } else {
        await this.initialize();
      }
    }
    
    const currentInput = this.getCurrentInputSource() || inputSource;
    
    // Toggle playback
    if (currentInput && currentInput.isPlaying) {
      // Stop current pattern
      if (typeof inputSource.stop === 'function') {
        inputSource.stop();
      }
      this.isPlaying = false;
      return false;
    } else {
      // Start playing
      await this.setInputSource(inputName);
      
      // Get and play a pattern if the input supports patterns
      if (typeof inputSource.getTestPatterns === 'function' && typeof inputSource.playPattern === 'function') {
        const patterns = inputSource.getTestPatterns();
        const pattern = patterns[patternIndex]?.pattern || patterns[5]?.pattern;
        if (pattern) {
          await inputSource.playPattern(pattern);
        }
      }
      
      return true;
    }
  }

  /**
   * Check if audio is currently playing
   * @returns {boolean}
   */
  isAudioPlaying() {
    const currentInput = this.getCurrentInputSource();
    return !!(currentInput && currentInput.isPlaying);
  }

  /**
   * Connect to microphone input
   */
  async connectMicrophone() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Resume AudioContext if suspended (required by modern browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[AudioManager] AudioContext resumed for microphone');
    }
    
    try {
      // Stop any existing audio
      this.stop();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      // Store references
      this.currentSource = source;
      this.currentStream = stream;
      
      this.isPlaying = true;
      console.log('[AudioManager] Connected to microphone');
      return true;
    } catch (error) {
      console.error('[AudioManager] Failed to connect microphone:', error);
      return false;
    }
  }

  /**
   * Connect to an HTML audio element
   */
  connectAudioElement(audioElement) {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    try {
      const source = this.audioContext.createMediaElementSource(audioElement);
      source.connect(this.analyser);
      source.connect(this.audioContext.destination); // Also play the audio
      
      this.isPlaying = true;
      console.log('[AudioManager] Connected to audio element');
      return true;
    } catch (error) {
      console.error('[AudioManager] Failed to connect audio element:', error);
      return false;
    }
  }

  /**
   * Connect to an audio file
   * @param {File} file - Audio file to analyze
   */
  async connectAudioFile(file) {
    if (!this.isInitialized) {
      throw new Error('AudioManager not initialized');
    }

    // Resume AudioContext if suspended (required by modern browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[AudioManager] AudioContext resumed for audio file');
    }

    try {
      // Stop any existing audio
      this.stop();

      // Create audio element
      const audio = document.createElement('audio');
      audio.src = URL.createObjectURL(file);
      audio.loop = true;
      audio.crossOrigin = 'anonymous';

      // Create MediaElementSource
      const source = this.audioContext.createMediaElementSource(audio);
      
      // Connect to analyser
      source.connect(this.analyser);
      source.connect(this.audioContext.destination); // Also play the audio

      // Store references
      this.currentSource = source;
      this.currentAudio = audio;

      // Start playing
      await audio.play();
      this.isPlaying = true;

      console.log('Audio file connected successfully');
    } catch (error) {
      console.error('Error connecting to audio file:', error);
      throw error;
    }
  }

  /**
   * Stop all audio sources and disconnect
   */
  stop() {
    this.isPlaying = false;
    
    if (this.currentConnection) {
      this.currentConnection.disconnect();
      this.currentConnection = null;
    }
    
    console.log('[AudioManager] Stopped audio input');
  }

  /**
   * Get the last audio parameters without updating analysis
   * @returns {Object} The last audio parameters
   */
  getLastAudioParams() {
    return this.audioParams;
  }

  /**
   * Update audio analysis - call this every frame
   */
  update() {
    if (!this.isInitialized || !this.isPlaying || !this.analyser) {
      this.audioParams.isActive = false;
      return this.audioParams;
    }

    // Get frequency and waveform data
    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.waveformData);

    // Calculate overall volume (RMS)
    let sum = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i] * this.frequencyData[i];
    }
    this.audioParams.volume = Math.sqrt(sum / this.frequencyData.length) / 255.0;

    // Calculate frequency bands (based on typical frequency ranges)
    const nyquist = this.audioContext.sampleRate / 2;
    const freqPerBin = nyquist / this.frequencyData.length;
    
    // Bass: 20-250 Hz
    const bassStart = Math.floor(20 / freqPerBin);
    const bassEnd = Math.floor(250 / freqPerBin);
    this.audioParams.bass = this.getAverageFrequency(bassStart, bassEnd);
    
    // Mid: 250-4000 Hz  
    const midStart = bassEnd;
    const midEnd = Math.floor(4000 / freqPerBin);
    this.audioParams.mid = this.getAverageFrequency(midStart, midEnd);
    
    // Treble: 4000+ Hz
    const trebleStart = midEnd;
    this.audioParams.treble = this.getAverageFrequency(trebleStart, this.frequencyData.length);

    // Beat detection based on bass energy
    this.detectBeat();

    // Copy arrays for shader use (convert to 0-1 range)
    this.audioParams.spectrum = Array.from(this.frequencyData).map(v => v / 255.0);
    this.audioParams.waveform = Array.from(this.waveformData).map(v => (v - 128) / 128.0);
    
    // Mark as active when audio is playing
    this.audioParams.isActive = this.isPlaying;
    
    return this.audioParams;
  }

  /**
   * Get Shadertoy-style audio texture data
   * Returns frequency data formatted for SQL texture sampling
   * @returns {Array} Array of frequency amplitudes for current frame
   */
  getAudioTextureData() {
    if (!this.isPlaying || !this.frequencyData) {
      // Return silence if no audio
      return new Array(512).fill(0.0);
    }

    // Convert frequency data to 0-1 range for texture sampling
    return Array.from(this.frequencyData).map(v => v / 255.0);
  }

  /**
   * Get audio texture data with time history (Shadertoy-style)
   * @param {number} historyFrames - Number of previous frames to include
   * @returns {Object} Audio texture data with current and historical frames
   */
  getAudioTextureWithHistory(historyFrames = 64) {
    // Initialize history buffer if needed
    if (!this.audioHistory) {
      this.audioHistory = [];
    }

    // Get current frame data
    const currentFrame = this.getAudioTextureData();
    
    // Add current frame to history
    this.audioHistory.unshift(currentFrame);
    
    // Limit history size
    if (this.audioHistory.length > historyFrames) {
      this.audioHistory = this.audioHistory.slice(0, historyFrames);
    }

    return {
      width: currentFrame.length,  // Frequency bins (typically 512)
      height: this.audioHistory.length,  // Time frames
      data: this.audioHistory
    };
  }

  /**
   * Sample audio texture at specific UV coordinates (Shadertoy equivalent)
   * Equivalent to: texture(iChannel0, vec2(u, v)).x
   * @param {number} u - Frequency position (0-1)
   * @param {number} v - Time position (0-1, where 0 = current frame)
   * @returns {number} Audio amplitude at that position
   */
  sampleAudioTexture(u, v = 0.0) {
    const audioTexture = this.getAudioTextureWithHistory();
    
    // Convert UV to array indices
    const freqBin = Math.floor(u * (audioTexture.width - 1));
    const timeFrame = Math.floor(v * (audioTexture.height - 1));
    
    // Bounds check
    if (timeFrame >= audioTexture.data.length || freqBin >= audioTexture.width) {
      return 0.0;
    }
    
    return audioTexture.data[timeFrame][freqBin] || 0.0;
  }

  /**
   * Calculate average frequency in a range
   */
  getAverageFrequency(startBin, endBin) {
    let sum = 0;
    let count = 0;
    for (let i = startBin; i < endBin && i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i];
      count++;
    }
    return count > 0 ? (sum / count) / 255.0 : 0;
  }

  /**
   * Simple beat detection algorithm
   */
  detectBeat() {
    const currentTime = performance.now() / 1000.0;
    
    // Use bass energy for beat detection
    const energy = this.audioParams.bass;
    
    // Keep history of recent bass energy
    this.beatHistory.push(energy);
    if (this.beatHistory.length > 10) {
      this.beatHistory.shift();
    }
    
    // Calculate average energy
    const avgEnergy = this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length;
    
    // Beat detected if current energy is significantly higher than average
    const isBeat = energy > avgEnergy * this.beatThreshold && 
                   (currentTime - this.lastBeatTime) > 0.2; // Minimum gap between beats
    
    if (isBeat) {
      this.audioParams.beat = 1.0;
      this.lastBeatTime = currentTime;
      this.audioParams.beatTime = 0.0;
    } else {
      this.audioParams.beat = Math.max(0, this.audioParams.beat - 0.05); // Decay
      this.audioParams.beatTime = currentTime - this.lastBeatTime;
    }
  }

  /**
   * Resume audio context (required for user interaction)
   */
  async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[AudioManager] Audio context resumed');
    }
  }

  /**
   * Get current audio parameters for shader
   */
  getAudioParams() {
    return this.audioParams;
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
    this.isPlaying = false;
  }
}