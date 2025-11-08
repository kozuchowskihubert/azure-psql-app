# Documentation Index

Welcome to the Azure PostgreSQL Notes App documentation! This modern web application features a beautiful interface with full CRUD operations, deployed on Azure with automated CI/CD.

## 🌟 Application Features

### **Modern Web Interface**
- 🎨 Beautiful, responsive SPA with Tailwind CSS
- 🌓 Dark mode with persistent preferences
- 📱 Mobile-first design (works on all devices)
- ⚡ Real-time search and filtering
- 🏷️ Category organization
- ⭐ Important notes highlighting
- 📊 Live statistics dashboard

### **Full Note Management**
- ✏️ Create, read, update, delete operations
- 🔍 Advanced search across titles and content
- 🏷️ Category filtering and tagging
- 🔄 Multiple sorting options
- 🕐 Relative timestamps
- 💾 Automatic schema migration

**Live Application**: https://notesapp-dev-app.azurewebsites.net

## 📚 Core Documentation

### [🏗️ Architecture](./ARCHITECTURE.md)
**Complete system architecture and design documentation**

Topics covered:
- Modern SPA frontend architecture
- System components (App Service, PostgreSQL, ACR, Storage)
- Enhanced database schema with 6 fields
- Terraform remote state with Azure Storage
- Network architecture and private networking
- Security model and authentication
- Complete CI/CD pipeline (6 stages)
- Cost optimization strategies (~$18/month)
- Monitoring and health checks
- Scaling considerations

**Key Diagrams:**
- System architecture with Terraform backend
- Resource hierarchy
- Network flow
- Security boundaries
- Complete CI/CD deployment flow

**Recommended for:** Architects, DevOps engineers, and technical stakeholders

---

### [🚀 Deployment Guide](./DEPLOYMENT.md)
**Step-by-step deployment and operational procedures**

Topics covered:
- Prerequisites and initial setup
- Azure Storage backend configuration
- Service Principal creation
- GitHub Secrets configuration (11 secrets)
- Programmatic secret setup with GitHub CLI
- Local configuration
- Complete CI/CD pipeline overview
- Manual deployment procedures
- State migration and resource import
- Region selection (West US 2)
- Post-deployment verification
- Rollback procedures

**Key Features:**
- Terraform remote state in Azure Storage
- Automated health check verification
- Docker layer caching for fast builds
- Complete resource import support

**Recommended for:** DevOps engineers, SREs, and deployment teams

---

### [🔧 Troubleshooting](./TROUBLESHOOTING.md)
**Common issues, solutions, and debugging guidance**

Topics covered:
- Issue decision trees
- Terraform output naming issues
- Remote state configuration
- Health check timing problems
- Region and quota issues
- Container registry authentication
- Database connection issues
- Application deployment failures
- CI/CD pipeline failures
- Quick reference commands

**Updated for:**
- Health endpoint verification
- Remote state troubleshooting
- ACR naming conflicts
- Database schema migration

**Recommended for:** Everyone - keep this handy when issues arise!

---

## 🎯 Quick Access

### By Role

