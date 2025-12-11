/**
 * Real-Time Collaboration Server
 *
 * WebSocket server for real-time collaborative editing using Y.js CRDT
 * AND multi-user recording sessions for rap/music collaboration.
 *
 * Features:
 * - Real-time document synchronization (Y.js)
 * - Multiple simultaneous editors
 * - Automatic conflict resolution via CRDT
 * - Per-document state management
 * - Recording session management
 * - Multi-user audio collaboration
 * - Room-based collaboration
 *
 * Protocol:
 * - Uses WebSocket for bidirectional communication
 * - URL format: ws://server/document-id or ws://server (for recording)
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
 * Map of recording rooms
 * Structure: roomCode => { users: Map, tracks: Array, beat: Object, messages: Array }
 * @type {Map<string, Object>}
 */
const recordingRooms = new Map();

/**
 * Map of community channels for chat
 * Structure: channelName => { users: Map, messages: Array (last 100), onlineCount: number }
 * @type {Map<string, Object>}
 */
const communityChannels = new Map();

/**
 * Set of all online community users (for presence)
 * @type {Map<string, Object>}
 */
const onlineUsers = new Map();

/**
 * Handle new WebSocket connections
 * Each client connects to a specific document via URL or for recording sessions
 */
wss.on('connection', (ws, req) => {
  // Extract document name from URL (e.g., /document-123 -> document-123)
  const docName = req.url.slice(1).split('?')[0] || 'default';

  // Check if this is a recording session connection (no specific document)
  if (docName === 'default' || docName === '') {
    handleRecordingConnection(ws, req);
    return;
  }

  // Otherwise, handle as Y.js document collaboration
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
 * Handle recording session WebSocket connections
 */
function handleRecordingConnection(ws, req) {
  console.log('Recording/Community session connection established');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleRecordingMessage(ws, message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    // Clean up user from all rooms
    recordingRooms.forEach((room, roomCode) => {
      room.users.forEach((user, userId) => {
        if (user.ws === ws) {
          room.users.delete(userId);
          broadcastToRoom(roomCode, {
            type: 'user_left',
            userId,
          });
        }
      });
    });

    // Clean up user from community channels
    communityChannels.forEach((channel, channelName) => {
      channel.users.forEach((user, oderId) => {
        if (user.ws === ws) {
          channel.users.delete(userId);
          broadcastToChannel(channelName, {
            type: 'user_left',
            oderId,
            onlineCount: channel.users.size,
          });
        }
      });
    });

    // Remove from global online users
    onlineUsers.forEach((user, oderId) => {
      if (user.ws === ws) {
        onlineUsers.delete(oderId);
      }
    });
  });
}

/**
 * Handle recording session messages
 */
function handleRecordingMessage(ws, message) {
  const { type } = message;

  switch (type) {
    // ============ Community Chat ============
    case 'join':
      handleCommunityJoin(ws, message);
      break;

    case 'message':
      handleCommunityMessage(ws, message);
      break;

    case 'switch_channel':
      handleChannelSwitch(ws, message);
      break;

    case 'get_online_users':
      handleGetOnlineUsers(ws, message);
      break;

    // ============ Recording Rooms ============
    case 'create_room':
      handleCreateRoom(ws, message);
      break;

    case 'join_room':
      handleJoinRoom(ws, message);
      break;

    case 'leave_room':
      handleLeaveRoom(ws, message);
      break;

    case 'recording_started':
      handleRecordingStarted(ws, message);
      break;

    case 'recording_stopped':
      handleRecordingStopped(ws, message);
      break;

    case 'track_assigned':
      handleTrackAssigned(ws, message);
      break;

    case 'chat_message':
      handleChatMessage(ws, message);
      break;

    case 'beat_changed':
      handleBeatChanged(ws, message);
      break;

    default:
      console.log('Unknown message type:', type);
  }
}

// ============================================================================
// COMMUNITY CHAT HANDLERS
// ============================================================================

/**
 * Handle user joining community
 */
function handleCommunityJoin(ws, message) {
  const { room, channel, user } = message;
  
  if (room !== 'community') return;

  const channelName = channel || 'general-chat';
  
  // Get or create channel
  if (!communityChannels.has(channelName)) {
    communityChannels.set(channelName, {
      users: new Map(),
      messages: [],
    });
  }

  const channelData = communityChannels.get(channelName);
  
  // Add user to channel
  const userData = {
    id: user?.id || `anon-${Date.now()}`,
    name: user?.name || 'Anonymous',
    avatar: user?.avatar || null,
    ws,
    joinedAt: new Date(),
  };

  channelData.users.set(userData.id, userData);
  
  // Add to global online users
  onlineUsers.set(userData.id, {
    ...userData,
    channel: channelName,
  });

  // Send confirmation with recent messages
  ws.send(JSON.stringify({
    type: 'joined',
    channel: channelName,
    onlineCount: channelData.users.size,
    recentMessages: channelData.messages.slice(-50),
  }));

  // Broadcast user joined to channel
  broadcastToChannel(channelName, {
    type: 'user_joined',
    user: { id: userData.id, name: userData.name, avatar: userData.avatar },
    onlineCount: channelData.users.size,
  }, userData.id);

  console.log(`User ${userData.name} joined community channel: ${channelName}`);
}

/**
 * Handle community chat message
 */
function handleCommunityMessage(ws, message) {
  const { channel, author, avatar, text, timestamp } = message;
  
  const channelName = channel || 'general-chat';
  
  if (!communityChannels.has(channelName)) {
    communityChannels.set(channelName, {
      users: new Map(),
      messages: [],
    });
  }

  const channelData = communityChannels.get(channelName);

  const chatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    author: author || 'Anonymous',
    avatar: avatar || null,
    text,
    timestamp: timestamp || new Date().toISOString(),
  };

  // Store message (keep last 100)
  channelData.messages.push(chatMessage);
  if (channelData.messages.length > 100) {
    channelData.messages.shift();
  }

  // Broadcast to all users in channel
  broadcastToChannel(channelName, {
    type: 'message',
    message: chatMessage,
  });

  console.log(`Community message in #${channelName}: ${author}: ${text.substring(0, 50)}...`);
}

