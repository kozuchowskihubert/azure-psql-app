# ============================================================================
# SYNTH 2600 ENHANCED CLASS (Part 2)
# ============================================================================

class Synth2600Pro:
    """Enhanced Behringer 2600 synthesizer emulation with professional features"""
    
    def __init__(self):
        # Module parameters
        self.vco1 = OscillatorParams()
        self.vco2 = OscillatorParams(frequency=220.0)
        self.vco3 = OscillatorParams(frequency=55.0, waveform="sine")
        
        self.vcf = FilterParams()
        self.vca_level = 0.8
        
        self.eg1 = EnvelopeParams()
        self.eg2 = EnvelopeParams(attack=0.5, decay=0.3, sustain=0.6, release=1.0)
        
        self.lfo = LFOParams()
        
        # Patch cables
        self.patch_cables: List[PatchCable] = []
        
        # Sequencer
        self.sequencer_steps = [SequencerStep() for _ in range(16)]
        self.sequencer_enabled = False
        self.sequencer_current_step = 0
        self.sequencer_bpm = 120
        
        # Undo/Redo
        self.history = deque(maxlen=50)
        self.redo_stack = deque(maxlen=50)
        
        # Metadata
        self.preset_name = "Init Patch"
        self.author = ""
        self.tags = []
        self.created_at = datetime.now().isoformat()
        self.modified_at = datetime.now().isoformat()
    
    def save_state(self):
        """Save current state to history"""
        state = self.export_state()
        self.history.append(json.dumps(state))
        self.redo_stack.clear()
    
    def undo(self) -> bool:
        """Undo last action"""
        if not self.history:
            return False
        
        current = self.export_state()
        self.redo_stack.append(json.dumps(current))
        
        previous = json.loads(self.history.pop())
        self.import_state(previous)
        return True
    
    def redo(self) -> bool:
        """Redo last undone action"""
        if not self.redo_stack:
            return False
        
        current = self.export_state()
        self.history.append(json.dumps(current))
        
        next_state = json.loads(self.redo_stack.pop())
        self.import_state(next_state)
        return True
    
    def add_patch(self, source_module: str, source_output: str, 
                  dest_module: str, dest_input: str,
                  color: str = "red", notes: str = "", 
                  source_level: float = 1.0, dest_level: float = 1.0):
        """Add a patch cable connection"""
        self.save_state()
        
        source = PatchPoint(source_module, source_output, source_level)
        dest = PatchPoint(dest_module, dest_input, dest_level)
        cable = PatchCable(source, dest, color, notes)
        self.patch_cables.append(cable)
        self.modified_at = datetime.now().isoformat()
        return cable
    
    def remove_patch(self, cable_id: str = None, index: int = None) -> bool:
        """Remove a patch cable"""
        self.save_state()
        
        if cable_id:
            initial_count = len(self.patch_cables)
            self.patch_cables = [c for c in self.patch_cables if c.id != cable_id]
            removed = len(self.patch_cables) < initial_count
        elif index is not None and 0 <= index < len(self.patch_cables):
            del self.patch_cables[index]
            removed = True
        else:
            removed = False
        
        if removed:
            self.modified_at = datetime.now().isoformat()
        return removed
    
    def clear_patches(self):
        """Remove all patch cables"""
        self.save_state()
        self.patch_cables.clear()
        self.modified_at = datetime.now().isoformat()
    
    def get_patch_statistics(self) -> Dict:
        """Get statistics about current patch"""
        modules_used = set()
        colors_used = {}
        
        for cable in self.patch_cables:
            modules_used.add(cable.source.module)
            modules_used.add(cable.destination.module)
            colors_used[cable.color] = colors_used.get(cable.color, 0) + 1
        
        return {
            'total_cables': len(self.patch_cables),
            'modules_used': len(modules_used),
            'modules': list(modules_used),
            'colors': colors_used,
            'complexity': self._calculate_complexity()
        }
    
    def _calculate_complexity(self) -> str:
        """Calculate patch complexity"""
        cable_count = len(self.patch_cables)
        if cable_count == 0:
            return "Empty"
        elif cable_count <= 3:
            return "Simple"
        elif cable_count <= 6:
            return "Moderate"
        elif cable_count <= 10:
            return "Complex"
        else:
            return "Very Complex"
    
    def export_state(self) -> Dict:
        """Export complete synthesizer state"""
        return {
            'version': VERSION,
            'preset_name': self.preset_name,
            'author': self.author,
            'tags': self.tags,
            'created_at': self.created_at,
            'modified_at': self.modified_at,
            'vco1': asdict(self.vco1),
            'vco2': asdict(self.vco2),
            'vco3': asdict(self.vco3),
            'vcf': asdict(self.vcf),
            'vca_level': self.vca_level,
            'eg1': asdict(self.eg1),
            'eg2': asdict(self.eg2),
            'lfo': asdict(self.lfo),
            'patch_cables': [c.to_dict() for c in self.patch_cables],
            'sequencer': {
                'enabled': self.sequencer_enabled,
                'bpm': self.sequencer_bpm,
                'current_step': self.sequencer_current_step,
                'steps': [asdict(s) for s in self.sequencer_steps]
            }
        }
    
    def import_state(self, state: Dict):
        """Import synthesizer state"""
        self.preset_name = state.get('preset_name', 'Imported Patch')
        self.author = state.get('author', '')
        self.tags = state.get('tags', [])
        self.created_at = state.get('created_at', datetime.now().isoformat())
        self.modified_at = datetime.now().isoformat()
        
        # Import oscillators
        if 'vco1' in state:
            self.vco1 = OscillatorParams(**state['vco1'])
        if 'vco2' in state:
            self.vco2 = OscillatorParams(**state['vco2'])
        if 'vco3' in state:
            self.vco3 = OscillatorParams(**state['vco3'])
        
        # Import filter
        if 'vcf' in state:
            self.vcf = FilterParams(**state['vcf'])
        
        self.vca_level = state.get('vca_level', 0.8)
        
        # Import envelopes
        if 'eg1' in state:
            self.eg1 = EnvelopeParams(**state['eg1'])
        if 'eg2' in state:
            self.eg2 = EnvelopeParams(**state['eg2'])
        
        # Import LFO
        if 'lfo' in state:
            self.lfo = LFOParams(**state['lfo'])
        
        # Import patch cables
        self.patch_cables.clear()
        for cable_data in state.get('patch_cables', []):
            src = cable_data['source']
            dst = cable_data['destination']
            cable = PatchCable(
                source=PatchPoint(src['module'], src['output'], src.get('level', 1.0)),
                destination=PatchPoint(dst['module'], dst['output'], dst.get('level', 1.0)),
                color=cable_data.get('color', 'red'),
                notes=cable_data.get('notes', ''),
                created_at=cable_data.get('created_at', datetime.now().isoformat()),
                id=cable_data.get('id', datetime.now().strftime("%Y%m%d%H%M%S%f"))
            )
            self.patch_cables.append(cable)
        
        # Import sequencer
        if 'sequencer' in state:
            seq = state['sequencer']
            self.sequencer_enabled = seq.get('enabled', False)
            self.sequencer_bpm = seq.get('bpm', 120)
            self.sequencer_current_step = seq.get('current_step', 0)
            
            for i, step_data in enumerate(seq.get('steps', [])):
                if i < 16:
                    self.sequencer_steps[i] = SequencerStep(**step_data)
    
    def export_preset(self, filepath: str):
        """Export preset to JSON file"""
        state = self.export_state()
        try:
            with open(filepath, 'w') as f:
                json.dump(state, f, indent=2)
            return True
        except Exception as e:
            print(f"❌ Error exporting preset: {e}")
            return False
    
    def import_preset(self, filepath: str) -> bool:
        """Import preset from JSON file"""
        try:
            with open(filepath, 'r') as f:
                state = json.load(f)
            self.import_state(state)
            return True
        except Exception as e:
            print(f"❌ Error importing preset: {e}")
            return False
    
    def randomize_patch(self, preserve_structure: bool = False):
        """Randomize patch parameters"""
        import random
        
        self.save_state()
        
        if not preserve_structure:
            # Randomize oscillators
            self.vco1.frequency = random.uniform(55, 880)
            self.vco1.waveform = random.choice(["sine", "sawtooth", "square", "triangle"])
            self.vco1.pulse_width = random.uniform(0.1, 0.9)
            
            self.vco2.frequency = random.uniform(55, 880)
            self.vco2.waveform = random.choice(["sine", "sawtooth", "square", "triangle"])
            
            # Randomize filter
            self.vcf.cutoff = random.uniform(100, 5000)
            self.vcf.resonance = random.uniform(0, 0.9)
        
        # Always randomize envelopes
        self.eg1.attack = random.uniform(0.001, 1.0)
        self.eg1.decay = random.uniform(0.01, 2.0)
        self.eg1.sustain = random.uniform(0.3, 1.0)
        self.eg1.release = random.uniform(0.01, 3.0)
        
        # Randomize LFO
        self.lfo.rate = random.uniform(0.1, 20)
        self.lfo.waveform = random.choice(["sine", "triangle", "square", "random"])
        
        self.modified_at = datetime.now().isoformat()

