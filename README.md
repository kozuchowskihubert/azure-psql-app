# Azure PostgreSQL App - Technical Assessment Solution

[![CI/CD](https://github.com/yourusername/azure-psql-app/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yourusername/azure-psql-app/actions)

A complete solution for deploying a Node.js application with PostgreSQL on Azure, featuring containerization, Infrastructure as Code, and automated CI/CD pipelines.

## 📋 Assessment Requirements - All Complete ✅

### 1. Azure Deployment ✅
- ✅ Node.js Express app with interactive UI
- ✅ PostgreSQL Flexible Server with private endpoint
- ✅ Azure App Service (Linux container)
- ✅ VNet, Subnets, Private Endpoint
- ✅ Database connection test

### 2. Containerization ✅
- ✅ Dockerfile for multi-stage builds
- ✅ Local Docker run capability
- ✅ Azure Container Registry integration

### 3. Infrastructure as Code ✅
- ✅ Terraform configuration for all resources
- ✅ Multi-environment support (dev/staging/prod)
- ✅ Variables for configuration
- ✅ Automated Service Principal creation

### 4. CI/CD Pipeline ✅
- ✅ GitHub Actions workflow
- ✅ Automated Docker build and push
- ✅ Terraform deployment
- ✅ Application deployment
- ✅ Integration testing

## 🚀 Quick Start

### Prerequisites
- Azure account (free tier works)
- Docker installed and running
- Node.js 20+ (for local development)
- Terraform CLI (install via `make terraform-install`)
- PowerShell (for automation scripts)

### Automated Setup (Recommended)
```bash
# Clone the repository
git clone <your-repo-url>
cd azure-psql-app

# Add your Azure subscription ID
echo "your-subscription-id" > azure-psql-app/infra/.azure-subscription

# Run complete automation
make full-launch
```

This will:
1. Authenticate to Azure
2. Create Service Principal (if needed)
3. Install dependencies
4. Build Docker image
5. Provision all Azure resources
6. Run tests
7. Start the application

### Manual Setup

See detailed instructions in:
- [azure-psql-app/README.md](azure-psql-app/README.md) - Application documentation
- [MAKEFILE.md](MAKEFILE.md) - Makefile documentation

## 📁 Project Structure

```
.
├── azure-psql-app/           # Main application
│   ├── app/                  # Node.js source code
│   │   ├── index.js         # Express app with UI
│   │   ├── package.json     # Dependencies
│   │   └── test/            # Tests
│   ├── infra/               # Terraform configuration
│   │   ├── main.tf          # Infrastructure resources
│   │   ├── variables.tf     # Input variables
│   │   ├── outputs.tf       # Output values
│   │   └── .env.local       # Authentication config
│   ├── Dockerfile           # Container build
│   └── README.md            # App documentation
├── .github/workflows/       # CI/CD pipelines
│   └── ci-cd.yml           # GitHub Actions workflow
├── makefile                 # Build automation
├── MAKEFILE.md             # Makefile documentation
├── login-azure.ps1         # Azure auth script
├── az-login.sh             # Alternative auth script
└── README.md               # This file
```

## 🎯 Features

### Web Application
- **Interactive UI**: Simple web interface for managing notes
- **REST API**: JSON endpoints for programmatic access
- **Database Integration**: PostgreSQL with automatic table creation
- **Error Handling**: Comprehensive error messages and logging

### Infrastructure
- **Secure Networking**: Private endpoints, no public database access
- **Multi-Environment**: Support for dev, staging, and production
- **Auto-Scaling**: Azure App Service with configurable plans
- **Container Registry**: Private ACR for Docker images

### Automation
- **One-Command Deployment**: `make full-launch` does everything
- **Service Principal**: Automatically created and configured
- **Terraform State**: Managed infrastructure as code
- **CI/CD Pipeline**: Automated testing and deployment

## 🛠️ Available Commands

```bash
make help              # Show all available targets
make full-launch       # Complete end-to-end automation
make install           # Install dependencies
make docker-build      # Build Docker image
make test              # Run tests
make infra-init        # Initialize Terraform
make infra-apply       # Provision infrastructure
make infra-destroy     # Tear down resources
make clean             # Clean up local resources
```

## 🔐 Configuration

### Environment Variables
Configure in `azure-psql-app/infra/.env.local`:

**Interactive Login:**
```
<any value>
<any value>
your-email@example.com
```

**Service Principal (Auto-generated):**
```
<spn_password>
<spn_client_id>
<spn_tenant_id>
```

### Terraform Variables
Configure in `azure-psql-app/infra/terraform.tfvars`:

```hcl
env         = "dev"
prefix      = "notesapp"
location    = "westeurope"
db_name     = "notesdb"
db_admin    = "notesadmin"
db_password = "YourSecurePassword123!"
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
Located at `.github/workflows/ci-cd.yml`

**Required Repository Secrets:**
- `ARM_CLIENT_ID` - Service Principal Client ID
- `ARM_CLIENT_SECRET` - Service Principal Secret
- `ARM_SUBSCRIPTION_ID` - Azure Subscription ID
- `ARM_TENANT_ID` - Azure Tenant ID
- `DATABASE_URL` - PostgreSQL connection string
- `DOCKERHUB_USERNAME` - Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub access token
- `AZURE_APP_NAME` - Azure App Service name
- `AZURE_PUBLISH_PROFILE` - Azure publish profile

### Pipeline Stages
1. **Build & Test** - Install deps, run tests, build Docker
2. **Terraform Deploy** - Provision Azure resources
3. **Docker Push** - Push image to registry
4. **App Deploy** - Deploy to Azure App Service
5. **Verify** - Test deployed application

## 📊 Architecture

```
┌─────────────────┐
│   GitHub        │
│   Actions       │
└────────┬────────┘
         │
         ├──► Docker Hub / ACR
         │
         ├──► Terraform Cloud
         │
         └──► Azure
              ├─► Resource Group
              ├─► VNet + Subnets
              ├─► App Service (Linux)
              ├─► PostgreSQL (Private)
              ├─► Container Registry
              └─► Private Endpoint
```

## 🧪 Testing

### Local Testing
```bash
# Test database connection
make test

# Run app locally
export DATABASE_URL="postgresql://user:pass@host:5432/db"
make ui
```

### Integration Testing
- Automated in CI/CD pipeline
- Tests database connectivity
- Validates API endpoints
- Checks app deployment

## 📚 Documentation

- **[MAKEFILE.md](MAKEFILE.md)** - Complete Makefile documentation
- **[azure-psql-app/README.md](azure-psql-app/README.md)** - Application guide
- **[azure-psql-app/infra/README.md](azure-psql-app/infra/README.md)** - Infrastructure docs

## 🔒 Security Best Practices

- ✅ Private database endpoints (no public access)
- ✅ VNet integration for App Service
- ✅ Service Principal with least privilege
- ✅ Secrets via environment variables
- ✅ SSL/TLS for all connections
- 🔄 TODO: Azure Key Vault integration
- 🔄 TODO: Managed Identity for App Service

## 🐛 Troubleshooting

### Common Issues

**Subscription not found:**
```bash
# Verify subscription ID in .azure-subscription
cat azure-psql-app/infra/.azure-subscription
```

**Authentication fails:**
```bash
# Delete .env.local and regenerate
rm azure-psql-app/infra/.env.local
make authenticate
```

**Terraform errors:**
```bash
# Reinitialize Terraform
make infra-init
```

**Docker build fails:**
```bash
# Ensure you're in project root
pwd
make docker-build
```

## 📖 Resources

- [Azure Free Account](https://azure.microsoft.com/free/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [PostgreSQL Flexible Server](https://docs.microsoft.com/azure/postgresql/flexible-server/)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/)

## 📝 License

This project is provided as a technical assessment solution.

## 🤝 Contributing

This is an assessment project. For questions or issues, please contact HAOS.

---

**Built with** ❤️ **for the technical assessment**
