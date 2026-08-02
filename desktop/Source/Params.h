#pragma once

#include <JuceHeader.h>

namespace haos::pid
{
    // Oscillators — ARP 2600 style: three independent VCOs
    inline constexpr const char* osc1Shape  = "osc1Shape";
    inline constexpr const char* osc1Octave = "osc1Octave";
    inline constexpr const char* osc1Detune = "osc1Detune";
    inline constexpr const char* osc1Level  = "osc1Level";

    inline constexpr const char* osc2Shape  = "osc2Shape";
    inline constexpr const char* osc2Octave = "osc2Octave";
    inline constexpr const char* osc2Detune = "osc2Detune";
    inline constexpr const char* osc2Level  = "osc2Level";

    inline constexpr const char* osc3Shape  = "osc3Shape";
    inline constexpr const char* osc3Octave = "osc3Octave";
    inline constexpr const char* osc3Detune = "osc3Detune";
    inline constexpr const char* osc3Level  = "osc3Level";

    inline constexpr const char* pulseWidth = "pulseWidth";
    inline constexpr const char* ringMod    = "ringMod";
    inline constexpr const char* subLevel   = "subLevel";
    inline constexpr const char* noiseLevel = "noiseLevel";

    // Modulation matrix
    inline constexpr const char* lfoShape   = "lfoShape";
    inline constexpr const char* shRate     = "shRate";
    inline constexpr const char* modEnvFilter  = "modEnvFilter";
    inline constexpr const char* modEnvPitch   = "modEnvPitch";
    inline constexpr const char* modLfoFilter  = "modLfoFilter";
    inline constexpr const char* modLfoPitch   = "modLfoPitch";
    inline constexpr const char* modLfoAmp     = "modLfoAmp";
    inline constexpr const char* modLfoPwm     = "modLfoPwm";
    inline constexpr const char* modKeyTrack   = "modKeyTrack";
    inline constexpr const char* modVelFilter  = "modVelFilter";
    inline constexpr const char* modShFilter   = "modShFilter";
    inline constexpr const char* modShPitch    = "modShPitch";

    // Filter
    inline constexpr const char* cutoff     = "cutoff";
    inline constexpr const char* resonance  = "resonance";
    inline constexpr const char* envMod     = "envMod";
    inline constexpr const char* drive      = "drive";

    // Modulation
    inline constexpr const char* glide      = "glide";
    inline constexpr const char* lfoRate    = "lfoRate";
    inline constexpr const char* lfoDepth   = "lfoDepth";

    // Amp envelope
    inline constexpr const char* ampA       = "ampAttack";
    inline constexpr const char* ampD       = "ampDecay";
    inline constexpr const char* ampS       = "ampSustain";
    inline constexpr const char* ampR       = "ampRelease";

    // Filter envelope
    inline constexpr const char* fltA       = "fltAttack";
    inline constexpr const char* fltD       = "fltDecay";
    inline constexpr const char* fltS       = "fltSustain";
    inline constexpr const char* fltR       = "fltRelease";

    // Output
    inline constexpr const char* gain       = "gain";

    // Instrument selection: 0 = Analog (TB-303 style), 1 = TR-909, 2 = TR-808
    inline constexpr const char* instrument = "instrument";
    inline constexpr const char* bpm        = "bpm";

    // Drum machine
    inline constexpr const char* kickPitch   = "kickPitch";
    inline constexpr const char* kickDecay   = "kickDecay";
    inline constexpr const char* kickTone    = "kickTone";
    inline constexpr const char* snareTune   = "snareTune";
    inline constexpr const char* snareSnappy = "snareSnappy";
    inline constexpr const char* snareDecay  = "snareDecay";
    inline constexpr const char* hatTune     = "hatTune";
    inline constexpr const char* hatDecay    = "hatDecay";
    inline constexpr const char* clapTone    = "clapTone";
    inline constexpr const char* clapDecay   = "clapDecay";

    // Master effects
    inline constexpr const char* fxDrive     = "fxDrive";
    inline constexpr const char* fxChorus    = "fxChorus";
    inline constexpr const char* fxDelayMix  = "fxDelayMix";
    inline constexpr const char* fxDelayTime = "fxDelayTime";
    inline constexpr const char* fxDelayFb   = "fxDelayFb";
    inline constexpr const char* fxReverbMix = "fxReverbMix";
    inline constexpr const char* fxReverbSize= "fxReverbSize";
}
