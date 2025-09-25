# Secrets Module Outputs

output "secret_names" {
  description = "All secret names for application configuration"
  value = {
    freepik_api_key      = google_secret_manager_secret.freepik_api_key.secret_id
    openai_api_key       = google_secret_manager_secret.openai_api_key.secret_id
    facebook_app_id      = google_secret_manager_secret.facebook_app_id.secret_id
    facebook_app_secret  = google_secret_manager_secret.facebook_app_secret.secret_id
    tiktok_app_id        = google_secret_manager_secret.tiktok_app_id.secret_id
    tiktok_app_secret    = google_secret_manager_secret.tiktok_app_secret.secret_id
    jwt_secret           = google_secret_manager_secret.jwt_secret.secret_id
    encryption_key       = google_secret_manager_secret.encryption_key.secret_id
    webhook_secret       = google_secret_manager_secret.webhook_secret.secret_id
    sendgrid_api_key     = google_secret_manager_secret.sendgrid_api_key.secret_id
    stripe_secret_key    = google_secret_manager_secret.stripe_secret_key.secret_id
  }
}

output "secret_paths" {
  description = "Full secret paths for accessing in applications"
  value = {
    freepik_api_key      = "projects/${var.project_id}/secrets/${google_secret_manager_secret.freepik_api_key.secret_id}/versions/latest"
    openai_api_key       = "projects/${var.project_id}/secrets/${google_secret_manager_secret.openai_api_key.secret_id}/versions/latest"
    facebook_app_id      = "projects/${var.project_id}/secrets/${google_secret_manager_secret.facebook_app_id.secret_id}/versions/latest"
    facebook_app_secret  = "projects/${var.project_id}/secrets/${google_secret_manager_secret.facebook_app_secret.secret_id}/versions/latest"
    tiktok_app_id        = "projects/${var.project_id}/secrets/${google_secret_manager_secret.tiktok_app_id.secret_id}/versions/latest"
    tiktok_app_secret    = "projects/${var.project_id}/secrets/${google_secret_manager_secret.tiktok_app_secret.secret_id}/versions/latest"
    jwt_secret           = "projects/${var.project_id}/secrets/${google_secret_manager_secret.jwt_secret.secret_id}/versions/latest"
    encryption_key       = "projects/${var.project_id}/secrets/${google_secret_manager_secret.encryption_key.secret_id}/versions/latest"
    webhook_secret       = "projects/${var.project_id}/secrets/${google_secret_manager_secret.webhook_secret.secret_id}/versions/latest"
  }
}