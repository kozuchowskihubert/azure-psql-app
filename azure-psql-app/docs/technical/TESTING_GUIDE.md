# Testing & Automation Quick Reference

## Running Tests Locally

```bash
# Navigate to app directory
cd app

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run linter
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## Test Coverage

Current coverage thresholds (jest.config.js):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

View coverage report:
```bash
npm test
open coverage/lcov-report/index.html
```

## GitHub Actions Workflows

### Automatic Triggers

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI Tests | Push/PR to main/develop | Run tests on multiple Node versions |
| Code Quality | Push/PR to main/develop | Linting and security checks |
| Deploy | Push to main | Deploy to Azure App Service |

### Manual Triggers

```bash
# Trigger deployment manually
gh workflow run deploy.yml

# Or via GitHub UI
Actions → Deploy to Azure → Run workflow
```

## Required Environment Variables

### Local Development
```bash
# Create .env file
cat > app/.env << EOF
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=notesdb
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
SESSION_SECRET=your-secret-key
EOF
```

### GitHub Secrets
```bash
# Set via GitHub CLI
gh secret set AZURE_WEBAPP_PUBLISH_PROFILE < publish-profile.xml
gh secret set DATABASE_URL --body "postgresql://user:pass@host:5432/db"

# Or via GitHub UI
Repository → Settings → Secrets → Actions → New secret
```

## Common Commands

```bash
# Install dependencies
npm install

# Run app locally
npm start

# Run app in development mode
npm run dev

# Run database migrations
npm run migrate

# Check for outdated packages
npm outdated

# Update packages
npm update

# Security audit
npm audit

# Fix security issues
npm audit fix
```

## Workflow Files

```
.github/workflows/
├── test.yml          # CI testing across Node versions
├── code-quality.yml  # Linting and security
└── deploy.yml        # Azure deployment
```

## Test Files

```
app/test/
├── setup.js          # Test configuration
├── api.test.js       # API endpoint tests
├── database.test.js  # Database integration tests
└── share.test.js     # Sharing functionality tests
```

## Configuration Files

```
app/
├── jest.config.js    # Jest test configuration
├── .eslintrc.js      # ESLint rules
└── .eslintignore     # Files to ignore during linting
```

## Troubleshooting

### Tests fail locally but pass in CI
```bash
# Check Node version
node --version

# Use same version as CI (18.x)
nvm install 18
nvm use 18
```

### Database connection errors
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -h localhost -U postgres -d notesdb
```

### Linting errors
```bash
# Auto-fix most issues
npm run lint:fix

# Check remaining issues
npm run lint
```

### npm audit vulnerabilities
```bash
# View audit report
npm audit

# Attempt automatic fix
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force
```

## CI/CD Pipeline Flow

```
Push/PR → Tests → Code Quality → Build → Deploy → Health Check
   ↓         ↓          ↓           ↓        ↓          ↓
 Trigger  Unit/Int   Lint/Sec    Package   Azure   Verify
          Tests      Checks               Deploy    /health
```

## Status Badges

Add to README.md:
```markdown
![CI](https://github.com/USER/REPO/workflows/CI%20Tests/badge.svg)
![Quality](https://github.com/USER/REPO/workflows/Code%20Quality/badge.svg)
![Deploy](https://github.com/USER/REPO/workflows/Deploy/badge.svg)
```

## Best Practices

✅ **DO:**
- Write tests for new features
- Run tests before committing
- Fix linting errors before pushing
- Review workflow results
- Keep dependencies updated

❌ **DON'T:**
- Skip tests
- Ignore security warnings
- Commit directly to main
- Push failing code
- Disable linting rules without reason

## Quick Links

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
