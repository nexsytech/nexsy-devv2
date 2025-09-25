# Storage Module Outputs

output "buckets" {
  description = "All bucket information"
  value = {
    assets = {
      name = google_storage_bucket.assets.name
      url  = google_storage_bucket.assets.url
    }
    generated_content = {
      name = google_storage_bucket.generated_content.name
      url  = google_storage_bucket.generated_content.url
    }
    templates = {
      name = google_storage_bucket.templates.name
      url  = google_storage_bucket.templates.url
    }
    reports = {
      name = google_storage_bucket.reports.name
      url  = google_storage_bucket.reports.url
    }
  }
}

output "assets_bucket_name" {
  description = "Assets bucket name"
  value       = google_storage_bucket.assets.name
}

output "assets_bucket_url" {
  description = "Assets bucket URL"
  value       = google_storage_bucket.assets.url
}

output "generated_content_bucket_name" {
  description = "Generated content bucket name"
  value       = google_storage_bucket.generated_content.name
}

output "templates_bucket_name" {
  description = "Templates bucket name"
  value       = google_storage_bucket.templates.name
}

output "reports_bucket_name" {
  description = "Reports bucket name"
  value       = google_storage_bucket.reports.name
}