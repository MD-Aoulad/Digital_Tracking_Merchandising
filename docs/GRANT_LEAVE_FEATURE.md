# Grant Leave Feature Documentation

## Overview

The **Grant Leave for Accrued Leave Type** feature is a comprehensive administrative tool that allows authorized users (admins) to grant leave days to employees for various leave types. This feature supports both bulk operations (same leave for all employees) and individual configurations (different leave amounts per employee via Excel upload).

## 🎯 Key Features

### Core Functionality
- **6-Step Wizard Interface**: Guided process for leave grant configuration
- **Dual Grant Types**: Support for both bulk and individual leave grants
- **Excel Integration**: Template download and bulk upload capabilities
- **Carryover Management**: Flexible expiration rules for unused leave
- **Real-time Validation**: Step-by-step form validation with clear feedback
- **Admin-Only Access**: Restricted to administrative users

### Grant Types Supported

#### 1. Same for All Employees
- Grant identical leave days to all selected employees
- Configure period start/end dates
- Set carryover expiration rules
- Ideal for annual leave allocations

#### 2. Individual Employee Grants
- Grant different leave amounts per employee
- Excel template download for data entry
- Bulk upload processing
- Perfect for performance-based or role-specific allocations

### Carryover Options
- **Months from ended month**: Leave expires X months after period end
- **Days from ended day**: Leave expires X days after period end
- **Next year month**: Leave expires in specific month of next year
- **Specific date**: Leave expires on exact date

## 🚀 User Guide

### Accessing the Feature
1. Navigate to the sidebar menu
2. Click on "Grant Leave" under Workforce Management section
3. Ensure you have admin privileges

### Step-by-Step Process

#### Step 1: Enter Title
- Provide a descriptive title for the leave grant
- Example: "Annual Leave 2025 - Sales Team"
- Title is required and used for easy identification

#### Step 2: Select Leave Type
- Choose from available leave types:
  - Annual Leave (25 days max)
  - Sick Leave (15 days max)
  - Personal Leave (10 days max)
  - Maternity Leave (90 days max)

#### Step 3: Select Employees
- Choose target employees for the grant
- Options:
  - Select all employees
  - Select specific individuals
- At least one employee must be selected

#### Step 4: Choose Grant Type
- **Same for All**: Grant identical leave to all employees
- **Individual**: Grant different amounts via Excel upload

#### Step 5: Configure Details

**For "Same for All" type:**
- Enter number of days granted (supports decimals)
- Set period start and end dates
- Configure carryover expiration rules

**For "Individual" type:**
- Download Excel template
- Fill in employee-specific data
- Upload completed file

#### Step 6: Review and Save
- Review all configuration details
- Confirm employee list and allocations
- Execute the leave grant

## 📊 Excel Template Structure

The downloadable template includes the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Employee ID | Unique employee identifier | 1 |
| Employee Name | Full name of employee | Alice Smith |
| Email | Employee email address | alice@example.com |
| Department | Employee department | Sales |
| Days Granted | Number of leave days | 25 |
| Period Start | Leave period start date | 2025-01-01 |
| Period End | Leave period end date | 2025-12-31 |
| Carryover Expiration | Expiration date for unused leave | 2026-03-31 |

## 🔧 Technical Implementation

### Component Structure
```
GrantLeavePage/
├── State Management
│   ├── Step tracking (currentStep, canProceed)
│   ├── Form data (title, leaveType, employees, etc.)
│   ├── File handling (excelFile, uploadedDetails)
│   └── Processing state (isProcessing)
├── Validation Logic
│   ├── Step-by-step validation
│   ├── Real-time form validation
│   └── Error handling
├── Event Handlers
│   ├── Navigation (next/previous)
│   ├── Data manipulation (employee selection)
│   ├── File operations (upload/download)
│   └── Save operations
└── UI Components
    ├── Progress indicator
    ├── Step-specific forms
    ├── File upload interface
    └── Review summary
```

### Key Functions

#### `validateStep()`
- Validates current step data
- Updates `canProceed` state
- Handles different validation rules per step

#### `handleFileUpload()`
- Processes uploaded Excel files
- Extracts employee-specific data
- Updates `uploadedDetails` state

#### `handleSave()`
- Creates LeaveGrant object
- Sends to backend API
- Handles success/error states
- Resets form for next use

#### `downloadTemplate()`
- Generates CSV template
- Triggers file download
- Provides sample data structure

### State Management

