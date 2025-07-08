/**
 * TypeScript Type Definitions - Workforce Management Platform
 * 
 * This file contains all TypeScript interfaces and types used throughout the application.
 * It provides type safety and IntelliSense support for the entire codebase.
 * 
 * Categories:
 * - User and Authentication
 * - Attendance Management
 * - Schedule Management
 * - Leave Management
 * - Task Management
 * - Communication
 * - Reports and Analytics
 * - Journey Planning
 * - Document Management
 * - Surveys and Feedback
 * - Notifications
 * - Dashboard and Analytics
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

// ============================================================================
// USER AND AUTHENTICATION TYPES
// ============================================================================

/**
 * User interface representing an authenticated user in the system
 */
export interface User {
  id: string;                    // Unique user identifier
  email: string;                 // User's email address (used for login)
  name: string;                  // User's full name
  role: UserRole;                // User's role in the system
  avatar?: string;               // Optional profile picture URL
  department?: string;           // User's department
  position?: string;             // User's job position
  phone?: string;                // User's phone number
}

/**
 * User role enumeration defining available roles in the system
 * Implements Role-Based Access Control (RBAC)
 */
export enum UserRole {
  ADMIN = 'admin',               // Full system access
  EDITOR = 'editor',             // Limited management access
  VIEWER = 'viewer'              // Read-only access
}

// ============================================================================
// ATTENDANCE MANAGEMENT TYPES
// ============================================================================

/**
 * Attendance record for tracking employee check-ins and check-outs
 */
export interface AttendanceRecord {
  id: string;                    // Unique attendance record ID
  userId: string;                // Associated user ID
  date: string;                  // Date of attendance (YYYY-MM-DD)
  clockIn?: string;              // Clock-in time (HH:MM)
  clockOut?: string;             // Clock-out time (HH:MM)
  location?: {                   // GPS location data
    lat: number;                 // Latitude
    lng: number;                 // Longitude
    address: string;             // Human-readable address
  };
  method: 'geolocation' | 'qr' | 'facial';  // Authentication method used
  status: 'present' | 'absent' | 'late' | 'half-day';  // Attendance status
}

// ============================================================================
// SCHEDULE MANAGEMENT TYPES
// ============================================================================

/**
 * Individual work shift assignment
 */
export interface Shift {
  id: string;                    // Unique shift ID
  userId: string;                // Employee assigned to shift
  date: string;                  // Shift date (YYYY-MM-DD)
  startTime: string;             // Shift start time (HH:MM)
  endTime: string;               // Shift end time (HH:MM)
  type: 'regular' | 'overtime' | 'night' | 'weekend';  // Shift type
  status: 'scheduled' | 'approved' | 'completed' | 'cancelled';  // Shift status
  notes?: string;                // Additional notes
}

/**
 * Reusable shift template for creating consistent schedules
 */
export interface ShiftTemplate {
  id: string;                    // Template ID
  name: string;                  // Template name
  startTime: string;             // Default start time
  endTime: string;               // Default end time
  type: 'regular' | 'overtime' | 'night' | 'weekend';  // Shift type
  color: string;                 // Color for UI display
}

// ============================================================================
// LEAVE MANAGEMENT TYPES
// ============================================================================

/**
 * Employee leave request
 */
export interface LeaveRequest {
  id: string;                    // Unique request ID
  userId: string;                // Employee requesting leave
  type: LeaveType;               // Type of leave
  startDate: string;             // Leave start date
  endDate: string;               // Leave end date
  reason: string;                // Reason for leave
  status: 'pending' | 'approved' | 'rejected';  // Request status
  attachments?: string[];        // Supporting documents
  approvedBy?: string;           // Approver's user ID
  approvedAt?: string;           // Approval timestamp
}

/**
 * Leave type configuration
 */
export interface LeaveType {
  id: string;                    // Leave type ID
  name: string;                  // Leave type name (e.g., "Vacation", "Sick Leave")
  maxDays: number;               // Maximum days allowed per year
  color: string;                 // Color for UI display
  requiresApproval: boolean;     // Whether approval is required
}

