-- New, more robust AppleScript to load VST3 instruments in Ableton Live 12

-- This script is designed to be more reliable by using explicit UI element targeting
-- and longer delays to accommodate system performance variations.

-- Function to load a VST3 plugin on the currently selected track
on loadPlugin(pluginName, pluginType)
	tell application "System Events"
		tell process "Ableton Live 12 Suite"
			
			-- 1. Open the Plug-In Browser (Cmd+Opt+B)
			keystroke "b" using {command down, option down}
			delay 1.5 -- Wait for browser to open
			
			-- 2. Focus on the search bar
			-- This is a critical step to ensure we can type
			set searchField to text field 1 of group 2 of group 1 of window 1
			if not (exists searchField) then
				log "Error: Plugin search field not found."
				return
			end if
			set value of searchField to "" -- Clear previous search
			set value of searchField to pluginName
			delay 2 -- Wait for search results to appear
			
			-- 3. Navigate to the correct plugin
			-- This part is tricky. We will press down arrow to select the first result.
			-- For Omnisphere, we need to differentiate from "FX-Omnisphere"
			if pluginName is "Omnisphere" then
				-- After searching "Omnisphere", the VST3 instrument is usually the second result
				-- after the AU version or FX version. We press down arrow twice.
				key code 125 -- Down Arrow
				delay 0.5
				key code 125 -- Down Arrow
				delay 0.5
			else if pluginName is "Tekno" then
				-- Tekno is usually the first result
				key code 125 -- Down Arrow
				delay 0.5
			end if
			
			-- 4. Load the plugin by pressing Enter
			key code 36 -- Enter/Return key
			delay 3 -- Wait for the plugin to load on the track
			
			-- 5. Close the Plug-In Browser
			keystroke "b" using {command down, option down}
			delay 1
			
		end tell
	end tell
end loadPlugin

-- Main execution block
tell application "Ableton Live 12 Suite"
	activate
end tell

delay 2 -- Ensure Ableton is the frontmost application

tell application "System Events"
	tell process "Ableton Live 12 Suite"
		
		-- Ensure we are in Arrangement View (Cmd+3)
		keystroke "3" using {command down}
		delay 1
		
		-- Track 1: Kick (TEKNO)
		keystroke "1"
		delay 1
		my loadPlugin("Tekno", "VST3")
		
		-- Track 2: Sub-Rumble (TEKNO)
		keystroke "2"
		delay 1
		my loadPlugin("Tekno", "VST3")
		
		-- Track 3: Melodic Lead (OMNISPHERE)
		keystroke "3"
		delay 1
		my loadPlugin("Omnisphere", "VST3")
		
		-- Track 4: Dark Pad (OMNISPHERE)
		keystroke "4"
		delay 1
		my loadPlugin("Omnisphere", "VST3")
		
		-- Track 5: Arpeggio (OMNISPHERE)
		keystroke "5"
		delay 1
		my loadPlugin("Omnisphere", "VST3")
		
		-- Track 6: Percussion (TEKNO)
		keystroke "6"
		delay 1
		my loadPlugin("Tekno", "VST3")
		
		-- Track 7: Atmospheric Texture (OMNISPHERE)
		keystroke "7"
		delay 1
		my loadPlugin("Omnisphere", "VST3")
		
		-- Track 8: Bass Pluck (TEKNO)
		keystroke "8"
		delay 1
		my loadPlugin("Tekno", "VST3")
		
		-- Track 9: FX Riser (OMNISPHERE)
		keystroke "9"
		delay 1
		my loadPlugin("Omnisphere", "VST3")
		
	end tell
end tell

return "✅ New AppleScript for VST3 loading has been executed."
