#################################################
# Azure SSL Certificate Configuration
# Terraform module for HAOS Platform SSL/TLS setup
#################################################

#################################################
# SSL Certificate Resources
# Note: Variables defined in variables.tf
# Note: Data sources defined in main.tf
#################################################

#################################################
# Custom Domain Configuration
#################################################

resource "azurerm_app_service_custom_hostname_binding" "main" {
  hostname            = var.custom_domain
  app_service_name    = data.azurerm_app_service.main.name
  resource_group_name = data.azurerm_resource_group.main.name

  lifecycle {
    ignore_changes = [ssl_state, thumbprint]
  }
}

resource "azurerm_app_service_custom_hostname_binding" "www" {
  hostname            = "www.${var.custom_domain}"
  app_service_name    = data.azurerm_app_service.main.name
  resource_group_name = data.azurerm_resource_group.main.name

  lifecycle {
    ignore_changes = [ssl_state, thumbprint]
  }
}

#################################################
# Managed SSL Certificate (FREE)
#################################################

resource "azurerm_app_service_managed_certificate" "main" {
  custom_hostname_binding_id = azurerm_app_service_custom_hostname_binding.main.id

  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
    AutoRenew   = "true"
  }
}

resource "azurerm_app_service_managed_certificate" "www" {
  custom_hostname_binding_id = azurerm_app_service_custom_hostname_binding.www.id

  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
    AutoRenew   = "true"
  }
}

#################################################
# Certificate Binding
#################################################

resource "azurerm_app_service_certificate_binding" "main" {
  hostname_binding_id = azurerm_app_service_custom_hostname_binding.main.id
  certificate_id      = azurerm_app_service_managed_certificate.main.id
  ssl_state           = "SniEnabled"
}

resource "azurerm_app_service_certificate_binding" "www" {
  hostname_binding_id = azurerm_app_service_custom_hostname_binding.www.id
  certificate_id      = azurerm_app_service_managed_certificate.www.id
  ssl_state           = "SniEnabled"
}

#################################################
# Azure Front Door (Optional CDN + SSL)
#################################################

resource "azurerm_cdn_frontdoor_profile" "main" {
  count               = var.enable_frontdoor ? 1 : 0
  name                = "haos-frontdoor"
  resource_group_name = data.azurerm_resource_group.main.name
  sku_name            = "Premium_AzureFrontDoor"

  tags = {
    Environment = "Production"
    Purpose     = "CDN + SSL"
  }
}

resource "azurerm_cdn_frontdoor_endpoint" "main" {
  count                    = var.enable_frontdoor ? 1 : 0
  name                     = "haos-endpoint"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.main[0].id
  enabled                  = true

  tags = {
    Environment = "Production"
  }
}

resource "azurerm_cdn_frontdoor_custom_domain" "main" {
  count                    = var.enable_frontdoor ? 1 : 0
  name                     = replace(var.custom_domain, ".", "-")
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.main[0].id
  host_name                = var.custom_domain

  tls {
    certificate_type    = "ManagedCertificate"
    minimum_tls_version = "TLS12"
  }
}

#################################################
# Key Vault for Certificate Storage (Optional)
#################################################

resource "azurerm_key_vault" "main" {
  name                       = "haos-keyvault-${random_string.suffix.result}"
  location                   = data.azurerm_resource_group.main.location
  resource_group_name        = data.azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = false

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    certificate_permissions = [
      "Get", "List", "Create", "Import", "Update", "Delete"
    ]

    secret_permissions = [
      "Get", "List", "Set", "Delete"
    ]
  }

  tags = {
    Environment = "Production"
    Purpose     = "Certificate Storage"
  }
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

#################################################
# Monitoring & Alerts
#################################################

resource "azurerm_monitor_action_group" "cert_alerts" {
  name                = "cert-expiry-alerts"
  resource_group_name = data.azurerm_resource_group.main.name
  short_name          = "certexpiry"

  email_receiver {
    name          = "admin"
    email_address = var.ssl_cert_email
  }

  tags = {
    Environment = "Production"
    Purpose     = "SSL Monitoring"
  }
}

resource "azurerm_monitor_metric_alert" "cert_expiry" {
  name                = "ssl-cert-expiring-soon"
  resource_group_name = data.azurerm_resource_group.main.name
  scopes              = [data.azurerm_app_service.main.id]
  description         = "Alert when SSL certificate expires in less than 30 days"
  severity            = 2
  frequency           = "PT1H"
  window_size         = "PT1H"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "Certificate.DaysUntilExpiry"
    aggregation      = "Average"
    operator         = "LessThan"
    threshold        = 30
  }

  action {
    action_group_id = azurerm_monitor_action_group.cert_alerts.id
  }

  tags = {
    Environment = "Production"
    Purpose     = "SSL Monitoring"
  }
}

#################################################
# App Service Configuration for HTTPS
#################################################

resource "azurerm_app_service_slot" "staging" {
  name                = "staging"
  app_service_name    = data.azurerm_app_service.main.name
  location            = data.azurerm_resource_group.main.location
  resource_group_name = data.azurerm_resource_group.main.name
  app_service_plan_id = data.azurerm_app_service.main.app_service_plan_id
  https_only          = true

  site_config {
    always_on       = true
    min_tls_version = "1.2"
    ftps_state      = "FtpsOnly"
    http2_enabled   = true

    # Security headers
    cors {
      allowed_origins = ["https://${var.custom_domain}"]
    }
  }

  tags = {
    Environment = "Staging"
    Purpose     = "SSL Testing"
  }
}

#################################################
# Outputs
#################################################

output "certificate_thumbprint" {
  description = "SSL certificate thumbprint"
  value       = azurerm_app_service_managed_certificate.main.thumbprint
}

output "certificate_expiration" {
  description = "SSL certificate expiration date"
  value       = azurerm_app_service_managed_certificate.main.expiration_date
}

output "custom_domain_verification_id" {
  description = "Custom domain verification ID for DNS TXT record"
  value       = data.azurerm_app_service.main.custom_domain_verification_id
}

output "frontdoor_endpoint" {
  description = "Azure Front Door endpoint URL"
  value       = var.enable_frontdoor ? azurerm_cdn_frontdoor_endpoint.main[0].host_name : null
}

output "https_url" {
  description = "HTTPS URL for the application"
  value       = "https://${var.custom_domain}"
}

output "key_vault_name" {
  description = "Key Vault name for certificate storage"
  value       = azurerm_key_vault.main.name
}

output "dns_records_required" {
  description = "DNS records that need to be configured"
  value = {
    txt_record = {
      host  = "asuid.${var.custom_domain}"
      value = data.azurerm_app_service.main.custom_domain_verification_id
    }
    cname_record = {
      host  = "www"
      value = "${data.azurerm_app_service.main.name}.azurewebsites.net"
    }
    a_record = {
      host  = "@"
      value = split(",", data.azurerm_app_service.main.outbound_ip_addresses)[0]
    }
  }
}
