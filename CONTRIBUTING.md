# Contributing to Enterprise Productivity Suite

Thank you for your interest in contributing! This document provides guidelines and standards for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

### Our Standards

- **Be Respectful**: Treat everyone with respect and consideration
- **Be Collaborative**: Work together towards the best solution
- **Be Professional**: Maintain a professional and inclusive environment
- **Be Constructive**: Provide helpful, actionable feedback

## Getting Started

### Prerequisites

```bash
# Required
- Node.js 18+ or 20 LTS
- PostgreSQL 14+
- Git

# Optional
- Docker (for containerized development)
- Python 3.10+ (for CLI tools)
- Terraform (for infrastructure changes)
```

### Initial Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/azure-psql-app.git
cd azure-psql-app

# 2. Install dependencies
cd app
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and other settings

# 4. Initialize database
npm run migrate

# 5. Run tests to verify setup
npm test

# 6. Start development server
npm run dev
```

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/notesdb
SESSION_SECRET=your-random-secret-key-here

# Optional Features
ENABLE_SSO=true
ENABLE_CALENDAR_SYNC=true
ENABLE_MEETING_ROOMS=true

# SSO Credentials (if ENABLE_SSO=true)
AZURE_CLIENT_ID=your-azure-app-id
AZURE_CLIENT_SECRET=your-azure-secret
AZURE_TENANT_ID=your-tenant-id
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

## Development Workflow

### Branch Strategy

```
main (production)
  ├── develop (integration)
  │   ├── feat/feature-name
  │   ├── fix/bug-description
  │   ├── docs/update-description
  │   └── refactor/component-name
  └── hotfix/critical-bug
```

### Branch Naming

- **Features**: `feat/short-description` (e.g., `feat/user-authentication`)
- **Bug Fixes**: `fix/bug-description` (e.g., `fix/login-redirect`)
- **Documentation**: `docs/what-updated` (e.g., `docs/api-endpoints`)
- **Refactoring**: `refactor/component` (e.g., `refactor/database-layer`)
- **Hotfixes**: `hotfix/critical-issue` (e.g., `hotfix/security-patch`)

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:

```bash
feat(auth): add Azure AD SSO integration

- Implement Passport.js Azure AD strategy
- Add auth routes for login/logout/callback
- Configure session persistence in PostgreSQL
- Add user role management

Closes #123
```

```bash
fix(api): handle null values in note creation

- Add validation for required fields
- Return 400 status for missing data
- Update error message to be more descriptive

Fixes #456
```

```bash
docs(readme): update installation instructions

- Add Node.js version requirement
- Clarify database setup steps
- Add troubleshooting section
```

## Code Standards

### JavaScript Style Guide

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications.

**Key Rules**:

```javascript
// ✅ Good
const fetchUserData = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user data');
  }
};

// ❌ Bad
function getUserData(id){
    var data=api.get("/users/"+id)
    return data
}
```

**Naming Conventions**:
- **Variables/Functions**: camelCase (`getUserById`, `noteTitle`)
- **Classes**: PascalCase (`NotesController`, `DatabaseManager`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`)
- **Files**: kebab-case (`auth-routes.js`, `database-config.js`)

### Documentation Comments (JSDoc)

**All functions must have JSDoc comments**:

```javascript
/**
 * Create a new note in the database
 * 
 * @param {Object} noteData - Note data object
 * @param {string} noteData.title - Note title (required)
 * @param {string} noteData.content - Note content (required)
 * @param {string} [noteData.category] - Note category (optional)
 * @param {boolean} [noteData.important=false] - Important flag
 * @returns {Promise<Object>} Created note with ID and timestamps
 * @throws {Error} If database operation fails
 * 
 * @example
 * const note = await createNote({
 *   title: 'Meeting Notes',
 *   content: 'Discussed project timeline',
 *   category: 'work'
 * });
 */
async function createNote(noteData) {
  // Implementation
}
```

**Module-level documentation**:

```javascript
/**
 * Authentication Routes
 * 
 * Handles SSO login/logout for Azure AD and Google OAuth.
 * Requires ENABLE_SSO=true environment variable.
 * 
 * Routes:
 * - GET /api/auth/azure - Initiate Azure AD login
 * - GET /api/auth/google - Initiate Google OAuth login
 * - POST /api/auth/logout - End user session
 * 
 * @module auth-routes
 * @requires express
 * @requires passport
 */
```

