const { WebSocketServer } = require('ws');
const Y = require('yjs');

const wss = new WebSocketServer({ noServer: true });
const docs = new Map();

wss.on('connection', (ws, req) => {
  const docName = req.url.slice(1).split('?')[0] || 'default';
  
  // Get or create document
  if (!docs.has(docName)) {
    docs.set(docName, new Y.Doc());
  }
  
  const doc = docs.get(docName);
  
  // Basic WebSocket sync implementation
  ws.on('message', (message) => {
    // Broadcast to all other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });
  
  console.log(`Y-WebSocket connection established for document: ${docName}`);
});


module.exports = (server) => {
  server.on('upgrade', (request, socket, head) => {
    // You may want to check authentication here before upgrading the connection
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
};
