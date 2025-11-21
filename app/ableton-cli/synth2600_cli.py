#!/usr/bin/env python3
"""
Behringer 2600 Synthesizer CLI
Advanced command-line interface for patching, sequencing, and sound design
Based on the 17 creative patching ideas from the technical guide
"""

import argparse
import json
import sys
import time
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
import mido
from midiutil import MIDIFile

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

@dataclass
class PatchPoint:
    """Represents a patch point on the 2600"""
    module: str
    output: str
    level: float = 1.0  # 0.0 to 1.0

@dataclass
class PatchCable:
    """Represents a patch cable connection"""
    source: PatchPoint
    destination: PatchPoint
    color: str = "red"  # Cable color for organization

@dataclass
class OscillatorParams:
    """VCO parameters"""
    frequency: float = 440.0  # Hz
    waveform: str = "sawtooth"  # sawtooth, square, triangle, sine
    pulse_width: float = 0.5  # 0.0 to 1.0 (for PWM)
    fine_tune: float = 0.0  # -100 to +100 cents
    sync: bool = False

@dataclass
class FilterParams:
    """VCF parameters"""
    cutoff: float = 1000.0  # Hz
    resonance: float = 0.5  # 0.0 to 1.0
    filter_type: str = "lowpass"  # lowpass, highpass, bandpass
    keyboard_tracking: float = 0.0  # 0.0 to 1.0

@dataclass
class EnvelopeParams:
    """ADSR Envelope parameters"""
    attack: float = 0.01  # seconds
    decay: float = 0.2
    sustain: float = 0.7  # 0.0 to 1.0
    release: float = 0.3

@dataclass
class LFOParams:
    """LFO/VCO3 parameters"""
    rate: float = 2.0  # Hz
    waveform: str = "sine"
    depth: float = 0.5  # 0.0 to 1.0

@dataclass
class SequencerStep:
    """16-step sequencer step"""
    pitch: float = 0.0  # Volts (0-5V, maps to pitch)
    gate: bool = True
    duration: float = 0.5  # 0.0 to 1.0 (percentage of step)
    cv1: float = 0.0  # Control voltage output 1
    cv2: float = 0.0  # Control voltage output 2

