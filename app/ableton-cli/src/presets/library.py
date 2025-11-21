"""
Preset Library Core
Manages preset storage, categorization, and retrieval for Behringer 2600
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Set
from dataclasses import dataclass, field, asdict
from enum import Enum
from pathlib import Path


class PresetCategory(Enum):
    """Preset categories for organization"""
    BASS = "bass"
    LEAD = "lead"
    PAD = "pad"
    PERCUSSION = "percussion"
    EFFECTS = "effects"
    SEQUENCE = "sequence"
    MODULATION = "modulation"
    EXPERIMENTAL = "experimental"
    TEMPLATE = "template"


@dataclass
class PatchPoint:
    """Represents a patch point on the 2600"""
    module: str  # e.g., "VCO1", "VCF", "ENV1"
    output: str  # e.g., "SAW", "LP", "GATE"
    level: float = 1.0  # 0.0 to 1.0
    
    def __str__(self) -> str:
        return f"{self.module}.{self.output}"
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'PatchPoint':
        return cls(**data)


@dataclass
class PatchCable:
    """Represents a patch cable connection"""
    source: PatchPoint
    destination: PatchPoint
    color: str = "red"  # Cable color for visual organization
    notes: str = ""  # Optional notes about this connection
    
    def __str__(self) -> str:
        return f"{self.source} → {self.destination} ({self.color})"
    
    def to_dict(self) -> Dict:
        return {
            'source': self.source.to_dict(),
            'destination': self.destination.to_dict(),
            'color': self.color,
            'notes': self.notes
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'PatchCable':
        return cls(
            source=PatchPoint.from_dict(data['source']),
            destination=PatchPoint.from_dict(data['destination']),
            color=data.get('color', 'red'),
            notes=data.get('notes', '')
        )


@dataclass
class ModulatorSettings:
    """Settings for modulators (LFOs, ENVs)"""
    module_type: str  # "LFO", "ENV", "S&H"
    rate: float = 0.5  # 0.0 to 1.0
    depth: float = 0.5  # 0.0 to 1.0
    waveform: Optional[str] = None  # For LFO: "sine", "square", "triangle", "random"
    attack: Optional[float] = None  # For ENV: 0.0 to 1.0
    decay: Optional[float] = None
    sustain: Optional[float] = None
    release: Optional[float] = None
    
    def to_dict(self) -> Dict:
        return {k: v for k, v in asdict(self).items() if v is not None}
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'ModulatorSettings':
        return cls(**data)


@dataclass
class SynthModule:
    """Settings for a synthesizer module"""
    module_name: str  # e.g., "VCO1", "VCF", "VCA"
    parameters: Dict[str, float] = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'SynthModule':
        return cls(**data)


@dataclass
class Preset:
    """Complete synthesizer preset"""
    name: str
    category: PresetCategory
    description: str = ""
    tags: Set[str] = field(default_factory=set)
    
    # Patching
    patch_cables: List[PatchCable] = field(default_factory=list)
    
    # Module settings
    modules: Dict[str, SynthModule] = field(default_factory=dict)
    modulators: Dict[str, ModulatorSettings] = field(default_factory=dict)
    
    # Metadata
    author: str = "Unknown"
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    modified_at: str = field(default_factory=lambda: datetime.now().isoformat())
    version: str = "1.0"
    
    # Usage notes
    notes: str = ""
    bpm: Optional[int] = None
    key: Optional[str] = None
    
    def __post_init__(self):
        """Ensure category is a PresetCategory enum"""
        if isinstance(self.category, str):
            self.category = PresetCategory(self.category)
        if isinstance(self.tags, list):
            self.tags = set(self.tags)
    
    def add_cable(self, source: PatchPoint, destination: PatchPoint, 
                  color: str = "red", notes: str = "") -> None:
        """Add a patch cable connection"""
        cable = PatchCable(source, destination, color, notes)
        self.patch_cables.append(cable)
    
    def add_module(self, name: str, parameters: Dict[str, float]) -> None:
        """Add or update module settings"""
        self.modules[name] = SynthModule(name, parameters)
    
    def add_modulator(self, name: str, settings: ModulatorSettings) -> None:
        """Add or update modulator settings"""
        self.modulators[name] = settings
    
    def add_tag(self, tag: str) -> None:
        """Add a tag to this preset"""
        self.tags.add(tag.lower())
    
    def remove_tag(self, tag: str) -> None:
        """Remove a tag from this preset"""
        self.tags.discard(tag.lower())
    
    def has_tag(self, tag: str) -> bool:
        """Check if preset has a specific tag"""
        return tag.lower() in self.tags
    
    def update_modified_time(self) -> None:
        """Update the modification timestamp"""
        self.modified_at = datetime.now().isoformat()
    
    def to_dict(self) -> Dict:
        """Convert preset to dictionary for JSON serialization"""
        return {
            'name': self.name,
            'category': self.category.value,
            'description': self.description,
            'tags': list(self.tags),
            'patch_cables': [cable.to_dict() for cable in self.patch_cables],
            'modules': {k: v.to_dict() for k, v in self.modules.items()},
            'modulators': {k: v.to_dict() for k, v in self.modulators.items()},
            'author': self.author,
            'created_at': self.created_at,
            'modified_at': self.modified_at,
            'version': self.version,
            'notes': self.notes,
            'bpm': self.bpm,
            'key': self.key
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Preset':
        """Create preset from dictionary"""
        preset = cls(
            name=data['name'],
            category=PresetCategory(data['category']),
            description=data.get('description', ''),
            tags=set(data.get('tags', [])),
            author=data.get('author', 'Unknown'),
            created_at=data.get('created_at', datetime.now().isoformat()),
            modified_at=data.get('modified_at', datetime.now().isoformat()),
            version=data.get('version', '1.0'),
            notes=data.get('notes', ''),
            bpm=data.get('bpm'),
            key=data.get('key')
        )
        
        # Load patch cables
        for cable_data in data.get('patch_cables', []):
            preset.patch_cables.append(PatchCable.from_dict(cable_data))
        
        # Load modules
        for name, module_data in data.get('modules', {}).items():
            preset.modules[name] = SynthModule.from_dict(module_data)
        
        # Load modulators
        for name, mod_data in data.get('modulators', {}).items():
            preset.modulators[name] = ModulatorSettings.from_dict(mod_data)
        
        return preset


class PresetLibrary:
    """
    Manages a collection of presets with search, categorization, and persistence
    """
    
    def __init__(self, library_path: Optional[str] = None):
        """
        Initialize preset library
        
        Args:
            library_path: Path to library JSON file. If None, uses default location
        """
        if library_path is None:
            library_path = self._get_default_library_path()
        
        self.library_path = Path(library_path)
        self.presets: Dict[str, Preset] = {}
        self._load_library()
    
    def _get_default_library_path(self) -> str:
        """Get default library path"""
        base_dir = Path(__file__).parent.parent.parent / "output" / "presets"
        base_dir.mkdir(parents=True, exist_ok=True)
        return str(base_dir / "preset_library.json")
    
    def _load_library(self) -> None:
        """Load library from disk"""
        if self.library_path.exists():
            try:
                with open(self.library_path, 'r') as f:
                    data = json.load(f)
                    for preset_data in data.get('presets', []):
                        preset = Preset.from_dict(preset_data)
                        self.presets[preset.name] = preset
                print(f"✅ Loaded {len(self.presets)} presets from {self.library_path}")
            except Exception as e:
                print(f"⚠️  Error loading library: {e}")
                self.presets = {}
        else:
            print(f"📝 Creating new library at {self.library_path}")
    
    def save_library(self) -> None:
        """Save library to disk"""
        try:
            self.library_path.parent.mkdir(parents=True, exist_ok=True)
            
            data = {
                'version': '1.0',
                'updated_at': datetime.now().isoformat(),
                'preset_count': len(self.presets),
                'presets': [preset.to_dict() for preset in self.presets.values()]
            }
            
            with open(self.library_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            print(f"✅ Saved {len(self.presets)} presets to {self.library_path}")
        except Exception as e:
            print(f"❌ Error saving library: {e}")
    
    def add_preset(self, preset: Preset, overwrite: bool = False) -> bool:
        """
        Add a preset to the library
        
        Args:
            preset: Preset to add
            overwrite: If True, overwrite existing preset with same name
        
        Returns:
            True if preset was added, False if name conflict and overwrite=False
        """
        if preset.name in self.presets and not overwrite:
            print(f"⚠️  Preset '{preset.name}' already exists. Use overwrite=True to replace.")
            return False
        
        self.presets[preset.name] = preset
        print(f"✅ Added preset: {preset.name}")
        return True
    
    def remove_preset(self, name: str) -> bool:
        """Remove a preset by name"""
        if name in self.presets:
            del self.presets[name]
            print(f"✅ Removed preset: {name}")
            return True
        print(f"⚠️  Preset '{name}' not found")
        return False
    
    def get_preset(self, name: str) -> Optional[Preset]:
        """Get a preset by name"""
        return self.presets.get(name)
    
    def list_presets(self, category: Optional[PresetCategory] = None) -> List[Preset]:
        """
        List all presets, optionally filtered by category
        
        Args:
            category: Filter by category, or None for all presets
        
        Returns:
            List of presets
        """
        if category is None:
            return list(self.presets.values())
        return [p for p in self.presets.values() if p.category == category]
    
    def search_by_tag(self, tag: str) -> List[Preset]:
        """Search presets by tag"""
        tag = tag.lower()
        return [p for p in self.presets.values() if p.has_tag(tag)]
    
    def search_by_tags(self, tags: List[str], match_all: bool = True) -> List[Preset]:
        """
        Search presets by multiple tags
        
        Args:
            tags: List of tags to search for
            match_all: If True, require all tags. If False, match any tag.
        
        Returns:
            List of matching presets
        """
        tags = [t.lower() for t in tags]
        results = []
        
        for preset in self.presets.values():
            if match_all:
                if all(preset.has_tag(tag) for tag in tags):
                    results.append(preset)
            else:
                if any(preset.has_tag(tag) for tag in tags):
                    results.append(preset)
        
        return results
    
    def search_by_text(self, query: str) -> List[Preset]:
        """Search presets by text in name, description, or notes"""
        query = query.lower()
        results = []
        
        for preset in self.presets.values():
            if (query in preset.name.lower() or 
                query in preset.description.lower() or 
                query in preset.notes.lower()):
                results.append(preset)
        
        return results
    
    def get_all_tags(self) -> Set[str]:
        """Get all unique tags across all presets"""
        tags = set()
        for preset in self.presets.values():
            tags.update(preset.tags)
        return tags
    
    def get_statistics(self) -> Dict:
        """Get library statistics"""
        stats = {
            'total_presets': len(self.presets),
            'categories': {},
            'total_tags': len(self.get_all_tags()),
            'tags': list(self.get_all_tags())
        }
        
        for category in PresetCategory:
            count = len(self.list_presets(category))
            if count > 0:
                stats['categories'][category.value] = count
        
        return stats
    
    def export_preset(self, name: str, output_path: str) -> bool:
        """Export a single preset to JSON file"""
        preset = self.get_preset(name)
        if preset is None:
            print(f"⚠️  Preset '{name}' not found")
            return False
        
        try:
            with open(output_path, 'w') as f:
                json.dump(preset.to_dict(), f, indent=2)
            print(f"✅ Exported preset to {output_path}")
            return True
        except Exception as e:
            print(f"❌ Error exporting preset: {e}")
            return False
    
    def import_preset(self, input_path: str, overwrite: bool = False) -> bool:
        """Import a preset from JSON file"""
        try:
            with open(input_path, 'r') as f:
                data = json.load(f)
                preset = Preset.from_dict(data)
                return self.add_preset(preset, overwrite=overwrite)
        except Exception as e:
            print(f"❌ Error importing preset: {e}")
            return False
