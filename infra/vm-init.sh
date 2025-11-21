#!/bin/bash
set -e

# VM Initialization Script for Tracks Processing
# This script runs on first boot to set up the environment

echo "===================================================================="
echo "Starting VM initialization for tracks processing..."
echo "===================================================================="

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install essential packages
echo "Installing essential packages..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    build-essential \
    software-properties-common

# Install Docker
echo "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add azureuser to docker group
sudo usermod -aG docker azureuser

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Node.js (LTS version)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python and pip
echo "Installing Python..."
sudo apt-get install -y python3 python3-pip python3-venv

# Install useful tools
echo "Installing useful tools..."
sudo apt-get install -y \
    htop \
    tmux \
    vim \
    wget \
    unzip \
    jq

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /opt/tracks-app
sudo chown azureuser:azureuser /opt/tracks-app

# Install PM2 for process management
echo "Installing PM2..."
sudo npm install -g pm2

# Setup firewall
echo "Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Node.js app
sudo ufw --force enable

# Create systemd service for the application (placeholder)
echo "Creating systemd service template..."
cat <<EOF | sudo tee /etc/systemd/system/tracks-app.service
[Unit]
Description=Tracks Processing Application
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=azureuser
WorkingDirectory=/opt/tracks-app
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=tracks-app

Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Create log directory
sudo mkdir -p /var/log/tracks-app
sudo chown azureuser:azureuser /var/log/tracks-app

# Install monitoring tools
echo "Installing monitoring tools..."
sudo apt-get install -y \
    netdata \
    prometheus-node-exporter

# Enable monitoring services
sudo systemctl enable netdata
sudo systemctl start netdata

# Create a welcome message
cat <<'EOF' | sudo tee /etc/motd
==================================================================
   Azure Tracks Processing VM - feat/tracks branch
==================================================================

   Application Directory: /opt/tracks-app
   Logs Directory: /var/log/tracks-app
   
   Services:
   - Docker: sudo systemctl status docker
   - Tracks App: sudo systemctl status tracks-app
   - Netdata Monitoring: http://localhost:19999
   
   Quick Commands:
   - View logs: journalctl -u tracks-app -f
   - Restart app: sudo systemctl restart tracks-app
   - Deploy new version: cd /opt/tracks-app && git pull && npm install && sudo systemctl restart tracks-app
   
==================================================================
EOF

# Clean up
echo "Cleaning up..."
sudo apt-get autoremove -y
sudo apt-get clean

# Display versions
echo "===================================================================="
echo "Installation complete! Installed versions:"
echo "===================================================================="
docker --version
node --version
npm --version
python3 --version
echo "===================================================================="
echo "VM initialization completed successfully!"
echo "===================================================================="

# Reboot to ensure all changes take effect
echo "Rebooting in 10 seconds..."
sleep 10
sudo reboot
