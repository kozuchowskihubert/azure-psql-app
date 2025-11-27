# Azure Deployment Fix - Music App

## Issue
The Azure Web App at `https://notesapp-dev-music-app.azurewebsites.net` was returning **503 Service Unavailable** errors on the `/health` endpoint, indicating the application was not starting properly.

## Root Causes

1. **Missing Startup Configuration**: Azure Web App didn't have an explicit startup command configured
2. **Port Mismatch**: Azure expects apps to listen on port `8080` (configured via `WEBSITES_PORT`)
3. **Missing Health Endpoint**: Health checks were looking for `/health` but only `/api/health` existed

## Fixes Applied

### 1. Added Root-Level Health Endpoint (`app/app.js`)

```javascript
/**
 * Root-level health endpoint for Azure App Service
 * Azure may check /health instead of /api/health
 */
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      res.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        app: 'HAOS.fm Music Platform',
      });
    } finally {
      client.release();
    }
  } catch (err) {
    // Return 200 even if DB is down, so Azure doesn't kill the app
    res.json({
      status: 'degraded',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      app: 'HAOS.fm Music Platform',
      note: 'App running but database unavailable',
    });
  }
});
```

**Key Features:**
- Returns HTTP 200 even when database is unavailable (reports as "degraded")
- Prevents Azure from killing the app due to transient DB issues
- Maintains `/api/health` for API consistency

### 2. Configured Azure Web App Settings (`.github/workflows/deploy-music-app.yml`)

```yaml
- name: ⚙️ Configure Web App Settings
  run: |
    echo "Configuring startup command and app settings..."
    az webapp config set \
      --name notesapp-dev-music-app \
      --resource-group notesapp-dev-rg \
      --startup-file "node server.js"
    
    # Set environment variables for production
    az webapp config appsettings set \
      --name notesapp-dev-music-app \
      --resource-group notesapp-dev-rg \
      --settings \
        NODE_ENV=production \
        PORT=8080 \
        WEBSITES_PORT=8080
    
    echo "✅ Web app configuration complete"
```

**Configuration Details:**
- **Startup Command**: `node server.js` - Explicitly tells Azure how to start the app
- **NODE_ENV**: `production` - Enables production optimizations
- **PORT**: `8080` - Standard Azure Web App port
- **WEBSITES_PORT**: `8080` - Azure-specific port configuration

### 3. Deployment Order

The workflow now follows this order:
1. Deploy Docker image to Web App
2. Configure app settings and startup command
3. Restart app with new configuration
4. Wait 45 seconds for startup
5. Run health checks with retries

## Expected Results

After deployment completes:

✅ **Health Endpoint**: `https://notesapp-dev-music-app.azurewebsites.net/health` should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-27T...",
  "app": "HAOS.fm Music Platform"
}
```

✅ **Main App**: `https://notesapp-dev-music-app.azurewebsites.net/` should load the HAOS.fm landing page

✅ **Synth Studio**: `https://notesapp-dev-music-app.azurewebsites.net/synth-2600-studio.html` should be accessible

## Verification Steps

1. **Check Deployment Status**:
   ```bash
   # View GitHub Actions workflow
   # https://github.com/kozuchowskihubert/azure-psql-app/actions
   ```

2. **Test Health Endpoint**:
   ```bash
   curl https://notesapp-dev-music-app.azurewebsites.net/health
   ```

3. **Check App Logs** (if still having issues):
   ```bash
   az webapp log tail \
     --name notesapp-dev-music-app \
     --resource-group notesapp-dev-rg
   ```

4. **Verify Configuration**:
   ```bash
   az webapp config show \
     --name notesapp-dev-music-app \
     --resource-group notesapp-dev-rg
   ```

## Commits

- **7ee1477**: Added root-level `/health` endpoint
- **09c3f49**: Configured Azure Web App startup and port settings

## Next Steps

1. Monitor the GitHub Actions deployment workflow
2. Once deployed, verify health endpoint responds with 200 OK
3. Test main application functionality
4. If issues persist, check Azure Application Insights for detailed logs

## Architecture Notes

```
┌─────────────────────────────────────────────┐
│   Azure Web App (notesapp-dev-music-app)    │
│   - Port: 8080 (WEBSITES_PORT)              │
│   - Startup: node server.js                 │
│   - Image: notesappdevacr14363.azurecr.io/  │
│           notesapp-music:latest              │
├─────────────────────────────────────────────┤
│   Health Checks:                            │
│   - /health (root-level)     ← Azure        │
│   - /api/health              ← API clients  │
├─────────────────────────────────────────────┤
│   Environment:                              │
│   - NODE_ENV=production                     │
│   - PORT=8080                               │
│   - DATABASE_URL=postgresql://...           │
└─────────────────────────────────────────────┘
```

## Troubleshooting

### If 503 persists:

1. **Check if container is starting**:
   ```bash
   az webapp log download \
     --name notesapp-dev-music-app \
     --resource-group notesapp-dev-rg
   ```

2. **Verify image was pulled**:
   ```bash
   az acr repository show-tags \
     --name notesappdevacr14363 \
     --repository notesapp-music
   ```

3. **Check environment variables**:
   ```bash
   az webapp config appsettings list \
     --name notesapp-dev-music-app \
     --resource-group notesapp-dev-rg
   ```

4. **Force redeploy**:
   - Trigger workflow manually from GitHub Actions
   - Or push a new commit to `feat/tracks` branch

## Related Documentation

- [HAOS.fm Landing Page Refactoring](./WORKSPACE_CONFIG_REFACTORING.md)
- [Deployment Workflows](./.github/workflows/deploy-music-app.yml)
- [Server Architecture](../app/server.js)
