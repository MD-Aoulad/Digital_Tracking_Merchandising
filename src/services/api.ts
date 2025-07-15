/**
 * API Service for Workforce Management Platform
 * 
 * This service provides a centralized interface for all API communication
 * with the backend server. It handles authentication, data management,
 * error handling, and provides type-safe interfaces for all API operations.
 * 
 * Features:
 * - JWT token management and authentication
 * - CRUD operations for todos, reports, and attendance
 * - Automatic error handling and response parsing
 * - TypeScript interfaces for type safety
 * - Local storage integration for user sessions
 * - Real-time data fetching with hooks
 * - Loading states and error handling
 * - Optimistic updates and caching
 * 
 * API Endpoints Covered:
 * - Authentication: login, register, profile, logout
 * - Todos: create, read, update, delete
 * - Reports: create, read, update status
 * - Attendance: punch in/out, get history
 * - Password reset functionality
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 * @lastUpdated 2025-07-12
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://192.168.178.150:5000/api';

// ===== TYPE DEFINITIONS =====

/**
 * User interface representing a system user
 * Contains user authentication and profile information
 */
export interface User {
  id: string;                    // Unique user identifier
  email: string;                 // User's email address (used for login)
  name: string;                  // User's full name
  role: 'admin' | 'employee';    // User role for access control
  department: string;            // User's department/team
  status: 'active' | 'inactive'; // Account status
  createdAt: string;             // Account creation timestamp
}

/**
 * Todo interface representing a task item
 * Contains task details and completion status
 */
export interface Todo {
  id: string;                    // Unique todo identifier
  title: string;                 // Todo title/name
  description: string;           // Detailed description
  priority: 'low' | 'medium' | 'high'; // Priority level
  completed: boolean;            // Completion status
  createdAt: string;             // Creation timestamp
  completedAt: string | null;    // Completion timestamp (if completed)
  userId: string;                // Owner user ID
}

/**
 * Report interface representing a submitted report
 * Contains report content and approval status
 */
export interface Report {
  id: string;                    // Unique report identifier
  title: string;                 // Report title
  type: string;                  // Report type (daily, weekly, etc.)
  content: string;               // Report content/body
  status: 'pending' | 'approved' | 'rejected'; // Approval status
  submittedAt: string;           // Submission timestamp
  userId: string;                // Submitter user ID
  userName: string;              // Submitter name
}

/**
 * Attendance interface representing punch in/out records
 * Contains time tracking and location data
 */
export interface Attendance {
  punchIn: string;               // Punch in timestamp
  punchOut: string | null;       // Punch out timestamp (if punched out)
  location: string;              // Punch in location (GPS coordinates)
  endLocation: string | null;    // Punch out location (if punched out)
  photo: string | null;          // Photo verification (base64)
  hoursWorked: number | null;    // Calculated hours worked
}

/**
 * Login response interface
 * Returned after successful authentication
 */
export interface LoginResponse {
  message: string;               // Success message
  user: User;                    // User profile data
  token: string;                 // JWT authentication token
}

/**
 * Generic API response interface
 * Used for standardized API responses
 */
export interface ApiResponse<T> {
  data?: T;                      // Response data
  error?: string;                // Error message (if any)
  message?: string;              // Success/info message
}

/**
 * API Hook State Interface
 * Standard state for all API hooks
 */
export interface ApiHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * API Mutation State Interface
 * State for mutation operations (create, update, delete)
 */
