/**
 * Legacy Base44 SDK Adapter
 * 
 * This adapter provides backward compatibility for existing Base44 SDK calls
 * while transitioning to the new Nexsy V2 API. It maps old Base44 methods
 * to new API calls, allowing existing frontend code to work without changes.
 * 
 * Usage: Replace Base44 imports with this adapter
 * Before: import { SimplifiedProduct, VisualLibrary, etc. } from 'base44-client'
 * After: import { SimplifiedProduct, VisualLibrary, etc. } from './legacy-adapter'
 */

import { productsAPI } from './products.js';
import { auth } from '../lib/firebase.js';

// Helper to get current user email (Base44 used email as identifier)
async function getCurrentUserEmail() {
  if (!auth.currentUser) {
    throw new Error('No authenticated user');
  }
  return auth.currentUser.email;
}

// Helper to convert new API product format to Base44 format
function convertProductToBase44Format(product) {
  return {
    id: product.id,
    created_by: product.user_id, // Map user_id to created_by for compatibility
    productName: product.product_name,
    whatIsIt: product.what_is_it,
    price: product.price,
    currency: product.currency,
    targetCountry: product.target_country,
    targetCountryCode: product.target_country_code,
    mainGoal: product.main_goal,
    productImageUrl: product.product_image_url,
    productLink: product.product_link,
    productDescription: product.product_description,
    problemItSolves: product.problem_it_solves,
    targetCustomers: product.target_customers,
    setupCompleted: product.setup_completed,
    aiAnalysisSummary: product.ai_analysis_summary,
    aiTargetAudienceProfile: product.ai_target_audience_profile,
    aiKeySellingPoints: product.ai_key_selling_points,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

// Helper to convert Base44 format to new API format
function convertProductFromBase44Format(productData) {
  return {
    product_name: productData.productName,
    what_is_it: productData.whatIsIt,
    price: productData.price,
    currency: productData.currency || 'USD',
    target_country: productData.targetCountry,
    target_country_code: productData.targetCountryCode,
    main_goal: productData.mainGoal,
    product_image_url: productData.productImageUrl,
    product_link: productData.productLink,
    product_description: productData.productDescription,
    problem_it_solves: productData.problemItSolves,
    target_customers: productData.targetCustomers,
    setup_completed: productData.setupCompleted || false,
  };
}

/**
 * SimplifiedProduct adapter - maps to products API
 */
export const SimplifiedProduct = {
  /**
   * Create a new product
   * Base44: SimplifiedProduct.create(productData)
   */
  async create(productData) {
    try {
      const apiData = convertProductFromBase44Format(productData);
      const response = await productsAPI.createProduct(apiData);
      return convertProductToBase44Format(response);
    } catch (error) {
      console.error('SimplifiedProduct.create error:', error);
      throw error;
    }
  },

  /**
   * Get a product by ID
   * Base44: SimplifiedProduct.get(productId)
   */
  async get(productId) {
    try {
      const response = await productsAPI.getProduct(productId);
      return convertProductToBase44Format(response);
    } catch (error) {
      console.error('SimplifiedProduct.get error:', error);
      throw error;
    }
  },

  /**
   * Filter products by criteria
   * Base44: SimplifiedProduct.filter({ created_by: email })
   */
  async filter(criteria = {}) {
    try {
      if (criteria.created_by) {
        // Base44 filtered by email, new API filters by authenticated user automatically
        const products = await productsAPI.getProducts();
        return products.map(convertProductToBase44Format);
      }
      
      // For other filter criteria, return all products for now
      const products = await productsAPI.getProducts();
      return products.map(convertProductToBase44Format);
    } catch (error) {
      console.error('SimplifiedProduct.filter error:', error);
      throw error;
    }
  },

  /**
   * Update a product
   * Base44: SimplifiedProduct.update(productId, updates)
   */
  async update(productId, updates) {
    try {
      // Convert updates from Base44 format to new API format
      const apiUpdates = {};
      
      if (updates.productName !== undefined) apiUpdates.product_name = updates.productName;
      if (updates.whatIsIt !== undefined) apiUpdates.what_is_it = updates.whatIsIt;
      if (updates.price !== undefined) apiUpdates.price = updates.price;
      if (updates.currency !== undefined) apiUpdates.currency = updates.currency;
      if (updates.targetCountry !== undefined) apiUpdates.target_country = updates.targetCountry;
      if (updates.targetCountryCode !== undefined) apiUpdates.target_country_code = updates.targetCountryCode;
      if (updates.mainGoal !== undefined) apiUpdates.main_goal = updates.mainGoal;
      if (updates.productImageUrl !== undefined) apiUpdates.product_image_url = updates.productImageUrl;
      if (updates.productLink !== undefined) apiUpdates.product_link = updates.productLink;
      if (updates.productDescription !== undefined) apiUpdates.product_description = updates.productDescription;
      if (updates.problemItSolves !== undefined) apiUpdates.problem_it_solves = updates.problemItSolves;
      if (updates.targetCustomers !== undefined) apiUpdates.target_customers = updates.targetCustomers;
      if (updates.setupCompleted !== undefined) apiUpdates.setup_completed = updates.setupCompleted;

      const response = await productsAPI.updateProduct(productId, apiUpdates);
      return convertProductToBase44Format(response);
    } catch (error) {
      console.error('SimplifiedProduct.update error:', error);
      throw error;
    }
  },

  /**
   * Delete a product
   * Base44: SimplifiedProduct.delete(productId)
   */
  async delete(productId) {
    try {
      await productsAPI.deleteProduct(productId);
      return true;
    } catch (error) {
      console.error('SimplifiedProduct.delete error:', error);
      throw error;
    }
  }
};

/**
 * VisualLibrary adapter - maps to visuals API
 */
export const VisualLibrary = {
  /**
   * Create a visual entry
   * Base44: VisualLibrary.create(visualData)
   */
  async create(visualData) {
    try {
      // For file uploads, this is more complex and may need special handling
      console.warn('VisualLibrary.create: Use productsAPI.uploadVisual() for file uploads');
      
      // For now, return a mock response
      return {
        id: 'mock-id',
        ...visualData,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('VisualLibrary.create error:', error);
      throw error;
    }
  },

  /**
   * Filter visuals by criteria
   * Base44: VisualLibrary.filter({ product_id: productId })
   */
  async filter(criteria = {}) {
    try {
      if (criteria.product_id) {
        const visuals = await productsAPI.getProductVisuals(criteria.product_id);
        return visuals.map(visual => ({
          id: visual.id,
          product_id: visual.product_id,
          title: visual.title,
          assetUrl: visual.asset_url,
          mediaType: visual.media_type,
          sourceType: visual.source_type,
          associatedCreativeOutputId: visual.associated_creative_output_id,
          associatedAdCopyIndex: visual.associated_ad_copy_index,
          generatedVideoScript: visual.generated_video_script,
          previewImageUrl: visual.preview_image_url,
          created_at: visual.created_at
        }));
      }
      
      // Get all user visuals
      const visuals = await productsAPI.getUserVisuals();
      return visuals.map(visual => ({
        id: visual.id,
        product_id: visual.product_id,
        title: visual.title,
        assetUrl: visual.asset_url,
        mediaType: visual.media_type,
        sourceType: visual.source_type,
        created_at: visual.created_at
      }));
    } catch (error) {
      console.error('VisualLibrary.filter error:', error);
      throw error;
    }
  },

  /**
   * Delete a visual
   * Base44: VisualLibrary.delete(visualId)
   */
  async delete(visualId) {
    try {
      await productsAPI.deleteVisual(visualId);
      return true;
    } catch (error) {
      console.error('VisualLibrary.delete error:', error);
      throw error;
    }
  }
};

/**
 * CreativeOutput adapter - maps to creative outputs API
 */
export const CreativeOutput = {
  /**
   * Filter creative outputs by criteria
   * Base44: CreativeOutput.filter({ product_id: productId })
   */
  async filter(criteria = {}) {
    try {
      if (criteria.product_id) {
        const outputs = await productsAPI.getProductCreativeOutputs(criteria.product_id);
        return outputs.map(output => ({
          id: output.id,
          product_id: output.product_id,
          creativeConcept_title: output.creative_concept_title,
          creativeConcept_description: output.creative_concept_description,
          targetAudienceSummary: output.target_audience_summary,
          whyThisWorks: output.why_this_works,
          adCopies: output.ad_copies.map(copy => ({
            variationName: copy.variation_name,
            headline: copy.headline,
            bodyText: copy.body_text,
            callToAction: copy.call_to_action,
            platformOptimized: copy.platform_optimized,
            offerValueProposition: copy.offer_value_proposition
          })),
          generationTimestamp: output.generation_timestamp,
          tone: output.tone
        }));
      }
      
      return [];
    } catch (error) {
      console.error('CreativeOutput.filter error:', error);
      throw error;
    }
  },

  /**
   * Delete a creative output
   * Base44: CreativeOutput.delete(outputId)
   */
  async delete(outputId) {
    try {
      console.warn('CreativeOutput.delete: Not yet implemented in backend');
      return true;
    } catch (error) {
      console.error('CreativeOutput.delete error:', error);
      throw error;
    }
  }
};

/**
 * MarketingStrategy adapter - maps to marketing strategy API
 */
export const MarketingStrategy = {
  /**
   * Filter marketing strategies by criteria
   * Base44: MarketingStrategy.filter({ product_id: productId })
   */
  async filter(criteria = {}) {
    try {
      if (criteria.product_id) {
        const strategy = await productsAPI.getProductMarketingStrategy(criteria.product_id);
        if (!strategy) return [];
        
        return [{
          id: strategy.id,
          product_id: strategy.product_id,
          productInfopack: strategy.product_infopack,
          creativeBrief: strategy.creative_brief,
          openaiResponseId: strategy.openai_response_id,
          created_at: strategy.created_at
        }];
      }
      
      return [];
    } catch (error) {
      console.error('MarketingStrategy.filter error:', error);
      throw error;
    }
  }
};

/**
 * AI Functions adapter - maps to AI API
 */
export const AIFunctions = {
  /**
   * Auto-fill product details
   */
  async autofillProduct(productName, whatIsIt, price, targetCountry) {
    try {
      return await productsAPI.autofillProductDetails(productName, whatIsIt, price, targetCountry);
    } catch (error) {
      console.error('AIFunctions.autofillProduct error:', error);
      throw error;
    }
  },

  /**
   * Generate marketing strategy
   */
  async generateMarketingStrategy(productId) {
    try {
      return await productsAPI.generateMarketingStrategy(productId);
    } catch (error) {
      console.error('AIFunctions.generateMarketingStrategy error:', error);
      throw error;
    }
  },

  /**
   * Generate ad copies
   */
  async generateAdCopies(productId, tone = 'professional', numVariations = 3) {
    try {
      return await productsAPI.generateAdCopies(productId, tone, numVariations);
    } catch (error) {
      console.error('AIFunctions.generateAdCopies error:', error);
      throw error;
    }
  }
};

/**
 * File upload utilities
 */
export const FileUpload = {
  /**
   * Upload visual for product
   */
  async uploadProductVisual(productId, file, title = null) {
    try {
      return await productsAPI.uploadVisual(productId, file, title);
    } catch (error) {
      console.error('FileUpload.uploadProductVisual error:', error);
      throw error;
    }
  },

  /**
   * Upload general file
   */
  async uploadFile(file, productId = null, fileType = 'image') {
    try {
      return await productsAPI.uploadFile(file, productId, fileType);
    } catch (error) {
      console.error('FileUpload.uploadFile error:', error);
      throw error;
    }
  }
};

// Export default object with all adapters for convenience
export default {
  SimplifiedProduct,
  VisualLibrary,
  CreativeOutput,
  MarketingStrategy,
  AIFunctions,
  FileUpload,
  productsAPI // Direct access to new API
};
