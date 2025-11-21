# Real-Time Collaboration Features

**Version**: 1.0  
**Status**: Production Ready  
**Last Updated**: November 2025

---

## 📑 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Note Sharing](#note-sharing)
- [Real-Time Editing](#real-time-editing)
- [Commenting System](#commenting-system)
- [Permission Management](#permission-management)
- [Technical Implementation](#technical-implementation)
- [Security Considerations](#security-considerations)

---

## Overview

The collaboration features enable teams to work together on notes in real-time, with granular permission controls and activity tracking. The implementation leverages WebSockets for real-time communication and Conflict-free Replicated Data Types (CRDTs) for seamless concurrent editing.

### Key Capabilities

- **Note Sharing**: Share notes with specific users via email invitation
- **Permission Levels**: Granular access control (viewer, commenter, editor, owner)
- **Real-Time Editing**: Multiple users can edit simultaneously with Y.js CRDT
- **Activity Tracking**: Complete audit trail of all note interactions
- **Comment Threads**: Structured discussions with threaded replies

### Business Benefits

- **Enhanced Collaboration**: Teams can collaborate on documents in real-time
- **Access Control**: Granular permissions ensure data security
- **Audit Compliance**: Complete activity logs for regulatory requirements
- **Improved Productivity**: Reduced context switching and email communication

---

## Architecture

### System Components

```
┌────────────────────────────────────────────────────────────┐
│                     Client Browsers                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   User A     │  │   User B     │  │   User C     │     │
│  │  (Editor)    │  │  (Viewer)    │  │  (Commenter) │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                   WebSocket Server                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           Y.js Collaboration Server                  │  │
│  │  • CRDT-based conflict resolution                    │  │
│  │  • Real-time synchronization                         │  │
│  │  • Connection management                             │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ note_shares  │  │note_comments │  │ note_activity  │  │
│  │ • Permissions│  │• Thread data │  │ • Audit logs   │  │
│  └──────────────┘  └──────────────┘  └────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Share Initiation**: User A shares note with User B
2. **Permission Check**: Server validates User A's ownership
3. **Database Update**: Share record created with permission level
4. **Activity Log**: Share action recorded in audit trail
5. **Real-Time Notification**: User B receives instant notification (future)

---

## Note Sharing

### Permission Levels

| Level        | View | Comment | Edit | Share | Delete |
|:-------------|:----:|:-------:|:----:|:-----:|:------:|
| **Viewer**   | ✅   | ❌      | ❌   | ❌    | ❌     |
| **Commenter**| ✅   | ✅      | ❌   | ❌    | ❌     |
| **Editor**   | ✅   | ✅      | ✅   | ❌    | ❌     |
| **Owner**    | ✅   | ✅      | ✅   | ✅    | ✅     |

### Sharing Workflow

#### 1. Share a Note

**API Endpoint**: `POST /api/notes/:id/shares`

**Request Body**:
```json
{
  "email": "user@example.com",
  "permissionLevel": "editor"
}
```

**Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "note_id": 123,
  "shared_with_user_id": "660e8400-e29b-41d4-a716-446655440001",
  "shared_by_user_id": "770e8400-e29b-41d4-a716-446655440002",
  "permission_level": "editor",
  "shared_at": "2025-11-21T10:30:00Z"
}
```

#### 2. View Shared Users

**API Endpoint**: `GET /api/notes/:id/shares`

**Response**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "display_name": "John Doe",
    "permission_level": "editor"
  }
]
```

#### 3. Remove Share

**API Endpoint**: `DELETE /api/shares/:shareId`

**Response**: `204 No Content`

### Frontend Integration

```javascript
// Share a note
async function shareNote(noteId, email, permissionLevel) {
  const response = await fetch(`/api/notes/${noteId}/shares`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, permissionLevel })
  });
  
  if (!response.ok) {
    throw new Error('Failed to share note');
  }
  
  return await response.json();
}

// Load shared users
async function loadSharedUsers(noteId) {
  const response = await fetch(`/api/notes/${noteId}/shares`, {
    credentials: 'include'
  });
  
  return await response.json();
}
```

---

## Real-Time Editing

### Technology: Y.js CRDT

**Why Y.js?**
- Conflict-free concurrent editing
- Automatic synchronization across clients
- Offline support with eventual consistency
- Proven performance at scale

### Implementation

#### Server-Side (WebSocket)

```javascript
const { WebSocketServer } = require('ws');
const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, req) => {
  const noteId = req.url.split('/').pop();
  const doc = getOrCreateYDoc(noteId);
  
  setupWSConnection(ws, req, { doc });
  console.log(`Collaboration session started for note ${noteId}`);
});

