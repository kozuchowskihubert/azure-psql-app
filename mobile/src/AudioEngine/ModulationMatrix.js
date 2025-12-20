/**
 * HAOS.fm Modulation Matrix
 * Advanced modulation routing system
 * Route LFOs, Envelopes, and other sources to multiple destinations
 */

class ModulationMatrix {
  constructor() {
    // Modulation sources
    this.sources = {
      lfo1: { name: 'LFO 1', value: 0, enabled: true },
      lfo2: { name: 'LFO 2', value: 0, enabled: true },
      lfo3: { name: 'LFO 3', value: 0, enabled: true },
      lfo4: { name: 'LFO 4', value: 0, enabled: true },
      env1: { name: 'Filter Env', value: 0, enabled: true },
      env2: { name: 'Amp Env', value: 0, enabled: true },
      velocity: { name: 'Velocity', value: 0, enabled: true },
      modwheel: { name: 'Mod Wheel', value: 0, enabled: true },
      aftertouch: { name: 'Aftertouch', value: 0, enabled: true },
      pitchbend: { name: 'Pitch Bend', value: 0, enabled: true },
    };
    
    // Modulation destinations
    this.destinations = {
      osc1Pitch: { name: 'Osc 1 Pitch', value: 0, range: [-24, 24] },
      osc2Pitch: { name: 'Osc 2 Pitch', value: 0, range: [-24, 24] },
      osc1Level: { name: 'Osc 1 Level', value: 0, range: [0, 1] },
      osc2Level: { name: 'Osc 2 Level', value: 0, range: [0, 1] },
      osc1Phase: { name: 'Osc 1 Phase', value: 0, range: [0, 1] },
      osc2Phase: { name: 'Osc 2 Phase', value: 0, range: [0, 1] },
      filterCutoff: { name: 'Filter Cutoff', value: 0, range: [0, 1] },
      filterResonance: { name: 'Filter Resonance', value: 0, range: [0, 1] },
      filterDrive: { name: 'Filter Drive', value: 0, range: [0, 1] },
      ampLevel: { name: 'Amp Level', value: 0, range: [0, 1] },
      pan: { name: 'Pan', value: 0, range: [-1, 1] },
      fxSend1: { name: 'FX Send 1', value: 0, range: [0, 1] },
      fxSend2: { name: 'FX Send 2', value: 0, range: [0, 1] },
      wavetablePos: { name: 'Wavetable Pos', value: 0, range: [0, 1] },
      fmAmount: { name: 'FM Amount', value: 0, range: [0, 1] },
      unisonDetune: { name: 'Unison Detune', value: 0, range: [0, 1] },
    };
    
    // Modulation routings (source -> destination -> amount)
    this.routings = [];
    
    // LFO states
    this.lfos = {
      lfo1: {
        rate: 4,
        waveform: 'sine',
        phase: 0,
        depth: 1,
        sync: false,
        bipolar: true,
        retrigger: false,
      },
      lfo2: {
        rate: 0.5,
        waveform: 'triangle',
        phase: 0,
        depth: 1,
        sync: false,
        bipolar: true,
        retrigger: false,
      },
      lfo3: {
        rate: 8,
        waveform: 'square',
        phase: 0,
        depth: 1,
        sync: false,
        bipolar: true,
        retrigger: false,
      },
      lfo4: {
        rate: 1,
        waveform: 'random',
        phase: 0,
        depth: 1,
        sync: false,
        bipolar: false,
        retrigger: true,
      }
    };
  }
  
  /**
   * Add modulation routing
   */
  addRouting(source, destination, amount = 0.5) {
    // Check if routing already exists
    const existing = this.routings.find(
      r => r.source === source && r.destination === destination
    );
    
    if (existing) {
      existing.amount = amount;
    } else {
      this.routings.push({
        id: Date.now() + Math.random(),
        source,
        destination,
        amount,
        enabled: true,
      });
    }
    
    console.log(`🔀 Routing: ${source} → ${destination} (${amount})`);
  }
  
  /**
   * Remove modulation routing
   */
  removeRouting(routingId) {
    this.routings = this.routings.filter(r => r.id !== routingId);
  }
  
  /**
   * Update routing amount
   */
  updateRouting(routingId, amount) {
    const routing = this.routings.find(r => r.id === routingId);
    if (routing) {
      routing.amount = amount;
    }
  }
  