class Synth2600:
    """Main synthesizer class with patch matrix"""
    
    def __init__(self):
        self.patch_matrix: List[PatchCable] = []
        
        # Oscillators
        self.vco1 = OscillatorParams(frequency=440.0, waveform="sawtooth")
        self.vco2 = OscillatorParams(frequency=440.0, waveform="square")
        self.vco3 = LFOParams(rate=2.0, waveform="sine")  # Can be audio or LFO
        
        # Filter
        self.vcf = FilterParams()
        
        # Envelopes
        self.env1 = EnvelopeParams()  # VCA envelope
        self.env2 = EnvelopeParams()  # Filter envelope
        
        # Sequencer (16 steps)
        self.sequencer = [SequencerStep() for _ in range(16)]
        self.sequencer_mode = "forward"  # forward, backward, pendulum, random
        self.sequencer_tempo = 120.0  # BPM
        
        # Modulation
        self.ring_mod = False
        self.sample_hold_rate = 10.0  # Hz
        
        # Current preset name
        self.preset_name = "init"
    
    def add_patch(self, source_module: str, source_output: str, 
                  dest_module: str, dest_input: str, level: float = 1.0, color: str = "red"):
        """Add a patch cable connection"""
        source = PatchPoint(source_module, source_output, level)
        dest = PatchPoint(dest_module, dest_input, level)
        cable = PatchCable(source, dest, color)
        self.patch_matrix.append(cable)
        return cable
    
    def remove_patch(self, source_module: str, source_output: str,
                     dest_module: str, dest_input: str):
        """Remove a patch cable"""
        self.patch_matrix = [
            cable for cable in self.patch_matrix
            if not (cable.source.module == source_module and 
                   cable.source.output == source_output and
                   cable.destination.module == dest_module and
                   cable.destination.output == dest_input)
        ]
    
    def clear_patches(self):
        """Remove all patch cables"""
        self.patch_matrix = []
    
    def get_patch_diagram(self) -> str:
        """Generate ASCII patch diagram"""
        diagram = f"\n{Colors.HEADER}╔═══════════════════════════════════════════════════════╗{Colors.END}\n"
        diagram += f"{Colors.HEADER}║        BEHRINGER 2600 PATCH MATRIX                   ║{Colors.END}\n"
        diagram += f"{Colors.HEADER}╚═══════════════════════════════════════════════════════╝{Colors.END}\n\n"
        
        if not self.patch_matrix:
            diagram += f"{Colors.YELLOW}  No patches connected (normalled routing active){Colors.END}\n"
        else:
            for i, cable in enumerate(self.patch_matrix, 1):
                color = {
                    'red': Colors.RED,
                    'blue': Colors.BLUE,
                    'green': Colors.GREEN,
                    'yellow': Colors.YELLOW,
                    'cyan': Colors.CYAN
                }.get(cable.color, Colors.END)
                
                diagram += f"  {color}[{cable.color.upper()}]{Colors.END} "
                diagram += f"{Colors.CYAN}{cable.source.module}/{cable.source.output}{Colors.END}"
                diagram += f" {Colors.BOLD}→{Colors.END} "
                diagram += f"{Colors.GREEN}{cable.destination.module}/{cable.destination.output}{Colors.END}"
                diagram += f" (Level: {cable.source.level:.2f})\n"
        
        return diagram
    
    def load_preset(self, preset_name: str):
        """Load one of the 17 creative presets"""
        presets = {
            # ============ SOUNDSCAPE GENERATORS ============
            "evolving_drone": {
                "description": "Slowly morphing atmospheric drone with multiple LFO layers",
                "patches": [
                    ("VCO1", "OUT", "MIXER", "IN1", 0.7, "red"),
                    ("VCO2", "OUT", "MIXER", "IN2", 0.7, "red"),
                    ("VCO3", "OUT", "VCO1", "FM", 0.3, "blue"),
                    ("VCO3", "OUT", "VCO2", "PWM", 0.4, "green"),
                    ("LFO2", "OUT", "VCF", "CUTOFF", 0.5, "yellow"),
                    ("MIXER", "OUT", "VCF", "IN", 1.0, "red"),
                    ("VCF", "OUT", "VCA", "IN", 1.0, "red"),
                ],
                "params": {
                    "vco1": {"frequency": 110.0, "waveform": "sawtooth", "fine_tune": -7},
                    "vco2": {"frequency": 110.5, "waveform": "triangle", "fine_tune": 5},
                    "vco3": {"rate": 0.2, "waveform": "sine"},
                    "vcf": {"cutoff": 800.0, "resonance": 0.3},
                    "env1": {"attack": 2.0, "decay": 1.0, "sustain": 0.8, "release": 3.0}
                }
            },
            
            "generative_sequencer": {
                "description": "Self-playing random melody generator with S&H",
                "patches": [
                    ("NOISE", "OUT", "S&H", "IN", 1.0, "red"),
                    ("VCO3", "OUT", "S&H", "CLOCK", 1.0, "blue"),
                    ("S&H", "OUT", "VCO1", "CV", 1.0, "green"),
                    ("VCO1", "OUT", "VCF", "IN", 1.0, "red"),
                    ("VCF", "OUT", "VCA", "IN", 1.0, "red"),
                    ("ENV1", "OUT", "VCA", "CV", 1.0, "yellow"),
                ],
                "params": {
                    "vco1": {"frequency": 440.0, "waveform": "square"},
                    "vco3": {"rate": 8.0, "waveform": "square"},
                    "vcf": {"cutoff": 2000.0, "resonance": 0.6},
                    "env1": {"attack": 0.01, "decay": 0.3, "sustain": 0.0, "release": 0.1}
                }
            },
            
            "dual_texture_morph": {
                "description": "Two independent evolving textures with crossfade",
                "patches": [
                    ("VCO1", "OUT", "VCF1", "IN", 1.0, "red"),
                    ("VCO2", "OUT", "VCF2", "IN", 1.0, "blue"),
                    ("VCO3", "OUT", "VCF1", "CUTOFF", 0.5, "green"),
                    ("LFO2", "OUT", "VCF2", "CUTOFF", 0.5, "yellow"),
                    ("VCF1", "OUT", "MIXER", "IN1", 0.7, "red"),
                    ("VCF2", "OUT", "MIXER", "IN2", 0.3, "blue"),
                ],
                "params": {
                    "vco1": {"frequency": 220.0, "waveform": "sawtooth"},
                    "vco2": {"frequency": 165.0, "waveform": "triangle"},
                    "vco3": {"rate": 0.3, "waveform": "sine"},
                    "vcf": {"cutoff": 1200.0, "resonance": 0.4}
                }
            },
            
            # ============ RHYTHMIC EXPERIMENTS ============
            "polyrhythmic_chaos": {
                "description": "Multiple independent rhythmic patterns creating complex polyrhythms",
                "patches": [
                    ("VCO3", "SQUARE", "VCA1", "GATE", 1.0, "red"),
                    ("LFO2", "SQUARE", "VCA2", "GATE", 1.0, "blue"),
                    ("VCO1", "OUT", "VCA1", "IN", 1.0, "red"),
                    ("VCO2", "OUT", "VCA2", "IN", 1.0, "blue"),
                    ("VCA1", "OUT", "MIXER", "IN1", 0.6, "red"),
                    ("VCA2", "OUT", "MIXER", "IN2", 0.4, "blue"),
                ],
                "params": {
                    "vco1": {"frequency": 330.0, "waveform": "square"},
                    "vco2": {"frequency": 440.0, "waveform": "sawtooth"},
                    "vco3": {"rate": 4.0, "waveform": "square"},
                }
            },
            
            "gate_controlled_stutter": {
                "description": "Stutter effect using rapid gate triggering",
                "patches": [
                    ("VCO3", "SQUARE", "ENV1", "GATE", 1.0, "red"),
                    ("VCO1", "OUT", "VCA", "IN", 1.0, "blue"),
                    ("ENV1", "OUT", "VCA", "CV", 1.0, "yellow"),
                    ("VCA", "OUT", "VCF", "IN", 1.0, "red"),
                ],
                "params": {
                    "vco1": {"frequency": 440.0, "waveform": "sawtooth"},
                    "vco3": {"rate": 16.0, "waveform": "square"},
                    "env1": {"attack": 0.001, "decay": 0.05, "sustain": 0.0, "release": 0.01},
                    "vcf": {"cutoff": 3000.0, "resonance": 0.7}
                }
            },
            
            # ============ MODULATION MADNESS ============
            "triple_lfo": {
                "description": "Three LFO sources modulating different parameters simultaneously",
                "patches": [
                    ("VCO3", "OUT", "VCO1", "FM", 0.4, "red"),
                    ("LFO2", "OUT", "VCF", "CUTOFF", 0.6, "blue"),
                    ("LFO3", "OUT", "VCO2", "PWM", 0.5, "green"),
                    ("VCO1", "OUT", "MIXER", "IN1", 0.6, "red"),
                    ("VCO2", "OUT", "MIXER", "IN2", 0.4, "red"),
                    ("MIXER", "OUT", "VCF", "IN", 1.0, "red"),
                ],
                "params": {
                    "vco1": {"frequency": 220.0, "waveform": "sawtooth"},
                    "vco2": {"frequency": 220.0, "waveform": "square", "pulse_width": 0.5},
                    "vco3": {"rate": 3.0, "waveform": "triangle"},
                    "vcf": {"cutoff": 1500.0, "resonance": 0.5}
                }
            },
            
            "frequency_cascade": {
                "description": "VCO2 modulates VCO1, which modulates filter in a cascade",
                "patches": [
                    ("VCO2", "OUT", "VCO1", "FM", 0.8, "red"),
                    ("VCO1", "OUT", "VCF", "CUTOFF", 0.5, "blue"),
                    ("VCO1", "OUT", "VCA", "IN", 1.0, "green"),
                    ("VCF", "OUT", "VCA", "CV", 0.7, "yellow"),
                ],
                "params": {
                    "vco1": {"frequency": 110.0, "waveform": "sawtooth"},
                    "vco2": {"frequency": 55.0, "waveform": "sine"},
                    "vcf": {"cutoff": 2000.0, "resonance": 0.8}
                }
            },
            
            # ============ CINEMATIC FX ============
            "scifi_spaceship": {
                "description": "Alien spaceship engine with sweeping resonance and noise",
                "patches": [
                    ("VCO1", "OUT", "VCF", "IN", 0.6, "red"),
                    ("NOISE", "OUT", "VCF", "IN", 0.4, "blue"),
                    ("VCO3", "OUT", "VCF", "CUTOFF", 0.7, "green"),
                    ("VCO3", "OUT", "VCF", "Q", 0.6, "yellow"),
                    ("VCF", "OUT", "VCA", "IN", 1.0, "red"),
                ],
                "params": {
                    "vco1": {"frequency": 55.0, "waveform": "square"},
                    "vco3": {"rate": 0.1, "waveform": "sine"},
                    "vcf": {"cutoff": 500.0, "resonance": 0.9, "filter_type": "bandpass"}
                }
            },
            
            "thunder_lightning": {
                "description": "Thunder rumble with lightning strikes using noise and envelopes",
                "patches": [
                    ("NOISE", "OUT", "VCF", "IN", 1.0, "red"),
                    ("ENV1", "OUT", "VCF", "CUTOFF", 0.8, "blue"),
                    ("ENV1", "OUT", "VCA", "CV", 1.0, "yellow"),
                    ("VCF", "OUT", "VCA", "IN", 1.0, "red"),
                ],
                "params": {
                    "vcf": {"cutoff": 200.0, "resonance": 0.3, "filter_type": "lowpass"},
                    "env1": {"attack": 0.001, "decay": 2.0, "sustain": 0.1, "release": 3.0}
                }
            },
            
            "analog_glitch": {
                "description": "Digital-sounding glitches from analog sources",
                "patches": [
                    ("NOISE", "OUT", "S&H", "IN", 1.0, "red"),
                    ("VCO3", "SQUARE", "S&H", "CLOCK", 1.0, "blue"),
                    ("S&H", "OUT", "VCF", "CUTOFF", 1.0, "green"),
                    ("VCO1", "OUT", "VCF", "IN", 1.0, "red"),
                    ("VCO2", "OUT", "VCF", "IN", 0.5, "red"),
                ],
                "params": {
                    "vco1": {"frequency": 880.0, "waveform": "square"},
                    "vco2": {"frequency": 1320.0, "waveform": "square"},
                    "vco3": {"rate": 32.0, "waveform": "square"},
                    "vcf": {"cutoff": 4000.0, "resonance": 0.9}
                }
            },
            
            # ============ PSYCHEDELIC ============
            "self_playing": {
                "description": "Self-playing patch that creates evolving melodies",
                "patches": [
                    ("NOISE", "OUT", "S&H", "IN", 1.0, "red"),
                    ("VCO3", "OUT", "S&H", "CLOCK", 1.0, "blue"),
                    ("S&H", "OUT", "VCO1", "CV", 1.0, "green"),
                    ("S&H", "OUT", "VCF", "CUTOFF", 0.5, "yellow"),
                    ("VCO1", "OUT", "VCF", "IN", 1.0, "red"),
                    ("ENV1", "OUT", "VCA", "CV", 1.0, "cyan"),
                ],
                "params": {
                    "vco1": {"frequency": 440.0, "waveform": "sawtooth"},
                    "vco3": {"rate": 5.0, "waveform": "square"},
                    "vcf": {"cutoff": 1500.0, "resonance": 0.6},
                    "env1": {"attack": 0.05, "decay": 0.2, "sustain": 0.3, "release": 0.4}
                }
            },
            
            "karplus_strong": {
                "description": "Physical modeling plucked string using feedback",
                "patches": [
                    ("NOISE", "OUT", "VCF", "IN", 1.0, "red"),
                    ("VCF", "OUT", "DELAY", "IN", 1.0, "blue"),
                    ("DELAY", "OUT", "VCF", "IN", 0.95, "green"),  # Feedback
                    ("VCF", "OUT", "VCA", "IN", 1.0, "red"),
                ],
                "params": {
                    "vcf": {"cutoff": 8000.0, "resonance": 0.0, "filter_type": "lowpass"},
                    "env1": {"attack": 0.001, "decay": 0.05, "sustain": 0.0, "release": 0.01}
                }
            },
            
            "ring_mod_sim": {
                "description": "Ring modulation simulation for metallic/bell tones",
                "patches": [
                    ("VCO1", "OUT", "RINGMOD", "X", 1.0, "red"),
                    ("VCO2", "OUT", "RINGMOD", "Y", 1.0, "blue"),
                    ("RINGMOD", "OUT", "VCF", "IN", 1.0, "green"),
                    ("VCF", "OUT", "VCA", "IN", 1.0, "red"),
                    ("ENV1", "OUT", "VCA", "CV", 1.0, "yellow"),
                ],
                "params": {
                    "vco1": {"frequency": 440.0, "waveform": "sine"},
                    "vco2": {"frequency": 660.0, "waveform": "sine"},
                    "vcf": {"cutoff": 3000.0, "resonance": 0.3},
                    "env1": {"attack": 0.01, "decay": 0.8, "sustain": 0.0, "release": 0.5}
                }
            },
            
            # ============ PERFORMANCE ============
            "expressive_lead": {
                "description": "Touch-responsive lead with dynamic vibrato and filter",
                "patches": [
                    ("VCO1", "OUT", "VCF", "IN", 0.7, "red"),
                    ("VCO2", "OUT", "VCF", "IN", 0.3, "red"),
                    ("VCO3", "OUT", "VCO1", "FM", 0.3, "blue"),
                    ("ENV2", "OUT", "VCF", "CUTOFF", 0.8, "green"),
                    ("VCF", "OUT", "VCA", "IN", 1.0, "red"),
                    ("ENV1", "OUT", "VCA", "CV", 1.0, "yellow"),
                ],
                "params": {
                    "vco1": {"frequency": 440.0, "waveform": "sawtooth"},
                    "vco2": {"frequency": 440.0, "waveform": "square", "fine_tune": 7},
                    "vco3": {"rate": 5.5, "waveform": "sine"},
                    "vcf": {"cutoff": 1500.0, "resonance": 0.7, "keyboard_tracking": 0.8},
                    "env1": {"attack": 0.01, "decay": 0.3, "sustain": 0.7, "release": 0.5},
                    "env2": {"attack": 0.02, "decay": 0.4, "sustain": 0.5, "release": 0.3}
                }
            },
            
            "touch_sensitive_bass": {
                "description": "Velocity-sensitive bass with dynamic filter",
                "patches": [
                    ("VCO1", "OUT", "VCF", "IN", 1.0, "red"),
                    ("ENV1", "OUT", "VCF", "CUTOFF", 0.9, "blue"),
                    ("ENV1", "OUT", "VCA", "CV", 1.0, "yellow"),
                    ("VCF", "OUT", "VCA", "IN", 1.0, "red"),
                ],
                "params": {
                    "vco1": {"frequency": 110.0, "waveform": "sawtooth"},
                    "vcf": {"cutoff": 300.0, "resonance": 0.6, "keyboard_tracking": 0.5},
                    "env1": {"attack": 0.01, "decay": 0.4, "sustain": 0.2, "release": 0.3}
                }
            },
            
            # ============ MUSICAL TECHNIQUES ============
            "auto_harmonizing": {
                "description": "Two oscillators auto-harmonize based on modulation",
                "patches": [
                    ("VCO1", "OUT", "MIXER", "IN1", 0.6, "red"),
                    ("VCO2", "OUT", "MIXER", "IN2", 0.4, "red"),
                    ("VCO3", "OUT", "VCO2", "CV", 0.3, "blue"),
                    ("MIXER", "OUT", "VCF", "IN", 1.0, "red"),
                    ("VCF", "OUT", "VCA", "IN", 1.0, "red"),
                ],
                "params": {
                    "vco1": {"frequency": 440.0, "waveform": "sawtooth"},
                    "vco2": {"frequency": 554.37, "waveform": "square"},  # Perfect 4th
                    "vco3": {"rate": 0.5, "waveform": "triangle"},
                    "vcf": {"cutoff": 2000.0, "resonance": 0.4}
                }
            },
            
            "barber_pole_phaser": {
                "description": "Continuously rising/falling phaser effect",
                "patches": [
                    ("VCO1", "OUT", "VCF1", "IN", 1.0, "red"),
                    ("VCO1", "OUT", "VCF2", "IN", 1.0, "blue"),
                    ("VCO3", "OUT", "VCF1", "CUTOFF", 0.8, "green"),
                    ("VCO3", "OUT", "VCF2", "CUTOFF", 0.8, "yellow"),
                    ("VCF1", "OUT", "MIXER", "IN1", 0.5, "red"),
                    ("VCF2", "OUT", "MIXER", "IN2", 0.5, "blue"),
                ],
                "params": {
                    "vco1": {"frequency": 440.0, "waveform": "sawtooth"},
                    "vco3": {"rate": 0.3, "waveform": "triangle"},
                    "vcf": {"cutoff": 1000.0, "resonance": 0.9, "filter_type": "bandpass"}
                }
            },
        }
        
        if preset_name not in presets:
            available = ", ".join(presets.keys())
            raise ValueError(f"Preset '{preset_name}' not found. Available: {available}")
        
        preset = presets[preset_name]
        
        # Clear existing patches
        self.clear_patches()
        
        # Apply patches
        for patch in preset["patches"]:
            src_mod, src_out, dst_mod, dst_in, level, color = patch
            self.add_patch(src_mod, src_out, dst_mod, dst_in, level, color)
        
        # Apply parameters
        if "params" in preset:
            params = preset["params"]
            
            if "vco1" in params:
                for key, val in params["vco1"].items():
                    setattr(self.vco1, key, val)
            
            if "vco2" in params:
                for key, val in params["vco2"].items():
                    setattr(self.vco2, key, val)
            
            if "vco3" in params:
                for key, val in params["vco3"].items():
                    setattr(self.vco3, key, val)
            
            if "vcf" in params:
                for key, val in params["vcf"].items():
                    setattr(self.vcf, key, val)
            
            if "env1" in params:
                for key, val in params["env1"].items():
                    setattr(self.env1, key, val)
            
            if "env2" in params:
                for key, val in params["env2"].items():
                    setattr(self.env2, key, val)
        
        self.preset_name = preset_name
        
        return preset["description"]
    
    def program_sequencer(self, pattern: List[Dict]):
        """Program the 16-step sequencer"""
        for i, step_data in enumerate(pattern[:16]):
            if i < len(self.sequencer):
                self.sequencer[i].pitch = step_data.get("pitch", 0.0)
                self.sequencer[i].gate = step_data.get("gate", True)
                self.sequencer[i].duration = step_data.get("duration", 0.5)
                self.sequencer[i].cv1 = step_data.get("cv1", 0.0)
                self.sequencer[i].cv2 = step_data.get("cv2", 0.0)
    
    def export_to_midi(self, filename: str, num_bars: int = 4):
        """Export sequencer pattern to MIDI file"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        tempo = self.sequencer_tempo
        
        midi.addTempo(track, 0, tempo)
        
        # Calculate step time in beats
        beats_per_step = 4.0 / 16  # Assuming 16 steps per 4 beats
        
        current_time = 0
        step_index = 0
        
        for bar in range(num_bars):
            for step in range(16):
                seq_step = self.sequencer[step]
                
                if seq_step.gate:
                    # Convert pitch voltage to MIDI note (0-5V = 0-60 semitones)
                    midi_note = int(60 + (seq_step.pitch * 12))
                    midi_note = max(0, min(127, midi_note))
                    
                    # Duration in beats
                    duration = beats_per_step * seq_step.duration
                    
                    midi.addNote(track, channel, midi_note, current_time, duration, 100)
                
                current_time += beats_per_step
        
        with open(filename, 'wb') as f:
            midi.writeFile(f)
        
        return filename
    
    def export_preset(self, filename: str):
        """Export current patch to JSON file"""
        data = {
            "preset_name": self.preset_name,
            "patch_matrix": [
                {
                    "source": asdict(cable.source),
                    "destination": asdict(cable.destination),
                    "color": cable.color
                }
                for cable in self.patch_matrix
            ],
            "vco1": asdict(self.vco1),
            "vco2": asdict(self.vco2),
            "vco3": asdict(self.vco3),
            "vcf": asdict(self.vcf),
            "env1": asdict(self.env1),
            "env2": asdict(self.env2),
            "sequencer": [asdict(step) for step in self.sequencer],
            "sequencer_mode": self.sequencer_mode,
            "sequencer_tempo": self.sequencer_tempo,
        }
        
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        
        return filename
    
    def import_preset(self, filename: str):
        """Import patch from JSON file"""
        with open(filename, 'r') as f:
            data = json.load(f)
        
        self.preset_name = data.get("preset_name", "imported")
        
        # Clear and rebuild patch matrix
        self.clear_patches()
        for cable_data in data.get("patch_matrix", []):
            src = cable_data["source"]
            dst = cable_data["destination"]
            self.add_patch(
                src["module"], src["output"],
                dst["module"], dst["output"],
                src["level"], cable_data["color"]
            )
        
        # Import parameters
        if "vco1" in data:
            self.vco1 = OscillatorParams(**data["vco1"])
        if "vco2" in data:
            self.vco2 = OscillatorParams(**data["vco2"])
        if "vco3" in data:
            self.vco3 = LFOParams(**data["vco3"])
        if "vcf" in data:
            self.vcf = FilterParams(**data["vcf"])
        if "env1" in data:
            self.env1 = EnvelopeParams(**data["env1"])
        if "env2" in data:
            self.env2 = EnvelopeParams(**data["env2"])
        
        # Import sequencer
        if "sequencer" in data:
            self.sequencer = [SequencerStep(**step) for step in data["sequencer"]]
        
        self.sequencer_mode = data.get("sequencer_mode", "forward")
        self.sequencer_tempo = data.get("sequencer_tempo", 120.0)

def print_banner():
    """Print ASCII art banner"""
    banner = f"""
{Colors.CYAN}╔═════════════════════════════════════════════════════════════╗
║                                                             ║
║   ██████╗ ███████╗██╗  ██╗██████╗ ██╗███╗   ██╗ ██████╗   ║
║   ██╔══██╗██╔════╝██║  ██║██╔══██╗██║████╗  ██║██╔════╝   ║
║   ██████╔╝█████╗  ███████║██████╔╝██║██╔██╗ ██║██║  ███╗  ║
║   ██╔══██╗██╔══╝  ██╔══██║██╔══██╗██║██║╚██╗██║██║   ██║  ║
║   ██████╔╝███████╗██║  ██║██║  ██║██║██║ ╚████║╚██████╔╝  ║
║   ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝   ║
║                                                             ║
║              2600 Synthesizer Command-Line Interface       ║
║                    Advanced Patching & Sequencing          ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝{Colors.END}
"""
    print(banner)

def main():
    """Main CLI entry point"""
    print_banner()
    
    parser = argparse.ArgumentParser(
        description="Behringer 2600 Synthesizer CLI - Advanced Patching & Sound Design",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Load a creative preset
  %(prog)s preset --load evolving_drone
  
  # Show patch matrix
  %(prog)s patch --show
  
  # Add a patch cable
  %(prog)s patch --add VCO1/OUT VCF/IN --level 0.8 --color red
  
  # Program sequencer with random pattern
  %(prog)s sequencer --program random --steps 16
  
  # Export to MIDI
  %(prog)s export --midi output.mid --bars 8
  
  # Export preset
  %(prog)s export --preset my_patch.json
  
  # List all available presets
  %(prog)s preset --list
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Preset command
    preset_parser = subparsers.add_parser('preset', help='Preset management')
    preset_group = preset_parser.add_mutually_exclusive_group(required=True)
    preset_group.add_argument('--load', metavar='NAME', help='Load preset by name')
    preset_group.add_argument('--list', action='store_true', help='List all available presets')
    preset_group.add_argument('--info', metavar='NAME', help='Show preset information')
    
    # Patch command
    patch_parser = subparsers.add_parser('patch', help='Patch matrix operations')
    patch_parser.add_argument('--show', action='store_true', help='Show current patch matrix')
    patch_parser.add_argument('--add', nargs=2, metavar=('SOURCE', 'DEST'), 
                             help='Add patch cable (e.g., VCO1/OUT VCF/IN)')
    patch_parser.add_argument('--remove', nargs=2, metavar=('SOURCE', 'DEST'),
                             help='Remove patch cable')
    patch_parser.add_argument('--clear', action='store_true', help='Clear all patches')
    patch_parser.add_argument('--level', type=float, default=1.0, help='Cable level (0.0-1.0)')
    patch_parser.add_argument('--color', default='red', 
                             choices=['red', 'blue', 'green', 'yellow', 'cyan'],
                             help='Cable color')
    
    # Sequencer command
    seq_parser = subparsers.add_parser('sequencer', help='16-step sequencer programming')
    seq_parser.add_argument('--program', choices=['random', 'ascending', 'descending', 'arpeggio'],
                           help='Program sequencer pattern')
    seq_parser.add_argument('--steps', type=int, default=16, help='Number of steps')
    seq_parser.add_argument('--tempo', type=float, help='Tempo in BPM')
    seq_parser.add_argument('--mode', choices=['forward', 'backward', 'pendulum', 'random'],
                           help='Sequencer playback mode')
    
    # Parameters command
    param_parser = subparsers.add_parser('params', help='Set synthesizer parameters')
    param_parser.add_argument('--vco1-freq', type=float, help='VCO1 frequency (Hz)')
    param_parser.add_argument('--vco1-wave', choices=['sawtooth', 'square', 'triangle', 'sine'],
                             help='VCO1 waveform')
    param_parser.add_argument('--vco2-freq', type=float, help='VCO2 frequency (Hz)')
    param_parser.add_argument('--lfo-rate', type=float, help='LFO rate (Hz)')
    param_parser.add_argument('--filter-cutoff', type=float, help='Filter cutoff (Hz)')
    param_parser.add_argument('--filter-res', type=float, help='Filter resonance (0.0-1.0)')
    
    # Export command
    export_parser = subparsers.add_parser('export', help='Export data')
    export_parser.add_argument('--midi', metavar='FILE', help='Export to MIDI file')
    export_parser.add_argument('--preset', metavar='FILE', help='Export preset to JSON')
    export_parser.add_argument('--bars', type=int, default=4, help='Number of bars for MIDI export')
    
    # Import command
    import_parser = subparsers.add_parser('import', help='Import preset')
    import_parser.add_argument('file', help='JSON preset file to import')
    
    args = parser.parse_args()
    
    # Create synth instance
    synth = Synth2600()
    
    if args.command == 'preset':
        if args.list:
            print(f"\n{Colors.HEADER}Available Presets:{Colors.END}\n")
            categories = {
                "Soundscape Generators": ["evolving_drone", "generative_sequencer", "dual_texture_morph"],
                "Rhythmic Experiments": ["polyrhythmic_chaos", "gate_controlled_stutter"],
                "Modulation Madness": ["triple_lfo", "frequency_cascade"],
                "Cinematic FX": ["scifi_spaceship", "thunder_lightning", "analog_glitch"],
                "Psychedelic": ["self_playing", "karplus_strong", "ring_mod_sim"],
                "Performance": ["expressive_lead", "touch_sensitive_bass"],
                "Musical Techniques": ["auto_harmonizing", "barber_pole_phaser"]
            }
            
            for category, presets in categories.items():
                print(f"{Colors.CYAN}{category}:{Colors.END}")
                for preset in presets:
                    print(f"  • {preset}")
                print()
        
        elif args.load:
            try:
                desc = synth.load_preset(args.load)
                print(f"\n{Colors.GREEN}✓ Loaded preset: {args.load}{Colors.END}")
                print(f"{Colors.YELLOW}Description: {desc}{Colors.END}")
                print(synth.get_patch_diagram())
            except ValueError as e:
                print(f"{Colors.RED}✗ Error: {e}{Colors.END}")
                sys.exit(1)
        
        elif args.info:
            try:
                desc = synth.load_preset(args.info)
                print(f"\n{Colors.HEADER}Preset: {args.info}{Colors.END}")
                print(f"{Colors.YELLOW}{desc}{Colors.END}\n")
                print(synth.get_patch_diagram())
                
                print(f"\n{Colors.HEADER}Parameters:{Colors.END}")
                print(f"  VCO1: {synth.vco1.frequency}Hz {synth.vco1.waveform}")
                print(f"  VCO2: {synth.vco2.frequency}Hz {synth.vco2.waveform}")
                print(f"  LFO:  {synth.vco3.rate}Hz {synth.vco3.waveform}")
                print(f"  VCF:  {synth.vcf.cutoff}Hz Q={synth.vcf.resonance}")
                print(f"  ENV1: A={synth.env1.attack}s D={synth.env1.decay}s S={synth.env1.sustain} R={synth.env1.release}s")
            except ValueError as e:
                print(f"{Colors.RED}✗ Error: {e}{Colors.END}")
                sys.exit(1)
    
    elif args.command == 'patch':
        if args.show:
            print(synth.get_patch_diagram())
        
        elif args.add:
            source = args.add[0].split('/')
            dest = args.add[1].split('/')
            if len(source) != 2 or len(dest) != 2:
                print(f"{Colors.RED}✗ Error: Format should be MODULE/OUTPUT{Colors.END}")
                sys.exit(1)
            
            synth.add_patch(source[0], source[1], dest[0], dest[1], args.level, args.color)
            print(f"{Colors.GREEN}✓ Added patch: {args.add[0]} → {args.add[1]}{Colors.END}")
            print(synth.get_patch_diagram())
        
        elif args.remove:
            source = args.remove[0].split('/')
            dest = args.remove[1].split('/')
            synth.remove_patch(source[0], source[1], dest[0], dest[1])
            print(f"{Colors.GREEN}✓ Removed patch{Colors.END}")
        
        elif args.clear:
            synth.clear_patches()
            print(f"{Colors.GREEN}✓ Cleared all patches{Colors.END}")
    
    elif args.command == 'sequencer':
        if args.tempo:
            synth.sequencer_tempo = args.tempo
        
        if args.mode:
            synth.sequencer_mode = args.mode
        
        if args.program:
            import random
            pattern = []
            
            if args.program == 'random':
                for i in range(args.steps):
                    pattern.append({
                        "pitch": random.uniform(0, 5),
                        "gate": random.choice([True, True, False]),
                        "duration": random.uniform(0.3, 1.0),
                        "cv1": random.uniform(0, 5),
                        "cv2": random.uniform(0, 5)
                    })
            
            elif args.program == 'ascending':
                for i in range(args.steps):
                    pattern.append({
                        "pitch": (i / args.steps) * 3,
                        "gate": True,
                        "duration": 0.8,
                        "cv1": 0,
                        "cv2": 0
                    })
            
            elif args.program == 'descending':
                for i in range(args.steps):
                    pattern.append({
                        "pitch": ((args.steps - i) / args.steps) * 3,
                        "gate": True,
                        "duration": 0.8,
                        "cv1": 0,
                        "cv2": 0
                    })
            
            elif args.program == 'arpeggio':
                notes = [0, 0.5, 1.0, 1.5]  # Root, 3rd, 5th, 7th
                for i in range(args.steps):
                    pattern.append({
                        "pitch": notes[i % len(notes)],
                        "gate": True,
                        "duration": 0.8,
                        "cv1": 0,
                        "cv2": 0
                    })
            
            synth.program_sequencer(pattern)
            print(f"{Colors.GREEN}✓ Programmed {args.program} pattern ({args.steps} steps){Colors.END}")
            print(f"  Tempo: {synth.sequencer_tempo} BPM")
            print(f"  Mode: {synth.sequencer_mode}")
    
    elif args.command == 'params':
        if args.vco1_freq:
            synth.vco1.frequency = args.vco1_freq
        if args.vco1_wave:
            synth.vco1.waveform = args.vco1_wave
        if args.vco2_freq:
            synth.vco2.frequency = args.vco2_freq
        if args.lfo_rate:
            synth.vco3.rate = args.lfo_rate
        if args.filter_cutoff:
            synth.vcf.cutoff = args.filter_cutoff
        if args.filter_res:
            synth.vcf.resonance = args.filter_res
        
        print(f"{Colors.GREEN}✓ Parameters updated{Colors.END}")
    
    elif args.command == 'export':
        if args.midi:
            filename = synth.export_to_midi(args.midi, args.bars)
            print(f"{Colors.GREEN}✓ Exported MIDI to: {filename}{Colors.END}")
        
        if args.preset:
            filename = synth.export_preset(args.preset)
            print(f"{Colors.GREEN}✓ Exported preset to: {filename}{Colors.END}")
    
    elif args.command == 'import':
        try:
            synth.import_preset(args.file)
            print(f"{Colors.GREEN}✓ Imported preset from: {args.file}{Colors.END}")
            print(synth.get_patch_diagram())
        except Exception as e:
            print(f"{Colors.RED}✗ Error importing: {e}{Colors.END}")
            sys.exit(1)
    
    else:
        parser.print_help()


def interactive_mode():
    """Run interactive REPL mode"""
    import readline  # Enable arrow keys and history
    
    # ASCII Art Banner
    banner = f"""
{Colors.CYAN}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   {Colors.BOLD}██████╗ ███████╗██╗  ██╗██████╗ ██╗███╗   ██╗ ██████╗{Colors.END}{Colors.CYAN}   ║
║   {Colors.BOLD}██╔══██╗██╔════╝██║  ██║██╔══██╗██║████╗  ██║██╔════╝{Colors.END}{Colors.CYAN}   ║
║   {Colors.BOLD}██████╔╝█████╗  ███████║██████╔╝██║██╔██╗ ██║██║  ███╗{Colors.END}{Colors.CYAN}  ║
║   {Colors.BOLD}██╔══██╗██╔══╝  ██╔══██║██╔══██╗██║██║╚██╗██║██║   ██║{Colors.END}{Colors.CYAN}  ║
║   {Colors.BOLD}██████╔╝███████╗██║  ██║██║  ██║██║██║ ╚████║╚██████╔╝{Colors.END}{Colors.CYAN}  ║
║   {Colors.BOLD}╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝{Colors.END}{Colors.CYAN}   ║
║                                                               ║
║           {Colors.YELLOW}Interactive Command-Line Interface{Colors.END}{Colors.CYAN}                  ║
║              {Colors.GREEN}Advanced Patching & Sequencing{Colors.END}{Colors.CYAN}                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝{Colors.END}

