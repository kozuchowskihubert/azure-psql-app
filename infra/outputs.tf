output "app_url" {
  description = "Azure App Service URL"
  value       = "https://${azurerm_linux_web_app.app.default_hostname}"
}

output "music_app_url" {
  description = "Music Production App Service URL"
  value       = "https://${azurerm_linux_web_app.music_app.default_hostname}"
}

output "database_fqdn" {
  description = "PostgreSQL Server FQDN"
  value       = azurerm_postgresql_flexible_server.pg.fqdn
  sensitive   = true
}

output "db_admin" {
  description = "Database admin username"
  value       = var.db_admin
  sensitive   = true
}

output "db_password" {
  description = "Database admin password"
  value       = var.db_password
  sensitive   = true
}

output "db_name" {
  description = "Database name"
  value       = var.db_name
}

output "acr_login_server" {
  description = "Azure Container Registry Login Server"
  value       = azurerm_container_registry.acr.login_server
}

output "acr_admin_username" {
  description = "Azure Container Registry Admin Username"
  value       = azurerm_container_registry.acr.admin_username
  sensitive   = true
}

output "acr_admin_password" {
  description = "Azure Container Registry Admin Password"
  value       = azurerm_container_registry.acr.admin_password
  sensitive   = true
}

output "resource_group_name" {
  description = "Resource Group Name"
  value       = azurerm_resource_group.rg.name
}

# Service Principal outputs - Managed manually
# output "spn_client_id" {
#   description = "Service Principal Client ID"
#   value       = azuread_service_principal.sp.client_id
#   sensitive   = true
# }

# output "spn_client_secret" {
#   description = "Service Principal Client Secret"
#   value       = azuread_service_principal_password.sp_pwd.value
#   sensitive   = true
# }

# output "spn_tenant_id" {
#   description = "Service Principal Tenant ID"
#   value       = azuread_service_principal.sp.application_tenant_id
#   sensitive   = true
# }

# ====================================================================
# Virtual Machine Outputs (feat/tracks)
# ====================================================================

output "vm_public_ip" {
  description = "Public IP address of the tracks VM"
  value       = azurerm_public_ip.vm_pip.ip_address
}

output "vm_name" {
  description = "Name of the tracks VM"
  value       = azurerm_linux_virtual_machine.tracks_vm.name
}

output "vm_admin_username" {
  description = "Admin username for the VM"
  value       = var.vm_admin_username
}

output "vm_ssh_command" {
  description = "SSH command to connect to the VM"
  value       = "ssh ${var.vm_admin_username}@${azurerm_public_ip.vm_pip.ip_address}"
}

# ====================================================================
# Custom Domain Outputs (haos.fm)
# ====================================================================

output "custom_domain_enabled" {
  description = "Whether custom domain is enabled"
  value       = var.enable_custom_domain
}

output "custom_domain" {
  description = "Custom domain name"
  value       = var.custom_domain
}

output "music_app_verification_id" {
  description = "Custom domain verification ID for DNS TXT record"
  value       = azurerm_linux_web_app.music_app.custom_domain_verification_id
  sensitive   = true
}

output "dns_setup_instructions" {
  description = "DNS configuration instructions for haos.fm"
  sensitive   = true
  value       = <<-EOT
    
    ========================================
    DNS SETUP FOR ${var.custom_domain}
    ========================================
    
    Add these DNS records at your domain registrar:
    
    1. CNAME Record (for www subdomain):
       Host: www
       Points to: ${azurerm_linux_web_app.music_app.default_hostname}
    
    2. A Record (for apex domain) - Use Azure's IP:
       Host: @
       Points to: Use 'awverify' method below
    
    3. TXT Record (for domain verification):
       Host: asuid
       Value: ${azurerm_linux_web_app.music_app.custom_domain_verification_id}
    
    4. TXT Record (for www verification):
       Host: asuid.www
       Value: ${azurerm_linux_web_app.music_app.custom_domain_verification_id}
    
    After DNS propagation (may take up to 48 hours):
    Set enable_custom_domain = true in terraform.tfvars
    
    ========================================
  EOT
}
