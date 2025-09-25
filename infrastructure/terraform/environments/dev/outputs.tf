# Development Environment Outputs

output "project_id" {
  description = "GCP Project ID"
  value       = module.nexsy_infrastructure.project_id
}

output "region" {
  description = "GCP Region"
  value       = module.nexsy_infrastructure.region
}

output "environment" {
  description = "Environment"
  value       = module.nexsy_infrastructure.environment
}

output "storage_buckets" {
  description = "Cloud Storage bucket information"
  value       = module.nexsy_infrastructure.storage_buckets
}

output "assets_bucket_name" {
  description = "Assets bucket name"
  value       = module.nexsy_infrastructure.assets_bucket_name
}

output "firestore_database_id" {
  description = "Firestore database ID"
  value       = module.nexsy_infrastructure.firestore_database_id
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository"
  value       = module.nexsy_infrastructure.artifact_registry_repository
}

output "service_accounts" {
  description = "Created service accounts"
  value       = module.nexsy_infrastructure.service_accounts
}

output "pubsub_topics" {
  description = "Pub/Sub topics"
  value       = module.nexsy_infrastructure.pubsub_topics
}

output "secret_manager_secrets" {
  description = "Secret Manager secret names"
  value       = module.nexsy_infrastructure.secret_manager_secrets
}

output "monitoring_dashboard_url" {
  description = "Cloud Monitoring dashboard URL"
  value       = module.nexsy_infrastructure.monitoring_dashboard_url
}

# Complete configuration for application deployment
output "app_config" {
  description = "Complete application configuration"
  value = {
    project_id            = module.nexsy_infrastructure.project_id
    region                = module.nexsy_infrastructure.region
    environment           = "dev"
    firestore_database_id = module.nexsy_infrastructure.firestore_database_id
    assets_bucket         = module.nexsy_infrastructure.assets_bucket_name
    pubsub_topics         = module.nexsy_infrastructure.pubsub_topics
    artifact_repository   = module.nexsy_infrastructure.artifact_registry_repository
    service_accounts      = module.nexsy_infrastructure.service_accounts
    secret_paths          = module.nexsy_infrastructure.secret_manager_secrets
  }
}