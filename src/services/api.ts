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

const API_BASE_URL = 'http://localhost:5000/api';

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

// ===== UTILITY FUNCTIONS =====

/**
 * Get authentication headers for API requests
 * Retrieves JWT token from localStorage and formats Authorization header
 * 
 * @returns Object containing Content-Type and Authorization headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
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
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
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
   * 
   * @returns True if JWT token exists in localStorage
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
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
  }
};

// Health check
export const healthAPI = {
  check: async (): Promise<{ status: string; message: string; timestamp: string }> => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<{ status: string; message: string; timestamp: string }>(response);
  }
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
export default {
  auth: authAPI,
  todos: todosAPI,
  reports: reportsAPI,
  attendance: attendanceAPI,
  admin: adminAPI,
  health: healthAPI
}; 