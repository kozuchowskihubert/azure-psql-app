/**
 * HAOS.fm TR-909 Drum Machine
 * Uses expo-av with bundled samples - punchier sound than 808
 */

import { Audio } from 'expo-av';

// Bundled drum samples - same base but processed differently
const SAMPLES = {
  kick: require('../../assets/audio/kick.mp3'),
  snare: require('../../assets/audio/snare.mp3'),
  hihat: require('../../assets/audio/hihat.mp3'),
  clap: require('../../assets/audio/clap.mp3'),
  click: require('../../assets/audio/click.mp3'),
};

class TR909 {
  constructor() {
    this.isReady = false;
    this.loadedSounds = {};
    this.volume = 0.85;
  }

  async init() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      
      this.isReady = true;
      console.log('🥁 TR-909 ready');
      return true;
    } catch (error) {
      console.error('TR-909 init failed:', error);
      return false;
    }
  }

  async playKick(vel = 1.0) {
    // 909 kick is punchier - slightly higher pitch
    await this._playDrum('kick', vel, 1.15);
  }

  async playSnare(vel = 1.0) {
    // 909 snare is crispier
    await this._playDrum('snare', vel, 1.1);
  }

  async playHihat(vel = 1.0, open = false) {
    await this._playDrum('hihat', vel, open ? 0.7 : 1.3);
  }

  async playClap(vel = 1.0) {
    await this._playDrum('clap', vel, 1.05);
  }

  async playCymbal(vel = 1.0) {
    await this._playDrum('hihat', vel, 0.5);
  }

  async playRide(vel = 1.0) {
    await this._playDrum('hihat', vel, 0.6);
  }

  async playTom(vel = 1.0, pitch = 1.0) {
    await this._playDrum('kick', vel * 0.7, pitch * 1.8);
  }

  async _playDrum(drum, velocity = 1.0, rate = 1.0) {
    try {
      const sample = SAMPLES[drum] || SAMPLES.click;
      
      const { sound } = await Audio.Sound.createAsync(
        sample,
        {
          volume: velocity * this.volume,
          rate: rate,
          shouldPlay: true,
        }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log(`Audio error: ${error.message}`);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}

const tr909 = new TR909();
export default tr909;
export { TR909 };
