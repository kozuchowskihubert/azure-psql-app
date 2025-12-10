/**
 * Feature Flag Configuration
 * Central place to manage all application features
 */

const FEATURES = {
  // Core Features
  notes: {
    enabled: true,
    name: 'Notes & Tasks',
    description: 'Create, edit, and manage notes and tasks',
    icon: '📝',
    route: '/index.html',
    api: '/api/notes',
    requiresAuth: false,
  },

  // Music Production Features
  synth2600: {
    enabled: true,
    name: 'Behringer 2600 Studio',
    description: 'Interactive synthesizer with patching and sound design',
    icon: '🎹',
    route: '/synth-2600-studio.html',
    api: '/api/music/synth2600',
    requiresAuth: false,
  },

  presetBrowser: {
    enabled: true,
    name: 'Preset Browser',
    description: 'Browse and manage synthesizer presets',
    icon: '🎛️',
    route: '/preset-browser.html',
    api: '/api/music/presets',
    requiresAuth: false,
  },

  midiGenerator: {
    enabled: true,
    name: 'MIDI Generator',
    description: 'Generate MIDI patterns and sequences',
    icon: '🎵',
    route: '/midi-generator.html',
    api: '/api/music/midi',
    requiresAuth: false,
  },

  musicProduction: {
    enabled: true,
    name: 'Music Production',
    description: 'Full music production suite',
    icon: '🎼',
    route: '/music-production.html',
    api: '/api/music',
    requiresAuth: false,
  },

  // Optional Features (requires env variables)
  calendar: {
    enabled: process.env.ENABLE_CALENDAR_SYNC === 'true',
    name: 'Calendar Sync',
    description: 'Sync events with external calendars',
    icon: '📅',
    route: '/calendar.html',
    api: '/api/calendar',
    requiresAuth: true,
    envVar: 'ENABLE_CALENDAR_SYNC',
  },

  meetings: {
    enabled: process.env.ENABLE_MEETING_ROOMS === 'true',
    name: 'Meeting Rooms',
    description: 'Book and manage meeting rooms',
    icon: '🤝',
    route: '/meetings.html',
    api: '/api/meetings',
    requiresAuth: true,
    envVar: 'ENABLE_MEETING_ROOMS',
  },

  sso: {
    enabled: process.env.ENABLE_SSO === 'true',
    name: 'Single Sign-On',
    description: 'Azure AD and Google OAuth authentication',
    icon: '🔐',
    route: '/sso.html',
    api: '/api/auth',
    requiresAuth: false,
    envVar: 'ENABLE_SSO',
  },

  // PWA Features
  pwa: {
    enabled: true,
    name: 'Progressive Web App',
    description: 'Install as native app, offline support',
    icon: '📱',
    route: '/offline.html',
    api: '/api/pwa',
    requiresAuth: false,
  },

  // Collaboration Features
  share: {
    enabled: true,
    name: 'Share & Collaborate',
    description: 'Share notes and collaborate in real-time',
    icon: '🔗',
    route: '/index.html',
    api: '/api/share',
    requiresAuth: false,
  },

  // Development Tools
  cli: {
    enabled: true,
    name: 'CLI Terminal',
    description: 'Browser-based terminal for synthesizer CLI tools',
    icon: '💻',
    route: '/cli-terminal.html',
    api: null,
    requiresAuth: false,
  },

  iconGenerator: {
    enabled: true,
    name: 'Icon Generator',
    description: 'Generate PWA icons',
    icon: '🎨',
    route: '/icon-generator.html',
    api: null,
    requiresAuth: false,
  },

  excel: {
    enabled: true,
    name: 'Excel Integration',
    description: 'Import/export data from Excel',
    icon: '📊',
    route: '/excel.html',
    api: null,
    requiresAuth: false,
  },
};

/**
 * Get all enabled features
 */
function getEnabledFeatures() {
  return Object.entries(FEATURES)
    .filter(([key, feature]) => feature.enabled)
    .reduce((acc, [key, feature]) => {
      acc[key] = feature;
      return acc;
    }, {});
}

/**
 * Get feature by key
 */
function getFeature(key) {
  return FEATURES[key];
}

/**
 * Check if feature is enabled
 */
function isFeatureEnabled(key) {
  return FEATURES[key]?.enabled || false;
}

/**
 * Get features summary for API response
 */
function getFeaturesSummary() {
  const enabled = getEnabledFeatures();
  const disabled = Object.entries(FEATURES)
    .filter(([key, feature]) => !feature.enabled)
    .reduce((acc, [key, feature]) => {
      acc[key] = {
        name: feature.name,
        envVar: feature.envVar,
      };
      return acc;
    }, {});

  return {
    enabled: Object.keys(enabled).length,
    total: Object.keys(FEATURES).length,
    features: enabled,
    disabled: Object.keys(disabled).length > 0 ? disabled : undefined,
  };
}

module.exports = {
  FEATURES,
  getEnabledFeatures,
  getFeature,
  isFeatureEnabled,
  getFeaturesSummary,
};
