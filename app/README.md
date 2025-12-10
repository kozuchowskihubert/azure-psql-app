# Backend Application

Enterprise-grade Node.js backend with PostgreSQL, WebSocket support, and comprehensive API endpoints.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Initialize database
npm run migrate

# Start development server
npm run dev

# Run tests
npm test
```

## 📁 Architecture

### Entry Points

- **server.js** - Main application entry point
  - Creates HTTP server
  - Initializes WebSocket server
  - Starts Express app
  - Handles graceful shutdown

- **app.js** - Express application configuration
  - Security middleware (Helmet, CORS, Rate Limiting)
  - Session management
  - Route mounting
  - SPA routing fallback

- **index.js** - ⚠️ Deprecated (backwards compatibility only)

### Core Modules

```
app/
├── server.js                 # 🚀 Main entry point
├── app.js                    # ⚙️ Express configuration
├── collaboration.js          # 🔌 WebSocket server
│
├── auth/                     # 🔐 Authentication
│   ├── auth-routes.js        # Login/logout endpoints
│   └── sso-config.js         # Passport.js SSO config
│
├── config/                   # ⚙️ Configuration
│   └── database.js           # PostgreSQL pool
│
├── routes/                   # 🛣️ API Routes
│   ├── index.js              # Route aggregator
│   ├── notes.js              # Notes CRUD
│   ├── health.js             # Health check
│   ├── pwa.js                # PWA files
│   ├── music-routes.js       # Music production API
│   ├── calendar-routes.js    # Calendar sync (optional)
│   ├── meeting-routes.js     # Meeting rooms (optional)
│   └── share-routes.js       # Note sharing
│
├── utils/                    # 🔧 Utilities
│   └── db-init.js            # Database initialization
│
├── public/                   # 🌐 Frontend
│   ├── index.html            # SPA entry
│   ├── *.html                # Feature pages
│   └── js/                   # JavaScript modules
│
├── ableton-cli/              # 🎵 Python CLI tools
│   └── synth2600_cli.py      # Behringer 2600 interface
│
└── test/                     # ✅ Tests
    ├── api.test.js           # API tests
    ├── database.test.js      # Database tests
    └── smoke.test.js         # CI smoke tests
```

## 🔌 API Endpoints

### Notes API

```javascript
GET    /api/notes              // List all notes
POST   /api/notes              // Create note
GET    /api/notes/:id          // Get note by ID
PUT    /api/notes/:id          // Update note
DELETE /api/notes/:id          // Delete note
```

### Health Check

```javascript
GET    /api/health             // Database health status
```

### Music Production API

```javascript
GET    /api/music/synth2600/presets           // List presets
GET    /api/music/synth2600/preset/:name      // Load preset
POST   /api/music/synth2600/export            // Export MIDI
POST   /api/music/synth2600/patch             // Patch operations
```

### Authentication (Optional)

```javascript
GET    /api/auth/azure         // Azure AD login
GET    /api/auth/google        // Google OAuth login
POST   /api/auth/logout        // Logout
```

### Calendar & Meetings (Optional)

```javascript
GET    /api/calendar/events    // List calendar events
GET    /api/meetings/rooms     // List meeting rooms
POST   /api/meetings/book      // Book meeting room
```

## 🗄️ Database

### Connection

PostgreSQL connection pool configured in `config/database.js`:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

### Schema

Main tables:
- `notes` - User notes with metadata
- `users` - User accounts (SSO)
- `sessions` - Session storage
- `meetings` - Meeting room bookings

Initialize with:
```bash
npm run migrate
```

### Queries

Always use parameterized queries:

```javascript
// ✅ Good
const { rows } = await pool.query(
  'SELECT * FROM notes WHERE id = $1',
  [noteId]
);

// ❌ Bad (SQL injection risk)
const { rows } = await pool.query(
  `SELECT * FROM notes WHERE id = ${noteId}`
);
```

## 🔒 Security

### Middleware Stack

1. **Helmet** - Security headers
2. **CORS** - Cross-origin resource sharing
3. **Rate Limiting** - 100 req/15min per IP
4. **Session** - Secure, HTTP-only cookies
5. **Passport** - SSO authentication

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/db
SESSION_SECRET=random-secret-key

# Optional
ENABLE_SSO=true
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Best Practices

- All sensitive data in environment variables
- HTTPS in production (`NODE_ENV=production`)
- SQL injection prevention (parameterized queries)
- XSS protection (Content Security Policy)
- CSRF protection (SameSite cookies)

## 🔌 WebSocket Server

Real-time collaboration using Y.js CRDT:

```javascript
// Connect to document
const ws = new WebSocket('ws://localhost:3000/document-id');

// Y.js handles synchronization
const ydoc = new Y.Doc();
const provider = new WebsocketProvider(
  'ws://localhost:3000', 
  'document-id', 
  ydoc
);
```

## 🧪 Testing

### Commands

```bash
npm test                    # All tests with coverage
npm run test:watch          # Watch mode
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
npm run lint                # ESLint
npm run lint:fix            # Auto-fix issues
```

### Coverage Requirements

- Minimum: 50% (enforced by CI)
- Target: 80%
- Critical paths: 100% (auth, database)

### Writing Tests

```javascript
describe('Notes API', () => {
  it('should create note with valid data', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title: 'Test', content: 'Content' });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

## 🚀 Deployment

### Production Startup

```bash
# Environment
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...

# Start server
npm start
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Health Check

```bash
curl http://localhost:3000/api/health

# Response
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-21T..."
}
```

## 📝 Development

### Adding a New Route

1. Create route file in `routes/`:

```javascript
// routes/example.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.json({ message: 'Example route' });
});

module.exports = router;
```

2. Add to `routes/index.js`:

```javascript
const exampleRoutes = require('./example');
router.use('/example', exampleRoutes);
```

3. Add tests in `test/`:

```javascript
describe('Example API', () => {
  it('should return message', async () => {
    const response = await request(app)
      .get('/api/example');
    expect(response.status).toBe(200);
  });
});
```

### Adding Middleware

```javascript
// In app.js
const customMiddleware = (req, res, next) => {
  // Your logic
  next();
};

app.use(customMiddleware);
```

## 🐛 Troubleshooting

### Database Connection Errors

```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:5432/database

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### WebSocket Not Working

- Ensure `server.js` is used (not `app.js` directly)
- Check firewall allows WebSocket connections
- Verify `collaboration.js` is initialized

### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test file
npm test -- api.test.js

# Verbose output
npm test -- --verbose
```

## 📚 Resources

- [Architecture Documentation](../docs/ARCHITECTURE.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [API Documentation](../docs/technical/)
- [Main README](../README.md)

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for:
- Code style requirements
- Testing requirements
- Pull request process

## 📄 License

MIT - See [LICENSE](../LICENSE) file

---

**Need Help?** Check `/docs` directory or open an issue.
