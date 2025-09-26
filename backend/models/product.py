"""
Product model for Firestore operations
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from google.cloud import firestore
import logging

logger = logging.getLogger(__name__)

class Product(BaseModel):
    """Product data model"""
    id: Optional[str] = None
    user_id: str = Field(..., description="Firebase user ID")
    product_name: str = Field(..., min_length=1, max_length=200)
    what_is_it: str = Field(..., min_length=1, max_length=500)
    price: float = Field(..., gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    target_country: str = Field(..., min_length=1)
    target_country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    main_goal: str = Field(..., description="Primary marketing goal")
    product_image_url: Optional[str] = None
    product_link: Optional[str] = None
    product_description: Optional[str] = None
    problem_it_solves: Optional[str] = None
    target_customers: Optional[str] = None
    
    # AI-generated insights
    setup_completed: bool = Field(default=False)
    ai_analysis_summary: Optional[str] = None
    ai_target_audience_profile: Optional[str] = None
    ai_key_selling_points: Optional[List[str]] = None
    
    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ProductService:
    """Service for Product Firestore operations"""
    
    def __init__(self):
        self.db = firestore.Client()
        self.collection_name = "users"
    
    def _get_user_products_ref(self, user_id: str):
        """Get reference to user's products subcollection"""
        return self.db.collection(self.collection_name).document(user_id).collection("products")
    
    async def create_product(self, user_id: str, product_data: Dict[str, Any]) -> Product:
        """Create a new product for user"""
        try:
            # Add metadata
            now = datetime.utcnow()
            product_data.update({
                "user_id": user_id,
                "created_at": now,
                "updated_at": now
            })
            
            # Validate data
            product = Product(**product_data)
            
            # Create document in Firestore
            products_ref = self._get_user_products_ref(user_id)
            doc_ref = products_ref.document()
            
            # Convert to dict and store
            product_dict = product.dict(exclude={"id"})
            doc_ref.set(product_dict)
            
            # Return product with ID
            product.id = doc_ref.id
            
            logger.info(f"Created product {doc_ref.id} for user {user_id}")
            return product
            
        except Exception as e:
            logger.error(f"Error creating product for user {user_id}: {str(e)}")
            raise
    
    async def get_product(self, user_id: str, product_id: str) -> Optional[Product]:
        """Get a specific product by ID"""
        try:
            doc_ref = self._get_user_products_ref(user_id).document(product_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            product_data = doc.to_dict()
            product_data["id"] = doc.id
            
            return Product(**product_data)
            
        except Exception as e:
            logger.error(f"Error getting product {product_id} for user {user_id}: {str(e)}")
            raise
    
    async def list_products(self, user_id: str, limit: int = 50) -> List[Product]:
        """List all products for a user"""
        try:
            products_ref = self._get_user_products_ref(user_id)
            docs = products_ref.order_by("updated_at", direction=firestore.Query.DESCENDING).limit(limit).stream()
            
            products = []
            for doc in docs:
                product_data = doc.to_dict()
                product_data["id"] = doc.id
                products.append(Product(**product_data))
            
            logger.info(f"Retrieved {len(products)} products for user {user_id}")
            return products
            
        except Exception as e:
            logger.error(f"Error listing products for user {user_id}: {str(e)}")
            raise
    
    async def update_product(self, user_id: str, product_id: str, updates: Dict[str, Any]) -> Optional[Product]:
        """Update a product"""
        try:
            doc_ref = self._get_user_products_ref(user_id).document(product_id)
            
            # Check if product exists
            if not doc_ref.get().exists:
                return None
            
            # Add update timestamp
            updates["updated_at"] = datetime.utcnow()
            
            # Update document
            doc_ref.update(updates)
            
            # Return updated product
            return await self.get_product(user_id, product_id)
            
        except Exception as e:
            logger.error(f"Error updating product {product_id} for user {user_id}: {str(e)}")
            raise
    
    async def delete_product(self, user_id: str, product_id: str) -> bool:
        """Delete a product and all related data"""
        try:
            # Start batch operation
            batch = self.db.batch()
            
            # Delete main product document
            product_ref = self._get_user_products_ref(user_id).document(product_id)
            batch.delete(product_ref)
            
            # Delete related subcollections (visuals, creative outputs, etc.)
            user_ref = self.db.collection(self.collection_name).document(user_id)
            
            # Delete visuals
            visuals_ref = user_ref.collection("visuals")
            visual_docs = visuals_ref.where("product_id", "==", product_id).stream()
            for doc in visual_docs:
                batch.delete(doc.reference)
            
            # Delete creative outputs
            outputs_ref = user_ref.collection("creativeOutputs")
            output_docs = outputs_ref.where("product_id", "==", product_id).stream()
            for doc in output_docs:
                batch.delete(doc.reference)
            
            # Delete marketing strategies
            strategies_ref = user_ref.collection("marketingStrategies")
            strategy_docs = strategies_ref.where("product_id", "==", product_id).stream()
            for doc in strategy_docs:
                batch.delete(doc.reference)
            
            # Delete campaigns
            campaigns_ref = user_ref.collection("campaigns")
            campaign_docs = campaigns_ref.where("product_id", "==", product_id).stream()
            for doc in campaign_docs:
                batch.delete(doc.reference)
            
            # Commit batch
            batch.commit()
            
            logger.info(f"Deleted product {product_id} and related data for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting product {product_id} for user {user_id}: {str(e)}")
            raise
    
    async def search_products(self, user_id: str, search_term: str, limit: int = 20) -> List[Product]:
        """Search products by name or description"""
        try:
            products = await self.list_products(user_id, limit=100)  # Get more for searching
            
            # Filter products containing search term
            search_term_lower = search_term.lower()
            filtered_products = []
            
            for product in products:
                if (search_term_lower in product.product_name.lower() or
                    (product.what_is_it and search_term_lower in product.what_is_it.lower()) or
                    (product.product_description and search_term_lower in product.product_description.lower())):
                    filtered_products.append(product)
                
                if len(filtered_products) >= limit:
                    break
            
            return filtered_products
            
        except Exception as e:
            logger.error(f"Error searching products for user {user_id}: {str(e)}")
            raise
