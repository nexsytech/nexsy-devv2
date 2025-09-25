# Nexsy V2 - Main Terraform Configuration
# This file defines the core infrastructure for Nexsy platform

terraform {
  required_version = ">= 1.5"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
  
  # Backend configuration - uncomment for remote state
  # backend "gcs" {
  #   bucket = "nexsy-terraform-state"
  #   prefix = "terraform/state"
  # }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Data sources
data "google_client_config" "default" {}

# Enable required Google Cloud APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "firebase.googleapis.com",
    "cloudfunctions.googleapis.com",
    "pubsub.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudscheduler.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com"
  ])

  project = var.project_id
  service = each.value

  disable_dependent_services = false
  disable_on_destroy        = false
}

# Core modules
module "storage" {
  source = "./modules/storage"
  
  project_id   = var.project_id
  region       = var.region
  environment  = var.environment
  
  depends_on = [google_project_service.required_apis]
}

module "database" {
  source = "./modules/database"

  project_id         = var.project_id
  firestore_location = var.firestore_location
  environment        = var.environment
  labels             = var.labels

  depends_on = [google_project_service.required_apis]
}

module "auth" {
  source = "./modules/auth"

  project_id         = var.project_id
  environment        = var.environment
  authorized_domains = var.cors_allowed_origins
  labels             = var.labels

  depends_on = [google_project_service.required_apis]
}

module "secrets" {
  source = "./modules/secrets"
  
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  
  depends_on = [google_project_service.required_apis]
}

module "container_registry" {
  source = "./modules/container_registry"
  
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  
  depends_on = [google_project_service.required_apis]
}

module "iam" {
  source = "./modules/iam"
  
  project_id  = var.project_id
  environment = var.environment
  
  depends_on = [google_project_service.required_apis]
}

module "messaging" {
  source = "./modules/messaging"
  
  project_id  = var.project_id
  environment = var.environment
  
  depends_on = [google_project_service.required_apis]
}

module "monitoring" {
  source = "./modules/monitoring"
  
  project_id     = var.project_id
  environment    = var.environment
  billing_account = var.billing_account
  
  depends_on = [google_project_service.required_apis]
}

# Cloud Run services will be added in Phase 2
# module "cloud_run" {
#   source = "./modules/cloud_run"
#   
#   project_id  = var.project_id
#   region      = var.region
#   environment = var.environment
#   
#   depends_on = [
#     module.container_registry,
#     module.iam
#   ]
# }