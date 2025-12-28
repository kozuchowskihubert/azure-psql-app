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
    if (!this.webViewRef || !this.webViewRef.current) {
      console.warn('⚠️ WebView not ready, queueing command:', command);
      this.commandQueue.push({ command, params });
      return;
    }
    
    const message = JSON.stringify({ command, params });
    const js = `
      if (window.processCommand) {
        window.processCommand(${message});
      } else {
        console.error('processCommand not available');
      }
    `;
    
    this.webViewRef.current.injectJavaScript(js);
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
