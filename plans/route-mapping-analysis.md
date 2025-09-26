# Nexsy V2 Route Mapping Analysis

## Frontend Route Analysis

### Current Base44 Routes

#### Product Management Routes

1. **YourProducts** (`/YourProducts`)
   - **Current Base44 Usage:**
     - `SimplifiedProduct.filter({ created_by: currentUser.email })`
     - `SimplifiedProduct.delete(productId)`
     - `CreativeOutput.filter({ product_id: productId })`
     - `CreativeOutput.delete(creative.id)`
   
   - **New GCP API Mapping:**
     - `GET /api/products` → List user products
     - `DELETE /api/products/{productId}` → Delete product and cascade delete related content

2. **ProductCreativeSetup** (`/ProductCreativeSetup`)
   - **Current Base44 Usage:**
     - `SimplifiedProduct.create(productPayload)`
     - `SimplifiedProduct.update(productId, productPayload)`
     - `SimplifiedProduct.filter({ created_by: currentUser.email })`
     - `VisualLibrary.create({ product_id, asset_url, ... })`
     - `VisualLibrary.filter({ product_id: productId })`
     - `VisualLibrary.delete(visualId)`
     - `UploadFile({ file: file })`
     - `invokeOpenAI({ instructions, prompt, response_json_schema })`
     - `generateMarketingStrategy({ product_id })`
     - `generateAdCopies({ product_id })`
   
   - **New GCP API Mapping:**
     - `POST /api/products` → Create product
     - `PUT /api/products/{productId}` → Update product
     - `GET /api/products` → List user products (for edit mode)
     - `POST /api/products/{productId}/visuals` → Upload visual
     - `GET /api/products/{productId}/visuals` → Get product visuals
     - `DELETE /api/visuals/{visualId}` → Delete visual
     - `POST /api/upload` → File upload
     - `POST /api/products/{productId}/autofill` → AI autofill
     - `POST /api/products/{productId}/marketing-strategy` → Generate strategy
     - `POST /api/products/{productId}/ad-copies` → Generate ad copies

3. **ProductDetails** (`/ProductDetails`)
   - **Current Base44 Usage:**
     - `SimplifiedProduct.filter({ created_by: currentUser.email })`
     - `CreativeOutput.filter({ product_id }, '-generation_timestamp')`
     - `CreativeOutput.create({ product_id, ...aiResponse })`
     - `CreativeOutput.update(creativeOutputId, updatedPayload)`
     - `VisualLibrary.filter({ product_id }, '-created_date')`
     - `VisualLibrary.create({ product_id, asset_url, ... })`
     - `VisualLibrary.delete(visualId)`
     - `MarketingStrategy.filter({ product_id }, '-created_date')`
     - `UploadFile({ file: file })`
     - `invokeOpenAI({ prompt, response_json_schema })`
     - `generateAdCopies({ product_id, tone })`
     - `generateMarketingStrategy({ product_id })`
     - `generateGptImage1({ product_id, creative_output_id, copy_index })`
     - `generateVideoScript({ product_id, creative_output_id, ad_copy_index })`
     - `ugcVideo({ product_id, image_url, video_script, ... })`
   
   - **New GCP API Mapping:**
     - `GET /api/products/{productId}` → Get product details
     - `GET /api/products/{productId}/creative-outputs` → Get all creative outputs
     - `POST /api/products/{productId}/ad-copies` → Generate new ad copies
     - `PUT /api/creative-outputs/{outputId}` → Update ad copies
     - `GET /api/products/{productId}/visuals` → Get product visuals
     - `POST /api/products/{productId}/visuals` → Upload visual
     - `DELETE /api/visuals/{visualId}` → Delete visual
     - `GET /api/products/{productId}/marketing-strategy` → Get marketing strategy
     - `POST /api/products/{productId}/generate-image` → Generate AI image
     - `POST /api/products/{productId}/video-script` → Generate video script
     - `POST /api/products/{productId}/generate-video` → Generate AI video
     - `POST /api/products/{productId}/generate-insights` → Generate initial AI insights

