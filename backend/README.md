# Workforce Management API - Backend

A comprehensive RESTful API server for the Digital Tracking Merchandising platform, providing workforce management functionality including user authentication, todo management, reporting, and attendance tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Digital_Tracking_Merchandising/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file
   PORT=5000
   JWT_SECRET=your-secret-key-change-in-production
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Verify the server is running**
   - Health check: http://localhost:5000/api/health
   - API Documentation: http://localhost:5000/api/docs

## 📚 API Documentation

### Interactive Documentation
Access the complete interactive API documentation at: **http://localhost:5000/api/docs**

The Swagger UI provides:
- Interactive API exploration
- Request/response examples
- Authentication testing
- Schema definitions
- Error code documentation

### API Endpoints Overview

#### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| POST | `/api/auth/reset-password` | Reset password | No |

#### Todos
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/todos` | Get user todos | Yes |
| POST | `/api/todos` | Create todo | Yes |
| PUT | `/api/todos/:id` | Update todo | Yes |
| DELETE | `/api/todos/:id` | Delete todo | Yes |

#### Reports
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reports` | Get user reports | Yes |
| POST | `/api/reports` | Create report | Yes |
| PUT | `/api/reports/:id/status` | Update report status | Yes (Admin) |

#### Attendance
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/attendance` | Get user attendance | Yes |
| POST | `/api/attendance/punch-in` | Record punch in | Yes |
| POST | `/api/attendance/punch-out` | Record punch out | Yes |

#### Admin (Admin only)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | Get all users | Yes (Admin) |
| GET | `/api/admin/todos` | Get all todos | Yes (Admin) |
| GET | `/api/admin/reports` | Get all reports | Yes (Admin) |
| GET | `/api/admin/attendance` | Get all attendance | Yes (Admin) |

#### System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | No |

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

#### Getting a Token
1. Register a new user: `POST /api/auth/register`
2. Or login with existing credentials: `POST /api/auth/login`
3. Use the returned token in subsequent requests

#### Token Format
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "User Name",
    "role": "employee"
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | No |
| `JWT_SECRET` | JWT signing secret | 'your-secret-key-change-in-production' | No |
| `NODE_ENV` | Environment mode | 'development' | No |

### Security Configuration

The server includes several security features:

- **CORS Protection** - Configured for web and mobile apps
- **Rate Limiting** - 1000 requests per 15 minutes per IP
- **Helmet Security** - HTTP security headers
- **JWT Authentication** - Token-based authentication
- **Password Hashing** - bcrypt with salt rounds

## 🏗️ Architecture

### Project Structure
```
backend/
├── server.js              # Main server file
├── swagger.json           # API documentation
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
└── README.md             # This file
```

### Data Storage

Currently uses in-memory storage for development. In production, replace with:
- **PostgreSQL** - For relational data
- **MongoDB** - For document-based data
- **Redis** - For caching and sessions

### Middleware Stack

1. **Security Middleware** - Helmet, CORS, Rate Limiting
2. **Body Parsing** - JSON and URL-encoded data
3. **Authentication** - JWT token verification
4. **Route Handlers** - API endpoint logic
5. **Error Handling** - Global error catcher
6. **404 Handler** - Unmatched route handler

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **Authentication Tests** - JWT and auth flow testing

### Health Check

```bash
# Run health check
node scripts/health-check.js
```

### Smoke Test

```bash
# Run smoke test
node scripts/smoke-test.js
```

## 🚀 Development

### Development Scripts

```bash
# Start development server
npm start

# Start with nodemon (auto-restart)
npm run dev

# Lint code
npm run lint

# Format code
npm run format
```

### Code Style

- **ESLint** - Code linting with strict rules
- **Prettier** - Code formatting
- **JSDoc** - Function documentation
- **TypeScript** - Type definitions (when applicable)

### Adding New Endpoints

1. **Define the route** in `server.js`
2. **Add JSDoc comments** for documentation
3. **Update Swagger** documentation in `swagger.json`
4. **Add tests** for the new endpoint
5. **Update this README** with endpoint details

### Error Handling

All endpoints follow a consistent error handling pattern:

```javascript
try {
  // Endpoint logic
  res.json({ data: result });
} catch (error) {
  console.error('Error description:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

## 🔒 Security

### Authentication Flow

1. **Registration** - User creates account with email/password
2. **Login** - User authenticates and receives JWT token
3. **Token Usage** - Token included in Authorization header
4. **Token Validation** - Middleware verifies token on protected routes
5. **Token Expiration** - Tokens expire after 24 hours

### Password Security

- **Hashing** - bcrypt with 10 salt rounds
- **Validation** - Minimum 6 characters
- **Reset** - Email-based password reset

### API Security

- **Rate Limiting** - Prevents abuse
- **CORS** - Cross-origin protection
- **Input Validation** - Request data sanitization
- **Error Handling** - No sensitive data in error messages

## 📊 Monitoring

### Health Endpoints

- **Health Check** - `/api/health` - Basic server status
- **Debug Users** - `/api/debug/users` - View all users (dev only)
- **Reset Users** - `DELETE /api/debug/users` - Reset to defaults (dev only)

### Logging

- **Console Logging** - Development logging
- **Error Logging** - Stack traces for debugging
- **Request Logging** - API call tracking

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=<strong-secret-key>
   ```

2. **Database Setup**
   - Replace in-memory storage with database
   - Set up connection pooling
   - Configure database migrations

3. **Security Hardening**
   - Enable HTTPS
   - Configure CORS for production domains
   - Set up rate limiting for production
   - Enable security headers

4. **Monitoring**
   - Set up application monitoring
   - Configure error tracking
   - Enable performance monitoring
   - Set up health checks

### Deployment Options

#### Heroku
```bash
heroku create
git push heroku main
```

#### Docker
```bash
docker build -t workforce-api .
docker run -p 5000:5000 workforce-api
```

#### AWS/Azure/GCP
- Use container services
- Set up load balancers
- Configure auto-scaling
- Enable CDN for static assets

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new features**
5. **Update documentation**
6. **Submit a pull request**

### Code Review Process

1. **Automated Checks** - CI/CD pipeline validation
2. **Manual Review** - Code review by maintainers
3. **Testing** - Ensure all tests pass
4. **Documentation** - Update docs for new features

## 📞 Support

### Getting Help

- **Documentation** - Check this README and API docs
- **Issues** - Create GitHub issues for bugs
- **Discussions** - Use GitHub discussions for questions
- **Email** - Contact support@company.com

### Common Issues

- **Port Conflicts** - Change PORT in .env file
- **CORS Errors** - Check CORS configuration
- **Authentication Issues** - Verify JWT token format
- **Rate Limiting** - Check rate limit configuration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Maintainer:** Workforce Management Team 