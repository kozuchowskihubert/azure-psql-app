/**
 * HAOS.fm Workspace Presets
 * Preset configurations for different music genres
 */

export const WORKSPACE_PRESETS = {
  techno: {
    name: 'TECHNO',
    bpm: 135,
    drumMachine: '909', // TR-909 for harder techno sound
    bassSwitch: 'tb303',
    synth: 'arp2600',
    pattern: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      bass: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      synth: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    },
    volumes: {
      kick: 1.0,
      snare: 0.8,
      hihat: 0.6,
      clap: 0.7,
      bass: 0.85,
    },
    tb303: {
      cutoff: 60,
      resonance: 70,
      envMod: 65,
      decay: 50,
      accent: 60,
    },
  },
  
  hiphop: {
    name: 'HIP-HOP',
    bpm: 90,
    drumMachine: '808', // TR-808 for classic hip-hop boom-bap
    bassSwitch: 'tb303',
    synth: 'juno106',
    pattern: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      clap: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
      bass: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      synth: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    },
    volumes: {
      kick: 1.0,
      snare: 0.9,
      hihat: 0.5,
      clap: 0.8,
      bass: 0.9,
    },
    tb303: {
      cutoff: 40,
      resonance: 30,
      envMod: 40,
      decay: 60,
      accent: 40,
    },
  },
  
  house: {
    name: 'HOUSE',
    bpm: 125,
    drumMachine: '909',
    bassSwitch: 'td3',
    synth: 'minimoog',
    pattern: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      bass: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      synth: [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    volumes: {
      kick: 1.0,
      snare: 0.75,
      hihat: 0.5,
      clap: 0.75,
      bass: 0.8,
    },
    tb303: {
      cutoff: 55,
      resonance: 50,
      envMod: 50,
      decay: 45,
      accent: 50,
    },
  },
  
  ambient: {
    name: 'AMBIENT',
    bpm: 70,
    drumMachine: '808',
    bassSwitch: 'arp2600',
    pattern: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      hihat: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      bass: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    },
    volumes: {
      kick: 0.6,
      snare: 0.5,
      hihat: 0.3,
      clap: 0.4,
      bass: 0.7,
    },
    tb303: {
      cutoff: 70,
      resonance: 40,
      envMod: 30,
      decay: 70,
      accent: 30,
    },
  },
  
  lofi: {
    name: 'LO-FI',
    bpm: 85,
    drumMachine: '808',
    bassSwitch: 'tb303',
    pattern: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      bass: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    },
    volumes: {
      kick: 0.85,
      snare: 0.7,
      hihat: 0.4,
      clap: 0.5,
      bass: 0.75,
    },
    tb303: {
      cutoff: 50,
      resonance: 35,
      envMod: 45,
      decay: 55,
      accent: 35,
    },
  },
};

/**
 * Load a preset configuration into the workspace
 */
export const loadPreset = (workspace, presetId) => {
  const preset = WORKSPACE_PRESETS[presetId];
  if (!preset || !workspace) {
    console.warn(`Preset ${presetId} not found or workspace not initialized`);
    return false;
  }
  
  try {
    // Set BPM
    if (workspace.setBPM && preset.bpm) {
      workspace.setBPM(preset.bpm);
    }
    
    // Set drum machine
    if (workspace.setDrumMachine && preset.drumMachine) {
      workspace.setDrumMachine(preset.drumMachine);
    }
    
    // Set bass synth
    if (workspace.setBassSwitch && preset.bassSwitch) {
      workspace.setBassSwitch(preset.bassSwitch);
    }
    
    // Set synth
    if (workspace.setSynth && preset.synth) {
      workspace.setSynth(preset.synth);
    }
    
    // Load pattern
    if (workspace.loadPattern && preset.pattern) {
      workspace.loadPattern(preset.pattern);
    }
    
    // Set volumes
    if (workspace.setVolumes && preset.volumes) {
      workspace.setVolumes(preset.volumes);
    }
    
    // Apply TB-303 settings if available
    if (workspace.tb303 && preset.tb303) {
      const { cutoff, resonance, envMod, decay, accent } = preset.tb303;
      if (workspace.tb303.setCutoff) workspace.tb303.setCutoff(cutoff);
      if (workspace.tb303.setResonance) workspace.tb303.setResonance(resonance);
      if (workspace.tb303.setEnvMod) workspace.tb303.setEnvMod(envMod);
      if (workspace.tb303.setDecay) workspace.tb303.setDecay(decay);
      if (workspace.tb303.setAccent) workspace.tb303.setAccent(accent);
    }
    
    console.log(`✅ Loaded ${preset.name} preset (${preset.bpm} BPM)`);
    return true;
    
  } catch (error) {
    console.error(`Failed to load preset ${presetId}:`, error);
    return false;
  }
};

/**
 * Get preset info without loading
 */
export const getPresetInfo = (presetId) => {
  const preset = WORKSPACE_PRESETS[presetId];
  if (!preset) return null;
  
  return {
    name: preset.name,
    bpm: preset.bpm,
    drumMachine: preset.drumMachine,
    bassSwitch: preset.bassSwitch,
  };
};
