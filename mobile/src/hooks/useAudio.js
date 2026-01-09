/**
 * HAOS.fm Audio Hooks
 * Custom React hooks for integrating instruments with audio engine
 */

import { useEffect, useRef } from 'react';
import advancedAudioEngine from '../audio/AdvancedAudioEngine';

/**
 * Initialize audio engine on app mount
 */
export const useAudioEngine = () => {
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (mounted) {
        await advancedAudioEngine.init();
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  return advancedAudioEngine;
};

/**
 * DX7 FM Synthesizer Hook
 */
export const useDX7 = (params) => {
  const { operators, algorithm, lfo } = params;
  
  const playNote = (note, velocity = 100) => {
    advancedAudioEngine.playDX7Note(note, velocity, {
      operators,
      algorithm,
      lfo
    });
  };
  
  const stopNote = (note) => {
    // Stop specific note
    console.log(`Stopping DX7 note: ${note}`);
  };
  
  return { playNote, stopNote };
};

/**
 * MS-20 Semi-Modular Synth Hook
 */
export const useMS20 = (params) => {
  const { vco1, vco2, hpf, lpf, envelope } = params;
  
  const playNote = (note, velocity = 100) => {
    advancedAudioEngine.playMS20Note(note, velocity, {
      vco1,
      vco2,
      hpf,
      lpf,
      envelope
    });
  };
  
  return { playNote };
};

/**
 * Prophet-5 Polyphonic Synth Hook
 */
export const useProphet5 = (params) => {
  const { vcoA, vcoB, filter, ampEnv, filterEnv, polyMod, unison } = params;
  
  const playNote = (note, velocity = 100) => {
    advancedAudioEngine.playProphet5Note(note, velocity, {
      vcoA,
      vcoB,
      filter,
      ampEnv,
      filterEnv,
      polyMod,
      unison
    });
  };
  
  return { playNote };
};

/**
 * TB-303 Bass Line Hook
 */
export const useTB303 = (params) => {
  const { filter, waveform, tuning } = params;
  const sequencerRef = useRef(null);
  
  const playNote = (note, accent = false, slide = false) => {
    advancedAudioEngine.playTB303Note(note, accent, slide, {
      filter,
      waveform,
      tuning
    });
  };
  
  const startSequencer = (pattern, tempo) => {
    // Start 303 sequencer
    console.log(`Starting TB-303 sequencer at ${tempo} BPM`);
    
    const stepTime = (60 / tempo) * 250; // 16th notes
    let step = 0;
    
    if (sequencerRef.current) {
      clearInterval(sequencerRef.current);
    }
    
    sequencerRef.current = setInterval(() => {
      const noteData = pattern[step];
      if (noteData && noteData.active) {
        playNote(noteData.note, noteData.accent, noteData.slide);
      }
      step = (step + 1) % pattern.length;
    }, stepTime);
  };
  
  const stopSequencer = () => {
    if (sequencerRef.current) {
      clearInterval(sequencerRef.current);
      sequencerRef.current = null;
    }
  };
  
  useEffect(() => {
    return () => {
      stopSequencer();
    };
  }, []);
  
  return { playNote, startSequencer, stopSequencer };
};

/**
 * LinnDrum Sample Engine Hook
 */
export const useLinnDrum = () => {
  const sequencerRef = useRef(null);
  
  const playSound = (soundId, volume = 100, tuning = 0) => {
    advancedAudioEngine.playLinnDrumSound(soundId, {
      volume,
      tuning
    });
  };
  
  const startSequencer = (pattern, tempo, swing = 0) => {
    console.log(`Starting LinnDrum at ${tempo} BPM, swing=${swing}%`);
    
    const stepTime = (60 / tempo) * 250;
    let step = 0;
    
    if (sequencerRef.current) {
      clearInterval(sequencerRef.current);
    }
    
    sequencerRef.current = setInterval(() => {
      // Play all active sounds at this step
      Object.keys(pattern).forEach(soundId => {
        if (pattern[soundId][step]) {
          playSound(soundId);
        }
      });
      step = (step + 1) % 16;
    }, stepTime);
  };
  
  const stopSequencer = () => {
    if (sequencerRef.current) {
      clearInterval(sequencerRef.current);
    }
  };
  
  useEffect(() => {
    return () => stopSequencer();
  }, []);
  
  return { playSound, startSequencer, stopSequencer };
};

/**
 * CR-78 Rhythm Machine Hook
 */
export const useCR78 = () => {
  const playPattern = (patternId, instruments, tempo) => {
    advancedAudioEngine.playCR78Pattern(patternId, instruments, { tempo });
  };
  
  return { playPattern };
};

/**
 * DMX Drum Machine Hook
 */
export const useDMX = () => {
  const sequencerRef = useRef(null);
  
  const playSound = (soundId, volume = 100, tune = 0) => {
    advancedAudioEngine.playDMXSound(soundId, {
      volume,
      tune
    });
  };
  
  const startSequencer = (pattern, tempo, swing = 50) => {
    console.log(`Starting DMX at ${tempo} BPM, swing=${swing}%`);
    
    const stepTime = (60 / tempo) * 250;
    let step = 0;
    
    if (sequencerRef.current) {
      clearInterval(sequencerRef.current);
    }
    
    sequencerRef.current = setInterval(() => {
      Object.keys(pattern).forEach(soundId => {
        if (pattern[soundId][step]) {
          playSound(soundId);
        }
      });
      step = (step + 1) % 16;
    }, stepTime);
  };
  
  const stopSequencer = () => {
    if (sequencerRef.current) {
      clearInterval(sequencerRef.current);
    }
  };
  
  useEffect(() => {
    return () => stopSequencer();
  }, []);
  
  return { playSound, startSequencer, stopSequencer };
};

/**
 * Piano Hook
 */
export const usePiano = (params) => {
  const { pianoType, volume, reverb, brightness, sustain, velocity, attack, release, detune } = params;
  
  const playNote = (note, octave, noteVelocity = null) => {
    // Use provided velocity or fall back to params velocity
    const finalVelocity = noteVelocity !== null ? noteVelocity : velocity;
    
    advancedAudioEngine.playPianoNote(note, octave, finalVelocity, {
      pianoType,
      reverb,
      brightness,
      sustain,
      attack,
      release,
      detune
    });
  };
  
  return { playNote };
};

/**
 * Violin Hook
 */
export const useViolin = (params) => {
  const { articulation, vibratoRate, vibratoDepth, bowPressure, expression, ensembleMode, ensembleSize } = params;
  
  const playNote = (note) => {
    advancedAudioEngine.playViolinNote(note, articulation, {
      vibratoRate,
      vibratoDepth,
      bowPressure,
      expression,
      ensembleMode,
      ensembleSize
    });
  };
  
  return { playNote };
};

/**
 * Vocals Hook
 */
export const useVocals = (params) => {
  const { autotuneOn, key, scale, retuneSpeed, humanize, formantShift } = params;
  
  const processPitch = (pitch) => {
    advancedAudioEngine.processVocals(pitch, {
      autotuneOn,
      key,
      scale,
      retuneSpeed,
      humanize,
      formantShift
    });
  };
  
  return { processPitch };
};

/**
 * Master Volume Hook
 */
export const useMasterVolume = () => {
  const setVolume = (volume) => {
    advancedAudioEngine.setMasterVolume(volume);
  };
  
  return { setVolume };
};

/**
 * Stop All Sounds Hook
 */
export const useStopAll = () => {
  const stopAll = async () => {
    await advancedAudioEngine.stopAll();
  };
  
  return { stopAll };
};
