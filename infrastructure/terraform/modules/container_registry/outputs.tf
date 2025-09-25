# Container Registry Module Outputs

output "repository_url" {
  description = "Docker repository URL"
  value       = "${google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.name}"
}

output "repository_name" {
  description = "Repository name"
  value       = google_artifact_registry_repository.docker_repo.name
}

output "repository_location" {
  description = "Repository location"
  value       = google_artifact_registry_repository.docker_repo.location
}

output "base_images_repository_url" {
  description = "Base images repository URL"
  value       = "${google_artifact_registry_repository.base_images_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.base_images_repo.name}"
}

output "npm_repository_url" {
  description = "NPM repository URL"
  value       = var.create_npm_registry ? "${google_artifact_registry_repository.npm_repo[0].location}-npm.pkg.dev/${var.project_id}/${google_artifact_registry_repository.npm_repo[0].name}" : null
}

output "secure_repository_url" {
  description = "Secure repository URL (production only)"
  value       = var.environment == "production" ? "${google_artifact_registry_repository.secure_repo[0].location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.secure_repo[0].name}" : null
}

# Convenient image paths for CI/CD
output "image_paths" {
  description = "Common image paths for services"
  value = {
    api_gateway   = "${google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.name}/api-gateway"
    content_service = "${google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.name}/content-service"
    campaign_service = "${google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.name}/campaign-service"
    optimization_service = "${google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.name}/optimization-service"
    frontend = "${google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.name}/frontend"
  }
}