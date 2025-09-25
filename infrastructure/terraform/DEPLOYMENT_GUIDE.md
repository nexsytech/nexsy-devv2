# Nexsy V2 - Deployment Guide

## Prerequisites

### 1. **Software Requirements**
```bash
# Install Terraform (>= 1.5)
brew install terraform  # macOS
# or download from https://terraform.io/downloads

# Install Google Cloud CLI
brew install google-cloud-sdk  # macOS
# or download from https://cloud.google.com/sdk/docs/install

# Install jq for JSON processing
brew install jq  # macOS

# Verify installations
terraform version
gcloud version
jq --version
```

### 2. **Google Cloud Setup**

#### A. Create GCP Project
```bash
# Option 1: Create via CLI
gcloud projects create nexsy-dev-123456 --name="Nexsy Development"

# Option 2: Create via Console
# Go to https://console.cloud.google.com/projectcreate
```

#### B. Enable Billing
```bash
# List billing accounts
gcloud billing accounts list

# Link billing to project
gcloud billing projects link nexsy-dev-123456 --billing-account=BILLING_ACCOUNT_ID
```

#### C. Set Up Authentication
```bash
# Authenticate with Google Cloud
gcloud auth login

# Set application default credentials
gcloud auth application-default login

# Set default project
gcloud config set project nexsy-dev-123456
```

#### D. Grant Required Permissions
Your user account needs these IAM roles:
- **Project Owner** or **Editor** 
- **Billing Account Administrator** (for budget alerts)
- **Firebase Admin** (for Firebase setup)

```bash
# Check current permissions
gcloud projects get-iam-policy nexsy-dev-123456

# Add permissions if needed (requires Project Owner)
gcloud projects add-iam-policy-binding nexsy-dev-123456 \
    --member="user:your-email@domain.com" \
    --role="roles/editor"
```

### 3. **Configuration Setup**

#### A. Update Project Configuration
Edit `v2/infrastructure/terraform/environments/dev/terraform.tfvars`:

```hcl
# REQUIRED: Update these values
project_id      = "nexsy-dev-123456"        # Your actual project ID
billing_account = "01234D-567890-ABCDEF"    # Your billing account ID
alert_email     = "your-email@domain.com"   # Your email for alerts

# OPTIONAL: Add API keys later
freepik_api_key = ""  # Can be added later via console
openai_api_key  = ""  # Can be added later via console
```

#### B. Get Billing Account ID
```bash
gcloud billing accounts list
# Copy the ACCOUNT_ID from the output
```

## Deployment Steps

### Option 1: Automated Deployment (Recommended)

```bash
# Navigate to terraform directory
cd v2/infrastructure/terraform

# Check prerequisites
./deploy-dev.sh check

# Deploy infrastructure
./deploy-dev.sh deploy
```

### Option 2: Manual Deployment

```bash
# Navigate to dev environment
cd v2/infrastructure/terraform/environments/dev

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply deployment
terraform apply
```

## Deployment Process Details

### Phase 1: Prerequisites Check
- ✅ Terraform installation
- ✅ Google Cloud CLI authentication
- ✅ Project access and permissions
- ✅ Required APIs enabled

### Phase 2: State Management
- Creates encrypted GCS bucket for Terraform state
- Sets up state locking
- Enables state migration to remote backend

### Phase 3: Core Infrastructure
- **Storage**: 4 Cloud Storage buckets
- **Database**: Firestore Native database
- **Authentication**: Firebase Auth setup
- **IAM**: Service accounts and permissions

### Phase 4: Supporting Services
- **Secrets**: Secret Manager for API keys
- **Messaging**: Pub/Sub topics and subscriptions
- **Registry**: Artifact Registry for containers
- **Monitoring**: Alerts, dashboards, and budgets

## Expected Resources Created

### Cloud Storage (4 buckets)
- `nexsy-assets-dev-XXXX` - User uploads and product images
- `nexsy-generated-dev-XXXX` - AI-generated content
- `nexsy-templates-dev-XXXX` - System templates
- `nexsy-reports-dev-XXXX` - Analytics exports

