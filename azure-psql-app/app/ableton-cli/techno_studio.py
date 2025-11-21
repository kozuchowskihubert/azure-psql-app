#!/usr/bin/env python3
"""
🎹 TECHNO STUDIO - Ableton Live Automation CLI
===============================================
A comprehensive automation tool for generating techno tracks in Ableton Live.

Features:
- Generate MIDI patterns for various techno subgenres
- Create Ableton Live project templates
- Automate VST3 plugin loading
- Complete workflow automation
"""

import sys
import os
import argparse
from pathlib import Path
from typing import Optional

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from generators.midi_generator import DeepTechnoMIDIGenerator
from generators.template_generator import AbletonTemplateGenerator
from automation.vst_automation import AbletonAutomation, DeepTechnoSetup


class TechnoStudio:
    """Main CLI application for Techno Studio"""
    
    VERSION = "2.0.0"
    
    def __init__(self):
        self.output_dir = Path("output")
        self.midi_dir = self.output_dir / "MIDI-Files"
        self.project_dir = self.output_dir / "Projects"
        
        # Create output directories
        self.output_dir.mkdir(exist_ok=True)
        self.midi_dir.mkdir(exist_ok=True)
        self.project_dir.mkdir(exist_ok=True)
    
    def print_banner(self):
        """Print application banner"""
        banner = f"""
╔════════════════════════════════════════════════════════════╗
║                    🎹 TECHNO STUDIO v{self.VERSION}                  ║
║              Ableton Live Automation Toolkit               ║
╚════════════════════════════════════════════════════════════╝
"""
        print(banner)
    
    def generate_midi(self, genre: str = "deep", bpm: int = 124, bars: int = 136):
        """Generate MIDI patterns"""
        print(f"\n📝 Generating {genre.upper()} MIDI patterns...")
        print("━" * 60)
        
        genre_dir = self.midi_dir / genre.capitalize()
        
        if genre.lower() == "deep":
            generator = DeepTechnoMIDIGenerator(
                bpm=bpm,
                bars=bars,
                output_dir=str(genre_dir)
            )
            generator.generate_all()
        else:
            print(f"⚠️  Genre '{genre}' not yet supported. Using 'deep' instead.")
            self.generate_midi("deep", bpm, bars)
    
    def generate_template(self, name: str = "Deep-Techno", tempo: int = 124):
        """Generate Ableton template"""
        print(f"\n🎹 Generating Ableton template: {name}...")
        print("━" * 60)
        
        generator = AbletonTemplateGenerator(
            tempo=tempo,
            output_dir=str(self.project_dir)
        )
        generator.generate()
    
    def automate_vst(self):
        """Automate VST loading"""
        print(f"\n🤖 Starting VST automation...")
        print("━" * 60)
        
        automation = AbletonAutomation()
        
        # Find and activate Ableton
        if not automation.find_ableton_process():
            print("\n❌ ERROR: Ableton Live Suite is not running")
            print("   Please launch Ableton first, then run this command again.")
            return False
        
        if not automation.activate_window():
            print("\n❌ ERROR: Failed to activate Ableton window")
            return False
        
        # Setup view
        automation.setup_view()
        
        # Load plugins
        setup = DeepTechnoSetup(automation)
        setup.run()
        
        return True
    
    def full_workflow(self, genre: str = "deep", bpm: int = 124, bars: int = 136, 
                     autoload: bool = False):
        """Execute complete workflow"""
        self.print_banner()
        
        print("\n🚀 Starting FULL WORKFLOW")
        print("═" * 60)
        
        # Step 1: Generate MIDI
        self.generate_midi(genre, bpm, bars)
        
        # Step 2: Generate Template
        self.generate_template(f"{genre.capitalize()}-Techno", bpm)
        
        # Step 3: Launch Ableton (manual)
        print("\n━" * 60)
        print("⏸️  MANUAL STEP REQUIRED")
        print("━" * 60)
        print(f"\n📂 Project created: {self.project_dir / 'Deep-Techno-Template.als'}")
        print("\n➡️  Please open this file in Ableton Live now.")
        
        if autoload:
            input("\n   Press ENTER when Ableton is fully loaded...")
            
            # Step 4: Automate VST
            if not self.automate_vst():
                return False
        
        print("\n✅ WORKFLOW COMPLETE!")
        self.print_summary(genre, bpm, bars)
        
        return True
    
    def print_summary(self, genre: str, bpm: int, bars: int):
        """Print workflow summary"""
        summary = f"""
╔════════════════════════════════════════════════════════════╗
║                     📊 WORKFLOW SUMMARY                    ║
╚════════════════════════════════════════════════════════════╝

Genre:          {genre.upper()}
Tempo:          {bpm} BPM
Length:         {bars} bars

Output Locations:
📂 MIDI Files:  {self.midi_dir / genre.capitalize()}/
📂 Project:     {self.project_dir}/

Next Steps:
1. ✅ MIDI patterns generated
2. ✅ Ableton template created
3. ⏳ Drag MIDI files onto tracks in Ableton
4. ⏳ Adjust sounds and add effects
5. ⏳ Arrange and produce your track!

🎧 Happy producing! 🎧
"""
        print(summary)
    
    def list_outputs(self):
        """List all generated outputs"""
        self.print_banner()
        
        print("\n📂 Generated Files:")
        print("═" * 60)
        
        # List MIDI files
        if self.midi_dir.exists():
            print("\n🎵 MIDI Files:")
            for genre_dir in self.midi_dir.iterdir():
                if genre_dir.is_dir():
                    print(f"\n  {genre_dir.name}:")
                    for midi_file in sorted(genre_dir.glob("*.mid")):
                        size = midi_file.stat().st_size
                        print(f"    • {midi_file.name} ({size} bytes)")
        
        # List project files
        if self.project_dir.exists():
            print("\n🎹 Ableton Projects:")
            for als_file in sorted(self.project_dir.glob("*.als")):
                size = als_file.stat().st_size
                print(f"  • {als_file.name} ({size:,} bytes)")
        
        print()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="🎹 Techno Studio - Ableton Live Automation Toolkit",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s create --genre deep --bpm 124 --bars 136
  %(prog)s midi --genre deep --bpm 128
  %(prog)s template --tempo 130
  %(prog)s automate
  %(prog)s list
  %(prog)s create --genre deep --autoload

