"""
File upload API routes
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from pydantic import BaseModel

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from middleware.auth import get_current_user_id
from services.storage_service import StorageService

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["upload"])

# Initialize services
storage_service = StorageService()

# Response models
class FileUploadResponse(BaseModel):
    file_url: str
    file_path: str
    file_name: str
    file_size: int
    content_type: str
    uploaded_at: str

class SignedUrlResponse(BaseModel):
    signed_url: str

# Routes
@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    product_id: Optional[str] = Form(None),
    file_type: str = Form("image", description="Type of file: image, video, document"),
    bucket_type: str = Form("assets", description="Bucket type: assets, generated, templates, reports"),
    user_id: str = Depends(get_current_user_id)
):
    """
    Upload a file to Cloud Storage
    
    - **file**: The file to upload
    - **product_id**: Optional product ID for organizing files
    - **file_type**: Type of file (image, video, document)
    - **bucket_type**: Type of bucket (assets, generated, templates, reports)
    """
    try:
        # Validate file_type
        valid_file_types = ["image", "video", "document"]
        if file_type not in valid_file_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file_type. Must be one of: {', '.join(valid_file_types)}"
            )
        
        # Validate bucket_type
        valid_bucket_types = ["assets", "generated", "templates", "reports"]
        if bucket_type not in valid_bucket_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid bucket_type. Must be one of: {', '.join(valid_bucket_types)}"
            )
        
        # Upload file
        file_info = await storage_service.upload_file(
            file=file,
            user_id=user_id,
            file_type=file_type,
            product_id=product_id,
            bucket_type=bucket_type
        )
        
        # Return the public_url from storage service (handles signing vs gs:// internally)
        return FileUploadResponse(
            file_url=file_info["public_url"],
            file_path=file_info["file_path"],
            file_name=file_info["file_name"],
            file_size=file_info["file_size"],
            content_type=file_info["content_type"],
            uploaded_at=file_info["uploaded_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file"
        )

@router.post("/files/signed-url", response_model=SignedUrlResponse)
async def generate_signed_url(
    file_path: str,
    expiration_hours: int = 24,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate a signed URL for secure file access
    
    - **file_path**: Path to the file in Cloud Storage
    - **expiration_hours**: Hours until the URL expires (default: 24)
    """
    try:
        if expiration_hours < 1 or expiration_hours > 168:  # Max 1 week
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expiration hours must be between 1 and 168 (1 week)"
            )
        
        signed_url = await storage_service.generate_signed_url(
            file_path=file_path,
            user_id=user_id,
            expiration_hours=expiration_hours
        )
        
        return SignedUrlResponse(signed_url=signed_url)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating signed URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate signed URL"
        )

@router.delete("/files")
async def delete_file(
    file_path: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete a file from Cloud Storage
    
    - **file_path**: Path to the file in Cloud Storage
    """
    try:
        success = await storage_service.delete_file(
            file_path=file_path,
            user_id=user_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        return {"message": "File deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file"
        )

@router.get("/files")
async def list_user_files(
    bucket_type: str = "assets",
    prefix: str = "",
    limit: int = 100,
    user_id: str = Depends(get_current_user_id)
):
    """
    List files for the authenticated user
    
    - **bucket_type**: Type of bucket to search (assets, generated, templates, reports)
    - **prefix**: Additional prefix to filter files
    - **limit**: Maximum number of files to return (max: 1000)
    """
    try:
        # Validate bucket_type
        valid_bucket_types = ["assets", "generated", "templates", "reports"]
        if bucket_type not in valid_bucket_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid bucket_type. Must be one of: {', '.join(valid_bucket_types)}"
            )
        
        # Validate limit
        if limit < 1 or limit > 1000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Limit must be between 1 and 1000"
            )
        
        files = await storage_service.list_user_files(
            user_id=user_id,
            bucket_type=bucket_type,
            prefix=prefix,
            limit=limit
        )
        
        return {"files": files}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing files: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list files"
        )
