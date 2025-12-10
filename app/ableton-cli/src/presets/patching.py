"""
Patching Engine
Advanced signal routing and modulation matrix for Behringer 2600
"""

from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass, field
from enum import Enum
import json


class ModuleType(Enum):
    """Types of synthesizer modules"""
    VCO = "vco"  # Voltage Controlled Oscillator
    VCF = "vcf"  # Voltage Controlled Filter
    VCA = "vca"  # Voltage Controlled Amplifier
    ENV = "env"  # Envelope Generator
    LFO = "lfo"  # Low Frequency Oscillator
    SH = "sh"    # Sample & Hold
    NOISE = "noise"
    MIXER = "mixer"
    RING_MOD = "ring_mod"
    LAG = "lag"
    REVERB = "reverb"


class SignalType(Enum):
    """Types of signals that can be patched"""
    AUDIO = "audio"
    CV = "cv"  # Control Voltage
    GATE = "gate"
    TRIGGER = "trigger"


@dataclass
class ModuleIO:
    """Input/Output specification for a module"""
    module_id: str
    io_name: str
    signal_type: SignalType
    is_input: bool
    level: float = 1.0  # 0.0 to 1.0
    
    def __str__(self) -> str:
        direction = "IN" if self.is_input else "OUT"
        return f"{self.module_id}.{self.io_name} [{direction}] ({self.signal_type.value})"


