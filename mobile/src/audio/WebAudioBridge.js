/**
 * HAOS.fm Web Audio Synth Bridge
 * Uses invisible WebView to run Web Audio API
 * Provides native-like playNote() interface
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import servicesWebAudioBridge from '../services/WebAudioBridge';

class WebAudioSynthBridge {
  constructor() {
    this.webViewRef = null;
    this.isReady = false;
    this.messageQueue = [];
    this.messageHandlers = new Map();
  }

  setWebView(webView) {
    this.webViewRef = webView;
  }

  sendMessage(message) {
    if (!this.webViewRef) {
      console.warn('WebView not ready, queuing message');
      this.messageQueue.push(message);
      return;
    }

    console.log('📤 Sending message to WebView:', message.type);
    
    // Call the function directly instead of using window.postMessage
    const messageStr = JSON.stringify(message).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const js = `
      (function() {
        try {
          const msg = ${JSON.stringify(message)};
          handleMessage(msg);
        } catch(e) {
          console.error('WebView message error:', e);
        }
      })();
      true;
    `;
    
    this.webViewRef.injectJavaScript(js);
  }

  onMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'ready':
          console.log('Web Audio Bridge: Ready');
          this.sendMessage({ type: 'init' });
          break;
          
        case 'init_success':
          console.log('Web Audio Bridge: Initialized at', data.sampleRate, 'Hz');
          this.isReady = true;
          
          // Send queued messages
          while (this.messageQueue.length > 0) {
            this.sendMessage(this.messageQueue.shift());
          }
          break;
          
        case 'init_error':
          console.error('Web Audio Bridge: Init error:', data.error);
          break;
      }
      
      // Call custom handlers
      const handler = this.messageHandlers.get(data.type);
      if (handler) {
        handler(data);
      }
      
    } catch (error) {
      console.error('Web Audio Bridge: Message parse error:', error);
    }
  }

  resumeAudio() {
    // Resume audio context (required for iOS)
    this.sendMessage({ type: 'resume_audio' });
  }

  playNote(note, options = {}) {
    const {
      velocity = 1.0,
      accent = false,
      duration = 0.2,
    } = options;

    this.sendMessage({
      type: 'play_note',
      note,
      velocity,
      accent,
      duration,
    });
  }

  updateParams(params) {
    this.sendMessage({
      type: 'update_params',
      params,
    });
  }

  updateEffectsParams(params) {
    this.sendMessage({
      type: 'update_effects_params',
      params,
    });
  }

  setTrackSend(track, sendType, value) {
    this.sendMessage({
      type: 'set_track_send',
      track,
      sendType,
      value,
    });
  }

  setTrackParam(track, param, value) {
    this.sendMessage({
      type: 'set_track_param',
      track,
      param,
      value,
    });
  }

  // **Enhanced Bass Note Manipulation Methods**
  
  /**
   * Play bass note with slide/portamento
   * @param {string} note - Note name (e.g. 'C2')
   * @param {object} options - {velocity, accent, duration, slide, pitchBend, vibrato, subOsc}
   */
  playBassSlide(note, options = {}) {
    const {
      velocity = 1.0,
      accent = false,
      duration = 0.5,
      slide = 0.1,        // Slide time in seconds
      pitchBend = 0,      // Pitch bend in semitones
      vibrato = 0,        // Vibrato depth 0-1
      subOsc = false,     // Enable sub-oscillator
    } = options;

    this.sendMessage({
      type: 'play_bass_slide',
      note,
      velocity,
      accent,
      duration,
      slide,
      pitchBend,
      vibrato,
      subOsc,
    });
  }

  /**
   * Play stacked bass note (multiple octaves)
   * @param {string} note - Base note name
   * @param {object} options - {velocity, accent, duration, octaves}
   */
  playBassStack(note, options = {}) {
    const {
      velocity = 1.0,
      accent = false,
      duration = 0.5,
      octaves = 2,        // Number of octaves to stack (1-3)
    } = options;

    this.sendMessage({
      type: 'play_bass_stack',
      note,
      velocity,
      accent,
      duration,
      octaves,
    });
  }

  stopAll() {
    this.sendMessage({
      type: 'stop_all',
    });
  }
}

// Singleton instance
const bridge = new WebAudioSynthBridge();

