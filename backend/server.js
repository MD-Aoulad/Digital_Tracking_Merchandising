/**
 * Workforce Management Platform - Backend API Server
 * 
 * This is the main backend server that provides RESTful APIs for both web and mobile applications.
 * It handles user authentication, data management, and real-time synchronization between platforms.
 * 
 * Key Features:
 * - User authentication and authorization with JWT tokens
 * - Todo management with CRUD operations
 * - Report management with approval workflows
 * - Attendance tracking with GPS and photo verification
 * - Real-time data synchronization between web and mobile apps
 * - Password reset functionality via email
 * - Role-based access control (Admin, Leader, Employee)
 * 
 * Security Features:
 * - Password hashing with bcrypt
 * - JWT token authentication
 * - Rate limiting to prevent abuse
 * - CORS configuration for cross-origin requests
 * - Helmet.js for security headers
 * 
 * Data Storage:
 * - Currently uses in-memory storage (replace with database in production)
 * - Supports user management, todos, reports, and attendance data
 * 
 * API Endpoints:
 * - Authentication: /api/auth/*
 * - Todos: /api/todos/*
 * - Reports: /api/reports/*
 * - Attendance: /api/attendance/*
 * - Health check: /api/health
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 * @lastUpdated 2025-07-12
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ===== MIDDLEWARE CONFIGURATION =====

// Security middleware - adds various HTTP headers for security
app.use(helmet());

// CORS configuration - allows cross-origin requests from web and mobile apps
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'file://', 'null'], // Allowed origins
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'] // Allowed headers
}));

// Rate limiting middleware - prevents API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes time window
  max: 1000 // Increased for development - Maximum 1000 requests per IP per time window
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== IN-MEMORY DATA STORAGE (Replace with database in production) =====
let users = [
  {
    id: '1',
    email: 'richard@company.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    name: 'Richard Johnson',
    role: 'employee',
    department: 'Sales',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'admin@company.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    name: 'Admin User',
    role: 'admin',
    department: 'IT',
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

let todos = [];
let reports = [];
let attendanceData = {};

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * Middleware to authenticate JWT tokens
 * Extracts token from Authorization header and verifies it
 * Adds user data to request object if token is valid
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  // Extract token from Authorization header (format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify token and extract user data
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // Add user data to request object for use in route handlers
    req.user = user;
    next();
  });
};

// ===== UTILITY FUNCTIONS =====

/**
 * Hash a password using bcrypt with salt rounds of 10
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token for user authentication
 * @param {Object} user - User object containing id, email, role, and name
 * @returns {string} JWT token with 24-hour expiration
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// ===== API ROUTES =====

/**
 * Health check endpoint
 * Used to verify API server is running and responsive
 * Returns server status and current timestamp
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Workforce Management API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Debug endpoint to view all users (development only)
 * Returns list of all users without password fields
 * Should be removed in production
 */
app.get('/api/debug/users', (req, res) => {
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json({ users: usersWithoutPasswords, count: users.length });
});

/**
 * Debug endpoint to reset users to default state (development only)
 * Resets the users array to initial default users
 * Should be removed in production
 */