### Firestore
- Native database with indexes
- Located in `us-central`

### Service Accounts (6 accounts)
- `nexsy-api-dev@` - API Gateway operations
- `nexsy-content-dev@` - Content generation
- `nexsy-campaign-dev@` - Campaign management
- `nexsy-optimization-dev@` - Performance optimization
- `nexsy-cicd-dev@` - CI/CD pipeline
- `nexsy-functions-dev@` - Cloud Functions

### Pub/Sub (6 topics + subscriptions)
- Content generation events
- Campaign operations
- Optimization events
- Platform webhooks
- Analytics events
- Dead letter queue

### Secret Manager (11 secrets)
- API keys (Freepik, OpenAI)
- Social media credentials (Facebook, TikTok)
- Security keys (JWT, encryption, webhooks)
- Future integrations (SendGrid, Stripe)

### Monitoring
- Budget alerts ($50/month for dev)
- Error rate and latency alerts
- Custom dashboard
- Email notifications

## Cost Expectations

### Development Environment:
- **Idle**: ~$1.65/month
- **Light usage**: $5-15/month
- **Active development**: $15-30/month

### Cost Breakdown:
- Secret Manager: ~$1.20/month (fixed)
- Storage (empty): ~$0.45/month
- Everything else: Pay-per-use (scales to zero)

## Post-Deployment Steps

### 1. **Add API Keys**
```bash
# Via console: https://console.cloud.google.com/security/secret-manager
# Or via CLI:
echo "your-freepik-key" | gcloud secrets versions add freepik-api-key-dev --data-file=-
echo "your-openai-key" | gcloud secrets versions add openai-api-key-dev --data-file=-
```

### 2. **Verify Deployment**
```bash
# Check created resources
gcloud storage buckets list --filter="name:nexsy"
gcloud firestore databases list
gcloud iam service-accounts list --filter="email:nexsy"
```

### 3. **Access Monitoring**
- Dashboard: Available in Terraform outputs
- Alerts: Configured for your email
- Budgets: Set to $50/month with 80% alert

## Troubleshooting

### Common Issues

#### 1. **API Not Enabled**
```bash
# Enable manually if needed
gcloud services enable SERVICE_NAME.googleapis.com
```

#### 2. **Insufficient Permissions**
```bash
# Check your roles
gcloud projects get-iam-policy PROJECT_ID --flatten="bindings[].members" --filter="bindings.members:user:YOUR_EMAIL"
```

#### 3. **Billing Not Enabled**
```bash
# Check billing status
gcloud billing projects describe PROJECT_ID
```

#### 4. **Resource Already Exists**
```bash
# Import existing resources
terraform import RESOURCE_TYPE.RESOURCE_NAME RESOURCE_ID
```

### Recovery Commands

#### Start Over (if needed)
```bash
# Destroy and redeploy
./deploy-dev.sh destroy
./deploy-dev.sh deploy
```

#### Check What Exists
```bash
# Run the check script from import-existing-resources.tf
gcloud services list --enabled
gsutil ls -p PROJECT_ID
gcloud firestore databases list
```

## Security Notes

- 🔒 All secrets stored in Secret Manager
- 🔒 State file encrypted in GCS
- 🔒 Private buckets with IAM controls
- 🔒 Service accounts with least privilege
- 🔒 Budget alerts prevent runaway costs

## Next Steps

After successful deployment:
1. **Set up CI/CD pipeline** for application deployment
2. **Configure domain and SSL** for frontend
3. **Deploy backend services** to Cloud Run
4. **Set up external API integrations** (Freepik, OpenAI)
5. **Configure social media app credentials**

## Support

If you encounter issues:
1. Check the deployment logs
2. Verify prerequisites are met
3. Review the troubleshooting section
4. Check GCP quotas and limits
5. Ensure billing is properly configured

The deployment script includes detailed error messages and cleanup on failure to help identify and resolve issues quickly.