const express = require('express');
const router = express.Router();

// Middleware to check for authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'User not authenticated' });
};

module.exports = (pool) => {
  // Share a note with a user
  router.post('/notes/:id/shares', isAuthenticated, async (req, res) => {
    const { id: noteId } = req.params;
    const { email, permissionLevel } = req.body;
    const sharerId = req.user.id;

    if (!email || !permissionLevel) {
      return res.status(400).json({ error: 'Email and permissionLevel are required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get the user ID for the email
      const userToShareWith = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userToShareWith.rows.length === 0) {
        return res.status(404).json({ error: 'User to share with not found' });
      }
      const sharedWithUserId = userToShareWith.rows[0].id;

      // Check if the sharer owns the note
      const noteOwner = await client.query('SELECT user_id FROM notes WHERE id = $1', [noteId]);
      if (noteOwner.rows.length === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      if (noteOwner.rows[0].user_id !== sharerId) {
        // For now, only owners can share. This could be expanded later.
        return res.status(403).json({ error: 'Only the note owner can share it' });
      }

      // Insert or update the share record
      const { rows } = await client.query(
        `INSERT INTO note_shares (note_id, shared_with_user_id, shared_by_user_id, permission_level)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (note_id, shared_with_user_id) DO UPDATE SET permission_level = EXCLUDED.permission_level, shared_at = NOW()
         RETURNING *`,
        [noteId, sharedWithUserId, sharerId, permissionLevel]
      );

      // Log the activity
      await client.query(
        `INSERT INTO note_activity (note_id, user_id, activity_type, details)
         VALUES ($1, $2, 'shared', $3)`,
        [noteId, sharerId, JSON.stringify({ sharedWith: email, permission: permissionLevel })]
      );

      await client.query('COMMIT');
      res.status(201).json(rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error sharing note:', err);
      res.status(500).json({ error: 'Failed to share note' });
    } finally {
      client.release();
    }
  });

  // Get users a note is shared with
  router.get('/notes/:id/shares', isAuthenticated, async (req, res) => {
    const { id: noteId } = req.params;
    const requesterId = req.user.id;

    const client = await pool.connect();
    try {
      // Verify requester has access to the note
      const noteAccess = await client.query(
        `SELECT 1 FROM notes n
         LEFT JOIN note_shares ns ON n.id = ns.note_id
         WHERE n.id = $1 AND (n.user_id = $2 OR ns.shared_with_user_id = $2)`,
        [noteId, requesterId]
      );

      if (noteAccess.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { rows } = await client.query(
        `SELECT ns.id, u.email, u.display_name, ns.permission_level
         FROM note_shares ns
         JOIN users u ON ns.shared_with_user_id = u.id
         WHERE ns.note_id = $1`,
        [noteId]
      );
      res.json(rows);
    } catch (err) {
      console.error('Error getting note shares:', err);
      res.status(500).json({ error: 'Failed to retrieve sharing information' });
    } finally {
      client.release();
    }
  });

  // Remove a share
  router.delete('/shares/:shareId', isAuthenticated, async (req, res) => {
    const { shareId } = req.params;
    const requesterId = req.user.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const shareInfo = await client.query('SELECT note_id, shared_with_user_id FROM note_shares WHERE id = $1', [shareId]);
        if (shareInfo.rows.length === 0) {
            return res.status(404).json({ error: 'Share record not found' });
        }
        const { note_id: noteId, shared_with_user_id: sharedWithUserId } = shareInfo.rows[0];

        const noteOwner = await client.query('SELECT user_id FROM notes WHERE id = $1', [noteId]);
        if (noteOwner.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Only owner or the person themselves can remove the share
        if (noteOwner.rows[0].user_id !== requesterId && sharedWithUserId !== requesterId) {
            return res.status(403).json({ error: 'You do not have permission to remove this share' });
        }

        const { rowCount } = await client.query('DELETE FROM note_shares WHERE id = $1', [shareId]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Share record not found' });
        }

        // Log activity
        const sharedWithUser = await client.query('SELECT email FROM users WHERE id = $1', [sharedWithUserId]);
        await client.query(
            `INSERT INTO note_activity (note_id, user_id, activity_type, details)
             VALUES ($1, $2, 'unshared', $3)`,
            [noteId, requesterId, JSON.stringify({ unsharedWith: sharedWithUser.rows[0].email })]
        );

        await client.query('COMMIT');
        res.status(204).send();
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error removing share:', err);
        res.status(500).json({ error: 'Failed to remove share' });
    } finally {
        client.release();
    }
  });

  return router;
};
