"""
AI content generation service using OpenAI
"""
import os
import logging
from typing import Dict, Any, List, Optional
import openai
from openai import AsyncOpenAI
import json

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.product import Product, ProductService
from models.marketing_strategy import MarketingStrategy, MarketingStrategyService, CustomerAvatar, ProductInfoPack, CreativeBrief
from models.creative_output import CreativeOutput, CreativeOutputService, AdCopy

logger = logging.getLogger(__name__)

class AIService:
    """Service for AI-powered content generation"""
    
    def __init__(self):
        # Initialize OpenAI client
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.warning("OPENAI_API_KEY not found in environment variables")
            self.client = None
        else:
            self.client = AsyncOpenAI(api_key=api_key)
        
        # Initialize other services
        self.product_service = ProductService()
        self.strategy_service = MarketingStrategyService()
        self.creative_service = CreativeOutputService()
        
        # Model configuration
        self.model = "gpt-4o-mini"  # Cost-effective model for most tasks
        self.max_tokens = 2000
        self.temperature = 0.7
    
    async def autofill_product_details(self, user_id: str, product_name: str, 
                                     what_is_it: str, price: float, 
                                     target_country: str) -> Dict[str, str]:
        """
        Generate product description, problem it solves, and target customers
        based on basic product information
        """
        if not self.client:
            raise Exception("OpenAI API key not configured")
        
        try:
            prompt = f"""
            You are a marketing expert. Based on the following product information, generate detailed marketing content:

            Product Name: {product_name}
            What it is: {what_is_it}
            Price: ${price}
            Target Country: {target_country}

            Please provide the following in JSON format:
            {{
                "product_description": "A detailed 2-3 sentence description of the product that highlights its key features and benefits",
                "problem_it_solves": "A clear explanation of the main problem this product solves for customers",
                "target_customers": "A detailed description of the ideal customers who would buy this product, including demographics and psychographics"
            }}

            Make sure the content is engaging, market-appropriate for {target_country}, and reflects the price point of ${price}.
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert marketing copywriter who creates compelling product descriptions and identifies target markets."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                result = json.loads(content)
                logger.info(f"Generated autofill content for product: {product_name}")
                return result
            except json.JSONDecodeError:
                # Fallback parsing if JSON is not perfect
                logger.warning("Failed to parse JSON response, using fallback")
                return {
                    "product_description": f"High-quality {what_is_it} designed to meet your needs with excellent value at ${price}.",
                    "problem_it_solves": f"Solves common challenges related to {what_is_it.lower()}.",
                    "target_customers": f"Customers in {target_country} looking for reliable {what_is_it.lower()} solutions."
                }
                
        except Exception as e:
            logger.error(f"Error generating autofill content: {str(e)}")
            raise Exception(f"Failed to generate content: {str(e)}")
    
    async def generate_marketing_strategy(self, user_id: str, product_id: str) -> MarketingStrategy:
        """
        Generate a comprehensive marketing strategy for a product
        """
        if not self.client:
            raise Exception("OpenAI API key not configured")
        
        try:
            # Get product details
            product = await self.product_service.get_product(user_id, product_id)
            if not product:
                raise Exception("Product not found")
            
            prompt = f"""
            Create a comprehensive marketing strategy for this product:

            Product Name: {product.product_name}
            Description: {product.what_is_it}
            Price: ${product.price} {product.currency}
            Target Country: {product.target_country}
            Main Goal: {product.main_goal}
            Product Description: {product.product_description or 'Not provided'}
            Problem It Solves: {product.problem_it_solves or 'Not provided'}
            Target Customers: {product.target_customers or 'Not provided'}

            Please provide a detailed marketing strategy in the following JSON format:
            {{
                "product_infopack": {{
                    "customer_avatars": [
                        {{
                            "label": "Primary Customer Segment Name",
                            "description": "Detailed description of this customer segment including demographics, psychographics, pain points, and buying behavior"
                        }},
                        {{
                            "label": "Secondary Customer Segment Name", 
                            "description": "Detailed description of this customer segment"
                        }}
                    ]
                }},
                "creative_brief": {{
                    "creative_angle": "The main creative angle/hook for marketing campaigns. Should be compelling and differentiated.",
                    "visual_style_art_direction": "Detailed description of the visual style, color palette, tone, imagery style, and overall aesthetic direction for marketing materials"
                }}
            }}

            Make sure the strategy is:
            - Specific to the {product.target_country} market
            - Appropriate for the ${product.price} price point
            - Aligned with the goal: {product.main_goal}
            - Based on real market insights and consumer psychology
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a senior marketing strategist with expertise in customer segmentation, positioning, and creative strategy across global markets."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=3000,
                temperature=self.temperature
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                strategy_data = json.loads(content)
                
                # Create customer avatars
                avatars = []
                for avatar_data in strategy_data.get("product_infopack", {}).get("customer_avatars", []):
                    avatars.append(CustomerAvatar(
                        label=avatar_data["label"],
                        description=avatar_data["description"]
                    ))
                
                # Create marketing strategy object
                strategy_payload = {
                    "product_id": product_id,
                    "product_infopack": ProductInfoPack(customer_avatars=avatars),
                    "creative_brief": CreativeBrief(
                        creative_angle=strategy_data.get("creative_brief", {}).get("creative_angle", ""),
                        visual_style_art_direction=strategy_data.get("creative_brief", {}).get("visual_style_art_direction", "")
                    ),
                    "openai_response_id": response.id
                }
                
                # Save to Firestore
                strategy = await self.strategy_service.create_marketing_strategy(user_id, strategy_payload)
                
                logger.info(f"Generated marketing strategy for product {product_id}")
                return strategy
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse marketing strategy JSON: {str(e)}")
                raise Exception("Failed to parse AI response")
                
        except Exception as e:
            logger.error(f"Error generating marketing strategy: {str(e)}")
            raise
    
    async def generate_ad_copies(self, user_id: str, product_id: str, 
                               tone: str = "professional", 
                               num_variations: int = 3) -> CreativeOutput:
        """
        Generate ad copies and creative concepts for a product
        """
        if not self.client:
            raise Exception("OpenAI API key not configured")
        
        try:
            # Get product and marketing strategy
            product = await self.product_service.get_product(user_id, product_id)
            if not product:
                raise Exception("Product not found")
            
            strategy = await self.strategy_service.get_product_strategy(user_id, product_id)
            
            # Build context from strategy if available
            strategy_context = ""
            if strategy:
                if strategy.product_infopack and strategy.product_infopack.customer_avatars:
                    avatar_descriptions = [f"- {avatar.label}: {avatar.description}" for avatar in strategy.product_infopack.customer_avatars]
                    strategy_context += f"\nTarget Customer Segments:\n{chr(10).join(avatar_descriptions)}"
                
                if strategy.creative_brief:
                    strategy_context += f"\nCreative Angle: {strategy.creative_brief.creative_angle}"
                    strategy_context += f"\nVisual Style: {strategy.creative_brief.visual_style_art_direction}"
            
            prompt = f"""
            Create compelling ad copy variations for this product with a {tone} tone:

            Product Information:
            - Name: {product.product_name}
            - Description: {product.what_is_it}
            - Price: ${product.price} {product.currency}
            - Target Country: {product.target_country}
            - Main Goal: {product.main_goal}
            - Product Description: {product.product_description or 'Not provided'}
            - Problem It Solves: {product.problem_it_solves or 'Not provided'}
            - Target Customers: {product.target_customers or 'Not provided'}
            
            {strategy_context}

            Please create {num_variations} different ad copy variations in JSON format:
            {{
                "creative_concept_title": "A catchy title for this creative concept/campaign",
                "creative_concept_description": "2-3 sentences explaining the overall creative concept and why it will work",
                "target_audience_summary": "Brief summary of who this targets and why",
                "why_this_works": "Explanation of the psychology and marketing principles that make this effective",
                "ad_copies": [
                    {{
                        "variation_name": "Descriptive name for this variation (e.g., 'Social Proof Focus', 'Problem-Solution', 'Benefit-Driven')",
                        "headline": "Compelling headline (max 60 characters for social media)",
                        "body_text": "Main ad copy text (engaging, persuasive, appropriate length for digital ads)",
                        "call_to_action": "Strong CTA button text",
                        "platform_optimized": "facebook",
                        "offer_value_proposition": "The key value proposition highlighted in this variation"
                    }}
                ]
            }}

            Requirements:
            - Use {tone} tone throughout
            - Make it compelling for {product.target_country} market
            - Include emotional triggers and logical benefits
            - Ensure headlines are catchy and memorable
            - CTAs should be action-oriented
            - Each variation should have a different approach/angle
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are an expert advertising copywriter specializing in {tone} tone and high-converting digital ad copy for various platforms."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=3000,
                temperature=self.temperature
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                creative_data = json.loads(content)
                
                # Create ad copy objects
                ad_copies = []
                for copy_data in creative_data.get("ad_copies", []):
                    ad_copies.append(AdCopy(
                        variation_name=copy_data.get("variation_name", ""),
                        headline=copy_data.get("headline", ""),
                        body_text=copy_data.get("body_text", ""),
                        call_to_action=copy_data.get("call_to_action", ""),
                        platform_optimized=copy_data.get("platform_optimized", "universal"),
                        offer_value_proposition=copy_data.get("offer_value_proposition")
                    ))
                
                # Create creative output
                creative_payload = {
                    "product_id": product_id,
                    "creative_concept_title": creative_data.get("creative_concept_title", ""),
                    "creative_concept_description": creative_data.get("creative_concept_description", ""),
                    "target_audience_summary": creative_data.get("target_audience_summary", ""),
                    "why_this_works": creative_data.get("why_this_works", ""),
                    "ad_copies": ad_copies,
                    "tone": tone
                }
                
                # Save to Firestore
                creative_output = await self.creative_service.create_creative_output(user_id, creative_payload)
                
                logger.info(f"Generated {len(ad_copies)} ad copy variations for product {product_id}")
                return creative_output
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse creative output JSON: {str(e)}")
                raise Exception("Failed to parse AI response")
                
        except Exception as e:
            logger.error(f"Error generating ad copies: {str(e)}")
            raise
    
    async def enhance_product_analysis(self, user_id: str, product_id: str) -> Product:
        """
        Generate enhanced AI analysis for a product including key selling points and audience insights
        """
        if not self.client:
            raise Exception("OpenAI API key not configured")
        
        try:
            # Get product details
            product = await self.product_service.get_product(user_id, product_id)
            if not product:
                raise Exception("Product not found")
            
            prompt = f"""
            Analyze this product and provide enhanced marketing insights:

            Product Name: {product.product_name}
            Description: {product.what_is_it}
            Price: ${product.price} {product.currency}
            Target Country: {product.target_country}
            Main Goal: {product.main_goal}
            Product Description: {product.product_description or 'Not provided'}
            Problem It Solves: {product.problem_it_solves or 'Not provided'}
            Target Customers: {product.target_customers or 'Not provided'}

            Please provide enhanced analysis in JSON format:
            {{
                "ai_analysis_summary": "A comprehensive 2-3 sentence analysis of the product's market position, competitive advantages, and overall potential",
                "ai_target_audience_profile": "A detailed profile of the ideal customer including demographics, psychographics, behavior patterns, and motivations",
                "ai_key_selling_points": [
                    "First key selling point that differentiates this product",
                    "Second unique value proposition", 
                    "Third compelling reason to buy",
                    "Fourth benefit or feature that stands out"
                ]
            }}

            Focus on:
            - Unique value propositions
            - Competitive differentiation
            - Market positioning opportunities
            - Customer pain points addressed
            - Psychological triggers for {product.target_country} market
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a senior product marketing analyst with expertise in market positioning, customer psychology, and competitive analysis."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=self.temperature
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                analysis_data = json.loads(content)
                
                # Update product with AI insights
                updates = {
                    "ai_analysis_summary": analysis_data.get("ai_analysis_summary", ""),
                    "ai_target_audience_profile": analysis_data.get("ai_target_audience_profile", ""),
                    "ai_key_selling_points": analysis_data.get("ai_key_selling_points", [])
                }
                
                # Save updates to Firestore
                updated_product = await self.product_service.update_product(user_id, product_id, updates)
                
                logger.info(f"Enhanced product analysis for product {product_id}")
                return updated_product
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse product analysis JSON: {str(e)}")
                raise Exception("Failed to parse AI response")
                
        except Exception as e:
            logger.error(f"Error enhancing product analysis: {str(e)}")
            raise
