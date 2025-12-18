// ============================================================================
// DAW Studio API Routes
// Handles projects, tracks, patterns, and user presets
// ============================================================================

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// ============================================================================
// PROJECTS
// ============================================================================

// Get all user projects
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;

    const result = await db.query(
      `SELECT p.*, 
              (SELECT COUNT(*) FROM daw_tracks WHERE project_id = p.id) as track_count,
              (SELECT json_agg(json_build_object(
                'id', t.id,
                'track_name', t.track_name,
                'instrument_type', t.instrument_type
              )) FROM daw_tracks t WHERE t.project_id = p.id) as tracks
       FROM daw_projects p
       WHERE p.user_id = $1
       ORDER BY p.updated_at DESC`,
      [userId]
    );

    res.json({ success: true, projects: result.rows });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single project with all tracks
router.get('/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { id } = req.params;
    const userId = req.user.id;

    const projectResult = await db.query(
      'SELECT * FROM daw_projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const tracksResult = await db.query(
      `SELECT t.*, 
              (SELECT json_agg(json_build_object(
                'id', p.id,
                'pattern_name', p.pattern_name,
                'pattern_data', p.pattern_data,
                'velocity_data', p.velocity_data
              )) FROM daw_patterns p WHERE p.track_id = t.id) as patterns
       FROM daw_tracks t
       WHERE t.project_id = $1
       ORDER BY t.track_number`,
      [id]
    );

    res.json({
      success: true,
      project: projectResult.rows[0],
      tracks: tracksResult.rows
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new project
router.post('/projects', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;
    const {
      project_name = 'Untitled Project',
      bpm = 120,
      time_signature = '4/4',
      key_signature = 'C',
      duration_bars = 16,
      master_volume = 0.8
    } = req.body;

    const result = await db.query(
      `INSERT INTO daw_projects 
       (user_id, project_name, bpm, time_signature, key_signature, duration_bars, master_volume)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, project_name, bpm, time_signature, key_signature, duration_bars, master_volume]
    );

    // Log activity
    await db.query(
      `INSERT INTO user_activity (user_id, activity_type, activity_details)
       VALUES ($1, 'project_created', $2)`,
      [userId, JSON.stringify({ project_id: result.rows[0].id, project_name })]
    );

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update project
router.put('/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const allowedFields = ['project_name', 'bpm', 'time_signature', 'key_signature', 
                          'duration_bars', 'master_volume', 'project_data', 'is_public'];
    
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    values.push(id, userId);
    const result = await db.query(
      `UPDATE daw_projects 
       SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete project
router.delete('/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM daw_projects WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// TRACKS
// ============================================================================

// Add track to project
router.post('/projects/:projectId/tracks', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { projectId } = req.params;
    const userId = req.user.id;
    const {
      track_name = 'New Track',
      instrument_type,
      track_number,
      volume = 0.8,
      pan = 0.5,
      color = '#FF6B35',
      adsr_attack = 0.01,
      adsr_decay = 0.2,
      adsr_sustain = 0.7,
      adsr_release = 0.3
    } = req.body;

    // Verify project ownership
    const projectCheck = await db.query(
      'SELECT id FROM daw_projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Get next track number if not provided
    let finalTrackNumber = track_number;
    if (!finalTrackNumber) {
      const maxTrack = await db.query(
        'SELECT COALESCE(MAX(track_number), 0) + 1 as next_number FROM daw_tracks WHERE project_id = $1',
        [projectId]
      );
      finalTrackNumber = maxTrack.rows[0].next_number;
    }

    const result = await db.query(
      `INSERT INTO daw_tracks 
       (project_id, user_id, track_number, track_name, instrument_type, volume, pan, color,
        adsr_attack, adsr_decay, adsr_sustain, adsr_release)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [projectId, userId, finalTrackNumber, track_name, instrument_type, volume, pan, color,
       adsr_attack, adsr_decay, adsr_sustain, adsr_release]
    );

    res.json({ success: true, track: result.rows[0] });
  } catch (error) {
    console.error('Error adding track:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update track
router.put('/tracks/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const allowedFields = ['track_name', 'volume', 'pan', 'is_muted', 'is_solo', 'is_armed', 'color',
                          'adsr_attack', 'adsr_decay', 'adsr_sustain', 'adsr_release',
                          'reverb_amount', 'delay_amount', 'distortion_amount', 
                          'filter_cutoff', 'filter_resonance', 'track_data'];
    
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    values.push(id, userId);
    const result = await db.query(
      `UPDATE daw_tracks 
       SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }

    res.json({ success: true, track: result.rows[0] });
  } catch (error) {
    console.error('Error updating track:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete track
router.delete('/tracks/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM daw_tracks WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }

    res.json({ success: true, message: 'Track deleted' });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PATTERNS
// ============================================================================

// Save pattern for track
router.post('/tracks/:trackId/patterns', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { trackId } = req.params;
    const userId = req.user.id;
    const { pattern_name = 'Pattern 1', pattern_length = 16, pattern_data, velocity_data } = req.body;

    // Verify track ownership
    const trackCheck = await db.query(
      'SELECT id FROM daw_tracks WHERE id = $1 AND user_id = $2',
      [trackId, userId]
    );

    if (trackCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }

    const result = await db.query(
      `INSERT INTO daw_patterns (track_id, pattern_name, pattern_length, pattern_data, velocity_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [trackId, pattern_name, pattern_length, JSON.stringify(pattern_data), JSON.stringify(velocity_data || [])]
    );

    res.json({ success: true, pattern: result.rows[0] });
  } catch (error) {
    console.error('Error saving pattern:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update pattern
router.put('/patterns/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { id } = req.params;
    const userId = req.user.id;
    const { pattern_name, pattern_data, velocity_data } = req.body;

    // Verify ownership through track
    const result = await db.query(
      `UPDATE daw_patterns p
       SET pattern_name = COALESCE($1, p.pattern_name),
           pattern_data = COALESCE($2, p.pattern_data),
           velocity_data = COALESCE($3, p.velocity_data),
           updated_at = CURRENT_TIMESTAMP
       FROM daw_tracks t
       WHERE p.id = $4 AND p.track_id = t.id AND t.user_id = $5
       RETURNING p.*`,
      [pattern_name, pattern_data ? JSON.stringify(pattern_data) : null, 
       velocity_data ? JSON.stringify(velocity_data) : null, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Pattern not found' });
    }

    res.json({ success: true, pattern: result.rows[0] });
  } catch (error) {
    console.error('Error updating pattern:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PRESETS
// ============================================================================

// Get user presets
router.get('/presets', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;
    const { instrument_type } = req.query;

    let query = 'SELECT * FROM user_presets WHERE user_id = $1';
    const params = [userId];

    if (instrument_type) {
      query += ' AND instrument_type = $2';
      params.push(instrument_type);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json({ success: true, presets: result.rows });
  } catch (error) {
    console.error('Error fetching presets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save preset
router.post('/presets', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;
    const {
      preset_name,
      instrument_type,
      preset_category = 'custom',
      adsr_attack = 0.01,
      adsr_decay = 0.2,
      adsr_sustain = 0.7,
      adsr_release = 0.3,
      ...otherParams
    } = req.body;

    const result = await db.query(
      `INSERT INTO user_presets 
       (user_id, preset_name, instrument_type, preset_category, 
        adsr_attack, adsr_decay, adsr_sustain, adsr_release, preset_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, preset_name, instrument_type, preset_category,
       adsr_attack, adsr_decay, adsr_sustain, adsr_release, JSON.stringify(otherParams)]
    );

    res.json({ success: true, preset: result.rows[0] });
  } catch (error) {
    console.error('Error saving preset:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// USER STATISTICS
// ============================================================================

// Get user statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM user_statistics WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Initialize statistics if not exists
      await db.query(
        'INSERT INTO user_statistics (user_id) VALUES ($1)',
        [userId]
      );
      return res.json({
        success: true,
        statistics: {
          total_projects: 0,
          total_tracks: 0,
          total_presets: 0,
          total_play_time_seconds: 0,
          total_exports: 0
        }
      });
    }

    res.json({ success: true, statistics: result.rows[0] });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const result = await db.query(
      'SELECT * FROM user_activity WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );

    res.json({ success: true, activity: result.rows });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