#### Campaign Management Routes

4. **CampaignLauncher** (`/CampaignLauncher`)
   - **Current Base44 Usage:**
     - `SimplifiedProduct.filter({ created_by: currentUser.email })`
     - `CreativeOutput.filter({ product_id })`
     - `VisualLibrary.filter({ product_id })`
     - `ConnectedAccount.filter({ user_id })`
     - `LaunchJob.create({ product_id, campaign_config })`
     - `initiateTikTokAuth({})`
     - `initiateFacebookAuth({})`
     - `createFacebookCampaign({ product_id, campaign_config })`
     - `createFacebookAdSet({ campaign_id, adset_config })`
     - `createFacebookAd({ adset_id, ad_config })`
   
   - **New GCP API Mapping:**
     - `GET /api/products/{productId}` → Get product details
     - `GET /api/products/{productId}/creative-outputs` → Get ad copies
     - `GET /api/products/{productId}/visuals` → Get visuals
     - `GET /api/oauth/connected-accounts` → Get connected accounts
     - `POST /api/campaigns` → Create campaign
     - `POST /api/oauth/tiktok/initiate` → Start TikTok OAuth
     - `POST /api/oauth/facebook/initiate` → Start Facebook OAuth
     - `POST /api/campaigns/{campaignId}/deploy` → Deploy campaign

5. **CampaignStatusTracker** (`/CampaignStatusTracker`)
   - **Current Base44 Usage:**
     - `LaunchJob.filter({ user_id })`
     - Campaign status monitoring functions
   
   - **New GCP API Mapping:**
     - `GET /api/campaigns` → List user campaigns
     - `GET /api/campaigns/{campaignId}` → Get campaign details
     - `GET /api/campaigns/{campaignId}/metrics` → Get campaign metrics

#### OAuth Callback Routes

6. **TikTokCallback** (`/TikTokCallback`)
   - **Current Base44 Usage:**
     - `handleTikTokCallback({ code, state })`
   
   - **New GCP API Mapping:**
     - `POST /api/oauth/tiktok/callback` → Handle TikTok OAuth callback

7. **FacebookCallback** (`/FacebookCallback`)
   - **Current Base44 Usage:**
     - `handleFacebookCallback({ code, state })`
   
   - **New GCP API Mapping:**
     - `POST /api/oauth/facebook/callback` → Handle Facebook OAuth callback

#### User Management Routes

8. **BusinessSetup** (`/BusinessSetup`)
   - **Current Base44 Usage:**
     - `BusinessProfile.create({ user_id, business_data })`
     - `BusinessProfile.update(profileId, business_data)`
   
   - **New GCP API Mapping:**
     - `POST /api/user/business-profile` → Create business profile
     - `PUT /api/user/business-profile` → Update business profile

9. **BusinessProfile** (`/BusinessProfile`)
   - **Current Base44 Usage:**
     - `BusinessProfile.filter({ user_id })`
     - `BusinessProfile.update(profileId, updates)`
   
   - **New GCP API Mapping:**
     - `GET /api/user/business-profile` → Get business profile
     - `PUT /api/user/business-profile` → Update business profile

## API Function Mapping

### Base44 to GCP API Function Mapping

#### Entity Operations

