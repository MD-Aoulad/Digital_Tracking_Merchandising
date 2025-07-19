#!/bin/bash

# Create all microservices quickly
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Creating all microservices...${NC}"

# Create user service
echo -e "${GREEN}Creating user-service...${NC}"
cat > "microservices/user-service/Dockerfile" << 'EOF'
# User Management Dockerfile
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Start the application
CMD ["node", "server.js"]
EOF

cat > "microservices/user-service/package.json" << 'EOF'
{
  "name": "workforce-user-service",
  "version": "1.0.0",
  "description": "User Management Microservice for Workforce Management",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  },
  "keywords": [
    "user",
    "microservice",
    "workforce-management"
  ],
  "author": "Workforce Management Team",
  "license": "MIT"
}
EOF

cat > "microservices/user-service/server.js" << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'User Management',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/docs', (req, res) => {
  res.json({
    name: 'User Management',
    version: '1.0.0',
    description: 'User Management for Workforce Management',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /': 'Service info'
    }
  });
});

// Service info
app.get('/', (req, res) => {
  res.json({
    message: 'User Management Service',
    status: 'running',
    port: PORT
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 User Management running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/docs`);
});
EOF

# Create attendance service
echo -e "${GREEN}Creating attendance-service...${NC}"
cat > "microservices/attendance-service/Dockerfile" << 'EOF'
# Attendance Tracking Dockerfile
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3004/health || exit 1

# Start the application
CMD ["node", "server.js"]
EOF

cat > "microservices/attendance-service/package.json" << 'EOF'
{
  "name": "workforce-attendance-service",
  "version": "1.0.0",
  "description": "Attendance Tracking Microservice for Workforce Management",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  },
  "keywords": [
    "attendance",
    "microservice",
    "workforce-management"
  ],
  "author": "Workforce Management Team",
  "license": "MIT"
}
EOF

cat > "microservices/attendance-service/server.js" << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Attendance Tracking',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/docs', (req, res) => {
  res.json({
    name: 'Attendance Tracking',
    version: '1.0.0',
    description: 'Attendance Tracking for Workforce Management',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /': 'Service info'
    }
  });
});

// Service info
app.get('/', (req, res) => {
  res.json({
    message: 'Attendance Tracking Service',
    status: 'running',
    port: PORT
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Attendance Tracking running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/docs`);
});
EOF

# Create remaining services quickly
for service in todo-service report-service approval-service workplace-service notification-service; do
    echo -e "${GREEN}Creating $service...${NC}"
    
    case $service in
        "todo-service") port=3005; desc="Todo Management" ;;
        "report-service") port=3006; desc="Report Generation" ;;
        "approval-service") port=3007; desc="Approval System" ;;
        "workplace-service") port=3008; desc="Workplace Management" ;;
        "notification-service") port=3009; desc="Notification System" ;;
    esac
    
    # Create Dockerfile
    cat > "microservices/$service/Dockerfile" << EOF
# $desc Dockerfile
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE $port

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD curl -f http://localhost:$port/health || exit 1

# Start the application
CMD ["node", "server.js"]
EOF

    # Create package.json
    cat > "microservices/$service/package.json" << EOF
{
  "name": "workforce-$service",
  "version": "1.0.0",
  "description": "$desc Microservice for Workforce Management",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  },
  "keywords": [
    "$(echo $service | sed 's/-service//')",
    "microservice",
    "workforce-management"
  ],
  "author": "Workforce Management Team",
  "license": "MIT"
}
EOF

    # Create server.js
    cat > "microservices/$service/server.js" << EOF
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || $port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: '$desc',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/docs', (req, res) => {
  res.json({
    name: '$desc',
    version: '1.0.0',
    description: '$desc for Workforce Management',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /': 'Service info'
    }
  });
});

// Service info
app.get('/', (req, res) => {
  res.json({
    message: '$desc Service',
    status: 'running',
    port: PORT
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 $desc running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/docs`);
});
EOF

done

echo -e "${GREEN}✅ All microservices created successfully!${NC}"
echo -e "${BLUE}You can now run: ./microservices-dev.sh start${NC}" 