# Project Structure - haos.fm
**Version**: 2.7.1  
**Last Updated**: November 23, 2025  
**Status**: ✅ REORGANIZED & OPTIMIZED

---

## 📁 New Directory Structure

```
azure-psql-app/
├── 📱 app/                          # Main application code
│   ├── server.js                   # Express server
│   ├── app.js                      # Application logic
│   ├── package.json                # App dependencies
│   ├── public/                     # Static files (HTML, CSS, JS)
│   │   ├── index.html             # Landing page with dark mode
│   │   ├── trap-studio.html       # Trap Studio with mode toggle
│   │   ├── techno-creator.html    # Techno Creator
│   │   ├── radio.html             # Radio 24/7
│   │   └── ...                    # 40+ other HTML files
│   ├── routes/                     # API routes
│   ├── utils/                      # Utility functions
│   ├── config/                     # App configuration
│   └── test/                       # Application tests
│
├── 🚀 deployment/                   # Deployment configurations
│   ├── README.md                   # Deployment guide
│   ├── .env.production.example    # Production env template
│   ├── docker/                     # Docker configurations
│   │   ├── Dockerfile.dev         # Development container
│   │   ├── Dockerfile.music       # Music processing
│   │   └── Dockerfile.production  # Production container
│   └── vercel/                     # Vercel deployment
│       └── vercel.json            # Vercel config
│
├── 📚 docs/                         # Documentation
│   ├── ARCHITECTURE.md             # System architecture
│   ├── TESTING_GUIDE.md            # Testing documentation
│   ├── deployment/                 # Deployment docs
│   │   ├── README.md
│   │   ├── DOMAIN_REGISTRATION_GUIDE.md
│   │   └── QUICKSTART_DEPLOYMENT.md
│   ├── guides/                     # User guides
│   │   ├── README.md
│   │   ├── MODE_SWITCHING_GUIDE.md
│   │   ├── UI_UX_CHANGELOG.md
│   │   ├── DRUM_PATTERNS_GUIDE.md
│   │   └── ...
│   ├── build-deployment/           # Build documentation
│   └── meta/                       # Project metadata
│
├── 🛠️ scripts/                      # Automation scripts
│   ├── deploy-vercel.sh           # Vercel deployment
│   ├── deploy.sh                  # Multi-platform deploy
│   └── ...
│
├── ☁️ infra/                        # Infrastructure as Code
│   ├── main.tf                    # Terraform main
│   ├── backend.tf                 # Backend configuration
│   └── ...
│
├── 🎵 music-tf/                     # Music-specific infrastructure
│
├── ⚙️ config/                       # Global configuration
│
├── 📄 Root Files                    # Root-level files
│   ├── README.md                  # Main README
│   ├── FEATURE_TEST_REPORT.md     # Feature testing
│   ├── SYSTEM_VERIFICATION_REPORT.md
│   ├── UI_TEST_REPORT.md          # UI testing (new)
│   ├── Makefile                   # Build automation
│   ├── .gitignore                 # Git ignore rules
│   └── package.json               # Root dependencies
│
└── 🗑️ Removed/Reorganized
    ├── Dockerfile → deployment/docker/Dockerfile.dev
    ├── Dockerfile.production → deployment/docker/
    ├── vercel.json → deployment/vercel/
    └── *.md guides → docs/guides/ or docs/deployment/
```

---

## 📊 File Organization Changes

### ✅ What We Organized

#### 1. Deployment Files → `deployment/`
**Before**: Root directory cluttered
```
Dockerfile
Dockerfile.music
Dockerfile.production
vercel.json
.env.production.example
```

**After**: Organized structure
```
deployment/
├── docker/
│   ├── Dockerfile.dev
│   ├── Dockerfile.music
│   └── Dockerfile.production
├── vercel/
│   └── vercel.json
└── .env.production.example
```

#### 2. Documentation → `docs/`
**Before**: 30+ markdown files in root
**After**: Categorized documentation
```
docs/
├── deployment/           # Deployment guides
│   ├── DOMAIN_REGISTRATION_GUIDE.md
│   └── QUICKSTART_DEPLOYMENT.md
├── guides/              # User guides
│   ├── MODE_SWITCHING_GUIDE.md
│   ├── UI_UX_CHANGELOG.md
│   ├── DRUM_PATTERNS_GUIDE.md
│   └── ...
└── [existing technical docs]
```

#### 3. New READMEs Added
- `deployment/README.md` - Deployment guide
- `docs/deployment/README.md` - Deployment docs index
- `docs/guides/README.md` - User guides index

---

## 🗂️ Configuration Files Location

### Application Config
```
app/
└── config/
    ├── database.js        # Database configuration
    ├── session.js         # Session configuration
    └── features.js        # Feature flags
```

### Deployment Config
```
deployment/
├── .env.production.example    # Production environment template
├── docker/                    # Docker configurations
└── vercel/                    # Vercel configuration
```

