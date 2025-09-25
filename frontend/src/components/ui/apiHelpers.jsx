
import React from 'react';

// Enhanced utility functions for handling API errors and retries
export const isNetworkError = (error) => {
  return error?.message?.includes('Network Error') || 
         error?.code === 'ERR_NETWORK' ||
         error?.message?.includes('fetch') ||
         error?.name === 'AxiosError' ||
         !navigator.onLine;
};

export const retryWithExponentialBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries || !isNetworkError(error)) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const withNetworkErrorHandling = async (apiCall, options = {}) => {
  const { showToast = true, maxRetries = 3, fallbackData = null } = options;
  
  // Check if we're offline
  if (!navigator.onLine) {
    if (showToast) {
      const { toast } = await import('sonner');
      toast.error("You appear to be offline. Please check your internet connection.");
    }
    if (fallbackData) return fallbackData;
    throw new Error('Network Error: You appear to be offline');
  }
  
  try {
    return await retryWithExponentialBackoff(apiCall, maxRetries);
  } catch (error) {
    console.error('API call failed after retries:', error);
    
    if (isNetworkError(error)) {
      if (showToast) {
        const { toast } = await import('sonner');
        toast.error("Connection problem. Please check your internet and try again.");
      }
      
      // Return fallback data if available
      if (fallbackData) return fallbackData;
    }
    
    throw error;
  }
};

// Add connection status monitoring
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};
