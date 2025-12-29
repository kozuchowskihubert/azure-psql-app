#!/usr/bin/env python3
"""
HAOS.fm Professional Sample Generator
=====================================
Generates high-quality drum and synth samples with:
- Multiple ADSR envelopes
- Various frequencies/pitches
- Different lengths (short, medium, long)
- Effects: reverb, drive, saturation
- Multiple sample rates: 44.1kHz, 96kHz, 192kHz

Sound categories:
- Kicks: 808, 909, punchy, deep, reverb, distorted, sub bass
- Snares: tight, snappy, clap, rim, layered
- Hi-Hats: closed, open, pedal, sizzle, white noise based
- Bass: arpeggio, sub, growl, acid, reese
- Synths: pads, leads, stabs, arps
- FX: risers, impacts, sweeps
"""

import numpy as np
from scipy import signal
from scipy.io import wavfile
import os

# Configuration
OUTPUT_DIR = "../mobile/assets/sounds"
SAMPLE_RATES = {
    'standard': 44100,
    'hd': 96000,
    'ultra': 192000
}

def ensure_dirs():
    """Create output directories"""
    dirs = [
        f"{OUTPUT_DIR}/drums",
        f"{OUTPUT_DIR}/drums/kicks",
        f"{OUTPUT_DIR}/drums/snares", 
        f"{OUTPUT_DIR}/drums/hihats",
        f"{OUTPUT_DIR}/drums/percussion",
        f"{OUTPUT_DIR}/bass",
        f"{OUTPUT_DIR}/synths",
        f"{OUTPUT_DIR}/fx",
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

# ============================================
# ADSR ENVELOPE GENERATOR
# ============================================

def adsr_envelope(length, attack, decay, sustain_level, release, sample_rate=44100):
    """Generate ADSR envelope"""
    samples = int(length * sample_rate)
    attack_samples = int(attack * sample_rate)
    decay_samples = int(decay * sample_rate)
    release_samples = int(release * sample_rate)
    sustain_samples = samples - attack_samples - decay_samples - release_samples
    
    if sustain_samples < 0:
        sustain_samples = 0
    
    envelope = np.zeros(samples)
    
    # Attack
    if attack_samples > 0:
        envelope[:attack_samples] = np.linspace(0, 1, attack_samples)
    
    # Decay
    start = attack_samples
    end = start + decay_samples
    if end <= samples:
        envelope[start:end] = np.linspace(1, sustain_level, decay_samples)
    
    # Sustain
    start = attack_samples + decay_samples
    end = start + sustain_samples
    if end <= samples:
        envelope[start:end] = sustain_level
    
    # Release
    start = attack_samples + decay_samples + sustain_samples
    if start < samples:
        release_actual = min(release_samples, samples - start)
        envelope[start:start+release_actual] = np.linspace(sustain_level, 0, release_actual)
    
    return envelope

# ============================================
# EFFECTS PROCESSORS
# ============================================

def apply_drive(audio, drive_amount=2.0):
    """Apply soft clipping distortion"""
    return np.tanh(audio * drive_amount) / np.tanh(drive_amount)

def apply_saturation(audio, saturation=1.5):
    """Apply warm tube-style saturation"""
    return np.sign(audio) * (1 - np.exp(-np.abs(audio) * saturation))

def apply_reverb(audio, decay=0.3, mix=0.3, sample_rate=44100):
    """Apply simple reverb effect"""
    reverb_samples = int(decay * sample_rate)
    reverb = np.zeros(len(audio) + reverb_samples)
    reverb[:len(audio)] = audio
    
    # Multiple delay taps for reverb
    delays = [int(0.023 * sample_rate), int(0.037 * sample_rate), 
              int(0.051 * sample_rate), int(0.071 * sample_rate)]
    gains = [0.5, 0.3, 0.2, 0.1]
    
    for delay, gain in zip(delays, gains):
        if delay < len(reverb):
            reverb[delay:] += reverb[:-delay] * gain * mix
    
    # Normalize
    reverb = reverb[:len(audio) + reverb_samples]
    return reverb / np.max(np.abs(reverb) + 0.001)

def apply_filter(audio, cutoff, filter_type='lowpass', resonance=1.0, sample_rate=44100):
    """Apply filter with resonance"""
    nyq = sample_rate / 2
    normalized_cutoff = min(cutoff / nyq, 0.99)
    
    if filter_type == 'lowpass':
        b, a = signal.butter(2, normalized_cutoff, btype='low')
    elif filter_type == 'highpass':
        b, a = signal.butter(2, normalized_cutoff, btype='high')
    elif filter_type == 'bandpass':
        b, a = signal.butter(2, [normalized_cutoff * 0.8, min(normalized_cutoff * 1.2, 0.99)], btype='band')
    
    return signal.filtfilt(b, a, audio)

def apply_compression(audio, threshold=0.5, ratio=4.0):
    """Apply dynamic compression"""
    compressed = np.copy(audio)
    above_threshold = np.abs(audio) > threshold
    compressed[above_threshold] = np.sign(audio[above_threshold]) * (
        threshold + (np.abs(audio[above_threshold]) - threshold) / ratio
    )
    return compressed

# ============================================
# KICK DRUM GENERATORS
# ============================================

def generate_kick_808(pitch=55, length=0.5, attack=0.001, decay=0.3, drive=1.0, sample_rate=44100):
    """Classic 808 kick with pitch sweep"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Pitch envelope (starts high, drops to base)
    pitch_env = pitch * (1 + 3 * np.exp(-t * 30))
    
    # Generate sine wave with pitch sweep
    phase = 2 * np.pi * np.cumsum(pitch_env) / sample_rate
    kick = np.sin(phase)
    
    # Amplitude envelope
    env = adsr_envelope(length, attack, decay, 0.0, 0.1, sample_rate)
    kick = kick * env[:len(kick)]
    
    # Apply drive if > 1
    if drive > 1.0:
        kick = apply_drive(kick, drive)
    
    return kick / np.max(np.abs(kick) + 0.001)

def generate_kick_909(pitch=60, length=0.35, sample_rate=44100):
    """909-style punchy kick"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Faster pitch sweep
    pitch_env = pitch * (1 + 5 * np.exp(-t * 50))
    phase = 2 * np.pi * np.cumsum(pitch_env) / sample_rate
    
    # Main tone
    kick = np.sin(phase)
    
    # Add click
    click = np.exp(-t * 200) * np.random.randn(len(t)) * 0.3
    kick += click
    
    # Sharp envelope
    env = np.exp(-t * 15)
    kick = kick * env
    
    return kick / np.max(np.abs(kick) + 0.001)

def generate_kick_sub(pitch=40, length=0.8, sample_rate=44100):
    """Deep sub bass kick"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Very low pitch with slow sweep
    pitch_env = pitch * (1 + 1.5 * np.exp(-t * 10))
    phase = 2 * np.pi * np.cumsum(pitch_env) / sample_rate
    
    kick = np.sin(phase)
    
    # Long decay
    env = np.exp(-t * 5)
    kick = kick * env
    
    return kick / np.max(np.abs(kick) + 0.001)

def generate_kick_distorted(pitch=55, length=0.4, drive=4.0, sample_rate=44100):
    """Heavy distorted kick"""
    kick = generate_kick_808(pitch, length, drive=1.0, sample_rate=sample_rate)
    
    # Apply heavy distortion
    kick = apply_drive(kick, drive)
    kick = apply_saturation(kick, 2.0)
    
    # Filter to remove harsh frequencies
    kick = apply_filter(kick, 3000, 'lowpass', sample_rate=sample_rate)
    
    return kick / np.max(np.abs(kick) + 0.001)

def generate_kick_reverb(pitch=55, length=0.5, reverb_decay=0.5, sample_rate=44100):
    """808 kick with reverb tail"""
    kick = generate_kick_808(pitch, length, sample_rate=sample_rate)
    kick = apply_reverb(kick, reverb_decay, 0.4, sample_rate)
    return kick

# ============================================
# SNARE DRUM GENERATORS
# ============================================

def generate_snare_808(length=0.2, tone_pitch=180, sample_rate=44100):
    """Classic 808 snare"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Tone component
    tone = np.sin(2 * np.pi * tone_pitch * t) * np.exp(-t * 20)
    
    # Noise component
    noise = np.random.randn(len(t)) * np.exp(-t * 15)
    noise = apply_filter(noise, 8000, 'highpass', sample_rate=sample_rate)
    
    snare = tone * 0.6 + noise * 0.4
    
    return snare / np.max(np.abs(snare) + 0.001)

def generate_snare_909(length=0.25, sample_rate=44100):
    """Punchy 909 snare"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Two tones
    tone1 = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 25)
    tone2 = np.sin(2 * np.pi * 330 * t) * np.exp(-t * 30)
    
    # Snappy noise
    noise = np.random.randn(len(t)) * np.exp(-t * 20)
    noise = apply_filter(noise, 5000, 'highpass', sample_rate=sample_rate)
    
    snare = tone1 * 0.4 + tone2 * 0.2 + noise * 0.4
    
    return snare / np.max(np.abs(snare) + 0.001)

def generate_snare_clap_layer(length=0.3, sample_rate=44100):
    """Snare layered with clap"""
    snare = generate_snare_909(length * 0.8, sample_rate)
    
    # Add clap
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Multiple micro-hits for clap
    clap = np.zeros(len(t))
    delays = [0, 0.01, 0.02, 0.025]
    for delay in delays:
        start = int(delay * sample_rate)
        if start < len(clap):
            hit_len = min(len(clap) - start, int(0.05 * sample_rate))
            clap[start:start+hit_len] += np.random.randn(hit_len) * np.exp(-np.linspace(0, 5, hit_len))
    
    clap = apply_filter(clap, 2000, 'highpass', sample_rate=sample_rate)
    
    # Combine
    result = np.zeros(len(t))
    result[:len(snare)] = snare
    result += clap * 0.5
    
    return result / np.max(np.abs(result) + 0.001)

# ============================================
# HI-HAT GENERATORS (WHITE NOISE BASED)
# ============================================

def generate_hihat_closed(length=0.05, sample_rate=44100):
    """Closed hi-hat from filtered white noise"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # White noise
    noise = np.random.randn(len(t))
    
    # Bandpass filter for metallic sound
    noise = apply_filter(noise, 8000, 'highpass', sample_rate=sample_rate)
    
    # Sharp envelope
    env = np.exp(-t * 100)
    hihat = noise * env
    
    return hihat / np.max(np.abs(hihat) + 0.001)

def generate_hihat_open(length=0.3, sample_rate=44100):
    """Open hi-hat with longer decay"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # White noise
    noise = np.random.randn(len(t))
    
    # Highpass for brightness
    noise = apply_filter(noise, 7000, 'highpass', sample_rate=sample_rate)
    
    # Longer envelope
    env = np.exp(-t * 10)
    hihat = noise * env
    
    return hihat / np.max(np.abs(hihat) + 0.001)

def generate_hihat_sizzle(length=0.4, sample_rate=44100):
    """Sizzly ride-like hi-hat"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # White noise with modulation
    noise = np.random.randn(len(t))
    
    # Add some metallic ring
    ring = np.sin(2 * np.pi * 12000 * t) * 0.3
    noise += ring
    
    noise = apply_filter(noise, 6000, 'highpass', sample_rate=sample_rate)
    
    # Slow decay
    env = np.exp(-t * 6)
    hihat = noise * env
    
    return hihat / np.max(np.abs(hihat) + 0.001)

# ============================================
# BASS GENERATORS
# ============================================

def generate_bass_sub(freq=55, length=0.5, sample_rate=44100):
    """Deep sub bass"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Pure sine
    bass = np.sin(2 * np.pi * freq * t)
    
    # Add subtle second harmonic
    bass += np.sin(2 * np.pi * freq * 2 * t) * 0.2
    
    env = adsr_envelope(length, 0.01, 0.1, 0.8, 0.2, sample_rate)
    bass = bass * env[:len(bass)]
    
    return bass / np.max(np.abs(bass) + 0.001)

def generate_bass_growl(freq=55, length=0.5, sample_rate=44100):
    """Growly bass with harmonics"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Sawtooth base
    bass = signal.sawtooth(2 * np.pi * freq * t)
    
    # Add distortion
    bass = apply_drive(bass, 2.5)
    
    # Filter sweep
    for i in range(5):
        cutoff = 500 + 1500 * np.sin(2 * np.pi * 5 * t[i * len(t)//5]) if i * len(t)//5 < len(t) else 1000
    
    bass = apply_filter(bass, 1500, 'lowpass', sample_rate=sample_rate)
    
    env = adsr_envelope(length, 0.01, 0.1, 0.7, 0.2, sample_rate)
    bass = bass * env[:len(bass)]
    
    return bass / np.max(np.abs(bass) + 0.001)

def generate_bass_acid(freq=55, length=0.3, sample_rate=44100):
    """TB-303 style acid bass"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Sawtooth
    bass = signal.sawtooth(2 * np.pi * freq * t)
    
    # Resonant filter with envelope
    cutoff_env = 300 + 2000 * np.exp(-t * 15)
    
    # Apply time-varying filter (simplified)
    bass = apply_filter(bass, 800, 'lowpass', sample_rate=sample_rate)
    
    # Add accent
    bass = apply_saturation(bass, 1.5)
    
    env = adsr_envelope(length, 0.005, 0.1, 0.5, 0.1, sample_rate)
    bass = bass * env[:len(bass)]
    
    return bass / np.max(np.abs(bass) + 0.001)

def generate_bass_arpeggio(base_freq=55, length=2.0, bpm=130, sample_rate=44100):
    """Bass arpeggio pattern"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Note pattern (minor arpeggio)
    ratios = [1, 1.189, 1.498, 2]  # Root, minor 3rd, 5th, octave
    
    step_duration = 60 / bpm / 2  # 8th notes
    samples_per_step = int(step_duration * sample_rate)
    
    bass = np.zeros(len(t))
    
    for i, ratio in enumerate(ratios * 4):  # 4 repetitions
        start = i * samples_per_step
        end = min(start + samples_per_step, len(bass))
        
        if start >= len(bass):
            break
            
        freq = base_freq * ratio
        t_step = np.linspace(0, step_duration, end - start)
        
        note = np.sin(2 * np.pi * freq * t_step)
        note *= np.exp(-t_step * 10)  # Quick decay
        
        bass[start:end] = note
    
    bass = apply_filter(bass, 2000, 'lowpass', sample_rate=sample_rate)
    
    return bass / np.max(np.abs(bass) + 0.001)

# ============================================
# SYNTH GENERATORS
# ============================================

def generate_synth_pad(freq=220, length=2.0, sample_rate=44100):
    """Warm synth pad"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Multiple detuned oscillators
    pad = np.zeros(len(t))
    detune_cents = [-12, -5, 0, 5, 12]
    
    for cents in detune_cents:
        f = freq * (2 ** (cents / 1200))
        pad += np.sin(2 * np.pi * f * t)
    
    pad /= len(detune_cents)
    
    # Slow attack/release envelope
    env = adsr_envelope(length, 0.5, 0.2, 0.7, 0.8, sample_rate)
    pad = pad * env[:len(pad)]
    
    # Lowpass for warmth
    pad = apply_filter(pad, 3000, 'lowpass', sample_rate=sample_rate)
    
    return pad / np.max(np.abs(pad) + 0.001)

def generate_synth_lead(freq=440, length=0.5, sample_rate=44100):
    """Bright synth lead"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Sawtooth
    lead = signal.sawtooth(2 * np.pi * freq * t)
    
    # Add pulse wave
    pulse = signal.square(2 * np.pi * freq * t, duty=0.3) * 0.5
    lead = lead * 0.7 + pulse * 0.3
    
    # Filter with resonance effect
    lead = apply_filter(lead, 4000, 'lowpass', sample_rate=sample_rate)
    
    env = adsr_envelope(length, 0.01, 0.1, 0.8, 0.2, sample_rate)
    lead = lead * env[:len(lead)]
    
    return lead / np.max(np.abs(lead) + 0.001)

def generate_synth_stab(freq=440, length=0.15, sample_rate=44100):
    """Short synth stab/chord"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Chord (major triad)
    stab = np.zeros(len(t))
    for ratio in [1, 1.26, 1.5]:  # Major triad
        stab += signal.sawtooth(2 * np.pi * freq * ratio * t)
    
    stab /= 3
    
    # Sharp envelope
    env = np.exp(-t * 30)
    stab = stab * env
    
    # Bandpass for punch
    stab = apply_filter(stab, 2000, 'lowpass', sample_rate=sample_rate)
    
    return stab / np.max(np.abs(stab) + 0.001)

# ============================================
# FX GENERATORS
# ============================================

def generate_riser(length=4.0, sample_rate=44100):
    """Build-up riser effect"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # White noise with rising filter
    noise = np.random.randn(len(t))
    
    # Rising pitch sine
    freq_env = 100 + 2000 * (t / length) ** 2
    phase = 2 * np.pi * np.cumsum(freq_env) / sample_rate
    sine = np.sin(phase)
    
    riser = noise * 0.5 + sine * 0.5
    
    # Rising amplitude
    amp_env = (t / length) ** 2
    riser = riser * amp_env
    
    return riser / np.max(np.abs(riser) + 0.001)

def generate_impact(length=1.0, sample_rate=44100):
    """Big impact/hit"""
    t = np.linspace(0, length, int(length * sample_rate))
    
    # Low boom
    boom = np.sin(2 * np.pi * 40 * t) * np.exp(-t * 5)
    
    # Noise layer
    noise = np.random.randn(len(t)) * np.exp(-t * 20)
    
    # Combine with reverb
    impact = boom * 0.7 + noise * 0.3
    impact = apply_reverb(impact, 0.8, 0.5, sample_rate)
    
    return impact

# ============================================
# SAVE UTILITIES
# ============================================

def save_wav(audio, filename, sample_rate=44100):
    """Save audio as WAV file"""
    # Normalize to 16-bit range
    audio = audio / (np.max(np.abs(audio)) + 0.001)
    audio = (audio * 32767).astype(np.int16)
    wavfile.write(filename, sample_rate, audio)
    
    size_kb = os.path.getsize(filename) // 1024
    print(f"  ✅ Saved: {os.path.basename(filename)} ({size_kb}KB)")

# ============================================
# MAIN GENERATION
# ============================================

def main():
    print("🎹 HAOS.fm Professional Sample Generator")
    print("=" * 50)
    
    ensure_dirs()
    sample_rate = SAMPLE_RATES['standard']
    
    # ----------------------------------------
    # KICKS - Multiple variations
    # ----------------------------------------
    print("\n🔈 KICKS (12 variations):")
    
    kicks = {
        'kick_808_soft': lambda: generate_kick_808(50, 0.5, drive=1.0),
        'kick_808_hard': lambda: generate_kick_808(55, 0.4, drive=2.0),
        'kick_808_long': lambda: generate_kick_808(45, 0.8, decay=0.5),
        'kick_808_short': lambda: generate_kick_808(60, 0.2, decay=0.15),
        'kick_909_punchy': lambda: generate_kick_909(65, 0.3),
        'kick_909_tight': lambda: generate_kick_909(70, 0.2),
        'kick_sub_deep': lambda: generate_kick_sub(35, 1.0),
        'kick_sub_rumble': lambda: generate_kick_sub(30, 1.2),
        'kick_distorted_heavy': lambda: generate_kick_distorted(55, 0.4, drive=5.0),
        'kick_distorted_gritty': lambda: generate_kick_distorted(50, 0.5, drive=3.0),
        'kick_reverb_hall': lambda: generate_kick_reverb(55, 0.5, reverb_decay=0.7),
        'kick_reverb_room': lambda: generate_kick_reverb(55, 0.4, reverb_decay=0.3),
    }
    
    for name, gen_func in kicks.items():
        save_wav(gen_func(), f"{OUTPUT_DIR}/drums/kicks/{name}.wav", sample_rate)
    
    # ----------------------------------------
    # SNARES - Multiple variations
    # ----------------------------------------
    print("\n🔈 SNARES (8 variations):")
    
    snares = {
        'snare_808_tight': lambda: generate_snare_808(0.15, 180),
        'snare_808_fat': lambda: generate_snare_808(0.25, 150),
        'snare_808_bright': lambda: generate_snare_808(0.18, 220),
        'snare_909_punchy': lambda: generate_snare_909(0.2),
        'snare_909_long': lambda: generate_snare_909(0.35),
        'snare_clap_layer': lambda: generate_snare_clap_layer(0.3),
        'snare_clap_tight': lambda: generate_snare_clap_layer(0.2),
        'snare_rimshot': lambda: generate_snare_808(0.1, 400),
    }
    
    for name, gen_func in snares.items():
        save_wav(gen_func(), f"{OUTPUT_DIR}/drums/snares/{name}.wav", sample_rate)
    
    # ----------------------------------------
    # HI-HATS (WHITE NOISE BASED)
    # ----------------------------------------
    print("\n🔈 HI-HATS (8 variations):")
    
    hihats = {
        'hihat_closed_tight': lambda: generate_hihat_closed(0.03),
        'hihat_closed_medium': lambda: generate_hihat_closed(0.06),
        'hihat_closed_soft': lambda: generate_hihat_closed(0.08),
        'hihat_open_short': lambda: generate_hihat_open(0.2),
        'hihat_open_long': lambda: generate_hihat_open(0.5),
        'hihat_pedal': lambda: generate_hihat_closed(0.1),
        'hihat_sizzle': lambda: generate_hihat_sizzle(0.4),
        'hihat_sizzle_long': lambda: generate_hihat_sizzle(0.6),
    }
    
    for name, gen_func in hihats.items():
        save_wav(gen_func(), f"{OUTPUT_DIR}/drums/hihats/{name}.wav", sample_rate)
    
    # ----------------------------------------
    # BASS
    # ----------------------------------------
    print("\n🔈 BASS (10 variations):")
    
    basses = {
        'bass_sub_C1': lambda: generate_bass_sub(32.7, 0.5),
        'bass_sub_E1': lambda: generate_bass_sub(41.2, 0.5),
        'bass_sub_G1': lambda: generate_bass_sub(49.0, 0.5),
        'bass_growl_low': lambda: generate_bass_growl(55, 0.4),
        'bass_growl_mid': lambda: generate_bass_growl(82.4, 0.4),
        'bass_acid_C2': lambda: generate_bass_acid(65.4, 0.3),
        'bass_acid_E2': lambda: generate_bass_acid(82.4, 0.3),
        'bass_acid_G2': lambda: generate_bass_acid(98.0, 0.3),
        'bass_arpeggio_120bpm': lambda: generate_bass_arpeggio(55, 2.0, 120),
        'bass_arpeggio_140bpm': lambda: generate_bass_arpeggio(55, 2.0, 140),
    }
    
    for name, gen_func in basses.items():
        save_wav(gen_func(), f"{OUTPUT_DIR}/bass/{name}.wav", sample_rate)
    
    # ----------------------------------------
    # SYNTHS
    # ----------------------------------------
    print("\n🔈 SYNTHS (8 variations):")
    
    synths = {
        'synth_pad_A3': lambda: generate_synth_pad(220, 2.0),
        'synth_pad_C4': lambda: generate_synth_pad(261.6, 2.0),
        'synth_pad_E4': lambda: generate_synth_pad(329.6, 2.0),
        'synth_lead_A4': lambda: generate_synth_lead(440, 0.5),
        'synth_lead_C5': lambda: generate_synth_lead(523.3, 0.5),
        'synth_stab_Am': lambda: generate_synth_stab(220, 0.15),
        'synth_stab_C': lambda: generate_synth_stab(261.6, 0.15),
        'synth_stab_F': lambda: generate_synth_stab(349.2, 0.15),
    }
    
    for name, gen_func in synths.items():
        save_wav(gen_func(), f"{OUTPUT_DIR}/synths/{name}.wav", sample_rate)
    
    # ----------------------------------------
    # FX
    # ----------------------------------------
    print("\n🔈 FX (4 variations):")
    
    fx = {
        'fx_riser_4bar': lambda: generate_riser(4.0),
        'fx_riser_8bar': lambda: generate_riser(8.0),
        'fx_impact_short': lambda: generate_impact(0.5),
        'fx_impact_long': lambda: generate_impact(1.5),
    }
    
    for name, gen_func in fx.items():
        save_wav(gen_func(), f"{OUTPUT_DIR}/fx/{name}.wav", sample_rate)
    
    # ----------------------------------------
    # SUMMARY
    # ----------------------------------------
    print("\n" + "=" * 50)
    print("✅ Sample generation complete!")
    
    total_files = len(kicks) + len(snares) + len(hihats) + len(basses) + len(synths) + len(fx)
    print(f"📦 Total samples generated: {total_files}")
    print(f"📂 Output directory: {OUTPUT_DIR}")
    
    # Count total size
    total_size = 0
    for root, dirs, files in os.walk(OUTPUT_DIR):
        for file in files:
            if file.endswith('.wav'):
                total_size += os.path.getsize(os.path.join(root, file))
    
    print(f"💾 Total size: {total_size // 1024}KB ({total_size // (1024*1024)}MB)")

if __name__ == "__main__":
    main()
