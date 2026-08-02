; HAOS Suite - Windows installer
; Built on CI by .github/workflows/windows-suite.yml, which invokes:
;   ISCC.exe /DStageDir=<staged payload root> desktop\installer\haos-suite.iss
; StageDir layout:
;   Plugins\VST3\*.vst3     (folder-style VST3 bundles: 9 HAOS FX + HAOS Hub)
;   App\HAOS Hub.exe        (standalone Hub)
;   Content\HAOS\...        (Hub\Bundles, Hub art, FX Assets, logo.png)

#ifndef StageDir
  #error Pass /DStageDir=<staging dir> to ISCC
#endif

[Setup]
AppId={{7C1E63F2-9B0D-4C31-A5B2-3E8F41D9C6A0}
AppName=HAOS Suite
AppVersion=1.0.0
AppPublisher=HAOS
DefaultDirName={autopf}\HAOS
DefaultGroupName=HAOS
DisableProgramGroupPage=yes
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputBaseFilename=HAOS-Suite-Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
; Content deliberately goes to the installing user's %APPDATA%\HAOS -- the Hub
; and the FX read it from there. Silence the admin-mode user-area warning.
UsedUserAreasWarning=no

[Files]
; VST3 plugin bundles (each .vst3 is a folder tree on Windows)
Source: "{#StageDir}\Plugins\VST3\*"; DestDir: "{commoncf}\VST3"; Flags: ignoreversion recursesubdirs createallsubdirs
; Standalone Hub
Source: "{#StageDir}\App\HAOS Hub.exe"; DestDir: "{app}"; Flags: ignoreversion
; Content payload -> %APPDATA%\HAOS (Hub\Bundles, Hub art, FX Assets, logo.png)
Source: "{#StageDir}\Content\HAOS\*"; DestDir: "{userappdata}\HAOS"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\HAOS Hub"; Filename: "{app}\HAOS Hub.exe"
Name: "{group}\Uninstall HAOS Suite"; Filename: "{uninstallexe}"

[Run]
Filename: "{app}\HAOS Hub.exe"; Description: "Launch HAOS Hub"; Flags: nowait postinstall skipifsilent
