const express = require('express');

const router = express.Router();
const pool = require('../config/database');

// Get all notes
router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, title, content, category, important, note_type, mermaid_code, diagram_data, created_at, updated_at 
      FROM notes 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Get single note by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT id, title, content, category, important, note_type, mermaid_code, diagram_data, created_at, updated_at FROM notes WHERE id = $1',
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching note:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Create new note
router.post('/', async (req, res) => {
  const {
    title, content, category, important, note_type, mermaid_code, diagram_data,
  } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO notes (title, content, category, important, note_type, mermaid_code, diagram_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, title, content, category, important, note_type, mermaid_code, diagram_data, created_at, updated_at`,
      [title, content, category || null, important || false, note_type || 'text', mermaid_code || null, diagram_data || null],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Update note
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title, content, category, important, note_type, mermaid_code, diagram_data,
  } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `UPDATE notes 
       SET title = $1, content = $2, category = $3, important = $4, note_type = $5, mermaid_code = $6, diagram_data = $7, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 
       RETURNING id, title, content, category, important, note_type, mermaid_code, diagram_data, created_at, updated_at`,
      [title, content, category || null, important || false, note_type || 'text', mermaid_code || null, diagram_data || null, id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const { rowCount } = await client.query('DELETE FROM notes WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
