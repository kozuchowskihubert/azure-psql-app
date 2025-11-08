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
  default     = "westeurope"
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
