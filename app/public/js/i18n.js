// ============================================================================
// HAOS.fm Platform - Internationalization (i18n) System
// Shared translation module for all subpages
// ============================================================================

let currentLanguage = localStorage.getItem('language') || 'pl'; // Default to Polish

const translations = {
  pl: {
    // Common UI Elements
    'btn-play': '▶️ Graj',
    'btn-stop': '⏹️ Stop',
    'btn-pause': '⏸️ Pauza',
    'btn-record': '🎤 Nagraj',
    'btn-save': '💾 Zapisz',
    'btn-load': '📂 Wczytaj',
    'btn-export': '📥 Eksportuj',
    'btn-import': '📤 Importuj',
    'btn-clear': '🗑️ Wyczyść',
    'btn-delete': '❌ Usuń',
    'btn-edit': '✏️ Edytuj',
    'btn-close': '✖️ Zamknij',
    'btn-cancel': '🚫 Anuluj',
    'btn-confirm': '✅ Potwierdź',
    'btn-back': '◀️ Wstecz',
    'btn-next': '▶️ Dalej',
    
    // Beat Maker
    'header-title': '🎵 Synthesis Flight Beat Engine + Vocal Recorder',
    'header-subtitle': 'Twórz beaty, nagrywaj vocal, komponuj w harmonii',
    'tab-arrangement': '🎬 Widok Aranżacji',
    'tab-sequencer': '🥁 Sekwencer Patternu',
    'btn-record-vocal': '🎤 Nagraj Vocal',
    'autotune-off': 'Auto-Tune: WYŁ',
    'autotune-on': 'Auto-Tune: WŁ',
    'btn-generate': '✨ Generuj Beat',
    'btn-save-pattern': '💾 Zapisz Pattern',
    'btn-load-pattern': '📂 Wczytaj Pattern',
    'pattern-settings': '⚙️ Ustawienia Patternu',
    'pattern-length': 'Długość:',
    'steps-8': '8 kroków',
    'steps-16': '16 kroków',
    'steps-32': '32 kroki',
    'bpm-label': 'BPM:',
    'swing-label': 'Swing:',
    'key-label': 'Tonacja:',
    'scale-label': 'Skala:',
    'genre-presets': '🎼 Presety Gatunków',
    'effects-rack': '🎛️ Rack Efektów',
    'vocal-effects': '🎤 Efekty Vocalu',
    
    // Effects
    'reverb': 'Pogłos',
    'delay': 'Opóźnienie',
    'filter': 'Filtr',
    'compressor': 'Kompresor',
    'distortion': 'Distortion',
    'autotune': 'Auto-Tune',
    'chorus': 'Chorus',
    'echo': 'Echo',
    'volume': 'Głośność',
    'pitch': 'Wysokość',
    'low-cut': 'Low-Cut',
    
    // Navigation
    'nav-home': '🏠 Strona Główna',
    'nav-studio': '🎚️ Studio',
    'nav-techno': '🤖 Techno Workspace',
    'nav-platform': '🌐 Platforma HAOS',
    'nav-community': '👥 Społeczność',
    'nav-library': '📚 Biblioteka',
    'nav-profile': '👤 Profil',
    'nav-settings': '⚙️ Ustawienia',
    'nav-logout': '🚪 Wyloguj',
    
    // Techno Workspace
    'techno-title': '🤖 Techno Workspace',
    'techno-subtitle': 'Profesjonalne studio produkcji muzyki techno',
    'techno-create': 'Twórz potężne brzmienia techno',
    
    // HAOS Studio
    'studio-title': '🎚️ HAOS Studio',
    'studio-subtitle': 'Kompleksowe środowisko produkcji muzycznej',
    'studio-welcome': 'Witaj w HAOS Studio',
    
    // HAOS Platform
    'platform-title': '🌐 Platforma HAOS.fm',
    'platform-subtitle': 'Profesjonalna platforma produkcji muzycznej',
    'platform-features': 'Funkcje Platformy',
    
    // Index Page - Hero Section
    'index-welcome': 'Witaj w HAOS.fm',
    'index-tagline': 'Twoja muzyczna przygoda zaczyna się tutaj',
    'index-get-started': 'Rozpocznij',
    'index-explore': 'Odkrywaj',
    'index-hero-title': 'HARDWARE ANALOG SYNTHESIS',
    'index-hero-subtitle': 'Twórz muzykę elektroniczną z autentycznymi syntezatorami sprzętowymi.',
    'index-hero-description': 'TB-303 acid bass, TR-909 drums, 16-step sequencer i pełne HAOS Studio.',
    
    // Index Page - Studio Cards (Kafelki)
    'card-haos-studio-title': 'HAOS STUDIO',
    'card-haos-studio-desc': 'Kompletne środowisko produkcji: 16-step sequencer, TB-303, TR-909, modular synthesis i współpraca w czasie rzeczywistym',
    'card-beatmaker-title': 'BEAT MAKER',
    'card-beatmaker-desc': 'Kreator Bitów z Vocal Recorder i Auto-Tune',
    'card-sounds-title': 'SOUNDS',
    'card-sounds-desc': '1500+ hardware presetów od Moog, Roland, Korg',
    'card-arp2600-title': 'ARP 2600',
    'card-arp2600-desc': 'Legendarny półmodularny syntezator',
    'card-legendary2600-title': 'LEGENDARY 2600',
    'card-legendary2600-desc': '⚡ Ultra-realistyczny Behringer 2600 z kablami',
    'card-platform-title': 'HAOS PLATFORM',
    'card-platform-desc': 'Kompletne DAW ze wszystkimi synthami i współpracą',
    'card-modular-title': 'MODULAR',
    'card-modular-desc': 'Eurorack z kablami i routingiem CV',
    'card-builder-title': 'BUILDER',
    'card-builder-desc': 'Stwórz własny syntezator od podstaw',
    'card-piano-title': 'EPIC PIANO',
    'card-piano-desc': 'Fortepian z akordami i skalami',
    'card-strings-title': 'ENIGMATIC STRINGS',
    'card-strings-desc': 'Skrzypce z emocjonalnymi frazami i arpeggios',
    'card-bass-title': 'BASS STUDIO',
    'card-bass-desc': 'Kreuj własny bass z eksportem WAV/MIDI',
    'card-midi-title': 'MIDI GENERATOR',
    'card-midi-desc': 'Kreatywny generator patternów',
    
    // Navigation Menu
    'nav-instruments': 'INSTRUMENTY',
    'nav-account': 'KONTO',
    'nav-dashboard': 'PANEL',
    'nav-sounds': 'SOUNDS',
    
    // Dropdown Labels
    'dropdown-modular': 'MODULAR',
    'dropdown-modular-subtitle': 'System Eurorack',
    'dropdown-builder': 'BUILDER',
    'dropdown-builder-subtitle': 'Kreator Syntezatorów',
    'dropdown-arp2600': 'ARP 2600',
    'dropdown-arp2600-subtitle': 'Legendarny Synth',
    'dropdown-2600ultra': '2600 ULTRA',
    'dropdown-2600ultra-subtitle': '⚡ Fotorealistyczny',
    'dropdown-2600studio': '2600 STUDIO',
    'dropdown-2600studio-subtitle': 'Pełna Stacja Robocza',
    'dropdown-piano': '🎹 PIANO',
    'dropdown-piano-subtitle': 'Akordy & Skale',
    'dropdown-midigen': 'MIDI GEN',
    'dropdown-midigen-subtitle': 'Kreator Patternów',
    
    // Techno Workspace
    'techno-hero-title': 'TECHNO WORKSPACE',
    'techno-hero-subtitle': 'Studio Produkcji Live • 16-Step Sequencer • Synteza w Czasie Rzeczywistym',
    'techno-keyboard-shortcuts': '⌨️ SKRÓTY KLAWISZOWE',
    'techno-play': '▶ PLAY',
    'techno-stop': '■ STOP',
    'techno-clear': '🗑️ WYCZYŚĆ',
    'techno-randomize': '🎲 LOSUJ',
    'techno-preset-browser': '📚 PRZEGLĄDARKA PRESETÓW',
    'techno-load-preset': 'Załaduj Preset',
    'techno-save-pattern': '💾 Zapisz Pattern',
    'techno-pattern-saved': '✅ Pattern zapisany!',
    'techno-select-preset': 'Wybierz preset...',
    'techno-pattern-presets': 'PATTERN PRESETS',
    'techno-pattern-desc': 'Załaduj gotowe patterny i modyfikuj je na bieżąco',
    
    // Messages & Notifications
    'msg-saved': '✅ Zapisano pomyślnie',
    'msg-loaded': '✅ Wczytano pomyślnie',
    'msg-error': '❌ Wystąpił błąd',
    'msg-language-changed': '🇵🇱 Zmieniono język na Polski',
    'msg-export-success': '✅ Eksport zakończony!',
    'msg-export-progress': '⏳ Trwa eksportowanie...',
    
    // Export Dialog
    'export-title': '📥 Eksport Audio',
    'export-format': 'Format:',
    'export-duration': 'Czas (takty):',
    'export-include-vocal': 'Dołącz nagrany vocal',
    'export-start': '🎬 Rozpocznij Eksport',
    
    // Arrangement View
    'arrangement-title': '🎬 WIDOK ARANŻACJI',
    'arrangement-subtitle': 'Układaj instrumenty na osi czasu - przeciągnij i upuść',
    'add-instrument': '➕ Dodaj Instrument',
    
    // Instruments
    'instrument-kick': 'Kick',
    'instrument-snare': 'Snare',
    'instrument-hihat': 'Hi-Hat',
    'instrument-bass': 'Bass',
    'instrument-synth': 'Synth',
    'instrument-piano': 'Pianino',
    'instrument-organ': 'Organy',
    'instrument-strings': 'Smyczki',
    'instrument-violin': 'Skrzypce',
    'instrument-trumpet': 'Trąbka',
    'instrument-guitar': 'Gitara'
  },
  
  en: {
    // Common UI Elements
    'btn-play': '▶️ Play',
    'btn-stop': '⏹️ Stop',
    'btn-pause': '⏸️ Pause',
    'btn-record': '🎤 Record',
    'btn-save': '💾 Save',
    'btn-load': '📂 Load',
    'btn-export': '📥 Export',
    'btn-import': '📤 Import',
    'btn-clear': '🗑️ Clear',
    'btn-delete': '❌ Delete',
    'btn-edit': '✏️ Edit',
    'btn-close': '✖️ Close',
    'btn-cancel': '🚫 Cancel',
    'btn-confirm': '✅ Confirm',
    'btn-back': '◀️ Back',
    'btn-next': '▶️ Next',
    
    // Beat Maker
    'header-title': '🎵 Synthesis Flight Beat Engine + Vocal Recorder',
    'header-subtitle': 'Create beats, record vocals, compose in harmony',
    'tab-arrangement': '🎬 Arrangement View',
    'tab-sequencer': '🥁 Pattern Sequencer',
    'btn-record-vocal': '🎤 Record Vocal',
    'autotune-off': 'Auto-Tune: OFF',
    'autotune-on': 'Auto-Tune: ON',
    'btn-generate': '✨ Generate Beat',
    'btn-save-pattern': '💾 Save Pattern',
    'btn-load-pattern': '📂 Load Pattern',
    'pattern-settings': '⚙️ Pattern Settings',
    'pattern-length': 'Length:',
    'steps-8': '8 steps',
    'steps-16': '16 steps',
    'steps-32': '32 steps',
    'bpm-label': 'BPM:',
    'swing-label': 'Swing:',
    'key-label': 'Key:',
    'scale-label': 'Scale:',
    'genre-presets': '🎼 Genre Presets',
    'effects-rack': '🎛️ Effects Rack',
    'vocal-effects': '🎤 Vocal Effects',
    
    // Effects
    'reverb': 'Reverb',
    'delay': 'Delay',
    'filter': 'Filter',
    'compressor': 'Compressor',
    'distortion': 'Distortion',
    'autotune': 'Auto-Tune',
    'chorus': 'Chorus',
    'echo': 'Echo',
    'volume': 'Volume',
    'pitch': 'Pitch',
    'low-cut': 'Low-Cut',
    
    // Navigation
    'nav-home': '🏠 Home',
    'nav-studio': '🎚️ Studio',
    'nav-techno': '🤖 Techno Workspace',
    'nav-platform': '🌐 HAOS Platform',
    'nav-community': '👥 Community',
    'nav-library': '📚 Library',
    'nav-profile': '👤 Profile',
    'nav-settings': '⚙️ Settings',
    'nav-logout': '🚪 Logout',
    
    // Techno Workspace
    'techno-title': '🤖 Techno Workspace',
    'techno-subtitle': 'Professional techno music production studio',
    'techno-create': 'Create powerful techno sounds',
    
    // HAOS Studio
    'studio-title': '🎚️ HAOS Studio',
    'studio-subtitle': 'Complete music production environment',
    'studio-welcome': 'Welcome to HAOS Studio',
    
    // HAOS Platform
    'platform-title': '🌐 HAOS.fm Platform',
    'platform-subtitle': 'Professional music production platform',
    'platform-features': 'Platform Features',
    
    // Index Page - Hero Section
    'index-welcome': 'Welcome to HAOS.fm',
    'index-tagline': 'Your musical journey starts here',
    'index-get-started': 'Get Started',
    'index-explore': 'Explore',
    'index-hero-title': 'HARDWARE ANALOG SYNTHESIS',
    'index-hero-subtitle': 'Create electronic music with authentic hardware-inspired synthesis engines.',
    'index-hero-description': 'TB-303 acid bass, TR-909 drums, 16-step sequencer, and full HAOS Studio.',
    
    // Index Page - Studio Cards (Kafelki)
    'card-haos-studio-title': 'HAOS STUDIO',
    'card-haos-studio-desc': 'Complete production environment: 16-step sequencer, TB-303, TR-909, modular synthesis & real-time collaboration',
    'card-beatmaker-title': 'BEAT MAKER',
    'card-beatmaker-desc': 'Beat Creator with Vocal Recorder & Auto-Tune',
    'card-sounds-title': 'SOUNDS',
    'card-sounds-desc': '1500+ hardware presets from Moog, Roland, Korg',
    'card-arp2600-title': 'ARP 2600',
    'card-arp2600-desc': 'Legendary semi-modular synthesizer emulation',
    'card-legendary2600-title': 'LEGENDARY 2600',
    'card-legendary2600-desc': '⚡ Ultra-realistic Behringer 2600 with patch cables',
    'card-platform-title': 'HAOS PLATFORM',
    'card-platform-desc': 'Complete DAW with all synths & collaboration',
    'card-modular-title': 'MODULAR',
    'card-modular-desc': 'Eurorack-inspired with patch cables & CV routing',
    'card-builder-title': 'BUILDER',
    'card-builder-desc': 'Create your own custom synthesizer from scratch',
    'card-piano-title': 'EPIC PIANO',
    'card-piano-desc': 'Piano with chords & scales',
    'card-strings-title': 'ENIGMATIC STRINGS',
    'card-strings-desc': 'Violin with emotional phrases & arpeggios',
    'card-bass-title': 'BASS STUDIO',
    'card-bass-desc': 'Create your own bass with WAV/MIDI export',
    'card-midi-title': 'MIDI GENERATOR',
    'card-midi-desc': 'Creative pattern generator',
    
    // Navigation Menu
    'nav-instruments': 'INSTRUMENTS',
    'nav-account': 'ACCOUNT',
    'nav-dashboard': 'DASHBOARD',
    'nav-sounds': 'SOUNDS',
    
    // Dropdown Labels
    'dropdown-modular': 'MODULAR',
    'dropdown-modular-subtitle': 'Eurorack System',
    'dropdown-builder': 'BUILDER',
    'dropdown-builder-subtitle': 'Synth Creator',
    'dropdown-arp2600': 'ARP 2600',
    'dropdown-arp2600-subtitle': 'Legendary Synth',
    'dropdown-2600ultra': '2600 ULTRA',
    'dropdown-2600ultra-subtitle': '⚡ Photorealistic',
    'dropdown-2600studio': '2600 STUDIO',
    'dropdown-2600studio-subtitle': 'Full Workstation',
    'dropdown-piano': '🎹 PIANO',
    'dropdown-piano-subtitle': 'Chords & Scales',
    'dropdown-midigen': 'MIDI GEN',
    'dropdown-midigen-subtitle': 'Pattern Creator',
    
    // Techno Workspace
    'techno-hero-title': 'TECHNO WORKSPACE',
    'techno-hero-subtitle': 'Live Production Studio • 16-Step Sequencer • Real-time Synthesis',
    'techno-keyboard-shortcuts': '⌨️ KEYBOARD SHORTCUTS',
    'techno-play': '▶ PLAY',
    'techno-stop': '■ STOP',
    'techno-clear': '🗑️ CLEAR',
    'techno-randomize': '🎲 RANDOMIZE',
    'techno-preset-browser': '📚 PRESET BROWSER',
    'techno-load-preset': 'Load Preset',
    'techno-save-pattern': '💾 Save Pattern',
    'techno-pattern-saved': '✅ Pattern saved!',
    'techno-select-preset': 'Select preset...',
    'techno-pattern-presets': 'PATTERN PRESETS',
    'techno-pattern-desc': 'Load ready-made patterns and modify them on the fly',
    
    // Messages & Notifications
    'msg-saved': '✅ Saved successfully',
    'msg-loaded': '✅ Loaded successfully',
    'msg-error': '❌ An error occurred',
    'msg-language-changed': '🇬🇧 Language changed to English',
    'msg-export-success': '✅ Export completed!',
    'msg-export-progress': '⏳ Exporting...',
    
    // Export Dialog
    'export-title': '📥 Export Audio',
    'export-format': 'Format:',
    'export-duration': 'Duration (bars):',
    'export-include-vocal': 'Include recorded vocal',
    'export-start': '🎬 Start Export',
    
    // Arrangement View
    'arrangement-title': '🎬 ARRANGEMENT VIEW',
    'arrangement-subtitle': 'Arrange instruments on timeline - drag and drop',
    'add-instrument': '➕ Add Instrument',
    
    // Instruments
    'instrument-kick': 'Kick',
    'instrument-snare': 'Snare',
    'instrument-hihat': 'Hi-Hat',
    'instrument-bass': 'Bass',
    'instrument-synth': 'Synth',
    'instrument-piano': 'Piano',
    'instrument-organ': 'Organ',
    'instrument-strings': 'Strings',
    'instrument-violin': 'Violin',
    'instrument-trumpet': 'Trumpet',
    'instrument-guitar': 'Guitar'
  }
};

