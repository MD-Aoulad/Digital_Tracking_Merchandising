// Core types for Workforce Management Platform Mobile App
// These types match the web platform for consistency

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

export interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contactPerson?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  storeId?: string;
  priority: 'low' | 'medium' | 'high';
  status: TaskStatus;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface PunchIn {
  id: string;
  userId: string;
  storeId: string;
  punchInTime: string;
  punchOutTime?: string;
  latitude: number;
  longitude: number;
  notes?: string;
  photos?: string[];
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  userId: string;
  storeId?: string;
  taskId?: string;
  title: string;
  content: string;
  photos?: string[];
  status: ReportStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  isOnline: boolean;
  lastSync: string | null;
  pendingActions: string[];
}