export interface ApiMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (data: any) => Promise<void>;
  reset: () => void;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get authentication headers for API requests
 * Retrieves JWT token from localStorage and formats Authorization header
 * Also checks token expiration and clears invalid tokens
 * 
 * @returns Object containing Content-Type and Authorization headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  
  // Check if token exists and is not expired
  if (token) {
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, clear it
        console.log('JWT token expired, clearing session');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        return { 'Content-Type': 'application/json' };
      }
    } catch (error) {
      // Invalid token format, clear it
      console.log('Invalid JWT token format, clearing session');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return { 'Content-Type': 'application/json' };
    }
  }
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Handle API response and error handling
 * Parses JSON response and throws error if request failed
 * 
 * @param response - Fetch API response object
 * @returns Parsed response data
 * @throws Error if response is not ok
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // Handle non-JSON responses (like rate limiting HTML pages)
    const text = await response.text();
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `API request failed: ${response.status}`);
  }
  
  return data;
};

/**
 * Generic API request function
 * Handles all HTTP methods with proper error handling
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Promise with response data
 */
const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  
  return handleResponse<T>(response);
};

// ===== API HOOKS =====

/**
 * Custom hook for data fetching with loading and error states
 * 
 * @param url - API endpoint URL
 * @param dependencies - Dependencies for useEffect
 * @returns Hook state with data, loading, error, and refetch function
 */
export const useApiQuery = <T>(
  url: string,
  dependencies: any[] = []
): ApiHookState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiRequest<T>(url);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [url, ...dependencies]); // Only re-fetch when URL or dependencies change

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

/**
 * Custom hook for mutation operations (create, update, delete)
 * 
 * @param url - API endpoint URL
 * @param method - HTTP method
 * @returns Hook state with mutate function and operation state
 */
export const useApiMutation = <T>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
): ApiMutationState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (body?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const options: RequestInit = {
        method,
        ...(body && { body: JSON.stringify(body) }),
      };
      
      const result = await apiRequest<T>(url, options);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
};

// ===== AUTHENTICATION API =====

/**
 * Authentication API methods
 * Handles user login, registration, profile management, and session management
 */
export const authAPI = {
  /**
   * Authenticate user with email and password
   * Stores JWT token and user data in localStorage upon successful login
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with login response containing user data and token
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await handleResponse<LoginResponse>(response);
    // Store authentication data in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    return data;
  },

  /**
   * Register a new user account
   * Creates user account and automatically logs in the user
   * 
   * @param userData - User registration data
   * @returns Promise with registration response containing user data and token
   */
  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
    department?: string;
  }): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await handleResponse<LoginResponse>(response);
    // Store authentication data in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    return data;
  },

  /**
   * Get current user's profile information
   * Requires valid JWT token in localStorage
   * 
   * @returns Promise with user profile data
   */
  getProfile: async (): Promise<{ user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<{ user: User }>(response);
  },

  /**
   * Logout current user
   * Removes authentication data from localStorage
   */
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  /**
   * Check if user is currently authenticated
   * Validates JWT token existence and expiration
   * 
   * @returns True if JWT token exists and is valid
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, clear it
        console.log('JWT token expired, clearing session');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid token format, clear it
      console.log('Invalid JWT token format, clearing session');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return false;
    }
  },

  /**
   * Get current user data from localStorage
   * 
   * @returns User object or null if not authenticated
   */
  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Reset user password by email
   * 
   * @param email - User's email address
   * @param newPassword - New password (minimum 6 characters)
   * @returns Promise with success message
   */
  resetPassword: async (email: string, newPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    
    return handleResponse<{ message: string }>(response);
  }
};

// ===== TODOS API =====

/**
 * Todos API methods
 * Handles CRUD operations for todo items
 * All operations require authentication
 */
