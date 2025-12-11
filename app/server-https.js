/**
 * HTTPS Server Entry Point for Local Development
 *
 * This is the HTTPS version for local development with SSL/TLS.
 * It creates an HTTPS server with self-signed certificates, 
 * initializes WebSocket support for real-time collaboration,
 * and starts the Express application.
 *
 * @module server-https
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./app');
const ensureTable = require('./utils/db-init');
const collaborationServer = require('./collaboration');
const subscriptionScheduler = require('./services/subscription-scheduler');

const httpsPort = process.env.HTTPS_PORT || 3443;
const httpPort = process.env.PORT || 3000;

// Load SSL certificates
const sslPath = path.join(__dirname, 'config', 'ssl');
const sslOptions = {
  key: fs.readFileSync(path.join(sslPath, 'key.pem')),
  cert: fs.readFileSync(path.join(sslPath, 'cert.pem'))
};

// Create HTTPS server from Express app
const httpsServer = https.createServer(sslOptions, app);

// Create HTTP server for redirect
const httpServer = http.createServer((req, res) => {
  res.writeHead(301, { "Location": `https://${req.headers.host.split(':')[0]}:${httpsPort}${req.url}` });
  res.end();
});

// Initialize WebSocket server for real-time collaboration on HTTPS
collaborationServer(httpsServer);
console.log('✓ WebSocket collaboration server initialized on HTTPS');

// Initialize database and start servers
const startServers = () => {
  // Start HTTPS server
  httpsServer.listen(httpsPort, () => {
    console.log('┌─────────────────────────────────────────────┐');
    console.log(`│  🔒 HTTPS Server running on port ${httpsPort.toString().padEnd(13)}│`);
    console.log('│  ✓ SSL/TLS encryption enabled              │');
    console.log('│  ✓ WebSocket server ready (WSS)            │');
    console.log('│  ✓ REST API endpoints active               │');
    console.log('│  ✓ Music/Preset routes available           │');
    console.log('│  ✓ HAOS Platform ready                     │');
    console.log('│                                             │');
    console.log(`│  🌐 https://localhost:${httpsPort}                  │`);
    console.log('│  ⚠️  Self-signed cert - accept in browser   │');
    console.log('└─────────────────────────────────────────────┘');
  });

  // Start HTTP redirect server
  httpServer.listen(httpPort, () => {
    console.log(`🔄 HTTP server on port ${httpPort} (redirects to HTTPS)`);
  });
};

// Try to initialize database, but don't block server startup
ensureTable()
  .then(() => {
    console.log('✅ Database ready');
    // Start subscription scheduler after database is ready
    subscriptionScheduler.start();
    startServers();
  })
  .catch((error) => {
    console.error('⚠️  Database initialization failed:', error.message);
    console.log('⚠️  Starting server without database...');
    startServers();
  });

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing servers gracefully');
  httpsServer.close(() => {
    console.log('HTTPS server closed');
  });
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  httpsServer.close(() => {
    console.log('✓ HTTPS server closed');
  });
  httpServer.close(() => {
    console.log('✓ HTTP server closed');
  });
  process.exit(0);
});

module.exports = httpsServer;
