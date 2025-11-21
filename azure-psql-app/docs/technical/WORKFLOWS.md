# GitHub Actions Workflows

## Overview

3 workflows auto-run on push/PR to `main` or `develop`:

### 1. CI Tests (`test.yml`)
- Tests on Node.js 16, 18, 20
- PostgreSQL test database
- Code coverage reports

### 2. Code Quality (`code-quality.yml`)
- ESLint checks
- Security audit (`npm audit`)
- Dependency review

### 3. Deploy (`deploy.yml`)
- Runs on push to `main` only
- Pre-deployment tests
- Azure App Service deployment
- Health check verification

## Required Secrets

Add in GitHub Settings → Secrets → Actions:

```
AZURE_WEBAPP_PUBLISH_PROFILE  # From Azure Portal
DATABASE_URL                  # postgresql://user:pass@host:5432/db
```

## Manual Deployment

```bash
gh workflow run deploy.yml
# Or: Actions → Deploy to Azure → Run workflow
```

## Troubleshooting

**Workflows not running?**
- Check Actions tab in GitHub
- Verify workflows enabled in Settings

**Deployment fails?**
- Verify secrets configured
- Check Azure credentials
- Review workflow logs

**Tests fail in CI?**
- Match Node version locally
- Check environment variables
