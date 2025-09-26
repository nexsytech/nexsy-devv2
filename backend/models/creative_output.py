"""
Creative Output model for Firestore operations
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from google.cloud import firestore
import logging

logger = logging.getLogger(__name__)

class AdCopy(BaseModel):
    """Individual ad copy model"""
    variation_name: str = Field(..., min_length=1)
    headline: str = Field(..., min_length=1)
    body_text: str = Field(..., min_length=1)
    call_to_action: str = Field(..., min_length=1)
    platform_optimized: str = Field(default="universal")
    offer_value_proposition: Optional[str] = None

class CreativeOutput(BaseModel):
    """Creative Output data model"""
    id: Optional[str] = None
    product_id: str = Field(..., description="Associated product ID")
    user_id: str = Field(..., description="Firebase user ID")
    creative_concept_title: str = Field(..., min_length=1)
    creative_concept_description: str = Field(..., min_length=1)
    target_audience_summary: str = Field(..., min_length=1)
    why_this_works: str = Field(..., min_length=1)
    
    ad_copies: List[AdCopy] = Field(..., min_items=1)
    
    generation_timestamp: Optional[datetime] = None
    tone: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CreativeOutputService:
    """Service for Creative Output Firestore operations"""
    
    def __init__(self):
        self.db = firestore.Client()
        self.collection_name = "users"
    
    def _get_user_outputs_ref(self, user_id: str):
        """Get reference to user's creative outputs subcollection"""
        return self.db.collection(self.collection_name).document(user_id).collection("creativeOutputs")
    
    async def create_creative_output(self, user_id: str, output_data: Dict[str, Any]) -> CreativeOutput:
        """Create a new creative output"""
        try:
            # Add metadata
            now = datetime.utcnow()
            output_data.update({
                "user_id": user_id,
                "generation_timestamp": now
            })
            
            # Validate data
            creative_output = CreativeOutput(**output_data)
            
            # Create document in Firestore
            outputs_ref = self._get_user_outputs_ref(user_id)
            doc_ref = outputs_ref.document()
            
            # Convert to dict and store
            output_dict = creative_output.dict(exclude={"id"})
            doc_ref.set(output_dict)
            
            # Return output with ID
            creative_output.id = doc_ref.id
            
            logger.info(f"Created creative output {doc_ref.id} for user {user_id}")
            return creative_output
            
        except Exception as e:
            logger.error(f"Error creating creative output for user {user_id}: {str(e)}")
            raise
    
    async def get_creative_output(self, user_id: str, output_id: str) -> Optional[CreativeOutput]:
        """Get a specific creative output by ID"""
        try:
            doc_ref = self._get_user_outputs_ref(user_id).document(output_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            output_data = doc.to_dict()
            output_data["id"] = doc.id
            
            return CreativeOutput(**output_data)
            
        except Exception as e:
            logger.error(f"Error getting creative output {output_id} for user {user_id}: {str(e)}")
            raise
    
    async def list_product_outputs(self, user_id: str, product_id: str, limit: int = 50) -> List[CreativeOutput]:
        """List all creative outputs for a specific product"""
        try:
            outputs_ref = self._get_user_outputs_ref(user_id)
            docs = (outputs_ref
                   .where("product_id", "==", product_id)
                   .order_by("generation_timestamp", direction=firestore.Query.DESCENDING)
                   .limit(limit)
                   .stream())
            
            outputs = []
            for doc in docs:
                output_data = doc.to_dict()
                output_data["id"] = doc.id
                outputs.append(CreativeOutput(**output_data))
            
            logger.info(f"Retrieved {len(outputs)} creative outputs for product {product_id}")
            return outputs
            
        except Exception as e:
            logger.error(f"Error listing creative outputs for product {product_id}: {str(e)}")
            raise
    
    async def get_latest_output(self, user_id: str, product_id: str) -> Optional[CreativeOutput]:
        """Get the most recent creative output for a product"""
        try:
            outputs_ref = self._get_user_outputs_ref(user_id)
            docs = (outputs_ref
                   .where("product_id", "==", product_id)
                   .order_by("generation_timestamp", direction=firestore.Query.DESCENDING)
                   .limit(1)
                   .stream())
            
            for doc in docs:
                output_data = doc.to_dict()
                output_data["id"] = doc.id
                return CreativeOutput(**output_data)
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting latest output for product {product_id}: {str(e)}")
            raise
    
    async def update_creative_output(self, user_id: str, output_id: str, updates: Dict[str, Any]) -> Optional[CreativeOutput]:
        """Update a creative output"""
        try:
            doc_ref = self._get_user_outputs_ref(user_id).document(output_id)
            
            # Check if output exists
            if not doc_ref.get().exists:
                return None
            
            # Update document
            doc_ref.update(updates)
            
            # Return updated output
            return await self.get_creative_output(user_id, output_id)
            
        except Exception as e:
            logger.error(f"Error updating creative output {output_id} for user {user_id}: {str(e)}")
            raise
    
    async def delete_creative_output(self, user_id: str, output_id: str) -> bool:
        """Delete a creative output"""
        try:
            doc_ref = self._get_user_outputs_ref(user_id).document(output_id)
            
            # Check if output exists
            if not doc_ref.get().exists:
                return False
            
            # Delete document
            doc_ref.delete()
            
            logger.info(f"Deleted creative output {output_id} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting creative output {output_id} for user {user_id}: {str(e)}")
            raise
    
    async def update_ad_copies(self, user_id: str, output_id: str, ad_copies: List[Dict[str, Any]]) -> Optional[CreativeOutput]:
        """Update the ad copies in a creative output"""
        try:
            # Validate ad copies
            validated_copies = [AdCopy(**copy) for copy in ad_copies]
            
            # Update the document
            updates = {
                "ad_copies": [copy.dict() for copy in validated_copies]
            }
            
            return await self.update_creative_output(user_id, output_id, updates)
            
        except Exception as e:
            logger.error(f"Error updating ad copies for output {output_id}: {str(e)}")
            raise
