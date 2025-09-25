# IAM Module - Service accounts and permissions

# API Gateway Service Account
resource "google_service_account" "api_gateway" {
  account_id   = "nexsy-api-${var.environment}"
  display_name = "Nexsy API Gateway Service Account (${var.environment})"
  description  = "Service account for API Gateway and general backend operations"
  project      = var.project_id
}

# Content Generation Service Account
resource "google_service_account" "content_service" {
  account_id   = "nexsy-content-${var.environment}"
  display_name = "Nexsy Content Generation Service Account (${var.environment})"
  description  = "Service account for content generation operations"
  project      = var.project_id
}

# Campaign Management Service Account  
resource "google_service_account" "campaign_service" {
  account_id   = "nexsy-campaign-${var.environment}"
  display_name = "Nexsy Campaign Service Account (${var.environment})"
  description  = "Service account for campaign management operations"
  project      = var.project_id
}

# Optimization Service Account
resource "google_service_account" "optimization_service" {
  account_id   = "nexsy-optimization-${var.environment}"
  display_name = "Nexsy Optimization Service Account (${var.environment})"
  description  = "Service account for campaign optimization operations"
  project      = var.project_id
}

# CI/CD Service Account
resource "google_service_account" "cicd" {
  account_id   = "nexsy-cicd-${var.environment}"
  display_name = "Nexsy CI/CD Service Account (${var.environment})"
  description  = "Service account for CI/CD pipeline operations"
  project      = var.project_id
}

# Cloud Functions Service Account
resource "google_service_account" "cloud_functions" {
  account_id   = "nexsy-functions-${var.environment}"
  display_name = "Nexsy Cloud Functions Service Account (${var.environment})"
  description  = "Service account for Cloud Functions execution"
  project      = var.project_id
}

# API Gateway Permissions
resource "google_project_iam_member" "api_gateway_permissions" {
  for_each = toset([
    "roles/datastore.user",
    "roles/storage.objectViewer",
    "roles/secretmanager.secretAccessor",
    "roles/pubsub.publisher",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.api_gateway.email}"
}

# Content Service Permissions
resource "google_project_iam_member" "content_service_permissions" {
  for_each = toset([
    "roles/datastore.user",
    "roles/storage.objectAdmin",
    "roles/secretmanager.secretAccessor",
    "roles/pubsub.publisher",
    "roles/pubsub.subscriber",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.content_service.email}"
}

# Campaign Service Permissions
resource "google_project_iam_member" "campaign_service_permissions" {
  for_each = toset([
    "roles/datastore.user",
    "roles/storage.objectViewer",
    "roles/secretmanager.secretAccessor",
    "roles/pubsub.publisher",
    "roles/pubsub.subscriber",
    "roles/cloudscheduler.admin",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.campaign_service.email}"
}

# Optimization Service Permissions
resource "google_project_iam_member" "optimization_service_permissions" {
  for_each = toset([
    "roles/datastore.user",
    "roles/secretmanager.secretAccessor",
    "roles/pubsub.subscriber",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.optimization_service.email}"
}

# CI/CD Service Permissions
resource "google_project_iam_member" "cicd_permissions" {
  for_each = toset([
    "roles/cloudbuild.builds.editor",
    "roles/artifactregistry.writer",
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
    "roles/cloudfunctions.admin",
    "roles/storage.admin"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

# Cloud Functions Permissions
resource "google_project_iam_member" "functions_permissions" {
  for_each = toset([
    "roles/datastore.user",
    "roles/secretmanager.secretAccessor",
    "roles/pubsub.publisher",
    "roles/logging.logWriter"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cloud_functions.email}"
}

# Custom role for Firestore admin (more restrictive than full admin)
resource "google_project_iam_custom_role" "firestore_manager" {
  role_id     = "nexsy.firestoreManager.${var.environment}"
  title       = "Nexsy Firestore Manager (${var.environment})"
  description = "Custom role for Firestore database management"
  
  permissions = [
    "datastore.databases.get",
    "datastore.databases.list", 
    "datastore.entities.create",
    "datastore.entities.delete",
    "datastore.entities.get",
    "datastore.entities.list",
    "datastore.entities.update",
    "datastore.indexes.create",
    "datastore.indexes.delete",
    "datastore.indexes.get",
    "datastore.indexes.list"
  ]
}

# Assign custom role to services that need advanced Firestore access
resource "google_project_iam_member" "api_gateway_firestore_manager" {
  project = var.project_id
  role    = google_project_iam_custom_role.firestore_manager.name
  member  = "serviceAccount:${google_service_account.api_gateway.email}"
}

# Cross-service permissions (API Gateway can impersonate other services)
resource "google_service_account_iam_member" "api_gateway_impersonation" {
  for_each = {
    content_service  = google_service_account.content_service.email
    campaign_service = google_service_account.campaign_service.email
  }

  service_account_id = "projects/${var.project_id}/serviceAccounts/${each.value}"
  role              = "roles/iam.serviceAccountTokenCreator"
  member            = "serviceAccount:${google_service_account.api_gateway.email}"
}

# Generate service account keys (disabled due to org policy constraints)
resource "google_service_account_key" "api_gateway_key" {
  count              = 0  # Disabled due to org policy
  service_account_id = google_service_account.api_gateway.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}

resource "google_service_account_key" "content_service_key" {
  count              = 0  # Disabled due to org policy
  service_account_id = google_service_account.content_service.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}

# For production, use workload identity instead of keys
resource "google_service_account_iam_member" "workload_identity_user" {
  count              = var.environment == "production" ? 1 : 0
  service_account_id = google_service_account.api_gateway.name
  role              = "roles/iam.workloadIdentityUser"
  member            = "serviceAccount:${var.project_id}.svc.id.goog[nexsy/nexsy-api]"
}