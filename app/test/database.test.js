const { Pool } = require('pg');

describe('Database Integration Tests', () => {
  let pool;

  beforeAll(() => {
    // Use test database
    pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/testdb',
      ssl: false,
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Database Connection', () => {
    it('should connect to the database', async () => {
      const client = await pool.connect();
      expect(client).toBeDefined();
      client.release();
    });

    it('should execute a simple query', async () => {
      const result = await pool.query('SELECT 1 as result');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].result).toBe(1);
    });
  });

  describe('Notes Table Operations', () => {
    beforeEach(async () => {
      // Clean up test data
      await pool.query('DELETE FROM notes WHERE title LIKE $1', ['TEST_%']);
    });

    it('should insert a note', async () => {
      const result = await pool.query(
        `INSERT INTO notes (title, content, category, important)
         VALUES ($1, $2, $3, $4)
         RETURNING id, title, content, category, important`,
        ['TEST_Note', 'TEST_Content', 'test', false],
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toMatchObject({
        title: 'TEST_Note',
        content: 'TEST_Content',
        category: 'test',
        important: false,
      });
    });

    it('should select notes', async () => {
      // Insert test note
      await pool.query(
        `INSERT INTO notes (title, content)
         VALUES ($1, $2)`,
        ['TEST_Select', 'TEST_Content'],
      );

      const result = await pool.query(
        'SELECT * FROM notes WHERE title = $1',
        ['TEST_Select'],
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].title).toBe('TEST_Select');
    });

    it('should update a note', async () => {
      // Insert test note
      const insertResult = await pool.query(
        `INSERT INTO notes (title, content)
         VALUES ($1, $2)
         RETURNING id`,
        ['TEST_Update', 'Original Content'],
      );

      const noteId = insertResult.rows[0].id;

      // Update the note
      const updateResult = await pool.query(
        `UPDATE notes
         SET content = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, content`,
        ['Updated Content', noteId],
      );

      expect(updateResult.rows[0].content).toBe('Updated Content');
    });

    it('should delete a note', async () => {
      // Insert test note
      const insertResult = await pool.query(
        `INSERT INTO notes (title, content)
         VALUES ($1, $2)
         RETURNING id`,
        ['TEST_Delete', 'Content'],
      );

      const noteId = insertResult.rows[0].id;

      // Delete the note
      const deleteResult = await pool.query(
        'DELETE FROM notes WHERE id = $1',
        [noteId],
      );

      expect(deleteResult.rowCount).toBe(1);

      // Verify deletion
      const selectResult = await pool.query(
        'SELECT * FROM notes WHERE id = $1',
        [noteId],
      );

      expect(selectResult.rows).toHaveLength(0);
    });
  });

  describe('Database Schema Validation', () => {
    it('should have notes table with correct columns', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'notes'
        ORDER BY ordinal_position
      `);

      const columns = result.rows.map((row) => row.column_name);

      expect(columns).toContain('id');
      expect(columns).toContain('title');
      expect(columns).toContain('content');
      expect(columns).toContain('category');
      expect(columns).toContain('important');
      expect(columns).toContain('created_at');
      expect(columns).toContain('updated_at');
    });
  });
});
