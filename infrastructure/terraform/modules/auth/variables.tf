# Variables for Auth Module

variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "authorized_domains" {
  description = "Authorized domains for Firebase Auth"
  type        = list(string)
  default     = []
}

variable "enable_google_oauth" {
  description = "Whether to enable Google OAuth provider"
  type        = bool
  default     = false
}

variable "google_oauth_client_id" {
  description = "Google OAuth client ID"
  type        = string
  default     = ""
}

variable "google_oauth_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  default     = ""
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}