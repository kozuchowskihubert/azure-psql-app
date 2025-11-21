"""
Preset Manager CLI
Command-line interface for managing Behringer 2600 presets
"""

import argparse
import sys
from typing import Optional
from pathlib import Path

from .library import PresetLibrary, Preset, PresetCategory
from .patching import PatchingEngine
from .factory_presets import create_deep_techno_presets


class Colors:
    """ANSI color codes"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class PresetManager:
    """
    Manages preset library operations with user-friendly CLI
    """
    
    def __init__(self, library_path: Optional[str] = None):
        """Initialize preset manager"""
        self.library = PresetLibrary(library_path)
        self.engine = PatchingEngine()
    
    def list_presets(self, category: Optional[str] = None, 
                    tags: Optional[list] = None, verbose: bool = False):
        """List all presets with optional filtering"""
        # Filter by category
        if category:
            try:
                cat_enum = PresetCategory(category.lower())
                presets = self.library.list_presets(cat_enum)
            except ValueError:
                print(f"{Colors.RED}❌ Invalid category: {category}{Colors.END}")
                print(f"Valid categories: {', '.join([c.value for c in PresetCategory])}")
                return
        else:
            presets = self.library.list_presets()
        
        # Filter by tags
        if tags:
            presets = [p for p in presets if any(p.has_tag(tag) for tag in tags)]
        
        if not presets:
            print(f"{Colors.YELLOW}No presets found matching criteria{Colors.END}")
            return
        
        # Display presets
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.END}")
        print(f"{Colors.HEADER}{Colors.BOLD}PRESET LIBRARY{Colors.END}")
        print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.END}\n")
        
        for i, preset in enumerate(sorted(presets, key=lambda p: (p.category.value, p.name)), 1):
            self._display_preset(preset, verbose, index=i)
        
        print(f"\n{Colors.CYAN}Total: {len(presets)} presets{Colors.END}\n")
    
    def _display_preset(self, preset: Preset, verbose: bool = False, index: Optional[int] = None):
        """Display a single preset"""
        prefix = f"{index:3d}. " if index else ""
        
        # Header
        print(f"{prefix}{Colors.BOLD}{Colors.CYAN}{preset.name}{Colors.END}")
        print(f"     Category: {Colors.YELLOW}{preset.category.value.upper()}{Colors.END}")
        
        if preset.description:
            print(f"     {preset.description}")
        
        if preset.tags:
            tags_str = ', '.join(sorted(preset.tags))
            print(f"     Tags: {Colors.GREEN}{tags_str}{Colors.END}")
        
        if preset.bpm:
            print(f"     BPM: {preset.bpm}")
        
        if preset.key:
            print(f"     Key: {preset.key}")
        
        if verbose:
            # Show patch details
            if preset.patch_cables:
                print(f"\n     {Colors.BOLD}Patch Cables ({len(preset.patch_cables)}):{Colors.END}")
                for cable in preset.patch_cables:
                    print(f"       • {cable.source} → {cable.destination} [{cable.color}]")
                    if cable.notes:
                        print(f"         💡 {cable.notes}")
            
            # Show module settings
            if preset.modules:
                print(f"\n     {Colors.BOLD}Modules ({len(preset.modules)}):{Colors.END}")
                for name, module in preset.modules.items():
                    params = ', '.join([f"{k}={v}" for k, v in module.parameters.items()])
                    print(f"       • {name}: {params}")
            
            # Show modulators
            if preset.modulators:
                print(f"\n     {Colors.BOLD}Modulators ({len(preset.modulators)}):{Colors.END}")
                for name, mod in preset.modulators.items():
                    print(f"       • {name} ({mod.module_type})")
            
            if preset.notes:
                print(f"\n     {Colors.YELLOW}Notes:{Colors.END} {preset.notes}")
        
        print()
    
    def show_preset(self, name: str):
        """Show detailed information about a preset"""
        preset = self.library.get_preset(name)
        if not preset:
            print(f"{Colors.RED}❌ Preset '{name}' not found{Colors.END}")
            return
        
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.END}")
        self._display_preset(preset, verbose=True)
        print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.END}\n")
    
    def load_preset_to_engine(self, name: str):
        """Load a preset into the patching engine"""
        preset = self.library.get_preset(name)
        if not preset:
            print(f"{Colors.RED}❌ Preset '{name}' not found{Colors.END}")
            return False
        
        # Clear current patch
        self.engine.clear_all_patches()
        self.engine.current_preset_name = preset.name
        
        # Load patch cables
        for cable in preset.patch_cables:
            self.engine.patch(
                cable.source.module,
                cable.source.output,
                cable.destination.module,
                cable.destination.input,
                cable.source.level,
                cable.color,
                cable.notes
            )
        
        print(f"{Colors.GREEN}✅ Loaded preset: {preset.name}{Colors.END}")
        print(f"\n{self.engine.visualize_patch()}")
        return True
    
    def search_presets(self, query: str):
        """Search presets by text"""
        results = self.library.search_by_text(query)
        
        if not results:
            print(f"{Colors.YELLOW}No presets found matching '{query}'{Colors.END}")
            return
        
        print(f"\n{Colors.CYAN}Found {len(results)} preset(s) matching '{query}':{Colors.END}\n")
        for preset in results:
            self._display_preset(preset, verbose=False)
    
    def search_by_tags(self, tags: list, match_all: bool = False):
        """Search presets by tags"""
        results = self.library.search_by_tags(tags, match_all=match_all)
        
        if not results:
            tag_str = ' AND '.join(tags) if match_all else ' OR '.join(tags)
            print(f"{Colors.YELLOW}No presets found with tags: {tag_str}{Colors.END}")
            return
        
        mode = "all" if match_all else "any"
        print(f"\n{Colors.CYAN}Found {len(results)} preset(s) with {mode} of tags {tags}:{Colors.END}\n")
        for preset in results:
            self._display_preset(preset, verbose=False)
    
    def export_preset(self, name: str, output_path: str):
        """Export a preset to JSON file"""
        if self.library.export_preset(name, output_path):
            print(f"{Colors.GREEN}✅ Exported '{name}' to {output_path}{Colors.END}")
        else:
            print(f"{Colors.RED}❌ Failed to export '{name}'{Colors.END}")
    
    def import_preset(self, input_path: str, overwrite: bool = False):
        """Import a preset from JSON file"""
        if self.library.import_preset(input_path, overwrite=overwrite):
            print(f"{Colors.GREEN}✅ Imported preset from {input_path}{Colors.END}")
        else:
            print(f"{Colors.RED}❌ Failed to import from {input_path}{Colors.END}")
    
    def show_statistics(self):
        """Show library statistics"""
        stats = self.library.get_statistics()
        
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.END}")
        print(f"{Colors.HEADER}{Colors.BOLD}LIBRARY STATISTICS{Colors.END}")
        print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.END}\n")
        
        print(f"{Colors.BOLD}Total Presets:{Colors.END} {Colors.CYAN}{stats['total_presets']}{Colors.END}")
        print(f"{Colors.BOLD}Total Tags:{Colors.END} {Colors.CYAN}{stats['total_tags']}{Colors.END}\n")
        
        print(f"{Colors.BOLD}Presets by Category:{Colors.END}")
        for category, count in sorted(stats['categories'].items()):
            bar = '█' * count
            print(f"  {category:15s} {Colors.GREEN}{bar}{Colors.END} {count}")
        
        print(f"\n{Colors.BOLD}All Tags:{Colors.END}")
        tags_display = ', '.join(sorted(stats['tags']))
        print(f"  {Colors.YELLOW}{tags_display}{Colors.END}\n")
    
    def initialize_factory_presets(self):
        """Initialize library with factory presets"""
        print(f"{Colors.CYAN}🏭 Initializing factory presets...{Colors.END}")
        factory_lib = create_deep_techno_presets()
        
        # Copy presets to current library
        for preset in factory_lib.presets.values():
            self.library.add_preset(preset, overwrite=True)
        
        # Save
        self.library.save_library()
        print(f"{Colors.GREEN}✅ Initialized {len(factory_lib.presets)} factory presets{Colors.END}")


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Behringer 2600 Preset Manager",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # List all presets
  python -m presets.manager list
  
  # List bass presets
  python -m presets.manager list --category bass
  
  # Search for acid presets
  python -m presets.manager search "acid"
  
  # Show detailed preset info
  python -m presets.manager show "Sub Bass - Deep 808"
  
  # Load preset to patching engine
  python -m presets.manager load "Acid Bass - 303 Style"
  
  # Export preset
  python -m presets.manager export "Dark Pad - Atmospheric" my_pad.json
  
  # Initialize factory presets
  python -m presets.manager init
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List presets')
    list_parser.add_argument('--category', '-c', help='Filter by category')
    list_parser.add_argument('--tags', '-t', nargs='+', help='Filter by tags')
    list_parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed info')
    
    # Show command
    show_parser = subparsers.add_parser('show', help='Show preset details')
    show_parser.add_argument('name', help='Preset name')
    
    # Load command
    load_parser = subparsers.add_parser('load', help='Load preset to patching engine')
    load_parser.add_argument('name', help='Preset name')
    
    # Search command
    search_parser = subparsers.add_parser('search', help='Search presets by text')
    search_parser.add_argument('query', help='Search query')
    
    # Search tags command
    tags_parser = subparsers.add_parser('tags', help='Search presets by tags')
    tags_parser.add_argument('tags', nargs='+', help='Tags to search for')
    tags_parser.add_argument('--all', action='store_true', help='Match all tags (AND logic)')
    
    # Export command
    export_parser = subparsers.add_parser('export', help='Export preset to file')
    export_parser.add_argument('name', help='Preset name')
    export_parser.add_argument('output', help='Output file path')
    
    # Import command
    import_parser = subparsers.add_parser('import', help='Import preset from file')
    import_parser.add_argument('input', help='Input file path')
    import_parser.add_argument('--overwrite', action='store_true', help='Overwrite if exists')
    
    # Stats command
    stats_parser = subparsers.add_parser('stats', help='Show library statistics')
    
    # Init command
    init_parser = subparsers.add_parser('init', help='Initialize factory presets')
    
    # Library path argument (global)
    parser.add_argument('--library', '-l', help='Path to preset library')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Create manager
    manager = PresetManager(args.library)
    
    # Execute command
    if args.command == 'list':
        manager.list_presets(args.category, args.tags, args.verbose)
    
    elif args.command == 'show':
        manager.show_preset(args.name)
    
    elif args.command == 'load':
        manager.load_preset_to_engine(args.name)
    
    elif args.command == 'search':
        manager.search_presets(args.query)
    
    elif args.command == 'tags':
        manager.search_by_tags(args.tags, match_all=args.all)
    
    elif args.command == 'export':
        manager.export_preset(args.name, args.output)
    
    elif args.command == 'import':
        manager.import_preset(args.input, args.overwrite)
    
    elif args.command == 'stats':
        manager.show_statistics()
    
    elif args.command == 'init':
        manager.initialize_factory_presets()


if __name__ == '__main__':
    main()