{Colors.YELLOW}Welcome to the Behringer 2600 Interactive Shell!{Colors.END}

Type {Colors.CYAN}'help'{Colors.END} for available commands, {Colors.CYAN}'exit'{Colors.END} to quit.
Type {Colors.CYAN}'presets'{Colors.END} to see all available presets.

"""
    print(banner)
    
    synth = Synth2600()
    current_preset = None
    history = []
    
    # Command shortcuts
    aliases = {
        'ls': 'list',
        'l': 'list',
        'p': 'preset',
        'load': 'preset',
        'show': 'patch',
        's': 'patch',
        'seq': 'sequencer',
        'param': 'params',
        'set': 'params',
        'exp': 'export',
        'save': 'export',
        'q': 'exit',
        'quit': 'exit',
        '?': 'help',
    }
    
    def print_help():
        help_text = f"""
{Colors.BOLD}{Colors.CYAN}Available Commands:{Colors.END}

{Colors.YELLOW}Preset Management:{Colors.END}
  {Colors.GREEN}presets{Colors.END} | {Colors.GREEN}list{Colors.END}              List all available presets
  {Colors.GREEN}preset <name>{Colors.END}              Load a specific preset
  {Colors.GREEN}info{Colors.END}                       Show current preset info
  {Colors.GREEN}clear{Colors.END}                      Clear all patches