For more information, visit: https://github.com/yourname/techno-studio
        """
    )
    
    parser.add_argument('--version', action='version', version=f'%(prog)s {TechnoStudio.VERSION}')
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Create command (full workflow)
    create_parser = subparsers.add_parser('create', help='Create complete project (MIDI + Template)')
    create_parser.add_argument('--genre', default='deep', choices=['deep'], 
                              help='Techno subgenre (default: deep)')
    create_parser.add_argument('--bpm', type=int, default=124, help='Tempo in BPM (default: 124)')
    create_parser.add_argument('--bars', type=int, default=136, help='Track length in bars (default: 136)')
    create_parser.add_argument('--autoload', action='store_true', 
                              help='Automatically load VST plugins (requires Ableton to be open)')
    
    # MIDI command
    midi_parser = subparsers.add_parser('midi', help='Generate MIDI patterns only')
    midi_parser.add_argument('--genre', default='deep', choices=['deep'], help='Techno subgenre')
    midi_parser.add_argument('--bpm', type=int, default=124, help='Tempo in BPM')
    midi_parser.add_argument('--bars', type=int, default=136, help='Track length in bars')
    
    # Template command
    template_parser = subparsers.add_parser('template', help='Generate Ableton template only')
    template_parser.add_argument('--name', default='Deep-Techno', help='Template name')
    template_parser.add_argument('--tempo', type=int, default=124, help='Tempo in BPM')
    
    # Automate command
    automate_parser = subparsers.add_parser('automate', help='Automate VST loading (Ableton must be open)')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List all generated files')
    
    args = parser.parse_args()
    
    # Create studio instance
    studio = TechnoStudio()
    
    # Execute command
    if args.command == 'create':
        studio.full_workflow(args.genre, args.bpm, args.bars, args.autoload)
    
    elif args.command == 'midi':
        studio.print_banner()
        studio.generate_midi(args.genre, args.bpm, args.bars)
        print(f"\n✅ MIDI files saved to: {studio.midi_dir / args.genre.capitalize()}/\n")
    
    elif args.command == 'template':
        studio.print_banner()
        studio.generate_template(args.name, args.tempo)
        print(f"\n✅ Template saved to: {studio.project_dir}/\n")
    
    elif args.command == 'automate':
        studio.print_banner()
        if studio.automate_vst():
            print("\n✅ VST automation complete!\n")
        else:
            sys.exit(1)
    
    elif args.command == 'list':
        studio.list_outputs()
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
