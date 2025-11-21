#!/usr/bin/env python3
import os
import subprocess

def check_vst3_plugins():
    vst3_paths = [
        "/Library/Audio/Plug-Ins/VST3",
        os.path.expanduser("~/Library/Audio/Plug-Ins/VST3")
    ]
    
    plugins_found = {
        'TEKNO': False,
        'Omnisphere': False
    }
    
    print("🔍 Scanning for VST3 plugins...\n")
    
    for path in vst3_paths:
        if os.path.exists(path):
            files = os.listdir(path)
            for file in files:
                if 'tekno' in file.lower() or 'tekno' in file.lower():
                    plugins_found['TEKNO'] = True
                    print(f"✅ Found TEKNO: {path}/{file}")
                if 'omnisphere' in file.lower():
                    plugins_found['Omnisphere'] = True
                    print(f"✅ Found Omnisphere: {path}/{file}")
    
    print("\n" + "="*50)
    print("RESULTS:")
    print("="*50)
    
    if plugins_found['TEKNO']:
        print("✅ TEKNO is installed")
    else:
        print("❌ TEKNO not found - install from developer website")
        
    if plugins_found['Omnisphere']:
        print("✅ OMNISPHERE is installed")
    else:
        print("❌ OMNISPHERE not found - install from Spectrasonics")
    
    if all(plugins_found.values()):
        print("\n🎉 All plugins ready! You can proceed with the template setup.")
    else:
        print("\n⚠️  Some plugins missing. Install them before continuing.")

if __name__ == "__main__":
    check_vst3_plugins()
