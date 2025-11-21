// ============================================================================
// Meeting & Room Booking API Routes
// ============================================================================

const express = require('express');

const router = express.Router();
const { requireAuth } = require('../auth/sso-config');

// ============================================================================
// Meeting Routes
// ============================================================================

// Get all meetings for user
router.get('/', requireAuth, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { status, upcoming, past } = req.query;

    let query = `
      SELECT 
        mb.*,
        mr.name as room_name,
        mr.location as room_location,
        u.display_name as organizer_name,
        u.email as organizer_email,
        COUNT(DISTINCT mp.id) as participant_count
      FROM meeting_bookings mb
      LEFT JOIN meeting_rooms mr ON mb.room_id = mr.id
      LEFT JOIN users u ON mb.organizer_id = u.id
      LEFT JOIN meeting_participants mp ON mb.id = mp.meeting_id
      WHERE mb.organizer_id = $1 
         OR EXISTS (
           SELECT 1 FROM meeting_participants 
           WHERE meeting_id = mb.id AND user_id = $1
         )
    `;

    const params = [req.user.id];
    let paramIndex = 2;

    if (status) {
      query += ` AND mb.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (upcoming) {
      query += ' AND mb.start_time > NOW()';
    }

    if (past) {
      query += ' AND mb.end_time < NOW()';
    }

    query += ` GROUP BY mb.id, mr.name, mr.location, u.display_name, u.email
               ORDER BY mb.start_time DESC`;

    const result = await db.query(query, params);
    res.json({ meetings: result.rows });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Schedule a meeting
router.post('/', requireAuth, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const {
      title,
      description,
      agenda,
      startTime,
      endTime,
      timezone,
      roomId,
      meetingType,
      virtualMeetingUrl,
      participants,
      sendReminder,
      reminderMinutesBefore,
    } = req.body;

    // Validate
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        error: 'Missing required fields: title, startTime, endTime',
      });
    }

    // Check room availability if booking a room
    if (roomId) {
      const conflict = await db.query(
        `SELECT id FROM meeting_bookings
        WHERE room_id = $1
          AND status = 'scheduled'
          AND (
            (start_time <= $2 AND end_time > $2) OR
            (start_time < $3 AND end_time >= $3) OR
            (start_time >= $2 AND end_time <= $3)
          )`,
        [roomId, startTime, endTime],
      );

      if (conflict.rows.length > 0) {
        return res.status(409).json({
          error: 'Room is not available for the selected time slot',
        });
      }
    }

    await db.query('BEGIN');

    try {
      // Create meeting
      const meetingResult = await db.query(
        `INSERT INTO meeting_bookings (
          title, description, agenda, start_time, end_time, timezone,
          room_id, organizer_id, meeting_type, virtual_meeting_url,
          send_reminder, reminder_minutes_before
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          title, description, agenda, startTime, endTime, timezone || 'UTC',
          roomId, req.user.id, meetingType || 'in-person', virtualMeetingUrl,
          sendReminder !== false, reminderMinutesBefore || 15,
        ],
      );

      const meeting = meetingResult.rows[0];

      // Add organizer as participant
      await db.query(
        `INSERT INTO meeting_participants (
          meeting_id, user_id, email, display_name, status, is_required
        ) VALUES ($1, $2, $3, $4, 'accepted', true)`,
        [meeting.id, req.user.id, req.user.email, req.user.display_name],
      );

      // Add other participants
      if (participants && participants.length > 0) {
        for (const participant of participants) {
          await db.query(
            `INSERT INTO meeting_participants (
              meeting_id, email, display_name, is_required
            ) VALUES ($1, $2, $3, $4)`,
            [meeting.id, participant.email, participant.name, participant.required !== false],
          );
        }
      }

      // Create calendar event
      const calendarResult = await db.query(
        `INSERT INTO calendar_events (
          user_id, title, description, location, start_time, end_time,
          timezone, event_type, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'meeting', 'confirmed')
        RETURNING id`,
        [
          req.user.id, title, description,
          roomId ? 'Room Booking' : 'Virtual Meeting',
          startTime, endTime, timezone || 'UTC',
        ],
      );

      // Link meeting to calendar event
      await db.query(
        'UPDATE meeting_bookings SET calendar_event_id = $1 WHERE id = $2',
        [calendarResult.rows[0].id, meeting.id],
      );

      await db.query('COMMIT');

      res.status(201).json({
        meeting,
        message: 'Meeting scheduled successfully',
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ error: 'Failed to schedule meeting' });
  }
});

