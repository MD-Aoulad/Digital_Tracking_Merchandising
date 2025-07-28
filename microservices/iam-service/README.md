# IAM Service - Enterprise Identity and Access Management

## 🏢 **Enterprise-Grade IAM for Digital Tracking Merchandising Platform**

A comprehensive Identity and Access Management (IAM) microservice designed for enterprise retail operations with advanced security, compliance, and audit capabilities.

## 🎯 **Core Features**

### **🔐 Authentication & Security**
- **Multi-Factor Authentication (MFA)**: TOTP-based 2FA with QR code generation
- **Password Policies**: Configurable complexity requirements and expiration
- **Account Lockout**: Automatic lockout after failed attempts
- **Session Management**: Secure token-based sessions with refresh capabilities
- **Rate Limiting**: Protection against brute force attacks

### **👥 User Management**
- **User Lifecycle**: Complete user creation, modification, and deactivation
- **Profile Management**: Extended user profiles with contact information
- **Account Verification**: Email verification and account activation
- **Password History**: Compliance with password reuse policies

### **🎭 Role-Based Access Control (RBAC)**
- **Hierarchical Roles**: System roles with priority levels
- **Permission Management**: Granular resource-based permissions
- **Role Assignment**: Dynamic role assignment with expiration
- **Permission Inheritance**: Role-based permission inheritance

### **🏢 Organizational Structure**
- **Group Management**: Hierarchical organizational groups
- **User Groups**: Flexible user-to-group assignments
- **Department Management**: Multi-level organizational structure
- **Group Permissions**: Group-based permission inheritance

### **📊 Audit & Compliance**
- **Comprehensive Audit Log**: All actions logged with metadata
- **Login Tracking**: Detailed login attempt monitoring
- **Change History**: Complete audit trail for all modifications
- **Compliance Reporting**: GDPR, SOX, and industry compliance

### **🔒 Security Features**
- **JWT Tokens**: Secure access and refresh token system
- **Password Hashing**: bcrypt with configurable salt rounds
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Security headers and input sanitization

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- PostgreSQL 13+
- Redis (optional, for session storage)

### **Development Setup**
```bash
# 1. Navigate to IAM service
cd microservices/iam-service

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
npm run dev

# 5. Access the service
# http://localhost:3010
```

### **Docker Deployment**
```bash
# Build and run with Docker
docker build -t iam-service .
docker run -d -p 3010:3010 --name iam-service iam-service

# Or use docker-compose
docker-compose up -d iam-service
```

## 📁 **API Endpoints**

### **Authentication**
```
POST /auth/login          # User login with MFA support
POST /auth/refresh        # Refresh access token
POST /auth/logout         # User logout and session invalidation
```

### **User Management**
```
GET    /users             # List users with pagination and filtering
POST   /users             # Create new user
GET    /users/:id         # Get user details
PUT    /users/:id         # Update user information
DELETE /users/:id         # Deactivate user
```

### **Role Management**
```
GET    /roles             # List all roles with usage statistics
POST   /roles             # Create new role
GET    /roles/:id         # Get role details
PUT    /roles/:id         # Update role
DELETE /roles/:id         # Delete role
```

### **Permission Management**
```
GET    /permissions       # List all permissions
POST   /permissions       # Create new permission
GET    /permissions/:id   # Get permission details
PUT    /permissions/:id   # Update permission
DELETE /permissions/:id   # Delete permission
```

### **Audit & Compliance**
```
GET    /audit             # Get audit logs with filtering
GET    /audit/export      # Export audit logs
GET    /audit/summary     # Get audit summary statistics
```

## 🗄️ **Database Schema**

### **Core Tables**
- `iam_users` - User accounts and profiles
- `iam_roles` - Role definitions
- `iam_permissions` - Permission definitions
- `iam_role_permissions` - Role-permission mappings
- `iam_user_roles` - User-role assignments
- `iam_groups` - Organizational groups
- `iam_user_groups` - User-group assignments

### **Security Tables**
- `iam_sessions` - Active user sessions
- `iam_password_history` - Password history for compliance
- `iam_mfa_backup_codes` - MFA backup codes
- `iam_login_attempts` - Login attempt tracking

### **Audit Tables**
- `iam_audit_log` - Comprehensive audit trail
- `iam_password_policies` - Password policy configuration
- `iam_access_policies` - Access control policies

## 🔧 **Configuration**

