"""
HAOS.fm Audio Engine - Python Synthesis Backend
Replaces WebView bridge with reliable FastAPI backend
"""

from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from scipy import signal
import base64
import io
import wave
from typing import Optional

app = FastAPI(title="HAOS.fm Audio Engine", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global constants
SAMPLE_RATE = 44100

# Parameter models
class KickParams(BaseModel):
    frequency: float = 150.0
    pitch: float = 150.0  # Alias for frequency
    decay: float = 0.5
    velocity: float = 1.0

class SnareParams(BaseModel):
    tone_freq: float = 200.0
    noise_amount: float = 0.7
    decay: float = 0.15
    velocity: float = 1.0

class HiHatParams(BaseModel):
    noise_freq: float = 8000.0
    decay: float = 0.05
    velocity: float = 0.8

class ClapParams(BaseModel):
    decay: float = 0.1
    velocity: float = 1.0

class SynthParams(BaseModel):
    frequency: float = 440.0
    duration: float = 0.5
    velocity: float = 0.8
    waveform: str = 'sine'

class ChordParams(BaseModel):
    root_frequency: float = 261.63  # Middle C
    chord_type: str = 'major'
    duration: float = 1.0
    velocity: float = 0.8
    instrument: str = 'piano'  # piano, organ, synth

class BrassParams(BaseModel):
    frequency: float = 440.0
    duration: float = 0.5
    velocity: float = 0.8
    instrument: str = 'trumpet'  # trumpet, horn, trombone

class StringParams(BaseModel):
    frequency: float = 440.0
    duration: float = 1.0
    velocity: float = 0.7
    vibrato_rate: float = 5.0
    vibrato_depth: float = 0.01
    instrument: str = 'violin'  # violin, viola, cello

# ARP 2600 Parameters
class ARP2600Params(BaseModel):
    frequency: float = 440.0
    duration: float = 0.5
    velocity: float = 0.8
    # VCO
    vco1_waveform: str = 'sawtooth'
    vco1_octave: int = 0
    vco2_waveform: str = 'pulse'
    vco2_detune: float = 0.0
    vco2_mix: float = 0.5
    # VCF
    vcf_cutoff: float = 2000.0
    vcf_resonance: float = 0.7
    vcf_env_amount: float = 0.5
    # VCA/ADSR
    attack: float = 0.01
    decay: float = 0.1
    sustain: float = 0.7
    release: float = 0.3
    # LFO
    lfo_rate: float = 5.0
    lfo_amount: float = 0.1
    # Effects
    drive: float = 0.0
    noise_amount: float = 0.0
    ring_mod: float = 0.0
    sample_hold_rate: float = 0.0

class Synthesizer:
    """DSP synthesis engine using NumPy/SciPy"""
    
    @staticmethod
    def generate_kick(params: KickParams) -> bytes:
        """
        Generate TR-808 style kick drum
        
        Features:
        - Pitch envelope: 150Hz → 50Hz
        - Exponential decay
        - Sine wave oscillator
        """
        duration = params.decay
        samples = int(SAMPLE_RATE * duration)
        t = np.linspace(0, duration, samples, False)
        
        # Pitch envelope: exponential sweep from high to low
        start_pitch = params.pitch
        end_pitch = 50  # Hz
        pitch_env = start_pitch * np.exp(-4 * t / duration) + end_pitch
        
        # Generate sine wave with pitch modulation
        phase = np.cumsum(2 * np.pi * pitch_env / SAMPLE_RATE)
        audio = np.sin(phase)
        
        # Amplitude envelope: exponential decay
        amp_env = np.exp(-5 * t / duration)
        audio *= amp_env * params.velocity
        
        # Normalize and convert to int16
        audio = np.clip(audio, -1.0, 1.0)
        audio_int16 = (audio * 32767).astype(np.int16)
        
        return Synthesizer._to_wav_bytes(audio_int16)
    
    @staticmethod
    def generate_snare(velocity: float = 1.0) -> bytes:
        """
        Generate TR-808 style snare drum
        
        Features:
        - Dual oscillators (180Hz + 330Hz)
        - White noise burst
        - Fast decay
        """
        duration = 0.15
        samples = int(SAMPLE_RATE * duration)
        t = np.linspace(0, duration, samples, False)
        
        # Tonal component: two sine waves
        tone1 = np.sin(2 * np.pi * 180 * t)
        tone2 = np.sin(2 * np.pi * 330 * t)
        tonal = (tone1 + tone2) * 0.3
        
        # Noise component
        noise = np.random.uniform(-1, 1, samples) * 0.7
        
        # Mix
        audio = tonal + noise
        
        # Amplitude envelope
        amp_env = np.exp(-15 * t / duration)
        audio *= amp_env * velocity
        
        # Normalize
        audio = np.clip(audio, -1.0, 1.0)
        audio_int16 = (audio * 32767).astype(np.int16)
        
        return Synthesizer._to_wav_bytes(audio_int16)
    
    @staticmethod
    def generate_hihat(velocity: float = 1.0, open: bool = False) -> bytes:
        """
        Generate TR-808 style hi-hat
        
        Features:
        - Six square wave oscillators (high frequencies)
        - Short decay (closed) or longer (open)
        - Bandpass filtered noise
        """
        duration = 0.3 if open else 0.05
        samples = int(SAMPLE_RATE * duration)
        t = np.linspace(0, duration, samples, False)
        
        # High-frequency oscillators
        freqs = [3140, 3400, 3700, 4100, 4400, 4700]
        audio = np.zeros(samples)
        for freq in freqs:
            audio += signal.square(2 * np.pi * freq * t) / len(freqs)
        
        # Add filtered noise
        noise = np.random.uniform(-1, 1, samples)
        sos = signal.butter(4, [7000, 12000], 'bandpass', fs=SAMPLE_RATE, output='sos')
        filtered_noise = signal.sosfilt(sos, noise)
        audio = audio * 0.3 + filtered_noise * 0.7
        
        # Amplitude envelope
        decay_rate = 8 if open else 25
        amp_env = np.exp(-decay_rate * t / duration)
        audio *= amp_env * velocity
        
        # Normalize
        audio = np.clip(audio, -1.0, 1.0)
        audio_int16 = (audio * 32767).astype(np.int16)
        
        return Synthesizer._to_wav_bytes(audio_int16)
    
    @staticmethod
    def generate_clap(velocity: float = 1.0) -> bytes:
        """
        Generate TR-808 style hand clap
        
        Features:
        - Filtered noise burst
        - Multiple attacks (flamming effect)
        - 1kHz bandpass filter
        """
        duration = 0.1
        samples = int(SAMPLE_RATE * duration)
        
        # Generate noise
        noise = np.random.uniform(-1, 1, samples)
        
        # Bandpass filter around 1kHz
        sos = signal.butter(4, [800, 1200], 'bandpass', fs=SAMPLE_RATE, output='sos')
        audio = signal.sosfilt(sos, noise)
        
        # Create flamming effect with multiple envelopes
        t = np.linspace(0, duration, samples, False)
        env1 = np.exp(-40 * t / duration)
        env2 = np.exp(-40 * np.maximum(0, t - 0.01) / duration) * 0.7
        env3 = np.exp(-40 * np.maximum(0, t - 0.02) / duration) * 0.5
        
        combined_env = np.maximum(env1, np.maximum(env2, env3))
        audio *= combined_env * velocity
        
        # Normalize
        audio = np.clip(audio, -1.0, 1.0)
        audio_int16 = (audio * 32767).astype(np.int16)
        
        return Synthesizer._to_wav_bytes(audio_int16)
    
    @staticmethod
    def generate_arp2600(params: SynthParams) -> bytes:
        """
        Generate ARP 2600 style synthesizer sound
        
        Features:
        - Dual sawtooth oscillators with detune
        - ADSR envelope
        - Lowpass filter with resonance
        """
        duration = params.attack + params.decay + params.release
        samples = int(SAMPLE_RATE * duration)
        t = np.linspace(0, duration, samples, False)
        
        # Dual sawtooth oscillators with detune
        osc1_freq = params.frequency
        osc2_freq = params.frequency * (1.0 + params.detune)
        
        osc1 = Synthesizer._sawtooth(osc1_freq, samples)
        osc2 = Synthesizer._sawtooth(osc2_freq, samples)
        audio = (osc1 + osc2) * 0.5
        
        # ADSR envelope
        envelope = Synthesizer._adsr_envelope(
            samples,
            int(params.attack * SAMPLE_RATE),
            int(params.decay * SAMPLE_RATE),
            params.sustain,
            int(params.release * SAMPLE_RATE)
        )
        audio *= envelope * params.velocity
        
        # Lowpass filter
        nyquist = SAMPLE_RATE / 2
        cutoff_norm = min(params.filter_cutoff / nyquist, 0.99)
        sos = signal.butter(4, cutoff_norm, 'lowpass', output='sos')
        audio = signal.sosfilt(sos, audio)
        
        # Normalize
        audio = np.clip(audio, -1.0, 1.0)
        audio_int16 = (audio * 32767).astype(np.int16)
        
        return Synthesizer._to_wav_bytes(audio_int16)
    
    @staticmethod
    def _sawtooth(frequency: float, samples: int) -> np.ndarray:
        """Generate sawtooth wave"""
        t = np.arange(samples) / SAMPLE_RATE
        return signal.sawtooth(2 * np.pi * frequency * t)
    
    @staticmethod
    def _adsr_envelope(samples: int, attack: int, decay: int, sustain: float, release: int) -> np.ndarray:
        """Generate ADSR envelope"""
        envelope = np.zeros(samples)
        
        # Attack
        attack_end = min(attack, samples)
        envelope[:attack_end] = np.linspace(0, 1, attack_end)
        
        # Decay
        decay_start = attack_end
        decay_end = min(decay_start + decay, samples)
        if decay_end > decay_start:
            envelope[decay_start:decay_end] = np.linspace(1, sustain, decay_end - decay_start)
        
        # Sustain
        sustain_start = decay_end
        sustain_end = max(samples - release, sustain_start)
        envelope[sustain_start:sustain_end] = sustain
        
        # Release
        release_start = sustain_end
        if samples > release_start:
            envelope[release_start:] = np.linspace(sustain, 0, samples - release_start)
        
        return envelope
    
    @staticmethod
    def generate_chord(params: ChordParams) -> bytes:
        """
        Generate polyphonic chord
        
        Supports:
        - Piano, organ, synth timbres
        - Major, minor, major7, minor7, dominant7, dim, aug chords
        - Rich harmonics for realistic sound
        """
        # Chord intervals (semitones from root)
        chord_intervals = {
            'major': [0, 4, 7],
            'minor': [0, 3, 7],
            'major7': [0, 4, 7, 11],
            'minor7': [0, 3, 7, 10],
            'dominant7': [0, 4, 7, 10],
            'dim': [0, 3, 6],
            'aug': [0, 4, 8],
        }
        
        intervals = chord_intervals.get(params.chord_type, [0, 4, 7])
        duration = params.duration
        samples = int(SAMPLE_RATE * duration)
        t = np.linspace(0, duration, samples, False)
        
        # Initialize audio buffer
        audio = np.zeros(samples)
        
        # Generate each note in the chord
        for interval in intervals:
            # Calculate frequency (12-tone equal temperament)
            note_freq = params.root_frequency * (2 ** (interval / 12.0))
            
            # Generate waveform based on instrument type
            if params.instrument == 'piano':
                # Piano: rich harmonics with inharmonicity
                note_audio = Synthesizer._piano_tone(note_freq, samples, params.velocity)
            elif params.instrument == 'organ':
                # Organ: pure harmonics (sine waves)
                note_audio = Synthesizer._organ_tone(note_freq, samples, params.velocity)
            else:  # synth
                # Synth: sawtooth with filter
                note_audio = Synthesizer._synth_tone(note_freq, samples, params.velocity)
            
            audio += note_audio
        
        # Normalize to prevent clipping
        audio = audio / len(intervals)
        
        # Apply envelope (ADSR)
        attack_samples = int(0.01 * SAMPLE_RATE)
        release_samples = int(0.1 * SAMPLE_RATE)
        envelope = np.ones(samples)
        
        # Attack
        if attack_samples > 0:
            envelope[:attack_samples] = np.linspace(0, 1, attack_samples)
        
        # Release
        if release_samples > 0 and release_samples < samples:
            release_start = samples - release_samples
            envelope[release_start:] = np.linspace(1, 0, release_samples)
        
        audio *= envelope * params.velocity
        
        # Final normalization and conversion
        audio = np.clip(audio, -1.0, 1.0)
        audio_int16 = (audio * 32767 * 0.8).astype(np.int16)  # 0.8 to prevent clipping
        
        return Synthesizer._to_wav_bytes(audio_int16)
    
    @staticmethod
    def _piano_tone(frequency: float, samples: int, velocity: float) -> np.ndarray:
        """Generate piano-like tone with rich harmonics"""
        t = np.arange(samples) / SAMPLE_RATE
        audio = np.zeros(samples)
        
        # Add multiple harmonics with decreasing amplitude
        harmonics = [1.0, 0.5, 0.25, 0.125, 0.0625]
        for i, amp in enumerate(harmonics):
            harmonic_freq = frequency * (i + 1)
            if harmonic_freq < SAMPLE_RATE / 2:  # Nyquist limit
                audio += amp * np.sin(2 * np.pi * harmonic_freq * t)
        
        # Piano envelope: fast attack, slow decay
        envelope = np.exp(-2 * t)
        audio *= envelope
        
        return audio
    
    @staticmethod
    def _organ_tone(frequency: float, samples: int, velocity: float) -> np.ndarray:
        """Generate organ-like tone with drawbar harmonics"""
        t = np.arange(samples) / SAMPLE_RATE
        audio = np.zeros(samples)
        
        # Organ drawbar settings (Hammond B3 style)
        # 16', 5 1/3', 8', 4', 2 2/3', 2', 1 3/5', 1 1/3'
        drawbars = [
            (0.5, 1.0),   # Sub-octave
            (1.0, 1.0),   # Fundamental
            (2.0, 0.8),   # 1st octave
            (3.0, 0.6),   # 3rd harmonic
            (4.0, 0.4),   # 2nd octave
        ]
        
        for harmonic_mult, amp in drawbars:
            harmonic_freq = frequency * harmonic_mult
            if harmonic_freq < SAMPLE_RATE / 2:
                audio += amp * np.sin(2 * np.pi * harmonic_freq * t)
        
        # Organ: sustain envelope (no decay)
        return audio
    
    @staticmethod
    def _synth_tone(frequency: float, samples: int, velocity: float) -> np.ndarray:
        """Generate synth tone (sawtooth with filter)"""
        t = np.arange(samples) / SAMPLE_RATE
        
        # Sawtooth wave
        audio = signal.sawtooth(2 * np.pi * frequency * t)
        
        # Simple lowpass filter (moving average)
        window_size = 5
        audio = np.convolve(audio, np.ones(window_size)/window_size, mode='same')
        
        return audio
    
    @staticmethod
    def generate_brass(params: BrassParams) -> bytes:
        """
        Generate brass instrument sound (trumpet, horn, trombone)
        Uses harmonic series with odd harmonics prominent for brass character
        """
        frequency = params.frequency
        duration = params.duration
        velocity = params.velocity
        instrument = params.instrument
        
        # Calculate samples
        samples = int(SAMPLE_RATE * duration)
        t = np.linspace(0, duration, samples, False)
        
        # Brass-specific harmonic series (odd harmonics more prominent)
        if instrument == 'trumpet':
            # Trumpet: Bright, piercing - strong odd harmonics
            harmonics = [
                (1, 1.0),   # Fundamental
                (2, 0.6),   # 2nd harmonic
                (3, 0.8),   # 3rd (odd) - strong
                (4, 0.4),   # 4th
                (5, 0.7),   # 5th (odd) - strong
                (6, 0.2),   # 6th
                (7, 0.5),   # 7th (odd)
                (8, 0.15),  # 8th
            ]
            attack = 0.05
            decay = 0.1
            sustain = 0.7
            release = 0.15
            
        elif instrument == 'horn':
            # French Horn: Warm, mellow - softer harmonics
            harmonics = [
                (1, 1.0),   # Fundamental
                (2, 0.7),   # 2nd harmonic
                (3, 0.6),   # 3rd
                (4, 0.5),   # 4th
                (5, 0.4),   # 5th
                (6, 0.3),   # 6th
                (7, 0.2),   # 7th
                (8, 0.1),   # 8th
            ]
            attack = 0.08
            decay = 0.12
            sustain = 0.75
            release = 0.2
            
        elif instrument == 'trombone':
            # Trombone: Deep, rich - strong lower harmonics
            harmonics = [
                (1, 1.0),   # Fundamental - very strong
                (2, 0.8),   # 2nd harmonic
                (3, 0.7),   # 3rd
                (4, 0.6),   # 4th
                (5, 0.5),   # 5th
                (6, 0.3),   # 6th
                (7, 0.2),   # 7th
                (8, 0.1),   # 8th
            ]
            attack = 0.07
            decay = 0.15
            sustain = 0.8
            release = 0.25
        else:
            # Default to trumpet
            harmonics = [(1, 1.0), (3, 0.8), (5, 0.7)]
            attack = 0.05
            decay = 0.1
            sustain = 0.7
            release = 0.15
        
        # Generate harmonic series
        audio = np.zeros(samples)
        for harmonic_num, amplitude in harmonics:
            harmonic_freq = frequency * harmonic_num
            # Add slight frequency modulation for brass vibrato
            vibrato_rate = 5.0  # 5 Hz vibrato
            vibrato_depth = 0.005  # 0.5% pitch variation
            vibrato = 1.0 + vibrato_depth * np.sin(2 * np.pi * vibrato_rate * t)
            audio += amplitude * np.sin(2 * np.pi * harmonic_freq * vibrato * t)
        
        # ADSR envelope (brass has distinct attack)
        attack_samples = int(attack * SAMPLE_RATE)
        decay_samples = int(decay * SAMPLE_RATE)
        release_samples = int(release * SAMPLE_RATE)
        sustain_samples = max(0, samples - attack_samples - decay_samples - release_samples)
        
        envelope = np.concatenate([
            # Attack: Fast rise
            np.linspace(0, 1, attack_samples),
            # Decay: Drop to sustain level
            np.linspace(1, sustain, decay_samples),
            # Sustain: Hold level
            np.ones(sustain_samples) * sustain,
            # Release: Fade out
            np.linspace(sustain, 0, release_samples)
        ])
        
        # Ensure envelope matches audio length
        if len(envelope) != len(audio):
            envelope = np.resize(envelope, len(audio))
        
        audio *= envelope * velocity
        
        # Final normalization and conversion
        audio = np.clip(audio, -1.0, 1.0)
        audio_int16 = (audio * 32767 * 0.8).astype(np.int16)  # 0.8 to prevent clipping
        
        # Convert to WAV
        return Synthesizer._to_wav_bytes(audio_int16)
    
    @staticmethod
    def generate_strings(params: StringParams) -> bytes:
        """
        Generate string instrument sound (violin, viola, cello)
        Uses sawtooth waveform with vibrato and rich harmonics
        """
        frequency = params.frequency
        duration = params.duration
        velocity = params.velocity
        vibrato_rate = params.vibrato_rate
        vibrato_depth = params.vibrato_depth
        instrument = getattr(params, 'instrument', 'violin')
        
        # Calculate samples
        samples = int(SAMPLE_RATE * duration)
        t = np.linspace(0, duration, samples, False)
        
        # String-specific characteristics
        if instrument == 'violin':
            # Violin: Bright, singing tone - strong upper harmonics
            harmonics = [
                (1, 1.0),   # Fundamental
                (2, 0.8),   # 2nd harmonic - strong
                (3, 0.7),   # 3rd harmonic
                (4, 0.6),   # 4th harmonic
                (5, 0.5),   # 5th harmonic
                (6, 0.4),   # 6th harmonic - brightness
                (7, 0.3),   # 7th harmonic
                (8, 0.2),   # 8th harmonic
            ]
            attack = 0.05
            decay = 0.1
            sustain = 0.85
            release = 0.2
            vibrato_depth = vibrato_depth * 1.2  # More expressive vibrato
            
        elif instrument == 'viola':
            # Viola: Warm, mellow - balanced harmonics
            harmonics = [
                (1, 1.0),   # Fundamental
                (2, 0.75),  # 2nd harmonic
                (3, 0.65),  # 3rd harmonic
                (4, 0.55),  # 4th harmonic
                (5, 0.45),  # 5th harmonic
                (6, 0.3),   # 6th harmonic
                (7, 0.2),   # 7th harmonic
                (8, 0.1),   # 8th harmonic
            ]
            attack = 0.06
            decay = 0.12
            sustain = 0.88
            release = 0.25
            
        elif instrument == 'cello':
            # Cello: Deep, rich - strong fundamental
            harmonics = [
                (1, 1.0),   # Fundamental - very strong
                (2, 0.85),  # 2nd harmonic
                (3, 0.7),   # 3rd harmonic
                (4, 0.6),   # 4th harmonic
                (5, 0.45),  # 5th harmonic
                (6, 0.3),   # 6th harmonic
                (7, 0.2),   # 7th harmonic
                (8, 0.1),   # 8th harmonic
            ]
            attack = 0.08
            decay = 0.15
            sustain = 0.9
            release = 0.3
            vibrato_depth = vibrato_depth * 0.8  # Subtler vibrato
        else:
            # Default to violin
            harmonics = [(1, 1.0), (2, 0.8), (3, 0.7), (4, 0.6)]
            attack = 0.05
            decay = 0.1
            sustain = 0.85
            release = 0.2
        
        # Generate vibrato modulation
        vibrato = 1.0 + vibrato_depth * np.sin(2 * np.pi * vibrato_rate * t)
        
        # Generate harmonic series with sawtooth character
        audio = np.zeros(samples)
        for harmonic_num, amplitude in harmonics:
            harmonic_freq = frequency * harmonic_num
            if harmonic_freq < SAMPLE_RATE / 2:  # Nyquist limit
                # Apply vibrato to each harmonic
                phase = 2 * np.pi * harmonic_freq * vibrato * t
                audio += amplitude * np.sin(phase)
        
        # ADSR envelope
        attack_samples = int(attack * SAMPLE_RATE)
        decay_samples = int(decay * SAMPLE_RATE)
        release_samples = int(release * SAMPLE_RATE)
        sustain_samples = max(0, samples - attack_samples - decay_samples - release_samples)
        
        envelope = np.concatenate([
            # Attack: Smooth rise (strings have natural attack)
            np.power(np.linspace(0, 1, attack_samples), 1.5),
            # Decay: Drop to sustain
            np.linspace(1, sustain, decay_samples),
            # Sustain: Hold with slight variation
            np.ones(sustain_samples) * sustain,
            # Release: Smooth fade
            np.power(np.linspace(1, 0, release_samples), 2)
        ])
        
        # Ensure envelope matches audio length
        if len(envelope) != len(audio):
            envelope = np.resize(envelope, len(audio))
        
        audio *= envelope * velocity
        
        # Add slight bow noise (high-frequency content)
        if samples > 0:
            bow_noise = np.random.randn(samples) * 0.02 * velocity
            bow_noise = signal.sosfilt(signal.butter(4, 2000, 'hp', fs=SAMPLE_RATE, output='sos'), bow_noise)
            audio += bow_noise * envelope
        
        # Final normalization and conversion
        audio = np.clip(audio, -1.0, 1.0)
        audio_int16 = (audio * 32767 * 0.8).astype(np.int16)
        
        # Convert to WAV
        return Synthesizer._to_wav_bytes(audio_int16)
    
    @staticmethod
    def _to_wav_bytes(audio_int16: np.ndarray) -> bytes:
        """Convert audio array to WAV bytes"""
        buffer = io.BytesIO()
        with wave.open(buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(SAMPLE_RATE)
            wav_file.writeframes(audio_int16.tobytes())
        return buffer.getvalue()


# REST API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "HAOS.fm Audio Engine",
        "version": "1.0.0",
        "sample_rate": SAMPLE_RATE
    }


@app.post("/api/audio/play-kick")
async def play_kick(params: KickParams):
    """
    Generate TR-808 kick drum
    Returns: base64 encoded WAV audio
    """
    try:
        audio_bytes = Synthesizer.generate_kick(params)
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {
            "success": True,
            "audio": audio_base64,
            "format": "wav",
            "sample_rate": SAMPLE_RATE
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/play-snare")
async def play_snare(velocity: float = 1.0):
    """
    Generate TR-808 snare drum
    Returns: base64 encoded WAV audio
    """
    try:
        audio_bytes = Synthesizer.generate_snare(velocity)
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {
            "success": True,
            "audio": audio_base64,
            "format": "wav",
            "sample_rate": SAMPLE_RATE
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/play-hihat")
async def play_hihat(velocity: float = 1.0, open: bool = False):
    """
    Generate TR-808 hi-hat (closed or open)
    Returns: base64 encoded WAV audio
    """
    try:
        audio_bytes = Synthesizer.generate_hihat(velocity, open)
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {
            "success": True,
            "audio": audio_base64,
            "format": "wav",
            "sample_rate": SAMPLE_RATE
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/play-clap")
async def play_clap(velocity: float = 1.0):
    """
    Generate TR-808 hand clap
    Returns: base64 encoded WAV audio
    """
    try:
        audio_bytes = Synthesizer.generate_clap(velocity)
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {
            "success": True,
            "audio": audio_base64,
            "format": "wav",
            "sample_rate": SAMPLE_RATE
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/play-synth")
async def play_synth(params: SynthParams):
    """
    Generate ARP 2600 style synthesizer sound
    Returns: base64 encoded WAV audio
    """
    try:
        audio_bytes = Synthesizer.generate_arp2600(params)
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {
            "success": True,
            "audio": audio_base64,
            "format": "wav",
            "sample_rate": SAMPLE_RATE
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/play-chord")
async def play_chord(params: ChordParams):
    """
    Generate piano/organ/synth chord
    
    Supports:
    - Chord types: major, minor, major7, minor7, dominant7, dim, aug
    - Instruments: piano, organ, synth
    - Root frequency in Hz (e.g., 261.63 for middle C)
    
    Returns: base64 encoded WAV audio
    """
    try:
        audio_bytes = Synthesizer.generate_chord(params)
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {
            "success": True,
            "audio": audio_base64,
            "format": "wav",
            "sample_rate": SAMPLE_RATE,
            "chord": f"{params.chord_type} chord at {params.root_frequency:.2f} Hz",
            "instrument": params.instrument
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/play-brass")
async def play_brass(params: BrassParams):
    """
    Generate brass instrument sound (trumpet, horn, trombone)
    
    Supports:
    - Instruments: trumpet (bright, piercing), horn (warm, mellow), trombone (deep, rich)
    - Frequency in Hz (e.g., 440 for A4)
    - Duration and velocity control
    
    Returns: base64 encoded WAV audio
    """
    try:
        audio_bytes = Synthesizer.generate_brass(params)
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {
            "success": True,
            "audio": audio_base64,
            "format": "wav",
            "sample_rate": SAMPLE_RATE,
            "instrument": params.instrument,
            "frequency": f"{params.frequency:.2f} Hz",
            "duration": f"{params.duration:.2f}s"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/play-strings")
async def play_strings(params: StringParams):
    """
    Generate string instrument sound (violin, viola, cello)
    
    Supports:
    - Instruments: violin (bright, singing), viola (warm, mellow), cello (deep, rich)
    - Frequency in Hz (e.g., 440 for A4)
    - Vibrato control (rate and depth)
    - Duration and velocity control
    
    Returns: base64 encoded WAV audio
    """
    try:
        audio_bytes = Synthesizer.generate_strings(params)
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {
            "success": True,
            "audio": audio_base64,
            "format": "wav",
            "sample_rate": SAMPLE_RATE,
            "instrument": getattr(params, 'instrument', 'violin'),
            "frequency": f"{params.frequency:.2f} Hz",
            "duration": f"{params.duration:.2f}s",
            "vibrato": f"{params.vibrato_rate:.1f} Hz @ {params.vibrato_depth*100:.1f}%"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