// Integrate with HTTP server
server.on('upgrade', (request, socket, head) => {
  if (request.url.startsWith('/collaborate/')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});
```

#### Client-Side (Browser)

```javascript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Create Y.js document
const doc = new Y.Doc();

// Connect to WebSocket server
const provider = new WebsocketProvider(
  'ws://localhost:3000/collaborate',
  noteId,
  doc
);

// Get shared text type
const yText = doc.getText('content');

// Bind to textarea
const textarea = document.getElementById('note-content');

// Listen for remote changes
yText.observe(() => {
  if (textarea.value !== yText.toString()) {
    textarea.value = yText.toString();
  }
});

// Send local changes
textarea.addEventListener('input', () => {
  const currentText = yText.toString();
  if (textarea.value !== currentText) {
    doc.transact(() => {
      yText.delete(0, currentText.length);
      yText.insert(0, textarea.value);
    });
  }
});
```

### User Awareness

Show active collaborators:

```javascript
const awareness = provider.awareness;

// Set user information
awareness.setLocalStateField('user', {
  name: currentUser.displayName,
  color: getUserColor(currentUser.id)
});

// Listen for changes
awareness.on('change', () => {
  const states = awareness.getStates();
  updateActiveUsers(states);
});

function updateActiveUsers(states) {
  const users = Array.from(states.values())
    .map(state => state.user)
    .filter(Boolean);
  
  renderActiveUsersList(users);
}
```

---

## Commenting System

### Database Schema

```sql
CREATE TABLE note_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES note_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints

#### Create Comment

**Endpoint**: `POST /api/notes/:id/comments`

**Request**:
```json
{
  "content": "Great analysis! Can we add more data?",
  "parent_comment_id": null
}
```

#### List Comments

**Endpoint**: `GET /api/notes/:id/comments`

**Response**:
```json
[
  {
    "id": "abc123",
    "user": {
      "display_name": "John Doe",
      "avatar_url": "https://..."
    },
    "content": "Great analysis!",
    "created_at": "2025-11-21T10:30:00Z",
    "replies": [
      {
        "id": "def456",
        "user": {
          "display_name": "Jane Smith",
          "avatar_url": "https://..."
        },
        "content": "Thanks! I'll update it.",
        "created_at": "2025-11-21T10:35:00Z"
      }
    ]
  }
]
```

---

## Permission Management

### Access Control Logic

```javascript
// Middleware to check note access
async function checkNoteAccess(req, res, next) {
  const { noteId } = req.params;
  const userId = req.user.id;
  
  const client = await pool.connect();
  try {
    // Check if user is owner or has been granted access
    const result = await client.query(`
      SELECT 
        n.user_id = $1 AS is_owner,
        ns.permission_level
      FROM notes n
      LEFT JOIN note_shares ns ON n.id = ns.note_id AND ns.shared_with_user_id = $1
      WHERE n.id = $2
    `, [userId, noteId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const { is_owner, permission_level } = result.rows[0];
    
    if (!is_owner && !permission_level) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    req.noteAccess = {
      isOwner: is_owner,
      permissionLevel: permission_level || 'owner'
    };
    
    next();
  } finally {
    client.release();
  }
}

// Middleware to require specific permission
function requirePermission(minLevel) {
  const levels = ['viewer', 'commenter', 'editor', 'owner'];
  
  return (req, res, next) => {
    const userLevel = req.noteAccess.permissionLevel;
    const minIndex = levels.indexOf(minLevel);
    const userIndex = levels.indexOf(userLevel);
    
    if (userIndex < minIndex) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Usage
router.put('/notes/:noteId', checkNoteAccess, requirePermission('editor'), updateNote);
router.post('/notes/:noteId/shares', checkNoteAccess, requirePermission('owner'), shareNote);
```

---

## Activity Tracking

### Database Schema

```sql
CREATE TYPE note_activity_type AS ENUM (
    'created', 'updated', 'deleted', 
    'shared', 'unshared', 'permissions_changed',
    'comment_added', 'comment_deleted'
);

CREATE TABLE note_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type note_activity_type NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Logging Activities

```javascript
async function logActivity(noteId, userId, activityType, details) {
  await pool.query(`
    INSERT INTO note_activity (note_id, user_id, activity_type, details)
    VALUES ($1, $2, $3, $4)
  `, [noteId, userId, activityType, JSON.stringify(details)]);
}

// Example usage
await logActivity(123, userId, 'shared', {
  sharedWith: 'user@example.com',
  permission: 'editor'
});
```

### Activity Feed

**Endpoint**: `GET /api/notes/:id/activity`

**Response**:
```json
[
  {
    "id": "xyz789",
    "user": {
      "display_name": "John Doe"
    },
    "activity_type": "shared",
    "details": {
      "sharedWith": "user@example.com",
      "permission": "editor"
    },
    "created_at": "2025-11-21T10:30:00Z"
  }
]
```

---

## Security Considerations

### Authentication

- All collaboration endpoints require authentication
- Session-based authentication with PostgreSQL storage
- Automatic session expiration

### Authorization

- Permission checks on every API request
- Database-level foreign key constraints
- Row-level security (future enhancement)

### Data Protection

- WebSocket connections over TLS in production
- Rate limiting on collaboration endpoints
- Input validation and sanitization

### Audit Trail

- All sharing actions logged in `note_activity`
- Immutable activity records
- Timestamp tracking for compliance

---

## Next Steps

### Phase 4 Enhancements

- [ ] Real-time notifications for shares and comments
- [ ] Cursor tracking in collaborative editing
- [ ] User presence indicators
- [ ] Conflict resolution UI for simultaneous edits

### Phase 5 Features

- [ ] @mentions in comments
- [ ] Email notifications for activity
- [ ] Team workspaces
- [ ] Bulk permission management

---

**Documentation Version**: 1.0  
**Last Updated**: November 21, 2025  
**Status**: Production Ready
