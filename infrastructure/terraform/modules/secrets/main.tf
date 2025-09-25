# Secrets Module - Secret Manager for API keys and sensitive data

# API Keys for Content Generation
resource "google_secret_manager_secret" "freepik_api_key" {
  secret_id = "freepik-api-key-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "content-generation"
    provider    = "freepik"
  })
}

resource "google_secret_manager_secret_version" "freepik_api_key_version" {
  count       = var.freepik_api_key != "" ? 1 : 0
  secret      = google_secret_manager_secret.freepik_api_key.id
  secret_data = var.freepik_api_key
}

resource "google_secret_manager_secret" "openai_api_key" {
  secret_id = "openai-api-key-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "content-generation"
    provider    = "openai"
  })
}

resource "google_secret_manager_secret_version" "openai_api_key_version" {
  count       = var.openai_api_key != "" ? 1 : 0
  secret      = google_secret_manager_secret.openai_api_key.id
  secret_data = var.openai_api_key
}

# Social Media Platform Credentials
resource "google_secret_manager_secret" "facebook_app_id" {
  secret_id = "facebook-app-id-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "social-media"
    platform    = "facebook"
  })
}

resource "google_secret_manager_secret_version" "facebook_app_id_version" {
  count       = var.facebook_app_id != "" ? 1 : 0
  secret      = google_secret_manager_secret.facebook_app_id.id
  secret_data = var.facebook_app_id
}

resource "google_secret_manager_secret" "facebook_app_secret" {
  secret_id = "facebook-app-secret-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "social-media"
    platform    = "facebook"
  })
}

resource "google_secret_manager_secret_version" "facebook_app_secret_version" {
  count       = var.facebook_app_secret != "" ? 1 : 0
  secret      = google_secret_manager_secret.facebook_app_secret.id
  secret_data = var.facebook_app_secret
}

resource "google_secret_manager_secret" "tiktok_app_id" {
  secret_id = "tiktok-app-id-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "social-media"
    platform    = "tiktok"
  })
}

resource "google_secret_manager_secret_version" "tiktok_app_id_version" {
  count       = var.tiktok_app_id != "" ? 1 : 0
  secret      = google_secret_manager_secret.tiktok_app_id.id
  secret_data = var.tiktok_app_id
}

resource "google_secret_manager_secret" "tiktok_app_secret" {
  secret_id = "tiktok-app-secret-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "social-media"
    platform    = "tiktok"
  })
}

resource "google_secret_manager_secret_version" "tiktok_app_secret_version" {
  count       = var.tiktok_app_secret != "" ? 1 : 0
  secret      = google_secret_manager_secret.tiktok_app_secret.id
  secret_data = var.tiktok_app_secret
}

# Database Connection Strings and Keys
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "authentication"
  })
}

resource "google_secret_manager_secret_version" "jwt_secret_version" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret != "" ? var.jwt_secret : random_password.jwt_secret.result
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

# Encryption key for sensitive data
resource "google_secret_manager_secret" "encryption_key" {
  secret_id = "encryption-key-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "security"
  })
}

resource "google_secret_manager_secret_version" "encryption_key_version" {
  secret      = google_secret_manager_secret.encryption_key.id
  secret_data = random_password.encryption_key.result
}

resource "random_password" "encryption_key" {
  length  = 32
  special = false
}

# Webhook secrets for platform callbacks
resource "google_secret_manager_secret" "webhook_secret" {
  secret_id = "webhook-secret-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "webhooks"
  })
}

resource "google_secret_manager_secret_version" "webhook_secret_version" {
  secret      = google_secret_manager_secret.webhook_secret.id
  secret_data = random_password.webhook_secret.result
}

resource "random_password" "webhook_secret" {
  length  = 32
  special = false
}

# IAM permissions for service accounts to access secrets
resource "google_secret_manager_secret_iam_member" "content_service_access" {
  for_each = toset([
    google_secret_manager_secret.freepik_api_key.secret_id,
    google_secret_manager_secret.openai_api_key.secret_id
  ])

  project   = var.project_id
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:nexsy-content-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_secret_manager_secret_iam_member" "campaign_service_access" {
  for_each = toset([
    google_secret_manager_secret.facebook_app_id.secret_id,
    google_secret_manager_secret.facebook_app_secret.secret_id,
    google_secret_manager_secret.tiktok_app_id.secret_id,
    google_secret_manager_secret.tiktok_app_secret.secret_id
  ])

  project   = var.project_id
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:nexsy-campaign-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_secret_manager_secret_iam_member" "api_gateway_access" {
  for_each = toset([
    google_secret_manager_secret.jwt_secret.secret_id,
    google_secret_manager_secret.encryption_key.secret_id,
    google_secret_manager_secret.webhook_secret.secret_id
  ])

  project   = var.project_id
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:nexsy-api-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

# Future secrets (placeholders)
resource "google_secret_manager_secret" "sendgrid_api_key" {
  secret_id = "sendgrid-api-key-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "email"
    provider    = "sendgrid"
  })
}

resource "google_secret_manager_secret" "stripe_secret_key" {
  secret_id = "stripe-secret-key-${var.environment}"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "payments"
    provider    = "stripe"
  })
}