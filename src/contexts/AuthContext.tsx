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
 * - Mock user data for demonstration
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

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
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Mock User Data
 * 
 * Sample user data for demonstration purposes. In production, this would be
 * replaced with actual API calls to a backend authentication service.
 */
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    department: 'Management',
    position: 'System Administrator',
    phone: '+1234567890'
  },
  {
    id: '2',
    email: 'editor@company.com',
    name: 'Editor User',
    role: UserRole.EDITOR,
    department: 'Operations',
    position: 'Operations Manager',
    phone: '+1234567891'
  },
  {
    id: '3',
    email: 'viewer@company.com',
    name: 'Viewer User',
    role: UserRole.VIEWER,
    department: 'Sales',
    position: 'Sales Representative',
    phone: '+1234567892'
  }
];

/**
 * Role-Based Permission Mapping
 * 
 * Defines the permissions available to each user role. This implements
 * a Role-Based Access Control (RBAC) system where permissions are
 * granted based on user roles.
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

  /**
   * Initialize authentication state on component mount
   * Checks for existing user session in localStorage
   */
  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Auto-login as admin for development/demo
      const adminUser = mockUsers.find(u => u.role === UserRole.ADMIN);
      if (adminUser) {
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Authenticate user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise<boolean> - True if authentication successful, false otherwise
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication logic - in production, this would call an API
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'password') { // Simple mock password for demo
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  /**
   * Logout current user and clear session
   * Removes user data from state and localStorage
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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

  // Context value object
  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    hasPermission
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
