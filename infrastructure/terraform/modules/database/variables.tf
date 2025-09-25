# Database Module Variables

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "firestore_location" {
  description = "Firestore database location"
  type        = string
  default     = "us-central"
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default = {
    managed_by = "terraform"
  }
}