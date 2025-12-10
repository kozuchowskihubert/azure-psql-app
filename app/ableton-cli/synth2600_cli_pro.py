#!/usr/bin/env python3
"""
Behringer 2600 Synthesizer CLI - Professional Edition v3.0
Production-ready command-line interface with advanced features
"""

import argparse
import json
import sys
import time
import os
import readline
import atexit
import shutil
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict, field
from datetime import datetime
from collections import deque
import math

# Try to import rich for enhanced terminal output
try:
    from rich.console import Console
    from rich.table import Table
    from rich.progress import track, Progress, SpinnerColumn, TextColumn, BarColumn
    from rich.panel import Panel
    from rich.tree import Tree
    from rich.prompt import Prompt, Confirm, IntPrompt
    from rich.syntax import Syntax
    from rich.layout import Layout
    from rich.live import Live
    from rich.text import Text
    from rich.style import Style
    from rich import box
    from rich import print as rprint
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    print("⚠️  Install 'rich' for enhanced CLI experience: pip install rich>=13.0.0")

try:
    import mido
    from midiutil import MIDIFile
    MIDI_AVAILABLE = True
except ImportError:
    MIDI_AVAILABLE = False
    print("⚠️  Install MIDI libraries: pip install mido midiutil")

# ============================================================================
# CONFIGURATION AND CONSTANTS
# ============================================================================

VERSION = "3.0.0"
APP_NAME = "Behringer 2600 CLI Pro"
CONFIG_DIR = Path.home() / ".synth2600"
HISTORY_FILE = CONFIG_DIR / ".history"
CONFIG_FILE = CONFIG_DIR / "config.json"
SESSION_FILE = CONFIG_DIR / "last_session.json"
MAX_HISTORY = 1000

# ANSI color codes for terminal output (fallback when rich not available)
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    MAGENTA = '\033[95m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

console = Console() if RICH_AVAILABLE else None

# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class PatchPoint:
    """Represents a patch point on the 2600"""
    module: str
    output: str
    level: float = 1.0
    
    def __str__(self):
        return f"{self.module}/{self.output}"
    
    def __repr__(self):
        return f"PatchPoint({self.module}, {self.output}, {self.level})"

@dataclass
class PatchCable:
    """Represents a patch cable connection with enhanced metadata"""
    source: PatchPoint
    destination: PatchPoint
    color: str = "red"
    notes: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    id: str = field(default_factory=lambda: datetime.now().strftime("%Y%m%d%H%M%S%f"))
    
    def __str__(self):
        return f"{self.source} → {self.destination} ({self.color})"
    
    def to_dict(self):
        return {
            'source': {'module': self.source.module, 'output': self.source.output, 'level': self.source.level},
            'destination': {'module': self.destination.module, 'output': self.destination.output, 'level': self.destination.level},
            'color': self.color,
            'notes': self.notes,
            'created_at': self.created_at,
            'id': self.id
        }

@dataclass
class OscillatorParams:
    """Enhanced VCO parameters"""
    frequency: float = 440.0
    waveform: str = "sawtooth"
    pulse_width: float = 0.5
    fine_tune: float = 0.0
    sync: bool = False
    octave: int = 0
    
    def get_note_name(self) -> str:
        """Convert frequency to note name"""
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        a4 = 440.0
        c0 = a4 * pow(2, -4.75)
        half_steps = round(12 * math.log2(self.frequency / c0))
        octave = half_steps // 12
        note_idx = half_steps % 12
        return f"{notes[note_idx]}{octave}"

@dataclass
class FilterParams:
    """Enhanced VCF parameters"""
    cutoff: float = 1000.0
    resonance: float = 0.5
    filter_type: str = "lowpass"
    keyboard_tracking: float = 0.0
    envelope_amount: float = 0.5
    
    def get_cutoff_note(self) -> str:
        """Convert cutoff to note name"""
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        a4 = 440.0
        c0 = a4 * pow(2, -4.75)
        half_steps = round(12 * math.log2(self.cutoff / c0))
        octave = half_steps // 12
        note_idx = half_steps % 12
        return f"{notes[note_idx]}{octave}"

@dataclass
class EnvelopeParams:
    """Enhanced envelope parameters"""
    attack: float = 0.01
    decay: float = 0.1
    sustain: float = 0.7
    release: float = 0.3
    velocity_sensitivity: float = 0.5
    
    def describe(self) -> str:
        """Get envelope character description"""
        if self.attack < 0.02 and self.release < 0.1:
            return "Plucky"
        elif self.attack > 0.5 and self.release > 1.0:
            return "Pad"
        elif self.decay < 0.05 and self.sustain < 0.3:
            return "Decaying"
        else:
            return "Sustained"

