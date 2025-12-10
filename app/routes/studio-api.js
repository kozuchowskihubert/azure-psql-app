/**
 * Studio API Routes
 *
 * REST API endpoints for HAOS Platform Studio
 * Manages presets, patterns, and settings synchronization
 * between haos-platform.html and studio.html
 *
 * @module routes/studio-api
 */

const express = require('express');

const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load factory presets on startup
let factoryPresets = [];
try {
  const factoryPresetsPath = path.join(__dirname, '../data/factory-presets.json');
  if (fs.existsSync(factoryPresetsPath)) {
    factoryPresets = JSON.parse(fs.readFileSync(factoryPresetsPath, 'utf8'));
    console.log(`✅ Loaded ${factoryPresets.length} factory presets`);
  }
} catch (error) {
  console.warn('⚠️  Could not load factory presets:', error.message);
}

// In-memory storage (will persist to database later if needed)
// This ensures data survives between page refreshes
const storage = {
  presets: [...factoryPresets], // Initialize with factory presets
  patterns: [],
  settings: {},
};

// ============================================================================
// Presets API (TB-303, TR-909)
// ============================================================================

/**
 * GET /api/studio/presets
 * Retrieve all saved presets with optional filtering
 * Query params:
 *   - type: 'tb303' | 'tr909' | 'tr808'
 *   - category: 'Bass' | 'Techno' | 'Classic' | etc.
 *   - search: text search in name/description
 */
router.get('/presets', (req, res) => {
  let filteredPresets = storage.presets;

  // Filter by type
  if (req.query.type) {
    filteredPresets = filteredPresets.filter((p) => p.type === req.query.type);
  }

  // Filter by category
  if (req.query.category) {
    filteredPresets = filteredPresets.filter((p) => p.category === req.query.category);
  }

  // Search in name/description
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    filteredPresets = filteredPresets.filter((p) => p.name.toLowerCase().includes(search)
      || (p.description && p.description.toLowerCase().includes(search)),
    );
  }

  res.json({
    success: true,
    count: filteredPresets.length,
    total: storage.presets.length,
    presets: filteredPresets,
  });
});

/**
 * POST /api/studio/presets
 * Save a new preset
 *
 * Body:
 * {
 *   name: string,
 *   type: 'tb303' | 'tr909',
 *   parameters: object
 * }
 */
router.post('/presets', (req, res) => {
  const { name, type, parameters } = req.body;

  if (!name || !type || !parameters) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, type, parameters',
    });
  }

  const preset = {
    id: Date.now().toString(),
    name,
    type,
    parameters,
    createdAt: new Date().toISOString(),
  };

  storage.presets.push(preset);

  res.status(201).json({
    success: true,
    preset,
  });
});

// ============================================================================
// ARP 2600 Specific Endpoints (must be before /:id route)
// ============================================================================

/**
 * GET /api/studio/presets/arp2600
 * Get all ARP 2600 patches
 */
router.get('/presets/arp2600', (req, res) => {
  const arp2600Presets = storage.presets.filter((p) => p.type === 'arp2600');

  res.json({
    success: true,
    count: arp2600Presets.length,
    presets: arp2600Presets,
  });
});

/**
 * GET /api/studio/presets/arp2600/categories
 * Get available ARP 2600 patch categories
 */
router.get('/presets/arp2600/categories', (req, res) => {
  const arp2600Presets = storage.presets.filter((p) => p.type === 'arp2600');
  const categories = [...new Set(arp2600Presets.map((p) => p.category).filter(Boolean))];

  res.json({
    success: true,
    categories,
    count: categories.length,
  });
});

/**
 * POST /api/studio/presets/arp2600/apply/:id
 * Apply an ARP 2600 patch to the synth engine
 */
router.post('/presets/arp2600/apply/:id', (req, res) => {
  const preset = storage.presets.find((p) => p.id === req.params.id && p.type === 'arp2600');

  if (!preset) {
    return res.status(404).json({
      success: false,
      error: 'ARP 2600 preset not found',
    });
  }

  // Log the application (in real scenario, this would trigger synth engine update)
  console.log(`🎹 Applying ARP 2600 preset: ${preset.name}`);

  res.json({
    success: true,
    message: `ARP 2600 preset "${preset.name}" applied`,
    preset,
    parameters: preset.parameters,
  });
});

// ============================================================================
// TB-303 Specific Endpoints (must be before /:id route)
// ============================================================================

/**
 * GET /api/studio/presets/tb303
 * Get all TB-303 presets
 */
router.get('/presets/tb303', (req, res) => {
  const tb303Presets = storage.presets.filter((p) => p.type === 'tb303');

  res.json({
    success: true,
    count: tb303Presets.length,
    presets: tb303Presets,
  });
});

/**
 * GET /api/studio/presets/tb303/categories
 * Get available TB-303 preset categories
 */
router.get('/presets/tb303/categories', (req, res) => {
  const tb303Presets = storage.presets.filter((p) => p.type === 'tb303');
  const categories = [...new Set(tb303Presets.map((p) => p.category).filter(Boolean))];

  res.json({
    success: true,
    categories,
    count: categories.length,
  });
});

/**
 * POST /api/studio/presets/tb303/apply/:id
 * Apply a TB-303 preset to the synth engine
 */
