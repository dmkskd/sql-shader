/**
 * Strudel Input Source for AudioManager
 * Provides live coding pattern-based audio input using Strudel.cc library
 * 
 * ⚠️ IMPORTANT LICENSE NOTICE ⚠️
 * 
 * This file integrates with Strudel (https://strudel.cc), which is licensed
 * under the GNU Affero General Public License v3.0 (AGPL-3.0).
 * 
 * The Strudel library is loaded dynamically from https://strudel.cc and is NOT
 * included in this repository. However, if you deploy SQL Shader as a network
 * service with this Strudel integration enabled, you MUST comply with AGPL-3.0,
 * which requires making your source code available.
 * 
 * For details on AGPL-3.0 compliance, see:
 * - https://www.gnu.org/licenses/agpl-3.0.html
 * - THIRD-PARTY-LICENSES.md in the project root
 * 
 * To remove this AGPL dependency, delete this file and remove the audio button
 * integration from the main application.
 * 
 * ---
 * 
 * Copyright 2025 SQL Shader Contributors
 * 
 * The SQL Shader codebase (excluding Strudel library) is licensed under the
 * Apache License, Version 2.0. See LICENSE file for details.
 */
export class StrudelInput {
  constructor() {
    this.isInitialized = false;
    this.isPlaying = false;
    this.strudelAPI = null;
  }

  /**
   * Get the display name for this input source
   */
  getName() {
    return 'Strudel Live Coding';
  }

  /**
   * Initialize Strudel library
   */
  async initialize(statusCallback = () => {}) {
    if (this.isInitialized) return;

    try {
      // Wait for Strudel to load
      let attempts = 0;
      while (!window.initStrudel && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.initStrudel) {
        throw new Error('initStrudel not found after waiting');
      }

      // Initialize Strudel
      await window.initStrudel({
        prebake: () => window.samples('github:tidalcycles/dirt-samples'),
      });

      // Store function references immediately after init (like successful Tests 1 & 2)
      // This captures the functions in their initial working state
      this.strudelAPI = {
        evaluate: window.evaluate || (window.strudel && window.strudel.evaluate),
        hush: window.hush || (window.strudel && window.strudel.hush)
      };

      if (!this.strudelAPI.evaluate) {
        throw new Error('Required Strudel evaluate function not available');
      }

      // Patch: Expose Strudel's internal audio context for analyser connection
      if (window.strudel) {
        // Try to get the audio context
        let strudelCtx = null;
        if (typeof window.strudel.getAudioContext === 'function') {
          try {
            strudelCtx = window.strudel.getAudioContext();
            window.strudel.ctx = strudelCtx;
            console.log('[StrudelInput] Got audio context via getAudioContext()');
          } catch (e) {
            console.warn('[StrudelInput] getAudioContext() failed:', e.message);
          }
        }
        
        // Fallback: search for AudioContext
        if (!window.strudel.ctx) {
          if (window.strudel.audioContext) {
            window.strudel.ctx = window.strudel.audioContext;
            strudelCtx = window.strudel.audioContext;
            console.log('[StrudelInput] Exposed audioContext as window.strudel.ctx');
          } else {
            for (const key of Object.keys(window.strudel)) {
              if (
                window.strudel[key] &&
                window.strudel[key].constructor &&
                window.strudel[key].constructor.name === 'AudioContext'
              ) {
                window.strudel.ctx = window.strudel[key];
                strudelCtx = window.strudel[key];
                console.log(`[StrudelInput] Found and exposed audio context as window.strudel.ctx (key: ${key})`);
                break;
              }
            }
          }
        }
        
        // EXPERIMENTAL: Monkey-patch createGain to auto-connect analyser later
        if (strudelCtx && !strudelCtx._gainPatched) {
          const originalCreateGain = strudelCtx.createGain.bind(strudelCtx);
          const self = this; // Capture 'this' for use in closure
          
          strudelCtx.createGain = function() {
            const gainNode = originalCreateGain();
            
            // Store reference to all gain nodes created
            if (!strudelCtx._gainNodes) strudelCtx._gainNodes = [];
            strudelCtx._gainNodes.push(gainNode);
            
            // If we have a pending analyser, try to connect this new gain node
            if (self.pendingAnalyser && self.sameContext) {
              try {
                // Create a splitter so we can tap into the audio without breaking the chain
                gainNode.connect(self.pendingAnalyser);
                console.log(`[StrudelInput] Auto-connected new gain node #${strudelCtx._gainNodes.length} to analyser`);
                
                // Mark the first successful connection
                if (!self.audioTapNode) {
                  self.audioTapNode = gainNode;
                }
              } catch (error) {
                console.warn('Could not auto-connect gain node:', error);
              }
            }
            
            return gainNode;
          };
          
          strudelCtx._gainPatched = true;
          console.log('[StrudelInput] Patched createGain to track and auto-connect audio nodes');
        }
        
        if (!window.strudel.ctx) {
          console.warn('[StrudelInput] Could not find Strudel audio context to expose');
        }
      }

      this.isInitialized = true;
      statusCallback('Strudel initialized successfully');
      console.log('✅ Strudel initialized successfully');
      console.log('Stored evaluate function:', this.strudelAPI.evaluate === window.evaluate ? 'window.evaluate' : 'window.strudel.evaluate');
    } catch (error) {
      console.error('❌ Failed to initialize Strudel:', error);
      statusCallback('Failed to initialize Strudel: ' + error.message);
      throw error;
    }
  }

