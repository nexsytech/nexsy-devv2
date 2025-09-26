import FirebaseUser from '../lib/user';
import { 
  SimplifiedProduct, 
  VisualLibrary, 
  MarketingStrategy, 
  CreativeOutput 
} from './legacy-adapter.js';

// Mock entity for unimplemented features
class MockEntity {
  static async filter(criteria = {}, sort = '') {
    console.warn(`MockEntity.filter called with criteria:`, criteria);
    return [];
  }
  
  static async create(data = {}) {
    console.warn(`MockEntity.create called with data:`, data);
    return { id: `mock_${Date.now()}`, ...data };
  }
  
  static async update(id, data = {}) {
    console.warn(`MockEntity.update called with id: ${id}, data:`, data);
    return { id, ...data };
  }
  
  static async delete(id) {
    console.warn(`MockEntity.delete called with id: ${id}`);
    return { success: true };
  }
  
  static async findById(id) {
    console.warn(`MockEntity.findById called with id: ${id}`);
    return null;
  }
}

// Use real implementations for core product features
export { SimplifiedProduct, VisualLibrary, MarketingStrategy, CreativeOutput };

// Use mock for features not yet implemented
export const BusinessProfile = MockEntity;
export const ConnectedAccount = MockEntity;
export const OAuthState = MockEntity;
export const LaunchJob = MockEntity;

// Firebase auth integration:
export const User = FirebaseUser;