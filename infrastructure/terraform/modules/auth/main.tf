# Authentication Module - Firebase Authentication

# Enable Identity Toolkit API (required for Firebase Auth)
resource "google_project_service" "identity_toolkit" {
  project = var.project_id
  service = "identitytoolkit.googleapis.com"

  disable_on_destroy = false
}

# Enable Firebase API
resource "google_project_service" "firebase" {
  project = var.project_id
  service = "firebase.googleapis.com"

  disable_on_destroy = false
}

# Create Firebase project (disabled - requires Firebase Admin API permissions)
resource "google_firebase_project" "default" {
  count = 0  # Disabled - requires Firebase Admin API permissions
  provider = google-beta
  project  = var.project_id

  depends_on = [
    google_project_service.firebase,
    google_project_service.identity_toolkit
  ]
}

# Configure Identity Platform (disabled - requires quota project setup)
resource "google_identity_platform_config" "auth_config" {
  count = 0  # Disabled - requires quota project setup
  provider = google-beta
  project  = var.project_id

  # Sign-in options
  sign_in {
    allow_duplicate_emails = false

    # Email/Password authentication
    email {
      enabled           = true
      password_required = true
    }

    # Anonymous authentication (for guest users)
    anonymous {
      enabled = var.environment != "production"
    }
  }

  # Authorized domains for authentication
  authorized_domains = var.authorized_domains

  depends_on = [
    google_firebase_project.default,
    google_project_service.identity_toolkit
  ]
}

# OAuth configuration for social logins (future use)
resource "google_identity_platform_oauth_idp_config" "google_oauth" {
  count    = var.enable_google_oauth ? 1 : 0
  provider = google-beta
  project  = var.project_id

  name          = "google.com"
  display_name  = "Google"
  enabled       = true
  issuer        = "https://accounts.google.com"

  client_id     = var.google_oauth_client_id
  client_secret = var.google_oauth_client_secret

  depends_on = [google_identity_platform_config.auth_config]
}

# Configure password policy (disabled - requires quota project setup)
resource "google_identity_platform_project_default_config" "auth_project_config" {
  count = 0  # Disabled - requires quota project setup
  provider = google-beta
  project  = var.project_id

  # Password policy configuration (hash_config is auto-configured by Google)
  sign_in {
    allow_duplicate_emails = false
  }

  depends_on = [google_identity_platform_config.auth_config]
}

# Create service account for Firebase Admin SDK
resource "google_service_account" "firebase_admin" {
  account_id   = "firebase-admin-${var.environment}"
  display_name = "Firebase Admin Service Account (${var.environment})"
  description  = "Service account for Firebase Admin SDK operations"
  project      = var.project_id
}

# Grant Firebase Admin privileges
resource "google_project_iam_member" "firebase_admin_role" {
  project = var.project_id
  role    = "roles/firebase.admin"
  member  = "serviceAccount:${google_service_account.firebase_admin.email}"
}

# Grant Identity Platform Admin privileges  
resource "google_project_iam_member" "identity_admin_role" {
  project = var.project_id
  role    = "roles/identityplatform.admin"
  member  = "serviceAccount:${google_service_account.firebase_admin.email}"
}

# Create and download service account key (disabled due to org policy)
# resource "google_service_account_key" "firebase_admin_key" {
#   service_account_id = google_service_account.firebase_admin.name
#   public_key_type    = "TYPE_X509_PEM_FILE"
# }

# Store Firebase service account key in Secret Manager
resource "google_secret_manager_secret" "firebase_service_account" {
  secret_id = "firebase-service-account-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "firebase-auth"
  })
}

# Disabled due to service account key creation being blocked
# resource "google_secret_manager_secret_version" "firebase_service_account_version" {
#   secret      = google_secret_manager_secret.firebase_service_account.id
#   secret_data = base64decode(google_service_account_key.firebase_admin_key.private_key)
# }