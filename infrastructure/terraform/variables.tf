# Nexsy V2 - Terraform Variables

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "billing_account" {
  description = "GCP Billing Account ID"
  type        = string
}

variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone for zonal resources"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  validation {
    condition = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "nexsy"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

# Storage configuration
variable "storage_location" {
  description = "Location for Cloud Storage buckets"
  type        = string
  default     = "US"
}

variable "storage_class" {
  description = "Storage class for buckets"
  type        = string
  default     = "STANDARD"
}

# Firestore configuration
variable "firestore_location" {
  description = "Location for Firestore database"
  type        = string
  default     = "us-central"
}

# Container Registry configuration
variable "artifact_repository_id" {
  description = "Artifact Registry repository ID"
  type        = string
  default     = "nexsy-containers"
}

# Budget configuration
variable "monthly_budget_amount" {
  description = "Monthly budget amount in USD"
  type        = number
  default     = 100
}

variable "budget_alert_threshold" {
  description = "Budget alert threshold (0.0 - 1.0)"
  type        = number
  default     = 0.8
}

# External API configuration (will be stored in Secret Manager)
variable "freepik_api_key" {
  description = "Freepik API key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  default     = ""
  sensitive   = true
}

# Social Media API configuration
variable "facebook_app_id" {
  description = "Facebook App ID"
  type        = string
  default     = ""
}

variable "facebook_app_secret" {
  description = "Facebook App Secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "tiktok_app_id" {
  description = "TikTok App ID"
  type        = string
  default     = ""
}

variable "tiktok_app_secret" {
  description = "TikTok App Secret"
  type        = string
  default     = ""
  sensitive   = true
}

# Security
variable "cors_allowed_origins" {
  description = "CORS allowed origins"
  type        = list(string)
  default     = ["*"]
}

# Resource labeling
variable "labels" {
  description = "Labels to apply to all resources"
  type        = map(string)
  default = {
    project     = "nexsy"
    managed_by  = "terraform"
  }
}