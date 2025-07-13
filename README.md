# Digital Tracking Merchandising

A comprehensive workforce management platform with real-time tracking, task management, reporting, and attendance monitoring capabilities for both web and mobile applications.

## 🚀 Features

### Core Features
- **🔐 Secure Authentication** - JWT-based authentication with role-based access control
- **📱 Cross-Platform** - Web (React/TypeScript) + Mobile (React Native/Expo)
- **📊 Real-time Dashboard** - Live data synchronization across platforms
- **📝 Todo Management** - Create, assign, and track tasks with priority levels
- **📋 Report Generation** - Comprehensive reporting with approval workflows
- **⏰ Attendance Tracking** - GPS-based punch-in/out with photo verification
- **👥 User Management** - Admin tools for user and role management
- **🔧 API Documentation** - Interactive Swagger UI for API exploration

### Todo Assignment Feature ✨
- **🎯 Role-Based Assignment** - Admins can assign tasks to any user
- **📋 Assignment Tracking** - Complete audit trail of task assignments
- **📱 Mobile Integration** - Assigned tasks appear in mobile app
- **🔄 Real-time Sync** - Changes sync instantly across web and mobile
- **✅ Completion Tracking** - Track task completion with timestamps

## 🛠️ Technology Stack

### Frontend (Web)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Context** for state management
- **React Hook Form** for form handling

### Backend
- **Node.js** with Express.js
- **JWT** for authentication
- **bcrypt** for password hashing
- **Swagger UI** for API documentation
- **Rate limiting** and security headers

### Mobile
- **React Native** with Expo
- **AsyncStorage** for local data
- **Geolocation** for GPS tracking
- **Camera integration** for photo verification

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Backend Setup
```bash
cd backend
npm install
npm start
```
Backend will run on http://localhost:5000

### Frontend Setup
```bash
npm install
npm start
```
Frontend will run on http://localhost:3000

### Mobile Setup
```bash
cd mobile
npm install
npx expo start
```

## 🔐 Demo Credentials

- **Admin:** admin@company.com / password
- **Employee:** richard@company.com / password

## 📋 Todo Assignment Workflow

### For Admins
1. Navigate to Todo Management
2. Click "New Todo"
3. Fill in task details
4. Select assignee from dropdown
5. Create task

### For Employees
1. View assigned tasks in Todo Management
2. Mark tasks as complete
3. Track progress and deadlines

## 🧪 Testing

### Test Coverage
- **Frontend Tests** - React component testing with Jest and React Testing Library
- **Backend Tests** - API endpoint testing with Supertest
- **Mobile Tests** - React Native component testing
- **Integration Tests** - End-to-end workflow testing

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# Mobile tests
cd mobile && npm test
```

## 📚 Documentation

- **API Documentation**: http://localhost:5000/api/docs
- **Complete Documentation**: [DOCUMENTATION.md](DOCUMENTATION.md)
- **Development Guide**: [DEVELOPMENT_SESSION.md](DEVELOPMENT_SESSION.md)

## 🔧 Development

### Project Structure
```
Digital_Tracking_Merchandising/
├── backend/                 # Node.js API server
├── mobile/                  # React Native mobile app
├── src/                     # React web frontend
├── __tests__/              # Integration tests
└── docs/                   # Documentation
```

### Key Components
- **TodoPage** - Main todo management interface
- **TasksScreen** - Mobile todo interface
- **Todo API** - Backend todo endpoints with assignment support
- **AuthContext** - Authentication state management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆕 Recent Updates

### Todo Assignment Feature (Latest)
- ✅ Added role-based todo assignment
- ✅ Implemented assignment tracking
- ✅ Added mobile app integration
- ✅ Created comprehensive test suite
- ✅ Updated documentation

### Previous Features
- ✅ User authentication and authorization
- ✅ Attendance tracking with GPS
- ✅ Report generation system
- ✅ Admin dashboard
- ✅ API documentation with Swagger
