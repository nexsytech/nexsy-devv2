# Nexsy V2 Technical Specifications

## API Endpoints Specification

### Products API

#### Core Product Management

```http
POST /api/products
Content-Type: application/json
Authorization: Bearer {firebase_token}

{
  "productName": "string",
  "whatIsIt": "string", 
  "price": number,
  "currency": "string",
  "targetCountry": "string",
  "targetCountryCode": "string",
  "mainGoal": "string",
  "productImageUrl": "string",
  "productLink": "string",
  "productDescription": "string",
  "problemItSolves": "string",
  "targetCustomers": "string"
}

Response: 201 Created
{
  "id": "string",
  "userId": "string",
  "productName": "string",
  "setupCompleted": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

```http
GET /api/products
Authorization: Bearer {firebase_token}

Response: 200 OK
{
  "products": [
    {
      "id": "string",
      "productName": "string",
      "whatIsIt": "string",
      "price": number,
      "currency": "string",
      "productImageUrl": "string",
      "setupCompleted": boolean,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

```http
GET /api/products/{productId}
Authorization: Bearer {firebase_token}

Response: 200 OK
{
  "id": "string",
  "userId": "string",
  "productName": "string",
  "whatIsIt": "string",
  "price": number,
  "currency": "string",
  "targetCountry": "string",
  "targetCountryCode": "string",
  "mainGoal": "string",
  "productImageUrl": "string",
  "productLink": "string",
  "productDescription": "string",
  "problemItSolves": "string",
  "targetCustomers": "string",
  "setupCompleted": boolean,
  "aiAnalysisSummary": "string",
  "aiTargetAudienceProfile": "string",
  "aiKeySellingPoints": ["string"],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### AI Content Generation

```http
POST /api/products/{productId}/autofill
Authorization: Bearer {firebase_token}

{
  "productName": "string",
  "whatIsIt": "string",
  "price": number,
  "targetCountry": "string"
}

Response: 200 OK
{
  "productDescription": "string",
  "problemItSolves": "string",
  "targetCustomers": "string"
}
```

```http
POST /api/products/{productId}/generate-insights
Authorization: Bearer {firebase_token}

Response: 202 Accepted
{
  "taskId": "string",
  "status": "processing",
  "estimatedCompletionTime": "2024-01-01T00:01:00Z"
}
```

```http
POST /api/products/{productId}/marketing-strategy
Authorization: Bearer {firebase_token}

Response: 202 Accepted
{
  "taskId": "string",
  "status": "processing"
}
```

```http
POST /api/products/{productId}/ad-copies
Authorization: Bearer {firebase_token}

{
  "tone": "friendly|professional|fun|urgent|luxury"
}

Response: 202 Accepted
{
  "taskId": "string",
  "status": "processing"
}
```

### Visual Library API

```http
GET /api/products/{productId}/visuals
Authorization: Bearer {firebase_token}

Response: 200 OK
{
  "visuals": [
    {
      "id": "string",
      "productId": "string",
      "title": "string",
      "assetUrl": "string",
      "mediaType": "image|video",
      "sourceType": "uploaded|gpt_image_1_generated|freepik_generated",
      "associatedCreativeOutputId": "string",
      "associatedAdCopyIndex": number,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

```http
POST /api/products/{productId}/visuals
Authorization: Bearer {firebase_token}
Content-Type: multipart/form-data

file: binary
title: string (optional)

Response: 201 Created
{
  "id": "string",
  "productId": "string",
  "title": "string",
  "assetUrl": "string",
  "mediaType": "image|video",
  "sourceType": "uploaded"
}
```

```http
DELETE /api/visuals/{visualId}
Authorization: Bearer {firebase_token}

Response: 204 No Content
```

#### AI Visual Generation

```http
POST /api/products/{productId}/generate-image
Authorization: Bearer {firebase_token}

{
  "creativeOutputId": "string",
  "adCopyIndex": number
}

Response: 202 Accepted
{
  "taskId": "string",
  "status": "processing"
}
```

```http
POST /api/products/{productId}/video-script
Authorization: Bearer {firebase_token}

{
  "creativeOutputId": "string",
  "adCopyIndex": number
}

Response: 200 OK
{
  "script": {
    "hookLine": "string",
    "bodyLines": "string", 
    "bridgeLine": "string",
    "ctaLine": "string",
    "onScreenText": "string",
    "visualDirection": "string"
  }
}
```

```http
POST /api/products/{productId}/generate-video
Authorization: Bearer {firebase_token}

{
  "imageUrl": "string",
  "videoScript": {
    "hookLine": "string",
    "bodyLines": "string",
    "bridgeLine": "string", 
    "ctaLine": "string",
    "onScreenText": "string",
    "visualDirection": "string"
  },
  "creativeOutputId": "string",
  "adCopyIndex": number
}

Response: 202 Accepted
{
  "taskId": "string",
  "status": "processing"
}
```

### Creative Output API

```http
GET /api/products/{productId}/creative-outputs
Authorization: Bearer {firebase_token}

Response: 200 OK
{
  "creativeOutputs": [
    {
      "id": "string",
      "productId": "string",
      "creativeConcepTitle": "string",
      "creativeConcepDescription": "string",
      "targetAudienceSummary": "string",
      "whyThisWorks": "string",
      "adCopies": [
        {
          "variationName": "string",
          "headline": "string",
          "bodyText": "string",
          "callToAction": "string",
          "platformOptimized": "string",
          "offerValueProposition": "string"
        }
      ],
      "generationTimestamp": "2024-01-01T00:00:00Z",
      "tone": "string"
    }
  ]
}
```

```http
PUT /api/creative-outputs/{outputId}
Authorization: Bearer {firebase_token}

{
  "adCopies": [
    {
      "variationName": "string",
      "headline": "string",
      "bodyText": "string",
      "callToAction": "string",
      "platformOptimized": "string",
      "offerValueProposition": "string"
    }
  ]
}

Response: 200 OK
```

### Marketing Strategy API

```http
GET /api/products/{productId}/marketing-strategy
Authorization: Bearer {firebase_token}

Response: 200 OK
{
  "id": "string",
  "productId": "string",
  "productInfopack": {
    "customerAvatars": [
      {
        "label": "string",
        "description": "string"
      }
    ]
  },
  "creativeBrief": {
    "creativeAngle": "string",
    "visualStyleArtDirection": "string"
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### File Upload API

```http
POST /api/upload
Authorization: Bearer {firebase_token}
Content-Type: multipart/form-data

file: binary
productId: string (optional)
fileType: "product_image|generated_content|template"

Response: 201 Created
{
  "fileUrl": "string",
  "fileName": "string",
  "fileSize": number,
  "mimeType": "string",
  "uploadedAt": "2024-01-01T00:00:00Z"
}
```

### Task Status API

```http
GET /api/tasks/{taskId}
Authorization: Bearer {firebase_token}

Response: 200 OK
{
  "taskId": "string",
  "status": "pending|processing|completed|failed",
  "progress": number,
  "result": object,
  "error": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "completedAt": "2024-01-01T00:00:00Z"
}
```

## Database Schema

### Firestore Collections

#### Users Collection
```
/users/{userId}
{
  profile: {
    email: string,
    displayName: string,
    businessName: string,
    businessType: string,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
```

#### Products Collection
```
/users/{userId}/products/{productId}
{
  // Core product data
  productName: string,
  whatIsIt: string,
  price: number,
  currency: string,
  targetCountry: string,
  targetCountryCode: string,
  mainGoal: string,
  productImageUrl: string,
  productLink: string,
  productDescription: string,
  problemItSolves: string,
  targetCustomers: string,
  
  // AI-generated insights
  setupCompleted: boolean,
  aiAnalysisSummary: string,
  aiTargetAudienceProfile: string,
  aiKeySellingPoints: array,
  
  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Visual Library Collection
```
/users/{userId}/visuals/{visualId}
{
  productId: string,
  title: string,
  assetUrl: string,
  mediaType: string, // "image" | "video"
  sourceType: string, // "uploaded" | "gpt_image_1_generated" | "freepik_generated"
  
  // Association with creative content
  associatedCreativeOutputId: string | null,
  associatedAdCopyIndex: number | null,
  
  // Video-specific metadata
  generatedVideoScript: object | null,
  previewImageUrl: string | null,
  
  createdAt: timestamp
}
```

#### Creative Outputs Collection
```
/users/{userId}/creativeOutputs/{outputId}
{
  productId: string,
  creativeConcepTitle: string,
  creativeConcepDescription: string,
  targetAudienceSummary: string,
  whyThisWorks: string,
  
  adCopies: [
    {
      variationName: string,
      headline: string,
      bodyText: string,
      callToAction: string,
      platformOptimized: string,
      offerValueProposition: string | null
    }
  ],
  
  generationTimestamp: timestamp,
  tone: string | null
}
```

#### Marketing Strategy Collection
```
/users/{userId}/marketingStrategies/{strategyId}
{
  productId: string,
  
  productInfopack: {
    customerAvatars: [
      {
        label: string,
        description: string
      }
    ]
  },
  
  creativeBrief: {
    creativeAngle: string,
    visualStyleArtDirection: string
  },
  
  openaiResponseId: string,
  createdAt: timestamp
}
```

#### Connected Accounts Collection
```
/users/{userId}/connectedAccounts/{accountId}
{
  platform: string, // "tiktok" | "facebook"
  accessToken: string, // encrypted
  refreshToken: string, // encrypted
  expiresAt: timestamp,
  accountInfo: object,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Campaigns Collection
```
/users/{userId}/campaigns/{campaignId}
{
  productId: string,
  platform: string,
  campaignName: string,
  status: string,
  
  // Platform-specific data
  platformCampaignId: string,
  platformAdSetId: string,
  platformAdId: string,
  
  // Campaign configuration
  budget: number,
  targetAudience: object,
  schedule: object,
  
  // Performance metrics
  metrics: {
    impressions: number,
    clicks: number,
    conversions: number,
    cost: number,
    lastUpdated: timestamp
  },
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Tasks Collection
```
/users/{userId}/tasks/{taskId}
{
  taskType: string,
  status: string, // "pending" | "processing" | "completed" | "failed"
  progress: number,
  
  // Input parameters
  parameters: object,
  
  // Results
  result: object | null,
  error: string | null,
  
  // Metadata
  createdAt: timestamp,
  startedAt: timestamp | null,
  completedAt: timestamp | null
}
```

### Firestore Indexes

```javascript
// Composite indexes for efficient querying
{
  collectionGroup: "products",
  fieldPath: ["userId", "createdAt"],
  order: "DESCENDING"
}

{
  collectionGroup: "visuals", 
  fieldPath: ["userId", "productId", "createdAt"],
  order: "DESCENDING"
}

{
  collectionGroup: "creativeOutputs",
  fieldPath: ["userId", "productId", "generationTimestamp"], 
  order: "DESCENDING"
}

{
  collectionGroup: "campaigns",
  fieldPath: ["userId", "status", "createdAt"],
  order: "DESCENDING"
}

{
  collectionGroup: "tasks",
  fieldPath: ["userId", "status", "createdAt"],
  order: "DESCENDING"
}
```

## Cloud Storage Structure

### Bucket Organization

#### Assets Bucket (nexsy-assets-{env})
```
/users/{userId}/products/{productId}/
  ├── images/
  │   ├── product-image-001.jpg
  │   ├── additional-001.jpg
  │   └── additional-002.jpg
  ├── videos/
  │   ├── product-demo-001.mp4
  │   └── user-generated-001.mp4
  └── documents/
      └── product-spec.pdf
```

#### Generated Content Bucket (nexsy-generated-{env})
```
/users/{userId}/products/{productId}/
  ├── images/
  │   ├── ai-generated-001-{timestamp}.png
  │   ├── ai-generated-002-{timestamp}.png
  │   └── variations/
  │       ├── variation-001-{timestamp}.png
  │       └── variation-002-{timestamp}.png
  ├── videos/
  │   ├── ugc-video-001-{timestamp}.mp4
  │   ├── ugc-video-002-{timestamp}.mp4
  │   └── previews/
  │       ├── preview-001-{timestamp}.jpg
  │       └── preview-002-{timestamp}.jpg
  └── scripts/
      ├── script-001-{timestamp}.json
      └── script-002-{timestamp}.json
```

#### Templates Bucket (nexsy-templates-{env})
```
/video-templates/
  ├── ugc-template-001/
  │   ├── template.json
  │   ├── assets/
  │   └── preview.jpg
  └── ugc-template-002/
      ├── template.json
      ├── assets/
      └── preview.jpg

/image-templates/
  ├── ad-template-001/
  │   ├── template.json
  │   └── preview.jpg
  └── ad-template-002/
      ├── template.json
      └── preview.jpg
```

#### Reports Bucket (nexsy-reports-{env})
```
/users/{userId}/
  ├── analytics/
  │   ├── monthly-report-{year}-{month}.pdf
  │   └── campaign-performance-{campaign-id}.json
  └── exports/
      ├── products-export-{timestamp}.csv
      └── campaigns-export-{timestamp}.csv
```

## Pub/Sub Message Schemas

### Content Generation Topic

#### Generate Marketing Strategy
```json
{
  "messageType": "generate_marketing_strategy",
  "userId": "string",
  "productId": "string", 
  "taskId": "string",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Generate Ad Copies
```json
{
  "messageType": "generate_ad_copies",
  "userId": "string",
  "productId": "string",
  "taskId": "string",
  "parameters": {
    "tone": "string"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Generate Image
```json
{
  "messageType": "generate_image",
  "userId": "string",
  "productId": "string",
  "taskId": "string",
  "parameters": {
    "creativeOutputId": "string",
    "adCopyIndex": number
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Generate Video
```json
{
  "messageType": "generate_video",
  "userId": "string", 
  "productId": "string",
  "taskId": "string",
  "parameters": {
    "imageUrl": "string",
    "videoScript": {
      "hookLine": "string",
      "bodyLines": "string",
      "bridgeLine": "string",
      "ctaLine": "string",
      "onScreenText": "string",
      "visualDirection": "string"
    },
    "creativeOutputId": "string",
    "adCopyIndex": number
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Campaign Operations Topic

#### Create Campaign
```json
{
  "messageType": "create_campaign",
  "userId": "string",
  "productId": "string",
  "taskId": "string",
  "parameters": {
    "platform": "tiktok|facebook",
    "campaignConfig": {
      "budget": number,
      "audience": object,
      "schedule": object,
      "adCreatives": ["string"]
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Platform Webhooks Topic

#### Campaign Status Update
```json
{
  "messageType": "campaign_status_update",
  "platform": "tiktok|facebook",
  "campaignId": "string",
  "status": "string",
  "metrics": {
    "impressions": number,
    "clicks": number,
    "conversions": number,
    "cost": number
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Security Specifications

### Firebase Authentication Integration
- Use Firebase ID tokens for all API authentication
- Verify tokens on every request
- Extract user ID from verified token
- Scope all database operations to authenticated user

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Additional validation for specific collections
    match /users/{userId}/products/{productId} {
      allow create: if request.auth != null 
        && request.auth.uid == userId
        && validateProductData(request.resource.data);
      allow update: if request.auth != null 
        && request.auth.uid == userId
        && validateProductData(request.resource.data);
    }
  }
}

function validateProductData(data) {
  return data.keys().hasAll(['productName', 'price', 'currency'])
    && data.productName is string
    && data.productName.size() > 0
    && data.price is number
    && data.price > 0;
}
```

### Cloud Storage Security
- All file paths must include user ID prefix
- Generate signed URLs for secure file access
- Validate file ownership before operations
- Implement file type and size restrictions

### API Input Validation
- Validate all request parameters
- Sanitize user inputs
- Check file upload restrictions
- Rate limiting per user
- CORS configuration for frontend domains

This technical specification provides the detailed implementation guidance needed to build the Nexsy V2 product functionality with proper user isolation and security.
