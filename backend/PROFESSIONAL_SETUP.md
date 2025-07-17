# Professional Backend Setup Guide

This guide covers the professional improvements made to the backend server to ensure optimal performance, security, and maintainability.

## 🚀 Quick Start

### 1. Professional Server Startup

```bash
# Use the professional startup script (recommended)
npm start

# Or use simple startup (legacy)
npm run start:simple

# Development mode with auto-restart
npm run dev
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://localhost:5432/workforce_management
DATABASE_SSL=false
DATABASE_MAX_CONNECTIONS=20

# Authentication
JWT_SECRET=your-super-secure-secret-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10

# Logging Configuration
LOG_LEVEL=info
DEBUG=false
LOG_CONSOLE=true
LOG_FILE=false

# CORS Configuration
CORS_ENABLED=true
CORS_CREDENTIALS=true

# Security
HELMET_ENABLED=true
TRUST_PROXY=false
MAX_REQUEST_SIZE=10mb

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Chat System
CHAT_ENABLED=true
CHAT_MAX_FILE_SIZE=10485760
CHAT_MAX_IMAGE_SIZE=5242880
WEBSOCKET_PATH=/ws
CHAT_HEARTBEAT_INTERVAL=30000
```

## 🔧 Professional Features

### 1. **Intelligent Logging System**

The backend now uses a professional logging system with configurable levels:

- **ERROR**: Critical errors (always logged)
- **WARN**: Warning messages
- **INFO**: General information
- **DEBUG**: Detailed debugging (only in development)

```javascript
// Usage in code
const { authLogger, apiLogger } = require('./config/logging');

authLogger.info('User login successful', { userId: 123, email: 'user@example.com' });
apiLogger.warn('Slow API response', { endpoint: '/api/todos', duration: 1500 });
```

### 2. **Environment-Based Configuration**

All configuration is centralized and environment-aware:

```javascript
const { config, get, isEnabled } = require('./config/environment');

// Get configuration values
const port = config.server.port;
const jwtSecret = get('auth.jwtSecret');
const debugMode = isEnabled('logging.debug');
```

### 3. **Professional Server Startup**

The new startup script provides:

- ✅ Environment validation
- ✅ Port availability checking
- ✅ Graceful shutdown handling
- ✅ Professional logging output
- ✅ Health monitoring

### 4. **Debug Mode Control**

Control debug logging with environment variables:

```bash
# Enable debug mode
DEBUG=true npm start

# Set specific log level
LOG_LEVEL=debug npm start

# Disable debug logging in production
NODE_ENV=production npm start
```

## 📊 Monitoring & Debugging

### 1. **Health Check Endpoints**

```bash
# Basic health check
curl http://localhost:5000/api/health

# Chat system health
curl http://localhost:5000/api/chat/health
```

### 2. **Debug Endpoints (Development Only)**

```bash
# View all users
curl http://localhost:5000/api/debug/users

# Reset users to default state
curl -X DELETE http://localhost:5000/api/debug/users
```

### 3. **Mobile App Monitoring**

From the mobile app directory, monitor API calls:

```bash
cd ../WorkforceMobileExpo
npm run monitor
```

This will:
- 🔍 Monitor API call patterns
- 📊 Detect excessive polling
- ⚡ Identify performance issues
- 🚨 Alert on authentication problems

## 🛡️ Security Improvements

### 1. **Rate Limiting**

Protects against abuse with configurable limits:

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # 100 requests per window
```

### 2. **CORS Configuration**

Secure cross-origin requests:

```env
CORS_ENABLED=true
CORS_CREDENTIALS=true
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 3. **Request Size Limits**

Prevent large payload attacks:

```env
MAX_REQUEST_SIZE=10mb
CHAT_MAX_FILE_SIZE=10485760  # 10MB
CHAT_MAX_IMAGE_SIZE=5242880  # 5MB
```

## 🔍 Troubleshooting

### 1. **Backend Running "Like Crazy"**

If you see repeated JWT decode logs:

```bash
# Disable debug logging
DEBUG=false npm start

# Or set log level to info
LOG_LEVEL=info npm start
```

### 2. **Port Already in Use**

```bash
# The startup script will detect this automatically
# Or manually check:
lsof -i :5000
kill -9 <PID>
```

### 3. **Database Connection Issues**

```bash
# Check database status
psql -d workforce_management -c "SELECT version();"

# Verify connection string
echo $DATABASE_URL
```

### 4. **Mobile App Connection Issues**

```bash
# Test API connectivity
cd ../WorkforceMobileExpo
npm run test-connection

# Monitor API calls
npm run monitor
```

## 📈 Performance Optimization

### 1. **Database Connection Pooling**

```env
DATABASE_MAX_CONNECTIONS=20
DATABASE_IDLE_TIMEOUT=30000
DATABASE_CONNECTION_TIMEOUT=2000
```

### 2. **Response Caching**

Consider implementing Redis for:
- User sessions
- API response caching
- Chat message caching

### 3. **File Upload Optimization**

```env
UPLOAD_MAX_FILE_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/*,application/pdf,text/plain
```

## 🚀 Production Deployment

### 1. **Environment Variables**

```env
NODE_ENV=production
LOG_LEVEL=warn
DEBUG=false
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### 2. **Process Management**

Use PM2 for production:

```bash
npm install -g pm2
pm2 start server.js --name "workforce-api"
pm2 startup
pm2 save
```

### 3. **Monitoring**

```bash
# Health monitoring
pm2 monit

# Log monitoring
pm2 logs workforce-api
```

## 📚 API Documentation

The backend includes Swagger documentation:

```bash
# Access API docs
http://localhost:5000/api-docs
```

## 🔄 Migration Guide

### From Old Setup

1. **Update startup command**:
   ```bash
   # Old
   node server.js
   
   # New (recommended)
   npm start
   ```

2. **Environment variables**:
   ```bash
   # Old
   JWT_SECRET=secret
   
   # New (with validation)
   JWT_SECRET=your-super-secure-secret-key-change-in-production
   DEBUG=false
   LOG_LEVEL=info
   ```

3. **Logging**:
   ```javascript
   // Old
   console.log('User logged in:', user);
   
   // New
   const { authLogger } = require('./config/logging');
   authLogger.info('User login successful', { userId: user.id });
   ```

## ✅ Best Practices

1. **Always use the professional startup script** (`npm start`)
2. **Set appropriate log levels** for your environment
3. **Monitor API calls** regularly with the mobile app monitor
4. **Use environment variables** for all configuration
5. **Enable rate limiting** in production
6. **Regular health checks** on the API endpoints
7. **Monitor database connections** and performance
8. **Keep dependencies updated** regularly

## 🆘 Support

If you encounter issues:

1. Check the logs with appropriate log level
2. Run the mobile app monitor to detect patterns
3. Verify environment configuration
4. Test API endpoints individually
5. Check database connectivity
6. Review the troubleshooting section above

---

**Professional Backend Setup Complete! 🎉**

Your backend is now configured with enterprise-grade features for optimal performance, security, and maintainability. 