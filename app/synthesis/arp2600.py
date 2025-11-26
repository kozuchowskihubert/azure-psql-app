"""
ARP 2600 Modular Synthesizer - Python Backend
Generates synthesizer sounds using NumPy/SciPy

Features:
- 3 VCOs (Oscillators)
- VCF (Filter) with multiple modes
- VCA (Amplifier)
- ADSR envelope
- LFO modulation
- Preset patches
"""

import numpy as np
from scipy import signal
import json


class ARP2600:
    """ARP 2600 Semi-Modular Synthesizer"""
    
    def __init__(self, sample_rate=44100):
        self.sample_rate = sample_rate
        
        # VCO settings
        self.vco1 = {
            'waveform': 'sawtooth',
            'octave': 0,
            'fine': 0,
            'enabled': True
        }
        
        self.vco2 = {
            'waveform': 'square',
            'octave': 0,
            'fine': 0,
            'enabled': False
        }
        
        self.vco3 = {
            'waveform': 'sine',
            'octave': -1,
            'fine': 0,
            'enabled': False
        }
        
        # VCF settings
        self.vcf = {
            'type': 'lowpass',
            'cutoff': 2000,
            'resonance': 5,
            'env_amount': 50
        }
        
        # VCA settings
        self.vca = {
            'level': 0.7
        }
        
        # ADSR envelope
        self.envelope = {
            'attack': 0.01,
            'decay': 0.3,
            'sustain': 0.7,
            'release': 0.5
        }
        
        # LFO
        self.lfo = {
            'waveform': 'sine',
            'rate': 5,
            'amount': 0
        }
    
    def generate_oscillator(self, frequency, duration, waveform='sawtooth'):
        """Generate oscillator waveform"""
        t = np.linspace(0, duration, int(self.sample_rate * duration), False)
        
        if waveform == 'sawtooth':
            return signal.sawtooth(2 * np.pi * frequency * t)
        elif waveform == 'square':
            return signal.square(2 * np.pi * frequency * t)
        elif waveform == 'triangle':
            return signal.sawtooth(2 * np.pi * frequency * t, 0.5)
        elif waveform == 'sine':
            return np.sin(2 * np.pi * frequency * t)
        else:
            return signal.sawtooth(2 * np.pi * frequency * t)
    
    def apply_filter(self, audio, filter_type='lowpass', cutoff=2000, resonance=5):
        """Apply filter to audio"""
        # Normalize cutoff to Nyquist frequency
        normalized_cutoff = min(cutoff / (self.sample_rate / 2), 0.99)
        
        # Create filter
        if filter_type == 'lowpass':
            b, a = signal.butter(2, normalized_cutoff, btype='low')
        elif filter_type == 'highpass':
            b, a = signal.butter(2, normalized_cutoff, btype='high')
        elif filter_type == 'bandpass':
            b, a = signal.butter(2, [normalized_cutoff * 0.8, normalized_cutoff * 1.2], btype='band')
        else:
            b, a = signal.butter(2, normalized_cutoff, btype='low')
        
        # Apply filter
        filtered = signal.lfilter(b, a, audio)
        
        # Add resonance (simplified - mix in filtered signal with gain)
        if resonance > 0:
            resonance_gain = min(resonance / 10, 0.9)
            filtered = filtered * (1 + resonance_gain)
        
        return filtered
    
    def apply_envelope(self, length, attack=0.01, decay=0.3, sustain=0.7, release=0.5):
        """Generate ADSR envelope"""
        attack_samples = int(attack * self.sample_rate)
        decay_samples = int(decay * self.sample_rate)
        release_samples = int(release * self.sample_rate)
        sustain_samples = length - attack_samples - decay_samples - release_samples
        
        if sustain_samples < 0:
            sustain_samples = 0
            attack_samples = int(length * 0.2)
            decay_samples = int(length * 0.2)
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
    
    def apply_lfo(self, audio, lfo_rate=5, lfo_amount=0, parameter='cutoff', base_value=2000):
        """Apply LFO modulation"""
        if lfo_amount <= 0:
            return audio
        
        t = np.linspace(0, len(audio) / self.sample_rate, len(audio), False)
        
        # Generate LFO
        lfo = np.sin(2 * np.pi * lfo_rate * t)
        
        # Modulate parameter
        modulation = lfo * lfo_amount * base_value
        
        # Apply modulation (simplified - affects overall amplitude)
        modulated = audio * (1 + modulation / base_value)
        
        return modulated
    
    def synthesize_note(self, frequency, duration=1.0, velocity=1.0):
        """Synthesize note with current settings"""
        # Mix oscillators
        audio_mix = np.zeros(int(self.sample_rate * duration))
        active_oscs = 0
        
        # VCO 1
        if self.vco1['enabled']:
            freq1 = frequency * (2 ** self.vco1['octave']) * (2 ** (self.vco1['fine'] / 1200))
            osc1 = self.generate_oscillator(freq1, duration, self.vco1['waveform'])
            audio_mix += osc1
            active_oscs += 1
        
        # VCO 2
        if self.vco2['enabled']:
            freq2 = frequency * (2 ** self.vco2['octave']) * (2 ** (self.vco2['fine'] / 1200))
            osc2 = self.generate_oscillator(freq2, duration, self.vco2['waveform'])
            audio_mix += osc2
            active_oscs += 1
        
        # VCO 3
        if self.vco3['enabled']:
            freq3 = frequency * (2 ** self.vco3['octave']) * (2 ** (self.vco3['fine'] / 1200))
            osc3 = self.generate_oscillator(freq3, duration, self.vco3['waveform'])
            audio_mix += osc3
            active_oscs += 1
        
        # Normalize mix
        if active_oscs > 0:
            audio_mix = audio_mix / active_oscs
        
        # Apply filter
        audio_filtered = self.apply_filter(
            audio_mix,
            self.vcf['type'],
            self.vcf['cutoff'],
            self.vcf['resonance']
        )
        
        # Apply LFO (if enabled)
        if self.lfo['amount'] > 0:
            audio_filtered = self.apply_lfo(
                audio_filtered,
                self.lfo['rate'],
                self.lfo['amount'],
                'cutoff',
                self.vcf['cutoff']
            )
        
        # Apply ADSR envelope
        envelope = self.apply_envelope(
            len(audio_filtered),
            self.envelope['attack'],
            self.envelope['decay'],
            self.envelope['sustain'],
            self.envelope['release']
        )
        
        audio_final = audio_filtered * envelope
        
        # Apply VCA level and velocity
        audio_final = audio_final * self.vca['level'] * velocity
        
        # Normalize
        max_val = np.max(np.abs(audio_final))
        if max_val > 0:
            audio_final = audio_final / max_val * 0.9
        
        return audio_final
    
    def load_preset(self, preset_name):
        """Load preset patch"""
        presets = {
            'bass': {
                'vco1': {'waveform': 'sawtooth', 'octave': -1, 'enabled': True},
                'vco2': {'waveform': 'square', 'octave': -1, 'fine': -7, 'enabled': True},
                'vco3': {'enabled': False},
                'vcf': {'type': 'lowpass', 'cutoff': 800, 'resonance': 8},
                'envelope': {'attack': 0.01, 'decay': 0.2, 'sustain': 0.5, 'release': 0.3}
            },
            'lead': {
                'vco1': {'waveform': 'sawtooth', 'octave': 0, 'enabled': True},
                'vco2': {'waveform': 'sawtooth', 'octave': 0, 'fine': 7, 'enabled': True},
                'vco3': {'enabled': False},
                'vcf': {'type': 'lowpass', 'cutoff': 3000, 'resonance': 15},
                'envelope': {'attack': 0.05, 'decay': 0.3, 'sustain': 0.7, 'release': 0.5},
                'lfo': {'rate': 6, 'amount': 0.3}
            },
            'pad': {
                'vco1': {'waveform': 'sawtooth', 'octave': 0, 'enabled': True},
                'vco2': {'waveform': 'square', 'octave': 0, 'fine': 5, 'enabled': True},
                'vco3': {'waveform': 'sine', 'octave': -1, 'enabled': True},
                'vcf': {'type': 'lowpass', 'cutoff': 2000, 'resonance': 5},
                'envelope': {'attack': 0.5, 'decay': 0.4, 'sustain': 0.8, 'release': 1.0}
            },
            'pluck': {
                'vco1': {'waveform': 'triangle', 'octave': 0, 'enabled': True},
                'vco2': {'enabled': False},
                'vco3': {'enabled': False},
                'vcf': {'type': 'lowpass', 'cutoff': 5000, 'resonance': 2},
                'envelope': {'attack': 0.001, 'decay': 0.15, 'sustain': 0.1, 'release': 0.2}
            },
            'brass': {
                'vco1': {'waveform': 'sawtooth', 'octave': 0, 'enabled': True},
                'vco2': {'waveform': 'sawtooth', 'octave': 0, 'fine': -3, 'enabled': True},
                'vco3': {'waveform': 'square', 'octave': 0, 'enabled': True},
                'vcf': {'type': 'lowpass', 'cutoff': 1500, 'resonance': 10},
                'envelope': {'attack': 0.08, 'decay': 0.2, 'sustain': 0.9, 'release': 0.3}
            }
        }
        
        if preset_name in presets:
            preset = presets[preset_name]
            
            if 'vco1' in preset:
                self.vco1.update(preset['vco1'])
            if 'vco2' in preset:
                self.vco2.update(preset['vco2'])
            if 'vco3' in preset:
                self.vco3.update(preset['vco3'])
            if 'vcf' in preset:
                self.vcf.update(preset['vcf'])
            if 'envelope' in preset:
                self.envelope.update(preset['envelope'])
            if 'lfo' in preset:
                self.lfo.update(preset['lfo'])
            
            return True
        
        return False
    
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


# Example usage
if __name__ == '__main__':
    # Create synthesizer
    synth = ARP2600(sample_rate=44100)
    
    # Load bass preset
    synth.load_preset('bass')
    
    # Synthesize note
    audio = synth.synthesize_note(frequency=220, duration=2.0, velocity=1.0)
    
    # Export to WAV
    synth.export_wav(audio, 'arp2600_bass.wav')
    
    print("Exported arp2600_bass.wav")