### Error Handling

**Always use try-catch for async operations**:

```javascript
// ✅ Good
router.post('/notes', async (req, res) => {
  const { title, content } = req.body;
  
  // Validate input
  if (!title || !content) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Title and content are required'
    });
  }
  
  try {
    const note = await notesService.create({ title, content });
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create note'
    });
  }
});

// ❌ Bad
router.post('/notes', async (req, res) => {
  const note = await notesService.create(req.body);
  res.json(note);
});
```

### Database Queries

**Always use parameterized queries**:

```javascript
// ✅ Good - Prevents SQL injection
const { rows } = await pool.query(
  'SELECT * FROM notes WHERE id = $1',
  [noteId]
);

// ❌ Bad - SQL injection vulnerability
const { rows } = await pool.query(
  `SELECT * FROM notes WHERE id = ${noteId}`
);
```

**Release database clients**:

```javascript
// ✅ Good
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO notes ...');
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

## Testing Requirements

### Test Coverage

- **Minimum Coverage**: 50% (enforced by CI)
- **Target Coverage**: 80%
- **Critical Paths**: 100% (auth, database operations)

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run specific test file
npm test -- api.test.js

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run integration tests
npm run test:integration
```

### Writing Tests

**Test Structure**:

```javascript
/**
 * Test suite for Notes API
 */
describe('Notes API', () => {
  describe('POST /api/notes', () => {
    it('should create a new note with valid data', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          title: 'Test Note',
          content: 'Test content'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Note');
    });
    
    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ content: 'Test content' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
```

**Test File Naming**:
- Unit tests: `component.test.js`
- Integration tests: `feature.integration.test.js`
- E2E tests: `workflow.e2e.test.js`

## Documentation Standards

### Code Documentation

- **All functions**: JSDoc comments
- **Complex logic**: Inline comments explaining "why"
- **TODOs**: Use `// TODO: description` format
- **FIXMEs**: Use `// FIXME: description` format

### README Updates

When adding features, update relevant README sections:

```markdown
## New Feature

### Description
Brief description of the feature

### Usage
\`\`\`javascript
// Code example
\`\`\`

### Configuration
Required environment variables or settings
```

### API Documentation

Document all API endpoints:

```markdown
#### POST /api/endpoint

**Description**: Brief description

**Authentication**: Required/Optional

**Request Body**:
\`\`\`json
{
  "field": "type - description"
}
\`\`\`

**Response**: 
\`\`\`json
{
  "result": "success"
}
\`\`\`

**Status Codes**:
- `201`: Created
- `400`: Bad Request
- `500`: Server Error
```

## Pull Request Process

### Before Submitting

**Checklist**:
- [ ] Code follows style guide
- [ ] All tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Added/updated tests for changes
- [ ] Updated documentation
- [ ] Checked browser console for errors (frontend changes)
- [ ] Tested on multiple browsers (frontend changes)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123
Relates to #456

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guide
- [ ] Tests pass
- [ ] Documentation updated
```

### Review Process

1. **Automated Checks**: CI must pass
   - Tests
   - Linting
   - Code quality

2. **Code Review**: At least 1 approval required
   - Functionality correctness
   - Code quality
   - Test coverage
   - Documentation

3. **Deployment**: Merge to `develop`, then `main`
   - Develop: Staging environment
   - Main: Production deployment

## Project Structure

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

**Key Directories**:

```
app/
├── server.js          # Main entry point
├── app.js             # Express configuration
├── routes/            # API endpoints
├── auth/              # Authentication
├── config/            # Configuration
├── utils/             # Utilities
├── public/            # Frontend
└── test/              # Tests

infra/                 # Terraform IaC
docs/                  # Documentation
.github/workflows/     # CI/CD
```

## Getting Help

- **Documentation**: Check `/docs` directory
- **Issues**: Search existing issues first
- **Questions**: Open a discussion or issue
- **Architecture**: See `docs/ARCHITECTURE.md`

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

**Thank you for contributing!** 🎉

Your efforts help make this project better for everyone.
