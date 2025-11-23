# Deployment Documentation

This directory contains all documentation related to deploying the haos.fm music production platform.

## 📚 Available Guides

### Quick Start
- **[QUICKSTART_DEPLOYMENT.md](./QUICKSTART_DEPLOYMENT.md)** - Fast-track deployment guide (35 minutes to live)

### Domain & Hosting
- **[DOMAIN_REGISTRATION_GUIDE.md](./DOMAIN_REGISTRATION_GUIDE.md)** - Comprehensive domain registration and hosting setup

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)
```bash
npm install -g vercel
vercel --prod
```
See: `QUICKSTART_DEPLOYMENT.md`

### Option 2: Azure App Service
See: `DOMAIN_REGISTRATION_GUIDE.md` → Azure Deployment section

### Option 3: Docker
```bash
docker build -f ../../deployment/docker/Dockerfile.production -t haos-fm .
```

## 📁 Related Files

**Configuration Files**:
- `../../deployment/vercel/vercel.json` - Vercel deployment configuration
- `../../deployment/.env.production.example` - Production environment template
- `../../deployment/docker/` - Docker configurations

**Scripts**:
- `../../scripts/deploy-vercel.sh` - Automated Vercel deployment
- `../../scripts/deploy.sh` - Multi-platform deployment script

## 🔗 Quick Links

- [Back to Main README](../../README.md)
- [Architecture Documentation](../ARCHITECTURE.md)
- [Testing Guide](../TESTING_GUIDE.md)