router.post('/presets/tb303/apply/:id', (req, res) => {
  const preset = storage.presets.find((p) => p.id === req.params.id && p.type === 'tb303');

  if (!preset) {
    return res.status(404).json({
      success: false,
      error: 'TB-303 preset not found',
    });
  }

  // Log the application (in real scenario, this would trigger synth engine update)
  console.log(`🔊 Applying TB-303 preset: ${preset.name}`);
  console.log(`   Cutoff: ${preset.parameters.cutoff}Hz, Resonance: ${preset.parameters.resonance}, EnvMod: ${preset.parameters.envMod}`);

  res.json({
    success: true,
    message: `TB-303 preset "${preset.name}" applied`,
    preset,
    parameters: preset.parameters,
  });
});

/**
 * GET /api/studio/presets/stats/summary
 * Get preset statistics and categories
 */
router.get('/presets/stats/summary', (req, res) => {
  const stats = {
    total: storage.presets.length,
    byType: {},
    byCategory: {},
    categories: new Set(),
    types: new Set(),
  };

  storage.presets.forEach((preset) => {
    // Count by type
    stats.byType[preset.type] = (stats.byType[preset.type] || 0) + 1;
    stats.types.add(preset.type);

    // Count by category
    if (preset.category) {
      stats.byCategory[preset.category] = (stats.byCategory[preset.category] || 0) + 1;
      stats.categories.add(preset.category);
    }
  });

  res.json({
    success: true,
    stats: {
      total: stats.total,
      byType: stats.byType,
      byCategory: stats.byCategory,
      categories: Array.from(stats.categories),
      types: Array.from(stats.types),
    },
  });
});

/**
 * GET /api/studio/presets/:id
 * Get a specific preset by ID
 */
router.get('/presets/:id', (req, res) => {
  const preset = storage.presets.find((p) => p.id === req.params.id);

  if (!preset) {
    return res.status(404).json({
      success: false,
      error: 'Preset not found',
    });
  }

  res.json({
    success: true,
    preset,
  });
});

/**
 * DELETE /api/studio/presets/:id
 * Delete a preset
 */
router.delete('/presets/:id', (req, res) => {
  const index = storage.presets.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Preset not found',
    });
  }

  storage.presets.splice(index, 1);

  res.json({
    success: true,
    message: 'Preset deleted',
  });
});

// ============================================================================
// Patterns API (Sequencer)
// ============================================================================

/**
 * GET /api/studio/patterns
 * Retrieve all saved sequencer patterns
 */
router.get('/patterns', (req, res) => {
  res.json({
    success: true,
    count: storage.patterns.length,
    patterns: storage.patterns,
  });
});

/**
 * POST /api/studio/patterns
 * Save a new sequencer pattern
 *
 * Body:
 * {
 *   name: string,
 *   steps: array,
 *   bpm: number
 * }
 */
router.post('/patterns', (req, res) => {
  const { name, steps, bpm } = req.body;

  if (!name || !steps) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, steps',
    });
  }

  const pattern = {
    id: Date.now().toString(),
    name,
    steps,
    bpm: bpm || 128,
    createdAt: new Date().toISOString(),
  };

  storage.patterns.push(pattern);

  res.status(201).json({
    success: true,
    pattern,
  });
});

/**
 * GET /api/studio/patterns/:id
 * Get a specific pattern by ID
 */
router.get('/patterns/:id', (req, res) => {
  const pattern = storage.patterns.find((p) => p.id === req.params.id);

  if (!pattern) {
    return res.status(404).json({
      success: false,
      error: 'Pattern not found',
    });
  }

  res.json({
    success: true,
    pattern,
  });
});

/**
 * DELETE /api/studio/patterns/:id
 * Delete a pattern
 */
router.delete('/patterns/:id', (req, res) => {
  const index = storage.patterns.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Pattern not found',
    });
  }

  storage.patterns.splice(index, 1);

  res.json({
    success: true,
    message: 'Pattern deleted',
  });
});

// ============================================================================
// Settings API (User Preferences)
// ============================================================================

/**
 * GET /api/studio/settings
 * Retrieve all user settings
 */
router.get('/settings', (req, res) => {
  res.json({
    success: true,
    settings: storage.settings,
  });
});

/**
 * POST /api/studio/settings
 * Update user settings
 *
 * Body: any valid JSON object
 */
router.post('/settings', (req, res) => {
  const settings = req.body;

  // Merge with existing settings
  storage.settings = {
    ...storage.settings,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    settings: storage.settings,
  });
});

/**
 * GET /api/studio/settings/:key
 * Get a specific setting by key
 */
router.get('/settings/:key', (req, res) => {
  const value = storage.settings[req.params.key];

  if (value === undefined) {
    return res.status(404).json({
      success: false,
      error: 'Setting not found',
    });
  }

  res.json({
    success: true,
    key: req.params.key,
    value,
  });
});

// ============================================================================
// Sync API (Cross-Page State Sync)
// ============================================================================

/**
 * GET /api/studio/sync
 * Get complete state for synchronization
 * Returns all presets, patterns, and settings in one call
 */
router.get('/sync', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      presets: storage.presets,
      patterns: storage.patterns,
      settings: storage.settings,
    },
  });
});

/**
 * POST /api/studio/sync
 * Update complete state from another page
 * Used for bulk synchronization
 *
 * Body:
 * {
 *   presets?: array,
 *   patterns?: array,
 *   settings?: object
 * }
 */
router.post('/sync', (req, res) => {
  const { presets, patterns, settings } = req.body;

  if (presets) {
    storage.presets = presets;
  }

  if (patterns) {
    storage.patterns = patterns;
  }

  if (settings) {
    storage.settings = {
      ...storage.settings,
      ...settings,
    };
  }

  res.json({
    success: true,
    message: 'State synchronized',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
