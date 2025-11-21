#!/bin/bash

# Complete Dark Melodic Techno Track - Master Automation
# Generates MIDI, creates template guide, and opens everything

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   🎵 COMPLETE DARK MELODIC TECHNO - MASTER AUTOMATION 🎵      ║"
echo "║                                                                ║"
echo "║   This script will:                                            ║"
echo "║   1. Generate all MIDI files (9 tracks, 136 bars)             ║"
echo "║   2. Create comprehensive guides                               ║"
echo "║   3. Open Ableton with template                                ║"
echo "║   4. Open all documentation                                    ║"
echo "║   5. Display complete workflow                                 ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Change to script directory
cd "$(dirname "$0")"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📝 STEP 1/5: Generating Complete Track (136 bars, ~8:36)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate the complete dark melodic techno track
python3 create_dark_melodic_techno_full_track.py

if [ $? -ne 0 ]; then
    echo "❌ Error generating track"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 STEP 2/5: Analyzing Project Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count files
MIDI_COUNT=$(ls -1 MIDI-Files/Dark-Melodic-Full-Track/*.mid 2>/dev/null | wc -l | tr -d ' ')
DOC_COUNT=$(ls -1 MIDI-Files/Dark-Melodic-Full-Track/*.md 2>/dev/null | wc -l | tr -d ' ')

echo "✅ MIDI Files: $MIDI_COUNT"
echo "✅ Documentation: $DOC_COUNT"
echo ""

# Display file details
echo "📁 Generated Files:"
ls -lh MIDI-Files/Dark-Melodic-Full-Track/*.mid 2>/dev/null | awk '{print "   •", $9, "("$5")"}'
echo ""
echo "📋 Documentation:"
ls -lh MIDI-Files/Dark-Melodic-Full-Track/*.md 2>/dev/null | awk '{print "   •", $9, "("$5")"}'
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎹 STEP 3/5: Verifying VST3 Plugins"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for TEKNO
if [ -d "/Library/Audio/Plug-Ins/VST3/Tekno.vst3" ]; then
    echo "✅ TEKNO found: /Library/Audio/Plug-Ins/VST3/Tekno.vst3"
else
    echo "⚠️  TEKNO not found (will need to load manually)"
fi

# Check for Omnisphere
if [ -d "/Library/Audio/Plug-Ins/VST3/Omnisphere.vst3" ]; then
    echo "✅ OMNISPHERE found: /Library/Audio/Plug-Ins/VST3/Omnisphere.vst3"
else
    echo "⚠️  OMNISPHERE not found (will need to load manually)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📋 STEP 4/5: Checking Ableton Template"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TEMPLATE="Techno-Template-Output/Manual-set Project/Manual-set.als"

if [ -f "$TEMPLATE" ]; then
    TEMPLATE_SIZE=$(ls -lh "$TEMPLATE" | awk '{print $5}')
    echo "✅ Template found: Manual-set.als ($TEMPLATE_SIZE)"
    
    # Count backups
    BACKUPS=$(ls -1 "Techno-Template-Output/Manual-set Project/Backup/"*.als 2>/dev/null | wc -l | tr -d ' ')
    if [ "$BACKUPS" -gt 0 ]; then
        echo "✅ Found $BACKUPS backup(s)"
    fi
else
    echo "⚠️  Template not found: $TEMPLATE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 STEP 5/5: Opening Everything"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Ableton exists
ABLETON_APP="/Applications/Ableton Live 12 Suite.app"
if [ ! -d "$ABLETON_APP" ]; then
    echo "⚠️  Ableton Live 12 Suite not found, trying Intro..."
    ABLETON_APP="/Applications/Ableton Live 12 Intro.app"
    if [ ! -d "$ABLETON_APP" ]; then
        echo "❌ No Ableton Live 12 installation found"
        exit 1
    fi
fi

echo "1️⃣  Opening Ableton Live 12..."
open -a "$ABLETON_APP" "$TEMPLATE"
sleep 2

echo "2️⃣  Opening MIDI files folder..."
open "MIDI-Files/Dark-Melodic-Full-Track"
sleep 1

echo "3️⃣  Opening Arrangement Guide..."
open "MIDI-Files/Dark-Melodic-Full-Track/ARRANGEMENT-GUIDE.md"
sleep 0.5

echo "4️⃣  Opening Preset Guide..."
open "MIDI-Files/Dark-Melodic-Full-Track/PRESET-GUIDE.md"
sleep 0.5

echo "5️⃣  Opening Master Template Setup Guide..."
open "SETUP-MASTER-TEMPLATE.md"
sleep 0.5

echo "6️⃣  Opening Complete Summary..."
open "DARK-MELODIC-COMPLETE.md"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║              ✅ AUTOMATION COMPLETE! ✅                         ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎯 WHAT'S OPEN:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✅ Ableton Live 12 with Manual-set.als"
echo "  ✅ MIDI-Files/Dark-Melodic-Full-Track/ (9 files)"
echo "  ✅ ARRANGEMENT-GUIDE.md (complete structure)"
echo "  ✅ PRESET-GUIDE.md (VST3 presets + automation)"
echo "  ✅ SETUP-MASTER-TEMPLATE.md (one-time setup)"
echo "  ✅ DARK-MELODIC-COMPLETE.md (full summary)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 TRACK SPECIFICATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Duration:        ~8:36 (136 bars)"
echo "  Tempo:           126 BPM"
echo "  Key:             A Minor"
echo "  Genre:           Dark Melodic Techno"
echo "  Style:           Tale Of Us / Stephan Bodzin / Anyma"
echo "  MIDI Files:      9 tracks"
echo "  Total Notes:     ~4500+"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎵 TRACK STRUCTURE (10 sections)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1. INTRO (1-16)          Atmospheric build"
echo "  2. BUILD 1 (17-24)       First tension rise"
echo "  3. DROP 1 (25-40)        First main groove ⚡"
echo "  4. BREAKDOWN 1 (41-48)   Brief relief"
echo "  5. BUILD 2 (49-56)       Second rise"
echo "  6. DROP 2 (57-72)        Peak energy 💥"
echo "  7. BREAKDOWN 2 (73-88)   Emotional climax 🎭"
echo "  8. BUILD 3 (89-96)       Final tension"
echo "  9. DROP 3 (97-112)       Ultimate climax 🔥"
echo "  10. OUTRO (113-136)      Extended fade"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎹 NEXT STEPS - CHOOSE YOUR WORKFLOW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ⚡ OPTION A: QUICK START (Fastest)"
echo "  ┌────────────────────────────────────────────────────────────┐"
echo "  │ 1. Switch to Arrangement View (Tab)                       │"
echo "  │ 2. Cmd+A in MIDI folder (select all 9 files)              │"
echo "  │ 3. Drag & drop onto bar 1 in Ableton                      │"
echo "  │ 4. Load VST3 plugins following PRESET-GUIDE.md            │"
echo "  │ 5. Press Spacebar to play!                                │"
echo "  └────────────────────────────────────────────────────────────┘"
echo ""
echo "  💎 OPTION B: ONE-TIME SETUP (Recommended)"
echo "  ┌────────────────────────────────────────────────────────────┐"
echo "  │ 1. Follow SETUP-MASTER-TEMPLATE.md (5 minutes)            │"
echo "  │ 2. Load all 9 VST3 plugins with presets                   │"
echo "  │ 3. Import MIDI files                                       │"
echo "  │ 4. Save as 'Dark-Melodic-Master-Template.als'             │"
echo "  │ 5. Never set this up again! ✨                            │"
echo "  └────────────────────────────────────────────────────────────┘"
echo ""
echo "  📖 OPTION C: GUIDED WORKFLOW"
echo "  ┌────────────────────────────────────────────────────────────┐"
echo "  │ 1. Read ARRANGEMENT-GUIDE.md for complete structure       │"
echo "  │ 2. Read PRESET-GUIDE.md for VST3 configurations           │"
echo "  │ 3. Follow step-by-step automation instructions            │"
echo "  │ 4. Reference DARK-MELODIC-COMPLETE.md for overview        │"
echo "  └────────────────────────────────────────────────────────────┘"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎚️ MIXING QUICK REFERENCE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Kick:                -6.0 dB  (loudest)"
echo "  Sub Bass:            -9.0 dB"
echo "  Melodic Lead:       -12.0 dB"
echo "  Dark Pad:           -18.0 dB"
echo "  Arpeggio:           -15.0 dB"
echo "  Percussion:         -14.0 dB"
echo "  Atmospheric:        -20.0 dB  (subtle)"
echo "  Bass Pluck:         -13.0 dB"
echo "  FX Risers:          -16.0 dB"
echo ""
echo "  💡 Sidechain: All melodic → Kick (ratio 4:1)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎧 VST3 INSTRUMENT MAPPING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  TEKNO Tracks (4):"
echo "    Track 01: Deep Kick           → 'Deep Techno Kick'"
echo "    Track 02: Sub Rumble          → 'Sub Bass Growl'"
echo "    Track 06: Percussion          → 'Industrial Percussion Kit'"
echo "    Track 08: Bass Pluck          → 'Pluck Bass'"
echo ""
echo "  OMNISPHERE Tracks (5):"
echo "    Track 03: Melodic Lead        → 'Melodic Techno Lead'"
echo "    Track 04: Dark Pad            → 'Dark Atmosphere'"
echo "    Track 05: Arpeggio            → 'Techno Sequence'"
echo "    Track 07: Atmospheric Texture → 'Ethereal Space'"
echo "    Track 09: FX Riser            → 'Build Sweep'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  💡 PRO TIPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✓ Start with OPTION B (one-time setup saves hours)"
echo "  ✓ Save master template with plugins loaded"
echo "  ✓ Use Cmd+A in MIDI folder to select all files at once"
echo "  ✓ Drop MIDI files directly onto bar 1 in Arrangement View"
echo "  ✓ Follow automation guide for filter sweeps and builds"
echo "  ✓ Reference Tale Of Us / Stephan Bodzin for mixing style"
echo "  ✓ Keep kick and sub loud, atmospheres subtle"
echo "  ✓ Heavy reverb on breakdown 2 (bars 73-88 = emotional peak)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Everything is ready! Now go make some music! 🎵🔥"
echo ""
echo "💬 Questions? Check the opened guides - they have everything!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
