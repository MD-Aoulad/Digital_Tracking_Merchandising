# Workforce Management Platform

> **Professional Workforce Management Solution with Docker Microservices Architecture**

A comprehensive workforce management platform designed for retail operations, featuring real-time task management, attendance tracking, communication tools, and advanced analytics. Built with modern technologies and microservices architecture for scalability and maintainability.

## 🚀 **Project Overview**

The Workforce Management Platform is a complete solution for managing retail workforce operations, providing tools for task management, attendance tracking, communication, reporting, and analytics. The platform is built with a microservices architecture using Docker containers for easy deployment and scaling.

### **Key Features**

#### **📋 Task Management**
- **Advanced Todo System**: Create complex tasks with questionnaires and conditional logic
- **Task Assignment**: Assign tasks to specific employees or teams
- **Progress Tracking**: Real-time progress monitoring and completion status
- **Template System**: Reusable task templates for common workflows
- **Approval Workflows**: Multi-step approval processes for task completion

#### **⏰ Attendance Management**
- **GPS-based Punch In/Out**: Location-verified attendance tracking
- **Photo Verification**: Optional photo capture for attendance verification
- **Geofencing**: Automatic location validation within designated areas
- **Break Management**: Track breaks and overtime automatically
- **Schedule Integration**: Punch-in validation against work schedules

#### **💬 Communication Tools**
- **Real-time Chat**: WebSocket-based messaging system
- **Channel Management**: Organized communication channels
- **File Sharing**: Secure file upload and sharing capabilities
- **Help Desk System**: Integrated support request management
- **Notification System**: Multi-channel notifications (email, push, SMS)

#### **📊 Reporting & Analytics**
- **Performance Dashboards**: Real-time performance metrics
- **Custom Reports**: Flexible reporting with multiple export formats
- **Data Analytics**: Advanced analytics and trend analysis
- **Export Capabilities**: PDF and Excel export functionality
- **Historical Data**: Comprehensive data retention and analysis

#### **🔐 Security & Compliance**
- **Role-based Access Control**: Granular permissions system
- **JWT Authentication**: Secure token-based authentication
- **Data Encryption**: End-to-end data encryption
- **Audit Logging**: Comprehensive audit trails
- **GDPR Compliance**: Privacy and data protection features

## 🏗️ **Architecture**

### **Microservices Design**

The platform is built using a microservices architecture with the following services:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Mobile App    │    │   API Gateway   │
│   (React)       │    │   (React Native)│    │   (Nginx)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              Microservices Layer                │
         ├─────────────────┬─────────────────┬─────────────┤
         │  Auth Service   │  Todo Service   │ Chat Service│
         ├─────────────────┼─────────────────┼─────────────┤
         │Report Service   │Attendance Service│User Service│
         └─────────────────┴─────────────────┴─────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              Data Layer                         │
         ├─────────────────┬─────────────────┬─────────────┤
         │   PostgreSQL    │     Redis       │   MongoDB   │
         │   (Primary DB)  │   (Cache/Session)│ (Analytics) │
         └─────────────────┴─────────────────┴─────────────┘
```

### **Technology Stack**

#### **Frontend**
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Query**: Server state management
- **Socket.IO Client**: Real-time communication

#### **Backend**
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **JWT**: Authentication tokens
- **Socket.IO**: Real-time WebSocket communication

#### **Mobile**
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Mobile navigation
- **AsyncStorage**: Local data persistence

#### **DevOps**
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and load balancer
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards

## 🛠️ **Installation & Setup**

### **Prerequisites**

- **Node.js** (v16 or higher)
- **Docker** (v20 or higher)
- **Docker Compose** (v2 or higher)
- **Git** (for version control)

### **Quick Start**

1. **Clone the repository**
   ```bash
   git clone https://github.com/MD-Aoulad/Digital_Tracking_Merchandising.git
   cd Digital_Tracking_Merchandising
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit environment variables
   nano .env
   ```

3. **Start the application**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **API Documentation**: http://localhost:5000/api/docs
   - **Mobile App**: http://localhost:8081
   - **Monitoring**: http://localhost:3001 (Grafana)

### **Development Setup**

For local development without Docker:

```bash
# Install dependencies
npm install
cd backend && npm install
cd ../WorkforceMobileExpo && npm install

