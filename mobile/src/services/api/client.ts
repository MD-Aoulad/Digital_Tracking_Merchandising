// API Client for Workforce Management Platform Mobile App
// Handles HTTP requests with authentication and error handling

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, getApiConfig } from './config';
import { ApiResponse } from '../../types';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    const config = getApiConfig();
    
    this.client = axios.create({
      baseURL: config.BASE_URL,
      timeout: config.TIMEOUT,
      headers: config.DEFAULT_HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.client.post(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, {
                refreshToken,
              });

              const { token } = response.data;
              await AsyncStorage.setItem('auth_token', token);
              
              // Retry failed requests
              this.failedQueue.forEach(({ resolve }) => resolve());
              this.failedQueue = [];

              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user']);
            // You might want to navigate to login screen here
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // File upload method
  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse<any> {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.message || 'Server error occurred',
        data: error.response.data,
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    } else {
      // Other error
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
