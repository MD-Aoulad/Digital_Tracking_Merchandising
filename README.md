# Workforce Management Platform

A comprehensive workforce management platform inspired by Shoplworks, built with React, TypeScript, and Tailwind CSS. This platform provides complete attendance management, employee scheduling, leave management, and administrative tools for modern organizations.

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

### Administrative Features
- **Company Information Management** - Centralized company settings and configuration
- **Group Management** - Hierarchical organizational structure management
- **Admin Management** - Role-based administrative access control
- **Workplace Management** - Multi-location workplace configuration
- **User Management** - Comprehensive employee and user administration

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Lucide React Icons, Custom Components
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: React Router v6
- **Build Tool**: Create React App
- **Package Manager**: npm

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workforce-management-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗 Project Structure

```
src/
├── components/           # React components
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

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Testing
```bash
npm test
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

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