  /**
   * Enable/disable routing
   */
  toggleRouting(routingId, enabled) {
    const routing = this.routings.find(r => r.id === routingId);
    if (routing) {
      routing.enabled = enabled;
    }
  }
  
  /**
   * Set LFO parameter
   */
  setLFO(lfoName, param, value) {
    if (this.lfos[lfoName]) {
      this.lfos[lfoName][param] = value;
    }
  }
  
  /**
   * Get LFO value at time
   */
  getLFOValue(lfoName, time) {
    const lfo = this.lfos[lfoName];
    if (!lfo) return 0;
    
    const phase = (time * lfo.rate + lfo.phase) % 1;
    let value = 0;
    
    switch (lfo.waveform) {
      case 'sine':
        value = Math.sin(phase * Math.PI * 2);
        break;
      case 'triangle':
        value = phase < 0.5 ? phase * 4 - 1 : 3 - phase * 4;
        break;
      case 'square':
        value = phase < 0.5 ? 1 : -1;
        break;
      case 'sawtooth':
        value = phase * 2 - 1;
        break;
      case 'random':
        value = Math.random() * 2 - 1;
        break;
    }
    
    // Apply depth
    value *= lfo.depth;
    
    // Convert to unipolar if needed
    if (!lfo.bipolar) {
      value = (value + 1) / 2;
    }
    
    return value;
  }
  
  /**
   * Update source value
   */
  updateSource(sourceName, value) {
    if (this.sources[sourceName]) {
      this.sources[sourceName].value = value;
    }
  }
  
  /**
   * Calculate modulated value for destination
   */
  getModulatedValue(destinationName, baseValue, time = 0) {
    if (!this.destinations[destinationName]) return baseValue;
    
    let modulation = 0;
    
    // Sum all active routings for this destination
    this.routings.forEach(routing => {
      if (!routing.enabled || routing.destination !== destinationName) return;
      
      let sourceValue = 0;
      
      // Get source value
      if (routing.source.startsWith('lfo')) {
        sourceValue = this.getLFOValue(routing.source, time);
      } else if (this.sources[routing.source]) {
        sourceValue = this.sources[routing.source].value;
      }
      
      // Apply routing amount
      modulation += sourceValue * routing.amount;
    });
    
    // Apply modulation to base value with destination range
    const dest = this.destinations[destinationName];
    const range = dest.range[1] - dest.range[0];
    const modulatedValue = baseValue + (modulation * range);
    
    // Clamp to range
    return Math.max(dest.range[0], Math.min(dest.range[1], modulatedValue));
  }
  
  /**
   * Get all routings for display
   */
  getRoutings() {
    return this.routings.map(r => ({
      id: r.id,
      source: this.sources[r.source]?.name || r.source,
      destination: this.destinations[r.destination]?.name || r.destination,
      amount: r.amount,
      enabled: r.enabled,
    }));
  }
  
  /**
   * Load preset routings
   */
  loadPreset(preset) {
    this.routings = [];
    
    if (preset.routings) {
      preset.routings.forEach(r => {
        this.addRouting(r.source, r.destination, r.amount);
      });
    }
    
    if (preset.lfos) {
      Object.keys(preset.lfos).forEach(lfoName => {
        Object.assign(this.lfos[lfoName], preset.lfos[lfoName]);
      });
    }
    
    console.log(`🎛️ Modulation preset loaded`);
  }
  
  /**
   * Save current setup as preset
   */
  savePreset() {
    return {
      routings: this.routings.map(r => ({
        source: r.source,
        destination: r.destination,
        amount: r.amount,
      })),
      lfos: JSON.parse(JSON.stringify(this.lfos)),
    };
  }
  
  /**
   * Clear all routings
   */
  clearAll() {
    this.routings = [];
    console.log('🧹 Modulation matrix cleared');
  }
  
  /**
   * Get modulation matrix stats
   */
  getStats() {
    return {
      totalRoutings: this.routings.length,
      activeRoutings: this.routings.filter(r => r.enabled).length,
      sourcesUsed: [...new Set(this.routings.map(r => r.source))].length,
      destinationsUsed: [...new Set(this.routings.map(r => r.destination))].length,
    };
  }
}

export default ModulationMatrix;
