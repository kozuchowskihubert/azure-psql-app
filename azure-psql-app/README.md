# Azure App Service + PostgreSQL (Private Endpoint) - Technical Assessment

This project demonstrates deploying a Node.js web application to Azure App Service with secure PostgreSQL connectivity via a private endpoint. The solution meets all technical assessment requirements including containerization, Infrastructure as Code, multi-environment support, and CI/CD automation.

## ✅ Assessment Requirements

### 1. Azure Deployment
- ✅ Node.js Express app with basic UI for storing/retrieving notes
- ✅ PostgreSQL Flexible Server with private endpoint (no public access)
- ✅ Azure App Service (Linux, Docker container)
- ✅ VNet, Subnets, Private Endpoint for secure connectivity
- ✅ DB connection test included

### 2. Containerization
- ✅ Docker image with multi-stage build
- ✅ Dockerfile for local build and run
- ✅ Azure Container Registry (ACR) integration

### 3. Infrastructure as Code (Terraform)
- ✅ Multi-environment support (dev, staging, prod) via variables
- ✅ Provisions: App Service, PostgreSQL, VNet, Subnets, Private Endpoint
- ✅ Service Principal creation and role assignment
- ✅ Modular Terraform configuration

### 4. CI/CD Pipeline (GitHub Actions)
- ✅ Build and push Docker image to ACR/Docker Hub
- ✅ Deploy Terraform infrastructure
- ✅ Deploy application to Azure App Service
- ✅ Run tests to verify deployment

## Project Structure
```
azure-psql-app/
├── app/                    # Node.js application
│   ├── index.js           # Express app with UI
│   ├── package.json       # Dependencies
│   └── test/              # DB connection tests
├── infra/                 # Terraform configuration
│   ├── main.tf           # Multi-env infrastructure
│   ├── variables.tf      # Environment variables
│   ├── outputs.tf        # Resource outputs
│   └── .env.local        # Authentication config
├── Dockerfile            # Container build
└── run-local.sh         # Local Docker helper
```

## Quick Start

### Prerequisites
- Azure subscription (free tier works)
- Docker installed
- Node.js 20+
- Terraform CLI
- PowerShell (for automation scripts)

### Option 1: Automated Setup (Recommended)
```bash
# From project root
make full-launch
```

This automated workflow:
1. Authenticates to Azure
2. Creates Service Principal (if needed)
3. Sets subscription context
4. Installs dependencies
5. Builds Docker image
6. Provisions infrastructure
7. Runs tests
8. Starts the app

### Option 2: Manual Setup

1. **Configure Azure**
   ```bash
   # Add your subscription ID to:
   echo "your-subscription-id" > azure-psql-app/infra/.azure-subscription
   
   # Configure authentication in:
   # azure-psql-app/infra/.env.local
   ```

2. **Provision Infrastructure**
   ```bash
   cd azure-psql-app/infra
   terraform init
   terraform apply -var="env=dev"
   ```

3. **Build and Run Locally**
   ```bash
   export DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ./run-local.sh
   ```

4. **Deploy via CI/CD**
   - Push to GitHub
   - Configure repository secrets (ARM_CLIENT_ID, ARM_CLIENT_SECRET, etc.)
   - Pipeline runs automatically

## Application Features

### UI Interface
Access the web interface at `http://localhost:3000/` (local) or your Azure App Service URL:
- Add notes via form input
- View all stored notes in a list
- Automatic refresh after adding notes

### API Endpoints
- `GET /` - Web UI for notes management
- `GET /notes` - List all notes (JSON)
- `POST /notes` - Add a note (JSON body: `{ "text": "your note" }`)

### Database Schema
```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL
);
```

## Configuration

### Multi-Environment Variables
Set in `azure-psql-app/infra/terraform.tfvars`:
```hcl
env         = "dev"           # or "staging", "prod"
db_name     = "notesdb"
db_admin    = "notesadmin"
db_password = "ChangeMe123!"
location    = "westeurope"
prefix      = "notesapp-dev"
```

### Authentication (.env.local)
**Interactive Login (Email):**
```
<any value>
<any value>
awaresonhkproject@gmail.com
```

**Service Principal (Auto-generated):**
```
<spn_password>
<spn_client_id>
<spn_tenant_id>
```

The `login-azure.ps1` script automatically creates and configures SPN if credentials are missing.

## CI/CD Pipeline

### GitHub Actions Workflow
Located at `.github/workflows/ci-cd.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main`

**Jobs:**
1. **build-and-test** - Install deps, run tests, build Docker
2. **terraform-deploy** - Provision Azure resources
3. **docker-push** - Push image to registry
4. **app-deploy** - Deploy to Azure App Service, verify endpoint

**Required Secrets:**
- `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_SUBSCRIPTION_ID`, `ARM_TENANT_ID`
- `DATABASE_URL`
- `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` (or ACR credentials)
- `AZURE_APP_NAME`, `AZURE_PUBLISH_PROFILE`

## Makefile Commands

See [MAKEFILE.md](../MAKEFILE.md) for complete documentation.

**Common commands:**
```bash
make help              # Show all targets
make full-launch       # Complete automation
make docker-build      # Build container
make test              # Run tests
make infra-apply       # Provision infrastructure
make infra-destroy     # Tear down resources
```

## Security & Best Practices

- ✅ Private endpoint - no public database access
- ✅ VNet integration for App Service
- ✅ Service Principal with least privilege (Contributor role)
- ✅ Secrets managed via environment variables
- ✅ SSL/TLS for database connections
- 🔄 TODO: Azure Key Vault for production secrets
- 🔄 TODO: Managed Identity for App Service → DB auth

## Testing

### Local Testing
```bash
# Run DB connection test
node azure-psql-app/app/test/db-connection-test.js

# Run all tests
make test
```

### Integration Testing
CI/CD pipeline includes:
- DB connection verification
- API endpoint testing
- Container health checks

## Resources & Documentation
- [Azure Free Account](https://azure.microsoft.com/free/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [PostgreSQL Flexible Server](https://docs.microsoft.com/azure/postgresql/flexible-server/)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/)

## Troubleshooting

### Common Issues
1. **Subscription not found**: Verify `.azure-subscription` contains correct GUID
2. **SPN authentication fails**: Delete `.env.local` and rerun `make authenticate` to regenerate
3. **Terraform errors**: Run `terraform init` again, check Azure credentials
4. **Docker build fails**: Ensure you're in project root, check Dockerfile path

### Support
- Review [MAKEFILE.md](../MAKEFILE.md) for automation details
- Check `.github/workflows/ci-cd.yml` for pipeline configuration
- Verify all prerequisites are installed
