# Testing Scripts

This directory contains testing and validation scripts.

## Scripts

- **test_interactive.sh** - Interactive testing script for MIDI generation
- **test-cicd-local.sh** - Local CI/CD pipeline testing (uses Act)

## Usage

### Run Interactive Tests
```bash
./test_interactive.sh
```

### Test CI/CD Locally
```bash
cd ../..
./scripts/test-cicd-local.sh
```

## Related Documentation

- `docs/technical/ACT_USAGE.md` - Guide for testing GitHub Actions locally
- `app/test/` - Jest test suites
- `.github/workflows/` - GitHub Actions workflow definitions

## Running Full Test Suite

```bash
cd app
npm test              # Run all tests
npm run test:ci       # Run smoke tests only
npm run test:watch    # Run tests in watch mode
```
