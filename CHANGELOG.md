# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-21

### Added - Music Production Features 🎵

#### MIDI Generator & Visualizer
- Interactive MIDI generator with piano roll visualization
- 36-key virtual piano keyboard (C3-B5, 3 octaves)
- Real-time waveform visualizer (50 animated bars)
- Spectrum analyzer (32 frequency bars)
- Genre-specific MIDI pattern generation (Techno, House, Ambient)
- Velocity-based color visualization
- Export functionality (JSON and CSV formats)
- Piano roll preview with note names

#### Music Production Page
- Ableton Live Recordings browser integration
- CLI Studio interface for music generation
- Generate MIDI patterns (Deep/Minimal/Hard Techno)
- Generate Ableton templates
- Full workflow automation
- MIDI file download endpoints
- Preview MIDI files with Python mido parsing
- Project statistics dashboard

#### Navigation
- Cross-navigation between MIDI Generator and Music Projects
- Music production link in main navigation
- Improved user flow between music tools

#### Backend Improvements
- MIDI preview endpoint with Python mido library
- Music routes for CLI automation
- File download functionality for MIDI files
- Python script execution for MIDI parsing
- Genre-specific pattern generation API

#### Documentation
- MIDI Visualizer complete guide
- MIDI Visualizer features documentation
- Visual guide with ASCII art
- Executive summary and roadmap
- Architecture documentation
- Calendar SSO architecture guide

### Fixed
- pyautogui made optional for server environments
- Alpine Docker pip install with --break-system-packages flag
- Database connection handling in tests
- Process.exit prevention in test environments

### Security
- Python dependencies updated (mido >= 1.3.0, midiutil >= 1.2.1)
- Path traversal protection in MIDI preview
- File extension validation (.mid only)

### Performance
- Optimized MIDI parsing with Python subprocess
- Efficient piano roll rendering
- Animated visualizations with CSS keyframes

## [1.0.0] - 2025-11-20

### Added - Initial Stable Release
- Azure PostgreSQL database integration
- Express.js REST API
- Excel-like workspace interface
- Calendar integration
- Meeting management
- SSO authentication (Azure AD, Google)
- Login system with session management
- PWA support with offline capabilities
- Docker containerization
- Terraform infrastructure as code
- CI/CD pipelines with GitHub Actions
- Comprehensive testing suite
- ESLint code quality checks

### Infrastructure
- Azure App Service deployment (F1 Free tier)
- PostgreSQL Flexible Server (B_Standard_B1ms)
- Azure Container Registry (Basic tier)
- Virtual Network with subnets
- Private DNS Zone for PostgreSQL

### Security
- Helmet.js security headers
- Rate limiting
- CORS configuration
- Session encryption
- Password hashing with bcrypt

### Documentation
- README with setup instructions
- Deployment guide
- Troubleshooting guide
- Implementation guide
- User guides for features

---

## Release Notes - v1.1.0

### What's New 🎉

This release introduces comprehensive **music production capabilities** to the Notes App, transforming it into a creative platform for musicians and producers.

### Highlights

**🎹 Interactive MIDI Generator**
- Create music patterns with an intuitive piano roll interface
- Real-time visualization with waveform and spectrum analyzers
- Export your creations as MIDI, JSON, or CSV files

**🎵 Music Production Studio**
- Browse and manage Ableton Live recordings
- Generate MIDI patterns with a single click
- Automated workflow for complete track creation
- Support for multiple techno subgenres

**🔧 Developer-Friendly**
- Python backend for MIDI parsing and generation
- RESTful API for music production operations
- Comprehensive documentation and examples

### Breaking Changes
None. This release is fully backward compatible with v1.0.0.

### Migration Guide
No migration required. All new features are additive.

### Known Issues
- MIDI preview requires mido Python library (auto-installed in Docker)
- Large MIDI files (>100KB) may take longer to parse

### Upgrade Instructions

#### For Docker deployments:
```bash
git pull origin main
docker build -t azure-psql-app .
docker push <your-registry>/azure-psql-app:1.1.0
```

#### For Azure App Service:
The CI/CD pipeline will automatically deploy when you push to main.

#### For local development:
```bash
git pull origin main
cd app
npm install
cd ../app/ableton-cli
pip install -r requirements.txt
```

### Contributors
Thanks to all contributors who made this release possible!

### Next Steps
See [ROADMAP.md](docs/business/ROADMAP.md) for planned features in v1.2.0.

---

## Version History

- **v1.1.0** (2025-11-21) - Music Production Features
- **v1.0.0** (2025-11-20) - Initial Stable Release

[1.1.0]: https://github.com/kozuchowskihubert/azure-psql-app/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/kozuchowskihubert/azure-psql-app/releases/tag/v1.0.0
