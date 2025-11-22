#!/usr/bin/env python3
"""
Behringer 2600 Synthesizer CLI - Enhanced Version
Advanced command-line interface with rich features, better UX, and extended functionality
"""

import argparse
import json
import sys
import time
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict, field
from datetime import datetime
import mido
from midiutil import MIDIFile

# Try to import rich for enhanced terminal output
try:
    from rich.console import Console
    from rich.table import Table
    from rich.progress import track, Progress
    from rich.panel import Panel
    from rich.tree import Tree
    from rich.prompt import Prompt, Confirm
    from rich.syntax import Syntax
    from rich import print as rprint
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    print("⚠️  Install 'rich' for enhanced CLI experience: pip install rich")

# ANSI color codes for terminal output (fallback)
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

@dataclass
class PatchPoint:
    """Represents a patch point on the 2600"""
    module: str
    output: str
    level: float = 1.0
    
    def __str__(self):
        return f"{self.module}/{self.output}"

@dataclass
class PatchCable:
    """Represents a patch cable connection with enhanced metadata"""
    source: PatchPoint
    destination: PatchPoint
    color: str = "red"
    notes: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def __str__(self):
        return f"{self.source} → {self.destination} ({self.color})"

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
        half_steps = round(12 * (math.log2(self.frequency / c0)))
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
        """Get approximate note for cutoff frequency"""
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        a4 = 440.0
        c0 = a4 * pow(2, -4.75)
        half_steps = round(12 * (math.log2(self.cutoff / c0)))
        octave = half_steps // 12
        note_idx = half_steps % 12
        return f"{notes[note_idx]}{octave}"

@dataclass
class EnvelopeParams:
    """Enhanced ADSR Envelope parameters"""
    attack: float = 0.01
    decay: float = 0.2
    sustain: float = 0.7
    release: float = 0.3
    velocity_sensitivity: float = 0.5
    
    def total_time(self) -> float:
        """Calculate total envelope time"""
        return self.attack + self.decay + self.release
    
    def describe(self) -> str:
        """Describe envelope character"""
        if self.attack < 0.01 and self.release < 0.1:
            return "Plucky/Percussive"
        elif self.attack > 0.5:
            return "Pad/Slow"
        elif self.sustain < 0.3:
            return "Decaying"
        else:
            return "Sustained"

@dataclass
class LFOParams:
    """Enhanced LFO/VCO3 parameters"""
    rate: float = 2.0
    waveform: str = "sine"
    depth: float = 0.5
    sync: bool = False
    retrigger: bool = True

@dataclass
class SequencerStep:
    """Enhanced 16-step sequencer step"""
    pitch: float = 0.0
    gate: bool = True
    duration: float = 0.5
    cv1: float = 0.0
    cv2: float = 0.0
    velocity: float = 0.8
    probability: float = 1.0

class PresetManager:
    """Enhanced preset management system"""
    
    def __init__(self, preset_dir: str = "output/presets"):
        self.preset_dir = Path(preset_dir)
        self.preset_dir.mkdir(parents=True, exist_ok=True)
        self.library_file = self.preset_dir / "preset_library.json"
        self.presets = self.load_library()
    
    def load_library(self) -> Dict:
        """Load preset library"""
        if self.library_file.exists():
            with open(self.library_file) as f:
                return json.load(f)
        return {"version": "2.0", "presets": []}
    
    def save_library(self):
        """Save preset library"""
        with open(self.library_file, 'w') as f:
            json.dump(self.presets, f, indent=2)
    
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
        """Get all presets in a category"""
        return [p for p in self.presets.get('presets', [])
                if p.get('category', '').lower() == category.lower()]
    
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
            'version': self.presets.get('version', '1.0')
        }

