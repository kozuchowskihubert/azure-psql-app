const express = require('express');

const router = express.Router();
const notesRoutes = require('./notes');
const healthRoutes = require('./health');
const pwaRoutes = require('./pwa');
const musicRoutes = require('./music-routes');
const featuresRoutes = require('./features');
const patchesRoutes = require('./patches');
const studioApiRoutes = require('./studio-api');
const tracksRoutes = require('./tracks');
const fs = require('fs');
const path = require('path');

// API Routes
router.use('/notes', notesRoutes);
router.use('/health', healthRoutes);
router.use('/music', musicRoutes);
router.use('/features', featuresRoutes);
router.use('/patches', patchesRoutes);
router.use('/studio', studioApiRoutes);
router.use('/tracks', tracksRoutes);

// Preset Summary Endpoint for Index Page Dashboard
router.get('/presets', (req, res) => {
  try {
    const factoryPresetsPath = path.join(__dirname, '../data/factory-presets.json');
    
    if (!fs.existsSync(factoryPresetsPath)) {
      return res.json({
        success: true,
        tb303: [],
        tr909: [],
        tr808: [],
        arp2600: [],
        total: 0
      });
    }
    
    const factoryPresets = JSON.parse(fs.readFileSync(factoryPresetsPath, 'utf8'));
    
    // Group by type
    const grouped = {
      tb303: factoryPresets.filter(p => p.type === 'tb303'),
      tr909: factoryPresets.filter(p => p.type === 'tr909'),
      tr808: factoryPresets.filter(p => p.type === 'tr808'),
      arp2600: factoryPresets.filter(p => p.type === 'arp2600'),
      total: factoryPresets.length
    };
    
    res.json({
      success: true,
      ...grouped
    });
  } catch (error) {
    console.error('Error loading presets:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      tb303: [],
      tr909: [],
      tr808: [],
      arp2600: [],
      total: 0
    });
  }
});

// PWA Routes (mounted at root level in app.js usually, but here we can export them separately or mount them)
// The PWA routes need to be at root '/', not '/api'.
// So we will handle them separately in app.js or export a separate router.

module.exports = {
  apiRouter: router,
  pwaRouter: pwaRoutes,
};
