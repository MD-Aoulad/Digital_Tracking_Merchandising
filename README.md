# Workforce Management Platform

A comprehensive workforce management solution with web frontend, mobile app, and backend API. Built with React, React Native, and Node.js.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

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
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **API Documentation**: http://localhost:5000/api/docs

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

## 📱 Mobile App

### React Native (WorkforceMobileApp)
```bash
cd WorkforceMobileApp
npm install
npx react-native run-ios     # iOS
npx react-native run-android # Android
```

### Expo (mobile)
```bash
cd mobile
npm install
npx expo start
```

## 🔧 Development

### Project Structure
```
Digital_Tracking_Merchandising/
├── backend/                 # Node.js API server
├── mobile/                  # Expo mobile app
├── WorkforceMobileApp/      # React Native mobile app
├── src/                     # React web frontend
├── scripts/                 # Development scripts
├── __tests__/              # Integration tests
└── docs/                   # Documentation
```

### Key Features
- **User Authentication** - JWT-based auth with role management
- **Todo Management** - Create, assign, and track tasks
- **Attendance Tracking** - GPS-based punch-in/out system
- **Reporting System** - Generate and manage reports
- **Mobile Apps** - React Native and Expo versions
- **API Documentation** - Interactive Swagger UI

### Available Scripts

#### Development
```bash
./scripts/start-dev.sh start    # Start both servers
./scripts/start-dev.sh stop     # Stop all servers
./scripts/start-dev.sh restart  # Restart all servers
./scripts/start-dev.sh status   # Show server status
./scripts/start-dev.sh logs backend  # Show backend logs
```

#### Testing
```bash
./scripts/test-simple.sh        # Run all tests
./scripts/test-simple.sh frontend  # Frontend tests
./scripts/test-simple.sh backend   # Backend tests
```

## 🔐 Authentication

### Demo Credentials
- **Admin**: admin@company.com / password
- **Employee**: richard@company.com / password

### API Authentication
All protected endpoints require a JWT token:
```bash
Authorization: Bearer <jwt_token>
```

## 📚 API Documentation

### Interactive Documentation
Visit http://localhost:5000/api/docs for complete API documentation with:
- Interactive endpoint testing
- Request/response examples
- Authentication testing
- Schema definitions

### Key Endpoints
- **Authentication**: `/api/auth/*`
- **Todos**: `/api/todos/*`
- **Reports**: `/api/reports/*`
- **Attendance**: `/api/attendance/*`
- **Health Check**: `/api/health`

## 🚨 Troubleshooting

### Port Conflicts
If you get "port already in use" errors:
```bash
# Use the startup script (handles conflicts automatically)
./scripts/start-dev.sh start

# OR manually kill processes
lsof -ti:5000 | xargs kill -9  # Backend port
lsof -ti:3000 | xargs kill -9  # Frontend port
```

### Test Issues
If tests are hanging or failing:
```bash
# Use the simple test runner
./scripts/test-simple.sh

# OR run tests with minimal configuration
npm test -- --watchAll=false --passWithNoTests
```

### Mobile App Issues
```bash
# Clear React Native cache
cd WorkforceMobileApp
npx react-native start --reset-cache

# Clear Expo cache
cd mobile
npx expo start --clear
```

## 📄 Documentation

- **Complete Documentation**: [DOCUMENTATION.md](DOCUMENTATION.md)
- **Development Guide**: [DEVELOPMENT_SESSION.md](DEVELOPMENT_SESSION.md)
- **API Documentation**: http://localhost:5000/api/docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `./scripts/test-simple.sh`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆕 Recent Updates

### Latest Features
- ✅ **Automated Startup Script** - One-command development environment
- ✅ **Simple Test Runner** - Reliable testing without complex configs
- ✅ **Todo Assignment System** - Role-based task assignment
- ✅ **Mobile App Integration** - React Native and Expo versions
- ✅ **API Documentation** - Interactive Swagger UI
- ✅ **Process Management** - Automatic port conflict resolution

### Known Issues
- ⚠️ **Backend Port Conflicts** - Resolved with startup script
- ⚠️ **Test Environment Complexity** - Simplified with test runner
- ⚠️ **Mobile App Confusion** - Multiple versions documented

---

**For immediate help**: Use `./scripts/start-dev.sh help` or `./scripts/test-simple.sh help`
