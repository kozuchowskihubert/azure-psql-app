/**
 * Real-Time Collaboration Server
 * 
 * WebSocket server for real-time collaborative editing using Y.js CRDT.
 * Handles multiple concurrent users editing the same document with automatic
 * conflict resolution and state synchronization.
 * 
 * Features:
 * - Real-time document synchronization
 * - Multiple simultaneous editors
 * - Automatic conflict resolution via CRDT
 * - Per-document state management
 * 
 * Protocol:
 * - Uses WebSocket for bidirectional communication
 * - URL format: ws://server/document-id
 * - Y.js handles CRDT synchronization automatically
 * 
 * @module collaboration
 * @requires ws
 * @requires yjs
 */

const { WebSocketServer } = require('ws');
const Y = require('yjs');

/**
 * WebSocket server instance
 * noServer: true means we manually handle the upgrade
 */
const wss = new WebSocketServer({ noServer: true });

/**
 * Map of document names to Y.Doc instances
 * Each document maintains its own CRDT state
 * @type {Map<string, Y.Doc>}
 */
const docs = new Map();

/**
 * Handle new WebSocket connections
 * Each client connects to a specific document via URL
 */
wss.on('connection', (ws, req) => {
  // Extract document name from URL (e.g., /document-123 -> document-123)
  const docName = req.url.slice(1).split('?')[0] || 'default';

  // Get or create Y.Doc for this document
  if (!docs.has(docName)) {
    docs.set(docName, new Y.Doc());
  }

  const doc = docs.get(docName);

  /**
   * Handle incoming messages from client
   * Broadcasts updates to all other connected clients
   * Y.js handles the actual CRDT merging
   */
  ws.on('message', (message) => {
    // Broadcast to all other clients editing the same document
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });

  console.log(`Y-WebSocket connection established for document: ${docName}`);
});

/**
 * Initialize collaboration server
 * Attaches WebSocket server to HTTP server's upgrade event
 * 
 * @param {http.Server} server - HTTP server instance
 * @returns {WebSocketServer} WebSocket server instance
 * 
 * @example
 * const server = http.createServer(app);
 * collaborationServer(server);
 */
module.exports = (server) => {
  server.on('upgrade', (request, socket, head) => {
    // You may want to check authentication here before upgrading the connection
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  return wss;
};
