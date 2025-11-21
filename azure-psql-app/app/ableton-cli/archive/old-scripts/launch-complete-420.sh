#!/bin/zsh
# Launcher for Complete 4:20 Dark Atmospheric Techno Track

echo "🎵 COMPLETE 4:20 DARK ATMOSPHERIC TECHNO TRACK"
echo "=============================================="
echo ""
echo "This will open:"
echo "  • Ableton Live 12 with Manual-set.als template"
echo "  • Complete-Track-420 MIDI folder (7 files)"
echo "  • Arrangement Guide (track structure)"
echo "  • Automation Guide (detailed automation instructions)"
echo ""
read "?Press Enter to launch everything..."

# Open Ableton
echo ""
echo "🚀 Opening Ableton Live 12..."
open -a "Ableton Live 12 Suite" "Techno-Template-Output/Manual-set Project/Manual-set.als"

sleep 2

# Open MIDI folder
echo "📁 Opening MIDI files folder..."
open "MIDI-Files/Complete-Track-420/"

# Open guides
echo "📖 Opening arrangement and automation guides..."
open "MIDI-Files/Complete-Track-420/ARRANGEMENT-GUIDE-420.md"
sleep 1
open "MIDI-Files/Complete-Track-420/AUTOMATION-GUIDE-420.md"

echo ""
echo "✅ Everything opened!"
echo ""
echo "🎯 WORKFLOW:"
echo "   1. Drag all 7 MIDI files from Complete-Track-420 folder into Ableton"
echo "   2. Load TEKNO on kick, bass, perc, drone tracks"
echo "   3. Load OMNISPHERE on pad, texture, reversed atmos tracks"
echo "   4. Follow AUTOMATION-GUIDE-420.md step by step"
echo "   5. Your track will be exactly 4:20 (138 bars at 128 BPM)"
echo ""
echo "🎸 Create a BANGER! 🔥"
echo ""
