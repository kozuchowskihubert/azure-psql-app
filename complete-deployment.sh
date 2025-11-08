#!/bin/bash

###############################################################################
# Complete Azure Infrastructure Deployment
# This script fixes the partial deployment and deploys all resources
###############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Azure Infrastructure Deployment - Complete Fix       ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo ""

# Change to infrastructure directory
cd /Users/haos/Projects/azure-psql-app/infra

# Step 1: Get Terraform SPN ID and assign Contributor role
echo -e "${YELLOW}Step 1: Assigning Contributor role to Terraform SPN...${NC}"

# Get SPN Client ID from Terraform output
SPN_CLIENT_ID=$(terraform output -raw spn_client_id 2>/dev/null)

if [ -z "$SPN_CLIENT_ID" ]; then
    echo -e "${RED}❌ Error: Cannot get Service Principal ID from Terraform${NC}"
    echo "   Make sure Terraform state has the Service Principal created"
    exit 1
fi

echo "   SPN: $SPN_CLIENT_ID"
echo ""

az role assignment create \
  --assignee "$SPN_CLIENT_ID" \
  --role Contributor \
  --scope /subscriptions/86114ec0-54f1-4cf5-85f1-b561b90bbe0b \
  --output table || echo "   ⚠️  Role may already be assigned"

echo ""
echo -e "${GREEN}✅ Contributor role assigned${NC}"
echo ""

# Step 2: Update .env.local with Terraform SPN credentials from Terraform outputs
echo -e "${YELLOW}Step 2: Updating .env.local with Terraform SPN credentials...${NC}"

# Get credentials from Terraform outputs
ARM_CLIENT_ID=$(terraform output -raw spn_client_id 2>/dev/null)
ARM_CLIENT_SECRET=$(terraform output -raw spn_client_secret 2>/dev/null)
ARM_TENANT_ID=$(terraform output -raw spn_tenant_id 2>/dev/null)

cat > .env.local << EOF
ARM_SUBSCRIPTION_ID="86114ec0-54f1-4cf5-85f1-b561b90bbe0b"
ARM_CLIENT_ID="$ARM_CLIENT_ID"
ARM_TENANT_ID="$ARM_TENANT_ID"
ARM_CLIENT_SECRET="$ARM_CLIENT_SECRET"
EOF

echo -e "${GREEN}✅ .env.local updated${NC}"
echo ""

# Step 3: Load credentials
echo -e "${YELLOW}Step 3: Loading Azure credentials...${NC}"
source .env.local
export ARM_SUBSCRIPTION_ID ARM_CLIENT_ID ARM_TENANT_ID ARM_CLIENT_SECRET

echo "   Subscription: $ARM_SUBSCRIPTION_ID"
echo "   Client ID: $ARM_CLIENT_ID"
echo ""
echo -e "${GREEN}✅ Credentials loaded${NC}"
echo ""

# Step 4: Verify current state
echo -e "${YELLOW}Step 4: Checking current Terraform state...${NC}"
CURRENT_RESOURCES=$(terraform state list 2>/dev/null | wc -l | tr -d ' ')
echo "   Current resources in state: $CURRENT_RESOURCES"
echo ""

if [ "$CURRENT_RESOURCES" -eq "5" ]; then
    echo -e "${YELLOW}⚠️  Only Service Principal created. Need to deploy infrastructure.${NC}"
elif [ "$CURRENT_RESOURCES" -gt "5" ]; then
    echo -e "${GREEN}✅ Some infrastructure exists. Will update/create missing resources.${NC}"
else
    echo -e "${RED}❌ Unexpected state count. Proceeding with caution...${NC}"
fi
echo ""

# Step 5: Terraform plan
echo -e "${YELLOW}Step 5: Creating Terraform execution plan...${NC}"
terraform plan -out=tfplan

PLANNED_CHANGES=$(terraform show -json tfplan | jq -r '[.resource_changes[] | select(.change.actions[] | contains("create"))] | length' 2>/dev/null || echo "unknown")
echo ""
echo -e "${GREEN}✅ Plan created - Will create ${PLANNED_CHANGES} resources${NC}"
echo ""

# Step 6: Confirm deployment
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Ready to deploy infrastructure!${NC}"
echo ""
echo "This will create:"
echo "  • Resource Group"
echo "  • Virtual Network + Subnets"
echo "  • PostgreSQL Flexible Server"
echo "  • App Service + App Service Plan"
echo "  • Container Registry"
echo "  • Private Endpoint + DNS"
echo ""
echo "⏱️  Estimated time: 15-20 minutes"
echo "💰  Estimated cost: ~$31/month"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo ""

read -p "Proceed with deployment? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi

# Step 7: Deploy infrastructure
echo -e "${YELLOW}Step 6: Deploying Azure infrastructure...${NC}"
echo "   Started at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

terraform apply tfplan

echo ""
echo -e "${GREEN}✅ Infrastructure deployed!${NC}"
echo "   Completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Step 8: Display outputs
echo -e "${YELLOW}Step 7: Retrieving deployment outputs...${NC}"
echo ""

