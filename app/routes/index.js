const express = require('express');

const router = express.Router();
const notesRoutes = require('./notes');
const healthRoutes = require('./health');
const pwaRoutes = require('./pwa');
const musicRoutes = require('./music-routes');
const featuresRoutes = require('./features');

// API Routes
router.use('/notes', notesRoutes);
router.use('/health', healthRoutes);
router.use('/music', musicRoutes);
router.use('/features', featuresRoutes);

// PWA Routes (mounted at root level in app.js usually, but here we can export them separately or mount them)
// The PWA routes need to be at root '/', not '/api'.
// So we will handle them separately in app.js or export a separate router.

module.exports = {
  apiRouter: router,
  pwaRouter: pwaRoutes,
};
