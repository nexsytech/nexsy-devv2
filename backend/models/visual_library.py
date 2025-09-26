"""
Visual Library model for Firestore operations
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from google.cloud import firestore
import logging

logger = logging.getLogger(__name__)

class VisualLibrary(BaseModel):
    """Visual Library data model"""
    id: Optional[str] = None
    product_id: str = Field(..., description="Associated product ID")
    user_id: str = Field(..., description="Firebase user ID")
    title: str = Field(..., min_length=1, max_length=200)
    asset_url: str = Field(..., description="GCS URL of the asset")
    media_type: str = Field(..., description="image or video")
    source_type: str = Field(..., description="uploaded, gpt_image_1_generated, freepik_generated")
    
    # Association with creative content
    associated_creative_output_id: Optional[str] = None
    associated_ad_copy_index: Optional[int] = None
    
    # Video-specific metadata
    generated_video_script: Optional[Dict[str, str]] = None
    preview_image_url: Optional[str] = None
    
    # Metadata
    created_at: Optional[datetime] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class VisualLibraryService:
    """Service for Visual Library Firestore operations"""
    
    def __init__(self):
        self.db = firestore.Client()
        self.collection_name = "users"
    
    def _get_user_visuals_ref(self, user_id: str):
        """Get reference to user's visuals subcollection"""
        return self.db.collection(self.collection_name).document(user_id).collection("visuals")
    
    async def create_visual(self, user_id: str, visual_data: Dict[str, Any]) -> VisualLibrary:
        """Create a new visual entry"""
        try:
            # Add metadata
            now = datetime.utcnow()
            visual_data.update({
                "user_id": user_id,
                "created_at": now
            })
            
            # Validate data
            visual = VisualLibrary(**visual_data)
            
            # Create document in Firestore
            visuals_ref = self._get_user_visuals_ref(user_id)
            doc_ref = visuals_ref.document()
            
            # Convert to dict and store
            visual_dict = visual.dict(exclude={"id"})
            doc_ref.set(visual_dict)
            
            # Return visual with ID
            visual.id = doc_ref.id
            
            logger.info(f"Created visual {doc_ref.id} for user {user_id}")
            return visual
            
        except Exception as e:
            logger.error(f"Error creating visual for user {user_id}: {str(e)}")
            raise
    
    async def get_visual(self, user_id: str, visual_id: str) -> Optional[VisualLibrary]:
        """Get a specific visual by ID"""
        try:
            doc_ref = self._get_user_visuals_ref(user_id).document(visual_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            visual_data = doc.to_dict()
            visual_data["id"] = doc.id
            
            return VisualLibrary(**visual_data)
            
        except Exception as e:
            logger.error(f"Error getting visual {visual_id} for user {user_id}: {str(e)}")
            raise
    
    async def list_product_visuals(self, user_id: str, product_id: str, limit: int = 50) -> List[VisualLibrary]:
        """List all visuals for a specific product"""
        try:
            visuals_ref = self._get_user_visuals_ref(user_id)
            docs = (visuals_ref
                   .where("product_id", "==", product_id)
                   .order_by("created_at", direction=firestore.Query.DESCENDING)
                   .limit(limit)
                   .stream())
            
            visuals = []
            for doc in docs:
                visual_data = doc.to_dict()
                visual_data["id"] = doc.id
                visuals.append(VisualLibrary(**visual_data))
            
            logger.info(f"Retrieved {len(visuals)} visuals for product {product_id}")
            return visuals
            
        except Exception as e:
            logger.error(f"Error listing visuals for product {product_id}: {str(e)}")
            raise
    
    async def list_user_visuals(self, user_id: str, media_type: Optional[str] = None, limit: int = 100) -> List[VisualLibrary]:
        """List all visuals for a user, optionally filtered by media type"""
        try:
            visuals_ref = self._get_user_visuals_ref(user_id)
            query = visuals_ref.order_by("created_at", direction=firestore.Query.DESCENDING)
            
            if media_type:
                query = query.where("media_type", "==", media_type)
            
            docs = query.limit(limit).stream()
            
            visuals = []
            for doc in docs:
                visual_data = doc.to_dict()
                visual_data["id"] = doc.id
                visuals.append(VisualLibrary(**visual_data))
            
            logger.info(f"Retrieved {len(visuals)} visuals for user {user_id}")
            return visuals
            
        except Exception as e:
            logger.error(f"Error listing visuals for user {user_id}: {str(e)}")
            raise
    
    async def update_visual(self, user_id: str, visual_id: str, updates: Dict[str, Any]) -> Optional[VisualLibrary]:
        """Update a visual entry"""
        try:
            doc_ref = self._get_user_visuals_ref(user_id).document(visual_id)
            
            # Check if visual exists
            if not doc_ref.get().exists:
                return None
            
            # Update document
            doc_ref.update(updates)
            
            # Return updated visual
            return await self.get_visual(user_id, visual_id)
            
        except Exception as e:
            logger.error(f"Error updating visual {visual_id} for user {user_id}: {str(e)}")
            raise
    
    async def delete_visual(self, user_id: str, visual_id: str) -> bool:
        """Delete a visual entry"""
        try:
            doc_ref = self._get_user_visuals_ref(user_id).document(visual_id)
            
            # Check if visual exists
            if not doc_ref.get().exists:
                return False
            
            # Delete document
            doc_ref.delete()
            
            logger.info(f"Deleted visual {visual_id} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting visual {visual_id} for user {user_id}: {str(e)}")
            raise
    
    async def get_visuals_by_creative_output(self, user_id: str, creative_output_id: str, ad_copy_index: Optional[int] = None) -> List[VisualLibrary]:
        """Get visuals associated with a specific creative output and optionally ad copy index"""
        try:
            visuals_ref = self._get_user_visuals_ref(user_id)
            query = visuals_ref.where("associated_creative_output_id", "==", creative_output_id)
            
            if ad_copy_index is not None:
                query = query.where("associated_ad_copy_index", "==", ad_copy_index)
            
            docs = query.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
            
            visuals = []
            for doc in docs:
                visual_data = doc.to_dict()
                visual_data["id"] = doc.id
                visuals.append(VisualLibrary(**visual_data))
            
            return visuals
            
        except Exception as e:
            logger.error(f"Error getting visuals for creative output {creative_output_id}: {str(e)}")
            raise
