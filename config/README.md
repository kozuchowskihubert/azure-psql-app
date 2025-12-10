# Configuration Files

This directory contains configuration templates and settings for the project.

## Files

### Environment Configuration
- **`.env.template`** - Environment variables template
  - Copy to `.env` in project root
  - Configure database, authentication, and secrets
  - Required for local development

### GitHub Actions Local Testing
- **`.actrc`** - Configuration for Act (local GitHub Actions)
  - Specifies Docker images for different runners
  - Used when running `act` locally
  - See `docs/technical/ACT_USAGE.md` for details

- **`.secrets.example`** - Example secrets file for Act
  - Copy to `.secrets` in project root
  - Add actual secret values
  - Never commit `.secrets` file (in .gitignore)

## Quick Setup

```bash
# Copy environment template
cp config/.env.template .env

# Edit with your values
nano .env

# For Act local testing (optional)
cp config/.secrets.example .secrets
nano .secrets
```

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `NODE_ENV` - Environment (development/production)

### Optional (SSO)
- `AZURE_CLIENT_ID` - Azure AD application ID
- `AZURE_CLIENT_SECRET` - Azure AD secret
- `GOOGLE_CLIENT_ID` - Google OAuth ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

### Optional (Features)
- `ENABLE_COLLABORATION` - Enable Y.js collaboration (true/false)
- `ENABLE_MUSIC_ROUTES` - Enable music production endpoints (true/false)

See `.env.template` for complete list and descriptions.
