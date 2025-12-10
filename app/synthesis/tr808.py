"""
TR-808 Drum Machine - Python Backend
Generates drum sounds using NumPy/SciPy synthesis

Features:
- 6 drum voices: Kick, Hat, Clap, Perc, Ride, Crash
- Multiple variations per voice
- WAV file export
"""

import numpy as np
from scipy import signal
import json


class TR808:
    """TR-808 Drum Machine Synthesizer"""
    
    def __init__(self, sample_rate=44100):
        self.sample_rate = sample_rate
        self.master_volume = 0.7
    
    def generate_kick(self, variation='classic'):
        """Generate kick drum sound"""
        variations = {
            'classic': lambda: self._synth_kick(150, 40, 0.5, 1.0),
            'deep': lambda: self._synth_kick(120, 30, 0.6, 1.1),
            'punchy': lambda: self._synth_kick(180, 50, 0.3, 1.2, distort=True),
            'sub': lambda: self._synth_kick(60, 20, 0.8, 1.3),
            'acid': lambda: self._synth_kick_filtered(200, 30, 0.4, 1.0, 1200, 10),
            'minimal': lambda: self._synth_kick(100, 40, 0.2, 0.9),
            'rumble': lambda: self._synth_kick(50, 15, 1.0, 1.5),
            'tribal': lambda: self._synth_kick(120, 35, 0.5, 1.1, waveform='triangle'),
            'distorted': lambda: self._synth_kick(160, 45, 0.4, 1.2, distort=True),
            'fm': lambda: self._synth_kick_fm(150, 75, 0.4, 1.0)
        }
        
        if variation in variations:
            return variations[variation]()
        return variations['classic']()
    
    def _synth_kick(self, start_freq, end_freq, duration, volume, waveform='sine', distort=False):
        """Basic kick synthesis with frequency sweep"""
        t = np.linspace(0, duration, int(self.sample_rate * duration), False)
        
        # Frequency sweep
        freq_envelope = np.linspace(start_freq, end_freq, len(t))
        phase = np.cumsum(2 * np.pi * freq_envelope / self.sample_rate)
        
        # Generate waveform
        if waveform == 'sine':
            audio = np.sin(phase)
        elif waveform == 'triangle':
            audio = signal.sawtooth(phase, 0.5)
        else:
            audio = np.sin(phase)
        
        # Amplitude envelope
        envelope = np.exp(-3 * t / duration)
        audio *= envelope
        
        # Distortion
        if distort:
            audio = np.tanh(audio * 2)
        
        # Normalize and apply volume
        audio = audio / np.max(np.abs(audio)) * volume * self.master_volume
        
        return audio
    
    def _synth_kick_filtered(self, start_freq, end_freq, duration, volume, filter_freq, resonance):
        """Kick with filter sweep (acid kick)"""
        audio = self._synth_kick(start_freq, end_freq, duration, volume, waveform='sawtooth')
        
        # Apply lowpass filter with sweep
        cutoff = min(filter_freq / (self.sample_rate / 2), 0.99)
        b, a = signal.butter(2, cutoff, btype='low')
        audio = signal.lfilter(b, a, audio)
        
        return audio
    
    def _synth_kick_fm(self, carrier_freq, mod_freq, duration, volume):
        """FM synthesized kick"""
        t = np.linspace(0, duration, int(self.sample_rate * duration), False)
        
        # Modulator
        mod = np.sin(2 * np.pi * mod_freq * t)
        
        # Carrier with FM
        carrier_freq_sweep = np.linspace(carrier_freq, carrier_freq * 0.3, len(t))
        phase = np.cumsum(2 * np.pi * carrier_freq_sweep / self.sample_rate)
        audio = np.sin(phase + mod * 100)
        
        # Envelope
        envelope = np.exp(-3 * t / duration)
        audio *= envelope
        
        # Normalize
        audio = audio / np.max(np.abs(audio)) * volume * self.master_volume
        
        return audio
    
    def generate_hat(self, variation='classic'):
        """Generate hi-hat sound"""
        variations = {
            'classic': lambda: self._synth_noise(0.05, 8000, 0.3),
            'tight': lambda: self._synth_noise(0.03, 10000, 0.25),
            'open': lambda: self._synth_noise(0.2, 8000, 0.35),
            'crispy': lambda: self._synth_noise(0.04, 12000, 0.4)
        }
        
        if variation in variations:
            return variations[variation]()
        return variations['classic']()
    
    def generate_clap(self, variation='classic'):
        """Generate clap sound"""
        if variation == 'classic':
            # Multiple short bursts
            claps = [
                self._synth_noise(0.1, 2000, 0.5, start_offset=0),
                self._synth_noise(0.1, 2000, 0.5, start_offset=0.03),
                self._synth_noise(0.1, 2000, 0.5, start_offset=0.06)
            ]
            max_len = max(len(c) for c in claps)
            audio = np.zeros(max_len)
            for clap in claps:
                audio[:len(clap)] += clap
            return audio / 3
        elif variation == 'tight':
            claps = [
                self._synth_noise(0.08, 3000, 0.45, start_offset=0),
                self._synth_noise(0.08, 3000, 0.45, start_offset=0.02)
            ]
            max_len = max(len(c) for c in claps)
            audio = np.zeros(max_len)
            for clap in claps:
                audio[:len(clap)] += clap
            return audio / 2
        elif variation == 'reverb':
            # Multiple decaying bursts
            claps = []
            offsets = [0, 0.03, 0.06, 0.1, 0.15]
            for i, offset in enumerate(offsets):
                decay = 0.1 + (i * 0.02)
                vol = 0.5 - (i * 0.08)
                claps.append(self._synth_noise(decay, 2000, vol, start_offset=offset))
            max_len = max(len(c) for c in claps)
            audio = np.zeros(max_len)
            for clap in claps:
                audio[:len(clap)] += clap
            return audio / len(claps)
        else:
            return self._synth_noise(0.05, 4000, 0.6)
    
    def generate_perc(self, variation='conga'):
        """Generate percussion sound"""
        variations = {
            'conga': lambda: self._synth_tonal(200, 0.2, 0.6),
            'tom': lambda: self._synth_tonal(120, 0.3, 0.7),
            'cowbell': lambda: self._synth_tonal(800, 0.15, 0.5),
            'wood': lambda: self._synth_noise(0.04, 3000, 0.4)
        }
        
        if variation in variations:
            return variations[variation]()
        return variations['conga']()
    
    def generate_ride(self, variation='classic'):
        """Generate ride cymbal"""
        variations = {
            'classic': lambda: self._synth_metallic([4000, 5000, 6000], 0.3, 0.4),
            'bell': lambda: self._synth_metallic([2000, 3000], 0.2, 0.5),
            'ping': lambda: self._synth_metallic([6000, 7000, 8000], 0.15, 0.35)
        }
        
        if variation in variations:
            return variations[variation]()
        return variations['classic']()
    
    def generate_crash(self, variation='classic'):
        """Generate crash cymbal"""
        variations = {
            'classic': lambda: self._synth_metallic([3000, 4000, 5000, 6000], 1.0, 0.5),
            'splash': lambda: self._synth_metallic([5000, 6000, 7000], 0.6, 0.45),
            'china': lambda: self._synth_metallic([2000, 3000, 4000], 0.8, 0.6)
        }
        
        if variation in variations:
            return variations[variation]()
        return variations['classic']()
    
    def _synth_noise(self, duration, filter_freq, volume, start_offset=0):
        """Generate filtered noise burst"""
        total_duration = duration + start_offset
        t = np.linspace(0, total_duration, int(self.sample_rate * total_duration), False)
        
        # White noise
        noise = np.random.uniform(-1, 1, len(t))
        
        # Highpass filter
        cutoff = min(filter_freq / (self.sample_rate / 2), 0.99)
        b, a = signal.butter(2, cutoff, btype='high')
        audio = signal.lfilter(b, a, noise)
        
        # Envelope
        envelope = np.exp(-5 * t / total_duration)
        audio *= envelope
        
        # Normalize
        max_val = np.max(np.abs(audio))
        if max_val > 0:
            audio = audio / max_val * volume * self.master_volume
        
        return audio
    
    def _synth_tonal(self, frequency, duration, volume):
        """Generate tonal percussion (toms, congas)"""
        t = np.linspace(0, duration, int(self.sample_rate * duration), False)
        
        # Frequency sweep
        freq_sweep = frequency * np.exp(-2 * t / duration)
        phase = np.cumsum(2 * np.pi * freq_sweep / self.sample_rate)
        
        # Sine wave
        audio = np.sin(phase)
        
        # Envelope
        envelope = np.exp(-3 * t / duration)
        audio *= envelope
        
        # Normalize
        audio = audio / np.max(np.abs(audio)) * volume * self.master_volume
        
        return audio
    
    def _synth_metallic(self, frequencies, duration, volume):
        """Generate metallic sound (cymbals)"""
        t = np.linspace(0, duration, int(self.sample_rate * duration), False)
        
        # Combine multiple frequencies (square waves for metallic timbre)
        audio = np.zeros(len(t))
        for freq in frequencies:
            audio += signal.square(2 * np.pi * freq * t)
        
        # Normalize components
        audio = audio / len(frequencies)
        
        # Envelope
        envelope = np.exp(-2 * t / duration)
        audio *= envelope
        
        # Normalize
        max_val = np.max(np.abs(audio))
        if max_val > 0:
            audio = audio / max_val * volume * self.master_volume
        
        return audio
    
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
    # Create drum machine
    drums = TR808(sample_rate=44100)
    
    # Generate some drums
    kick = drums.generate_kick('classic')
    hat = drums.generate_hat('classic')
    clap = drums.generate_clap('classic')
    
    # Export
    drums.export_wav(kick, '808_kick.wav')
    drums.export_wav(hat, '808_hat.wav')
    drums.export_wav(clap, '808_clap.wav')
    
    print("Exported drum samples")
