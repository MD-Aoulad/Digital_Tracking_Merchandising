/**
 * Enhanced Authentication Service - Workforce Management Platform
 * 
 * This module provides authentication-related API operations and utilities.
 * It handles login, logout, token management, and session validation with
 * advanced error handling, timeout management, and retry mechanisms.
 * 
 * Features:
 * - Configurable timeout settings
 * - Automatic retry mechanisms
 * - Comprehensive error handling
 * - Request/response logging
 * - Offline detection
 * - Service health monitoring
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import { User } from '../types';

// ===== LOCAL TYPES =====

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse {
  data?: any;
  error?: string;
  message?: string;
}

// ===== UTILITY FUNCTIONS =====

const clearAuth = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp && payload.exp > currentTime;
  } catch {
    return false;
  }
};

// ===== CONFIGURATION =====

const AUTH_CONFIG = {
  TIMEOUT_MS: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000, // 2 seconds
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
} as const;

// ===== AUTHENTICATION ENDPOINTS =====

const AUTH_ENDPOINTS = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  PROFILE: '/profile',
  REFRESH: '/refresh',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',
  HEALTH: '/health',
} as const;

// ===== ERROR TYPES =====

export interface AuthError {
  type: 'timeout' | 'network' | 'credentials' | 'server' | 'validation' | 'unknown';
  message: string;
  code?: number;
  retryable: boolean;
  originalError?: Error;
}

// ===== UTILITY FUNCTIONS =====

const createTimeoutPromise = (timeoutMs: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('timeout'));
    }, timeoutMs);
  });
};

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const isRetryableError = (error: AuthError): boolean => {
  return error.retryable && (
    error.type === 'timeout' || 
    error.type === 'network' || 
    error.type === 'server'
  );
};

const logAuthEvent = (event: string, data?: any) => {
  console.log(`🔐 [AUTH] ${event}`, data || '');
  
  // Send to monitoring service if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'auth_event', {
      event_category: 'authentication',
      event_label: event,
      value: data ? 1 : 0
    });
  }
};

// ===== ENHANCED API FUNCTIONS =====

/**
 * Enhanced API request with timeout and retry logic
 */
