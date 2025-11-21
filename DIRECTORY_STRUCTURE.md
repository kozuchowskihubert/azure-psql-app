# 📁 Project Directory Structure

This document describes the organized directory structure of the azure-psql-app project.

## Root Structure

```
azure-psql-app/
├── app/                      # Main application code
├── docs/                     # All documentation
├── infra/                    # Infrastructure as Code (Terraform)
├── scripts/                  # Automation scripts
├── .github/                  # GitHub Actions workflows
└── README.md                 # Main project documentation
```

## Application (`app/`)

```
app/
├── server.js                 # Main server entry point
├── app.js                    # Express application configuration
├── collaboration.js          # WebSocket collaboration server
├── package.json              # Dependencies and scripts
├── auth/                     # Authentication (SSO)
├── routes/                   # API endpoints
├── public/                   # Frontend assets
│   ├── index.html
│   ├── js/                   # Feature modules
│   ├── service-worker.js     # PWA support
│   └── icons/
├── test/                     # Jest test suites
├── utils/                    # Utilities (DB init, etc.)
└── ableton-cli/              # MIDI generation CLI tool
    ├── src/                  # Python source code
    ├── docs/                 # CLI-specific documentation
    ├── output/               # Generated MIDI files
    └── *.py                  # CLI scripts
```

## Documentation (`docs/`)

```
docs/
├── ARCHITECTURE.md           # System architecture (500+ lines)
├── ableton-cli/              # Ableton CLI & MIDI documentation
│   ├── INDEX.md              # Documentation index
│   ├── START-HERE.md         # Getting started guide
│   ├── SYNTH2600_CLI_GUIDE.md
│   ├── MIDI_VISUAL_GUIDE.md
│   └── *.md                  # All CLI-related docs
├── build-deployment/         # Build and deployment docs
│   ├── README.md
│   ├── BUILD_SUMMARY.md      # Build status and metrics
│   └── CONTRIBUTING.md       # Development guidelines
├── technical/                # Technical documentation
│   ├── ACT_USAGE.md
│   ├── BRANCH_COMPARISON.md
│   ├── ARCHITECTURE.md
│   └── *.md
└── user-guides/              # End-user documentation
    ├── FEATURES.md
    ├── LOGIN_SYSTEM.md
    ├── EXCEL_GUIDE.md
    ├── PWA-SETUP.md
    └── *.md
```

## Infrastructure (`infra/`)

```
infra/
├── main.tf                   # Main Terraform configuration
├── variables.tf              # Infrastructure variables
├── outputs.tf                # Infrastructure outputs
├── backend.tf                # Terraform backend config
├── terraform.tfvars.example  # Example variables
├── schema-extensions.sql     # Database schema
├── *.sh                      # Infrastructure scripts
└── VM_SETUP.md               # VM setup documentation
```

## Scripts (`scripts/`)

```
scripts/
├── deploy.sh                 # Main deployment script
├── deploy-pwa.sh             # PWA deployment
├── run-local.sh              # Local development
├── verify-sso.sh             # SSO verification
├── unlock-terraform.sh       # Terraform utilities
├── midi-demos/               # MIDI demonstration scripts
│   ├── README.md
│   ├── demo-interactive.sh
│   ├── launch_deep_techno.sh
│   └── cleanup.sh
└── testing/                  # Testing scripts
    ├── README.md
    ├── test_interactive.sh
    └── test-cicd-local.sh
```

## GitHub Workflows (`.github/workflows/`)

```
.github/workflows/
├── deploy.yml                # Production deployment
├── test.yml                  # Test automation
├── code-quality.yml          # Linting and quality checks
├── deploy-music-app.yml      # Music features deployment
└── *.yml                     # Other workflows
```

## Quick Navigation

### For Developers
- **Getting Started**: `docs/build-deployment/CONTRIBUTING.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **API Documentation**: `docs/technical/`
- **Testing**: `scripts/testing/` and `app/test/`

### For Users
- **User Guides**: `docs/user-guides/`
- **Feature Documentation**: `docs/user-guides/FEATURES.md`
- **Login System**: `docs/user-guides/LOGIN_SYSTEM.md`
- **Excel Guide**: `docs/user-guides/EXCEL_GUIDE.md`

### For DevOps
- **Infrastructure**: `infra/`
- **CI/CD Workflows**: `.github/workflows/`
- **Deployment Scripts**: `scripts/`
- **Build Summary**: `docs/build-deployment/BUILD_SUMMARY.md`

### For Music Production
- **Ableton CLI**: `app/ableton-cli/`
- **CLI Documentation**: `docs/ableton-cli/`
- **MIDI Demos**: `scripts/midi-demos/`
- **Synthesizer Guide**: `docs/ableton-cli/SYNTH2600_CLI_GUIDE.md`

## File Naming Conventions

- **README.md** - Directory overview and navigation
- **INDEX.md** - Comprehensive index of documentation
- **GUIDE.md** - Step-by-step tutorials
- ***.test.js** - Jest test files
- ***.routes.js** - Express route handlers
- **deploy-*.sh** - Deployment automation scripts
