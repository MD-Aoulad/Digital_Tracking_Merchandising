/**
 * Enhanced Authentication Context - Workforce Management Platform
 * 
 * This context provides authentication and authorization functionality for the application.
 * It manages user sessions, role-based permissions, and authentication state with
 * advanced error handling, timeout management, and retry mechanisms.
 * 
 * Features:
 * - User authentication and session management
 * - Role-based access control (RBAC)
 * - Permission checking for UI components
 * - Backend API integration
 * - Session timeout management (30 minutes inactivity)
 * - Automatic logout on inactivity
 * - Enhanced error handling and retry mechanisms
 * - Service health monitoring
 * - Authentication statistics tracking
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { login as authLogin, logout as authLogout, getProfile, AuthError } from '../services/auth';

// ===== TYPES =====

interface AuthErrorState {
  type: 'timeout' | 'network' | 'credentials' | 'server' | 'validation' | 'unknown';
  message: string;
  retryable: boolean;
  code?: number;
  timestamp: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthErrorState | null;
  sessionTimeout: number;
  retryAttempts: number;
  serviceStatus: 'online' | 'offline' | 'checking';
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  resetSessionTimer: () => void;
  hasPermission: (permission: string) => boolean;
  getAuthStats: () => {
    totalAttempts: number;
    successRate: number;
    lastLoginTime?: string;
  };
}

// ===== CONSTANTS =====

const SESSION_TIMEOUT_MINUTES = 30;
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

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

const convertApiUserToAppUser = (apiUser: any): User => {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.firstName && apiUser.lastName ? `${apiUser.firstName} ${apiUser.lastName}` : apiUser.name || apiUser.email,
    role: apiUser.role === 'admin' ? UserRole.ADMIN : 
          apiUser.role === 'employee' ? UserRole.EDITOR : UserRole.VIEWER,
    department: apiUser.department || 'General',
    position: apiUser.role === 'admin' ? 'System Administrator' : 
              apiUser.role === 'employee' ? 'Employee' : 'Viewer',
    phone: apiUser.phone || '+1234567890'
  };
};

const createAuthError = (error: AuthError): AuthErrorState => {
  return {
    type: error.type,
    message: error.message,
    retryable: error.retryable,
    code: error.code,
    timestamp: Date.now()
  };
};

const logAuthEvent = (event: string, data?: any) => {
  console.log(`🔐 [AUTH CONTEXT] ${event}`, data || '');
  
  // Track authentication events
  const events = JSON.parse(localStorage.getItem('authEvents') || '[]');
  events.push({
    event,
    data,
    timestamp: Date.now()
  });
  
  // Keep only last 100 events
  if (events.length > 100) {
    events.splice(0, events.length - 100);
  }
  
  localStorage.setItem('authEvents', JSON.stringify(events));
};

// ===== MAIN COMPONENT =====

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ===== STATE MANAGEMENT =====
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    sessionTimeout: SESSION_TIMEOUT_MINUTES,
    retryAttempts: 0,
    serviceStatus: 'checking'
  });
  
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // ===== EFFECTS =====

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logAuthEvent('Initializing authentication');
        
        // Check if user is already authenticated
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            const appUser = convertApiUserToAppUser(user);
            
            setState(prev => ({
              ...prev,
              user: appUser,
              isAuthenticated: true,
              isLoading: false
            }));
            
            startSessionTimer();
            logAuthEvent('User authenticated from storage', { userId: appUser.id });
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Check service status periodically
  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        const response = await fetch('http://localhost:3010/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        setState(prev => ({
          ...prev,
          serviceStatus: response.ok ? 'online' : 'offline'
        }));
      } catch (error) {
        setState(prev => ({ ...prev, serviceStatus: 'offline' }));
      }
    };

    const interval = setInterval(checkServiceStatus, 30000); // Check every 30 seconds
    checkServiceStatus(); // Initial check

    return () => clearInterval(interval);
  }, []);

  // ===== SESSION MANAGEMENT =====

  const startSessionTimer = useCallback(() => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    
    const timer = setTimeout(() => {
      logAuthEvent('Session expired - auto logout');
      logout();
    }, SESSION_TIMEOUT_MS);
    
    setSessionTimer(timer);
  }, [sessionTimer]);

  const resetSessionTimer = useCallback(() => {
    if (state.isAuthenticated) {
      startSessionTimer();
    }
  }, [state.isAuthenticated, startSessionTimer]);

  // ===== AUTHENTICATION OPERATIONS =====

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    logAuthEvent('Login attempt', { email });
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      retryAttempts: 0
    }));

    try {
      const response = await authLogin({ email, password });
      const appUser = convertApiUserToAppUser(response.user);
      
      setState(prev => ({
        ...prev,
        user: appUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        retryAttempts: 0
      }));
      
      console.log('🔐 [AUTH CONTEXT] User state updated:', { 
        user: appUser, 
        isAuthenticated: true,
        userId: appUser.id,
        role: appUser.role 
      });
      
      startSessionTimer();
      
      // Track successful login
      const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
      attempts.push({
        email,
        timestamp: Date.now(),
        success: true
      });
      localStorage.setItem('loginAttempts', JSON.stringify(attempts.slice(-10)));
      
      logAuthEvent('Login successful', { userId: appUser.id, email });
      return true;
      
    } catch (error) {
      const authError = error as AuthError;
      const errorState = createAuthError(authError);
      
      // Track failed login
      const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
      attempts.push({
        email,
        timestamp: Date.now(),
        success: false
      });
      localStorage.setItem('loginAttempts', JSON.stringify(attempts.slice(-10)));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorState,
        retryAttempts: prev.retryAttempts + 1
      }));
      
      logAuthEvent('Login failed', { 
        email, 
        error: authError.type, 
        message: authError.message 
      });
      
      return false;
    }
  }, [startSessionTimer]);

  const logout = useCallback(async () => {
    logAuthEvent('Logout initiated');
    
    try {
      await authLogout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
        setSessionTimer(null);
      }
      
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        error: null,
        retryAttempts: 0
      }));
      
      navigate('/login', { replace: true });
      logAuthEvent('Logout completed');
    }
  }, [sessionTimer, navigate]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ===== PERMISSION CHECKING =====

  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user) return false;
    
    const userPermissions = rolePermissions[state.user.role] || [];
    return userPermissions.includes(permission);
  }, [state.user]);

  // ===== STATISTICS =====

  const getAuthStats = useCallback(() => {
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
      lastLoginTime: lastLogin ? new Date(lastLogin.timestamp).toISOString() : undefined
    };
  }, []);

  // ===== CONTEXT VALUE =====

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    resetSessionTimer,
    hasPermission,
    getAuthStats
  };

  return (
    <AuthContext.Provider value={value}>
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
