# Outputs for Auth Module

output "firebase_project_id" {
  description = "Firebase project ID"
  value       = var.project_id  # Using project_id since Firebase project creation is disabled
}

output "firebase_service_account_email" {
  description = "Firebase Admin service account email"
  value       = google_service_account.firebase_admin.email
}

output "firebase_service_account_key_secret_id" {
  description = "Secret Manager secret ID for Firebase service account key"
  value       = google_secret_manager_secret.firebase_service_account.secret_id
}

output "firebase_config" {
  description = "Firebase configuration object"
  value = {
    project_id      = var.project_id  # Using project_id since Firebase project creation is disabled
    auth_domain     = "${var.project_id}.firebaseapp.com"
    service_account = google_service_account.firebase_admin.email
  }
  sensitive = true
}