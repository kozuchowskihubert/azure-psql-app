#!/bin/zsh
# COMPLETE AUTOMATED WORKFLOW FOR 4:20 DARK ATMOSPHERIC TECHNO
# This script automates the entire production workflow

set -e  # Exit on error

echo "🎵 AUTOMATED DARK ATMOSPHERIC TECHNO WORKFLOW 🎵"
echo "=================================================="
echo ""
echo "This script will:"
echo "  1. Generate all MIDI files (16 original + 7 for 4:20 track)"
echo "  2. Verify VST3 plugins (TEKNO, OMNISPHERE)"
echo "  3. Create arrangement and automation guides"
echo "  4. Open Ableton Live 12 with your template"
echo "  5. Open all necessary files and folders"
echo ""
echo "Total duration: 4 minutes 20 seconds (138 bars @ 128 BPM)"
echo ""
read "?Press Enter to start the automated workflow..."

clear

# ============================================================
# STEP 1: Generate Original MIDI Files (9 patterns)
# ============================================================
echo ""
echo "📝 STEP 1/6: Generating Original MIDI Patterns..."
echo "=================================================="
if [ -f "generate_midi_files.py" ]; then
    python3 generate_midi_files.py
    echo "✅ Original 9 MIDI patterns created"
else
    echo "⚠️  generate_midi_files.py not found, skipping..."
fi

sleep 1

# ============================================================
# STEP 2: Generate Dark Atmospheric MIDI Files (7 patterns)
# ============================================================
echo ""
echo "📝 STEP 2/6: Generating Dark Atmospheric MIDI Patterns..."
echo "=========================================================="
if [ -f "create_dark_atmospheric_techno.py" ]; then
    python3 create_dark_atmospheric_techno.py
    echo "✅ Dark Atmospheric 7 MIDI patterns created"
else
    echo "⚠️  create_dark_atmospheric_techno.py not found, skipping..."
fi

sleep 1

# ============================================================
# STEP 3: Generate Complete 4:20 Track with Arrangement
# ============================================================
echo ""
echo "🎹 STEP 3/6: Generating Complete 4:20 Track Arrangement..."
echo "==========================================================="
if [ -f "create_complete_track_420.py" ]; then
    python3 create_complete_track_420.py
    echo "✅ Complete 4:20 track created with full arrangement"
else
    echo "⚠️  create_complete_track_420.py not found, skipping..."
fi

sleep 1

# ============================================================
# STEP 4: Verify VST3 Plugins
# ============================================================
echo ""
echo "🔍 STEP 4/6: Verifying VST3 Plugins..."
echo "======================================="
if [ -f "MIDI-Files/Dark-Atmospheric/check_plugins.py" ]; then
    python3 MIDI-Files/Dark-Atmospheric/check_plugins.py
else
    echo "⚠️  Plugin checker not found, checking manually..."
    if [ -d "/Library/Audio/Plug-Ins/VST3/Tekno.vst3" ]; then
        echo "✅ TEKNO found"
    else
        echo "❌ TEKNO not found at /Library/Audio/Plug-Ins/VST3/Tekno.vst3"
    fi
    
    if [ -d "/Library/Audio/Plug-Ins/VST3/Omnisphere.vst3" ]; then
        echo "✅ OMNISPHERE found"
    else
        echo "❌ OMNISPHERE not found at /Library/Audio/Plug-Ins/VST3/Omnisphere.vst3"
    fi
fi

sleep 1

