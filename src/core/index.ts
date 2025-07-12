/**
 * Core Module Exports
 * 
 * This file exports all core modules for easy importing throughout the application.
 * This provides a clean, centralized way to access all core functionality.
 */

// ===== TYPES =====
export * from './types';

// ===== API =====
export { 
  apiRequest, 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiPatch,
  isAuthenticated,
  clearAuth,
  ApiError,
  handleApiError
} from './api/client';

export * from './api/hooks';

// ===== SERVICES =====
export { 
  login,
  logout,
  getProfile,
  refreshToken,
  requestPasswordReset,
  changePassword,
  checkAuthStatus,
  getStoredUser,
  updateStoredUser,
  clearAuthentication,
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiration,
  isValidEmail,
  validatePassword,
  generateSecureToken
} from './services/auth';

export * from './services/todo';

// ===== CONTEXTS =====
export * from './contexts/AuthContext';

// ===== HOOKS =====
export * from './hooks/useTodos';

// ===== COMPONENTS =====
export { default as AppLayout } from './components/Layout/AppLayout'; 