class Synth2600Enhanced:
    """Enhanced synthesizer class with advanced features"""
    
    def __init__(self):
        # Patch matrix
        self.patch_cables: List[PatchCable] = []
        
        # Oscillators
        self.vco1 = OscillatorParams(frequency=440.0, waveform="sawtooth")
        self.vco2 = OscillatorParams(frequency=440.0, waveform="square")
        self.vco3 = LFOParams(rate=2.0, waveform="sine")
        
        # Filter
        self.vcf = FilterParams()
        
        # Envelopes
        self.env1 = EnvelopeParams()  # VCA envelope
        self.env2 = EnvelopeParams()  # Filter envelope
        
        # Sequencer
        self.sequencer_steps: List[SequencerStep] = [SequencerStep() for _ in range(16)]
        self.sequencer_tempo = 120
        self.sequencer_gate_length = 0.5
        
        # State
        self.current_preset_name = "Init"
        self.modification_count = 0
        self.preset_manager = PresetManager()
        
    def add_patch(self, source_module: str, source_output: str, 
                  dest_module: str, dest_output: str, color: str = "red", 
                  notes: str = "") -> PatchCable:
        """Add a patch cable with validation"""
        cable = PatchCable(
            source=PatchPoint(source_module, source_output),
            destination=PatchPoint(dest_module, dest_output),
            color=color,
            notes=notes
        )
        self.patch_cables.append(cable)
        self.modification_count += 1
        return cable
    
    def remove_patch(self, source: str, dest: str) -> bool:
        """Remove a patch cable"""
        initial_count = len(self.patch_cables)
        self.patch_cables = [c for c in self.patch_cables 
                            if not (str(c.source) == source and str(c.destination) == dest)]
        removed = len(self.patch_cables) < initial_count
        if removed:
            self.modification_count += 1
        return removed
    
    def clear_patches(self):
        """Remove all patch cables"""
        count = len(self.patch_cables)
        self.patch_cables = []
        self.modification_count += 1
        return count
    
    def get_patch_statistics(self) -> Dict:
        """Get patching statistics"""
        colors = {}
        modules_used = set()
        
        for cable in self.patch_cables:
            colors[cable.color] = colors.get(cable.color, 0) + 1
            modules_used.add(cable.source.module)
            modules_used.add(cable.destination.module)
        
        return {
            'total_cables': len(self.patch_cables),
            'colors': colors,
            'modules_used': list(modules_used),
            'complexity': len(modules_used)
        }
    
    def export_preset(self, name: str, category: str = "user", 
                     description: str = "", tags: List[str] = None) -> Dict:
        """Export current state as preset"""
        preset = {
            'name': name,
            'category': category,
            'description': description,
            'tags': tags or [],
            'patch_cables': [
                {
                    'source': {'module': c.source.module, 'output': c.source.output, 'level': c.source.level},
                    'destination': {'module': c.destination.module, 'output': c.destination.output, 'level': c.destination.level},
                    'color': c.color,
                    'notes': c.notes
                }
                for c in self.patch_cables
            ],
            'modules': {
                'VCO1': {'module_name': 'VCO1', 'parameters': asdict(self.vco1)},
                'VCO2': {'module_name': 'VCO2', 'parameters': asdict(self.vco2)},
                'VCF': {'module_name': 'VCF', 'parameters': asdict(self.vcf)}
            },
            'modulators': {
                'ENV1': asdict(self.env1),
                'ENV2': asdict(self.env2),
                'LFO': asdict(self.vco3)
            },
            'author': 'Synth2600 CLI Enhanced',
            'created_at': datetime.now().isoformat(),
            'version': '2.0'
        }
        return preset
    
    def load_preset(self, preset: Dict):
        """Load a preset"""
        # Clear current state
        self.patch_cables = []
        
        # Load patch cables
        for cable_data in preset.get('patch_cables', []):
            self.add_patch(
                cable_data['source']['module'],
                cable_data['source']['output'],
                cable_data['destination']['module'],
                cable_data['destination']['output'],
                cable_data.get('color', 'red'),
                cable_data.get('notes', '')
            )
        
        # Load module parameters
        modules = preset.get('modules', {})
        if 'VCO1' in modules:
            params = modules['VCO1']['parameters']
            self.vco1 = OscillatorParams(**{k: v for k, v in params.items() if k in OscillatorParams.__annotations__})
        
        if 'VCF' in modules:
            params = modules['VCF']['parameters']
            self.vcf = FilterParams(**{k: v for k, v in params.items() if k in FilterParams.__annotations__})
        
        # Load modulators
        modulators = preset.get('modulators', {})
        if 'ENV1' in modulators:
            self.env1 = EnvelopeParams(**{k: v for k, v in modulators['ENV1'].items() if k in EnvelopeParams.__annotations__})
        if 'ENV2' in modulators:
            self.env2 = EnvelopeParams(**{k: v for k, v in modulators['ENV2'].items() if k in EnvelopeParams.__annotations__})
        
        self.current_preset_name = preset.get('name', 'Unknown')
        self.modification_count = 0
    
    def export_to_midi(self, filename: str, bars: int = 4) -> str:
        """Export sequencer pattern to MIDI file"""
        output_dir = Path("output/midi")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        midi_file = MIDIFile(1)
        track = 0
        channel = 0
        time = 0
        
        midi_file.addTrackName(track, time, f"2600 Sequencer - {self.current_preset_name}")
        midi_file.addTempo(track, time, self.sequencer_tempo)
        
        step_duration = 60 / self.sequencer_tempo / 4  # 16th notes
        
        for bar in range(bars):
            for step_idx, step in enumerate(self.sequencer_steps):
                if step.gate and (step.probability >= 1.0 or random.random() < step.probability):
                    note = int(60 + step.pitch * 12)  # Map voltage to MIDI note
                    velocity = int(step.velocity * 127)
                    duration = step_duration * step.duration
                    
                    midi_file.addNote(track, channel, note, time, duration, velocity)
                
                time += step_duration
        
        output_file = output_dir / filename
        if not filename.endswith('.mid'):
            output_file = output_dir / f"{filename}.mid"
        
        with open(output_file, 'wb') as f:
            midi_file.writeFile(f)
        
        return str(output_file)


