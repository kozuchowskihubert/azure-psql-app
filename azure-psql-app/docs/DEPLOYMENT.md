# Deployment Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Manual Deployment](#manual-deployment)
- [Configuration Management](#configuration-management)
- [Deployment Workflows](#deployment-workflows)

## Prerequisites

### Required Tools
- **Azure CLI** (v2.50+)
- **Terraform** (v1.5+)
- **Docker** (v20.10+)
- **Git**
- **Node.js** (v18+) - for local development

### Required Access
- Azure subscription with Contributor access
- GitHub repository access
- Service Principal with appropriate permissions

### Azure Quotas
Ensure your subscription has the following quotas in the target region:
- Basic App Service Plans: At least 1
- PostgreSQL Flexible Servers: At least 1
- Virtual Network: At least 1
- Container Registries: At least 1

## Initial Setup

### 1. Azure Service Principal Creation

```mermaid
graph TD
    A[Start] --> B[Login to Azure CLI]
    B --> C[Create Service Principal]
    C --> D[Assign Contributor Role]
    D --> E[Reset Credentials]
    E --> F[Save Credentials]
    F --> G[Configure GitHub Secrets]
    G --> H[Setup Complete]
    
    style A fill:#e1f5ff
    style H fill:#00aa00,color:#fff
```

#### Commands

```bash
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac \
  --name "github-actions-sp" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID> \
  --sdk-auth

# Reset credentials if needed
az ad sp credential reset \
  --id <APP_ID> \
  --query password -o tsv
```

### 2. GitHub Secrets Configuration

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `AZURE_CREDENTIALS` | Full JSON output from `az ad sp create` | Copy entire JSON output |
| `ARM_CLIENT_ID` | Service Principal App ID | From JSON: `clientId` |
| `ARM_CLIENT_SECRET` | Service Principal Secret | From JSON: `clientSecret` |
| `ARM_TENANT_ID` | Azure Tenant ID | From JSON: `tenantId` |
| `ARM_SUBSCRIPTION_ID` | Azure Subscription ID | From JSON: `subscriptionId` |
| `DB_PASSWORD` | PostgreSQL admin password | Choose a strong password |
| `ACR_LOGIN_SERVER` | Container Registry URL | Get after first deployment |
| `ACR_USERNAME` | Container Registry username | Get after first deployment |
| `ACR_PASSWORD` | Container Registry password | Get after first deployment |

### 3. Local Configuration

#### terraform.tfvars
Create `infra/terraform.tfvars` (gitignored):

```hcl
prefix      = "notesapp"
env         = "dev"
location    = "westeurope"  # Change if needed
db_password = "YourSecurePassword123!"
```

#### .env.local
Create `.env.local` in the root (gitignored):

```env
DB_PASSWORD=YourSecurePassword123!
```

## CI/CD Pipeline

### Pipeline Overview

```mermaid
graph TB
    subgraph "Trigger"
        Push[Git Push to main]
        Manual[Manual Trigger]
    end
    
    subgraph "CI/CD Workflow"
        Checkout[Checkout Code]
        
        subgraph "Build Stage"
            DockerBuild[Build Docker Image]
            DockerPush[Push to ACR]
        end
        
        subgraph "Infrastructure Stage"
            TFInit[Terraform Init]
            TFPlan[Terraform Plan]
            TFApply[Terraform Apply]
        end
        
        subgraph "Deployment Stage"
            Deploy[Deploy to App Service]
            ConfigEnv[Configure Environment Variables]
            Restart[Restart App Service]
        end
        
        Verify{Verify<br/>Deployment}
    end
    
    subgraph "Post-Deployment"
        Success[Deployment Successful]
        Failure[Rollback/Alert]
    end
    
    Push --> Checkout
    Manual --> Checkout
    Checkout --> DockerBuild
    DockerBuild --> DockerPush
    DockerPush --> TFInit
    TFInit --> TFPlan
    TFPlan --> TFApply
    TFApply --> Deploy
    Deploy --> ConfigEnv
    ConfigEnv --> Restart
    Restart --> Verify
    Verify -->|Success| Success
    Verify -->|Failure| Failure
    
    style Success fill:#00aa00,color:#fff
    style Failure fill:#ff0000,color:#fff
```

### Workflow File Structure

The CI/CD workflow is defined in `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # 1. Build Docker image
      # 2. Push to ACR
      # 3. Deploy infrastructure
      # 4. Configure application
```

### Deployment Stages Explained

#### Stage 1: Docker Build & Push

```mermaid
sequenceDiagram
    participant GHA as GitHub Actions
    participant Docker as Docker Build
    participant ACR as Azure Container Registry
    
    GHA->>Docker: docker build -t notesapp:latest
    Docker-->>GHA: Image Built
    GHA->>ACR: docker login
    ACR-->>GHA: Authenticated
    GHA->>ACR: docker push notesapp:latest
    ACR-->>GHA: Image Stored
    
    Note over ACR: Image tagged with<br/>commit SHA & 'latest'
```

#### Stage 2: Infrastructure Provisioning

```mermaid
sequenceDiagram
    participant GHA as GitHub Actions
    participant TF as Terraform
    participant Azure as Azure API
    
    GHA->>TF: terraform init
    TF-->>GHA: Initialized
    GHA->>TF: terraform plan
    TF->>Azure: Query existing resources
    Azure-->>TF: Current state
    TF-->>GHA: Execution plan
    GHA->>TF: terraform apply -auto-approve
    TF->>Azure: Create/Update resources
    Azure-->>TF: Resources provisioned
    TF-->>GHA: Apply complete
    
    Note over TF,Azure: All resources created<br/>in West Europe
```

#### Stage 3: Application Deployment

```mermaid
graph LR
    A[Terraform Apply Complete] --> B[App Service Created/Updated]
    B --> C[Configure Environment Variables]
    C --> D[Set ACR Credentials]
    D --> E[Pull Latest Image]
    E --> F[Start Container]
    F --> G[Health Check]
    G -->|Success| H[Deployment Complete]
    G -->|Failure| I[Retry/Alert]
    
    style H fill:#00aa00,color:#fff
    style I fill:#ff0000,color:#fff
```

### Environment Variables Auto-Configuration

The pipeline automatically configures:

```mermaid
graph TD
    TF[Terraform Outputs] --> Secrets[GitHub Secrets]
    Secrets --> AppConfig[App Service Configuration]
    
    TF --> |ACR Login Server| AppConfig
    TF --> |ACR Admin Username| AppConfig
    TF --> |ACR Admin Password| AppConfig
    TF --> |Database FQDN| AppConfig
    Secrets --> |DB_PASSWORD| AppConfig
    
    AppConfig --> |DOCKER_REGISTRY_SERVER_URL| Container[Container Config]
    AppConfig --> |DOCKER_REGISTRY_SERVER_USERNAME| Container
    AppConfig --> |DOCKER_REGISTRY_SERVER_PASSWORD| Container
    AppConfig --> |DB_HOST| Container
    AppConfig --> |DB_PASSWORD| Container
    AppConfig --> |DB_NAME| Container
    AppConfig --> |DB_USER| Container
    
    style Container fill:#0078d4,color:#fff
```

## Manual Deployment

### Prerequisites Check

```bash
# Verify Azure CLI login
az account show

# Verify Terraform installation
terraform version

# Verify Docker
docker version
```

### Step-by-Step Manual Deployment

#### 1. Infrastructure Deployment

```mermaid
flowchart TD
    A[Navigate to infra directory] --> B[Initialize Terraform]
    B --> C[Create terraform.tfvars]
    C --> D[Run terraform plan]
    D --> E{Plan looks good?}
    E -->|No| F[Fix issues]
    F --> D
    E -->|Yes| G[Run terraform apply]
    G --> H[Review changes]
    H --> I{Approve?}
    I -->|No| J[Cancel]
    I -->|Yes| K[Infrastructure Created]
    K --> L[Save outputs]
    
    style K fill:#00aa00,color:#fff
    style J fill:#ff0000,color:#fff
```

```bash
# 1. Navigate to infrastructure directory
cd infra

# 2. Initialize Terraform
terraform init

# 3. Plan infrastructure
terraform plan -out=tfplan

# 4. Apply infrastructure
terraform apply tfplan

# 5. Get outputs
terraform output
```

#### 2. Build and Push Docker Image

```bash
# 1. Login to Azure Container Registry
az acr login --name notesappdevacr

# 2. Build Docker image
docker build -t notesappdevacr.azurecr.io/notesapp:latest .

# 3. Push to ACR
docker push notesappdevacr.azurecr.io/notesapp:latest

# 4. Verify image
az acr repository show -n notesappdevacr --repository notesapp
```

#### 3. Configure App Service

```bash
# Set environment variables
az webapp config appsettings set \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app \
  --settings \
    DB_HOST="<postgres-fqdn>" \
    DB_USER="notesadmin" \
    DB_PASSWORD="<your-password>" \
    DB_NAME="notesdb" \
    DB_PORT="5432" \
    DB_SSL="true"

# Restart app service
az webapp restart \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app
```

#### 4. Verify Deployment

```bash
# Get app URL
APP_URL=$(az webapp show \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app \
  --query defaultHostName -o tsv)

# Test health endpoint
curl https://$APP_URL/health

# Test notes endpoint
curl https://$APP_URL/notes
```

## Configuration Management

### Terraform Variables

```mermaid
graph LR
    subgraph "Variable Sources"
        TFVars[terraform.tfvars<br/>gitignored]
        Defaults[variables.tf<br/>defaults]
        CLI[Command Line<br/>-var flags]
    end
    
    subgraph "Terraform Processing"
        Merge[Variable Precedence]
    end
    
    subgraph "Infrastructure"
        Resources[Azure Resources]
    end
    
    TFVars --> Merge
    Defaults --> Merge
    CLI --> Merge
    Merge --> Resources
    
    style Merge fill:#7b42bc,color:#fff
```

### Variables Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `prefix` | string | "notesapp" | Resource name prefix |
| `env` | string | "dev" | Environment name |
| `location` | string | "westeurope" | Azure region |
| `db_password` | string (sensitive) | none | PostgreSQL password |
| `image_tag` | string | "latest" | Docker image tag |

### Secret Injection Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub Secrets
    participant GHA as GitHub Actions
    participant TF as Terraform
    participant Azure as Azure Resources
    participant App as Application
    
    Dev->>GH: Store secrets
    GHA->>GH: Read secrets
    GHA->>TF: Pass as variables
    TF->>Azure: Create resources with secrets
    Azure->>App: Inject as environment variables
    App->>App: Use secrets at runtime
    
    Note over GH,App: Secrets never logged<br/>or exposed
```

## Deployment Workflows

### First-Time Deployment

```mermaid
graph TD
    Start[Start] --> Check{Infrastructure<br/>Exists?}
    Check -->|No| CreateSP[Create Service Principal]
    Check -->|Yes| UpdateSP[Update Service Principal]
    
    CreateSP --> ConfigGH[Configure GitHub Secrets]
    UpdateSP --> ConfigGH
    
    ConfigGH --> CreateTFVars[Create terraform.tfvars]
    CreateTFVars --> RunPipeline[Trigger CI/CD Pipeline]
    
    RunPipeline --> Monitor[Monitor Deployment]
    Monitor --> Verify{Deployment<br/>Successful?}
    
    Verify -->|Yes| GetACR[Get ACR Credentials]
    Verify -->|No| Debug[Debug Issues]
    
    GetACR --> UpdateSecrets[Update GitHub Secrets]
    UpdateSecrets --> RerunPipeline[Re-run Pipeline]
    RerunPipeline --> Success[✓ Deployment Complete]
    
    Debug --> Fix[Fix Issues]
    Fix --> RunPipeline
    
    style Success fill:#00aa00,color:#fff
    style Debug fill:#ff6600,color:#fff
```

### Update Deployment

```mermaid
graph TD
    Start[Start] --> Change{What Changed?}
    
    Change -->|Code Only| CodeDeploy[Push to main branch]
    Change -->|Infrastructure| InfraDeploy[Update Terraform files]
    Change -->|Both| BothDeploy[Update both]
    
    CodeDeploy --> AutoBuild[Auto: Build Docker Image]
    InfraDeploy --> AutoBuild
    BothDeploy --> AutoBuild
    
    AutoBuild --> AutoProvision[Auto: Provision Infrastructure]
    AutoProvision --> AutoDeploy[Auto: Deploy Application]
    AutoDeploy --> Success[✓ Deployment Complete]
    
    style Success fill:#00aa00,color:#fff
```

### Rollback Procedure

```mermaid
graph TD
    Issue[Deployment Issue Detected] --> Decision{Rollback<br/>Strategy?}
    
    Decision -->|Application Only| AppRollback[Rollback Docker Image]
    Decision -->|Infrastructure| InfraRollback[Terraform State Rollback]
    Decision -->|Complete| FullRollback[Full System Rollback]
    
    AppRollback --> A1[Identify Previous Working Tag]
    A1 --> A2[Update Image Tag in Terraform]
    A2 --> A3[Re-deploy Application]
    A3 --> Verify
    
    InfraRollback --> I1[Review Terraform State]
    I1 --> I2[Revert to Previous State]
    I2 --> I3[terraform apply]
    I3 --> Verify
    
    FullRollback --> F1[Restore Database Backup]
    F1 --> F2[Restore Infrastructure State]
    F2 --> F3[Deploy Previous Image]
    F3 --> Verify
    
    Verify{Verify<br/>Recovery}
    Verify -->|Success| Success[✓ System Recovered]
    Verify -->|Failure| Escalate[Escalate to Team]
    
    style Success fill:#00aa00,color:#fff
    style Escalate fill:#ff0000,color:#fff
```

### Rollback Commands

```bash
# Rollback to previous Docker image
az webapp config container set \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app \
  --docker-custom-image-name notesappdevacr.azurecr.io/notesapp:<previous-tag>

# Rollback Terraform state
cd infra
terraform state pull > backup.tfstate
# Edit state file if needed
terraform state push backup.tfstate
terraform apply

# Restore PostgreSQL database
az postgres flexible-server restore \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-pg-restored \
  --source-server notesapp-dev-pg \
  --restore-time "2025-11-08T10:00:00Z"
```

## Infrastructure Recreation Process

### Automated Recreation Script

The project includes an automated recreation script at `scripts/recreate-infrastructure.sh`:

```mermaid
graph TD
    Run[Run recreate-infrastructure.sh] --> Confirm{User<br/>Confirmation}
    Confirm -->|No| Cancel[Cancel Operation]
    Confirm -->|Yes| Destroy[terraform destroy]
    
    Destroy --> Init[terraform init]
    Init --> Plan[terraform plan]
    Plan --> Apply[terraform apply]
    Apply --> Complete[✓ Infrastructure Recreated]
    
    style Complete fill:#00aa00,color:#fff
    style Cancel fill:#ff6600
```

Usage:
```bash
cd /Users/haos/Projects/azure-psql-app
./scripts/recreate-infrastructure.sh
```

### Migration Between Regions

```mermaid
sequenceDiagram
    participant Admin
    participant Old as Old Region Resources
    participant TF as Terraform
    participant New as New Region Resources
    
    Admin->>Old: Backup Database
    Admin->>TF: Update location variable
    Admin->>TF: terraform destroy (old region)
    TF->>Old: Destroy resources
    Admin->>TF: terraform apply (new region)
    TF->>New: Create resources
    Admin->>New: Restore Database
    Admin->>New: Verify Application
    
    Note over Old,New: Region migration complete
```

## Post-Deployment Verification

### Health Check List

```mermaid
graph TD
    Start[Deployment Complete] --> Check1{Web App<br/>Responding?}
    Check1 -->|No| Fix1[Check App Service Logs]
    Check1 -->|Yes| Check2{Database<br/>Connected?}
    
    Check2 -->|No| Fix2[Check Connection String]
    Check2 -->|Yes| Check3{ACR<br/>Accessible?}
    
    Check3 -->|No| Fix3[Check ACR Credentials]
    Check3 -->|Yes| Check4{API<br/>Working?}
    
    Check4 -->|No| Fix4[Check Application Logs]
    Check4 -->|Yes| Success[✓ All Checks Passed]
    
    Fix1 --> Check1
    Fix2 --> Check2
    Fix3 --> Check3
    Fix4 --> Check4
    
    style Success fill:#00aa00,color:#fff
```

### Verification Commands

```bash
# 1. Check App Service status
az webapp show \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app \
  --query state

# 2. Check PostgreSQL status
az postgres flexible-server show \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-pg \
  --query state

# 3. Test application endpoints
APP_URL=$(terraform output -raw app_url 2>/dev/null || echo "notesapp-dev-app.azurewebsites.net")
curl -f https://$APP_URL/health || echo "Health check failed"
curl -f https://$APP_URL/notes || echo "API check failed"

# 4. Check application logs
az webapp log tail \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app

# 5. Check database connectivity
az postgres flexible-server connect \
  --name notesapp-dev-pg \
  --admin-user notesadmin
```

## Troubleshooting Common Issues

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed troubleshooting guide.

---

**Document Version**: 1.0  
**Last Updated**: November 8, 2025  
**Next Review**: February 8, 2026
