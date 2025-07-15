/**
 * Authentication Context - Workforce Management Platform
 * 
 * This context provides authentication and authorization functionality for the application.
 * It manages user sessions, role-based permissions, and authentication state.
 * 
 * Features:
 * - User authentication and session management
 * - Role-based access control (RBAC)
 * - Permission checking for UI components
 * - Backend API integration
 * - Session timeout management (30 minutes inactivity)
 * - Automatic logout on inactivity
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { authAPI, User as ApiUser } from '../services/api';

/**
 * Authentication Context Type Definition
 * 
 * Defines the structure and methods available in the authentication context.
 */
interface AuthContextType {
  user: User | null;                    // Current authenticated user
  login: (email: string, password: string) => Promise<boolean>;  // Login function
  logout: () => void;                   // Logout function
  isLoading: boolean;                   // Loading state for auth operations
  hasPermission: (permission: string) => boolean;  // Permission checker
  error: string | null;                 // Error message
  clearError: () => void;               // Clear error message
  sessionTimeout: number;               // Session timeout in minutes
  resetSessionTimer: () => void;        // Reset session timer
}

// ===== CONSTANTS =====

const SESSION_TIMEOUT_MINUTES = 30;
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;

// ===== ROLE PERMISSIONS =====

const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'dashboard:view',
    'dashboard:edit',
    'todos:view',
    'todos:create',
    'todos:edit',
    'todos:delete',
    'todos:assign',
    'reports:view',
    'reports:create',
    'reports:edit',
    'reports:delete',
    'reports:approve',
    'attendance:view',
    'attendance:edit',
    'users:view',
    'users:create',
    'users:edit',
    'users:delete',
    'settings:view',
    'settings:edit',
    'admin:access'
  ],
  [UserRole.EDITOR]: [
    'dashboard:view',
    'todos:view',
    'todos:create',
    'todos:edit',
    'todos:delete',
    'reports:view',
    'reports:create',
    'reports:edit',
    'attendance:view',
    'attendance:edit',
    'settings:view'
  ],
  [UserRole.VIEWER]: [
    'dashboard:view',
    'todos:view',
    'reports:view',
    'attendance:view',
    'settings:view'
  ]
};

// ===== CONTEXT CREATION =====

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== UTILITY FUNCTIONS =====

/**
 * Convert API user format to application user format
 * 
 * @param apiUser - User data from API response
 * @returns User object in application format
 */
const convertApiUserToAppUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role === 'admin' ? UserRole.ADMIN : 
          apiUser.role === 'employee' ? UserRole.EDITOR : UserRole.VIEWER,
    department: apiUser.department,
    position: apiUser.role === 'admin' ? 'System Administrator' : 
              apiUser.role === 'employee' ? 'Employee' : 'Viewer',
    phone: '+1234567890' // Default phone for now
  };
};

/**
 * AuthProvider Component
 * 
 * Context provider that wraps the application and provides authentication
 * functionality to all child components.
 * 
 * @param children - React components that will have access to auth context
 * @returns JSX element with authentication context
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimeout] = useState<number>(SESSION_TIMEOUT_MINUTES);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  /**
   * Logout function - clears user state and navigates to login
   */
  const logout = useCallback(() => {
    console.log('Logging out user...');
    setUser(null);
    setError(null);
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
    authAPI.logout();
    
    // ✅ FIXED: Use React Router navigation instead of window.location.href
    navigate('/login', { replace: true });
  }, [sessionTimer, navigate]);

  /**
   * Start session timeout timer
   */
  const startSessionTimer = useCallback(() => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    
    const timer = setTimeout(() => {
      // Session expired - auto logout
      console.log('Session expired due to inactivity. Auto-logout initiated.');
      logout();
    }, SESSION_TIMEOUT_MS);
    
    setSessionTimer(timer);
  }, [sessionTimer, logout]);

  /**
   * Reset session timer on user activity
   */
  const resetSessionTimer = useCallback(() => {
    if (user) {
      startSessionTimer();
    }
  }, [user, startSessionTimer]);

  /**
   * Handle user activity events
   */
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetSessionTimer();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, resetSessionTimer]);

  /**
   * Initialize authentication state on component mount
   * Checks for existing user session and validates with backend
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        if (authAPI.isAuthenticated()) {
          const profile = await authAPI.getProfile();
          const appUser = convertApiUserToAppUser(profile.user);
          setUser(appUser);
          startSessionTimer(); // Start session timer for existing session
        }
        // Removed auto-login - users must now login manually
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        // Clear invalid session
        authAPI.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [startSessionTimer]);

  /**
   * Authenticate user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise<boolean> - True if authentication successful, false otherwise
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loginResult = await authAPI.login(email, password);
      const appUser = convertApiUserToAppUser(loginResult.user);
      setUser(appUser);
      startSessionTimer(); // Start session timer after successful login
      setIsLoading(false);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Check if current user has a specific permission
   * 
   * @param permission - Permission string to check (e.g., 'dashboard:view')
   * @returns boolean - True if user has permission, false otherwise
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  // Context value object
  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    hasPermission,
    error,
    clearError,
    sessionTimeout,
    resetSessionTimer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Custom hook to access authentication context. Must be used within
 * an AuthProvider component.
 * 
 * @returns AuthContextType - Authentication context with user data and methods
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
