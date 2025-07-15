# Project File & Directory Overview

This section provides a high-level overview of the files and directories in this project, explaining the purpose of each. Use this as a reference for navigation, onboarding, and debugging.

## Top-Level Files & Directories

- **backend/**: Node.js/Express backend API server, database logic, and backend tests.
- **src/**: Main React frontend application source code.
- **mobile/**: React Native mobile app (Expo/managed workflow).
- **WorkforceMobileApp/**: Native mobile app (bare workflow, Android/iOS code).
- **WorkforceMobileExpo/**: Expo-based mobile app (web and mobile support).
- **docs/**: Feature documentation, requirements, and technical guides.
- **scripts/**: Utility scripts for development, testing, and deployment.
- **public/**: Static assets for the frontend (if using Create React App).
- **test, test-report-automated.html/json, test-health-report.html/json, test-report.xml**: Test output and health reports.
- **README.md**: Main project readme and quickstart.
- **DOCUMENTATION.md**: This documentation file.
- **package.json, package-lock.json**: Project dependencies and scripts.
- **docker-compose.yml, Dockerfile.frontend, nginx.conf, nginx-frontend.conf**: Deployment and infrastructure config.
- **.gitignore, .github/**: Git and GitHub configuration.
- **Other .md files**: Guides, plans, and status reports.

---

## backend/
- **server.js**: Main backend server (Express, API endpoints, DB connection).
- **package.json, package-lock.json**: Backend dependencies and scripts.
- **healthcheck.js**: Health check endpoint for monitoring.
- **Dockerfile**: Docker build for backend.
- **swagger.json**: API documentation (Swagger/OpenAPI spec).
- **__tests__/**: Backend unit, integration, and security tests.
- **README.md**: Backend-specific documentation.

## src/
- **App.tsx, App.test.tsx**: Main React app entry and test.
- **index.tsx**: ReactDOM entry point.
- **components/**: All React UI components (pages, features, common UI).
- **pages/**: Top-level page components (routing targets).
- **contexts/**: React context providers (e.g., AuthContext).
- **services/**: API service logic (fetch, hooks, etc.).
- **core/**: Shared logic, hooks, and types for modular architecture.
- **lib/**: Utility libraries (i18n, helpers).
- **types/**: TypeScript type definitions.
- **config/**: Frontend config (API endpoints, etc.).
- **__tests__/**: Frontend unit/integration tests.
- **index.css, App.css**: Global and app styles.

## mobile/
- **App.tsx**: Entry point for the mobile app.
- **src/**: Mobile-specific components, screens, contexts, types, and utils.
- **assets/**: Images and icons for mobile app.
- **__tests__/**: Mobile app tests.
- **MOBILE_DEVELOPMENT_GUIDE.md, README.md**: Mobile app documentation.

## WorkforceMobileApp/
- **App.tsx**: Native app entry point.
- **android/, ios/**: Native platform code (Android/iOS).
- **src/**: Shared mobile app logic/components.
- **vendor/**: Third-party dependencies/bundles.
- **__tests__/**: Native app tests.
- **README.md**: Native app documentation.

## WorkforceMobileExpo/
- **App.tsx**: Expo app entry point.
- **src/**: Expo-specific screens, contexts, and logic.
- **web/**: Web entry point for Expo web builds.
- **assets/**: Images/icons for Expo app.
- **README.md**: Expo app documentation.

## docs/
- **MERCHANDISING_TODO_FEATURES.md, JOURNEY_PLAN_FEATURE.md, etc.**: Feature specs and requirements.
- **features/**: Subdirectory for feature-specific docs.
- **ui-layout/**: UI/UX layout documentation.
- **TODO_FEATURE.md, GRANT_LEAVE_FEATURE.md**: Detailed feature guides.
- **PROFESSIONAL_DB_UI_INTEGRATION.md**: DB and UI integration notes.

## scripts/
- **start-dev.sh, dev-todo-feature.sh, test-auth-flow.sh, etc.**: Shell scripts for starting dev servers, running tests, and automation.
- **automated-test-runner.js, test-health-checker.js, continuous-test-monitor.js**: Node.js scripts for test automation and monitoring.
- **quick-deploy.sh, deploy-local.sh**: Deployment scripts.

---

For more details on any file or directory, see the corresponding README or documentation file, or ask for a deep dive on a specific area.

---

# Digital Tracking Merchandising - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Setup Instructions](#setup-instructions)
5. [API Documentation](#api-documentation)
6. [Frontend Features](#frontend-features)
7. [Backend Features](#backend-features)
8. [Todo Assignment Feature](#todo-assignment-feature)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Development Guidelines](#development-guidelines)
12. [Recent Updates](#recent-updates)

## 🎯 Project Overview

**Digital Tracking Merchandising** is a comprehensive workforce management platform designed for modern businesses. The platform provides real-time tracking, task management, reporting, and attendance monitoring capabilities for both web and mobile applications.

### Key Features
- **User Authentication & Authorization** - JWT-based secure authentication with role-based access control
- **Enhanced Login System** - Demo login buttons and proper form validation with React Hook Form
- **Todo Management with Assignment** - Create, assign, update, and track tasks with priority levels and user assignment
- **Report Generation** - Comprehensive reporting system with approval workflows
- **Attendance Tracking** - GPS-based punch-in/out with workplace selection and photo verification
- **Real-time Synchronization** - Data sync between web and mobile applications
- **Admin Dashboard** - Administrative tools for user and data management
- **API Documentation** - Interactive Swagger UI for API exploration
- **Rate Limiting** - Optimized rate limits for development and production environments
- **Mobile App Support** - Full-featured React Native mobile application with authentication

### User Roles
- **Admin** - Full system access, user management, and todo assignment capabilities
- **Leader** - Team management, reporting capabilities, and limited todo assignment
- **Employee** - Basic task management and completion tracking

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │  Mobile App     │    │   Backend API   │
│   (React/TS)    │◄──►│   (React Native)│◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Swagger UI    │
                    │  (API Docs)     │
                    └─────────────────┘
```

### Data Flow
1. **Authentication** - Users authenticate via JWT tokens
2. **API Requests** - Frontend/mobile apps communicate via RESTful APIs
3. **Data Processing** - Backend processes requests and manages data
4. **Real-time Sync** - Changes are synchronized across platforms
5. **Security** - All communications are secured with JWT and HTTPS

## 🛠️ Technology Stack

### Frontend (Web)
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Context** - State management

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Rate Limiting** - API abuse prevention
- **Swagger UI** - API documentation

### Mobile
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform
- **AsyncStorage** - Local data storage
- **Geolocation** - GPS tracking

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Cypress** - E2E testing
- **Git** - Version control

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- Modern web browser
- Mobile device or emulator (for mobile app)
- **Network Access**: Ensure your computer and mobile device are on the same network

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Digital_Tracking_Merchandising
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file in backend directory
   PORT=5000
   JWT_SECRET=your-secret-key-change-in-production
   NODE_ENV=development
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

5. **Verify backend is running**
   - Health check: http://localhost:5000/api/health
   - API Documentation: http://localhost:5000/api/docs

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd ../
   npm install
   ```

2. **Start the frontend development server**
   ```bash
   npm start
   ```

3. **Access the application**
   - Web app: http://localhost:3000
   - Default credentials: 
     - **Admin:** admin@company.com / password
     - **Employee:** richard@company.com / password
   - **Demo Login:** Use the quick demo login buttons on the login page

### Mobile App Setup

1. **Install mobile dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Start Expo development server**
   ```bash
   npm start
   ```

3. **Run on device/emulator**
   - **Web Browser**: Open http://localhost:8081 for Expo DevTools
   - **Mobile Device**: Scan QR code with Expo Go app
   - **iOS Simulator**: Press 'i' in the terminal
   - **Android Emulator**: Press 'a' in the terminal

4. **Mobile App Features**
   - **Authentication**: Same login system as web app
   - **Quick Login**: Demo buttons for testing
   - **Network Configuration**: Automatically configured for local development
   - **Cross-Platform**: Works on iOS and Android

**Note**: The mobile app is configured to connect to the backend server using your computer's network IP address. Make sure both backend and mobile servers are running for full functionality.

## 📚 API Documentation

### Interactive Documentation
Access the complete API documentation at: **http://localhost:5000/api/docs**

The Swagger UI provides:
- Interactive API exploration
- Request/response examples
- Authentication testing
- Schema definitions
- Error code documentation

### API Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login (supports demo credentials)
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/reset-password` - Reset password

**Demo Credentials:**
- Admin: admin@company.com / password
- Employee: richard@company.com / password

#### Todos
- `GET /api/todos` - Get user todos (returns todos assigned to current user)
- `POST /api/todos` - Create todo (supports assignment to other users)
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## 📋 Todo Assignment Feature

### Overview
The Todo Assignment Feature allows administrators and team leaders to create and assign tasks to specific employees, enabling better task distribution and accountability tracking.

### Key Features

#### 🔐 **Role-Based Assignment**
- **Admins**: Can assign todos to any user in the system
- **Leaders**: Can assign todos to team members
- **Employees**: Can only create todos for themselves

#### 📝 **Assignment Tracking**
- **assignedTo**: User ID of the person assigned the task
- **assignedBy**: User ID of the person who assigned the task
- **assignedAt**: Timestamp when the task was assigned
- **userId**: Original creator of the task

#### 🎯 **Assignment Workflow**
1. **Admin/Leader creates todo** with assignment dropdown
2. **Employee receives assigned todo** in their task list
3. **Employee completes todo** and marks as done
4. **System tracks completion** with timestamps

### Frontend Implementation

#### TodoPage Component (`src/components/Todo/TodoPage.tsx`)
```typescript
/**
 * TodoPage Component
 * 
 * Main component for managing todos. Provides functionality for:
 * - Viewing todos assigned to the current user
 * - Creating new todos (with assignment for admins)
 * - Updating todo status and details
 * - Deleting todos
 * - Managing todo settings and templates
 */
