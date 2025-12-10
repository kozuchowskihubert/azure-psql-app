# 🏗️ Architecture Documentation

## Project Structure Overview

```
azure-psql-app/
├── app/                          # Node.js backend application
│   ├── server.js                 # 🚀 MAIN ENTRY POINT - Server startup
│   ├── app.js                    # Express app configuration
│   ├── collaboration.js          # WebSocket server for real-time collab
│   ├── package.json              # Node.js dependencies
│   │
│   ├── auth/                     # Authentication modules
│   │   ├── auth-routes.js        # SSO login/logout endpoints
│   │   └── sso-config.js         # Passport.js configuration
│   │
│   ├── config/                   # Configuration modules
│   │   └── database.js           # PostgreSQL connection pool
│   │
│   ├── routes/                   # API route handlers
│   │   ├── index.js              # Route aggregator
│   │   ├── notes.js              # Notes CRUD operations
│   │   ├── health.js             # Health check endpoint
│   │   ├── pwa.js                # PWA manifest/service-worker
│   │   ├── music-routes.js       # Music production API
│   │   ├── calendar-routes.js    # Calendar sync (optional)
│   │   ├── meeting-routes.js     # Meeting rooms (optional)
│   │   └── share-routes.js       # Note sharing features
│   │
│   ├── utils/                    # Utility modules
│   │   └── db-init.js            # Database schema initialization
│   │
│   ├── public/                   # Frontend static files
│   │   ├── index.html            # Main SPA entry point
│   │   ├── app.js                # Frontend application logic
│   │   ├── service-worker.js     # PWA offline support
│   │   ├── manifest.json         # PWA configuration
│   │   ├── *.html                # Feature-specific pages
│   │   ├── js/                   # JavaScript modules
│   │   └── icons/                # PWA icons
│   │
│   ├── ableton-cli/              # Python CLI tools for music production
│   │   ├── synth2600_cli.py      # Behringer 2600 CLI interface
│   │   ├── techno_studio.py      # Techno music generator
│   │   ├── requirements.txt      # Python dependencies
│   │   └── docs/                 # CLI documentation
│   │
│   └── test/                     # Test suite
│       ├── api.test.js           # API endpoint tests
│       ├── database.test.js      # Database integration tests
│       └── smoke.test.js         # Smoke tests for CI
│
├── infra/                        # Infrastructure as Code
│   ├── main.tf                   # Terraform main configuration
│   ├── variables.tf              # Terraform variables
│   ├── outputs.tf                # Terraform outputs
│   └── *.sh                      # Deployment scripts
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # This file
│   ├── technical/                # Technical documentation
│   ├── user-guides/              # User guides
│   └── business/                 # Business documentation
│
├── .github/                      # GitHub Actions workflows
│   └── workflows/                # CI/CD pipelines
│
├── README.md                     # Main project README
├── Dockerfile                    # Container definition
└── package.json                  # Not used (app/package.json is the real one)
```

## Application Architecture

### Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ index.html   │  │ PWA Features │  │ WebSocket    │      │
│  │ SPA Frontend │  │ (Offline)    │  │ Client       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ HTTP/REST        │ Service Worker   │ WS://
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────────┐
│         ▼                  ▼                  ▼             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Express.js Application                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │ Static     │  │ API Routes │  │ WebSocket  │    │  │
│  │  │ Files      │  │ /api/*     │  │ Server     │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │  ┌───────────────────────────────────────────────┐ │  │
│  │  │ Middleware: Helmet, CORS, Rate Limit,        │ │  │
│  │  │            Sessions, Passport                 │ │  │
│  │  └───────────────────────────────────────────────┘ │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                      │
│              Node.js Server (server.js)                    │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  notes   │  │ sessions │  │  users   │  │ meetings │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

#### 🚀 server.js
**Purpose**: Application entry point
- Imports Express app from `app.js`
- Creates HTTP server
- Initializes WebSocket server (collaboration.js)
- Starts database initialization
- Listens on PORT (default: 3000)

#### ⚙️ app.js
**Purpose**: Express application configuration
- Configures security middleware (Helmet, CORS, Rate Limiting)
- Sets up body parsers
- Configures sessions (in-memory dev, PostgreSQL prod)
- Initializes Passport.js for SSO (if enabled)
- Mounts route handlers
- Serves static files and SPA fallback

#### 🔌 collaboration.js
**Purpose**: Real-time collaboration via WebSocket
- Creates WebSocket server (using `ws` library)
- Manages Y.js document synchronization
- Broadcasts updates to connected clients
- Handles document persistence

#### 🗄️ config/database.js
**Purpose**: Database connection management
- Creates PostgreSQL connection pool
- Configures SSL for Azure PostgreSQL
- Exports pool for use in routes

#### 🛣️ routes/
**Purpose**: API endpoint handlers

**Structure**:
```javascript
routes/
├── index.js           // Aggregates all routes
│   exports: { apiRouter, pwaRouter }
│
├── notes.js           // CRUD for notes
│   GET    /api/notes
│   POST   /api/notes
│   PUT    /api/notes/:id
│   DELETE /api/notes/:id
│
├── health.js          // Health check
│   GET    /api/health
│
├── music-routes.js    // Music production API
│   GET    /api/music/synth2600/presets
│   GET    /api/music/synth2600/preset/:name
│   POST   /api/music/synth2600/export
│   POST   /api/music/synth2600/patch
│
└── pwa.js            // PWA files
    GET    /manifest.json
    GET    /service-worker.js
```

### Data Flow

#### Note Creation Example

```
User Action (Frontend)
   │
   ├─> POST /api/notes { title, content }
   │
   ▼
Express Middleware Chain
   │
   ├─> Helmet (Security Headers)
   ├─> CORS (Allow Origins)
   ├─> Rate Limiter (100 req/15min)
   ├─> Body Parser (JSON)
   ├─> Session (Restore user session)
   │
   ▼
Route Handler (routes/notes.js)
   │
   ├─> Validate input (title, content required)
   ├─> Get database client from pool
   │
   ▼
Database Operation
   │
   ├─> INSERT INTO notes (title, content, ...)
   ├─> RETURNING id, created_at, ...
   │
   ▼
Response
   │
   ├─> 201 Created { id: 1, title: "...", ... }
   │   OR
   ├─> 400 Bad Request { error: "..." }
   │   OR
   └─> 500 Internal Error { error: "..." }
```

### Authentication Flow

```
User → Frontend → /api/auth/azure (or /google)
                       │
                       ├─> Passport.js
                       ├─> OAuth Provider (Azure AD / Google)
                       ├─> Callback /api/auth/azure/callback
                       ├─> Create session
                       ├─> Store in PostgreSQL (sessions table)
                       └─> Redirect to /index.html
                       
Protected Route
   │
   ├─> requireAuth middleware
   ├─> Check req.user (from session)
   │   - If authenticated: proceed
   │   - If not: 401 Unauthorized
   └─> Continue to route handler
```

## Deployment Architecture

### Production Environment (Azure)

```
┌────────────────────────────────────────────────────────┐
│                     Azure Cloud                        │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  App Service (notesapp-dev-app)             │   │
│  │  ┌────────────────────────────────────┐     │   │
│  │  │  Docker Container                  │     │   │
│  │  │  - Node.js 20                      │     │   │
│  │  │  - Express app                     │     │   │
│  │  │  - WebSocket server                │     │   │
│  │  └────────────────┬───────────────────┘     │   │
│  │                   │                          │   │
│  │  Environment Variables:                     │   │
│  │  - DATABASE_URL                             │   │
│  │  - SESSION_SECRET                           │   │
│  │  - NODE_ENV=production                      │   │
│  └───────────────────┼──────────────────────────┘   │
│                      │                              │
│  ┌───────────────────▼──────────────────────────┐   │
│  │  Azure Database for PostgreSQL              │   │
│  │  - Flexible Server                          │   │
│  │  - SSL Required                             │   │
│  │  - Tables: notes, users, sessions, meetings │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Managed by Terraform (infra/*.tf)                  │
└──────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
GitHub Push (main/develop branch)
   │
   ├─> GitHub Actions Workflows
   │
   ├─> 1. CI Tests (.github/workflows/test.yml)
   │   ├─> Run on Node.js 16, 18, 20
   │   ├─> Execute Jest tests
   │   ├─> Generate coverage report
   │   └─> Fail if coverage < 50%
   │
   ├─> 2. Code Quality (.github/workflows/code-quality.yml)
   │   ├─> Run ESLint
   │   ├─> Run npm audit
   │   └─> Fail on errors
   │
   └─> 3. Deploy (.github/workflows/deploy.yml)
       ├─> Build Docker image
       ├─> Push to Azure Container Registry
       ├─> Deploy to App Service
       ├─> Health check verification
       └─> Notify on success/failure
```

## Technology Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 14+ (Azure Flexible Server)
- **Real-time**: WebSocket (ws library) + Y.js CRDT
- **Session**: express-session + connect-pg-simple
- **Auth**: Passport.js (Azure AD, Google OAuth)

### Frontend
- **Architecture**: Single Page Application (SPA)
- **PWA**: Service Workers for offline support
- **Real-time**: Native WebSocket API
- **UI**: Vanilla JavaScript + Tailwind CSS

### DevOps
- **Containerization**: Docker
- **Infrastructure**: Terraform (Azure)
- **CI/CD**: GitHub Actions
- **Testing**: Jest + Supertest
- **Linting**: ESLint (Airbnb style guide)

## Configuration

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-random-secret-key

# Optional Features
ENABLE_SSO=true                    # Enable SSO authentication
ENABLE_CALENDAR_SYNC=true          # Enable calendar features
ENABLE_MEETING_ROOMS=true          # Enable meeting room booking
NODE_ENV=production                # production | development | test

# SSO Configuration (if ENABLE_SSO=true)
AZURE_CLIENT_ID=your-azure-app-id
AZURE_CLIENT_SECRET=your-azure-secret
AZURE_TENANT_ID=your-tenant-id
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Server
PORT=3000                          # Default: 3000
```

### Database Schema

```sql
-- Notes table
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  important BOOLEAN DEFAULT FALSE,
  note_type VARCHAR(50) DEFAULT 'text',
  mermaid_code TEXT,
  diagram_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for express-session)
CREATE TABLE session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Users table (for SSO)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  provider VARCHAR(50),
  provider_id VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Performance Considerations

### Caching Strategy
- Static files served with proper cache headers
- Service Worker caches for offline access
- Database connection pooling (pg Pool)

### Scaling
- Stateless application design (sessions in PostgreSQL)
- WebSocket scaling requires sticky sessions
- Horizontal scaling supported via App Service scaling rules

### Security
- Helmet.js for security headers
- CORS configured for specific origins
- Rate limiting (100 req/15min per IP)
- SQL injection prevention (parameterized queries)
- XSS protection (Content Security Policy)
- CSRF protection via SameSite cookies

## Development Workflow

### Local Development
```bash
# 1. Install dependencies
cd app
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Run database migrations
npm run migrate

# 4. Start development server
npm run dev

# 5. Run tests
npm test
```

### Testing Strategy
- **Unit Tests**: Individual functions and modules
- **Integration Tests**: Database operations and API endpoints
- **Smoke Tests**: Basic module loading for CI
- **Coverage Target**: 50% minimum

### Code Style
- **JavaScript**: ESLint with Airbnb style guide
- **Formatting**: Consistent indentation, spacing
- **Comments**: JSDoc for functions, inline for complex logic
- **Naming**: camelCase for variables, PascalCase for classes

## Troubleshooting

### Common Issues

**Database connection errors**
```bash
# Check DATABASE_URL format
# postgresql://username:password@hostname:5432/database
# Ensure SSL is enabled for Azure PostgreSQL
```

**Port already in use**
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

**WebSocket connection fails**
```bash
# Check if server.js is used (not app.js directly)
# Ensure collaboration.js is properly initialized
# Verify firewall allows WebSocket connections
```

**Tests failing in CI**
```bash
# Ensure DATABASE_URL is set in GitHub Secrets
# Check test database is accessible
# Review test logs for specific failures
```

## Future Improvements

### Planned Features
- [ ] Implement full Y.js persistence layer
- [ ] Add Redis caching for sessions
- [ ] Implement GraphQL API alongside REST
- [ ] Add comprehensive API documentation (Swagger/OpenAPI)
- [ ] Implement end-to-end tests (Playwright)

### Technical Debt
- [ ] Consolidate duplicate code in index.js and app.js
- [ ] Improve error handling consistency
- [ ] Add request/response logging middleware
- [ ] Implement proper secrets management (Azure Key Vault)
- [ ] Add monitoring and alerting (Application Insights)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on:
- Code style requirements
- Testing requirements
- Pull request process
- Documentation standards

## Support

- **Documentation**: `/docs` directory
- **Issues**: GitHub Issues
- **Technical Support**: See README.md

---

**Last Updated**: 2024-01-21  
**Maintainers**: Development Team  
**Version**: 2.1
