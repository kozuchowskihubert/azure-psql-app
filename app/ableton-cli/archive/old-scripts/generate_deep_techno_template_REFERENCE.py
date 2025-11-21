#!/usr/bin/env python3
"""
Deep Techno Ableton Live Template Generator
Creates a minimal but complete Ableton Live 12 project file
"""

import gzip
import os
from typing import List, Tuple
from dataclasses import dataclass


@dataclass
class TrackConfig:
    """Configuration for a MIDI track"""
    name: str
    color: int
    annotation: str = ""


class AbletonTemplateGenerator:
    """Generate minimal Ableton Live 12 project templates"""
    
    def __init__(self, tempo: int = 124, output_dir: str = "Techno-Template-Output"):
        self.tempo = tempo
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
    
    def _create_minimal_header(self) -> str:
        """Create XML header for Ableton Live 12"""
        return f'''<?xml version="1.0" encoding="UTF-8"?>
<Ableton MajorVersion="5" MinorVersion="11.0_433" SchemaChangeCount="6" Creator="Ableton Live 12.0" Revision="">
	<LiveSet>
		<NextPointeeId Value="500" />
		<OverwriteProtectionNumber Value="3217" />
		<Tempo>
			<Manual Value="{self.tempo}" />
		</Tempo>
		<TimeSignature>
			<TimeSignatures>
				<RemoteableTimeSignature Id="0">
					<Numerator Value="4" />
					<Denominator Value="4" />
				</RemoteableTimeSignature>
			</TimeSignatures>
		</TimeSignature>
		<GlobalRecordQuantization Value="0" />
		<GlobalMidiRecordQuantization Value="3" />'''
    
    def _create_master_track(self) -> str:
        """Create master track XML"""
        return '''
		<MasterTrack Id="1">
			<LomId Value="0" />
			<LomIdView Value="0" />
			<IsContentSelectedInDocument Value="false" />
			<DeviceChain>
				<Devices />
			</DeviceChain>
			<AutomationEnvelopes />
			<Name>
				<EffectiveName Value="Master" />
				<UserName Value="" />
				<Annotation Value="" />
			</Name>
		</MasterTrack>'''
    
    def _create_midi_track(self, track_id: int, config: TrackConfig) -> str:
        """Create a single MIDI track"""
        return f'''
			<MidiTrack Id="{track_id}">
				<LomId Value="0" />
				<LomIdView Value="0" />
				<IsContentSelectedInDocument Value="false" />
				<DeviceChain>
					<Devices />
				</DeviceChain>
				<AutomationEnvelopes />
				<Name>
					<EffectiveName Value="{config.name}" />
					<UserName Value="{config.name}" />
					<Annotation Value="{config.annotation}" />
				</Name>
				<Color Value="{config.color}" />
			</MidiTrack>'''
    
    def _create_return_track(self, track_id: int, name: str, annotation: str = "") -> str:
        """Create a return/send track"""
        return f'''
			<ReturnTrack Id="{track_id}">
				<LomId Value="0" />
				<LomIdView Value="0" />
				<IsContentSelectedInDocument Value="false" />
				<DeviceChain>
					<Devices />
				</DeviceChain>
				<AutomationEnvelopes />
				<Name>
					<EffectiveName Value="{name}" />
					<UserName Value="{name}" />
					<Annotation Value="{annotation}" />
				</Name>
				<Color Value="0" />
			</ReturnTrack>'''
    
    def _create_footer(self) -> str:
        """Create XML footer"""
        return '''
	</LiveSet>
</Ableton>'''
    
    def generate_deep_techno_template(self) -> Tuple[str, str]:
        """Generate complete Deep Techno template"""
        
        # Define tracks
        tracks = [
            TrackConfig("01 - DEEP KICK", 1, "MIDI: 01-Deep-Kick.mid | Add TEKNO"),
            TrackConfig("02 - ROLLING SUB", 16, "MIDI: 02-Rolling-Sub.mid | Add TEKNO"),
            TrackConfig("03 - OFF-BEAT HAT", 3, "MIDI: 03-Off-Beat-Hat.mid | Use Drum Rack"),
            TrackConfig("04 - GHOST SNARES", 2, "MIDI: 04-Ghost-Snares.mid | Use Drum Rack"),
            TrackConfig("05 - ATMOSPHERIC PAD", 21, "MIDI: 05-Atmospheric-Pad.mid | Add OMNISPHERE"),
            TrackConfig("06 - RHYTHMIC STABS", 22, "MIDI: 06-Rhythmic-Stabs.mid | Add OMNISPHERE"),
        ]
        
        # Define return tracks
        returns = [
            ("A - REVERB", "Add Reverb (Hall, 5.5s)"),
            ("B - DELAY", "Add Echo (1/8, 35%)"),
            ("C - PLATE", "Add Reverb (Plate)"),
        ]
        
        # Build XML
        xml_parts = [self._create_minimal_header()]
        xml_parts.append(self._create_master_track())
        xml_parts.append('\n\t\t<Tracks>')
        
        # Add MIDI tracks
        for idx, track in enumerate(tracks, start=10):
            xml_parts.append(self._create_midi_track(idx, track))
        
        xml_parts.append('\n\t\t</Tracks>')
        xml_parts.append('\n\t\t<VisibleTracks />')
        xml_parts.append('\n\t\t<ReturnTracks>')
        
        # Add return tracks
        for idx, (name, annotation) in enumerate(returns, start=30):
            xml_parts.append(self._create_return_track(idx, name, annotation))
        
        xml_parts.append('\n\t\t</ReturnTracks>')
        xml_parts.append(self._create_footer())
        
        xml_content = ''.join(xml_parts)
        
        # Generate filenames
        als_filename = "Deep-Techno-Template.als"
        xml_filename = "Deep-Techno-Template.xml"
        
        return xml_content, als_filename, xml_filename
    
    def save_template(self, xml_content: str, als_filename: str, xml_filename: str) -> None:
        """Save template to disk (both .als and .xml)"""
        
        # Save compressed .als file
        als_path = os.path.join(self.output_dir, als_filename)
        with gzip.open(als_path, 'wb') as f:
            f.write(xml_content.encode('utf-8'))
        
        # Save uncompressed .xml for debugging
        xml_path = os.path.join(self.output_dir, xml_filename)
        with open(xml_path, 'w', encoding='utf-8') as f:
            f.write(xml_content)
        
        file_size = os.path.getsize(als_path)
        
        print(f"  ✓ Created: {als_filename} ({file_size:,} bytes)")
        print(f"  ✓ Created: {xml_filename} (uncompressed)")
    
    def generate(self) -> None:
        """Generate and save Deep Techno template"""
        print(f"\n🎹 Generating Deep Techno Ableton Template ({self.tempo} BPM)...\n")
        
        xml_content, als_filename, xml_filename = self.generate_deep_techno_template()
        self.save_template(xml_content, als_filename, xml_filename)
        
        print(f"\n✅ Template saved to '{self.output_dir}/'")
        print("\nTemplate includes:")
        print("  • 6 MIDI tracks (ready for instruments)")
        print("  • 3 Return tracks (for effects)")
        print("  • Tempo set to", self.tempo, "BPM")
        print("  • 4/4 time signature")
        print(f"\n➡️  Open '{als_filename}' in Ableton Live 12\n")


def main():
    """Main entry point"""
    generator = AbletonTemplateGenerator(tempo=124)
    generator.generate()


if __name__ == "__main__":
    main()
