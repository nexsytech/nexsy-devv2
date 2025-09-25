# Secrets Module Variables

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

# Content Provider API Keys
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

# Social Media Platform Credentials
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

# Security Keys
variable "jwt_secret" {
  description = "JWT signing secret (auto-generated if not provided)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default = {
    managed_by = "terraform"
  }
}