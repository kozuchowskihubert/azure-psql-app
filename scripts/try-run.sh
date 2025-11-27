#!/bin/bash
# Try Run - Quick deployment script for rapid iteration
# Commits changes, pushes to GitHub, and triggers fast deployment workflow

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Get the current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo -e "${PURPLE}🚀 Try Run - Quick Deploy${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}📝 Uncommitted changes detected${NC}"
    echo ""
    
    # Show changed files
    echo -e "${BLUE}Changed files:${NC}"
    git status --short
    echo ""
    
    # Prompt for commit message
    read -p "$(echo -e ${GREEN}Enter commit message: ${NC})" COMMIT_MSG
    
    if [ -z "$COMMIT_MSG" ]; then
        echo -e "${RED}❌ Commit message cannot be empty${NC}"
        exit 1
    fi
    
    # Stage and commit
    echo -e "${BLUE}📦 Staging changes...${NC}"
    git add -A
    
    echo -e "${BLUE}💾 Committing changes...${NC}"
    git commit -m "$COMMIT_MSG"
    
    echo -e "${GREEN}✅ Changes committed${NC}"
    echo ""
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
    echo ""
fi

# Push to remote
echo -e "${BLUE}⬆️  Pushing to origin/$BRANCH...${NC}"
git push origin "$BRANCH"
echo -e "${GREEN}✅ Pushed successfully${NC}"
echo ""

# Get the latest commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
echo -e "${PURPLE}📌 Latest commit: $COMMIT_HASH${NC}"
echo ""

# Ask whether to trigger deployment
echo -e "${YELLOW}Deployment Options:${NC}"
echo "  1) Quick Deploy (skip build, ~1-2 min)"
echo "  2) Full Deploy (with build, ~5-10 min)"
echo "  3) Skip deployment"
echo ""

read -p "$(echo -e ${GREEN}Select option [1-3]: ${NC})" DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo ""
        echo -e "${BLUE}🚀 Triggering Quick Deploy workflow...${NC}"
        echo -e "${YELLOW}⏱️  This will take approximately 1-2 minutes${NC}"
        echo ""
        
        # Trigger workflow with GitHub CLI
        if command -v gh &> /dev/null; then
            gh workflow run try-run.yml \
                --ref "$BRANCH" \
                -f skip_build=true \
                -f deploy_only_files=""
            
            echo -e "${GREEN}✅ Workflow triggered successfully${NC}"
            echo ""
            echo -e "${BLUE}📊 View workflow status:${NC}"
            echo "   gh run watch"
            echo ""
            echo -e "${BLUE}🌐 App URL:${NC}"
            echo "   https://notesapp-dev-music-app.azurewebsites.net/haos-platform.html"
            echo ""
            echo -e "${YELLOW}⏳ Wait 2-3 minutes then refresh the app${NC}"
        else
            echo -e "${YELLOW}⚠️  GitHub CLI (gh) not installed${NC}"
            echo ""
            echo -e "${BLUE}Manual steps:${NC}"
            echo "  1. Go to: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
            echo "  2. Click 'Try Run - Quick Deploy'"
            echo "  3. Click 'Run workflow'"
            echo "  4. Select branch: $BRANCH"
            echo "  5. Set 'Skip build' to: true"
            echo "  6. Click 'Run workflow'"
            echo ""
            echo "Or install GitHub CLI: brew install gh"
        fi
        ;;
    2)
        echo ""
        echo -e "${BLUE}🚀 Triggering Full Deploy workflow...${NC}"
        echo -e "${YELLOW}⏱️  This will take approximately 5-10 minutes${NC}"
        echo ""
        
        if command -v gh &> /dev/null; then
            gh workflow run try-run.yml \
                --ref "$BRANCH" \
                -f skip_build=false \
                -f deploy_only_files=""
            
            echo -e "${GREEN}✅ Workflow triggered successfully${NC}"
            echo ""
            echo -e "${BLUE}📊 View workflow status:${NC}"
            echo "   gh run watch"
            echo ""
            echo -e "${BLUE}🌐 App URL:${NC}"
            echo "   https://notesapp-dev-music-app.azurewebsites.net/haos-platform.html"
        else
            echo -e "${YELLOW}⚠️  GitHub CLI (gh) not installed${NC}"
            echo ""
            echo -e "${BLUE}Manual steps:${NC}"
            echo "  1. Go to: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
            echo "  2. Click 'Try Run - Quick Deploy'"
            echo "  3. Click 'Run workflow'"
            echo "  4. Select branch: $BRANCH"
            echo "  5. Set 'Skip build' to: false"
            echo "  6. Click 'Run workflow'"
        fi
        ;;
    3)
        echo ""
        echo -e "${BLUE}⏭️  Skipping deployment${NC}"
        echo -e "${GREEN}✅ Code pushed to $BRANCH${NC}"
        ;;
    *)
        echo ""
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Try Run Complete!${NC}"
echo ""
