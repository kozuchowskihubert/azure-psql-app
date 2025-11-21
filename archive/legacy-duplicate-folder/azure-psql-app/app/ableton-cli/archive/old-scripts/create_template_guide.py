#!/usr/bin/env python3
"""
Ableton Live Techno Template - Setup Instructions Generator
Creates a text-based setup guide that you follow manually in Ableton Live
This is the RELIABLE way to create templates without format corruption issues
"""

import os

class AbletonSetupGenerator:
    def __init__(self):
        self.tempo = 128
        self.time_signature = (4, 4)
        
    def generate_setup_instructions(self, output_dir):
        """Generate comprehensive setup instructions"""
        
        os.makedirs(output_dir, exist_ok=True)
        
        instructions = f"""
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║               ABLETON LIVE TECHNO TEMPLATE - SETUP GUIDE                 ║
║                     With TEKNO & OMNISPHERE 3                            ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

🎯 GOAL: Create a professional techno template in Ableton Live 12
⏱️  TIME: 10-15 minutes
🎵 TEMPO: {self.tempo} BPM
📊 TIME SIGNATURE: {self.time_signature[0]}/{self.time_signature[1]}

══════════════════════════════════════════════════════════════════════════

STEP 1: CREATE NEW PROJECT
══════════════════════════════════════════════════════════════════════════

1. Open Ableton Live 12
2. File > New Live Set
3. Save As: "Techno Banger Template"
4. Set Tempo: {self.tempo} BPM (top left)
5. Set Time Signature: {self.time_signature[0]}/{self.time_signature[1]}

══════════════════════════════════════════════════════════════════════════

STEP 2: CREATE TRACKS (12 MIDI TRACKS)
══════════════════════════════════════════════════════════════════════════

Right-click in empty space > Insert MIDI Track (repeat 12 times)
OR: Cmd+Shift+T (12 times)

══════════════════════════════════════════════════════════════════════════

STEP 3: NAME & COLOR TRACKS
══════════════════════════════════════════════════════════════════════════

Track 1:  🥁 KICK
   - Right-click track name > Rename > "🥁 KICK"
   - Right-click track > Color > Red (1)
   - Add Device: Drum Rack
   - Load: 808 Kick sample to C2 pad

Track 2:  🥁 SUB BASS
   - Rename: "🥁 SUB BASS"
   - Color: Dark Red (16)
   - Add Device: Operator
   - Preset: Operator > Bass > Sub Bass > Simple Sine

Track 3:  🥁 CLAP
   - Rename: "🥁 CLAP"
   - Color: Orange (2)
   - Add Device: Drum Rack
   - Load: 909 Clap sample to D2 pad

Track 4:  🥁 HI-HAT CLOSED
   - Rename: "🥁 HI-HAT CLOSED"
   - Color: Yellow (3)
   - Add Device: Drum Rack
   - Load: Closed Hi-hat sample to F#2 pad

Track 5:  🥁 HI-HAT OPEN
   - Rename: "🥁 HI-HAT OPEN"
   - Color: Light Yellow (4)
   - Add Device: Drum Rack
   - Load: Open Hi-hat sample to A#2 pad

Track 6:  🎸 BASS - TEKNO
   - Rename: "🎸 BASS - TEKNO"
   - Color: Dark Blue (11)
   - Add Device: Plug-ins > VST3 > TEKNO
   - Preset: Deep Techno Bass / Minimal Sub
   - Add: Compressor (sidechain to Kick)
   - Add: Saturator (Drive: 8dB)

Track 7:  🎸 ACID BASS - TEKNO
   - Rename: "🎸 ACID BASS - TEKNO"
   - Color: Blue (12)
   - Add Device: Plug-ins > VST3 > TEKNO
   - Preset: 303 Acid / Squelchy Bass
   - Add: Auto Filter (automate cutoff)
   - Add: Compressor (sidechain to Kick)

Track 8:  🎹 LEAD - OMNISPHERE
   - Rename: "🎹 LEAD - OMNISPHERE"
   - Color: Green (21)
   - Add Device: Plug-ins > VST3 > OMNISPHERE
   - Preset: Ethereal Pad / Dark Euphoria / Techno Lead
   - Add: Echo (1/8 dotted, 30% feedback)

Track 9:  🎹 STABS - OMNISPHERE
   - Rename: "🎹 STABS - OMNISPHERE"
   - Color: Light Green (22)
   - Add Device: Plug-ins > VST3 > OMNISPHERE
   - Preset: Pluck Synth / Tech Stabs / Stab Brass
   - Add: Compressor (quick attack/release)

Track 10: 🎹 ARP - WAVETABLE
   - Rename: "🎹 ARP - WAVETABLE"
   - Color: Cyan (23)
   - Add Device: Wavetable
   - Preset: Arpeggiators > (any)
   - Add: Arpeggiator device (Style: Up, Rate: 1/16)

Track 11: ✨ FX 1 - WHITE NOISE
   - Rename: "✨ FX 1 - WHITE NOISE"
   - Color: Gray (50)
   - Add Device: Wavetable
   - Preset: Basic Shapes > White Noise

Track 12: ✨ FX 2 - RISER
   - Rename: "✨ FX 2 - RISER"
   - Color: Light Gray (51)
   - Add Device: Wavetable
   - Preset: FX > Riser

══════════════════════════════════════════════════════════════════════════

STEP 4: IMPORT MIDI FILES
══════════════════════════════════════════════════════════════════════════

Location: /Users/haos/YT/Ableton-Automation/MIDI-Files/

Method 1 (Drag & Drop):
1. Open Finder
2. Navigate to MIDI-Files folder
3. Drag files to tracks:
   - 01-Kick.mid         → Track 1 (KICK)
   - 02-Sub-Bass.mid     → Track 2 (SUB BASS)
   - 03-Clap.mid         → Track 3 (CLAP)
   - 04-HiHat-Closed.mid → Track 4 (HI-HAT CLOSED)
   - 05-HiHat-Open.mid   → Track 5 (HI-HAT OPEN)
   - 06-Bass-Synth.mid   → Track 6 (BASS - TEKNO)
   - 07-Acid-Bass.mid    → Track 7 (ACID BASS - TEKNO)
   - 08-Lead-Synth.mid   → Track 8 (LEAD - OMNISPHERE)
   - 09-Stab-Synth.mid   → Track 9 (STABS - OMNISPHERE)

Method 2 (Browser):
1. In Ableton Browser, click "Places"
2. Navigate to MIDI-Files folder
3. Drag each .mid file to its track

══════════════════════════════════════════════════════════════════════════

STEP 5: CREATE RETURN TRACKS (3 RETURNS)
══════════════════════════════════════════════════════════════════════════

Right-click below Return tracks > Insert Return Track (repeat 3 times)

Return Track 1: REVERB - HALL
   - Rename: "REVERB - HALL"
   - Add Device: Reverb
   - Settings:
     * Decay: 5.5s
     * Pre-Delay: 20ms
     * Diffusion: 70%
     * Dry/Wet: 100%

Return Track 2: DELAY - 1/8
   - Rename: "DELAY - 1/8"
   - Add Device: Echo
   - Settings:
     * Time: 1/8 note
     * Feedback: 35%
     * Filter: High-pass @ 500Hz
     * Dry/Wet: 100%

Return Track 3: REVERB - PLATE
   - Rename: "REVERB - PLATE"
   - Add Device: Reverb
   - Settings:
     * Reverb Type: Plate
     * Decay: 1.8s
     * Pre-Delay: 10ms
     * Dry/Wet: 100%

══════════════════════════════════════════════════════════════════════════

STEP 6: SETUP MASTER CHAIN
══════════════════════════════════════════════════════════════════════════

Click Master track > Add devices:

1. EQ Eight
   - Band 1: High-pass @ 30Hz (clean up mud)
   - Band 8: Shelf boost @ 10kHz +1dB (air)

2. Glue Compressor
   - Ratio: 2:1
   - Attack: 10ms
   - Release: Auto
   - Makeup: 2-3dB
   - Dry/Wet: 30% (parallel compression)

3. Limiter
   - Ceiling: -0.3dB
   - Gain: 3-6dB (adjust for loudness)
   - Release: Auto

══════════════════════════════════════════════════════════════════════════

STEP 7: SETUP SIDECHAIN COMPRESSION (CRITICAL!)
══════════════════════════════════════════════════════════════════════════

This makes bass "duck" when kick hits (techno pumping effect)

1. On Track 1 (KICK):
   - Click "Sends" section
   - Create new Send track: Right-click > "Insert Return Track"
   - Name it: "Sidechain"
   - Set send level: 0dB (fully on)
   - On the Sidechain return track: Add "Utility" device
   - Set Utility gain: -∞ (silent - we don't want to hear it!)

2. On Track 2 (SUB BASS):
   - Add device: Compressor
   - Click triangle next to "Compressor" to expand
   - Click "Sidechain" section
   - Audio From: "Sidechain" (the return track)
   - Settings:
     * Ratio: 8:1
     * Attack: 1ms
     * Release: 100ms
     * Threshold: Adjust so bass ducks ~6-10dB when kick hits

3. Repeat for:
   - Track 6 (BASS - TEKNO)
   - Track 7 (ACID BASS - TEKNO)
   - Track 8 (LEAD - OMNISPHERE) - lighter (4:1 ratio)
   - Track 9 (STABS - OMNISPHERE) - lighter (4:1 ratio)

══════════════════════════════════════════════════════════════════════════

STEP 8: GROUP TRACKS (ORGANIZATION)
══════════════════════════════════════════════════════════════════════════

1. Select Tracks 1-5 (hold Shift)
   - Right-click > Group Tracks (or Cmd+G)
   - Rename group: "🥁 DRUMS"
   - Color: Red

2. Select Tracks 6-7
   - Group: "🎸 BASS"
   - Color: Blue

3. Select Tracks 8-10
   - Group: "🎹 SYNTHS"
   - Color: Green

4. Select Tracks 11-12
   - Group: "✨ FX"
   - Color: Gray

══════════════════════════════════════════════════════════════════════════

STEP 9: CONFIGURE TEKNO PRESETS
══════════════════════════════════════════════════════════════════════════

Track 6 (BASS - TEKNO):
   - Click Tekno plugin interface
   - Choose preset: "Deep Bass" or "Minimal Sub"
   - Adjust:
     * Filter Cutoff: 800Hz
     * Resonance: 20%
     * Oscillator: Sawtooth or Square
     * Envelope Attack: 5ms, Release: 200ms

Track 7 (ACID BASS - TEKNO):
   - Choose preset: "303 Acid" or "Resonant"
   - Adjust:
     * Filter Cutoff: 500Hz (we'll automate this!)
     * Resonance: 70% (for squelch)
     * Oscillator: Sawtooth
     * Portamento/Glide: ON, 80ms
   - In Ableton:
     * Click automation button (top right)
     * Select Track 7 > Tekno > Filter Cutoff
     * Draw automation: Start 200Hz → End 2000Hz over 8 bars
     * This creates classic acid sweep!

══════════════════════════════════════════════════════════════════════════

STEP 10: CONFIGURE OMNISPHERE PRESETS
══════════════════════════════════════════════════════════════════════════

Track 8 (LEAD - OMNISPHERE):
   - Click Omnisphere plugin interface
   - Click "Browser" button
   - Search: "ethereal" or "techno lead" or "dark"
   - Suggested presets:
     * Ethereal Pad (Pads > Atmospheric)
     * Dark Euphoria (Leads > Synth)
     * Berlin School Lead (Vintage > Analog)
   - Double-click to load
   - Adjust:
     * Layer A: Pad sound
     * Layer B: Lead element (optional)
     * FX > Reverb: 3.5s decay
     * FX > Delay: 1/4 note, 30% feedback

Track 9 (STABS - OMNISPHERE):
   - Search: "pluck" or "stab" or "brass"
   - Suggested presets:
     * Pluck Synth (Plucked > Synth)
     * Tech Stabs (Arpeggios & Rhythms)
     * Stab Brass (Brass > Synth Brass)
   - Adjust:
     * Envelope: Short decay for stab effect
     * FX > Reverb: Plate, 1.8s decay

══════════════════════════════════════════════════════════════════════════

STEP 11: SAVE AS TEMPLATE
══════════════════════════════════════════════════════════════════════════

1. File > Save Live Set As Template
2. Name: "Techno Banger - VST3"
3. Location: User Library > Templates
4. Click Save

NOW IT'S IN YOUR TEMPLATES!

To use:
- File > New Live Set from Template > "Techno Banger - VST3"

══════════════════════════════════════════════════════════════════════════

STEP 12: TEST YOUR TEMPLATE
══════════════════════════════════════════════════════════════════════════

1. Press SPACE to play
2. All MIDI clips should loop
3. Adjust volumes:
   - Kick: -6dB
   - Sub Bass: -10dB
   - Clap: -12dB
   - Hi-hats: -15dB
   - Bass synths: -8dB
   - Lead/Stabs: -10dB

4. Check sidechain is working:
   - You should hear bass "pump" with kick
   - If not, adjust compressor threshold

5. Mix with return tracks:
   - Send clap to Reverb Hall: 20%
   - Send stabs to Reverb Plate: 30%
   - Send lead to Delay 1/8: 15%

══════════════════════════════════════════════════════════════════════════

✅ CHECKLIST - VERIFY YOU HAVE:
══════════════════════════════════════════════════════════════════════════

[ ] 12 MIDI tracks created and named
[ ] All tracks color-coded
[ ] Instruments loaded on all tracks
[ ] MIDI files imported (9 files)
[ ] TEKNO loaded on tracks 6-7
[ ] OMNISPHERE loaded on tracks 8-9
[ ] 3 Return tracks with effects
[ ] Master chain (EQ + Compressor + Limiter)
[ ] Sidechain compression setup on bass tracks
[ ] Tracks grouped (DRUMS, BASS, SYNTHS, FX)
[ ] Template saved
[ ] Test playback works

══════════════════════════════════════════════════════════════════════════

🎉 CONGRATULATIONS!
══════════════════════════════════════════════════════════════════════════

Your techno template is ready!

Every time you start a new track:
1. File > New Live Set from Template
2. Choose "Techno Banger - VST3"
3. Start producing immediately!

══════════════════════════════════════════════════════════════════════════

💡 PRO TIPS
══════════════════════════════════════════════════════════════════════════

ARRANGEMENT IDEAS:
- Intro (32 bars): Hi-hats + Arp only
- Build (16 bars): Add Kick + Sub Bass
- Drop 1 (32 bars): Full drums + Bass Synth
- Breakdown (16 bars): Remove kick, add Lead
- Build 2 (16 bars): Use Riser FX
- Drop 2 (32 bars): Everything! Add Acid Bass
- Outro (32 bars): Gradually remove elements

AUTOMATION:
- Automate filter cutoffs (especially Acid Bass!)
- Automate reverb sends for builds
- Automate volume for transitions
- Automate Omnisphere parameters

SOUND DESIGN:
- Layer kicks (use 2 kick tracks for punch)
- Add sub harmonics to bass
- Use automation for movement
- Don't overuse reverb on bass!

MIXING:
- Keep kick and bass mono (Utility > Width: 0%)
- Pan hi-hats slightly (15-20% L/R)
- Widen synths with chorus/stereo width
- Leave 3-6dB headroom on master

══════════════════════════════════════════════════════════════════════════

Created: November 21, 2025
Tempo: {self.tempo} BPM
MIDI Files: /Users/haos/YT/Ableton-Automation/MIDI-Files/
VST3 Plugins: TEKNO, OMNISPHERE 3

══════════════════════════════════════════════════════════════════════════
"""

        # Write instructions
        instructions_file = os.path.join(output_dir, "SETUP-INSTRUCTIONS.txt")
        with open(instructions_file, 'w', encoding='utf-8') as f:
            f.write(instructions)
        
        print("\n" + "="*70)
        print("📝 ABLETON LIVE SETUP INSTRUCTIONS CREATED!")
        print("="*70)
        print(f"\n📁 File: {os.path.abspath(instructions_file)}")
        print("\n✅ SOLUTION: Follow the step-by-step instructions to create")
        print("   your template manually in Ableton Live.")
        print("\n💡 WHY: This avoids .als file format corruption issues")
        print("   and gives you a template that ACTUALLY WORKS!")
        print("\n🚀 START: Open the file and follow along in Ableton Live")
        print("⏱️  TIME: 10-15 minutes total setup time")
        print("\n" + "="*70 + "\n")
        
        return instructions_file


def main():
    """Generate setup instructions"""
    generator = AbletonSetupGenerator()
    output_dir = "Techno-Template-Output"
    generator.generate_setup_instructions(output_dir)
    
    print("🎯 NEXT STEP: Open SETUP-INSTRUCTIONS.txt and follow along!")
    print("📂 Location: Techno-Template-Output/SETUP-INSTRUCTIONS.txt\n")


if __name__ == "__main__":
    main()
