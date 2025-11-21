#!/bin/zsh
# Quick launcher for Dark Atmospheric Techno production

echo "🎹 DARK ATMOSPHERIC TECHNO - QUICK LAUNCHER"
echo "=========================================="
echo ""

# Check if Ableton is installed
if [ -d "/Applications/Ableton Live 12 Suite.app" ]; then
    echo "✅ Ableton Live 12 found"
else
    echo "⚠️  Ableton Live 12 not found. Please install it first."
    exit 1
fi

echo ""

# Check plugins
echo "🔍 Checking VST3 plugins..."
python3 MIDI-Files/Dark-Atmospheric/check_plugins.py
echo ""

# Function to show instrument recommendations
show_instrument_menu() {
    echo ""
    echo "🎹 INSTRUMENT RECOMMENDATIONS BY TRACK"
    echo "======================================="
    echo ""
    echo "🥁 DRUMS & PERCUSSION:"
    echo "  • Deep Kick → TEKNO (Factory → Kicks → Deep Kick)"
    echo "  • Industrial Perc → TEKNO (Factory → Percussion → Industrial)"
    echo "  • Alternative: Native Instruments Battery, FXpansion Geist"
    echo ""
    echo "🔊 BASS LAYERS:"
    echo "  • Sub Rumble → TEKNO (Factory → Bass → Sub Bass)"
    echo "  • Drone Bass → TEKNO (Factory → Drones → Dark Drone)"
    echo "  • Alternative: Serum, Massive X, Diva (Monark)"
    echo ""
    echo "🌌 ATMOSPHERIC PADS:"
    echo "  • Dark Pad → OMNISPHERE (Pads → Dark Matter Pad)"
    echo "  • Atmospheric Texture → OMNISPHERE (Textures → Ethereal Texture)"
    echo "  • Reversed Atmos → OMNISPHERE (FX → Reverse Atmosphere)"
    echo "  • Alternative: Analog Lab (Prophet V pads), Arturia Pigments"
    echo ""
    echo "🎛️  OPTIONAL ADDITIONS:"
    echo "  • Acid Bass → TEKNO (Factory → Acid → Classic 303)"
    echo "  • Lead Synth → OMNISPHERE (Synths → Dark Lead)"
    echo "  • Stab Chords → OMNISPHERE (Synths → Synthwave Stab)"
    echo "  • Arp Sequence → TEKNO (Arps → Industrial Seq)"
    echo ""
    echo "💾 ALTERNATIVE VST3 INSTRUMENTS:"
    echo "  Bass: Serum, Massive X, Phase Plant, Diva"
    echo "  Pads: Analog Lab V, Pigments, Zebra2, Repro-5"
    echo "  Drums: Battery 4, Geist2, Addictive Drums"
    echo "  Effects: FabFilter (Saturn, Timeless), Valhalla (VintageVerb)"
    echo ""
    read "?Press Enter to return to main menu..."
}

# Menu
echo "What would you like to do?"
echo ""
echo "1) Open Ableton template (Manual-set.als)"
echo "2) Open setup guide in text editor"
echo "3) Open MIDI files folder"
echo "4) Generate new MIDI variations"
echo "5) Open everything (template + guides + MIDI folder)"
echo "6) View instrument recommendations"
echo "7) Exit"
echo ""

read "choice?Enter your choice (1-7): "

case $choice in
    1)
        echo ""
        echo "🚀 Opening Ableton template..."
        open -a "Ableton Live 12 Suite" "Techno-Template-Output/Manual-set Project/Manual-set.als"
        ;;
    2)
        echo ""
        echo "📖 Opening setup guides..."
        open "MIDI-Files/Dark-Atmospheric/SETUP-GUIDE.md"
        open "DARK-ATMOSPHERIC-COMPLETE.md"
        ;;
    3)
        echo ""
        echo "📁 Opening MIDI files folders..."
        open "MIDI-Files/"
        open "MIDI-Files/Dark-Atmospheric/"
        ;;
    4)
        echo ""
        echo "🎵 Generating new MIDI variations..."
        read "?Generate original patterns (1) or dark atmospheric (2)? "
        if [[ $REPLY == "1" ]]; then
            python3 generate_midi_files.py
        else
            python3 create_dark_atmospheric_techno.py
        fi
        ;;
    5)
        echo ""
        echo "🎉 Opening everything..."
        open -a "Ableton Live 12 Suite" "Techno-Template-Output/Manual-set Project/Manual-set.als"
        sleep 2
        open "MIDI-Files/"
        open "MIDI-Files/Dark-Atmospheric/"
        open "DARK-ATMOSPHERIC-COMPLETE.md"
        open "MIDI-Files/Dark-Atmospheric/SETUP-GUIDE.md"
        echo ""
        echo "✅ All files opened! Start producing! 🎧"
        ;;
    6)
        show_instrument_menu
        ;;
    7)
        echo ""
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Please run again and select 1-7."
        exit 1
        ;;
esac

echo ""
echo "✅ Done! Happy producing! 🎵"
echo ""
echo "💡 Tips:"
echo "   • Follow DARK-ATMOSPHERIC-COMPLETE.md for full workflow"
echo "   • Start with Deep Kick + Sub Rumble for foundation"
echo "   • Add Dark Pad slowly for atmosphere"
echo "   • Use heavy reverb on Omnisphere textures"
echo ""
