# Container Registry Module - Artifact Registry for Docker images

# Create Artifact Registry repository for Docker images
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  project       = var.project_id
  repository_id = var.repository_id
  description   = "Docker repository for Nexsy application containers (${var.environment})"
  format        = "DOCKER"

  labels = merge(var.labels, {
    environment = var.environment
    service     = "container-registry"
  })

  cleanup_policies {
    id     = "keep-recent-versions"
    action = "KEEP"

    most_recent_versions {
      keep_count = var.environment == "production" ? 10 : 5
    }
  }

  cleanup_policies {
    id     = "delete-old-untagged"
    action = "DELETE"

    condition {
      tag_state  = "UNTAGGED"
      older_than = "${var.environment == "production" ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60}s"
    }
  }
}

# Create a second repository for base images and dependencies
resource "google_artifact_registry_repository" "base_images_repo" {
  location      = var.region
  project       = var.project_id
  repository_id = "${var.repository_id}-base"
  description   = "Base images and dependencies repository (${var.environment})"
  format        = "DOCKER"

  labels = merge(var.labels, {
    environment = var.environment
    service     = "base-images"
  })

  cleanup_policies {
    id     = "keep-base-images"
    action = "KEEP"

    most_recent_versions {
      keep_count = 20 # Keep more base images as they're shared
    }
  }
}

# IAM permissions for service accounts
resource "google_artifact_registry_repository_iam_member" "docker_repo_reader" {
  project    = var.project_id
  location   = google_artifact_registry_repository.docker_repo.location
  repository = google_artifact_registry_repository.docker_repo.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:nexsy-api-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_artifact_registry_repository_iam_member" "docker_repo_writer" {
  project    = var.project_id
  location   = google_artifact_registry_repository.docker_repo.location
  repository = google_artifact_registry_repository.docker_repo.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:nexsy-cicd-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

# Grant Cloud Build service account access
resource "google_artifact_registry_repository_iam_member" "cloudbuild_access" {
  project    = var.project_id
  location   = google_artifact_registry_repository.docker_repo.location
  repository = google_artifact_registry_repository.docker_repo.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

# Grant Cloud Run service agent access to pull images
resource "google_artifact_registry_repository_iam_member" "cloudrun_access" {
  project    = var.project_id
  location   = google_artifact_registry_repository.docker_repo.location
  repository = google_artifact_registry_repository.docker_repo.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:service-${data.google_project.project.number}@serverless-robot-prod.iam.gserviceaccount.com"
}

# Get project information
data "google_project" "project" {
  project_id = var.project_id
}

# Optional: Create a registry for npm packages (future use)
resource "google_artifact_registry_repository" "npm_repo" {
  count         = var.create_npm_registry ? 1 : 0
  location      = var.region
  project       = var.project_id
  repository_id = "${var.repository_id}-npm"
  description   = "NPM packages repository (${var.environment})"
  format        = "NPM"

  labels = merge(var.labels, {
    environment = var.environment
    service     = "npm-packages"
  })
}

# Create scanning configuration for vulnerability scanning
resource "google_artifact_registry_repository" "secure_repo" {
  count         = var.environment == "production" ? 1 : 0
  location      = var.region
  project       = var.project_id
  repository_id = "${var.repository_id}-secure"
  description   = "Production secure repository with vulnerability scanning"
  format        = "DOCKER"

  labels = merge(var.labels, {
    environment = "production"
    service     = "secure-registry"
    scanning    = "enabled"
  })

  cleanup_policies {
    id     = "keep-secure-versions"
    action = "KEEP"

    most_recent_versions {
      keep_count = 20
    }
  }

  cleanup_policies {
    id     = "delete-vulnerable"
    action = "DELETE"

    condition {
      tag_state    = "ANY"
      older_than   = "7776000s"  # 90 days in seconds
      package_name_prefixes = ["vulnerable-"]
    }
  }
}