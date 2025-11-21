
#!/bin/bash

# ====================================================================================
# MASTER SCRIPT: DEEP TECHNO PRODUCTION
# ====================================================================================
# 1.  Generates 6 core MIDI files for a deep, rolling techno groove.
# 2.  Creates a blank Ableton Live project file to work with.
# 3.  Launches Ableton with the new project.
# 4.  Waits robustly for Ableton to be fully launched and responsive.
# 5.  Executes a Python script to automate VST instrument loading.
# ====================================================================================

set -e

echo "🚀 STARTING DEEP TECHNO PRODUCTION WORKFLOW 🚀"
echo "------------------------------------------------"

# --- Step 1: Generate Deep Techno MIDI Files ---
echo "🔥 Step 1/4: Generating Deep Techno MIDI files..."
python3 create_deep_techno_midi.py
echo ""

# --- Step 2: Create a fresh Ableton Live project ---
echo "� Step 2/4: Creating new Ableton Live project file..."
python3 generate_als_template.py
echo ""

# --- Step 3: Launch Ableton Live ---
echo "🎵 Step 3/4: Launching Ableton Live..."
open "Techno-Template-Output/Deep-Techno-Template.als"


# --- Robust Wait for Ableton to be Ready ---
echo "⏳ Waiting for Ableton to be fully responsive..."
MAX_WAIT=120
COUNT=0
while ! pgrep -f "Ableton Live Suite" > /dev/null; do
    if [ $COUNT -ge $MAX_WAIT ]; then
        echo "❌ Error: Timed out after $MAX_WAIT seconds waiting for Ableton to launch."
        exit 1
    fi
    printf "   ...waiting for process to appear (%ds/%ds)\r" "$COUNT" "$MAX_WAIT"
    sleep 1
    COUNT=$((COUNT+1))
done

echo "\n✅ Ableton process detected. Giving it a generous 25 seconds to settle..."
sleep 25 # Increased grace period for UI and plugin scanning

# --- Step 4: Automate VST Instrument Loading ---
echo "🤖 Step 4/4: Automating VST instrument loading..."
python3 automate_vst_loading.py
echo "✅ VST loading script executed."
echo ""

# --- FINAL MESSAGE ---
echo "------------------------------------------------"
echo "🎉 DEEP TECHNO WORKFLOW COMPLETE! 🎉"
echo ""
echo "➡️ Next Steps:"
echo "1. Check Ableton to confirm instruments are loaded."
echo "2. Drag the new MIDI files from 'MIDI-Files/Deep-Techno' onto the tracks."
echo "3. Start producing!"
echo "------------------------------------------------"
