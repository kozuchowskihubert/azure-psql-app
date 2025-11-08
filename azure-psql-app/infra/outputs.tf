output "app_url" {
  description = "Azure App Service URL"
  value       = "https://${azurerm_linux_web_app.app.default_hostname}"
}

output "database_fqdn" {
  description = "PostgreSQL Server FQDN"
  value       = azurerm_postgresql_flexible_server.pg.fqdn
  sensitive   = true
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

output "resource_group_name" {
  description = "Resource Group Name"
  value       = azurerm_resource_group.rg.name
}

output "spn_client_id" {
  description = "Service Principal Client ID"
  value       = azuread_service_principal.sp.client_id
  sensitive   = true
}

output "spn_client_secret" {
  description = "Service Principal Client Secret"
  value       = azuread_service_principal_password.sp_pwd.value
  sensitive   = true
}

output "spn_tenant_id" {
  description = "Service Principal Tenant ID"
  value       = azuread_service_principal.sp.application_tenant_id
  sensitive   = true
}
