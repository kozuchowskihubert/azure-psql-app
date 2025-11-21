# =============================================================================
# Music Production App Infrastructure (Isolated State)
# =============================================================================
# This file contains ONLY the music-specific resources to be managed
# separately from the main application infrastructure.
#
# State File: tfstate-music/terraform-music.tfstate
# Resources:
#   - Music App Service Plan (B1)
#   - Music Web App
#   - Virtual Machine for audio processing
#   - VM networking components
# =============================================================================

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.3.0"

  backend "azurerm" {
    resource_group_name  = "notesapp-dev-rg"
    storage_account_name = "tfstatenotesapp"
    container_name       = "tfstate-music"
    key                  = "terraform-music.tfstate"
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# =============================================================================
# Data Sources - Import existing shared resources
# =============================================================================

data "azurerm_resource_group" "rg" {
  name = "notesapp-dev-rg"
}

data "azurerm_virtual_network" "vnet" {
  name                = "notesapp-dev-vnet"
  resource_group_name = data.azurerm_resource_group.rg.name
}

data "azurerm_container_registry" "acr" {
  name                = "notesappdevacr14363"
  resource_group_name = data.azurerm_resource_group.rg.name
}

# =============================================================================
# VM Subnet (Music App Only)
# =============================================================================

resource "azurerm_subnet" "vm_subnet" {
  name                 = "notesapp-dev-vm-subnet"
  resource_group_name  = data.azurerm_resource_group.rg.name
  virtual_network_name = data.azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.3.0/24"]
}

# =============================================================================
# Music App Service Plan (B1 Basic)
# =============================================================================

resource "azurerm_service_plan" "music_plan" {
  name                = "notesapp-dev-music-plan"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "B1"

  tags = {
    environment = "dev"
    app         = "music-production"
    managed_by  = "terraform"
  }
}

# =============================================================================
# Music Web App (Linux Container)
# =============================================================================

resource "azurerm_linux_web_app" "music_app" {
  name                = "notesapp-dev-music-app"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.music_plan.id

  site_config {
    always_on = false

    application_stack {
      docker_image_name   = "notesapp-music:latest"
      docker_registry_url = "https://${data.azurerm_container_registry.acr.login_server}"
    }

    container_registry_use_managed_identity = false
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "DOCKER_REGISTRY_SERVER_URL"          = "https://${data.azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME"     = data.azurerm_container_registry.acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD"     = data.azurerm_container_registry.acr.admin_password
    "DOCKER_ENABLE_CI"                    = "true"
    "NODE_ENV"                            = "production"
    "PORT"                                = "3000"
    "WEBSITES_PORT"                       = "3000"
    "DATABASE_URL"                        = "postgresql://notesappuser:${var.db_password}@notesapp-dev-pg.postgres.database.azure.com:5432/notesdb?sslmode=require"
  }

  https_only = true

  tags = {
    environment = "dev"
    app         = "music-production"
    managed_by  = "terraform"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# =============================================================================
# Virtual Machine for Audio Processing
# =============================================================================

# Network Security Group for VM
resource "azurerm_network_security_group" "vm_nsg" {
  name                = "notesapp-dev-vm-nsg"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name

  security_rule {
    name                       = "SSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = {
    environment = "dev"
    app         = "music-production"
    managed_by  = "terraform"
  }
}

# Public IP for VM
resource "azurerm_public_ip" "vm_pip" {
  name                = "notesapp-dev-vm-pip"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = {
    environment = "dev"
    app         = "music-production"
    managed_by  = "terraform"
  }
}

# Network Interface for VM
resource "azurerm_network_interface" "vm_nic" {
  name                = "notesapp-dev-vm-nic"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.vm_subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.vm_pip.id
  }

  tags = {
    environment = "dev"
    app         = "music-production"
    managed_by  = "terraform"
  }
}

# Associate NSG with Network Interface
resource "azurerm_network_interface_security_group_association" "vm_nsg_assoc" {
  network_interface_id      = azurerm_network_interface.vm_nic.id
  network_security_group_id = azurerm_network_security_group.vm_nsg.id
}

# Linux Virtual Machine
resource "azurerm_linux_virtual_machine" "tracks_vm" {
  name                = "notesapp-dev-vm"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  size                = "Standard_B1s"
  admin_username      = "azureuser"

  # Conditional SSH key or password authentication
  dynamic "admin_ssh_key" {
    for_each = var.vm_ssh_public_key != "" ? [1] : []
    content {
      username   = "azureuser"
      public_key = var.vm_ssh_public_key
    }
  }

  admin_password                  = var.vm_ssh_public_key == "" ? var.db_password : null
  disable_password_authentication = var.vm_ssh_public_key != ""

  network_interface_ids = [
    azurerm_network_interface.vm_nic.id,
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
    disk_size_gb         = 30
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  tags = {
    environment = "dev"
    app         = "music-production"
    managed_by  = "terraform"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# =============================================================================
# Outputs
# =============================================================================

output "music_app_url" {
  description = "Music Production App URL"
  value       = "https://${azurerm_linux_web_app.music_app.default_hostname}"
}

output "vm_public_ip" {
  description = "VM Public IP Address"
  value       = azurerm_public_ip.vm_pip.ip_address
}

output "vm_ssh_command" {
  description = "SSH command to connect to VM"
  value       = "ssh azureuser@${azurerm_public_ip.vm_pip.ip_address}"
}

output "resource_group_name" {
  description = "Resource Group Name"
  value       = data.azurerm_resource_group.rg.name
}
