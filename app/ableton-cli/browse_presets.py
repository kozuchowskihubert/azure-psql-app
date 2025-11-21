#!/usr/bin/env python3
"""
Preset Browser CLI - Interactive command-line tool for browsing presets
"""

import json
import sys
from pathlib import Path
from typing import List, Dict

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.presets.library import PresetLibrary


class PresetBrowser:
    """Interactive preset browser"""
    
    def __init__(self, library_path: str = None):
        if library_path is None:
            library_path = Path(__file__).parent / "output/presets/preset_library.json"
        
        self.library = PresetLibrary(str(library_path))
        self.filtered_presets = list(self.library.presets.values())
    
    def show_stats(self):
        """Show library statistics"""
        stats = self.library.get_statistics()
        
        print("\n" + "="*60)
        print("📊 PRESET LIBRARY STATISTICS")
        print("="*60)
        print(f"\nTotal Presets: {stats['total_presets']}")
        
        print(f"\n📁 Categories:")
        for category, count in sorted(stats['categories'].items()):
            print(f"   {category:15} : {count:3} presets")
        
        print(f"\n🏷️  Total Tags: {len(stats['tags'])}")
        
        # Show most common tags
        tag_counts = {}
        for preset in self.library.presets.values():
            for tag in preset.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        print(f"\n🔥 Most Common Tags:")
        for tag, count in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"   {tag:15} : {count:3} presets")
    
    def list_presets(self, category: str = None, tag: str = None, limit: int = None):
        """List presets with optional filtering"""
        presets = self.filtered_presets
        
        if category:
            presets = [p for p in presets if p.category.value == category]
        
        if tag:
            presets = [p for p in presets if tag.lower() in [t.lower() for t in p.tags]]
        
        if limit:
            presets = presets[:limit]
        
        print(f"\n📋 Found {len(presets)} presets:")
        print("-" * 80)
        
        for i, preset in enumerate(presets, 1):
            tags_str = ", ".join(sorted(list(preset.tags))[:5])
            if len(preset.tags) > 5:
                tags_str += "..."
            
            print(f"{i:3}. [{preset.category.value:12}] {preset.name:35} | {tags_str}")
        
        return presets
    
    def show_preset(self, name: str):
        """Show detailed preset information"""
        preset = self.library.get_preset(name)
        
        if not preset:
            print(f"❌ Preset '{name}' not found!")
            return
        
        print("\n" + "="*80)
        print(f"🎹 {preset.name}")
        print("="*80)
        
        print(f"\n📂 Category: {preset.category.value}")
        print(f"📝 Description: {preset.description}")
        print(f"👤 Author: {preset.author}")
        print(f"🏷️  Tags: {', '.join(sorted(preset.tags))}")
        
        if preset.bpm:
            print(f"🎵 BPM: {preset.bpm}")
        if preset.key:
            print(f"🎼 Key: {preset.key}")
        
        print(f"\n🔌 Patch Cables ({len(preset.patch_cables)}):")
        for i, cable in enumerate(preset.patch_cables, 1):
            notes = f" - {cable.notes}" if cable.notes else ""
            print(f"   {i}. {cable.source.module}.{cable.source.output} → "
                  f"{cable.destination.module}.{cable.destination.input} "
                  f"[{cable.color}]{notes}")
        
        print(f"\n⚙️  Modules ({len(preset.modules)}):")
        for name, module in preset.modules.items():
            params_str = ", ".join([f"{k}={v}" for k, v in list(module.parameters.items())[:3]])
            print(f"   {name}: {params_str}")
        
        print(f"\n🎚️  Modulators ({len(preset.modulators)}):")
        for name, mod in preset.modulators.items():
            print(f"   {name} ({mod.module_type}): A={mod.attack:.3f} D={mod.decay:.3f} "
                  f"S={mod.sustain:.3f} R={mod.release:.3f}")
        
        if preset.variations:
            print(f"\n🔀 Variations ({len(preset.variations)}):")
            for var in preset.variations:
                print(f"   - {var.name}: {var.description}")
        
        if preset.notes:
            print(f"\n📌 Notes: {preset.notes}")
    
    def search(self, query: str):
        """Search presets by name or description"""
        query = query.lower()
        results = []
        
        for preset in self.library.presets.values():
            if (query in preset.name.lower() or 
                query in preset.description.lower() or
                any(query in tag.lower() for tag in preset.tags)):
                results.append(preset)
        
        print(f"\n🔍 Search results for '{query}': {len(results)} matches")
        print("-" * 80)
        
        for i, preset in enumerate(results, 1):
            print(f"{i:3}. [{preset.category.value:12}] {preset.name:35}")
        
        return results
    
    def export_category(self, category: str, output_file: str):
        """Export presets from a category to JSON"""
        presets = [p for p in self.library.presets.values() if p.category.value == category]
        
        if not presets:
            print(f"❌ No presets found in category '{category}'")
            return
        
        export_data = {
            'category': category,
            'count': len(presets),
            'presets': [p.to_dict() for p in presets]
        }
        
        with open(output_file, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        print(f"✅ Exported {len(presets)} {category} presets to {output_file}")
    
    def interactive(self):
        """Interactive mode"""
        print("\n" + "="*60)
        print("🎹 PRESET BROWSER - Interactive Mode")
        print("="*60)
        print("\nCommands:")
        print("  stats              - Show library statistics")
        print("  list [category]    - List all presets or by category")
        print("  search <query>     - Search presets")
        print("  show <name>        - Show preset details")
        print("  export <category>  - Export category to JSON")
        print("  help               - Show this help")
        print("  quit               - Exit")
        
        while True:
            try:
                cmd = input("\n> ").strip()
                
                if not cmd:
                    continue
                
                parts = cmd.split(maxsplit=1)
                action = parts[0].lower()
                arg = parts[1] if len(parts) > 1 else None
                
                if action == 'quit' or action == 'exit':
                    print("👋 Goodbye!")
                    break
                
                elif action == 'stats':
                    self.show_stats()
                
                elif action == 'list':
                    self.list_presets(category=arg)
                
                elif action == 'search':
                    if not arg:
                        print("❌ Please provide a search query")
                    else:
                        self.search(arg)
                
                elif action == 'show':
                    if not arg:
                        print("❌ Please provide a preset name")
                    else:
                        self.show_preset(arg)
                
                elif action == 'export':
                    if not arg:
                        print("❌ Please provide a category name")
                    else:
                        output = f"{arg}_presets.json"
                        self.export_category(arg, output)
                
                elif action == 'help':
                    print("\nCommands:")
                    print("  stats              - Show library statistics")
                    print("  list [category]    - List all presets or by category")
                    print("  search <query>     - Search presets")
                    print("  show <name>        - Show preset details")
                    print("  export <category>  - Export category to JSON")
                    print("  help               - Show this help")
                    print("  quit               - Exit")
                
                else:
                    print(f"❌ Unknown command: {action}")
                    print("   Type 'help' for available commands")
            
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Browse Behringer 2600 presets')
    parser.add_argument('--stats', action='store_true', help='Show statistics')
    parser.add_argument('--list', metavar='CATEGORY', help='List presets by category')
    parser.add_argument('--search', metavar='QUERY', help='Search presets')
    parser.add_argument('--show', metavar='NAME', help='Show preset details')
    parser.add_argument('--export', metavar='CATEGORY', help='Export category to JSON')
    parser.add_argument('--interactive', '-i', action='store_true', help='Interactive mode')
    
    args = parser.parse_args()
    
    browser = PresetBrowser()
    
    if args.stats:
        browser.show_stats()
    
    elif args.list:
        browser.list_presets(category=args.list)
    
    elif args.search:
        browser.search(args.search)
    
    elif args.show:
        browser.show_preset(args.show)
    
    elif args.export:
        output = f"{args.export}_presets.json"
        browser.export_category(args.export, output)
    
    elif args.interactive:
        browser.interactive()
    
    else:
        # Default: show stats and enter interactive mode
        browser.show_stats()
        print("\nType 'help' for commands or use --help for CLI options")
        browser.interactive()


if __name__ == "__main__":
    main()
