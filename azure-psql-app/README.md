# Azure PostgreSQL App - Cloud-Native Notes Application

> A production-ready, containerized Node.js application deployed on Azure with PostgreSQL, featuring Infrastructure as Code, CI/CD automation, and comprehensive documentation.

[![CI/CD Pipeline](https://github.com/kozuchowskihubert/azure-psql-app/actions/workflows/deploy-azure-infrastructure.yml/badge.svg)](https://github.com/kozuchowskihubert/azure-psql-app/actions)
[![Terraform](https://img.shields.io/badge/Terraform-1.5+-purple)](https://www.terraform.io/)
[![Azure](https://img.shields.io/badge/Azure-Cloud-blue)](https://azure.microsoft.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs) folder:

- **[🏗️ Architecture](./docs/ARCHITECTURE.md)** - System design, components, network architecture, and Mermaid diagrams
- **[🚀 Deployment Guide](./docs/DEPLOYMENT.md)** - Step-by-step deployment, CI/CD pipeline, and workflows
- **[📋 Production Deployment](./.github/PRODUCTION_DEPLOYMENT_GUIDE.md)** - Complete production deployment guide with all workflow stages
- **[🔧 Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions from production deployment
- **[🧪 Act Usage Guide](./docs/ACT_USAGE.md)** - Testing GitHub Actions locally before deployment
- **[🗺️ Product Roadmap](./ROADMAP.md)** - Future features, development phases, and strategic vision
- **[🔐 Login System](./docs/LOGIN_SYSTEM.md)** - Authentication system technical documentation

## 🎯 Features

### ✅ Core Features

#### 1. Notes Management
- ✅ Create, read, update, and delete notes
- ✅ Category organization and filtering
- ✅ Text and diagram note types (Mermaid support)
- ✅ Search and sort functionality
- ✅ Dark mode support
- ✅ Responsive UI with Tailwind CSS

#### 2. Excel Data Manipulation (NEW)
- 🎯 **Client-side Excel processing** - No database required
- 🎯 Import/export Excel files (.xlsx, .xls, .csv)
- 🎯 Real-time data editing in spreadsheet view
- 🎯 Formula calculations and data validation
- 🎯 Multiple sheet support
- 🎯 Chart and pivot table generation
- 🎯 Export to multiple formats (Excel, CSV, PDF, JSON)
- 🎯 Offline-first architecture with local storage
- 🎯 Drag-and-drop file upload
- 🎯 Data filtering, sorting, and search

#### 3. Calendar & Meeting Management
- ✅ Calendar event synchronization
- ✅ Meeting room booking system
- ✅ Availability tracking
- ✅ Meeting scheduler with participant management
- ✅ Integration with external calendar providers

#### 4. Authentication & SSO
- ✅ Azure AD Single Sign-On
- ✅ Google OAuth integration
- ✅ Session management with PostgreSQL
- ✅ Guest mode for public access
- ✅ Role-based access control ready

### ✅ Technical Excellence

#### 1. Azure Deployment
- ✅ Node.js Express app with REST API
- ✅ PostgreSQL Flexible Server with **private access only** (no public endpoint)
- ✅ Azure App Service (B1 Linux) with Docker container
- ✅ VNet integration with dedicated subnets for app and database
- ✅ Private DNS zone for secure database resolution
- ✅ Automated database connection testing

#### 2. Containerization
- ✅ Multi-stage Docker build for optimized images
- ✅ Alpine-based Node.js 18 runtime
- ✅ Azure Container Registry (ACR) integration
- ✅ Automated image building and pushing via CI/CD
- ✅ Local development support with Docker Compose

#### 3. Infrastructure as Code (Terraform)
- ✅ Multi-environment support (dev/staging/prod) via variables
- ✅ Complete infrastructure provisioning: App Service, PostgreSQL, VNet, Subnets, Private DNS
- ✅ State management with version control
- ✅ Modular and reusable Terraform configuration
- ✅ Automated infrastructure recreation scripts

#### 4. CI/CD Pipeline (GitHub Actions)
- ✅ Automated Docker image build and push to ACR
- ✅ Terraform-based infrastructure deployment
- ✅ Application deployment to Azure App Service
- ✅ Environment variable and secret management
- ✅ Automated testing and verification

## 📁 Project Structure

```
azure-psql-app/
├── app/                      # Node.js application
│   ├── index.js             # Express REST API
│   ├── package.json         # Dependencies
│   └── test/                # Connection tests
├── infra/                   # Terraform IaC
│   ├── main.tf             # Infrastructure resources
│   ├── variables.tf        # Input variables
│   ├── outputs.tf          # Resource outputs
│   ├── terraform.tfvars    # Environment config (gitignored)
│   └── .env.local          # Local secrets (gitignored)
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md     # System architecture
│   ├── DEPLOYMENT.md       # Deployment guide
│   └── TROUBLESHOOTING.md  # Common issues
├── scripts/                 # Automation scripts
│   ├── deploy.sh           # Unified deployment script
│   ├── run-local.sh        # Local development
│   └── README.md           # Scripts documentation
├── .github/workflows/       # CI/CD pipelines
│   └── deploy-azure-infrastructure.yml  # Main deployment workflow
├── Dockerfile              # Container image build
└── README.md               # This file
```

## 🏗️ Architecture Overview

```mermaid
graph TB
    User[Users] --> WebApp[Azure Web App<br/>notesapp-dev-app]
    
    subgraph Azure["Azure West Europe"]
        WebApp --> VNet[Virtual Network<br/>10.0.0.0/16]
        
        subgraph Compute["Compute Resources"]
            WebApp
            ACR[Container Registry]
        end
        
        subgraph Network["Private Network"]
            VNet --> AppSubnet[App Subnet<br/>10.0.2.0/24]
            VNet --> DBSubnet[DB Subnet<br/>10.0.1.0/24]
            DBSubnet --> PG[PostgreSQL<br/>Private Access Only]
        end
        
        subgraph DNS["Private DNS"]
            PrivateDNS[Private DNS Zone]
        end
    end
    
    ACR -.->|Pull Image| WebApp
    AppSubnet -->|Private Connection| PG
    PrivateDNS -.->|DNS Resolution| PG
    
    style PG fill:#00aa00,color:#fff
    style WebApp fill:#0078d4,color:#fff
```

For detailed architecture diagrams and component descriptions, see [**Architecture Documentation**](./docs/ARCHITECTURE.md).

## 🚀 Quick Start

### Prerequisites

**Required Tools:**
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (v2.50+)
- [Terraform](https://www.terraform.io/downloads) (v1.5+)
- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18+) - for local development

**Azure Requirements:**
- Azure subscription with Contributor access
- Service Principal for GitHub Actions
- Sufficient quota in target region (West Europe recommended)

### 30-Second Deployment

```bash
# 1. Clone repository
git clone https://github.com/kozuchowskihubert/azure-psql-app.git
cd azure-psql-app

# 2. Configure Azure credentials
az login

# 3. Deploy infrastructure
cd infra
terraform init
terraform apply -auto-approve

# 4. Deploy application (via GitHub Actions)
# Push to main branch triggers automated deployment
git push origin main
```

For detailed setup instructions, see [**Deployment Guide**](./docs/DEPLOYMENT.md).

### Local Development

```bash
# Install dependencies
cd app
npm install

# Set environment variables
export DB_HOST=localhost
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=notesdb
export DB_PORT=5432

# Run locally
npm start

# Or use Docker
docker build -t notesapp .
docker run -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=yourpassword \
  notesapp
```

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

#### Notes Management
- Create, edit, and delete notes via intuitive form
- View all stored notes in organized lists
- Category filtering and search functionality
- Dark mode toggle for comfortable viewing
- Support for text notes and Mermaid diagrams
- Automatic refresh after CRUD operations

#### Excel Data Workspace (NEW)
- **No database required** - All processing happens in the browser
- Upload Excel files via drag-and-drop or file picker
- Edit data in real-time with spreadsheet interface
- Apply formulas and calculations (SUM, AVERAGE, IF, VLOOKUP, etc.)
- Create charts and visualizations
- Filter, sort, and search across datasets
- Export to Excel, CSV, PDF, or JSON formats
- Multiple sheet support with tabs
- Undo/redo functionality
- Data validation and cell formatting
- Offline support with localStorage caching

### API Endpoints

#### Notes API
- `GET /` - Web UI for notes management
- `GET /notes` - List all notes (JSON)
- `POST /notes` - Add a note (JSON body: `{ "text": "your note" }`)
- `PUT /notes/:id` - Update a note
- `DELETE /notes/:id` - Delete a note

#### Calendar API
- `GET /api/calendar/events` - List calendar events
- `POST /api/calendar/events` - Create event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event

#### Meeting API
- `GET /api/meetings/rooms` - List meeting rooms
- `POST /api/meetings/bookings` - Book a meeting room
- `GET /api/meetings/availability` - Check room availability

#### Authentication API
- `GET /api/auth/status` - Check SSO status
- `GET /api/auth/login/azure` - Azure AD login
- `GET /api/auth/login/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

#### Excel API (Client-Side Only)
- No server endpoints - All operations handled in browser
- Uses SheetJS/XLSX library for Excel processing
- Local storage for session persistence

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
## 🔐 Security & Configuration

### GitHub Secrets Configuration

Configure the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

| Secret | Description | How to Obtain |
|--------|-------------|---------------|
| `AZURE_CREDENTIALS` | Service Principal JSON | `az ad sp create-for-rbac --sdk-auth` |
| `ARM_CLIENT_ID` | Service Principal App ID | From AZURE_CREDENTIALS JSON |
| `ARM_CLIENT_SECRET` | Service Principal Secret | From AZURE_CREDENTIALS JSON |
| `ARM_TENANT_ID` | Azure Tenant ID | From AZURE_CREDENTIALS JSON |
| `ARM_SUBSCRIPTION_ID` | Azure Subscription ID | From AZURE_CREDENTIALS JSON |
| `DB_PASSWORD` | PostgreSQL Password | Choose a strong password |
| `ACR_LOGIN_SERVER` | Container Registry URL | From Terraform outputs |
| `ACR_USERNAME` | ACR Admin Username | From Terraform outputs |
| `ACR_PASSWORD` | ACR Admin Password | From Terraform outputs |

### Local Configuration

Create `infra/terraform.tfvars` (gitignored):
```hcl
prefix      = "notesapp"
env         = "dev"
location    = "westeurope"
db_password = "YourSecurePassword123!"
```

### Environment Variables

The application uses the following environment variables:

```env
DB_HOST=<postgres-fqdn>
DB_USER=notesadmin
DB_PASSWORD=<secure-password>
DB_NAME=notesdb
DB_PORT=5432
DB_SSL=true
PORT=8080
```

## 📊 Monitoring & Operations

### Health Checks

```bash
# Application health
curl https://notesapp-dev-app.azurewebsites.net/health

# Database connectivity
curl https://notesapp-dev-app.azurewebsites.net/notes
```

### Logs

```bash
# Stream application logs
az webapp log tail \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app

# Download logs
az webapp log download \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app
```

### Infrastructure Management

```bash
# View all resources
az resource list \
  --resource-group notesapp-dev-rg \
  --output table

# Get Terraform outputs
cd infra
terraform output

# Deploy or update application
./scripts/deploy.sh all

# Deploy only infrastructure
./scripts/deploy.sh infra

# Build and push new image
./scripts/deploy.sh image
```

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for automated deployment. The pipeline is defined in `.github/workflows/deploy-azure-infrastructure.yml`.

### Pipeline Stages

```mermaid
graph LR
    A[Git Push] --> B[Checkout Code]
    B --> C[Build Docker Image]
    C --> D[Push to ACR]
    D --> E[Terraform Init]
    E --> F[Terraform Apply]
    F --> G[Deploy to App Service]
    G --> H[Verify Deployment]
    
    style H fill:#00aa00,color:#fff
```

### Workflow Triggers
- **Automatic**: Push to `main` branch
- **Manual**: Workflow dispatch from GitHub Actions tab

### Pipeline Jobs

1. **Docker Build & Push**
   - Build multi-stage Docker image
   - Tag with commit SHA and 'latest'
   - Push to Azure Container Registry

2. **Infrastructure Deployment**
   - Initialize Terraform
   - Plan infrastructure changes
   - Apply changes to Azure

3. **Application Deployment**
   - Configure App Service environment
   - Deploy container from ACR
   - Restart application

4. **Verification**
   - Test health endpoint
   - Verify database connectivity
   - Run automated tests

For detailed pipeline documentation, see [**Deployment Guide**](./docs/DEPLOYMENT.md).

## 🛠️ Troubleshooting

### Common Issues

#### Container Fails to Start
```bash
# Check logs
az webapp log tail --resource-group notesapp-dev-rg --name notesapp-dev-app

# Verify environment variables
az webapp config appsettings list \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app
```

#### Database Connection Errors
```bash
# Verify VNet integration
az webapp vnet-integration list \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app

# Check Private DNS
az network private-dns link vnet list \
  --resource-group notesapp-dev-rg \
  --zone-name notesapp-dev.postgres.database.azure.com
```

#### Terraform State Lock
```bash
# Kill stuck processes
pkill -9 terraform

# Force unlock (use carefully)
cd infra
terraform force-unlock <LOCK_ID>
```

For comprehensive troubleshooting, see [**Troubleshooting Guide**](./docs/TROUBLESHOOTING.md).

## 📈 Cost Estimation

| Resource | SKU | Monthly Cost (USD) |
|----------|-----|-------------------|
| App Service Plan | B1 | ~$13 |
| PostgreSQL Flexible Server | B_Standard_B1ms | ~$12 |
| Container Registry | Basic | ~$5 |
| VNet & DNS | Standard | ~$1 |
| **Total** | | **~$31/month** |

*Costs are approximate and may vary by region and usage.*

## 🎯 Deployment History

### Issues Encountered & Resolved

1. **Azure AD Permissions** (403 Error)
   - **Issue**: MSA account couldn't create Azure AD resources
   - **Solution**: Removed Azure AD resources from Terraform, created Service Principal manually
   - **Documentation**: [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md#azure-ad-permissions)

2. **Region Quota Restrictions**
   - **Issue**: East US region had quota limits for PostgreSQL
   - **Solution**: Migrated infrastructure to West Europe
   - **Documentation**: [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md#region-and-quota-issues)

3. **Terraform State Conflicts**
   - **Issue**: Resources existed but not in Terraform state
   - **Solution**: Imported existing resources using `terraform import`
   - **Documentation**: [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md#terraform-state-issues)

4. **Container Registry Authentication**
   - **Issue**: GitHub Actions couldn't push to ACR
   - **Solution**: Updated ACR credentials in GitHub Secrets after infrastructure recreation
   - **Documentation**: [DEPLOYMENT.md](./docs/DEPLOYMENT.md#configuration-management)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Azure, Terraform, and Docker
- Deployed with GitHub Actions
- Documentation generated with Mermaid diagrams
- Infrastructure design based on Azure best practices

## 📞 Support

- 📖 **Documentation**: See [`docs/`](./docs) folder
- 🐛 **Issues**: [GitHub Issues](https://github.com/kozuchowskihubert/azure-psql-app/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/kozuchowskihubert/azure-psql-app/discussions)
- 🗺️ **Roadmap**: See [ROADMAP.md](./ROADMAP.md) for upcoming features

---

## 🔮 What's Next?

### Excel Data Workspace (Coming Q1 2026)

We're building a powerful **client-side Excel manipulation tool** that works entirely in your browser:

- ✨ **No Database Required** - All processing happens locally
- 📊 **Full Excel Support** - Import/export .xlsx, .xls, and CSV files
- 🎨 **Rich Editing** - Formulas, formatting, charts, and pivot tables
- 🚀 **Fast & Offline** - Works without internet after initial load
- 🔒 **Privacy First** - Your data never leaves your browser
- 📱 **Mobile Ready** - Responsive design for tablets and phones

**Key Features**:
- Real-time data editing in spreadsheet view
- Formula engine (SUM, VLOOKUP, IF, and more)
- Data visualization with charts
- Export to Excel, CSV, PDF, or JSON
- Multi-sheet support
- Offline storage with auto-save
- Drag-and-drop file upload

**Why This Matters**: Perfect for quick data analysis, offline work, and scenarios where you don't want to store data in a database. Great for sensitive data processing, temporary calculations, or working in low-connectivity environments.

See our [**Product Roadmap**](./ROADMAP.md) for the complete development plan and timeline.

---

**Built with ❤️ using Azure Cloud Platform**
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

## Project Attribution

This project was created entirely by **Hubert Kozuchowski**. See [AUTHORS](./AUTHORS) file for details.

**Note**: The AUTHORS file is locked and cannot be modified to preserve the original authorship record.

## Troubleshooting

### Common Issues
1. **Subscription not found**: Verify `.azure-subscription` contains correct GUID
2. **SPN authentication fails**: Delete `.env.local` and rerun `make authenticate` to regenerate
3. **Terraform errors**: Run `terraform init` again, check Azure credentials
4. **Docker build fails**: Ensure you're in project root, check Dockerfile path

### Support
- Review [MAKEFILE.md](../MAKEFILE.md) for automation details
- Check `.github/workflows/deploy-azure-infrastructure.yml` for pipeline configuration
- Verify all prerequisites are installed
