/**
 * HAOS.fm Audio Routing Engine
 * Complete DAW-style routing system with buses, sends, and modulation
 */

import nativeAudioContext from './NativeAudioContext';

class AudioRoutingEngine {
  constructor() {
    this.initialized = false;
    
    // Channel strips (mixer channels)
    this.channels = new Map();
    
    // Buses (group channels)
    this.buses = new Map();
    
    // Send effects (shared reverb, delay, etc.)
    this.sends = new Map();
    
    // Master output
    this.masterChannel = null;
    
    // Routing matrix (source -> destinations)
    this.routingMatrix = new Map();
    
    // Modulation sources and targets
    this.modulationMatrix = new Map();
    
    // Active notes for each instrument
    this.activeNotes = new Map();
  }

  async initialize() {
    console.log('🎛️ AudioRoutingEngine: Initializing...');
    
    try {
      // Initialize native audio context first
      await nativeAudioContext.initialize();
      
      // Create master channel
      this.masterChannel = this.createMasterChannel();
      
      // Create default buses
      this.createBus('drums', 'DRUMS BUS', '#FF6B35');
      this.createBus('synths', 'SYNTHS BUS', '#00D9FF');
      this.createBus('melody', 'MELODY BUS', '#39FF14');
      this.createBus('strings', 'STRINGS BUS', '#8B5CF6');
      
      // Create send effects
      this.createSend('reverb', 'REVERB', '#00FFFF');
      this.createSend('delay', 'DELAY', '#FF00FF');
      this.createSend('chorus', 'CHORUS', '#FFFF00');
      
      // Create instrument channels
      this.createInstrumentChannels();
      
      this.initialized = true;
      console.log('✅ AudioRoutingEngine initialized');
      return true;
    } catch (error) {
      console.error('❌ AudioRoutingEngine initialization failed:', error);
      return false;
    }
  }

  createMasterChannel() {
    return {
      id: 'master',
      name: 'MASTER',
      color: '#FF6B35',
      gain: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      meters: { peak: 0, rms: 0 },
      effects: []
    };
  }

  createBus(id, name, color) {
    const bus = {
      id,
      name,
      color,
      gain: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      meters: { peak: 0, rms: 0 },
      channels: [],
      effects: []
    };
    
    this.buses.set(id, bus);
    console.log(`🎛️ Created bus: ${name}`);
    return bus;
  }

  createSend(id, name, color) {
    const send = {
      id,
      name,
      color,
      gain: 0.5,
      wetDry: 0.3,
      preFader: false,
      effects: []
    };
    
    this.sends.set(id, send);
    console.log(`🎚️ Created send: ${name}`);
    return send;
  }

  createInstrumentChannels() {
    // DRUM INSTRUMENTS
    this.createChannel('kick', 'KICK', 'drums', '#FF0000');
    this.createChannel('snare', 'SNARE', 'drums', '#FF4400');
    this.createChannel('hihat', 'HI-HAT', 'drums', '#FF8800');
    this.createChannel('clap', 'CLAP', 'drums', '#FFAA00');
    this.createChannel('tom', 'TOM', 'drums', '#FFCC00');
    
    // SYNTH INSTRUMENTS
    this.createChannel('arp2600', 'ARP 2600', 'synths', '#00D9FF');
    this.createChannel('juno106', 'JUNO-106', 'synths', '#0088FF');
    this.createChannel('minimoog', 'MINIMOOG', 'synths', '#0044FF');
    this.createChannel('tb303', 'TB-303', 'synths', '#00FFFF');
    
    // MELODY INSTRUMENTS
    this.createChannel('piano', 'PIANO', 'melody', '#39FF14');
    this.createChannel('organ', 'ORGAN', 'melody', '#44FF00');
    this.createChannel('guitar', 'GUITAR', 'melody', '#88FF00');
    
    // STRING INSTRUMENTS
    this.createChannel('strings', 'STRINGS', 'strings', '#8B5CF6');
    this.createChannel('violin', 'VIOLIN', 'strings', '#A855F7');
    this.createChannel('cello', 'CELLO', 'strings', '#7C3AED');
    
    console.log(`✅ Created ${this.channels.size} instrument channels`);
  }

  createChannel(id, name, busId, color) {
    const channel = {
      id,
      name,
      busId,
      color,
      gain: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      meters: { peak: 0, rms: 0 },
      sends: {
        reverb: 0,
        delay: 0,
        chorus: 0
      },
      effects: [],
      routing: {
        input: null,
        output: busId
      }
    };
    
    this.channels.set(id, channel);
    
    // Add to bus
    const bus = this.buses.get(busId);
    if (bus) {
      bus.channels.push(id);
    }
    
    return channel;
  }

  // ROUTING METHODS

  routeChannelToBus(channelId, busId) {
    const channel = this.channels.get(channelId);
    const bus = this.buses.get(busId);
    
    if (!channel || !bus) {
      console.error(`Routing failed: channel=${channelId}, bus=${busId}`);
      return false;
    }
    
    // Remove from old bus
    if (channel.busId) {
      const oldBus = this.buses.get(channel.busId);
      if (oldBus) {
        oldBus.channels = oldBus.channels.filter(id => id !== channelId);
      }
    }
    
    // Add to new bus
    channel.busId = busId;
    channel.routing.output = busId;
    bus.channels.push(channelId);
    
    console.log(`🔀 Routed ${channel.name} → ${bus.name}`);
    return true;
  }