/**
 * Employee's leave balance tracking
 */
export interface LeaveBalance {
  userId: string;                // Employee ID
  leaveTypeId: string;           // Leave type ID
  totalDays: number;             // Total days allocated
  usedDays: number;              // Days used
  remainingDays: number;         // Days remaining
}

// ============================================================================
// TASK MANAGEMENT TYPES
// ============================================================================

/**
 * Task assignment and tracking
 */
export interface Task {
  id: string;                    // Unique task ID
  title: string;                 // Task title
  description: string;           // Task description
  assignedTo: string[];          // Array of assigned user IDs
  assignedBy: string;            // User who created the task
  dueDate: string;               // Task due date
  priority: 'low' | 'medium' | 'high' | 'urgent';  // Task priority
  status: 'todo' | 'in-progress' | 'review' | 'completed';  // Task status
  category: string;              // Task category
  attachments?: string[];        // Related files
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Task category for organization
 */
export interface TaskCategory {
  id: string;                    // Category ID
  name: string;                  // Category name
  color: string;                 // Color for UI display
  description?: string;          // Category description
}

// ============================================================================
// COMMUNICATION TYPES
// ============================================================================

/**
 * Individual message in chat system
 */
export interface Message {
  id: string;                    // Message ID
  senderId: string;              // Sender's user ID
  receiverId?: string;           // Receiver's user ID (for 1:1 messages)
  groupId?: string;              // Group ID (for group messages)
  content: string;               // Message content
  type: 'text' | 'image' | 'file';  // Message type
  attachments?: string[];        // File attachments
  readBy: string[];              // Array of user IDs who read the message
  createdAt: string;             // Message timestamp
}

/**
 * Chat group for team communication
 */
export interface ChatGroup {
  id: string;                    // Group ID
  name: string;                  // Group name
  members: string[];             // Array of member user IDs
  createdBy: string;             // Group creator's user ID
  createdAt: string;             // Creation timestamp
  lastMessage?: Message;         // Most recent message
}

/**
 * Team post/announcement
 */
export interface Post {
  id: string;                    // Post ID
  authorId: string;              // Author's user ID
  title: string;                 // Post title
  content: string;               // Post content
  category: string;              // Post category
  attachments?: string[];        // File attachments
  likes: string[];               // Array of user IDs who liked the post
  comments: Comment[];           // Array of comments
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Comment on a post
 */
export interface Comment {
  id: string;                    // Comment ID
  postId: string;                // Associated post ID
  authorId: string;              // Comment author's user ID
  content: string;               // Comment content
  createdAt: string;             // Creation timestamp
}

// ============================================================================
// REPORT TYPES
// ============================================================================

/**
 * Report submission
 */
export interface Report {
  id: string;                    // Report ID
  title: string;                 // Report title
  description: string;           // Report description
  assignedTo: string[];          // Users assigned to complete report
  template: ReportTemplate;      // Report template used
  data: Record<string, any>;     // Report data
  status: 'draft' | 'submitted' | 'approved' | 'rejected';  // Report status
  submittedAt?: string;          // Submission timestamp
  approvedBy?: string;           // Approver's user ID
  approvedAt?: string;           // Approval timestamp
}

/**
 * Report template for consistent reporting
 */
export interface ReportTemplate {
  id: string;                    // Template ID
  name: string;                  // Template name
  description: string;           // Template description
  fields: ReportField[];         // Array of form fields
  category: string;              // Template category
}

/**
 * Individual field in a report template
 */
export interface ReportField {
  id: string;                    // Field ID
  name: string;                  // Field name
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file';  // Field type
  required: boolean;             // Whether field is required
  options?: string[];            // Options for select fields
  validation?: string;           // Validation rules
}

// ============================================================================
// JOURNEY PLAN TYPES
// ============================================================================

/**
 * Field team journey plan
 */
export interface JourneyPlan {
  id: string;                    // Journey plan ID
  userId: string;                // Employee assigned to journey
  date: string;                  // Journey date
  visits: Visit[];               // Array of planned visits
  totalDistance: number;         // Total journey distance (km)
  estimatedDuration: number;     // Estimated duration (minutes)
  status: 'planned' | 'in-progress' | 'completed';  // Journey status
}

/**
 * Individual visit in a journey plan
 */
export interface Visit {
  id: string;                    // Visit ID
  location: {                    // Visit location
    name: string;                // Location name
    address: string;             // Full address
    lat: number;                 // Latitude
    lng: number;                 // Longitude
  };
  scheduledTime: string;         // Scheduled visit time
  actualTime?: string;           // Actual visit time
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';  // Visit status
  notes?: string;                // Visit notes
  kpis?: Record<string, any>;    // Key Performance Indicators
}

// ============================================================================
// DOCUMENT MANAGEMENT TYPES
// ============================================================================

/**
 * Document for digital signing and management
 */
export interface Document {
  id: string;                    // Document ID
  title: string;                 // Document title
  type: 'contract' | 'nda' | 'onboarding' | 'policy' | 'other';  // Document type
  content: string;               // Document content
  status: 'draft' | 'pending-signature' | 'signed' | 'archived';  // Document status
  createdBy: string;             // Creator's user ID
  assignedTo?: string[];         // Users assigned to sign
  signatures: Signature[];       // Array of signatures
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Digital signature on a document
 */
export interface Signature {
  id: string;                    // Signature ID
  userId: string;                // Signer's user ID
  signedAt: string;              // Signature timestamp
  signatureData: string;         // Signature data (encrypted)
}

// ============================================================================
// SURVEY TYPES
// ============================================================================

/**
 * Survey for collecting feedback
 */
export interface Survey {
  id: string;                    // Survey ID
  title: string;                 // Survey title
  description: string;           // Survey description
  questions: SurveyQuestion[];   // Array of survey questions
  targetAudience: string[];      // Target user IDs
  status: 'draft' | 'active' | 'closed';  // Survey status
  responses: SurveyResponse[];   // Array of responses
  createdAt: string;             // Creation timestamp
  expiresAt?: string;            // Expiration date
}

/**
 * Individual question in a survey
 */
export interface SurveyQuestion {
  id: string;                    // Question ID
  question: string;              // Question text
  type: 'text' | 'multiple-choice' | 'rating' | 'yes-no';  // Question type
  required: boolean;             // Whether question is required
  options?: string[];            // Options for multiple choice
}

/**
 * Survey response from a user
 */
export interface SurveyResponse {
  id: string;                    // Response ID
  surveyId: string;              // Associated survey ID
  userId: string;                // Respondent's user ID
  answers: Record<string, any>;  // User's answers
  submittedAt: string;           // Submission timestamp
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

/**
 * System notification
 */
export interface Notification {
  id: string;                    // Notification ID
  userId: string;                // Recipient's user ID
  title: string;                 // Notification title
  message: string;               // Notification message
  type: 'info' | 'success' | 'warning' | 'error';  // Notification type
  read: boolean;                 // Whether notification has been read
  actionUrl?: string;            // URL for notification action
  createdAt: string;             // Creation timestamp
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

/**
 * Dashboard statistics and metrics
 */
export interface DashboardStats {
  totalEmployees: number;        // Total number of employees
  presentToday: number;          // Employees present today
  onLeave: number;               // Employees on leave
  pendingTasks: number;          // Pending tasks
  completedTasks: number;        // Completed tasks
  activeReports: number;         // Active reports
}

/**
 * Chart data for analytics visualization
 */
export interface ChartData {
  labels: string[];              // Chart labels
  datasets: {                    // Chart datasets
    label: string;               // Dataset label
    data: number[];              // Data values
    backgroundColor?: string;    // Background color
    borderColor?: string;        // Border color
  }[];
}
