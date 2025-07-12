# Workforce Management Platform

A comprehensive workforce management platform inspired by Shoplworks, built with React, TypeScript, and Tailwind CSS. This platform provides complete attendance management, employee scheduling, leave management, and administrative tools for modern organizations.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## Overview

The Workforce Management Platform is a full-stack application designed to streamline workforce operations for modern organizations. It features a React-based web application with a Node.js/Express backend API, providing real-time data synchronization between web and mobile interfaces.

### Key Highlights
- **Full-Stack Solution**: React frontend with Node.js backend
- **Real-time Sync**: Web and mobile app data synchronization
- **JWT Authentication**: Secure user authentication and authorization
- **Role-based Access**: Admin, Leader, and Employee role management
- **Mobile Responsive**: Optimized for all device types
- **TypeScript**: Type-safe development throughout

## 🚀 Features

### Core Features
- **Attendance Management** - GPS and QR code authentication with facial recognition
- **Face Verification** - Biometric authentication for secure attendance tracking
- **Temporary Workplace Punch** - Support for remote and off-site work
- **Schedule Management** - Rotation-based scheduling with approval workflows
- **Leave Management** - Comprehensive leave application and approval system
- **Journey Planning** - GPS-verified visit schedule management for remote workers
- **Reporting & Analytics** - Real-time dashboards with Excel export capabilities
- **To-Do Tasks** - Task management with notifications and templates
- **Member Role Management** - Hierarchical role-based access control

### Backend API Features
- **RESTful API** - Complete CRUD operations for all entities
- **JWT Authentication** - Secure token-based authentication
- **Password Reset** - Email-based password reset functionality
- **Rate Limiting** - API abuse prevention
- **CORS Support** - Cross-origin request handling
- **Error Handling** - Comprehensive error management
- **Data Validation** - Input validation and sanitization

### Mobile App Features
- **Cross-Platform** - Works on iOS, Android, and web browsers
- **Offline Support** - Local storage for offline functionality
- **GPS Integration** - Location-based attendance tracking
- **Photo Verification** - Camera integration for attendance verification
- **Real-time Sync** - Automatic data synchronization with backend
- **Push Notifications** - Real-time updates and alerts

### Administrative Features
- **Company Information Management** - Centralized company settings and configuration
- **Group Management** - Hierarchical organizational structure management
- **Admin Management** - Role-based administrative access control
- **Workplace Management** - Multi-location workplace configuration
- **User Management** - Comprehensive employee and user administration

## 🛠 Technology Stack

### Frontend (Web App)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **UI Components**: Lucide React Icons, Custom Components
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Routing**: React Router v6
- **Build Tool**: Create React App
- **Package Manager**: npm

### Backend (API Server)
- **Runtime**: Node.js with Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Security**: Helmet.js, CORS, Rate Limiting
- **Data Storage**: In-memory (production: database)
- **Validation**: Express middleware validation

### Mobile App
- **Framework**: HTML5/CSS3/JavaScript
- **Storage**: Local Storage for offline functionality
- **API Integration**: Fetch API for backend communication
- **Responsive Design**: Mobile-first approach
- **Cross-Platform**: Works on all modern browsers

### Development Tools
- **Version Control**: Git
- **Code Quality**: ESLint, TypeScript compiler
- **Package Management**: npm
- **Development Server**: Concurrent frontend/backend servers

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Digital_Tracking_Merchandising
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5000`

5. **Start the frontend development server** (in a new terminal)
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

6. **Access the applications**
   - **Web App**: Navigate to `http://localhost:3000`
   - **Mobile App**: Open `mobile-app.html` in any browser
   - **API Health Check**: Visit `http://localhost:5000/api/health`

### Default Users
- **Admin**: `admin@company.com` / `password`
- **Employee**: `richard@company.com` / `password`

## 🏗 Project Structure