// Get meeting details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { db } = req.app.locals;

    const result = await db.query(
      `SELECT 
        mb.*,
        mr.name as room_name,
        mr.location as room_location,
        mr.capacity as room_capacity,
        mr.features as room_features,
        u.display_name as organizer_name,
        u.email as organizer_email,
        json_agg(
          json_build_object(
            'id', mp.id,
            'email', mp.email,
            'displayName', mp.display_name,
            'status', mp.status,
            'isRequired', mp.is_required,
            'checkedIn', mp.checked_in
          )
        ) FILTER (WHERE mp.id IS NOT NULL) as participants
      FROM meeting_bookings mb
      LEFT JOIN meeting_rooms mr ON mb.room_id = mr.id
      LEFT JOIN users u ON mb.organizer_id = u.id
      LEFT JOIN meeting_participants mp ON mb.id = mp.meeting_id
      WHERE mb.id = $1
      GROUP BY mb.id, mr.name, mr.location, mr.capacity, mr.features, u.display_name, u.email`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ meeting: result.rows[0] });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

// Cancel meeting
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { cancellationReason } = req.body;

    const result = await db.query(
      `UPDATE meeting_bookings 
      SET status = 'cancelled', 
          cancellation_reason = $1,
          cancelled_at = NOW()
      WHERE id = $2 AND organizer_id = $3
      RETURNING id`,
      [cancellationReason, req.params.id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found or access denied' });
    }

    // TODO: Send cancellation notifications to participants

    res.json({ message: 'Meeting cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    res.status(500).json({ error: 'Failed to cancel meeting' });
  }
});

// Check in to meeting
router.post('/:id/checkin', requireAuth, async (req, res) => {
  try {
    const { db } = req.app.locals;

    const result = await db.query(
      `UPDATE meeting_participants
      SET checked_in = true, checked_in_at = NOW()
      WHERE meeting_id = $1 AND user_id = $2
      RETURNING id`,
      [req.params.id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not a participant of this meeting' });
    }

    res.json({ message: 'Checked in successfully' });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// ============================================================================
// Room Routes
// ============================================================================

// Get all rooms
router.get('/rooms', requireAuth, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { active } = req.query;

    let query = 'SELECT * FROM meeting_rooms';
    const params = [];

    if (active === 'true') {
      query += ' WHERE is_active = true';
    }

    query += ' ORDER BY name ASC';

    const result = await db.query(query, params);
    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Find available rooms
router.get('/rooms/available', requireAuth, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const {
      startTime, endTime, capacity, features,
    } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({
        error: 'Missing required parameters: startTime, endTime',
      });
    }

    let query = `
      SELECT r.*
      FROM meeting_rooms r
      WHERE r.is_active = true
    `;
    const params = [];
    let paramIndex = 1;

    // Filter by capacity
    if (capacity) {
      query += ` AND r.capacity >= $${paramIndex}`;
      params.push(parseInt(capacity));
      paramIndex++;
    }

    // Filter by features
    if (features) {
      query += ` AND r.features @> $${paramIndex}::jsonb`;
      params.push(JSON.stringify(features.split(',')));
      paramIndex++;
    }

    // Check availability
    query += `
      AND NOT EXISTS (
        SELECT 1 FROM meeting_bookings mb
        WHERE mb.room_id = r.id
          AND mb.status = 'scheduled'
          AND (
            (mb.start_time <= $${paramIndex} AND mb.end_time > $${paramIndex}) OR
            (mb.start_time < $${paramIndex + 1} AND mb.end_time >= $${paramIndex + 1}) OR
            (mb.start_time >= $${paramIndex} AND mb.end_time <= $${paramIndex + 1})
          )
      )
      ORDER BY r.capacity ASC, r.name ASC
    `;
    params.push(startTime, endTime);

    const result = await db.query(query, params);
    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('Error finding available rooms:', error);
    res.status(500).json({ error: 'Failed to find available rooms' });
  }
});

// Get room schedule
router.get('/rooms/:id/schedule', requireAuth, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { date } = req.query;

    const startOfDay = date ? `${date} 00:00:00` : 'CURRENT_DATE';
    const endOfDay = date ? `${date} 23:59:59` : 'CURRENT_DATE + INTERVAL \'1 day\'';

    const result = await db.query(
      `SELECT 
        mb.id, mb.title, mb.start_time, mb.end_time,
        mb.status, u.display_name as organizer_name
      FROM meeting_bookings mb
      LEFT JOIN users u ON mb.organizer_id = u.id
      WHERE mb.room_id = $1
        AND mb.status = 'scheduled'
        AND mb.start_time >= ${startOfDay}
        AND mb.end_time <= ${endOfDay}
      ORDER BY mb.start_time ASC`,
      [req.params.id],
    );

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Error fetching room schedule:', error);
    res.status(500).json({ error: 'Failed to fetch room schedule' });
  }
});

module.exports = router;