```typescript
// Step Management
const [currentStep, setCurrentStep] = useState(1);
const [canProceed, setCanProceed] = useState(false);

// Form Data
const [title, setTitle] = useState('');
const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
const [grantType, setGrantType] = useState<'same' | 'individual'>('same');

// Configuration
const [daysGranted, setDaysGranted] = useState<number>(0);
const [periodStart, setPeriodStart] = useState('');
const [periodEnd, setPeriodEnd] = useState('');
const [carryoverType, setCarryoverType] = useState<'months' | 'days' | 'nextYear' | 'specificDate'>('months');
const [carryoverValue, setCarryoverValue] = useState<string>('');

// File Handling
const [excelFile, setExcelFile] = useState<File | null>(null);
const [uploadedDetails, setUploadedDetails] = useState<LeaveGrantDetail[]>([]);

// Processing
const [isProcessing, setIsProcessing] = useState(false);
```

## 📋 API Specifications

### LeaveGrant Interface
```typescript
interface LeaveGrant {
  id: string;                    // Unique grant ID
  title: string;                 // Grant title
  leaveTypeId: string;           // Leave type ID
  employees: string[];           // Employee IDs
  grantType: 'same' | 'individual';
  daysGranted?: number;          // For 'same' type
  periodStart: string;           // Period start date
  periodEnd: string;             // Period end date
  carryoverType: 'months' | 'days' | 'nextYear' | 'specificDate';
  carryoverValue?: number | string;
  createdBy: string;             // Admin user ID
  createdAt: string;             // Creation timestamp
  details?: LeaveGrantDetail[];  // For 'individual' type
}
```

### LeaveGrantDetail Interface
```typescript
interface LeaveGrantDetail {
  userId: string;                // Employee ID
  daysGranted: number;           // Days granted
  periodStart: string;           // Period start
  periodEnd: string;             // Period end
  carryoverExpiration: string;   // Expiration date
}
```

## 🎨 UI/UX Design

### Design Principles
- **Progressive Disclosure**: Information revealed step-by-step
- **Clear Visual Hierarchy**: Important elements stand out
- **Consistent Feedback**: Real-time validation and status updates
- **Mobile Responsive**: Works on all device sizes
- **Accessibility**: Keyboard navigation and screen reader support

### Visual Elements
- **Progress Indicator**: Shows current step and completion
- **Step Cards**: Clear separation of each wizard step
- **Validation States**: Visual feedback for form validation
- **Loading States**: Processing indicators for async operations
- **Success/Error Messages**: Toast notifications for user feedback

## 🔒 Security & Permissions

### Access Control
- **Admin-Only**: Restricted to users with admin privileges
- **Role-Based**: Uses existing authentication system
- **Audit Trail**: Tracks who created each grant

### Data Validation
- **Client-Side**: Real-time form validation
- **Server-Side**: Backend validation (when implemented)
- **File Validation**: Excel file format and content validation

## 🧪 Testing

### Test Scenarios
1. **Happy Path**: Complete grant process for same type
2. **Individual Grants**: Excel upload and processing
3. **Validation**: Form validation at each step
4. **Error Handling**: Network errors and invalid data
5. **Mobile Testing**: Responsive design verification

### Test Data
- Mock employees and leave types provided
- Sample Excel templates for testing
- Various carryover configurations

## 🚀 Future Enhancements

### Planned Features
- **Batch Processing**: Multiple grants in single operation
- **Approval Workflow**: Multi-level approval process
- **Notification System**: Email notifications to employees
- **Reporting**: Grant history and analytics
- **Integration**: Connect with existing leave management

### Technical Improvements
- **Real Excel Parsing**: Replace mock file processing
- **Backend Integration**: Connect to actual API endpoints
- **Performance Optimization**: Large employee list handling
- **Offline Support**: Work without internet connection

## 📝 Changelog

### Version 1.0.0 (2025-01-09)
- Initial implementation of Grant Leave feature
- 6-step wizard interface
- Support for same and individual grant types
- Excel template download and upload
- Carryover configuration options
- Admin-only access control
- Responsive design implementation

## 🤝 Contributing

When contributing to this feature:

1. Follow existing code style and patterns
2. Add comprehensive comments for new functions
3. Update this documentation for any changes
4. Test thoroughly before submitting
5. Ensure mobile responsiveness

## 📞 Support

For questions or issues with the Grant Leave feature:

1. Check this documentation first
2. Review the component code and comments
3. Test with different scenarios
4. Contact the development team

---

**Last Updated**: January 9, 2025  
**Version**: 1.0.0  
**Author**: Workforce Management Team 