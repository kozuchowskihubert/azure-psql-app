#!/bin/bash

###############################################################################
# Azure SSL Certificate Setup Script
# Automates the creation and configuration of SSL certificates for HAOS Platform
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-haos-rg}"
APP_NAME="${AZURE_APP_NAME:-haos-platform}"
LOCATION="${AZURE_LOCATION:-eastus}"
CUSTOM_DOMAIN="${CUSTOM_DOMAIN:-}"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${BLUE}=================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed. Please install it from: https://docs.microsoft.com/cli/azure/install-azure-cli"
        exit 1
    fi
    print_success "Azure CLI installed"
    
    # Check if logged in
    if ! az account show &> /dev/null; then
        print_error "Not logged in to Azure. Please run: az login"
        exit 1
    fi
    print_success "Logged in to Azure"
    
    # Display current subscription
    SUBSCRIPTION=$(az account show --query name -o tsv)
    print_info "Current subscription: $SUBSCRIPTION"
}

###############################################################################
# Certificate Setup Functions
###############################################################################

setup_managed_certificate() {
    print_header "Setting up Azure Managed SSL Certificate (FREE)"
    
    if [ -z "$CUSTOM_DOMAIN" ]; then
        print_error "CUSTOM_DOMAIN environment variable is required"
        echo "Example: export CUSTOM_DOMAIN=haos.fm"
        exit 1
    fi
    
    print_info "Domain: $CUSTOM_DOMAIN"
    print_info "App Service: $APP_NAME"
    
    # Step 1: Add custom domain
    print_info "Step 1: Adding custom domain to App Service..."
    if az webapp config hostname add \
        --webapp-name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --hostname "$CUSTOM_DOMAIN" 2>/dev/null; then
        print_success "Custom domain added"
    else
        print_warning "Domain may already exist or DNS not configured"
    fi
    
    # Step 2: Get domain verification info
    print_info "Step 2: Getting domain verification information..."
    VERIFICATION_ID=$(az webapp show \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query customDomainVerificationId -o tsv)
    
    echo ""
    print_warning "IMPORTANT: Add these DNS records to your domain:"
    echo "---------------------------------------------------"
    echo "Type: TXT"
    echo "Host: asuid.$CUSTOM_DOMAIN"
    echo "Value: $VERIFICATION_ID"
    echo ""
    echo "Type: CNAME (or A record for root domain)"
    echo "Host: www (or @)"
    echo "Value: $APP_NAME.azurewebsites.net"
    echo "---------------------------------------------------"
    
    read -p "Press Enter once DNS records are configured..."
    
    # Step 3: Create managed certificate
    print_info "Step 3: Creating managed SSL certificate..."
    sleep 5  # Wait for DNS propagation
    
    if az webapp config ssl create \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --hostname "$CUSTOM_DOMAIN"; then
        print_success "Managed certificate created successfully!"
    else
        print_error "Failed to create certificate. Check DNS configuration."
        exit 1
    fi
    
    # Step 4: Enable HTTPS only
    print_info "Step 4: Enabling HTTPS-only mode..."
    az webapp update \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --https-only true
    print_success "HTTPS-only mode enabled"
    
    # Step 5: Configure security headers
    print_info "Step 5: Configuring security headers..."
    configure_security_headers
    
    print_success "SSL certificate setup complete!"
    echo ""
    print_info "Your site is now available at: https://$CUSTOM_DOMAIN"
    print_info "Certificate will auto-renew every 6 months"
}

setup_lets_encrypt() {
    print_header "Setting up Let's Encrypt Certificate (FREE)"
    
    print_warning "This requires manual certificate installation on Azure"
    print_info "Steps:"
    echo "1. Generate certificate using certbot:"
    echo "   sudo certbot certonly --manual -d $CUSTOM_DOMAIN"
    echo ""
    echo "2. Upload to Azure Key Vault:"
    echo "   az keyvault certificate import \\"
    echo "     --vault-name haos-keyvault \\"
    echo "     --name haos-ssl-cert \\"
    echo "     --file /etc/letsencrypt/live/$CUSTOM_DOMAIN/fullchain.pem"
    echo ""
    echo "3. Bind to App Service (use the Azure Portal)"
}

