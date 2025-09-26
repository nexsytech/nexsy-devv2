#!/bin/bash

# Script to retrieve secrets from GCP Secret Manager and update .env files
# Project: solid-binder-471905-d6
# Environment: dev

PROJECT_ID="solid-binder-471905-d6"
ENVIRONMENT="dev"
ENV_FILE="/Users/neilbits/projects/nexsy-devv2/.env"

echo "🔑 Retrieving secrets from GCP Secret Manager..."
echo "Project: $PROJECT_ID"
echo "Environment: $ENVIRONMENT"
echo ""

# Function to get secret value
get_secret() {
    local secret_name=$1
    local env_var_name=$2
    
    echo "Retrieving $secret_name..."
    local secret_value=$(gcloud secrets versions access latest --secret="$secret_name" --project="$PROJECT_ID" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$secret_value" ]; then
        echo "✅ Found $secret_name"
        echo "$env_var_name=$secret_value" >> "$ENV_FILE"
    else
        echo "❌ Failed to retrieve $secret_name"
    fi
}

# Backup existing .env file
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📋 Backed up existing .env file"
fi

# Clear existing .env file and add header
cat > "$ENV_FILE" << 'ENV_HEADER'
# Nexsy V2 Environment Variables
# Generated from GCP Secret Manager on $(date)

# =============================================================================
# FIREBASE CONFIGURATION (Frontend & Backend)
# =============================================================================
VITE_FIREBASE_API_KEY=AIzaSyDSc-5WzfXyLMwvEC3_LGinFIJMxnLt_GI
VITE_FIREBASE_AUTH_DOMAIN=nexsy-authv1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nexsy-authv1
VITE_FIREBASE_APP_ID=1:279985944782:web:d5db61f934eee414f8789f

# =============================================================================
# API CONFIGURATION
# =============================================================================
VITE_API_BASE_URL=http://localhost:8000
VITE_ENVIRONMENT=development

# =============================================================================
# GCP CONFIGURATION
# =============================================================================
GCP_PROJECT_ID=solid-binder-471905-d6
ENVIRONMENT=development

# =============================================================================
# SECRETS FROM GCP SECRET MANAGER
# =============================================================================

ENV_HEADER

# Retrieve secrets
get_secret "openai-api-key-$ENVIRONMENT" "OPENAI_API_KEY"
get_secret "freepik-api-key-$ENVIRONMENT" "FREEPIK_API_KEY"
get_secret "facebook-app-id-$ENVIRONMENT" "FACEBOOK_APP_ID"
get_secret "facebook-app-secret-$ENVIRONMENT" "FACEBOOK_APP_SECRET"
get_secret "tiktok-app-id-$ENVIRONMENT" "TIKTOK_APP_ID"
get_secret "tiktok-app-secret-$ENVIRONMENT" "TIKTOK_APP_SECRET"
get_secret "jwt-secret-$ENVIRONMENT" "JWT_SECRET"
get_secret "encryption-key-$ENVIRONMENT" "ENCRYPTION_KEY"
get_secret "webhook-secret-$ENVIRONMENT" "WEBHOOK_SECRET"
get_secret "sendgrid-api-key-$ENVIRONMENT" "SENDGRID_API_KEY"
get_secret "stripe-secret-key-$ENVIRONMENT" "STRIPE_SECRET_KEY"

# Add Firebase service account (if it's a JSON file)
echo ""
echo "Retrieving Firebase service account..."
firebase_sa=$(gcloud secrets versions access latest --secret="firebase-service-account-$ENVIRONMENT" --project="$PROJECT_ID" 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$firebase_sa" ]; then
    echo "✅ Found Firebase service account"
    # Save service account to file
    echo "$firebase_sa" > "/Users/neilbits/projects/nexsy-devv2/firebase-service-account.json"
    echo "GOOGLE_APPLICATION_CREDENTIALS=/Users/neilbits/projects/nexsy-devv2/firebase-service-account.json" >> "$ENV_FILE"
else
    echo "❌ Failed to retrieve Firebase service account"
fi

echo ""
echo "🎉 Secrets retrieval complete!"
echo "📁 Updated .env file: $ENV_FILE"
echo "📁 Firebase service account: /Users/neilbits/projects/nexsy-devv2/firebase-service-account.json"
echo ""
echo "🔍 Summary of retrieved secrets:"
grep -E "^[A-Z_]+=" "$ENV_FILE" | sed 's/=.*/=***HIDDEN***/'