```

**Key Features:**
- **Assignment Dropdown**: Admin-only dropdown to select assignee
- **User Loading**: Fetches users for assignment options
- **Optimistic Updates**: Immediate UI updates for better UX
- **Error Handling**: Comprehensive error handling with toast notifications

#### Mobile Integration (`mobile/src/screens/tasks/TasksScreen.tsx`)
- **Assigned Todos Display**: Shows todos assigned to current user
- **Pull-to-Refresh**: Refresh assigned todos
- **Completion Tracking**: Mark assigned todos as complete
- **Real-time Updates**: Sync with backend changes

### Backend Implementation

#### Todo API Endpoints
```javascript
/**
 * Get all todos for authenticated user
 * Returns list of todos assigned to the current user
 */
app.get('/api/todos', authenticateToken, (req, res) => {
  // Filter todos to show todos assigned to current user
  const userTodos = todos.filter(todo => todo.assignedTo === req.user.id);
  res.json({ todos: userTodos });
});

/**
 * Create new todo with assignment support
 * Creates a new todo item with optional user assignment
 */
app.post('/api/todos', authenticateToken, (req, res) => {
  const { title, description, priority = 'medium', assignedTo } = req.body;
  
  const newTodo = {
    id: uuidv4(),
    title,
    description,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    userId: req.user.id, // Creator
    assignedTo: assignedTo || req.user.id, // Assigned user (defaults to creator)
    assignedBy: req.user.id, // Who assigned it
    assignedAt: new Date().toISOString()
  };
});
```

### Data Structure

#### Todo Object
```typescript
interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  userId: string;        // Creator
  assignedTo: string;    // Assigned user
  assignedBy: string;    // Who assigned it
  assignedAt: string;    // Assignment timestamp
}
```

### Testing Coverage

#### Frontend Tests (`src/components/Todo/__tests__/TodoPage.test.tsx`)
- **Admin Role Testing**: Assignment dropdown functionality
- **Employee Role Testing**: Viewing assigned todos
- **Todo Creation**: With and without assignment
- **UI Interactions**: Form validation, error handling
- **API Integration**: Mock API calls and responses

#### Backend Tests (`backend/__tests__/todo-assignment.test.js`)
- **Authentication**: Token validation
- **Authorization**: Role-based access control
- **Todo Creation**: Assignment tracking
- **Todo Retrieval**: User-specific filtering
- **Todo Updates**: Status changes and completion
- **Todo Deletion**: Proper cleanup

#### Mobile Tests (`mobile/src/screens/tasks/__tests__/TasksScreen.test.tsx`)
- **Assigned Todos Display**: Correct rendering
- **Pull-to-Refresh**: Data refresh functionality
- **Completion Actions**: Mark as complete/incomplete
- **Error Handling**: Network errors and edge cases
- **Accessibility**: Screen reader support

#### Integration Tests (`__tests__/integration/todo-assignment-workflow.test.tsx`)
- **Complete Workflow**: Admin creates → Employee completes
- **Assignment Tracking**: Verify assignment metadata
- **Error Scenarios**: Network failures, invalid data
- **Cross-Platform Sync**: Web ↔ Mobile synchronization

### Usage Examples

#### Admin Creating Assigned Todo
```javascript
// Admin creates todo and assigns to employee
const todoData = {
  title: "Stock inventory check",
  description: "Check and update stock levels",
  priority: "high",
  assignedTo: "employee-user-id"
};

