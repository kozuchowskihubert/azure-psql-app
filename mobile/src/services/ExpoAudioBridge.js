/**
 * ExpoAudioBridge - Native audio using Tone.js
 * Much simpler and more reliable than WebView approach
 */

import * as Tone from 'tone';

class ExpoAudioBridge {
  constructor() {
    this.isReady = false;
    this.synth = null;
    this.drumSynths = {};
    this.activeNotes = {};
    
    console.log('🎵 ExpoAudioBridge (Tone.js) initializing...');
  }

  async initAudio() {
    try {
      // Start Tone.js audio context
      await Tone.start();
      console.log('✅ Tone.js started');

      // Create a polyphonic synth for notes
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'sawtooth'
        },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 0.1
        }
      }).toDestination();

      // Create drum synths
      this.drumSynths = {
        kick: new Tone.MembraneSynth().toDestination(),
        snare: new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
        }).toDestination(),
        hihat: new Tone.MetalSynth({
          frequency: 200,
          envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).toDestination(),
        cymbal: new Tone.MetalSynth({
          frequency: 150,
          envelope: { attack: 0.001, decay: 0.4, release: 0.2 },
          harmonicity: 3.1,
          modulationIndex: 16,
          resonance: 3000,
          octaves: 2
        }).toDestination(),
        tom: new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 6,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
        }).toDestination()
      };

      this.isReady = true;
      console.log('✅ ExpoAudioBridge ready with all synths');
      
      return { success: true, sampleRate: Tone.context.sampleRate };
    } catch (error) {
      console.error('❌ ExpoAudioBridge init failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Play a musical note
  playNote(note, velocity = 1, duration = 0.5) {
    if (!this.isReady) {
      console.warn('⚠️ Audio not ready');
      return;
    }

    try {
      const vel = Math.max(0.1, Math.min(1, velocity));
      this.synth.triggerAttackRelease(note, duration, undefined, vel);
      console.log(`🎹 Playing note: ${note} @ velocity ${vel}`);
    } catch (error) {
      console.error('❌ Play note failed:', error);
    }
  }

  // Start a note (for press and hold)
  noteOn(note, velocity = 1) {
    if (!this.isReady) return;
    
    try {
      const vel = Math.max(0.1, Math.min(1, velocity));
      this.synth.triggerAttack(note, undefined, vel);
      this.activeNotes[note] = true;
      console.log(`🎹 Note ON: ${note}`);
    } catch (error) {
      console.error('❌ Note ON failed:', error);
    }
  }

  // Stop a note
  noteOff(note) {
    if (!this.isReady || !this.activeNotes[note]) return;
    
    try {
      this.synth.triggerRelease(note);
      delete this.activeNotes[note];
      console.log(`🎹 Note OFF: ${note}`);
    } catch (error) {
      console.error('❌ Note OFF failed:', error);
    }
  }

  // Drum machine methods
  playKick() {
    if (!this.isReady) return;
    this.drumSynths.kick.triggerAttackRelease('C1', '8n');
    console.log('🥁 Kick');
  }

  playSnare() {
    if (!this.isReady) return;
    this.drumSynths.snare.triggerAttackRelease('8n');
    console.log('🥁 Snare');
  }

  playHihat(open = false) {
    if (!this.isReady) return;
    const duration = open ? '8n' : '32n';
    this.drumSynths.hihat.triggerAttackRelease(duration);
    console.log(`🥁 HiHat ${open ? '(open)' : '(closed)'}`);
  }

  playCymbal() {
    if (!this.isReady) return;
    this.drumSynths.cymbal.triggerAttackRelease('4n');
    console.log('🥁 Cymbal');
  }

  playTom(pitch = 1) {
    if (!this.isReady) return;
    const note = pitch === 1 ? 'G2' : pitch === 2 ? 'C2' : 'F1';
    this.drumSynths.tom.triggerAttackRelease(note, '8n');
    console.log(`🥁 Tom (${pitch})`);
  }

  playClap() {
    if (!this.isReady) return;
    this.drumSynths.snare.triggerAttackRelease('16n');
    console.log('🥁 Clap');
  }

  // Set synth parameters
  setParameter(param, value) {
    if (!this.isReady) return;
    
    try {
      switch (param) {
        case 'attack':
          this.synth.set({ envelope: { attack: value } });
          break;
        case 'release':
          this.synth.set({ envelope: { release: value } });
          break;
        case 'cutoff':
          // Add filter if needed
          break;
        default:
          console.log(`🎛️ Set ${param} = ${value}`);
      }
    } catch (error) {
      console.error('❌ Set parameter failed:', error);
    }
  }

  // Cleanup
  async destroy() {
    try {
      // Release all active notes
      Object.keys(this.activeNotes).forEach(note => this.noteOff(note));
      
      // Dispose of synths
      if (this.synth) {
        this.synth.dispose();
      }
      
      Object.values(this.drumSynths).forEach(synth => {
        if (synth) synth.dispose();
      });
      
      this.isReady = false;
      console.log('🗑️ ExpoAudioBridge cleaned up');
    } catch (error) {
      console.error('Failed to cleanup:', error);
    }
  }
}

// Singleton instance
const expoAudioBridge = new ExpoAudioBridge();
export default expoAudioBridge;
