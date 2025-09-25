# Development Environment - Main Configuration

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
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }

  # Backend will be configured after initial state bucket creation
  # backend "gcs" {
  #   bucket = "nexsy-dev-123456-terraform-state-SUFFIX"
  #   prefix = "environments/dev"
  # }
}

# Configure providers
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

# Use the root module
module "nexsy_infrastructure" {
  source = "../../"

  # Pass all variables to the root module
  project_id      = var.project_id
  billing_account = var.billing_account
  region          = var.region
  zone            = var.zone
  environment     = var.environment
  app_name        = var.app_name
  domain_name     = var.domain_name

  # Storage
  storage_location = var.storage_location
  storage_class    = var.storage_class

  # Database
  firestore_location = var.firestore_location

  # Container Registry
  artifact_repository_id = var.artifact_repository_id

  # Budget
  monthly_budget_amount  = var.monthly_budget_amount
  budget_alert_threshold = var.budget_alert_threshold

  # External APIs
  freepik_api_key = var.freepik_api_key
  openai_api_key  = var.openai_api_key

  # Social Media
  facebook_app_id     = var.facebook_app_id
  facebook_app_secret = var.facebook_app_secret
  tiktok_app_id       = var.tiktok_app_id
  tiktok_app_secret   = var.tiktok_app_secret

  # Security
  cors_allowed_origins = var.cors_allowed_origins

  # Labels
  labels = var.labels
}