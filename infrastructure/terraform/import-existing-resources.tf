# Import Existing Resources
# This file contains configurations to import existing GCP resources into Terraform state

# Usage:
# 1. If resources already exist, use terraform import commands
# 2. Then apply this configuration to bring them under Terraform management
# 3. Remove this file after successful import

# Example import commands (run these if resources already exist):

# Import existing project services:
# terraform import 'google_project_service.required_apis["cloudbuild.googleapis.com"]' PROJECT_ID/cloudbuild.googleapis.com
# terraform import 'google_project_service.required_apis["run.googleapis.com"]' PROJECT_ID/run.googleapis.com
# terraform import 'google_project_service.required_apis["firestore.googleapis.com"]' PROJECT_ID/firestore.googleapis.com

# Import existing storage buckets:
# terraform import google_storage_bucket.existing_bucket PROJECT_ID/BUCKET_NAME

# Import existing Firestore database:
# terraform import google_firestore_database.database PROJECT_ID/(default)

# Import existing service accounts:
# terraform import google_service_account.existing_sa projects/PROJECT_ID/serviceAccounts/SA_EMAIL

# NOTE: Before importing, make sure the resource configuration matches exactly
# what exists in GCP, or Terraform will try to modify the resource

# Example: Import existing Cloud Storage bucket
# resource "google_storage_bucket" "existing_bucket" {
#   name     = "existing-bucket-name"
#   location = "US"
#   project  = var.project_id
#   
#   # Match exactly what exists in GCP
#   storage_class = "STANDARD"
#   
#   lifecycle {
#     # Prevent accidental changes during import
#     ignore_changes = [
#       storage_class,
#       location,
#       lifecycle_rule
#     ]
#   }
# }

# Script to check for existing resources before applying
# Run this to see what already exists:

# #!/bin/bash
# echo "Checking for existing resources..."
# 
# # Check enabled APIs
# gcloud services list --enabled --project=$PROJECT_ID
# 
# # Check storage buckets  
# gsutil ls -p $PROJECT_ID
# 
# # Check Firestore databases
# gcloud firestore databases list --project=$PROJECT_ID
# 
# # Check service accounts
# gcloud iam service-accounts list --project=$PROJECT_ID
# 
# # Check IAM policies
# gcloud projects get-iam-policy $PROJECT_ID
# 
# echo "Review above resources before running terraform apply"