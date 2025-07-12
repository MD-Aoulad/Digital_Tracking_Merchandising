/**
 * Core API Client
 * 
 * This module provides a centralized HTTP client for all API communication.
 * It handles authentication, request/response processing, and error handling.
 */

import { ApiResponse } from '../types';

// ===== CONFIGURATION =====

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const RETRY_DELAY = 60000; // 1 minute for rate limiting

// ===== UTILITY FUNCTIONS =====

/**
 * Get authentication headers for API requests
 */
const getAuthHeaders = (): Record<string, string> => {
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
        return { 'Content-Type': 'application/json' };
      }
    } catch (error) {
      // Invalid token format, clear it
      console.log('Invalid JWT token format, clearing session');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return { 'Content-Type': 'application/json' };
    }
  }
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Handle API response and error handling
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
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
 * Make an API request with proper error handling and retry logic
 */
export const apiRequest = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(fullUrl, config);
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      // Store rate limit timestamp to prevent immediate retries
      const lastRateLimit = localStorage.getItem('lastRateLimit');
      const now = Date.now();
      
      if (!lastRateLimit || (now - parseInt(lastRateLimit)) > RETRY_DELAY) {
        localStorage.setItem('lastRateLimit', now.toString());
      }
      
      throw new Error('Rate limit exceeded. Please wait 1 minute before trying again.');
    }
    
    throw error;
  }
};

// ===== HTTP METHOD HELPERS =====

export const apiGet = <T>(url: string): Promise<T> => 
  apiRequest<T>(url, { method: 'GET' });

export const apiPost = <T>(url: string, data?: any): Promise<T> => 
  apiRequest<T>(url, { 
    method: 'POST', 
    body: data ? JSON.stringify(data) : undefined 
  });

export const apiPut = <T>(url: string, data?: any): Promise<T> => 
  apiRequest<T>(url, { 
    method: 'PUT', 
    body: data ? JSON.stringify(data) : undefined 
  });

export const apiDelete = <T>(url: string): Promise<T> => 
  apiRequest<T>(url, { method: 'DELETE' });

export const apiPatch = <T>(url: string, data?: any): Promise<T> => 
  apiRequest<T>(url, { 
    method: 'PATCH', 
    body: data ? JSON.stringify(data) : undefined 
  });

// ===== AUTHENTICATION HELPERS =====

export const isAuthenticated = (): boolean => {
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

export const clearAuth = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('lastRateLimit');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// ===== ERROR HANDLING =====

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error.message?.includes('Rate limit exceeded')) {
    return 'Rate limit exceeded. Please wait a moment and try again.';
  }
  
  if (error.message?.includes('Network Error')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return error.message || 'An unexpected error occurred.';
}; 