| Base44 Operation | New GCP API Endpoint | HTTP Method | Purpose |
|------------------|---------------------|-------------|---------|
| `SimplifiedProduct.create()` | `/api/products` | POST | Create new product |
| `SimplifiedProduct.filter()` | `/api/products` | GET | List user products |
| `SimplifiedProduct.update()` | `/api/products/{id}` | PUT | Update product |
| `SimplifiedProduct.delete()` | `/api/products/{id}` | DELETE | Delete product |
| `VisualLibrary.create()` | `/api/products/{id}/visuals` | POST | Add product visual |
| `VisualLibrary.filter()` | `/api/products/{id}/visuals` | GET | Get product visuals |
| `VisualLibrary.delete()` | `/api/visuals/{id}` | DELETE | Delete visual |
| `CreativeOutput.create()` | `/api/products/{id}/creative-outputs` | POST | Create creative output |
| `CreativeOutput.filter()` | `/api/products/{id}/creative-outputs` | GET | Get creative outputs |
| `CreativeOutput.update()` | `/api/creative-outputs/{id}` | PUT | Update creative output |
| `MarketingStrategy.filter()` | `/api/products/{id}/marketing-strategy` | GET | Get marketing strategy |
| `ConnectedAccount.filter()` | `/api/oauth/connected-accounts` | GET | Get OAuth accounts |
| `LaunchJob.create()` | `/api/campaigns` | POST | Create campaign |
| `LaunchJob.filter()` | `/api/campaigns` | GET | List campaigns |
| `BusinessProfile.create()` | `/api/user/business-profile` | POST | Create business profile |
| `BusinessProfile.filter()` | `/api/user/business-profile` | GET | Get business profile |
| `BusinessProfile.update()` | `/api/user/business-profile` | PUT | Update business profile |

#### Function Operations

| Base44 Function | New GCP API Endpoint | HTTP Method | Purpose |
|-----------------|---------------------|-------------|---------|
| `invokeOpenAI()` | `/api/ai/openai` | POST | Direct OpenAI API call |
| `generateMarketingStrategy()` | `/api/products/{id}/marketing-strategy` | POST | Generate marketing strategy |
| `generateAdCopies()` | `/api/products/{id}/ad-copies` | POST | Generate ad copies |
| `generateGptImage1()` | `/api/products/{id}/generate-image` | POST | Generate AI image |
| `generateVideoScript()` | `/api/products/{id}/video-script` | POST | Generate video script |
| `ugcVideo()` | `/api/products/{id}/generate-video` | POST | Generate UGC video |
| `initiateTikTokAuth()` | `/api/oauth/tiktok/initiate` | POST | Start TikTok OAuth |
| `handleTikTokCallback()` | `/api/oauth/tiktok/callback` | POST | Handle TikTok callback |
| `initiateFacebookAuth()` | `/api/oauth/facebook/initiate` | POST | Start Facebook OAuth |
| `handleFacebookCallback()` | `/api/oauth/facebook/callback` | POST | Handle Facebook callback |
| `createFacebookCampaign()` | `/api/campaigns/facebook/create` | POST | Create Facebook campaign |
| `createFacebookAdSet()` | `/api/campaigns/facebook/adset` | POST | Create Facebook ad set |
| `createFacebookAd()` | `/api/campaigns/facebook/ad` | POST | Create Facebook ad |
| `UploadFile()` | `/api/upload` | POST | Upload file to GCS |

### Integration Operations

| Base44 Integration | New GCP Service | Purpose |
|-------------------|-----------------|---------|
| `UploadFile()` | Cloud Storage + `/api/upload` | File upload to GCS buckets |
| `InvokeLLM()` | OpenAI API + Cloud Functions | AI content generation |
| `GenerateImage()` | DALL-E API + Cloud Functions | AI image generation |
| Base44 Auth | Firebase Auth | User authentication |
| Base44 Database | Firestore | Data persistence |

## Frontend Component Modifications

### Key Components Requiring Updates

#### 1. API Client Replacement

**File:** `frontend/src/api/base44Client.js`
**Action:** Replace with new GCP API client

```javascript
// OLD: Base44 SDK
import { createClient } from '@base44/sdk';
export const base44 = createClient({
  appId: "686c33f785c9c65f2e6ea751", 
  requiresAuth: true
});

// NEW: GCP API Client
import { createAPIClient } from './nexsyClient.js';
export const nexsyAPI = createAPIClient({
  baseURL: process.env.VITE_API_BASE_URL,
  auth: 'firebase'
});
```

