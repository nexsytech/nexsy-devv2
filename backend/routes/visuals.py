"""
Visual Library API routes
"""
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.visual_library import VisualLibrary, VisualLibraryService
from middleware.auth import get_current_user_id
from services.storage_service import StorageService

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/visuals", tags=["visuals"])

# Initialize services
visual_service = VisualLibraryService()
storage_service = StorageService()

# Request/Response models
class VisualUpdateRequest(BaseModel):
    title: Optional[str] = None
    associated_creative_output_id: Optional[str] = None
    associated_ad_copy_index: Optional[int] = None
    generated_video_script: Optional[Dict[str, Any]] = None
    preview_image_url: Optional[str] = None

class VisualResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    title: str
    asset_url: str
    media_type: str
    source_type: str
    associated_creative_output_id: Optional[str] = None
    associated_ad_copy_index: Optional[int] = None
    generated_video_script: Optional[Dict[str, Any]] = None
    preview_image_url: Optional[str] = None
    created_at: str

# Routes
@router.get("/{visual_id}", response_model=VisualResponse)
async def get_visual(
    visual_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific visual by ID"""
    try:
        visual = await visual_service.get_visual(user_id=user_id, visual_id=visual_id)
        
        if not visual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visual not found"
            )
        
        return VisualResponse(
            id=visual.id,
            product_id=visual.product_id,
            user_id=visual.user_id,
            title=visual.title,
            asset_url=visual.asset_url,
            media_type=visual.media_type,
            source_type=visual.source_type,
            associated_creative_output_id=visual.associated_creative_output_id,
            associated_ad_copy_index=visual.associated_ad_copy_index,
            generated_video_script=visual.generated_video_script,
            preview_image_url=visual.preview_image_url,
            created_at=visual.created_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting visual {visual_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get visual"
        )

@router.put("/{visual_id}", response_model=VisualResponse)
async def update_visual(
    visual_id: str,
    updates: VisualUpdateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Update a visual entry"""
    try:
        # Filter out None values
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid update data provided"
            )
        
        visual = await visual_service.update_visual(
            user_id=user_id,
            visual_id=visual_id,
            updates=update_data
        )
        
        if not visual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visual not found"
            )
        
        return VisualResponse(
            id=visual.id,
            product_id=visual.product_id,
            user_id=visual.user_id,
            title=visual.title,
            asset_url=visual.asset_url,
            media_type=visual.media_type,
            source_type=visual.source_type,
            associated_creative_output_id=visual.associated_creative_output_id,
            associated_ad_copy_index=visual.associated_ad_copy_index,
            generated_video_script=visual.generated_video_script,
            preview_image_url=visual.preview_image_url,
            created_at=visual.created_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating visual {visual_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update visual"
        )

@router.delete("/{visual_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_visual(
    visual_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a visual entry and its associated file"""
    try:
        # Get visual info first to delete the file
        visual = await visual_service.get_visual(user_id=user_id, visual_id=visual_id)
        
        if not visual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visual not found"
            )
        
        # Delete the visual record from Firestore
        success = await visual_service.delete_visual(user_id=user_id, visual_id=visual_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visual not found"
            )
        
        # Try to delete the file from Cloud Storage
        # Extract file path from URL if it's a signed URL
        file_path = None
        if visual.asset_url:
            if "gs://" in visual.asset_url:
                # Extract path from gs:// URL
                parts = visual.asset_url.replace("gs://", "").split("/", 1)
                if len(parts) > 1:
                    file_path = parts[1]
            elif f"users/{user_id}/" in visual.asset_url:
                # Extract path from signed URL or direct path
                import urllib.parse
                parsed_url = urllib.parse.urlparse(visual.asset_url)
                path_parts = parsed_url.path.split("/")
                for i, part in enumerate(path_parts):
                    if part == "users" and i + 1 < len(path_parts) and path_parts[i + 1] == user_id:
                        file_path = "/".join(path_parts[i:])
                        break
        
        # Delete file if we found a valid path
        if file_path:
            try:
                await storage_service.delete_file(file_path=file_path, user_id=user_id)
                logger.info(f"Deleted file {file_path} for visual {visual_id}")
            except Exception as file_error:
                logger.warning(f"Failed to delete file {file_path} for visual {visual_id}: {str(file_error)}")
                # Don't fail the whole operation if file deletion fails
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting visual {visual_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete visual"
        )

@router.get("", response_model=list[VisualResponse])
async def list_user_visuals(
    media_type: Optional[str] = None,
    limit: int = 100,
    user_id: str = Depends(get_current_user_id)
):
    """List all visuals for the authenticated user"""
    try:
        # Validate media_type if provided
        if media_type and media_type not in ["image", "video"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="media_type must be 'image' or 'video'"
            )
        
        visuals = await visual_service.list_user_visuals(
            user_id=user_id,
            media_type=media_type,
            limit=limit
        )
        
        visual_responses = []
        for visual in visuals:
            visual_responses.append(VisualResponse(
                id=visual.id,
                product_id=visual.product_id,
                user_id=visual.user_id,
                title=visual.title,
                asset_url=visual.asset_url,
                media_type=visual.media_type,
                source_type=visual.source_type,
                associated_creative_output_id=visual.associated_creative_output_id,
                associated_ad_copy_index=visual.associated_ad_copy_index,
                generated_video_script=visual.generated_video_script,
                preview_image_url=visual.preview_image_url,
                created_at=visual.created_at.isoformat()
            ))
        
        return visual_responses
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing visuals: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list visuals"
        )
