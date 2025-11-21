#!/bin/bash

# Database Schema Deployment Script
# Deploys calendar, SSO, and meeting room schema extensions

set -e

echo "========================================="
echo "Database Schema Deployment"
echo "========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set DATABASE_URL with your Azure PostgreSQL connection string:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database?sslmode=require'"
    exit 1
fi

echo "✓ DATABASE_URL found"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "ERROR: psql is not installed"
    echo ""
    echo "Install PostgreSQL client:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

echo "✓ psql is installed"
echo ""

# Get the schema file path
SCHEMA_FILE="$(dirname "$0")/schema-extensions.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo "ERROR: Schema file not found at $SCHEMA_FILE"
    exit 1
fi

echo "✓ Schema file found: $SCHEMA_FILE"
echo ""

# Display warning
echo "⚠️  WARNING: This will create new tables in your database"
echo "   Tables to be created:"
echo "   - users (SSO user management)"
echo "   - user_sessions (session storage)"
echo "   - user_roles, role_permissions (RBAC)"
echo "   - calendar_events (calendar events)"
echo "   - calendar_providers (external calendar sync)"
echo "   - event_participants (event attendees)"
echo "   - meeting_bookings (meetings)"
echo "   - meeting_rooms (room inventory)"
echo "   - meeting_participants (meeting attendees)"
echo "   - room_amenities (room features)"
echo "   - notifications (user notifications)"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "Deploying schema to database..."
echo ""

# Run the schema file
psql "$DATABASE_URL" -f "$SCHEMA_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Schema deployment completed successfully!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "1. Update .env file to enable features:"
    echo "   ENABLE_SSO=true"
    echo "   ENABLE_CALENDAR_SYNC=true"
    echo "   ENABLE_MEETING_ROOMS=true"
    echo ""
    echo "2. Configure SSO providers (Azure AD, Google):"
    echo "   - See docs/IMPLEMENTATION_GUIDE.md"
    echo "   - Add credentials to .env or Azure App Service Configuration"
    echo ""
    echo "3. Restart your application to load the new features"
    echo ""
else
    echo ""
    echo "========================================="
    echo "❌ Schema deployment failed!"
    echo "========================================="
    echo "Check the error messages above for details"
    exit 1
fi