# ============================================================================
# ASCII VISUALIZATIONS
# ============================================================================

class ASCIIVisualizer:
    """Create ASCII visualizations for patch state"""
    
    @staticmethod
    def draw_patch_matrix(synth: Synth2600Pro, width: int = 80) -> str:
        """Draw patch cable matrix"""
        modules = ['VCO1', 'VCO2', 'VCO3', 'VCF', 'VCA', 'EG1', 'EG2', 'LFO', 'SEQ']
        
        lines = []
        lines.append("╔" + "═" * (width - 2) + "╗")
        lines.append("║" + "PATCH MATRIX".center(width - 2) + "║")
        lines.append("╠" + "═" * (width - 2) + "╣")
        
        # Create matrix
        matrix = {}
        for cable in synth.patch_cables:
            key = (cable.source.module, cable.destination.module)
            if key not in matrix:
                matrix[key] = []
            matrix[key].append(cable.color[0].upper())
        
        # Draw matrix
        header = "    " + " ".join(f"{m:4s}" for m in modules)
        lines.append("║ " + header[:width-3] + "║")
        lines.append("║ " + ("-" * (len(header)))[:width-3] + "║")
        
        for src in modules:
            row = f"{src:4s}"
            for dst in modules:
                key = (src, dst)
                if key in matrix:
                    row += f" [{','.join(matrix[key][:2]):2s}]"
                else:
                    row += "  ·  "
            lines.append("║ " + row[:width-3] + "║")
        
        lines.append("╚" + "═" * (width - 2) + "╝")
        return "\n".join(lines)
    
    @staticmethod
    def draw_sequencer_grid(synth: Synth2600Pro) -> str:
        """Draw sequencer step grid"""
        lines = []
        lines.append("╔════════════════════════════════════════════════════════════╗")
        lines.append("║              16-STEP SEQUENCER GRID                        ║")
        lines.append("╠════════════════════════════════════════════════════════════╣")
        
        # Note names
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        # Draw steps
        step_line = "║ Step: "
        for i in range(16):
            marker = "█" if i == synth.sequencer_current_step else " "
            step_line += f"{marker}{i+1:2d} "
        lines.append(step_line + "║")
        
        # Draw pitch
        pitch_line = "║ Note: "
        for step in synth.sequencer_steps:
            note_name = notes[step.pitch % 12]
            octave = step.pitch // 12 - 1
            pitch_line += f" {note_name}{octave} "
        lines.append(pitch_line[:60] + "║")
        
        # Draw velocity bars
        vel_line = "║ Vel:  "
        for step in synth.sequencer_steps:
            bars = int(step.velocity / 127 * 3)
            vel_line += f" {'█' * bars:3s} "
        lines.append(vel_line[:60] + "║")
        
        # Draw gates
        gate_line = "║ Gate: "
        for step in synth.sequencer_steps:
            gate_line += f" {'▓▓▓' if step.gate else '···'} "
        lines.append(gate_line[:60] + "║")
        
        lines.append("╚════════════════════════════════════════════════════════════╝")
        lines.append(f"  BPM: {synth.sequencer_bpm}  |  {'RUNNING' if synth.sequencer_enabled else 'STOPPED'}")
        
        return "\n".join(lines)
    
    @staticmethod
    def draw_envelope(env: EnvelopeParams, width: int = 60, height: int = 10) -> str:
        """Draw ADSR envelope shape"""
        lines = []
        lines.append("╔" + "═" * width + "╗")
        lines.append("║" + f"ENVELOPE - {env.describe()}".center(width) + "║")
        lines.append("╠" + "═" * width + "╣")
        
        # Create envelope points
        total_time = env.attack + env.decay + 0.5 + env.release
        attack_w = int((env.attack / total_time) * width * 0.8)
        decay_w = int((env.decay / total_time) * width * 0.8)
        sustain_w = int(0.3 * width * 0.8)
        release_w = int((env.release / total_time) * width * 0.8)
        
        # Draw envelope
        for y in range(height):
            level = 1.0 - (y / height)
            line = "║"
            
            x = 0
            # Attack
            for i in range(attack_w):
                if i / attack_w >= level:
                    line += "█"
                else:
                    line += " "
                x += 1
            
            # Decay
            for i in range(decay_w):
                threshold = 1.0 - (i / decay_w) * (1.0 - env.sustain)
                if threshold >= level:
                    line += "█"
                else:
                    line += " "
                x += 1
            
            # Sustain
            for i in range(sustain_w):
                if env.sustain >= level:
                    line += "█"
                else:
                    line += " "
                x += 1
            
            # Release
            for i in range(release_w):
                threshold = env.sustain * (1.0 - i / release_w)
                if threshold >= level:
                    line += "█"
                else:
                    line += " "
                x += 1
            
            # Fill remaining
            while len(line) < width + 1:
                line += " "
            
            line = line[:width] + "║"
            lines.append(line)
        
        lines.append("╚" + "═" * width + "╝")
        lines.append(f"  A:{env.attack:.3f} D:{env.decay:.3f} S:{env.sustain:.2f} R:{env.release:.3f}")
        
        return "\n".join(lines)
    
    @staticmethod
    def draw_filter_response(vcf: FilterParams, width: int = 60, height: int = 12) -> str:
        """Draw filter frequency response"""
        lines = []
        lines.append("╔" + "═" * width + "╗")
        lines.append("║" + f"FILTER - {vcf.filter_type.upper()}".center(width) + "║")
        lines.append("╠" + "═" * width + "╣")
        
        # Simulate filter response
        for y in range(height):
            level = 1.0 - (y / height)
            line = "║"
            
            for x in range(width):
                freq = 20 * (2 ** (x / width * 10))  # 20Hz to 20kHz
                
                if vcf.filter_type == "lowpass":
                    response = 1.0 if freq < vcf.cutoff else max(0, 1.0 - (freq - vcf.cutoff) / vcf.cutoff)
                    if freq > vcf.cutoff * 0.9 and freq < vcf.cutoff * 1.1:
                        response += vcf.resonance
                elif vcf.filter_type == "highpass":
                    response = 1.0 if freq > vcf.cutoff else max(0, freq / vcf.cutoff)
                    if freq > vcf.cutoff * 0.9 and freq < vcf.cutoff * 1.1:
                        response += vcf.resonance
                elif vcf.filter_type == "bandpass":
                    center_ratio = freq / vcf.cutoff
                    response = 1.0 if 0.5 < center_ratio < 2.0 else 0.3
                    if 0.9 < center_ratio < 1.1:
                        response += vcf.resonance
                else:
                    response = 0.5
                
                response = min(1.0, response)
                
                if response >= level:
                    line += "█"
                else:
                    line += " "
            
            line += "║"
            lines.append(line)
        
        lines.append("╚" + "═" * width + "╝")
        lines.append(f"  Cutoff: {vcf.cutoff:.1f}Hz ({vcf.get_cutoff_note()})  Resonance: {vcf.resonance:.2f}")
        
        return "\n".join(lines)