```
Digital_Tracking_Merchandising/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   │   ├── Admin/         # Administrative components
│   │   ├── Attendance/    # Attendance management
│   │   ├── Dashboard/     # Dashboard components
│   │   ├── Leave/         # Leave management
│   │   ├── Members/       # User and role management
│   │   ├── Schedule/      # Scheduling components
│   │   ├── Settings/      # Application settings
│   │   ├── Todo/          # Task management
│   │   └── Workplace/     # Workplace management
│   ├── services/          # API service layer
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Application entry point
├── backend/               # Backend API server
│   ├── server.js          # Main Express server
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
├── mobile-app.html        # Mobile application
├── docs/                  # Documentation files
├── package.json           # Frontend dependencies
└── README.md              # This file
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `POST /auth/reset-password` - Reset password

### Todo Endpoints
- `GET /todos` - Get user's todos
- `POST /todos` - Create new todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo

### Report Endpoints
- `GET /reports` - Get user's reports
- `POST /reports` - Create new report
- `PUT /reports/:id/status` - Update report status (admin)

### Attendance Endpoints
- `GET /attendance` - Get attendance history
- `POST /attendance/punch-in` - Record punch in
- `POST /attendance/punch-out` - Record punch out

### Admin Endpoints
- `GET /admin/users` - Get all users (admin only)
- `GET /admin/todos` - Get all todos (admin only)
- `GET /admin/reports` - Get all reports (admin only)
- `GET /admin/attendance` - Get all attendance (admin only)

### Health Check
- `GET /health` - API health status

## 🎯 Key Components

### Attendance Management
- **GPS Authentication**: Location-based attendance verification
- **QR Code Support**: Quick attendance scanning
- **Face Recognition**: Biometric authentication
- **Real-time Tracking**: Live attendance monitoring
- **Excel Export**: Data export for HR tasks

### Schedule Management
- **Rotation Scheduling**: Optimized for shift-based work
- **Approval Workflows**: Employee schedule change requests
- **Manager Controls**: Schedule creation and modification
- **Visual Interface**: Intuitive schedule display

### Leave Management
- **Multiple Leave Types**: Vacation, sick leave, personal time
- **Approval System**: Admin and leader approval workflows
- **Usage Tracking**: Leave balance monitoring
- **Mobile Support**: Mobile-friendly leave requests

### Company Information
- **Admin-Only Access**: Secure company information management
- **Multi-language Support**: 10+ language options
- **Dashboard Customization**: Customizable dashboard names
- **Regional Settings**: Timezone and currency configuration

## 🔐 Role-Based Access Control

### User Roles
- **Admin**: Full system access and configuration
- **Leader**: Team management and approval authority
- **Employee**: Basic attendance and leave functionality

### Permission Levels
- **Company Info**: Admin only
- **User Management**: Admin and Leaders
- **Schedule Management**: Admin, Leaders, and Employees (view)
- **Attendance**: All users with role-based restrictions

## 📱 Mobile Responsiveness

The platform is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices
- Touch interfaces

## 📖 Usage Guide

### Getting Started

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend Application**
   ```bash
   npm start
   ```

3. **Access the Mobile App**
   - Open `mobile-app.html` in any modern browser
   - Works on desktop, tablet, and mobile devices

### User Management

#### Creating New Users
1. Login as admin (`admin@company.com` / `password`)
2. Navigate to Members → Add New Member
3. Fill in user details and save
4. User can now login with their credentials

#### Password Reset
1. On login page, click "Forgot Password?"
2. Enter email address
3. Enter new password (minimum 6 characters)
4. Password will be updated in the system

### Attendance Tracking

#### Web App
1. Navigate to Attendance section
2. Click "Punch In" or "Punch Out"
3. Location will be automatically captured
4. View attendance history and reports

#### Mobile App
1. Open mobile app in browser
2. Login with credentials
3. Use "Punch In/Out" buttons
4. GPS location and photo verification available

### Todo Management
1. Navigate to Todo section
2. Create new tasks with priority levels
3. Mark tasks as complete
4. View task history and statistics

### Report Submission
1. Navigate to Reports section
2. Create new reports with different types
3. Submit for approval
4. Admins can approve/reject reports

## 🚀 Deployment

### Development Environment
```bash
# Start backend server
cd backend && npm start

# Start frontend (in new terminal)
npm start
```

### Production Build
```bash
# Build frontend for production
npm run build

# Deploy backend to production server
cd backend
npm install --production
npm start
```

### Environment Configuration
Create `.env` files for production:

**Frontend (.env)**
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_COMPANY_NAME=Your Company Name
```

**Backend (.env)**
```env
PORT=5000
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
```

### Testing
```bash
# Run frontend tests
npm test

# Run backend tests (if available)
cd backend && npm test
```

## 📊 Features Overview

### Shoplworks-Inspired Features
1. **Attendance Management**
   - GPS and QR code authentication
   - Facial recognition support
   - Real-time dashboard updates
   - Excel export functionality

2. **Leave Management**
   - Custom leave type configuration
   - Mobile and dashboard management
   - Employee self-service requests
   - Usage status tracking

3. **Schedule Management**
   - Rotation-optimized scheduling
   - Employee approval applications
   - Manager schedule creation
   - Work status monitoring

4. **Overtime Management**
   - Maximum working hours configuration
   - Employee overtime applications
   - Admin approval workflows
   - Excel data export

5. **Journey Planning**
   - Visit schedule management
   - GPS verification
   - Remote worker support
   - Status tracking and statistics

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=your_api_url
REACT_APP_COMPANY_NAME=Your Company Name
```

### Company Settings
Access company settings through:
1. Dashboard → Settings → Company Info
2. Admin-only access required
3. Configure language, timezone, and company details

## 📈 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced reporting analytics
- [ ] Mobile app development
- [ ] API integration
- [ ] Multi-tenant support
- [ ] Advanced security features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 📝 Changelog

### Version 1.0.0
- Initial release
- Core attendance management
- Basic scheduling features
- User management system
- Company information management

## 🤝 Contributing

We welcome contributions to improve the Workforce Management Platform!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Add proper comments and documentation
- Ensure mobile responsiveness
- Test on multiple browsers
- Update documentation for new features

### Code Style

- Use consistent indentation (2 spaces)
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Shoplworks workforce management system
- Built with modern web technologies
- Designed for scalability and maintainability

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

**Last Updated**: July 12, 2025

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
