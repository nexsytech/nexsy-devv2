import FirebaseUser from '../lib/user';

// Mock entity implementations - replace these with actual API calls to your new backend
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

export const BusinessProfile = MockEntity;
export const VisualLibrary = MockEntity;
export const MarketingStrategy = MockEntity;
export const SimplifiedProduct = MockEntity;
export const CreativeOutput = MockEntity;
export const ConnectedAccount = MockEntity;
export const OAuthState = MockEntity;
export const LaunchJob = MockEntity;

// Firebase auth integration:
export const User = FirebaseUser;