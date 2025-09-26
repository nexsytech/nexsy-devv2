"""
Product API routes
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from pydantic import BaseModel, Field

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.product import Product, ProductService
from models.visual_library import VisualLibrary, VisualLibraryService
from models.creative_output import CreativeOutput, CreativeOutputService
from models.marketing_strategy import MarketingStrategy, MarketingStrategyService
from middleware.auth import get_current_user_id
from services.storage_service import StorageService

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/products", tags=["products"])

# Initialize services
product_service = ProductService()
visual_service = VisualLibraryService()
creative_service = CreativeOutputService()
strategy_service = MarketingStrategyService()
storage_service = StorageService()

# Request/Response models
class ProductCreateRequest(BaseModel):
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

class ProductUpdateRequest(BaseModel):
    product_name: Optional[str] = Field(None, min_length=1, max_length=200)
    what_is_it: Optional[str] = Field(None, min_length=1, max_length=500)
    price: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    target_country: Optional[str] = None
    target_country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    main_goal: Optional[str] = None
    product_image_url: Optional[str] = None
    product_link: Optional[str] = None
    product_description: Optional[str] = None
    problem_it_solves: Optional[str] = None
    target_customers: Optional[str] = None
    setup_completed: Optional[bool] = None
    ai_analysis_summary: Optional[str] = None
    ai_target_audience_profile: Optional[str] = None
    ai_key_selling_points: Optional[List[str]] = None

class ProductResponse(BaseModel):
    id: str
    user_id: str
    product_name: str
    what_is_it: str
    price: float
    currency: str
    target_country: str
    target_country_code: str
    main_goal: str
    product_image_url: Optional[str] = None
    product_link: Optional[str] = None
    product_description: Optional[str] = None
    problem_it_solves: Optional[str] = None
    target_customers: Optional[str] = None
    setup_completed: bool
    ai_analysis_summary: Optional[str] = None
    ai_target_audience_profile: Optional[str] = None
    ai_key_selling_points: Optional[List[str]] = None
    created_at: str
    updated_at: str

class ProductListResponse(BaseModel):
    products: List[ProductResponse]

class VisualUploadResponse(BaseModel):
    id: str
    product_id: str
    title: str
    asset_url: str
    media_type: str
    source_type: str

class AutofillRequest(BaseModel):
    product_name: str
    what_is_it: str
    price: float
    target_country: str

class AutofillResponse(BaseModel):
    product_description: str
    problem_it_solves: str
    target_customers: str

# Routes
@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new product"""
    try:
        logger.info(f"Creating product for user {user_id} with data: {product_data.dict()}")
        product = await product_service.create_product(
            user_id=user_id,
            product_data=product_data.dict()
        )
        
        return ProductResponse(
            id=product.id,
            user_id=product.user_id,
            product_name=product.product_name,
            what_is_it=product.what_is_it,
            price=product.price,
            currency=product.currency,
            target_country=product.target_country,
            target_country_code=product.target_country_code,
            main_goal=product.main_goal,
            product_image_url=product.product_image_url,
            product_link=product.product_link,
            product_description=product.product_description,
            problem_it_solves=product.problem_it_solves,
            target_customers=product.target_customers,
            setup_completed=product.setup_completed,
            ai_analysis_summary=product.ai_analysis_summary,
            ai_target_audience_profile=product.ai_target_audience_profile,
            ai_key_selling_points=product.ai_key_selling_points,
            created_at=product.created_at.isoformat(),
            updated_at=product.updated_at.isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error creating product: {str(e)}")
        if "validation" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Validation error: {str(e)}"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create product"
        )