/**
 * Handle channel switch
 */
function handleChannelSwitch(ws, message) {
  const { channel, userId } = message;
  
  // Remove user from old channel
  communityChannels.forEach((channelData, channelName) => {
    if (channelData.users.has(userId)) {
      channelData.users.delete(userId);
      broadcastToChannel(channelName, {
        type: 'user_left',
        userId,
        onlineCount: channelData.users.size,
      });
    }
  });

  // Add to new channel
  if (!communityChannels.has(channel)) {
    communityChannels.set(channel, {
      users: new Map(),
      messages: [],
    });
  }

  const newChannel = communityChannels.get(channel);
  const user = onlineUsers.get(userId);
  
  if (user) {
    user.channel = channel;
    newChannel.users.set(userId, { ...user, ws });
    
    // Send recent messages for new channel
    ws.send(JSON.stringify({
      type: 'channel_switched',
      channel,
      onlineCount: newChannel.users.size,
      recentMessages: newChannel.messages.slice(-50),
    }));
  }
}

/**
 * Handle get online users request
 */
function handleGetOnlineUsers(ws, message) {
  const users = Array.from(onlineUsers.values()).map(u => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    channel: u.channel,
  }));

  ws.send(JSON.stringify({
    type: 'online_users',
    users,
    count: users.length,
  }));
}

/**
 * Broadcast message to all users in a community channel
 */
function broadcastToChannel(channelName, message, excludeUserId = null) {
  if (!communityChannels.has(channelName)) return;

  const channel = communityChannels.get(channelName);
  const messageStr = JSON.stringify(message);

  channel.users.forEach((user, oderId) => {
    if (oderId !== excludeUserId && user.ws && user.ws.readyState === 1) {
      user.ws.send(messageStr);
    }
  });
}

/**
 * Get online users list (for REST API)
 */
function getOnlineUsersList() {
  return Array.from(onlineUsers.values()).map(u => ({
    id: u.id,
    display_name: u.name,
    avatar_url: u.avatar,
    channel: u.channel,
  }));
}

// ============================================================================
// RECORDING ROOM HANDLERS
// ============================================================================

/**
 * Create a new recording room
 */
function handleCreateRoom(ws, message) {
  const { roomCode, user } = message;

  if (recordingRooms.has(roomCode)) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Room already exists',
    }));
    return;
  }

  user.ws = ws;

  const room = {
    users: new Map([[user.id, user]]),
    tracks: [],
    beat: null,
    messages: [],
    createdAt: new Date(),
  };

  recordingRooms.set(roomCode, room);

  ws.send(JSON.stringify({
    type: 'room_created',
    roomCode,
    users: Array.from(room.users.values()).map((u) => ({
      id: u.id,
      name: u.name,
      isHost: u.isHost,
    })),
  }));

  console.log(`Room created: ${roomCode} by ${user.name}`);
}

