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
  method: 'geolocation' | 'qr' | 'facial' | 'photo';  // Authentication method used
  status: 'present' | 'absent' | 'late' | 'half-day' | 'overtime';  // Attendance status
  shiftId?: string;              // Associated shift ID
  breaks: Break[];               // Break records during the day
  overtime?: {                   // Overtime information
    hours: number;               // Overtime hours
    reason?: string;             // Reason for overtime
  };
  photos?: {                     // Photo evidence
    clockIn?: string;            // Clock-in photo URL
    clockOut?: string | null;    // Clock-out photo URL
  };
  notes?: string;                // Additional notes
  approvedBy?: string;           // Manager who approved the record
  approvedAt?: string;           // Approval timestamp
  requiresApproval: boolean;     // Whether approval is required
  geofence?: {                   // Geofencing information
    zoneId: string;              // Geofence zone ID
    zoneName: string;            // Geofence zone name
    withinZone: boolean;         // Whether clock in/out was within zone
  };
}

/**
 * Break record for tracking employee breaks during work hours
 */
export interface Break {
  id: string;                    // Unique break ID
  type: 'lunch' | 'coffee' | 'rest' | 'other';  // Break type
  startTime: string;             // Break start time (HH:MM)
  endTime?: string;              // Break end time (HH:MM)
  duration?: number;             // Break duration in minutes
  notes?: string;                // Break notes
}

/**
 * Work shift definition
 */
export interface WorkShift {
  id: string;                    // Unique shift ID
  name: string;                  // Shift name (e.g., "Morning Shift", "Night Shift")
  startTime: string;             // Shift start time (HH:MM)
  endTime: string;               // Shift end time (HH:MM)
  breakDuration: number;         // Total break duration in minutes
  overtimeThreshold: number;     // Hours after which overtime applies
  color: string;                 // Color for UI display
  isActive: boolean;             // Whether shift is active
}

/**
 * Geofence zone for location-based attendance
 */
export interface GeofenceZone {
  id: string;                    // Unique zone ID
  name: string;                  // Zone name
  center: {                      // Zone center coordinates
    lat: number;                 // Latitude
    lng: number;                 // Longitude
  };
  radius: number;                // Zone radius in meters
  address: string;               // Zone address
  isActive: boolean;             // Whether zone is active
  allowedMethods: string[];      // Allowed attendance methods for this zone
}

/**
 * Attendance approval request
 */
export interface AttendanceApproval {
  id: string;                    // Unique approval ID
  attendanceId: string;          // Associated attendance record ID
  userId: string;                // Employee ID
  managerId: string;             // Manager ID
  type: 'late' | 'early-leave' | 'overtime' | 'break-extension';  // Approval type
  reason: string;                // Reason for approval request
  status: 'pending' | 'approved' | 'rejected';  // Approval status
  requestedAt: string;           // Request timestamp
  approvedAt?: string;           // Approval timestamp
  notes?: string;                // Manager notes
}

/**
 * Attendance statistics for reporting
 */
export interface AttendanceStats {
  totalDays: number;             // Total working days
  presentDays: number;           // Days present
  absentDays: number;            // Days absent
  lateDays: number;              // Days late
  overtimeHours: number;         // Total overtime hours
  averageWorkHours: number;      // Average work hours per day
  attendanceRate: number;        // Attendance rate percentage
}

// ============================================================================
// SCHEDULE MANAGEMENT TYPES
// ============================================================================

/**
 * Employee work schedule for specific dates
 */
