#!/bin/bash
# =============================================================================
# Feature Management Script - Enable/Disable Features
# =============================================================================
#
# This script manages feature flags in Azure Web App without rebuilding.
# 
# Usage:
#   ./scripts/manage-features.sh [operation] [features]
#
# Operations:
#   enable      - Enable features
#   disable     - Disable features
#   list        - List current features
#   status      - Show app status
#   restart     - Restart app
#
# Examples:
#   ./scripts/manage-features.sh enable haos-platform,sequencer
#   ./scripts/manage-features.sh list
#   ./scripts/manage-features.sh status
#
# =============================================================================

set -e

# Configuration
APP_NAME="notesapp-dev-music-app"
RESOURCE_GROUP="notesapp-dev-rg"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check Azure CLI is installed
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed"
        echo "Install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
}

# Check Azure login
check_azure_login() {
    if ! az account show &> /dev/null; then
        print_error "Not logged into Azure"
        echo "Run: az login"
        exit 1
    fi
}

# List current features
list_features() {
    print_header "Current Feature Configuration"
    
    echo ""
    echo "📋 App Settings:"
    az webapp config appsettings list \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "[?name=='ENABLED_FEATURES' || name=='NODE_ENV' || name=='LOG_LEVEL' || name=='ENVIRONMENT']" \
        --output table
    
    echo ""
    echo "🌐 App Status:"
    az webapp show \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "{State:state, URL:defaultHostName, Updated:lastModifiedTimeUtc}" \
        --output table
}

# Show app status
show_status() {
    print_header "Application Status"
    
    echo ""
    echo "🏥 Health Check:"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://${APP_NAME}.azurewebsites.net/health" || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Application is healthy (HTTP $HTTP_CODE)"
        echo ""
        echo "Response:"
        curl -s "https://${APP_NAME}.azurewebsites.net/health" | jq '.' || curl -s "https://${APP_NAME}.azurewebsites.net/health"
    else
        print_error "Application is not healthy (HTTP $HTTP_CODE)"
    fi
    
    echo ""
    list_features
}

# Enable features
enable_features() {
    local features=$1
    
    if [ -z "$features" ]; then
        print_error "No features specified"
        echo "Usage: $0 enable <feature1,feature2,...>"
        echo ""
        echo "Available features:"
        echo "  - haos-platform"
        echo "  - radio-247"
        echo "  - trap-studio"
        echo "  - sequencer"
        echo "  - modular-synth"
        exit 1
    fi
    
    print_header "Enabling Features"
    print_info "Features: $features"
    
    echo ""
    echo "🔧 Updating app settings..."
    az webapp config appsettings set \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --settings \
            ENABLED_FEATURES="$features" \
            LAST_UPDATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
            UPDATED_BY="Local Script"
    
    print_success "Features enabled"
    
    echo ""
    read -p "🔄 Restart application? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        restart_app
    fi
}

# Disable features
disable_features() {
    print_header "Disabling All Features"
    
    echo ""
    echo "🔧 Clearing feature flags..."
    az webapp config appsettings set \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --settings \
            ENABLED_FEATURES="" \
            LAST_UPDATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
            UPDATED_BY="Local Script"
    
    print_success "Features disabled"
    
    echo ""
    read -p "🔄 Restart application? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        restart_app
    fi
}

# Restart application
restart_app() {
    print_header "Restarting Application"
    
    echo ""
    echo "🔄 Restarting..."
    az webapp restart \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP"
    
    print_success "Restart initiated"
    
    echo ""
    print_info "Waiting 30 seconds for app to start..."
    sleep 30
    
    echo ""
    echo "🏥 Checking health..."
    for i in {1..5}; do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://${APP_NAME}.azurewebsites.net/health" || echo "000")
        
        if [ "$HTTP_CODE" = "200" ]; then
            print_success "Application is healthy!"
            return 0
        fi
        
        echo "⏳ Attempt $i/5 - HTTP $HTTP_CODE"
        sleep 10
    done
    
    print_error "Application may not be fully started yet"
}

# Main script
main() {
    check_azure_cli
    check_azure_login
    
    local operation=${1:-help}
    local features=$2
    
    case "$operation" in
        enable)
            enable_features "$features"
            ;;
        disable)
            disable_features
            ;;
        list)
            list_features
            ;;
        status)
            show_status
            ;;
        restart)
            restart_app
            ;;
        help|--help|-h)
            echo "Feature Management Script"
            echo ""
            echo "Usage: $0 [operation] [features]"
            echo ""
            echo "Operations:"
            echo "  enable <features>   Enable features (comma-separated)"
            echo "  disable             Disable all features"
            echo "  list                List current features"
            echo "  status              Show app status and health"
            echo "  restart             Restart application"
            echo "  help                Show this help"
            echo ""
            echo "Available Features:"
            echo "  - haos-platform     HAOS Platform with TB-303, TR-909, sequencer"
            echo "  - radio-247         24/7 Radio streaming"
            echo "  - trap-studio       Trap Studio production tools"
            echo "  - sequencer         Advanced sequencer"
            echo "  - modular-synth     Modular synthesizer"
            echo ""
            echo "Examples:"
            echo "  $0 enable haos-platform,sequencer"
            echo "  $0 list"
            echo "  $0 status"
            echo "  $0 restart"
            ;;
        *)
            print_error "Unknown operation: $operation"
            echo "Run '$0 help' for usage"
            exit 1
            ;;
    esac
}

main "$@"
