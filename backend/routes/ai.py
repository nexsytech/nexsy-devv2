"""
AI content generation API routes
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ai_service import AIService
from middleware.auth import get_current_user_id

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Initialize AI service
# Lazy-init to avoid import-time failures
ai_service: AIService | None = None

def get_ai_service() -> AIService:
    global ai_service
    if ai_service is None:
        ai_service = AIService()
    return ai_service

# Request/Response models
class AutofillRequest(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=200)
    what_is_it: str = Field(..., min_length=1, max_length=500)
    price: float = Field(..., gt=0)
    target_country: str = Field(..., min_length=1)

class AutofillResponse(BaseModel):
    product_description: str
    problem_it_solves: str
    target_customers: str

class GenerateMarketingStrategyRequest(BaseModel):
    product_id: str = Field(..., min_length=1)

class GenerateAdCopiesRequest(BaseModel):
    product_id: str = Field(..., min_length=1)
    tone: str = Field(default="professional", description="Tone for ad copies: professional, casual, playful, urgent, etc.")
    num_variations: int = Field(default=3, ge=1, le=5, description="Number of ad copy variations to generate")

class EnhanceProductRequest(BaseModel):
    product_id: str = Field(..., min_length=1)

# Routes
@router.post("/autofill-product", response_model=AutofillResponse)
async def autofill_product_details(
    request: AutofillRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate product description, problem it solves, and target customers
    based on basic product information using AI
    """
    try:
        service = get_ai_service()
        result = await service.autofill_product_details(
            user_id=user_id,
            product_name=request.product_name,
            what_is_it=request.what_is_it,
            price=request.price,
            target_country=request.target_country
        )
        
        return AutofillResponse(
            product_description=result["product_description"],
            problem_it_solves=result["problem_it_solves"],
            target_customers=result["target_customers"]
        )
        
    except Exception as e:
        logger.error(f"Error in autofill_product_details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate product details: {str(e)}"
        )

@router.post("/generate-marketing-strategy/{product_id}")
async def generate_marketing_strategy(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate a comprehensive marketing strategy for a product including
    customer avatars and creative brief
    """
    try:
        service = get_ai_service()
        strategy = await service.generate_marketing_strategy(
            user_id=user_id,
            product_id=product_id
        )
        
        return {
            "id": strategy.id,
            "product_id": strategy.product_id,
            "product_infopack": {
                "customer_avatars": [
                    {
                        "label": avatar.label,
                        "description": avatar.description
                    } for avatar in strategy.product_infopack.customer_avatars
                ] if strategy.product_infopack else []
            },
            "creative_brief": {
                "creative_angle": strategy.creative_brief.creative_angle,
                "visual_style_art_direction": strategy.creative_brief.visual_style_art_direction
            } if strategy.creative_brief else None,
            "openai_response_id": strategy.openai_response_id,
            "created_at": strategy.created_at.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating marketing strategy: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate marketing strategy: {str(e)}"
        )

@router.post("/generate-ad-copies")
async def generate_ad_copies(
    request: GenerateAdCopiesRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate ad copies and creative concepts for a product
    """
    try:
        service = get_ai_service()
        creative_output = await service.generate_ad_copies(
            user_id=user_id,
            product_id=request.product_id,
            tone=request.tone,
            num_variations=request.num_variations
        )
        
        return {
            "id": creative_output.id,
            "product_id": creative_output.product_id,
            "creative_concept_title": creative_output.creative_concept_title,
            "creative_concept_description": creative_output.creative_concept_description,
            "target_audience_summary": creative_output.target_audience_summary,
            "why_this_works": creative_output.why_this_works,
            "ad_copies": [
                {
                    "variation_name": copy.variation_name,
                    "headline": copy.headline,
                    "body_text": copy.body_text,
                    "call_to_action": copy.call_to_action,
                    "platform_optimized": copy.platform_optimized,
                    "offer_value_proposition": copy.offer_value_proposition
                } for copy in creative_output.ad_copies
            ],
            "generation_timestamp": creative_output.generation_timestamp.isoformat(),
            "tone": creative_output.tone
        }
        
    except Exception as e:
        logger.error(f"Error generating ad copies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate ad copies: {str(e)}"
        )

@router.post("/enhance-product/{product_id}")
async def enhance_product_analysis(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate enhanced AI analysis for a product including key selling points
    and detailed target audience insights
    """
    try:
        service = get_ai_service()
        product = await service.enhance_product_analysis(
            user_id=user_id,
            product_id=product_id
        )
        
        return {
            "id": product.id,
            "ai_analysis_summary": product.ai_analysis_summary,
            "ai_target_audience_profile": product.ai_target_audience_profile,
            "ai_key_selling_points": product.ai_key_selling_points,
            "updated_at": product.updated_at.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error enhancing product analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enhance product analysis: {str(e)}"
        )

@router.get("/health")
async def ai_health_check():
    """Check if AI service is properly configured"""
    try:
        service = get_ai_service()
        if not service.client:
            return {
                "status": "warning",
                "message": "OpenAI API key not configured",
                "ai_enabled": False
            }
        
        return {
            "status": "healthy",
            "message": "AI service is ready",
            "ai_enabled": True,
            "model": service.model
        }
        
    except Exception as e:
        logger.error(f"AI health check failed: {str(e)}")
        return {
            "status": "error",
            "message": f"AI service error: {str(e)}",
            "ai_enabled": False
        }