// Main translation function
function translatePage() {
  const lang = currentLanguage;
  const translation = translations[lang];
  
  if (!translation) {
    console.error('Translation not found for language:', lang);
    return;
  }

  // Translate all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translation[key]) {
      // For option elements, just update textContent
      if (element.tagName === 'OPTION') {
        element.textContent = translation[key];
      } else {
        // For other elements, update innerHTML to preserve icons/emojis
        element.innerHTML = translation[key];
      }
    }
  });

  // Update language toggle button
  const langButton = document.getElementById('langToggle');
  if (langButton) {
    langButton.innerHTML = lang === 'pl' ? '🇬🇧 English' : '🇵🇱 Polski';
  }

  console.log(`🌍 Language: ${lang === 'pl' ? 'Polski' : 'English'}`);
}

// Toggle between languages
function toggleLanguage() {
  currentLanguage = currentLanguage === 'pl' ? 'en' : 'pl';
  localStorage.setItem('language', currentLanguage);
  translatePage();
  
  // Show notification
  const notification = document.createElement('div');
  const translation = translations[currentLanguage];
  notification.textContent = translation['msg-language-changed'];
  notification.style.cssText = 'position: fixed; top: 80px; right: 20px; background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); color: white; padding: 15px 25px; border-radius: 12px; font-weight: 600; z-index: 10000; box-shadow: 0 8px 32px rgba(255, 107, 53, 0.4); animation: slideIn 0.3s ease-out;';
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);
}

// Get translation for a specific key
function t(key) {
  const translation = translations[currentLanguage];
  return translation[key] || key;
}

// Initialize on page load
if (typeof document !== 'undefined') {
  // Apply translations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', translatePage);
  } else {
    translatePage();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { translatePage, toggleLanguage, t, currentLanguage, translations };
}
