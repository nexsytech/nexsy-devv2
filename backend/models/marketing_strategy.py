"""
Marketing Strategy model for Firestore operations
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from google.cloud import firestore
import logging

logger = logging.getLogger(__name__)

class CustomerAvatar(BaseModel):
    """Customer avatar/persona model"""
    label: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

class ProductInfoPack(BaseModel):
    """Product information pack model"""
    customer_avatars: List[CustomerAvatar] = Field(default_factory=list)

class CreativeBrief(BaseModel):
    """Creative brief model"""
    creative_angle: str = Field(..., min_length=1)
    visual_style_art_direction: str = Field(..., min_length=1)

class MarketingStrategy(BaseModel):
    """Marketing Strategy data model"""
    id: Optional[str] = None
    product_id: str = Field(..., description="Associated product ID")
    user_id: str = Field(..., description="Firebase user ID")
    
    product_infopack: Optional[ProductInfoPack] = None
    creative_brief: Optional[CreativeBrief] = None
    
    # AI generation metadata
    openai_response_id: Optional[str] = None
    
    # Metadata
    created_at: Optional[datetime] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class MarketingStrategyService:
    """Service for Marketing Strategy Firestore operations"""
    
    def __init__(self):
        self.db = firestore.Client()
        self.collection_name = "users"
    
    def _get_user_strategies_ref(self, user_id: str):
        """Get reference to user's marketing strategies subcollection"""
        return self.db.collection(self.collection_name).document(user_id).collection("marketingStrategies")
    
    async def create_marketing_strategy(self, user_id: str, strategy_data: Dict[str, Any]) -> MarketingStrategy:
        """Create a new marketing strategy"""
        try:
            # Add metadata
            now = datetime.utcnow()
            strategy_data.update({
                "user_id": user_id,
                "created_at": now
            })
            
            # Validate data
            strategy = MarketingStrategy(**strategy_data)
            
            # Create document in Firestore
            strategies_ref = self._get_user_strategies_ref(user_id)
            doc_ref = strategies_ref.document()
            
            # Convert to dict and store
            strategy_dict = strategy.dict(exclude={"id"})
            doc_ref.set(strategy_dict)
            
            # Return strategy with ID
            strategy.id = doc_ref.id
            
            logger.info(f"Created marketing strategy {doc_ref.id} for user {user_id}")
            return strategy
            
        except Exception as e:
            logger.error(f"Error creating marketing strategy for user {user_id}: {str(e)}")
            raise
    
    async def get_marketing_strategy(self, user_id: str, strategy_id: str) -> Optional[MarketingStrategy]:
        """Get a specific marketing strategy by ID"""
        try:
            doc_ref = self._get_user_strategies_ref(user_id).document(strategy_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            strategy_data = doc.to_dict()
            strategy_data["id"] = doc.id
            
            return MarketingStrategy(**strategy_data)
            
        except Exception as e:
            logger.error(f"Error getting marketing strategy {strategy_id} for user {user_id}: {str(e)}")
            raise
    
    async def get_product_strategy(self, user_id: str, product_id: str) -> Optional[MarketingStrategy]:
        """Get the marketing strategy for a specific product"""
        try:
            strategies_ref = self._get_user_strategies_ref(user_id)
            docs = (strategies_ref
                   .where("product_id", "==", product_id)
                   .order_by("created_at", direction=firestore.Query.DESCENDING)
                   .limit(1)
                   .stream())
            
            for doc in docs:
                strategy_data = doc.to_dict()
                strategy_data["id"] = doc.id
                return MarketingStrategy(**strategy_data)
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting strategy for product {product_id}: {str(e)}")
            raise
    
    async def list_user_strategies(self, user_id: str, limit: int = 50) -> List[MarketingStrategy]:
        """List all marketing strategies for a user"""
        try:
            strategies_ref = self._get_user_strategies_ref(user_id)
            docs = (strategies_ref
                   .order_by("created_at", direction=firestore.Query.DESCENDING)
                   .limit(limit)
                   .stream())
            
            strategies = []
            for doc in docs:
                strategy_data = doc.to_dict()
                strategy_data["id"] = doc.id
                strategies.append(MarketingStrategy(**strategy_data))
            
            logger.info(f"Retrieved {len(strategies)} marketing strategies for user {user_id}")
            return strategies
            
        except Exception as e:
            logger.error(f"Error listing marketing strategies for user {user_id}: {str(e)}")
            raise
    
    async def update_marketing_strategy(self, user_id: str, strategy_id: str, updates: Dict[str, Any]) -> Optional[MarketingStrategy]:
        """Update a marketing strategy"""
        try:
            doc_ref = self._get_user_strategies_ref(user_id).document(strategy_id)
            
            # Check if strategy exists
            if not doc_ref.get().exists:
                return None
            
            # Update document
            doc_ref.update(updates)
            
            # Return updated strategy
            return await self.get_marketing_strategy(user_id, strategy_id)
            
        except Exception as e:
            logger.error(f"Error updating marketing strategy {strategy_id} for user {user_id}: {str(e)}")
            raise
    
    async def delete_marketing_strategy(self, user_id: str, strategy_id: str) -> bool:
        """Delete a marketing strategy"""
        try:
            doc_ref = self._get_user_strategies_ref(user_id).document(strategy_id)
            
            # Check if strategy exists
            if not doc_ref.get().exists:
                return False
            
            # Delete document
            doc_ref.delete()
            
            logger.info(f"Deleted marketing strategy {strategy_id} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting marketing strategy {strategy_id} for user {user_id}: {str(e)}")
            raise
