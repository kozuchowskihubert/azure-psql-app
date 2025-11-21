# Troubleshooting Guide

## Table of Contents
- [Common Issues](#common-issues)
- [Azure AD Permissions](#azure-ad-permissions)
- [Region and Quota Issues](#region-and-quota-issues)
- [Terraform State Issues](#terraform-state-issues)
- [Container Registry Issues](#container-registry-issues)
- [Database Connection Issues](#database-connection-issues)
- [Application Deployment Issues](#application-deployment-issues)
- [Network and VNet Issues](#network-and-vnet-issues)
- [CI/CD Pipeline Failures](#cicd-pipeline-failures)

## Common Issues

### Issue Decision Tree

```mermaid
graph TD
    Start[Issue Detected] --> Category{Issue<br/>Category?}
    
    Category -->|Deployment Fails| Deploy[Deployment Issues]
    Category -->|App Not Working| App[Application Issues]
    Category -->|Can't Connect to DB| DB[Database Issues]
    Category -->|Permission Denied| Perms[Permission Issues]
    Category -->|Quota Exceeded| Quota[Quota Issues]
    
    Deploy --> DeployCheck{What Stage<br/>Failed?}
    App --> AppCheck{What's<br/>the Error?}
    DB --> DBCheck{Can You<br/>Connect?}
    Perms --> PermCheck{Which<br/>Resource?}
    Quota --> QuotaCheck{Which<br/>Region?}
    
    style Start fill:#e1f5ff
```

## Azure AD Permissions

### Issue: "Authorization_RequestDenied: Insufficient privileges"

**Error Message:**
```
ApplicationsClient#Create: Failure responding to request: 
StatusCode=403 -- Original Error: autorest/azure: 
error response cannot be parsed: "" error: EOF HTTP 403 
Forbidden: Authorization_RequestDenied
```

**Cause:**
- Using a Microsoft Account (MSA) instead of organizational account
- Service Principal lacks Azure AD permissions
- Attempting to create Azure AD resources without proper roles

#### Decision Flow

```mermaid
graph TD
    Error[403 Error on Azure AD] --> Check{Account<br/>Type?}
    Check -->|MSA Account| MSA[Microsoft Account Limitation]
    Check -->|Org Account| Role{Has Required<br/>Roles?}
    
    MSA --> Solution1[Remove Azure AD resources<br/>from Terraform]
    Role -->|No| Solution2[Request Administrator Roles]
    Role -->|Yes| Solution3[Check API Permissions]
    
    Solution1 --> Workaround[Use Azure Portal<br/>for AD Resources]
    Solution2 --> Request[Contact Azure AD Admin]
    Solution3 --> Grant[Grant API Permissions]
    
    Workaround --> Done[✓ Resolved]
    Request --> Wait[Wait for Approval]
    Grant --> Done
    
    style Done fill:#00aa00,color:#fff
```

**Solutions:**

1. **Remove Azure AD Resources from Terraform** (Recommended for MSA accounts)
   ```bash
   # Comment out Azure AD resources in main.tf
   # These resources are now managed manually:
   # - azuread_application
   # - azuread_service_principal
   # - azuread_service_principal_password
   ```

2. **Use Organizational Account**
   ```bash
   # Login with organizational account
   az login --tenant <your-org-tenant-id>
   ```

3. **Request Required Roles**
   - **Application Administrator**: To create applications
   - **Cloud Application Administrator**: Alternative role
   - **Global Administrator**: Full access (use cautiously)

**Prevention:**
- Use Service Principals with pre-created Azure AD resources
- Document which resources require manual setup
- Separate Azure AD management from infrastructure provisioning

---

## Region and Quota Issues

### Issue: "LocationIsOfferRestricted" or Quota Exceeded

**Error Messages:**
```
Error: creating PostgreSQL Flexible Server: 
Code="LocationIsOfferRestricted" 
Message="Location 'eastus' is not offer restricted"

Error: creating Linux Web App:
Code="Unauthorized" 
Message="Basic VMs quota limit 0 reached for subscription"
```

#### Region Quota Decision Tree

```mermaid
graph TD
    QuotaError[Quota Error] --> IdentifyRegion{Which<br/>Region?}
    
    IdentifyRegion --> CheckQuota[Check Available Quotas]
    CheckQuota --> HasQuota{Quota<br/>Available?}
    
    HasQuota -->|Yes, Different Region| MigrateRegion[Migrate to Available Region]
    HasQuota -->|No| RequestQuota[Request Quota Increase]
    HasQuota -->|Yes, Same Region| ConfigIssue[Check Configuration]
    
    MigrateRegion --> UpdateTF[Update terraform.tfvars]
    RequestQuota --> WaitApproval[Wait for Approval]
    ConfigIssue --> FixConfig[Fix Resource Configuration]
    
    UpdateTF --> DestroyOld[Destroy Old Resources]
    DestroyOld --> RecreateNew[Recreate in New Region]
    RecreateNew --> Success[✓ Resolved]
    
    WaitApproval --> Approved{Approved?}
    Approved -->|Yes| Success
    Approved -->|No| MigrateRegion
    
    FixConfig --> Success
    
    style Success fill:#00aa00,color:#fff
```

**Solutions:**

1. **Check Available Regions**
   ```bash
   # List regions with PostgreSQL Flexible Server availability
   az postgres flexible-server list-skus --location eastus
   az postgres flexible-server list-skus --location westeurope
   
   # List regions with App Service availability
   az appservice list-locations --sku B1
   ```

2. **Migrate to Different Region**
   ```bash
   # Update terraform.tfvars
   location = "westeurope"  # Change from "eastus"
   
   # Recreate infrastructure
   cd infra
   terraform destroy -auto-approve
   terraform apply -auto-approve
   ```

3. **Request Quota Increase**
   ```bash
   # Via Azure Portal:
   # 1. Go to Subscriptions
   # 2. Select your subscription
   # 3. Click "Usage + quotas"
   # 4. Find the specific quota
   # 5. Click "Request increase"
   ```

**Migration Checklist:**
```mermaid
graph LR
    A[Backup Database] --> B[Update location in tfvars]
    B --> C[terraform destroy]
    C --> D[terraform apply]
    D --> E[Restore Database]
    E --> F[Update DNS/Endpoints]
    F --> G[Verify Application]
    
    style G fill:#00aa00,color:#fff
```

**Regions Successfully Tested:**
- ✅ **West Europe**: All resources supported
- ❌ **East US**: Quota restrictions encountered
- ⚠️ **Other Regions**: Test before production use

---

## Terraform State Issues

### Issue: State Lock

**Error Message:**
```
Error: Error acquiring the state lock

Lock Info:
  ID:        c3650a59-0c88-f5b1-bff4-63d0ae9e491a
  Operation: OperationTypeApply
  Who:       user@machine
```

#### State Lock Resolution Flow

```mermaid
graph TD
    Lock[State Locked] --> Check{Is Terraform<br/>Running?}
    
    Check -->|Yes| Wait[Wait for Completion]
    Check -->|No| Crashed{Did Process<br/>Crash?}
    
    Crashed -->|Yes| KillProcess[Kill Terraform Processes]
    Crashed -->|No| StaleCheck[Check Lock Age]
    
    KillProcess --> ForceUnlock[Force Unlock]
    StaleCheck --> Old{> 15 min<br/>old?}
    
    Old -->|Yes| ForceUnlock
    Old -->|No| Wait
    
    Wait --> Retry[Retry Operation]
    ForceUnlock --> Retry
    
    Retry --> Success[✓ Resolved]
    
    style Success fill:#00aa00,color:#fff
```

**Solutions:**

1. **Check for Running Processes**
   ```bash
   # Find running Terraform processes
   ps aux | grep terraform
   
   # Kill processes if needed
   pkill -9 terraform
   ```

2. **Force Unlock** (Use carefully)
   ```bash
   cd infra
   terraform force-unlock <LOCK_ID>
   ```

3. **Wait and Retry**
   ```bash
   # Wait a few minutes and try again
   sleep 60
   terraform apply
   ```

### Issue: Resource Already Exists

**Error Message:**
```
Error: A resource with the ID "/subscriptions/.../resourceGroups/..." 
already exists - to be managed via Terraform this resource needs to be 
imported into the State.
```

**Solution: Import Resources**

```mermaid
graph LR
    Detect[Resource Exists] --> GetID[Get Resource ID from Error]
    GetID --> Import[terraform import]
    Import --> Verify[terraform plan]
    Verify --> Clean{Plan<br/>Clean?}
    Clean -->|Yes| Success[✓ Resolved]
    Clean -->|No| Adjust[Adjust Configuration]
    Adjust --> Verify
    
    style Success fill:#00aa00,color:#fff
```

```bash
# Import existing resource
terraform import azurerm_resource_group.rg /subscriptions/<subscription-id>/resourceGroups/<rg-name>

# Import subnet
terraform import azurerm_subnet.db_subnet /subscriptions/<subscription-id>/resourceGroups/<rg-name>/providers/Microsoft.Network/virtualNetworks/<vnet-name>/subnets/<subnet-name>

# Verify
terraform plan
```

**Batch Import Script:**
```bash
#!/bin/bash
# Import all existing resources

SUBSCRIPTION_ID="86114ec0-54f1-4cf5-85f1-b561b90bbe0b"
RG="notesapp-dev-rg"

# Import Resource Group
terraform import azurerm_resource_group.rg \
  "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG"

# Import VNet
terraform import azurerm_virtual_network.vnet \
  "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG/providers/Microsoft.Network/virtualNetworks/notesapp-dev-vnet"

# Import Subnets
terraform import azurerm_subnet.db_subnet \
  "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG/providers/Microsoft.Network/virtualNetworks/notesapp-dev-vnet/subnets/notesapp-dev-db-subnet"

terraform import azurerm_subnet.app_subnet \
  "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG/providers/Microsoft.Network/virtualNetworks/notesapp-dev-vnet/subnets/notesapp-dev-app-subnet"
```

---

## Container Registry Issues

### Issue: Authentication Failed

**Error Message:**
```
Error response from daemon: Get https://notesappdevacr.azurecr.io/v2/: 
unauthorized: authentication required
```

#### ACR Authentication Flow

```mermaid
graph TD
    AuthError[ACR Auth Error] --> Method{Auth<br/>Method?}
    
    Method -->|Azure CLI| CLI[az acr login]
    Method -->|Docker Login| Docker[docker login]
    Method -->|Service Principal| SP[SP Credentials]
    
    CLI --> CLICheck{Logged in<br/>to Azure?}
    CLICheck -->|No| AzLogin[az login]
    CLICheck -->|Yes| CLISuccess[✓ ACR Logged In]
    
    Docker --> GetCreds[Get ACR Credentials]
    GetCreds --> DockerCmd[docker login ACR]
    DockerCmd --> DockerSuccess[✓ Logged In]
    
    SP --> CheckSP{SP Has<br/>AcrPull Role?}
    CheckSP -->|No| AssignRole[Assign Role]
    CheckSP -->|Yes| SPSuccess[✓ Authorized]
    
    AzLogin --> CLI
    AssignRole --> SPSuccess
    
    CLISuccess --> Push[Push/Pull Images]
    DockerSuccess --> Push
    SPSuccess --> Push
    
    style Push fill:#00aa00,color:#fff
```

**Solutions:**

1. **Azure CLI Login**
   ```bash
   # Login to Azure
   az login
   
   # Login to ACR
   az acr login --name notesappdevacr
   ```

2. **Direct Docker Login**
   ```bash
   # Get credentials
   ACR_USERNAME=$(az acr credential show \
     --name notesappdevacr \
     --query username -o tsv)
   
   ACR_PASSWORD=$(az acr credential show \
     --name notesappdevacr \
     --query "passwords[0].value" -o tsv)
   
   # Docker login
   docker login notesappdevacr.azurecr.io \
     -u $ACR_USERNAME \
     -p $ACR_PASSWORD
   ```

3. **Update GitHub Secrets**
   ```bash
   # Get ACR credentials
   terraform output acr_login_server
   terraform output acr_admin_username
   
   # Update GitHub secrets:
   # ACR_LOGIN_SERVER
   # ACR_USERNAME
   # ACR_PASSWORD
   ```

### Issue: Image Not Found

**Error Message:**
```
Error: Failed to pull image "notesappdevacr.azurecr.io/notesapp:latest": 
manifest for notesappdevacr.azurecr.io/notesapp:latest not found
```

**Solution:**
```bash
# List available images
az acr repository list --name notesappdevacr

# List tags for repository
az acr repository show-tags \
  --name notesappdevacr \
  --repository notesapp

# Build and push if missing
docker build -t notesappdevacr.azurecr.io/notesapp:latest .
docker push notesappdevacr.azurecr.io/notesapp:latest
```

---

## Database Connection Issues

### Issue: Cannot Connect to PostgreSQL

**Error Message:**
```
Error: connection to server at "notesapp-dev-pg.postgres.database.azure.com", 
port 5432 failed: timeout expired
```

#### Database Connection Troubleshooting

```mermaid
graph TD
    ConnError[Connection Error] --> VNet{App in<br/>VNet?}
    
    VNet -->|No| AddVNet[Add VNet Integration]
    VNet -->|Yes| DNS{DNS<br/>Working?}
    
    DNS -->|No| FixDNS[Fix Private DNS Link]
    DNS -->|Yes| NSG{Firewall<br/>Rules?}
    
    NSG -->|Blocked| UpdateNSG[Update NSG Rules]
    NSG -->|Open| Creds{Credentials<br/>Correct?}
    
    Creds -->|No| UpdateCreds[Update Credentials]
    Creds -->|Yes| SSL{SSL<br/>Required?}
    
    SSL -->|Yes| EnableSSL[Enable SSL in Connection String]
    SSL -->|No| Success[✓ Connected]
    
    AddVNet --> DNS
    FixDNS --> NSG
    UpdateNSG --> Creds
    UpdateCreds --> SSL
    EnableSSL --> Success
    
    style Success fill:#00aa00,color:#fff
```

**Solutions:**

1. **Verify VNet Integration**
   ```bash
   # Check if Web App is integrated with VNet
   az webapp vnet-integration list \
     --resource-group notesapp-dev-rg \
     --name notesapp-dev-app
   ```

2. **Check Private DNS**
   ```bash
   # Verify DNS zone link
   az network private-dns link vnet list \
     --resource-group notesapp-dev-rg \
     --zone-name notesapp-dev.postgres.database.azure.com
   ```

3. **Test Connection from Web App**
   ```bash
   # SSH into Web App container (if enabled)
   az webapp ssh --resource-group notesapp-dev-rg --name notesapp-dev-app
   
   # Test DNS resolution
   nslookup notesapp-dev-pg.postgres.database.azure.com
   
   # Test connection
   nc -zv notesapp-dev-pg.postgres.database.azure.com 5432
   ```

4. **Verify Connection String**
   ```bash
   # Get database FQDN
   terraform output database_fqdn
   
   # Check app settings
   az webapp config appsettings list \
     --resource-group notesapp-dev-rg \
     --name notesapp-dev-app \
     --query "[?name=='DB_HOST']"
   ```

5. **Enable SSL**
   ```javascript
   // In connection string, ensure:
   const config = {
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME,
     port: 5432,
     ssl: {
       rejectUnauthorized: false // For Azure PostgreSQL
     }
   };
   ```

---

## Application Deployment Issues

### Issue: Container Fails to Start

**Error in Logs:**
```
Error: Cannot find module 'express'
Container failed to start
Application has crashed
```

#### Container Startup Troubleshooting

```mermaid
graph TD
    Crash[Container Crashed] --> Logs{Check<br/>Logs}
    
    Logs --> Error{Error<br/>Type?}
    
    Error -->|Module Not Found| Build[Rebuild Image]
    Error -->|Port Binding| Port[Check PORT env var]
    Error -->|DB Connection| DB[Check DB Config]
    Error -->|Permission| Perms[Check File Permissions]
    
    Build --> Push[Push to ACR]
    Port --> SetPort[Set PORT=8080]
    DB --> FixDB[Update Connection String]
    Perms --> FixPerms[Fix Dockerfile]
    
    Push --> Restart[Restart App]
    SetPort --> Restart
    FixDB --> Restart
    FixPerms --> Rebuild[Rebuild Image]
    
    Rebuild --> Push
    Restart --> Verify{Working?}
    Verify -->|Yes| Success[✓ Resolved]
    Verify -->|No| Logs
    
    style Success fill:#00aa00,color:#fff
```

**Solutions:**

1. **Check Application Logs**
   ```bash
   # Stream logs
   az webapp log tail \
     --resource-group notesapp-dev-rg \
     --name notesapp-dev-app
   
   # Download logs
   az webapp log download \
     --resource-group notesapp-dev-rg \
     --name notesapp-dev-app \
     --log-file app-logs.zip
   ```

2. **Verify Environment Variables**
   ```bash
   # List all app settings
   az webapp config appsettings list \
     --resource-group notesapp-dev-rg \
     --name notesapp-dev-app
   
   # Set missing variables
   az webapp config appsettings set \
     --resource-group notesapp-dev-rg \
     --name notesapp-dev-app \
     --settings PORT=8080
   ```

3. **Rebuild and Redeploy**
   ```bash
   # Rebuild image
   docker build -t notesappdevacr.azurecr.io/notesapp:latest .
   
   # Push to ACR
   docker push notesappdevacr.azurecr.io/notesapp:latest
   
   # Restart app service
   az webapp restart \
     --resource-group notesapp-dev-rg \
     --name notesapp-dev-app
   ```

---

## Network and VNet Issues

### Issue: Subnet Delegation Conflicts

**Error Message:**
```
Error: creating Subnet: subnets.SubnetsClient#CreateOrUpdate: 
Failure sending request: StatusCode=400 -- Original Error: 
Code="InUseSubnetCannotBeUpdated"
```

**Solution:**
```bash
# Delete and recreate subnet
az network vnet subnet delete \
  --resource-group notesapp-dev-rg \
  --vnet-name notesapp-dev-vnet \
  --name notesapp-dev-db-subnet

# Recreate with proper delegation
terraform apply -auto-approve
```

### Issue: VNet Integration Fails

**Solution:**
```bash
# Remove existing integration
az webapp vnet-integration remove \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app

# Re-add integration
terraform apply -target=azurerm_linux_web_app.app -auto-approve
```

---

## CI/CD Pipeline Failures

### Issue: GitHub Actions Workflow Fails

#### Pipeline Failure Decision Tree

```mermaid
graph TD
    Fail[Pipeline Failed] --> Stage{Which<br/>Stage?}
    
    Stage -->|Checkout| CheckoutFix[Check Repository Access]
    Stage -->|Build| BuildFix[Check Dockerfile]
    Stage -->|Push| PushFix[Check ACR Credentials]
    Stage -->|Terraform| TFFix[Check Terraform Config]
    Stage -->|Deploy| DeployFix[Check App Service]
    
    CheckoutFix --> Retry[Retry Pipeline]
    BuildFix --> FixCode[Fix Build Errors]
    PushFix --> UpdateSecrets[Update GitHub Secrets]
    TFFix --> FixTF[Fix Terraform Issues]
    DeployFix --> CheckLogs[Check Deployment Logs]
    
    FixCode --> Retry
    UpdateSecrets --> Retry
    FixTF --> Retry
    CheckLogs --> Retry
    
    Retry --> Success{Success?}
    Success -->|Yes| Done[✓ Resolved]
    Success -->|No| Debug[Deep Dive Debug]
    
    style Done fill:#00aa00,color:#fff
```

**Common Solutions:**

1. **Update GitHub Secrets**
   ```bash
   # Get current values
   terraform output
   az acr credential show --name notesappdevacr
   
   # Update in GitHub:
   # Settings → Secrets and variables → Actions
   ```

2. **Fix Terraform Formatting**
   ```bash
   cd infra
   terraform fmt -recursive
   terraform validate
   ```

3. **Test Locally First**
   ```bash
   # Test Docker build
   docker build -t test .
   
   # Test Terraform
   cd infra
   terraform plan
   ```

---

## Quick Reference Commands

### Emergency Rollback
```bash
# Rollback to previous image
az webapp config container set \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-app \
  --docker-custom-image-name notesappdevacr.azurecr.io/notesapp:<previous-tag>
```

### Complete Infrastructure Reset
```bash
cd infra
terraform destroy -auto-approve
terraform apply -auto-approve
```

### Get All Resource Status
```bash
az resource list \
  --resource-group notesapp-dev-rg \
  --output table
```

### Database Backup
```bash
# Create backup
az postgres flexible-server backup create \
  --resource-group notesapp-dev-rg \
  --name notesapp-dev-pg \
  --backup-name manual-backup-$(date +%Y%m%d)
```

---

**Document Version**: 1.0  
**Last Updated**: November 8, 2025  
**Covers Issues From**: Initial deployment through region migration