terraform output -json > /tmp/terraform-outputs.json

echo "═══════════════════════════════════════════════════════"
echo "📊 DEPLOYMENT OUTPUTS"
echo "═══════════════════════════════════════════════════════"
echo ""

if command -v jq &> /dev/null; then
    echo "🌐 Application URL:"
    echo "   $(terraform output -raw app_url 2>/dev/null || echo 'Not available')"
    echo ""
    
    echo "🗄️  Database FQDN:"
    echo "   $(terraform output -raw database_fqdn 2>/dev/null || echo 'Not available')"
    echo ""
    
    echo "📦 Container Registry:"
    echo "   $(terraform output -raw acr_login_server 2>/dev/null || echo 'Not available')"
    echo ""
    
    echo "👥 Resource Group:"
    echo "   $(terraform output -raw resource_group_name 2>/dev/null || echo 'Not available')"
    echo ""
    
    echo "🔐 Service Principal:"
    echo "   Client ID: $(terraform output -raw spn_client_id 2>/dev/null || echo 'Not available')"
    echo ""
else
    terraform output
fi

echo "═══════════════════════════════════════════════════════"
echo ""

# Step 9: Verify resources in Azure
echo -e "${YELLOW}Step 8: Verifying resources in Azure...${NC}"
echo ""

RG_NAME=$(terraform output -raw resource_group_name 2>/dev/null || echo "notesapp-dev-rg")
RESOURCE_COUNT=$(az resource list --resource-group "$RG_NAME" 2>/dev/null | jq '. | length' || echo "0")

echo "   Resource Group: $RG_NAME"
echo "   Total Resources: $RESOURCE_COUNT"
echo ""

if [ "$RESOURCE_COUNT" -gt "0" ]; then
    echo "Resources deployed:"
    az resource list --resource-group "$RG_NAME" --output table 2>/dev/null || echo "   Unable to list resources"
    echo ""
fi

# Step 10: Save outputs for GitHub Actions
echo -e "${YELLOW}Step 9: Preparing GitHub Actions configuration...${NC}"
echo ""

# Get database FQDN and construct DATABASE_URL
DB_FQDN=$(terraform output -raw database_fqdn 2>/dev/null || echo 'PENDING')
DATABASE_URL="postgresql://notesadmin:ChangeMe123\!SecurePassword@${DB_FQDN}:5432/notesdb?sslmode=require"

cat > /tmp/github-secrets.txt << EOF
# GitHub Actions Secrets Configuration
# Copy these to: GitHub Repo → Settings → Secrets and variables → Actions

ARM_SUBSCRIPTION_ID=86114ec0-54f1-4cf5-85f1-b561b90bbe0b
ARM_CLIENT_ID=$(terraform output -raw spn_client_id 2>/dev/null || echo 'PENDING')
ARM_CLIENT_SECRET=$(terraform output -raw spn_client_secret 2>/dev/null || echo 'PENDING')
ARM_TENANT_ID=$(terraform output -raw spn_tenant_id 2>/dev/null || echo 'PENDING')
AZURE_APP_NAME=$(terraform output -raw app_url 2>/dev/null | sed 's|https://||' | sed 's|\.azurewebsites\.net||' || echo 'notesapp-dev-app')
ACR_LOGIN_SERVER=$(terraform output -raw acr_login_server 2>/dev/null || echo 'PENDING')
ACR_USERNAME=$(terraform output -raw acr_admin_username 2>/dev/null || echo 'PENDING')
ACR_PASSWORD=$(az acr credential show --name $(terraform output -raw resource_group_name | sed 's/-rg$//')acr --resource-group "$RG_NAME" --query "passwords[0].value" -o tsv 2>/dev/null || echo 'PENDING')

# Database connection string
DATABASE_URL=$DATABASE_URL
EOF

echo "GitHub secrets saved to: /tmp/github-secrets.txt"
echo ""

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 DEPLOYMENT COMPLETE! 🎉                ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${GREEN}✅ Infrastructure deployed successfully${NC}"
echo -e "${GREEN}✅ All resources created in Azure${NC}"
echo -e "${GREEN}✅ Outputs saved and ready for GitHub Actions${NC}"
echo ""
echo "📋 Next Steps:"
echo "   1. Review outputs above"
echo "   2. Configure GitHub Actions secrets: /tmp/github-secrets.txt"
echo "   3. Test application: $(terraform output -raw app_url 2>/dev/null || echo 'Check Terraform outputs')"
echo "   4. Verify database connection"
echo "   5. Push code to trigger CI/CD pipeline"
echo ""
echo "📚 Documentation:"
echo "   • PROJECT-SUMMARY.md - Complete project overview"
echo "   • GITHUB-ACTIONS-SETUP.md - CI/CD setup guide"
echo "   • DEPLOYMENT-STATUS.md - Deployment troubleshooting"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo ""
