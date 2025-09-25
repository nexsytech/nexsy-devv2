import { auth, onAuthStateChange, logOut } from './firebase';
import { apiClient } from './api';

class User {
  static currentUser = null;

  // Get current user from Firebase auth
  static async me() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChange(async (firebaseUser) => {
        unsubscribe(); // Clean up listener after first response
        
        if (firebaseUser) {
          try {
            // Verify token with backend and get user data
            const userData = await apiClient.getCurrentUser();
            this.currentUser = {
              uid: userData.uid,
              email: userData.email,
              full_name: userData.display_name || userData.email?.split('@')[0],
              email_verified: userData.email_verified
            };
            resolve(this.currentUser);
          } catch (error) {
            reject(new Error('Failed to get user data from backend'));
          }
        } else {
          reject(new Error('No authenticated user'));
        }
      });
    });
  }

  // Logout user
  static async logout() {
    try {
      await logOut();
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      throw new Error('Logout failed');
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return auth.currentUser !== null;
  }

  // Get Firebase user directly
  static getFirebaseUser() {
    return auth.currentUser;
  }

  // Get user profile from backend
  static async getProfile() {
    try {
      return await apiClient.getUserProfile();
    } catch (error) {
      throw new Error('Failed to get user profile');
    }
  }

  // Legacy compatibility methods for existing code
  static async loginWithRedirect(redirectUrl) {
    // This was the old base44 method - we'll redirect to login page instead
    window.location.href = '/login';
  }

  // Auth state listener
  static onAuthStateChanged(callback) {
    return onAuthStateChange(callback);
  }

  // Verify current token with backend
  static async verifyToken() {
    try {
      return await apiClient.verifyToken();
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }
}

export default User;
