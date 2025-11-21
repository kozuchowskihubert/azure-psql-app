# Azure PostgreSQL Application

[![CI Tests](https://github.com/kozuchowskihubert/azure-psql-app/workflows/CI%20Tests/badge.svg)](https://github.com/kozuchowskihubert/azure-psql-app/actions)
[![Code Quality](https://github.com/kozuchowskihubert/azure-psql-app/workflows/Code%20Quality/badge.svg)](https://github.com/kozuchowskihubert/azure-psql-app/actions)
[![Deploy](https://github.com/kozuchowskihubert/azure-psql-app/workflows/Deploy%20to%20Azure/badge.svg)](https://github.com/kozuchowskihubert/azure-psql-app/actions)
[![Azure](https://img.shields.io/badge/Azure-Production-blue)](https://azure.microsoft.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)

A full-stack web application with collaborative note-taking, Excel data processing, and music production capabilities. Built with Node.js, Express, PostgreSQL, and deployed on Azure.

**🌐 Live**: [notesapp-dev-app.azurewebsites.net](https://notesapp-dev-app.azurewebsites.net)

---

## 🚀 Quick Start

### Using Make (Recommended)

```bash
# Install dependencies
make install

# Start development server
make dev

# Run tests
make test-all

# Build for production
make build

# Deploy
make deploy-dev
```

### Manual Setup

```bash
# Install core dependencies
cd app && npm install

# Start development server
npm run dev

# Run tests
npm test

# Build production
npm run build
```

### Environment Configuration

```bash
# Copy environment template
cp .env.template .env

# Edit .env with your configuration
# Required: DATABASE_URL, SESSION_SECRET
# Optional: AZURE_*, GOOGLE_* for SSO
```

---

## 📋 Features

### Core Application
- **Collaborative Notes** - Real-time co-editing with Y.js CRDT
- **Excel Workspace** - Client-side spreadsheet processing (no server uploads)
- **Authentication** - Azure AD and Google OAuth SSO
- **PWA Support** - Offline-capable Progressive Web App
- **Calendar & Meetings** - Scheduling and collaboration tools
- **File Sharing** - Secure document collaboration

### Music Production (Side Functions)
- **MIDI Generation** - Deep techno track creation
- **Ableton Integration** - Template and project generation
- **Behringer 2600 CLI** - Synthesizer control interface
- **Audio Processing** - Web Audio API synthesis

---

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Database**: PostgreSQL (Azure Database)
- **Real-time**: WebSocket (ws), Y.js CRDT
- **Authentication**: Passport.js (Azure AD, Google OAuth)

### Frontend
- **Core**: Vanilla JavaScript
- **UI**: Semantic HTML5, CSS Grid/Flexbox
- **PWA**: Service Worker, IndexedDB
- **Audio**: Web Audio API
- **Visualization**: Canvas API

### Infrastructure
- **Cloud**: Microsoft Azure
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Containers**: Docker
- **Monitoring**: Azure Application Insights

### Music Production
- **MIDI**: mido (Python)
- **Synthesis**: Web Audio API
- **CLI**: Python 3.x

---

## 📁 Project Structure

```
azure-psql-app/
├── Makefile              # Build automation
├── app/                  # Core application
│   ├── server.js        # Main entry point
│   ├── routes/          # API endpoints
│   ├── public/          # Frontend
│   └── ableton-cli/     # Music production
├── infra/               # Terraform IaC
├── docs/                # Documentation
├── scripts/             # Utility scripts
└── .github/workflows/   # CI/CD pipelines
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed layout.

---

## 🧪 Testing

```bash
# Run all tests
make test-all

# Smoke tests only
make test-smoke

# With coverage
cd app && npm test

# Lint code
make lint

# Auto-fix lint issues
make lint-fix
```

---

## 🚢 Deployment

### Azure App Service (Automated)

Push to `main` branch triggers automatic deployment:

```bash
git push origin main
```

### Manual Deployment

```bash
# Deploy to development
make deploy-dev

# Deploy PWA updates
make deploy-pwa

# Test locally
make deploy-local
```

### Infrastructure

```bash
# Initialize Terraform
make infra-init

# Plan changes
make infra-plan

# Apply infrastructure
make infra-apply
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Project layout and organization |
| [BUILD_SUMMARY.md](BUILD_SUMMARY.md) | Build status and deployment guide |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development guidelines |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/ableton-cli/](docs/ableton-cli/) | Music production documentation |

---

## 🎵 Music Production (Optional)

The application includes optional music production features:

```bash
# Install music dependencies
make music-install

# Generate MIDI files
make music-generate-midi

# Create Ableton template
make music-generate-template

# Launch Synth 2600 CLI
make music-synth2600

# Run MIDI demo
make music-demo
```

---

## 🛠️ Development

### Prerequisites
- Node.js 18.x
- PostgreSQL 14+
- Docker (optional)
- Python 3.x (for music features)

### Local Development

```bash
# Clone repository
git clone https://github.com/kozuchowskihubert/azure-psql-app.git
cd azure-psql-app

# Setup environment
cp .env.template .env

# Install dependencies
make install

# Start development server
make dev
```

### Database Setup

```bash
# Run migrations
make db-migrate

# Initialize schema
make db-init
```

### Docker Development

```bash
# Build image
make docker-build

# Run container
make docker-run
```

---

## 📊 Make Commands

```bash
make help              # Show all available commands
make setup             # Complete setup (core + music)
make test-all          # Run all tests
make build-all         # Build everything
make clean-all         # Clean everything
make deploy-all        # Deploy all components
```

See `make help` for complete list of commands.

---

## 🔒 Security

- **Authentication**: OAuth 2.0 (Azure AD, Google)
- **Session Management**: Secure HTTP-only cookies
- **HTTPS**: Enforced in production
- **CORS**: Configured origin restrictions
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Sanitization and validation

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 👥 Contributors

See [AUTHORS](AUTHORS) file.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test-all`
5. Submit a pull request

---

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/kozuchowskihubert/azure-psql-app/issues)
- **CI/CD**: [GitHub Actions](https://github.com/kozuchowskihubert/azure-psql-app/actions)

---

**Built with Node.js, Express, PostgreSQL, and Azure** | **Deployed with Terraform and GitHub Actions**
