#!/usr/bin/env python3
"""
Test script for HAOS.fm Audio Engine
Tests all synthesis endpoints
"""

import requests
import base64
import wave
import io

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test server health check"""
    print("🏥 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Server is running: {data['service']} v{data['version']}")
            print(f"   Sample rate: {data['sample_rate']} Hz")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is it running?")
        print(f"   Start with: python3 audio_engine.py")
        return False

def test_kick():
    """Test kick drum synthesis"""
    print("\n🥁 Testing kick drum...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/audio/play-kick",
            json={"decay": 0.3, "pitch": 150, "velocity": 1.0}
        )
        if response.status_code == 200:
            data = response.json()
            audio_bytes = base64.b64decode(data['audio'])
            print(f"✅ Kick generated: {len(audio_bytes)} bytes")
            
            # Verify it's valid WAV
            with wave.open(io.BytesIO(audio_bytes), 'rb') as wav:
                print(f"   Format: {wav.getnchannels()} ch, {wav.getframerate()} Hz, {wav.getsampwidth()*8} bit")
                print(f"   Duration: {wav.getnframes() / wav.getframerate():.3f}s")
            return True
        else:
            print(f"❌ Kick failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_snare():
    """Test snare drum synthesis"""
    print("\n🪘 Testing snare drum...")
    try:
        response = requests.post(f"{BASE_URL}/api/audio/play-snare?velocity=1.0")
        if response.status_code == 200:
            data = response.json()
            audio_bytes = base64.b64decode(data['audio'])
            print(f"✅ Snare generated: {len(audio_bytes)} bytes")
            
            with wave.open(io.BytesIO(audio_bytes), 'rb') as wav:
                print(f"   Duration: {wav.getnframes() / wav.getframerate():.3f}s")
            return True
        else:
            print(f"❌ Snare failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_hihat():
    """Test hi-hat synthesis"""
    print("\n🔔 Testing hi-hat...")
    try:
        # Test closed hi-hat
        response = requests.post(f"{BASE_URL}/api/audio/play-hihat?velocity=1.0&open=false")
        if response.status_code == 200:
            data = response.json()
            audio_bytes = base64.b64decode(data['audio'])
            print(f"✅ Closed hi-hat generated: {len(audio_bytes)} bytes")
            
            with wave.open(io.BytesIO(audio_bytes), 'rb') as wav:
                print(f"   Duration: {wav.getnframes() / wav.getframerate():.3f}s")
        
        # Test open hi-hat
        response = requests.post(f"{BASE_URL}/api/audio/play-hihat?velocity=1.0&open=true")
        if response.status_code == 200:
            data = response.json()
            audio_bytes = base64.b64decode(data['audio'])
            print(f"✅ Open hi-hat generated: {len(audio_bytes)} bytes")
            
            with wave.open(io.BytesIO(audio_bytes), 'rb') as wav:
                print(f"   Duration: {wav.getnframes() / wav.getframerate():.3f}s")
            return True
        else:
            print(f"❌ Hi-hat failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_clap():
    """Test clap synthesis"""
    print("\n👏 Testing clap...")
    try:
        response = requests.post(f"{BASE_URL}/api/audio/play-clap?velocity=1.0")
        if response.status_code == 200:
            data = response.json()
            audio_bytes = base64.b64decode(data['audio'])
            print(f"✅ Clap generated: {len(audio_bytes)} bytes")
            
            with wave.open(io.BytesIO(audio_bytes), 'rb') as wav:
                print(f"   Duration: {wav.getnframes() / wav.getframerate():.3f}s")
            return True
        else:
            print(f"❌ Clap failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_synth():
    """Test ARP 2600 synthesis"""
    print("\n🎛️ Testing ARP 2600 synthesizer...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/audio/play-synth",
            json={
                "frequency": 440.0,
                "duration": 0.5,
                "velocity": 1.0,
                "detune": 0.02,
                "attack": 0.01,
                "decay": 0.1,
                "sustain": 0.7,
                "release": 0.2,
                "filter_cutoff": 2000.0,
                "filter_resonance": 1.0
            }
        )
        if response.status_code == 200:
            data = response.json()
            audio_bytes = base64.b64decode(data['audio'])
            print(f"✅ ARP 2600 generated: {len(audio_bytes)} bytes")
            
            with wave.open(io.BytesIO(audio_bytes), 'rb') as wav:
                print(f"   Format: {wav.getnchannels()} ch, {wav.getframerate()} Hz")
                print(f"   Duration: {wav.getnframes() / wav.getframerate():.3f}s")
            return True
        else:
            print(f"❌ Synth failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("HAOS.fm Audio Engine - Test Suite")
    print("=" * 60)
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health_check()))
    if not results[0][1]:
        print("\n❌ Server is not running. Please start it first:")
        print("   python3 audio_engine.py")
        return
    
    results.append(("Kick Drum", test_kick()))
    results.append(("Snare Drum", test_snare()))
    results.append(("Hi-Hat", test_hihat()))
    results.append(("Clap", test_clap()))
    results.append(("ARP 2600 Synth", test_synth()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("\n" + "=" * 60)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 All tests passed! Backend is working perfectly.")
        print("\n📱 Next steps:")
        print("   1. Create PythonAudioEngine.js client")
        print("   2. Integrate with StudioScreenNew")
        print("   3. Test on mobile device")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")

if __name__ == "__main__":
    main()
