import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '../services/api';

// Auth context interface
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user session on app start
  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      // Check if user is authenticated with the backend
      const isAuthenticated = await apiService.isAuthenticated();
      
      if (isAuthenticated) {
        // Get user profile from backend
        const profileResponse = await apiService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data.user);
          await apiService.storeUser(profileResponse.data.user);
        }
      } else {
        // Fallback to stored user data
        const storedUser = await apiService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }
    } catch (error) {
      console.error('Error checking user session:', error);
      // Fallback to stored user data on error
      try {
        const storedUser = await apiService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (fallbackError) {
        console.error('Error getting stored user:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Mobile login attempt:', { email, password });
    setIsLoading(true);
    
    try {
      const response = await apiService.login(email, password);
      console.log('Login response:', response);
      
      if (response.success && response.data) {
        console.log('Login successful for:', email);
        setUser(response.data.user);
        await apiService.storeUser(response.data.user);
        setIsLoading(false);
        return true;
      }
      
      console.log('Login failed for:', email, response.error);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await apiService.logout();
      await apiService.removeStoredUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 