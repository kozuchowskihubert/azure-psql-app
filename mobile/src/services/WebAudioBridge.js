/**
 * HAOS.fm WebAudio Bridge
 * Bridges React Native with Web Audio API running in hidden WebView
 * 
 * Architecture:
 * React Native (UI) ↔ WebAudioBridge ↔ WebView (Web Audio API)
 * 
 * Communication:
 * - Commands: RN → WebView (playKick, setFilter, etc.)
 * - Events: WebView → RN (waveform data, audio levels, etc.)
 */

class WebAudioBridge {
  constructor() {
    this.webViewRef = null;
    this.messageHandlers = new Map();
    this.isReady = false;
    this.commandQueue = [];
    
    console.log('🌉 WebAudioBridge initialized');
  }
  
  /**
   * Set WebView reference
   */
  setWebViewRef(ref) {
    this.webViewRef = ref;
    console.log('🌉 WebView reference set');
  }
  
  /**
   * Mark bridge as ready (called when WebView loads)
   */
  setReady(ready = true) {
    this.isReady = ready;
    console.log(`🌉 Bridge ready: ${ready}`);
    
    // Process queued commands
    if (ready && this.commandQueue.length > 0) {
      console.log(`🌉 Processing ${this.commandQueue.length} queued commands`);
      this.commandQueue.forEach(cmd => this.sendCommand(cmd.command, cmd.params));
      this.commandQueue = [];
    }
  }
  
  /**
   * Send command to WebView
   */
  sendCommand(command, params = {}) {
    // Handle both direct ref and ref.current patterns
    const webView = this.webViewRef?.current || this.webViewRef;
    
    if (!webView) {
      console.warn('⚠️ WebView not ready, queueing command:', command);
      this.commandQueue.push({ command, params });
      return;
    }
    
    const message = JSON.stringify({ command, params });
    // Escape single quotes and backslashes in JSON string
    const escapedMessage = message.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const js = `
      (function() {
        try {
          if (window.processCommand) {
            const msg = JSON.parse('${escapedMessage}');
            window.processCommand(msg);
          } else {
            console.error('processCommand not available');
          }
        } catch(e) {
          console.error('sendCommand error:', e);
        }
      })();
      true;
    `;
    
    webView.injectJavaScript(js);
    console.log(`🌉 → WebView: ${command}`, params);
  }
  
  /**
   * Handle message from WebView
   */
  onMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log(`🌉 ← WebView: ${data.type}`, data.payload);
      
      const handler = this.messageHandlers.get(data.type);
      if (handler) {
        handler(data.payload);
      }
      