@router.get("", response_model=ProductListResponse)
async def list_products(
    limit: int = 50,
    user_id: str = Depends(get_current_user_id)
):
    """List all products for the authenticated user"""
    try:
        products = await product_service.list_products(user_id=user_id, limit=limit)
        
        product_responses = []
        for product in products:
            product_responses.append(ProductResponse(
                id=product.id,
                user_id=product.user_id,
                product_name=product.product_name,
                what_is_it=product.what_is_it,
                price=product.price,
                currency=product.currency,
                target_country=product.target_country,
                target_country_code=product.target_country_code,
                main_goal=product.main_goal,
                product_image_url=product.product_image_url,
                product_link=product.product_link,
                product_description=product.product_description,
                problem_it_solves=product.problem_it_solves,
                target_customers=product.target_customers,
                setup_completed=product.setup_completed,
                ai_analysis_summary=product.ai_analysis_summary,
                ai_target_audience_profile=product.ai_target_audience_profile,
                ai_key_selling_points=product.ai_key_selling_points,
                created_at=product.created_at.isoformat(),
                updated_at=product.updated_at.isoformat()
            ))
        
        return ProductListResponse(products=product_responses)
        
    except Exception as e:
        logger.error(f"Error listing products: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list products"
        )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific product by ID"""
    try:
        product = await product_service.get_product(user_id=user_id, product_id=product_id)
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return ProductResponse(
            id=product.id,
            user_id=product.user_id,
            product_name=product.product_name,
            what_is_it=product.what_is_it,
            price=product.price,
            currency=product.currency,
            target_country=product.target_country,
            target_country_code=product.target_country_code,
            main_goal=product.main_goal,
            product_image_url=product.product_image_url,
            product_link=product.product_link,
            product_description=product.product_description,
            problem_it_solves=product.problem_it_solves,
            target_customers=product.target_customers,
            setup_completed=product.setup_completed,
            ai_analysis_summary=product.ai_analysis_summary,
            ai_target_audience_profile=product.ai_target_audience_profile,
            ai_key_selling_points=product.ai_key_selling_points,
            created_at=product.created_at.isoformat(),
            updated_at=product.updated_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get product"
        )

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    updates: ProductUpdateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Update a product"""
    try:
        # Filter out None values
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid update data provided"
            )
        
        product = await product_service.update_product(
            user_id=user_id,
            product_id=product_id,
            updates=update_data
        )
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return ProductResponse(
            id=product.id,
            user_id=product.user_id,
            product_name=product.product_name,
            what_is_it=product.what_is_it,
            price=product.price,
            currency=product.currency,
            target_country=product.target_country,
            target_country_code=product.target_country_code,
            main_goal=product.main_goal,
            product_image_url=product.product_image_url,
            product_link=product.product_link,
            product_description=product.product_description,
            problem_it_solves=product.problem_it_solves,
            target_customers=product.target_customers,
            setup_completed=product.setup_completed,
            ai_analysis_summary=product.ai_analysis_summary,
            ai_target_audience_profile=product.ai_target_audience_profile,
            ai_key_selling_points=product.ai_key_selling_points,
            created_at=product.created_at.isoformat(),
            updated_at=product.updated_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update product"
        )

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a product and all related data"""
    try:
        success = await product_service.delete_product(user_id=user_id, product_id=product_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product"
        )

@router.post("/{product_id}/visuals", response_model=VisualUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_visual(
    product_id: str,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user_id)
):
    """Upload a visual (image or video) for a product"""
    try:
        # Verify product exists and belongs to user
        product = await product_service.get_product(user_id=user_id, product_id=product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Determine file type
        if file.content_type.startswith('image/'):
            file_type = 'image'
            media_type = 'image'
        elif file.content_type.startswith('video/'):
            file_type = 'video'
            media_type = 'video'
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image and video files are allowed"
            )
        
        # Upload file to Cloud Storage
        file_info = await storage_service.upload_file(
            file=file,
            user_id=user_id,
            file_type=file_type,
            product_id=product_id,
            bucket_type="assets"
        )
        
        # Create visual library entry
        visual_data = {
            "product_id": product_id,
            "title": title or file.filename or "Uploaded visual",
            # storage_service returns 'public_url' for dev (gs://) or signed URL in prod
            "asset_url": file_info.get("file_url") or file_info.get("public_url"),
            "media_type": media_type,
            "source_type": "uploaded"
        }
        
        visual = await visual_service.create_visual(user_id=user_id, visual_data=visual_data)
        
        return VisualUploadResponse(
            id=visual.id,
            product_id=visual.product_id,
            title=visual.title,
            asset_url=visual.asset_url,
            media_type=visual.media_type,
            source_type=visual.source_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading visual for product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload visual"
        )

@router.get("/{product_id}/visuals")
async def list_product_visuals(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """List all visuals for a product"""
    try:
        # Verify product exists and belongs to user
        product = await product_service.get_product(user_id=user_id, product_id=product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        visuals = await visual_service.list_product_visuals(user_id=user_id, product_id=product_id)
        
        visual_responses = []
        for visual in visuals:
            visual_responses.append({
                "id": visual.id,
                "product_id": visual.product_id,
                "title": visual.title,
                "asset_url": visual.asset_url,
                "media_type": visual.media_type,
                "source_type": visual.source_type,
                "associated_creative_output_id": visual.associated_creative_output_id,
                "associated_ad_copy_index": visual.associated_ad_copy_index,
                "generated_video_script": visual.generated_video_script,
                "preview_image_url": visual.preview_image_url,
                "created_at": visual.created_at.isoformat()
            })
        
        return {"visuals": visual_responses}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing visuals for product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list visuals"
        )

@router.get("/{product_id}/creative-outputs")
async def list_product_creative_outputs(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """List all creative outputs for a product"""
    try:
        # Verify product exists and belongs to user
        product = await product_service.get_product(user_id=user_id, product_id=product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        outputs = await creative_service.list_product_outputs(user_id=user_id, product_id=product_id)
        
        output_responses = []
        for output in outputs:
            output_responses.append({
                "id": output.id,
                "product_id": output.product_id,
                "creative_concept_title": output.creative_concept_title,
                "creative_concept_description": output.creative_concept_description,
                "target_audience_summary": output.target_audience_summary,
                "why_this_works": output.why_this_works,
                "ad_copies": [copy.dict() for copy in output.ad_copies],
                "generation_timestamp": output.generation_timestamp.isoformat(),
                "tone": output.tone
            })
        
        return {"creative_outputs": output_responses}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing creative outputs for product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list creative outputs"
        )

@router.get("/{product_id}/marketing-strategy")
async def get_product_marketing_strategy(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get the marketing strategy for a product"""
    try:
        # Verify product exists and belongs to user
        product = await product_service.get_product(user_id=user_id, product_id=product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        strategy = await strategy_service.get_product_strategy(user_id=user_id, product_id=product_id)
        
        if not strategy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Marketing strategy not found"
            )
        
        return {
            "id": strategy.id,
            "product_id": strategy.product_id,
            "product_infopack": strategy.product_infopack.dict() if strategy.product_infopack else None,
            "creative_brief": strategy.creative_brief.dict() if strategy.creative_brief else None,
            "openai_response_id": strategy.openai_response_id,
            "created_at": strategy.created_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting marketing strategy for product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get marketing strategy"
        )
