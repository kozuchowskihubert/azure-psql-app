# CI/CD Quick Reference Card

> Quick commands and references for the Azure PostgreSQL App deployment pipeline

---

## 🚀 Deployment Commands

### Automated Deployment
```bash
git push origin main  # Triggers full CI/CD pipeline
```

### Manual Deployment
```bash
# Via GitHub Actions UI:
# Actions → Deploy Azure Infrastructure & Application → Run workflow
```

### Local Testing
```bash
# Option 1: Fast deployment script (5-10 min)
./scripts/deploy.sh all

# Option 2: Simulate CI/CD pipeline (15-30 min)
./scripts/test-cicd-local.sh all

# Option 3: Run actual GitHub Actions locally (20-35 min)
./scripts/run-act.sh all
```

---

## 📝 Common Commands

### Deployment
```bash
# Deploy everything
./scripts/deploy.sh all

# Deploy infrastructure only
./scripts/deploy.sh infra

# Build and push image only
./scripts/deploy.sh image

# Verify deployment only
./scripts/deploy.sh verify
```

### Testing
```bash
# Validate code and Terraform
./scripts/test-cicd-local.sh validate

# Test build stage
./scripts/test-cicd-local.sh build

# Test infrastructure deployment
./scripts/test-cicd-local.sh infra

# Test application deployment
./scripts/test-cicd-local.sh deploy

# Full pipeline test
./scripts/test-cicd-local.sh all
```

### Act (Local GitHub Actions)
```bash
# List all jobs
./scripts/run-act.sh list

# Run validation
./scripts/run-act.sh validate

# Run build stage
./scripts/run-act.sh build

# Run infrastructure deployment
./scripts/run-act.sh infra

# Run all stages
./scripts/run-act.sh all
```

---

## 🔍 Monitoring Commands

### Health Check
```bash
APP_URL="https://your-app.azurewebsites.net"

# Check health
curl $APP_URL/health

# Test notes API
curl $APP_URL/notes
```

### Logs
```bash
# Tail application logs
az webapp log tail \
  --name <webapp-name> \
  --resource-group notesapp-dev-rg

# Download logs
az webapp log download \
  --name <webapp-name> \
  --resource-group notesapp-dev-rg \
  --log-file logs.zip
```

### Azure Resources
```bash
# List all resources
az resource list \
  --resource-group notesapp-dev-rg \
  --output table

# Show Web App details
az webapp show \
  --name <webapp-name> \
  --resource-group notesapp-dev-rg

# Show database details
az postgres flexible-server show \
  --resource-group notesapp-dev-rg \
  --name <db-name>
```

---

## 🔄 Rollback Commands

### Rollback Application
```bash
# List available images
az acr repository show-tags \
  --name notesappdevacr \
  --repository notesapp \
  --orderby time_desc

# Deploy specific image
az webapp config container set \
  --name <webapp-name> \
  --resource-group notesapp-dev-rg \
  --docker-custom-image-name notesappdevacr.azurecr.io/notesapp:<tag>

# Restart
az webapp restart \
  --name <webapp-name> \
  --resource-group notesapp-dev-rg
```

### Rollback Code
```bash
# Find last working commit
git log --oneline -n 10

# Rollback to specific commit
git revert <commit-sha>
git push origin main

# Or checkout and redeploy
git checkout <commit-sha>
./scripts/deploy.sh all
```

---

## 🐛 Debugging Commands

### Terraform
```bash
cd infra

# Show current state
terraform state list

# Show specific resource
terraform state show azurerm_linux_web_app.main

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Import existing resource
terraform import <resource_type>.<name> <azure_resource_id>
```

### Docker
```bash
# List ACR images
az acr repository show-tags \
  --name notesappdevacr \
  --repository notesapp

# Pull image locally
docker pull notesappdevacr.azurecr.io/notesapp:latest

# Run locally
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  notesappdevacr.azurecr.io/notesapp:latest
```

### GitHub Actions
```bash
# List recent workflow runs
gh run list --limit 10

# View specific run
gh run view <run-id>

# View logs
gh run view <run-id> --log

# Re-run failed jobs
gh run rerun <run-id>
```

---

## 📊 Status Checks

### Quick Health Check
```bash
APP_URL="https://your-app.azurewebsites.net"

# All-in-one status check
echo "Health:" && curl -s $APP_URL/health | jq '.'
echo "Notes:" && curl -s $APP_URL/notes | jq '.'
```

### Infrastructure Status
```bash
# Resource group overview
az group show --name notesapp-dev-rg

# All resources status
az resource list \
  --resource-group notesapp-dev-rg \
  --query "[].{Name:name, Type:type, Location:location}" \
  --output table
```

---

## 🔐 Secrets & Configuration

### GitHub Secrets (Required)
- `AZURE_CREDENTIALS` - Service Principal JSON
- `ARM_CLIENT_ID` - Azure Client ID
- `ARM_CLIENT_SECRET` - Azure Client Secret
- `ARM_SUBSCRIPTION_ID` - Azure Subscription ID
- `ARM_TENANT_ID` - Azure Tenant ID
- `DB_PASSWORD` - PostgreSQL password

### Environment Variables
```bash
# Set in workflow
ACR_NAME=notesappdevacr
IMAGE_NAME=notesapp
AZURE_REGION=westeurope
TERRAFORM_VERSION=~1.5
NODE_VERSION=20
```

---

## 📁 Key Files

### Workflow
```
.github/workflows/deploy-azure-infrastructure.yml
```

### Scripts
```
scripts/deploy.sh              # Unified deployment
scripts/test-cicd-local.sh     # Pipeline simulator
scripts/run-act.sh             # Local GitHub Actions
scripts/run-local.sh           # Local development
```

### Documentation
```
.github/PRODUCTION_DEPLOYMENT_GUIDE.md  # Complete guide
.github/SECRETS_SETUP.md                # Secrets setup
docs/ARCHITECTURE.md                    # Architecture
docs/DEPLOYMENT.md                      # Deployment guide
docs/TROUBLESHOOTING.md                 # Troubleshooting
docs/ACT_USAGE.md                       # Act usage
```

### Infrastructure
```
infra/main.tf           # Resources
infra/variables.tf      # Variables
infra/outputs.tf        # Outputs
infra/backend.tf        # State backend
```

---

## 🆘 Help & Support

### Documentation Links
- [Production Guide](./.github/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Secrets Setup](./.github/SECRETS_SETUP.md)

### Common Issues
1. **ACR Auth Fails**: Run `az acr login --name notesappdevacr`
2. **Terraform Errors**: Check state with `terraform state list`
3. **Health Check Fails**: View logs with `az webapp log tail`
4. **Build Fails**: Verify GitHub secrets are set

### Emergency Contacts
- GitHub Issues: https://github.com/kozuchowskihubert/azure-psql-app/issues
- Azure Support: Azure Portal → Help + support

---

## 📈 Workflow Stages

1. **Validate** (~2-3 min) - Code & Terraform validation
2. **Build** (~3-12 min) - Docker build & push
3. **Infrastructure** (~5-20 min) - Terraform apply
4. **Deploy** (~2-3 min) - App deployment
5. **Verify** (~1-4 min) - Health checks
6. **Notify** (<1 min) - Status reporting

**Total Time**: ~15-45 minutes (depending on changes)

---

**Last Updated**: 2024  
**Version**: 2.0 (Production-Ready)