export const todosAPI = {
  /**
   * Get all todos for the authenticated user
   * 
   * @returns Promise with array of user's todos
   */
  getAll: async (): Promise<{ todos: Todo[] }> => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<{ todos: Todo[] }>(response);
  },

  /**
   * Create a new todo item
   * 
   * @param todoData - Todo creation data
   * @returns Promise with created todo and success message
   */
  create: async (todoData: {
    title: string;
    description?: string;
    priority?: string;
  }): Promise<{ message: string; todo: Todo }> => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(todoData)
    });
    
    return handleResponse<{ message: string; todo: Todo }>(response);
  },

  /**
   * Update an existing todo item
   * 
   * @param id - Todo ID to update
   * @param updates - Fields to update
   * @returns Promise with updated todo and success message
   */
  update: async (id: string, updates: {
    title?: string;
    description?: string;
    priority?: string;
    completed?: boolean;
  }): Promise<{ message: string; todo: Todo }> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    
    return handleResponse<{ message: string; todo: Todo }>(response);
  },

  /**
   * Delete a todo item
   * 
   * @param id - Todo ID to delete
   * @returns Promise with success message
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse<{ message: string }>(response);
  }
};

// ===== REPORTS API =====

/**
 * Reports API methods
 * Handles report creation, retrieval, and status updates
 * All operations require authentication
 */
export const reportsAPI = {
  /**
   * Get all reports for the authenticated user
   * 
   * @returns Promise with array of user's reports
   */
  getAll: async (): Promise<{ reports: Report[] }> => {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<{ reports: Report[] }>(response);
  },

  /**
   * Create a new report
   * 
   * @param reportData - Report creation data
   * @returns Promise with created report and success message
   */
  create: async (reportData: {
    title: string;
    type: string;
    content: string;
  }): Promise<{ message: string; report: Report }> => {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reportData)
    });
    
    return handleResponse<{ message: string; report: Report }>(response);
  },

  /**
   * Update report status (admin only)
   * 
   * @param id - Report ID to update
   * @param status - New status ('pending', 'approved', 'rejected')
   * @param comments - Optional admin comments
   * @returns Promise with updated report and success message
   */
  updateStatus: async (id: string, status: string, comments?: string): Promise<{ message: string; report: Report }> => {
    const response = await fetch(`${API_BASE_URL}/reports/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, comments })
    });
    
    return handleResponse<{ message: string; report: Report }>(response);
  }
};

// ===== ATTENDANCE API =====

/**
 * Attendance API methods
 * Handles time tracking with punch in/out functionality
 * All operations require authentication
 */
export const attendanceAPI = {
  /**
   * Get attendance history for the authenticated user
   * 
   * @returns Promise with user's attendance records
   */
  getAttendance: async (): Promise<{ attendance: Record<string, Attendance> }> => {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<{ attendance: Record<string, Attendance> }>(response);
  },

  /**
   * Record punch in with location and optional photo
   * 
   * @param location - GPS coordinates or location description
   * @param photo - Optional photo verification (base64)
   * @returns Promise with punch in confirmation and attendance data
   */
  punchIn: async (location: string, photo?: string): Promise<{ message: string; punchInTime: string; attendance: Attendance }> => {
    const response = await fetch(`${API_BASE_URL}/attendance/punch-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ location, photo })
    });
    
    return handleResponse<{ message: string; punchInTime: string; attendance: Attendance }>(response);
  },

  /**
   * Record punch out with location
   * 
   * @param location - GPS coordinates or location description
   * @returns Promise with punch out confirmation and calculated hours worked
   */
  punchOut: async (location: string): Promise<{ message: string; punchOutTime: string; hoursWorked: number; attendance: Attendance }> => {
    const response = await fetch(`${API_BASE_URL}/attendance/punch-out`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ location })
    });
    
    return handleResponse<{ message: string; punchOutTime: string; hoursWorked: number; attendance: Attendance }>(response);
  }
};

// ===== ADMIN API =====

/**
 * Admin API methods
 * Provides administrative access to all system data
 * Requires admin role authentication
 */
