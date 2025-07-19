# Digital Tracking Merchandising Platform

A comprehensive workforce management and field force tracking solution inspired by industry-leading platforms like [Shoplworks](https://www.shoplworks.com/en). Built with React, React Native, and Node.js for seamless web and mobile experiences.

## 🚀 Quick Start

### Prerequisites

* Node.js (v16 or higher)
* npm or yarn
* Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Digital_Tracking_Merchandising
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   # Install backend dependencies
   cd backend && npm install && cd ..
   ```

3. **Start the development environment**
   ```bash
   # Use the automated startup script (recommended)
   chmod +x scripts/start-dev.sh
   ./scripts/start-dev.sh start
   ```

   **OR start manually:**
   ```bash
   # Terminal 1: Start backend
   cd backend && npm start
   # Terminal 2: Start frontend
   npm start
   ```

4. **Access the application**
   * **Frontend**: http://localhost:3000  
   * **Backend API**: http://localhost:5000  
   * **API Documentation**: http://localhost:5000/api/docs

## 🎯 Core Features

### Workforce Management

#### 📍 **Attendance Tracking**
- **Geofence & Face Recognition**: Reliable attendance records with optional biometric verification
- **Real-time Time Tracking**: Monitor work hours, breaks, and overtime
- **Location-based Punch-in/out**: GPS-enabled attendance with photo verification
- **Automated Reports**: Generate attendance reports and analytics

#### 📅 **Schedule Management**
- **Smart Scheduling**: Plan work, off-days, and control overtime & maximum working hours
- **Calendar View**: Visual schedule management with drag-and-drop functionality
- **Automation**: Automated shift assignments and notifications
- **Overtime Control**: Monitor and manage overtime hours

#### 🏖️ **Leave Management**
- **Custom Leave Types**: Configure unique policies for different leave categories
- **Automated Calculations**: Automatic accrual calculations and balance tracking
- **Request & Approval Workflow**: Streamlined leave request and approval process
- **Policy Enforcement**: Automated policy compliance checking

#### 🗺️ **Journey Planning**
- **Route Optimization**: Plan smarter routes for daily visits and field operations
- **Visit KPIs**: Track achievement rates for field sales, supervisors, and promoters
- **Map View**: Visual journey planning with real-time location tracking
- **Performance Analytics**: Monitor visit completion rates and efficiency

#### 📋 **Notice & Survey System**
- **Open Rate Tracking**: Monitor notice read rates and engagement
- **Reminder System**: Automated reminders for unread notices
- **Custom Forms**: Create and distribute surveys and feedback forms
- **Real-time Analytics**: Track response rates and engagement metrics

#### 📄 **E-Document Management**
- **Digital Document Preparation**: Create, edit, and manage documents online
- **E-Signature Integration**: Secure digital signing capabilities
- **Contract Management**: Store and manage contracts and consent forms
- **No Paper Workflow**: Complete digital document lifecycle

### Task & Communications

#### 📊 **Reporting System**
- **Instant Field Reports**: No more waiting for field reports - get instant updates
- **Form Builder**: Easily create custom forms for various report types
- **Real-time Updates**: Live reporting from mobile and web applications
- **Analytics Dashboard**: Comprehensive reporting and analytics

#### 📝 **Posting Board**
- **Issue Tracking**: Convert issues into actionable tasks
- **Team Collaboration**: Communicate through topic boards
- **Ticket Resolution**: Streamlined issue resolution workflow
- **Knowledge Base**: Centralized information sharing

#### ✅ **To-Do Management**
- **Automated Task Assignment**: Smart task distribution based on roles and availability
- **Real-time Status Tracking**: Monitor task completion status in real-time
- **No More Google Forms**: Integrated task management system
- **Progress Monitoring**: Track task progress and completion rates

#### 💬 **Chat System**
- **Team Communication**: Stay connected without needing contact details
- **Real-time Messaging**: Instant communication across teams
- **File Sharing**: Share documents, images, and media files
- **Group Chats**: Create topic-based communication channels

#### 🤖 **AI Chatbot**
- **Automated Support**: Handle repetitive inquiries about policies and training
- **Onboarding Assistant**: Guide new employees through onboarding process
- **FAQ Management**: Automated responses to common questions
- **Manager Efficiency**: Free managers for more important tasks

## 🏭 Industry Solutions

### Fashion & Beauty
- **VMD Inspections**: Real-time visual merchandising inspections
- **Season Promotions**: Coordinate seasonal campaigns across stores
- **Store Communication**: Instant updates for fashion retailers

### Electronics
- **PoS Management**: Manage point-of-sale systems and field force
- **Frontline Team Engagement**: Real-time communication for field teams
- **Product Launch Coordination**: Streamlined product introduction processes

### Food & Beverage
- **High Turnover Support**: Easy onboarding checklists and attendance
- **Store Management**: Real-time communication with franchise locations
- **Quality Control**: Remote monitoring and reporting

### Manufacturing & Plants
- **Production Management**: Real-time collaboration between HQ and on-site teams
- **Safety Compliance**: Track safety protocols and incident reporting
- **Equipment Maintenance**: Schedule and track maintenance activities

### Retail & Franchise
- **Multi-location Management**: Streamline operations across hundreds of stores
- **HQ Guidelines**: Share and enforce corporate policies
- **Performance Monitoring**: Track store performance and compliance

## 👥 Team Roles

### Human Resources
- **Attendance Management**: Comprehensive HR task simplification
- **Overtime Tracking**: Monitor and manage flexible work hours
- **Vacation Management**: Streamlined leave and time-off processes

### Field Sales
- **Customer Visit Tracking**: Monitor field staff attendance and customer visits
- **Sales Reports**: Generate reports from anywhere
- **Territory Management**: Optimize sales territories and routes

### Facility Management
- **Site Monitoring**: Remote facility condition reviews
- **Maintenance Tracking**: Schedule and monitor maintenance activities
- **Safety Compliance**: Track safety protocols and incident reporting

### Supervisors
- **Team Oversight**: Monitor team performance and attendance
- **Real-time Communication**: Instant updates and notifications
- **Performance Analytics**: Track team metrics and KPIs

### Field Training Team
- **Training Coordination**: Manage training schedules and materials
- **Progress Tracking**: Monitor training completion and effectiveness
- **Certification Management**: Track certifications and compliance

### Promoters & VMD
- **Visual Merchandising**: Coordinate VMD inspections and updates
- **Promotional Activities**: Track promotional campaign execution
- **Store Visits**: Monitor store visit schedules and completion

## 🔧 Technical Features

### Mobile Applications
- **React Native App**: Cross-platform mobile application
- **Expo Integration**: Rapid development and deployment
- **Offline Capability**: Work without internet connection
- **Push Notifications**: Real-time alerts and updates

### Web Dashboard
- **React Frontend**: Modern, responsive web interface
- **Real-time Updates**: Live data synchronization
- **Analytics Dashboard**: Comprehensive reporting and insights
- **Role-based Access**: Secure access control

### Backend API
- **Node.js Server**: Scalable backend architecture
- **JWT Authentication**: Secure user authentication
- **WebSocket Support**: Real-time communication
- **RESTful API**: Comprehensive API documentation

### Integration Capabilities
- **API Integration Support**: Connect with existing systems
- **Custom Development**: Tailored solutions for specific needs
- **Third-party Integrations**: Connect with popular business tools
- **Data Export**: Export data in various formats

## 🚀 Getting Started

### Demo Credentials

**Admin Account:**
- Email: `admin@company.com`
- Password: `password`

**Employee Account:**
- Email: `richard@company.com`
- Password: `password`

### Available Endpoints

- **Authentication**: `/api/auth/*`
- **Todos**: `/api/todos/*`
- **Reports**: `/api/reports/*`
- **Attendance**: `/api/attendance/*`
- **Chat**: `/api/chat/*`
- **Health Check**: `/api/health`

## 📱 Mobile App Setup

### React Native (WorkforceMobileApp)
```bash
cd WorkforceMobileApp
npm install
npx react-native run-ios     # iOS
npx react-native run-android # Android
```

### Expo (mobile)
```bash
cd WorkforceMobileExpo
npm install
npx expo start
```

## 🧪 Testing

### Run Tests
```bash
# Use the simple test runner (recommended)
chmod +x scripts/test-simple.sh
./scripts/test-simple.sh

# OR run specific test suites
./scripts/test-simple.sh frontend  # Frontend tests only
./scripts/test-simple.sh backend   # Backend tests only
./scripts/test-simple.sh smoke     # Smoke tests only
```

### Manual Testing
```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API request throttling
- **Helmet Security**: HTTP security headers

## 📊 Analytics & Reporting

- **Real-time Dashboards**: Live performance monitoring
- **Custom Reports**: Flexible reporting capabilities
- **Export Functionality**: Data export in multiple formats
- **Performance Metrics**: Comprehensive KPI tracking
- **Visual Analytics**: Charts and graphs for data visualization

## 🌟 Key Benefits

### For Enterprises
- **Scalability**: Handle hundreds of stores with one solution
- **Cost Efficiency**: Reduce operational costs and improve efficiency
- **Compliance**: Ensure regulatory compliance and policy enforcement
- **Real-time Insights**: Make data-driven decisions with live analytics

### For Field Teams
- **Simplified Workflows**: Streamlined processes and reduced paperwork
- **Better Communication**: Real-time updates and team collaboration
- **Mobile-First**: Work efficiently from anywhere with mobile apps
- **Automated Tasks**: Reduce manual work with automated processes

### For Managers
- **Performance Monitoring**: Track team performance and productivity
- **Resource Optimization**: Optimize resource allocation and scheduling
- **Issue Resolution**: Faster problem identification and resolution
- **Strategic Insights**: Data-driven decision making capabilities

## 🔄 Continuous Improvement

### Regular Updates
- **Feature Enhancements**: Regular platform improvements
- **Security Updates**: Ongoing security enhancements
- **Performance Optimization**: Continuous performance improvements
- **User Feedback Integration**: Incorporate user suggestions

### Support & Training
- **1:1 Support**: Instant support from Customer Success team
- **Free Training**: Comprehensive onboarding and training support
- **Documentation**: Extensive user guides and documentation
- **Best Practices**: Industry best practices and recommendations

## 📞 Support & Contact

- **Email**: support@company.com
- **Documentation**: http://localhost:5000/api/docs
- **Demo Request**: Available upon request
- **Training**: Free onboarding and training support

## 📄 License

This project is licensed under the MIT License.

---

**Inspired by industry-leading workforce management solutions like [Shoplworks](https://www.shoplworks.com/en)**

*Last updated: 2025-07-18*
