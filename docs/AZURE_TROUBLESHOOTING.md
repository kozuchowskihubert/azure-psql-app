# Azure Deployment Troubleshooting Guide

## Current Issue
Azure Web App `notesapp-dev-music-app` is returning **503 Service Unavailable** errors on `/health` endpoint.

## Status
- ✅ Code fixes pushed to `feat/tracks` branch
- ✅ Health endpoint added at root level (`/health`)
- ✅ Deployment workflow updated with startup configuration
- ❌ App still not responding (503 errors)

## Possible Causes

### 1. GitHub Actions Workflow Not Triggered
The workflow may not have run after the recent commits.

**Check:**
```bash
# View workflow runs at:
# https://github.com/kozuchowskihubert/azure-psql-app/actions
```

### 2. Docker Container Not Starting
The container might be failing to start due to missing dependencies or startup errors.

**Symptoms:**
- 503 errors from Azure
- No response from health endpoint
- Application Insights shows no requests

### 3. Environment Variables Missing
The app requires certain environment variables that might not be configured.

**Required Variables:**
- `DATABASE_URL` (PostgreSQL connection string)
- `PORT` (should be 8080)
- `NODE_ENV` (production)
- `WEBSITES_PORT` (8080 for Azure)

## Solutions

### Option 1: Manual Configuration (Fastest)
Run the configuration script if you have Azure CLI installed:

```bash
cd /Users/haos/azure-psql-app
./scripts/configure-azure-app.sh
```

This will:
1. Set the startup command to `node server.js`
2. Configure `WEBSITES_PORT=8080`
3. Set `NODE_ENV=production`
4. Restart the app
5. Show logs and test the health endpoint

### Option 2: Trigger Workflow Manually
1. Go to: https://github.com/kozuchowskihubert/azure-psql-app/actions/workflows/deploy-music-app.yml
2. Click "Run workflow"
3. Select branch: `feat/tracks`
4. Click "Run workflow" button

This will:
1. Build the Docker image
2. Push to Azure Container Registry
3. Deploy to Web App
4. Configure settings
5. Run health checks

### Option 3: Force Redeploy with Commit
Create a dummy commit to trigger the deployment:

```bash
cd /Users/haos/azure-psql-app
git commit --allow-empty -m "chore: trigger Azure deployment"
git push origin feat/tracks
```

### Option 4: Check Azure Logs Directly
If you have Azure CLI:

```bash
# View application logs
az webapp log tail \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg

# View deployment logs  
az webapp log deployment list \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg

# Check app settings
az webapp config appsettings list \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg
```

## Diagnostic Commands

### Test Health Endpoint
```bash
curl -v https://notesapp-dev-music-app.azurewebsites.net/health
```

### Check Container Status
```bash
az webapp show \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg \
  --query "{state: state, enabled: enabled, hostNames: hostNames}"
```

### View Recent Container Logs
```bash
az webapp log tail \
  --name notesapp-dev-music-app \
  --resource-group notesapp-dev-rg \
  --provider application \
  | head -100
```

## Expected Behavior After Fix

When working correctly, you should see:

```bash
$ curl https://notesapp-dev-music-app.azurewebsites.net/health
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-27T...",
  "app": "HAOS.fm Music Platform"
}
```

## Next Steps

1. **Immediate:** Run the manual configuration script or trigger workflow manually
2. **Monitor:** Watch GitHub Actions for successful deployment
3. **Verify:** Test health endpoint returns 200 OK
4. **Test:** Access the main app and verify it loads

## Related Files
- Workflow: `.github/workflows/deploy-music-app.yml`
- Health endpoint: `app/app.js` (lines 206-238)
- Server: `app/server.js`
- Dockerfile: `Dockerfile.music`
- Config script: `scripts/configure-azure-app.sh`

## Support Resources
- [GitHub Actions Runs](https://github.com/kozuchowskihubert/azure-psql-app/actions)
- [Azure Portal](https://portal.azure.com)
- [Deployment Fix Documentation](./AZURE_DEPLOYMENT_FIX.md)