def print_banner():
    """Print CLI banner"""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║     🎹 Behringer 2600 Synthesizer CLI - Enhanced v2.0       ║
║                                                              ║
║     Advanced command-line interface for patching,           ║
║     sequencing, and sound design                            ║
╚══════════════════════════════════════════════════════════════╝
"""
    if RICH_AVAILABLE:
        console.print(Panel(banner, style="bold cyan"))
    else:
        print(f"{Colors.CYAN}{banner}{Colors.END}")


def print_help():
    """Print enhanced help information"""
    if RICH_AVAILABLE:
        table = Table(title="📚 Available Commands", show_header=True, header_style="bold magenta")
        table.add_column("Command", style="cyan", no_wrap=True)
        table.add_column("Description", style="white")
        table.add_column("Example", style="yellow")
        
        commands = [
            ("help", "Show this help message", "help"),
            ("info", "Show current synth state", "info"),
            ("list", "List all patch cables", "list"),
            ("stats", "Show patching statistics", "stats"),
            ("", "", ""),
            ("patch", "Add a patch cable", "patch VCO1/SAW VCF/IN red"),
            ("remove", "Remove a patch cable", "remove VCO1/SAW VCF/IN"),
            ("clear", "Clear all patches", "clear"),
            ("", "", ""),
            ("vco1", "Set VCO1 parameters", "vco1 440 sawtooth"),
            ("vco2", "Set VCO2 parameters", "vco2 880 square"),
            ("lfo", "Set LFO rate", "lfo 5"),
            ("filter", "Set filter parameters", "filter 1000 0.7"),
            ("envelope", "Set ADSR envelope", "envelope 0.01 0.2 0.7 0.3"),
            ("", "", ""),
            ("preset load", "Load a preset", "preset load 'Bass - Deep 808'"),
            ("preset save", "Save current state", "preset save MyPatch bass"),
            ("preset list", "List all presets", "preset list"),
            ("preset search", "Search presets", "preset search acid"),
            ("preset stats", "Preset library stats", "preset stats"),
            ("", "", ""),
            ("export midi", "Export to MIDI", "export midi output.mid 4"),
            ("export preset", "Export preset JSON", "export preset mypreset.json"),
            ("import", "Import preset file", "import mypreset.json"),
            ("", "", ""),
            ("history", "Show command history", "history"),
            ("exit", "Exit the CLI", "exit"),
        ]
        
        for cmd, desc, example in commands:
            table.add_row(cmd, desc, example)
        
        console.print(table)
    else:
        print(f"\n{Colors.BOLD}📚 Available Commands:{Colors.END}\n")
        print(f"{Colors.CYAN}General:{Colors.END}")
        print(f"  help           - Show this help message")
        print(f"  info           - Show current synth state")
        print(f"  list           - List all patch cables")
        print(f"  stats          - Show patching statistics")
        print(f"\n{Colors.CYAN}Patching:{Colors.END}")
        print(f"  patch <src> <dst> [color] - Add patch cable")
        print(f"  remove <src> <dst>        - Remove patch cable")
        print(f"  clear                     - Clear all patches")
        print(f"\n{Colors.CYAN}Parameters:{Colors.END}")
        print(f"  vco1 <freq> [wave]        - Set VCO1")
        print(f"  filter <cutoff> [res]     - Set filter")
        print(f"  envelope <A D S R>        - Set ADSR")
        print(f"\n{Colors.CYAN}Presets:{Colors.END}")
        print(f"  preset load <name>        - Load preset")
        print(f"  preset save <name>        - Save preset")
        print(f"  preset list               - List presets")
        print(f"  preset search <query>     - Search presets")
        print(f"\n{Colors.CYAN}Export:{Colors.END}")
        print(f"  export midi <file> [bars] - Export MIDI")
        print(f"  export preset <file>      - Export JSON")
        print()


def interactive_mode_enhanced():
    """Enhanced interactive mode with rich features"""
    print_banner()
    print()
    
    synth = Synth2600Enhanced()
    history = []
    
    # Welcome message
    if RICH_AVAILABLE:
        console.print("[bold green]✓ Synthesizer initialized[/bold green]")
        console.print("[yellow]Type 'help' for available commands, 'exit' to quit[/yellow]\n")
    else:
        print(f"{Colors.GREEN}✓ Synthesizer initialized{Colors.END}")
        print(f"{Colors.YELLOW}Type 'help' for available commands, 'exit' to quit{Colors.END}\n")
    
    while True:
        try:
            # Show modified indicator
            modified = " [modified]" if synth.modification_count > 0 else ""
            prompt_text = f"2600:{synth.current_preset_name}{modified} > "
            
            if RICH_AVAILABLE:
                user_input = Prompt.ask(f"[bold cyan]{prompt_text}[/bold cyan]").strip()
            else:
                user_input = input(f"{Colors.CYAN}{prompt_text}{Colors.END}").strip()
            
            if not user_input:
                continue
            
            history.append(user_input)
            parts = user_input.split()
            cmd = parts[0].lower()
            args = parts[1:]
            
            # Command routing
            if cmd == 'exit' or cmd == 'quit':
                if synth.modification_count > 0:
                    if RICH_AVAILABLE:
                        if not Confirm.ask("[yellow]You have unsaved changes. Exit anyway?[/yellow]"):
                            continue
                    else:
                        response = input(f"{Colors.YELLOW}You have unsaved changes. Exit anyway? (y/n): {Colors.END}")
                        if response.lower() not in ['y', 'yes']:
                            continue
                
                if RICH_AVAILABLE:
                    console.print("\n[bold yellow]👋 Goodbye![/bold yellow]\n")
                else:
                    print(f"\n{Colors.YELLOW}👋 Goodbye!{Colors.END}\n")
                break
            
            elif cmd == 'help':
                print_help()
            
            elif cmd == 'info':
                display_synth_info(synth)
            
            elif cmd == 'list':
                display_patch_list(synth)
            
            elif cmd == 'stats':
                display_statistics(synth)
            
            elif cmd == 'patch':
                handle_patch_command(synth, args)
            
            elif cmd == 'remove':
                handle_remove_command(synth, args)
            
            elif cmd == 'clear':
                handle_clear_command(synth)
            
            elif cmd == 'vco1':
                handle_vco_command(synth, 1, args)
            
            elif cmd == 'vco2':
                handle_vco_command(synth, 2, args)
            
            elif cmd == 'lfo':
                handle_lfo_command(synth, args)
            
            elif cmd == 'filter':
                handle_filter_command(synth, args)
            
            elif cmd == 'envelope':
                handle_envelope_command(synth, args)
            
            elif cmd == 'preset':
                handle_preset_command(synth, args)
            
            elif cmd == 'export':
                handle_export_command(synth, args)
            
            elif cmd == 'import':
                handle_import_command(synth, args)
            
            elif cmd == 'history':
                display_history(history)
            
            else:
                if RICH_AVAILABLE:
                    console.print(f"[red]✗ Unknown command: {cmd}[/red]")
                    console.print("[yellow]Type 'help' for available commands[/yellow]")
                else:
                    print(f"{Colors.RED}✗ Unknown command: {cmd}{Colors.END}")
                    print(f"{Colors.YELLOW}Type 'help' for available commands{Colors.END}")
        
        except KeyboardInterrupt:
            if RICH_AVAILABLE:
                console.print("\n[yellow]Use 'exit' to quit[/yellow]")
            else:
                print(f"\n{Colors.YELLOW}Use 'exit' to quit{Colors.END}")
            continue
        except EOFError:
            break
        except Exception as e:
            if RICH_AVAILABLE:
                console.print(f"[red]✗ Error: {e}[/red]")
            else:
                print(f"{Colors.RED}✗ Error: {e}{Colors.END}")


# Command handlers
def display_synth_info(synth: Synth2600Enhanced):
    """Display current synthesizer state"""
    if RICH_AVAILABLE:
        table = Table(title="🎛️  Current Synth State", show_header=True)
        table.add_column("Module", style="cyan")
        table.add_column("Parameters", style="white")
        
        table.add_row("Preset", synth.current_preset_name + (" [modified]" if synth.modification_count > 0 else ""))
        table.add_row("VCO1", f"{synth.vco1.frequency}Hz, {synth.vco1.waveform}")
        table.add_row("VCO2", f"{synth.vco2.frequency}Hz, {synth.vco2.waveform}")
        table.add_row("VCF", f"Cutoff: {synth.vcf.cutoff}Hz, Resonance: {synth.vcf.resonance:.2f}, Type: {synth.vcf.filter_type}")
        table.add_row("ENV1", f"A:{synth.env1.attack}s D:{synth.env1.decay}s S:{synth.env1.sustain} R:{synth.env1.release}s - {synth.env1.describe()}")
        table.add_row("Patches", f"{len(synth.patch_cables)} cables connected")
        
        console.print(table)
    else:
        print(f"\n{Colors.BOLD}🎛️  Current Synth State:{Colors.END}")
        print(f"{Colors.CYAN}Preset:{Colors.END} {synth.current_preset_name}")
        print(f"{Colors.CYAN}VCO1:{Colors.END} {synth.vco1.frequency}Hz, {synth.vco1.waveform}")
        print(f"{Colors.CYAN}VCF:{Colors.END} Cutoff: {synth.vcf.cutoff}Hz, Res: {synth.vcf.resonance:.2f}")
        print(f"{Colors.CYAN}ENV1:{Colors.END} A:{synth.env1.attack}s D:{synth.env1.decay}s S:{synth.env1.sustain} R:{synth.env1.release}s")
        print(f"{Colors.CYAN}Patches:{Colors.END} {len(synth.patch_cables)} cables\n")


def display_patch_list(synth: Synth2600Enhanced):
    """Display all patch cables"""
    if not synth.patch_cables:
        if RICH_AVAILABLE:
            console.print("[yellow]No patch cables connected[/yellow]")
        else:
            print(f"{Colors.YELLOW}No patch cables connected{Colors.END}")
        return
    
    if RICH_AVAILABLE:
        table = Table(title="🔌 Patch Cables", show_header=True)
        table.add_column("#", style="dim")
        table.add_column("Source", style="cyan")
        table.add_column("→", style="yellow")
        table.add_column("Destination", style="magenta")
        table.add_column("Color", style="white")
        
        for i, cable in enumerate(synth.patch_cables, 1):
            table.add_row(str(i), str(cable.source), "→", str(cable.destination), cable.color)
        
        console.print(table)
    else:
        print(f"\n{Colors.BOLD}🔌 Patch Cables:{Colors.END}")
        for i, cable in enumerate(synth.patch_cables, 1):
            print(f"  {i:2d}. {cable.source} → {cable.destination} ({cable.color})")
        print()


def display_statistics(synth: Synth2600Enhanced):
    """Display patching statistics"""
    stats = synth.get_patch_statistics()
    
    if RICH_AVAILABLE:
        console.print(Panel(f"""
