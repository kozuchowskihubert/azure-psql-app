# Infrastructure Recreation Automation

This directory contains automation scripts for managing Azure infrastructure.

## Scripts

### recreate-infrastructure.sh

Automates the complete destruction and recreation of Azure infrastructure in the correct region (West Europe).

**Usage:**
```bash
cd /Users/haos/Projects/azure-psql-app
./scripts/recreate-infrastructure.sh
```

**What it does:**
1. Prompts for confirmation before proceeding
2. Destroys all existing Terraform-managed resources
3. Cleans up state backup files
4. Re-initializes Terraform with latest providers
5. Creates a new execution plan for West Europe
6. Applies the infrastructure changes
7. Displays outputs (ACR details, App URL, etc.)

**Prerequisites:**
- Azure CLI authenticated (`az login`)
- Terraform installed
- Valid `terraform.tfvars` in the `infra/` directory
- Sufficient Azure subscription quota in West Europe region

**Important Notes:**
- This script will **destroy all existing resources** before recreating them
- Any data in the existing PostgreSQL database will be lost
- Docker images in the existing ACR will be lost (you'll need to rebuild and push)
- The script uses the `terraform.tfvars` file for configuration

### permissions.ps1

PowerShell script to assign Azure AD roles to service principals (requires organizational account).

**Usage:**
```powershell
pwsh ./scripts/permissions.ps1
```

## Manual Terraform Commands

If you prefer to run Terraform manually:

```bash
cd infra

# Destroy existing infrastructure
terraform destroy -auto-approve -var-file=terraform.tfvars

# Reinitialize
terraform init -upgrade

# Plan changes
terraform plan -var-file=terraform.tfvars -out=tfplan

# Apply changes
terraform apply tfplan
```

## Troubleshooting

### Azure Region Restrictions
If you encounter errors about region restrictions or quota limits:
1. Check your Azure subscription quotas in the Azure Portal
2. Request quota increases if needed
3. Try a different region (update `location` in `terraform.tfvars`)

### Authentication Issues
If Terraform fails to authenticate:
```bash
az login
az account show
```

Ensure you're using the correct subscription:
```bash
az account set --subscription "86114ec0-54f1-4cf5-85f1-b561b90bbe0b"
```

### State Lock Issues
If Terraform state is locked:
```bash
terraform force-unlock <LOCK_ID>
```

## Post-Recreation Steps

After successfully recreating infrastructure:

1. **Rebuild and push Docker image:**
   ```bash
   cd /Users/haos/Projects/azure-psql-app
   docker build -t <acr-name>.azurecr.io/notesapp:latest .
   az acr login --name <acr-name>
   docker push <acr-name>.azurecr.io/notesapp:latest
   ```

2. **Update GitHub Actions secrets** (if ACR credentials changed):
   - `ACR_LOGIN_SERVER`
   - `ACR_USERNAME`
   - `ACR_PASSWORD`

3. **Verify the application:**
   - Check the App Service URL from Terraform outputs
   - Test database connectivity
   - Review application logs in Azure Portal