  setChannelGain(channelId, gain) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.gain = Math.max(0, Math.min(1, gain));
      console.log(`🎚️ ${channel.name} gain: ${(gain * 100).toFixed(0)}%`);
    }
  }

  setChannelPan(channelId, pan) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.pan = Math.max(-1, Math.min(1, pan));
      console.log(`↔️ ${channel.name} pan: ${pan > 0 ? 'R' : 'L'}${Math.abs(pan * 100).toFixed(0)}%`);
    }
  }

  setChannelMute(channelId, mute) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.mute = mute;
      console.log(`🔇 ${channel.name} mute: ${mute}`);
    }
  }

  setChannelSolo(channelId, solo) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.solo = solo;
      console.log(`🎧 ${channel.name} solo: ${solo}`);
    }
  }

  setChannelSend(channelId, sendId, amount) {
    const channel = this.channels.get(channelId);
    if (channel && channel.sends.hasOwnProperty(sendId)) {
      channel.sends[sendId] = Math.max(0, Math.min(1, amount));
      console.log(`📤 ${channel.name} → ${sendId.toUpperCase()}: ${(amount * 100).toFixed(0)}%`);
    }
  }

  // PLAYBACK METHODS

  async playNote(instrumentId, note, options = {}) {
    if (!this.initialized) {
      console.warn('AudioRoutingEngine not initialized');
      return;
    }

    const channel = this.channels.get(instrumentId);
    if (!channel) {
      console.error(`Channel not found: ${instrumentId}`);
      return;
    }

    // Check mute/solo
    if (channel.mute) return;
    
    const soloChannels = Array.from(this.channels.values()).filter(ch => ch.solo);
    if (soloChannels.length > 0 && !channel.solo) return;

    // Apply channel gain
    const velocity = (options.velocity || 1.0) * channel.gain;
    const duration = options.duration || 0.5;

    // Route to appropriate synth engine
    try {
      switch (instrumentId) {
        case 'arp2600':
          await nativeAudioContext.playARP2600Note(note, velocity, duration);
          break;
        case 'juno106':
          await nativeAudioContext.playJuno106Note(note, velocity, duration);
          break;
        case 'minimoog':
          await nativeAudioContext.playMinimoogNote(note, velocity, duration);
          break;
        case 'tb303':
          await nativeAudioContext.playTB303Note(note, velocity, duration);
          break;
        case 'piano':
          await nativeAudioContext.playPianoNote(note, velocity, duration);
          break;
        default:
          console.log(`🎵 Play ${instrumentId}: ${note}`);
      }

      // Track active note
      if (!this.activeNotes.has(instrumentId)) {
        this.activeNotes.set(instrumentId, new Set());
      }
      this.activeNotes.get(instrumentId).add(note);

      // Remove after duration
      setTimeout(() => {
        const notes = this.activeNotes.get(instrumentId);
        if (notes) notes.delete(note);
      }, duration * 1000);

    } catch (error) {
      console.error(`Error playing ${instrumentId}:`, error);
    }
  }

  stopNote(instrumentId, note) {
    const notes = this.activeNotes.get(instrumentId);
    if (notes) {
      notes.delete(note);
    }
  }

  stopAllNotes() {
    this.activeNotes.clear();
    console.log('🛑 All notes stopped');
  }

  // MIXER STATE EXPORT

  getMixerState() {
    return {
      channels: Array.from(this.channels.entries()).map(([id, ch]) => ({
        id,
        name: ch.name,
        busId: ch.busId,
        color: ch.color,
        gain: ch.gain,
        pan: ch.pan,
        mute: ch.mute,
        solo: ch.solo,
        sends: ch.sends
      })),
      buses: Array.from(this.buses.entries()).map(([id, bus]) => ({
        id,
        name: bus.name,
        color: bus.color,
        gain: bus.gain,
        pan: bus.pan,
        mute: bus.mute,
        solo: bus.solo,
        channels: bus.channels
      })),
      sends: Array.from(this.sends.entries()).map(([id, send]) => ({
        id,
        name: send.name,
        color: send.color,
        gain: send.gain,
        wetDry: send.wetDry
      })),
      master: this.masterChannel
    };
  }

  // PRESET MANAGEMENT

  saveRoutingPreset(name) {
    const preset = {
      name,
      timestamp: Date.now(),
      state: this.getMixerState()
    };
    
    console.log(`💾 Saved routing preset: ${name}`);
    return preset;
  }

  loadRoutingPreset(preset) {
    if (!preset || !preset.state) return false;

    try {
      // Restore channel settings
      preset.state.channels.forEach(ch => {
        this.setChannelGain(ch.id, ch.gain);
        this.setChannelPan(ch.id, ch.pan);
        this.setChannelMute(ch.id, ch.mute);
        this.setChannelSolo(ch.id, ch.solo);
        
        Object.entries(ch.sends).forEach(([sendId, amount]) => {
          this.setChannelSend(ch.id, sendId, amount);
        });
      });

      console.log(`✅ Loaded routing preset: ${preset.name}`);
      return true;
    } catch (error) {
      console.error('Failed to load routing preset:', error);
      return false;
    }
  }
}

// Singleton export
const audioRoutingEngine = new AudioRoutingEngine();
export default audioRoutingEngine;
