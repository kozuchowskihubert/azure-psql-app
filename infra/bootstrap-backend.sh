#!/bin/bash
# =============================================================================
# Bootstrap Terraform Backend Storage Account
# =============================================================================
# This script creates the Azure Storage Account needed for Terraform remote
# state backend. This is a one-time setup required before Terraform can use
# remote state.
#
# Prerequisites:
#   - Azure CLI installed and authenticated (az login)
#   - Contributor access to subscription
#
# Usage:
#   ./bootstrap-backend.sh
# =============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="notesapp-dev-rg"
STORAGE_ACCOUNT="tfstatenotesapp"
CONTAINER_NAME="tfstate"
CONTAINER_NAME_MUSIC="tfstate-music"
LOCATION="westus2"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Terraform Backend Bootstrap Script                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed${NC}"
    echo "   Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
echo -e "${YELLOW}🔐 Checking Azure authentication...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Azure${NC}"
    echo "   Please run: az login"
    exit 1
fi

ACCOUNT_NAME=$(az account show --query name -o tsv)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo -e "${GREEN}✅ Logged in to: $ACCOUNT_NAME${NC}"
echo -e "${BLUE}   Subscription: $SUBSCRIPTION_ID${NC}"
echo ""

# Create Resource Group
echo -e "${YELLOW}📦 Creating resource group: $RESOURCE_GROUP${NC}"
if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo -e "${GREEN}✅ Resource group already exists${NC}"
else
    az group create \
        --name "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --output none
    echo -e "${GREEN}✅ Resource group created${NC}"
fi
echo ""

# Create Storage Account
echo -e "${YELLOW}💾 Creating storage account: $STORAGE_ACCOUNT${NC}"
if az storage account show --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    echo -e "${GREEN}✅ Storage account already exists${NC}"
else
    az storage account create \
        --name "$STORAGE_ACCOUNT" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku Standard_LRS \
        --encryption-services blob \
        --https-only true \
        --min-tls-version TLS1_2 \
        --allow-blob-public-access false \
        --output none
    echo -e "${GREEN}✅ Storage account created${NC}"
fi
echo ""

# Get Storage Account Key
echo -e "${YELLOW}🔑 Retrieving storage account key...${NC}"
ACCOUNT_KEY=$(az storage account keys list \
    --resource-group "$RESOURCE_GROUP" \
    --account-name "$STORAGE_ACCOUNT" \
    --query '[0].value' \
    --output tsv)
echo -e "${GREEN}✅ Storage account key retrieved${NC}"
echo ""

# Create Container for main Terraform state
echo -e "${YELLOW}📁 Creating storage container: $CONTAINER_NAME${NC}"
if az storage container show \
    --name "$CONTAINER_NAME" \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$ACCOUNT_KEY" &> /dev/null; then
    echo -e "${GREEN}✅ Container already exists${NC}"
else
    az storage container create \
        --name "$CONTAINER_NAME" \
        --account-name "$STORAGE_ACCOUNT" \
        --account-key "$ACCOUNT_KEY" \
        --output none
    echo -e "${GREEN}✅ Container created${NC}"
fi
echo ""

# Create Container for music app Terraform state
echo -e "${YELLOW}📁 Creating storage container: $CONTAINER_NAME_MUSIC${NC}"
if az storage container show \
    --name "$CONTAINER_NAME_MUSIC" \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$ACCOUNT_KEY" &> /dev/null; then
    echo -e "${GREEN}✅ Container already exists${NC}"
else
    az storage container create \
        --name "$CONTAINER_NAME_MUSIC" \
        --account-name "$STORAGE_ACCOUNT" \
        --account-key "$ACCOUNT_KEY" \
        --output none
    echo -e "${GREEN}✅ Container created${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Bootstrap Complete! ✅                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Terraform backend is ready to use:${NC}"
echo ""
echo -e "  ${YELLOW}Resource Group:${NC}      $RESOURCE_GROUP"
echo -e "  ${YELLOW}Storage Account:${NC}     $STORAGE_ACCOUNT"
echo -e "  ${YELLOW}Container (main):${NC}    $CONTAINER_NAME"
echo -e "  ${YELLOW}Container (music):${NC}   $CONTAINER_NAME_MUSIC"
echo -e "  ${YELLOW}Location:${NC}            $LOCATION"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Add this to GitHub Secrets:"
echo -e "     ${YELLOW}ARM_ACCESS_KEY${NC} = (use value below)"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Save this key securely!${NC}"
echo -e "${YELLOW}ARM_ACCESS_KEY:${NC}"
echo -e "${GREEN}$ACCOUNT_KEY${NC}"
echo ""
echo -e "  2. Run Terraform:"
echo -e "     ${BLUE}cd infra${NC}"
echo -e "     ${BLUE}terraform init${NC}"
echo -e "     ${BLUE}terraform plan${NC}"
echo ""
