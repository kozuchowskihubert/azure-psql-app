# Music App Infrastructure Isolation

## Overview

The music production application now has **completely isolated infrastructure** to prevent any conflicts with the main application deployment.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Azure Subscription                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Resource Group: notesapp-dev-rg                            │
│  ├─────────────────────────────────────────────────────┐   │
│  │  SHARED INFRASTRUCTURE (referenced by both)         │   │
│  │  ├── Virtual Network (vnet)                         │   │
│  │  ├── Subnets (db, app, vm)                          │   │
│  │  ├── PostgreSQL Flexible Server                     │   │
│  │  ├── Container Registry (ACR)                       │   │
│  │  └── Private DNS Zone                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌───────────────────────────────────────┐                 │
│  │  MAIN APP INFRASTRUCTURE              │                 │
│  │  Terraform State: terraform.tfstate   │                 │
│  │  Managed by: main branch              │                 │
│  ├───────────────────────────────────────┤                 │
│  │  ├── App Service Plan (F1 Free)      │                 │
│  │  └── Web App (notesapp-dev-app)      │                 │
│  └───────────────────────────────────────┘                 │
│                                                             │
│  ┌───────────────────────────────────────────┐             │
│  │  MUSIC APP INFRASTRUCTURE                 │             │
│  │  Terraform State: terraform-music.tfstate │             │
│  │  Managed by: feat/tracks branch           │             │
│  ├───────────────────────────────────────────┤             │
│  │  ├── Music App Service Plan (B1)         │             │
│  │  ├── Music Web App                        │             │
│  │  ├── Virtual Machine (Standard_B1s)       │             │
│  │  ├── VM Public IP                         │             │
│  │  ├── VM Network Interface                 │             │
│  │  └── VM Network Security Group            │             │
│  └───────────────────────────────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Terraform State Files

### Main App State
- **Location**: `tfstatenotesapp/tfstate/terraform.tfstate`
- **Managed by**: `.github/workflows/deploy-azure-infrastructure.yml`
- **Branch**: `main`
- **Resources**: VNet, PostgreSQL, ACR, Main App Service Plan, Main Web App

### Music App State (NEW)
- **Location**: `tfstatenotesapp/tfstate-music/terraform-music.tfstate`
- **Managed by**: `.github/workflows/deploy-music-app.yml`
- **Branch**: `feat/tracks`
- **Resources**: Music App Service Plan, Music Web App, VM, VM networking

## Directory Structure

```
azure-psql-app/
├── infra/                      # Main app infrastructure
│   ├── main.tf                 # Full infrastructure (main branch)
│   ├── backend.tf              # State: terraform.tfstate
│   ├── variables.tf
│   └── outputs.tf
│
├── music-tf/                # Music app infrastructure (NEW)
│   └── main.tf                 # Music-only resources
│       ├── backend (embedded)  # State: terraform-music.tfstate
│       ├── data sources        # References shared resources
│       ├── music app plan
│       ├── music web app
│       └── VM resources
│
└── .github/workflows/
    ├── deploy-azure-infrastructure.yml  # Main app deployment
    └── deploy-music-app.yml            # Music app deployment
```

## Benefits

### 1. **Complete Isolation**
- Main branch deployments cannot affect music resources
- Music branch deployments cannot affect main resources
- Independent state files prevent conflicts

### 2. **Safe Independent Development**
- Test music features without risk to production
- Destroy/recreate music infrastructure freely
- No need to merge to main immediately

### 3. **Resource Protection**
```hcl
lifecycle {
  prevent_destroy = true
}
```
- Applied to Music Web App and VM
- Prevents accidental deletion via Terraform

### 4. **Efficient Resource Sharing**
```hcl
data "azurerm_virtual_network" "vnet" {
  name                = "notesapp-dev-vnet"
  resource_group_name = data.azurerm_resource_group.rg.name
}
```
- Uses data sources to reference existing resources
- No duplication of shared infrastructure
- Single source of truth for networking, database, ACR

## Deployment Workflows

### Main App Deployment
```bash
# Triggered on: push to main
# Working directory: ./infra
# State file: terraform.tfstate
# Deploys: VNet, PostgreSQL, ACR, Main App
```

### Music App Deployment
```bash
# Triggered on: push to feat/tracks
# Working directory: ./music-tf
# State file: terraform-music.tfstate
# Deploys: Music App, VM (references shared resources)
```

## Migration Path

### Current State
- Both infrastructures deployed independently
- No conflicts or overlap
- Both apps running in same resource group

### Future Options

#### Option 1: Keep Separate (Recommended for now)
- Continue development on feat/tracks
- Test music features independently
- Merge to main when stable

#### Option 2: Merge to Main
```bash
# When music app is production-ready:
git checkout main
git merge feat/tracks

# Update main workflow to include music resources
# Or keep separate workflows with different state files
```

#### Option 3: Separate Resource Groups
```bash
# Create dedicated music resource group
# Move music resources to separate subscription if needed
# Further isolation for production environments
```

## Troubleshooting

### Issue: Music app deployment fails
**Solution**: Check that shared resources exist:
```bash
# Verify VNet exists
az network vnet show --name notesapp-dev-vnet --resource-group notesapp-dev-rg

# Verify ACR exists
az acr show --name notesappdevacr14363 --resource-group notesapp-dev-rg
```

### Issue: State lock errors
**Solution**: Locks are now isolated per state file:
```bash
# Unlock music state only
cd music-tf
terraform force-unlock <LOCK_ID>

# Does not affect main state
```

### Issue: Want to destroy music resources
**Solution**: 
1. Remove `prevent_destroy` lifecycle blocks
2. Run: `cd music-tf && terraform destroy`
3. Main app continues running unaffected

## Security Considerations

1. **Separate States** = Separate permissions possible
2. **Resource Group ACLs** = Can restrict music resource access
3. **Prevent Destroy** = Protection against accidental deletion
4. **Data Sources** = Read-only references to shared resources

## Cost Impact

### Shared Resources (No Change)
- Virtual Network: Free
- PostgreSQL: ~$25/month
- Container Registry: ~$5/month

### Main App (No Change)
- App Service Plan F1: Free

### Music App (NEW)
- App Service Plan B1: **~$13/month**
- Virtual Machine Standard_B1s: **~$10/month**
- Public IP: **~$3/month**
- **Total New Cost: ~$26/month**

## Summary

✅ **Isolated infrastructure** prevents deployment conflicts  
✅ **Shared resources** referenced via data sources  
✅ **Protected resources** with prevent_destroy lifecycle  
✅ **Independent development** on feat/tracks branch  
✅ **Safe testing** without affecting main app  
✅ **Clear migration path** to production when ready  

The music production application now has its own isolated infrastructure while efficiently sharing networking, database, and registry resources with the main application.