const response = await createTodo(todoData);
// Response includes assignment tracking
// {
//   message: "Todo created successfully",
//   todo: {
//     id: "todo-123",
//     assignedTo: "employee-user-id",
//     assignedBy: "admin-user-id",
//     assignedAt: "2025-01-13T10:30:00Z"
//   }
// }
```

#### Employee Viewing Assigned Todos
```javascript
// Employee fetches their assigned todos
const todos = await getTodos();
// Returns only todos where assignedTo === currentUserId
```

#### Employee Completing Assigned Todo
```javascript
// Employee marks assigned todo as complete
const response = await updateTodo(todoId, { completed: true });
// Updates completedAt timestamp and status
```
- `DELETE /api/todos/:id` - Delete todo

#### Reports
- `GET /api/reports` - Get user reports
- `POST /api/reports` - Create report

#### Attendance
- `POST /api/attendance/punch-in` - Record punch in (requires workplace field)
- `POST /api/attendance/punch-out` - Record punch out
- `GET /api/attendance/history` - Get attendance history

**Punch-in Requirements:**
- `workplace` field is required (string)
- `photo` field is optional (base64 encoded)
- Available to all authenticated users regardless of role

#### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/todos` - Get all todos
- `GET /api/admin/reports` - Get all reports
- `GET /api/admin/attendance` - Get all attendance data