export interface EmployeeSchedule {
  id: string;                    // Schedule ID
  userId: string;                // Employee ID
  date: string;                  // Schedule date (YYYY-MM-DD)
  startTime: string;             // Scheduled start time (HH:MM)
  endTime: string;               // Scheduled end time (HH:MM)
  isWorkDay: boolean;            // Whether this is a scheduled work day
  shiftId?: string;              // Associated shift ID
  notes?: string;                // Schedule notes
  createdBy: string;             // Who created this schedule
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Default work schedule for employees
 */
export interface DefaultWorkSchedule {
  id: string;                    // Default schedule ID
  userId: string;                // Employee ID
  name: string;                  // Schedule name (e.g., "Regular Schedule", "Part-time")
  startTime: string;             // Default start time (HH:MM)
  endTime: string;               // Default end time (HH:MM)
  workDays: number[];            // Days of week (0=Sunday, 1=Monday, etc.)
  isActive: boolean;             // Whether this default schedule is active
  shiftId?: string;              // Associated shift ID
  notes?: string;                // Schedule notes
  createdBy: string;             // Who created this schedule
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Schedule change request
 */
export interface ScheduleChangeRequest {
  id: string;                    // Request ID
  userId: string;                // Employee ID
  type: 'schedule-change' | 'leave-request' | 'overtime-request';  // Request type
  date: string;                  // Requested date (YYYY-MM-DD)
  startTime?: string;            // Requested start time (HH:MM)
  endTime?: string;              // Requested end time (HH:MM)
  reason: string;                // Reason for request
  status: 'pending' | 'approved' | 'rejected';  // Request status
  requestedAt: string;           // Request timestamp
  approvedBy?: string;           // Approver's user ID
  approvedAt?: string;           // Approval timestamp
  notes?: string;                // Additional notes
  attachments?: string[];        // Supporting documents
}

/**
 * Schedule template for batch operations
 */
export interface ScheduleTemplate {
  id: string;                    // Template ID
  name: string;                  // Template name
  description: string;           // Template description
  fields: ScheduleTemplateField[];  // Template fields
  isActive: boolean;             // Whether template is active
  createdBy: string;             // Who created this template
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Schedule template field
 */
export interface ScheduleTemplateField {
  id: string;                    // Field ID
  name: string;                  // Field name
  type: 'text' | 'date' | 'time' | 'select' | 'number';  // Field type
  required: boolean;             // Whether field is required
  options?: string[];            // Options for select fields
  defaultValue?: string;         // Default value
}

/**
 * Batch schedule import result
 */
export interface BatchScheduleImport {
  id: string;                    // Import ID
  fileName: string;              // Uploaded file name
  totalRows: number;             // Total rows in file
  processedRows: number;         // Successfully processed rows
  failedRows: number;            // Failed rows
  errors: BatchImportError[];    // Import errors
  status: 'processing' | 'completed' | 'failed';  // Import status
  createdBy: string;             // Who initiated the import
  createdAt: string;             // Import timestamp
  completedAt?: string;          // Completion timestamp
}

/**
 * Batch import error
 */
export interface BatchImportError {
  row: number;                   // Row number in file
  field: string;                 // Field name
  error: string;                 // Error message
}

// ============================================================================
// SCHEDULED WORKDAYS PUNCH-IN TYPES
// ============================================================================

/**
 * Scheduled workdays punch-in settings configuration
 */
export interface ScheduledWorkdaysSettings {
  id: string;                    // Settings ID
  isEnabled: boolean;            // Whether punch-in only on scheduled workdays is enabled
  allowPunchInAtAnyTime: boolean;  // Whether employees can punch in at any time during scheduled workdays
  punchInAdvanceMinutes: number;   // Minutes before scheduled start time when punch-in is allowed (0 = no advance)
  requireScheduleRegistration: boolean;  // Whether individual schedules must be registered
  targetType: 'all-employees' | 'specific-groups' | 'specific-employees';  // Target configuration type
  targetGroups?: string[];       // Specific group IDs (if targetType is 'specific-groups')
  targetJobTitles?: string[];    // Specific job titles (if targetType is 'specific-groups')
  targetEmployees?: string[];    // Specific employee IDs (if targetType is 'specific-employees')
  createdBy: string;             // Admin who configured this
  createdAt: string;             // Configuration timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Employee work schedule for specific dates
 */
export interface EmployeeSchedule {
  id: string;                    // Schedule ID
  userId: string;                // Employee ID
  date: string;                  // Schedule date (YYYY-MM-DD)
  startTime: string;             // Scheduled start time (HH:MM)
  endTime: string;               // Scheduled end time (HH:MM)
  isWorkDay: boolean;            // Whether this is a scheduled work day
  shiftId?: string;              // Associated shift ID
  notes?: string;                // Schedule notes
  createdBy: string;             // Who created this schedule
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Punch-in validation result
 */
export interface PunchInValidation {
  isAllowed: boolean;            // Whether punch-in is allowed
  reason: string;                // Reason for allowance/denial
  scheduledStartTime?: string;   // Scheduled start time (if applicable)
  earliestAllowedTime?: string;  // Earliest allowed punch-in time
  latestAllowedTime?: string;    // Latest allowed punch-in time
}

// ============================================================================
// TEMPORARY WORKPLACE TYPES
// ============================================================================

/**
 * Temporary workplace settings configuration
 */
export interface TemporaryWorkplaceSettings {
  id: string;                    // Settings ID
  isEnabled: boolean;            // Whether temporary workplace punch in/out is enabled
  targetType: 'all-employees' | 'specific-groups' | 'specific-employees';  // Target configuration type
  targetGroups?: string[];       // Specific group IDs (if targetType is 'specific-groups')
  targetJobTitles?: string[];    // Specific job titles (if targetType is 'specific-groups')
  targetEmployees?: string[];    // Specific employee IDs (if targetType is 'specific-employees')
  requireReason: boolean;        // Whether reason is required for temporary workplace punch in/out
  requirePhoto: boolean;         // Whether photo is required for temporary workplace punch in/out
  requireLocation: boolean;      // Whether GPS location is required
  maxDistanceFromWorkplace?: number;  // Maximum distance from registered workplace (meters)
  createdBy: string;             // Admin who configured this
  createdAt: string;             // Configuration timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Temporary workplace record for tracking punch in/out from unregistered locations
 */
export interface TemporaryWorkplaceRecord {
  id: string;                    // Record ID
  userId: string;                // Employee ID
  date: string;                  // Date of punch in/out (YYYY-MM-DD)
  type: 'clock-in' | 'clock-out';  // Type of punch action
  time: string;                  // Punch time (HH:MM)
  location: {                    // Temporary workplace location
    lat: number;                 // Latitude
    lng: number;                 // Longitude
    address: string;             // Human-readable address
    placeName?: string;          // Place name (e.g., "Client Office", "Coffee Shop")
  };
  reason: string;                // Reason for temporary workplace punch in/out
  photos?: {                     // Photo evidence
    punchIn?: string;            // Punch-in photo URL
    punchOut?: string;           // Punch-out photo URL
  };
  notes?: string;                // Additional notes
  isReusable: boolean;           // Whether this location can be reused
  reusableName?: string;         // Name for reusable location
  distanceFromNearestWorkplace?: number;  // Distance from nearest registered workplace (meters)
  nearestWorkplaceId?: string;   // ID of nearest registered workplace
  deviceInfo?: {                 // Device information
    deviceId: string;
    deviceType: string;
    appVersion: string;
  };
  createdAt: string;             // Record creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Reusable temporary workplace location saved by employee
 */
export interface ReusableTemporaryWorkplace {
  id: string;                    // Reusable location ID
  userId: string;                // Employee ID who saved this location
  name: string;                  // Location name (e.g., "Client Office", "Home Office")
  location: {                    // Location coordinates
    lat: number;                 // Latitude
    lng: number;                 // Longitude
    address: string;             // Full address
    placeName?: string;          // Place name from maps
  };
  reason: string;                // Default reason for this location
  isActive: boolean;             // Whether this location is active
  usageCount: number;            // Number of times this location has been used
  lastUsedAt?: string;           // Last time this location was used
  createdAt: string;             // When this location was saved
  updatedAt: string;             // Last update timestamp
}

/**
 * Temporary workplace statistics for reporting
 */
export interface TemporaryWorkplaceStats {
  totalRecords: number;          // Total temporary workplace records
  uniqueLocations: number;       // Number of unique temporary locations used
  mostUsedLocations: {           // Most frequently used temporary locations
    locationId: string;
    name: string;
    address: string;
    usageCount: number;
  }[];
  averageDistance: number;       // Average distance from registered workplaces
  topReasons: {                  // Most common reasons for temporary workplace usage
    reason: string;
    count: number;
  }[];
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
// LEAVE GRANT TYPES
// ============================================================================

/**
 * Leave grant for accrued leave types
 */
export interface LeaveGrant {
  id: string;                    // Grant ID
  title: string;                 // Grant title (e.g., "Annual Leave 2025 - Sales Team")
  leaveTypeId: string;           // Leave type ID
  employees: string[];           // Employee IDs
  grantType: 'same' | 'individual';  // Grant type
  daysGranted?: number;          // Days granted (for 'same' type)
  periodStart: string;           // Period start date
  periodEnd: string;             // Period end date
  carryoverType: 'months' | 'days' | 'nextYear' | 'specificDate';  // Carryover type
  carryoverValue?: number | string;  // Carryover value
  createdBy: string;             // Admin who created the grant
  createdAt: string;             // Creation timestamp
  details?: LeaveGrantDetail[];  // Individual details (for 'individual' type)
}

/**
 * Individual leave grant detail for Excel upload
 */
export interface LeaveGrantDetail {
  userId: string;                // Employee ID
  daysGranted: number;           // Days granted to this employee
  periodStart: string;           // Period start date
  periodEnd: string;             // Period end date
  carryoverExpiration: string;   // Carryover expiration date
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

/**
 * Face verification settings and configuration
 */
export interface FaceVerificationSettings {
  id: string;                    // Settings ID
  isEnabled: boolean;            // Whether face verification is enabled
  requireFaceVerification: boolean;  // Whether face verification is required
  maxRetryAttempts: number;      // Maximum retry attempts before re-registration
  imageQuality: 'low' | 'medium' | 'high';  // Image quality setting
  allowedImageFormats: string[]; // Allowed image formats
  maxImageSize: number;          // Maximum image size in bytes
  retentionDays: number;         // How long to keep face images
  createdBy: string;             // Admin who configured this
  createdAt: string;             // Configuration timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Face image record for employee authentication
 */
export interface FaceImage {
  id: string;                    // Face image ID
  userId: string;                // Employee ID
  imageUrl: string;              // Stored image URL
  imageHash: string;             // Image hash for verification
  imageType: 'registration' | 'verification' | 'attendance';  // Image type
  attendanceId?: string;         // Associated attendance record
  capturedAt: string;            // When image was captured
  location?: {                   // Location where image was captured
    lat: number;
    lng: number;
    address: string;
  };
  deviceInfo?: {                 // Device information
    deviceId: string;
    deviceType: string;
    appVersion: string;
  };
  verificationResult?: {         // Verification result
    success: boolean;
    confidence: number;          // Confidence score (0-100)
    matchedWith?: string;        // Matched face image ID
    failureReason?: string;      // Reason for failure
  };
  isActive: boolean;             // Whether this is the active face image
  expiresAt?: string;            // When image expires
}

/**
 * Face verification attempt record
 */
export interface FaceVerificationAttempt {
  id: string;                    // Attempt ID
  userId: string;                // Employee ID
  attendanceId: string;          // Associated attendance record
  attemptNumber: number;         // Attempt number (1, 2, 3, etc.)
  capturedImageUrl: string;      // Captured image URL
  verificationResult: {          // Verification result
    success: boolean;
    confidence: number;
    matchedWith?: string;
    failureReason?: string;
  };
  timestamp: string;             // Attempt timestamp
  location?: {                   // Location of attempt
    lat: number;
    lng: number;
    address: string;
  };
  deviceInfo?: {                 // Device information
    deviceId: string;
    deviceType: string;
    appVersion: string;
  };
}

/**
 * Face verification session for real-time processing
 */
export interface FaceVerificationSession {
  id: string;                    // Session ID
  userId: string;                // Employee ID
  attendanceId: string;          // Associated attendance record
  sessionType: 'clock-in' | 'clock-out';  // Session type
  status: 'pending' | 'capturing' | 'verifying' | 'completed' | 'failed';  // Session status
  currentAttempt: number;        // Current attempt number
  maxAttempts: number;           // Maximum allowed attempts
  attempts: FaceVerificationAttempt[];  // All attempts in this session
  startedAt: string;             // Session start time
  completedAt?: string;          // Session completion time
  result?: {                     // Final session result
    success: boolean;
    finalImageUrl?: string;
    totalAttempts: number;
    averageConfidence?: number;
  };
}
