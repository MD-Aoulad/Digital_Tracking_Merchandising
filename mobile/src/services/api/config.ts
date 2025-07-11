// API Configuration for Workforce Management Platform Mobile App
// This connects to the same backend as the web platform

export const API_CONFIG = {
  // Base URL - update this to match your web app backend
  BASE_URL: 'http://localhost:3001/api', // Change to your actual backend URL
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    PROFILE: '/auth/profile',
    
    // Stores
    STORES: '/stores',
    STORE_DETAILS: (id: string) => `/stores/${id}`,
    
    // Tasks
    TASKS: '/tasks',
    TASK_DETAILS: (id: string) => `/tasks/${id}`,
    MY_TASKS: '/tasks/my-tasks',
    
    // Punch-ins
    PUNCH_INS: '/punch-ins',
    PUNCH_IN: '/punch-ins/check-in',
    PUNCH_OUT: '/punch-ins/check-out',
    
    // Reports
    REPORTS: '/reports',
    REPORT_DETAILS: (id: string) => `/reports/${id}`,
    SUBMIT_REPORT: '/reports/submit',
    
    // Dashboard
    DASHBOARD: '/dashboard',
    STATS: '/dashboard/stats',
  },
  
  // Request configuration
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Environment-specific configuration
export const getApiConfig = () => {
  const isDevelopment = __DEV__;
  
  return {
    ...API_CONFIG,
    BASE_URL: isDevelopment 
      ? 'http://localhost:3001/api'  // Development
      : 'https://your-production-api.com/api', // Production - update this
  };
};
