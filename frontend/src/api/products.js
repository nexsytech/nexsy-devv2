/**
 * Products API client - Replaces Base44 SDK functionality
 * Provides all product-related API calls for Nexsy V2
 */

import { apiClient } from '../lib/api.js';

class ProductsAPI {
  // ============================================================================
  // PRODUCT MANAGEMENT
  // ============================================================================

  /**
   * Create a new product
   * Replaces: SimplifiedProduct.create()
   */
  async createProduct(productData) {
    try {
      const response = await apiClient.post('/api/products', productData);
      console.log('Product created:', response);
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Get all products for the current user
   * Replaces: SimplifiedProduct.filter({ created_by: currentUser.email })
   */
  async getProducts(limit = 50) {
    try {
      const response = await apiClient.get(`/api/products?limit=${limit}`);
      return response.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get a specific product by ID
   * Replaces: SimplifiedProduct.get(productId)
   */
  async getProduct(productId) {
    try {
      const response = await apiClient.get(`/api/products/${productId}`);
      return response;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Update a product
   * Replaces: SimplifiedProduct.update(productId, updates)
   */
  async updateProduct(productId, updates) {
    try {
      const response = await apiClient.put(`/api/products/${productId}`, updates);
      console.log('Product updated:', response);
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete a product and all related data
   * Replaces: SimplifiedProduct.delete(productId)
   */
  async deleteProduct(productId) {
    try {
      await apiClient.delete(`/api/products/${productId}`);
      console.log('Product deleted:', productId);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // ============================================================================
  // VISUAL LIBRARY
  // ============================================================================

  /**
   * Upload a visual (image or video) for a product
   * Replaces: VisualLibrary.create() with file upload
   */
  async uploadVisual(productId, file, title = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);

      // Use custom fetch for file upload (not JSON)
      const token = await this.getAuthToken();
      const response = await fetch(`${apiClient.baseURL}/api/products/${productId}/visuals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Visual uploaded:', result);
      return result;
    } catch (error) {
      console.error('Error uploading visual:', error);
      throw error;
    }
  }

  /**
   * Get all visuals for a product
   * Replaces: VisualLibrary.filter({ product_id: productId })
   */
  async getProductVisuals(productId) {
    try {
      const response = await apiClient.get(`/api/products/${productId}/visuals`);
      return response.visuals || [];
    } catch (error) {
      console.error('Error fetching product visuals:', error);
      throw error;
    }
  }

  /**
   * Get all visuals for current user
   * Replaces: VisualLibrary.filter({ user_id: currentUser.id })
   */
  async getUserVisuals(mediaType = null, limit = 100) {
    try {
      let url = `/api/visuals?limit=${limit}`;
      if (mediaType) url += `&media_type=${mediaType}`;
      
      const response = await apiClient.get(url);
      return response || [];
    } catch (error) {
      console.error('Error fetching user visuals:', error);
      throw error;
    }
  }

  /**
   * Update a visual entry
   * Replaces: VisualLibrary.update()
   */
  async updateVisual(visualId, updates) {
    try {
      const response = await apiClient.put(`/api/visuals/${visualId}`, updates);
      return response;
    } catch (error) {
      console.error('Error updating visual:', error);
      throw error;
    }
  }

  /**
   * Delete a visual
   * Replaces: VisualLibrary.delete()
   */
  async deleteVisual(visualId) {
    try {
      await apiClient.delete(`/api/visuals/${visualId}`);
      console.log('Visual deleted:', visualId);
      return true;
    } catch (error) {
      console.error('Error deleting visual:', error);
      throw error;
    }
  }

  // ============================================================================
  // CREATIVE OUTPUTS / AD COPIES
  // ============================================================================

  /**
   * Get all creative outputs for a product
   * Replaces: CreativeOutput.filter({ product_id: productId })
   */
  async getProductCreativeOutputs(productId) {
    try {
      const response = await apiClient.get(`/api/products/${productId}/creative-outputs`);
      return response.creative_outputs || [];
    } catch (error) {
      console.error('Error fetching creative outputs:', error);
      throw error;
    }
  }

  /**
   * Delete a creative output
   * Replaces: CreativeOutput.delete()
   */
  async deleteCreativeOutput(productId, outputId) {
    try {
      // Note: This should be implemented in the backend as a dedicated endpoint
      // For now, we'll use a workaround or implement it later
      console.warn('Delete creative output not yet implemented in backend');
      throw new Error('Delete creative output endpoint not implemented');
    } catch (error) {
      console.error('Error deleting creative output:', error);
      throw error;
    }
  }

  // ============================================================================
  // MARKETING STRATEGY
  // ============================================================================

  /**
   * Get marketing strategy for a product
   * Replaces: MarketingStrategy.filter({ product_id: productId })
   */
  async getProductMarketingStrategy(productId) {
    try {
      const response = await apiClient.get(`/api/products/${productId}/marketing-strategy`);
      return response;
    } catch (error) {
      if (error.message.includes('404')) {
        return null; // No strategy found
      }
      console.error('Error fetching marketing strategy:', error);
      throw error;
    }
  }

  // ============================================================================
  // AI-POWERED FEATURES
  // ============================================================================

  /**
   * Auto-fill product details using AI
   * New feature - replaces manual form filling
   */
  async autofillProductDetails(productName, whatIsIt, price, targetCountry) {
    try {
      const response = await apiClient.post('/api/ai/autofill-product', {
        product_name: productName,
        what_is_it: whatIsIt,
        price: price,
        target_country: targetCountry
      });
      console.log('Product details autofilled:', response);
      return response;
    } catch (error) {
      console.error('Error autofilling product details:', error);
      throw error;
    }
  }

  /**
   * Generate marketing strategy using AI
   * New feature - creates comprehensive marketing strategy
   */
  async generateMarketingStrategy(productId) {
    try {
      const response = await apiClient.post(`/api/ai/generate-marketing-strategy/${productId}`);
      console.log('Marketing strategy generated:', response);
      return response;
    } catch (error) {
      console.error('Error generating marketing strategy:', error);
      throw error;
    }
  }

  /**
   * Generate ad copies using AI
   * Replaces manual ad copy creation
   */
  async generateAdCopies(productId, tone = 'professional', numVariations = 3) {
    try {
      const response = await apiClient.post('/api/ai/generate-ad-copies', {
        product_id: productId,
        tone: tone,
        num_variations: numVariations
      });
      console.log('Ad copies generated:', response);
      return response;
    } catch (error) {
      console.error('Error generating ad copies:', error);
      throw error;
    }
  }

  /**
   * Enhance product with AI analysis
   * New feature - adds AI insights to product
   */
  async enhanceProductAnalysis(productId) {
    try {
      const response = await apiClient.post(`/api/ai/enhance-product/${productId}`);
      console.log('Product analysis enhanced:', response);
      return response;
    } catch (error) {
      console.error('Error enhancing product analysis:', error);
      throw error;
    }
  }

  /**
   * Check AI service health
   */
  async checkAIHealth() {
    try {
      const response = await apiClient.get('/api/ai/health');
      return response;
    } catch (error) {
      console.error('Error checking AI health:', error);
      return { status: 'error', ai_enabled: false };
    }
  }

  // ============================================================================
  // FILE UPLOAD & STORAGE
  // ============================================================================

  /**
   * Upload a file to cloud storage
   * New feature - general file upload
   */
  async uploadFile(file, productId = null, fileType = 'image', bucketType = 'assets') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (productId) formData.append('product_id', productId);
      formData.append('file_type', fileType);
      formData.append('bucket_type', bucketType);

      const token = await this.getAuthToken();
      const response = await fetch(`${apiClient.baseURL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('File uploaded:', result);
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Generate signed URL for file access
   */
  async generateSignedUrl(filePath, expirationHours = 24) {
    try {
      const response = await apiClient.post('/api/files/signed-url', {
        file_path: filePath,
        expiration_hours: expirationHours
      });
      return response.signed_url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filePath) {
    try {
      await apiClient.delete(`/api/files?file_path=${encodeURIComponent(filePath)}`);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get current Firebase auth token
   */
  async getAuthToken() {
    const { auth } = await import('../lib/firebase.js');
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    throw new Error('No authenticated user');
  }

  /**
   * Mark product setup as completed
   */
  async markProductSetupCompleted(productId) {
    return this.updateProduct(productId, { setup_completed: true });
  }

  /**
   * Search products by name or description
   */
  async searchProducts(searchTerm, limit = 20) {
    try {
      // This would require a search endpoint in the backend
      // For now, we'll get all products and filter client-side
      const products = await this.getProducts(100);
      const searchTermLower = searchTerm.toLowerCase();
      
      return products.filter(product => 
        product.product_name.toLowerCase().includes(searchTermLower) ||
        (product.what_is_it && product.what_is_it.toLowerCase().includes(searchTermLower)) ||
        (product.product_description && product.product_description.toLowerCase().includes(searchTermLower))
      ).slice(0, limit);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const productsAPI = new ProductsAPI();
export default productsAPI;