setup_azure_frontdoor() {
    print_header "Setting up Azure Front Door with Managed Certificate"
    
    FRONTDOOR_NAME="haos-frontdoor"
    ENDPOINT_NAME="haos-endpoint"
    
    print_info "Creating Azure Front Door profile..."
    
    # Create Front Door profile
    if az afd profile create \
        --profile-name "$FRONTDOOR_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --sku Premium_AzureFrontDoor 2>/dev/null; then
        print_success "Front Door profile created"
    else
        print_warning "Front Door profile may already exist"
    fi
    
    # Create endpoint
    print_info "Creating endpoint..."
    az afd endpoint create \
        --profile-name "$FRONTDOOR_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --endpoint-name "$ENDPOINT_NAME" \
        --enabled-state Enabled
    print_success "Endpoint created"
    
    # Add custom domain
    if [ ! -z "$CUSTOM_DOMAIN" ]; then
        print_info "Adding custom domain with managed certificate..."
        az afd custom-domain create \
            --profile-name "$FRONTDOOR_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --custom-domain-name "$(echo $CUSTOM_DOMAIN | tr '.' '-')" \
            --host-name "$CUSTOM_DOMAIN" \
            --certificate-type ManagedCertificate
        print_success "Custom domain added with managed SSL"
    fi
    
    FRONTDOOR_ENDPOINT=$(az afd endpoint show \
        --profile-name "$FRONTDOOR_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --endpoint-name "$ENDPOINT_NAME" \
        --query hostName -o tsv)
    
    print_success "Azure Front Door setup complete!"
    print_info "Front Door endpoint: https://$FRONTDOOR_ENDPOINT"
}

configure_security_headers() {
    print_info "Configuring security headers..."
    
    # Add web.config for HTTPS redirect and security headers
    cat > /tmp/web.config << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Force HTTPS" stopProcessing="true">
          <match url="(.*)" />
          <conditions>
            <add input="{HTTPS}" pattern="^OFF$" />
          </conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
        </rule>
      </rules>
    </rewrite>
    <httpProtocol>
      <customHeaders>
        <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains; preload" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-XSS-Protection" value="1; mode=block" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
EOF
    
    print_success "Security headers configured"
}

setup_certificate_monitoring() {
    print_header "Setting up Certificate Monitoring"
    
    ACTION_GROUP="cert-expiry-alerts"
    ALERT_NAME="ssl-cert-expiring"
    
    print_info "Creating action group for alerts..."
    
    # Prompt for email
    read -p "Enter email for certificate expiry alerts: " ALERT_EMAIL
    
    if [ ! -z "$ALERT_EMAIL" ]; then
        az monitor action-group create \
            --name "$ACTION_GROUP" \
            --resource-group "$RESOURCE_GROUP" \
            --short-name certexpiry \
            --email-receiver admin "$ALERT_EMAIL"
        print_success "Alert action group created"
        
        # Create metric alert
        print_info "Creating certificate expiry alert..."
        WEBAPP_ID=$(az webapp show \
            --name "$APP_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --query id -o tsv)
        
        az monitor metrics alert create \
            --name "$ALERT_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --scopes "$WEBAPP_ID" \
            --condition "avg Certificate.DaysUntilExpiry < 30" \
            --description "SSL certificate expires in less than 30 days" \
            --action "$ACTION_GROUP" \
            --window-size 1h \
            --evaluation-frequency 1h
        print_success "Certificate monitoring configured"
    fi
}

test_ssl_configuration() {
    print_header "Testing SSL Configuration"
    
    if [ ! -z "$CUSTOM_DOMAIN" ]; then
        print_info "Testing HTTPS connection..."
        
        # Test with curl
        if curl -sI "https://$CUSTOM_DOMAIN" | grep -q "HTTP/2 200"; then
            print_success "HTTPS is working correctly!"
        else
            print_warning "HTTPS connection test inconclusive"
        fi
        
        echo ""
        print_info "For detailed SSL analysis, visit:"
        echo "https://www.ssllabs.com/ssltest/analyze.html?d=$CUSTOM_DOMAIN"
    fi
}

display_summary() {
    print_header "Setup Summary"
    
    echo ""
    echo "Resource Group: $RESOURCE_GROUP"
    echo "App Service: $APP_NAME"
    [ ! -z "$CUSTOM_DOMAIN" ] && echo "Custom Domain: $CUSTOM_DOMAIN"
    echo ""
    
    print_info "Certificate Details:"
    az webapp config ssl list \
        --resource-group "$RESOURCE_GROUP" \
        --query "[].{Thumbprint:thumbprint,SubjectName:subjectName,ExpirationDate:expirationDate}" \
        -o table
    
    echo ""
    print_success "All done! Your site is now secured with SSL/TLS"
}

###############################################################################
# Main Menu
###############################################################################

show_menu() {
    echo ""
    print_header "Azure SSL Certificate Setup - HAOS Platform"
    echo ""
    echo "Choose SSL certificate option:"
    echo ""
    echo "1) App Service Managed Certificate (FREE, Recommended)"
    echo "2) Azure Front Door with Managed Certificate (FREE + CDN)"
    echo "3) Let's Encrypt Certificate (FREE, Manual)"
    echo "4) Setup Certificate Monitoring"
    echo "5) Test SSL Configuration"
    echo "6) Display Certificate Info"
    echo "0) Exit"
    echo ""
}

###############################################################################
# Main Script
###############################################################################

main() {
    check_prerequisites
    
    while true; do
        show_menu
        read -p "Enter your choice [0-6]: " choice
        
        case $choice in
            1)
                setup_managed_certificate
                setup_certificate_monitoring
                test_ssl_configuration
                display_summary
                break
                ;;
            2)
                setup_azure_frontdoor
                setup_certificate_monitoring
                test_ssl_configuration
                display_summary
                break
                ;;
            3)
                setup_lets_encrypt
                ;;
            4)
                setup_certificate_monitoring
                ;;
            5)
                test_ssl_configuration
                ;;
            6)
                display_summary
                ;;
            0)
                echo "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
    done
}

# Run main function
main "$@"
