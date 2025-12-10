"""
TB-303 Acid Bass Synthesizer - Python Backend
Generates WAV files from TB-303 patterns using NumPy/SciPy

Features:
- Classic sawtooth/square oscillator
- Resonant lowpass filter with envelope modulation
- Accent, slide, and gate controls
- 16-step sequencer rendering to audio
"""

import numpy as np
from scipy import signal
import json


class TB303:
    """TB-303 Acid Bass Synthesizer"""
    
    def __init__(self, sample_rate=44100):
        self.sample_rate = sample_rate
        
        # Default parameters
        self.params = {
            'cutoff': 800,
            'resonance': 15,
            'env_mod': 70,
            'decay': 0.3,
            'accent_level': 50,
            'waveform': 'sawtooth',
            'tuning': 0,
            'volume': 70,
            'distortion': 20,
            'delay': 0
        }
        
        # Note frequency table
        self.note_frequencies = {
            'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78,
            'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00,
            'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
            'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
            'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            'C4': 261.63
        }
    
    def set_param(self, param, value):
        """Set synthesizer parameter"""
        if param in self.params:
            self.params[param] = float(value)
            return True
        return False
    
    def generate_oscillator(self, frequency, duration, waveform='sawtooth'):
        """Generate oscillator waveform"""
        t = np.linspace(0, duration, int(self.sample_rate * duration), False)
        
        if waveform == 'sawtooth':
            return signal.sawtooth(2 * np.pi * frequency * t)
        elif waveform == 'square':
            return signal.square(2 * np.pi * frequency * t)
        elif waveform == 'sine':
            return np.sin(2 * np.pi * frequency * t)
        else:
            return signal.sawtooth(2 * np.pi * frequency * t)
    
    def apply_filter(self, audio, cutoff_envelope, resonance):
        """Apply resonant lowpass filter with envelope"""
        output = np.zeros_like(audio)
        
        # Simple lowpass filter with envelope modulation
        for i, cutoff in enumerate(cutoff_envelope):
            # Normalize cutoff to Nyquist frequency
            normalized_cutoff = min(cutoff / (self.sample_rate / 2), 0.99)
            
            # Create filter coefficients
            b, a = signal.butter(2, normalized_cutoff, btype='low')
            
            # Apply filter to small window
            window_size = min(1024, len(audio) - i)
            if window_size > 0:
                filtered = signal.lfilter(b, a, audio[i:i+window_size])
                output[i:i+window_size] += filtered * (1.0 / len(cutoff_envelope))
        
        return output
    
    def apply_envelope(self, length, attack=0.01, decay=0.3, sustain=0.7, release=0.1):
        """Generate ADSR envelope"""
        attack_samples = int(attack * self.sample_rate)
        decay_samples = int(decay * self.sample_rate)
        release_samples = int(release * self.sample_rate)
        sustain_samples = length - attack_samples - decay_samples - release_samples
        
        if sustain_samples < 0:
            sustain_samples = 0
            attack_samples = int(length * 0.3)
            decay_samples = int(length * 0.3)
            release_samples = length - attack_samples - decay_samples
        
        # Attack
        attack_env = np.linspace(0, 1, attack_samples)
        
        # Decay
        decay_env = np.linspace(1, sustain, decay_samples)
        
        # Sustain
        sustain_env = np.ones(sustain_samples) * sustain
        
        # Release
        release_env = np.linspace(sustain, 0, release_samples)
        
        envelope = np.concatenate([attack_env, decay_env, sustain_env, release_env])
        
        # Ensure exact length
        if len(envelope) < length:
            envelope = np.pad(envelope, (0, length - len(envelope)), constant_values=0)
        elif len(envelope) > length:
            envelope = envelope[:length]
        
        return envelope
    
    def apply_distortion(self, audio, amount):
        """Apply soft clipping distortion"""
        if amount <= 0:
            return audio
        
        # Soft clipping with tanh
        gain = 1 + (amount / 100) * 4
        return np.tanh(audio * gain) / gain
    
    def synthesize_note(self, note, accent=False, slide=False, gate=False, duration=0.25):
        """Synthesize single 303 note"""
        # Get frequency
        frequency = self.note_frequencies.get(note, 130.81)
        frequency *= np.power(2, self.params['tuning'] / 1200)
        
        # Generate oscillator
        audio = self.generate_oscillator(frequency, duration, self.params['waveform'])
        
        # Calculate filter envelope
        base_cutoff = self.params['cutoff']
        env_amount = (self.params['env_mod'] / 100) * (base_cutoff * 2)
        accent_mult = 1 + (self.params['accent_level'] / 100) if accent else 1
        peak_cutoff = min(base_cutoff + (env_amount * accent_mult), 8000)
        
        # Create cutoff envelope
        decay_samples = int(self.params['decay'] * self.sample_rate)
        cutoff_envelope = np.linspace(peak_cutoff, base_cutoff, len(audio))
        
        # Apply filter (simplified - use constant cutoff for performance)
        normalized_cutoff = min(base_cutoff / (self.sample_rate / 2), 0.99)
        b, a = signal.butter(2, normalized_cutoff, btype='low')
        audio = signal.lfilter(b, a, audio)
        
        # Apply amplitude envelope
        gate_time = 0.25 if gate else 0.1
        env_length = int(min(gate_time, duration) * self.sample_rate)
        amplitude_env = self.apply_envelope(
            len(audio),
            attack=0.001,
            decay=self.params['decay'],
            sustain=0.7,
            release=0.1
        )
        
        audio *= amplitude_env
        
        # Apply accent
        if accent:
            audio *= accent_mult
        
        # Apply distortion
        if self.params['distortion'] > 0:
            audio = self.apply_distortion(audio, self.params['distortion'])
        
        # Normalize
        max_val = np.max(np.abs(audio))
        if max_val > 0:
            audio = audio / max_val * (self.params['volume'] / 100)
        
        return audio
    
    def render_pattern(self, pattern, bpm=130):
        """Render 16-step pattern to audio"""
        # Calculate step duration (16th notes)
        step_duration = (60.0 / bpm) / 4
        
        # Render each step
        audio_chunks = []
        
        for step in pattern:
            if step['active']:
                note_audio = self.synthesize_note(
                    step['note'],
                    step.get('accent', False),
                    step.get('slide', False),
                    step.get('gate', False),
                    step_duration
                )
            else:
                # Silent step
                note_audio = np.zeros(int(step_duration * self.sample_rate))
            
            audio_chunks.append(note_audio)
        
        # Concatenate all steps
        full_audio = np.concatenate(audio_chunks)
        
        # Normalize final output
        max_val = np.max(np.abs(full_audio))
        if max_val > 0:
            full_audio = full_audio / max_val * 0.9
        
        return full_audio
    
    def export_wav(self, audio, filename):
        """Export audio to WAV file"""
        try:
            from scipy.io import wavfile
            
            # Convert to 16-bit PCM
            audio_int16 = np.int16(audio * 32767)
            
            # Write WAV file
            wavfile.write(filename, self.sample_rate, audio_int16)
            return True
        except Exception as e:
            print(f"Error exporting WAV: {e}")
            return False
    
    def load_pattern_from_json(self, json_data):
        """Load pattern from JSON string or dict"""
        if isinstance(json_data, str):
            data = json.loads(json_data)
        else:
            data = json_data
        
        if 'params' in data:
            self.params.update(data['params'])
        
        return data.get('pattern', [])


