# Workforce Management Platform - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Component Structure](#component-structure)
4. [Features Documentation](#features-documentation)
5. [TypeScript Types](#typescript-types)
6. [Development Guidelines](#development-guidelines)
7. [API Integration](#api-integration)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)

## Project Overview

The Workforce Management Platform is a comprehensive React-based application inspired by Shoplworks, designed to manage employee attendance, scheduling, leave management, and administrative tasks. Built with TypeScript, Tailwind CSS, and modern React patterns.

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: React Hooks
- **Build Tool**: Create React App

## Architecture

### Application Structure
```
src/
├── components/           # React components organized by feature
│   ├── Admin/           # Administrative components
│   ├── Attendance/      # Attendance management
│   ├── Dashboard/       # Dashboard components
│   ├── Leave/          # Leave management
│   ├── Members/        # User and role management
│   ├── Schedule/       # Scheduling components
│   ├── Settings/       # Application settings
│   ├── Todo/           # Task management
│   └── Workplace/      # Workplace management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

### Component Architecture

#### 1. Page Components
Each major feature has a dedicated page component that serves as the main entry point:
- `DashboardPage.tsx` - Main dashboard with metrics and quick actions
- `AttendancePage.tsx` - Attendance management interface
- `SettingsPage.tsx` - Application settings with tabbed interface
- `MembersPage.tsx` - User and role management

#### 2. Feature Components
Feature-specific components handle business logic:
- `CompanyInfo.tsx` - Company information management
- `GroupManagement.tsx` - Organizational group management
- `AdminManagement.tsx` - Administrative access control

#### 3. Common Components
Reusable UI components:
- `ComingSoonPage.tsx` - Placeholder for future features
- Navigation components in Layout/

## Component Structure

### Company Information Management

#### CompanyInfo.tsx
**Purpose**: Manages company details, language settings, and dashboard customization.

**Key Features**:
- Admin-only access control
- Multi-language support (10+ languages)
- Real-time form validation
- Save feedback and notifications

**Props**:
```typescript
interface CompanyInfoProps {
  userRole?: MemberRole;
}
```

**State Management**:
```typescript
interface CompanyData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  personInCharge: string;
  personInChargeEmail: string;
  personInChargePhone: string;
  language: string;
  dashboardName: string;
  monetaryUnit: string;
  timezone: string;
}
```

**Key Methods**:
- `handleInputChange()` - Updates form state and clears validation errors
- `validateForm()` - Validates all form fields before submission
- `handleSave()` - Processes form submission with API simulation

### Settings Management

#### SettingsPage.tsx
**Purpose**: Main settings interface with tabbed navigation.

**Features**:
- Tab-based navigation for different settings categories
- Role-based access control for admin-only tabs
- Integration with various settings components

**Tabs**:
1. **General** - Basic application settings
2. **Company Info** - Company information management (admin only)
3. **Admin** - Administrative permissions (admin only)
4. **Notifications** - Email and push notification preferences
5. **Profile** - Personal profile and account settings
6. **Data Management** - Data export, import, and backup settings
7. **Regional** - Language, timezone, and regional settings
8. **Security** - Security and privacy settings
9. **Appearance** - UI customization and theme settings

### Group Management

#### GroupPage.tsx
**Purpose**: Hierarchical organizational structure management.

**Features**:
- Tree view of organizational hierarchy
- Drag-and-drop group management
- Leader assignment and role management
- Group analytics and reporting

#### GroupManagement.tsx
**Purpose**: Detailed group member and leader management.

**Key Features**:
- Member assignment to groups
- Leader designation and permissions
- Group hierarchy management
- Approval authority configuration

### Admin Management

#### AdminTab.tsx
**Purpose**: Administrative access control and user management.

**Features**:
- Admin user management
- Role assignment and permissions
- Access control configuration
- User activity monitoring

#### AdminManagement.tsx
**Purpose**: Detailed admin user management interface.

**Key Features**:
- View current admin users
- Grant/remove admin permissions
- Search and filter admin users
- Role-based access validation

## Features Documentation

### 1. Attendance Management

**Components**: `AttendancePage.tsx`, `FaceVerification.tsx`, `TemporaryWorkplacePunch.tsx`

**Features**:
- GPS-based location verification
- QR code authentication
- Facial recognition support
- Temporary workplace punch-in/out
- Real-time attendance tracking
- Excel export functionality

**Key Methods**:
```typescript
// Face verification setup
const setupFaceVerification = async (imageData: string) => {
  // Implementation for facial recognition setup
};

// GPS verification
const verifyLocation = async (coordinates: GeolocationCoordinates) => {
  // Implementation for location verification
};
```

### 2. Leave Management

**Components**: `LeavePage.tsx`, `GrantLeavePage.tsx`

**Features**:
- Multiple leave type support
- Approval workflows
- Leave balance tracking
- Excel import/export
- Mobile-friendly interface

**Leave Types**:
- Vacation
- Sick Leave
- Personal Time
- Maternity/Paternity
- Bereavement
- Other

### 3. Schedule Management

**Components**: `SchedulePage.tsx`

**Features**:
- Rotation-based scheduling
- Employee approval workflows
- Manager schedule creation
- Visual schedule interface
- Conflict detection

### 4. Journey Planning

**Components**: `JourneyPlanPage.tsx`, `JourneyPlanSettings.tsx`

**Features**:
- GPS-verified visit schedules
- Route optimization
- Real-time tracking
- Status management
- Analytics and reporting

### 5. Company Information Management

**Components**: `CompanyInfo.tsx`

**Features**:
- Admin-only access control
- Multi-language support (10+ languages)
- Dashboard name customization
- Regional settings
- Real-time validation

**Supported Languages**:
- English, Español, Deutsch, 한국어, 日本語
- 中文(简体), 中文(繁體), Tiếng Việt, ไทย, Magyar

## TypeScript Types

### Core Types

```typescript
// User roles for access control
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

export enum MemberRole {
  ADMIN = 'admin',
  LEADER = 'leader',
  EMPLOYEE = 'employee'
}

// Member interface
export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  isAdmin: boolean;
  groups: string[];
  workplaces: string[];
  createdAt: string;
  updatedAt: string;
}

// Group interface
export interface Group {
  id: string;
  name: string;
  description: string;
  parentGroupId?: string;
  depth: number;
  isTopLevel: boolean;
  leaderId?: string;
  members: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Company information
export interface CompanyData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  personInCharge: string;
  personInChargeEmail: string;
  personInChargePhone: string;
  language: string;
  dashboardName: string;
  monetaryUnit: string;
  timezone: string;
}
```

## Development Guidelines

### Code Style

#### 1. Component Documentation
Every component should include comprehensive JSDoc comments:

```typescript
/**
 * Component Name
 * 
 * Brief description of the component's purpose and functionality.
 * 
 * Features:
 * - Feature 1 description
 * - Feature 2 description
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */
```

#### 2. Interface Documentation
All interfaces should be documented:

```typescript
/**
 * Props interface for ComponentName
 */
interface ComponentProps {
  /** Description of the prop */
  propName: string;
  
  /** Optional prop description */
  optionalProp?: number;
}
```

#### 3. Method Documentation
Complex methods should include detailed documentation:

```typescript
/**
 * Brief description of what the method does
 * 
 * @param paramName - Description of the parameter
 * @returns Description of the return value
 * @throws Description of any exceptions
 */
const methodName = (paramName: string): boolean => {
  // Implementation
};
```

### File Organization

#### 1. Component Files
- Use PascalCase for component file names
- Include `.tsx` extension for TypeScript React components
- Group related components in feature directories

#### 2. Type Files
- Use `index.ts` for type exports
- Group related types together
- Use descriptive type names

#### 3. Utility Files
- Use camelCase for utility file names
- Include `.ts` extension for TypeScript files
- Group utilities by functionality

### State Management

#### 1. Local State
Use React hooks for component-local state:

```typescript
const [formData, setFormData] = useState<FormData>(initialData);
const [isLoading, setIsLoading] = useState(false);
const [errors, setErrors] = useState<ValidationErrors>({});
```

#### 2. Form Validation
Implement comprehensive form validation:

```typescript
const validateForm = (): boolean => {
  const newErrors: ValidationErrors = {};
  
  // Required field validation
  if (!formData.field.trim()) {
    newErrors.field = 'Field is required';
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email && !emailRegex.test(formData.email)) {
    newErrors.email = 'Please enter a valid email address';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Error Handling

#### 1. Try-Catch Blocks
Wrap async operations in try-catch blocks:

```typescript
const handleSave = async () => {
  try {
    setIsLoading(true);
    await saveData(formData);
    setSaveStatus('success');
  } catch (error) {
    setSaveStatus('error');
    console.error('Save failed:', error);
  } finally {
    setIsLoading(false);
  }
};
```

#### 2. User Feedback
Provide clear feedback for all user actions:

```typescript
{saveStatus === 'success' && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
    <div className="flex items-center">
      <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
      <span className="text-green-800 font-medium">Operation completed successfully!</span>
    </div>
  </div>
)}
```

## API Integration

### API Structure
The application is designed to integrate with RESTful APIs:

```typescript
// API endpoints structure
const API_ENDPOINTS = {
  // Company management
  company: {
    get: '/api/company',
    update: '/api/company',
  },
  
  // User management
  users: {
    list: '/api/users',
    create: '/api/users',
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
  },
  
  // Group management
  groups: {
    list: '/api/groups',
    create: '/api/groups',
    update: (id: string) => `/api/groups/${id}`,
    delete: (id: string) => `/api/groups/${id}`,
  },
  
  // Attendance
  attendance: {
    punchIn: '/api/attendance/punch-in',
    punchOut: '/api/attendance/punch-out',
    records: '/api/attendance/records',
    export: '/api/attendance/export',
  },
};
```

### API Service Layer
Create service functions for API calls:

```typescript
// Example API service
export const companyService = {
  async getCompanyInfo(): Promise<CompanyData> {
    const response = await fetch('/api/company');
    if (!response.ok) {
      throw new Error('Failed to fetch company information');
    }
    return response.json();
  },
  
  async updateCompanyInfo(data: CompanyData): Promise<CompanyData> {
    const response = await fetch('/api/company', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update company information');
    }
    
    return response.json();
  },
};
```

## Testing Strategy

### Unit Testing
Test individual components and functions:

```typescript
// Example test for CompanyInfo component
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompanyInfo from './CompanyInfo';

describe('CompanyInfo', () => {
  it('should render company information form', () => {
    render(<CompanyInfo userRole={MemberRole.ADMIN} />);
    
    expect(screen.getByText('Company Information')).toBeInTheDocument();
    expect(screen.getByLabelText('Company Name *')).toBeInTheDocument();
  });
  
  it('should validate required fields', async () => {
    render(<CompanyInfo userRole={MemberRole.ADMIN} />);
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Company name is required')).toBeInTheDocument();
    });
  });
});
```

### Integration Testing
Test component interactions and workflows:

```typescript
// Example integration test
describe('Settings Workflow', () => {
  it('should allow admin to update company information', async () => {
    render(<SettingsPage userRole={MemberRole.ADMIN} />);
    
    // Navigate to company info tab
    fireEvent.click(screen.getByText('Company Info'));
    
    // Update company name
    const nameInput = screen.getByLabelText('Company Name *');
    fireEvent.change(nameInput, { target: { value: 'New Company Name' } });
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(screen.getByText('Company information saved successfully!')).toBeInTheDocument();
    });
  });
});
```

## Deployment

### Build Process
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Start development server
npm start
```

### Environment Configuration
Create environment-specific configuration files:

```env
# .env.development
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development

# .env.production
REACT_APP_API_URL=https://api.workforce-platform.com
REACT_APP_ENVIRONMENT=production
```

### Deployment Checklist
- [ ] All tests passing
- [ ] Build successful without errors
- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Performance optimized
- [ ] Security review completed

---

## Contributing

### Development Workflow
1. Create feature branch from main
2. Implement feature with tests
3. Update documentation
4. Submit pull request
5. Code review and approval
6. Merge to main branch

### Code Review Guidelines
- Check for proper TypeScript usage
- Verify component documentation
- Ensure responsive design
- Test accessibility features
- Validate error handling

---

*This documentation is maintained by the Workforce Management Team* 