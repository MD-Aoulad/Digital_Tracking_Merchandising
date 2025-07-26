/**
 * Authentication Context
 * 
 * This module provides React context for authentication state management.
 * It uses the auth service for API operations and provides a clean interface
 * for components to access authentication state and operations.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  User, 
  AuthState, 
  LoginCredentials, 
  LoginResponse,
  UserRole 
} from '../types';
import { 
  login as authLogin,
  logout as authLogout,
  getProfile,
  getStoredUser,
  updateStoredUser,
  clearAuthentication,
  isTokenExpired,
  getTimeUntilExpiration
} from '../services/auth';

// ===== CONTEXT TYPES =====

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
  checkSession: () => void;
}

// ===== REDUCER TYPES =====

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_SESSION_TIMEOUT'; payload: number | null };

// ===== REDUCER =====

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
        error: null
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        sessionTimeout: null,
        error: null
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    
    case 'SET_SESSION_TIMEOUT':
      return {
        ...state,
        sessionTimeout: action.payload
      };
    
    default:
      return state;
  }
};

// ===== INITIAL STATE =====

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  sessionTimeout: null,
  error: null
};

// ===== CONTEXT CREATION =====

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== PROVIDER COMPONENT =====

interface AuthProviderProps {
  children: React.ReactNode;
  sessionTimeoutMinutes?: number;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  sessionTimeoutMinutes = 30 
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const sessionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // ===== SESSION MANAGEMENT =====

  const startSessionTimer = useCallback(() => {
    // Clear existing timers
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (!state.isAuthenticated) return;

    const timeUntilExpiration = getTimeUntilExpiration();
    const warningTime = sessionTimeoutMinutes * 60 * 1000; // Convert to milliseconds

    // Set warning timer (5 minutes before expiration)
    if (timeUntilExpiration > warningTime) {
      warningTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'SET_SESSION_TIMEOUT', payload: Date.now() + warningTime });
      }, timeUntilExpiration - warningTime);
    }

    // Set session timeout
    sessionTimeoutRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, timeUntilExpiration);
  }, [state.isAuthenticated, sessionTimeoutMinutes]);

  const resetSessionTimer = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    dispatch({ type: 'SET_SESSION_TIMEOUT', payload: null });
  }, []);

  const handleSessionTimeout = useCallback(async () => {
    console.log('Session timeout, logging out user');
    await logout();
  }, []);

  const checkSession = useCallback(() => {
    if (isTokenExpired()) {
      handleSessionTimeout();
      return;
    }

    if (state.isAuthenticated) {
      startSessionTimer();
    }
  }, [state.isAuthenticated, startSessionTimer, handleSessionTimeout]);

  // ===== AUTHENTICATION OPERATIONS =====

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response: LoginResponse = await authLogin(credentials);
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user: response.user, token: response.token } 
      });
      
      startSessionTimer();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  }, [startSessionTimer]);

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      resetSessionTimer();
      clearAuthentication();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, [resetSessionTimer]);

  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated) return;

    try {
      const user = await getProfile();
      dispatch({ type: 'UPDATE_USER', payload: user });
      updateStoredUser(user);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      // If profile refresh fails, check if token is still valid
      if (isTokenExpired()) {
        await logout();
      }
    }
  }, [state.isAuthenticated, logout]);

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    updateStoredUser(user);
  }, []);

  // ===== EFFECTS =====

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser();
        
        if (storedUser && !isTokenExpired()) {
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { user: storedUser, token: localStorage.getItem('authToken') || '' } 
          });
          startSessionTimer();
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: '' });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'AUTH_FAILURE', payload: 'Failed to initialize authentication' });
      }
    };

    initializeAuth();
  }, [startSessionTimer]);

  // Reset session timer on user activity
  useEffect(() => {
    const handleUserActivity = () => {
      if (state.isAuthenticated) {
        resetSessionTimer();
        startSessionTimer();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [state.isAuthenticated, resetSessionTimer, startSessionTimer]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  // ===== CONTEXT VALUE =====

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
    updateUser,
    checkSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ===== HOOK =====

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// ===== UTILITY HOOKS =====

/**
 * Hook to check if user has specific role
 */
export const useHasRole = (requiredRole: UserRole): boolean => {
  const { user } = useAuth();
  return user?.role === requiredRole;
};

/**
 * Hook to check if user has any of the specified roles
 */
export const useHasAnyRole = (requiredRoles: UserRole[]): boolean => {
  const { user } = useAuth();
  return user ? requiredRoles.includes(user.role) : false;
};

/**
 * Hook to get user's role
 */
export const useUserRole = (): UserRole | null => {
  const { user } = useAuth();
  return user?.role || null;
};

/**
 * Hook to check if user is admin
 */
export const useIsAdmin = (): boolean => {
  return useHasRole(UserRole.ADMIN);
};

/**
 * Hook to check if user is employee
 */
export const useIsEmployee = (): boolean => {
  return useHasRole(UserRole.EMPLOYEE);
}; 