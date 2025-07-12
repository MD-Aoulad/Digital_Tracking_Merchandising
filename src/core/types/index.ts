/**
 * Core Type Definitions
 * 
 * This module contains all shared type definitions used across the application.
 * Centralizing types here ensures consistency and makes maintenance easier.
 */

// ===== USER & AUTHENTICATION TYPES =====

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  LEADER = 'leader'
}

export enum MemberRole {
  MEMBER = 'member',
  LEADER = 'leader',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  status: 'active' | 'inactive';
  createdAt: string;
  avatar?: string;
  phone?: string;
  location?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionTimeout: number | null;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface ApiMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (data: any) => Promise<T>;
  reset: () => void;
}

// ===== TODO TYPES =====

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  userId: string;
  dueDate?: string;
  tags?: string[];
  assignedTo?: string;
}

export interface CreateTodoRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  assignedTo?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
  dueDate?: string;
  tags?: string[];
  assignedTo?: string;
}

// ===== REPORT TYPES =====

export interface Report {
  id: string;
  title: string;
  type: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  userId: string;
  userName: string;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
}

export interface CreateReportRequest {
  title: string;
  type: string;
  content: string;
}

export interface UpdateReportRequest {
  title?: string;
  type?: string;
  content?: string;
  status?: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

// ===== ATTENDANCE TYPES =====

export interface Attendance {
  id: string;
  userId: string;
  punchIn: string;
  punchOut: string | null;
  location: string;
  endLocation: string | null;
  photo: string | null;
  hoursWorked: number | null;
  status: 'active' | 'completed';
  notes?: string;
}

export interface PunchInRequest {
  location: string;
  photo?: string;
  notes?: string;
}

export interface PunchOutRequest {
  location: string;
  photo?: string;
  notes?: string;
}

// ===== GROUP & MEMBER TYPES =====

export interface Group {
  id: string;
  name: string;
  description: string;
  type: 'department' | 'team' | 'project';
  parentId?: string;
  leaderId?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  userId: string;
  groupId: string;
  role: MemberRole;
  joinedAt: string;
  user: User;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
  type: 'department' | 'team' | 'project';
  parentId?: string;
  leaderId?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  type?: 'department' | 'team' | 'project';
  parentId?: string;
  leaderId?: string;
}

// ===== WORKPLACE TYPES =====

export interface Workplace {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  type: 'office' | 'warehouse' | 'retail' | 'field';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Area {
  id: string;
  name: string;
  workplaceId: string;
  description: string;
  capacity: number;
  status: 'active' | 'inactive';
}

export interface Distributor {
  id: string;
  name: string;
  code: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

// ===== JOURNEY PLAN TYPES =====

export interface JourneyPlan {
  id: string;
  title: string;
  description: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  locations: JourneyLocation[];
  createdAt: string;
  updatedAt: string;
}

export interface JourneyLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  scheduledTime: string;
  duration: number; // in minutes
  status: 'pending' | 'visited' | 'skipped';
  notes?: string;
}

// ===== LEAVE TYPES =====

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  createdAt: string;
  user: User;
}

export interface CreateLeaveRequest {
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  reason: string;
}

// ===== POSTING BOARD TYPES =====

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: 'announcement' | 'update' | 'reminder' | 'news';
  priority: 'low' | 'medium' | 'high';
  isPinned: boolean;
  isPublished: boolean;
  publishedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  category: 'announcement' | 'update' | 'reminder' | 'news';
  priority: 'low' | 'medium' | 'high';
  isPinned?: boolean;
  expiresAt?: string;
}

// ===== NAVIGATION TYPES =====

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current: boolean;
  badge?: string;
  children?: NavItem[];
  requiredRole?: UserRole[];
}

// ===== FORM TYPES =====

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormState {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

// ===== NOTIFICATION TYPES =====

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// ===== SETTINGS TYPES =====

export interface AppSettings {
  companyName: string;
  companyLogo?: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableNotifications: boolean;
  enableLocationTracking: boolean;
  enablePhotoVerification: boolean;
}

// ===== EXPORT ALL TYPES =====

// All types are defined in this file for now
// In the future, these can be split into separate modules as needed 