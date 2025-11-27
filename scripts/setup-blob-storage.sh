#!/bin/bash
# =============================================================================
# Azure Blob Storage Setup Script
# Creates storage account and container for HAOS.fm track uploads
# =============================================================================

set -e  # Exit on error

# Configuration
RESOURCE_GROUP="haos-fm-rg"
LOCATION="eastus"
STORAGE_ACCOUNT="haosfmstorage"
CONTAINER_NAME="tracks"

echo "🚀 Setting up Azure Blob Storage for HAOS.fm"
echo "=============================================="
echo ""

# Check if already logged in
if ! az account show &>/dev/null; then
    echo "📝 Please login to Azure..."
    az login
fi

# Get subscription info
SUBSCRIPTION=$(az account show --query name -o tsv)
echo "✅ Using subscription: $SUBSCRIPTION"
echo ""

# Create or get resource group
echo "📦 Checking resource group: $RESOURCE_GROUP"
if az group show --name $RESOURCE_GROUP &>/dev/null; then
    echo "✅ Resource group exists"
else
    echo "📝 Creating resource group..."
    az group create --name $RESOURCE_GROUP --location $LOCATION
    echo "✅ Resource group created"
fi
echo ""

# Create or get storage account
echo "💾 Checking storage account: $STORAGE_ACCOUNT"
if az storage account show --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP &>/dev/null; then
    echo "✅ Storage account exists"
else
    echo "📝 Creating storage account..."
    az storage account create \
        --name $STORAGE_ACCOUNT \
        --resource-group $RESOURCE_GROUP \
        --location $LOCATION \
        --sku Standard_LRS \
        --kind StorageV2 \
        --allow-blob-public-access true
    echo "✅ Storage account created"
fi
echo ""

# Get connection string
echo "🔑 Getting storage connection string..."
CONNECTION_STRING=$(az storage account show-connection-string \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --query connectionString \
    --output tsv)
echo "✅ Connection string retrieved"
echo ""

# Create container with public blob access
echo "📁 Checking container: $CONTAINER_NAME"
CONTAINER_EXISTS=$(az storage container exists \
    --name $CONTAINER_NAME \
    --connection-string "$CONNECTION_STRING" \
    --query exists \
    --output tsv)

if [ "$CONTAINER_EXISTS" = "true" ]; then
    echo "✅ Container exists"
else
    echo "📝 Creating container with public blob access..."
    az storage container create \
        --name $CONTAINER_NAME \
        --connection-string "$CONNECTION_STRING" \
        --public-access blob
    echo "✅ Container created"
fi
echo ""

# Test blob upload
echo "🧪 Testing blob upload..."
TEST_FILE=$(mktemp)
echo "HAOS.fm Test Audio File" > $TEST_FILE
az storage blob upload \
    --container-name $CONTAINER_NAME \
    --name "test-upload.txt" \
    --file $TEST_FILE \
    --connection-string "$CONNECTION_STRING" \
    --overwrite \
    > /dev/null
rm $TEST_FILE

# Get test blob URL
TEST_URL="https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/test-upload.txt"
echo "✅ Test upload successful: $TEST_URL"
echo ""

# Clean up test file
az storage blob delete \
    --container-name $CONTAINER_NAME \
    --name "test-upload.txt" \
    --connection-string "$CONNECTION_STRING" \
    > /dev/null
echo "🗑️  Test file cleaned up"
echo ""

# Summary
echo "✅ Azure Blob Storage Setup Complete!"
echo "======================================"
echo ""
echo "📋 Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Storage Account: $STORAGE_ACCOUNT"
echo "   Container: $CONTAINER_NAME"
echo "   Location: $LOCATION"
echo ""
echo "🔧 Next Steps:"
echo ""
echo "1. Add to your local .env file:"
echo "   AZURE_STORAGE_CONNECTION_STRING=\"$CONNECTION_STRING\""
echo "   AZURE_STORAGE_CONTAINER_NAME=\"$CONTAINER_NAME\""
echo ""
echo "2. Add to Azure App Service configuration:"
echo "   az webapp config appsettings set \\"
echo "     --name <your-app-name> \\"
echo "     --resource-group $RESOURCE_GROUP \\"
echo "     --settings \\"
echo "     AZURE_STORAGE_CONNECTION_STRING=\"$CONNECTION_STRING\" \\"
echo "     AZURE_STORAGE_CONTAINER_NAME=\"$CONTAINER_NAME\""
echo ""
echo "3. Redeploy your application to use blob storage"
echo ""
echo "💡 Blob Storage URL pattern:"
echo "   https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/<filename>"
echo ""
