#!/bin/bash

# ====================================================================================
# PROJECT CLEANUP AND ORGANIZATION SCRIPT
# ====================================================================================
# This script organizes the messy project structure into a clean, professional layout
# ====================================================================================

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🧹 TECHNO STUDIO PROJECT CLEANUP 🧹               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Create archive directory if it doesn't exist
mkdir -p archive/old-scripts
mkdir -p archive/old-docs
mkdir -p docs

echo "📦 Archiving old files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Move old Python scripts
echo "  → Archiving old Python scripts..."
mv -f ableton_techno_generator_old.py archive/old-scripts/ 2>/dev/null || true
mv -f ableton_techno_generator.py archive/old-scripts/ 2>/dev/null || true
mv -f analyze_template.py archive/old-scripts/ 2>/dev/null || true
mv -f analyze_vst3_automation.py archive/old-scripts/ 2>/dev/null || true
mv -f create_complete_track_420.py archive/old-scripts/ 2>/dev/null || true
mv -f create_dark_atmospheric_techno.py archive/old-scripts/ 2>/dev/null || true
mv -f create_dark_melodic_techno_full_track.py archive/old-scripts/ 2>/dev/null || true
mv -f create_template_guide.py archive/old-scripts/ 2>/dev/null || true
mv -f generate_midi_files.py archive/old-scripts/ 2>/dev/null || true
mv -f generate_als_template.py archive/old-scripts/ 2>/dev/null || true

# Move old shell scripts
echo "  → Archiving old shell scripts..."
mv -f automate_workflow.sh archive/old-scripts/ 2>/dev/null || true
mv -f launch-complete-420.sh archive/old-scripts/ 2>/dev/null || true
mv -f launch-dark-melodic-full.sh archive/old-scripts/ 2>/dev/null || true
mv -f launch-dark-techno.sh archive/old-scripts/ 2>/dev/null || true
mv -f master_complete_automation.sh archive/old-scripts/ 2>/dev/null || true
mv -f produce_full_track.sh archive/old-scripts/ 2>/dev/null || true
mv -f produce_deep_techno.sh archive/old-scripts/ 2>/dev/null || true

# Move old AppleScripts
echo "  → Archiving old AppleScripts..."
mv -f autoload_vst3_instruments.scpt archive/old-scripts/ 2>/dev/null || true
mv -f load_vst3_plugins*.scpt archive/old-scripts/ 2>/dev/null || true

# Move old documentation
echo "  → Archiving old documentation..."
mv -f ADD-INSTRUMENTS-GUIDE.md archive/old-docs/ 2>/dev/null || true
mv -f DARK-ATMOSPHERIC-COMPLETE.md archive/old-docs/ 2>/dev/null || true
mv -f DARK-MELODIC-COMPLETE.md archive/old-docs/ 2>/dev/null || true
mv -f IMPLEMENTATION-COMPLETE-OLD.md archive/old-docs/ 2>/dev/null || true
mv -f INSTRUMENT-CHOICES.md archive/old-docs/ 2>/dev/null || true
mv -f PROJECT-PROGRESS.md archive/old-docs/ 2>/dev/null || true
mv -f PROJECT-SUMMARY.txt archive/old-docs/ 2>/dev/null || true
mv -f SETUP-MASTER-TEMPLATE.md archive/old-docs/ 2>/dev/null || true
mv -f TEMPLATE-COMPARISON.md archive/old-docs/ 2>/dev/null || true
mv -f VISUAL-WORKFLOW.md archive/old-docs/ 2>/dev/null || true

# Move old XML/template files
echo "  → Archiving old template files..."
mv -f minimal_template.als.xml archive/old-scripts/ 2>/dev/null || true
mv -f Manual-set-ANALYZED.xml archive/old-scripts/ 2>/dev/null || true

# Organize documentation
echo "  → Organizing current documentation..."
mv -f DEEP-TECHNO-README.md docs/ 2>/dev/null || true
mv -f README.md docs/README-OLD.md 2>/dev/null || true
mv -f README-NEW.md README.md 2>/dev/null || true

# Rename old MIDI and template outputs
echo "  → Organizing output directories..."
if [ -d "MIDI-Files" ]; then
    echo "    • Moving MIDI-Files to output/MIDI-Files-OLD"
    mv MIDI-Files output/MIDI-Files-OLD 2>/dev/null || true
fi

if [ -d "Techno-Template-Output" ]; then
    echo "    • Moving Techno-Template-Output to output/Projects-OLD"
    mv Techno-Template-Output output/Projects-OLD 2>/dev/null || true
fi

# Clean up source scripts (keep originals for reference)
echo "  → Keeping reference copies of active scripts..."
cp create_deep_techno_midi.py archive/old-scripts/create_deep_techno_midi_REFERENCE.py 2>/dev/null || true
cp generate_deep_techno_template.py archive/old-scripts/generate_deep_techno_template_REFERENCE.py 2>/dev/null || true
cp automate_vst_loading.py archive/old-scripts/automate_vst_loading_REFERENCE.py 2>/dev/null || true
cp launch_deep_techno.sh archive/old-scripts/launch_deep_techno_REFERENCE.sh 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📁 New project structure:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  techno_studio.py          ← Main CLI tool (NEW!)"
echo "  README.md                 ← Updated documentation"
echo ""
echo "  src/                      ← Source code (organized)"
echo "  ├── generators/           ← MIDI & template generators"
echo "  └── automation/           ← VST automation"
echo ""
echo "  output/                   ← All generated files"
echo "  ├── MIDI-Files/           ← Generated MIDI patterns"
echo "  └── Projects/             ← Generated Ableton templates"
echo ""
echo "  docs/                     ← Documentation"
echo "  archive/                  ← Old/deprecated files"
echo ""
echo "🚀 Try the new CLI tool:"
echo "   ./techno_studio.py create --genre deep --bpm 124"
echo ""