class ModulationMatrix:
    """
    Advanced modulation matrix for managing complex patch routings
    """
    
    def __init__(self):
        """Initialize modulation matrix"""
        self.connections: List[Tuple[ModuleIO, ModuleIO]] = []
        self.modules: Dict[str, Dict] = {}
        self._init_modules()
    
    def _init_modules(self) -> None:
        """Initialize standard 2600 modules"""
        # VCO1
        self.modules['VCO1'] = {
            'type': ModuleType.VCO,
            'outputs': {
                'SINE': SignalType.AUDIO,
                'SAW': SignalType.AUDIO,
                'SQUARE': SignalType.AUDIO,
                'TRIANGLE': SignalType.AUDIO,
            },
            'inputs': {
                'FM': SignalType.CV,
                'SYNC': SignalType.TRIGGER,
                'PWM': SignalType.CV,
            }
        }
        
        # VCO2
        self.modules['VCO2'] = {
            'type': ModuleType.VCO,
            'outputs': {
                'SINE': SignalType.AUDIO,
                'SAW': SignalType.AUDIO,
                'SQUARE': SignalType.AUDIO,
                'TRIANGLE': SignalType.AUDIO,
            },
            'inputs': {
                'FM': SignalType.CV,
                'SYNC': SignalType.TRIGGER,
                'PWM': SignalType.CV,
            }
        }
        
        # VCO3
        self.modules['VCO3'] = {
            'type': ModuleType.VCO,
            'outputs': {
                'SINE': SignalType.AUDIO,
                'SAW': SignalType.AUDIO,
                'SQUARE': SignalType.AUDIO,
            },
            'inputs': {
                'FM': SignalType.CV,
            }
        }
        
        # VCF (Voltage Controlled Filter)
        self.modules['VCF'] = {
            'type': ModuleType.VCF,
            'outputs': {
                'LP': SignalType.AUDIO,  # Low Pass
                'BP': SignalType.AUDIO,  # Band Pass
                'HP': SignalType.AUDIO,  # High Pass
            },
            'inputs': {
                'AUDIO_IN': SignalType.AUDIO,
                'CUTOFF_CV': SignalType.CV,
                'RESONANCE_CV': SignalType.CV,
            }
        }
        
        # VCA (Voltage Controlled Amplifier)
        self.modules['VCA'] = {
            'type': ModuleType.VCA,
            'outputs': {
                'OUT': SignalType.AUDIO,
            },
            'inputs': {
                'AUDIO_IN': SignalType.AUDIO,
                'CV': SignalType.CV,
            }
        }
        
        # ADSR Envelopes
        for i in range(1, 3):
            self.modules[f'ENV{i}'] = {
                'type': ModuleType.ENV,
                'outputs': {
                    'OUT': SignalType.CV,
                    'INVERTED': SignalType.CV,
                },
                'inputs': {
                    'GATE': SignalType.GATE,
                    'TRIGGER': SignalType.TRIGGER,
                }
            }
        
        # LFO
        self.modules['LFO'] = {
            'type': ModuleType.LFO,
            'outputs': {
                'SINE': SignalType.CV,
                'SQUARE': SignalType.CV,
                'TRIANGLE': SignalType.CV,
                'RANDOM': SignalType.CV,
            },
            'inputs': {}
        }
        
        # Sample & Hold
        self.modules['SH'] = {
            'type': ModuleType.SH,
            'outputs': {
                'OUT': SignalType.CV,
            },
            'inputs': {
                'IN': SignalType.CV,
                'TRIGGER': SignalType.TRIGGER,
            }
        }
        
        # Noise Generator
        self.modules['NOISE'] = {
            'type': ModuleType.NOISE,
            'outputs': {
                'WHITE': SignalType.AUDIO,
                'PINK': SignalType.AUDIO,
            },
            'inputs': {}
        }
        
        # Ring Modulator
        self.modules['RING_MOD'] = {
            'type': ModuleType.RING_MOD,
            'outputs': {
                'OUT': SignalType.AUDIO,
            },
            'inputs': {
                'CARRIER': SignalType.AUDIO,
                'MODULATOR': SignalType.AUDIO,
            }
        }
        
        # Mixer
        self.modules['MIXER'] = {
            'type': ModuleType.MIXER,
            'outputs': {
                'OUT': SignalType.AUDIO,
            },
            'inputs': {
                'IN1': SignalType.AUDIO,
                'IN2': SignalType.AUDIO,
                'IN3': SignalType.AUDIO,
                'IN4': SignalType.AUDIO,
            }
        }
        
        # Spring Reverb
        self.modules['REVERB'] = {
            'type': ModuleType.REVERB,
            'outputs': {
                'OUT': SignalType.AUDIO,
            },
            'inputs': {
                'IN': SignalType.AUDIO,
            }
        }
    
    def get_module(self, module_id: str) -> Optional[Dict]:
        """Get module by ID"""
        return self.modules.get(module_id)
    
    def get_outputs(self, module_id: str) -> List[str]:
        """Get all outputs for a module"""
        module = self.get_module(module_id)
        if module:
            return list(module.get('outputs', {}).keys())
        return []
    
    def get_inputs(self, module_id: str) -> List[str]:
        """Get all inputs for a module"""
        module = self.get_module(module_id)
        if module:
            return list(module.get('inputs', {}).keys())
        return []
    
    def validate_connection(self, source_module: str, source_output: str,
                          dest_module: str, dest_input: str) -> Tuple[bool, str]:
        """
        Validate if a connection is valid
        
        Returns:
            (is_valid, error_message)
        """
        # Check if source module exists
        source = self.get_module(source_module)
        if not source:
            return False, f"Source module '{source_module}' not found"
        
        # Check if destination module exists
        dest = self.get_module(dest_module)
        if not dest:
            return False, f"Destination module '{dest_module}' not found"
        
        # Check if source output exists
        if source_output not in source.get('outputs', {}):
            return False, f"Output '{source_output}' not found on module '{source_module}'"
        
        # Check if destination input exists
        if dest_input not in dest.get('inputs', {}):
            return False, f"Input '{dest_input}' not found on module '{dest_module}'"
        
        # Check signal type compatibility
        source_signal = source['outputs'][source_output]
        dest_signal = dest['inputs'][dest_input]
        
        # Audio can go anywhere, CV/Gate/Trigger need matching types
        if source_signal != SignalType.AUDIO and source_signal != dest_signal:
            return False, f"Signal type mismatch: {source_signal.value} -> {dest_signal.value}"
        
        return True, "Valid connection"


