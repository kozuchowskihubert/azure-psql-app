# Virtual Machine Configuration - feat/tracks Branch

## Overview

This branch includes a dedicated Azure Virtual Machine for tracks processing functionality. The VM is configured with Docker, Node.js, and Python to support music track generation and processing workloads.

## Infrastructure Components

### Virtual Machine Specifications
- **Size**: Standard_B1s (1 vCPU, 1GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **Cost**: ~$7.50/month
- **Disk**: 30GB Standard LRS
- **Network**: Public IP with NSG

### Network Configuration
- **Subnet**: 10.0.3.0/24 (dedicated VM subnet)
- **NSG Rules**:
  - SSH (22) - Inbound
  - HTTP (80) - Inbound
  - HTTPS (443) - Inbound
  - App Port (3000) - Inbound

### Pre-installed Software
The VM is automatically configured with:
- Docker & Docker Compose
- Node.js 20.x LTS
- Python 3 with pip
- PM2 process manager
- Netdata monitoring (port 19999)
- Essential build tools

## Deployment

### Prerequisites
1. Generate SSH key pair:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "azure-vm@tracks" -f ~/.ssh/azure-tracks-vm
   ```

2. Update `terraform.tfvars` with your SSH public key:
   ```hcl
   vm_ssh_public_key = "ssh-rsa AAAAB3Nza... your-public-key"
   ```

### Deploy Infrastructure
```bash
cd infra
terraform init
terraform plan
terraform apply
```

### Get VM Connection Details
```bash
terraform output vm_public_ip
terraform output vm_ssh_command
```

## Connecting to the VM

### SSH Access
```bash
# Get the SSH command from Terraform output
terraform output vm_ssh_command

# Or manually connect
ssh azureuser@<VM_PUBLIC_IP> -i ~/.ssh/azure-tracks-vm
```

### First Login
After connecting, you'll see a welcome message with:
- Application directory location
- Service status commands
- Monitoring dashboard URL
- Quick reference commands

## Application Deployment

### Manual Deployment
```bash
# SSH into the VM
ssh azureuser@<VM_PUBLIC_IP>

# Navigate to app directory
cd /opt/tracks-app

# Clone your repository
git clone https://github.com/kozuchowskihubert/azure-psql-app.git .
git checkout feat/tracks

# Install dependencies
cd app
npm install

# Set up environment variables
cat > .env << EOF
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
EOF

# Start with PM2
pm2 start server.js --name tracks-app
pm2 save
pm2 startup
```

### Using Systemd Service
```bash
# After deploying the application
sudo systemctl enable tracks-app
sudo systemctl start tracks-app

# Check status
sudo systemctl status tracks-app

# View logs
journalctl -u tracks-app -f
```

## Monitoring

### Netdata Dashboard
Access real-time monitoring at: `http://<VM_PUBLIC_IP>:19999`

### System Metrics
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Docker containers
docker ps
docker stats

# PM2 processes
pm2 status
pm2 logs
```

## Maintenance

### Update Application
```bash
cd /opt/tracks-app
git pull origin feat/tracks
npm install
sudo systemctl restart tracks-app
```

### Update System Packages
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### View Logs
```bash
# Application logs
journalctl -u tracks-app -f

# System logs
tail -f /var/log/syslog

# Docker logs
docker logs <container_id> -f
```

## Security Considerations

### Network Security
- NSG rules limit inbound traffic to specific ports
- UFW firewall is enabled by default
- Consider restricting SSH access to specific IP ranges

### SSH Security
- Password authentication is disabled
- Only SSH key authentication is allowed
- Regularly rotate SSH keys

### Application Security
- Store secrets in Azure Key Vault
- Use environment variables for configuration
- Enable HTTPS with Let's Encrypt
- Regularly update packages and dependencies

## Troubleshooting

### VM Not Accessible
1. Check NSG rules: `az network nsg show -n <nsg_name> -g <resource_group>`
2. Verify public IP: `terraform output vm_public_ip`
3. Check VM status: `az vm show -n <vm_name> -g <resource_group> -d`

### Application Not Starting
1. Check service status: `sudo systemctl status tracks-app`
2. View logs: `journalctl -u tracks-app -n 100`
3. Verify ports: `sudo netstat -tulpn | grep :3000`

### Docker Issues
1. Check Docker service: `sudo systemctl status docker`
2. View Docker logs: `sudo journalctl -u docker -n 50`
3. Restart Docker: `sudo systemctl restart docker`

## Cost Optimization

### Current Monthly Costs
- VM (B1s): ~$7.50
- Public IP: ~$3.60
- Disk (30GB): ~$2.30
- **Total**: ~$13.40/month

### Optimization Tips
- Use auto-shutdown schedule for dev/test environments
- Resize to B1ls if 1GB RAM is sufficient (~$3.80/month)
- Use Azure Hybrid Benefit if you have Windows Server licenses
- Consider Reserved Instances for 1-3 year commitments (40-60% savings)

## Terraform State

The VM configuration is part of the main Terraform state. Be careful when:
- Switching branches (VM resources only exist in feat/tracks)
- Running `terraform destroy` (will delete the VM)
- Modifying VM size (may require recreation)

## Branch-Specific Resources

Resources only in `feat/tracks`:
- `azurerm_subnet.vm_subnet`
- `azurerm_network_security_group.vm_nsg`
- `azurerm_public_ip.vm_pip`
- `azurerm_network_interface.vm_nic`
- `azurerm_linux_virtual_machine.tracks_vm`
- `azurerm_virtual_machine_extension.vm_init`

These resources will NOT exist when you switch to `main` branch.

## Clean Up

### Destroy VM Only
```bash
# Target specific resources
terraform destroy -target=azurerm_linux_virtual_machine.tracks_vm
terraform destroy -target=azurerm_network_interface.vm_nic
terraform destroy -target=azurerm_public_ip.vm_pip
```

### Destroy All Infrastructure
```bash
terraform destroy
```

## Additional Resources

- [Azure VM Pricing](https://azure.microsoft.com/pricing/details/virtual-machines/linux/)
- [Azure VM Sizes](https://docs.microsoft.com/azure/virtual-machines/sizes)
- [Ubuntu Cloud Images](https://cloud-images.ubuntu.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Netdata Documentation](https://learn.netdata.cloud/)
