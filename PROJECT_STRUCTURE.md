# Project Structure

## Core Components (Root Level)

```
azure-psql-app/
├── Makefile                  # Project automation and build commands
├── README.md                 # Project overview
├── BUILD_SUMMARY.md          # Build status and deployment guide
├── CONTRIBUTING.md           # Contribution guidelines
├── AUTHORS                   # Project contributors
├── .env.template             # Environment variables template
├── .gitignore               # Git ignore patterns
│
├── app/                      # Core Application (Node.js/Express)
│   ├── server.js            # Main entry point
│   ├── app.js               # Express configuration
│   ├── package.json         # Dependencies
│   ├── auth/                # Authentication (SSO)
│   ├── routes/              # API endpoints
│   ├── public/              # Frontend assets
│   ├── config/              # Configuration
│   ├── utils/               # Utilities
│   ├── test/                # Test suites
│   └── ableton-cli/         # Music production CLI (side function)
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md      # System architecture
│   ├── DIRECTORY_STRUCTURE.md
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

### Side Functions (Optional)
- **app/ableton-cli/** - Music production tools
- **music-tf/** - Music VM infrastructure
- **scripts/midi-demos/** - Music demonstrations
- **test-midi-preview.py** - MIDI preview utility
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
python test-midi-preview.py
```

## Environment Setup

1. Copy environment template:
   ```bash
   cp .env.template .env
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
| `.env.template` | Environment variables reference |
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