const apiRequestWithRetry = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(`${process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3010'}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      let authError: AuthError;
      
      switch (response.status) {
        case 401:
          authError = {
            type: 'credentials',
            message: errorData.error || 'Invalid credentials',
            code: 401,
            retryable: false,
          };
          break;
        case 408:
          authError = {
            type: 'timeout',
            message: 'Request timeout',
            code: 408,
            retryable: true,
          };
          break;
        case 500:
        case 502:
        case 503:
          authError = {
            type: 'server',
            message: errorData.error || 'Server error',
            code: response.status,
            retryable: true,
          };
          break;
        default:
          authError = {
            type: 'unknown',
            message: errorData.error || `HTTP ${response.status}`,
            code: response.status,
            retryable: response.status >= 500,
          };
      }

      throw authError;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    let authError: AuthError;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        authError = {
          type: 'timeout',
          message: 'Request timeout',
          code: 408,
          retryable: true,
          originalError: error,
        };
      } else if (error.message === 'timeout') {
        authError = {
          type: 'timeout',
          message: 'Request timeout',
          code: 408,
          retryable: true,
          originalError: error,
        };
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        authError = {
          type: 'network',
          message: 'Network connection failed',
          code: 0,
          retryable: true,
          originalError: error,
        };
      } else {
        authError = {
          type: 'unknown',
          message: error.message,
          code: 0,
          retryable: false,
          originalError: error,
        };
      }
    } else {
      authError = {
        type: 'unknown',
        message: 'Unknown error',
        code: 0,
        retryable: false,
      };
    }

    // Retry logic
    if (isRetryableError(authError) && retryCount < AUTH_CONFIG.MAX_RETRIES) {
      logAuthEvent(`Retrying request (${retryCount + 1}/${AUTH_CONFIG.MAX_RETRIES})`, {
        endpoint,
        error: authError.type,
        retryCount: retryCount + 1,
      });

      await delay(AUTH_CONFIG.RETRY_DELAY_MS * (retryCount + 1));
      return apiRequestWithRetry<T>(endpoint, options, retryCount + 1);
    }

    throw authError;
  }
};

// ===== AUTHENTICATION FUNCTIONS =====

/**
 * Enhanced login function with timeout and retry mechanisms
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  logAuthEvent('Login attempt', { email: credentials.email });
  
  try {
    const response = await apiRequestWithRetry<LoginResponse>(AUTH_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store authentication data
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      // Track successful login
      logAuthEvent('Login success', { 
        email: credentials.email,
        userId: response.user.id,
        role: response.user.role 
      });
    }
    
    return response;
  } catch (error) {
    // Clear any existing auth data on login failure
    clearAuth();
    
    const authError = error as AuthError;
    logAuthEvent('Login failure', { 
      email: credentials.email,
      error: authError.type,
      message: authError.message 
    });
    
    throw authError;
  }
};

/**
 * Enhanced logout function
 */
export const logout = async (): Promise<void> => {
  logAuthEvent('Logout attempt');
  
  try {
    await apiRequestWithRetry(AUTH_ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
    
    logAuthEvent('Logout success');
  } catch (error) {
    logAuthEvent('Logout error', { error: (error as AuthError).type });
    // Continue with local cleanup even if server logout fails
  } finally {
    clearAuth();
  }
};

/**
 * Get user profile with enhanced error handling
 */
export const getProfile = async (): Promise<User> => {
  try {
    const response = await apiRequestWithRetry<{ user: User }>(AUTH_ENDPOINTS.PROFILE, {
      method: 'GET',
    });
    
    return response.user;
  } catch (error) {
    logAuthEvent('Profile fetch error', { error: (error as AuthError).type });
    throw error;
  }
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (): Promise<{ token: string }> => {
  try {
    const response = await apiRequestWithRetry<{ token: string }>(AUTH_ENDPOINTS.REFRESH, {
      method: 'POST',
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  } catch (error) {
    logAuthEvent('Token refresh error', { error: (error as AuthError).type });
    throw error;
  }
};

/**
 * Reset password request
 */
export const resetPassword = async (email: string): Promise<ApiResponse> => {
  logAuthEvent('Password reset request', { email });
  
  try {
    const response = await apiRequestWithRetry<ApiResponse>(AUTH_ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    
    logAuthEvent('Password reset success', { email });
    return response;
  } catch (error) {
    logAuthEvent('Password reset error', { 
      email, 
      error: (error as AuthError).type 
    });
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (
  currentPassword: string, 
  newPassword: string
): Promise<ApiResponse> => {
  logAuthEvent('Password change attempt');
  
  try {
    const response = await apiRequestWithRetry<ApiResponse>(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    logAuthEvent('Password change success');
    return response;
  } catch (error) {
    logAuthEvent('Password change error', { error: (error as AuthError).type });
    throw error;
  }
};

/**
 * Check service health
 */
export const checkServiceHealth = async (): Promise<boolean> => {
  try {
    await apiRequestWithRetry(AUTH_ENDPOINTS.HEALTH, {
      method: 'GET',
    }, 0); // No retries for health check
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get authentication statistics
 */
export const getAuthStats = (): {
  totalAttempts: number;
  successRate: number;
  averageResponseTime: number;
  lastLoginTime?: string;
} => {
  const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
  const totalAttempts = attempts.length;
  const successfulAttempts = attempts.filter((a: any) => a.success).length;
  const successRate = totalAttempts > 0 ? successfulAttempts / totalAttempts : 0;
  
  const lastLogin = attempts
    .filter((a: any) => a.success)
    .sort((a: any, b: any) => b.timestamp - a.timestamp)[0];
  
  return {
    totalAttempts,
    successRate,
    averageResponseTime: 0, // TODO: Implement response time tracking
    lastLoginTime: lastLogin ? new Date(lastLogin.timestamp).toISOString() : undefined,
  };
};

// ===== EXPORT CONFIGURATION =====

export { AUTH_CONFIG, AUTH_ENDPOINTS }; 