# Deployment Configuration

This directory contains deployment configuration files for the haos.fm platform.

## 📁 Directory Structure

```
deployment/
├── .env.production.example    # Production environment template
└── vercel/                   # Vercel deployment
    └── vercel.json          # Vercel configuration
```

**Note:** Docker files are located in the project root for CI/CD compatibility:
- `Dockerfile` - Main production container
- `Dockerfile.dev` - Development container
- `Dockerfile.music` - Music processing container
- `Dockerfile.production` - Production variant

## 🐳 Docker Deployments

### Development
```bash
docker build -f Dockerfile.dev -t haos-fm:dev .
docker run -p 3000:3000 haos-fm:dev
```

### Production
```bash
docker build -f Dockerfile.production -t haos-fm:latest .
docker run -p 3000:3000 -e NODE_ENV=production haos-fm:latest
```

### Music Processing
```bash
docker build -f Dockerfile.music -t haos-fm:music .
```

## ☁️ Vercel Deployment

```bash
# Deploy using vercel.json config
vercel --prod
```

The `vercel/vercel.json` includes:
- Security headers (XSS, CSRF protection)
- Caching rules for static assets
- CORS configuration
- API routing

## 🔐 Environment Variables

Copy `.env.production.example` and fill in your values:

```bash
cp .env.production.example .env.production
# Edit .env.production with your actual values
```

**Required Variables**:
- `DATABASE_HOST` - PostgreSQL server
- `DATABASE_PASSWORD` - Database password
- `SESSION_SECRET` - Session encryption key

## 📖 Documentation

See deployment documentation:
- [Quick Start Guide](../docs/deployment/QUICKSTART_DEPLOYMENT.md)
- [Domain Registration Guide](../docs/deployment/DOMAIN_REGISTRATION_GUIDE.md)

## 🔗 Related

- [Scripts](../scripts/) - Deployment automation scripts
- [Infrastructure](../infra/) - Terraform configurations