{Colors.YELLOW}Patch Matrix:{Colors.END}
  {Colors.GREEN}patch{Colors.END} | {Colors.GREEN}show{Colors.END}              Show current patch matrix
  {Colors.GREEN}add <src> <dst> [lvl]{Colors.END}      Add patch cable (level 0.0-1.0)
  {Colors.GREEN}remove <src> <dst>{Colors.END}         Remove patch cable
  {Colors.GREEN}color <src> <dst> <col>{Colors.END}    Change cable color

{Colors.YELLOW}Oscillators:{Colors.END}
  {Colors.GREEN}vco1 <freq> [wave]{Colors.END}         Set VCO1 frequency & waveform
  {Colors.GREEN}vco2 <freq> [wave]{Colors.END}         Set VCO2 frequency & waveform
  {Colors.GREEN}lfo <rate>{Colors.END}                 Set LFO rate (VCO3)

{Colors.YELLOW}Filter & Envelope:{Colors.END}
  {Colors.GREEN}filter <cutoff> [res]{Colors.END}      Set filter cutoff & resonance
  {Colors.GREEN}envelope <a> <d> <s> <r>{Colors.END}   Set ADSR envelope

{Colors.YELLOW}Sequencer:{Colors.END}
  {Colors.GREEN}seq random [steps]{Colors.END}         Generate random pattern
  {Colors.GREEN}seq notes <pattern>{Colors.END}        Set note pattern (e.g., "C4 E4 G4")
  {Colors.GREEN}seq tempo <bpm>{Colors.END}            Set sequencer tempo

