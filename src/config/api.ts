/**
 * Centralized API Configuration
 * 
 * This file provides consistent API configuration across the entire application.
 * It ensures all frontend components, mobile apps, and services use the same endpoints.
 */

// ===== ENVIRONMENT DETECTION =====

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// ===== API CONFIGURATION =====

export const API_CONFIG = {
  // Base URLs - update these to match your setup
  BASE_URL: isDevelopment 
    ? 'http://localhost:5000/api'  // Development - localhost
    : 'https://your-production-api.com/api', // Production - update this
  
  // Alternative localhost for development
  LOCAL_URL: 'http://localhost:5000', 
  // Network URL for mobile devices
  NETWORK_URL: 'http://localhost:5000/api',
  
  // Timeouts
  TIMEOUT: 30000, // 30 seconds
  RETRY_DELAY: 60000, // 1 minute for rate limiting
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
      REFRESH: '/auth/refresh',
      RESET_PASSWORD: '/auth/reset-password',
    },
    
    // Todos
    TODOS: {
      LIST: '/todos',
      CREATE: '/todos',
      UPDATE: (id: string) => `/todos/${id}`,
      DELETE: (id: string) => `/todos/${id}`,
      COMPLETE: (id: string) => `/todos/${id}/complete`,
    },
    
    // Advanced Todos
    ADVANCED_TODOS: {
      LIST: '/advanced-todos',
      CREATE: '/advanced-todos',
      UPDATE: (id: string) => `/advanced-todos/${id}`,
      DELETE: (id: string) => `/advanced-todos/${id}`,
      SUBMIT: (id: string) => `/advanced-todos/${id}/submit`,
      SUBMISSIONS: (id: string) => `/advanced-todos/${id}/submissions`,
    },
    
    // Reports
    REPORTS: {
      LIST: '/reports',
      CREATE: '/reports',
      UPDATE: (id: string) => `/reports/${id}`,
      DELETE: (id: string) => `/reports/${id}`,
      STATUS: (id: string) => `/reports/${id}/status`,
    },
    
    // Attendance
    ATTENDANCE: {
      LIST: '/attendance',
      PUNCH_IN: '/attendance/punch-in',
      PUNCH_OUT: '/attendance/punch-out',
      HISTORY: '/attendance/history',
    },
    
    // Admin
    ADMIN: {
      USERS: '/admin/users',
      TODOS: '/admin/todos',
      REPORTS: '/admin/reports',
      ATTENDANCE: '/admin/attendance',
    },
    
    // System
    SYSTEM: {
      HEALTH: '/health',
      TEST: '/test',
    },
  },
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get the appropriate API base URL based on environment and context
 */
export const getApiBaseUrl = (): string => {
  // For tests, use localhost
  if (isTest) {
    return API_CONFIG.LOCAL_URL;
  }
  
  // For development, prefer network URL for mobile compatibility
  if (isDevelopment) {
    // Check if we're in a mobile context
    const isMobile = typeof window !== 'undefined' && 
      (window.navigator.userAgent.includes('Mobile') || 
       window.navigator.userAgent.includes('Android') ||
       window.navigator.userAgent.includes('iPhone'));
    
    return isMobile ? API_CONFIG.NETWORK_URL : API_CONFIG.BASE_URL;
  }
  
  // For production, use the configured production URL
  return API_CONFIG.BASE_URL;
};

/**
 * Build a full API URL from an endpoint
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Get authentication headers
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, clear it
        console.log('JWT token expired, clearing session');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        return { ...API_CONFIG.DEFAULT_HEADERS };
      }
    } catch (error) {
      // Invalid token format, clear it
      console.log('Invalid JWT token format, clearing session');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return { ...API_CONFIG.DEFAULT_HEADERS };
    }
  }
  
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Handle API response and error handling
 */
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // Handle non-JSON responses (like rate limiting HTML pages)
    const text = await response.text();
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `API request failed: ${response.status}`);
  }
  
  return data;
};

/**
 * Make an API request with proper error handling
 */
export const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = buildApiUrl(endpoint);
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return await handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      // Store rate limit timestamp to prevent immediate retries
      const lastRateLimit = localStorage.getItem('lastRateLimit');
      const now = Date.now();
      
      if (!lastRateLimit || (now - parseInt(lastRateLimit)) > API_CONFIG.RETRY_DELAY) {
        localStorage.setItem('lastRateLimit', now.toString());
      }
      
      throw new Error('Rate limit exceeded. Please wait 1 minute before trying again.');
    }
    
    throw error;
  }
};

// ===== CONVENIENCE FUNCTIONS =====

export const apiGet = <T>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'GET' });
};

export const apiPost = <T>(endpoint: string, data?: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiPut = <T>(endpoint: string, data?: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiDelete = <T>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
};

// ===== EXPORT CONFIGURATION =====

export default API_CONFIG; 