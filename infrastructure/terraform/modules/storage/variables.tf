# Storage Module Variables

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "nexsy"
}

variable "storage_location" {
  description = "Location for Cloud Storage buckets"
  type        = string
  default     = "US"
}

variable "storage_class" {
  description = "Default storage class for buckets"
  type        = string
  default     = "STANDARD"
}

variable "cors_allowed_origins" {
  description = "CORS allowed origins"
  type        = list(string)
  default     = ["*"]
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default = {
    managed_by = "terraform"
  }
}