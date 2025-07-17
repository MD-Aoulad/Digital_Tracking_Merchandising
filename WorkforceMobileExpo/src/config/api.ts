// API Configuration for Mobile App
// Update these values based on your development environment

// For local development on the same machine
export const API_CONFIG = {
  // Use your computer's IP address for mobile development
  // You can find this by running 'ipconfig' on Windows or 'ifconfig' on Mac/Linux
  BASE_URL: 'http://192.168.178.150:5000/api', // Update this IP address
  
  // Alternative URLs for different scenarios:
  // LOCALHOST: 'http://localhost:5000/api', // For web development
  // LOCAL_IP: 'http://192.168.1.100:5000/api', // For mobile development (update IP)
  // PRODUCTION: 'https://your-production-domain.com/api', // For production
  
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Helper function to get the correct API URL based on environment
export const getApiUrl = (): string => {
  // You can add environment detection here
  // For now, we'll use the configured BASE_URL
  return API_CONFIG.BASE_URL;
};

// Network configuration
export const NETWORK_CONFIG = {
  // Enable/disable network logging
  LOG_REQUESTS: true,
  LOG_RESPONSES: true,
  
  // Retry configuration
  RETRY_DELAY: 1000, // 1 second between retries
  
  // Offline handling
  CACHE_ENABLED: true,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
}; 