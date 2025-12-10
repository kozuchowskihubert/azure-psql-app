# Feature Management Guide

Quick and efficient feature management without rebuilding the entire application.

## 🎯 Overview

This guide covers how to enable/disable features and manage configuration using:
- **GitHub Actions Workflow** - Remote management via web interface
- **Local Scripts** - Command-line management from your machine
- **Direct Azure CLI** - Manual configuration

## 🚀 Quick Start

### Method 1: GitHub Actions (Recommended)

1. **Go to Actions**:
   - Navigate to: https://github.com/kozuchowskihubert/azure-psql-app/actions
   - Select "Feature Management & Configuration"

2. **Run Workflow**:
   - Click "Run workflow"
   - Choose operation (dry-run, enable-features, etc.)
   - Select features to enable
   - Click "Run workflow"

3. **Operations**:
   - `dry-run` - Preview changes without applying
   - `enable-features` - Enable specific features
   - `update-config` - Update configuration settings
   - `restart-app` - Restart application
   - `view-current` - View current configuration

### Method 2: Local Script

```bash
# Enable features
./scripts/manage-features.sh enable haos-platform,sequencer

# Check status
./scripts/manage-features.sh status

# List current features
./scripts/manage-features.sh list

# Restart app
./scripts/manage-features.sh restart

# Get help
./scripts/manage-features.sh help
```

### Method 3: Direct Azure CLI

```bash
# Enable features
az webapp config appsettings set \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg \
  --settings ENABLED_FEATURES="haos-platform,sequencer"

# Restart
az webapp restart \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg
```

## 📋 Available Features

| Feature | Description | Dependencies |
|---------|-------------|--------------|
| `haos-platform` | TB-303, TR-909, Sequencer | Web Audio API |
| `radio-247` | 24/7 Radio streaming | None |
| `trap-studio` | Trap production tools | Web Audio API |
| `sequencer` | Advanced step sequencer | None |
| `modular-synth` | Modular synthesizer | Web Audio API |

## 🔍 Workflow Operations Explained

### Dry Run (Preview)
**What it does**: Shows what would change without applying changes

**When to use**:
- Before making changes to production
- To verify current configuration
- To preview feature combinations

**Example**:
```yaml
operation: dry-run
features: haos-platform,radio-247
environment: dev
```

**Output**:
- Current configuration
- Proposed changes
- No actual changes made

### Enable Features
**What it does**: Updates feature flags and optionally restarts app

**When to use**:
- Enabling new features
- Changing feature combinations
- Updating environment settings

**Example**:
```yaml
operation: enable-features
features: haos-platform,sequencer,trap-studio
environment: dev
node_env: production
log_level: info
restart_after: true
```

**What happens**:
1. Updates `ENABLED_FEATURES` environment variable
2. Updates `NODE_ENV`, `LOG_LEVEL`, etc.
3. Restarts application (if requested)
4. Performs health check
5. Reports success/failure

### Update Config
**What it does**: Updates all configuration settings at once

**When to use**:
- Comprehensive configuration changes
- Port or runtime settings
- Log retention changes

**Example**:
```yaml
operation: update-config
features: haos-platform
node_env: production
log_level: debug
restart_after: true
```

**Settings updated**:
- `PORT` and `WEBSITES_PORT`
- `NODE_ENV`
- `LOG_LEVEL`
- `ENABLED_FEATURES`
- `WEBSITES_CONTAINER_START_TIME_LIMIT`
- `WEBSITE_HTTPLOGGING_RETENTION_DAYS`

### Restart App
**What it does**: Simple application restart

**When to use**:
- App is unresponsive
- After manual configuration changes
- To apply existing config changes

**Example**:
```yaml
operation: restart-app
```

**What happens**:
1. Restarts Azure Web App
2. Waits 30 seconds
3. Performs health check

### View Current
**What it does**: Shows current configuration without changes

**When to use**:
- Checking what's currently enabled
- Verifying deployment status
- Troubleshooting

**Example**:
```yaml
operation: view-current
```

**Shows**:
- All app settings
- Application state
- Scale tier and instances
- Default hostname

## 💡 Usage Examples

### Example 1: Safe Production Update

```bash
# Step 1: Preview changes (dry run)
# Run workflow with operation: dry-run
# Review proposed changes

# Step 2: Apply to staging first
# Run workflow with:
#   operation: enable-features
#   features: haos-platform
#   environment: staging
#   restart_after: true

# Step 3: Test staging
curl https://staging-app.azurewebsites.net/health

# Step 4: Apply to production
# Run workflow with environment: prod
```

### Example 2: Quick Feature Toggle

