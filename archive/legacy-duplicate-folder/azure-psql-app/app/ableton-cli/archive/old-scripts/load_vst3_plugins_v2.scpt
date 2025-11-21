-- AppleScript to load VST3 instruments in Ableton Live 12
-- Version 2: Increased reliability with more robust checks and delays.

-- This function checks if a process exists before trying to interact with it.
on processExists(processName)
	tell application "System Events"
		return (count of (processes where name is processName)) > 0
	end tell
end processExists

-- Function to load a VST3 plugin on the currently selected track
on loadPlugin(pluginName)
	tell application "System Events"
		tell process "Ableton Live 12 Suite"
			
			-- 1. Open the Plug-In Browser (Cmd+Opt+B)
			keystroke "b" using {command down, option down}
			delay 2 -- Wait for browser to open and animate
			
			-- 2. Focus on the search bar and type the plugin name
			try
				set searchField to text field 1 of group 2 of group 1 of window 1
				if not (exists searchField) then
					error "Plugin search field not found."
				end if
				
				set value of searchField to "" -- Clear previous search
				delay 0.5
				set value of searchField to pluginName
				delay 2.5 -- Wait for search results to filter
				
			on error errMsg
				log "Error interacting with search field: " & errMsg
				-- Try to close browser and exit gracefully
				keystroke "b" using {command down, option down}
				return
			end try
			
			-- 3. Navigate to the correct plugin result
			-- This is the most fragile part. The logic is based on typical search results.
			if pluginName is "Omnisphere" then
				-- The VST3 instrument is often not the first result.
				-- Pressing down arrow twice helps select the main instrument version
				-- instead of the "FX" or "AU" versions.
				key code 125 -- Down Arrow
				delay 0.7
				key code 125 -- Down Arrow
				delay 0.7
			else if pluginName is "Tekno" then
				-- Tekno is usually the first VST3 result.
				key code 125 -- Down Arrow
				delay 0.7
			end if
			
			-- 4. Load the selected plugin by pressing Enter
			key code 36 -- Enter/Return key
			delay 4 -- IMPORTANT: Wait for the plugin to fully load on the track.
			
			-- 5. Close the Plug-In Browser to clean up the UI
			keystroke "b" using {command down, option down}
			delay 1
			
		end tell
	end tell
end loadPlugin

-- =================================================================
-- MAIN EXECUTION BLOCK
-- =================================================================

-- Wait for Ableton to be ready
set timeout_seconds to 30
set counter to 0
repeat until my processExists("Ableton Live 12 Suite")
	delay 1
	set counter to counter + 1
	if counter > timeout_seconds then
		log "Timeout: Ableton Live 12 Suite process not found after " & timeout_seconds & " seconds."
		return "Error: Ableton process not found."
	end if
end repeat

-- Bring Ableton to the front
tell application "Ableton Live 12 Suite"
	activate
end tell
delay 2 -- Wait for window to become active

-- Target the main Ableton process
tell application "System Events"
	if not (my processExists("Ableton Live 12 Suite")) then
		return "Error: Cannot find 'Ableton Live 12 Suite' process."
	end if
	
	tell process "Ableton Live 12 Suite"
		
		-- Ensure we are in Arrangement View (Cmd+3) for track selection to work
		keystroke "3" using {command down}
		delay 1.5
		
		-- Sequentially select tracks and load the corresponding plugin
		
		-- Track 1: Kick (TEKNO)
		keystroke "1"
		delay 1.5
		my loadPlugin("Tekno")
		
		-- Track 2: Sub-Rumble (TEKNO)
		keystroke "2"
		delay 1.5
		my loadPlugin("Tekno")
		
		-- Track 3: Melodic Lead (OMNISPHERE)
		keystroke "3"
		delay 1.5
		my loadPlugin("Omnisphere")
		
		-- Track 4: Dark Pad (OMNISPHERE)
		keystroke "4"
		delay 1.5
		my loadPlugin("Omnisphere")
		
		-- Track 5: Arpeggio (OMNISPHERE)
		keystroke "5"
		delay 1.5
		my loadPlugin("Omnisphere")
		
		-- Track 6: Percussion (TEKNO)
		keystroke "6"
		delay 1.5
		my loadPlugin("Tekno")
		
		-- Track 7: Atmospheric Texture (OMNISPHERE)
		keystroke "7"
		delay 1.5
		my loadPlugin("Omnisphere")
		
		-- Track 8: Bass Pluck (TEKNO)
		keystroke "8"
		delay 1.5
		my loadPlugin("Tekno")
		
		-- Track 9: FX Riser (OMNISPHERE)
		keystroke "9"
		delay 1.5
		my loadPlugin("Omnisphere")
		
	end tell
end tell

return "✅ V2 AppleScript: VST3 instrument loading complete."
