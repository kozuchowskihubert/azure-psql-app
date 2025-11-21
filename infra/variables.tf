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
  default     = "northeurope"
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
