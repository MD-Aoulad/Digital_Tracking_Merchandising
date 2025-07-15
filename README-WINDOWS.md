# Workforce Management Platform - Windows Setup

This guide will help you set up and run the Workforce Management Platform on Windows.

## Prerequisites

1. **Node.js** (version 18.x or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS version
   - Install with default settings

2. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Quick Start

### 1. Extract the Project
- Extract the ZIP file to a folder (e.g., `C:\Projects\WorkforceManagement`)
- Open Command Prompt as Administrator
- Navigate to the project folder

### 2. Install Dependencies
Double-click `setup-windows.bat` or run:
```cmd
setup-windows.bat
```

This will:
- Check if Node.js is installed
- Install all dependencies for backend, frontend, and mobile apps
- Create necessary directories

### 3. Start Development Servers
Double-click `start-dev.bat` or run:
```cmd
start-dev.bat
```

This will:
- Start the backend server on port 5000
- Start the frontend server on port 3000
- Open browser windows for each service

## Access the Application

- **Web Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

## Demo Credentials

### Admin User
- Email: `admin@company.com`
- Password: `password`

### Regular User
- Email: `richard@company.com`
- Password: `password`

## Available Commands

### Setup and Installation
- `setup-windows.bat` - Install all dependencies
- `start-dev.bat` - Start all development servers
- `stop-servers.bat` - Stop all running servers
- `kill-ports.bat` - Kill processes on ports 3000 and 5000

### Manual Commands
```cmd
# Install dependencies
npm install
cd backend && npm install
cd mobile && npm install

# Start servers individually
npm start                    # Frontend
cd backend && npm start      # Backend
cd mobile && npm start       # Mobile

# Run tests
npm test                     # Frontend tests
cd backend && npm test       # Backend tests
```

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
1. Run `kill-ports.bat`
2. Or manually kill processes:
   ```cmd
   netstat -ano | findstr :3000
   taskkill /f /pid <PID>
   ```

### Memory Issues
If the backend crashes due to memory:
1. Close other applications
2. Restart your computer
3. Consider upgrading RAM (recommended: 16GB+)

### Node.js Not Found
If you get "Node.js is not installed" error:
1. Download Node.js from https://nodejs.org/
2. Install with default settings
3. Restart Command Prompt
4. Run `setup-windows.bat` again

### Dependencies Installation Failed
If npm install fails:
1. Check your internet connection
2. Try running as Administrator
3. Clear npm cache: `npm cache clean --force`
4. Delete `node_modules` folders and run `setup-windows.bat` again

### Server Won't Start
1. Check if ports 3000 and 5000 are free
2. Run `kill-ports.bat`
3. Check logs in the `logs/` directory
4. Ensure all dependencies are installed

## Project Structure

```
WorkforceManagement/
├── backend/                 # Node.js API server
├── src/                     # React frontend
├── mobile/                  # React Native mobile app
├── WorkforceMobileApp/      # Alternative mobile app
├── WorkforceMobileExpo/     # Expo mobile app
├── scripts/                 # Development scripts
├── logs/                    # Server logs
├── setup-windows.bat        # Windows setup script
├── start-dev.bat           # Start development servers
├── stop-servers.bat        # Stop all servers
└── kill-ports.bat          # Kill processes on ports
```

## Development

### Adding New Features
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Update documentation

### Running Tests
```cmd
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# All tests
npm run test:all
```

### Building for Production
```cmd
# Frontend build
npm run build

# Backend (no build needed)
cd backend && npm start
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs in the `logs/` directory
3. Ensure all prerequisites are met
4. Try restarting the development environment

## System Requirements

- **OS**: Windows 10/11
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space
- **Node.js**: 18.x or higher
- **npm**: Included with Node.js

## Security Notes

- This is a development environment
- Default passwords are for demo purposes only
- Change passwords in production
- Keep dependencies updated 