# Terraform State Management Setup
# This file creates the remote state backend bucket and enables state locking

# This should be run first with local state, then backend should be migrated
# Note: terraform and provider blocks are defined in main.tf

# Generate random suffix for globally unique bucket name
resource "random_id" "state_bucket_suffix" {
  byte_length = 4
}

# Create bucket for Terraform state
resource "google_storage_bucket" "terraform_state" {
  name     = "${var.project_id}-terraform-state-${random_id.state_bucket_suffix.hex}"
  location = var.region
  project  = var.project_id

  # Prevent accidental deletion
  lifecycle {
    prevent_destroy = true
  }

  # Versioning for state file history
  versioning {
    enabled = true
  }

  # Encryption
  encryption {
    default_kms_key_name = google_kms_crypto_key.terraform_state_key.id
  }

  # Public access prevention
  public_access_prevention    = "enforced"
  uniform_bucket_level_access = true

  labels = {
    purpose     = "terraform-state"
    environment = "shared"
    managed_by  = "terraform"
  }
}

# Create KMS key for state encryption
resource "google_kms_key_ring" "terraform_state" {
  name     = "terraform-state-${var.environment}"
  location = var.region
  project  = var.project_id
}

resource "google_kms_crypto_key" "terraform_state_key" {
  name     = "terraform-state-key"
  key_ring = google_kms_key_ring.terraform_state.id
  purpose  = "ENCRYPT_DECRYPT"

  lifecycle {
    prevent_destroy = true
  }
}

# Grant Cloud Storage service account access to KMS key
data "google_storage_project_service_account" "gcs_account" {
  project = var.project_id
}

resource "google_kms_crypto_key_iam_member" "storage_key_user" {
  crypto_key_id = google_kms_crypto_key.terraform_state_key.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${data.google_storage_project_service_account.gcs_account.email_address}"
}

# Note: Terraform service account access would be configured separately
# when setting up CI/CD pipelines

# Output the bucket name for backend configuration
output "terraform_state_bucket" {
  description = "Terraform state bucket name"
  value       = google_storage_bucket.terraform_state.name
}