[bold]Total Cables:[/bold] {stats['total_cables']}
[bold]Modules Used:[/bold] {stats['complexity']} modules
[bold]Complexity:[/bold] {'Simple' if stats['complexity'] < 5 else 'Medium' if stats['complexity'] < 8 else 'Complex'}

[bold]Cable Colors:[/bold]
""" + "\n".join([f"  • {color}: {count}" for color, count in stats['colors'].items()]), 
                         title="📊 Patch Statistics", style="cyan"))
    else:
        print(f"\n{Colors.BOLD}📊 Patch Statistics:{Colors.END}")
        print(f"Total Cables: {stats['total_cables']}")
        print(f"Modules Used: {stats['complexity']}")
        print(f"Cable Colors: {stats['colors']}\n")


def handle_patch_command(synth: Synth2600Enhanced, args: List[str]):
    """Handle patch command"""
    if len(args) < 2:
        print_error("Usage: patch <source> <destination> [color]")
        return
    
    source = args[0]
    dest = args[1]
    color = args[2] if len(args) > 2 else "red"
    
    cable = synth.add_patch(
        source.split('/')[0], source.split('/')[1] if '/' in source else 'OUT',
        dest.split('/')[0], dest.split('/')[1] if '/' in dest else 'IN',
        color
    )
    
    print_success(f"Added patch: {cable}")


def handle_remove_command(synth: Synth2600Enhanced, args: List[str]):
    """Handle remove command"""
    if len(args) < 2:
        print_error("Usage: remove <source> <destination>")
        return
    
    if synth.remove_patch(args[0], args[1]):
        print_success(f"Removed patch: {args[0]} → {args[1]}")
    else:
        print_warning("No matching patch found")


def handle_clear_command(synth: Synth2600Enhanced):
    """Handle clear command"""
    count = synth.clear_patches()
    print_success(f"Cleared {count} patch cables")


def handle_vco_command(synth: Synth2600Enhanced, vco_num: int, args: List[str]):
    """Handle VCO command"""
    if not args:
        print_error(f"Usage: vco{vco_num} <frequency> [waveform]")
        return
    
    vco = synth.vco1 if vco_num == 1 else synth.vco2
    vco.frequency = float(args[0])
    if len(args) > 1:
        vco.waveform = args[1]
    
    print_success(f"VCO{vco_num}: {vco.frequency}Hz, {vco.waveform}")
    synth.modification_count += 1


def handle_lfo_command(synth: Synth2600Enhanced, args: List[str]):
    """Handle LFO command"""
    if not args:
        print_error("Usage: lfo <rate> [waveform]")
        return
    
    synth.vco3.rate = float(args[0])
    if len(args) > 1:
        synth.vco3.waveform = args[1]
    
    print_success(f"LFO: {synth.vco3.rate}Hz, {synth.vco3.waveform}")
    synth.modification_count += 1


def handle_filter_command(synth: Synth2600Enhanced, args: List[str]):
    """Handle filter command"""
    if not args:
        print_error("Usage: filter <cutoff> [resonance] [type]")
        return
    
    synth.vcf.cutoff = float(args[0])
    if len(args) > 1:
        synth.vcf.resonance = float(args[1])
    if len(args) > 2:
        synth.vcf.filter_type = args[2]
    
    print_success(f"Filter: {synth.vcf.cutoff}Hz, Q={synth.vcf.resonance:.2f}, {synth.vcf.filter_type}")
    synth.modification_count += 1


def handle_envelope_command(synth: Synth2600Enhanced, args: List[str]):
    """Handle envelope command"""
    if len(args) < 4:
        print_error("Usage: envelope <attack> <decay> <sustain> <release>")
        return
    
    synth.env1.attack = float(args[0])
    synth.env1.decay = float(args[1])
    synth.env1.sustain = float(args[2])
    synth.env1.release = float(args[3])
    
    print_success(f"Envelope: A={synth.env1.attack}s D={synth.env1.decay}s S={synth.env1.sustain} R={synth.env1.release}s - {synth.env1.describe()}")
    synth.modification_count += 1


def handle_preset_command(synth: Synth2600Enhanced, args: List[str]):
    """Handle preset command"""
    if not args:
        print_error("Usage: preset <load|save|list|search|stats> [args]")
        return
    
    subcmd = args[0].lower()
    
    if subcmd == 'load':
        if len(args) < 2:
            print_error("Usage: preset load <name>")
            return
        
        preset_name = ' '.join(args[1:])
        # Search for preset
        results = synth.preset_manager.search_presets(preset_name)
        if results:
            synth.load_preset(results[0])
            print_success(f"Loaded preset: {results[0]['name']}")
        else:
            print_error(f"Preset not found: {preset_name}")
    
    elif subcmd == 'save':
        if len(args) < 2:
            print_error("Usage: preset save <name> [category] [description]")
            return
        
        name = args[1]
        category = args[2] if len(args) > 2 else "user"
        description = ' '.join(args[3:]) if len(args) > 3 else ""
        
        preset = synth.export_preset(name, category, description)
        # Add to library
        synth.preset_manager.presets.setdefault('presets', []).append(preset)
        synth.preset_manager.save_library()
        print_success(f"Saved preset: {name}")
        synth.modification_count = 0
    
    elif subcmd == 'list':
        category = args[1] if len(args) > 1 else None
        if category:
            presets = synth.preset_manager.get_by_category(category)
        else:
            presets = synth.preset_manager.presets.get('presets', [])
        
        if RICH_AVAILABLE:
            table = Table(title=f"🎹 Presets" + (f" - {category}" if category else ""))
            table.add_column("#", style="dim")
            table.add_column("Name", style="cyan")
            table.add_column("Category", style="yellow")
            table.add_column("Tags", style="magenta")
            
            for i, preset in enumerate(presets[:50], 1):  # Show first 50
                tags = ", ".join(preset.get('tags', [])[:3])
                table.add_row(str(i), preset['name'], preset.get('category', ''), tags)
            
            console.print(table)
            if len(presets) > 50:
                console.print(f"[yellow]... and {len(presets) - 50} more[/yellow]")
        else:
            print(f"\n{Colors.BOLD}Presets:{Colors.END}")
            for i, preset in enumerate(presets[:50], 1):
                print(f"  {i:2d}. {preset['name']} ({preset.get('category', 'user')})")
            if len(presets) > 50:
                print(f"  ... and {len(presets) - 50} more")
            print()
    
    elif subcmd == 'search':
        if len(args) < 2:
            print_error("Usage: preset search <query>")
            return
        
        query = ' '.join(args[1:])
        results = synth.preset_manager.search_presets(query)
        
        if results:
            print_success(f"Found {len(results)} presets matching '{query}':")
            for i, preset in enumerate(results[:20], 1):
                print(f"  {i}. {preset['name']} ({preset.get('category', '')})")
        else:
            print_warning(f"No presets found matching '{query}'")
    
    elif subcmd == 'stats':
        stats = synth.preset_manager.get_statistics()
        
        if RICH_AVAILABLE:
            console.print(Panel(f"""
