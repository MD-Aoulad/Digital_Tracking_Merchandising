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
// JOURNEY PLAN TYPES
// ============================================================================

/**
 * Journey plan location/stop
 */
export interface JourneyLocation {
  id: string;                    // Location ID
  name: string;                  // Location name
  address: string;               // Full address
  latitude: number;              // GPS latitude
  longitude: number;             // GPS longitude
  contactPerson?: string;        // Contact person at location
  contactPhone?: string;         // Contact phone number
  notes?: string;                // Additional notes
  estimatedDuration: number;     // Estimated duration in minutes
  priority: 'high' | 'medium' | 'low';  // Visit priority
}

// ============================================================================
// REPORT TYPES
// ============================================================================

/**
 * Report template for creating standardized reports
 */
export interface ReportTemplate {
  id: string;                    // Template ID
  name: string;                  // Template name (e.g., "Visit Report", "Work Log")
  description: string;           // Template description
  category: 'daily' | 'weekly' | 'monthly' | 'custom' | 'application';  // Report category
  fields: ReportField[];         // Array of form fields
  isActive: boolean;             // Whether template is active
  isRecurring: boolean;          // Whether this is a recurring report
  recurrencePattern?: {          // Recurrence pattern for recurring reports
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number;            // Every X days/weeks/months
    startDate: string;           // When to start recurring
    endDate?: string;            // When to end recurring (optional)
  };
  assignedRoles: string[];       // Roles that can submit this report
  assignedEmployees?: string[];  // Specific employees assigned (if any)
  requiresApproval: boolean;     // Whether submission requires approval
  approvalWorkflow?: string[];   // Approval workflow steps
  createdBy: string;             // Admin who created the template
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Report field definition
 */
export interface ReportField {
  id: string;                    // Field ID
  name: string;                  // Field name
  label: string;                 // Display label
  type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'multiselect' | 'file' | 'image' | 'location' | 'signature';  // Field type
  required: boolean;             // Whether field is required
  placeholder?: string;          // Placeholder text
  options?: string[];            // Options for select/multiselect fields
  validation?: {                 // Field validation rules
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;            // Regex pattern
    customMessage?: string;      // Custom validation message
  };
  defaultValue?: any;            // Default value
  order: number;                 // Field order in form
  isVisible: boolean;            // Whether field is visible
}

/**
 * Report submission instance
 */
export interface ReportSubmission {
  id: string;                    // Submission ID
  templateId: string;            // Associated template ID
  title: string;                 // Report title
  submittedBy: string;           // Employee who submitted
  submittedAt: string;           // Submission timestamp
  dueDate?: string;              // Due date (if applicable)
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'overdue';  // Submission status
  data: Record<string, any>;     // Submitted form data
  attachments?: string[];        // File attachments
  location?: {                   // Submission location
    latitude: number;
    longitude: number;
    address: string;
  };
  notes?: string;                // Additional notes
  approvedBy?: string;           // Approver's user ID
  approvedAt?: string;           // Approval timestamp
  rejectionReason?: string;      // Reason for rejection
  version: number;               // Submission version
  isRecurring: boolean;          // Whether this is a recurring submission
  recurringInstance?: number;    // Instance number for recurring reports
}

/**
 * Report request for employees
 */
export interface ReportRequest {
  id: string;                    // Request ID
  templateId: string;            // Template to be filled
  title: string;                 // Request title
  description: string;           // Request description
  assignedTo: string[];          // Employees assigned to submit
  dueDate: string;               // Due date for submission
  priority: 'low' | 'medium' | 'high' | 'urgent';  // Request priority
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';  // Request status
  createdBy: string;             // Admin who created the request
  createdAt: string;             // Creation timestamp
  reminders: {                   // Reminder settings
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'custom';
    lastSent?: string;
  };
  notifications: {               // Notification settings
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

/**
 * Report settings configuration
 */
export interface ReportSettings {
  id: string;                    // Settings ID
  isEnabled: boolean;            // Whether report feature is enabled
  allowDraftSaving: boolean;     // Allow employees to save drafts
  autoSaveInterval: number;      // Auto-save interval in minutes
  maxFileSize: number;           // Maximum file size in MB
  allowedFileTypes: string[];    // Allowed file types for uploads
  requireLocation: boolean;      // Require GPS location for submissions
  requireSignature: boolean;     // Require digital signature
  approvalWorkflow: {            // Default approval workflow
    enabled: boolean;
    approvers: string[];         // Default approvers
    autoApprove: boolean;        // Auto-approve certain reports
  };
  notificationSettings: {        // Notification preferences
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    reminderNotifications: boolean;
  };
  createdBy: string;             // Admin who configured settings
  updatedAt: string;             // Last update timestamp
}

/**
 * Journey plan assignment for an employee
 */
export interface JourneyPlan {
  id: string;                    // Journey plan ID
  title: string;                 // Journey plan title
  employeeId: string;            // Assigned employee ID
  date: string;                  // Journey date (YYYY-MM-DD)
  startTime: string;             // Start time (HH:MM)
  endTime: string;               // End time (HH:MM)
  locations: JourneyLocation[];  // List of locations to visit
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';  // Journey status
  totalDistance: number;         // Total distance in kilometers
  estimatedDuration: number;     // Total estimated duration in minutes
  actualStartTime?: string;      // Actual start time
  actualEndTime?: string;        // Actual end time
  notes?: string;                // Journey notes
  createdBy: string;             // Admin who created the plan
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Journey plan visit record
 */
export interface JourneyVisit {
  id: string;                    // Visit ID
  journeyPlanId: string;         // Associated journey plan ID
  locationId: string;            // Location ID
  employeeId: string;            // Employee ID
  plannedArrivalTime: string;    // Planned arrival time
  plannedDepartureTime: string;  // Planned departure time
  actualArrivalTime?: string;    // Actual arrival time
  actualDepartureTime?: string;  // Actual departure time
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';  // Visit status
  notes?: string;                // Visit notes
  photos?: string[];             // Photos taken at location
  gpsData?: {                    // GPS data for verification
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
}

/**
 * Journey plan settings configuration
 */
export interface JourneyPlanSettings {
  id: string;                    // Settings ID
  isEnabled: boolean;            // Whether journey plan feature is enabled
  requireGpsVerification: boolean;  // Require GPS verification for visits
  allowRouteOptimization: boolean;  // Allow automatic route optimization
  maxLocationsPerDay: number;    // Maximum locations per day per employee
  defaultVisitDuration: number;  // Default visit duration in minutes
  autoAssignRoutes: boolean;     // Auto-assign optimal routes
  notificationSettings: {        // Notification preferences
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  createdBy: string;             // Admin who configured settings
  updatedAt: string;             // Last update timestamp
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



// ============================================================================
// JOURNEY PLAN TYPES
// ============================================================================



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

// ============================================================================
// POSTING BOARD TYPES
// ============================================================================

/**
 * Posting board for team communication
 */
export interface PostingBoard {
  id: string;                    // Board ID
  name: string;                  // Board name
  description: string;           // Board description
  type: 'general' | 'issue-resolution';  // Board type
  category: 'end-of-day' | 'handover' | 'voice-of-customer' | 'team-social' | 'custom';  // Board category
  isActive: boolean;             // Whether board is active
  isDefault: boolean;            // Whether this is the default board
  allowFileUploads: boolean;     // Whether file uploads are allowed
  allowedFileTypes: string[];    // Allowed file types
  maxFileSize: number;           // Maximum file size in MB
  requireApproval: boolean;      // Whether posts require approval
  allowComments: boolean;        // Whether comments are allowed
  allowReactions: boolean;       // Whether reactions are allowed
  assignedRoles: string[];       // Roles that can post to this board
  assignedEmployees?: string[];  // Specific employees assigned (if any)
  moderators: string[];          // Board moderators
  createdBy: string;             // Admin who created the board
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Post on a posting board
 */
export interface PostingBoardPost {
  id: string;                    // Post ID
  boardId: string;               // Associated board ID
  title: string;                 // Post title
  content: string;               // Post content
  authorId: string;              // Author's user ID
  authorName: string;            // Author's name
  authorAvatar?: string;         // Author's avatar URL
  type: 'general' | 'issue' | 'resolution';  // Post type
  status: 'draft' | 'published' | 'pending-approval' | 'rejected' | 'archived';  // Post status
  priority: 'low' | 'medium' | 'high' | 'urgent';  // Post priority (for issues)
  attachments: PostingBoardAttachment[]; // File attachments
  tags: string[];                // Post tags
  location?: {                   // Post location
    latitude: number;
    longitude: number;
    address: string;
  };
  isPinned: boolean;             // Whether post is pinned
  isAnonymous: boolean;          // Whether post is anonymous
  views: number;                 // Number of views
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
  publishedAt?: string;          // Publication timestamp
  approvedBy?: string;           // Approver's user ID
  approvedAt?: string;           // Approval timestamp
  rejectionReason?: string;      // Reason for rejection
}

/**
 * Post attachment (file or image)
 */
export interface PostingBoardAttachment {
  id: string;                    // Attachment ID
  fileName: string;              // Original file name
  fileUrl: string;               // File URL
  fileType: string;              // File MIME type
  fileSize: number;              // File size in bytes
  thumbnailUrl?: string;         // Thumbnail URL for images
  uploadedAt: string;            // Upload timestamp
}

/**
 * Comment on a post
 */
export interface PostingBoardComment {
  id: string;                    // Comment ID
  postId: string;                // Associated post ID
  authorId: string;              // Author's user ID
  authorName: string;            // Author's name
  authorAvatar?: string;         // Author's avatar URL
  content: string;               // Comment content
  parentCommentId?: string;      // Parent comment ID for replies
  isAnonymous: boolean;          // Whether comment is anonymous
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Reaction on a post or comment
 */
export interface PostingBoardReaction {
  id: string;                    // Reaction ID
  postId: string;                // Associated post ID
  commentId?: string;            // Associated comment ID (if reacting to comment)
  userId: string;                // User who reacted
  reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'thumbs-up' | 'thumbs-down';  // Reaction type
  createdAt: string;             // Reaction timestamp
}

/**
 * Issue tracking for issue-resolution boards
 */
export interface PostingBoardIssue {
  id: string;                    // Issue ID
  postId: string;                // Associated post ID
  title: string;                 // Issue title
  description: string;           // Issue description
  status: 'open' | 'in-progress' | 'resolved' | 'closed';  // Issue status
  priority: 'low' | 'medium' | 'high' | 'urgent';  // Issue priority
  category: string;              // Issue category
  assignedTo?: string;           // Assigned employee ID
  reportedBy: string;            // Reporter's user ID
  reportedAt: string;            // Report timestamp
  resolvedBy?: string;           // Resolver's user ID
  resolvedAt?: string;           // Resolution timestamp
  resolution?: string;           // Resolution details
  estimatedResolutionTime?: string;  // Estimated time to resolve
  actualResolutionTime?: string;     // Actual time taken to resolve
  attachments: PostingBoardAttachment[]; // Issue attachments
  tags: string[];                // Issue tags
}

/**
 * Posting board settings configuration
 */
export interface PostingBoardSettings {
  id: string;                    // Settings ID
  isEnabled: boolean;            // Whether posting board feature is enabled
  allowAnonymousPosts: boolean;  // Allow anonymous posts
  requirePostApproval: boolean;  // Require approval for all posts
  allowFileUploads: boolean;     // Allow file uploads globally
  maxFileSize: number;           // Maximum file size in MB
  allowedFileTypes: string[];    // Allowed file types globally
  allowComments: boolean;        // Allow comments globally
  allowReactions: boolean;       // Allow reactions globally
  autoArchiveDays: number;       // Days after which posts are auto-archived
  maxPostsPerDay: number;        // Maximum posts per user per day
  maxCommentsPerPost: number;    // Maximum comments per post
  notificationSettings: {        // Notification preferences
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    mentionNotifications: boolean;
  };
  moderationSettings: {          // Moderation preferences
    enableAutoModeration: boolean;
    keywordFilter: string[];     // Keywords to filter
    spamProtection: boolean;     // Enable spam protection
    profanityFilter: boolean;    // Enable profanity filter
  };
  createdBy: string;             // Admin who configured settings
  updatedAt: string;             // Last update timestamp
}

// ============================================================================
// TODO FEATURE TYPES
// ============================================================================

/**
 * Todo task for employee assignment
 */
export interface TodoTask {
  id: string;                    // Task ID
  title: string;                 // Task title
  description: string;           // Task description
  assignedBy: string;            // User who assigned the task
  assignedTo: string[];          // Employee IDs assigned to this task
  assignedWorkplaces?: string[]; // Workplace IDs (if assigned by workplace)
  priority: 'low' | 'medium' | 'high' | 'urgent';  // Task priority
  status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';  // Task status
  category: string;              // Task category
  dueDate: string;               // Due date (YYYY-MM-DD)
  dueTime?: string;              // Due time (HH:MM)
  estimatedDuration: number;     // Estimated duration in minutes
  actualDuration?: number;       // Actual time taken in minutes
  isRepeating: boolean;          // Whether task repeats
  repeatPattern?: {              // Repeat pattern for recurring tasks
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;            // Every X days/weeks/months
    daysOfWeek?: number[];       // Days of week (0=Sunday, 1=Monday, etc.)
    endDate?: string;            // When to stop repeating
    maxOccurrences?: number;     // Maximum number of occurrences
  };
  reminders: TodoReminder[];     // Reminder settings
  attachments: TodoAttachment[]; // File attachments
  location?: {                   // Task location
    latitude: number;
    longitude: number;
    address: string;
    workplaceId?: string;        // Associated workplace ID
  };
  requiresPhoto: boolean;        // Whether photo completion is required
  requiresLocation: boolean;     // Whether GPS location is required
  requiresSignature: boolean;    // Whether digital signature is required
  notes?: string;                // Additional notes
  tags: string[];                // Task tags
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
  startedAt?: string;            // When task was started
  completedAt?: string;          // When task was completed
  cancelledAt?: string;          // When task was cancelled
  cancelledBy?: string;          // Who cancelled the task
  cancellationReason?: string;   // Reason for cancellation
}

/**
 * Todo task completion record
 */
export interface TodoCompletion {
  id: string;                    // Completion ID
  taskId: string;                // Associated task ID
  employeeId: string;            // Employee who completed the task
  completedAt: string;           // Completion timestamp
  status: 'completed' | 'rework-requested' | 'approved' | 'rejected';  // Completion status
  actualDuration: number;        // Actual time taken in minutes
  notes?: string;                // Completion notes
  photos?: string[];             // Completion photos
  location?: {                   // Completion location
    latitude: number;
    longitude: number;
    address: string;
  };
  signature?: string;            // Digital signature data
  attachments?: string[];        // Additional attachments
  approvedBy?: string;           // Approver's user ID
  approvedAt?: string;           // Approval timestamp
  rejectionReason?: string;      // Reason for rejection
  reworkRequestedBy?: string;    // Who requested rework
  reworkRequestedAt?: string;    // When rework was requested
  reworkReason?: string;         // Reason for rework request
}

/**
 * Todo reminder notification
 */
export interface TodoReminder {
  id: string;                    // Reminder ID
  taskId: string;                // Associated task ID
  type: 'before-due' | 'at-due' | 'after-due' | 'custom';  // Reminder type
  timeOffset: number;            // Time offset in minutes (negative for before, positive for after)
  message: string;               // Reminder message
  notificationMethods: {         // Notification methods
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  isActive: boolean;             // Whether reminder is active
  lastSent?: string;             // Last time reminder was sent
  nextSend?: string;             // Next time reminder should be sent
}

/**
 * Todo attachment (file or image)
 */
export interface TodoAttachment {
  id: string;                    // Attachment ID
  fileName: string;              // Original file name
  fileUrl: string;               // File URL
  fileType: string;              // File MIME type
  fileSize: number;              // File size in bytes
  uploadedAt: string;            // Upload timestamp
  uploadedBy: string;            // User who uploaded the file
}

/**
 * Todo task template for recurring tasks
 */
export interface TodoTemplate {
  id: string;                    // Template ID
  name: string;                  // Template name
  description: string;           // Template description
  category: string;              // Task category
  priority: 'low' | 'medium' | 'high' | 'urgent';  // Default priority
  estimatedDuration: number;     // Default estimated duration
  isRepeating: boolean;          // Whether template creates repeating tasks
  repeatPattern?: {              // Default repeat pattern
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    daysOfWeek?: number[];
  };
  defaultReminders: TodoReminder[];  // Default reminder settings
  requiresPhoto: boolean;        // Whether photo completion is required
  requiresLocation: boolean;     // Whether GPS location is required
  requiresSignature: boolean;    // Whether digital signature is required
  defaultNotes?: string;         // Default notes
  defaultTags: string[];         // Default tags
  createdBy: string;             // Admin who created the template
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Todo settings configuration
 */
export interface TodoSettings {
  id: string;                    // Settings ID
  isEnabled: boolean;            // Whether todo feature is enabled
  allowLeadersToCreate: boolean; // Allow leaders to create todos
  allowedLeaderRoles: string[];  // Specific leader roles that can create todos
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';  // Default task priority
  defaultReminders: {            // Default reminder settings
    beforeDueMinutes: number;    // Minutes before due date
    atDueTime: boolean;          // Remind at due time
    afterDueMinutes: number;     // Minutes after due date
  };
  notificationSettings: {        // Notification preferences
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    inAppNotifications: boolean;
  };
  completionSettings: {          // Completion requirements
    requirePhoto: boolean;       // Require photo for completion
    requireLocation: boolean;    // Require GPS location
    requireSignature: boolean;   // Require digital signature
    autoApprove: boolean;        // Auto-approve completions
  };
  reminderSettings: {            // Reminder configuration
    maxRemindersPerTask: number; // Maximum reminders per task
    reminderInterval: number;    // Minutes between reminders
    escalationEnabled: boolean;  // Enable reminder escalation
  };
  createdBy: string;             // Admin who configured settings
  updatedAt: string;             // Last update timestamp
}

// ============================================================================
// MEMBER MANAGEMENT TYPES
// ============================================================================

/**
 * Member role types for the workforce management system
 */
export enum MemberRole {
  ADMIN = 'admin',               // Full system access and administrative rights
  LEADER = 'leader',             // Group management and approval authority
  EMPLOYEE = 'employee'          // Basic employee access
}

/**
 * Group type enumeration
 */
export enum GroupType {
  DEPARTMENT = 'department',     // Department-based group
  TEAM = 'team',                 // Team-based group
  PROJECT = 'project',           // Project-based group
  LOCATION = 'location',         // Location-based group
  FUNCTION = 'function',         // Function-based group
  CUSTOM = 'custom'              // Custom group type
}

/**
 * Group structure for organizing members
 */
export interface Group {
  id: string;                    // Unique group ID
  name: string;                  // Group name
  description: string;           // Group description
  parentGroupId?: string;        // Parent group ID (for hierarchical structure)
  leaderId?: string;             // Group leader's member ID
  members: string[];             // Array of member IDs in this group
  depth: number;                 // Group depth (0 = top-level, 1-7 = subgroups)
  isTopLevel: boolean;           // Whether this is the top-level group (company name)
  isActive: boolean;             // Whether group is active
  memberCount: number;           // Number of members in this group
  leaderCount: number;           // Number of leaders in this group
  workplaceIds: string[];        // Associated workplace IDs
  settings: GroupSettings;       // Group-specific settings
  createdBy: string;             // Admin who created the group
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Group settings for configuration and permissions
 */
export interface GroupSettings {
  allowSubgroups: boolean;       // Whether subgroups can be created
  maxDepth: number;              // Maximum allowed depth (1-7)
  allowMemberReassignment: boolean; // Allow moving members between groups
  requireLeaderApproval: boolean; // Require leader approval for certain actions
  autoAssignNewMembers: boolean; // Auto-assign new members to this group
  notificationSettings: {        // Group notification preferences
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    memberChangeNotifications: boolean;
    leaderChangeNotifications: boolean;
  };
}

/**
 * Group member assignment with role and permissions
 */
export interface GroupMember {
  id: string;                    // Assignment ID
  groupId: string;               // Group ID
  memberId: string;              // Member ID
  memberName: string;            // Member name
  memberEmail: string;           // Member email
  memberAvatar?: string;         // Member avatar URL
  role: GroupMemberRole;         // Member role in the group
  isLeader: boolean;             // Whether member is a leader
  hasApprovalAuthority: boolean; // Whether leader has approval authority
  assignedWorkplaces: string[];  // Workplaces assigned to this member
  assignedAt: string;            // Assignment timestamp
  assignedBy: string;            // Admin who made the assignment
  isActive: boolean;             // Whether assignment is active
  notes?: string;                // Assignment notes
}

/**
 * Group member role enumeration
 */
export enum GroupMemberRole {
  LEADER = 'leader',             // Group leader with management authority
  MEMBER = 'member'              // Regular group member
}

/**
 * Group leader with approval authority
 */
export interface GroupLeader {
  id: string;                    // Leader assignment ID
  groupId: string;               // Group ID
  memberId: string;              // Member ID
  memberName: string;            // Leader name
  memberEmail: string;           // Leader email
  approvalAuthority: ApprovalAuthority; // Approval authority settings
  assignedWorkplaces: string[];  // Workplaces this leader manages
  memberCount: number;           // Number of members this leader manages
  isActive: boolean;             // Whether leader assignment is active
  assignedAt: string;            // Assignment timestamp
  assignedBy: string;            // Admin who assigned the leader
  notes?: string;                // Assignment notes
}

/**
 * Approval authority settings for group leaders
 */
export interface ApprovalAuthority {
  canApproveScheduleChanges: boolean; // Can approve schedule change requests
  canApproveLeaveRequests: boolean;   // Can approve leave requests
  canApproveOvertime: boolean;        // Can approve overtime requests
  canApproveAttendance: boolean;      // Can approve attendance corrections
  canApproveReports: boolean;         // Can approve report submissions
  canApproveTasks: boolean;           // Can approve task completions
  canViewAllGroupData: boolean;       // Can view all group member data
  canViewGroupReports: boolean;       // Can view group reports
  canViewGroupAttendance: boolean;    // Can view group attendance
  canViewGroupSchedules: boolean;     // Can view group schedules
  canCreateGroupTasks: boolean;       // Can create tasks for group members
  canManageGroupSettings: boolean;    // Can manage group-specific settings
}

/**
 * Group hierarchy structure
 */
export interface GroupHierarchy {
  id: string;                    // Group ID
  name: string;                  // Group name
  depth: number;                 // Group depth
  isTopLevel: boolean;           // Whether this is top-level
  memberCount: number;           // Total member count (including subgroups)
  leaderCount: number;           // Total leader count (including subgroups)
  children: GroupHierarchy[];    // Subgroups
  path: string[];                // Path from root to this group
}

/**
 * Group statistics and analytics
 */
export interface GroupStats {
  totalGroups: number;           // Total number of groups
  activeGroups: number;          // Number of active groups
  topLevelGroups: number;        // Number of top-level groups
  subgroups: number;             // Number of subgroups
  totalMembers: number;          // Total members across all groups
  totalLeaders: number;          // Total leaders across all groups
  averageGroupSize: number;      // Average members per group
  groupsByDepth: {               // Groups count by depth
    depth: number;
    count: number;
  }[];
  membersByGroup: {              // Member count by group
    groupId: string;
    groupName: string;
    memberCount: number;
    leaderCount: number;
  }[];
  recentActivity: {              // Recent group activity
    groupId: string;
    groupName: string;
    activity: string;
    timestamp: string;
  }[];
}

/**
 * Group filters for search and filtering
 */
export interface GroupFilters {
  depth?: number;                // Filter by group depth
  parentGroupId?: string;        // Filter by parent group
  isActive?: boolean;            // Filter by active status
  hasLeaders?: boolean;          // Filter groups with/without leaders
  memberCount?: {                // Filter by member count range
    min?: number;
    max?: number;
  };
  searchTerm?: string;           // Search term for group name/description
  workplaceId?: string;          // Filter by associated workplace
}

/**
 * Group member filters
 */
export interface GroupMemberFilters {
  groupId?: string;              // Filter by group
  role?: GroupMemberRole;        // Filter by role
  isLeader?: boolean;            // Filter by leader status
  hasApprovalAuthority?: boolean; // Filter by approval authority
  workplaceId?: string;          // Filter by assigned workplace
  searchTerm?: string;           // Search term for member name/email
}

/**
 * Group import data for bulk operations
 */
export interface GroupImportData {
  name: string;                  // Group name
  description?: string;          // Group description
  parentGroupName?: string;      // Parent group name
  depth?: number;                // Group depth
  leaderEmails?: string[];       // Leader email addresses
  memberEmails?: string[];       // Member email addresses
  workplaceCodes?: string[];     // Associated workplace codes
}

/**
 * Group management settings
 */
export interface GroupManagementSettings {
  id: string;                    // Settings ID
  allowGroupCreation: boolean;   // Allow creating new groups
  requireApprovalForCreation: boolean; // Require approval for new groups
  allowGroupEditing: boolean;    // Allow editing existing groups
  requireApprovalForEditing: boolean; // Require approval for group edits
  allowSubgroupCreation: boolean; // Allow creating subgroups
  maxGroupDepth: number;         // Maximum allowed group depth (1-7)
  allowMemberReassignment: boolean; // Allow moving members between groups
  requireLeaderApproval: boolean; // Require leader approval for member changes
  autoAssignNewMembers: boolean; // Auto-assign new members to default group
  defaultGroupId?: string;       // Default group for new members
  notificationSettings: {        // Notification preferences
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    newGroupNotifications: boolean;
    groupUpdateNotifications: boolean;
    memberChangeNotifications: boolean;
    leaderChangeNotifications: boolean;
  };
  createdBy: string;             // Admin who configured settings
  updatedAt: string;             // Last update timestamp
}

/**
 * Group approval request
 */
export interface GroupApprovalRequest {
  id: string;                    // Request ID
  groupId: string;               // Associated group ID
  requestType: 'group-creation' | 'group-editing' | 'member-reassignment' | 'leader-assignment'; // Request type
  requesterId: string;           // User who made the request
  requesterName: string;         // Requester name
  requestData: any;              // Request data
  status: 'pending' | 'approved' | 'rejected'; // Request status
  requestedAt: string;           // Request timestamp
  approvedBy?: string;           // Approver's user ID
  approvedAt?: string;           // Approval timestamp
  rejectionReason?: string;      // Reason for rejection
  notes?: string;                // Additional notes
}

/**
 * Group activity log
 */
export interface GroupActivity {
  id: string;                    // Activity ID
  groupId: string;               // Associated group ID
  groupName: string;             // Group name
  activityType: 'member-added' | 'member-removed' | 'leader-assigned' | 'leader-removed' | 'group-created' | 'group-updated' | 'group-deleted'; // Activity type
  performedBy: string;           // User who performed the action
  performedByName: string;       // Performer name
  targetMemberId?: string;       // Target member ID (if applicable)
  targetMemberName?: string;     // Target member name (if applicable)
  details: any;                  // Activity details
  timestamp: string;             // Activity timestamp
  ipAddress?: string;            // IP address of performer
  userAgent?: string;            // User agent of performer
}

/**
 * Group workplace assignment
 */
export interface GroupWorkplaceAssignment {
  id: string;                    // Assignment ID
  groupId: string;               // Group ID
  workplaceId: string;           // Workplace ID
  workplaceName: string;         // Workplace name
  assignmentType: 'primary' | 'secondary' | 'temporary'; // Assignment type
  assignedAt: string;            // Assignment timestamp
  assignedBy: string;            // Admin who made the assignment
  isActive: boolean;             // Whether assignment is active
  notes?: string;                // Assignment notes
}

/**
 * Group member workplace assignment
 */
export interface GroupMemberWorkplaceAssignment {
  id: string;                    // Assignment ID
  groupMemberId: string;         // Group member assignment ID
  workplaceId: string;           // Workplace ID
  workplaceName: string;         // Workplace name
  assignmentType: 'primary' | 'secondary' | 'temporary'; // Assignment type
  assignedAt: string;            // Assignment timestamp
  assignedBy: string;            // Admin who made the assignment
  isActive: boolean;             // Whether assignment is active
  notes?: string;                // Assignment notes
}

// ============================================================================
// WORKPLACE MANAGEMENT TYPES
// ============================================================================

/**
 * Workplace interface representing a registered workplace location
 */
export interface Workplace {
  id: string;                    // Unique workplace ID
  name: string;                  // Workplace name
  code: string;                  // Workplace code/identifier
  address: string;               // Full address
  stateId?: string;              // Associated state/city ID
  cityId?: string;               // Associated city ID
  areaId?: string;               // Associated area ID
  distributorId?: string;        // Associated distributor ID
  district?: string;             // District information
  representativePhoto?: string;  // Workplace representative photo URL
  location: {                    // GPS coordinates
    lat: number;                 // Latitude
    lng: number;                 // Longitude
  };
  type: 'registered' | 'fixed' | 'temporary';  // Workplace type
  isActive: boolean;             // Whether workplace is active
  isDefault: boolean;            // Whether this is the default workplace
  customProperties: WorkplaceCustomProperty[];  // Custom properties
  createdBy: string;             // Admin who created the workplace
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * State/City information for workplace location
 */
export interface StateCity {
  id: string;                    // State/City ID
  name: string;                  // State/City name
  type: 'state' | 'city';        // Whether this is a state or city
  parentId?: string;             // Parent state ID (for cities)
  countryCode: string;           // Country code (e.g., 'KR' for Korea)
  isActive: boolean;             // Whether this state/city is active
  createdBy: string;             // Admin who created this
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Area information for workplace location
 */
export interface Area {
  id: string;                    // Area ID
  name: string;                  // Area name
  description?: string;          // Area description
  isActive: boolean;             // Whether area is active
  createdBy: string;             // Admin who created this area
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Distributor information for workplace
 */
export interface Distributor {
  id: string;                    // Distributor ID
  name: string;                  // Distributor name
  description?: string;          // Distributor description
  logoUrl?: string;              // Distributor logo URL
  channelId?: string;            // Associated channel ID
  contactInfo?: {                // Contact information
    phone?: string;
    email?: string;
    address?: string;
  };
  isActive: boolean;             // Whether distributor is active
  createdBy: string;             // Admin who created this distributor
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Distributor channel information
 */
export interface DistributorChannel {
  id: string;                    // Channel ID
  name: string;                  // Channel name
  description?: string;          // Channel description
  isActive: boolean;             // Whether channel is active
  createdBy: string;             // Admin who created this channel
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Custom property for workplaces
 */
export interface WorkplaceCustomProperty {
  id: string;                    // Property ID
  name: string;                  // Property name
  dataType: 'select' | 'manual' | 'photo' | 'document';  // Data type
  options?: string[];            // Options for select type
  viewPermission: 'admin' | 'leader' | 'employee';  // View permission level
  editPermission: 'admin' | 'leader' | 'employee';  // Edit permission level
  isRequired: boolean;           // Whether property is required
  isActive: boolean;             // Whether property is active
  createdBy: string;             // Admin who created this property
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Custom property value for a specific workplace
 */
export interface WorkplaceCustomPropertyValue {
  id: string;                    // Value ID
  workplaceId: string;           // Associated workplace ID
  propertyId: string;            // Associated property ID
  value: string;                 // Property value
  fileUrl?: string;              // File URL (for photo/document types)
  fileName?: string;             // Original file name
  fileSize?: number;             // File size in bytes
  createdBy: string;             // User who set this value
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Workplace settings for system configuration
 */
export interface WorkplaceSettings {
  id: string;                    // Settings ID
  useArea: boolean;              // Whether to use area property
  requireRepresentativePhoto: boolean;  // Whether representative photo is required
  allowCustomProperties: boolean; // Whether custom properties are allowed
  maxCustomProperties: number;   // Maximum number of custom properties per workplace
  defaultViewPermission: 'admin' | 'leader' | 'employee';  // Default view permission
  defaultEditPermission: 'admin' | 'leader' | 'employee';  // Default edit permission
  notificationSettings: {        // Notification preferences
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  createdBy: string;             // Admin who configured settings
  updatedAt: string;             // Last update timestamp
}

/**
 * Workplace statistics for reporting
 */
export interface WorkplaceStats {
  totalWorkplaces: number;       // Total number of workplaces
  activeWorkplaces: number;      // Number of active workplaces
  registeredWorkplaces: number;  // Number of registered workplaces
  fixedWorkplaces: number;       // Number of fixed workplaces
  temporaryWorkplaces: number;   // Number of temporary workplaces
  workplacesByState: {           // Workplaces count by state
    stateId: string;
    stateName: string;
    count: number;
  }[];
  workplacesByArea: {            // Workplaces count by area
    areaId: string;
    areaName: string;
    count: number;
  }[];
  workplacesByDistributor: {     // Workplaces count by distributor
    distributorId: string;
    distributorName: string;
    count: number;
  }[];
  recentActivity: {              // Recent workplace activity
    workplaceId: string;
    workplaceName: string;
    activity: string;
    timestamp: string;
  }[];
}

/**
 * Workplace filters for search and filtering
 */
export interface WorkplaceFilters {
  type?: 'registered' | 'fixed' | 'temporary';  // Filter by workplace type
  stateId?: string;              // Filter by state
  cityId?: string;               // Filter by city
  areaId?: string;               // Filter by area
  distributorId?: string;        // Filter by distributor
  isActive?: boolean;            // Filter by active status
  searchTerm?: string;           // Search term for name/code/address
}

/**
 * Workplace import data for bulk operations
 */
export interface WorkplaceImportData {
  name: string;                  // Workplace name
  code: string;                  // Workplace code
  address: string;               // Full address
  stateName?: string;            // State name
  cityName?: string;             // City name
  areaName?: string;             // Area name
  distributorName?: string;      // Distributor name
  district?: string;             // District
  latitude?: number;             // GPS latitude
  longitude?: number;            // GPS longitude
  type: 'registered' | 'fixed' | 'temporary';  // Workplace type
  customProperties?: Record<string, any>;  // Custom property values
}

/**
 * Workplace management settings
 */
export interface WorkplaceManagementSettings {
  id: string;                    // Settings ID
  allowWorkplaceCreation: boolean; // Allow creating new workplaces
  requireApprovalForCreation: boolean; // Require approval for new workplaces
  allowWorkplaceEditing: boolean; // Allow editing existing workplaces
  requireApprovalForEditing: boolean; // Require approval for workplace edits
  allowCustomProperties: boolean; // Allow custom properties
  maxCustomProperties: number;   // Maximum custom properties per workplace
  requireRepresentativePhoto: boolean; // Require representative photo
  allowTemporaryWorkplaces: boolean; // Allow temporary workplace registration
  notificationSettings: {        // Notification preferences
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    newWorkplaceNotifications: boolean;
    workplaceUpdateNotifications: boolean;
  };
  createdBy: string;             // Admin who configured settings
  updatedAt: string;             // Last update timestamp
}

/**
 * Member information with role and group assignments
 */
export interface Member {
  id: string;                    // Member ID
  userId: string;                // Associated user ID
  name: string;                  // Member's full name
  email: string;                 // Member's email address
  phone?: string;                // Member's phone number
  avatar?: string;               // Profile picture URL
  role: MemberRole;              // Member's role in the system
  department?: string;           // Department assignment
  position?: string;             // Job position/title
  employeeId?: string;           // Employee ID number
  hireDate: string;              // Date of hire (YYYY-MM-DD)
  groups: string[];              // Array of group IDs the member belongs to
  isLeader: boolean;             // Whether member is a leader
  isAdmin: boolean;              // Whether member is an admin
  approvalAuthority: boolean;    // Whether leader has approval authority
  status: 'active' | 'inactive' | 'suspended' | 'terminated';  // Member status
  managerId?: string;            // Direct manager's member ID
  workplaceId?: string;          // Primary workplace assignment
  emergencyContact?: {           // Emergency contact information
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  permissions: MemberPermissions;  // Member's permissions
  lastLoginAt?: string;          // Last login timestamp
  createdAt: string;             // Member creation timestamp
  updatedAt: string;             // Last update timestamp
}

/**
 * Member permissions based on role
 */
export interface MemberPermissions {
  // Admin permissions
  canManageAllGroups: boolean;   // Can manage all groups
  canManageAllMembers: boolean;  // Can manage all members
  canViewAllData: boolean;       // Can view all company data
  canApproveAllRequests: boolean; // Can approve all requests
  canManageSystemSettings: boolean; // Can manage system settings
  
  // Leader permissions
  canManageAssignedGroups: boolean; // Can manage assigned groups
  canViewGroupMembers: boolean;  // Can view members in managed groups
  canViewGroupReports: boolean;  // Can view reports for managed groups
  canViewGroupAttendance: boolean; // Can view attendance for managed groups
  canViewGroupSchedules: boolean; // Can view schedules for managed groups
  canApproveGroupRequests: boolean; // Can approve requests from group members
  canCreateGroupTasks: boolean;  // Can create tasks for group members
  canManageGroupSettings: boolean; // Can manage group-specific settings
  
  // Employee permissions
  canViewOwnData: boolean;       // Can view own data
  canSubmitRequests: boolean;    // Can submit approval requests
  canCreateReports: boolean;     // Can create reports
  canUseAttendance: boolean;     // Can use attendance features
  canViewOwnSchedule: boolean;   // Can view own schedule
  canUseChat: boolean;           // Can use chat features
  canUsePostingBoard: boolean;   // Can use posting board
}

/**
 * Member statistics and metrics
 */
export interface MemberStats {
  totalMembers: number;          // Total number of members
  activeMembers: number;         // Number of active members
  admins: number;                // Number of admins
  leaders: number;               // Number of leaders
  employees: number;             // Number of employees
  membersByGroup: {              // Members count by group
    groupId: string;
    groupName: string;
    memberCount: number;
  }[];
  recentActivity: {              // Recent member activity
    memberId: string;
    memberName: string;
    activity: string;
    timestamp: string;
  }[];
}

/**
 * Member search and filter options
 */
export interface MemberFilters {
  role?: MemberRole;             // Filter by role
  groupId?: string;              // Filter by group
  status?: string;               // Filter by status
  department?: string;           // Filter by department
  position?: string;             // Filter by position
  isLeader?: boolean;            // Filter by leader status
  isAdmin?: boolean;             // Filter by admin status
  hasApprovalAuthority?: boolean; // Filter by approval authority
  searchTerm?: string;           // Search term for name/email
}

/**
 * Member import/export data structure
 */
export interface MemberImportData {
  name: string;                  // Member name
  email: string;                 // Email address
  phone?: string;                // Phone number
  department?: string;           // Department
  position?: string;             // Position
  employeeId?: string;           // Employee ID
  hireDate?: string;             // Hire date
  role: MemberRole;              // Role
  groups?: string[];             // Group assignments
  managerId?: string;            // Manager ID
  workplaceId?: string;          // Workplace ID
  emergencyContactName?: string; // Emergency contact name
  emergencyContactPhone?: string; // Emergency contact phone
  emergencyContactRelationship?: string; // Emergency contact relationship
}

/**
 * Member management settings
 */
export interface MemberManagementSettings {
  id: string;                    // Settings ID
  allowSelfRegistration: boolean; // Allow members to self-register
  requireApprovalForRegistration: boolean; // Require approval for new registrations
  defaultRole: MemberRole;       // Default role for new members
  allowRoleChanges: boolean;     // Allow changing member roles
  allowGroupChanges: boolean;    // Allow changing group assignments
  requireApprovalForRoleChanges: boolean; // Require approval for role changes
  autoAssignToDefaultGroup: boolean; // Auto-assign to default group
  defaultGroupId?: string;       // Default group ID
  notificationSettings: {        // Notification preferences
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    newMemberNotifications: boolean;
    roleChangeNotifications: boolean;
  };
  createdBy: string;             // Admin who configured settings
  updatedAt: string;             // Last update timestamp
}