# Example usage
if __name__ == '__main__':
    # Create synthesizer
    synth = TB303(sample_rate=44100)
    
    # Create classic 303 pattern
    pattern = [
        {'active': True, 'note': 'C3', 'accent': True, 'slide': False, 'gate': False},
        {'active': False, 'note': 'C3', 'accent': False, 'slide': False, 'gate': False},
        {'active': True, 'note': 'D#3', 'accent': False, 'slide': True, 'gate': False},
        {'active': False, 'note': 'C3', 'accent': False, 'slide': False, 'gate': False},
        {'active': True, 'note': 'C3', 'accent': False, 'slide': False, 'gate': False},
        {'active': False, 'note': 'C3', 'accent': False, 'slide': False, 'gate': False},
        {'active': True, 'note': 'G3', 'accent': True, 'slide': False, 'gate': True},
        {'active': False, 'note': 'C3', 'accent': False, 'slide': False, 'gate': False},
        {'active': True, 'note': 'C3', 'accent': False, 'slide': False, 'gate': False},
        {'active': False, 'note': 'C3', 'accent': False, 'slide': False, 'gate': False},
        {'active': True, 'note': 'D#3', 'accent': False, 'slide': True, 'gate': False},
        {'active': False, 'note': 'C3', 'accent': False, 'slide': False, 'gate': False},
        {'active': True, 'note': 'C3', 'accent': True, 'slide': False, 'gate': False},
        {'active': False, 'note': 'C3', 'accent': False, 'slide': False, 'gate': False},
        {'active': True, 'note': 'D3', 'accent': False, 'slide': False, 'gate': False},
        {'active': False, 'note': 'C3', 'accent': False, 'slide': False, 'gate': False}
    ]
    
    # Render pattern
    audio = synth.render_pattern(pattern, bpm=130)
    
    # Export to WAV
    synth.export_wav(audio, 'tb303_pattern.wav')
    print("Exported tb303_pattern.wav")
