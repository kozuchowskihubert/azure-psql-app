const express = require('express');
const router = express.Router();
const notesRoutes = require('./notes');
const healthRoutes = require('./health');
const pwaRoutes = require('./pwa');

// API Routes
router.use('/notes', notesRoutes);
router.use('/health', healthRoutes);

// PWA Routes (mounted at root level in app.js usually, but here we can export them separately or mount them)
// The PWA routes need to be at root '/', not '/api'.
// So we will handle them separately in app.js or export a separate router.

module.exports = {
  apiRouter: router,
  pwaRouter: pwaRoutes
};
