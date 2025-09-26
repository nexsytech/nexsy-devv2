"""
Authentication middleware for Firebase ID token verification
"""
import logging
from functools import wraps
from typing import Optional
from fastapi import HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
import os

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    try:
        # Check if we have a service account key file
        service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if service_account_path and os.path.exists(service_account_path):
            logger.info(f"Using service account from {service_account_path}")
            cred = credentials.Certificate(service_account_path)
        else:
            # Try to use Application Default Credentials
            logger.info("Using Application Default Credentials")
            cred = credentials.ApplicationDefault()
        
        firebase_admin.initialize_app(cred, {
            'projectId': os.getenv('VITE_FIREBASE_PROJECT_ID', 'nexsy-authv1')
        })
        logger.info("Firebase Admin SDK initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        # Initialize with minimal config for development
        firebase_admin.initialize_app(options={
            'projectId': os.getenv('VITE_FIREBASE_PROJECT_ID', 'nexsy-authv1')
        })
        logger.warning("Firebase Admin SDK initialized with minimal config")

# Security scheme for FastAPI
security = HTTPBearer()

class AuthMiddleware:
    """Authentication middleware for Firebase ID token verification"""
    
    @staticmethod
    async def verify_firebase_token(credentials: HTTPAuthorizationCredentials) -> dict:
        """
        Verify Firebase ID token and return user information
        
        Args:
            credentials: HTTP authorization credentials containing the Bearer token
            
        Returns:
            dict: User information from Firebase token
            
        Raises:
            HTTPException: If token is invalid or verification fails
        """
        try:
            if not credentials or not credentials.credentials:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No authentication token provided",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            token = credentials.credentials
            
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(token)
            
            # Extract user information
            user_info = {
                "uid": decoded_token.get("uid"),
                "email": decoded_token.get("email"),
                "email_verified": decoded_token.get("email_verified", False),
                "name": decoded_token.get("name"),
                "picture": decoded_token.get("picture"),
                "firebase_claims": decoded_token
            }
            
            logger.info(f"Successfully verified token for user {user_info['uid']}")
            return user_info
            
        except auth.InvalidIdTokenError as e:
            logger.warning(f"Invalid Firebase ID token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except auth.ExpiredIdTokenError as e:
            logger.warning(f"Expired Firebase ID token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
        """
        FastAPI dependency to get current authenticated user
        
        Args:
            credentials: HTTP authorization credentials (injected by FastAPI)
            
        Returns:
            dict: Current user information
        """
        return await AuthMiddleware.verify_firebase_token(credentials)
    
    @staticmethod
    async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
        """
        FastAPI dependency to get current user ID
        
        Args:
            credentials: HTTP authorization credentials (injected by FastAPI)
            
        Returns:
            str: Current user's Firebase UID
        """
        user_info = await AuthMiddleware.verify_firebase_token(credentials)
        return user_info["uid"]

def require_auth(func):
    """
    Decorator to require authentication for a function
    
    Args:
        func: Function to decorate
        
    Returns:
        Decorated function that requires authentication
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # This decorator is mainly for documentation
        # Actual auth is handled by FastAPI dependencies
        return await func(*args, **kwargs)
    
    return wrapper

class UserIsolationMiddleware:
    """Middleware to ensure user data isolation"""
    
    @staticmethod
    def ensure_user_access(user_id: str, resource_user_id: str) -> None:
        """
        Ensure the authenticated user can only access their own resources
        
        Args:
            user_id: ID of the authenticated user
            resource_user_id: User ID associated with the resource being accessed
            
        Raises:
            HTTPException: If user is trying to access another user's resources
        """
        if user_id != resource_user_id:
            logger.warning(f"User {user_id} attempted to access resources of user {resource_user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only access your own resources"
            )
    
    @staticmethod
    def validate_user_scope(user_id: str, resource_path: str) -> None:
        """
        Validate that a resource path belongs to the authenticated user
        
        Args:
            user_id: ID of the authenticated user
            resource_path: Path to the resource (e.g., file path, URL)
            
        Raises:
            HTTPException: If resource path doesn't belong to the user
        """
        if f"users/{user_id}/" not in resource_path:
            logger.warning(f"User {user_id} attempted to access resource outside their scope: {resource_path}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Resource is outside your scope"
            )

# FastAPI dependencies for easy use in routes
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """FastAPI dependency to get current user"""
    return await AuthMiddleware.verify_firebase_token(credentials)

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """FastAPI dependency to get current user ID"""
    user_info = await AuthMiddleware.verify_firebase_token(credentials)
    return user_info["uid"]

def ensure_user_owns_resource(user_id: str, resource_user_id: str) -> None:
    """Utility function to ensure user owns the resource"""
    UserIsolationMiddleware.ensure_user_access(user_id, resource_user_id)