#### System
- `GET /api/health` - Health check

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 🎨 Frontend Features

### Core Components
- **Authentication System** - Login, registration, and session management
- **Dashboard** - Overview of tasks, reports, and attendance
- **Todo Management** - Create, edit, and track tasks
- **Report System** - Generate and submit reports
- **Attendance Tracking** - Punch in/out functionality
- **User Management** - Profile and settings management

### UI/UX Features
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Mode** - Theme switching capability
- **Real-time Updates** - Live data synchronization
- **Loading States** - User feedback during operations
- **Error Handling** - Graceful error display and recovery
- **Form Validation** - Client-side input validation

### Navigation
- **Sidebar Navigation** - Main menu with collapsible sections
- **Breadcrumb Navigation** - Page location indicators
- **Search Functionality** - Global search across data
- **Quick Actions** - Shortcut buttons for common tasks

## 🔧 Backend Features

### Security Features
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevents API abuse
- **CORS Protection** - Cross-origin request security
- **Helmet Security** - HTTP security headers
- **Input Validation** - Request data sanitization

### Data Management
- **In-Memory Storage** - Fast data access (replace with database in production)
- **User Management** - CRUD operations for users
- **Todo Management** - Task creation and tracking
- **Report Management** - Report generation and approval
- **Attendance Tracking** - Time and location recording

### API Features
- **RESTful Design** - Standard HTTP methods and status codes
- **Error Handling** - Comprehensive error responses
- **Logging** - Request and error logging
- **Health Monitoring** - System status endpoints
- **API Documentation** - Auto-generated Swagger documentation

## 🧪 Testing

### Test Types
- **Unit Tests** - Individual component and function testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user workflow testing
- **Performance Tests** - Load and stress testing

### Running Tests

#### Backend Tests
```bash
cd backend
npm test
```

#### Frontend Tests
```bash
npm test
```

#### E2E Tests
```bash
npm run cypress:open
```

#### Health Check
```bash
node scripts/health-check.js
```

#### Smoke Test
```bash
node scripts/smoke-test.js
```

### Test Coverage
- **Backend API** - 90%+ endpoint coverage
- **Frontend Components** - 85%+ component coverage
- **Authentication Flow** - 100% coverage
- **Critical User Paths** - 95%+ E2E coverage

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=<strong-secret-key>
   DATABASE_URL=<database-connection-string>
   ```

2. **Database Setup**
   - Replace in-memory storage with PostgreSQL/MongoDB
   - Set up database migrations
   - Configure connection pooling

3. **Security Hardening**
   - Enable HTTPS
   - Configure CORS for production domains
   - Set up rate limiting for production
   - Enable security headers

4. **Monitoring**
   - Set up application monitoring
   - Configure error tracking
   - Enable performance monitoring
   - Set up health checks

### Deployment Options

#### Heroku
```bash
# Deploy backend
cd backend
heroku create
git push heroku main

