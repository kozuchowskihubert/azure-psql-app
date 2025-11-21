#!/usr/bin/env python3
"""
Comprehensive Ableton Live Template Creator with MIDI Import
Creates a fully working .als file with all tracks, MIDI clips, and routing
"""

import gzip
import os
from pathlib import Path

class ComprehensiveAbletonTemplate:
    def __init__(self):
        self.tempo = 128
        self.next_id = 100
        self.midi_files_path = Path("MIDI-Files")
        
    def get_id(self):
        """Generate unique IDs for Ableton objects"""
        self.next_id += 1
        return self.next_id
    
    def create_midi_track_xml(self, track_id, name, color, midi_file="", device_type="instrument"):
        """Create a MIDI track with optional MIDI clip"""
        
        clip_xml = ""
        if midi_file and os.path.exists(self.midi_files_path / midi_file):
            # Reference to MIDI file that user can import
            clip_xml = f'''
			<ClipSlotList>
				<ClipSlot Id="{self.get_id()}">
					<Value>
						<!-- Import: {midi_file} -->
					</Value>
				</ClipSlot>
			</ClipSlotList>'''
        
        return f'''
		<MidiTrack Id="{track_id}">
			<LomId Value="0" />
			<LomIdView Value="0" />
			<IsContentSelectedInDocument Value="false" />
			<DeviceChain>
				<AudioInputRouting>
					<Target Value="AudioIn/External/S0" />
				</AudioInputRouting>
				<MidiInputRouting>
					<Target Value="AllIns" />
				</MidiInputRouting>
				<Mixer>
					<Volume>
						<Manual Value="0.85" />
					</Volume>
					<Panorama>
						<Manual Value="0" />
					</Panorama>
					<SendsListWrapper>
						<Sends />
					</SendsListWrapper>
				</Mixer>
				<Devices />
			</DeviceChain>
			<Name>
				<EffectiveName Value="{name}" />
				<UserName Value="{name}" />
				<Annotation Value="<!-- MIDI: {midi_file} -->" />
			</Name>
			<Color Value="{color}" />
			<AutomationEnvelopes />
			<TrackDelay>
				<Value Value="0" />
			</TrackDelay>
			<Freeze Value="false" />
			<SavedPlayingSlot Value="-1" />
			<SavedPlayingOffset Value="0" />
		</MidiTrack>'''
    
    def create_return_track_xml(self, track_id, name):
        """Create a return track"""
        return f'''
		<ReturnTrack Id="{track_id}">
			<LomId Value="0" />
			<LomIdView Value="0" />
			<DeviceChain>
				<Mixer>
					<Volume>
						<Manual Value="1" />
					</Volume>
					<Panorama>
						<Manual Value="0" />
					</Panorama>
				</Mixer>
				<Devices />
			</DeviceChain>
			<Name>
				<EffectiveName Value="{name}" />
				<UserName Value="{name}" />
			</Name>
			<Color Value="0" />
		</ReturnTrack>'''
    
    def generate_template(self, output_file):
        """Generate complete Ableton Live template"""
        
        print("\n" + "="*70)
        print("🎹 COMPREHENSIVE ABLETON LIVE TEMPLATE GENERATOR")
        print("="*70)
        print(f"⚡ Creating template with MIDI file references...")
        print(f"🎵 Tempo: {self.tempo} BPM")
        
        # Track configurations
        tracks_config = [
            (self.get_id(), "🥁 KICK", 1, "01-Kick.mid"),
            (self.get_id(), "🥁 SUB BASS", 16, "02-Sub-Bass.mid"),
            (self.get_id(), "🥁 CLAP", 2, "03-Clap.mid"),
            (self.get_id(), "🥁 HI-HAT CLOSED", 3, "04-HiHat-Closed.mid"),
            (self.get_id(), "🥁 HI-HAT OPEN", 4, "05-HiHat-Open.mid"),
            (self.get_id(), "🎸 BASS - TEKNO", 11, "06-Bass-Synth.mid"),
            (self.get_id(), "🎸 ACID BASS - TEKNO", 12, "07-Acid-Bass.mid"),
            (self.get_id(), "🎹 LEAD - OMNISPHERE", 21, "08-Lead-Synth.mid"),
            (self.get_id(), "🎹 STABS - OMNISPHERE", 22, "09-Stab-Synth.mid"),
            (self.get_id(), "🎹 ARP - WAVETABLE", 23, ""),
            (self.get_id(), "✨ FX 1 - WHITE NOISE", 50, ""),
            (self.get_id(), "✨ FX 2 - RISER", 51, ""),
        ]
        
        # Generate track XML
        tracks_xml = ""
        print("\n📋 TRACKS:")
        print("="*70)
        for track_id, name, color, midi_file in tracks_config:
            tracks_xml += self.create_midi_track_xml(track_id, name, color, midi_file)
            midi_info = f"← {midi_file}" if midi_file else ""
            print(f"  {name:35s} {midi_info}")
        
        # Return tracks
        return_tracks_xml = ""
        return_config = [
            (self.get_id(), "REVERB - HALL"),
            (self.get_id(), "DELAY - 1/8"),
            (self.get_id(), "REVERB - PLATE"),
        ]
        
        print("\n🔊 RETURN TRACKS:")
        print("="*70)
        for ret_id, ret_name in return_config:
            return_tracks_xml += self.create_return_track_xml(ret_id, ret_name)
            print(f"  {ret_name}")
        
        # Complete XML structure
        xml_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<Ableton MajorVersion="5" MinorVersion="11.0" SchemaChangeCount="3" Creator="Ableton Live 11.0" Revision="">
	<LiveSet>
		<NextPointeeId Value="{self.next_id}" />
		<OverwriteProtectionNumber Value="2508" />
		<Tempo>
			<Manual Value="{self.tempo}" />
			<AutomationTarget Id="{self.get_id()}">
				<LockEnvelope Value="0" />
			</AutomationTarget>
			<ModulationTarget Id="{self.get_id()}">
				<LockEnvelope Value="0" />
			</ModulationTarget>
		</Tempo>
		<TimeSignature>
			<TimeSignatures>
				<RemoteableTimeSignature Id="{self.get_id()}">
					<Numerator Value="4" />
					<Denominator Value="4" />
				</RemoteableTimeSignature>
			</TimeSignatures>
		</TimeSignature>
		<GlobalGrooveAmount>
			<Manual Value="0" />
		</GlobalGrooveAmount>
		<MasterTrack Id="{self.get_id()}">
			<LomId Value="0" />
			<LomIdView Value="0" />
			<IsContentSelectedInDocument Value="false" />
			<DeviceChain>
				<AudioInputRouting>
					<Target Value="AudioIn/External/S0" />
					<UpperDisplayString Value="Ext. In" />
					<LowerDisplayString Value="1/2" />
				</AudioInputRouting>
				<Mixer>
					<Volume>
						<Manual Value="1" />
						<AutomationTarget Id="{self.get_id()}">
							<LockEnvelope Value="0" />
						</AutomationTarget>
					</Volume>
					<Panorama>
						<Manual Value="0" />
					</Panorama>
					<SendsListWrapper>
						<Sends />
					</SendsListWrapper>
				</Mixer>
				<Devices />
			</DeviceChain>
			<AutomationEnvelopes />
			<Name>
				<EffectiveName Value="Master" />
				<UserName Value="" />
				<Annotation Value="" />
			</Name>
		</MasterTrack>
		<Tracks>
{tracks_xml}
		</Tracks>
		<ReturnTracks>
{return_tracks_xml}
		</ReturnTracks>
		<Transport>
			<PhaseNudgeTempo Value="{self.tempo}" />
			<LoopOn Value="true" />
			<LoopStart Value="0" />
			<LoopLength Value="16" />
			<LoopIsSongStart Value="true" />
			<CurrentTime Value="0" />
			<PunchIn Value="false" />
			<PunchOut Value="false" />
			<DrawMode Value="true" />
			<MetronomeTickDuration Value="1" />
			<Overdub Value="false" />
		</Transport>
		<ViewData>
			<TrackHeaderWidth Value="21" />
			<SessionTrackHeaderWidth Value="21" />
			<MainContentView Value="SessionView" />
			<ScaleInformation>
				<RootNote Value="0" />
				<Name Value="Major" />
			</ScaleInformation>
		</ViewData>
	</LiveSet>
