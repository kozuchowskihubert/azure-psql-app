# Using Act to Test GitHub Actions Locally

This guide shows you how to use **act** to run your GitHub Actions workflows locally.

## What is Act?

Act runs your GitHub Actions locally using Docker containers. It's perfect for:
- Testing workflows before pushing to GitHub
- Debugging workflow issues
- Saving GitHub Actions minutes
- Faster iteration during development

## Quick Start

### 1. Install Act

```bash
# Already installed!
brew install act
```

### 2. Set Up Secrets

```bash
# Copy the example secrets file
cp .secrets.example .secrets

# Edit with your actual values
nano .secrets
```

**Required secrets in `.secrets`:**
```bash
AZURE_CREDENTIALS={"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}
ARM_CLIENT_ID=your-client-id
ARM_CLIENT_SECRET=your-client-secret
ARM_SUBSCRIPTION_ID=your-subscription-id
ARM_TENANT_ID=your-tenant-id
DB_PASSWORD=your-database-password
```

### 3. Run Workflows

```bash
# List all available workflows
act -l

# Run validation only (fast, ~2 min)
./scripts/run-act.sh validate

# Run build job only (~5 min)
./scripts/run-act.sh build

# Run complete pipeline (~30 min)
./scripts/run-act.sh all
```

## Usage Examples

### List All Workflows and Jobs

```bash
act -l
```

Output shows:
- Stage (execution order)
- Job ID
- Job name
- Workflow name
- Events that trigger it

### Run Validation Job

**Fast (~2 minutes)** - Perfect for pre-commit testing

```bash
# Using helper script
./scripts/run-act.sh validate

# Or directly with act
act push -j validate
```

Tests:
- ✅ Node.js linting
- ✅ Unit tests
- ✅ Terraform formatting
- ✅ Terraform validation

### Run Build Job

**Medium (~5 minutes)** - Test Docker build

```bash
# Using helper script
./scripts/run-act.sh build

# With verbose output
./scripts/run-act.sh build -v
```

This will:
- ✅ Build Docker image
- ✅ Authenticate with ACR
- ✅ Push to Azure Container Registry

### Dry Run (See What Would Execute)

```bash
# See what would run without actually running
act push --dry-run

# Dry run specific job
./scripts/run-act.sh validate --dry-run
```

### Run Complete Pipeline

**Long (~30 minutes)** - Full workflow test

```bash
# Run everything
./scripts/run-act.sh all

# With container reuse for faster subsequent runs
act push --reuse
```

### Simulate Pull Request

```bash
# Run validation-only workflow
./scripts/run-act.sh pull-request

# Or directly
act pull_request
```

### Run Specific Job

```bash
# Run infrastructure deployment job
act push -j deploy-infrastructure

# Run with verbose logging
act push -j build-and-push -v
```

## Helper Script Commands

The `scripts/run-act.sh` helper script simplifies act usage:

```bash
# List workflows
./scripts/run-act.sh list

# Run validation
./scripts/run-act.sh validate

# Run build
./scripts/run-act.sh build

# Run infrastructure deployment
./scripts/run-act.sh infra

# Run complete pipeline
./scripts/run-act.sh all

# Simulate pull request
./scripts/run-act.sh pull-request

# Show help
./scripts/run-act.sh help
```

### Helper Script Options

Pass act options through the helper:

```bash
# Dry run
./scripts/run-act.sh all --dry-run

# Verbose output
./scripts/run-act.sh build -v

# Reuse containers
./scripts/run-act.sh all --reuse
```

## Configuration Files

### `.actrc`
Global act configuration (already set up):

```bash
# Use GitHub-compatible runner image
-P ubuntu-latest=catthehacker/ubuntu:act-latest

# Load secrets from file
--secret-file .secrets

# Load environment variables
--env-file .env.act

# Container architecture
--container-architecture linux/amd64

# Reuse containers for faster iterations
--reuse
```

### `.secrets`
Your GitHub secrets (create from `.secrets.example`):

```bash
cp .secrets.example .secrets
# Edit with real values
nano .secrets
```

**⚠️ Important:** `.secrets` is gitignored for security!

### `.env.act`
Environment variables for act (already configured):

```bash
ACR_NAME=notesappdevacr
IMAGE_NAME=notesapp
AZURE_REGION=westeurope
GITHUB_REPOSITORY=kozuchowskihubert/azure-psql-app
```

## Getting Secrets

### Method 1: Using Existing Service Principal

If you already have a service principal:

```bash
# Get subscription and tenant IDs
ARM_SUBSCRIPTION_ID=$(az account show --query id -o tsv)
ARM_TENANT_ID=$(az account show --query tenantId -o tsv)

# Get service principal ID (if you know the app name)
ARM_CLIENT_ID=$(az ad sp list --display-name "your-sp-name" --query "[0].appId" -o tsv)

# Reset and get new secret
ARM_CLIENT_SECRET=$(az ad sp credential reset --id $ARM_CLIENT_ID --query password -o tsv)

# Create AZURE_CREDENTIALS JSON
cat > azure-creds.json << EOF
{
  "clientId": "$ARM_CLIENT_ID",
  "clientSecret": "$ARM_CLIENT_SECRET",
  "subscriptionId": "$ARM_SUBSCRIPTION_ID",
  "tenantId": "$ARM_TENANT_ID",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
EOF

# Copy to .secrets file
echo "AZURE_CREDENTIALS=$(cat azure-creds.json | tr -d '\n')" >> .secrets
echo "ARM_CLIENT_ID=$ARM_CLIENT_ID" >> .secrets
echo "ARM_CLIENT_SECRET=$ARM_CLIENT_SECRET" >> .secrets
echo "ARM_SUBSCRIPTION_ID=$ARM_SUBSCRIPTION_ID" >> .secrets
echo "ARM_TENANT_ID=$ARM_TENANT_ID" >> .secrets
echo "DB_PASSWORD=YourSecurePassword123!" >> .secrets

# Clean up
rm azure-creds.json
```

