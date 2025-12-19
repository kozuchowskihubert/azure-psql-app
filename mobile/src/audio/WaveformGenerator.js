/**
 * HAOS.fm Waveform Generator
 * Real-time synthesis using mathematical waveforms
 * Generates audio buffers that can be played back
 */

class WaveformGenerator {
  constructor(sampleRate = 44100) {
    this.sampleRate = sampleRate;
  }

  /**
   * Generate sawtooth wave
   * Classic analog synth sound with all harmonics
   */
  generateSawtooth(frequency, duration, amplitude = 1.0) {
    const numSamples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / this.sampleRate;
      // Sawtooth: 2 * (t * frequency - floor(t * frequency + 0.5))
      const phase = (t * frequency) % 1.0;
      buffer[i] = (2 * phase - 1) * amplitude;
    }
    
    return buffer;
  }

  /**
   * Generate square wave
   * Hollow sound with odd harmonics only
   */
  generateSquare(frequency, duration, amplitude = 1.0, pulseWidth = 0.5) {
    const numSamples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / this.sampleRate;
      const phase = (t * frequency) % 1.0;
      buffer[i] = (phase < pulseWidth ? 1 : -1) * amplitude;
    }
    
    return buffer;
  }

  /**
   * Generate triangle wave
   * Softer than square, only odd harmonics with different phase
   */
  generateTriangle(frequency, duration, amplitude = 1.0) {
    const numSamples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / this.sampleRate;
      const phase = (t * frequency) % 1.0;
      // Triangle: 4 * |phase - 0.5| - 1
      buffer[i] = (4 * Math.abs(phase - 0.5) - 1) * amplitude;
    }
    
    return buffer;
  }

  /**
   * Generate sine wave
   * Pure fundamental frequency, no harmonics
   */
  generateSine(frequency, duration, amplitude = 1.0) {
    const numSamples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / this.sampleRate;
      buffer[i] = Math.sin(2 * Math.PI * frequency * t) * amplitude;
    }
    
    return buffer;
  }

  /**
   * Apply ADSR envelope to buffer
   */
  applyEnvelope(buffer, attack, decay, sustain, release) {
    const numSamples = buffer.length;
    const attackSamples = Math.floor(attack * this.sampleRate);
    const decaySamples = Math.floor(decay * this.sampleRate);
    const releaseSamples = Math.floor(release * this.sampleRate);
    const sustainSamples = numSamples - attackSamples - decaySamples - releaseSamples;
    
    for (let i = 0; i < numSamples; i++) {
      let envelope = 1.0;
      
      if (i < attackSamples) {
        // Attack: linear ramp up
        envelope = i / attackSamples;
      } else if (i < attackSamples + decaySamples) {
        // Decay: exponential decay to sustain level
        const decayProgress = (i - attackSamples) / decaySamples;
        envelope = 1.0 - (1.0 - sustain) * decayProgress;
      } else if (i < attackSamples + decaySamples + sustainSamples) {
        // Sustain: constant level
        envelope = sustain;
      } else {
        // Release: exponential decay to zero
        const releaseProgress = (i - attackSamples - decaySamples - sustainSamples) / releaseSamples;
        envelope = sustain * (1.0 - releaseProgress);
      }
      
      buffer[i] *= envelope;
    }
    
    return buffer;
  }

  /**
   * Apply low-pass filter (simple one-pole)
   * Simulates analog filter cutoff
   */
  applyLowPassFilter(buffer, cutoffFreq) {
    const RC = 1.0 / (2 * Math.PI * cutoffFreq);
    const dt = 1.0 / this.sampleRate;
    const alpha = dt / (RC + dt);
    
    let filtered = new Float32Array(buffer.length);
    filtered[0] = buffer[0];
    
    for (let i = 1; i < buffer.length; i++) {
      filtered[i] = filtered[i - 1] + alpha * (buffer[i] - filtered[i - 1]);
    }
    
    return filtered;
  }

  /**
   * Add resonance to filter (emphasis at cutoff frequency)
   */
  applyResonance(buffer, cutoffFreq, resonance) {
    // Simple resonance by adding feedback
    const feedback = resonance * 0.7;
    let filtered = new Float32Array(buffer.length);
    let prev = 0;
    
    for (let i = 0; i < buffer.length; i++) {
      filtered[i] = buffer[i] + prev * feedback;
      prev = filtered[i];
    }
    
    return this.applyLowPassFilter(filtered, cutoffFreq);
  }

  /**
   * Generate TB-303 style bass with filter sweep
   */
  generate303Bass(note, duration, cutoff, resonance, envMod, accent = false) {
    const frequency = this.noteToFrequency(note);
    
    // Generate sawtooth base
    let buffer = this.generateSawtooth(frequency, duration, accent ? 1.0 : 0.8);
    
    // Calculate filter envelope
    const baseCutoff = cutoff * 8000; // 0-8kHz range
    const envelopeAmount = envMod * 4000; // Up to +4kHz from envelope
    
    // Apply time-varying filter (envelope modulation)
    const numSamples = buffer.length;
    const filtered = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / numSamples;
      // Exponential envelope decay
      const envelope = Math.exp(-5 * t);
      const currentCutoff = baseCutoff + envelopeAmount * envelope;
      
      // Simple filter at this sample
      const rc = 1.0 / (2 * Math.PI * currentCutoff);
      const dt = 1.0 / this.sampleRate;
      const alpha = dt / (rc + dt);
      
      filtered[i] = i === 0 ? buffer[i] : 
        filtered[i - 1] + alpha * (buffer[i] - filtered[i - 1]);
    }
    
    // Apply resonance
    if (resonance > 0) {
      return this.applyResonance(filtered, baseCutoff, resonance);
    }
    
    return filtered;
  }

  /**
   * Convert MIDI note name to frequency
   */
  noteToFrequency(note) {
    const noteMap = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) return 440; // Default A4
    
    const noteName = match[1];
    const octave = parseInt(match[2]);
    
    const noteNum = noteMap[noteName];
    const midiNote = (octave + 1) * 12 + noteNum;
    
    // A4 = 440Hz is MIDI note 69
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  /**
   * Convert Float32Array to base64 WAV for playback
   */
  bufferToWav(buffer) {
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = this.sampleRate * blockAlign;
    const dataSize = buffer.length * bytesPerSample;
    const fileSize = 44 + dataSize;
    
    const wav = new ArrayBuffer(fileSize);
    const view = new DataView(wav);
    
    // RIFF header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize - 8, true);
    this.writeString(view, 8, 'WAVE');
    
    // fmt chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true);
    
    // data chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Write samples
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return wav;
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

export default WaveformGenerator;
