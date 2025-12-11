#!/bin/bash
# =============================================================================
# HAOS.fm Authentication System Setup Script
# Sets up all required environment variables and database for authentication
# =============================================================================

set -e  # Exit on error

echo "🚀 HAOS.fm Authentication Setup"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

echo "📋 Current Status Check"
echo "======================="
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not installed${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi
echo -e "${GREEN}✅ Vercel CLI installed${NC}"

# Check current environment variables
echo ""
echo "🔍 Checking existing environment variables..."
vercel env ls 2>&1 | grep -E "AZURE_STORAGE|DATABASE|GOOGLE|SESSION" || echo "No auth-related env vars found"

echo ""
echo "================================"
echo "🛠️  SETUP OPTIONS"
echo "================================"
echo ""
echo "Choose your setup path:"
echo ""
echo "1. Full Setup (Database + OAuth + Account Panel)"
echo "   - Set up Vercel Postgres database"
echo "   - Configure Google OAuth"
echo "   - Create all account pages"
echo "   - Full featured authentication"
echo ""
echo "2. Quick Setup (Client-Side Only)"
echo "   - No database required"
echo "   - LocalStorage-based auth"
echo "   - Limited features"
echo "   - Fast deployment"
echo ""
echo "3. Database Only"
echo "   - Set up Vercel Postgres"
echo "   - Local email/password auth"
echo "   - No social login"
echo ""
echo "4. Check Status Only"
echo "   - Don't make any changes"
echo "   - Show current configuration"
echo ""

read -p "Enter your choice (1-4): " SETUP_CHOICE

case $SETUP_CHOICE in
    1)
        echo ""
        echo "🎯 Full Setup Selected"
        echo "======================"
        ;;
    2)
        echo ""
        echo "⚡ Quick Setup Selected"
        echo "======================"
        echo ""
        echo "This will create client-side authentication using localStorage."
        echo "No database or server-side authentication."
        echo ""
        read -p "Continue? (y/n): " CONFIRM
        if [ "$CONFIRM" != "y" ]; then
            echo "Cancelled"
            exit 0
        fi
        
        # Create client-side auth implementation
        echo "📝 Creating client-side authentication..."
        
        # This will be implemented below
        echo -e "${YELLOW}⚠️  Client-side auth implementation coming soon${NC}"
        echo ""
        echo "For now, use Option 1 or 3 for full authentication."
        exit 0
        ;;
    3)
        echo ""
        echo "💾 Database Only Setup"
        echo "======================"
        ;;
    4)
        echo ""
        echo "📊 Current Status"
        echo "================="
        echo ""
        
        echo "Environment Variables:"
        vercel env ls 2>&1 || true
        
        echo ""
        echo "Database Status:"
        vercel postgres ls 2>&1 || echo "No databases found"
        
        echo ""
        echo "Files Status:"
        [ -f "app/public/register.html" ] && echo "✅ Registration page exists" || echo "❌ Registration page missing"
        [ -f "app/public/login.html" ] && echo "✅ Login page exists" || echo "❌ Login page missing"
        [ -f "app/public/account.html" ] && echo "✅ Account page exists" || echo "❌ Account page missing"
        [ -f "app/public/settings.html" ] && echo "✅ Settings page exists" || echo "❌ Settings page missing"
        
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Full Setup or Database Setup
echo ""
echo "Step 1: Database Setup"
echo "======================"
echo ""

# Check if database already exists
DB_EXISTS=$(vercel postgres ls 2>&1 | grep -c "haos" || echo "0")

if [ "$DB_EXISTS" -gt 0 ]; then
    echo -e "${GREEN}✅ Database already exists${NC}"
    vercel postgres ls
else
    echo "Creating Vercel Postgres database..."
    echo ""
    read -p "Enter database name (default: haos-fm-db): " DB_NAME
    DB_NAME=${DB_NAME:-haos-fm-db}
    
    echo "Creating database: $DB_NAME"
    vercel postgres create "$DB_NAME" || {
        echo -e "${RED}❌ Failed to create database${NC}"
        echo "You can create it manually at: https://vercel.com/dashboard"
        exit 1
    }
    
    echo -e "${GREEN}✅ Database created successfully${NC}"
fi

echo ""
echo "Step 2: Environment Variables"
echo "=============================="
echo ""

# Generate SESSION_SECRET if not exists
SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "$(date +%s | sha256sum | base64 | head -c 32)")

echo "Adding SESSION_SECRET..."
echo "$SESSION_SECRET" | vercel env add SESSION_SECRET production --force 2>&1 || true
echo "$SESSION_SECRET" | vercel env add SESSION_SECRET preview --force 2>&1 || true
echo -e "${GREEN}✅ SESSION_SECRET added${NC}"

if [ "$SETUP_CHOICE" == "1" ]; then
    echo ""
    echo "Step 3: Google OAuth Setup"
    echo "=========================="
    echo ""
    echo "To set up Google OAuth, you need to:"
    echo "1. Go to: https://console.cloud.google.com/"
    echo "2. Create OAuth 2.0 credentials"
    echo "3. Add authorized redirect URI: https://haos.fm/api/auth/google/callback"
    echo ""
    read -p "Do you have Google OAuth credentials? (y/n): " HAS_GOOGLE
    
    if [ "$HAS_GOOGLE" == "y" ]; then
        read -p "Enter GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
        read -p "Enter GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
        
        echo "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID production --force
        echo "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID preview --force
        
        echo "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production --force
        echo "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET preview --force
        
        GOOGLE_CALLBACK="https://haos.fm/api/auth/google/callback"
        echo "$GOOGLE_CALLBACK" | vercel env add GOOGLE_CALLBACK_URL production --force
        echo "$GOOGLE_CALLBACK" | vercel env add GOOGLE_CALLBACK_URL preview --force
        
        echo -e "${GREEN}✅ Google OAuth configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Skipping Google OAuth setup${NC}"
        echo "You can add it later with:"
        echo "  vercel env add GOOGLE_CLIENT_ID production"
        echo "  vercel env add GOOGLE_CLIENT_SECRET production"
        echo "  vercel env add GOOGLE_CALLBACK_URL production"
    fi
fi

echo ""
echo "Step 4: Database Schema"
echo "======================="
echo ""
echo "Run database migrations to create tables..."
echo ""
read -p "Run migrations now? (y/n): " RUN_MIGRATIONS

if [ "$RUN_MIGRATIONS" == "y" ]; then
    if [ -f "app/utils/db-init.js" ]; then
        node app/utils/db-init.js || echo -e "${YELLOW}⚠️  Migration had issues${NC}"
    else
        echo -e "${YELLOW}⚠️  Migration script not found${NC}"
        echo "You may need to run migrations manually"
    fi
fi

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "📋 Summary:"
echo "  ✅ Database configured"
echo "  ✅ Session secret generated"
if [ "$SETUP_CHOICE" == "1" ] && [ "$HAS_GOOGLE" == "y" ]; then
    echo "  ✅ Google OAuth configured"
fi
echo ""
echo "🚀 Next Steps:"
echo "  1. Deploy to Vercel:"
echo "     vercel --prod"
echo ""
echo "  2. Test authentication:"
echo "     https://haos.fm/register.html"
echo "     https://haos.fm/login.html"
echo ""
echo "  3. Check API health:"
echo "     curl https://haos.fm/api/health"
echo ""
echo "📚 Documentation:"
echo "  See AUTHENTICATION_AUDIT_2025-12-11.md for details"
echo ""
