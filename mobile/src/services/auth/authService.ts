// Authentication Service for Workforce Management Platform Mobile App
// Handles login, logout, and user session management

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { API_CONFIG } from '../api/config';
import { User, AuthState } from '../../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Initialize auth state from storage
  async initialize(): Promise<AuthState> {
    try {
      const [token, userData] = await AsyncStorage.multiGet([
        'auth_token',
        'user_data',
      ]);

      const tokenValue = token[1];
      const userValue = userData[1];

      if (tokenValue && userValue) {
        const user: User = JSON.parse(userValue);
        this.authState = {
          user,
          token: tokenValue,
          isAuthenticated: true,
          isLoading: false,
        };
      } else {
        this.authState = {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        };
      }

      this.notifyListeners();
      return this.authState;
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.authState.isLoading = false;
      this.notifyListeners();
      return this.authState;
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthState> {
    try {
      this.authState.isLoading = true;
      this.notifyListeners();

      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;

        // Store tokens and user data
        await AsyncStorage.multiSet([
          ['auth_token', token],
          ['refresh_token', refreshToken],
          ['user_data', JSON.stringify(user)],
        ]);

        this.authState = {
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        };

        this.notifyListeners();
        return this.authState;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      this.authState.isLoading = false;
      this.notifyListeners();
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
      ]);

      // Reset auth state
      this.authState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

      this.notifyListeners();
    }
  }

  // Get current user profile
  async getProfile(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>(API_CONFIG.ENDPOINTS.PROFILE);
      
      if (response.success && response.data) {
        // Update stored user data
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
        
        this.authState.user = response.data;
        this.notifyListeners();
        
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  // Get current auth state
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener({ ...this.authState });
    });
  }

  // Update user data (e.g., after profile update)
  updateUser(user: User): void {
    this.authState.user = user;
    AsyncStorage.setItem('user_data', JSON.stringify(user));
    this.notifyListeners();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
export default authService;
