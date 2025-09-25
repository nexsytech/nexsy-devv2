# Container Registry Module Variables

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region for Artifact Registry"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "repository_id" {
  description = "Artifact Registry repository ID"
  type        = string
  default     = "nexsy-containers"
}

variable "create_npm_registry" {
  description = "Whether to create NPM package registry"
  type        = bool
  default     = false
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default = {
    managed_by = "terraform"
  }
}