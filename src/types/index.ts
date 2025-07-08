// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  method: 'geolocation' | 'qr' | 'facial';
  status: 'present' | 'absent' | 'late' | 'half-day';
}

// Schedule Types
export interface Shift {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'regular' | 'overtime' | 'night' | 'weekend';
  status: 'scheduled' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  type: 'regular' | 'overtime' | 'night' | 'weekend';
  color: string;
}

// Leave Types
export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  attachments?: string[];
  approvedBy?: string;
  approvedAt?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  maxDays: number;
  color: string;
  requiresApproval: boolean;
}

export interface LeaveBalance {
  userId: string;
  leaveTypeId: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  assignedBy: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  category: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// Communication Types
export interface Message {
  id: string;
  senderId: string;
  receiverId?: string; // For 1:1 messages
  groupId?: string; // For group messages
  content: string;
  type: 'text' | 'image' | 'file';
  attachments?: string[];
  readBy: string[];
  createdAt: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  lastMessage?: Message;
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: string;
  attachments?: string[];
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

// Report Types
export interface Report {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  template: ReportTemplate;
  data: Record<string, any>;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  fields: ReportField[];
  category: string;
}

export interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  required: boolean;
  options?: string[]; // For select fields
  validation?: string;
}

// Journey Plan Types
export interface JourneyPlan {
  id: string;
  userId: string;
  date: string;
  visits: Visit[];
  totalDistance: number;
  estimatedDuration: number;
  status: 'planned' | 'in-progress' | 'completed';
}

export interface Visit {
  id: string;
  location: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  scheduledTime: string;
  actualTime?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  kpis?: Record<string, any>;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  type: 'contract' | 'nda' | 'onboarding' | 'policy' | 'other';
  content: string;
  status: 'draft' | 'pending-signature' | 'signed' | 'archived';
  createdBy: string;
  assignedTo?: string[];
  signatures: Signature[];
  createdAt: string;
  updatedAt: string;
}

export interface Signature {
  id: string;
  userId: string;
  signedAt: string;
  signatureData: string;
}

// Survey Types
export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  targetAudience: string[];
  status: 'draft' | 'active' | 'closed';
  responses: SurveyResponse[];
  createdAt: string;
  expiresAt?: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple-choice' | 'rating' | 'yes-no';
  required: boolean;
  options?: string[];
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  answers: Record<string, any>;
  submittedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  onLeave: number;
  pendingTasks: number;
  completedTasks: number;
  activeReports: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
} 