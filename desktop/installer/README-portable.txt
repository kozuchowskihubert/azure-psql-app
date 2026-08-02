HAOS Suite for Windows - portable package
=========================================

This zip contains the whole HAOS suite without an installer.
Manual install steps (Windows 10/11, 64-bit):

1. Plugins (VST3)
   Copy every folder inside  Plugins\VST3\  into:
       C:\Program Files\Common Files\VST3\
   (needs admin rights - that folder is where every DAW scans for VST3s).
   You should end up with e.g.
       C:\Program Files\Common Files\VST3\HAOS Comp.vst3\
       C:\Program Files\Common Files\VST3\HAOS Hub.vst3\
   ... one folder per plugin. Keep each .vst3 folder intact - on Windows a
   VST3 "file" is really a folder tree.

2. Standalone app
   "HAOS Hub.exe" runs from anywhere - Desktop, a tools folder, this zip's
   folder. No registration needed.

3. Content (presets, bundles, artwork, FX assets)
   Copy the  Content\HAOS  folder into your roaming AppData so it becomes:
       %APPDATA%\HAOS\
   i.e. after copying you should have:
       %APPDATA%\HAOS\Hub\Bundles\...
       %APPDATA%\HAOS\FX Assets\...
       %APPDATA%\HAOS\logo.png
   (Paste %APPDATA% into Explorer's address bar - it usually resolves to
   C:\Users\<you>\AppData\Roaming.)

4. Rescan plugins in your DAW (Ableton: Options > Plug-Ins; Reaper:
   Preferences > VST > Re-scan; FL: Manage plugins > Find plugins).

Uninstall: delete the .vst3 folders from Common Files\VST3, delete
"HAOS Hub.exe", and delete %APPDATA%\HAOS.