  /**
   * Play a Strudel pattern
   * @param {string} patternString - Strudel pattern code
   */
  async playPattern(patternString) {
    try {
      // Use stored function references (like successful Tests 1 & 2)
      // This approach is stable across Strudel state changes
      if (!this.strudelAPI || !this.strudelAPI.evaluate) {
        throw new Error('Strudel not properly initialized - call initialize() first');
      }
      
      console.log('Playing Strudel pattern:', patternString);
      
      // Stop any existing patterns first
      if (this.strudelAPI.hush) {
        this.strudelAPI.hush();
      }
      
      // Try to expose Strudel's audio context after first pattern play
      // (Strudel may create AudioContext lazily)
      const ctxWasFound = !window.strudel.ctx;
      if (window.strudel && !window.strudel.ctx) {
        console.log('[StrudelInput] Searching for Strudel audio context after pattern play...');
        
        // Check if getAudioContext exists
        if (typeof window.strudel.getAudioContext === 'function') {
          window.strudel.ctx = window.strudel.getAudioContext();
          console.log('[StrudelInput] Exposed via getAudioContext()');
        } else {
          // Search for AudioContext in window.strudel properties
          for (const key of Object.keys(window.strudel)) {
            if (
              window.strudel[key] &&
              window.strudel[key].constructor &&
              window.strudel[key].constructor.name === 'AudioContext'
            ) {
              window.strudel.ctx = window.strudel[key];
              console.log(`[StrudelInput] Found audio context at window.strudel.${key}`);
              break;
            }
          }
        }
        
        // If we just found the context, notify AudioManager to reconnect
        if (window.strudel.ctx && this.onAudioContextFound) {
          console.log('[StrudelInput] Notifying AudioManager of found audio context...');
          // IMPORTANT: Reconnect IMMEDIATELY before any patterns play
          // This ensures we patch the destination before Strudel routes audio
          this.onAudioContextFound();
        }
      }
      
      // Check Strudel's audio context state
      if (window.strudel && window.strudel.ctx) {
        console.log('Strudel audio context state:', window.strudel.ctx.state);
        console.log('Strudel audio context sample rate:', window.strudel.ctx.sampleRate);
        
        // Try to resume audio context if suspended
        if (window.strudel.ctx.state === 'suspended') {
          console.log('Resuming suspended Strudel audio context...');
          await window.strudel.ctx.resume();
        }
      }
      
      // Use stored function reference with error handling for Strudel's internal issues
      try {
        const result = await this.strudelAPI.evaluate(patternString);
        console.log('Pattern evaluated, result:', typeof result);
        
        // After pattern evaluation, try to connect analyser if pending
        if (this.pendingAnalyser && this.sameContext) {
          console.log('[StrudelInput] Attempting post-pattern analyser connection...');
          const strudelCtx = window.strudel.ctx;
          
          if (strudelCtx._gainNodes && strudelCtx._gainNodes.length > 0) {
            console.log(`Found ${strudelCtx._gainNodes.length} gain nodes after pattern start`);
            const masterGain = strudelCtx._gainNodes[strudelCtx._gainNodes.length - 1];
            
            try {
              masterGain.connect(this.pendingAnalyser);
              console.log('✅ Connected master gain to analyser after pattern start');
              this.audioTapNode = masterGain;
              this.pendingAnalyser = null;
            } catch (error) {
              console.warn('Post-pattern connection failed:', error);
            }
          }
        }
      } catch (evalError) {
        console.warn('Pattern evaluation had internal error, but this might be normal for Strudel:', evalError.message);
        // Don't throw - Strudel might have internal errors but still work
      }
      
      // Additional check - see if there are any playing patterns
      if (window.strudel && window.strudel.scheduler) {
        console.log('Strudel scheduler state:', {
          started: window.strudel.scheduler.started,
          cps: window.strudel.scheduler.cps
        });
      }
      
      this.isPlaying = true;
      return true;
    } catch (error) {
      console.error('Failed to play Strudel pattern:', error);
      throw error;
    }
  }

