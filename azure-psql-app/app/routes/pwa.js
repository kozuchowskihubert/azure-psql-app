const express = require('express');
const router = express.Router();
const path = require('path');

// Explicit routes for PWA files with correct MIME types
router.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, '../public', 'manifest.json'));
});

router.get('/service-worker.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, '../public', 'service-worker.js'));
});

module.exports = router;
