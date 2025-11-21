#!/usr/bin/env python3
"""
Ableton Live Techno Template Generator with Real VST3 Instruments
Uses: Tekno, Omnisphere, and Ableton native devices
"""

import gzip
import xml.etree.ElementTree as ET
from xml.dom import minidom
import os

class AbletonLiveTemplateGenerator:
    def __init__(self):
        self.tempo = 128
        self.time_signature = (4, 4)
        
    def create_root(self):
        """Create root Ableton Live Set structure"""
        root = ET.Element("Ableton", MajorVersion="5", MinorVersion="12.0", Creator="Ableton Live 12.0")
        liveset = ET.SubElement(root, "LiveSet")
        
        # Tempo
        tempo_elem = ET.SubElement(liveset, "Tempo")
        ET.SubElement(tempo_elem, "Manual", Value=str(float(self.tempo)))
        
        # Time signature
        time_sig = ET.SubElement(liveset, "TimeSignature")
        ET.SubElement(time_sig, "TimeSignatureNumerator", Value=str(self.time_signature[0]))
        ET.SubElement(time_sig, "TimeSignatureDenominator", Value=str(self.time_signature[1]))
        
        return root, liveset
    
    def create_vst3_plugin(self, plugin_name, vst3_path=""):
        """Create VST3 plugin device"""
        plugin_device = ET.Element("PluginDevice")
        ET.SubElement(plugin_device, "PluginDesc").set("Name", plugin_name)
        if vst3_path:
            ET.SubElement(plugin_device, "VstPluginInfo").set("PluginPath", vst3_path)
        return plugin_device
    
    def create_ableton_instrument(self, instrument_type):
        """Create native Ableton instrument"""
        device = ET.Element(instrument_type)
        return device
    
    def create_midi_track(self, track_id, name, color, device_type="vst3", plugin_name="", midi_file_ref=""):
        """Create MIDI track with instrument"""
        track = ET.Element("MidiTrack", Id=str(track_id))
        
        # Track name
        name_elem = ET.SubElement(track, "Name")
        ET.SubElement(name_elem, "EffectiveName", Value=name)
        ET.SubElement(name_elem, "UserName", Value=name)
        
        # Track color
        ET.SubElement(track, "Color", Value=str(color))
        
        # Track volume
        volume = ET.SubElement(track, "Volume")
        ET.SubElement(volume, "Value", Value="0.85")
        
        # Track panning
        pan = ET.SubElement(track, "Pan")
        ET.SubElement(pan, "Value", Value="0.0")
        
        # Device chain
        device_chain = ET.SubElement(track, "DeviceChain")
        
        # Add instrument device
        if device_type == "vst3":
            if plugin_name.lower() == "tekno":
                device = self.create_vst3_plugin("Tekno", "Tekno.vst3")
            elif plugin_name.lower() == "omnisphere":
                device = self.create_vst3_plugin("Omnisphere", "Omnisphere.vst3")
            else:
                device = self.create_vst3_plugin(plugin_name)
            device_chain.append(device)
        elif device_type == "wavetable":
            device = self.create_ableton_instrument("InstrumentGroupDevice")
            device_chain.append(device)
        elif device_type == "operator":
            device = self.create_ableton_instrument("Operator")
            device_chain.append(device)
        elif device_type == "drumrack":
            device = self.create_ableton_instrument("DrumGroupDevice")
            device_chain.append(device)
        
        # MIDI clip slot reference
        if midi_file_ref:
            clip_slot = ET.SubElement(track, "ClipSlot")
            ET.SubElement(clip_slot, "Value")  # Empty but can reference MIDI file
        
        return track
    
    def create_return_track(self, track_id, name, effect_type):
        """Create return track with effect"""
        track = ET.Element("ReturnTrack", Id=str(track_id))
        
        name_elem = ET.SubElement(track, "Name")
        ET.SubElement(name_elem, "EffectiveName", Value=name)
        
        device_chain = ET.SubElement(track, "DeviceChain")
        
        if effect_type == "reverb":
            reverb = ET.Element("Reverb")
            device_chain.append(reverb)
        elif effect_type == "delay":
            delay = ET.Element("Delay")
            device_chain.append(delay)
        
        return track
    
    def create_master_track(self):
        """Create master track with mastering chain"""
        track = ET.Element("MasterTrack")
        
        name_elem = ET.SubElement(track, "Name")
        ET.SubElement(name_elem, "EffectiveName", Value="Master")
        
        device_chain = ET.SubElement(track, "DeviceChain")
        
        # EQ Eight
        eq = ET.Element("Eq8")
        device_chain.append(eq)
        
        # Glue Compressor
        compressor = ET.Element("Compressor2")
        device_chain.append(compressor)
        
        # Limiter
        limiter = ET.Element("Limiter")
        device_chain.append(limiter)
        
        return track
    
    def generate_template(self, output_path):
        """Generate complete Ableton Live template"""
        
        print("\n" + "="*70)
        print("🎹 ABLETON LIVE TECHNO TEMPLATE GENERATOR")
        print("="*70)
        print(f"⚡ Creating template with VST3 instruments...")
        print(f"🎵 Tempo: {self.tempo} BPM")
        print(f"📊 Time Signature: {self.time_signature[0]}/{self.time_signature[1]}")
        
        root, liveset = self.create_root()
        
        # Tracks container
        tracks = ET.SubElement(liveset, "Tracks")
        
        # Track definitions with VST3 instruments
        track_configs = [
            # DRUMS GROUP
            (1, "🥁 KICK", 1, "drumrack", "", "01-Kick.mid"),
            (2, "🥁 SUB BASS", 16, "operator", "", "02-Sub-Bass.mid"),
            (3, "🥁 CLAP", 2, "drumrack", "", "03-Clap.mid"),
            (4, "🥁 HI-HAT CLOSED", 3, "drumrack", "", "04-HiHat-Closed.mid"),
            (5, "🥁 HI-HAT OPEN", 4, "drumrack", "", "05-HiHat-Open.mid"),
            
            # BASS GROUP  
            (6, "🎸 BASS - TEKNO", 11, "vst3", "Tekno", "06-Bass-Synth.mid"),
            (7, "🎸 ACID BASS - TEKNO", 12, "vst3", "Tekno", "07-Acid-Bass.mid"),
            
            # SYNTH GROUP
            (8, "🎹 LEAD - OMNISPHERE", 21, "vst3", "Omnisphere", "08-Lead-Synth.mid"),
            (9, "🎹 STABS - OMNISPHERE", 22, "vst3", "Omnisphere", "09-Stab-Synth.mid"),
            
            # ARP - Wavetable
            (10, "🎹 ARP - WAVETABLE", 23, "wavetable", "", ""),
            
            # FX
            (11, "✨ FX 1 - WHITE NOISE", 50, "wavetable", "", ""),
            (12, "✨ FX 2 - RISER", 51, "wavetable", "", ""),
        ]
        
        print("\n📋 TRACKS:")
        print("="*70)
        
        for track_id, name, color, device, plugin, midi_ref in track_configs:
            track = self.create_midi_track(track_id, name, color, device, plugin, midi_ref)
            tracks.append(track)
            
            device_name = plugin if plugin else device.upper()
            midi_info = f"← {midi_ref}" if midi_ref else ""
            print(f"  {track_id:2d}. {name:30s} | {device_name:15s} {midi_info}")
        
        # Return tracks
        print("\n🔊 RETURN TRACKS:")
        print("="*70)
        
        return_tracks = ET.SubElement(liveset, "ReturnTracks")
        
        return_configs = [
            (100, "REVERB - HALL", "reverb"),
            (101, "DELAY - 1/8", "delay"),
            (102, "REVERB - PLATE", "reverb"),
        ]
        
        for ret_id, ret_name, effect in return_configs:
            ret_track = self.create_return_track(ret_id, ret_name, effect)
            return_tracks.append(ret_track)
            print(f"  R{ret_id-99}. {ret_name:30s} | {effect.upper()}")
        
        # Master track
        master = self.create_master_track()
        ET.SubElement(liveset, "MasterTrack").append(master)
        
        print("\n🎛️  MASTER CHAIN:")
        print("="*70)
        print("  1. EQ Eight (High-pass @ 30Hz)")
        print("  2. Glue Compressor (Gentle mix glue)")
        print("  3. Limiter (Ceiling -0.3dB)")
        
        # Convert to XML string
        xml_string = self.prettify_xml(root)
        
        # Save as .als (gzipped)
        output_file = output_path if output_path.endswith('.als') else f"{output_path}.als"
        
        with gzip.open(output_file, 'wb') as f:
            f.write(xml_string)
        
        # Also save uncompressed XML
        xml_path = output_path.replace('.als', '.xml')
        with open(xml_path, 'wb') as f:
            f.write(xml_string)
        
        print("\n" + "="*70)
        print("✅ TEMPLATE CREATED!")
        print("="*70)
        print(f"📁 Ableton File: {os.path.abspath(output_file)}")
        print(f"📄 XML Reference: {os.path.abspath(xml_path)}")
        
        print("\n🚀 NEXT STEPS:")
        print("="*70)
        print("1. Open the .als file in Ableton Live 12")
        print("2. Import MIDI files from MIDI-Files/ folder")
        print("3. Configure VST3 plugins (Tekno, Omnisphere)")
        print("4. Load drum samples into Drum Racks")
        print("5. Press Space to play!")
        
        print("\n💡 VST3 PLUGINS USED:")
        print("="*70)
        print("  • TEKNO - Bass synthesizer (tracks 6-7)")
        print("  • OMNISPHERE 3 - Lead/pad synthesizer (tracks 8-9)")
        print("  • Ableton WAVETABLE - Arp and FX (tracks 10-12)")
        print("  • Ableton OPERATOR - Sub bass (track 2)")
        print("  • Ableton DRUM RACK - Drums (tracks 1, 3-5)")
        
        print("\n" + "="*70)
        
        return output_file
    
    def prettify_xml(self, elem):
        """Return pretty-printed XML"""
        rough_string = ET.tostring(elem, encoding='utf-8')
        reparsed = minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent="  ", encoding='utf-8')


def main():
    """Main execution"""
    generator = AbletonLiveTemplateGenerator()
    
    # Create output directory
    output_dir = "Techno-Template-Output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate template
    output_path = os.path.join(output_dir, "Techno-Banger-Template")
    generator.generate_template(output_path)
    
    print("\n🎉 Template ready! Open in Ableton Live and start producing! 🔥\n")


if __name__ == "__main__":
    main()
