// ============================================================================
// Calendar API Routes
// ============================================================================

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../auth/sso-config');

// ============================================================================
// Calendar Events CRUD
// ============================================================================

// Get all events for authenticated user
router.get('/events', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { start, end, type } = req.query;

    let query = `
      SELECT 
        e.*,
        json_agg(
          json_build_object(
            'id', a.id,
            'email', a.email,
            'displayName', a.display_name,
            'status', a.status,
            'isOrganizer', a.is_organizer
          )
        ) FILTER (WHERE a.id IS NOT NULL) as attendees
      FROM calendar_events e
      LEFT JOIN event_attendees a ON e.id = a.event_id
      WHERE e.user_id = $1
    `;
    
    const params = [req.user.id];
    let paramIndex = 2;

    // Filter by date range
    if (start && end) {
      query += ` AND e.start_time >= $${paramIndex} AND e.end_time <= $${paramIndex + 1}`;
      params.push(start, end);
      paramIndex += 2;
    }

    // Filter by event type
    if (type) {
      query += ` AND e.event_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` GROUP BY e.id ORDER BY e.start_time ASC`;

    const result = await db.query(query, params);
    res.json({ events: result.rows });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/events/:id', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(
      `SELECT 
        e.*,
        json_agg(
          json_build_object(
            'id', a.id,
            'email', a.email,
            'displayName', a.display_name,
            'status', a.status,
            'isOrganizer', a.is_organizer,
            'isRequired', a.is_required
          )
        ) FILTER (WHERE a.id IS NOT NULL) as attendees
      FROM calendar_events e
      LEFT JOIN event_attendees a ON e.id = a.event_id
      WHERE e.id = $1 AND e.user_id = $2
      GROUP BY e.id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event
router.post('/events', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const {
      title,
      description,
      location,
      startTime,
      endTime,
      timezone,
      isAllDay,
      eventType,
      visibility,
      attendees,
      recurrenceRule,
    } = req.body;

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, startTime, endTime' 
      });
    }

    // Start transaction
    await db.query('BEGIN');

    try {
      // Insert event
      const eventResult = await db.query(
        `INSERT INTO calendar_events (
          user_id, title, description, location,
          start_time, end_time, timezone, is_all_day,
          event_type, visibility, recurrence_rule
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          req.user.id,
          title,
          description,
          location,
          startTime,
          endTime,
          timezone || 'UTC',
          isAllDay || false,
          eventType || 'event',
          visibility || 'private',
          recurrenceRule,
        ]
      );

      const event = eventResult.rows[0];

      // Add organizer as attendee
      await db.query(
        `INSERT INTO event_attendees (
          event_id, user_id, email, display_name, 
          status, is_organizer, is_required
        ) VALUES ($1, $2, $3, $4, 'accepted', true, true)`,
        [
          event.id,
          req.user.id,
          req.user.email,
          req.user.display_name,
        ]
      );

      // Add other attendees
      if (attendees && attendees.length > 0) {
        for (const attendee of attendees) {
          await db.query(
            `INSERT INTO event_attendees (
              event_id, email, display_name, is_required
            ) VALUES ($1, $2, $3, $4)`,
            [event.id, attendee.email, attendee.name, attendee.required !== false]
          );
        }
      }

      await db.query('COMMIT');

      res.status(201).json({ 
        event,
        message: 'Event created successfully' 
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/events/:id', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventId = req.params.id;
    const updates = req.body;

    // Verify ownership
    const ownerCheck = await db.query(
      'SELECT id FROM calendar_events WHERE id = $1 AND user_id = $2',
      [eventId, req.user.id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or access denied' });
    }

    // Build update query dynamically
    const allowedFields = [
      'title', 'description', 'location', 'start_time', 'end_time',
      'timezone', 'is_all_day', 'status', 'visibility', 'recurrence_rule'
    ];

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey)) {
        updateFields.push(`${snakeKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(eventId);
    const query = `
      UPDATE calendar_events 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    res.json({ 
      event: result.rows[0],
      message: 'Event updated successfully' 
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/events/:id', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(
      'DELETE FROM calendar_events WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or access denied' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ============================================================================
// Calendar Provider Management
// ============================================================================

// Get connected calendar providers
router.get('/providers', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(
      `SELECT 
        id, provider_type, provider_account_id,
        is_primary, sync_enabled, last_sync_at,
        created_at, updated_at
      FROM calendar_providers
      WHERE user_id = $1
      ORDER BY is_primary DESC, created_at DESC`,
      [req.user.id]
    );

    res.json({ providers: result.rows });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Failed to fetch calendar providers' });
  }
});

// Connect calendar provider
router.post('/providers', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { providerType, accessToken, refreshToken, accountId } = req.body;

    if (!providerType || !accessToken) {
      return res.status(400).json({ 
        error: 'Missing required fields: providerType, accessToken' 
      });
    }

    const result = await db.query(
      `INSERT INTO calendar_providers (
        user_id, provider_type, provider_account_id,
        access_token, refresh_token, sync_enabled
      ) VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, provider_type, provider_account_id, sync_enabled, created_at`,
      [req.user.id, providerType, accountId, accessToken, refreshToken]
    );

    res.status(201).json({ 
      provider: result.rows[0],
      message: 'Calendar provider connected successfully' 
    });
  } catch (error) {
    console.error('Error connecting provider:', error);
    res.status(500).json({ error: 'Failed to connect calendar provider' });
  }
});

// Disconnect calendar provider
router.delete('/providers/:id', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(
      'DELETE FROM calendar_providers WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({ message: 'Calendar provider disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting provider:', error);
    res.status(500).json({ error: 'Failed to disconnect calendar provider' });
  }
});

// Trigger manual sync
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { providerId } = req.body;

    // TODO: Implement actual sync logic with external calendar API
    // This would fetch events from Google/Outlook and merge with local DB

    await db.query(
      `UPDATE calendar_providers 
      SET last_sync_at = NOW() 
      WHERE id = $1 AND user_id = $2`,
      [providerId, req.user.id]
    );

    res.json({ 
      message: 'Calendar sync initiated',
      status: 'syncing' 
    });
  } catch (error) {
    console.error('Error syncing calendar:', error);
    res.status(500).json({ error: 'Failed to sync calendar' });
  }
});

module.exports = router;
