import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl, NETWORK_CONFIG } from '../config/api';

// API Configuration
const API_BASE_URL = getApiUrl();

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    department?: string;
    status: string;
    created_at: string;
  };
  token: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  status: string;
  created_at: string;
}

// API Service Class
class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Get stored token
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Store token
  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  // Remove token
  private async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getToken();
      const url = `${this.baseURL}${endpoint}`;

      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      if (NETWORK_CONFIG.LOG_REQUESTS) {
        console.log(`API Request: ${options.method || 'GET'} ${url}`);
      }
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (NETWORK_CONFIG.LOG_RESPONSES) {
        console.log(`API Response: ${response.status}`, data);
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      // If the backend already returns {success: true, data: ...}, use that structure
      if (data.success !== undefined) {
        return data;
      }

      // Otherwise, wrap the response
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      await this.setToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/profile');
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    const response = await this.getProfile();
    return response.success;
  }

  // Get stored user data
  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // Store user data
  async storeUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  // Remove stored user data
  async removeStoredUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error removing stored user:', error);
    }
  }

  // Chat API methods
  async getChatChannels(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/chat/channels');
  }

  async getChatMessages(channelId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/chat/channels/${channelId}/messages`);
  }

  async sendChatMessage(channelId: string, data: { content: string; messageType?: string }): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/chat/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService(); 