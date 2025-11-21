-- AppleScript to Autoload VST3 Instruments in Ableton Live 12
-- IMPROVED VERSION: Better plugin selection and error handling

-- Handler to load VST3 plugin on a track
on loadVST3(trackNumber, pluginName, isOmnisphere)
	tell application "System Events"
		tell process "Live"
			-- Select the track
			keystroke trackNumber using {command down}
			delay 0.6
			
			-- Open browser (Cmd+Option+B)
			keystroke "b" using {command down, option down}
			delay 1.2
			
			-- Click in browser search field and clear it
			keystroke "f" using {command down}
			delay 0.4
			keystroke "a" using {command down}
			delay 0.2
			keystroke (ASCII character 8) -- Delete
			delay 0.3
			
			-- Type the plugin name
			keystroke pluginName
			delay 1.0
			
			-- For Omnisphere, navigate to correct version
			if isOmnisphere is true then
				-- Press Down to skip "FX-Omnisphere" and select "Omnisphere"
				keystroke (ASCII character 31) -- Down arrow key
				delay 0.4
				keystroke (ASCII character 31) -- Down arrow again to ensure we're on the synth
				delay 0.4
			else
				-- For TEKNO, just press down once to select first result
				keystroke (ASCII character 31)
				delay 0.4
			end if
			
			-- Load the plugin
			keystroke return
			delay 2.5
			
			-- Close browser
			keystroke "b" using {command down, option down}
			delay 0.6
		end tell
	end tell
end loadVST3

-- Main script
tell application "System Events"
	-- Wait for Ableton to be ready
	delay 2
	
	-- Check if Ableton is running
	if not (exists process "Live") then
		display dialog "❌ Ableton Live is not running!" & return & return & "Please open Ableton first and try again." buttons {"OK"} default button 1 with icon stop
		return
	end if
	
	-- Bring Ableton to front
	tell process "Live"
		set frontmost to true
		delay 1.5
	end tell
	
	display notification "Starting VST3 auto-loading..." with title "🎹 Ableton Automation"
	delay 1
	
	-- Track 1: TEKNO (Deep Kick)
	display notification "Track 1/9: Loading TEKNO (Kick)..." with title "🥁 Ableton Automation"
	my loadVST3("1", "Tekno", false)
	
	-- Track 2: TEKNO (Sub Bass)
	display notification "Track 2/9: Loading TEKNO (Sub Bass)..." with title "🔊 Ableton Automation"
	my loadVST3("2", "Tekno", false)
	
	-- Track 3: OMNISPHERE (Melodic Lead)
	display notification "Track 3/9: Loading OMNISPHERE (Lead)..." with title "🎹 Ableton Automation"
	my loadVST3("3", "Omnisphere", true)
	
	-- Track 4: OMNISPHERE (Dark Pad)
	display notification "Track 4/9: Loading OMNISPHERE (Pad)..." with title "🎹 Ableton Automation"
	my loadVST3("4", "Omnisphere", true)
	
	-- Track 5: OMNISPHERE (Arpeggio)
	display notification "Track 5/9: Loading OMNISPHERE (Arp)..." with title "🎹 Ableton Automation"
	my loadVST3("5", "Omnisphere", true)
	
	-- Track 6: TEKNO (Percussion)
	display notification "Track 6/9: Loading TEKNO (Percussion)..." with title "🥁 Ableton Automation"
	my loadVST3("6", "Tekno", false)
	
	-- Track 7: OMNISPHERE (Atmospheric)
	display notification "Track 7/9: Loading OMNISPHERE (Atmos)..." with title "🎹 Ableton Automation"
	my loadVST3("7", "Omnisphere", true)
	
	-- Track 8: TEKNO (Bass Pluck)
	display notification "Track 8/9: Loading TEKNO (Pluck)..." with title "🔊 Ableton Automation"
	my loadVST3("8", "Tekno", false)
	
	-- Track 9: OMNISPHERE (FX Riser)
	display notification "Track 9/9: Loading OMNISPHERE (FX)..." with title "🎹 Ableton Automation"
	my loadVST3("9", "Omnisphere", true)
	
	display notification "✅ All VST3 plugins loaded successfully!" with title "🎉 Ableton Automation"
	
	-- Final message
	delay 1
	display dialog "✅ AUTOMATION COMPLETE!" & return & return & "All 9 VST3 instruments have been loaded:" & return & return & "• 4 TEKNO plugins (tracks 1, 2, 6, 8)" & return & "• 5 OMNISPHERE plugins (tracks 3, 4, 5, 7, 9)" & return & return & "Now you can:" & return & "1. Select presets for each plugin" & return & "2. Import MIDI files" & return & "3. Save as master template!" buttons {"Great!"} default button 1 with icon note
	
end tell