```bash
# Using local script
./scripts/manage-features.sh enable haos-platform,sequencer

# Or using GitHub Actions
# Go to Actions → Feature Management
# Select: enable-features
# Features: haos-platform,sequencer
# Click: Run workflow
```

### Example 3: Troubleshooting

```bash
# Check current status
./scripts/manage-features.sh status

# View logs
az webapp log tail \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg

# Restart if needed
./scripts/manage-features.sh restart
```

### Example 4: Debug Mode

```bash
# Enable debug logging
# Run workflow with:
#   operation: update-config
#   log_level: debug
#   restart_after: true

# Check logs
az webapp log tail \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg

# Restore normal logging
# Run workflow with:
#   operation: update-config
#   log_level: info
#   restart_after: true
```

## ⚡ Performance Comparison

| Operation | Docker Rebuild | Feature Toggle |
|-----------|----------------|----------------|
| Time | 8-12 minutes | 30-60 seconds |
| Network | High (1.14GB) | Low (few KB) |
| Downtime | ~2 minutes | ~30 seconds |
| Rollback | Difficult | Easy |
| Cost | Higher | Minimal |

## 🔐 Security Considerations

### Feature Flags
- Stored as Azure App Settings (encrypted at rest)
- Not committed to git
- Can be different per environment

### Access Control
- Requires Azure credentials
- Use GitHub secrets for workflows
- Local scripts require Azure CLI login

### Best Practices
1. **Always dry-run first** in production
2. **Test in staging** before production
3. **Document changes** in commit messages
4. **Monitor health** after changes
5. **Have rollback plan** ready

## 🐛 Troubleshooting

### Workflow Won't Run
```bash
# Check workflow exists
gh workflow list --repo kozuchowskihubert/azure-psql-app

# Manually trigger
gh workflow run "Feature Management & Configuration" \
  --repo kozuchowskihubert/azure-psql-app \
  --ref feat/tracks \
  -f operation=view-current
```

### Features Not Taking Effect
```bash
# Verify settings were applied
az webapp config appsettings list \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg \
  --query "[?name=='ENABLED_FEATURES']"

# Restart to ensure they're loaded
./scripts/manage-features.sh restart
```

### Health Check Failing
```bash
# Check detailed status
curl -v https://notesapp-dev-music-app.azurewebsites.net/health

# Check logs
az webapp log tail \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg

# Check container logs
az webapp log show \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg
```

### Script Permission Denied
```bash
# Make script executable
chmod +x ./scripts/manage-features.sh

# Run with bash explicitly
bash ./scripts/manage-features.sh status
```

## 📊 Monitoring

### Check Health
```bash
# Quick check
curl https://notesapp-dev-music-app.azurewebsites.net/health

# Detailed check
./scripts/manage-features.sh status
```

### View Logs
```bash
# Real-time logs
az webapp log tail \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg

# Download logs
az webapp log download \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg \
  --log-file app-logs.zip
```

### Metrics
```bash
# View in Azure Portal
open "https://portal.azure.com/#@/resource/subscriptions/YOUR_SUB/resourceGroups/notesapp-dev-rg/providers/Microsoft.Web/sites/notesapp-dev-music-app/metrics"
```

## 🔄 Rollback Procedures

### Quick Rollback
```bash
# Disable all features
./scripts/manage-features.sh disable

# Or restore previous configuration
az webapp config appsettings set \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg \
  --settings ENABLED_FEATURES="previous,features,here"
```

### Full Rollback (requires rebuild)
```bash
# Revert to previous commit
git revert HEAD

# Trigger full deployment
git push origin feat/tracks

# Or manually trigger deployment workflow
gh workflow run "Deploy Music Production App" \
  --ref feat/tracks \
  -f environment=dev
```

## 📚 Related Documentation

- [Azure Deployment Fix](./AZURE_DEPLOYMENT_FIX.md)
- [Azure Troubleshooting](./AZURE_TROUBLESHOOTING.md)
- [HAOS Platform Guide](./HAOS_FM_BRANDING.md)
- [Testing Guide](./TESTING_GUIDE.md)

## 🎯 Summary

**For quick changes**: Use the feature management workflow
**For full rebuilds**: Use the deployment workflow
**For emergencies**: Use direct Azure CLI commands

The feature management approach is:
- ⚡ **Faster** (seconds vs minutes)
- 💰 **Cheaper** (no rebuild costs)
- 🔄 **Safer** (easy rollback)
- 🎯 **Simpler** (no Docker knowledge needed)

Use it for configuration changes, feature toggles, and troubleshooting. Use full deployment workflow only when code changes require it.