  /**
   * Stop current playback
   */
  stop() {
    try {
      const hushFunc = window.hush || (window.strudel && window.strudel.hush);
      if (hushFunc) {
        hushFunc();
        this.isPlaying = false;
        console.log('Strudel playback stopped');
      } else {
        console.warn('Strudel hush function not available');
      }
    } catch (error) {
      console.error('Failed to stop Strudel:', error);
    }
  }

  /**
   * Get test patterns for demonstration
   */
  getTestPatterns() {
    return [
      {
        name: 'Simple Drums',
        pattern: 's("bd sd")'
      },
      {
        name: 'Full Kit', 
        pattern: 's("bd sd, hh*8, ~ cp")'
      },
      {
        name: 'House Beat', 
        pattern: 's("bd*2 ~ sd ~").fast(2)'
      },
      {
        name: 'Melody',
        pattern: 'note("c3 e3 g3 c4").sound("sawtooth").lpf(800)'
      },
      {
        name: 'Multiline',
        pattern: `
          let s = 'C:minor'

          $: stack(
              n("<0 2 4>*4")
            .add(0)
            .off(3/8, add("<4 2 3 1 5 2 3 1>/2"))
            .scale(s).sound("supersaw").detune(0.1).room(1).rfade(4).lpf(cosine.slow(16).range(600,1200)).clip(0.6).lpq(12)
          )

          $: stack(
              n("<0 2 4 0 2 4 0 2 4 0>*4")
            .add(14)
            .off(3/8, add("<1 3 2 4 4 5 3 2>/2")).distort("2.2:.3")
            .scale(s).sound("sawtooth").detune(1.1).room(1).rfade(4).clip(0.1).lpf(cosine.slow(16).range(600,1200))
          )

          $: stack(
            n("<1 0 1 0 1 0 <1 ~> <0 ~>>*4 ").sound("bd").clip(0.4).room(0.2),
            n("1 ~ 1 ~ 1 ~ 1 ~ 1 ~ 1 ~ 1 ~ 1 ~").sound("hh"),
            n("~ 10 ~ <10 ~>").sound("oh").clip(0.2).rfade(32).room(0.7)
          )
        `
      },
      {
        name: 'Complex Pattern',
        pattern: 'stack(s("bd sd"), note("c2 g2").sound("sawtooth").lpf(400))'
      }
    ];
  }

  /**
   * Check if this input source is currently playing
   */
  isActive() {
    return this.isPlaying;
  }

  /**
   * Check if this input source is ready to use
   */
  isReady() {
    const evaluateFunc = window.evaluate || (window.strudel && window.strudel.evaluate);
    return this.isInitialized && !!evaluateFunc;
  }

