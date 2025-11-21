-- AppleScript to load VST3 instruments in Ableton Live 12
-- Version 4: Combines dynamic process name finding with a robust waiting loop.

-- Function to get the exact name of the running Ableton Live process.
-- It returns the name if found, otherwise returns an empty string.
on getAbletonProcessName()
	try
		tell application "System Events"
			set processList to name of every process whose background only is false
		end tell
		
		repeat with pName in processList
			if pName contains "Ableton Live" then
				return pName
			end if
		end repeat
	on error
		-- Ignore errors if System Events is busy
	end try
	
	return ""
end getAbletonProcessName

-- Function to load a VST3 plugin on the currently selected track
on loadPlugin(abletonProcessName, pluginName)
	tell application "System Events"
		tell process abletonProcessName
			
			-- 1. Open the Plug-In Browser (Cmd+Opt+B)
			keystroke "b" using {command down, option down}
			delay 2
			
			-- 2. Search for the plugin
			try
				set searchField to text field 1 of group 2 of group 1 of window 1
				set value of searchField to ""
				delay 0.5
				set value of searchField to pluginName
				delay 2.5
			on error errMsg
				log "Error finding search field: " & errMsg
				keystroke "b" using {command down, option down} -- Attempt to close browser
				return
			end try
			
			-- 3. Navigate to the correct result
			if pluginName is "Omnisphere" then
				key code 125 -- Down Arrow
				delay 0.7
				key code 125 -- Down Arrow
				delay 0.7
			else if pluginName is "Tekno" then
				key code 125 -- Down Arrow
				delay 0.7
			end if
			
			-- 4. Load the plugin
			key code 36 -- Enter
			delay 4
			
			-- 5. Close the browser
			keystroke "b" using {command down, option down}
			delay 1
			
		end tell
	end tell
end loadPlugin

-- =================================================================
-- MAIN EXECUTION BLOCK
-- =================================================================

log "Starting VST3 Auto-Loader v4..."

-- 1. Wait for the Ableton Live process to appear
set timeout_seconds to 45
set counter to 0
set abletonProcessName to ""
repeat until abletonProcessName is not ""
	set abletonProcessName to my getAbletonProcessName()
	if abletonProcessName is "" then
		delay 1
		set counter to counter + 1
		if counter > timeout_seconds then
			log "Error: Timed out after " & timeout_seconds & " seconds. Could not find any running 'Ableton Live' process."
			return "Error: Ableton process not found after timeout."
		end if
	end if
end repeat

log "Found Ableton process: " & abletonProcessName

-- 2. Bring Ableton to the front
try
	tell application abletonProcessName
		activate
	end tell
	delay 2
on error
	log "Error: Could not activate " & abletonProcessName
	return "Error: Could not activate Ableton."
end try


-- 3. Target the process and start loading plugins
tell application "System Events"
	tell process abletonProcessName
		
		-- Ensure Arrangement View
		keystroke "3" using {command down}
		delay 1.5
		
		-- Load plugins sequentially
		log "Loading TEKNO on Track 1..."
		keystroke "1"
		delay 1.5
		my loadPlugin(abletonProcessName, "Tekno")
		
		log "Loading TEKNO on Track 2..."
		keystroke "2"
		delay 1.5
		my loadPlugin(abletonProcessName, "Tekno")
		
		log "Loading Omnisphere on Track 3..."
		keystroke "3"
		delay 1.5
		my loadPlugin(abletonProcessName, "Omnisphere")
		
		log "Loading Omnisphere on Track 4..."
		keystroke "4"
		delay 1.5
		my loadPlugin(abletonProcessName, "Omnisphere")
		
		log "Loading Omnisphere on Track 5..."
		keystroke "5"
		delay 1.5
		my loadPlugin(abletonProcessName, "Omnisphere")
		
		log "Loading TEKNO on Track 6..."
		keystroke "6"
		delay 1.5
		my loadPlugin(abletonProcessName, "Tekno")
		
		log "Loading Omnisphere on Track 7..."
		keystroke "7"
		delay 1.5
		my loadPlugin(abletonProcessName, "Omnisphere")
		
		log "Loading TEKNO on Track 8..."
		keystroke "8"
		delay 1.5
		my loadPlugin(abletonProcessName, "Tekno")
		
		log "Loading Omnisphere on Track 9..."
		keystroke "9"
		delay 1.5
		my loadPlugin(abletonProcessName, "Omnisphere")
		
	end tell
end tell

log "✅ V4 AppleScript: VST3 instrument loading sequence finished."
return "✅ V4 AppleScript: VST3 instrument loading sequence finished."
