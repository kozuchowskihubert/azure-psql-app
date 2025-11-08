```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    🚀 AZURE POSTGRESQL APPLICATION                          ║
║                     Production-Ready Cloud Deployment                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 📁 Project Structure

This repository contains the **Azure PostgreSQL Notes Application** - a production-ready, containerized Node.js application with full infrastructure automation.

```
Projects/
├── azure-psql-app/          ← 🎯 MAIN PROJECT DIRECTORY
│   ├── app/                 # Node.js application
│   ├── infra/               # Terraform infrastructure
│   ├── scripts/             # Deployment automation
│   ├── docs/                # Comprehensive documentation
│   └── .github/workflows/   # CI/CD pipelines
├── makefile                 # Build automation
└── README.md                # This file
```

---

## 🎯 Quick Start

### Navigate to Main Project

```bash
cd azure-psql-app
```

### Local Development

```bash
# View all available commands
make help

# Run application locally
./scripts/run-local.sh
```

### Production Deployment

```bash
# Full deployment (infrastructure + application)
./scripts/deploy.sh all

# Infrastructure only
./scripts/deploy.sh infra

# Application only (Docker image)
./scripts/deploy.sh image
```

---

## 📚 Documentation

All comprehensive documentation is located in the **\`azure-psql-app/\`** directory:

| Document | Description | Location |
|----------|-------------|----------|
| **Main README** | Project overview and quick start | \`azure-psql-app/README.md\` |
| **Architecture** | System design and diagrams | \`azure-psql-app/docs/ARCHITECTURE.md\` |
| **Deployment Guide** | Step-by-step deployment | \`azure-psql-app/docs/DEPLOYMENT.md\` |
| **Troubleshooting** | Common issues and solutions | \`azure-psql-app/docs/TROUBLESHOOTING.md\` |
| **Production Guide** | Production deployment workflow | \`azure-psql-app/.github/PRODUCTION_DEPLOYMENT_GUIDE.md\` |
| **Secrets Setup** | GitHub secrets configuration | \`azure-psql-app/.github/SECRETS_SETUP.md\` |
| **Act Usage** | Local CI/CD testing | \`azure-psql-app/docs/ACT_USAGE.md\` |

---

## 🛠️ Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND       │  Node.js 20 + Express.js                  │
│  DATABASE       │  Azure PostgreSQL Flexible Server         │
│  CONTAINER      │  Docker + Azure Container Registry        │
│  HOSTING        │  Azure App Service (Linux)                │
│  INFRASTRUCTURE │  Terraform 1.5+                           │
│  CI/CD          │  GitHub Actions                           │
│  REGION         │  West Europe                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 CI/CD Pipeline

The project uses GitHub Actions for automated deployment:

- **Workflow**: \`.github/workflows/deploy-azure-infrastructure.yml\`
- **Stages**: Validate → Build → Deploy Infrastructure → Deploy App → Verify → Notify
- **Triggers**: Push to main, Pull requests, Manual dispatch

### Test Locally Before Pushing

```bash
# Option 1: Fast deployment (5-10 min)
./scripts/deploy.sh all

# Option 2: Simulate CI/CD (~15-30 min, 95% accuracy)
./scripts/test-cicd-local.sh all

# Option 3: Run actual GitHub Actions (20-35 min, 100% accuracy)
./scripts/run-act.sh all
```

---

## 📊 Project Status

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  STATUS: ✅ PRODUCTION READY                              ║
║                                                            ║
║  ✅ Infrastructure as Code (Terraform)                    ║
║  ✅ Containerized Application (Docker)                    ║
║  ✅ CI/CD Pipeline (GitHub Actions)                       ║
║  ✅ Comprehensive Documentation (3,500+ lines)            ║
║  ✅ Local Testing Tools (3 options)                       ║
║  ✅ Production Deployment Guide                           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🔗 Quick Links

- **Application**: [kozuchowskihubert/azure-psql-app](https://github.com/kozuchowskihubert/azure-psql-app)
- **Azure Portal**: [portal.azure.com](https://portal.azure.com)
- **GitHub Actions**: [View Workflows](https://github.com/kozuchowskihubert/azure-psql-app/actions)

---

## 📝 Notes

- All active development happens in the **\`azure-psql-app/\`** subdirectory
- The root \`makefile\` provides convenient shortcuts to common tasks
- See \`azure-psql-app/README.md\` for detailed project information

---

<div align="center">

**Built with** ❤️ **for Azure Cloud**

[![Azure](https://img.shields.io/badge/Azure-Cloud-blue)](https://azure.microsoft.com/)
[![Terraform](https://img.shields.io/badge/Terraform-1.5+-purple)](https://www.terraform.io/)
[![Docker](https://img.shields.io/badge/Docker-Container-blue)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)

</div>