/**
 * Join an existing recording room
 */
function handleJoinRoom(ws, message) {
  const { roomCode, user } = message;

  if (!recordingRooms.has(roomCode)) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Room not found',
    }));
    return;
  }

  const room = recordingRooms.get(roomCode);
  user.ws = ws;
  room.users.set(user.id, user);

  // Send room state to new user
  ws.send(JSON.stringify({
    type: 'room_joined',
    roomCode,
    users: Array.from(room.users.values()).map((u) => ({
      id: u.id,
      name: u.name,
      isHost: u.isHost,
    })),
    tracks: room.tracks,
    beat: room.beat,
  }));

  // Notify others
  broadcastToRoom(roomCode, {
    type: 'user_joined',
    user: {
      id: user.id,
      name: user.name,
      isHost: user.isHost,
    },
  }, user.id);

  console.log(`User ${user.name} joined room: ${roomCode}`);
}

/**
 * Leave a recording room
 */
function handleLeaveRoom(ws, message) {
  const { roomCode, userId } = message;

  if (!recordingRooms.has(roomCode)) return;

  const room = recordingRooms.get(roomCode);
  room.users.delete(userId);

  broadcastToRoom(roomCode, {
    type: 'user_left',
    userId,
  });

  // Delete room if empty
  if (room.users.size === 0) {
    recordingRooms.delete(roomCode);
    console.log(`Room ${roomCode} deleted (empty)`);
  }

  console.log(`User ${userId} left room: ${roomCode}`);
}

/**
 * Handle recording started
 */
function handleRecordingStarted(ws, message) {
  const { roomCode, userId } = message;

  broadcastToRoom(roomCode, {
    type: 'recording_started',
    userId,
  });
}

/**
 * Handle recording stopped
 */
function handleRecordingStopped(ws, message) {
  const { roomCode, userId } = message;

  broadcastToRoom(roomCode, {
    type: 'recording_stopped',
    userId,
  });
}

/**
 * Handle track assignment
 */
function handleTrackAssigned(ws, message) {
  const { roomCode, trackId, userId } = message;

  if (!recordingRooms.has(roomCode)) return;

  const room = recordingRooms.get(roomCode);
  const track = { trackId, userId, assignedAt: new Date() };
  room.tracks.push(track);

  broadcastToRoom(roomCode, {
    type: 'track_assigned',
    trackId,
    userId,
  });
}

/**
 * Handle chat message
 */
function handleChatMessage(ws, message) {
  const {
    roomCode, userId, username, message: text,
  } = message;

  if (!recordingRooms.has(roomCode)) return;

  const room = recordingRooms.get(roomCode);
  const chatMessage = {
    userId,
    username,
    message: text,
    timestamp: new Date(),
  };

  room.messages.push(chatMessage);

  broadcastToRoom(roomCode, {
    type: 'chat_message',
    userId,
    username,
    message: text,
  });
}

/**
 * Handle beat changed
 */
function handleBeatChanged(ws, message) {
  const {
    roomCode, beatName, bpm, key,
  } = message;

  if (!recordingRooms.has(roomCode)) return;

  const room = recordingRooms.get(roomCode);
  room.beat = {
    beatName,
    bpm,
    key,
    changedAt: new Date(),
  };

  broadcastToRoom(roomCode, {
    type: 'beat_changed',
    beatName,
    bpm,
    key,
  });
}

/**
 * Broadcast message to all users in a room
 */
function broadcastToRoom(roomCode, message, excludeUserId = null) {
  if (!recordingRooms.has(roomCode)) return;

  const room = recordingRooms.get(roomCode);
  const messageStr = JSON.stringify(message);

  room.users.forEach((user, userId) => {
    if (userId !== excludeUserId && user.ws && user.ws.readyState === 1) {
      user.ws.send(messageStr);
    }
  });
}

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
function initCollaboration(server) {
  server.on('upgrade', (request, socket, head) => {
    // You may want to check authentication here before upgrading the connection
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  console.log('✓ WebSocket collaboration server initialized');
  console.log('  • Y.js document collaboration enabled');
  console.log('  • Multi-user recording sessions enabled');
  console.log('  • Community chat enabled');

  return wss;
}

module.exports = initCollaboration;
module.exports.getOnlineUsersList = getOnlineUsersList;
module.exports.communityChannels = communityChannels;
module.exports.onlineUsers = onlineUsers;
