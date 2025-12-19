/**
 * HAOS.fm TR-808 Drum Machine
 * Uses expo-av with bundled samples
 */

import { Audio } from 'expo-av';

// Bundled drum samples
const SAMPLES = {
  kick: require('../../assets/audio/kick.mp3'),
  snare: require('../../assets/audio/snare.mp3'),
  hihat: require('../../assets/audio/hihat.mp3'),
  clap: require('../../assets/audio/clap.mp3'),
  click: require('../../assets/audio/click.mp3'),
};

class TR808 {
  constructor() {
    this.isReady = false;
    this.loadedSounds = {};
    this.volume = 0.8;
  }

  async init() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      
      this.isReady = true;
      console.log('🥁 TR-808 ready');
      return true;
    } catch (error) {
      console.error('TR-808 init failed:', error);
      return false;
    }
  }

  async playKick(vel = 1.0) {
    await this._playDrum('kick', vel);
  }

  async playSnare(vel = 1.0) {
    await this._playDrum('snare', vel);
  }

  async playHihat(vel = 1.0, open = false) {
    await this._playDrum('hihat', vel, open ? 0.8 : 1.2);
  }

  async playClap(vel = 1.0) {
    await this._playDrum('clap', vel);
  }

  async playCowbell(vel = 1.0) {
    await this._playDrum('click', vel, 2.0);
  }

  async playRimshot(vel = 1.0) {
    await this._playDrum('click', vel, 1.5);
  }

  async playTom(vel = 1.0, pitch = 1.0) {
    await this._playDrum('kick', vel * 0.7, pitch * 1.5);
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

const tr808 = new TR808();
export default tr808;
export { TR808 };
