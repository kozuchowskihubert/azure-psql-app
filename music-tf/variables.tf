# =============================================================================
# Variables for Music Production App Infrastructure
# =============================================================================

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
}

variable "vm_ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
  default     = ""
}
