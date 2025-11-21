const request = require('supertest');
const { Pool } = require('pg');

// Mock database pool
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Import app after mocking
let app;
let pool;

beforeAll(() => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
  process.env.SESSION_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
  
  pool = new Pool();
  app = require('../index').app;
});

afterAll(() => {
  jest.clearAllMocks();
});

describe('Health Check Endpoint', () => {
  it('should return healthy status when database is connected', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [{ result: 1 }] }),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('database', 'connected');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('should return unhealthy status when database connection fails', async () => {
    pool.connect.mockRejectedValue(new Error('Connection failed'));

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toHaveProperty('status', 'unhealthy');
    expect(response.body).toHaveProperty('database', 'disconnected');
  });
});

describe('Notes API Endpoints', () => {
  describe('GET /notes', () => {
    it('should return all notes', async () => {
      const mockNotes = [
        {
          id: 1,
          title: 'Test Note',
          content: 'Test Content',
          category: 'test',
          important: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: mockNotes }),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app).get('/notes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNotes);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockClient = {
        query: jest.fn().mockRejectedValue(new Error('Database error')),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app).get('/notes');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('GET /notes/:id', () => {
    it('should return a specific note', async () => {
      const mockNote = {
        id: 1,
        title: 'Test Note',
        content: 'Test Content',
        category: 'test',
        important: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [mockNote] }),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app).get('/notes/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNote);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.any(String),
        ['1']
      );
    });

    it('should return 404 when note not found', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app).get('/notes/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Note not found');
    });
  });

  describe('POST /notes', () => {
    it('should create a new note', async () => {
      const newNote = {
        title: 'New Note',
        content: 'New Content',
        category: 'test',
        important: true,
      };

      const mockCreatedNote = {
        id: 1,
        ...newNote,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [mockCreatedNote] }),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app).post('/notes').send(newNote);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newNote);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 when title is missing', async () => {
      const invalidNote = {
        content: 'Content without title',
      };

      const response = await request(app).post('/notes').send(invalidNote);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when content is missing', async () => {
      const invalidNote = {
        title: 'Title without content',
      };

      const response = await request(app).post('/notes').send(invalidNote);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /notes/:id', () => {
    it('should update an existing note', async () => {
      const updatedNote = {
        title: 'Updated Note',
        content: 'Updated Content',
        category: 'updated',
        important: true,
      };

      const mockUpdatedNote = {
        id: 1,
        ...updatedNote,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [mockUpdatedNote] }),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app).put('/notes/1').send(updatedNote);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updatedNote);
    });

    it('should return 404 when updating non-existent note', async () => {
      const updatedNote = {
        title: 'Updated Note',
        content: 'Updated Content',
      };

      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app).put('/notes/999').send(updatedNote);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Note not found');
    });
  });

  describe('DELETE /notes/:id', () => {
    it('should delete an existing note', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rowCount: 1 }),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app).delete('/notes/1');

      expect(response.status).toBe(204);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.any(String),
        ['1']
      );
    });

    it('should return 404 when deleting non-existent note', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app).delete('/notes/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Note not found');
    });
  });
});

describe('Share Routes', () => {
  describe('POST /api/notes/:id/shares', () => {
    it('should require authentication', async () => {
      const shareData = {
        email: 'user@example.com',
        permissionLevel: 'editor',
      };

      const response = await request(app)
        .post('/api/notes/1/shares')
        .send(shareData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
