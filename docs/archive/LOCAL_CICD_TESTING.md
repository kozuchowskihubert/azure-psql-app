# Local CI/CD Testing Guide

This guide shows you how to test the CI/CD pipeline locally before pushing to GitHub Actions.

## Quick Start

```bash
# Run complete pipeline simulation
./scripts/test-cicd-local.sh all

# Run validation only (fast)
./scripts/test-cicd-local.sh validate

# Build without pushing to ACR
./scripts/test-cicd-local.sh build --skip-push
```

## Available Test Stages

### 1. Validate Only
**Fast (~30 seconds)** - Perfect for quick checks before commits

```bash
./scripts/test-cicd-local.sh validate
```

Tests:
- ✅ Required tools (Node.js, Terraform, Docker, Azure CLI)
- ✅ npm dependencies
- ✅ Code linting (if configured)
- ✅ Unit tests (if available)
- ✅ Terraform formatting
- ✅ Terraform configuration validation

### 2. Build & Push
**Medium (~2-5 minutes)** - Test Docker build process

```bash
./scripts/test-cicd-local.sh build
```

Includes:
- ✅ All validation checks
- ✅ Docker daemon check
- ✅ Azure authentication
- ✅ ACR authentication
- ✅ Docker image build
- ✅ Push to ACR

Skip ACR push for faster testing:
```bash
./scripts/test-cicd-local.sh build --skip-push
# Or
SKIP_PUSH=true ./scripts/test-cicd-local.sh build
```

### 3. Infrastructure Deployment
**Long (~5-15 minutes)** - Test Terraform deployment

```bash
./scripts/test-cicd-local.sh infra
```

Includes:
- ✅ All validation and build steps
- ✅ Terraform initialization
- ✅ Terraform plan
- ✅ User confirmation (unless auto-approved)
- ✅ Terraform apply

Auto-approve for CI/CD simulation:
```bash
./scripts/test-cicd-local.sh infra --auto-approve
# Or
AUTO_APPROVE=true ./scripts/test-cicd-local.sh infra
```

### 4. Application Deployment
**Long (~10-20 minutes)** - Test full deployment

```bash
./scripts/test-cicd-local.sh deploy
```

Includes:
- ✅ All previous stages
- ✅ Web App discovery
- ✅ Application restart

### 5. Complete Pipeline
**Full (~15-25 minutes)** - Simulate entire GitHub Actions workflow

```bash
./scripts/test-cicd-local.sh all
```

Includes:
- ✅ All stages above
- ✅ Health check with retries
- ✅ API endpoint testing
- ✅ Detailed test report

## Usage Examples

### Pre-commit Validation
```bash
# Quick check before committing
./scripts/test-cicd-local.sh validate
```

### Test Docker Build Locally
```bash
# Build but don't push (saves time)
./scripts/test-cicd-local.sh build -s
```

### Full Local CI/CD Simulation
```bash
# Complete pipeline with auto-approve
./scripts/test-cicd-local.sh all --auto-approve
```

### Custom Image Tag
```bash
# Build with specific tag
IMAGE_TAG=v1.2.3 ./scripts/test-cicd-local.sh build
```

### Combined Options
```bash
# Build with custom tag, skip push
./scripts/test-cicd-local.sh build --skip-push --image-tag v1.0.0
```

## Command Options

### Flags

| Flag | Description |
|------|-------------|
| `-s`, `--skip-push` | Skip pushing Docker image to ACR |
| `-a`, `--auto-approve` | Auto-approve Terraform changes |
| `-t TAG`, `--image-tag TAG` | Set custom Docker image tag |
| `-h`, `--help` | Show help message |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SKIP_PUSH` | Skip Docker push | `false` |
| `AUTO_APPROVE` | Auto-approve Terraform | `false` |
| `IMAGE_TAG` | Docker image tag | `latest` |

## Understanding the Output

The script uses color-coded output:

- 🔵 **Blue** - Stage headers
- 🟡 **Yellow** - Individual steps
- 🟢 **Green** - Success (✅)
- 🔴 **Red** - Failure (❌)
- 🟡 **Yellow** - Skipped (⏭️)
- 🔵 **Cyan** - Information (ℹ️)

### Sample Output

```
==================================================
Local CI/CD Pipeline Simulation
==================================================

ℹ️  Configuration:
ℹ️    Stage: validate
ℹ️    Image Tag: latest
ℹ️    Skip Push: false
ℹ️    Auto Approve: false

▶ Stage: 1. Validate Code & Infrastructure

  → Checking prerequisites...
✅ All required tools are installed
  → Checking Node.js dependencies...
✅ Node.js dependencies are ready
  → Running linting...
⏭️  No lint script found
  → Running tests...