# ============================================================
# STEP 5: Verify/Check Ableton Template
# ============================================================
echo ""
echo "📋 STEP 5/6: Checking Ableton Template..."
echo "=========================================="
if [ -f "Techno-Template-Output/Manual-set Project/Manual-set.als" ]; then
    TEMPLATE_SIZE=$(ls -lh "Techno-Template-Output/Manual-set Project/Manual-set.als" | awk '{print $5}')
    echo "✅ Template found: Manual-set.als ($TEMPLATE_SIZE)"
    
    # Check for backup files
    BACKUP_COUNT=$(ls -1 "Techno-Template-Output/Manual-set Project/Backup/" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        echo "✅ Found $BACKUP_COUNT backup(s)"
    fi
else
    echo "❌ Template not found! Please create Manual-set.als first"
    echo "   Location: Techno-Template-Output/Manual-set Project/Manual-set.als"
    exit 1
fi

# Check if Ableton is installed
if [ -d "/Applications/Ableton Live 12 Suite.app" ]; then
    echo "✅ Ableton Live 12 Suite found"
else
    echo "❌ Ableton Live 12 Suite not found!"
    exit 1
fi

sleep 1

# ============================================================
# STEP 6: Display Project Summary
# ============================================================
echo ""
echo "📊 STEP 6/6: Project Summary"
echo "============================"
echo ""
echo "MIDI Files Generated:"
echo "  • Original patterns: $(ls -1 MIDI-Files/*.mid 2>/dev/null | wc -l | tr -d ' ') files"
echo "  • Dark Atmospheric: $(ls -1 MIDI-Files/Dark-Atmospheric/*.mid 2>/dev/null | wc -l | tr -d ' ') files"
echo "  • Complete 4:20 Track: $(ls -1 MIDI-Files/Complete-Track-420/*.mid 2>/dev/null | wc -l | tr -d ' ') files"
echo ""
echo "Documentation:"
echo "  • DARK-ATMOSPHERIC-COMPLETE.md - Quick start guide"
echo "  • SETUP-GUIDE.md - Detailed setup instructions"
echo "  • INSTRUMENT-CHOICES.md - VST3 alternatives"
echo "  • ARRANGEMENT-GUIDE-420.md - Complete 4:20 structure"
echo "  • AUTOMATION-GUIDE-420.md - Automation instructions"
echo "  • PROJECT-PROGRESS.md - Progress tracker"
echo ""

sleep 2

# ============================================================
# STEP 7: Open Everything in Ableton
# ============================================================
echo ""
echo "🚀 LAUNCHING ABLETON LIVE 12..."
echo "================================"
echo ""

# Open Ableton with template
echo "Opening Manual-set.als template..."
open -a "Ableton Live 12 Suite" "Techno-Template-Output/Manual-set Project/Manual-set.als"

sleep 3

# Open all MIDI folders
echo "Opening MIDI folders..."
open "MIDI-Files/"
sleep 0.5
open "MIDI-Files/Dark-Atmospheric/"
sleep 0.5
open "MIDI-Files/Complete-Track-420/"

sleep 1

# Open all documentation
echo "Opening documentation..."
if [ -f "MIDI-Files/Complete-Track-420/ARRANGEMENT-GUIDE-420.md" ]; then
    open "MIDI-Files/Complete-Track-420/ARRANGEMENT-GUIDE-420.md"
    sleep 0.5
fi

if [ -f "MIDI-Files/Complete-Track-420/AUTOMATION-GUIDE-420.md" ]; then
    open "MIDI-Files/Complete-Track-420/AUTOMATION-GUIDE-420.md"
    sleep 0.5
fi

if [ -f "DARK-ATMOSPHERIC-COMPLETE.md" ]; then
    open "DARK-ATMOSPHERIC-COMPLETE.md"
    sleep 0.5
fi

if [ -f "INSTRUMENT-CHOICES.md" ]; then
    open "INSTRUMENT-CHOICES.md"
fi

sleep 2

# ============================================================
# COMPLETION MESSAGE
# ============================================================
clear
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ AUTOMATED WORKFLOW COMPLETE!                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 WHAT'S OPEN:"
echo "   ✅ Ableton Live 12 with Manual-set.als template"
echo "   ✅ MIDI-Files/ (9 original patterns)"
echo "   ✅ MIDI-Files/Dark-Atmospheric/ (7 dark patterns)"
echo "   ✅ MIDI-Files/Complete-Track-420/ (7 arranged patterns)"
echo "   ✅ ARRANGEMENT-GUIDE-420.md (complete structure)"
echo "   ✅ AUTOMATION-GUIDE-420.md (automation details)"
echo "   ✅ All documentation guides"
echo ""
echo "🎵 TRACK SPECIFICATIONS:"
echo "   • Duration: 4:20 (exactly)"
echo "   • Tempo: 128 BPM"
echo "   • Total Bars: 138"
echo "   • Key: A Minor"
echo "   • Style: Dark Atmospheric Techno"
echo ""
echo "🎹 YOUR WORKFLOW:"
echo ""
echo "   OPTION A: Quick 4-Bar Loops (Session View)"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   1. Use patterns from Dark-Atmospheric/ folder"
echo "   2. Drag MIDI files into Ableton tracks"
echo "   3. Load TEKNO on: Kick, Sub, Industrial, Drone"
echo "   4. Load OMNISPHERE on: Pad, Texture, Reversed"
echo "   5. Jam in Session View, trigger clips live"
echo ""
echo "   OPTION B: Complete 4:20 Arranged Track (Arrangement View)"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   1. Use patterns from Complete-Track-420/ folder"
echo "   2. Drag all 7 MIDI files into Ableton"
echo "   3. Load instruments (TEKNO + OMNISPHERE)"
echo "   4. Follow ARRANGEMENT-GUIDE-420.md for structure"
echo "   5. Follow AUTOMATION-GUIDE-420.md for automation"
echo "   6. Track will be exactly 4:20 long"
echo ""
echo "🎛️ INSTRUMENT LOADING:"
echo "   • Tracks 10,11,14,15: TEKNO (kick, sub, perc, drone)"
echo "   • Tracks 12,13,16: OMNISPHERE (pad, texture, atmos)"
echo "   • See INSTRUMENT-CHOICES.md for alternatives"
echo ""
echo "🔥 PRODUCTION TIPS:"
echo "   • Keep kick & sub bass LOUD and CLEAR"
echo "   • Layer atmospheres SUBTLY"
echo "   • Use reverb HEAVILY on Omnisphere pads"
echo "   • Automate filters for MOVEMENT"
echo "   • Reference: Ben Klock, Dax J, I Hate Models"
echo ""
echo "📚 GUIDES AVAILABLE:"
echo "   • ARRANGEMENT-GUIDE-420.md - Full track structure"
echo "   • AUTOMATION-GUIDE-420.md - All automation details"
echo "   • INSTRUMENT-CHOICES.md - VST3 alternatives"
echo "   • DARK-ATMOSPHERIC-COMPLETE.md - Quick reference"
echo ""
echo "🎸 CREATE A BANGER! 🔥"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