{Colors.YELLOW}Export:{Colors.END}
  {Colors.GREEN}export midi <file> [bars]{Colors.END}  Export to MIDI file
  {Colors.GREEN}export preset <file>{Colors.END}       Save current preset

{Colors.YELLOW}System:{Colors.END}
  {Colors.GREEN}help{Colors.END} | {Colors.GREEN}?{Colors.END}                  Show this help
  {Colors.GREEN}history{Colors.END}                    Show command history
  {Colors.GREEN}exit{Colors.END} | {Colors.GREEN}quit{Colors.END} | {Colors.GREEN}q{Colors.END}           Exit interactive mode

{Colors.YELLOW}Quick Examples:{Colors.END}
  > preset evolving_drone
  > vco1 440 sawtooth
  > filter 1200 0.8
  > add VCO1/OUT VCF/IN 0.9
  > export midi my_patch.mid 8
"""
        print(help_text)
    
    def list_presets():
        print(f"\n{Colors.BOLD}{Colors.CYAN}Available Presets:{Colors.END}\n")
        
        categories = {
            'Soundscape Generators': ['evolving_drone', 'generative_sequencer', 'dual_texture_morph'],
            'Rhythmic Experiments': ['polyrhythmic_chaos', 'gate_controlled_stutter'],
            'Modulation Madness': ['triple_lfo', 'frequency_cascade'],
            'Cinematic FX': ['scifi_spaceship', 'thunder_lightning', 'analog_glitch'],
            'Psychedelic': ['self_playing', 'karplus_strong', 'ring_mod_sim'],
            'Performance': ['expressive_lead', 'touch_sensitive_bass'],
            'Musical Techniques': ['auto_harmonizing', 'barber_pole_phaser']
        }
        
        for category, presets in categories.items():
            print(f"{Colors.YELLOW}{category}:{Colors.END}")
            for preset in presets:
                print(f"  {Colors.GREEN}•{Colors.END} {preset}")
            print()
    
    def parse_command(cmd_line):
        """Parse interactive command"""
        parts = cmd_line.strip().split()
        if not parts:
            return None, []
        
        cmd = parts[0].lower()
        # Check for aliases
        cmd = aliases.get(cmd, cmd)
        args = parts[1:]
        
        return cmd, args
    
    while True:
        try:
            # Prompt with current preset indicator
            if current_preset:
                prompt = f"{Colors.CYAN}2600{Colors.END} [{Colors.YELLOW}{current_preset}{Colors.END}]> "
            else:
                prompt = f"{Colors.CYAN}2600{Colors.END}> "
            
            cmd_line = input(prompt).strip()
            
            if not cmd_line:
                continue
            
            # Add to history
            history.append(cmd_line)
            
            cmd, args = parse_command(cmd_line)
            
            if cmd is None:
                continue
            
            # Handle commands
            if cmd == 'exit':
                print(f"\n{Colors.YELLOW}👋 Goodbye! Keep patching!{Colors.END}\n")
                break
            
            elif cmd == 'help':
                print_help()
            
            elif cmd in ['presets', 'list']:
                list_presets()
            
            elif cmd == 'preset':
                if not args:
                    print(f"{Colors.RED}✗ Usage: preset <name>{Colors.END}")
                    continue
                preset_name = args[0]
                try:
                    synth.load_preset(preset_name)
                    current_preset = preset_name
                    print(f"\n{Colors.GREEN}✓ Loaded preset: {preset_name}{Colors.END}")
                    # Description will be shown in load_preset method
                    print(synth.get_patch_diagram())
                except KeyError:
                    print(f"{Colors.RED}✗ Unknown preset: {preset_name}{Colors.END}")
                    print(f"{Colors.YELLOW}Type 'presets' to see available options{Colors.END}")
            
            elif cmd == 'info':
                if current_preset:
                    print(f"\n{Colors.CYAN}Current Preset: {Colors.YELLOW}{current_preset}{Colors.END}")
                    print(synth.get_patch_diagram())
                else:
                    print(f"{Colors.YELLOW}No preset loaded{Colors.END}")
            
            elif cmd == 'clear':
                synth.patch_cables.clear()
                current_preset = None
                print(f"{Colors.GREEN}✓ All patches cleared{Colors.END}")
            
            elif cmd == 'patch':
                print(synth.get_patch_diagram())
            
            elif cmd == 'add':
                if len(args) < 2:
                    print(f"{Colors.RED}✗ Usage: add <source> <destination> [level]{Colors.END}")
                    continue
                source = args[0]
                dest = args[1]
                level = float(args[2]) if len(args) > 2 else 1.0
                
                src_point = PatchPoint(source.split('/')[0], source.split('/')[1], level)
                dst_point = PatchPoint(dest.split('/')[0], dest.split('/')[1])
                cable = PatchCable(src_point, dst_point, 'red')
                synth.patch_cables.append(cable)
                print(f"{Colors.GREEN}✓ Added patch: {source} → {dest} (Level: {level}){Colors.END}")
            
            elif cmd == 'remove':
                if len(args) < 2:
                    print(f"{Colors.RED}✗ Usage: remove <source> <destination>{Colors.END}")
                    continue
                # Remove matching cable
                source = args[0]
                dest = args[1]
                initial_count = len(synth.patch_cables)
                synth.patch_cables = [c for c in synth.patch_cables 
                                     if not (f"{c.source.module}/{c.source.output}" == source 
                                           and f"{c.destination.module}/{c.destination.output}" == dest)]
                if len(synth.patch_cables) < initial_count:
                    print(f"{Colors.GREEN}✓ Removed patch: {source} → {dest}{Colors.END}")
                else:
                    print(f"{Colors.YELLOW}⚠ No matching patch found{Colors.END}")
            
            elif cmd == 'vco1':
                if not args:
                    print(f"{Colors.RED}✗ Usage: vco1 <frequency> [waveform]{Colors.END}")
                    continue
                synth.vco1.frequency = float(args[0])
                if len(args) > 1:
                    synth.vco1.waveform = args[1]
                print(f"{Colors.GREEN}✓ VCO1: {synth.vco1.frequency}Hz, {synth.vco1.waveform}{Colors.END}")
            
            elif cmd == 'vco2':
                if not args:
                    print(f"{Colors.RED}✗ Usage: vco2 <frequency> [waveform]{Colors.END}")
                    continue
                synth.vco2.frequency = float(args[0])
                if len(args) > 1:
                    synth.vco2.waveform = args[1]
                print(f"{Colors.GREEN}✓ VCO2: {synth.vco2.frequency}Hz, {synth.vco2.waveform}{Colors.END}")
            
            elif cmd == 'lfo':
                if not args:
                    print(f"{Colors.RED}✗ Usage: lfo <rate>{Colors.END}")
                    continue
                synth.vco3.frequency = float(args[0])
                print(f"{Colors.GREEN}✓ LFO: {synth.vco3.frequency}Hz{Colors.END}")
            
            elif cmd == 'filter':
                if not args:
                    print(f"{Colors.RED}✗ Usage: filter <cutoff> [resonance]{Colors.END}")
                    continue
                synth.vcf.cutoff = float(args[0])
                if len(args) > 1:
                    synth.vcf.resonance = float(args[1])
                print(f"{Colors.GREEN}✓ Filter: {synth.vcf.cutoff}Hz, Q={synth.vcf.resonance}{Colors.END}")
            
            elif cmd == 'envelope':
                if len(args) < 4:
                    print(f"{Colors.RED}✗ Usage: envelope <attack> <decay> <sustain> <release>{Colors.END}")
                    continue
                synth.envelope.attack = float(args[0])
                synth.envelope.decay = float(args[1])
                synth.envelope.sustain = float(args[2])
                synth.envelope.release = float(args[3])
                print(f"{Colors.GREEN}✓ Envelope: A={synth.envelope.attack}s D={synth.envelope.decay}s S={synth.envelope.sustain} R={synth.envelope.release}s{Colors.END}")
            
            elif cmd == 'seq':
                if not args:
                    print(f"{Colors.RED}✗ Usage: seq <random|notes|tempo> ...{Colors.END}")
                    continue
                subcmd = args[0]
                if subcmd == 'random':
                    steps = int(args[1]) if len(args) > 1 else 16
                    synth.program_sequencer('random', steps)
                    print(f"{Colors.GREEN}✓ Programmed random pattern ({steps} steps){Colors.END}")
                elif subcmd == 'notes':
                    pattern = ' '.join(args[1:])
                    synth.program_sequencer(pattern)
                    print(f"{Colors.GREEN}✓ Programmed pattern: {pattern}{Colors.END}")
                elif subcmd == 'tempo':
                    if len(args) < 2:
                        print(f"{Colors.RED}✗ Usage: seq tempo <bpm>{Colors.END}")
                        continue
                    synth.sequencer_tempo = int(args[1])
                    print(f"{Colors.GREEN}✓ Tempo: {synth.sequencer_tempo} BPM{Colors.END}")
            
            elif cmd == 'export':
                if not args:
                    print(f"{Colors.RED}✗ Usage: export <midi|preset> <filename>{Colors.END}")
                    continue
                export_type = args[0]
                if export_type == 'midi':
                    if len(args) < 2:
                        print(f"{Colors.RED}✗ Usage: export midi <filename> [bars]{Colors.END}")
                        continue
                    filename = args[1]
                    bars = int(args[2]) if len(args) > 2 else 4
                    result = synth.export_to_midi(filename, bars)
                    print(f"{Colors.GREEN}✓ Exported MIDI to: {result}{Colors.END}")
                elif export_type == 'preset':
                    if len(args) < 2:
                        print(f"{Colors.RED}✗ Usage: export preset <filename>{Colors.END}")
                        continue
                    filename = args[1]
                    result = synth.export_preset(filename)
                    print(f"{Colors.GREEN}✓ Exported preset to: {result}{Colors.END}")
            
            elif cmd == 'history':
                print(f"\n{Colors.CYAN}Command History:{Colors.END}")
                for i, h in enumerate(history[-20:], 1):  # Show last 20 commands
                    print(f"  {Colors.YELLOW}{i:2d}{Colors.END}. {h}")
                print()
            
            else:
                print(f"{Colors.RED}✗ Unknown command: {cmd}{Colors.END}")
                print(f"{Colors.YELLOW}Type 'help' for available commands{Colors.END}")
        
        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}Use 'exit' to quit{Colors.END}")
            continue
        except EOFError:
            print(f"\n{Colors.YELLOW}👋 Goodbye!{Colors.END}\n")
            break
        except Exception as e:
            print(f"{Colors.RED}✗ Error: {e}{Colors.END}")
            continue


if __name__ == '__main__':
    # Check if interactive mode is requested
    if len(sys.argv) == 1 or (len(sys.argv) == 2 and sys.argv[1] in ['-i', '--interactive', 'interactive']):
        interactive_mode()
    else:
        main()
