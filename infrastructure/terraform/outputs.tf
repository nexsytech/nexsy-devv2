# Nexsy V2 - Terraform Outputs

# Project information
output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP Region"
  value       = var.region
}

output "environment" {
  description = "Environment"
  value       = var.environment
}

# Storage outputs
output "storage_buckets" {
  description = "Cloud Storage bucket information"
  value       = module.storage.buckets
}

output "assets_bucket_name" {
  description = "Assets bucket name"
  value       = module.storage.assets_bucket_name
}

output "assets_bucket_url" {
  description = "Assets bucket URL"
  value       = module.storage.assets_bucket_url
}

# Database outputs
output "firestore_database_id" {
  description = "Firestore database ID"
  value       = module.database.database_id
}

# Authentication outputs
output "firebase_config" {
  description = "Firebase configuration"
  value       = module.auth.firebase_config
  sensitive   = true
}

# Container Registry outputs
output "artifact_registry_repository" {
  description = "Artifact Registry repository"
  value       = module.container_registry.repository_url
}

output "container_images_url" {
  description = "Container images base URL"
  value       = module.container_registry.repository_url
}

# IAM outputs
output "service_accounts" {
  description = "Created service accounts"
  value       = module.iam.service_accounts
}

output "api_service_account_email" {
  description = "API service account email"
  value       = module.iam.api_service_account_email
}

output "content_service_account_email" {
  description = "Content generation service account email"
  value       = module.iam.content_service_account_email
}

# Messaging outputs
output "pubsub_topics" {
  description = "Pub/Sub topics"
  value       = module.messaging.topics
}

# Secret Manager outputs
output "secret_manager_secrets" {
  description = "Secret Manager secret names"
  value       = module.secrets.secret_names
}

# Monitoring outputs
output "monitoring_dashboard_url" {
  description = "Cloud Monitoring dashboard URL"
  value       = module.monitoring.dashboard_url
}

output "budget_alert_policy" {
  description = "Budget alert policy name"
  value       = module.monitoring.budget_name
}

# Environment-specific configuration for applications
output "app_config" {
  description = "Application configuration"
  value = {
    project_id              = var.project_id
    region                 = var.region
    environment            = var.environment
    firestore_database_id  = module.database.database_id
    assets_bucket         = module.storage.assets_bucket_name
    pubsub_topics         = module.messaging.topics
    artifact_repository   = module.container_registry.repository_url
  }
}

# Connection strings and URLs for services
output "service_endpoints" {
  description = "Service endpoints and connection information"
  value = {
    firestore_endpoint    = "https://firestore.googleapis.com"
    storage_endpoint      = "https://storage.googleapis.com"
    pubsub_endpoint       = "https://pubsub.googleapis.com"
    secretmanager_endpoint = "https://secretmanager.googleapis.com"
    monitoring_endpoint   = "https://monitoring.googleapis.com"
  }
}

# For use in CI/CD pipelines
output "cicd_config" {
  description = "CI/CD pipeline configuration"
  value = {
    project_id                    = var.project_id
    region                       = var.region
    artifact_registry_repository = module.container_registry.repository_url
    service_account_email        = module.iam.cicd_service_account_email
  }
}