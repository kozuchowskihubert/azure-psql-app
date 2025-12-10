"""
Deep Techno Preset Collection
Curated presets for Behringer 2600 focused on deep techno production
"""

from .library import (
    Preset, PresetCategory, PresetLibrary, PresetVariation,
    PatchPoint, PatchCable, ModulatorSettings, SynthModule
)


def create_deep_techno_presets() -> PresetLibrary:
    """Create a library of deep techno presets"""
    library = PresetLibrary()
    
    # ========== BASS PRESETS ==========
    
    # 1. Sub Bass - Deep, warm sub bass
    sub_bass = Preset(
        name="Sub Bass - Deep 808",
        category=PresetCategory.BASS,
        description="Deep sub bass with long decay, perfect for techno kicks",
        tags={"bass", "sub", "kick", "808", "deep"},
        author="Behringer 2600 Deep Techno Collection",
        bpm=128,
        notes="Use with long envelope decay (>1s) for proper sub kick"
    )
    
    # Patching
    sub_bass.add_cable(
        PatchPoint("VCO1", "SINE", 1.0),
        PatchPoint("VCF", "AUDIO_IN", 1.0),
        color="red",
        notes="Pure sine for clean sub"
    )
    sub_bass.add_cable(
        PatchPoint("VCF", "LP", 1.0),
        PatchPoint("VCA", "AUDIO_IN", 1.0),
        color="red"
    )
    sub_bass.add_cable(
        PatchPoint("ENV1", "OUT", 1.0),
        PatchPoint("VCA", "CV", 1.0),
        color="blue",
        notes="Amplitude envelope"
    )
    sub_bass.add_cable(
        PatchPoint("ENV2", "OUT", 0.6),
        PatchPoint("VCF", "CUTOFF_CV", 0.6),
        color="green",
        notes="Filter envelope for punch"
    )
    
    # Module settings
    sub_bass.add_module("VCO1", {
        "frequency": 55.0,  # A1 - deep sub
        "waveform": "sine",
        "fine_tune": 0.0
    })
    sub_bass.add_module("VCF", {
        "cutoff": 0.3,
        "resonance": 0.1,
        "mode": "LP"
    })
    
    # Modulator settings
    sub_bass.add_modulator("ENV1", ModulatorSettings(
        module_type="ENV",
        attack=0.001,
        decay=0.8,
        sustain=0.0,
        release=0.1
    ))
    sub_bass.add_modulator("ENV2", ModulatorSettings(
        module_type="ENV",
        attack=0.001,
        decay=0.2,
        sustain=0.0,
        release=0.05
    ))
    
    # Add variations for Sub Bass
    # Variation 1: Punchy - Shorter decay for punchier kick
    punchy_var = PresetVariation(
        name="Punchy",
        description="Shorter envelope for punchy kick-style sub bass",
        notes="Great for tight, punchy kick drums"
    )
    punchy_var.patch_cables = [
        PatchCable(PatchPoint("VCO1", "SINE", 1.0), PatchPoint("VCF", "AUDIO_IN", 1.0), "red"),
        PatchCable(PatchPoint("VCF", "LP", 1.0), PatchPoint("VCA", "AUDIO_IN", 1.0), "red"),
        PatchCable(PatchPoint("ENV1", "OUT", 1.0), PatchPoint("VCA", "CV", 1.0), "blue"),
        PatchCable(PatchPoint("ENV2", "OUT", 0.8), PatchPoint("VCF", "CUTOFF_CV", 0.8), "green"),
    ]
    punchy_var.modules = {
        "VCO1": SynthModule("VCO1", {"frequency": 55.0, "waveform": "sine", "fine_tune": 0.0}),
        "VCF": SynthModule("VCF", {"cutoff": 0.25, "resonance": 0.15, "mode": "LP"}),
    }
    punchy_var.modulators = {
        "ENV1": ModulatorSettings("ENV", attack=0.001, decay=0.4, sustain=0.0, release=0.05),  # Shorter decay
        "ENV2": ModulatorSettings("ENV", attack=0.001, decay=0.1, sustain=0.0, release=0.03),  # Quick filter snap
    }
    sub_bass.add_variation(punchy_var)
    
    # Variation 2: Deep - Maximum decay for deep sub rumble
    deep_var = PresetVariation(
        name="Deep",
        description="Extended decay for deep, rumbling sub bass",
        notes="Perfect for long sub bass tails and rumbles"
    )
    deep_var.patch_cables = [
        PatchCable(PatchPoint("VCO1", "SINE", 1.0), PatchPoint("VCF", "AUDIO_IN", 1.0), "red"),
        PatchCable(PatchPoint("VCF", "LP", 1.0), PatchPoint("VCA", "AUDIO_IN", 1.0), "red"),
        PatchCable(PatchPoint("ENV1", "OUT", 1.0), PatchPoint("VCA", "CV", 1.0), "blue"),
        PatchCable(PatchPoint("ENV2", "OUT", 0.5), PatchPoint("VCF", "CUTOFF_CV", 0.5), "green"),
    ]
    deep_var.modules = {
        "VCO1": SynthModule("VCO1", {"frequency": 50.0, "waveform": "sine", "fine_tune": 0.0}),  # Even lower
        "VCF": SynthModule("VCF", {"cutoff": 0.35, "resonance": 0.08, "mode": "LP"}),
    }
    deep_var.modulators = {
        "ENV1": ModulatorSettings("ENV", attack=0.001, decay=1.5, sustain=0.0, release=0.2),  # Very long decay
        "ENV2": ModulatorSettings("ENV", attack=0.001, decay=0.3, sustain=0.0, release=0.1),
    }
    sub_bass.add_variation(deep_var)
    
    library.add_preset(sub_bass, overwrite=True)
    
    # 2. Acid Bass - Classic squelchy acid bass
    acid_bass = Preset(
        name="Acid Bass - 303 Style",
        category=PresetCategory.BASS,
        description="Classic acid bass with resonant filter sweep",
        tags={"bass", "acid", "303", "squelch", "resonant"},
        author="Behringer 2600 Deep Techno Collection",
        bpm=128
    )
    
    acid_bass.add_cable(
        PatchPoint("VCO1", "SAW", 1.0),
        PatchPoint("VCF", "AUDIO_IN", 1.0),
        color="red"
    )
    acid_bass.add_cable(
        PatchPoint("VCF", "LP", 1.0),
        PatchPoint("VCA", "AUDIO_IN", 1.0),
        color="red"
    )
    acid_bass.add_cable(
        PatchPoint("ENV1", "OUT", 1.0),
        PatchPoint("VCA", "CV", 1.0),
        color="blue"
    )
    acid_bass.add_cable(
        PatchPoint("ENV2", "OUT", 0.9),
        PatchPoint("VCF", "CUTOFF_CV", 0.9),
        color="green",
        notes="High envelope amount for squelch"
    )
    
    acid_bass.add_module("VCO1", {
        "frequency": 110.0,  # A2
        "waveform": "sawtooth",
        "fine_tune": -5.0
    })
    acid_bass.add_module("VCF", {
        "cutoff": 0.2,
        "resonance": 0.7,  # High resonance for acid sound
        "mode": "LP"
    })
    
    acid_bass.add_modulator("ENV1", ModulatorSettings(
        module_type="ENV",
        attack=0.001,
        decay=0.15,
        sustain=0.6,
        release=0.1
    ))
    acid_bass.add_modulator("ENV2", ModulatorSettings(
        module_type="ENV",
        attack=0.001,
        decay=0.25,
        sustain=0.3,
        release=0.1
    ))
    
    # Add variations for Acid Bass
    # Variation 1: Aggressive - Shorter decay, higher resonance
    aggressive_var = PresetVariation(
        name="Aggressive",
        description="Shorter envelope decay with extreme resonance for aggressive acid stabs",
        notes="Perfect for quick acid stabs and aggressive sequences"
    )
    aggressive_var.patch_cables = [
        PatchCable(PatchPoint("VCO1", "SAW", 1.0), PatchPoint("VCF", "AUDIO_IN", 1.0), "red"),
        PatchCable(PatchPoint("VCF", "LP", 1.0), PatchPoint("VCA", "AUDIO_IN", 1.0), "red"),
        PatchCable(PatchPoint("ENV1", "OUT", 1.0), PatchPoint("VCA", "CV", 1.0), "blue"),
        PatchCable(PatchPoint("ENV2", "OUT", 1.0), PatchPoint("VCF", "CUTOFF_CV", 1.0), "green", notes="Maximum envelope modulation"),
    ]
    aggressive_var.modules = {
        "VCO1": SynthModule("VCO1", {"frequency": 110.0, "waveform": "sawtooth", "fine_tune": -5.0}),
        "VCF": SynthModule("VCF", {"cutoff": 0.15, "resonance": 0.85, "mode": "LP"}),  # Higher resonance, lower cutoff
    }
    aggressive_var.modulators = {
        "ENV1": ModulatorSettings("ENV", attack=0.001, decay=0.08, sustain=0.0, release=0.05),  # Shorter decay
        "ENV2": ModulatorSettings("ENV", attack=0.001, decay=0.15, sustain=0.0, release=0.05),  # Snappy filter
    }
    acid_bass.add_variation(aggressive_var)
    
    # Variation 2: Modulated - Add LFO for filter wobble
    modulated_var = PresetVariation(
        name="Modulated",
        description="LFO modulation on filter cutoff for wobbling acid effect",
        notes="Slow LFO creates a wobbling, evolving acid sound"
    )
    modulated_var.patch_cables = [
        PatchCable(PatchPoint("VCO1", "SAW", 1.0), PatchPoint("VCF", "AUDIO_IN", 1.0), "red"),
        PatchCable(PatchPoint("VCF", "LP", 1.0), PatchPoint("VCA", "AUDIO_IN", 1.0), "red"),
        PatchCable(PatchPoint("ENV1", "OUT", 1.0), PatchPoint("VCA", "CV", 1.0), "blue"),
        PatchCable(PatchPoint("ENV2", "OUT", 0.7), PatchPoint("VCF", "CUTOFF_CV", 0.7), "green"),
        PatchCable(PatchPoint("LFO1", "OUT", 0.4), PatchPoint("VCF", "CUTOFF_CV", 0.4), "yellow", notes="LFO wobble"),
    ]
    modulated_var.modules = {
        "VCO1": SynthModule("VCO1", {"frequency": 110.0, "waveform": "sawtooth", "fine_tune": -5.0}),
        "VCF": SynthModule("VCF", {"cutoff": 0.25, "resonance": 0.65, "mode": "LP"}),
    }
    modulated_var.modulators = {
        "ENV1": ModulatorSettings("ENV", attack=0.001, decay=0.2, sustain=0.5, release=0.15),
        "ENV2": ModulatorSettings("ENV", attack=0.001, decay=0.3, sustain=0.2, release=0.1),
        "LFO1": ModulatorSettings("LFO", rate=0.25, waveform="triangle", depth=0.4),  # Slow wobble
    }
    acid_bass.add_variation(modulated_var)
    
    # Variation 3: Classic - Minimal patching, cleaner sound
    classic_var = PresetVariation(
        name="Classic",
        description="Minimal patching for classic 303-style acid with medium resonance",
        notes="Clean, traditional acid bass sound without extreme settings"
    )
    classic_var.patch_cables = [
        PatchCable(PatchPoint("VCO1", "SAW", 1.0), PatchPoint("VCF", "AUDIO_IN", 1.0), "red"),
        PatchCable(PatchPoint("VCF", "LP", 1.0), PatchPoint("VCA", "AUDIO_IN", 1.0), "red"),
        PatchCable(PatchPoint("ENV1", "OUT", 1.0), PatchPoint("VCA", "CV", 1.0), "blue"),
        PatchCable(PatchPoint("ENV2", "OUT", 0.8), PatchPoint("VCF", "CUTOFF_CV", 0.8), "green"),
    ]
    classic_var.modules = {
        "VCO1": SynthModule("VCO1", {"frequency": 110.0, "waveform": "sawtooth", "fine_tune": 0.0}),
        "VCF": SynthModule("VCF", {"cutoff": 0.3, "resonance": 0.6, "mode": "LP"}),  # Medium resonance
    }
    classic_var.modulators = {
        "ENV1": ModulatorSettings("ENV", attack=0.001, decay=0.12, sustain=0.4, release=0.08),
        "ENV2": ModulatorSettings("ENV", attack=0.001, decay=0.2, sustain=0.25, release=0.1),
    }
    acid_bass.add_variation(classic_var)
    
    library.add_preset(acid_bass, overwrite=True)
    
    # 3. Reese Bass - Detuned oscillators for thick bass
    reese_bass = Preset(
        name="Reese Bass - Thick & Wide",
        category=PresetCategory.BASS,
        description="Thick Reese bass with detuned oscillators",
        tags={"bass", "reese", "thick", "wide", "detuned"},
        author="Behringer 2600 Deep Techno Collection",
        bpm=128
    )
    
    reese_bass.add_cable(
        PatchPoint("VCO1", "SAW", 1.0),
        PatchPoint("MIXER", "IN1", 1.0),
        color="red"
    )
    reese_bass.add_cable(
        PatchPoint("VCO2", "SAW", 1.0),
        PatchPoint("MIXER", "IN2", 1.0),
        color="red",
        notes="Slightly detuned for width"
    )
    reese_bass.add_cable(
        PatchPoint("MIXER", "OUT", 1.0),
        PatchPoint("VCF", "AUDIO_IN", 1.0),
        color="red"
    )
    reese_bass.add_cable(
        PatchPoint("VCF", "LP", 1.0),
        PatchPoint("VCA", "AUDIO_IN", 1.0),
        color="red"
    )
    reese_bass.add_cable(
        PatchPoint("ENV1", "OUT", 1.0),
        PatchPoint("VCA", "CV", 1.0),
        color="blue"
    )
    reese_bass.add_cable(
        PatchPoint("ENV2", "OUT", 0.5),
        PatchPoint("VCF", "CUTOFF_CV", 0.5),
        color="green"
    )
    
    reese_bass.add_module("VCO1", {
        "frequency": 82.41,  # E2
        "waveform": "sawtooth",
        "fine_tune": 0.0
    })
    reese_bass.add_module("VCO2", {
        "frequency": 82.41,  # E2
        "waveform": "sawtooth",
        "fine_tune": 12.0  # Detune for phasing effect
    })
    reese_bass.add_module("VCF", {
        "cutoff": 0.35,
        "resonance": 0.4,
        "mode": "LP"
    })
    
    reese_bass.add_modulator("ENV1", ModulatorSettings(
        module_type="ENV",
        attack=0.01,
        decay=0.4,
        sustain=0.7,
        release=0.2
    ))
    reese_bass.add_modulator("ENV2", ModulatorSettings(
        module_type="ENV",
        attack=0.05,
        decay=0.3,
        sustain=0.3,
        release=0.15
    ))
    
    library.add_preset(reese_bass, overwrite=True)
    
    # ========== LEAD PRESETS ==========
    
    # 4. Arpeggio Lead - Bright, cutting lead
    arp_lead = Preset(
        name="Arpeggio Lead - Bright",
        category=PresetCategory.LEAD,
        description="Bright lead sound perfect for arpeggios",
        tags={"lead", "arp", "bright", "cutting"},
        author="Behringer 2600 Deep Techno Collection",
        bpm=128
    )
    
    arp_lead.add_cable(
        PatchPoint("VCO1", "SAW", 1.0),
        PatchPoint("MIXER", "IN1", 1.0),
        color="red"
    )
    arp_lead.add_cable(
        PatchPoint("VCO2", "SQUARE", 0.7),
        PatchPoint("MIXER", "IN2", 0.7),
        color="red",
        notes="Square wave for brightness"
    )
    arp_lead.add_cable(
        PatchPoint("MIXER", "OUT", 1.0),
        PatchPoint("VCF", "AUDIO_IN", 1.0),
        color="red"
    )
    arp_lead.add_cable(
        PatchPoint("VCF", "LP", 1.0),
        PatchPoint("VCA", "AUDIO_IN", 1.0),
        color="red"
    )
    arp_lead.add_cable(
        PatchPoint("ENV1", "OUT", 1.0),
        PatchPoint("VCA", "CV", 1.0),
        color="blue"
    )
    arp_lead.add_cable(
        PatchPoint("ENV2", "OUT", 0.8),
        PatchPoint("VCF", "CUTOFF_CV", 0.8),
        color="green"
    )
    arp_lead.add_cable(
        PatchPoint("LFO", "TRIANGLE", 0.2),
        PatchPoint("VCO1", "FM", 0.2),
        color="yellow",
        notes="Subtle vibrato"
    )
    
    arp_lead.add_module("VCO1", {
        "frequency": 440.0,  # A4
        "waveform": "sawtooth",
        "fine_tune": 0.0
    })
    arp_lead.add_module("VCO2", {
        "frequency": 440.0,
        "waveform": "square",
        "fine_tune": 3.0
    })
    arp_lead.add_module("VCF", {
        "cutoff": 0.6,
        "resonance": 0.3,
        "mode": "LP"
    })
    
    arp_lead.add_modulator("ENV1", ModulatorSettings(
        module_type="ENV",
        attack=0.01,
        decay=0.2,
        sustain=0.5,
        release=0.15
    ))
    arp_lead.add_modulator("ENV2", ModulatorSettings(
        module_type="ENV",
        attack=0.01,
        decay=0.3,
        sustain=0.4,
        release=0.2
    ))
    arp_lead.add_modulator("LFO", ModulatorSettings(
        module_type="LFO",
        rate=0.3,
        depth=0.2,
        waveform="triangle"
    ))
    
    library.add_preset(arp_lead, overwrite=True)
    
    # ========== PAD PRESETS ==========
    
    # 5. Dark Pad - Atmospheric pad
    dark_pad = Preset(
        name="Dark Pad - Atmospheric",
        category=PresetCategory.PAD,
        description="Dark, evolving pad with slow filter movement",
        tags={"pad", "dark", "atmospheric", "evolving", "ambient"},
        author="Behringer 2600 Deep Techno Collection",
        bpm=120
    )
    
    dark_pad.add_cable(
        PatchPoint("VCO1", "SAW", 1.0),
        PatchPoint("MIXER", "IN1", 1.0),
        color="red"
    )
    dark_pad.add_cable(
        PatchPoint("VCO2", "SQUARE", 0.8),
        PatchPoint("MIXER", "IN2", 0.8),
        color="red"
    )
    dark_pad.add_cable(
        PatchPoint("VCO3", "SINE", 0.6),
        PatchPoint("MIXER", "IN3", 0.6),
        color="red",
        notes="Sub octave for depth"
    )
    dark_pad.add_cable(
        PatchPoint("MIXER", "OUT", 1.0),
        PatchPoint("VCF", "AUDIO_IN", 1.0),
        color="red"
    )
    dark_pad.add_cable(
        PatchPoint("VCF", "LP", 1.0),
        PatchPoint("REVERB", "IN", 1.0),
        color="red"
    )
    dark_pad.add_cable(
        PatchPoint("REVERB", "OUT", 1.0),
        PatchPoint("VCA", "AUDIO_IN", 1.0),
        color="red"
    )
    dark_pad.add_cable(
        PatchPoint("ENV1", "OUT", 1.0),
        PatchPoint("VCA", "CV", 1.0),
        color="blue"
    )
    dark_pad.add_cable(
        PatchPoint("LFO", "SINE", 0.4),
        PatchPoint("VCF", "CUTOFF_CV", 0.4),
        color="yellow",
        notes="Slow filter movement"
    )
    
    dark_pad.add_module("VCO1", {
        "frequency": 220.0,  # A3
        "waveform": "sawtooth",
        "fine_tune": 0.0
    })
    dark_pad.add_module("VCO2", {
        "frequency": 220.0,
        "waveform": "square",
        "fine_tune": -7.0
    })
    dark_pad.add_module("VCO3", {
        "frequency": 110.0,  # A2 (one octave below)
        "waveform": "sine",
        "fine_tune": 0.0
    })
    dark_pad.add_module("VCF", {
        "cutoff": 0.25,
        "resonance": 0.2,
        "mode": "LP"
    })
    
    dark_pad.add_modulator("ENV1", ModulatorSettings(
        module_type="ENV",
        attack=0.8,
        decay=0.3,
        sustain=0.9,
        release=1.2
    ))
    dark_pad.add_modulator("LFO", ModulatorSettings(
        module_type="LFO",
        rate=0.15,
        depth=0.4,
        waveform="sine"
    ))
    
    library.add_preset(dark_pad, overwrite=True)
    
    # ========== PERCUSSION PRESETS ==========
    
    # 6. Hi-Hat - Metallic percussion
    hihat = Preset(
        name="Hi-Hat - Metallic",
        category=PresetCategory.PERCUSSION,
        description="Metallic hi-hat sound using noise and ring mod",
        tags={"percussion", "hihat", "metallic", "drums"},
        author="Behringer 2600 Deep Techno Collection",
        bpm=128
    )
    
    hihat.add_cable(
        PatchPoint("NOISE", "WHITE", 1.0),
        PatchPoint("VCF", "AUDIO_IN", 1.0),
        color="red"
    )
    hihat.add_cable(
        PatchPoint("VCF", "BP", 1.0),
        PatchPoint("VCA", "AUDIO_IN", 1.0),
        color="red",
        notes="Band-pass for metallic tone"
    )
    hihat.add_cable(
        PatchPoint("ENV1", "OUT", 1.0),
        PatchPoint("VCA", "CV", 1.0),
        color="blue"
    )
    
    hihat.add_module("VCF", {
        "cutoff": 0.8,
        "resonance": 0.5,
        "mode": "BP"
    })
    
    hihat.add_modulator("ENV1", ModulatorSettings(
        module_type="ENV",
        attack=0.001,
        decay=0.05,
        sustain=0.0,
        release=0.02
    ))
    
    library.add_preset(hihat, overwrite=True)
    
    # 7. Snare - Punchy snare
    snare = Preset(
        name="Snare - Punchy",
        category=PresetCategory.PERCUSSION,
        description="Punchy snare with noise and tuned oscillator",
        tags={"percussion", "snare", "punchy", "drums"},
        author="Behringer 2600 Deep Techno Collection",
        bpm=128
    )
    
    snare.add_cable(
        PatchPoint("VCO1", "TRIANGLE", 0.6),
        PatchPoint("MIXER", "IN1", 0.6),
        color="red",
        notes="Tuned component"
    )
    snare.add_cable(
        PatchPoint("NOISE", "WHITE", 0.8),
        PatchPoint("MIXER", "IN2", 0.8),
        color="red",
        notes="Noise component"
    )
    snare.add_cable(
        PatchPoint("MIXER", "OUT", 1.0),
        PatchPoint("VCF", "AUDIO_IN", 1.0),
        color="red"
    )
    snare.add_cable(
        PatchPoint("VCF", "HP", 1.0),
        PatchPoint("VCA", "AUDIO_IN", 1.0),
        color="red"
    )
    snare.add_cable(
        PatchPoint("ENV1", "OUT", 1.0),
        PatchPoint("VCA", "CV", 1.0),
        color="blue"
    )
    snare.add_cable(
        PatchPoint("ENV2", "OUT", 0.7),
        PatchPoint("VCO1", "FM", 0.7),
        color="green",
        notes="Pitch envelope for snap"
    )
    
    snare.add_module("VCO1", {
        "frequency": 180.0,
        "waveform": "triangle",
        "fine_tune": 0.0
    })
    snare.add_module("VCF", {
        "cutoff": 0.6,
        "resonance": 0.2,
        "mode": "HP"
    })
    
    snare.add_modulator("ENV1", ModulatorSettings(
        module_type="ENV",
        attack=0.001,
        decay=0.12,
        sustain=0.0,
        release=0.05
    ))
    snare.add_modulator("ENV2", ModulatorSettings(
        module_type="ENV",
        attack=0.001,
        decay=0.05,
        sustain=0.0,
        release=0.02
    ))
    
    library.add_preset(snare, overwrite=True)
    
    # ========== EFFECTS PRESETS ==========
    
    # 8. Phaser Effect - Swirling phaser
    phaser = Preset(
        name="Phaser - Swirling",
        category=PresetCategory.EFFECTS,
        description="Phaser effect using LFO-modulated filter",
        tags={"effects", "phaser", "modulation", "sweeping"},
        author="Behringer 2600 Deep Techno Collection"
    )
    
    phaser.add_cable(
        PatchPoint("VCO1", "SAW", 1.0),
        PatchPoint("VCF", "AUDIO_IN", 1.0),
        color="red"
    )
    phaser.add_cable(
        PatchPoint("VCF", "BP", 1.0),
        PatchPoint("VCA", "AUDIO_IN", 1.0),
        color="red"
    )
    phaser.add_cable(
        PatchPoint("LFO", "SINE", 0.8),
        PatchPoint("VCF", "CUTOFF_CV", 0.8),
        color="yellow",
        notes="LFO sweeps filter for phasing"
    )
    phaser.add_cable(
        PatchPoint("ENV1", "OUT", 1.0),
        PatchPoint("VCA", "CV", 1.0),
        color="blue"
    )
    
    phaser.add_module("VCF", {
        "cutoff": 0.5,
        "resonance": 0.7,
        "mode": "BP"
    })
    
    phaser.add_modulator("LFO", ModulatorSettings(
        module_type="LFO",
        rate=0.25,
        depth=0.8,
        waveform="sine"
    ))
    phaser.add_modulator("ENV1", ModulatorSettings(
        module_type="ENV",
        attack=0.01,
        decay=0.3,
        sustain=0.6,
        release=0.2
    ))
    
    library.add_preset(phaser, overwrite=True)
    
    # ========== SEQUENCE/MODULATION PRESETS ==========
    
    # 9. Random Arpeggio - Sample & Hold randomness
    random_arp = Preset(
        name="Random Arpeggio - S&H",
        category=PresetCategory.SEQUENCE,
        description="Random note sequence using Sample & Hold",
        tags={"sequence", "random", "sh", "generative", "arpeggio"},
        author="Behringer 2600 Deep Techno Collection",
        bpm=128
    )
    
    random_arp.add_cable(
        PatchPoint("NOISE", "WHITE", 1.0),
        PatchPoint("SH", "IN", 1.0),
        color="yellow",
        notes="White noise for randomness"
    )
    random_arp.add_cable(
        PatchPoint("LFO", "SQUARE", 1.0),
        PatchPoint("SH", "TRIGGER", 1.0),
        color="yellow",
        notes="LFO triggers new random values"
    )
    random_arp.add_cable(
        PatchPoint("SH", "OUT", 1.0),
        PatchPoint("VCO1", "FM", 1.0),
        color="green",
        notes="Random CV modulates pitch"
    )
    random_arp.add_cable(
        PatchPoint("VCO1", "SAW", 1.0),
        PatchPoint("VCF", "AUDIO_IN", 1.0),
        color="red"
    )
    random_arp.add_cable(
        PatchPoint("VCF", "LP", 1.0),
        PatchPoint("VCA", "AUDIO_IN", 1.0),
        color="red"
    )
    random_arp.add_cable(
        PatchPoint("ENV1", "OUT", 1.0),
        PatchPoint("VCA", "CV", 1.0),
        color="blue"
    )
    
    random_arp.add_module("VCO1", {
        "frequency": 440.0,
        "waveform": "sawtooth",
        "fine_tune": 0.0
    })
    random_arp.add_module("VCF", {
        "cutoff": 0.4,
        "resonance": 0.3,
        "mode": "LP"
    })
    
    random_arp.add_modulator("LFO", ModulatorSettings(
        module_type="LFO",
        rate=0.5,
        depth=1.0,
        waveform="square"
    ))
    random_arp.add_modulator("ENV1", ModulatorSettings(
        module_type="ENV",
        attack=0.001,
        decay=0.15,
        sustain=0.0,
        release=0.1
    ))
    
    library.add_preset(random_arp, overwrite=True)
    
    # 10. LFO Wobble Bass - Deep wobble bass
    wobble_bass = Preset(
        name="Wobble Bass - LFO Modulated",
        category=PresetCategory.MODULATION,
        description="Wobble bass with LFO-modulated filter cutoff",
        tags={"bass", "wobble", "lfo", "dubstep", "modulation"},
        author="Behringer 2600 Deep Techno Collection",
        bpm=140
    )
    
    wobble_bass.add_cable(
        PatchPoint("VCO1", "SAW", 1.0),
        PatchPoint("VCF", "AUDIO_IN", 1.0),
        color="red"
    )
    wobble_bass.add_cable(
        PatchPoint("VCF", "LP", 1.0),
        PatchPoint("VCA", "AUDIO_IN", 1.0),
        color="red"
    )
    wobble_bass.add_cable(
        PatchPoint("LFO", "SINE", 0.9),
        PatchPoint("VCF", "CUTOFF_CV", 0.9),
        color="yellow",
        notes="LFO creates wobble effect"
    )
    wobble_bass.add_cable(
        PatchPoint("ENV1", "OUT", 1.0),
        PatchPoint("VCA", "CV", 1.0),
        color="blue"
    )
    
    wobble_bass.add_module("VCO1", {
        "frequency": 65.41,  # C2
        "waveform": "sawtooth",
        "fine_tune": 0.0
    })
    wobble_bass.add_module("VCF", {
        "cutoff": 0.25,
        "resonance": 0.8,
        "mode": "LP"
    })
    
    wobble_bass.add_modulator("LFO", ModulatorSettings(
        module_type="LFO",
        rate=0.4,
        depth=0.9,
        waveform="sine"
    ))
    wobble_bass.add_modulator("ENV1", ModulatorSettings(
        module_type="ENV",
        attack=0.001,
        decay=0.2,
        sustain=0.8,
        release=0.1
    ))
    
    library.add_preset(wobble_bass, overwrite=True)
    
    print(f"✨ Created {len(library.presets)} deep techno presets")
    return library


if __name__ == "__main__":
    # Create and save the preset library
    library = create_deep_techno_presets()
    library.save_library()
    
    # Print statistics
    stats = library.get_statistics()
    print(f"\n📊 Library Statistics:")
    print(f"Total Presets: {stats['total_presets']}")
    print(f"Categories:")
    for category, count in stats['categories'].items():
        print(f"  - {category}: {count}")
    print(f"\nAll Tags: {', '.join(sorted(stats['tags']))}")
