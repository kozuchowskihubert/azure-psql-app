# Azure PostgreSQL App - Architecture Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Components](#components)
- [Infrastructure Design](#infrastructure-design)
- [Network Architecture](#network-architecture)
- [Security Model](#security-model)
- [Data Flow](#data-flow)

## Overview

This application is a containerized Node.js notes application deployed on Azure App Service with PostgreSQL Flexible Server as the database backend. The infrastructure is fully managed through Terraform and automated via GitHub Actions CI/CD pipeline.

### Key Features
- **Containerized Application**: Docker-based deployment for consistency
- **Managed Database**: Azure PostgreSQL Flexible Server with private networking
- **Infrastructure as Code**: Terraform for reproducible infrastructure
- **CI/CD Automation**: GitHub Actions for automated deployments
- **Private Networking**: VNet integration for secure database access

## Architecture Diagram

```mermaid
graph TB
    subgraph "External"
        User[User/Browser]
        GitHub[GitHub Repository]
    end

    subgraph "CI/CD Pipeline"
        GHA[GitHub Actions]
        Terraform[Terraform]
    end

    subgraph "Azure Subscription - West Europe"
        subgraph "Resource Group: notesapp-dev-rg"
            
            subgraph "Container Registry"
                ACR[Azure Container Registry<br/>notesappdevacr.azurecr.io]
            end
            
            subgraph "Compute"
                ASP[App Service Plan<br/>B1 Linux]
                WebApp[Azure Web App<br/>notesapp-dev-app]
            end
            
            subgraph "Virtual Network: 10.0.0.0/16"
                subgraph "App Subnet: 10.0.2.0/24"
                    AppInt[Web App VNet Integration]
                end
                
                subgraph "DB Subnet: 10.0.1.0/24"
                    PG[PostgreSQL Flexible Server<br/>B_Standard_B1ms<br/>Private Access Only]
                    PGDB[(notesdb)]
                end
            end
            
            subgraph "DNS"
                PrivateDNS[Private DNS Zone<br/>notesapp-dev.postgres.database.azure.com]
            end
        end
    end

    User -->|HTTPS| WebApp
    GitHub -->|Trigger| GHA
    GHA -->|Build & Push| ACR
    GHA -->|Deploy Infrastructure| Terraform
    Terraform -->|Provision| ASP
    Terraform -->|Provision| WebApp
    Terraform -->|Provision| PG
    Terraform -->|Provision| ACR
    WebApp -->|Pull Image| ACR
    WebApp -->|Private Connection| AppInt
    AppInt -->|10.0.0.0/16| PG
    PG -->|Uses| PGDB
    PrivateDNS -->|DNS Resolution| PG
    
    style User fill:#e1f5ff
    style WebApp fill:#0078d4,color:#fff
    style PG fill:#0078d4,color:#fff
    style ACR fill:#0078d4,color:#fff
    style GHA fill:#2088ff,color:#fff
    style Terraform fill:#7b42bc,color:#fff
```

## Components

### 1. Application Layer

#### Azure Web App (App Service)
- **SKU**: B1 (Basic)
- **OS**: Linux
- **Runtime**: Docker Container
- **Location**: West Europe
- **Features**:
  - VNet Integration for private database access
  - Container Registry integration
  - Environment variable configuration
  - Application Insights (optional)

#### Docker Container
- **Base Image**: Node.js 18-alpine
- **Build**: Multi-stage build for optimization
- **Registry**: Azure Container Registry
- **Application**: Express.js REST API

### 2. Data Layer

#### PostgreSQL Flexible Server
- **SKU**: B_Standard_B1ms (Burstable)
- **Version**: 14
- **Storage**: 32 GB
- **Networking**: Private access only (no public endpoint)
- **Features**:
  - VNet integration via delegated subnet
  - Private DNS zone for name resolution
  - Automatic backups
  - High availability (configurable)

#### Database
- **Name**: notesdb
- **Charset**: UTF8
- **Collation**: en_US.utf8

### 3. Container Registry

#### Azure Container Registry (ACR)
- **SKU**: Basic
- **Admin Enabled**: Yes (for CI/CD)
- **Features**:
  - Docker image storage
  - Automatic image scanning (optional)
  - Geo-replication (upgradeable)

### 4. Networking

#### Virtual Network
- **Address Space**: 10.0.0.0/16
- **Subnets**:
  - **App Subnet** (10.0.2.0/24): For Web App VNet integration
  - **DB Subnet** (10.0.1.0/24): For PostgreSQL with delegation

#### Private DNS Zone
- **Zone**: notesapp-dev.postgres.database.azure.com
- **Purpose**: Private DNS resolution for PostgreSQL
- **Linked VNet**: notesapp-dev-vnet

### 5. CI/CD Components

#### GitHub Actions
- **Workflows**:
  - Build and push Docker image
  - Provision infrastructure via Terraform
  - Deploy application to App Service

#### Terraform
- **Backend**: Local state (upgradeable to Azure Storage)
- **Provider**: azurerm ~> 3.0
- **Resources Managed**: All infrastructure components

## Infrastructure Design

### Resource Hierarchy

```mermaid
graph TD
    Sub[Azure Subscription]
    Sub --> RG[Resource Group<br/>notesapp-dev-rg]
    
    RG --> VNet[Virtual Network<br/>10.0.0.0/16]
    RG --> ACR[Container Registry]
    RG --> ASP[App Service Plan]
    RG --> DNS[Private DNS Zone]
    
    VNet --> AppSubnet[App Subnet<br/>10.0.2.0/24]
    VNet --> DBSubnet[DB Subnet<br/>10.0.1.0/24]
    
    AppSubnet --> WebApp[Web App]
    DBSubnet --> PG[PostgreSQL Server]
    
    ASP --> WebApp
    PG --> DB[(Database)]
    DNS --> PG
    
    style Sub fill:#f9f9f9
    style RG fill:#e1f5ff
    style VNet fill:#d4edda
    style ACR fill:#fff3cd
    style ASP fill:#fff3cd
    style WebApp fill:#0078d4,color:#fff
    style PG fill:#0078d4,color:#fff
```

### Regional Design

**Primary Region**: West Europe
- **Rationale**: Selected due to quota restrictions in East US
- **Components**: All resources deployed in West Europe

**High Availability Considerations**:
- PostgreSQL: Supports zone-redundant HA (upgradeable)
- App Service: Multiple instances possible (scale up/out)
- ACR: Geo-replication available (upgradeable)

## Network Architecture

### Private Network Flow

```mermaid
sequenceDiagram
    participant User
    participant WebApp as Web App<br/>(Public Endpoint)
    participant AppInt as VNet Integration<br/>(10.0.2.0/24)
    participant DNS as Private DNS
    participant PG as PostgreSQL<br/>(10.0.1.0/24)
    
    User->>WebApp: HTTPS Request
    WebApp->>AppInt: Access Database
    AppInt->>DNS: Resolve PostgreSQL FQDN
    DNS-->>AppInt: Private IP
    AppInt->>PG: SQL Query (Private Network)
    PG-->>AppInt: Query Response
    AppInt-->>WebApp: Data
    WebApp-->>User: HTTP Response
    
    Note over AppInt,PG: All traffic stays within VNet (10.0.0.0/16)
```

### Security Boundaries

```mermaid
graph LR
    subgraph "Public Internet"
        Users[Users]
    end
    
    subgraph "Azure Public Services"
        WebAppPublic[Web App<br/>Public Endpoint]
        ACRPublic[Container Registry<br/>Public Endpoint]
    end
    
    subgraph "Private Network - VNet"
        WebAppPrivate[Web App<br/>VNet Integration]
        PostgreSQL[PostgreSQL<br/>Private Only]
    end
    
    Users -->|HTTPS| WebAppPublic
    WebAppPublic -.->|Same Resource| WebAppPrivate
    WebAppPrivate -->|Private Connection| PostgreSQL
    ACRPublic -.->|Pull Images| WebAppPublic
    
    style PostgreSQL fill:#00aa00,color:#fff
    style WebAppPrivate fill:#ffcc00
    style WebAppPublic fill:#ff6600,color:#fff
```

## Security Model

### Authentication & Authorization

1. **Service Principal**
   - Used by GitHub Actions for Azure authentication
   - Permissions: Contributor role on subscription
   - Credentials stored as GitHub Secrets

2. **Container Registry**
   - Admin credentials enabled for CI/CD
   - Credentials stored as GitHub Secrets
   - Username/password authentication

3. **Database Access**
   - PostgreSQL admin user: `notesadmin`
   - Password stored in:
     - Terraform variables (terraform.tfvars - gitignored)
     - GitHub Secrets (DB_PASSWORD)
     - App Service environment variables

### Network Security

```mermaid
graph TB
    subgraph "Security Layers"
        L1[Layer 1: Public Access Control]
        L2[Layer 2: VNet Isolation]
        L3[Layer 3: Subnet Delegation]
        L4[Layer 4: Private DNS]
        L5[Layer 5: Database Authentication]
    end
    
    L1 -->|Web App: Public<br/>PostgreSQL: Private Only| L2
    L2 -->|VNet: 10.0.0.0/16<br/>Internal Traffic Only| L3
    L3 -->|DB Subnet Delegated<br/>to PostgreSQL Service| L4
    L4 -->|Private DNS Resolution<br/>No Public DNS| L5
    L5 -->|Username/Password<br/>SSL Enforced| Access[Database Access]
    
    style Access fill:#00aa00,color:#fff
```

### Secrets Management

| Secret | Storage Location | Purpose |
|--------|-----------------|---------|
| `AZURE_CREDENTIALS` | GitHub Secrets | Service Principal credentials |
| `ARM_CLIENT_ID` | GitHub Secrets | Terraform Azure auth |
| `ARM_CLIENT_SECRET` | GitHub Secrets | Terraform Azure auth |
| `ARM_TENANT_ID` | GitHub Secrets | Terraform Azure auth |
| `ARM_SUBSCRIPTION_ID` | GitHub Secrets | Terraform Azure auth |
| `DB_PASSWORD` | GitHub Secrets, terraform.tfvars | PostgreSQL admin password |
| `ACR_USERNAME` | GitHub Secrets | Container registry login |
| `ACR_PASSWORD` | GitHub Secrets | Container registry password |
| `ACR_LOGIN_SERVER` | GitHub Secrets | Container registry URL |

## Data Flow

### Application Request Flow

```mermaid
sequenceDiagram
    actor User
    participant LB as Azure Load Balancer
    participant App as Web App Container
    participant DB as PostgreSQL

    User->>LB: GET /notes
    LB->>App: Forward Request
    
    App->>App: Validate Request
    App->>DB: SELECT * FROM notes
    DB-->>App: Query Results
    
    App->>App: Format Response
    App-->>LB: JSON Response
    LB-->>User: Return Notes
    
    Note over App,DB: Connection via VNet<br/>Private Network
```

### CI/CD Deployment Flow

```mermaid
sequenceDiagram
    actor Developer
    participant GH as GitHub
    participant GHA as GitHub Actions
    participant TF as Terraform
    participant ACR as Azure Container Registry
    participant Azure as Azure Resources
    participant App as Web App

    Developer->>GH: Push Code
    GH->>GHA: Trigger Workflow
    
    par Docker Build
        GHA->>GHA: Build Docker Image
        GHA->>ACR: Push Image
    and Infrastructure
        GHA->>TF: terraform init
        GHA->>TF: terraform plan
        GHA->>TF: terraform apply
        TF->>Azure: Provision/Update Resources
    end
    
    Azure-->>App: Deploy Container
    App->>ACR: Pull Latest Image
    ACR-->>App: Return Image
    App->>App: Start Container
    
    Note over App: Application Ready
```

### Database Connection Flow

```mermaid
graph LR
    A[Web App Starts] --> B{Environment Variables Set?}
    B -->|No| C[Error: Missing Config]
    B -->|Yes| D[Resolve DB Host via Private DNS]
    D --> E[Connect to PostgreSQL<br/>via VNet]
    E --> F{Connection Successful?}
    F -->|No| G[Retry Logic]
    F -->|Yes| H[Initialize Connection Pool]
    H --> I[Application Ready]
    G --> E
    C --> J[Container Fails]
    
    style I fill:#00aa00,color:#fff
    style J fill:#ff0000,color:#fff
```

## Cost Optimization

### Current Configuration Costs (Approximate Monthly)

| Resource | SKU | Estimated Cost (USD) |
|----------|-----|---------------------|
| App Service Plan | B1 | ~$13 |
| PostgreSQL Flexible Server | B_Standard_B1ms | ~$12 |
| Container Registry | Basic | ~$5 |
| VNet | Standard | ~$0 (first 50GB free) |
| Private DNS | Standard | ~$0.50 |
| **Total** | | **~$30.50/month** |

### Optimization Recommendations

1. **Development Environment**
   - Use lower tiers during non-business hours
   - Consider Azure Dev/Test pricing
   - Implement auto-shutdown for non-production

2. **Production Scaling**
   - App Service: Scale up to P1V2+ for better performance
   - PostgreSQL: Enable zone redundancy for HA
   - ACR: Upgrade to Standard for geo-replication

## Disaster Recovery

### Backup Strategy

```mermaid
graph TD
    A[Backup Strategy] --> B[Database Backups]
    A --> C[Infrastructure as Code]
    A --> D[Container Images]
    
    B --> B1[Automated Daily Backups]
    B --> B2[7-Day Retention]
    B --> B3[Point-in-Time Restore]
    
    C --> C1[Git Repository]
    C --> C2[Terraform State]
    C --> C3[Version Control]
    
    D --> D1[ACR Image Retention]
    D --> D2[Tag-based Versioning]
    D --> D3[Manual Backup to Azure Storage]
    
    style A fill:#0078d4,color:#fff
```

### Recovery Procedures

1. **Database Recovery**
   - Restore from automated backup
   - Point-in-time recovery available
   - RPO: 5 minutes, RTO: ~15 minutes

2. **Infrastructure Recovery**
   ```bash
   cd infra
   terraform apply -auto-approve
   ```

3. **Application Recovery**
   - Re-deploy from ACR
   - GitHub Actions workflow can be manually triggered
   - Rollback to previous image tag

## Monitoring & Observability

### Recommended Monitoring Setup

```mermaid
graph TB
    subgraph "Monitoring Stack"
        AI[Application Insights]
        Metrics[Azure Monitor Metrics]
        Logs[Log Analytics]
        Alerts[Azure Alerts]
    end
    
    subgraph "Resources"
        WebApp[Web App]
        PG[PostgreSQL]
        ACR[Container Registry]
    end
    
    WebApp --> AI
    WebApp --> Metrics
    PG --> Metrics
    PG --> Logs
    ACR --> Metrics
    
    AI --> Alerts
    Metrics --> Alerts
    Logs --> Alerts
    
    Alerts -->|Notifications| Email[Email/Teams/PagerDuty]
    
    style AI fill:#0078d4,color:#fff
```

### Key Metrics to Monitor

1. **Application Performance**
   - Response time
   - Request rate
   - Error rate
   - CPU/Memory usage

2. **Database Performance**
   - Connection count
   - Query performance
   - Storage usage
   - CPU utilization

3. **Container Registry**
   - Pull rate
   - Storage usage
   - Image scan results

## Scaling Considerations

### Horizontal Scaling

```mermaid
graph LR
    A[Single Instance] -->|Scale Out| B[Multiple Instances]
    B --> C[Load Balancer]
    C --> D[Instance 1]
    C --> E[Instance 2]
    C --> F[Instance N]
    
    D --> G[PostgreSQL<br/>Connection Pool]
    E --> G
    F --> G
    
    style C fill:#0078d4,color:#fff
```

### Vertical Scaling

| Component | Current | Recommended Upgrade Path |
|-----------|---------|-------------------------|
| App Service | B1 | B2 → P1V2 → P2V2 |
| PostgreSQL | B_Standard_B1ms | B_Standard_B2s → GP_Standard_D2s_v3 |
| ACR | Basic | Standard → Premium |

---

**Document Version**: 1.0  
**Last Updated**: November 8, 2025  
**Author**: DevOps Team  
**Review Date**: Quarterly
