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
    
    // Index Page
    'index-welcome': 'Witaj w HAOS.fm',
    'index-tagline': 'Twoja muzyczna przygoda zaczyna się tutaj',
    'index-get-started': 'Rozpocznij',
    'index-explore': 'Odkrywaj',
    
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
    
    // Index Page
    'index-welcome': 'Welcome to HAOS.fm',
    'index-tagline': 'Your musical journey starts here',
    'index-get-started': 'Get Started',
    'index-explore': 'Explore',
    
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