# Deploy frontend
cd ../
npm run build
```

#### Docker
```bash
# Build and run with Docker
docker-compose up -d
```

#### AWS/Azure/GCP
- Use container services
- Set up load balancers
- Configure auto-scaling
- Enable CDN for static assets

## 📝 Development Guidelines

### Code Standards
- **TypeScript** - Use strict mode and proper typing
- **ESLint** - Follow linting rules
- **Prettier** - Consistent code formatting
- **Git Hooks** - Pre-commit validation

### Git Workflow
1. **Feature Branches** - Create branches for new features
2. **Pull Requests** - Code review before merging
3. **Commit Messages** - Use conventional commit format
4. **Version Tagging** - Tag releases with semantic versioning

### Code Organization
```
src/
├── components/     # Reusable UI components
├── pages/         # Page-level components
├── services/      # API and business logic
├── hooks/         # Custom React hooks
├── contexts/      # React contexts
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── assets/        # Static assets
```

### Performance Optimization
- **Code Splitting** - Lazy load components
- **Memoization** - Use React.memo and useMemo
- **Bundle Optimization** - Tree shaking and minification
- **Caching** - Implement proper caching strategies

## 🔄 Recent Updates

### Latest Features (v1.0.2)

#### ✅ Completed Features
- **Mobile App Authentication** - Fixed mobile app login with proper network configuration
- **CORS Configuration** - Enhanced CORS settings for mobile app compatibility
- **Network Configuration** - Updated API endpoints to use network IP addresses
- **Debugging Tools** - Added comprehensive debugging for mobile app development
- **Login System Fix** - Fixed demo login buttons and authentication flow
- **Rate Limiting Optimization** - Increased limits for development environment
- **Punch-in/Punch-out System** - Updated to require workplace selection
- **TypeScript Error Resolution** - Fixed API response type mismatches
- **Swagger UI Integration** - Interactive API documentation
- **Comprehensive API Documentation** - Complete endpoint documentation
- **Enhanced Security** - Rate limiting and security headers
- **Testing Infrastructure** - Jest, Cypress, and health checks
- **Modular Architecture** - Separated concerns and reusable components
- **Error Handling** - Improved error messages and recovery
- **Session Management** - JWT token handling and timeout
- **Mobile App Foundation** - React Native setup with Expo

#### 🚧 In Progress
- **Database Integration** - Replace in-memory storage
- **Real-time Features** - WebSocket implementation
- **Advanced Reporting** - Analytics and dashboards
- **Mobile Push Notifications** - Real-time alerts

#### 📋 Planned Features
- **Multi-language Support** - Internationalization
- **Advanced Analytics** - Business intelligence features
- **Integration APIs** - Third-party service integration
- **Advanced Security** - 2FA and audit logging

### Recent Bug Fixes (v1.0.2)
- **Fixed Mobile App Login** - Resolved network connectivity issues and CORS configuration
- **Updated API Endpoints** - Changed from localhost to network IP addresses for mobile compatibility
- **Enhanced CORS Settings** - Added support for mobile app origins and Expo development
- **Fixed Login Demo Buttons** - Demo login now works properly with React Hook Form
- **Resolved Rate Limiting Issues** - Increased development rate limits to 10,000 requests per 15 minutes
- **Fixed TypeScript Errors** - Corrected API response types for todo endpoints
- **Updated Attendance System** - Changed from 'location' to 'workplace' field requirement
- **Improved Error Handling** - Better error messages for authentication failures

### Breaking Changes
- **Attendance API** - Changed `location` field to `workplace` in punch-in requests
- **Todo API Response** - Updated response structure to match backend implementation

### Migration Guide
- Update frontend code to use `workplace` instead of `location` for attendance
- Ensure todo API calls expect `{ todos: Todo[] }` response format

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Development Setup
```bash
# Clone and setup
git clone <your-fork-url>
cd Digital_Tracking_Merchandising
npm install

# Start development servers
cd backend && npm start &
cd ../ && npm start
```

### Code Review Process
1. **Automated Checks** - CI/CD pipeline validation
2. **Manual Review** - Code review by maintainers
3. **Testing** - Ensure all tests pass
4. **Documentation** - Update docs for new features

## 📞 Support

### Getting Help
- **Documentation** - Check this file and API docs
- **Issues** - Create GitHub issues for bugs
- **Discussions** - Use GitHub discussions for questions
- **Email** - Contact support@company.com

### Common Issues
- **Port Conflicts** - Change ports in .env files
- **CORS Errors** - Check backend CORS configuration
- **Authentication Issues** - Verify JWT token format
- **Mobile App Issues** - Check Expo configuration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated:** July 13, 2025  
**Version:** 1.0.2  
**Maintainer:** Workforce Management Team 