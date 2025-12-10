/**
 * HAOS Audio Export Service
 * Handles audio recording, rendering, and export to WAV/MP3/FLAC formats
 * with premium tier restrictions
 */

(function() {
  'use strict';

  // Export format configurations
  const EXPORT_FORMATS = {
    wav: {
      name: 'WAV',
      extension: 'wav',
      mimeType: 'audio/wav',
      quality: 'lossless',
      minPlan: 'free',
      icon: '🎵',
    },
    mp3: {
      name: 'MP3',
      extension: 'mp3',
      mimeType: 'audio/mpeg',
      quality: 'compressed',
      minPlan: 'basic',
      icon: '💿',
      bitrates: [128, 192, 256, 320],
    },
    flac: {
      name: 'FLAC',
      extension: 'flac',
      mimeType: 'audio/flac',
      quality: 'lossless',
      minPlan: 'premium',
      icon: '💎',
    },
    aiff: {
      name: 'AIFF',
      extension: 'aiff',
      mimeType: 'audio/aiff',
      quality: 'lossless',
      minPlan: 'premium',
      icon: '🎼',
    },
  };

  // Sample rates by plan
  const SAMPLE_RATES = {
    free: [44100],
    basic: [44100, 48000],
    premium: [44100, 48000, 96000],
    pro: [44100, 48000, 96000, 192000],
  };

  // Export durations
  const EXPORT_DURATIONS = {
    preview: 3,    // 3 seconds for preview
    short: 5,      // 5 seconds
    medium: 10,    // 10 seconds
    full: 30,      // 30 seconds (full sequence)
  };

  /**
   * Audio Export Manager
   */
  class HAOSAudioExport {
    constructor() {
      this.audioContext = null;
      this.mediaRecorder = null;
      this.recordedChunks = [];
      this.isRecording = false;
      this.recordingStartTime = 0;
      this.destination = null;
    }

    /**
     * Initialize audio context and destination
     */
    initAudioContext(sampleRate = 48000) {
      if (!this.audioContext || this.audioContext.sampleRate !== sampleRate) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: sampleRate,
          latencyHint: 'playback',
        });
      }
      
      // Create destination for recording
      this.destination = this.audioContext.createMediaStreamDestination();
      
      return this.audioContext;
    }

    /**
     * Get available formats for user's plan
     * Returns all formats with a 'locked' flag for formats not accessible
     */
    getAvailableFormats(userPlan = 'free') {
      const planOrder = { free: 1, basic: 2, premium: 3, pro: 4 };
      const userPlanOrder = planOrder[userPlan] || 1;

      return Object.entries(EXPORT_FORMATS)
        .map(([key, format]) => {
          const requiredOrder = planOrder[format.minPlan] || 1;
          const locked = userPlanOrder < requiredOrder;
          return { key, ...format, locked };
        });
    }

    /**
     * Get available sample rates for user's plan
     */
    getAvailableSampleRates(userPlan = 'free') {
      return SAMPLE_RATES[userPlan] || SAMPLE_RATES.free;
    }

    /**
     * Start recording audio
     */
    async startRecording(options = {}) {
      const {
        sampleRate = 48000,
        duration = EXPORT_DURATIONS.preview,
        format = 'wav',
      } = options;

      // Initialize context
      const ctx = this.initAudioContext(sampleRate);
      
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Setup MediaRecorder
      const stream = this.destination.stream;
      const mimeType = this.getSupportedMimeType(format);
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: options.bitrate || 128000,
      });

      this.recordedChunks = [];
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        console.log('Recording stopped', this.recordedChunks.length, 'chunks');
      };

      this.mediaRecorder.start(100); // Collect data every 100ms

      // Auto-stop after duration
      if (duration > 0) {
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, duration * 1000);
      }

      return {
        context: ctx,
        destination: this.destination,
        recorder: this.mediaRecorder,
      };
    }

    /**
     * Stop recording
     */
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
      }
    }

    /**
     * Get recorded audio as Blob
     */
    async getRecordedBlob(format = 'wav') {
      if (this.recordedChunks.length === 0) {
        throw new Error('No recorded audio data');
      }

      const mimeType = EXPORT_FORMATS[format]?.mimeType || 'audio/wav';
      const blob = new Blob(this.recordedChunks, { type: mimeType });

      return blob;
    }

    /**
     * Download recorded audio
     */
    async downloadRecording(filename, format = 'wav') {
      const blob = await this.getRecordedBlob(format);
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${EXPORT_FORMATS[format].extension}`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      return { success: true, size: blob.size };
    }

    /**
     * Get supported MIME type for format
     */
    getSupportedMimeType(format) {
      const formats = {
        wav: ['audio/wav', 'audio/wave'],
        mp3: ['audio/mpeg', 'audio/mp3'],
        flac: ['audio/flac'],
        webm: ['audio/webm', 'audio/webm;codecs=opus'],
      };

      const candidates = formats[format] || formats.webm;
      
      for (const mimeType of candidates) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          return mimeType;
        }
      }

      // Fallback to any supported type
      return MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/wav';
    }

    /**
     * Convert WebM to WAV (client-side)
     */
    async convertToWAV(audioBuffer) {
      const numberOfChannels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length * numberOfChannels * 2;
      const buffer = new ArrayBuffer(44 + length);
      const view = new DataView(buffer);
      const channels = [];
      let offset = 0;
      let pos = 0;

      // Write WAV header
      const setUint16 = (data) => {
        view.setUint16(pos, data, true);
        pos += 2;
      };

      const setUint32 = (data) => {
        view.setUint32(pos, data, true);
        pos += 4;
      };

      // "RIFF" chunk descriptor
      setUint32(0x46464952); // "RIFF"
      setUint32(36 + length); // file length - 8
      setUint32(0x45564157); // "WAVE"

      // "fmt " sub-chunk
      setUint32(0x20746d66); // "fmt "
      setUint32(16); // subchunk size
      setUint16(1); // PCM format
      setUint16(numberOfChannels);
      setUint32(audioBuffer.sampleRate);
      setUint32(audioBuffer.sampleRate * numberOfChannels * 2); // byte rate
      setUint16(numberOfChannels * 2); // block align
      setUint16(16); // bits per sample

      // "data" sub-chunk
      setUint32(0x61746164); // "data"
      setUint32(length);

      // Write audio data
      for (let i = 0; i < numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
      }

      offset = pos;
      for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, channels[channel][i]));
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          offset += 2;
        }
      }

      return new Blob([buffer], { type: 'audio/wav' });
    }

    /**
     * Render audio buffer from synthesis parameters
     */
    async renderAudio(preset, duration = 5, sampleRate = 48000) {
      const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
      const now = ctx.currentTime;

      // Create oscillators based on preset
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      osc1.type = preset.vco1?.waveform || 'sawtooth';
      osc2.type = preset.vco2?.waveform || 'square';

      const baseFreq = preset.frequency || 440;
      osc1.frequency.value = baseFreq;
      osc2.frequency.value = baseFreq * (preset.vco2?.detune || 1.01);

      // VCF (Filter)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = preset.vcf?.cutoff || 2000;
      filter.Q.value = preset.vcf?.resonance ? preset.vcf.resonance * 20 : 1;

      // VCA (Envelope)
      const vca = ctx.createGain();
      const env = preset.envelope || { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.5 };
      
      vca.gain.setValueAtTime(0, now);
      vca.gain.linearRampToValueAtTime(1, now + env.attack);
      vca.gain.linearRampToValueAtTime(env.sustain, now + env.attack + env.decay);
      vca.gain.setValueAtTime(env.sustain, now + duration - env.release);
      vca.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Connect nodes
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(vca);
      vca.connect(ctx.destination);

      // Start/stop
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);

      // Render
      const audioBuffer = await ctx.startRendering();
      return audioBuffer;
    }

    /**
     * Get recording info
     */
    getRecordingInfo() {
      const duration = this.isRecording 
        ? (Date.now() - this.recordingStartTime) / 1000 
        : 0;

      return {
        isRecording: this.isRecording,
        duration,
        chunks: this.recordedChunks.length,
        size: this.recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0),
      };
    }

    /**
     * Clear recorded data
     */
    clear() {
      this.recordedChunks = [];
      this.isRecording = false;
      this.recordingStartTime = 0;
    }
  }

  // Global instance
  window.HAOSAudioExport = new HAOSAudioExport();

  // Export constants
  window.EXPORT_FORMATS = EXPORT_FORMATS;
  window.EXPORT_DURATIONS = EXPORT_DURATIONS;

  console.log('✅ HAOS Audio Export Service loaded');

})();
