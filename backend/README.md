# Nexsy Backend API

FastAPI backend with Firebase authentication integration.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up Firebase service account:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key (downloads a JSON file)
   - Copy `env.example` to `.env`
   - Fill in the Firebase service account credentials in `.env`

5. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

Create a `.env` file based on `env.example` with your Firebase service account credentials.

## Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/auth/me` - Get current user info (requires auth)
- `POST /api/auth/verify-token` - Verify Firebase token (requires auth)
- `GET /api/user/profile` - Get user profile (requires auth)

## Authentication

All protected endpoints require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```
