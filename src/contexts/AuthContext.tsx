import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
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

// Permission mapping
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
    'surveys:manage'
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication logic
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'password') { // Simple mock password
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  };

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 