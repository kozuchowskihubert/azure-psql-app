terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

data "azurerm_client_config" "current" {}

# Service Principal for CI/CD - Managed manually due to permission constraints
# resource "azuread_application" "sp_app" {
#   display_name = "${var.prefix}-sp-app"
# }

# resource "azuread_service_principal" "sp" {
#   client_id = azuread_application.sp_app.client_id
# }

# resource "random_password" "sp_pwd" {
#   length  = 32
#   special = true
# }

# resource "azuread_service_principal_password" "sp_pwd" {
#   service_principal_id = azuread_service_principal.sp.id
#   end_date             = "2099-01-01T00:00:00Z"
# }

# resource "azurerm_role_assignment" "sp_contrib" {
#   scope                = azurerm_resource_group.rg.id
#   role_definition_name = "Contributor"
#   principal_id         = azuread_service_principal.sp.id
# }

# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "${var.prefix}-${var.env}-rg"
  location = var.location
}

# Virtual Network
resource "azurerm_virtual_network" "vnet" {
  name                = "${var.prefix}-${var.env}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

# Database Subnet
resource "azurerm_subnet" "db_subnet" {
  name                 = "${var.prefix}-${var.env}-db-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]

  delegation {
    name = "postgresql-delegation"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

# App Service Subnet - removed delegation to avoid quota issues
resource "azurerm_subnet" "app_subnet" {
  name                 = "${var.prefix}-${var.env}-app-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
}

# Private DNS Zone for PostgreSQL
resource "azurerm_private_dns_zone" "pg_dns" {
  name                = "${var.prefix}-${var.env}.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "pg_dns_link" {
  name                  = "${var.prefix}-${var.env}-pg-dns-link"
  resource_group_name   = azurerm_resource_group.rg.name
  private_dns_zone_name = azurerm_private_dns_zone.pg_dns.name
  virtual_network_id    = azurerm_virtual_network.vnet.id
}

# PostgreSQL Flexible Server - Using smallest burstable tier (lowest cost, not free)
# Note: Azure doesn't offer free PostgreSQL tier, B_Standard_B1ms is the cheapest option (~$12/month)
resource "azurerm_postgresql_flexible_server" "pg" {
  name                          = "${var.prefix}-${var.env}-pg"
  resource_group_name           = azurerm_resource_group.rg.name
  location                      = azurerm_resource_group.rg.location
  version                       = "14"
  administrator_login           = var.db_admin
  administrator_password        = var.db_password
  storage_mb                    = 32768             # Minimum 32GB
  backup_retention_days         = 7                 # Minimum to avoid geo-redundancy costs
  geo_redundant_backup_enabled  = false             # Disable for cost savings
  auto_grow_enabled             = false             # Prevent automatic storage increase
  sku_name                      = "B_Standard_B1ms" # Smallest burstable tier
  public_network_access_enabled = true
  zone                          = "1" # Explicitly set zone to match existing server

  lifecycle {
    ignore_changes = [
      zone, # Ignore zone changes to prevent replacement
    ]
  }
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = var.db_name
  server_id = azurerm_postgresql_flexible_server.pg.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Allow Azure services to access PostgreSQL
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAllAzureServices"
  server_id        = azurerm_postgresql_flexible_server.pg.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Container Registry - Basic tier is the cheapest (~$5/month)
# Note: No free tier for ACR, but Basic includes 10GB storage
resource "azurerm_container_registry" "acr" {
  name                = "${var.prefix}${var.env}acr14363" # Must be globally unique
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic" # Cheapest tier: $5/month
  admin_enabled       = true
}

# App Service Plan - F1 Free tier (10 free apps, 1GB RAM, 60 min/day CPU)
resource "azurerm_service_plan" "plan" {
  name                = "${var.prefix}-${var.env}-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "F1" # FREE tier: 1 GB RAM, 60 min/day compute
}

# App Service - Using F1 Free tier
resource "azurerm_linux_web_app" "app" {
  name                = "${var.prefix}-${var.env}-app"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    always_on = false # Required for F1 tier (cannot be true on free tier)

    application_stack {
      docker_image     = "${azurerm_container_registry.acr.login_server}/${var.prefix}"
      docker_image_tag = "latest"
    }
  }

  app_settings = {
    "DATABASE_URL"                    = "postgresql://${var.db_admin}:${var.db_password}@${azurerm_postgresql_flexible_server.pg.fqdn}:5432/${var.db_name}?sslmode=require"
    "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.acr.admin_password
    "WEBSITES_PORT"                   = "3000"
  }
}
