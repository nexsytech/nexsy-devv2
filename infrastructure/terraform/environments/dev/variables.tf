# Development Environment Variables
# This file mirrors the root variables.tf for environment-specific deployment

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
  description = "Environment name"
  type        = string
  default     = "dev"
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

variable "firestore_location" {
  description = "Location for Firestore database"
  type        = string
  default     = "us-central"
}

variable "artifact_repository_id" {
  description = "Artifact Registry repository ID"
  type        = string
  default     = "nexsy-containers"
}

variable "monthly_budget_amount" {
  description = "Monthly budget amount in USD"
  type        = number
  default     = 50
}

variable "budget_alert_threshold" {
  description = "Budget alert threshold (0.0 - 1.0)"
  type        = number
  default     = 0.8
}

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
  default     = "dev-alerts@nexsy.app"
}

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

variable "cors_allowed_origins" {
  description = "CORS allowed origins"
  type        = list(string)
  default     = ["*"]
}

variable "labels" {
  description = "Labels to apply to all resources"
  type        = map(string)
  default = {
    project     = "nexsy"
    environment = "dev"
    managed_by  = "terraform"
  }
}