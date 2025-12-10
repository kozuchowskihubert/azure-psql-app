/**
 * Server Entry Point
 *
 * This is the main entry point for the application.
 * It creates an HTTP server, initializes WebSocket support for real-time collaboration,
 * and starts the Express application.
 *
 * Architecture:
 * - HTTP Server: Created from Express app
 * - WebSocket Server: Handles real-time collaboration (collaboration.js)
 * - Database: Initialized before server starts (utils/db-init.js)
 *
 * @module server
 */

const http = require('http');
const app = require('./app');
const ensureTable = require('./utils/db-init');
const collaborationServer = require('./collaboration');

const port = process.env.PORT || 3000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize WebSocket server for real-time collaboration
collaborationServer(server);
console.log('✓ WebSocket collaboration server initialized');

// Initialize database and start server
// Database is optional - server MUST start regardless
const startServer = () => {
  server.listen(port, () => {
    console.log('┌─────────────────────────────────────────────┐');
    console.log(`│  🚀 Server running on port ${port.toString().padEnd(18)}│`);
    console.log('│  ✓ HTTP Server active                      │');
    console.log('│  ✓ WebSocket server ready                  │');
    console.log('│  ✓ REST API endpoints active               │');
    console.log('│  ✓ Music/Preset routes available           │');
    console.log('│  ✓ HAOS Platform ready                     │');
    console.log('└─────────────────────────────────────────────┘');
  });
};

// Try to initialize database, but don't block server startup
ensureTable()
  .then(() => {
    console.log('✅ Database ready');
    startServer();
  })
  .catch((err) => {
    console.warn('⚠️  Database not available:', err.message);
    console.warn('   Starting server without database features...');
    startServer();
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Export for testing
module.exports = { app, server };
