# IAM Module Outputs

output "service_accounts" {
  description = "All service account information"
  value = {
    api_gateway = {
      email = google_service_account.api_gateway.email
      name  = google_service_account.api_gateway.name
    }
    content_service = {
      email = google_service_account.content_service.email
      name  = google_service_account.content_service.name
    }
    campaign_service = {
      email = google_service_account.campaign_service.email
      name  = google_service_account.campaign_service.name
    }
    optimization_service = {
      email = google_service_account.optimization_service.email
      name  = google_service_account.optimization_service.name
    }
    cicd = {
      email = google_service_account.cicd.email
      name  = google_service_account.cicd.name
    }
    cloud_functions = {
      email = google_service_account.cloud_functions.email
      name  = google_service_account.cloud_functions.name
    }
  }
}

output "api_service_account_email" {
  description = "API Gateway service account email"
  value       = google_service_account.api_gateway.email
}

output "content_service_account_email" {
  description = "Content service account email" 
  value       = google_service_account.content_service.email
}

output "campaign_service_account_email" {
  description = "Campaign service account email"
  value       = google_service_account.campaign_service.email
}

output "optimization_service_account_email" {
  description = "Optimization service account email"
  value       = google_service_account.optimization_service.email
}

output "cicd_service_account_email" {
  description = "CI/CD service account email"
  value       = google_service_account.cicd.email
}

output "functions_service_account_email" {
  description = "Cloud Functions service account email"
  value       = google_service_account.cloud_functions.email
}

# Service account keys (only for development)
output "api_gateway_key" {
  description = "API Gateway service account key (disabled due to org policy)"
  value       = null  # Disabled due to org policy constraints
  sensitive   = true
}

output "content_service_key" {
  description = "Content service account key (disabled due to org policy)"
  value       = null  # Disabled due to org policy constraints
  sensitive   = true
}