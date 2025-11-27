# Try Run - Quick Deployment Guide

Fast deployment workflow for rapid iteration without full app rebuilds.

## 🚀 Quick Start

### Option 1: Using the Script (Recommended)
```bash
./scripts/try-run.sh
```

The script will:
1. Show uncommitted changes
2. Prompt for commit message
3. Stage and commit changes
4. Push to GitHub
5. Ask if you want to trigger deployment
6. Show deployment status

### Option 2: Manual Workflow Trigger

1. Commit and push your changes:
```bash
git add -A
git commit -m "your message"
git push origin your-branch
```

2. Go to GitHub Actions:
   - https://github.com/YOUR_REPO/actions
   - Click "Try Run - Quick Deploy"
   - Click "Run workflow"
   - Select your branch
   - Choose deployment type:
     - **Quick Deploy**: `skip_build = true` (~1-2 min)
     - **Full Deploy**: `skip_build = false` (~5-10 min)

### Option 3: Using GitHub CLI
```bash
# Quick deploy (no build)
gh workflow run try-run.yml --ref feat/tracks -f skip_build=true

# Full deploy (with build)
gh workflow run try-run.yml --ref feat/tracks -f skip_build=false

# Watch deployment status
gh run watch
```

## ⚡ Deployment Types

### Quick Deploy (skip_build = true)
- **Speed**: 1-2 minutes
- **Use case**: UI/HTML/CSS/JS changes
- **Skips**: npm install, npm build
- **Syncs**: All files directly to Azure

### Full Deploy (skip_build = false)
- **Speed**: 5-10 minutes
- **Use case**: Package changes, dependencies, build process updates
- **Runs**: npm ci, npm build
- **Deploys**: Full application with fresh build

## 🎯 Common Workflows

### Quick UI Iteration
```bash
# Edit haos-platform.html or audio-engine.js
./scripts/try-run.sh
# Select option 1 (Quick Deploy)
# Wait 2 minutes, refresh browser
```

### Testing Radio Studio
```bash
# Make changes to Radio Studio code
./scripts/try-run.sh
# Commit: "fix(radio): update visualizer colors"
# Quick Deploy
# Visit: https://notesapp-dev-music-app.azurewebsites.net/haos-platform.html
```

### Package Updates
```bash
# Update package.json
./scripts/try-run.sh
# Commit: "chore: update dependencies"
# Full Deploy (option 2)
```

## 📊 Monitoring Deployments

### GitHub Actions UI
- https://github.com/YOUR_REPO/actions
- Real-time logs and status

### GitHub CLI
```bash
# List recent runs
gh run list --workflow=try-run.yml

# Watch latest run
gh run watch

# View logs
gh run view
```

### Azure Portal
- https://portal.azure.com
- App Service: notesapp-dev-music-app
- Deployment Center → Logs

## 🔧 Advanced Options

### Deploy Specific Files Only
```bash
gh workflow run try-run.yml \
    --ref feat/tracks \
    -f skip_build=true \
    -f deploy_only_files="app/public/haos-platform.html,app/public/js/haos-audio-engine.js"
```

### Environment Variables
The workflow uses:
- `AZURE_WEBAPP_PUBLISH_PROFILE` - Azure Web App credentials
- Set in: GitHub repo → Settings → Secrets → Actions

## 📝 Workflow Configuration

Location: `.github/workflows/try-run.yml`

Inputs:
- `skip_build`: Skip npm install/build (default: true)
- `deploy_only_files`: Comma-separated file paths (optional)

## 🐛 Troubleshooting

### Script says "gh not installed"
```bash
# macOS
brew install gh
gh auth login

# Or trigger manually via GitHub Actions UI
```

### Deployment slow even with skip_build=true
- Azure Web App restart can take 1-2 minutes
- First deployment after app sleep takes longer
- Subsequent deploys should be faster

### Changes not appearing
- Wait 2-3 minutes for Azure to restart
- Hard refresh browser: Cmd+Shift+R (macOS)
- Check deployment logs in Azure Portal
- Verify correct branch was deployed

### Build fails with skip_build=false
- Check `app/package.json` for errors
- Verify Node.js version compatibility (uses v18)
- Review GitHub Actions logs

## 💡 Best Practices

1. **Use Quick Deploy for**:
   - HTML/CSS/JS changes
   - UI tweaks and visual updates
   - Radio Studio enhancements
   - Preset modifications

2. **Use Full Deploy for**:
   - New npm packages
   - package.json updates
   - Build script changes
   - Major refactors

3. **Commit Messages**:
   ```
   fix(radio): adjust visualizer bar spacing
   feat(tb303): add new acid preset
   style(ui): update button hover colors
   ```

4. **Test Locally First**:
   - Open `haos-platform.html` in browser
   - Verify functionality works
   - Then deploy to Azure

## 🔗 Links

- **App**: https://notesapp-dev-music-app.azurewebsites.net/haos-platform.html
- **GitHub Actions**: https://github.com/YOUR_REPO/actions
- **Azure Portal**: https://portal.azure.com

## 📦 Files Changed in This Setup

```
.github/workflows/try-run.yml    # GitHub Actions workflow
scripts/try-run.sh               # Local deployment script
docs/TRY_RUN_GUIDE.md           # This guide
```

## 🎉 Example Session

```bash
$ ./scripts/try-run.sh

🚀 Try Run - Quick Deploy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Uncommitted changes detected

Changed files:
 M app/public/haos-platform.html

Enter commit message: fix(radio): update visualizer colors

📦 Staging changes...
💾 Committing changes...
✅ Changes committed

⬆️  Pushing to origin/feat/tracks...
✅ Pushed successfully

📌 Latest commit: a1b2c3d

Deployment Options:
  1) Quick Deploy (skip build, ~1-2 min)
  2) Full Deploy (with build, ~5-10 min)
  3) Skip deployment

Select option [1-3]: 1

🚀 Triggering Quick Deploy workflow...
⏱️  This will take approximately 1-2 minutes

✅ Workflow triggered successfully

📊 View workflow status:
   gh run watch

🌐 App URL:
   https://notesapp-dev-music-app.azurewebsites.net/haos-platform.html

⏳ Wait 2-3 minutes then refresh the app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Try Run Complete!
```
