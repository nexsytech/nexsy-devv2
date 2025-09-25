# Backend Configuration for Remote State
# This file should be uncommented after the state bucket is created

# Step 1: Run terraform-state-setup.tf first with local backend
# Step 2: Note the output bucket name
# Step 3: Uncomment the terraform block below and update bucket name
# Step 4: Run: terraform init -migrate-state

# terraform {
#   backend "gcs" {
#     bucket  = "YOUR_PROJECT_ID-terraform-state-SUFFIX"
#     prefix  = "terraform/state"
#     
#     # Optional: Enable state locking
#     # This requires Cloud Storage JSON API to be enabled
#   }
# }

# Alternative: Environment-specific backends
# Use this pattern for multiple environments

# terraform {
#   backend "gcs" {
#     bucket  = "nexsy-terraform-state-dev-SUFFIX"
#     prefix  = "environments/dev"
#   }
# }

# terraform {
#   backend "gcs" {
#     bucket  = "nexsy-terraform-state-staging-SUFFIX"  
#     prefix  = "environments/staging"
#   }
# }

# terraform {
#   backend "gcs" {
#     bucket  = "nexsy-terraform-state-production-SUFFIX"
#     prefix  = "environments/production"
#   }
# }