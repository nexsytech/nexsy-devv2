# Nexsy - AI Marketing Platform

Modern full-stack application with React/Vite frontend and FastAPI backend, featuring Firebase authentication.

## 🏗️ Architecture

- **Frontend**: React + Vite + TailwindCSS + Firebase Auth
- **Backend**: FastAPI + Firebase Admin SDK
- **Authentication**: Firebase Auth (Google + Email/Password)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Firebase project with Authentication enabled

### 1. Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication and configure Google + Email/Password providers
3. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` file in the frontend directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 3. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file in the backend directory using the service account JSON:
```env
VITE_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=from_service_account_json
FIREBASE_PRIVATE_KEY=from_service_account_json
FIREBASE_CLIENT_EMAIL=from_service_account_json
FIREBASE_CLIENT_ID=from_service_account_json
FIREBASE_CLIENT_X509_CERT_URL=from_service_account_json
```

Start the backend:
```bash
python start.py
```

Backend will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

## 📱 Features

### Authentication
- ✅ Email/Password signup and login
- ✅ Google OAuth integration
- ✅ Password reset functionality
- ✅ Protected routes and auth state management
- ⏳ Facebook OAuth (Coming Soon)
- ⏳ Microsoft OAuth (Coming Soon)

### Frontend Pages
- ✅ Landing page with marketing content
- ✅ Login/Signup forms
- ✅ Password reset flow
- ✅ Protected dashboard and application pages
- ✅ All original Nexsy functionality preserved

### Backend API
- ✅ Firebase token verification
- ✅ User profile endpoints
- ✅ Protected API routes
- ✅ CORS configuration for frontend
- ✅ FastAPI automatic documentation

## 🔄 Migration from Base44

This project migrates from Base44 to Firebase + FastAPI while preserving all existing functionality:

- ✅ Authentication migrated to Firebase (Google + Email/Password)
- ✅ Base44 dependencies removed from frontend
- ✅ All UI components and pages preserved
- ✅ API structure updated to FastAPI with Firebase integration
- ✅ Mock implementations for business logic entities (ready for backend implementation)
- ✅ Environment-based configuration
- ✅ Modern development workflow

## 🛠️ Development

### Running Both Services

1. Start backend: `cd backend && python start.py`
2. Start frontend: `cd frontend && npm run dev`
3. Open `http://localhost:5173` in your browser

### Adding New Features

- Frontend components: Add to `frontend/src/components/`
- API endpoints: Add to `backend/main.py` or create new modules
- Authentication: Extend `frontend/src/lib/firebase.js`

## 📝 API Documentation

Visit `http://localhost:8000/docs` when the backend is running for interactive API documentation.

## 🔐 Environment Variables

### Frontend (.env.local)
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (.env)
```env
VITE_FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
FIREBASE_CLIENT_X509_CERT_URL=
```

## 🚨 Troubleshooting

1. **Firebase Auth Errors**: Check Firebase project configuration and API keys
2. **CORS Issues**: Ensure backend CORS settings include your frontend URL
3. **API Connection**: Verify `VITE_API_BASE_URL` points to running backend
4. **Service Account**: Ensure backend `.env` has correct Firebase service account credentials
