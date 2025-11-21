#!/bin/bash

# ====================================================================================
# MASTER AUTOMATION SCRIPT - FULL TECHNO TRACK PRODUCTION
# ====================================================================================
# This script automates the entire workflow for creating a Dark Melodic Techno track:
# 1. Checks if Ableton Live is running. If not, it opens 'Manual-set.als'.
# 2. Executes a Python script to automatically load all VST3 instruments onto their
#    respective tracks in the currently open Ableton project.
# 3. Opens all relevant documentation for arrangement and preset guidance.
# ====================================================================================

# Set script to exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 STARTING AUTOMATION ON EXISTING 'Manual-set.als' PROJECT 🚀"
echo "--------------------------------------------------------------------"

# --- Steps 1, 2, 3 (File Generation) are now SKIPPED ---
# We will use the existing 'Manual-set.als' project.
# echo "🔥 Step 1/5: Generating 9 MIDI files (136 bars)..."
# python3 create_dark_melodic_techno_full_track.py
# echo "✅ MIDI files generated successfully!"
# echo ""
# echo "🎹 Step 2/5: Creating new Ableton Live project file..."
# python3 generate_als_template.py
# echo "✅ Ableton template 'Techno-Banger-Template.als' created!"
# echo ""
# echo "🔍 Step 3/5: Verifying TEKNO and Omnisphere VST3 plugins..."
# python3 MIDI-Files/Dark-Atmospheric/check_plugins.py
# echo "✅ VST3 plugins verified."
# echo ""

# --- Step 4: Check for Ableton and Launch if Necessary ---
echo "🎵 Step 4/5: Checking for Ableton Live and opening project..."

if pgrep -f "Ableton Live Suite" > /dev/null; then
    echo "✅ Ableton Live Suite is already running. Proceeding with automation."
else
    echo "⏳ Ableton Live Suite is not running. Launching 'Manual-set.als'..."
    open "Techno-Template-Output/Manual-set Project/Manual-set.als"
fi

# Open documentation and MIDI folder for reference
open "MIDI-Files/Dark-Melodic-Full-Track"
open "DARK-MELODIC-COMPLETE.md"
open "SETUP-MASTER-TEMPLATE.md"
open "MIDI-Files/Dark-Melodic-Full-Track/ARRANGEMENT-GUIDE.md"
open "MIDI-Files/Dark-Melodic-Full-Track/PRESET-GUIDE.md"
echo "✅ Guides and MIDI folder are open for reference."
echo "⏳ Waiting for Ableton Live to be ready..."

# Wait for the Ableton Live process to be active
MAX_WAIT=90 # Wait for up to 90 seconds
COUNT=0
while ! pgrep -f "Ableton Live Suite" > /dev/null; do
    if [ $COUNT -ge $MAX_WAIT ]; then
        echo "❌ Error: Timed out after $MAX_WAIT seconds waiting for Ableton Live to launch."
        exit 1
    fi
    printf "   ...waiting for process (%ds/%ds)\r" "$COUNT" "$MAX_WAIT"
    sleep 1
    COUNT=$((COUNT+1))
done

echo "\n✅ Ableton Live process detected. Giving it 20 seconds to settle..."
sleep 20 # Grace period for the UI to become responsive

# --- Step 5: Auto-load VST3 Instruments via Python ---
echo "🤖 Step 5/5: Automating VST3 instrument loading with Python..."
python3 automate_vst_loading.py
echo "✅ Python script for VST3 loading has been executed."
echo ""

# --- FINAL MESSAGE ---
echo "--------------------------------------------------------------------"
echo "🎉 MASTER AUTOMATION COMPLETE! 🎉"
echo ""
echo "🎯 YOUR PROJECT 'Manual-set.als' IS NOW AUTOMATED!"
echo ""
echo "What just happened:"
echo "  - The script detected or launched Ableton with 'Manual-set.als'."
echo "  - All VST3 instruments should now be loaded onto their tracks."
echo "  - All guides and the MIDI folder are open for you."
echo ""
echo "➡️ Next Steps:"
echo "1. Check your Ableton project to confirm the instruments are loaded."
echo "2. If needed, drag the 9 MIDI files from the opened folder onto their tracks."
echo "3. Follow the ARRANGEMENT-GUIDE.md to build your track structure."
echo "--------------------------------------------------------------------"
