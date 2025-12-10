variable "env" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "prefix" {
  description = "Resource name prefix"
  type        = string
  default     = "notesapp"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "westus2"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "notesdb"
}

variable "db_admin" {
  description = "Database admin username"
  type        = string
  default     = "notesadmin"
}

variable "db_password" {
  description = "Database admin password"
  type        = string
  sensitive   = true
}

variable "image_tag" {
  description = "Docker image tag for deployment"
  type        = string
  default     = "latest"
}

# ====================================================================
# Virtual Machine Variables (feat/tracks)
# ====================================================================

variable "vm_size" {
  description = "Azure VM size for tracks processing"
  type        = string
  default     = "Standard_B1s" # Cheapest: 1 vCPU, 1GB RAM (~$7.50/month)
}

variable "vm_admin_username" {
  description = "Admin username for the VM"
  type        = string
  default     = "azureuser"
}

variable "vm_ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
  sensitive   = true
  default     = "" # Will be generated if not provided
}

# ====================================================================
# Custom Domain Variables (haos.fm)
# ====================================================================

variable "custom_domain" {
  description = "Custom domain for the music app (e.g., haos.fm)"
  type        = string
  default     = "haos.fm"
}

variable "enable_custom_domain" {
  description = "Whether to enable custom domain binding"
  type        = bool
  default     = false # Set to true when DNS is configured
}