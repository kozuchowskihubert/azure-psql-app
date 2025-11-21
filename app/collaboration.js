const { WebSocketServer } = require('ws');
const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');

const wss = new WebSocketServer({ noServer: true });

const doc = new Y.Doc();
const a = doc.getArray('some-array');

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req, { doc });
  console.log('Y-WebSocket connection established');
});

module.exports = (server) => {
  server.on('upgrade', (request, socket, head) => {
    // You may want to check authentication here before upgrading the connection
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
};