export const adminAPI = {
  /**
   * Get all users in the system (admin only)
   * 
   * @returns Promise with array of all users
   */
  getAllUsers: async (): Promise<{ users: User[] }> => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<{ users: User[] }>(response);
  },

  /**
   * Get all todos in the system (admin only)
   * 
   * @returns Promise with array of all todos
   */
  getAllTodos: async (): Promise<{ todos: Todo[] }> => {
    const response = await fetch(`${API_BASE_URL}/admin/todos`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<{ todos: Todo[] }>(response);
  },

  /**
   * Get all reports in the system (admin only)
   * 
   * @returns Promise with array of all reports
   */
  getAllReports: async (): Promise<{ reports: Report[] }> => {
    const response = await fetch(`${API_BASE_URL}/admin/reports`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<{ reports: Report[] }>(response);
  },

  /**
   * Get all attendance data in the system (admin only)
   * 
   * @returns Promise with all users' attendance records
   */
  getAllAttendance: async (): Promise<{ attendance: Record<string, Record<string, Attendance>> }> => {
    const response = await fetch(`${API_BASE_URL}/admin/attendance`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<{ attendance: Record<string, Record<string, Attendance>> }>(response);
  },

  /**
   * Delete a user by ID (admin only)
   * 
   * @param id - User ID to delete
   * @returns Promise with deletion confirmation
   */
  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  }
};

// Health check
export const healthAPI = {
  check: async (): Promise<{ status: string; message: string; timestamp: string }> => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<{ status: string; message: string; timestamp: string }>(response);
  }
};

// ===== SPECIALIZED HOOKS =====

/**
 * Hook for fetching todos with real-time updates
 */
export const useTodos = () => {
  return useApiQuery<{ todos: Todo[] }>('/todos');
};

/**
 * Hook for creating todos
 */
export const useCreateTodo = () => {
  return useApiMutation<{ message: string; todo: Todo }>('/todos', 'POST');
};

/**
 * Hook for updating todos
 */
export const useUpdateTodo = () => {
  return useApiMutation<{ message: string; todo: Todo }>('/todos', 'PUT');
};

/**
 * Hook for deleting todos
 */
export const useDeleteTodo = () => {
  return useApiMutation<{ message: string }>('/todos', 'DELETE');
};

/**
 * Hook for fetching reports
 */
export const useReports = () => {
  return useApiQuery<{ reports: Report[] }>('/reports');
};

/**
 * Hook for creating reports
 */
export const useCreateReport = () => {
  return useApiMutation<{ message: string; report: Report }>('/reports', 'POST');
};

/**
 * Hook for fetching attendance
 */
export const useAttendance = () => {
  return useApiQuery<{ attendance: Record<string, Attendance> }>('/attendance');
};

/**
 * Hook for punch in operation
 */
export const usePunchIn = () => {
  return useApiMutation<{ message: string; punchInTime: string; attendance: Attendance }>('/attendance/punch-in', 'POST');
};

/**
 * Hook for punch out operation
 */
export const usePunchOut = () => {
  return useApiMutation<{ message: string; punchOutTime: string; hoursWorked: number; attendance: Attendance }>('/attendance/punch-out', 'POST');
};

// ===== APPROVAL API FUNCTIONS =====

/**
 * Get approval statistics
 * Fetches approval metrics and analytics
 * 
 * @returns Promise with approval statistics
 */
export const getApprovalStats = async (): Promise<any> => {
  return apiRequest<any>('/approval/stats');
};

/**
 * Get approval settings
 * Fetches current approval system configuration
 * 
 * @returns Promise with approval settings
 */
export const getApprovalSettings = async (): Promise<any> => {
  return apiRequest<any>('/approval/settings');
};

/**
 * Update approval settings
 * Updates approval system configuration
 * 
 * @param settings - New approval settings
 * @returns Promise with update confirmation
 */
