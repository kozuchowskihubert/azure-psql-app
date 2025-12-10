"""
Preset Library and Patching Core
Advanced preset management system for Behringer 2600 synthesizer
"""

from .library import PresetLibrary, Preset, PresetCategory, PatchCable, PatchPoint
from .patching import PatchingEngine
from .manager import PresetManager

__all__ = [
    'PresetLibrary',
    'Preset',
    'PresetCategory',
    'PatchingEngine',
    'PatchCable',
    'PatchPoint',
    'PresetManager',
]