### Infrastructure Config
```
infra/
├── main.tf               # Terraform main configuration
├── backend.tf            # Backend state configuration
├── variables.tf          # Variable definitions
└── terraform.tfvars      # Variable values (gitignored)
```

---

## 📝 Documentation Index

### 🚀 Deployment Documentation
Located in `docs/deployment/`

| File | Purpose |
|------|---------|
| `DOMAIN_REGISTRATION_GUIDE.md` | Complete domain registration guide |
| `QUICKSTART_DEPLOYMENT.md` | Quick deployment (35 min) |

### 📖 User Guides
Located in `docs/guides/`

| File | Purpose |
|------|---------|
| `MODE_SWITCHING_GUIDE.md` | Advanced/Basic mode documentation |
| `UI_UX_CHANGELOG.md` | UI/UX changes log |
| `UI_SIMPLIFICATION_GUIDE.md` | UI simplification features |
| `DRUM_PATTERNS_GUIDE.md` | Drum pattern creation |
| `ARRANGEMENT_BEAT_GENERATOR_GUIDE.md` | Beat generation |
| `COLLABORATIVE_RECORDING_GUIDE.md` | Collaboration features |

### 🧪 Testing Documentation
Located in root (main reports)

| File | Purpose |
|------|---------|
| `FEATURE_TEST_REPORT.md` | Feature testing results |
| `SYSTEM_VERIFICATION_REPORT.md` | System verification |
| `UI_TEST_REPORT.md` | UI/UX testing (new) |

### 🏗️ Technical Documentation
Located in `docs/`

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | System architecture |
| `TESTING_GUIDE.md` | Testing guidelines |
| `PROJECT_STRUCTURE.md` | Project structure |
| `DIRECTORY_STRUCTURE.md` | Directory layout |

---

## 🔧 Configuration Files Reference

### Environment Variables

**Development** (`.env`):
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/musicapp
```

**Production** (`deployment/.env.production.example`):
```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=your-postgres.azure.com
DATABASE_PASSWORD=your-secure-password
SESSION_SECRET=your-random-secret
DOMAIN=haos.fm
```

### Docker

**Development** (`deployment/docker/Dockerfile.dev`):
- Node.js 18 Alpine
- Hot reload enabled
- Volume mounts for development

**Production** (`deployment/docker/Dockerfile.production`):
- Multi-stage build
- Optimized image size
- Health checks
- Non-root user
- Production dependencies only

### Vercel

**Configuration** (`deployment/vercel/vercel.json`):
- Security headers (XSS, CSRF)
- Caching rules
- CORS configuration
- API routing
- Static file serving

---

## 📦 Package Management

### Root `package.json`
- Global build tools
- Linting and formatting
- Testing frameworks
- Deployment scripts

### App `app/package.json`
- Express and middleware
- Database drivers
- Authentication
- Music processing libraries

---

## 🎯 Clean Structure Benefits

### ✅ Improved Organization
- Clear separation of concerns
- Easy to find configuration files
- Logical grouping of documentation

### ✅ Better Developer Experience
- Reduced root directory clutter
- Intuitive file locations
- Clear README files at each level

### ✅ Easier Maintenance
- Deployment configs in one place
- Documentation categorized
- Simpler file navigation

### ✅ Scalability
- Easy to add new deployment methods
- Room for additional documentation
- Structured for growth

---

## 🚀 Quick Access

### Deploy the App
```bash
# Vercel
./scripts/deploy-vercel.sh

# Docker
docker build -f deployment/docker/Dockerfile.production -t haos-fm .

# Azure
# See docs/deployment/DOMAIN_REGISTRATION_GUIDE.md
```

### Run Locally
```bash
cd app
npm install
npm start
# Visit http://localhost:3000
```

### Run Tests
```bash
cd app
npm test
```

---

## 📋 Migration Checklist

### ✅ Completed
- [x] Moved Docker files to `deployment/docker/`
- [x] Moved Vercel config to `deployment/vercel/`
- [x] Moved deployment guides to `docs/deployment/`
- [x] Moved user guides to `docs/guides/`
- [x] Created README files for new directories
- [x] Updated structure documentation

### ⏳ Not Required
- [ ] Update CI/CD paths (if using GitHub Actions)
- [ ] Update deployment scripts with new paths
- [ ] Update Makefile references (if needed)

---

## 🔗 Related Documentation

- [Main README](../README.md)
- [Deployment Guide](docs/deployment/README.md)
- [User Guides Index](docs/guides/README.md)
- [Architecture Documentation](docs/ARCHITECTURE.md)

---

## 📝 Notes

**Git History**: All files moved with `git mv` to preserve history

**Backwards Compatibility**: 
- Symlinks can be added if needed
- Update any hardcoded paths in scripts

**Future Improvements**:
- Consider moving more root-level docs to `docs/`
- Add `docs/api/` for API documentation
- Create `docs/tutorials/` for step-by-step guides

---

**Structure Version**: 2.0  
**Last Reorganization**: November 23, 2025  
**Status**: ✅ COMPLETE & TESTED