[bold]Total Presets:[/bold] {stats['total']}
[bold]Version:[/bold] {stats['version']}

[bold]Categories:[/bold]
""" + "\n".join([f"  • {cat}: {count} presets" for cat, count in sorted(stats['categories'].items())]),
                             title="📊 Preset Library Statistics", style="green"))
        else:
            print(f"\n{Colors.BOLD}Preset Library Statistics:{Colors.END}")
            print(f"Total: {stats['total']} presets")
            print(f"Categories:")
            for cat, count in sorted(stats['categories'].items()):
                print(f"  {cat}: {count}")
            print()


def handle_export_command(synth: Synth2600Enhanced, args: List[str]):
    """Handle export command"""
    if not args:
        print_error("Usage: export <midi|preset> <filename> [args]")
        return
    
    export_type = args[0].lower()
    
    if export_type == 'midi':
        if len(args) < 2:
            print_error("Usage: export midi <filename> [bars]")
            return
        
        filename = args[1]
        bars = int(args[2]) if len(args) > 2 else 4
        
        try:
            result = synth.export_to_midi(filename, bars)
            print_success(f"Exported MIDI to: {result}")
        except Exception as e:
            print_error(f"MIDI export failed: {e}")
    
    elif export_type == 'preset':
        if len(args) < 2:
            print_error("Usage: export preset <filename>")
            return
        
        filename = args[1]
        preset = synth.export_preset(synth.current_preset_name)
        
        output_dir = Path("output/presets")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = output_dir / filename
        
        with open(output_file, 'w') as f:
            json.dump(preset, f, indent=2)
        
        print_success(f"Exported preset to: {output_file}")


def handle_import_command(synth: Synth2600Enhanced, args: List[str]):
    """Handle import command"""
    if not args:
        print_error("Usage: import <filename>")
        return
    
    filename = args[0]
    try:
        with open(filename) as f:
            preset = json.load(f)
        
        synth.load_preset(preset)
        print_success(f"Imported preset: {preset.get('name', filename)}")
    except Exception as e:
        print_error(f"Import failed: {e}")


def display_history(history: List[str]):
    """Display command history"""
    if RICH_AVAILABLE:
        console.print("\n[bold cyan]Command History:[/bold cyan]")
        for i, cmd in enumerate(history[-20:], 1):
            console.print(f"  [yellow]{i:2d}[/yellow]. {cmd}")
        console.print()
    else:
        print(f"\n{Colors.CYAN}Command History:{Colors.END}")
        for i, cmd in enumerate(history[-20:], 1):
            print(f"  {Colors.YELLOW}{i:2d}{Colors.END}. {cmd}")
        print()


# Utility functions for output
def print_success(message: str):
    if RICH_AVAILABLE:
        console.print(f"[green]✓ {message}[/green]")
    else:
        print(f"{Colors.GREEN}✓ {message}{Colors.END}")


def print_error(message: str):
    if RICH_AVAILABLE:
        console.print(f"[red]✗ {message}[/red]")
    else:
        print(f"{Colors.RED}✗ {message}{Colors.END}")


def print_warning(message: str):
    if RICH_AVAILABLE:
        console.print(f"[yellow]⚠ {message}[/yellow]")
    else:
        print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Behringer 2600 Synthesizer CLI - Enhanced',
        epilog='For interactive mode, run without arguments or with -i/--interactive'
    )
    parser.add_argument('-i', '--interactive', action='store_true', 
                       help='Start interactive mode')
    parser.add_argument('-v', '--version', action='version', version='2.0')
    
    args = parser.parse_args()
    
    if args.interactive or len(sys.argv) == 1:
        interactive_mode_enhanced()
    else:
        parser.print_help()


if __name__ == '__main__':
    # Add missing import
    import math
    import random
    main()
