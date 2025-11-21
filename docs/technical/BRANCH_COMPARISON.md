# Branch Comparison: main vs feat/tracks

## Overview

The `feat/tracks` branch includes dedicated Azure Virtual Machine infrastructure for music tracks processing, while the `main` branch uses only Azure App Service.

## Infrastructure Differences

### Main Branch Infrastructure
- **App Service Plan**: F1 Free tier (Azure App Service)
- **Container Registry**: Basic tier
- **PostgreSQL**: B_Standard_B1ms (smallest tier)
- **Networking**: VNet with App + DB subnets

### feat/tracks Branch Infrastructure
**All of the above PLUS:**
- **Virtual Machine**: Standard_B1s (1 vCPU, 1GB RAM)
- **VM Subnet**: 10.0.3.0/24 dedicated subnet
- **Network Security Group**: SSH, HTTP, HTTPS, App port
- **Public IP**: Dynamic allocation
- **VM Extensions**: Automated initialization script

## Terraform Resources Unique to feat/tracks

### Network Resources
```hcl
azurerm_subnet.vm_subnet
azurerm_network_security_group.vm_nsg
azurerm_subnet_network_security_group_association.vm_nsg_assoc
azurerm_public_ip.vm_pip
azurerm_network_interface.vm_nic
```

### Compute Resources
```hcl
azurerm_linux_virtual_machine.tracks_vm
azurerm_virtual_machine_extension.vm_init
```

### New Variables
```hcl
variable "vm_size"
variable "vm_admin_username"
variable "vm_ssh_public_key"
```

### New Outputs
```hcl
output "vm_public_ip"
output "vm_name"
output "vm_admin_username"
output "vm_ssh_command"
```

## VM Pre-installed Software

The VM comes pre-configured with:
- **Docker** & Docker Compose
- **Node.js** 20.x LTS
- **Python 3** with pip and venv
- **PM2** for Node.js process management
- **Netdata** monitoring dashboard
- **Essential tools**: git, vim, htop, tmux, build-essential

## Use Cases

### Main Branch
Best for:
- Standard web application hosting
- Development and testing
- Minimal infrastructure

### feat/tracks Branch
Best for:
- Music track generation/processing
- Long-running background jobs
- Custom software installations
- Direct system access needed
- Development requiring root access

## Deployment Commands

### Deploy Main Branch Infrastructure
```bash
git checkout main
cd infra
terraform init
terraform apply
```

### Deploy feat/tracks Infrastructure
```bash
git checkout feat/tracks
cd infra

# Generate SSH key for VM
ssh-keygen -t rsa -b 4096 -C "azure-vm@tracks" -f ~/.ssh/azure-tracks-vm

# Add public key to terraform.tfvars
cat ~/.ssh/azure-tracks-vm.pub
# Copy the output and add to terraform.tfvars:
# vm_ssh_public_key = "ssh-rsa AAAAB3Nza... your-key"

# Deploy
terraform init
terraform apply

# Connect to VM
terraform output vm_ssh_command
```

## Switching Between Branches

### Important Notes
⚠️ **Warning**: When switching branches, Terraform state will differ!

### From main to feat/tracks
```bash
git checkout feat/tracks
cd infra
terraform plan  # Will show VM resources to be created
terraform apply # Creates the VM
```

### From feat/tracks to main
```bash
# Option 1: Destroy VM first (recommended)
cd infra
terraform destroy -target=azurerm_linux_virtual_machine.tracks_vm
git checkout main

# Option 2: Keep VM but switch branches
git checkout main
# Note: Terraform in main won't manage the VM
```

## Cost Breakdown

### Main Branch Monthly Costs
| Resource | SKU | Cost |
|----------|-----|------|
| App Service Plan | F1 (Free) | $0 |
| PostgreSQL | B_Standard_B1ms | ~$12 |
| Container Registry | Basic | ~$5 |
| **Total** | | **~$17/month** |

### feat/tracks Branch Monthly Costs
| Resource | SKU | Cost |
|----------|-----|------|
| App Service Plan | F1 (Free) | $0 |
| PostgreSQL | B_Standard_B1ms | ~$12 |
| Container Registry | Basic | ~$5 |
| **Virtual Machine** | **Standard_B1s** | **~$7.50** |
| **Public IP** | **Dynamic** | **~$3.60** |
| **OS Disk (30GB)** | **Standard LRS** | **~$2.30** |
| **Total** | | **~$30.40/month** |

## Monitoring & Management

### Main Branch
- Azure App Service metrics
- Application Insights (optional)
- Azure Portal monitoring

### feat/tracks Branch
**All of the above PLUS:**
- SSH access to VM
- Netdata dashboard (http://VM_IP:19999)
- Direct system metrics (htop, docker stats)
- Custom monitoring solutions

## Security Considerations

### Main Branch
- Managed by Azure App Service
- Automatic security updates
- Limited attack surface

### feat/tracks Branch
**Additional responsibilities:**
- SSH key management
- System updates (`apt-get update`)
- Firewall configuration (UFW)
- Docker security
- Application-level security

## Documentation Files

### Main Branch
- Standard Terraform documentation
- App Service deployment guides

### feat/tracks Branch
**Additional documentation:**
- `infra/VM_SETUP.md` - Complete VM setup guide
- `infra/vm-init.sh` - Initialization script
- VM-specific troubleshooting

## Git Workflow

### Feature Development
```bash
# Work on tracks features
git checkout feat/tracks
# Make changes
git add .
git commit -m "feat: add track processing feature"
git push origin feat/tracks
```

### Merging to Main
```bash
# When ready to merge (without VM infrastructure)
git checkout main
git merge feat/tracks --no-commit

# Remove VM-specific Terraform resources
git reset HEAD infra/main.tf  # Review and remove VM sections
git reset HEAD infra/variables.tf
git reset HEAD infra/outputs.tf
git checkout -- infra/vm-init.sh  # Exclude VM script
git checkout -- infra/VM_SETUP.md  # Exclude VM docs

git commit -m "feat: merge tracks features (without VM infrastructure)"
```

## When to Use Each Branch

### Use Main Branch When:
- Deploying to production
- Cost optimization is critical
- Standard web app functionality is sufficient
- Managed services are preferred

### Use feat/tracks Branch When:
- Developing music processing features
- Need direct system access
- Running long-duration processes
- Installing custom system packages
- Performance testing with dedicated resources
- Development/testing environment

## Cleanup

### Clean Up Main Branch Resources
```bash
git checkout main
cd infra
terraform destroy
```

### Clean Up feat/tracks Resources
```bash
git checkout feat/tracks
cd infra
terraform destroy
```

## Related Documentation

- [VM_SETUP.md](./VM_SETUP.md) - Detailed VM setup and management
- [DEPLOYMENT.md](../docs/technical/DEPLOYMENT.md) - General deployment guide
- [ARCHITECTURE.md](../docs/technical/ARCHITECTURE.md) - System architecture