// React Component
export const WebAudioBridgeComponent = () => {
  const webViewRef = useRef(null);

  useEffect(() => {
    if (webViewRef.current) {
      bridge.setWebView(webViewRef.current);
      // ALSO set reference in services/WebAudioBridge for audioEngine
      servicesWebAudioBridge.setWebViewRef(webViewRef.current);
      console.log('🌉 Both audio bridges connected to WebView');
    }
  }, []);

  const htmlSource = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HAOS.fm Web Audio Bridge</title>
</head>
<body style="margin:0;padding:0;background:transparent;">
  <script>
    let audioContext = null;
    let masterGain = null;
    
    // Master effects chain nodes
    let masterDryGain = null;       // Dry signal path
    let masterMergeGain = null;     // Merge wet + dry
    let distortion = null;          // WaveShaperNode
    let reverb = null;              // ConvolverNode
    let reverbSend = null;          // Reverb send gain
    let reverbReturn = null;        // Reverb return gain
    let delay = null;               // DelayNode
    let delayFeedback = null;       // Delay feedback gain
    let delaySend = null;           // Delay send gain
    let delayReturn = null;         // Delay return gain
    let compressor = null;          // DynamicsCompressorNode
    let masterFilter = null;        // BiquadFilterNode
    
    // Advanced effects nodes
    let phaser = null;              // Array of all-pass filters
    let phaserLFO = null;           // Oscillator for phaser modulation
    let phaserLFOGain = null;       // LFO depth control
    let phaserMixGain = null;       // Phaser wet/dry mix
    let flanger = null;             // DelayNode
    let flangerLFO = null;          // Oscillator for flanger modulation
    let flangerLFOGain = null;      // LFO depth control
    let flangerFeedback = null;     // Feedback gain
    let flangerMixGain = null;      // Flanger wet/dry mix
    let chorus = null;              // Array of delays
    let chorusLFOs = null;          // Array of LFOs
    let chorusMixGain = null;       // Chorus wet/dry mix
    let bitcrusher = null;          // WaveShaperNode
    let bitcrusherMixGain = null;   // Bitcrusher wet/dry mix
    let ringMod = null;             // GainNode
    let ringModOsc = null;          // Carrier oscillator
    let ringModMixGain = null;      // Ring mod wet/dry mix
    
    // Track-specific nodes (per-track routing)
    const trackNodes = {};          // Stores {filter, gain, pan, reverbSend, delaySend} per track
    
    // TB-303 parameters
    let tb303Params = {
      cutoff: 500,
      resonance: 10,
      envMod: 3000,
      decay: 0.3,
      accent: 1.5,
      waveform: 'sawtooth'
    };
    
    // TR-808 parameters
    let tr808Params = {
      kickPitch: 60,      // Starting pitch in Hz
      kickDecay: 0.5,     // Decay time
      snareTone: 200,     // Snare tone frequency
      snareNoise: 0.7,    // Noise amount
      hihatDecay: 0.05,   // Hi-hat decay
    };
    
    // ARP 2600 parameters  
    let arp2600Params = {
      osc1: 'sawtooth',
      osc2: 'square',
      osc2Detune: 0.02,
      filterCutoff: 2000,
      filterRes: 5,
      attack: 0.01,
      decay: 0.3,
      sustain: 0.7,
      release: 0.2,
    };
    
    // Roland Juno-106 parameters
    let juno106Params = {
      pwm: 0.5,              // Pulse width modulation (0-1)
      pwmRate: 6.0,          // PWM LFO rate (Hz)
      pwmDepth: 0.3,         // PWM depth (0-1)
      filterCutoff: 2500,
      filterRes: 3,
      chorusEnabled: true,
      attack: 0.01,
      decay: 0.3,
      sustain: 0.6,
      release: 0.5,
    };
    
    // Moog Minimoog parameters
    let minimoogParams = {
      osc1Level: 0.5,
      osc2Level: 0.5,
      osc3Level: 0.5,
      osc1Waveform: 'sawtooth',
      osc2Waveform: 'sawtooth',
      osc3Waveform: 'square',
      osc2Detune: 0.01,      // Slight detune for thickness
      osc3Detune: -0.01,
      filterCutoff: 3000,
      filterRes: 8,          // High resonance for classic Moog sound
      filterEnvAmount: 2000,
      attack: 0.01,
      decay: 0.3,
      sustain: 0.5,
      release: 0.2,
    };
    
    // Yamaha DX7 parameters (simplified 4-operator FM)
    let dx7Params = {
      algorithm: 1,          // FM algorithm (1-8)
      op1Ratio: 1.0,         // Operator 1 frequency ratio
      op2Ratio: 2.0,
      op3Ratio: 3.0,
      op4Ratio: 4.0,
      op1Level: 0.8,
      op2Level: 0.6,
      op3Level: 0.4,
      op4Level: 0.3,
      modIndex: 3.0,         // Modulation index
      attack: 0.01,
      decay: 0.2,
      sustain: 0.6,
      release: 0.3,
    };
    
    // Korg MS-20 parameters
    let ms20Params = {
      osc1Waveform: 'sawtooth',
      osc2Waveform: 'square',
      osc2Detune: 0.02,
      hpfCutoff: 100,        // High-pass filter
      hpfRes: 2,
      lpfCutoff: 3000,       // Low-pass filter
      lpfRes: 10,            // MS-20 has aggressive resonance
      attack: 0.01,
      decay: 0.3,
      sustain: 0.6,
      release: 0.2,
    };
    
    // Sequential Prophet-5 parameters
    let prophet5Params = {
      osc1Waveform: 'sawtooth',
      osc2Waveform: 'sawtooth',
      osc2Detune: 0.01,
      oscMix: 0.5,           // Oscillator balance
      filterCutoff: 2500,
      filterRes: 5,
      filterEnvAmount: 1500,
      attack: 0.01,
      decay: 0.4,
      sustain: 0.7,
      release: 0.3,
      polyVoices: 5,         // 5-voice polyphony
    };
    
    // Effects parameters
    let effectsParams = {
      // Master effects
      distortionAmount: 0,        // 0-100
      reverbMix: 0.3,             // 0-1 (wet/dry)
      delayTime: 0.375,           // seconds (375ms = dotted 8th at 120bpm)
      delayFeedback: 0.3,         // 0-1
      delayMix: 0.2,              // 0-1
      masterFilterCutoff: 8000,   // Hz
      masterFilterRes: 1,         // 0-20
      compressionThreshold: -24,  // dB
      compressionRatio: 4,        // :1
      
      // Advanced effects
      phaserRate: 0.5,            // Hz (LFO speed)
      phaserDepth: 0.5,           // 0-1
      phaserMix: 0,               // 0-1 (off by default)
      flangerRate: 0.2,           // Hz
      flangerDepth: 0.003,        // seconds (3ms)
      flangerFeedback: 0.5,       // 0-1
      flangerMix: 0,              // 0-1 (off by default)
      chorusRate: 1.5,            // Hz
      chorusDepth: 0.002,         // seconds (2ms)
      chorusMix: 0,               // 0-1 (off by default)
      bitcrushBits: 16,           // 1-16 bits
      bitcrushMix: 0,             // 0-1 (off by default)
      ringModFreq: 30,            // Hz (carrier frequency)
      ringModMix: 0,              // 0-1 (off by default)
      
      // Per-track controls
      tracks: {
        kick: { 
          volume: 1.0, 
          pan: 0,                 // -1 (left) to 1 (right)
          filterCutoff: 8000, 
          filterRes: 1, 
          filterType: 'lowpass',  // 'lowpass', 'highpass', 'bandpass'
          attack: 0.01,
          decay: 0.3,
          sustain: 0.7,
          release: 0.1,
          lfoRate: 0,             // Hz (0 = off)
          lfoDepth: 0,            // 0-1
          reverbSend: 0,
          delaySend: 0,
        },
        snare: { 
          volume: 1.0, 
          pan: 0,
          filterCutoff: 8000, 
          filterRes: 1, 
          filterType: 'lowpass',
          attack: 0.01,
          decay: 0.2,
          sustain: 0.5,
          release: 0.1,
          lfoRate: 0,
          lfoDepth: 0,
          reverbSend: 0.2,
          delaySend: 0,
        },
        hihat: { 
          volume: 0.7, 
          pan: 0.3,               // Slightly right
          filterCutoff: 8000, 
          filterRes: 1, 
          filterType: 'highpass',
          attack: 0.001,
          decay: 0.05,
          sustain: 0,
          release: 0.05,
          lfoRate: 0,
          lfoDepth: 0,
          reverbSend: 0.1,
          delaySend: 0,
        },
        clap: { 
          volume: 0.8, 
          pan: -0.2,              // Slightly left
          filterCutoff: 8000, 
          filterRes: 1, 
          filterType: 'bandpass',
          attack: 0.01,
          decay: 0.15,
          sustain: 0,
          release: 0.1,
          lfoRate: 0,
          lfoDepth: 0,
          reverbSend: 0.3,
          delaySend: 0,
        },
        bass: { 
          volume: 0.9, 
          pan: 0,
          filterCutoff: 8000, 
          filterRes: 1, 
          filterType: 'lowpass',
          attack: 0.01,
          decay: 0.3,
          sustain: 0.7,
          release: 0.2,
          lfoRate: 0,
          lfoDepth: 0,
          reverbSend: 0.05,
          delaySend: 0.1,
        },
      }
    };

    function init() {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master dry signal path
        masterDryGain = audioContext.createGain();
        masterDryGain.gain.value = 0.7; // Some dry signal
        
        // Create master merge gain (wet + dry)
        masterMergeGain = audioContext.createGain();
        masterMergeGain.gain.value = 1.0;
        
        // Create distortion (WaveShaperNode)
        distortion = audioContext.createWaveShaper();
        distortion.curve = makeDistortionCurve(0); // Start with no distortion
        distortion.oversample = '4x';
        
        // Create reverb (ConvolverNode - no IR yet, will add later)
        reverb = audioContext.createConvolver();
        // Generate simple impulse response
        const irLength = audioContext.sampleRate * 2; // 2 second reverb
        const irBuffer = audioContext.createBuffer(2, irLength, audioContext.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const irData = irBuffer.getChannelData(channel);
          for (let i = 0; i < irLength; i++) {
            irData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.5));
          }
        }
        reverb.buffer = irBuffer;
        
        reverbSend = audioContext.createGain();
        reverbSend.gain.value = 0;
        reverbReturn = audioContext.createGain();
        reverbReturn.gain.value = effectsParams.reverbMix;
        
        // Create delay
        delay = audioContext.createDelay(5.0); // Max 5 seconds
        delay.delayTime.value = effectsParams.delayTime;
        delayFeedback = audioContext.createGain();
        delayFeedback.gain.value = effectsParams.delayFeedback;
        delaySend = audioContext.createGain();
        delaySend.gain.value = 0;
        delayReturn = audioContext.createGain();
        delayReturn.gain.value = effectsParams.delayMix;
        
        // Create compressor
        compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = effectsParams.compressionThreshold;
        compressor.ratio.value = effectsParams.compressionRatio;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        
        // Create master filter
        masterFilter = audioContext.createBiquadFilter();
        masterFilter.type = 'lowpass';
        masterFilter.frequency.value = effectsParams.masterFilterCutoff;
        masterFilter.Q.value = effectsParams.masterFilterRes;
        
        // Create master output gain
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.8;
        
        // Wire effects chain:
        // Source -> [per-track filter/gain] -> masterDryGain -> distortion -> masterMergeGain
        //                                    -> reverbSend -> reverb -> reverbReturn -> masterMergeGain
        //                                    -> delaySend -> delay -> delayReturn -> masterMergeGain
        // masterMergeGain -> masterFilter -> compressor -> masterGain -> destination
        
        masterDryGain.connect(distortion);
        distortion.connect(masterMergeGain);
        
        // Reverb send/return
        reverbSend.connect(reverb);
        reverb.connect(reverbReturn);
        reverbReturn.connect(masterMergeGain);
        
        // Delay send/return with feedback
        delaySend.connect(delay);
        delay.connect(delayFeedback);
        delayFeedback.connect(delay); // Feedback loop
        delay.connect(delayReturn);
        delayReturn.connect(masterMergeGain);
        
        // Create phaser (cascade of all-pass filters with LFO)
        phaser = [];
        for (let i = 0; i < 6; i++) {
          const allpass = audioContext.createBiquadFilter();
          allpass.type = 'allpass';
          allpass.frequency.value = 500 + i * 500;
          allpass.Q.value = 1;
          phaser.push(allpass);
        }
        phaserLFO = audioContext.createOscillator();
        phaserLFO.frequency.value = effectsParams.phaserRate;
        phaserLFO.type = 'sine';
        phaserLFOGain = audioContext.createGain();
        phaserLFOGain.gain.value = 500 * effectsParams.phaserDepth;
        phaserLFO.connect(phaserLFOGain);
        phaserLFOGain.connect(phaser[0].frequency); // Modulate first filter
        phaserMixGain = audioContext.createGain();
        phaserMixGain.gain.value = effectsParams.phaserMix;
        phaserLFO.start();
        
        // Chain phaser filters
        for (let i = 0; i < phaser.length - 1; i++) {
          phaser[i].connect(phaser[i + 1]);
        }
        phaser[phaser.length - 1].connect(phaserMixGain);
        
        // Create flanger (short delay with LFO)
        flanger = audioContext.createDelay(0.1); // Max 100ms
        flanger.delayTime.value = 0.005; // Base 5ms delay
        flangerLFO = audioContext.createOscillator();
        flangerLFO.frequency.value = effectsParams.flangerRate;
        flangerLFO.type = 'sine';
        flangerLFOGain = audioContext.createGain();
        flangerLFOGain.gain.value = effectsParams.flangerDepth; // Modulation depth
        flangerLFO.connect(flangerLFOGain);
        flangerLFOGain.connect(flanger.delayTime);
        flangerFeedback = audioContext.createGain();
        flangerFeedback.gain.value = effectsParams.flangerFeedback;
        flangerMixGain = audioContext.createGain();
        flangerMixGain.gain.value = effectsParams.flangerMix;
        flangerLFO.start();
        
        // Wire flanger feedback loop
        flanger.connect(flangerFeedback);
        flangerFeedback.connect(flanger);
        flanger.connect(flangerMixGain);
        
        // Create chorus (multiple delays with LFOs)
        chorus = [];
        chorusLFOs = [];
        const chorusMergeGain = audioContext.createGain();
        chorusMergeGain.gain.value = 0.33; // Balance 3 voices
        
        for (let i = 0; i < 3; i++) {
          const chorusDelay = audioContext.createDelay(0.1);
          chorusDelay.delayTime.value = 0.020 + i * 0.005; // 20ms, 25ms, 30ms base
          
          const chorusLFO = audioContext.createOscillator();
          chorusLFO.frequency.value = effectsParams.chorusRate * (1 + i * 0.1); // Slightly different rates
          chorusLFO.type = 'sine';
          
          const chorusLFOGain = audioContext.createGain();
          chorusLFOGain.gain.value = effectsParams.chorusDepth;
          
          chorusLFO.connect(chorusLFOGain);
          chorusLFOGain.connect(chorusDelay.delayTime);
          chorusDelay.connect(chorusMergeGain);
          chorusLFO.start();
          
          chorus.push(chorusDelay);
          chorusLFOs.push(chorusLFO);
        }
        
        chorusMixGain = audioContext.createGain();
        chorusMixGain.gain.value = effectsParams.chorusMix;
        chorusMergeGain.connect(chorusMixGain);
        
        // Create bitcrusher (bit depth reduction)
        bitcrusher = audioContext.createWaveShaper();
        bitcrusher.curve = makeBitcrushCurve(effectsParams.bitcrushBits);
        bitcrusherMixGain = audioContext.createGain();
        bitcrusherMixGain.gain.value = effectsParams.bitcrushMix;
        bitcrusher.connect(bitcrusherMixGain);
        
        // Create ring modulator (amplitude modulation)
        ringMod = audioContext.createGain();
        ringMod.gain.value = 0; // Will be modulated by oscillator
        ringModOsc = audioContext.createOscillator();
        ringModOsc.frequency.value = effectsParams.ringModFreq;
        ringModOsc.type = 'sine';
        const ringModOscGain = audioContext.createGain();
        ringModOscGain.gain.value = 1.0; // Full modulation depth
        ringModOsc.connect(ringModOscGain);
        ringModOscGain.connect(ringMod.gain); // Modulate the gain
        ringModMixGain = audioContext.createGain();
        ringModMixGain.gain.value = effectsParams.ringModMix;
        ringMod.connect(ringModMixGain);
        ringModOsc.start();
        
        // Master chain with advanced effects
        // masterMergeGain -> phaser -> flanger -> chorus -> bitcrusher -> ringMod -> masterFilter -> compressor -> masterGain -> destination
        masterMergeGain.connect(phaser[0]);
        phaserMixGain.connect(flanger);
        flangerMixGain.connect(chorus[0]);
        flangerMixGain.connect(chorus[1]);
        flangerMixGain.connect(chorus[2]);
        chorusMixGain.connect(bitcrusher);
        bitcrusherMixGain.connect(ringMod);
        ringModMixGain.connect(masterFilter);
        masterFilter.connect(compressor);
        compressor.connect(masterGain);
        masterGain.connect(audioContext.destination);
        
        sendMessage({ type: 'init_success', sampleRate: audioContext.sampleRate });
      } catch (error) {
        sendMessage({ type: 'init_error', error: error.message });
      }
    }
    
    // Create distortion curve
    function makeDistortionCurve(amount) {
      const samples = 44100;
      const curve = new Float32Array(samples);
      const deg = Math.PI / 180;
      const k = amount; // 0-100
      
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      
      return curve;
    }
    
    // Create bitcrusher curve (bit depth reduction)
    function makeBitcrushCurve(bits) {
      const samples = 44100;
      const curve = new Float32Array(samples);
      const levels = Math.pow(2, bits);
      const step = 2 / levels;
      
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = Math.floor(x / step) * step;
      }
      
      return curve;
    }
    
    // Get or create track-specific nodes
    function getTrackNodes(trackName) {
      if (!trackNodes[trackName]) {
        // Create per-track filter
        const filter = audioContext.createBiquadFilter();
        filter.type = effectsParams.tracks[trackName]?.filterType || 'lowpass';
        filter.frequency.value = effectsParams.tracks[trackName]?.filterCutoff || 8000;
        filter.Q.value = effectsParams.tracks[trackName]?.filterRes || 1;
        
        // Create per-track pan (stereo panner)
        const panner = audioContext.createStereoPanner();
        panner.pan.value = effectsParams.tracks[trackName]?.pan || 0;
        
        // Create per-track gain (volume)
        const gain = audioContext.createGain();
        gain.gain.value = effectsParams.tracks[trackName]?.volume || 1.0;
        
        // Create per-track reverb send
        const trackReverbSend = audioContext.createGain();
        trackReverbSend.gain.value = effectsParams.tracks[trackName]?.reverbSend || 0;
        
        // Create per-track delay send
        const trackDelaySend = audioContext.createGain();
        trackDelaySend.gain.value = effectsParams.tracks[trackName]?.delaySend || 0;
        
        // Wire: source -> filter -> panner -> gain -> dry/sends
        filter.connect(panner);
        panner.connect(gain);
        gain.connect(masterDryGain);           // Dry signal
        gain.connect(trackReverbSend);         // Reverb send
        gain.connect(trackDelaySend);          // Delay send
        trackReverbSend.connect(reverbSend);
        trackDelaySend.connect(delaySend);
        
        trackNodes[trackName] = {
          filter,
          panner,
          gain,
          reverbSend: trackReverbSend,
          delaySend: trackDelaySend,
        };
      }
      
      return trackNodes[trackName];
    }
    
    // Apply effects parameters in real-time
    function applyEffectsParams() {
      if (!audioContext) return;
      
      try {
        // Master effects
        if (distortion && effectsParams.distortionAmount !== undefined) {
          distortion.curve = makeDistortionCurve(effectsParams.distortionAmount);
        }
        
        if (reverbReturn && effectsParams.reverbMix !== undefined) {
          reverbReturn.gain.value = effectsParams.reverbMix;
        }
        
        if (delay && effectsParams.delayTime !== undefined) {
          delay.delayTime.value = effectsParams.delayTime;
        }
        
        if (delayFeedback && effectsParams.delayFeedback !== undefined) {
          delayFeedback.gain.value = effectsParams.delayFeedback;
        }
        
        if (delayReturn && effectsParams.delayMix !== undefined) {
          delayReturn.gain.value = effectsParams.delayMix;
        }
        
        if (masterFilter && effectsParams.masterFilterCutoff !== undefined) {
          masterFilter.frequency.value = effectsParams.masterFilterCutoff;
        }
        
        if (masterFilter && effectsParams.masterFilterRes !== undefined) {
          masterFilter.Q.value = effectsParams.masterFilterRes;
        }
        
        if (compressor && effectsParams.compressionThreshold !== undefined) {
          compressor.threshold.value = effectsParams.compressionThreshold;
        }
        
        if (compressor && effectsParams.compressionRatio !== undefined) {
          compressor.ratio.value = effectsParams.compressionRatio;
        }
        
        // Advanced effects
        if (phaserLFO && effectsParams.phaserRate !== undefined) {
          phaserLFO.frequency.value = effectsParams.phaserRate;
        }
        
        if (phaserLFOGain && effectsParams.phaserDepth !== undefined) {
          phaserLFOGain.gain.value = 500 * effectsParams.phaserDepth;
        }
        
        if (phaserMixGain && effectsParams.phaserMix !== undefined) {
          phaserMixGain.gain.value = effectsParams.phaserMix;
        }
        
        if (flangerLFO && effectsParams.flangerRate !== undefined) {
          flangerLFO.frequency.value = effectsParams.flangerRate;
        }
        
        if (flangerLFOGain && effectsParams.flangerDepth !== undefined) {
          flangerLFOGain.gain.value = effectsParams.flangerDepth;
        }
        
        if (flangerFeedback && effectsParams.flangerFeedback !== undefined) {
          flangerFeedback.gain.value = effectsParams.flangerFeedback;
        }
        
        if (flangerMixGain && effectsParams.flangerMix !== undefined) {
          flangerMixGain.gain.value = effectsParams.flangerMix;
        }
        
        if (chorusLFOs && effectsParams.chorusRate !== undefined) {
          chorusLFOs.forEach((lfo, i) => {
            lfo.frequency.value = effectsParams.chorusRate * (1 + i * 0.1);
          });
        }
        
        if (chorus && effectsParams.chorusDepth !== undefined) {
          // Chorus depth modulates delay time via LFO gain
          // This is already connected, but we could update base delay if needed
        }
        
        if (chorusMixGain && effectsParams.chorusMix !== undefined) {
          chorusMixGain.gain.value = effectsParams.chorusMix;
        }
        
        if (bitcrusher && effectsParams.bitcrushBits !== undefined) {
          bitcrusher.curve = makeBitcrushCurve(effectsParams.bitcrushBits);
        }
        
        if (bitcrusherMixGain && effectsParams.bitcrushMix !== undefined) {
          bitcrusherMixGain.gain.value = effectsParams.bitcrushMix;
        }
        
        if (ringModOsc && effectsParams.ringModFreq !== undefined) {
          ringModOsc.frequency.value = effectsParams.ringModFreq;
        }
        
        if (ringModMixGain && effectsParams.ringModMix !== undefined) {
          ringModMixGain.gain.value = effectsParams.ringModMix;
        }
        
        // Per-track parameters
        if (effectsParams.tracks) {
          Object.keys(effectsParams.tracks).forEach(trackName => {
            const nodes = trackNodes[trackName];
            if (nodes) {
              const trackParams = effectsParams.tracks[trackName];
              
              if (trackParams.volume !== undefined) {
                nodes.gain.gain.value = trackParams.volume;
              }
              
              if (trackParams.pan !== undefined) {
                nodes.panner.pan.value = trackParams.pan;
              }
              
              if (trackParams.filterCutoff !== undefined) {
                nodes.filter.frequency.value = trackParams.filterCutoff;
              }
              
              if (trackParams.filterRes !== undefined) {
                nodes.filter.Q.value = trackParams.filterRes;
              }
              
              if (trackParams.filterType !== undefined) {
                nodes.filter.type = trackParams.filterType;
              }
              
              if (trackParams.reverbSend !== undefined) {
                nodes.reverbSend.gain.value = trackParams.reverbSend;
              }
              
              if (trackParams.delaySend !== undefined) {
                nodes.delaySend.gain.value = trackParams.delaySend;
              }
              
              // Note: ADSR and LFO are applied during note playback, not here
            }
          });
        }
      } catch (error) {
        console.error('Apply effects error:', error);
      }
    }

    function playTB303(note, velocity, accent, duration) {
      if (!audioContext) return;

      try {
        // Handle both note string and frequency number
        const frequency = typeof note === 'number' ? note : noteToFrequency(note);
        const now = audioContext.currentTime;

        const osc = audioContext.createOscillator();
        osc.type = tb303Params.waveform;
        osc.frequency.value = frequency;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = tb303Params.cutoff;
        filter.Q.value = tb303Params.resonance;

        const vca = audioContext.createGain();
        vca.gain.value = 0;

        // Get track nodes for bass routing
        const trackRouting = getTrackNodes('bass');

        osc.connect(filter);
        filter.connect(vca);
        vca.connect(trackRouting.filter); // Route through per-track chain

        const accentMult = accent ? tb303Params.accent : 1.0;
        const peakVolume = velocity * accentMult * 0.5;
        const filterPeak = tb303Params.cutoff + (tb303Params.envMod * accentMult);

        vca.gain.setValueAtTime(0, now);
        vca.gain.linearRampToValueAtTime(peakVolume, now + 0.001);
        vca.gain.exponentialRampToValueAtTime(peakVolume * 0.3, now + tb303Params.decay);
        vca.gain.exponentialRampToValueAtTime(0.001, now + duration);

        filter.frequency.setValueAtTime(filterPeak, now);
        filter.frequency.exponentialRampToValueAtTime(tb303Params.cutoff, now + tb303Params.decay);

        osc.start(now);
        osc.stop(now + duration + 0.1);

        setTimeout(() => {
          try {
            osc.disconnect();
            filter.disconnect();
            vca.disconnect();
          } catch (e) {}
        }, (duration + 0.2) * 1000);

      } catch (error) {
        console.error('Play error:', error);
      }
    }

    /**
     * Piano Synthesizer
     * Simulates piano sound using multiple harmonics and envelopes
     */
    function playPiano(frequency, velocity = 1.0, duration = 0.5, pianoType = 'grand', reverb = 0.3, brightness = 0.5) {
      ensureAudioContext();
      if (!audioContext) return;
      const now = audioContext.currentTime;
      
      console.log(\`🎹 Web Audio: Playing Piano \${pianoType} at \${frequency}Hz, vel=\${velocity.toFixed(2)}\`);
      
      // Piano characteristics based on type
      const pianoSettings = {
        grand: { harmonics: [1, 2, 3, 4, 5], attack: 0.003, decay: 0.15, sustain: 0.3, release: 0.4, brightness: 1.2 },
        rhodes: { harmonics: [1, 2, 3, 4, 6, 8], attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.6, brightness: 1.5 },
        upright: { harmonics: [1, 2, 3, 4], attack: 0.005, decay: 0.1, sustain: 0.25, release: 0.3, brightness: 0.9 }
      };
      
      const settings = pianoSettings[pianoType] || pianoSettings.grand;
      
      // Master gain for this note
      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(velocity * 0.3, now + settings.attack);
      masterGain.gain.exponentialRampToValueAtTime(velocity * settings.sustain, now + settings.attack + settings.decay);
      
      // Release after duration
      const releaseTime = now + duration;
      masterGain.gain.setValueAtTime(velocity * settings.sustain, releaseTime);
      masterGain.gain.exponentialRampToValueAtTime(0.001, releaseTime + settings.release);
      
      // Create harmonics (multiple oscillators for richer sound)
      const oscillators = [];
      settings.harmonics.forEach((harmonic, index) => {
        const osc = audioContext.createOscillator();
        osc.type = pianoType === 'rhodes' ? 'sine' : 'triangle';
        osc.frequency.value = frequency * harmonic;
        
        // Harmonic gain (higher harmonics are quieter)
        const harmonicGain = audioContext.createGain();
        const harmonicLevel = Math.pow(0.5, index) * (brightness * settings.brightness);
        harmonicGain.gain.value = harmonicLevel;
        
        osc.connect(harmonicGain);
        harmonicGain.connect(masterGain);
        oscillators.push({ osc, gain: harmonicGain });
      });
      
      // Optional: Add slight detuning for stereo width (Rhodes effect)
      if (pianoType === 'rhodes') {
        const detuneOsc = audioContext.createOscillator();
        detuneOsc.type = 'sine';
        detuneOsc.frequency.value = frequency;
        detuneOsc.detune.value = 5; // 5 cents detune
        
        const detuneGain = audioContext.createGain();
        detuneGain.gain.value = velocity * 0.15;
        
        detuneOsc.connect(detuneGain);
        detuneGain.connect(masterGain);
        oscillators.push({ osc: detuneOsc, gain: detuneGain });
      }
      
      // Simple reverb simulation with delay
      if (reverb > 0.1) {
        const delay = audioContext.createDelay(1.0);
        delay.delayTime.value = 0.03 + (reverb * 0.05);
        
        const delayGain = audioContext.createGain();
        delayGain.gain.value = reverb * 0.3;
        
        masterGain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(masterGain.context.destination);
      }
      
      // Connect to destination
      masterGain.connect(audioContext.destination);
      
      // Start all oscillators
      oscillators.forEach(({ osc }) => {
        osc.start(now);
        osc.stop(releaseTime + settings.release + 0.1);
      });
      
      // Cleanup
      setTimeout(() => {
        try {
          oscillators.forEach(({ osc, gain }) => {
            osc.disconnect();
            gain.disconnect();
          });
          masterGain.disconnect();
        } catch(e) {
          console.warn('Cleanup error:', e);
        }
      }, (duration + settings.release + 0.2) * 1000);
    }

    function playKick808(velocity = 1.0) {
      ensureAudioContext();
      if (!audioContext) return;
      const now = audioContext.currentTime;
      
      console.log('🥁 Web Audio: Playing KICK, velocity=' + velocity);
      
      // Get track nodes for kick routing
      const trackRouting = getTrackNodes('kick');
      
      // Pitch envelope for kick (gives that "boom" attack)
      const osc = audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(tr808Params.kickPitch, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + tr808Params.kickDecay);
      
      // Amplitude envelope
      const vca = audioContext.createGain();
      vca.gain.setValueAtTime(velocity * 0.8, now);
      vca.gain.exponentialRampToValueAtTime(0.001, now + tr808Params.kickDecay);
      
      osc.connect(vca);
      vca.connect(trackRouting.filter); // Route through per-track chain
      osc.start(now);
      osc.stop(now + tr808Params.kickDecay + 0.1);
      
      setTimeout(() => {
        try { osc.disconnect(); vca.disconnect(); } catch(e) {}
      }, (tr808Params.kickDecay + 0.2) * 1000);
    }

    function playSnare808(velocity = 1.0) {
      ensureAudioContext();
      if (!audioContext) return;
      const now = audioContext.currentTime;
      
      console.log('🥁 Web Audio: Playing SNARE, velocity=' + velocity);
      
      // Get track nodes for snare routing
      const trackRouting = getTrackNodes('snare');
      
      // Tonal component (200Hz sine)
      const toneOsc = audioContext.createOscillator();
      toneOsc.type = 'sine';
      toneOsc.frequency.value = tr808Params.snareTone;
      
      const toneGain = audioContext.createGain();
      toneGain.gain.setValueAtTime((1 - tr808Params.snareNoise) * velocity * 0.5, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      // Noise component
      const bufferSize = audioContext.sampleRate * 0.2;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }
      
      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      
      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 2000;
      noiseFilter.Q.value = 1;
      
      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(tr808Params.snareNoise * velocity * 0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      // Merge tone + noise
      const mixGain = audioContext.createGain();
      mixGain.gain.value = 1.0;
      
      // Connect tone
      toneOsc.connect(toneGain);
      toneGain.connect(mixGain);
      
      // Connect noise
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(mixGain);
      
      // Route through per-track chain
      mixGain.connect(trackRouting.filter);
      
      // Start
      toneOsc.start(now);
      toneOsc.stop(now + 0.12);
      noiseSource.start(now);
      noiseSource.stop(now + 0.17);
      
      setTimeout(() => {
        try {
          toneOsc.disconnect();
          toneGain.disconnect();
          noiseSource.disconnect();
          noiseFilter.disconnect();
          noiseGain.disconnect();
        } catch(e) {}
      }, 250);
    }

    function playHihat808(velocity = 1.0, open = false) {
      ensureAudioContext();
      if (!audioContext) return;
      const now = audioContext.currentTime;
      const duration = open ? 0.15 : tr808Params.hihatDecay;
      
      console.log('🥁 Web Audio: Playing HIHAT, velocity=' + velocity + ', open=' + open);
      
      // Get track nodes for hihat routing
      const trackRouting = getTrackNodes('hihat');
      
      // Merge all oscillators
      const mixGain = audioContext.createGain();
      mixGain.gain.value = 1.0;
      
      // Use 6 square wave oscillators at metallic frequencies
      const freqs = [296, 311, 365, 417, 529, 634];
      const oscs = [];
      const gains = [];
      
      freqs.forEach(freq => {
        const osc = audioContext.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(velocity * 0.15 / freqs.length, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.connect(gain);
        gain.connect(mixGain); // Mix all oscillators
        osc.start(now);
        osc.stop(now + duration + 0.05);
        
        oscs.push(osc);
        gains.push(gain);
      });
      
      // Route mixed signal through per-track chain
      mixGain.connect(trackRouting.filter);
      
      setTimeout(() => {
        try {
          oscs.forEach(osc => osc.disconnect());
          gains.forEach(gain => gain.disconnect());
        } catch(e) {}
      }, (duration + 0.1) * 1000);
    }

    function playClap808(velocity = 1.0) {
      ensureAudioContext();
      if (!audioContext) return;
      const now = audioContext.currentTime;
      
      console.log('🥁 Web Audio: Playing CLAP, velocity=' + velocity);
      
      // Get track nodes for clap routing
      const trackRouting = getTrackNodes('clap');
      
      // Create 3 short noise bursts for clap effect
      for (let i = 0; i < 3; i++) {
        const delay = i * 0.03;
        
        const bufferSize = audioContext.sampleRate * 0.05;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          noiseData[j] = Math.random() * 2 - 1;
        }
        
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 1.5;
        
        const gain = audioContext.createGain();
        const vol = velocity * 0.5 * (1 - i * 0.2);
        gain.gain.setValueAtTime(vol, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05);
        
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(trackRouting.filter); // Route through per-track chain
        
        noiseSource.start(now + delay);
        noiseSource.stop(now + delay + 0.06);
        
        setTimeout(() => {
          try {
            noiseSource.disconnect();
            filter.disconnect();
            gain.disconnect();
          } catch(e) {}
        }, (delay + 0.1) * 1000);
      }
    }

    function playARP2600(note, velocity = 1.0, accent = false, duration = 0.3) {
      if (!audioContext) return;
      const now = audioContext.currentTime;
      // Handle both note string (e.g. 'C4') and frequency number (e.g. 261.63)
      const freq = typeof note === 'number' ? note : noteToFrequency(note);
      
      // Dual oscillators for thick sound
      const osc1 = audioContext.createOscillator();
      osc1.type = arp2600Params.osc1;
      osc1.frequency.value = freq;
      
      const osc2 = audioContext.createOscillator();
      osc2.type = arp2600Params.osc2;
      osc2.frequency.value = freq * (1 + arp2600Params.osc2Detune);
      
      // Mix oscillators
      const oscMix = audioContext.createGain();
      oscMix.gain.value = 0.5; // Equal mix
      
      osc1.connect(oscMix);
      osc2.connect(oscMix);
      
      // Multi-mode filter
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = arp2600Params.filterCutoff;
      filter.Q.value = arp2600Params.filterRes;
      
      // Filter envelope
      const filterEnvAmt = accent ? 2000 : 1000;
      filter.frequency.setValueAtTime(arp2600Params.filterCutoff, now);
      filter.frequency.linearRampToValueAtTime(
        Math.min(arp2600Params.filterCutoff + filterEnvAmt, 8000),
        now + arp2600Params.attack
      );
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(arp2600Params.filterCutoff * 0.5, 100),
        now + arp2600Params.attack + arp2600Params.decay
      );
      
      // VCA with full ADSR envelope
      const vca = audioContext.createGain();
      const peakVol = velocity * (accent ? 0.6 : 0.4);
      const sustainVol = peakVol * arp2600Params.sustain;
      
      vca.gain.setValueAtTime(0, now);
      // Attack
      vca.gain.linearRampToValueAtTime(peakVol, now + arp2600Params.attack);
      // Decay
      vca.gain.exponentialRampToValueAtTime(
        Math.max(sustainVol, 0.001),
        now + arp2600Params.attack + arp2600Params.decay
      );
      // Sustain (hold)
      vca.gain.setValueAtTime(
        sustainVol,
        now + duration - arp2600Params.release
      );
      // Release
      vca.gain.exponentialRampToValueAtTime(
        0.001,
        now + duration
      );
      
      // Get track nodes for ARP2600 routing (use bass track)
      const trackRouting = getTrackNodes('bass');
      
      // Connect: Osc Mix -> Filter -> VCA -> Per-track chain
      oscMix.connect(filter);
      filter.connect(vca);
      vca.connect(trackRouting.filter);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);
      
      setTimeout(() => {
        try {
          osc1.disconnect();
          osc2.disconnect();
          oscMix.disconnect();
          filter.disconnect();
          vca.disconnect();
        } catch(e) {}
      }, (duration + 0.2) * 1000);
    }

    // Roland Juno-106 (1984) - PWM oscillator with chorus
    function playJuno106(note, velocity = 1.0, accent = false, duration = 0.5) {
      if (!audioContext) return;
      const now = audioContext.currentTime;
      // Handle both note string and frequency number
      const freq = typeof note === 'number' ? note : noteToFrequency(note);
      
      // PWM oscillator (simulate with 2 sawtooth waves)
      const osc1 = audioContext.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = freq;
      
      const osc2 = audioContext.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.value = freq;
      
      // PWM LFO modulation
      const pwmLFO = audioContext.createOscillator();
      pwmLFO.frequency.value = juno106Params.pwmRate;
      const pwmGain = audioContext.createGain();
      pwmGain.gain.value = juno106Params.pwmDepth * 10;
      pwmLFO.connect(pwmGain);
      pwmGain.connect(osc2.detune);
      
      // Mix oscillators
      const oscMix = audioContext.createGain();
      oscMix.gain.value = 0.5;
      osc1.connect(oscMix);
      osc2.connect(oscMix);
      
      // High-pass filter (HPF characteristic)
      const hpf = audioContext.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = 100;
      
      // Main filter
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = juno106Params.cutoff;
      filter.Q.value = juno106Params.resonance;
      
      // Filter envelope
      const envAmt = accent ? 3000 : 2000;
      filter.frequency.setValueAtTime(juno106Params.cutoff, now);
      filter.frequency.linearRampToValueAtTime(
        Math.min(juno106Params.cutoff + envAmt, 10000),
        now + juno106Params.attack
      );
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(juno106Params.cutoff, 200),
        now + juno106Params.attack + juno106Params.decay
      );
      
      // VCA with ADSR
      const vca = audioContext.createGain();
      const peakVol = velocity * (accent ? 0.5 : 0.35);
      const sustainVol = peakVol * juno106Params.sustain;
      
      vca.gain.setValueAtTime(0, now);
      vca.gain.linearRampToValueAtTime(peakVol, now + juno106Params.attack);
      vca.gain.exponentialRampToValueAtTime(Math.max(sustainVol, 0.001), now + juno106Params.attack + juno106Params.decay);
      vca.gain.setValueAtTime(sustainVol, now + duration - juno106Params.release);
      vca.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      // Juno-106 chorus (simulate with short delays)
      const chorusDelay1 = audioContext.createDelay();
      chorusDelay1.delayTime.value = 0.015;
      const chorusDelay2 = audioContext.createDelay();
      chorusDelay2.delayTime.value = 0.025;
      const chorusLFO = audioContext.createOscillator();
      chorusLFO.frequency.value = juno106Params.chorusRate;
      const chorusGain = audioContext.createGain();
      chorusGain.gain.value = juno106Params.chorusDepth * 0.005;
      chorusLFO.connect(chorusGain);
      chorusGain.connect(chorusDelay1.delayTime);
      chorusGain.connect(chorusDelay2.delayTime);
      
      const chorusMix = audioContext.createGain();
      chorusMix.gain.value = 0.3;
      
      const trackRouting = getTrackNodes('bass');
      
      // Signal chain: OSC Mix -> HPF -> Filter -> VCA -> split to dry + chorus -> track
      oscMix.connect(hpf);
      hpf.connect(filter);
      filter.connect(vca);
      vca.connect(trackRouting.filter); // Dry
      vca.connect(chorusDelay1);
      vca.connect(chorusDelay2);
      chorusDelay1.connect(chorusMix);
      chorusDelay2.connect(chorusMix);
      chorusMix.connect(trackRouting.filter); // Wet chorus
      
      osc1.start(now);
      osc2.start(now);
      pwmLFO.start(now);
      chorusLFO.start(now);
      
      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);
      pwmLFO.stop(now + duration + 0.1);
      chorusLFO.stop(now + duration + 0.1);
      
      setTimeout(() => {
        try {
          osc1.disconnect(); osc2.disconnect(); pwmLFO.disconnect(); chorusLFO.disconnect();
          oscMix.disconnect(); hpf.disconnect(); filter.disconnect(); vca.disconnect();
          chorusDelay1.disconnect(); chorusDelay2.disconnect(); chorusMix.disconnect(); pwmGain.disconnect(); chorusGain.disconnect();
        } catch(e) {}
      }, (duration + 0.2) * 1000);
    }

    // Moog Minimoog (1970) - 3 oscillators with ladder filter
    function playMinimoog(note, velocity = 1.0, accent = false, duration = 0.6) {
      if (!audioContext) return;
      const now = audioContext.currentTime;
      // Handle both note string and frequency number
      const freq = typeof note === 'number' ? note : noteToFrequency(note);
      
      // 3 oscillators
      const osc1 = audioContext.createOscillator();
      osc1.type = minimoogParams.osc1Type;
      osc1.frequency.value = freq * Math.pow(2, minimoogParams.osc1Octave);
      
      const osc2 = audioContext.createOscillator();
      osc2.type = minimoogParams.osc2Type;
      osc2.frequency.value = freq * Math.pow(2, minimoogParams.osc2Octave) * (1 + minimoogParams.osc2Detune);
      
      const osc3 = audioContext.createOscillator();
      osc3.type = minimoogParams.osc3Type;
      osc3.frequency.value = freq * Math.pow(2, minimoogParams.osc3Octave);
      
      // Oscillator mixer
      const gain1 = audioContext.createGain();
      gain1.gain.value = minimoogParams.osc1Level;
      const gain2 = audioContext.createGain();
      gain2.gain.value = minimoogParams.osc2Level;
      const gain3 = audioContext.createGain();
      gain3.gain.value = minimoogParams.osc3Level;
      
      const oscMix = audioContext.createGain();
      oscMix.gain.value = 0.33;
      
      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);
      gain1.connect(oscMix);
      gain2.connect(oscMix);
      gain3.connect(oscMix);
      
      // Ladder filter (4-pole cascade)
      const filter1 = audioContext.createBiquadFilter();
      filter1.type = 'lowpass';
      const filter2 = audioContext.createBiquadFilter();
      filter2.type = 'lowpass';
      const filter3 = audioContext.createBiquadFilter();
      filter3.type = 'lowpass';
      const filter4 = audioContext.createBiquadFilter();
      filter4.type = 'lowpass';
      
      const setCutoff = (cutoff, res) => {
        filter1.frequency.value = cutoff;
        filter1.Q.value = res * 0.25;
        filter2.frequency.value = cutoff;
        filter2.Q.value = res * 0.25;
        filter3.frequency.value = cutoff;
        filter3.Q.value = res * 0.25;
        filter4.frequency.value = cutoff;
        filter4.Q.value = res * 0.25;
      };
      
      setCutoff(minimoogParams.filterCutoff, minimoogParams.filterResonance);
      
      // Filter envelope
      const envAmt = accent ? 4000 : 3000;
      filter1.frequency.setValueAtTime(minimoogParams.filterCutoff, now);
      filter1.frequency.linearRampToValueAtTime(
        Math.min(minimoogParams.filterCutoff + envAmt, 12000),
        now + minimoogParams.attack
      );
      filter1.frequency.exponentialRampToValueAtTime(
        Math.max(minimoogParams.filterCutoff * 0.6, 150),
        now + minimoogParams.attack + minimoogParams.decay
      );
      // Sync other filters
      [filter2, filter3, filter4].forEach(f => {
        f.frequency.setValueAtTime(minimoogParams.filterCutoff, now);
        f.frequency.linearRampToValueAtTime(
          Math.min(minimoogParams.filterCutoff + envAmt, 12000),
          now + minimoogParams.attack
        );
        f.frequency.exponentialRampToValueAtTime(
          Math.max(minimoogParams.filterCutoff * 0.6, 150),
          now + minimoogParams.attack + minimoogParams.decay
        );
      });
      
      // VCA
      const vca = audioContext.createGain();
      const peakVol = velocity * (accent ? 0.6 : 0.45);
      const sustainVol = peakVol * minimoogParams.sustain;
      
      vca.gain.setValueAtTime(0, now);
      vca.gain.linearRampToValueAtTime(peakVol, now + minimoogParams.attack);
      vca.gain.exponentialRampToValueAtTime(Math.max(sustainVol, 0.001), now + minimoogParams.attack + minimoogParams.decay);
      vca.gain.setValueAtTime(sustainVol, now + duration - minimoogParams.release);
      vca.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      const trackRouting = getTrackNodes('bass');
      
      // Chain: OSC Mix -> 4-pole filter cascade -> VCA -> track
      oscMix.connect(filter1);
      filter1.connect(filter2);
      filter2.connect(filter3);
      filter3.connect(filter4);
      filter4.connect(vca);
      vca.connect(trackRouting.filter);
      
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);
      osc3.stop(now + duration + 0.1);
      
      setTimeout(() => {
        try {
          osc1.disconnect(); osc2.disconnect(); osc3.disconnect();
          gain1.disconnect(); gain2.disconnect(); gain3.disconnect();
          oscMix.disconnect(); filter1.disconnect(); filter2.disconnect(); filter3.disconnect(); filter4.disconnect(); vca.disconnect();
        } catch(e) {}
      }, (duration + 0.2) * 1000);
    }

    // Yamaha DX7 (1983) - 4-operator FM synthesis
    function playDX7(note, velocity = 1.0, accent = false, duration = 0.4) {
      if (!audioContext) return;
      const now = audioContext.currentTime;
      const freq = noteToFrequency(note);
      
      // 4 operators (simplified - using oscillators as carriers/modulators)
      const op1 = audioContext.createOscillator();
      op1.frequency.value = freq * dx7Params.op1Ratio;
      
      const op2 = audioContext.createOscillator();
      op2.frequency.value = freq * dx7Params.op2Ratio;
      
      const op3 = audioContext.createOscillator();
      op3.frequency.value = freq * dx7Params.op3Ratio;
      
      const op4 = audioContext.createOscillator();
      op4.frequency.value = freq * dx7Params.op4Ratio;
      
      // Modulation gains
      const mod1 = audioContext.createGain();
      mod1.gain.value = dx7Params.modIndex * 100;
      const mod2 = audioContext.createGain();
      mod2.gain.value = dx7Params.modIndex * 50;
      const mod3 = audioContext.createGain();
      mod3.gain.value = dx7Params.modIndex * 30;
      
      // Algorithm routing (simplified stack: OP1->OP2->OP3->OP4)
      op1.connect(mod1);
      mod1.connect(op2.frequency); // OP1 modulates OP2
      op2.connect(mod2);
      mod2.connect(op3.frequency); // OP2 modulates OP3
      op3.connect(mod3);
      mod3.connect(op4.frequency); // OP3 modulates OP4
      
      // OP4 is carrier (output)
      const carrier = audioContext.createGain();
      carrier.gain.value = 0.3;
      op4.connect(carrier);
      
      // DX7 envelope (fast attack, exponential decay)
      const vca = audioContext.createGain();
      const peakVol = velocity * (accent ? 0.5 : 0.35);
      
      vca.gain.setValueAtTime(0, now);
      vca.gain.linearRampToValueAtTime(peakVol, now + 0.001); // Very fast attack
      vca.gain.exponentialRampToValueAtTime(Math.max(peakVol * 0.1, 0.001), now + duration * 0.7);
      vca.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      const trackRouting = getTrackNodes('bass');
      
      carrier.connect(vca);
      vca.connect(trackRouting.filter);
      
      op1.start(now);
      op2.start(now);
      op3.start(now);
      op4.start(now);
      op1.stop(now + duration + 0.1);
      op2.stop(now + duration + 0.1);
      op3.stop(now + duration + 0.1);
      op4.stop(now + duration + 0.1);
      
      setTimeout(() => {
        try {
          op1.disconnect(); op2.disconnect(); op3.disconnect(); op4.disconnect();
          mod1.disconnect(); mod2.disconnect(); mod3.disconnect();
          carrier.disconnect(); vca.disconnect();
        } catch(e) {}
      }, (duration + 0.2) * 1000);
    }

    // Korg MS-20 (1978) - Dual filters with aggressive resonance
    function playMS20(note, velocity = 1.0, accent = false, duration = 0.5) {
      if (!audioContext) return;
      const now = audioContext.currentTime;
      const freq = noteToFrequency(note);
      
      // Dual oscillators
      const osc1 = audioContext.createOscillator();
      osc1.type = ms20Params.osc1Type;
      osc1.frequency.value = freq;
      
      const osc2 = audioContext.createOscillator();
      osc2.type = ms20Params.osc2Type;
      osc2.frequency.value = freq * (1 + ms20Params.osc2Detune);
      
      const oscMix = audioContext.createGain();
      oscMix.gain.value = 0.5;
      osc1.connect(oscMix);
      osc2.connect(oscMix);
      
      // MS-20 dual filter topology: HPF -> LPF
      const hpf = audioContext.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = ms20Params.hpfCutoff;
      hpf.Q.value = ms20Params.hpfResonance;
      
      const lpf = audioContext.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = ms20Params.lpfCutoff;
      lpf.Q.value = ms20Params.lpfResonance;
      
      // Filter envelope (aggressive)
      const envAmt = accent ? 5000 : 3500;
      lpf.frequency.setValueAtTime(ms20Params.lpfCutoff, now);
      lpf.frequency.linearRampToValueAtTime(
        Math.min(ms20Params.lpfCutoff + envAmt, 15000),
        now + ms20Params.attack
      );
      lpf.frequency.exponentialRampToValueAtTime(
        Math.max(ms20Params.lpfCutoff * 0.3, 200),
        now + ms20Params.attack + ms20Params.decay
      );
      
      // VCA
      const vca = audioContext.createGain();
      const peakVol = velocity * (accent ? 0.55 : 0.4);
      const sustainVol = peakVol * ms20Params.sustain;
      
      vca.gain.setValueAtTime(0, now);
      vca.gain.linearRampToValueAtTime(peakVol, now + ms20Params.attack);
      vca.gain.exponentialRampToValueAtTime(Math.max(sustainVol, 0.001), now + ms20Params.attack + ms20Params.decay);
      vca.gain.setValueAtTime(sustainVol, now + duration - ms20Params.release);
      vca.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      const trackRouting = getTrackNodes('bass');
      
      // Chain: OSC Mix -> HPF -> LPF -> VCA -> track
      oscMix.connect(hpf);
      hpf.connect(lpf);
      lpf.connect(vca);
      vca.connect(trackRouting.filter);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);
      
      setTimeout(() => {
        try {
          osc1.disconnect(); osc2.disconnect();
          oscMix.disconnect(); hpf.disconnect(); lpf.disconnect(); vca.disconnect();
        } catch(e) {}
      }, (duration + 0.2) * 1000);
    }

    // Sequential Prophet-5 (1978) - 5-voice polyphonic
    function playProphet5(note, velocity = 1.0, accent = false, duration = 0.6) {
      if (!audioContext) return;
      const now = audioContext.currentTime;
      const freq = noteToFrequency(note);
      
      // Simplified to 2 oscillators per voice (instead of full 5 voices)
      const osc1 = audioContext.createOscillator();
      osc1.type = prophet5Params.osc1Type;
      osc1.frequency.value = freq;
      
      const osc2 = audioContext.createOscillator();
      osc2.type = prophet5Params.osc2Type;
      osc2.frequency.value = freq * (1 + prophet5Params.osc2Detune);
      
      // Pulse width modulation
      const pwm = audioContext.createOscillator();
      pwm.frequency.value = prophet5Params.pwmRate;
      const pwmGain = audioContext.createGain();
      pwmGain.gain.value = prophet5Params.pwmDepth * 15;
      pwm.connect(pwmGain);
      pwmGain.connect(osc2.detune);
      
      const oscMix = audioContext.createGain();
      oscMix.gain.value = prophet5Params.oscMix;
      osc1.connect(oscMix);
      osc2.connect(oscMix);
      
      // Prophet-5 filter
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = prophet5Params.filterCutoff;
      filter.Q.value = prophet5Params.filterResonance;
      
      // Filter envelope
      const envAmt = accent ? 3500 : 2500;
      filter.frequency.setValueAtTime(prophet5Params.filterCutoff, now);
      filter.frequency.linearRampToValueAtTime(
        Math.min(prophet5Params.filterCutoff + envAmt, 10000),
        now + prophet5Params.attack
      );
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(prophet5Params.filterCutoff * 0.5, 180),
        now + prophet5Params.attack + prophet5Params.decay
      );
      
      // VCA
      const vca = audioContext.createGain();
      const peakVol = velocity * (accent ? 0.5 : 0.4);
      const sustainVol = peakVol * prophet5Params.sustain;
      
      vca.gain.setValueAtTime(0, now);
      vca.gain.linearRampToValueAtTime(peakVol, now + prophet5Params.attack);
      vca.gain.exponentialRampToValueAtTime(Math.max(sustainVol, 0.001), now + prophet5Params.attack + prophet5Params.decay);
      vca.gain.setValueAtTime(sustainVol, now + duration - prophet5Params.release);
      vca.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      const trackRouting = getTrackNodes('bass');
      
      // Chain: OSC Mix -> Filter -> VCA -> track
      oscMix.connect(filter);
      filter.connect(vca);
      vca.connect(trackRouting.filter);
      
      osc1.start(now);
      osc2.start(now);
      pwm.start(now);
      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);
      pwm.stop(now + duration + 0.1);
      
      setTimeout(() => {
        try {
          osc1.disconnect(); osc2.disconnect(); pwm.disconnect();
          oscMix.disconnect(); filter.disconnect(); vca.disconnect(); pwmGain.disconnect();
        } catch(e) {}
      }, (duration + 0.2) * 1000);
    }

    function noteToFrequency(note) {
      const noteMap = {
        'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
        'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
      };
      const match = note.match(/^([A-G]#?)(\\d+)$/);
      if (!match) return 440;
      const noteName = match[1];
      const octave = parseInt(match[2]);
      const noteNum = noteMap[noteName];
      const midiNote = (octave + 1) * 12 + noteNum;
      return 440 * Math.pow(2, (midiNote - 69) / 12);
    }

    // **Enhanced Bass Note Manipulation**
    // State to track active notes for slide/portamento
    let lastBassNote = null;
    let lastBassOscillator = null;
    
    /**
     * Play bass note with slide (portamento) from last note
     * @param {string} note - Note name (e.g. 'C2')
     * @param {number} velocity - 0-1
     * @param {boolean} accent - Accent flag
     * @param {number} duration - Note duration in seconds
     * @param {number} slide - Slide time in seconds (0 = no slide)
     * @param {number} pitchBend - Pitch bend in semitones (+/- 12)
     * @param {number} vibrato - Vibrato depth (0-1)
     * @param {boolean} subOsc - Enable sub-oscillator (octave down)
     */
    function playBassSlide(note, velocity, accent, duration, slide = 0, pitchBend = 0, vibrato = 0, subOsc = false) {
      if (!audioContext) return;

      try {
        const targetFreq = noteToFrequency(note);
        const now = audioContext.currentTime;

        // Main oscillator
        const osc = audioContext.createOscillator();
        osc.type = 'sawtooth';
        
        // Start from last note if slide is enabled
        const startFreq = (slide > 0 && lastBassNote) ? 
          noteToFrequency(lastBassNote) : targetFreq;
        
        osc.frequency.setValueAtTime(startFreq, now);
        
        // Slide to target frequency
        if (slide > 0 && startFreq !== targetFreq) {
          osc.frequency.exponentialRampToValueAtTime(targetFreq, now + slide);
        }
        
        // Apply pitch bend if specified
        if (pitchBend !== 0) {
          const bendRatio = Math.pow(2, pitchBend / 12);
          const endTime = now + duration * 0.8;
          osc.frequency.exponentialRampToValueAtTime(
            targetFreq * bendRatio, 
            endTime
          );
          osc.frequency.exponentialRampToValueAtTime(
            targetFreq, 
            now + duration
          );
        }

        // Add vibrato with LFO
        let vibratoLFO = null;
        let vibratoGain = null;
        if (vibrato > 0) {
          vibratoLFO = audioContext.createOscillator();
          vibratoLFO.frequency.value = 5.5; // 5.5 Hz vibrato
          vibratoGain = audioContext.createGain();
          vibratoGain.gain.value = vibrato * 15; // Vibrato depth in Hz
          vibratoLFO.connect(vibratoGain);
          vibratoGain.connect(osc.frequency);
          vibratoLFO.start(now);
          vibratoLFO.stop(now + duration + 0.1);
        }

        // Sub-oscillator (octave down)
        let subOsc = null;
        let subGain = null;
        if (subOsc) {
          subOsc = audioContext.createOscillator();
          subOsc.type = 'sine';
          subOsc.frequency.value = targetFreq / 2; // One octave down
          subGain = audioContext.createGain();
          subGain.gain.value = 0.4; // Blend sub-osc
        }

        // Resonant filter
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        const baseCutoff = 800 + (accent ? 400 : 0);
        filter.frequency.value = baseCutoff;
        filter.Q.value = 8 + (accent ? 4 : 0); // High resonance for bass

        // VCA with envelope
        const vca = audioContext.createGain();
        vca.gain.value = 0;

        // Routing
        const trackRouting = getTrackNodes('bass');
        osc.connect(filter);
        if (subOsc) {
          subOsc.connect(subGain);
          subGain.connect(filter);
        }
        filter.connect(vca);
        vca.connect(trackRouting.filter);

        // Envelope
        const accentMult = accent ? 1.5 : 1.0;
        const peakVolume = velocity * accentMult * 0.6;
        const filterPeak = baseCutoff + (accent ? 800 : 400);

        // Amplitude envelope (fast attack, medium decay)
        vca.gain.setValueAtTime(0, now);
        vca.gain.linearRampToValueAtTime(peakVolume, now + 0.002);
        vca.gain.exponentialRampToValueAtTime(peakVolume * 0.6, now + 0.1);
        vca.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Filter envelope (punchy bass)
        filter.frequency.setValueAtTime(filterPeak, now);
        filter.frequency.exponentialRampToValueAtTime(baseCutoff * 1.5, now + 0.05);
        filter.frequency.exponentialRampToValueAtTime(baseCutoff, now + 0.2);

        // Start oscillators
        osc.start(now);
        if (subOsc) subOsc.start(now);
        
        osc.stop(now + duration + 0.1);
        if (subOsc) subOsc.stop(now + duration + 0.1);

        // Store for next slide
        lastBassNote = note;
        lastBassOscillator = osc;

        // Cleanup
        setTimeout(() => {
          try {
            osc.disconnect();
            if (subOsc) {
              subOsc.disconnect();
              subGain.disconnect();
            }
            if (vibratoLFO) {
              vibratoLFO.disconnect();
              vibratoGain.disconnect();
            }
            filter.disconnect();
            vca.disconnect();
          } catch (e) {}
        }, (duration + 0.2) * 1000);

      } catch (error) {
        console.error('Bass slide error:', error);
      }
    }

    /**
     * Play stacked bass note (multiple octaves)
     * @param {string} note - Base note
     * @param {number} velocity - 0-1
     * @param {boolean} accent - Accent flag
     * @param {number} duration - Note duration
     * @param {number} octaves - Number of octaves to stack (1-3)
     */
    function playBassStack(note, velocity, accent, duration, octaves = 2) {
      if (!audioContext) return;

      try {
        const baseFreq = noteToFrequency(note);
        const now = audioContext.currentTime;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        filter.Q.value = 6;

        const vca = audioContext.createGain();
        vca.gain.value = 0;

        const trackRouting = getTrackNodes('bass');
        filter.connect(vca);
        vca.connect(trackRouting.filter);

        const oscillators = [];
        
        // Create stacked oscillators
        for (let i = 0; i < Math.min(octaves, 3); i++) {
          const osc = audioContext.createOscillator();
          osc.type = i === 0 ? 'sawtooth' : 'square';
          osc.frequency.value = baseFreq * Math.pow(2, i); // Stack octaves up
          
          const oscGain = audioContext.createGain();
          // Lower octaves louder
          oscGain.gain.value = 1.0 / (i + 1);
          
          osc.connect(oscGain);
          oscGain.connect(filter);
          oscillators.push({ osc, gain: oscGain });
        }

        // Envelope
        const peakVolume = velocity * (accent ? 0.8 : 0.6);
        vca.gain.setValueAtTime(0, now);
        vca.gain.linearRampToValueAtTime(peakVolume, now + 0.002);
        vca.gain.exponentialRampToValueAtTime(peakVolume * 0.7, now + 0.08);
        vca.gain.exponentialRampToValueAtTime(0.001, now + duration);

        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

        // Start all oscillators
        oscillators.forEach(({ osc }) => {
          osc.start(now);
          osc.stop(now + duration + 0.1);
        });

        // Cleanup
        setTimeout(() => {
          try {
            oscillators.forEach(({ osc, gain }) => {
              osc.disconnect();
              gain.disconnect();
            });
            filter.disconnect();
            vca.disconnect();
          } catch (e) {}
        }, (duration + 0.2) * 1000);

      } catch (error) {
        console.error('Bass stack error:', error);
      }
    }

    /**
     * Professional Bass Synthesizer - Full parameter control
     * Dual oscillators, filter with envelope, ADSR, effects chain
     * @param {number} frequency - Frequency in Hz
     * @param {number} velocity - 0-1
     * @param {number} duration - Note duration in seconds
     * @param {object} params - Bass synthesis parameters:
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
    function playBassNote(frequency, velocity, duration, params = {}) {
      if (!audioContext) {
        console.error('❌ Audio context not initialized');
        return null;
      }

      ensureAudioContext();
      
      try {
        console.log(\`🎸 Playing bass note: \${frequency.toFixed(2)}Hz, velocity=\${velocity.toFixed(2)}, duration=\${duration.toFixed(2)}s\`);
        
        const now = audioContext.currentTime;
        
        // Extract parameters with defaults
        const osc1Level = params.osc1Level !== undefined ? params.osc1Level : 0.8;
        const osc2Level = params.osc2Level !== undefined ? params.osc2Level : 0.6;
        const detune = params.detune !== undefined ? params.detune : 5;
        const cutoff = params.cutoff !== undefined ? params.cutoff : 1000;
        const resonance = params.resonance !== undefined ? params.resonance : 5;
        const envAmount = params.envAmount !== undefined ? params.envAmount : 0.5;
        const attack = params.attack !== undefined ? params.attack : 0.01;
        const decay = params.decay !== undefined ? params.decay : 0.3;
        const sustain = params.sustain !== undefined ? params.sustain : 0.7;
        const release = params.release !== undefined ? params.release : 0.5;
        
        console.log(\`📊 Bass params: osc1=\${osc1Level}, osc2=\${osc2Level}, cutoff=\${cutoff}Hz, res=\${resonance}\`);
        
        // Create Oscillator 1 (Sawtooth - punchy bass)
        const osc1 = audioContext.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.value = frequency;
        
        const osc1Gain = audioContext.createGain();
        osc1Gain.gain.value = osc1Level;
        
        // Create Oscillator 2 (Square - thick bass)
        const osc2 = audioContext.createOscillator();
        osc2.type = 'square';
        osc2.frequency.value = frequency;
        osc2.detune.value = detune; // Slight detune for thickness
        
        const osc2Gain = audioContext.createGain();
        osc2Gain.gain.value = osc2Level;
        
        // Oscillator mixer
        const oscMixer = audioContext.createGain();
        oscMixer.gain.value = 0.5; // Balance both oscillators
        
        // Lowpass filter (essential for bass!)
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = cutoff;
        filter.Q.value = resonance;
        
        // Filter envelope modulation
        const filterPeak = Math.min(cutoff + (cutoff * envAmount * 3), 5000);
        filter.frequency.setValueAtTime(cutoff, now);
        filter.frequency.exponentialRampToValueAtTime(filterPeak, now + attack);
        filter.frequency.exponentialRampToValueAtTime(cutoff + (filterPeak - cutoff) * sustain, now + attack + decay);
        filter.frequency.exponentialRampToValueAtTime(cutoff, now + duration);
        
        // Amplitude envelope (ADSR)
        const vca = audioContext.createGain();
        vca.gain.value = 0;
        
        const peakVolume = velocity * 0.7; // Max volume adjusted for headroom
        const sustainLevel = peakVolume * sustain;
        
        // Attack
        vca.gain.setValueAtTime(0, now);
        vca.gain.linearRampToValueAtTime(peakVolume, now + attack);
        
        // Decay
        vca.gain.exponentialRampToValueAtTime(sustainLevel, now + attack + decay);
        
        // Sustain (hold at sustain level)
        vca.gain.setValueAtTime(sustainLevel, now + duration - release);
        
        // Release
        vca.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        // Connect audio graph
        osc1.connect(osc1Gain);
        osc2.connect(osc2Gain);
        osc1Gain.connect(oscMixer);
        osc2Gain.connect(oscMixer);
        oscMixer.connect(filter);
        filter.connect(vca);
        vca.connect(audioContext.destination);
        
        // Start oscillators
        osc1.start(now);
        osc2.start(now);
        
        // Stop oscillators after release
        osc1.stop(now + duration + 0.1);
        osc2.stop(now + duration + 0.1);
        
        console.log(\`✅ Bass note playing! Peaks at \${filterPeak.toFixed(0)}Hz\`);
        
        // Cleanup
        setTimeout(() => {
          try {
            osc1.disconnect();
            osc2.disconnect();
            osc1Gain.disconnect();
            osc2Gain.disconnect();
            oscMixer.disconnect();
            filter.disconnect();
            vca.disconnect();
          } catch (e) {
            // Already disconnected
          }
        }, (duration + 0.2) * 1000);
        
        // Return node references for real-time control
        return {
          osc1,
          osc2,
          osc1Gain,
          osc2Gain,
          filter,
          vca,
          stopTime: () => {
            const releaseStart = audioContext.currentTime;
            vca.gain.cancelScheduledValues(releaseStart);
            vca.gain.exponentialRampToValueAtTime(0.001, releaseStart + 0.05);
            osc1.stop(releaseStart + 0.1);
            osc2.stop(releaseStart + 0.1);
          }
        };
        
      } catch (error) {
        console.error('❌ Bass synthesis error:', error);
        return null;
      }
    }

    function updateParams(params) {
      // Update TB-303 params
      if (params.cutoff !== undefined || params.resonance !== undefined || 
          params.envMod !== undefined || params.decay !== undefined || 
          params.accent !== undefined || params.waveform !== undefined) {
        Object.assign(tb303Params, params);
      }
      
      // Update TR-808 params
      if (params.kickPitch !== undefined || params.kickDecay !== undefined ||
          params.snareTone !== undefined || params.snareNoise !== undefined ||
          params.hihatDecay !== undefined) {
        Object.assign(tr808Params, params);
      }
      
      // Update ARP 2600 params
      if (params.osc1 !== undefined || params.osc2 !== undefined ||
          params.osc2Detune !== undefined || params.filterCutoff !== undefined ||
          params.filterRes !== undefined || params.attack !== undefined ||
          params.decay !== undefined || params.sustain !== undefined ||
          params.release !== undefined) {
        Object.assign(arp2600Params, params);
      }
    }

    function sendMessage(data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    // Message handler function that can be called directly
    function handleMessage(message) {
      try {
        console.log('📨 WebView received message type:', message.type);
        
        switch (message.type) {
          case 'init':
            init();
            break;
          case 'play_note':
            playTB303(message.note, message.velocity, message.accent, message.duration);
            break;
          case 'play_bass_slide':
            playBassSlide(
              message.note, 
              message.velocity, 
              message.accent, 
              message.duration,
              message.slide || 0,
              message.pitchBend || 0,
              message.vibrato || 0,
              message.subOsc || false
            );
            break;
          case 'play_bass_stack':
            playBassStack(
              message.note,
              message.velocity,
              message.accent,
              message.duration,
              message.octaves || 2
            );
            break;
          case 'playBassNote':
            // Professional bass synthesizer with full parameter control
            playBassNote(
              message.params.frequency,
              message.params.velocity,
              message.params.duration,
              message.params // Pass all bass parameters
            );
            break;
          case 'play_arp2600':
            playARP2600(message.note, message.velocity, message.accent, message.duration);
            break;
          case 'play_juno106':
            playJuno106(message.note, message.velocity, message.accent, message.duration);
            break;
          case 'play_minimoog':
            playMinimoog(message.note, message.velocity, message.accent, message.duration);
            break;
          case 'play_dx7':
            playDX7(message.note, message.velocity, message.accent, message.duration);
            break;
          case 'play_ms20':
            playMS20(message.note, message.velocity, message.accent, message.duration);
            break;
          case 'play_prophet5':
            playProphet5(message.note, message.velocity, message.accent, message.duration);
            break;
          case 'play_kick':
            console.log('📩 WebView received play_kick message, velocity=' + (message.velocity || 1.0));
            playKick808(message.velocity || 1.0);
            break;
          case 'play_snare':
            console.log('📩 WebView received play_snare message, velocity=' + (message.velocity || 1.0));
            playSnare808(message.velocity || 1.0);
            break;
          case 'play_hihat':
            console.log('📩 WebView received play_hihat message, velocity=' + (message.velocity || 1.0));
            playHihat808(message.velocity || 1.0, message.open || false);
            break;
          case 'play_clap':
            console.log('📩 WebView received play_clap message, velocity=' + (message.velocity || 1.0));
            playClap808(message.velocity || 1.0);
            break;
          case 'play_piano':
            console.log('📩 WebView received play_piano message, freq=' + message.frequency);
            playPiano(message.frequency, message.velocity, message.duration, message.pianoType, message.reverb, message.brightness);
            break;
          case 'update_params':
            updateParams(message.params);
            break;
          case 'update_effects_params':
            // Update effects parameters
            if (message.params) {
              Object.assign(effectsParams, message.params);
              applyEffectsParams();
            }
            break;
          case 'set_track_send':
            // Update a specific track send level
            if (message.track && message.sendType && effectsParams.tracks[message.track]) {
              effectsParams.tracks[message.track][message.sendType] = message.value;
              applyEffectsParams();
            }
            break;
          case 'set_track_param':
            // Update any track parameter
            if (message.track && message.param && effectsParams.tracks[message.track]) {
              effectsParams.tracks[message.track][message.param] = message.value;
              applyEffectsParams();
            }
            break;
          case 'bypass_effect':
            // TODO: Implement effect bypass (set wet gain to 0)
            break;
        }
      } catch (error) {
        console.error('Message error:', error);
      }
    }
    
    // Adapter for services/WebAudioBridge format (command, params)
    window.processCommand = function(commandMessage) {
      try {
        console.log('📨 processCommand received:', commandMessage.command, commandMessage.params);
        console.log('📨 processCommand commandMessage type:', typeof commandMessage, 'keys:', Object.keys(commandMessage));
        
        // Map camelCase commands to snake_case message types
        const commandMap = {
          'playKick': 'play_kick',
          'playSnare': 'play_snare',
          'playHiHat': 'play_hihat',
          'playClap': 'play_clap',
          'playPiano': 'play_piano',
          'playARP2600': 'play_arp2600',
          'playJuno106': 'play_juno106',
          'playMinimoog': 'play_minimoog',
          'playTB303': 'play_note', // TB303 uses play_note
          'setWaveform': 'set_waveform',
          'setADSR': 'set_adsr',
          'setFilter': 'set_filter',
          'setMasterVolume': 'set_master_volume',
          'setDistortion': 'set_distortion',
          'setReverb': 'set_reverb',
          'setDelay': 'set_delay',
          'setCompression': 'set_compression',
          'startWaveformUpdates': 'start_waveform_updates',
          'stopWaveformUpdates': 'stop_waveform_updates',
          'initAudio': 'init',
          'stopAllNotes': 'stop_all',
        };
        
        const messageType = commandMap[commandMessage.command] || commandMessage.command;
        const params = commandMessage.params || {};
        
        // Convert frequency to note if present (for synth commands)
        if (params.frequency && typeof params.frequency === 'number') {
          // Use frequency directly as note (HTML will handle it)
          params.note = params.frequency;
        }
        
        // Map command names to message types and merge params
        const message = {
          type: messageType,
          ...params
        };
        
        console.log('📨 Calling handleMessage with:', message);
        handleMessage(message);
      } catch (error) {
        console.error('processCommand error:', error);
      }
    };
    
    // Also listen for postMessage (backup method)
    window.addEventListener('message', (event) => {
      try {
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        handleMessage(message);
      } catch (error) {
        console.error('postMessage error:', error);
      }
    });

    sendMessage({ type: 'ready' });
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlSource }}
        originWhitelist={['*']}
        style={styles.webView}
        javaScriptEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        onMessage={(event) => bridge.onMessage(event)}
        onError={(error) => console.error('WebView error:', error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  webView: {
    width: 1,
    height: 1,
    backgroundColor: 'transparent',
  },
});

export default bridge;
