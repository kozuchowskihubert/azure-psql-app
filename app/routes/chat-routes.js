/**
 * Chat Routes - Secure Group Chat API
 * 
 * Features:
 * - JWT authenticated endpoints
 * - Secure message storage in PostgreSQL
 * - File attachments support
 * - Channel management
 * - Message history with pagination
 * 
 * All endpoints require TLS/SSL in production
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../auth/jwt-auth');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure multer for secure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/chat-attachments'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Allow images, audio, and common document types
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
      'application/pdf', 'text/plain'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// ============================================================================
// CHANNEL ENDPOINTS
// ============================================================================

/**
 * GET /api/chat/channels
 * Get all available channels
 */
router.get('/channels', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.type,
        c.is_private,
        c.created_at,
        COUNT(DISTINCT cm.user_id) as member_count,
        (
          SELECT COUNT(*) FROM chat_messages m 
          WHERE m.channel_id = c.id 
          AND m.created_at > COALESCE(
            (SELECT last_read_at FROM channel_members WHERE channel_id = c.id AND user_id = $1),
            '1970-01-01'
          )
        ) as unread_count
      FROM chat_channels c
      LEFT JOIN channel_members cm ON c.id = cm.channel_id
      WHERE c.is_private = false 
        OR c.id IN (SELECT channel_id FROM channel_members WHERE user_id = $1)
      GROUP BY c.id
      ORDER BY c.type, c.name
    `, [req.user.id]);

    res.json({
      success: true,
      channels: result.rows
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

/**
 * POST /api/chat/channels
 * Create a new channel (admin only or premium users for private channels)
 */
router.post('/channels', authenticateToken, async (req, res) => {
  const { name, description, type = 'text', isPrivate = false } = req.body;

  if (!name || name.length < 2 || name.length > 50) {
    return res.status(400).json({ error: 'Channel name must be 2-50 characters' });
  }

  try {
    // Check if user can create channels (admin or premium for private)
    if (isPrivate) {
      const userResult = await pool.query(
        'SELECT subscription_tier FROM users WHERE id = $1',
        [req.user.id]
      );
      const tier = userResult.rows[0]?.subscription_tier || 'free';
      if (tier === 'free') {
        return res.status(403).json({ error: 'Premium subscription required for private channels' });
      }
    }

    const result = await pool.query(`
      INSERT INTO chat_channels (name, description, type, is_private, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name.toLowerCase().replace(/\s+/g, '-'), description, type, isPrivate, req.user.id]);

    // Add creator as channel member
    await pool.query(`
      INSERT INTO channel_members (channel_id, user_id, role)
      VALUES ($1, $2, 'owner')
    `, [result.rows[0].id, req.user.id]);

    res.status(201).json({
      success: true,
      channel: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Channel name already exists' });
    }
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

/**
 * POST /api/chat/channels/:channelId/join
 * Join a channel
 */
router.post('/channels/:channelId/join', authenticateToken, async (req, res) => {
  const { channelId } = req.params;

  try {
    // Check if channel exists and is not private
    const channel = await pool.query(
      'SELECT * FROM chat_channels WHERE id = $1',
      [channelId]
    );

    if (channel.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.rows[0].is_private) {
      return res.status(403).json({ error: 'Cannot join private channel without invitation' });
    }

    // Add user to channel (ignore if already member)
    await pool.query(`
      INSERT INTO channel_members (channel_id, user_id, role)
      VALUES ($1, $2, 'member')
      ON CONFLICT (channel_id, user_id) DO NOTHING
    `, [channelId, req.user.id]);

    res.json({ success: true, message: 'Joined channel' });
  } catch (error) {
    console.error('Error joining channel:', error);
    res.status(500).json({ error: 'Failed to join channel' });
  }
});

// ============================================================================
// MESSAGE ENDPOINTS
// ============================================================================

/**
 * GET /api/chat/channels/:channelId/messages
 * Get messages for a channel with pagination
 */
router.get('/channels/:channelId/messages', authenticateToken, async (req, res) => {
  const { channelId } = req.params;
  const { limit = 50, before, after } = req.query;

  try {
    let query = `
      SELECT 
        m.id,
        m.content,
        m.attachment_url,
        m.attachment_type,
        m.created_at,
        m.edited_at,
        u.id as author_id,
        u.display_name as author_name,
        u.avatar_url as author_avatar,
        u.subscription_tier as author_tier
      FROM chat_messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.channel_id = $1
    `;
    const params = [channelId];
    let paramIndex = 2;

    if (before) {
      query += ` AND m.created_at < $${paramIndex}`;
      params.push(before);
      paramIndex++;
    }

    if (after) {
      query += ` AND m.created_at > $${paramIndex}`;
      params.push(after);
      paramIndex++;
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);

    // Update last read timestamp
    await pool.query(`
      INSERT INTO channel_members (channel_id, user_id, last_read_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (channel_id, user_id) 
      DO UPDATE SET last_read_at = NOW()
    `, [channelId, req.user.id]);

    res.json({
      success: true,
      messages: result.rows.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * POST /api/chat/channels/:channelId/messages
 * Send a message to a channel
 */
router.post('/channels/:channelId/messages', authenticateToken, async (req, res) => {
  const { channelId } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  if (content.length > 2000) {
    return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
  }

  try {
    // Check if user is member of channel
    const memberCheck = await pool.query(
      'SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2',
      [channelId, req.user.id]
    );

    // Auto-join public channels
    const channel = await pool.query('SELECT is_private FROM chat_channels WHERE id = $1', [channelId]);
    if (channel.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (memberCheck.rows.length === 0) {
      if (channel.rows[0].is_private) {
        return res.status(403).json({ error: 'Not a member of this channel' });
      }
      // Auto-join public channel
      await pool.query(
        'INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2)',
        [channelId, req.user.id]
      );
    }

    // Insert message
    const result = await pool.query(`
      INSERT INTO chat_messages (channel_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at
    `, [channelId, req.user.id, content.trim()]);

    // Get user info for response
    const userResult = await pool.query(
      'SELECT display_name, avatar_url, subscription_tier FROM users WHERE id = $1',
      [req.user.id]
    );

    const message = {
      id: result.rows[0].id,
      content: result.rows[0].content,
      created_at: result.rows[0].created_at,
      author_id: req.user.id,
      author_name: userResult.rows[0].display_name || req.user.email,
      author_avatar: userResult.rows[0].avatar_url,
      author_tier: userResult.rows[0].subscription_tier
    };

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * POST /api/chat/channels/:channelId/messages/attachment
 * Send a message with file attachment
 */
router.post('/channels/:channelId/messages/attachment', 
  authenticateToken, 
  upload.single('file'),
  async (req, res) => {
    const { channelId } = req.params;
    const { content = '' } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      // Check channel membership
      const memberCheck = await pool.query(
        'SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2',
        [channelId, req.user.id]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Not a member of this channel' });
      }

      // Determine attachment type
      let attachmentType = 'file';
      if (req.file.mimetype.startsWith('image/')) attachmentType = 'image';
      else if (req.file.mimetype.startsWith('audio/')) attachmentType = 'audio';

      const attachmentUrl = `/uploads/chat-attachments/${req.file.filename}`;

      // Insert message with attachment
      const result = await pool.query(`
        INSERT INTO chat_messages (channel_id, user_id, content, attachment_url, attachment_type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, content, attachment_url, attachment_type, created_at
      `, [channelId, req.user.id, content.trim(), attachmentUrl, attachmentType]);

      const userResult = await pool.query(
        'SELECT display_name, avatar_url FROM users WHERE id = $1',
        [req.user.id]
      );

      res.status(201).json({
        success: true,
        message: {
          ...result.rows[0],
          author_id: req.user.id,
          author_name: userResult.rows[0].display_name,
          author_avatar: userResult.rows[0].avatar_url
        }
      });
    } catch (error) {
      console.error('Error sending attachment:', error);
      res.status(500).json({ error: 'Failed to send attachment' });
    }
  }
);

/**
 * DELETE /api/chat/messages/:messageId
 * Delete a message (own messages only, or admin)
 */
router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  const { messageId } = req.params;

  try {
    // Check if user owns the message
    const message = await pool.query(
      'SELECT user_id FROM chat_messages WHERE id = $1',
      [messageId]
    );

    if (message.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.rows[0].user_id !== req.user.id) {
      // Check if user is admin
      const user = await pool.query(
        "SELECT roles FROM users WHERE id = $1 AND 'admin' = ANY(roles)",
        [req.user.id]
      );
      if (user.rows.length === 0) {
        return res.status(403).json({ error: 'Cannot delete other users\' messages' });
      }
    }

    await pool.query('DELETE FROM chat_messages WHERE id = $1', [messageId]);

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

/**
 * PUT /api/chat/messages/:messageId
 * Edit a message (own messages only)
 */
router.put('/messages/:messageId', authenticateToken, async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const result = await pool.query(`
      UPDATE chat_messages 
      SET content = $1, edited_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [content.trim(), messageId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    res.json({
      success: true,
      message: result.rows[0]
    });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// ============================================================================
// ONLINE PRESENCE
// ============================================================================

/**
 * GET /api/chat/online
 * Get online users in community
 */
router.get('/online', authenticateToken, async (req, res) => {
  try {
    // Get users active in last 5 minutes
    const result = await pool.query(`
      SELECT id, display_name, avatar_url, subscription_tier
      FROM users
      WHERE last_login_at > NOW() - INTERVAL '5 minutes'
      ORDER BY last_login_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      users: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
});

/**
 * POST /api/chat/presence
 * Update user presence (heartbeat)
 */
router.post('/presence', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update presence' });
  }
});

module.exports = router;
