from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from typing import Optional
from pydantic import BaseModel
import logging

# Load environment variables from parent directory BEFORE importing routes/services
load_dotenv(dotenv_path="../.env")

# Import our new modules
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from middleware.auth import get_current_user, get_current_user_id
from routes import products, upload, visuals, ai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Nexsy API", 
    version="2.0.0",
    description="Nexsy V2 - Product Marketing and Campaign Management API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000",
        "https://nexsy-frontend-dev.web.app",  # Add your deployed frontend URLs
        "https://nexsy-frontend-prod.web.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router)
app.include_router(upload.router)
app.include_router(visuals.router)
app.include_router(ai.router)

# Response models for legacy endpoints
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

# Core routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Nexsy API v2.0 is running", 
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "nexsy-api",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Authentication routes (legacy compatibility)
@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        uid=current_user['uid'],
        email=current_user['email'],
        display_name=current_user.get('name'),
        email_verified=current_user.get('email_verified', False)
    )

@app.post("/api/auth/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify if the provided token is valid"""
    return {
        "valid": True, 
        "uid": current_user['uid'], 
        "email": current_user.get('email'),
        "verified": current_user.get('email_verified', False)
    }

@app.get("/api/user/profile", response_model=UserProfile)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile information"""
    return UserProfile(
        uid=current_user['uid'],
        email=current_user['email'],
        display_name=current_user.get('name'),
        created_at="2024-01-01T00:00:00Z"  # Placeholder since we don't have creation timestamp
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