app.delete('/api/debug/users', (req, res) => {
  users = [
    {
      id: '1',
      email: 'richard@company.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
      name: 'Richard Johnson',
      role: 'employee',
      department: 'Sales',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      email: 'admin@company.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
      name: 'Admin User',
      role: 'admin',
      department: 'IT',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ];
  res.json({ message: 'Users reset to default state' });
});

// ===== AUTHENTICATION ROUTES =====

/**
 * Register a new user
 * Creates a new user account with hashed password and returns JWT token
 * 
 * Request Body:
 * - email: User's email address (required)
 * - password: User's password, minimum 6 characters (required)
 * - name: User's full name (required)
 * - role: User role ('admin', 'employee', default: 'employee')
 * - department: User's department (optional)
 * 
 * Response:
 * - 201: User created successfully with token
 * - 400: Missing required fields or invalid password
 * - 409: User already exists
 * - 500: Internal server error
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'employee', department } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists (case-insensitive email comparison)
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password for secure storage
    const hashedPassword = await hashPassword(password);
    
    // Create new user object
    const newUser = {
      id: uuidv4(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      department,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Add user to storage
    users.push(newUser);

    // Generate JWT token for immediate authentication
    const token = generateToken(newUser);

    // Return user data without password and authentication token
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Login user
 * Authenticates user credentials and returns JWT token
 * 
 * Request Body:
 * - email: User's email address (required)
 * - password: User's password (required)
 * 
 * Response:
 * - 200: Login successful with user data and token
 * - 400: Missing email or password
 * - 401: Invalid credentials
 * - 403: Account deactivated
 * - 500: Internal server error
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email (case-insensitive)
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password against stored hash
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Generate JWT token for authentication
    const token = generateToken(user);

    // Return user data without password and authentication token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get current user profile
 * Returns the authenticated user's profile information
 * Requires valid JWT token in Authorization header
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Response:
 * - 200: User profile data (without password)
 * - 401: Missing or invalid token
 * - 404: User not found
 * - 500: Internal server error
 */
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    // Find user by ID from JWT token
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== TODO ROUTES =====

/**
 * Get all todos for authenticated user
 * Returns list of todos belonging to the current user
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Response:
 * - 200: Array of user's todos
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/todos', authenticateToken, (req, res) => {
  try {
    // Filter todos to only show current user's todos
    const userTodos = todos.filter(todo => todo.userId === req.user.id);
    res.json({ todos: userTodos });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create new todo for authenticated user
 * Creates a new todo item with the provided details
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Request Body:
 * - title: Todo title (required)
 * - description: Todo description (optional)
 * - priority: Priority level ('low', 'medium', 'high', default: 'medium')
 * 
 * Response:
 * - 201: Todo created successfully
 * - 400: Missing required title
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.post('/api/todos', authenticateToken, (req, res) => {
  try {
    const { title, description, priority = 'medium' } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Create new todo object
    const newTodo = {
      id: uuidv4(),
      title,
      description,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      userId: req.user.id
    };

    // Add todo to storage
    todos.push(newTodo);
    res.status(201).json({ 
      message: 'Todo created successfully',
      todo: newTodo 
    });

  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update existing todo
 * Updates a todo item with new values. Only the todo owner can update it.
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * URL Parameters:
 * - id: Todo ID to update (required)
 * 
 * Request Body:
 * - title: New todo title (optional)
 * - description: New todo description (optional)
 * - priority: New priority level (optional)
 * - completed: Completion status (optional)
 * 
 * Response:
 * - 200: Todo updated successfully
 * - 401: Missing or invalid token
 * - 404: Todo not found or not owned by user
 * - 500: Internal server error
 */
app.put('/api/todos/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, completed } = req.body;

    // Find todo and ensure it belongs to current user
    const todoIndex = todos.findIndex(todo => todo.id === id && todo.userId === req.user.id);
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Update todo with new values (preserve existing values if not provided)
    const updatedTodo = {
      ...todos[todoIndex],
      title: title || todos[todoIndex].title,
      description: description !== undefined ? description : todos[todoIndex].description,
      priority: priority || todos[todoIndex].priority,
      completed: completed !== undefined ? completed : todos[todoIndex].completed,
      completedAt: completed ? new Date().toISOString() : null
    };

    // Save updated todo
    todos[todoIndex] = updatedTodo;
    res.json({ 
      message: 'Todo updated successfully',
      todo: updatedTodo 
    });

  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete todo
 * Permanently removes a todo item. Only the todo owner can delete it.
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * URL Parameters:
 * - id: Todo ID to delete (required)
 * 
 * Response:
 * - 200: Todo deleted successfully
 * - 401: Missing or invalid token
 * - 404: Todo not found or not owned by user
 * - 500: Internal server error
 */
app.delete('/api/todos/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // Find todo and ensure it belongs to current user
    const todoIndex = todos.findIndex(todo => todo.id === id && todo.userId === req.user.id);
    
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Remove todo from storage
    todos.splice(todoIndex, 1);
    res.json({ message: 'Todo deleted successfully' });

  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== REPORT ROUTES =====

// Get all reports for a user
app.get('/api/reports', authenticateToken, (req, res) => {
  try {
    const userReports = reports.filter(report => report.userId === req.user.id);
    res.json({ reports: userReports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new report
app.post('/api/reports', authenticateToken, (req, res) => {
  try {
    const { title, type, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newReport = {
      id: uuidv4(),
      title,
      type: type || 'daily',
      content,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      userId: req.user.id,
      userName: req.user.name
    };

    reports.push(newReport);
    res.status(201).json({ 
      message: 'Report submitted successfully',
      report: newReport 
    });

  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update report status (admin only)
app.put('/api/reports/:id/status', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { status, comments } = req.body;

    const reportIndex = reports.findIndex(report => report.id === id);
    if (reportIndex === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const updatedReport = {
      ...reports[reportIndex],
      status: status || reports[reportIndex].status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user.id,
      comments: comments || reports[reportIndex].comments
    };

    reports[reportIndex] = updatedReport;
    res.json({ 
      message: 'Report status updated successfully',
      report: updatedReport 
    });

  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ATTENDANCE ROUTES =====

// Get attendance data for a user
app.get('/api/attendance', authenticateToken, (req, res) => {
  try {
    const userAttendance = attendanceData[req.user.id] || {};
    res.json({ attendance: userAttendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record punch in
app.post('/api/attendance/punch-in', authenticateToken, (req, res) => {
  try {
    const { location, photo } = req.body;
    const userId = req.user.id;
    const now = new Date();
    const today = now.toDateString();

    if (!attendanceData[userId]) {
      attendanceData[userId] = {};
    }

    if (!attendanceData[userId][today]) {
      attendanceData[userId][today] = {};
    }

    // Check if already punched in today
    if (attendanceData[userId][today].punchIn) {
      return res.status(400).json({ error: 'Already punched in today' });
    }

    attendanceData[userId][today].punchIn = now.toISOString();
    attendanceData[userId][today].location = location;
    attendanceData[userId][today].photo = photo;

    res.json({ 
      message: 'Punch in recorded successfully',
      punchInTime: now.toISOString(),
      attendance: attendanceData[userId][today]
    });

  } catch (error) {
    console.error('Punch in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record punch out
app.post('/api/attendance/punch-out', authenticateToken, (req, res) => {
  try {
    const { location } = req.body;
    const userId = req.user.id;
    const now = new Date();
    const today = now.toDateString();

    if (!attendanceData[userId] || !attendanceData[userId][today] || !attendanceData[userId][today].punchIn) {
      return res.status(400).json({ error: 'Must punch in before punching out' });
    }

    const punchInTime = new Date(attendanceData[userId][today].punchIn);
    const hoursWorked = (now - punchInTime) / (1000 * 60 * 60);

    attendanceData[userId][today].punchOut = now.toISOString();
    attendanceData[userId][today].endLocation = location;
    attendanceData[userId][today].hoursWorked = Math.round(hoursWorked * 100) / 100;

    res.json({ 
      message: 'Punch out recorded successfully',
      punchOutTime: now.toISOString(),
      hoursWorked: attendanceData[userId][today].hoursWorked,
      attendance: attendanceData[userId][today]
    });

  } catch (error) {
    console.error('Punch out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== PASSWORD RESET ROUTE =====
// Reset password by email
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.password = await hashPassword(newPassword);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ADMIN ROUTES =====

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all todos (admin only)
app.get('/api/admin/todos', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({ todos });
  } catch (error) {
    console.error('Get all todos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reports (admin only)
app.get('/api/admin/reports', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({ reports });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all attendance data (admin only)
app.get('/api/admin/attendance', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({ attendance: attendanceData });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== START SERVER =====

/**
 * Start the Express server
 * Initializes the server on the specified port and logs startup information
 * 
 * Server Features:
 * - RESTful API endpoints for workforce management
 * - JWT-based authentication and authorization
 * - Real-time data synchronization between web and mobile apps
 * - Comprehensive error handling and logging
 * 
 * Available Endpoints:
 * - Authentication: /api/auth/*
 * - Todos: /api/todos/*
 * - Reports: /api/reports/*
 * - Attendance: /api/attendance/*
 * - Admin: /api/admin/*
 * - Health: /api/health
 * 
 * Security Features:
 * - Password hashing with bcrypt
 * - JWT token validation
 * - Rate limiting
 * - CORS protection
 * - Helmet security headers
 */
app.listen(PORT, () => {
  console.log(`🚀 Workforce Management API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔐 Authentication endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📝 Todo management: http://localhost:${PORT}/api/todos`);
  console.log(`📋 Report system: http://localhost:${PORT}/api/reports`);
  console.log(`⏰ Attendance tracking: http://localhost:${PORT}/api/attendance`);
});

module.exports = app; 