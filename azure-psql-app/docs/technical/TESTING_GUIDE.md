# Testing Quick Reference

## Run Tests

```bash
cd app

# All tests
npm test

# Watch mode
npm run test:watch

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Linting
npm run lint
npm run lint:fix
```

## Test Files

- `app/test/api.test.js` - API endpoints
- `app/test/database.test.js` - Database operations
- `app/test/share.test.js` - Sharing features

## Configuration

- `jest.config.js` - Jest settings (50% coverage threshold)
- `.eslintrc.js` - ESLint rules (Airbnb style)
- `.eslintignore` - Excluded files

## Workflows

Auto-run on push/PR to `main` or `develop`:
- CI Tests (Node 16/18/20)
- Code Quality (ESLint, security audit)
- Deploy (main only)

## Troubleshooting

**Tests fail?**
```bash
npm test -- --verbose
```

**Linting errors?**
```bash
npm run lint:fix
```

**Dependencies outdated?**
```bash
npm audit fix
```
