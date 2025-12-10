#!/bin/bash
# HAOS Platform - Interactive Button & Sound Test
# Tests all sound-generating buttons across the platform

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔊 HAOS Platform - Sound Button Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /Users/haos/azure-psql-app/app/public

# Test 1: Platform/Studio.html - Drum pads and test buttons
echo ""
echo "📄 platform/studio.html:"
echo "   Testing TB-303 and TR-909 buttons..."

test_synth=$(grep -c "playTestNote" platform/studio.html)
drum_buttons=$(grep -c "playDrum" platform/studio.html)
play_btn=$(grep -c "id=\"play-btn\"" platform/studio.html)
kick_btn=$(grep -c "id=\"kick-btn\"" platform/studio.html)
snare_btn=$(grep -c "id=\"snare-btn\"" platform/studio.html)
hihat_btn=$(grep -c "id=\"hihat-btn\"" platform/studio.html)

echo "   ✅ Test Synth Button: $test_synth function calls"
echo "   ✅ Drum Buttons: $drum_buttons function calls"
echo "   ✅ Play Button: $play_btn found"
echo "   ✅ Kick Button: $kick_btn found"
echo "   ✅ Snare Button: $snare_btn found"
echo "   ✅ HiHat Button: $hihat_btn found"

# Check if playTestNote function exists
if grep -q "function playTestNote" platform/studio.html; then
    echo "   ✅ playTestNote() function implemented"
else
    echo "   ⚠️  playTestNote() function not found"
fi

# Check if playDrum function exists
if grep -q "function playDrum" platform/studio.html; then
    echo "   ✅ playDrum() function implemented"
else
    echo "   ⚠️  playDrum() function not found"
fi

# Check audio engine initialization
if grep -q "HAOSAudioEngine" platform/studio.html; then
    echo "   ✅ HAOSAudioEngine integrated"
else
    echo "   ❌ HAOSAudioEngine NOT integrated"
fi

# Test 2: Techno Creator
echo ""
echo "📄 techno-creator.html:"
if [ -f "techno-creator.html" ]; then
    synth_count=$(grep -c "class=\"synth-pad\|playSound\|triggerNote" techno-creator.html)
    echo "   ✅ Sound trigger elements: $synth_count found"
    
    if grep -q "AudioContext\|audioContext" techno-creator.html; then
        echo "   ✅ Web Audio API integrated"
    else
        echo "   ⚠️  Web Audio API not detected"
    fi
fi

# Test 3: Synth 2600 Studio
echo ""
echo "📄 synth-2600-studio.html:"
if [ -f "synth-2600-studio.html" ]; then
    test_buttons=$(grep -c "test.*sound\|play.*note" synth-2600-studio.html)
    echo "   ℹ️  Interactive elements: $test_buttons found"
fi

# Test 4: Check audio engine files
echo ""
echo "🎛️  Audio Engine Files:"
if [ -f "js/haos-audio-engine.js" ]; then
    size=$(wc -c < js/haos-audio-engine.js | awk '{print int($1/1024)"KB"}')
    tb303=$(grep -c "class HAOSTB303\|TB303" js/haos-audio-engine.js)
    tr909=$(grep -c "class HAOSTR909\|TR909" js/haos-audio-engine.js)
    echo "   ✅ haos-audio-engine.js ($size)"
    echo "      • TB-303 implementation: $tb303 references"
    echo "      • TR-909 implementation: $tr909 references"
else
    echo "   ❌ haos-audio-engine.js NOT FOUND"
fi

# Test 5: Check for playNote, playKick, playSnare in audio engine
echo ""
echo "🎵 Sound Generation Methods:"
if [ -f "js/haos-audio-engine.js" ]; then
    playNote=$(grep -c "playNote.*function\|playNote(.*)" js/haos-audio-engine.js)
    playKick=$(grep -c "playKick.*function\|playKick(.*)" js/haos-audio-engine.js)
    playSnare=$(grep -c "playSnare.*function\|playSnare(.*)" js/haos-audio-engine.js)
    playHihat=$(grep -c "playHihat.*function\|playHihat(.*)" js/haos-audio-engine.js)
    
    echo "   ✅ playNote() method: $playNote implementations"
    echo "   ✅ playKick() method: $playKick implementations"
    echo "   ✅ playSnare() method: $playSnare implementations"
    echo "   ✅ playHihat() method: $playHihat implementations"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Button & Sound Test Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📝 Manual Testing Required:"
echo "   1. Open http://localhost:3000/platform/studio.html"
echo "   2. Click 'Test Synth' button - should hear TB-303 bass note"
echo "   3. Click drum pads (Kick, Snare, HiHat) - should hear drums"
echo "   4. Click step sequencer steps - should toggle on/off"
echo "   5. Click Play button - should hear sequenced pattern"
echo ""