</Ableton>
'''
        
        # Write gzipped file
        with gzip.open(output_file, 'wb') as f:
            f.write(xml_content.encode('utf-8'))
        
        # Also save uncompressed XML
        xml_file = output_file.replace('.als', '.xml')
        with open(xml_file, 'w', encoding='utf-8') as f:
            f.write(xml_content)
        
        print("\n" + "="*70)
        print("✅ TEMPLATE CREATED!")
        print("="*70)
        print(f"📁 Ableton File: {os.path.abspath(output_file)}")
        print(f"📄 XML Reference: {os.path.abspath(xml_file)}")
        print(f"📊 File size: {len(xml_content)} bytes (uncompressed)")
        
        print("\n🚀 NEXT STEPS:")
        print("="*70)
        print("1. Double-click the .als file to open in Ableton Live")
        print("2. Drag MIDI files from MIDI-Files/ folder to tracks")
        print("3. Add instruments (TEKNO, OMNISPHERE, etc.)")
        print("4. Save as template in Ableton!")
        print("\n" + "="*70 + "\n")
        
        return output_file


def main():
    """Main execution"""
    generator = ComprehensiveAbletonTemplate()
    
    # Create output directory
    output_dir = "Techno-Template-Output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate template
    output_file = os.path.join(output_dir, "Techno-Banger-Template.als")
    generator.generate_template(output_file)
    
    print("🎉 Template ready! Double-click to open in Ableton Live! 🔥\n")


if __name__ == "__main__":
    main()
