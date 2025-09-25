#!/bin/bash
# Nexsy V2 - Development Environment Deployment Script

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="dev"
PROJECT_ID=""  # Will be set from terraform.tfvars
REGION="us-central1"

echo -e "${BLUE}🚀 Nexsy V2 Development Environment Deployment${NC}"
echo "================================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if terraform is installed
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform >= 1.5"
        exit 1
    fi
    
    # Check terraform version
    TERRAFORM_VERSION=$(terraform version -json | jq -r '.terraform_version')
    print_status "Found Terraform version: $TERRAFORM_VERSION"
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud CLI is not installed. Please install gcloud"
        exit 1
    fi
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Please install jq for JSON processing"
        exit 1
    fi
    
    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        print_error "Please authenticate with Google Cloud: gcloud auth login"
        exit 1
    fi
    
    print_status "✅ All prerequisites met"
}

# Function to read project ID from terraform.tfvars
get_project_id() {
    if [ -f "terraform.tfvars" ]; then
        PROJECT_ID=$(grep '^project_id' terraform.tfvars | cut -d'"' -f2)
        if [ -z "$PROJECT_ID" ]; then
            print_error "project_id not found in terraform.tfvars"
            exit 1
        fi
    else
        print_error "terraform.tfvars not found. Please create it first."
        exit 1
    fi
    print_status "Using project ID: $PROJECT_ID"
}

# Function to check if project exists and user has access
check_project_access() {
    print_status "Checking project access..."
    
    if ! gcloud projects describe "$PROJECT_ID" &> /dev/null; then
        print_error "Cannot access project $PROJECT_ID. Please check:"
        print_error "1. Project exists"
        print_error "2. You have proper permissions"
        print_error "3. Billing is enabled"
        exit 1
    fi
    
    # Set the project for gcloud commands
    gcloud config set project "$PROJECT_ID"
    print_status "✅ Project access confirmed"
}

# Function to enable required APIs
enable_apis() {
    print_status "Enabling required Google Cloud APIs..."
    
    REQUIRED_APIS=(
        "cloudbuild.googleapis.com"
        "run.googleapis.com"
        "firestore.googleapis.com"
        "storage.googleapis.com"
        "firebase.googleapis.com"
        "cloudfunctions.googleapis.com"
        "pubsub.googleapis.com"
        "secretmanager.googleapis.com"
        "artifactregistry.googleapis.com"
        "cloudscheduler.googleapis.com"
        "monitoring.googleapis.com"
        "logging.googleapis.com"
        "iam.googleapis.com"
        "cloudresourcemanager.googleapis.com"
        "identitytoolkit.googleapis.com"
    )
    
    for api in "${REQUIRED_APIS[@]}"; do
        print_status "Enabling $api..."
        gcloud services enable "$api" --project="$PROJECT_ID"
    done
    
    print_status "✅ All APIs enabled"
}

# Function to initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    terraform init
    print_status "✅ Terraform initialized"
}

# Function to create state bucket first
create_state_bucket() {
    print_status "Creating Terraform state bucket..."
    
    # Check if we're using remote backend
    if grep -q "backend \"gcs\"" main.tf; then
        print_warning "Remote backend already configured, skipping state bucket creation"
        return
    fi
    
    # Create state bucket with local state first
    terraform plan -target=google_storage_bucket.terraform_state -out=state-bucket.tfplan
    terraform apply state-bucket.tfplan
    rm -f state-bucket.tfplan
    
    # Get the created bucket name
    STATE_BUCKET=$(terraform output -raw terraform_state_bucket 2>/dev/null || echo "")
    
    if [ -n "$STATE_BUCKET" ]; then
        print_status "✅ State bucket created: $STATE_BUCKET"
        print_warning "To use remote state:"
        print_warning "1. Uncomment the backend block in main.tf"
        print_warning "2. Update bucket name to: $STATE_BUCKET"
        print_warning "3. Run: terraform init -migrate-state"
    fi
}

# Function to plan deployment
plan_deployment() {
    print_status "Planning Terraform deployment..."
    terraform plan -out=dev-deployment.tfplan
    
    echo
    print_warning "⚠️  Review the plan above carefully!"
    read -p "Do you want to proceed with deployment? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        rm -f dev-deployment.tfplan
        exit 0
    fi
}

# Function to apply deployment
apply_deployment() {
    print_status "Applying Terraform deployment..."
    terraform apply dev-deployment.tfplan
    rm -f dev-deployment.tfplan
    print_status "✅ Infrastructure deployed successfully"
}

# Function to display deployment summary
show_summary() {
    print_status "Deployment Summary"
    echo "=================="
    
    # Get outputs
    echo -e "${BLUE}Project Information:${NC}"
    echo "Project ID: $(terraform output -raw project_id)"
    echo "Region: $(terraform output -raw region)"
    echo "Environment: $(terraform output -raw environment)"
    echo
    
    echo -e "${BLUE}Storage:${NC}"
    echo "Assets Bucket: $(terraform output -raw assets_bucket_name)"
    echo
    
    echo -e "${BLUE}Database:${NC}"
    echo "Firestore Database: $(terraform output -raw firestore_database_id)"
    echo
    
    echo -e "${BLUE}Container Registry:${NC}"
    echo "Repository: $(terraform output -raw artifact_registry_repository)"
    echo
    
    echo -e "${BLUE}Monitoring:${NC}"
    echo "Dashboard: $(terraform output -raw monitoring_dashboard_url)"
    echo
    
    print_status "🎉 Development environment is ready!"
    print_status "Next steps:"
    echo "1. Configure API keys in Secret Manager"
    echo "2. Set up CI/CD pipeline"
    echo "3. Deploy application services"
}

# Function to handle errors
cleanup_on_error() {
    print_error "Deployment failed! Cleaning up..."
    rm -f *.tfplan
    exit 1
}

# Set up error handling
trap cleanup_on_error ERR

# Main deployment flow
main() {
    # Change to dev environment directory
    cd "$(dirname "$0")/environments/dev" || exit 1
    
    check_prerequisites
    get_project_id
    check_project_access
    enable_apis
    init_terraform
    create_state_bucket
    plan_deployment
    apply_deployment
    show_summary
}

# Handle command line arguments
case "${1:-deploy}" in
    "check")
        cd "$(dirname "$0")/environments/dev" || exit 1
        check_prerequisites
        get_project_id
        check_project_access
        print_status "✅ All checks passed - ready for deployment"
        ;;
    "plan")
        cd "$(dirname "$0")/environments/dev" || exit 1
        check_prerequisites
        get_project_id
        init_terraform
        terraform plan
        ;;
    "deploy")
        main
        ;;
    "destroy")
        cd "$(dirname "$0")/environments/dev" || exit 1
        print_warning "⚠️  This will destroy ALL infrastructure!"
        read -p "Are you sure you want to destroy the dev environment? (y/N): " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            terraform destroy
            print_status "✅ Development environment destroyed"
        else
            print_status "Destroy cancelled"
        fi
        ;;
    *)
        echo "Usage: $0 [check|plan|deploy|destroy]"
        echo "  check   - Check prerequisites and access"
        echo "  plan    - Show what will be deployed"
        echo "  deploy  - Deploy the infrastructure (default)"
        echo "  destroy - Destroy the infrastructure"
        exit 1
        ;;
esac