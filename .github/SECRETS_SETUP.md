# GitHub Secrets Setup Guide

This guide explains how to configure the required secrets for the CI/CD pipeline.

## Required Secrets

The following secrets must be configured in your GitHub repository:

### Azure Authentication Secrets

#### 1. `AZURE_CREDENTIALS`
Service Principal credentials in JSON format for Azure login.

**How to get it:**
```bash
# Create a service principal and get credentials
az ad sp create-for-rbac \
  --name "github-actions-azure-psql-app" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/notesapp-dev-rg \
  --sdk-auth
```

The output will be a JSON object like:
```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "subscriptionId": "xxx",
  "tenantId": "xxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

**Copy the entire JSON output** and add it as a secret.

#### 2. `ARM_CLIENT_ID`
The Service Principal Client ID (Application ID).

```bash
# Get from the AZURE_CREDENTIALS JSON
echo "Use the 'clientId' value from AZURE_CREDENTIALS"
```

Or:
```bash
az ad sp show --id YOUR_SERVICE_PRINCIPAL_ID --query appId -o tsv
```

#### 3. `ARM_CLIENT_SECRET`
The Service Principal Client Secret (password).

```bash
# Get from the AZURE_CREDENTIALS JSON
echo "Use the 'clientSecret' value from AZURE_CREDENTIALS"
```

Or reset it:
```bash
az ad sp credential reset --id YOUR_SERVICE_PRINCIPAL_ID --query password -o tsv
```

#### 4. `ARM_SUBSCRIPTION_ID`
Your Azure Subscription ID.

```bash
# Get your subscription ID
az account show --query id -o tsv
```

Or from AZURE_CREDENTIALS JSON: `subscriptionId`

#### 5. `ARM_TENANT_ID`
Your Azure Tenant ID.

```bash
# Get your tenant ID
az account show --query tenantId -o tsv
```

Or from AZURE_CREDENTIALS JSON: `tenantId`

### Database Secret

#### 6. `DB_PASSWORD`
The password for the PostgreSQL database administrator.

**Requirements:**
- Minimum 8 characters
- Must contain uppercase, lowercase, numbers, and special characters
- Cannot contain username

**Example:**
```
MySecureP@ssw0rd123!
```

## How to Add Secrets to GitHub

### Via GitHub Web UI

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its name and value
5. Click **Add secret**

### Via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# brew install gh

# Login to GitHub
gh auth login

# Add secrets
gh secret set AZURE_CREDENTIALS < azure-credentials.json
gh secret set ARM_CLIENT_ID --body "YOUR_CLIENT_ID"
gh secret set ARM_CLIENT_SECRET --body "YOUR_CLIENT_SECRET"
gh secret set ARM_SUBSCRIPTION_ID --body "YOUR_SUBSCRIPTION_ID"
gh secret set ARM_TENANT_ID --body "YOUR_TENANT_ID"
gh secret set DB_PASSWORD --body "YOUR_DB_PASSWORD"
```

## Quick Setup Script

Save this as `setup-secrets.sh` and run it:

```bash
#!/bin/bash
set -e

echo "GitHub Secrets Setup for Azure PostgreSQL App"
echo "=============================================="
echo ""

# Get Azure subscription info
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)

echo "Azure Subscription ID: $SUBSCRIPTION_ID"
echo "Azure Tenant ID: $TENANT_ID"
echo ""

# Create service principal
echo "Creating Service Principal..."
SP_OUTPUT=$(az ad sp create-for-rbac \
  --name "github-actions-azure-psql-app-$(date +%s)" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/notesapp-dev-rg \
  --sdk-auth)

echo "$SP_OUTPUT" > azure-credentials.json
echo "✅ Service Principal created and saved to azure-credentials.json"

# Extract values
CLIENT_ID=$(echo "$SP_OUTPUT" | jq -r '.clientId')
CLIENT_SECRET=$(echo "$SP_OUTPUT" | jq -r '.clientSecret')

echo ""
echo "Service Principal Details:"
echo "  Client ID: $CLIENT_ID"
echo "  Client Secret: ****"
echo ""

# Prompt for database password
read -s -p "Enter database password (min 8 chars, mixed case, numbers, special chars): " DB_PASSWORD
echo ""

# Validate password
if [ ${#DB_PASSWORD} -lt 8 ]; then
    echo "❌ Password must be at least 8 characters"
    exit 1
fi

echo ""
echo "Setting GitHub secrets..."

# Set secrets using GitHub CLI
gh secret set AZURE_CREDENTIALS < azure-credentials.json
gh secret set ARM_CLIENT_ID --body "$CLIENT_ID"
gh secret set ARM_CLIENT_SECRET --body "$CLIENT_SECRET"
gh secret set ARM_SUBSCRIPTION_ID --body "$SUBSCRIPTION_ID"
gh secret set ARM_TENANT_ID --body "$TENANT_ID"
gh secret set DB_PASSWORD --body "$DB_PASSWORD"

echo ""
echo "✅ All secrets configured successfully!"
echo ""
echo "You can now:"
echo "  1. Delete azure-credentials.json (it's sensitive!)"
echo "  2. Run your CI/CD pipeline"
echo ""
echo "To delete the credentials file:"
echo "  rm azure-credentials.json"
```

Make it executable and run:
```bash
chmod +x setup-secrets.sh
./setup-secrets.sh
```

## Verify Secrets

After adding secrets, verify they're set correctly:

```bash
# List all secrets (values are hidden)
gh secret list

# Expected output:
# AZURE_CREDENTIALS    Updated YYYY-MM-DD
# ARM_CLIENT_ID        Updated YYYY-MM-DD
# ARM_CLIENT_SECRET    Updated YYYY-MM-DD
# ARM_SUBSCRIPTION_ID  Updated YYYY-MM-DD
# ARM_TENANT_ID        Updated YYYY-MM-DD
# DB_PASSWORD          Updated YYYY-MM-DD
```

## Security Best Practices

1. **Never commit secrets to Git**
   - The `.gitignore` already excludes common secret files
   - Double-check before committing

2. **Rotate secrets regularly**
   - Service Principal secrets should be rotated every 90-180 days
   - Update GitHub secrets after rotation

3. **Use least privilege**
   - Service Principal should only have Contributor role on the resource group
   - Don't use Owner role unless absolutely necessary

4. **Monitor secret usage**
   - Check GitHub Actions logs for unauthorized access
   - Review Azure AD sign-in logs

5. **Delete unused service principals**
   ```bash
   # List all service principals
   az ad sp list --show-mine --query "[].{Name:displayName, AppId:appId}" -o table
   
   # Delete a service principal
   az ad sp delete --id APP_ID
   ```

## Troubleshooting

### "Authentication failed" error
- Verify `AZURE_CREDENTIALS` is valid JSON
- Check Service Principal has Contributor role
- Ensure subscription ID is correct

### "Access denied" error
- Service Principal might need additional permissions
- Grant ACR permissions:
  ```bash
  az role assignment create \
    --assignee YOUR_CLIENT_ID \
    --role AcrPush \
    --scope /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/notesapp-dev-rg/providers/Microsoft.ContainerRegistry/registries/notesappdevacr
  ```

### "Database password validation failed"
- Ensure password meets Azure requirements
- Check for special characters that might need escaping

## Additional Resources

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Azure Service Principals](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal)
- [Azure RBAC Roles](https://docs.microsoft.com/en-us/azure/role-based-access-control/built-in-roles)
