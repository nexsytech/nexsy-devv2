# Database Module Outputs

output "database_id" {
  description = "Firestore database ID"
  value       = google_firestore_database.database.name
}

output "database_location" {
  description = "Firestore database location"
  value       = google_firestore_database.database.location_id
}

output "database_type" {
  description = "Firestore database type"
  value       = google_firestore_database.database.type
}