### **Environment Variables**
```env
# Service Configuration
PORT=3010
NODE_ENV=production

# Database
IAM_DB_URL=postgresql://iam_user:iam_password@iam-db:5432/iam_db

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Password Policy
PASSWORD_MIN_LENGTH=8
PASSWORD_MAX_AGE_DAYS=90
PASSWORD_HISTORY_COUNT=5
```

### **Default Roles**
- **super_admin**: Full system access (priority: 1000)
- **admin**: System administration (priority: 900)
- **manager**: Department management (priority: 800)
- **supervisor**: Team supervision (priority: 700)
- **employee**: Standard access (priority: 600)
- **viewer**: Read-only access (priority: 500)

### **Default Permissions**
- **User Management**: create, read, update, delete
- **Role Management**: create, read, update, delete
- **Permission Management**: assign, revoke
- **Todo Management**: create, read, update, delete, assign
- **Attendance Management**: read, update, approve
- **Reports**: read, create, export
- **System Administration**: admin, audit

## 🧪 **Testing**

### **Unit Tests**
```bash
npm test
```

### **Integration Tests**
```bash
npm run test:integration
```

### **Load Testing**
```bash
npm run test:load
```

## 📊 **Monitoring**

### **Health Check**
```bash
curl http://localhost:3010/health
```

### **Metrics**
- Authentication success/failure rates
- User session statistics
- Permission check performance
- Audit log volume
- Database connection status

### **Logs**
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Audit logs: Database table `iam_audit_log`

## 🔒 **Security Best Practices**

### **Authentication**
- Use strong passwords with policy enforcement
- Enable MFA for all administrative accounts
- Implement session timeout and automatic logout
- Monitor failed login attempts

### **Authorization**
- Follow principle of least privilege
- Regular permission audits
- Role-based access control
- Resource-level permissions

### **Audit & Compliance**
- Comprehensive audit logging
- Regular security reviews
- Compliance reporting
- Data retention policies

### **Infrastructure**
- Secure database connections
- Network segmentation
- Regular security updates
- Backup and disaster recovery

## 🚀 **Deployment**

### **Production Checklist**
- [ ] Set secure JWT secrets
- [ ] Configure database with SSL
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerting
- [ ] Configure backup procedures
- [ ] Test disaster recovery
- [ ] Security audit and penetration testing

### **Docker Compose Integration**
```yaml
iam-service:
  build: ./microservices/iam-service
  ports:
    - "3010:3010"
  environment:
    - IAM_DB_URL=postgresql://iam_user:iam_password@iam-db:5432/iam_db
    - JWT_SECRET=${JWT_SECRET}
    - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
  depends_on:
    - iam-db
  networks:
    - digital-tracking-network
```

## 📚 **API Documentation**

### **Authentication Example**
```javascript
// Login
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@company.com',
    password: 'securepassword',
    mfaCode: '123456' // if MFA enabled
  })
});

const { access_token, refresh_token, user } = await response.json();

// Use token in subsequent requests
const userResponse = await fetch('/users', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
```

### **Permission Check Example**
```javascript
// Check if user has permission
const hasPermission = user.permissions.includes('user:create');
if (!hasPermission) {
  throw new Error('Insufficient permissions');
}
```

## 🤝 **Integration**

### **Frontend Integration**
```javascript
// IAM client for frontend
class IAMClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async login(email, password, mfaCode = null) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, mfaCode })
    });
    return response.json();
  }

  async checkPermission(token, resource, action) {
    const response = await fetch(`${this.baseURL}/permissions/check`, {
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ resource, action })
    });
    return response.json();
  }
}
```

### **Microservice Integration**
```javascript
// Verify token in other services
const verifyToken = async (token) => {
  const response = await fetch('http://iam-service:3010/auth/verify', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## 📈 **Performance**

### **Target Metrics**
- **Response Time**: < 200ms for authentication
- **Throughput**: 1000+ requests/second
- **Availability**: 99.99% uptime
- **Concurrent Users**: 10,000+ active sessions

### **Optimization**
- Database connection pooling
- Redis caching for sessions
- Query optimization with indexes
- Horizontal scaling capability

## 🔄 **Updates & Maintenance**

### **Regular Tasks**
- Database maintenance and optimization
- Security updates and patches
- Performance monitoring and tuning
- Audit log rotation and archiving
- User account cleanup and deactivation

### **Backup Procedures**
- Daily database backups
- Configuration backup
- Audit log archiving
- Disaster recovery testing

---

**Built with ❤️ for Enterprise Security and Compliance** 