@dataclass
class LFOParams:
    """LFO parameters"""
    rate: float = 5.0
    waveform: str = "sine"
    depth: float = 500.0
    sync: bool = False
    
@dataclass
class SequencerStep:
    """Sequencer step data"""
    pitch: int = 60  # MIDI note
    velocity: int = 100
    gate: bool = True
    length: float = 1.0
    probability: float = 1.0

# ============================================================================
# CONFIGURATION MANAGER
# ============================================================================

class ConfigManager:
    """Manage CLI configuration and preferences"""
    
    def __init__(self):
        self.config_dir = CONFIG_DIR
        self.config_file = CONFIG_FILE
        self.config = self.load_config()
        
        # Ensure config directory exists
        self.config_dir.mkdir(parents=True, exist_ok=True)
    
    def load_config(self) -> Dict:
        """Load configuration from file"""
        default_config = {
            'theme': 'dark',
            'auto_save': True,
            'save_interval': 300,  # seconds
            'default_output_dir': str(Path.home() / 'Music/Synth2600'),
            'midi_output_device': None,
            'show_hints': True,
            'compact_mode': False,
            'color_scheme': 'default',
            'history_size': 1000,
            'auto_backup': True,
            'backup_count': 5,
        }
        
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    loaded = json.load(f)
                    default_config.update(loaded)
            except Exception as e:
                print(f"⚠️  Error loading config: {e}")
        
        return default_config
    
    def save_config(self):
        """Save configuration to file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            print(f"❌ Error saving config: {e}")
    
    def get(self, key: str, default=None):
        """Get configuration value"""
        return self.config.get(key, default)
    
    def set(self, key: str, value: Any):
        """Set configuration value"""
        self.config[key] = value
        self.save_config()

# ============================================================================
# SESSION MANAGER
# ============================================================================

class SessionManager:
    """Manage CLI sessions for recovery and persistence"""
    
    def __init__(self, config: ConfigManager):
        self.config = config
        self.session_file = SESSION_FILE
        self.session_data = {}
        self.auto_save_enabled = config.get('auto_save', True)
        self.last_save_time = time.time()
        self.save_interval = config.get('save_interval', 300)
    
    def save_session(self, synth_state: Dict):
        """Save current session"""
        self.session_data = {
            'timestamp': datetime.now().isoformat(),
            'version': VERSION,
            'synth_state': synth_state,
        }
        
        try:
            with open(self.session_file, 'w') as f:
                json.dump(self.session_data, f, indent=2)
            self.last_save_time = time.time()
        except Exception as e:
            print(f"❌ Error saving session: {e}")
    
    def load_session(self) -> Optional[Dict]:
        """Load last session"""
        if not self.session_file.exists():
            return None
        
        try:
            with open(self.session_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading session: {e}")
            return None
    
    def should_auto_save(self) -> bool:
        """Check if auto-save should trigger"""
        if not self.auto_save_enabled:
            return False
        return (time.time() - self.last_save_time) >= self.save_interval

# ============================================================================
# COMMAND HISTORY MANAGER
# ============================================================================

class HistoryManager:
    """Manage command history with persistence"""
    
    def __init__(self, max_history: int = MAX_HISTORY):
        self.history_file = HISTORY_FILE
        self.max_history = max_history
        self.history = deque(maxlen=max_history)
        self.load_history()
        
        # Set up readline for command history
        if 'libedit' in readline.__doc__:
            readline.parse_and_bind("bind ^I rl_complete")
        else:
            readline.parse_and_bind("tab: complete")
        
        # Load history into readline
        if self.history_file.exists():
            try:
                readline.read_history_file(str(self.history_file))
            except:
                pass
        
        # Save history on exit
        atexit.register(self.save_history)
    
    def load_history(self):
        """Load command history from file"""
        if not self.history_file.exists():
            return
        
        try:
            with open(self.history_file, 'r') as f:
                for line in f:
                    self.history.append(line.strip())
        except Exception as e:
            print(f"⚠️  Error loading history: {e}")
    
    def save_history(self):
        """Save command history to file"""
        try:
            CONFIG_DIR.mkdir(parents=True, exist_ok=True)
            readline.set_history_length(self.max_history)
            readline.write_history_file(str(self.history_file))
        except Exception as e:
            print(f"⚠️  Error saving history: {e}")
    
    def add_command(self, command: str):
        """Add command to history"""
        if command.strip():
            self.history.append(command)
            readline.add_history(command)
    
    def search_history(self, query: str) -> List[str]:
        """Search command history"""
        return [cmd for cmd in self.history if query.lower() in cmd.lower()]
    
    def get_recent(self, count: int = 10) -> List[str]:
        """Get recent commands"""
        return list(self.history)[-count:]

# ============================================================================
# ENHANCED PRESET MANAGER
# ============================================================================

class PresetManager:
    """Manage presets with enhanced features"""
    
    def __init__(self, preset_file: str = None):
        if preset_file is None:
            # Look for presets in multiple locations
            possible_paths = [
                Path(__file__).parent / "presets.json",
                Path.cwd() / "presets.json",
                Path.home() / ".synth2600/presets.json"
            ]
            
            for path in possible_paths:
                if path.exists():
                    preset_file = str(path)
                    break
        
        self.preset_file = preset_file
        self.presets = self.load_library()
        self.favorites = set()
        self.load_favorites()
    
    def load_library(self) -> Dict:
        """Load preset library"""
        if not self.preset_file or not Path(self.preset_file).exists():
            return {'presets': [], 'version': '1.0'}
        
        try:
            with open(self.preset_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading presets: {e}")
            return {'presets': [], 'version': '1.0'}
    
    def save_library(self):
        """Save preset library"""
        if not self.preset_file:
            return
        
        try:
            with open(self.preset_file, 'w') as f:
                json.dump(self.presets, f, indent=2)
        except Exception as e:
            print(f"❌ Error saving presets: {e}")
    
    def load_favorites(self):
        """Load favorite presets"""
        fav_file = CONFIG_DIR / "favorites.json"
        if fav_file.exists():
            try:
                with open(fav_file, 'r') as f:
                    self.favorites = set(json.load(f))
            except:
                pass
    
    def save_favorites(self):
        """Save favorite presets"""
        fav_file = CONFIG_DIR / "favorites.json"
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        try:
            with open(fav_file, 'w') as f:
                json.dump(list(self.favorites), f, indent=2)
        except Exception as e:
            print(f"❌ Error saving favorites: {e}")
    
    def add_favorite(self, preset_name: str):
        """Add preset to favorites"""
        self.favorites.add(preset_name)
        self.save_favorites()
    
    def remove_favorite(self, preset_name: str):
        """Remove preset from favorites"""
        self.favorites.discard(preset_name)
        self.save_favorites()
    
    def is_favorite(self, preset_name: str) -> bool:
        """Check if preset is favorite"""
        return preset_name in self.favorites
    
    def search_presets(self, query: str) -> List[Dict]:
        """Search presets by name, category, or tags"""
        query = query.lower()
        results = []
        
        for preset in self.presets.get('presets', []):
            if (query in preset.get('name', '').lower() or
                query in preset.get('category', '').lower() or
                any(query in tag.lower() for tag in preset.get('tags', []))):
                results.append(preset)
        
        return results
    
    def get_by_category(self, category: str) -> List[Dict]:
        """Get presets by category"""
        return [p for p in self.presets.get('presets', []) 
                if p.get('category', '').lower() == category.lower()]
    
    def get_favorites(self) -> List[Dict]:
        """Get favorite presets"""
        return [p for p in self.presets.get('presets', []) 
                if p.get('name') in self.favorites]
    
    def get_statistics(self) -> Dict:
        """Get preset library statistics"""
        presets = self.presets.get('presets', [])
        categories = {}
        tags = {}
        
        for preset in presets:
            cat = preset.get('category', 'uncategorized')
            categories[cat] = categories.get(cat, 0) + 1
            
            for tag in preset.get('tags', []):
                tags[tag] = tags.get(tag, 0) + 1
        
        return {
            'total': len(presets),
            'categories': categories,
            'tags': tags,
            'favorites': len(self.favorites),
            'version': self.presets.get('version', '1.0')
        }
    
    def add_preset(self, preset: Dict):
        """Add new preset to library"""
        if 'presets' not in self.presets:
            self.presets['presets'] = []
        
        # Check for duplicate names
        existing = [p for p in self.presets['presets'] if p.get('name') == preset.get('name')]
        if existing:
            # Update existing
            idx = self.presets['presets'].index(existing[0])
            self.presets['presets'][idx] = preset
        else:
            # Add new
            self.presets['presets'].append(preset)
        
        self.save_library()
    
    def delete_preset(self, name: str) -> bool:
        """Delete preset from library"""
        initial_count = len(self.presets.get('presets', []))
        self.presets['presets'] = [p for p in self.presets.get('presets', []) 
                                   if p.get('name') != name]
        deleted = len(self.presets['presets']) < initial_count
        if deleted:
            self.save_library()
            self.remove_favorite(name)
        return deleted

# Continue in next message...
