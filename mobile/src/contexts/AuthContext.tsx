/**
 * Authentication Context - Mobile Workforce Management App
 * 
 * This context provides authentication and authorization functionality for the mobile application.
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
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * User Role Enum
 */
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

/**
 * User Interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  position?: string;
  phone?: string;
  token?: string;
}

/**
 * Authentication Context Type Definition
 */
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  error: string | null;
  clearError: () => void;
  sessionTimeout: number;
  resetSessionTimer: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout configuration (30 minutes)
const SESSION_TIMEOUT_MINUTES = 30;
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;

/**
 * Role-Based Permission Mapping
 */
const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'dashboard:view',
    'attendance:view',
    'attendance:manage',
    'schedule:view',
    'schedule:manage',
    'leave:view',
    'leave:manage',
    'tasks:view',
    'tasks:manage',
    'chat:view',
    'chat:manage',
    'reports:view',
    'reports:manage',
    'documents:view',
    'documents:manage',
    'operations:view',
    'operations:manage',
    'surveys:view',
    'surveys:manage',
    'users:manage',
    'settings:manage'
  ],
  [UserRole.EDITOR]: [
    'dashboard:view',
    'attendance:view',
    'attendance:manage',
    'schedule:view',
    'schedule:manage',
    'leave:view',
    'leave:manage',
    'tasks:view',
    'tasks:manage',
    'chat:view',
    'chat:manage',
    'reports:view',
    'reports:manage',
    'documents:view',
    'documents:manage',
    'surveys:view',
    'surveys:manage',
    'operations:view',
    'operations:manage'
  ],
  [UserRole.VIEWER]: [
    'dashboard:view',
    'attendance:view',
    'schedule:view',
    'leave:view',
    'tasks:view',
    'chat:view',
    'reports:view',
    'documents:view',
    'surveys:view'
  ]
};

/**
 * Convert API User to App User
 */
const convertApiUserToAppUser = (apiUser: any): User => {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role === 'admin' ? UserRole.ADMIN : 
          apiUser.role === 'employee' ? UserRole.EDITOR : UserRole.VIEWER,
    department: apiUser.department,
    position: apiUser.role === 'admin' ? 'System Administrator' : 
              apiUser.role === 'employee' ? 'Employee' : 'Viewer',
    phone: '+1234567890',
    token: apiUser.token
  };
};

/**
 * AuthProvider Component
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimeout] = useState<number>(SESSION_TIMEOUT_MINUTES);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  const API_BASE_URL = 'http://192.168.178.150:5000/api';

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    console.log('Logging out user...');
    setUser(null);
    setError(null);
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
    
    // Clear stored user data
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
    } catch (err) {
      console.error('Error clearing storage:', err);
    }
  }, [sessionTimer]);

  /**
   * Start session timeout timer
   */
  const startSessionTimer = useCallback(() => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    
    const timer = setTimeout(() => {
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
   * Initialize authentication on app start
   */
  const initializeAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser({ ...userData, token: storedToken });
        // Start session timer after setting user
        setTimeout(() => {
          if (sessionTimer) {
            clearTimeout(sessionTimer);
          }
          const timer = setTimeout(() => {
            console.log('Session expired due to inactivity. Auto-logout initiated.');
            logout();
          }, SESSION_TIMEOUT_MS);
          setSessionTimer(timer);
        }, 0);
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login function
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    console.log('🔐 Mobile Login Attempt:', { email, API_BASE_URL });
    
    try {
      console.log('📡 Making login request to:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      const data = await response.json();
      console.log('📡 Response data:', data);

      if (!response.ok) {
        console.log('❌ Login failed:', data);
        throw new Error(data.message || 'Login failed');
      }

      console.log('✅ Login successful, processing user data');
      const userData = convertApiUserToAppUser(data.user);
      userData.token = data.token;
      
      setUser(userData);

      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', data.token);

      console.log('✅ User data stored, login complete');
      
      // Start session timer after successful login
      setTimeout(() => {
        if (sessionTimer) {
          clearTimeout(sessionTimer);
        }
        const timer = setTimeout(() => {
          console.log('Session expired due to inactivity. Auto-logout initiated.');
          logout();
        }, SESSION_TIMEOUT_MS);
        setSessionTimer(timer);
      }, 0);

      return true;
    } catch (err) {
      console.log('❌ Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user has permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(permission) || false;
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Cleanup session timer on unmount
  useEffect(() => {
    return () => {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  }, [sessionTimer]);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    hasPermission,
    error,
    clearError,
    sessionTimeout,
    resetSessionTimer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 