class PatchingEngine:
    """
    Advanced patching engine for Behringer 2600 synthesizer
    Manages signal routing, modulation, and patch validation
    """
    
    def __init__(self):
        """Initialize patching engine"""
        self.matrix = ModulationMatrix()
        self.patches: List[Dict] = []
        self.current_preset_name: Optional[str] = None
    
    def patch(self, source_module: str, source_output: str,
             dest_module: str, dest_input: str,
             level: float = 1.0, color: str = "red",
             notes: str = "") -> bool:
        """
        Create a patch cable connection
        
        Args:
            source_module: Source module ID (e.g., "VCO1")
            source_output: Output name (e.g., "SAW")
            dest_module: Destination module ID (e.g., "VCF")
            dest_input: Input name (e.g., "AUDIO_IN")
            level: Signal level 0.0 to 1.0
            color: Cable color for organization
            notes: Optional notes about this connection
        
        Returns:
            True if patch was successful, False otherwise
        """
        # Validate connection
        is_valid, message = self.matrix.validate_connection(
            source_module, source_output, dest_module, dest_input
        )
        
        if not is_valid:
            print(f"❌ Invalid patch: {message}")
            return False
        
        # Create patch
        patch = {
            'source': {
                'module': source_module,
                'output': source_output
            },
            'destination': {
                'module': dest_module,
                'input': dest_input
            },
            'level': level,
            'color': color,
            'notes': notes
        }
        
        self.patches.append(patch)
        print(f"✅ Patched: {source_module}.{source_output} → {dest_module}.{dest_input} ({color})")
        return True
    
    def unpatch(self, source_module: str, source_output: str,
                dest_module: str, dest_input: str) -> bool:
        """Remove a patch cable connection"""
        for i, patch in enumerate(self.patches):
            if (patch['source']['module'] == source_module and
                patch['source']['output'] == source_output and
                patch['destination']['module'] == dest_module and
                patch['destination']['input'] == dest_input):
                self.patches.pop(i)
                print(f"✅ Unpatched: {source_module}.{source_output} → {dest_module}.{dest_input}")
                return True
        
        print(f"⚠️  Patch not found: {source_module}.{source_output} → {dest_module}.{dest_input}")
        return False
    
    def clear_all_patches(self) -> None:
        """Remove all patch cables"""
        count = len(self.patches)
        self.patches.clear()
        print(f"✅ Cleared {count} patches")
    
    def get_patches(self) -> List[Dict]:
        """Get all current patches"""
        return self.patches.copy()
    
    def get_patches_for_module(self, module_id: str) -> List[Dict]:
        """Get all patches involving a specific module"""
        result = []
        for patch in self.patches:
            if (patch['source']['module'] == module_id or
                patch['destination']['module'] == module_id):
                result.append(patch)
        return result
    
    def visualize_patch(self) -> str:
        """Generate ASCII visualization of current patch"""
        if not self.patches:
            return "No patches connected"
        
        lines = []
        lines.append("=" * 70)
        lines.append("PATCH DIAGRAM")
        lines.append("=" * 70)
        
        for i, patch in enumerate(self.patches, 1):
            source = f"{patch['source']['module']}.{patch['source']['output']}"
            dest = f"{patch['destination']['module']}.{patch['destination']['input']}"
            color = patch['color']
            level = patch['level']
            
            lines.append(f"{i:2d}. {source:20s} ─[{color:6s}]→ {dest:20s} (level: {level:.2f})")
            
            if patch.get('notes'):
                lines.append(f"    💡 {patch['notes']}")
        
        lines.append("=" * 70)
        return "\n".join(lines)
    
    def export_patch_sheet(self, output_path: str) -> bool:
        """Export patch as CSV patch sheet"""
        try:
            import csv
            with open(output_path, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['#', 'Source Module', 'Source Output', 
                               'Dest Module', 'Dest Input', 'Level', 'Color', 'Notes'])
                
                for i, patch in enumerate(self.patches, 1):
                    writer.writerow([
                        i,
                        patch['source']['module'],
                        patch['source']['output'],
                        patch['destination']['module'],
                        patch['destination']['input'],
                        patch['level'],
                        patch['color'],
                        patch.get('notes', '')
                    ])
            
            print(f"✅ Exported patch sheet to {output_path}")
            return True
        except Exception as e:
            print(f"❌ Error exporting patch sheet: {e}")
            return False
    
    def import_patch_sheet(self, input_path: str) -> bool:
        """Import patch from CSV patch sheet"""
        try:
            import csv
            self.clear_all_patches()
            
            with open(input_path, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.patch(
                        row['Source Module'],
                        row['Source Output'],
                        row['Dest Module'],
                        row['Dest Input'],
                        float(row.get('Level', 1.0)),
                        row.get('Color', 'red'),
                        row.get('Notes', '')
                    )
            
            print(f"✅ Imported patch sheet from {input_path}")
            return True
        except Exception as e:
            print(f"❌ Error importing patch sheet: {e}")
            return False
    
    def to_json(self) -> str:
        """Export current patch as JSON"""
        data = {
            'preset_name': self.current_preset_name,
            'patches': self.patches
        }
        return json.dumps(data, indent=2)
    
    def from_json(self, json_str: str) -> bool:
        """Load patch from JSON"""
        try:
            data = json.loads(json_str)
            self.clear_all_patches()
            self.current_preset_name = data.get('preset_name')
            
            for patch in data.get('patches', []):
                self.patch(
                    patch['source']['module'],
                    patch['source']['output'],
                    patch['destination']['module'],
                    patch['destination']['input'],
                    patch.get('level', 1.0),
                    patch.get('color', 'red'),
                    patch.get('notes', '')
                )
            
            return True
        except Exception as e:
            print(f"❌ Error loading from JSON: {e}")
            return False
    
    def get_signal_flow(self) -> Dict[str, List[str]]:
        """Analyze signal flow through the patch"""
        flow = {}
        
        for patch in self.patches:
            source = f"{patch['source']['module']}.{patch['source']['output']}"
            dest = f"{patch['destination']['module']}.{patch['destination']['input']}"
            
            if source not in flow:
                flow[source] = []
            flow[source].append(dest)
        
        return flow
    
    def detect_feedback_loops(self) -> List[List[str]]:
        """Detect feedback loops in the patch (useful for warning about potential issues)"""
        # TODO: Implement cycle detection algorithm
        return []
    
    def suggest_basic_patch(self, patch_type: str) -> List[str]:
        """Suggest a basic patch configuration"""
        suggestions = {
            'mono_synth': [
                "VCO1.SAW → VCF.AUDIO_IN",
                "VCF.LP → VCA.AUDIO_IN",
                "ENV1.OUT → VCA.CV",
                "ENV2.OUT → VCF.CUTOFF_CV"
            ],
            'bass': [
                "VCO1.SAW → VCF.AUDIO_IN",
                "VCO2.SQUARE → VCF.AUDIO_IN",
                "VCF.LP → VCA.AUDIO_IN",
                "ENV1.OUT → VCA.CV",
                "ENV2.OUT → VCF.CUTOFF_CV",
                "LFO.SINE → VCO1.FM (subtle vibrato)"
            ],
            'lead': [
                "VCO1.SAW → VCF.AUDIO_IN",
                "VCF.LP → VCA.AUDIO_IN",
                "ENV1.OUT → VCA.CV",
                "ENV2.OUT → VCF.CUTOFF_CV",
                "LFO.TRIANGLE → VCO1.PWM (movement)"
            ],
            'pad': [
                "VCO1.SAW → MIXER.IN1",
                "VCO2.SQUARE → MIXER.IN2",
                "VCO3.SINE → MIXER.IN3",
                "MIXER.OUT → VCF.AUDIO_IN",
                "VCF.LP → REVERB.IN",
                "REVERB.OUT → VCA.AUDIO_IN",
                "ENV1.OUT → VCA.CV (slow attack/release)",
                "LFO.SINE → VCF.CUTOFF_CV (slow movement)"
            ]
        }
        
        return suggestions.get(patch_type, ["Unknown patch type"])