⏭️  No tests found
  → Checking Terraform formatting...
✅ Terraform formatting is correct
  → Validating Terraform configuration...
✅ Terraform configuration is valid

==================================================
Test Report
==================================================

Passed:  4
Failed:  0
Skipped: 2
Total:   6

🎉 All tests passed!
```

## Comparison with GitHub Actions

| Feature | Local Testing | GitHub Actions |
|---------|---------------|----------------|
| **Speed** | Faster (local resources) | Slower (VM provisioning) |
| **Cost** | Free | Free (public repos) |
| **Environment** | Your machine | Ubuntu VM |
| **Secrets** | Uses local Azure CLI | Uses GitHub Secrets |
| **Isolation** | Same as dev environment | Clean environment |
| **Debugging** | Easy (direct access) | Via logs only |
| **Best For** | Pre-commit testing | Production deployments |

## Workflow Recommendations

### Daily Development
```bash
# Before each commit
./scripts/test-cicd-local.sh validate

# Before pushing
./scripts/test-cicd-local.sh build --skip-push
```

### Pre-release Testing
```bash
# Full pipeline test before tagging release
./scripts/test-cicd-local.sh all --auto-approve
```

### Debugging CI/CD Issues
```bash
# Reproduce GitHub Actions failures locally
./scripts/test-cicd-local.sh all
```

## Alternative Testing Tools

### Act - Run GitHub Actions Locally

Install Act to run actual GitHub Actions workflows locally:

```bash
# Install act
brew install act

# List available workflows
act -l

# Run the CI/CD workflow
act push

# Run specific job
act -j validate

# Use custom event
act workflow_dispatch
```

**Act Configuration:**

Create `.actrc` in project root:
```
-P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
--secret-file .secrets
```

Create `.secrets` file (gitignored):
```
AZURE_CREDENTIALS={"clientId":"...","clientSecret":"..."}
ARM_CLIENT_ID=...
ARM_CLIENT_SECRET=...
ARM_SUBSCRIPTION_ID=...
ARM_TENANT_ID=...
DB_PASSWORD=...
```

### Docker Compose for Local Testing

For integration testing with database:

```bash
# Run app with PostgreSQL locally
docker-compose up

# Run tests against local stack
npm test
```

## Troubleshooting

### "Docker daemon is not running"
```bash
# Start Docker Desktop
open -a Docker

# Wait for it to start, then retry
./scripts/test-cicd-local.sh build
```

### "Not logged in to Azure"
```bash
# Login to Azure
az login

# Verify
az account show
```

### "terraform.tfvars not found"
```bash
# Create from example
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit with your values
nano terraform.tfvars
```

### "ACR authentication failed"
```bash
# Login to ACR
az acr login --name notesappdevacr

# Or use admin credentials
az acr credential show --name notesappdevacr
```

### Script Permission Denied
```bash
# Make executable
chmod +x ./scripts/test-cicd-local.sh
```

## Integration with Pre-commit Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "Running pre-commit validation..."
./scripts/test-cicd-local.sh validate

if [ $? -ne 0 ]; then
    echo "❌ Pre-commit validation failed"
    echo "Fix the issues or use 'git commit --no-verify' to skip"
    exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## CI/CD Testing Checklist

Before pushing to GitHub:

- [ ] Run `./scripts/test-cicd-local.sh validate`
- [ ] Ensure all tests pass
- [ ] Fix any Terraform formatting issues
- [ ] Test Docker build locally
- [ ] Verify Azure authentication works
- [ ] Check that secrets are not committed
- [ ] Review changes with `git diff`
- [ ] Update CHANGELOG if needed

## Performance Tips

### Speed Up Local Testing

1. **Skip ACR Push During Development**
   ```bash
   ./scripts/test-cicd-local.sh build -s
   ```

2. **Use Docker Build Cache**
   - Docker automatically caches layers
   - Unchanged layers are reused
   - Speeds up subsequent builds

3. **Run Only What You Need**
   ```bash
   # Just validation (30s)
   ./scripts/test-cicd-local.sh validate
   
   # vs full pipeline (20min)
   ./scripts/test-cicd-local.sh all
   ```

4. **Use Auto-approve for Testing**
   ```bash
   AUTO_APPROVE=true ./scripts/test-cicd-local.sh infra
   ```

## Next Steps

- Review [CI/CD Improvements](../.github/CI_CD_IMPROVEMENTS.md)
- Configure [GitHub Secrets](../.github/SECRETS_SETUP.md)
- Read [Deployment Guide](./DEPLOYMENT.md)
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)

## Support

If local testing reveals issues:

1. Check error messages carefully
2. Verify prerequisites are installed
3. Ensure Azure authentication is valid
4. Review Terraform state
5. Compare with GitHub Actions logs
