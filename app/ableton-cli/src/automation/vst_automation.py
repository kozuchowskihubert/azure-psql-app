#!/usr/bin/env python3
"""
Ableton VST3 Plugin Automation
Automates loading VST3 instruments onto MIDI tracks using GUI automation
Note: pyautogui is optional - only needed for desktop automation
"""

import time
import subprocess
from typing import Optional, Dict
from dataclasses import dataclass

# pyautogui is optional - only works in desktop environments
try:
    import pyautogui
    PYAUTOGUI_AVAILABLE = True
except ImportError:
    PYAUTOGUI_AVAILABLE = False
    print("⚠️  pyautogui not available - VST automation disabled (server mode)")


@dataclass
class PluginConfig:
    """Configuration for a plugin"""
    name: str
    search_term: str
    down_presses: int
    load_wait_time: float = 8.0


class AbletonAutomation:
    """Handle Ableton Live GUI automation"""
    
    def __init__(self):
        if not PYAUTOGUI_AVAILABLE:
            print("⚠️  Warning: pyautogui not available - automation features disabled")
    
    # Plugin configurations
    PLUGINS = {
        "Tekno": PluginConfig("Tekno", "Tekno", 1, 8.0),
        "Omnisphere": PluginConfig("Omnisphere", "Omnisphere", 2, 10.0),
    }
    
    # Timing constants (in seconds)
    TIMING = {
        'window_activation': 3.0,
        'view_switch': 1.0,
        'track_navigation': 1.0,
        'browser_open': 2.5,
        'search_typing': 3.0,
        'plugin_selection': 0.7,
        'browser_close': 1.5,
    }
    
    def __init__(self):
        self.process_name: Optional[str] = None
    
    def _run_applescript(self, script: str) -> Optional[str]:
        """Execute AppleScript and return output"""
        try:
            result = subprocess.run(
                ['osascript', '-e', script],
                capture_output=True,
                text=True,
                check=True,
                timeout=10
            )
            return result.stdout.strip()
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as e:
            print(f"  ⚠️  AppleScript error: {e}")
            return None
    
    def find_ableton_process(self) -> bool:
        """Find the running Ableton Live process"""
        script = 'tell application "System Events" to get name of every process whose background only is false'
        output = self._run_applescript(script)
        
        if output:
            processes = output.split(', ')
            for process in processes:
                if "Ableton Live Suite" in process:
                    self.process_name = process
                    print(f"  ✓ Found process: {self.process_name}")
                    return True
        
        print("  ❌ Ableton Live Suite process not found")
        return False
    
    def activate_window(self) -> bool:
        """Activate Ableton window"""
        if not self.process_name:
            return False
        
        script = f'tell application "{self.process_name}" to activate'
        if self._run_applescript(script) is not None:
            print("  ✓ Ableton window activated")
            time.sleep(self.TIMING['window_activation'])
            return True
        
        print("  ❌ Failed to activate Ableton window")
        return False
    
    def setup_view(self) -> None:
        """Switch to Arrangement View and navigate to first track"""
        if not PYAUTOGUI_AVAILABLE:
            print("  ⚠️  GUI automation not available (server mode)")
            return
            
        print("  → Setting up Arrangement View...")
        pyautogui.hotkey('command', '3')  # Arrangement View
        time.sleep(self.TIMING['view_switch'])
        
        pyautogui.press('home')  # Go to first track
        time.sleep(self.TIMING['track_navigation'])
    
    def navigate_to_track(self, track_number: int) -> None:
        """Navigate to a specific track number"""
        if not PYAUTOGUI_AVAILABLE:
            print("  ⚠️  GUI automation not available (server mode)")
            return
            
        # Always start from home position
        pyautogui.press('home')
        time.sleep(self.TIMING['track_navigation'])
        
        # Navigate down if not track 1
        if track_number > 1:
            pyautogui.press('down', presses=(track_number - 1), interval=0.5)
            time.sleep(self.TIMING['track_navigation'])
    
    def load_plugin(self, plugin_name: str) -> bool:
        """Load a VST3 plugin onto the current track"""
        if not PYAUTOGUI_AVAILABLE:
            print("  ⚠️  GUI automation not available (server mode)")
            return False
            
        if plugin_name not in self.PLUGINS:
            print(f"  ⚠️  Unknown plugin: {plugin_name}")
            return False
        
        config = self.PLUGINS[plugin_name]
        print(f"  → Loading '{config.name}'...")
        
        # Open plugin browser
        pyautogui.hotkey('command', 'option', 'b')
        time.sleep(self.TIMING['browser_open'])
        
        # Search for plugin
        pyautogui.typewrite(config.search_term, interval=0.1)
        time.sleep(self.TIMING['search_typing'])
        
        # Navigate to correct result
        pyautogui.press('down', presses=config.down_presses, interval=self.TIMING['plugin_selection'])
        time.sleep(0.5)
        
        # Load plugin
        pyautogui.press('enter')
        time.sleep(config.load_wait_time)
        
        # Close browser
        pyautogui.hotkey('command', 'option', 'b')
        time.sleep(self.TIMING['browser_close'])
        
        print(f"  ✓ Loaded '{config.name}'")
        return True


class DeepTechnoSetup:
    """Setup automation for Deep Techno track"""
    
    # Track-to-plugin mapping
    TRACK_MAP: Dict[int, Optional[str]] = {
        1: "Tekno",       # Deep Kick
        2: "Tekno",       # Rolling Sub
        3: None,          # Off-beat Hat (no instrument)
        4: None,          # Ghost Snares (no instrument)
        5: "Omnisphere",  # Atmospheric Pad
        6: "Omnisphere",  # Rhythmic Stabs
    }
    
    def __init__(self, automation: AbletonAutomation):
        self.automation = automation
    
    def run(self) -> None:
        """Execute the complete setup"""
        print("\n🤖 Starting Deep Techno plugin loading sequence...\n")
        
        for track_num, plugin_name in self.TRACK_MAP.items():
            print(f"Track {track_num}:", end=" ")
            
            self.automation.navigate_to_track(track_num)
            
            if plugin_name:
                self.automation.load_plugin(plugin_name)
            else:
                print("No instrument needed (skipped)")
        
        print("\n✅ Plugin automation sequence complete!\n")


def main():
    """Main entry point"""
    print("=" * 60)
    print("🎹 ABLETON VST3 AUTO-LOADER")
    print("=" * 60)
    
    automation = AbletonAutomation()
    
    # Step 1: Find Ableton process
    print("\n[1/4] Finding Ableton Live process...")
    if not automation.find_ableton_process():
        print("\n❌ Error: Please ensure Ableton Live Suite is running")
        return
    
    # Step 2: Activate window
    print("\n[2/4] Activating Ableton window...")
    if not automation.activate_window():
        print("\n❌ Error: Failed to activate Ableton")
        return
    
    # Step 3: Setup view
    print("\n[3/4] Setting up workspace...")
    automation.setup_view()
    
    # Step 4: Load plugins
    print("\n[4/4] Loading VST3 instruments...")
    setup = DeepTechnoSetup(automation)
    setup.run()
    
    print("=" * 60)
    print("✨ All done! Check Ableton to verify plugins loaded correctly.")
    print("=" * 60)


if __name__ == "__main__":
    main()
