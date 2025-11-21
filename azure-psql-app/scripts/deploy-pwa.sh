#!/bin/bash
# Quick PWA Deployment to Azure Web App
# Deploys the app code directly to Azure without Docker

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "=================================================="
echo "🚀 Deploying PWA to Azure Web App"
echo "=================================================="
echo ""

# Configuration
RESOURCE_GROUP="notesapp-dev-rg"
WEBAPP_NAME="notesapp-dev-app"
APP_DIR="/Users/haos/Projects/azure-psql-app/app"

echo -e "${YELLOW}📦 Preparing deployment...${NC}"

# Check if Azure CLI is logged in
if ! az account show &>/dev/null; then
    echo "❌ Not logged in to Azure. Please run: az login"
    exit 1
fi

echo -e "${GREEN}✅ Azure CLI authenticated${NC}"

# Get current subscription
SUBSCRIPTION=$(az account show --query name -o tsv)
echo "📋 Subscription: $SUBSCRIPTION"

# Check webapp exists
echo ""
echo -e "${YELLOW}🔍 Checking Web App status...${NC}"
WEBAPP_STATE=$(az webapp show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --query state -o tsv 2>/dev/null || echo "NotFound")

if [ "$WEBAPP_STATE" == "NotFound" ]; then
    echo "❌ Web App '$WEBAPP_NAME' not found"
    exit 1
fi

echo -e "${GREEN}✅ Web App found: $WEBAPP_NAME (State: $WEBAPP_STATE)${NC}"

# Create deployment package
echo ""
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
cd "$APP_DIR"

# Create a zip file with all app files
DEPLOY_ZIP="/tmp/pwa-deploy-$(date +%s).zip"
zip -r "$DEPLOY_ZIP" . \
    -x "node_modules/*" \
    -x ".git/*" \
    -x "*.log" \
    -x ".env" \
    > /dev/null 2>&1

echo -e "${GREEN}✅ Package created: $(du -h $DEPLOY_ZIP | cut -f1)${NC}"

# Deploy to Azure Web App
echo ""
echo -e "${YELLOW}🚀 Deploying to Azure...${NC}"
az webapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEBAPP_NAME" \
    --src "$DEPLOY_ZIP" \
    --timeout 600

echo -e "${GREEN}✅ Deployment package uploaded${NC}"

# Restart the web app
echo ""
echo -e "${YELLOW}🔄 Restarting Web App...${NC}"
az webapp restart \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEBAPP_NAME"

echo -e "${GREEN}✅ Web App restarted${NC}"

# Clean up
rm -f "$DEPLOY_ZIP"

# Get the URL
WEBAPP_URL=$(az webapp show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName -o tsv)
FULL_URL="https://$WEBAPP_URL"

echo ""
echo "=================================================="
echo "✅ Deployment Complete!"
echo "=================================================="
echo ""
echo "🌐 App URL: $FULL_URL"
echo "📱 PWA Features:"
echo "   - Service Worker: $FULL_URL/service-worker.js"
echo "   - Manifest: $FULL_URL/manifest.json"
echo "   - Offline Support: Enabled"
echo "   - Install Prompts: Enabled"
echo ""
echo "🧪 Test PWA:"
echo "   1. Open: $FULL_URL"
echo "   2. Check DevTools → Application → Service Workers"
echo "   3. Test offline mode"
echo "   4. Install on mobile (iOS/Android)"
echo ""
echo "📊 Health Check:"
curl -s "$FULL_URL/health" 2>/dev/null | head -5 || echo "   (Waiting for app to start...)"
echo ""
echo "=================================================="
echo ""
