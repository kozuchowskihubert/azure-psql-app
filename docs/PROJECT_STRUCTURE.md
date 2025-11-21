# Project Structure

## Core Components (Root Level)

```
azure-psql-app/
├── Makefile                  # Project automation and build commands
├── README.md                 # Project overview
├── BUILD_SUMMARY.md          # Build status and deployment guide
├── CONTRIBUTING.md           # Contribution guidelines
├── .gitignore               # Git ignore patterns
│
├── config/                   # Configuration Files
│   ├── README.md            # Configuration guide
│   ├── .env.template        # Environment variables template
│   ├── .secrets.example     # Act secrets template
│   └── .actrc               # Act configuration
│
├── app/                      # Core Application (Node.js/Express)
│   ├── server.js            # Main entry point
│   ├── app.js               # Express configuration
│   ├── package.json         # Dependencies
│   ├── auth/                # Authentication (SSO)
│   ├── routes/              # API endpoints
│   ├── public/              # Frontend assets
│   ├── config/              # Application configuration
│   ├── utils/               # Utilities
│   ├── test/                # Test suites
│   └── ableton-cli/         # Music production CLI (side function)
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md      # System architecture
│   ├── PROJECT_STRUCTURE.md # This file
│   ├── DIRECTORY_STRUCTURE.md
│   ├── meta/                # Project metadata
│   │   └── AUTHORS          # Project contributors
│   ├── ableton-cli/         # Music CLI documentation
│   ├── technical/           # Technical specs
│   └── user-guides/         # User documentation
│
├── infra/                    # Infrastructure as Code
│   ├── main.tf              # Terraform main configuration
│   ├── variables.tf         # Terraform variables
│   ├── outputs.tf           # Terraform outputs
│   └── *.sh                 # Infrastructure scripts
│
├── scripts/                  # Utility Scripts
│   ├── deploy.sh            # Deployment script
│   ├── deploy-pwa.sh        # PWA deployment
│   ├── run-local.sh         # Local testing
│   ├── music/               # Music utilities (side function)
│   │   └── test-midi-preview.py  # MIDI preview utility
│   ├── midi-demos/          # Music demos (side function)
│   └── testing/             # Test utilities
│
├── .github/                  # GitHub Configuration
│   └── workflows/           # CI/CD pipelines
│
└── music-tf/                 # Music Infrastructure (side function)
    └── *.tf                 # Music VM Terraform
```

## Core vs Side Functions

### Core Functions (Primary)
- **app/** - Main web application
- **infra/** - Core infrastructure
- **scripts/deploy*.sh** - Deployment automation
- **.github/workflows/** - CI/CD pipelines
- **docs/** - Documentation
- **config/** - Configuration management

### Side Functions (Optional)
- **app/ableton-cli/** - Music production tools
- **music-tf/** - Music VM infrastructure
- **scripts/midi-demos/** - Music demonstrations
- **scripts/music/test-midi-preview.py** - MIDI preview utility
- **Dockerfile.music** - Music container

## Quick Start

### Using Make (Recommended)

```bash
# See all available commands
make help

# Setup everything
make setup

# Development
make dev

# Testing
make test-all

# Build & Deploy
make build
make deploy-dev

# Music production (side function)
make music-install
make music-generate-midi
```

### Manual Commands

```bash
# Core application
cd app && npm install
cd app && npm run dev
cd app && npm test

# Music production (optional)
cd app/ableton-cli && pip install -r requirements.txt
python scripts/music/test-midi-preview.py
```

## Environment Setup

1. Copy environment template:
   ```bash
   cp config/.env.template .env
   ```

2. Configure required variables in `.env`

3. Run setup:
   ```bash
   make setup
   ```

## Documentation

- **Architecture**: `docs/ARCHITECTURE.md`
- **Build Guide**: `BUILD_SUMMARY.md`
- **Contributing**: `CONTRIBUTING.md`
- **Directory Layout**: `docs/DIRECTORY_STRUCTURE.md`
- **Music CLI**: `docs/ableton-cli/INDEX.md`

## Key Files

| File | Purpose |
|------|---------|
| `Makefile` | Project automation |
| `README.md` | Project overview |
| `BUILD_SUMMARY.md` | Build and deployment status |
| `CONTRIBUTING.md` | Development guidelines |
| `config/.env.template` | Environment variables reference |
| `config/.actrc` | Act (local CI/CD) configuration |
| `config/.secrets.example` | Act secrets template |
| `docs/meta/AUTHORS` | Project contributors |
| `Dockerfile` | Main application container |
| `Dockerfile.music` | Music application container |

## Technology Stack

### Core
- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: Vanilla JS, PWA
- **Infrastructure**: Azure (App Service, PostgreSQL, VM)
- **IaC**: Terraform
- **CI/CD**: GitHub Actions

### Side Functions
- **Music**: Python, MIDI, Ableton Live
- **Synth**: Behringer 2600 CLI interface
