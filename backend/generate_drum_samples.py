"""
HAOS.fm Drum Sample Generator
Generates all TR-808/909 style drum sounds as WAV files
"""

import numpy as np
from scipy import signal
import wave
import os

SAMPLE_RATE = 44100
OUTPUT_DIR = "../mobile/assets/sounds/drums"

def to_wav_bytes(audio_int16, filename):
    """Save audio to WAV file"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with wave.open(filepath, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(audio_int16.tobytes())
    print(f"  ✅ Saved: {filename}")
    return filepath

def normalize_and_convert(audio):
    """Normalize audio and convert to int16"""
    audio = np.clip(audio, -1.0, 1.0)
    return (audio * 32767).astype(np.int16)

# ============================================================
# KICK DRUMS
# ============================================================

def generate_kick_808(pitch=150, decay=0.5, punch=0.8):
    """TR-808 style kick"""
    duration = decay
    samples = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, samples, False)
    
    # Pitch envelope: sweep from high to low
    pitch_env = pitch * np.exp(-4 * t / duration) + 40
    
    # Generate sine with pitch modulation
    phase = np.cumsum(2 * np.pi * pitch_env / SAMPLE_RATE)
    audio = np.sin(phase)
    
    # Punch: add initial click
    click_samples = int(SAMPLE_RATE * 0.005)
    audio[:click_samples] += np.random.uniform(-0.3, 0.3, click_samples) * punch
    
    # Amplitude envelope
    amp_env = np.exp(-5 * t / duration)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_kick_909(pitch=120, decay=0.4):
    """TR-909 style kick - punchier"""
    duration = decay
    samples = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, samples, False)
    
    # Faster pitch sweep
    pitch_env = pitch * np.exp(-8 * t / duration) + 35
    phase = np.cumsum(2 * np.pi * pitch_env / SAMPLE_RATE)
    audio = np.sin(phase)
    
    # Add distortion
    audio = np.tanh(audio * 1.5)
    
    # Sharper envelope
    amp_env = np.exp(-8 * t / duration)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_kick_deep(pitch=60, decay=0.8):
    """Deep sub kick"""
    duration = decay
    samples = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, samples, False)
    
    pitch_env = pitch * np.exp(-2 * t / duration) + 30
    phase = np.cumsum(2 * np.pi * pitch_env / SAMPLE_RATE)
    audio = np.sin(phase)
    
    # Long tail envelope
    amp_env = np.exp(-3 * t / duration)
    audio *= amp_env
    
    return normalize_and_convert(audio)

# ============================================================
# SNARES
# ============================================================

def generate_snare_808(decay=0.15, noise_amount=0.7):
    """TR-808 style snare"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    # Tonal: two sine waves
    tone1 = np.sin(2 * np.pi * 180 * t)
    tone2 = np.sin(2 * np.pi * 330 * t)
    tonal = (tone1 + tone2) * 0.3
    
    # Noise
    noise = np.random.uniform(-1, 1, samples) * noise_amount
    
    audio = tonal + noise
    amp_env = np.exp(-15 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_snare_909(decay=0.2):
    """TR-909 style snare - crispier"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    # Higher pitched tones
    tone1 = np.sin(2 * np.pi * 220 * t)
    tone2 = np.sin(2 * np.pi * 400 * t)
    tonal = (tone1 + tone2) * 0.4
    
    # Filtered noise
    noise = np.random.uniform(-1, 1, samples)
    # Simple high-pass effect
    noise = np.diff(np.concatenate([[0], noise])) * 0.6
    
    audio = tonal + noise
    amp_env = np.exp(-12 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_snare_clicky(decay=0.12):
    """Clicky snare"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    # Strong attack click
    tone = np.sin(2 * np.pi * 250 * t) * 0.5
    noise = np.random.uniform(-1, 1, samples) * 0.8
    
    audio = tone + noise
    # Very fast decay
    amp_env = np.exp(-25 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

# ============================================================
# HI-HATS
# ============================================================

def generate_hihat_closed(decay=0.05):
    """Closed hi-hat"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    # Metallic noise (multiple frequencies)
    audio = np.zeros(samples)
    for freq in [5000, 7500, 10000, 12000]:
        audio += np.sin(2 * np.pi * freq * t + np.random.random() * 2 * np.pi) * 0.25
    
    # Add noise
    audio += np.random.uniform(-0.5, 0.5, samples)
    
    amp_env = np.exp(-40 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_hihat_open(decay=0.3):
    """Open hi-hat"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    audio = np.zeros(samples)
    for freq in [5000, 7500, 10000, 12000]:
        audio += np.sin(2 * np.pi * freq * t + np.random.random() * 2 * np.pi) * 0.25
    
    audio += np.random.uniform(-0.5, 0.5, samples)
    
    # Slower decay
    amp_env = np.exp(-8 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_hihat_pedal(decay=0.08):
    """Pedal hi-hat (foot closed)"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    audio = np.zeros(samples)
    for freq in [4000, 6000, 8000]:
        audio += np.sin(2 * np.pi * freq * t) * 0.3
    
    audio += np.random.uniform(-0.4, 0.4, samples)
    
    amp_env = np.exp(-30 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

# ============================================================
# CYMBALS
# ============================================================

def generate_ride(decay=0.8):
    """Ride cymbal"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    audio = np.zeros(samples)
    # More complex harmonics
    for freq in [3000, 4500, 6000, 7500, 9000, 11000]:
        audio += np.sin(2 * np.pi * freq * t + np.random.random() * 2 * np.pi) * 0.15
    
    audio += np.random.uniform(-0.3, 0.3, samples)
    
    # Long sustain
    amp_env = np.exp(-3 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_crash(decay=1.5):
    """Crash cymbal"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    audio = np.zeros(samples)
    for freq in [2500, 4000, 5500, 7000, 9000, 12000, 15000]:
        audio += np.sin(2 * np.pi * freq * t + np.random.random() * 2 * np.pi) * 0.12
    
    audio += np.random.uniform(-0.4, 0.4, samples)
    
    amp_env = np.exp(-2 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

# ============================================================
# CLAPS & SNAPS
# ============================================================

def generate_clap(decay=0.15):
    """Handclap"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    audio = np.random.uniform(-1, 1, samples)
    
    # Multiple attack transients (clap has 3-4 quick hits)
    for i, offset in enumerate([0, 0.01, 0.02, 0.025]):
        start = int(offset * SAMPLE_RATE)
        if start < samples:
            burst = min(int(0.008 * SAMPLE_RATE), samples - start)
            audio[start:start+burst] *= (1.5 - i * 0.3)
    
    amp_env = np.exp(-20 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_snap(decay=0.08):
    """Finger snap"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    # Short click + noise tail
    click = np.sin(2 * np.pi * 1000 * t) * 0.5
    noise = np.random.uniform(-0.5, 0.5, samples)
    
    audio = click + noise
    amp_env = np.exp(-50 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

# ============================================================
# TOMS
# ============================================================

def generate_tom_low(decay=0.4):
    """Low tom"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    pitch_env = 100 * np.exp(-5 * t / decay) + 60
    phase = np.cumsum(2 * np.pi * pitch_env / SAMPLE_RATE)
    audio = np.sin(phase)
    
    amp_env = np.exp(-6 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_tom_mid(decay=0.3):
    """Mid tom"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    pitch_env = 150 * np.exp(-6 * t / decay) + 80
    phase = np.cumsum(2 * np.pi * pitch_env / SAMPLE_RATE)
    audio = np.sin(phase)
    
    amp_env = np.exp(-7 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_tom_high(decay=0.25):
    """High tom"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    pitch_env = 200 * np.exp(-7 * t / decay) + 100
    phase = np.cumsum(2 * np.pi * pitch_env / SAMPLE_RATE)
    audio = np.sin(phase)
    
    amp_env = np.exp(-8 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

# ============================================================
# PERCUSSION
# ============================================================

def generate_rimshot(decay=0.1):
    """Rim shot"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    # High pitched click
    audio = np.sin(2 * np.pi * 1200 * t) * 0.7
    audio += np.sin(2 * np.pi * 800 * t) * 0.3
    
    amp_env = np.exp(-30 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_cowbell(decay=0.25):
    """Cowbell"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    # Two inharmonic frequencies
    audio = np.sin(2 * np.pi * 587 * t) * 0.6
    audio += np.sin(2 * np.pi * 845 * t) * 0.4
    
    amp_env = np.exp(-10 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_clave(decay=0.08):
    """Clave/wood block"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    audio = np.sin(2 * np.pi * 2500 * t) * 0.8
    audio += np.sin(2 * np.pi * 3200 * t) * 0.2
    
    amp_env = np.exp(-40 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

def generate_shaker(decay=0.15):
    """Shaker"""
    samples = int(SAMPLE_RATE * decay)
    t = np.linspace(0, decay, samples, False)
    
    # Filtered noise
    audio = np.random.uniform(-1, 1, samples)
    
    # Simple high-pass
    audio = np.diff(np.concatenate([[0], audio])) * 0.7
    
    amp_env = np.exp(-12 * t / decay)
    audio *= amp_env
    
    return normalize_and_convert(audio)

# ============================================================
# MAIN
# ============================================================

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("🥁 Generating HAOS.fm Drum Samples...")
    print(f"📂 Output: {os.path.abspath(OUTPUT_DIR)}")
    print()
    
    # Kicks
    print("🔈 KICKS:")
    to_wav_bytes(generate_kick_808(), "kick_808.wav")
    to_wav_bytes(generate_kick_808(pitch=180, decay=0.4), "kick_808_punchy.wav")
    to_wav_bytes(generate_kick_909(), "kick_909.wav")
    to_wav_bytes(generate_kick_deep(), "kick_deep.wav")
    
    # Snares
    print("🔈 SNARES:")
    to_wav_bytes(generate_snare_808(), "snare_808.wav")
    to_wav_bytes(generate_snare_909(), "snare_909.wav")
    to_wav_bytes(generate_snare_clicky(), "snare_clicky.wav")
    
    # Hi-hats
    print("🔈 HI-HATS:")
    to_wav_bytes(generate_hihat_closed(), "hihat_closed.wav")
    to_wav_bytes(generate_hihat_open(), "hihat_open.wav")
    to_wav_bytes(generate_hihat_pedal(), "hihat_pedal.wav")
    
    # Cymbals
    print("🔈 CYMBALS:")
    to_wav_bytes(generate_ride(), "ride.wav")
    to_wav_bytes(generate_crash(), "crash.wav")
    
    # Claps
    print("🔈 CLAPS:")
    to_wav_bytes(generate_clap(), "clap.wav")
    to_wav_bytes(generate_snap(), "snap.wav")
    
    # Toms
    print("🔈 TOMS:")
    to_wav_bytes(generate_tom_low(), "tom_low.wav")
    to_wav_bytes(generate_tom_mid(), "tom_mid.wav")
    to_wav_bytes(generate_tom_high(), "tom_high.wav")
    
    # Percussion
    print("🔈 PERCUSSION:")
    to_wav_bytes(generate_rimshot(), "rimshot.wav")
    to_wav_bytes(generate_cowbell(), "cowbell.wav")
    to_wav_bytes(generate_clave(), "clave.wav")
    to_wav_bytes(generate_shaker(), "shaker.wav")
    
    print()
    print("✅ Done! Generated all drum samples.")
    
    # List files
    files = os.listdir(OUTPUT_DIR)
    print(f"📦 {len(files)} files in {OUTPUT_DIR}:")
    for f in sorted(files):
        size = os.path.getsize(os.path.join(OUTPUT_DIR, f)) // 1024
        print(f"   {f} ({size}KB)")

if __name__ == "__main__":
    main()