# Start backend server
cd backend && npm run dev

# Start frontend (in new terminal)
npm start

# Start mobile app (in new terminal)
cd WorkforceMobileExpo && npm start
```

## 📚 **Documentation**

### **User Guides**
- [Quick Start Guide](QUICK_START_LOCAL.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [API Documentation](http://localhost:5000/api/docs)
- [Mobile App Setup](MOBILE_SETUP_GUIDE.md)

### **Developer Documentation**
- [Development Guide](DEVELOPMENT_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)
- [Architecture Documentation](docs/README.md)
- [API Reference](docs/API_REFERENCE.md)

### **DevOps Documentation**
- [Docker Setup](DOCKER_SETUP.md)
- [CI/CD Pipeline](docs/CI_CD_PIPELINE.md)
- [Monitoring Setup](docs/MONITORING_SETUP.md)
- [Security Guidelines](docs/SECURITY_GUIDELINES.md)

## 🧪 **Testing**

### **Run Tests**

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit      # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e       # End-to-end tests
npm run test:coverage  # Test coverage report
```

### **Test Coverage**

The project maintains comprehensive test coverage:
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User workflow testing
- **Performance Tests**: Load and stress testing

## 🔧 **Configuration**

### **Environment Variables**

Key environment variables for configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/workforce_management
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# API Configuration
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### **Feature Flags**

Enable/disable features using environment variables:

```env
# Feature toggles
ENABLE_CHAT=true
ENABLE_ATTENDANCE=true
ENABLE_REPORTS=true
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
```

## 📊 **Monitoring & Analytics**

### **Health Checks**

All services include health check endpoints:

```bash
# Check service health
curl http://localhost:5000/api/health
curl http://localhost:3000/health
curl http://localhost:8081/health
```

### **Metrics & Monitoring**

- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards
- **Application Logs**: Centralized logging
- **Performance Monitoring**: Real-time performance metrics

## 🔒 **Security**

### **Security Features**

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **CORS Configuration**: Cross-origin request protection
- **Rate Limiting**: API abuse prevention

### **Security Best Practices**

- Regular security updates
- Dependency vulnerability scanning
- Code security reviews
- Penetration testing
- Security monitoring and alerting

## 🚀 **Deployment**

### **Production Deployment**

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### **Cloud Deployment**

The platform supports deployment to various cloud providers:

- **AWS**: ECS, EKS, or EC2 deployment
- **Google Cloud**: GKE or Compute Engine
- **Azure**: AKS or VM deployment
- **DigitalOcean**: App Platform or Droplets

## 🤝 **Contributing**

### **Development Workflow**

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Submit a pull request**

### **Code Standards**

- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Code Review**: All changes require review

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **Getting Help**

- **Documentation**: Check the [docs](docs/) directory
- **Issues**: Report bugs on [GitHub Issues](https://github.com/MD-Aoulad/Digital_Tracking_Merchandising/issues)
- **Discussions**: Join [GitHub Discussions](https://github.com/MD-Aoulad/Digital_Tracking_Merchandising/discussions)
- **Email**: support@workforce-management.com

### **Community**

- **Contributors**: See [CONTRIBUTORS.md](CONTRIBUTORS.md)
- **Changelog**: See [CHANGELOG.md](CHANGELOG.md)
- **Roadmap**: See [ROADMAP.md](ROADMAP.md)

## 🙏 **Acknowledgments**

- **React Team**: For the amazing React framework
- **Node.js Community**: For the robust JavaScript runtime
- **Docker Team**: For containerization technology
- **Open Source Contributors**: For various dependencies and tools

---

**Built with ❤️ by the Workforce Management Team**

*Last updated: July 2025*
