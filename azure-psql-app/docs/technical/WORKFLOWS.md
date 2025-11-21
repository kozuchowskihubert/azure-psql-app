# GitHub Actions Workflows

This repository uses GitHub Actions for continuous integration and deployment automation.

## Workflows Overview

### 1. CI Tests (`test.yml`)
**Trigger:** Push and Pull Requests to `main` and `develop` branches

**Purpose:** Automated testing across multiple Node.js versions

**Steps:**
- Runs tests on Node.js 16.x, 18.x, and 20.x
- Spins up PostgreSQL test database
- Executes unit tests
- Executes integration tests
- Generates code coverage reports
- Uploads coverage to Codecov
- Archives test results as artifacts

**Environment Variables Required:**
- `DATABASE_HOST`: PostgreSQL host (automatically set to localhost)
- `DATABASE_PORT`: PostgreSQL port (5432)
- `DATABASE_NAME`: Test database name
- `DATABASE_USER`: Test database user
- `DATABASE_PASSWORD`: Test database password

---

### 2. Code Quality (`code-quality.yml`)
**Trigger:** Push and Pull Requests to `main` and `develop` branches

**Purpose:** Maintain code quality and security standards

**Jobs:**

#### Lint
- Runs ESLint across the codebase
- Enforces Airbnb JavaScript style guide
- Checks for common code quality issues

#### Security
- Runs `npm audit` to identify vulnerabilities
- Checks for high-severity security issues
- Suggests fixes for security vulnerabilities

#### Dependency Review
- Reviews dependency changes in pull requests
- Identifies vulnerable or malicious packages
- Fails on high-severity issues

---

### 3. Deploy to Azure (`deploy.yml`)
**Trigger:** 
- Push to `main` branch
- Manual workflow dispatch

**Purpose:** Automated deployment to Azure App Service

**Jobs:**

#### Test
- Runs full test suite before deployment
- Ensures code quality before production deployment

#### Build
- Creates production build
- Installs only production dependencies
- Creates deployment package
- Uploads artifact for deployment

#### Deploy
- Downloads build artifact
- Deploys to Azure App Service
- Runs database migrations
- Uses Azure Web App deployment action

#### Health Check
- Waits 30 seconds for application startup
- Checks `/health` endpoint
- Verifies deployment success

**Secrets Required:**
```
AZURE_WEBAPP_PUBLISH_PROFILE
DATABASE_URL
```

---

## Setting Up GitHub Secrets

### Required Secrets

1. **AZURE_WEBAPP_PUBLISH_PROFILE**
   - Navigate to Azure Portal → App Service → Get Publish Profile
   - Copy the entire XML content
   - Add to GitHub: Settings → Secrets → New repository secret

2. **DATABASE_URL**
   - Format: `postgresql://user:password@host:port/database?sslmode=require`
   - Example: `postgresql://admin:pass@myserver.postgres.database.azure.com:5432/mydb?sslmode=require`

### Adding Secrets to GitHub

```bash
# Via GitHub UI
Repository → Settings → Secrets and variables → Actions → New repository secret

# Via GitHub CLI
gh secret set AZURE_WEBAPP_PUBLISH_PROFILE < publish-profile.xml
gh secret set DATABASE_URL --body "postgresql://..."
```

---

## Local Testing with Act

Test GitHub Actions locally using [Act](https://github.com/nektos/act):

```bash
# Install Act (macOS)
brew install act

# Run all workflows
act

# Run specific workflow
act -j test

# Run with secrets
act -j deploy --secret-file .secrets
```

Create `.secrets` file (add to `.gitignore`):
```
AZURE_WEBAPP_PUBLISH_PROFILE=<xml-content>
DATABASE_URL=postgresql://...
```

---

## Workflow Status Badges

Add to README.md:

```markdown
![CI Tests](https://github.com/YOUR_USERNAME/azure-psql-app/workflows/CI%20Tests/badge.svg)
![Code Quality](https://github.com/YOUR_USERNAME/azure-psql-app/workflows/Code%20Quality/badge.svg)
![Deploy](https://github.com/YOUR_USERNAME/azure-psql-app/workflows/Deploy%20to%20Azure/badge.svg)
```

---

## Manual Workflow Dispatch

Trigger deployment manually:

```bash
# Via GitHub UI
Actions → Deploy to Azure → Run workflow

# Via GitHub CLI
gh workflow run deploy.yml
```

---

## Troubleshooting

### Tests Failing in CI but Passing Locally
- Check Node.js version compatibility
- Verify environment variables are set correctly
- Ensure PostgreSQL service is healthy
- Review test timeout settings

### Deployment Failures
- Verify Azure publish profile is valid
- Check database connection string
- Ensure App Service is running
- Review deployment logs in GitHub Actions

### Code Quality Issues
- Run `npm run lint:fix` to auto-fix linting errors
- Run `npm audit fix` to update vulnerable dependencies
- Review ESLint configuration in `.eslintrc.js`

---

## Coverage Reports

Coverage reports are automatically generated and uploaded to Codecov:
- View coverage trends over time
- Identify untested code paths
- Set coverage thresholds in `jest.config.js`

Configure Codecov:
1. Sign up at https://codecov.io
2. Connect your GitHub repository
3. Add Codecov badge to README

---

## Best Practices

1. **Run tests locally before pushing**
   ```bash
   cd app
   npm test
   npm run lint
   ```

2. **Use feature branches**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   # Create pull request
   ```

3. **Review workflow runs**
   - Check Actions tab after each push
   - Review failed jobs
   - Fix issues before merging

4. **Keep dependencies updated**
   ```bash
   npm outdated
   npm update
   ```

5. **Monitor security vulnerabilities**
   ```bash
   npm audit
   npm audit fix
   ```

---

## Workflow Optimization

### Caching
All workflows use npm caching to speed up dependency installation:
```yaml
cache: 'npm'
cache-dependency-path: app/package-lock.json
```

### Matrix Testing
CI tests run on multiple Node.js versions to ensure compatibility:
```yaml
matrix:
  node-version: [16.x, 18.x, 20.x]
```

### Conditional Execution
Workflows skip unnecessary steps:
- Dependency review only runs on pull requests
- Deployment only runs on main branch
- Security audit continues on error to not block CI

---

## Future Enhancements

- [ ] Add Docker container scanning
- [ ] Implement blue-green deployment
- [ ] Add performance testing
- [ ] Configure auto-rollback on health check failure
- [ ] Add Slack/Teams notifications
- [ ] Implement canary deployments
- [ ] Add infrastructure tests with Terraform
