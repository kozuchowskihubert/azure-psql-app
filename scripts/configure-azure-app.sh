#!/bin/bash
# Azure Web App Configuration Script
# Manually configure the music app with correct startup settings

set -e

APP_NAME="notesapp-dev-music-app"
RESOURCE_GROUP="notesapp-dev-rg"

echo "🔧 Configuring Azure Web App: $APP_NAME"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
if ! az account show &> /dev/null; then
    echo "⚠️  Not logged in to Azure. Running login..."
    az login
fi

echo "📋 Current configuration:"
az webapp config show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "{startupCommand: linuxFxVersion, port: 'WEBSITES_PORT'}" -o table

echo ""
echo "⚙️  Setting startup command..."
az webapp config set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --startup-file "node server.js"

echo ""
echo "🔧 Configuring app settings..."
az webapp config appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        NODE_ENV=production \
        PORT=8080 \
        WEBSITES_PORT=8080 \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true

echo ""
echo "🔄 Restarting app..."
az webapp restart \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP

echo ""
echo "✅ Configuration complete!"
echo ""
echo "⏳ Waiting 30 seconds for app to start..."
sleep 30

echo ""
echo "🏥 Testing health endpoint..."
curl -s https://$APP_NAME.azurewebsites.net/health || echo "Health check failed"

echo ""
echo "📊 Recent logs:"
az webapp log tail \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --provider application \
    | head -50

echo ""
echo "🔍 To view full logs, run:"
echo "   az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "🌐 App URL: https://$APP_NAME.azurewebsites.net"