#### 2. Entity Access Patterns

**Files:** All components using Base44 entities
**Action:** Replace entity calls with API calls

```javascript
// OLD: Base44 entity access
const products = await SimplifiedProduct.filter({ created_by: currentUser.email });
const newProduct = await SimplifiedProduct.create(productData);

// NEW: GCP API access
const products = await nexsyAPI.get('/api/products');
const newProduct = await nexsyAPI.post('/api/products', productData);
```

#### 3. File Upload Handling

**Files:** Components with file upload functionality
**Action:** Update upload integration

```javascript
// OLD: Base44 file upload
const { file_url } = await UploadFile({ file: file });

// NEW: GCP file upload
const { fileUrl } = await nexsyAPI.uploadFile(file, { productId });
```

#### 4. AI Function Calls

**Files:** Components using AI generation
**Action:** Replace function calls with API endpoints

```javascript
// OLD: Base44 AI functions
const response = await invokeOpenAI({ prompt, response_json_schema: schema });
const strategy = await generateMarketingStrategy({ product_id });

// NEW: GCP AI endpoints
const response = await nexsyAPI.post('/api/ai/openai', { prompt, schema });
const strategy = await nexsyAPI.post(`/api/products/${productId}/marketing-strategy`);
```

### Authentication Flow Updates

#### Firebase Auth Integration

**Current:** Base44 User entity
**New:** Firebase Auth with custom claims

```javascript
// OLD: Base44 user
const currentUser = await User.me();

// NEW: Firebase auth
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    const idToken = await user.getIdToken();
    nexsyAPI.setAuthToken(idToken);
  }
});
```

## Migration Strategy

### Phase 1: Backend API Development
1. Implement core product CRUD endpoints
2. Add file upload endpoint with GCS integration
3. Create AI content generation endpoints
4. Implement OAuth endpoints for platform integration

### Phase 2: Frontend API Client
1. Create new GCP API client to replace Base44 SDK
2. Implement authentication flow with Firebase
3. Add error handling and retry logic
4. Create TypeScript interfaces for API responses

### Phase 3: Component Migration
1. Update YourProducts component
2. Migrate ProductCreativeSetup component
3. Update ProductDetails component
4. Migrate CampaignLauncher component

### Phase 4: Advanced Features
1. Implement real-time updates for async operations
2. Add campaign status tracking
3. Implement OAuth callback handling
4. Add business profile management

### Phase 5: Testing & Optimization
1. End-to-end testing of all flows
2. Performance optimization
3. Security auditing
4. User acceptance testing

## Data Migration Considerations

### User Data Mapping

| Base44 Data | Firestore Location | Notes |
|-------------|-------------------|-------|
| User profile | `/users/{uid}/profile` | Map from Base44 User to Firebase user |
| Products | `/users/{uid}/products/{productId}` | Maintain product structure |
| Visuals | `/users/{uid}/visuals/{visualId}` | Include productId reference |
| Creative outputs | `/users/{uid}/creativeOutputs/{outputId}` | Preserve ad copy history |
| Marketing strategies | `/users/{uid}/marketingStrategies/{strategyId}` | Include product reference |
| Connected accounts | `/users/{uid}/connectedAccounts/{accountId}` | Encrypt OAuth tokens |
| Campaigns | `/users/{uid}/campaigns/{campaignId}` | Include performance metrics |

### File Migration

| Base44 Files | GCS Location | Notes |
|-------------|--------------|-------|
| Product images | `assets/users/{uid}/products/{productId}/` | Organized by user and product |
| Generated content | `generated/users/{uid}/products/{productId}/` | AI-generated images and videos |
| User uploads | `assets/users/{uid}/uploads/` | General user uploads |

This comprehensive route mapping ensures a seamless migration from Base44 to our GCP-based infrastructure while maintaining all existing functionality and improving scalability.