# ============================================================================
# MIDI GENERATOR
# ============================================================================

class MIDIGenerator:
    """Generate MIDI files from sequencer patterns"""
    
    @staticmethod
    def export_sequence(synth: Synth2600Pro, filepath: str, bars: int = 4) -> bool:
        """Export sequencer to MIDI file"""
        if not MIDI_AVAILABLE:
            print("❌ MIDI libraries not installed")
            return False
        
        try:
            midi = MIDIFile(1)
            track = 0
            channel = 0
            time = 0
            
            midi.addTrackName(track, time, synth.preset_name)
            midi.addTempo(track, time, synth.sequencer_bpm)
            
            # Calculate step duration in beats
            steps_per_bar = 16
            beats_per_bar = 4
            step_duration = beats_per_bar / steps_per_bar
            
            # Generate pattern
            for bar in range(bars):
                for i, step in enumerate(synth.sequencer_steps):
                    if step.gate:
                        step_time = (bar * beats_per_bar) + (i * step_duration)
                        midi.addNote(track, channel, step.pitch, 
                                   step_time, step_duration * step.length, 
                                   step.velocity)
            
            with open(filepath, 'wb') as f:
                midi.writeFile(f)
            
            return True
            
        except Exception as e:
            print(f"❌ Error exporting MIDI: {e}")
            return False

# Continue with CLI implementation in next part...
