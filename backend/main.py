from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
import json
import requests
from typing import Optional
from pydantic import BaseModel

# Load environment variables from parent directory
load_dotenv(dotenv_path="../.env.local")

# Initialize FastAPI app
app = FastAPI(title="Nexsy API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Firebase configuration from existing .env.local
FIREBASE_PROJECT_ID = os.getenv("VITE_FIREBASE_PROJECT_ID", "nexsy-authv1")
FIREBASE_API_KEY = os.getenv("VITE_FIREBASE_API_KEY")

# Firebase REST API endpoints
FIREBASE_VERIFY_TOKEN_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={FIREBASE_API_KEY}"

# Security
security = HTTPBearer()

# Pydantic models
class UserResponse(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    email_verified: bool

class UserProfile(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    created_at: str

# Dependency to verify Firebase token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # Verify the Firebase ID token using REST API
        token = credentials.credentials
        
        # Use Firebase REST API to verify the token
        verify_url = f"https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key={FIREBASE_API_KEY}"
        
        payload = {
            "idToken": token
        }
        
        response = requests.post(verify_url, json=payload)
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        
        data = response.json()
        
        if "users" not in data or len(data["users"]) == 0:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        
        user_data = data["users"][0]
        
        return {
            "uid": user_data.get("localId"),
            "email": user_data.get("email"),
            "email_verified": user_data.get("emailVerified", False),
            "display_name": user_data.get("displayName")
        }
        
    except requests.RequestException as e:
        raise HTTPException(status_code=401, detail="Token verification failed")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

# Routes
@app.get("/")
async def root():
    return {"message": "Nexsy API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "nexsy-api"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        uid=current_user['uid'],
        email=current_user['email'],
        display_name=current_user.get('display_name'),
        email_verified=current_user.get('email_verified', False)
    )

@app.post("/api/auth/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify if the provided token is valid"""
    return {"valid": True, "uid": current_user['uid'], "email": current_user.get('email')}

@app.get("/api/user/profile", response_model=UserProfile)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile information"""
    return UserProfile(
        uid=current_user['uid'],
        email=current_user['email'],
        display_name=current_user.get('display_name'),
        created_at="2024-01-01T00:00:00Z"  # Placeholder since we don't have creation timestamp from REST API
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