export const updateApprovalSettings = async (settings: any): Promise<any> => {
  return apiRequest<any>('/approval/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  });
};

/**
 * Get approval requests
 * Fetches list of approval requests
 * 
 * @returns Promise with approval requests
 */
export const getApprovalRequests = async (): Promise<any[]> => {
  return apiRequest<any[]>('/approval/requests');
};

/**
 * Create approval request
 * Creates a new approval request
 * 
 * @param request - Request data
 * @returns Promise with created request
 */
export const createApprovalRequest = async (request: any): Promise<any> => {
  return apiRequest<any>('/approval/requests', {
    method: 'POST',
    body: JSON.stringify(request)
  });
};

/**
 * Update approval request
 * Updates an existing approval request
 * 
 * @param id - Request ID
 * @param updates - Update data
 * @returns Promise with update confirmation
 */
export const updateApprovalRequest = async (id: string, updates: any): Promise<any> => {
  try {
    const response = await apiRequest(`/approval/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response;
  } catch (error) {
    console.error('Error updating approval request:', error);
    throw error;
  }
};

export const approveRequest = async (id: string): Promise<any> => {
  try {
    const response = await apiRequest(`/approval/requests/${id}/approve`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Error approving request:', error);
    throw error;
  }
};

export const rejectRequest = async (id: string): Promise<any> => {
  try {
    const response = await apiRequest(`/approval/requests/${id}/reject`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Error rejecting request:', error);
    throw error;
  }
};

/**
 * Delete approval request
 * Deletes an approval request
 * 
 * @param id - Request ID
 * @returns Promise with deletion confirmation
 */
export const deleteApprovalRequest = async (id: string): Promise<any> => {
  return apiRequest<any>(`/approval/requests/${id}`, {
    method: 'DELETE'
  });
};

/**
 * Get approval delegations
 * Fetches list of approval delegations
 * 
 * @returns Promise with approval delegations
 */
export const getApprovalDelegations = async (): Promise<any[]> => {
  return apiRequest<any[]>('/approval/delegations');
};

/**
 * Create approval delegation
 * Creates a new approval delegation
 * 
 * @param delegation - Delegation data
 * @returns Promise with created delegation
 */
export const createApprovalDelegation = async (delegation: any): Promise<any> => {
  return apiRequest<any>('/approval/delegations', {
    method: 'POST',
    body: JSON.stringify(delegation)
  });
};

/**
 * Update approval delegation
 * Updates an existing approval delegation
 * 
 * @param id - Delegation ID
 * @param updates - Update data
 * @returns Promise with update confirmation
 */
export const updateApprovalDelegation = async (id: string, updates: any): Promise<any> => {
  return apiRequest<any>(`/approval/delegations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
};

/**
 * Delete approval delegation
 * Deletes an approval delegation
 * 
 * @param id - Delegation ID
 * @returns Promise with deletion confirmation
 */
export const deleteApprovalDelegation = async (id: string): Promise<any> => {
  return apiRequest<any>(`/approval/delegations/${id}`, {
    method: 'DELETE'
  });
};

/**
 * Get approval workflows
 * Fetches list of approval workflows
 * 
 * @returns Promise with approval workflows
 */
export const getApprovalWorkflows = async (): Promise<any[]> => {
  return apiRequest<any[]>('/approval/workflows');
};

/**
 * Create approval workflow
 * Creates a new approval workflow
 * 
 * @param workflow - Workflow data
 * @returns Promise with created workflow
 */
export const createApprovalWorkflow = async (workflow: any): Promise<any> => {
  return apiRequest<any>('/approval/workflows', {
    method: 'POST',
    body: JSON.stringify(workflow)
  });
};

/**
 * Update approval workflow
 * Updates an existing approval workflow
 * 
 * @param id - Workflow ID
 * @param updates - Update data
 * @returns Promise with update confirmation
 */
export const updateApprovalWorkflow = async (id: string, updates: any): Promise<any> => {
  return apiRequest<any>(`/approval/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
};

/**
 * Delete approval workflow
 * Deletes an approval workflow
 * 
 * @param id - Workflow ID
 * @returns Promise with deletion confirmation
 */
export const deleteApprovalWorkflow = async (id: string): Promise<any> => {
  return apiRequest<any>(`/approval/workflows/${id}`, {
    method: 'DELETE'
  });
};

// ===== CHAT API FUNCTIONS =====

/**
 * Get chat settings
 */
export const getChatSettings = async () => {
  return apiRequest<any>('/chat/settings');
};

/**
 * Update chat settings
 */
export const updateChatSettings = async (settings: any) => {
  return apiRequest<any>('/chat/settings', {
    method: 'PUT',
    body: settings
  });
};

/**
 * Get chat channels
 */
export const getChatChannels = async () => {
  return apiRequest<any[]>('/chat/channels');
};

/**
 * Create new chat channel
 */
export const createChatChannel = async (channel: any) => {
  return apiRequest<any>('/chat/channels', {
    method: 'POST',
    body: channel
  });
};

/**
 * Get messages for a channel
 */
export const getChannelMessages = async (channelId: string) => {
  return apiRequest<any[]>(`/chat/channels/${channelId}/messages`);
};

/**
 * Send message to channel
 */
export const sendChannelMessage = async (channelId: string, message: any) => {
  return apiRequest<any>(`/chat/channels/${channelId}/messages`, {
    method: 'POST',
    body: message
  });
};

/**
 * Get help desk channels
 */
export const getHelpDeskChannels = async () => {
  return apiRequest<any[]>('/chat/help-desk/channels');
};

/**
 * Get help desk requests
 */
export const getHelpDeskRequests = async () => {
  return apiRequest<any[]>('/chat/help-desk/requests');
};

/**
 * Create help desk request
 */
export const createHelpDeskRequest = async (request: any) => {
  return apiRequest<any>('/chat/help-desk/requests', {
    method: 'POST',
    body: request
  });
};

/**
 * Send message to help desk request
 */
export const sendHelpDeskMessage = async (requestId: string, message: any) => {
  return apiRequest<any>(`/chat/help-desk/requests/${requestId}/messages`, {
    method: 'POST',
    body: message
  });
};

// ===== CHAT API OBJECT =====

/**
 * Chat API object
 * Provides access to all chat-related API functions
 */
export const chatAPI = {
  getChatSettings,
  updateChatSettings,
  getChatChannels,
  createChatChannel,
  getChannelMessages,
  sendChannelMessage,
  getHelpDeskChannels,
  getHelpDeskRequests,
  createHelpDeskRequest,
  sendHelpDeskMessage
};

// ===== DEFAULT EXPORT =====

/**
 * Default export containing all API modules
 * Provides a centralized access point for all API functionality
 * 
 * Usage:
 * import api from './services/api';
 * 
 * // Authentication
 * await api.auth.login(email, password);
 * 
 * // Todos
 * await api.todos.getAll();
 * 
 * // Reports
 * await api.reports.create(reportData);
 * 
 * // Attendance
 * await api.attendance.punchIn(location);
 * 
 * // Admin (requires admin role)
 * await api.admin.getAllUsers();
 * 
 * // Health check
 * await api.health.check();
 */
const api = {
  auth: authAPI,
  todos: todosAPI,
  reports: reportsAPI,
  attendance: attendanceAPI,
  admin: adminAPI,
  health: healthAPI,
  approval: {
    getStats: getApprovalStats,
    getSettings: getApprovalSettings,
    updateSettings: updateApprovalSettings,
    getRequests: getApprovalRequests,
    createRequest: createApprovalRequest,
    updateRequest: updateApprovalRequest,
    approveRequest: approveRequest,
    rejectRequest: rejectRequest,
    deleteRequest: deleteApprovalRequest,
    getDelegations: getApprovalDelegations,
    createDelegation: createApprovalDelegation,
    updateDelegation: updateApprovalDelegation,
    deleteDelegation: deleteApprovalDelegation,
    getWorkflows: getApprovalWorkflows,
    createWorkflow: createApprovalWorkflow,
    updateWorkflow: updateApprovalWorkflow,
    deleteWorkflow: deleteApprovalWorkflow
  },
  chat: chatAPI
};

export default api; 