# Documentation Index

Welcome to the Azure PostgreSQL App documentation! This index provides quick navigation to all available documentation resources.

## 📚 Core Documentation

### [🏗️ Architecture](./ARCHITECTURE.md)
**Complete system architecture and design documentation**

Topics covered:
- System architecture overview
- Component descriptions (App Service, PostgreSQL, ACR, VNet)
- Infrastructure design and resource hierarchy
- Network architecture and private networking
- Security model and authentication
- Data flow diagrams
- Cost optimization strategies
- Disaster recovery procedures
- Monitoring and observability
- Scaling considerations

**Key Diagrams:**
- System architecture diagram
- Resource hierarchy
- Network flow
- Security boundaries
- CI/CD deployment flow

**Recommended for:** Architects, DevOps engineers, and technical stakeholders

---

### [🚀 Deployment Guide](./DEPLOYMENT.md)
**Step-by-step deployment and operational procedures**

Topics covered:
- Prerequisites and initial setup
- Service Principal creation
- GitHub Secrets configuration
- Local configuration
- CI/CD pipeline overview
- Manual deployment procedures
- Configuration management
- Deployment workflows
- Infrastructure recreation
- Region migration
- Post-deployment verification
- Rollback procedures

**Key Diagrams:**
- Service Principal setup flow
- CI/CD pipeline stages
- Docker build & push sequence
- Infrastructure provisioning
- Deployment workflows
- Rollback procedures

**Recommended for:** DevOps engineers, SREs, and deployment teams

---

### [🔧 Troubleshooting](./TROUBLESHOOTING.md)
**Common issues, solutions, and debugging guidance**

Topics covered:
- Issue decision trees
- Azure AD permission errors
- Region and quota issues
- Terraform state problems
- Container registry authentication
- Database connection issues
- Application deployment failures
- Network and VNet issues
- CI/CD pipeline failures
- Quick reference commands

**Key Diagrams:**
- Issue decision tree
- Azure AD permission resolution flow
- Region quota decision tree
- State lock resolution
- ACR authentication flow
- Database connection troubleshooting
- Container startup troubleshooting
- Pipeline failure decision tree

**Recommended for:** Everyone - keep this handy when issues arise!

---

## 🎯 Quick Access

### By Role

#### **Developers**
- [Local Development](#local-development-quick-start)
- [Application Code](../app/)
- [Environment Variables](./DEPLOYMENT.md#configuration-management)
- [API Documentation](#api-documentation)

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
