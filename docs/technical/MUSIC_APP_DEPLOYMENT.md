# Music Production App Deployment Summary

## Overview
This document describes the separate deployment infrastructure for the music production features in the `feat/tracks` branch.

## Architecture

### Separate App Services
We now have **two independent Azure App Services**:

1. **Main Application** (main branch)
   - URL: `https://notesapp-dev-app.azurewebsites.net`
   - App Service Plan: F1 Free tier
   - Features: Notes, Calendar, Excel, Meetings, Collaboration
   - Docker Image: `notesapp:latest` (Node.js only, ~200MB)

2. **Music Production Application** (feat/tracks branch)
   - URL: `https://notesapp-dev-music-app.azurewebsites.net`
   - App Service Plan: B1 Basic tier (~$13/month)
   - Features: All main features + Music Production + MIDI Generation
   - Docker Image: `notesapp-music:latest` (Node.js + Python, ~591MB)

## Infrastructure Resources

### New Resources (feat/tracks only)
```hcl
# App Service Plan - B1 tier
resource "azurerm_service_plan" "music_plan" {
  sku_name = "B1"  # 1.75 GB RAM, Always On enabled
}

# Music Production Web App
resource "azurerm_linux_web_app" "music_app" {
  name = "notesapp-dev-music-app"
  
  app_settings = {
    "PYTHON_ENABLED" = "true"
    "NODE_ENV"       = "production"
  }
}
```

### Shared Resources (both branches)
- Resource Group: `notesapp-dev-rg`
- PostgreSQL Database: `notesapp-dev-pg`
- Container Registry: `notesappdevacr14363`
- Virtual Network: `notesapp-dev-vnet`
- VM for Audio Processing: `notesapp-dev-vm` (feat/tracks only)

## Deployment Workflow

### GitHub Actions
- **Workflow**: `.github/workflows/deploy-music-app.yml`
- **Trigger**: Push to `feat/tracks` branch
- **Steps**:
  1. Build Docker image using `Dockerfile.music`
  2. Push to Azure Container Registry
  3. Deploy infrastructure with Terraform
  4. Restart Music Production Web App
  5. Verify health endpoint

### Docker Image
**Dockerfile.music** includes:
- Node.js 20 Alpine base
- Python 3 runtime
- Audio processing libraries:
  - mido (MIDI parsing)
  - midiutil (MIDI generation)
  - python-rtmidi
  - librosa (audio analysis)
  - soundfile
  - pydub
  - pretty-midi
  - music21

## Cost Breakdown

| Resource | Tier | Monthly Cost |
|----------|------|--------------|
| Main App Service Plan | F1 Free | $0 |
| Music App Service Plan | B1 Basic | ~$13 |
| PostgreSQL Database | B_Standard_B1ms | ~$12 |
| Container Registry | Basic | ~$5 |
| Virtual Machine (feat/tracks) | Standard_B1s | ~$7.50 |
| **Total** | | **~$37.50/month** |

Main branch only: **~$17/month** (no music app, no VM)

## URLs

### Production URLs
- **Main App**: https://notesapp-dev-app.azurewebsites.net
- **Music App**: https://notesapp-dev-music-app.azurewebsites.net
- **Health Check**: https://notesapp-dev-music-app.azurewebsites.net/api/health

### API Endpoints (Music App)
- `/api/music/projects` - List music projects
- `/api/music/midi/generate` - Generate MIDI files
- `/api/music/midi/preview` - Preview MIDI content
- All standard endpoints from main app

## Deployment Commands

### Manual Terraform Deployment
```bash
cd infra
terraform init
terraform plan
terraform apply
```

### Manual Docker Deployment
```bash
# Build music production image
docker build -f Dockerfile.music -t notesappdevacr14363.azurecr.io/notesapp-music:latest .

# Login to ACR
az acr login --name notesappdevacr14363

# Push image
docker push notesappdevacr14363.azurecr.io/notesapp-music:latest

# Restart app
az webapp restart --name notesapp-dev-music-app --resource-group notesapp-dev-rg
```

### Check Deployment Status
```bash
# List workflow runs
gh run list --branch feat/tracks --limit 5

# View specific run
gh run view <run-id> --log

# Check app status
az webapp show --name notesapp-dev-music-app --resource-group notesapp-dev-rg --query state
```

## Branch Strategy

### main branch
- Clean, enterprise-focused codebase
- No music production features
- Lightweight Docker image (~200MB)
- Free tier infrastructure where possible
- Production URL: notesapp-dev-app.azurewebsites.net

### feat/tracks branch
- Complete music production platform
- Python audio processing capabilities
- Larger Docker image (~591MB)
- B1 tier for better performance
- VM for advanced audio processing
- Production URL: notesapp-dev-music-app.azurewebsites.net

## Migration Path

To access music production features:
```bash
git checkout feat/tracks
cd app && npm start
# Access at http://localhost:3000
```

To use only enterprise features:
```bash
git checkout main
cd app && npm start
# Access at http://localhost:3000
```

## Terraform Outputs

After deployment, Terraform outputs:
```
app_url           = "https://notesapp-dev-app.azurewebsites.net"
music_app_url     = "https://notesapp-dev-music-app.azurewebsites.net"
vm_public_ip      = "<VM IP Address>"
vm_ssh_command    = "ssh <username>@<ip>"
```

## Health Checks

Both apps include health endpoints:
```bash
# Main app
curl https://notesapp-dev-app.azurewebsites.net/api/health

# Music app
curl https://notesapp-dev-music-app.azurewebsites.net/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-21T12:00:00.000Z",
  "uptime": 3600
}
```

## Troubleshooting

### Music App Won't Start
1. Check Docker image was pushed successfully
2. Verify ACR credentials in App Service settings
3. Check application logs:
   ```bash
   az webapp log tail --name notesapp-dev-music-app --resource-group notesapp-dev-rg
   ```

### Python Dependencies Missing
1. Rebuild Docker image with `Dockerfile.music`
2. Ensure all pip packages are in Dockerfile
3. Check container startup logs

### Terraform Deployment Fails
1. Verify Azure credentials are valid
2. Check resource quotas in subscription
3. Review terraform plan output
4. Check state file isn't corrupted

## Next Steps

1. ✅ Infrastructure deployed with separate App Service Plan
2. ✅ Music production app available at dedicated URL
3. ⏳ Workflow running to deploy music Docker image
4. 📋 Test MIDI generation endpoints
5. 📋 Verify Python audio processing works
6. 📋 Configure custom domain (optional)
7. 📋 Set up Application Insights monitoring

## Documentation

Related documentation:
- [VM Setup](../infra/VM_SETUP.md) - Audio processing VM configuration
- [Branch Comparison](../docs/technical/BRANCH_COMPARISON.md) - Detailed differences
- [Architecture](../docs/technical/ARCHITECTURE.md) - Overall system design
- [Deployment Guide](../docs/technical/DEPLOYMENT.md) - General deployment info