#### **Developers**
- [API Documentation](#api-documentation)
- [Frontend Code](../app/public/)
- [Backend Code](../app/index.js)
- [Database Schema](#database-schema)
- [Local Development](#local-development-quick-start)

#### **DevOps Engineers**
- [CI/CD Pipeline](./DEPLOYMENT.md#cicd-pipeline)
- [Terraform Configuration](../infra/)
- [Remote State Setup](./DEPLOYMENT.md#terraform-backend-setup)
- [GitHub Secrets](./DEPLOYMENT.md#github-secrets-configuration)

#### **Architects**
- [System Architecture](./ARCHITECTURE.md#architecture-diagram)
- [Network Design](./ARCHITECTURE.md#network-architecture)
- [Security Model](./ARCHITECTURE.md#security-model)
- [Cost Analysis](./ARCHITECTURE.md#cost-optimization)

#### **Operations/SRE**
- [Health Endpoint](#health-check)
- [Monitoring Setup](./ARCHITECTURE.md#monitoring--observability)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Deployment Verification](./DEPLOYMENT.md#post-deployment-verification)

---

## 🔌 API Documentation

### Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-08T13:25:36.201Z"
}
```

### Notes API

#### Get All Notes
**Endpoint**: `GET /notes`

**Response**:
```json
[
  {
    "id": 1,
    "title": "My Note",
    "content": "Note content here",
    "category": "Personal",
    "important": false,
    "created_at": "2025-11-08T12:00:00.000Z",
    "updated_at": "2025-11-08T12:00:00.000Z"
  }
]
```

#### Get Single Note
**Endpoint**: `GET /notes/:id`

#### Create Note
**Endpoint**: `POST /notes`

**Request Body**:
```json
{
  "title": "New Note",
  "content": "Content here",
  "category": "Work",
  "important": true
}
```

#### Update Note
**Endpoint**: `PUT /notes/:id`

**Request Body**:
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "category": "Personal",
  "important": false
}
```

#### Delete Note
**Endpoint**: `DELETE /notes/:id`

**Response**: 204 No Content

---

## 🗄️ Database Schema

### Notes Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `title` | VARCHAR(255) | NOT NULL | Note title |
| `content` | TEXT | NOT NULL | Note content |
| `category` | VARCHAR(100) | NULL | Optional category |
| `important` | BOOLEAN | DEFAULT FALSE | Important flag |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

#### **DevOps Engineers**
- [CI/CD Pipeline](./DEPLOYMENT.md#cicd-pipeline)
- [Terraform Configuration](../infra/)
- [Infrastructure Recreation](./DEPLOYMENT.md#infrastructure-recreation-process)
- [Automation Scripts](../scripts/)

#### **Architects**
- [System Architecture](./ARCHITECTURE.md#architecture-diagram)
- [Network Design](./ARCHITECTURE.md#network-architecture)
- [Security Model](./ARCHITECTURE.md#security-model)
- [Cost Analysis](./ARCHITECTURE.md#cost-optimization)

#### **Operations/SRE**
- [Monitoring Setup](./ARCHITECTURE.md#monitoring--observability)
- [Health Checks](./DEPLOYMENT.md#post-deployment-verification)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Disaster Recovery](./ARCHITECTURE.md#disaster-recovery)

---

## 🚀 Quick Start Guides

### Local Development Quick Start

```bash
# Clone repository
git clone https://github.com/kozuchowskihubert/azure-psql-app.git
cd azure-psql-app

# Install dependencies
cd app
npm install

# Set environment variables
export DB_HOST=localhost
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=notesdb
export DB_PORT=5432

# Run application
npm start
```

### Production Deployment Quick Start

```bash
# 1. Setup Azure credentials
az login

# 2. Create Service Principal
az ad sp create-for-rbac \
  --name "github-actions-sp" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID> \
  --sdk-auth

# 3. Configure GitHub Secrets
# (See DEPLOYMENT.md for complete list)

# 4. Deploy infrastructure
cd infra
terraform init
terraform apply -auto-approve

# 5. Push to trigger CI/CD
git push origin main
```

---

## 📊 Documentation Statistics

- **Total Documentation**: 3 comprehensive guides
- **Mermaid Diagrams**: 25+ interactive diagrams
- **Code Examples**: 100+ snippets
- **Troubleshooting Scenarios**: 15+ common issues
- **Total Lines**: 3,500+ lines of documentation

---

## 🔍 Documentation by Topic

### Infrastructure

| Topic | Document | Section |
|-------|----------|---------|
| Terraform Configuration | [Deployment](./DEPLOYMENT.md) | Configuration Management |
| Resource Provisioning | [Deployment](./DEPLOYMENT.md) | Infrastructure Deployment |
| State Management | [Troubleshooting](./TROUBLESHOOTING.md) | Terraform State Issues |
| Multi-Environment Setup | [Architecture](./ARCHITECTURE.md) | Infrastructure Design |

### Networking

| Topic | Document | Section |
|-------|----------|---------|
| VNet Architecture | [Architecture](./ARCHITECTURE.md) | Network Architecture |
| Private Networking | [Architecture](./ARCHITECTURE.md) | Private Network Flow |
| DNS Configuration | [Troubleshooting](./TROUBLESHOOTING.md) | Database Connection |
| Security Boundaries | [Architecture](./ARCHITECTURE.md) | Security Model |

### Deployment

| Topic | Document | Section |
|-------|----------|---------|
| CI/CD Pipeline | [Deployment](./DEPLOYMENT.md) | CI/CD Pipeline |
| Docker Build | [Deployment](./DEPLOYMENT.md) | Docker Build & Push |
| Manual Deployment | [Deployment](./DEPLOYMENT.md) | Manual Deployment |
| Rollback Procedures | [Deployment](./DEPLOYMENT.md) | Rollback Procedure |

### Operations

| Topic | Document | Section |
|-------|----------|---------|
| Monitoring | [Architecture](./ARCHITECTURE.md) | Monitoring & Observability |
| Health Checks | [Deployment](./DEPLOYMENT.md) | Post-Deployment Verification |
| Log Analysis | [Troubleshooting](./TROUBLESHOOTING.md) | Application Deployment |
| Backup & Recovery | [Architecture](./ARCHITECTURE.md) | Disaster Recovery |

### Security

| Topic | Document | Section |
|-------|----------|---------|
| Authentication | [Architecture](./ARCHITECTURE.md) | Authentication & Authorization |
| Secrets Management | [Architecture](./ARCHITECTURE.md) | Secrets Management |
| Network Security | [Architecture](./ARCHITECTURE.md) | Network Security |
| Azure AD | [Troubleshooting](./TROUBLESHOOTING.md) | Azure AD Permissions |

---

## 🎓 Learning Path

### Beginner
1. Read [README](../README.md) for project overview
2. Review [Architecture](./ARCHITECTURE.md) - Overview section
3. Follow [Deployment](./DEPLOYMENT.md) - Prerequisites
4. Run Local Development Quick Start

### Intermediate
1. Study [Architecture](./ARCHITECTURE.md) - Components and Design
2. Complete [Deployment](./DEPLOYMENT.md) - Manual Deployment
3. Explore Terraform configuration in `/infra`
4. Review [Troubleshooting](./TROUBLESHOOTING.md) common issues

### Advanced
1. Deep dive into [Architecture](./ARCHITECTURE.md) - Network & Security
2. Master [Deployment](./DEPLOYMENT.md) - CI/CD Pipeline
3. Study [Troubleshooting](./TROUBLESHOOTING.md) - All scenarios
4. Implement custom modifications

---

## API Documentation

### Endpoints

#### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

#### GET /notes
Retrieve all notes

**Response:**
```json
{
  "notes": [
    {
      "id": 1,
      "title": "Note title",
      "content": "Note content",
      "created_at": "2025-11-08T10:00:00Z"
    }
  ]
}
```

#### POST /notes
Create a new note

**Request:**
```json
{
  "title": "My note",
  "content": "Note content"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "My note",
  "content": "Note content",
  "created_at": "2025-11-08T10:00:00Z"
}
```

---

## 📝 Additional Resources

### External Links
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure PostgreSQL Documentation](https://docs.microsoft.com/azure/postgresql/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/actions)

### Related Files
- [Main README](../README.md) - Project overview
- [Terraform Configuration](../infra/) - Infrastructure code
- [Application Code](../app/) - Node.js application
- [Automation Scripts](../scripts/) - Helper scripts
- [CI/CD Workflows](../.github/workflows/) - GitHub Actions

---

## 🤝 Contributing to Documentation

We welcome documentation improvements! To contribute:

1. **Fix errors**: Submit a PR with corrections
2. **Add examples**: Provide real-world scenarios
3. **Improve clarity**: Suggest better explanations
4. **Add diagrams**: Create additional Mermaid diagrams
5. **Update info**: Keep documentation current

### Documentation Standards
- Use Mermaid for diagrams where possible
- Include code examples with syntax highlighting
- Provide both conceptual and practical information
- Cross-reference related sections
- Keep language clear and concise

---

## 📞 Getting Help

If you can't find what you're looking for:

1. **Search this documentation** - Use Ctrl+F in your browser
2. **Check Troubleshooting** - Most issues are covered there
3. **Review examples** - Look for similar scenarios in code
4. **Open an issue** - [GitHub Issues](https://github.com/kozuchowskihubert/azure-psql-app/issues)
5. **Start a discussion** - [GitHub Discussions](https://github.com/kozuchowskihubert/azure-psql-app/discussions)

---

**Documentation Version**: 1.0  
**Last Updated**: November 8, 2025  
**Next Review**: February 8, 2026

**Maintained by**: DevOps Team  
**License**: MIT