### Method 2: Create New Service Principal

```bash
# Create new service principal for act testing
az ad sp create-for-rbac \
  --name "act-local-testing" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/notesapp-dev-rg \
  --sdk-auth > azure-creds.json

# Extract values and add to .secrets
CLIENT_ID=$(cat azure-creds.json | jq -r '.clientId')
CLIENT_SECRET=$(cat azure-creds.json | jq -r '.clientSecret')
SUBSCRIPTION_ID=$(cat azure-creds.json | jq -r '.subscriptionId')
TENANT_ID=$(cat azure-creds.json | jq -r '.tenantId')

cat > .secrets << EOF
AZURE_CREDENTIALS=$(cat azure-creds.json | tr -d '\n')
ARM_CLIENT_ID=$CLIENT_ID
ARM_CLIENT_SECRET=$CLIENT_SECRET
ARM_SUBSCRIPTION_ID=$SUBSCRIPTION_ID
ARM_TENANT_ID=$TENANT_ID
DB_PASSWORD=YourSecurePassword123!
EOF

# Clean up
rm azure-creds.json
```

## Comparison: act vs test-cicd-local.sh

| Feature | act | test-cicd-local.sh |
|---------|-----|-------------------|
| **Accuracy** | 🎯 Runs actual GHA workflow | ~95% similar |
| **Setup** | Requires Docker + secrets | Uses local Azure CLI |
| **Speed** | Slower (Docker overhead) | Faster (native) |
| **Isolation** | ✅ Isolated containers | ❌ Uses your environment |
| **Debugging** | Harder (container logs) | Easier (direct access) |
| **Best For** | Final validation | Quick iteration |

## Recommended Workflow

```bash
# 1. Quick validation during development
./scripts/test-cicd-local.sh validate

# 2. Test Docker build
./scripts/test-cicd-local.sh build -s

# 3. Final validation with act before pushing
./scripts/run-act.sh validate

# 4. If everything passes, push to GitHub
git push origin main
```

## Troubleshooting

### "Error: Cannot connect to Docker daemon"

```bash
# Start Docker Desktop
open -a Docker

# Verify Docker is running
docker ps
```

### "Error: .secrets file not found"

```bash
# Create secrets file
cp .secrets.example .secrets

# Edit with your values
nano .secrets
```

### "Error: Cannot pull Docker image"

Act downloads runner images on first run. This can take time:

```bash
# Pre-pull the image
docker pull catthehacker/ubuntu:act-latest
```

### "Error: Job failed"

Use verbose mode to see detailed logs:

```bash
./scripts/run-act.sh validate -v
```

### Workflow runs but fails

Check the actual error in the output. Common issues:
- Missing or incorrect secrets
- Azure authentication failures
- Terraform state issues

## Advanced Usage

### Run with Different Events

```bash
# Push event (default)
act push

# Pull request event
act pull_request

# Workflow dispatch (manual trigger)
act workflow_dispatch

# Specific event with inputs
act workflow_dispatch --input environment=dev
```

### Override Default Runner

```bash
# Use specific Docker image
act -P ubuntu-latest=ubuntu:latest

# Use multiple platforms
act -P ubuntu-latest=catthehacker/ubuntu:act-latest \
    -P macos-latest=catthehacker/macos:latest
```

### Debug Mode

```bash
# Very verbose output
act push -v

# Keep containers after run for inspection
act push --rm=false

# Enter container for debugging
docker exec -it act-... bash
```

### Run Specific Workflow File

```bash
# Run specific workflow
act -W .github/workflows/ci-cd.yml

# List jobs in specific workflow
act -W .github/workflows/ci-cd.yml -l
```

## Performance Tips

### Faster Iterations

```bash
# Reuse containers between runs
act push --reuse

# Add to .actrc for automatic reuse
echo "--reuse" >> .actrc
```

### Pre-pull Images

```bash
# Pull runner image beforehand
docker pull catthehacker/ubuntu:act-latest
```

### Limit Job Execution

```bash
# Run only one job
act push -j validate

# Run up to a specific stage
# (not directly supported, but you can modify workflow temporarily)
```

## Next Steps

- Configure `.secrets` with your credentials
- Run `./scripts/run-act.sh list` to see available jobs
- Start with `./scripts/run-act.sh validate`
- Review output and fix any issues
- Progress to `./scripts/run-act.sh all` for full testing

## Resources

- [Act Documentation](https://github.com/nektos/act)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Local CI/CD Testing Guide](./LOCAL_CICD_TESTING.md)
- [Secrets Setup Guide](../.github/SECRETS_SETUP.md)
