#!/bin/bash

# Script to enable Calendar and Meeting features in Azure App Service

set -e

echo "========================================="
echo "Enable Calendar & Meeting Features"
echo "========================================="
echo ""

# Azure App Service details
APP_NAME="notesapp-dev-app"
RESOURCE_GROUP="notesapp-dev-rg"

echo "App Service: $APP_NAME"
echo "Resource Group: $RESOURCE_GROUP"
echo ""

# Generate secure session secret
echo "Generating secure session secret..."
SESSION_SECRET=$(openssl rand -hex 32)
echo "✓ Session secret generated"
echo ""

# Update app settings
echo "Updating Azure App Service configuration..."
echo ""

az webapp config appsettings set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    ENABLE_CALENDAR_SYNC=true \
    ENABLE_MEETING_ROOMS=true \
    SESSION_SECRET="$SESSION_SECRET" \
    NODE_ENV=production

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Features enabled successfully!"
    echo "========================================="
    echo ""
    echo "The following features are now active:"
    echo "  ✓ Calendar API (POST/GET /api/calendar/events)"
    echo "  ✓ Meeting Scheduler API (POST/GET /api/meetings)"
    echo "  ✓ Session management with secure secret"
    echo ""
    echo "Your app will restart automatically."
    echo "Wait 2-3 minutes for the restart to complete."
    echo ""
    echo "Access your features at:"
    echo "  📅 Calendar: https://notesapp-dev-app.azurewebsites.net/calendar.html"
    echo "  🤝 Meetings: https://notesapp-dev-app.azurewebsites.net/meetings.html"
    echo ""
    echo "⚠️  Note: Database schema must be deployed first!"
    echo "   See DEPLOYMENT_SUMMARY.md for schema deployment instructions."
    echo ""
else
    echo ""
    echo "❌ Failed to update app settings"
    exit 1
fi
