#!/bin/bash

# ====================================================================================
# MASTER SCRIPT: DEEP TECHNO PRODUCTION
# ====================================================================================
# Automated workflow for creating a complete Deep Techno track in Ableton Live
# 1. Generates 6 MIDI patterns for deep, rolling techno
# 2. Creates a fresh Ableton Live 12 project template
# 3. Launches Ableton with the new project
# 4. Waits for Ableton to be fully responsive
# 5. Automates VST3 instrument loading (TEKNO & Omnisphere)
# ====================================================================================

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🎹 DEEP TECHNO PRODUCTION WORKFLOW 🎹              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# --- Step 1: Generate Deep Techno MIDI Files ---
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1/4: Generating MIDI Patterns"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 create_deep_techno_midi.py

# --- Step 2: Create Ableton Live Project ---
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2/4: Creating Ableton Live Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 generate_deep_techno_template.py

# --- Step 3: Launch Ableton Live ---
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3/4: Launching Ableton Live"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  → Opening Deep-Techno-Template.als..."
open "Techno-Template-Output/Deep-Techno-Template.als"

# --- Robust Wait for Ableton to be Ready ---
echo ""
echo "⏳ Waiting for Ableton to launch and initialize..."
MAX_WAIT=120
COUNT=0

while ! pgrep -f "Ableton Live Suite" > /dev/null; do
    if [ $COUNT -ge $MAX_WAIT ]; then
        echo ""
        echo "❌ ERROR: Timed out after $MAX_WAIT seconds"
        echo "   Ableton did not launch. Please check your system."
        exit 1
    fi
    printf "   ...waiting for process (%ds/%ds)\r" "$COUNT" "$MAX_WAIT"
    sleep 1
    COUNT=$((COUNT+1))
done

echo ""
echo "  ✓ Ableton process detected!"
echo "  → Allowing 25 seconds for UI initialization and plugin scanning..."
sleep 25

# --- Step 4: Automate VST Instrument Loading ---
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4/4: Automating VST3 Loading"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 automate_vst_loading.py

# --- FINAL MESSAGE ---
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║            ✨ WORKFLOW COMPLETE! ✨                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📂 MIDI Files:    MIDI-Files/Deep-Techno/"
echo "📂 Project File:  Techno-Template-Output/Deep-Techno-Template.als"
echo ""
echo "➡️  NEXT STEPS:"
echo "   1. Verify VST3 instruments loaded correctly in Ableton"
echo "   2. Drag MIDI files onto corresponding tracks"
echo "   3. Adjust sounds and start producing!"
echo ""
echo "🎧 Happy producing! 🎧"
echo ""