  /**
   * Connect to audio analysis
   * This is called by AudioManager when this input is selected
   */
  connectToAnalyser(analyser) {
    try {
      // Strudel uses Web Audio API internally, we need to connect its output
      // to our analyser node for frequency analysis
      
      console.log('Attempting to connect Strudel to analyser...');
      
      // Try to find Strudel's audio context and destination
      if (window.strudel && window.strudel.ctx) {
        const strudelContext = window.strudel.ctx;
        console.log('Found Strudel audio context:', strudelContext);
        
        // Check if we're using the same audio context
        if (strudelContext === analyser.context) {
          // Same context - create a MediaStreamDestination to tap into the audio
          console.log('Same AudioContext - using MediaStreamDestination for audio capture');
          
          try {
            // Create a MediaStreamDestination connected to context.destination
            // This captures all audio going to speakers
            const streamDest = strudelContext.createMediaStreamDestination();
            
            // IMPORTANT: We need to patch the destination to capture audio
            // Create a gain node to split the signal
            const splitter = strudelContext.createGain();
            splitter.gain.value = 1.0;
            
            // Store original destination for later
            const originalDestination = strudelContext.destination;
            
            // Monkey-patch connect on ALL AudioNodes to intercept destination connections
            const originalConnect = AudioNode.prototype.connect;
            const capturedNodes = new Set();
            
            AudioNode.prototype.connect = function(...args) {
              const destination = args[0];
              
              // If connecting to destination and from Strudel's context
              if (destination === originalDestination && this.context === strudelContext) {
                if (!capturedNodes.has(this)) {
                  capturedNodes.add(this);
                  
                  // Connect source -> splitter -> destination + analyser
                  originalConnect.call(this, splitter);
                  originalConnect.call(splitter, originalDestination);
                  originalConnect.call(splitter, analyser);
                  
                  return splitter;
                }
              }
              
              // Normal connection
              return originalConnect.apply(this, args);
            };
            
            console.log('✅ Patched AudioNode.prototype.connect to intercept destination connections');
            this.audioTapNode = splitter;
            this._connectPatched = true;
            return true;
          } catch (error) {
            console.warn('Same context connection failed:', error);
            this.pendingAnalyser = analyser;
            this.sameContext = true;
            return true;
          }
        } else {
          // Different contexts - use MediaStream bridge
          console.log('Different audio contexts detected, using MediaStream bridge...');
          
          // Look for Strudel's gain node first - check if it's actually a Web Audio node
          let strudelOutput = null;
          
          // No output node available - use passive listening via system audio capture
          console.log('No direct output node available');
          console.log('Will attempt passive audio capture from context...');
          
          if (strudelOutput && typeof strudelOutput.connect === 'function') {
            console.log('Using Strudel output node:', strudelOutput);
            // Connect Strudel output to MediaStreamDestination
            const streamDestination = strudelContext.createMediaStreamDestination();
            strudelOutput.connect(streamDestination);
            strudelOutput.connect(strudelContext.destination);
            
            // Connect MediaStreamSource to analyser
            const streamSource = analyser.context.createMediaStreamSource(streamDestination.stream);
            streamSource.connect(analyser);
            
            console.log('✅ Connected Strudel to analyser via MediaStream');
            this.audioTapNode = streamSource;
            return true;
          } else {
            // Last resort: Create a silent monitoring node that captures system audio
            // This uses the browser's ability to capture audio from a tab
            console.log('Attempting system audio capture...');
            
            try {
              // Create a silent audio element to ensure audio is being played
              // Then capture it using the analyser context
              console.warn('⚠️ Cannot directly connect to Strudel audio');
              console.log('Audio will play but analysis may not work without direct connection');
              console.log('Suggesting: Use same AudioContext for both systems');
              return false;
            } catch (error) {
              console.error('System audio capture failed:', error);
              return false;
            }
          }
        }
        
        console.log('Strudel audio connection established');
        return true;
      } else {
        console.warn('Could not find Strudel audio context');
        return false;
      }
    } catch (error) {
      console.error('Failed to connect Strudel to analyser:', error);
      return false;
    }
  }

  /**
   * Disconnect from audio analysis
   */
  disconnect() {
    try {
      // Disconnect our audio tap if it exists
      if (this.audioTapNode) {
        this.audioTapNode.disconnect();
        this.audioTapNode = null;
        console.log('Disconnected Strudel audio tap');
      }
    } catch (error) {
      console.error('Error disconnecting audio tap:', error);
    }
    
    this.stop();
    console.log('Strudel input disconnected');
  }
}