      // Special handling for ready event
      if (data.type === 'ready') {
        this.setReady(true);
      }
    } catch (error) {
      console.error('❌ Error parsing WebView message:', error);
    }
  }
  
  /**
   * Register message handler
   */
  on(type, handler) {
    this.messageHandlers.set(type, handler);
    console.log(`🌉 Registered handler: ${type}`);
  }
  
  /**
   * Unregister message handler
   */
  off(type) {
    this.messageHandlers.delete(type);
    console.log(`🌉 Unregistered handler: ${type}`);
  }
  
  // ========================================
  // AUDIO ENGINE COMMANDS
  // ========================================
  
  /**
   * Initialize audio context
   */
  initAudio() {
    this.sendCommand('initAudio');
  }
  
  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume) {
    this.sendCommand('setMasterVolume', { volume });
  }
  
  // ========================================
  // DRUM SYNTHESIS
  // ========================================
  
  /**
   * Play kick drum
   */
  playKick(params = {}) {
    this.sendCommand('playKick', {
      pitch: params.pitch || 150,
      decay: params.decay || 0.3,
    });
  }
  
  /**
   * Play snare drum
   */
  playSnare(params = {}) {
    this.sendCommand('playSnare', {
      tone: params.tone || 0.2,
    });
  }
  
  /**
   * Play hi-hat
   */
  playHiHat(params = {}) {
    this.sendCommand('playHiHat', {
      decay: params.decay || 0.05,
    });
  }
  
  /**
   * Play clap
   */
  playClap() {
    this.sendCommand('playClap');
  }
  
  // ========================================
  // BASS/SYNTH SYNTHESIS
  // ========================================
  
  /**
   * Play bass note
   */
  playBass(frequency, duration = 0.2) {
    this.sendCommand('playBass', { frequency, duration });
  }
  
  /**
   * Play synth note
   */
  playSynthNote(frequency, duration = 0.5) {
    this.sendCommand('playSynthNote', { frequency, duration });
  }
  
  // ========================================
  // CLASSIC SYNTHESIZERS
  // ========================================
  
  /**
   * Play ARP 2600 note (3-oscillator semi-modular synth)
   * @param {number} frequency - Note frequency in Hz
   * @param {number} duration - Note duration in seconds
   * @param {number} velocity - Velocity 0-1
   * @param {number} detune - Oscillator detune amount (default 0.02)
   */
  playARP2600(frequency, duration = 0.5, velocity = 1.0, detune = 0.02, params = {}) {
    this.sendCommand('playARP2600', { 
      frequency, 
      duration, 
      velocity, 
      detune,
      ...params  // Pass all extra parameters (osc1Level, osc2Level, filterCutoff, etc.)
    });
  }
  
  /**
   * Play Juno-106 note (DCO synth with chorus)
   * @param {number} frequency - Note frequency in Hz
   * @param {number} duration - Note duration in seconds
   * @param {number} velocity - Velocity 0-1
   * @param {boolean} chorus - Enable chorus effect (default true)
   */
  playJuno106(frequency, duration = 0.5, velocity = 1.0, chorus = true) {
    this.sendCommand('playJuno106', { frequency, duration, velocity, chorus });
  }
  
  /**
   * Play Minimoog note (3-oscillator analog legend)
   * @param {number} frequency - Note frequency in Hz
   * @param {number} duration - Note duration in seconds
   * @param {number} velocity - Velocity 0-1
   */
  playMinimoog(frequency, duration = 0.5, velocity = 1.0) {
    this.sendCommand('playMinimoog', { frequency, duration, velocity });
  }
  
  /**
   * Play TB-303 note (acid bass line)
   * @param {number} frequency - Note frequency in Hz
   * @param {number} duration - Note duration in seconds
   * @param {number} velocity - Velocity 0-1
   * @param {boolean} accent - Accent note (louder, brighter)
   * @param {boolean} slide - Slide from previous note
   * @param {number} slideFrom - Frequency to slide from
   * @param {string} waveform - 'sawtooth' or 'square'
   */
  playTB303(frequency, duration = 0.2, velocity = 1.0, accent = false, slide = false, slideFrom = null, waveform = 'sawtooth') {
    this.sendCommand('playTB303', { 
      frequency, 
      duration, 
      velocity, 
      accent, 
      slide, 
      slideFrom: slideFrom || frequency,
      waveform 
    });
  }
  
  /**
   * Play professional bass note with full synthesis parameters
   * @param {number} frequency - Note frequency in Hz
   * @param {number} duration - Note duration in seconds
   * @param {number} velocity - Velocity 0-1
   * @param {object} params - Bass synthesis parameters
   *   - osc1Level: Oscillator 1 level (0-1)
   *   - osc2Level: Oscillator 2 level (0-1)
   *   - detune: Oscillator 2 detune in cents (0-50)
   *   - cutoff: Filter cutoff frequency (50-5000 Hz)
   *   - resonance: Filter resonance/Q (0-20)
   *   - envAmount: Envelope modulation amount (0-1)
   *   - attack: Envelope attack time (0.001-2)
   *   - decay: Envelope decay time (0.01-2)
   *   - sustain: Envelope sustain level (0-1)
   *   - release: Envelope release time (0.01-3)
   *   - distortion: Distortion amount (0-100)
   *   - chorus: Chorus amount (0-100)
   *   - compression: Compression amount (0-100)
   */
  playBassNote(frequency, duration = 1.0, velocity = 0.8, params = {}) {
    this.sendCommand('playBassNote', { 
      frequency, 
      duration, 
      velocity,
      // Default parameters
      osc1Level: params.osc1Level !== undefined ? params.osc1Level : 0.8,
      osc2Level: params.osc2Level !== undefined ? params.osc2Level : 0.6,
      detune: params.detune !== undefined ? params.detune : 5,
      cutoff: params.cutoff !== undefined ? params.cutoff : 1000,
      resonance: params.resonance !== undefined ? params.resonance : 5,
      envAmount: params.envAmount !== undefined ? params.envAmount : 0.5,
      attack: params.attack !== undefined ? params.attack : 0.01,
      decay: params.decay !== undefined ? params.decay : 0.3,
      sustain: params.sustain !== undefined ? params.sustain : 0.7,
      release: params.release !== undefined ? params.release : 0.5,
      distortion: params.distortion !== undefined ? params.distortion : 20,
      chorus: params.chorus !== undefined ? params.chorus : 30,
      compression: params.compression !== undefined ? params.compression : 50,
    });
  }

  /**
   * Stop all notes
   */
  stopAllNotes() {
    this.sendCommand('stopAllNotes');
  }
  
  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Set filter parameters
   */
  setFilter(type, frequency, Q) {
    this.sendCommand('setFilter', { type, frequency, Q });
  }
  
  /**
   * Set distortion amount (0-100)
   */
  setDistortion(amount) {
    this.sendCommand('setDistortion', { amount });
  }
  
  /**
   * Set reverb amount (0-100)
   */
  setReverb(amount) {
    this.sendCommand('setReverb', { amount });
  }
  
  /**
   * Set delay parameters
   */
  setDelay(time, feedback, mix) {
    this.sendCommand('setDelay', { time, feedback, mix });
  }
  
  /**
   * Set compression parameters
   */
  setCompression(threshold, ratio, attack, release) {
    this.sendCommand('setCompression', { threshold, ratio, attack, release });
  }
  
  // ========================================
  // SYNTH PARAMETERS
  // ========================================
  
  /**
   * Update synth parameter
   */
  updateSynthParam(param, value) {
    this.sendCommand('updateSynthParam', { param, value });
  }
  
  /**
   * Set ADSR envelope
   */
  setADSR(attack, decay, sustain, release) {
    this.sendCommand('setADSR', { attack, decay, sustain, release });
  }
  
  /**
   * Set oscillator waveform
   */
  setWaveform(waveform) {
    this.sendCommand('setWaveform', { waveform });
  }
  
  // ========================================
  // VISUALIZATION
  // ========================================
  
  /**
   * Request waveform data
   * Data will be returned via 'waveform' event
   */
  requestWaveform() {
    this.sendCommand('getWaveform');
  }
  
  /**
   * Request audio level (dB)
   * Data will be returned via 'audioLevel' event
   */
  requestAudioLevel() {
    this.sendCommand('getAudioLevel');
  }
  
  /**
   * Start continuous waveform updates
   */
  startWaveformUpdates(intervalMs = 50) {
    this.sendCommand('startWaveformUpdates', { interval: intervalMs });
  }
  
  /**
   * Stop continuous waveform updates
   */
  stopWaveformUpdates() {
    this.sendCommand('stopWaveformUpdates');
  }
  
  // ========================================
  // SEQUENCER
  // ========================================
  
  /**
   * Set BPM
   */
  setBPM(bpm) {
    this.sendCommand('setBPM', { bpm });
  }
  
  /**
   * Start sequencer
   */
  startSequencer() {
    this.sendCommand('startSequencer');
  }
  
  /**
   * Stop sequencer
   */
  stopSequencer() {
    this.sendCommand('stopSequencer');
  }
  
  /**
   * Set pattern for sequencer
   */
  setPattern(pattern) {
    this.sendCommand('setPattern', { pattern });
  }
  
  // ========================================
  // UTILITY
  // ========================================
  
  /**
   * Clean up
   */
  dispose() {
    this.messageHandlers.clear();
    this.webViewRef = null;
    this.isReady = false;
    this.commandQueue = [];
    console.log('🌉 WebAudioBridge disposed');
  }
}

// Singleton instance
const webAudioBridge = new WebAudioBridge();

export default webAudioBridge;
