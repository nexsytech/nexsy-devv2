# Storage Module - Cloud Storage buckets for assets and data

# Generate random suffix for bucket names to ensure global uniqueness
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Assets bucket for user uploads and generated content
resource "google_storage_bucket" "assets" {
  name     = "${var.app_name}-assets-${var.environment}-${random_id.bucket_suffix.hex}"
  location = var.storage_location
  project  = var.project_id

  # Prevent accidental deletion
  lifecycle {
    prevent_destroy = true
  }

  # Storage class
  storage_class = var.storage_class

  # Versioning
  versioning {
    enabled = var.environment == "production"
  }

  # CORS configuration for web uploads
  cors {
    origin          = var.cors_allowed_origins
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  # Lifecycle management
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 1095  # 3 years
    }
    action {
      type = "Delete"
    }
  }

  # Public access prevention
  public_access_prevention = "enforced"

  # Uniform bucket-level access
  uniform_bucket_level_access = true

  labels = merge(var.labels, {
    environment = var.environment
    purpose     = "assets"
  })
}

# Generated content bucket (separate for better organization)
resource "google_storage_bucket" "generated_content" {
  name     = "${var.app_name}-generated-${var.environment}-${random_id.bucket_suffix.hex}"
  location = var.storage_location
  project  = var.project_id

  storage_class = var.storage_class

  versioning {
    enabled = false  # Generated content doesn't need versioning
  }

  # CORS configuration
  cors {
    origin          = var.cors_allowed_origins
    method          = ["GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  # Lifecycle management - more aggressive for generated content
  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 730  # 2 years
    }
    action {
      type = "Delete"
    }
  }

  public_access_prevention = "enforced"
  uniform_bucket_level_access = true

  labels = merge(var.labels, {
    environment = var.environment
    purpose     = "generated-content"
  })
}

# Templates bucket for system templates
resource "google_storage_bucket" "templates" {
  name     = "${var.app_name}-templates-${var.environment}-${random_id.bucket_suffix.hex}"
  location = var.storage_location
  project  = var.project_id

  storage_class = "STANDARD"

  versioning {
    enabled = true  # Templates should be versioned
  }

  # No CORS needed for templates
  
  # No lifecycle rules - templates are permanent

  public_access_prevention = "enforced"
  uniform_bucket_level_access = true

  labels = merge(var.labels, {
    environment = var.environment
    purpose     = "templates"
  })
}

# Reports bucket for analytics exports (future use)
resource "google_storage_bucket" "reports" {
  name     = "${var.app_name}-reports-${var.environment}-${random_id.bucket_suffix.hex}"
  location = var.storage_location
  project  = var.project_id

  storage_class = "STANDARD"

  versioning {
    enabled = false
  }

  # Aggressive lifecycle for reports
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }

  public_access_prevention = "enforced"
  uniform_bucket_level_access = true

  labels = merge(var.labels, {
    environment = var.environment
    purpose     = "reports"
  })
}

# IAM binding for service accounts to access buckets
resource "google_storage_bucket_iam_member" "assets_object_admin" {
  bucket = google_storage_bucket.assets.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:nexsy-api-${var.environment}@${var.project_id}.iam.gserviceaccount.com"

  depends_on = [google_storage_bucket.assets]
}

resource "google_storage_bucket_iam_member" "generated_content_admin" {
  bucket = google_storage_bucket.generated_content.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:nexsy-content-${var.environment}@${var.project_id}.iam.gserviceaccount.com"

  depends_on = [google_storage_bucket.generated_content]
}

resource "google_storage_bucket_iam_member" "templates_reader" {
  bucket = google_storage_bucket.templates.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:nexsy-api-${var.environment}@${var.project_id}.iam.gserviceaccount.com"

  depends_on = [google_storage_bucket.templates]
}