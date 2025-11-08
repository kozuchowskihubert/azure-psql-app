# Deployment Scripts

This directory contains automation scripts for deploying and managing the Azure PostgreSQL application.

## Scripts

### deploy.sh

**Primary deployment script** - handles infrastructure, Docker image build/push, and verification.

**Usage:**
```bash
# Full deployment (infrastructure + image)
./scripts/deploy.sh all

# Deploy infrastructure only
./scripts/deploy.sh infra

# Build and push Docker image only
./scripts/deploy.sh image

# Verify deployment
./scripts/deploy.sh verify

# Show help
./scripts/deploy.sh help
```

**What it does:**
- ✅ Checks all prerequisites (Azure CLI, Terraform, Docker, jq)
- ✅ Authenticates with Azure Container Registry
- ✅ Deploys/updates Terraform infrastructure
- ✅ Builds Docker image with proper tagging
- ✅ Pushes image to Azure Container Registry
- ✅ Verifies application health

**Prerequisites:**
- Azure CLI authenticated (`az login`)
- Terraform installed (v1.5+)
- Docker Desktop running
- `jq` installed (`brew install jq`)
- Valid `terraform.tfvars` in the `infra/` directory

**Environment Variables:**
- `IMAGE_TAG` - Docker image tag (default: `latest`)

**Examples:**
```bash
# Deploy everything
./scripts/deploy.sh all

# Deploy only infrastructure changes
./scripts/deploy.sh infra

# Rebuild and push new image version
IMAGE_TAG=v1.2.3 ./scripts/deploy.sh image
```

### run-local.sh

Runs the application locally using Docker for development and testing.

**Usage:**
```bash
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
./scripts/run-local.sh
```

**What it does:**
- Builds Docker image locally
- Runs container on port 3000
- Connects to specified PostgreSQL database

### permissions.ps1

PowerShell script to assign Azure AD roles to service principals (requires organizational account).

**Usage:**
```powershell
pwsh ./scripts/permissions.ps1
```

## Quick Start

### First Time Deployment

```bash
# 1. Ensure prerequisites
az login
open -a Docker  # Start Docker Desktop

# 2. Configure Terraform variables
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 3. Deploy everything
cd ..
./scripts/deploy.sh all
```

### Update Application

```bash
# Make your code changes, then:
./scripts/deploy.sh image
```

### Update Infrastructure

```bash
# Update Terraform files, then:
./scripts/deploy.sh infra
```

## Manual Terraform Commands

If you prefer manual control:

```bash
cd infra

# Initialize
terraform init -upgrade

# Plan changes
terraform plan -var-file=terraform.tfvars -out=tfplan

# Apply changes
terraform apply tfplan

# Destroy (use with caution!)
terraform destroy -var-file=terraform.tfvars
```

## Troubleshooting

### Docker Not Running
```bash
# Start Docker Desktop
open -a Docker

# Verify it's running
docker ps
```

### ACR Authentication Failed
```bash
# Login to Azure
az login

# Login to ACR
az acr login --name notesappdevacr
```

### Azure Authentication Issues
```bash
# Check current account
az account show

# Switch subscription if needed
az account set --subscription "86114ec0-54f1-4cf5-85f1-b561b90bbe0b"

# Re-authenticate
az login
```

### Terraform State Lock
```bash
cd infra
terraform force-unlock <LOCK_ID>
```

## CI/CD Integration

For automated deployments, see:
- `.github/workflows/deploy.yml` - GitHub Actions deployment workflow
- `docs/DEPLOYMENT.md` - Comprehensive deployment guide
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
