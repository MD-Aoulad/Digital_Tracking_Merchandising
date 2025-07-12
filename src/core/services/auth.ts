/**
 * Authentication Service
 * 
 * This module provides authentication-related API operations and utilities.
 * It handles login, logout, token management, and session validation.
 */

import { 
  LoginCredentials, 
  LoginResponse, 
  User, 
  ApiResponse 
} from '../types';
import { apiPost, apiGet, clearAuth, isAuthenticated } from '../api/client';

// ===== AUTHENTICATION ENDPOINTS =====

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  REFRESH: '/auth/refresh',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
} as const;

// ===== AUTHENTICATION FUNCTIONS =====

/**
 * Authenticate user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await apiPost<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
    
    // Store authentication data
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
    }
    
    return response;
  } catch (error) {
    // Clear any existing auth data on login failure
    clearAuth();
    throw error;
  }
};

/**
 * Logout user and clear session
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint to invalidate token on server
    await apiPost(AUTH_ENDPOINTS.LOGOUT);
  } catch (error) {
    // Continue with local cleanup even if server call fails
    console.warn('Logout server call failed, continuing with local cleanup:', error);
  } finally {
    // Always clear local authentication data
    clearAuth();
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<User> => {
  const response = await apiGet<User>(AUTH_ENDPOINTS.PROFILE);
  return response;
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (): Promise<{ token: string }> => {
  const response = await apiPost<{ token: string }>(AUTH_ENDPOINTS.REFRESH);
  
  if (response.token) {
    localStorage.setItem('authToken', response.token);
  }
  
  return response;
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<ApiResponse<{ message: string }>> => {
  return await apiPost<ApiResponse<{ message: string }>>(AUTH_ENDPOINTS.RESET_PASSWORD, { email });
};

/**
 * Change user password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
  return await apiPost<ApiResponse<{ message: string }>>(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
    currentPassword,
    newPassword
  });
};

// ===== SESSION MANAGEMENT =====

/**
 * Check if user is currently authenticated
 */
export const checkAuthStatus = (): boolean => {
  return isAuthenticated();
};

/**
 * Get stored user data from localStorage
 */
export const getStoredUser = (): User | null => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

/**
 * Update stored user data
 */
export const updateStoredUser = (user: User): void => {
  localStorage.setItem('userData', JSON.stringify(user));
};

/**
 * Clear all authentication data
 */
export const clearAuthentication = (): void => {
  clearAuth();
};

// ===== TOKEN MANAGEMENT =====

/**
 * Get current authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const token = getAuthToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp && payload.exp < currentTime;
  } catch {
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (): Date | null => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
};

/**
 * Get time until token expires (in milliseconds)
 */
export const getTimeUntilExpiration = (): number => {
  const expiration = getTokenExpiration();
  if (!expiration) return 0;
  
  return Math.max(0, expiration.getTime() - Date.now());
};

// ===== UTILITY FUNCTIONS =====

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate a secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomArray[i] % chars.length);
  }
  
  return result;
};

// All functions are already exported above 