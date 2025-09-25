# Database Module - Firestore configuration

# Create Firestore database
resource "google_firestore_database" "database" {
  project                     = var.project_id
  name                        = "(default)"
  location_id                 = var.firestore_location
  type                        = "FIRESTORE_NATIVE"
  concurrency_mode           = "OPTIMISTIC"
  app_engine_integration_mode = "DISABLED"

  depends_on = [google_project_service.firestore]
}

# Enable Firestore API (if not already enabled)
resource "google_project_service" "firestore" {
  project = var.project_id
  service = "firestore.googleapis.com"

  disable_on_destroy = false
}

# Skip creating rules database since (default) already exists
# The main database already has the default rules applied

# Create composite indexes for efficient querying
resource "google_firestore_index" "user_products_index" {
  project    = var.project_id
  database   = google_firestore_database.database.name
  collection = "products"

  fields {
    field_path = "userId"
    order      = "ASCENDING"
  }

  fields {
    field_path = "createdAt"
    order      = "DESCENDING"
  }

  depends_on = [google_firestore_database.database]
}

resource "google_firestore_index" "user_campaigns_index" {
  project    = var.project_id
  database   = google_firestore_database.database.name
  collection = "campaigns"

  fields {
    field_path = "userId"
    order      = "ASCENDING"
  }

  fields {
    field_path = "status"
    order      = "ASCENDING"
  }

  fields {
    field_path = "createdAt"
    order      = "DESCENDING"
  }

  depends_on = [google_firestore_database.database]
}

resource "google_firestore_index" "campaign_metrics_index" {
  project    = var.project_id
  database   = google_firestore_database.database.name
  collection = "metrics"

  fields {
    field_path = "campaignId"
    order      = "ASCENDING"
  }

  fields {
    field_path = "timestamp"
    order      = "DESCENDING"
  }

  depends_on = [google_firestore_database.database]
}

resource "google_firestore_index" "content_product_index" {
  project    = var.project_id
  database   = google_firestore_database.database.name
  collection = "content"

  fields {
    field_path = "productId"
    order      = "ASCENDING"
  }

  fields {
    field_path = "type"
    order      = "ASCENDING"
  }

  fields {
    field_path = "createdAt"
    order      = "DESCENDING"
  }

  depends_on = [google_firestore_database.database]
}

# Create a backup schedule for production
resource "google_firestore_backup_schedule" "daily_backup" {
  count    = var.environment == "production" ? 1 : 0
  project  = var.project_id
  database = google_firestore_database.database.name

  retention = "2592000s" # 30 days

  daily_recurrence {}

  depends_on = [google_firestore_database.database]
}