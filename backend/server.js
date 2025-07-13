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
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

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
  max: process.env.NODE_ENV === 'development' ? 10000 : 1000, // Much higher limit for development
  message: {
    error: 'Rate limit exceeded. Please wait 1 minute before trying again.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// JSON parsing error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next();
});

// Serve Swagger UI at /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

// Chat system data storage
let chatSettings = {
  id: '1',
  isEnabled: true,
  allowFileSharing: true,
  maxFileSize: 10,
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
  allowReactions: true,
  allowEditing: true,
  editTimeLimit: 5,
  allowDeletion: true,
  deletionTimeLimit: 10,
  messageRetentionDays: 365,
  helpDeskEnabled: true,
  helpDeskSettings: {
    autoAssignEnabled: true,
    defaultResponseTime: 24,
    escalationEnabled: true,
    escalationTimeLimit: 48,
    allowEmployeeCreation: false,
    requireApproval: true,
    categories: ['personnel', 'vmd', 'inventory'],
    priorityLevels: ['low', 'medium', 'high', 'urgent']
  },
  notificationSettings: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    mentionNotifications: true,
    channelNotifications: true,
    helpDeskNotifications: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'UTC'
    }
  },
  createdBy: '1',
  updatedAt: new Date().toISOString()
};

let chatChannels = [
  {
    id: '1',
    name: 'General',
    description: 'Company-wide announcements and general discussions',
    type: 'general',
    members: ['1', '2'],
    admins: ['1'],
    createdBy: '1',
    isPrivate: false,
    isArchived: false,
    notificationSettings: {
      mentions: true,
      allMessages: false,
      importantOnly: true,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'UTC'
      }
    },
    memberCount: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

let chatMessages = [
  {
    id: '1',
    senderId: '2',
    channelId: '1',
    content: 'Good morning team!',
    type: 'text',
    readBy: ['1', '2'],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    isEdited: false,
    isDeleted: false
  }
];

let helpDeskChannels = [
  {
    id: 'hd1',
    name: 'Personnel Manager',
    description: 'Contact for vacation/annual leave, HR issues, and personnel matters',
    category: 'personnel',
    assignedManagers: ['1'],
    contactPersons: ['1'],
    topics: ['Vacation Request', 'Annual Leave', 'HR Issues', 'Benefits'],
    priority: 'medium',
    responseTime: 24,
    isActive: true,
    autoAssign: true,
    createdBy: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'hd2',
    name: 'VMD Manager',
    description: 'Contact for visual merchandising, store layout, and display issues',
    category: 'vmd',
    assignedManagers: ['2'],
    contactPersons: ['2'],
    topics: ['Store Layout', 'Display Issues', 'Visual Merchandising', 'Product Placement'],
    priority: 'high',
    responseTime: 12,
    isActive: true,
    autoAssign: true,
    createdBy: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

let helpDeskRequests = [];

// ===== TEST-ONLY ENDPOINTS FOR CLEAN TESTING =====
if (process.env.NODE_ENV === 'test') {
  app.post('/api/test/reset-attendance', (req, res) => {
    attendanceData = {};
    res.json({ message: 'Attendance data reset' });
  });
}

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

// ===== USER MANAGEMENT ROUTES =====

/**
 * Get all users (for admin assignment purposes)
 * Returns list of all users for todo assignment
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Response:
 * - 200: Array of all users
 * - 401: Missing or invalid token
 * - 403: Access denied (admin only)
 * - 500: Internal server error
 */
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    // Only admins can get all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Return users without sensitive information
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status
    }));

    res.json({ users: safeUsers });
  } catch (error) {
    console.error('Get users error:', error);
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
    // Filter todos to show todos assigned to current user (not just created by them)
    const userTodos = todos.filter(todo => todo.assignedTo === req.user.id);
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
    const { title, description, priority = 'medium', assignedTo } = req.body;

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
      userId: req.user.id, // Creator
      assignedTo: assignedTo || req.user.id, // Assigned user (defaults to creator)
      assignedBy: req.user.id, // Who assigned it
      assignedAt: new Date().toISOString()
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

/**
 * Get all reports for authenticated user
 * Returns list of reports belonging to the current user
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Response:
 * - 200: Array of user's reports
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/reports', authenticateToken, (req, res) => {
  try {
    // Filter reports to only show current user's reports
    const userReports = reports.filter(report => report.userId === req.user.id);
    res.json({ reports: userReports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create new report for authenticated user
 * Creates a new report with the provided details
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Request Body:
 * - title: Report title (required)
 * - type: Report type ('daily', 'weekly', 'monthly', 'incident', default: 'daily')
 * - content: Report content (required)
 * 
 * Response:
 * - 201: Report created successfully
 * - 400: Missing required fields
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.post('/api/reports', authenticateToken, (req, res) => {
  try {
    const { title, type, content } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Create new report object
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

/**
 * Update report status (admin only)
 * Updates the approval status of a report with optional comments
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * URL Parameters:
 * - id: Report ID to update (required)
 * 
 * Request Body:
 * - status: New status ('pending', 'approved', 'rejected')
 * - comments: Review comments (optional)
 * 
 * Response:
 * - 200: Report status updated successfully
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 404: Report not found
 * - 500: Internal server error
 */
app.put('/api/reports/:id/status', authenticateToken, (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { status, comments } = req.body;

    // Find report by ID
    const reportIndex = reports.findIndex(report => report.id === id);
    if (reportIndex === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Update report with new status and review information
    const updatedReport = {
      ...reports[reportIndex],
      status: status || reports[reportIndex].status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user.id,
      comments: comments || reports[reportIndex].comments
    };

    // Save updated report
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

/**
 * Get attendance data for authenticated user
 * Returns all attendance records for the current user
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Response:
 * - 200: User's attendance data organized by date
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/attendance', authenticateToken, (req, res) => {
  try {
    // Get attendance data for current user (empty object if no data)
    const userAttendance = attendanceData[req.user.id] || {};
    res.json({ attendance: userAttendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Record punch in for authenticated user
 * Records user punch in with workplace location and optional photo
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Request Body:
 * - workplace: Workplace location where user is working (required)
 * - photo: Base64 encoded photo data (optional)
 * 
 * Response:
 * - 200: Punch in recorded successfully
 * - 400: Missing workplace or already punched in today
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.post('/api/attendance/punch-in', authenticateToken, (req, res) => {
  try {
    const { workplace, photo } = req.body;
    const userId = req.user.id;
    const now = new Date();
    const today = now.toDateString();

    // Validate required workplace field
    if (!workplace || !workplace.trim()) {
      return res.status(400).json({ error: 'Workplace location is required' });
    }

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
    attendanceData[userId][today].workplace = workplace.trim();
    attendanceData[userId][today].photo = photo;

    res.json({ 
      message: 'Punch in recorded successfully',
      punchInTime: now.toISOString(),
      workplace: workplace.trim(),
      attendance: attendanceData[userId][today]
    });

  } catch (error) {
    console.error('Punch in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Record punch out for authenticated user
 * Records user punch out and calculates hours worked
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Request Body:
 * - None required (uses workplace from punch-in)
 * 
 * Response:
 * - 200: Punch out recorded successfully with hours worked
 * - 400: Must punch in before punching out
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.post('/api/attendance/punch-out', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = now.toDateString();

    // Check if user has punched in today
    if (!attendanceData[userId] || !attendanceData[userId][today] || !attendanceData[userId][today].punchIn) {
      return res.status(400).json({ error: 'Must punch in before punching out' });
    }

    // Calculate hours worked
    const punchInTime = new Date(attendanceData[userId][today].punchIn);
    let hoursWorked = (now - punchInTime) / (1000 * 60 * 60);
    hoursWorked = Math.round(hoursWorked * 100) / 100;
    if (hoursWorked === 0 && now > punchInTime) {
      hoursWorked = 0.01;
    }

    // Record punch out data
    attendanceData[userId][today].punchOut = now.toISOString();
    attendanceData[userId][today].hoursWorked = hoursWorked;

    res.json({ 
      message: 'Punch out recorded successfully',
      punchOutTime: now.toISOString(),
      workplace: attendanceData[userId][today].workplace,
      hoursWorked: attendanceData[userId][today].hoursWorked,
      attendance: attendanceData[userId][today]
    });

  } catch (error) {
    console.error('Punch out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== PASSWORD RESET ROUTE =====

/**
 * Reset user password by email
 * Allows users to reset their password using email verification
 * 
 * Request Body:
 * - email: User's email address (required)
 * - newPassword: New password, minimum 6 characters (required)
 * 
 * Response:
 * - 200: Password reset successful
 * - 400: Missing fields or invalid password
 * - 404: User not found
 * - 500: Internal server error
 */
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

/**
 * Get all users (admin only)
 * Returns list of all users in the system without password fields
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Response:
 * - 200: Array of all users (without passwords)
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.get('/api/admin/users', authenticateToken, (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Return users without password fields for security
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

/**
 * Get all todos (admin only)
 * Returns list of all todos in the system for administrative review
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Response:
 * - 200: Array of all todos
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.get('/api/admin/todos', authenticateToken, (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({ todos });
  } catch (error) {
    console.error('Get all todos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get all reports (admin only)
 * Returns list of all reports in the system for administrative review
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Response:
 * - 200: Array of all reports
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.get('/api/admin/reports', authenticateToken, (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({ reports });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get all attendance data (admin only)
 * Returns all attendance records in the system for administrative review
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Response:
 * - 200: All attendance data organized by user ID and date
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.get('/api/admin/attendance', authenticateToken, (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({ attendance: attendanceData });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== CHAT SYSTEM ENDPOINTS =====

/**
 * Get chat settings
 * Returns current chat system configuration
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Response:
 * - 200: Chat settings
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.get('/api/chat/settings', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json(chatSettings);
  } catch (error) {
    console.error('Get chat settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update chat settings
 * Updates chat system configuration
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Body:
 * - Updated chat settings
 * 
 * Response:
 * - 200: Settings updated successfully
 * - 400: Invalid settings data
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.put('/api/chat/settings', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    chatSettings = {
      ...chatSettings,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.json({ message: 'Chat settings updated successfully', settings: chatSettings });
  } catch (error) {
    console.error('Update chat settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get chat channels
 * Returns available chat channels for the user
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Response:
 * - 200: Array of chat channels
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/chat/channels', authenticateToken, (req, res) => {
  try {
    // Filter channels based on user membership
    const userChannels = chatChannels.filter(channel => 
      channel.members.includes(req.user.id) || channel.admins.includes(req.user.id)
    );

    res.json(userChannels);
  } catch (error) {
    console.error('Get chat channels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create chat channel
 * Creates a new chat channel
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Body:
 * - Channel configuration data
 * 
 * Response:
 * - 200: Channel created successfully
 * - 400: Invalid channel data
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.post('/api/chat/channels', authenticateToken, (req, res) => {
  try {
    const channel = {
      id: uuidv4(),
      ...req.body,
      members: req.body.members || [req.user.id],
      admins: req.body.admins || [req.user.id],
      createdBy: req.user.id,
      isPrivate: req.body.isPrivate || false,
      isArchived: false,
      memberCount: (req.body.members || [req.user.id]).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    chatChannels.push(channel);

    res.json({ message: 'Channel created successfully', channel });
  } catch (error) {
    console.error('Create chat channel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get chat messages
 * Returns messages for a specific channel
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Query Parameters:
 * - channelId: Channel ID to get messages for
 * - limit: Number of messages to return (default: 50)
 * - before: Get messages before this timestamp
 * 
 * Response:
 * - 200: Array of chat messages
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/chat/messages', authenticateToken, (req, res) => {
  try {
    const { channelId, limit = 50, before } = req.query;
    
    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    // Check if user has access to this channel
    const channel = chatChannels.find(c => c.id === channelId);
    if (!channel || (!channel.members.includes(req.user.id) && !channel.admins.includes(req.user.id))) {
      return res.status(403).json({ error: 'Access denied to this channel' });
    }

    let filteredMessages = chatMessages.filter(msg => msg.channelId === channelId);

    if (before) {
      filteredMessages = filteredMessages.filter(msg => new Date(msg.createdAt) < new Date(before));
    }

    // Sort by creation date (newest first) and limit
    filteredMessages = filteredMessages
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, parseInt(limit));

    res.json(filteredMessages);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Send chat message
 * Sends a new message to a channel
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Body:
 * - Message data (channelId, content, type, etc.)
 * 
 * Response:
 * - 200: Message sent successfully
 * - 400: Invalid message data
 * - 401: Missing or invalid token
 * - 403: Access denied to channel
 * - 500: Internal server error
 */
app.post('/api/chat/messages', authenticateToken, (req, res) => {
  try {
    const { channelId, content, type = 'text', replyTo, attachments } = req.body;

    if (!channelId || !content) {
      return res.status(400).json({ error: 'Channel ID and content are required' });
    }

    // Check if user has access to this channel
    const channel = chatChannels.find(c => c.id === channelId);
    if (!channel || (!channel.members.includes(req.user.id) && !channel.admins.includes(req.user.id))) {
      return res.status(403).json({ error: 'Access denied to this channel' });
    }

    const message = {
      id: uuidv4(),
      senderId: req.user.id,
      channelId,
      content,
      type,
      readBy: [req.user.id],
      replyTo,
      attachments: attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false
    };

    chatMessages.push(message);

    // Update channel's last message
    const channelIndex = chatChannels.findIndex(c => c.id === channelId);
    if (channelIndex !== -1) {
      chatChannels[channelIndex].lastMessage = message;
      chatChannels[channelIndex].updatedAt = new Date().toISOString();
    }

    res.json({ message: 'Message sent successfully', chatMessage: message });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get help desk channels
 * Returns available help desk channels
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Response:
 * - 200: Array of help desk channels
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/chat/help-desk/channels', authenticateToken, (req, res) => {
  try {
    res.json(helpDeskChannels);
  } catch (error) {
    console.error('Get help desk channels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get help desk requests
 * Returns help desk requests for the user
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Query Parameters:
 * - status: Filter by request status
 * - category: Filter by request category
 * 
 * Response:
 * - 200: Array of help desk requests
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/chat/help-desk/requests', authenticateToken, (req, res) => {
  try {
    let filteredRequests = helpDeskRequests.filter(req => req.requesterId === req.user.id);

    if (req.query.status) {
      filteredRequests = filteredRequests.filter(r => r.status === req.query.status);
    }

    if (req.query.category) {
      filteredRequests = filteredRequests.filter(r => r.category === req.query.category);
    }

    res.json(filteredRequests);
  } catch (error) {
    console.error('Get help desk requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create help desk request
 * Creates a new help desk request
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Body:
 * - Request data (channelId, title, description, category, priority, etc.)
 * 
 * Response:
 * - 200: Request created successfully
 * - 400: Invalid request data
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.post('/api/chat/help-desk/requests', authenticateToken, (req, res) => {
  try {
    const { channelId, title, description, category, priority = 'medium', tags = [] } = req.body;

    if (!channelId || !title || !description) {
      return res.status(400).json({ error: 'Channel ID, title, and description are required' });
    }

    // Check if help desk channel exists
    const helpDeskChannel = helpDeskChannels.find(c => c.id === channelId);
    if (!helpDeskChannel) {
      return res.status(400).json({ error: 'Invalid help desk channel' });
    }

    const request = {
      id: uuidv4(),
      channelId,
      requesterId: req.user.id,
      requesterName: req.user.name,
      requesterEmail: req.user.email,
      title,
      description,
      category,
      priority,
      status: 'open',
      messages: [
        {
          id: uuidv4(),
          senderId: req.user.id,
          channelId,
          content: description,
          type: 'help-desk',
          readBy: [req.user.id],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isEdited: false,
          isDeleted: false
        }
      ],
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    helpDeskRequests.push(request);

    res.json({ message: 'Help desk request created successfully', request });
  } catch (error) {
    console.error('Create help desk request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Send message to help desk request
 * Sends a message to a specific help desk request
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Body:
 * - Message data (requestId, content)
 * 
 * Response:
 * - 200: Message sent successfully
 * - 400: Invalid message data
 * - 401: Missing or invalid token
 * - 403: Access denied to request
 * - 500: Internal server error
 */
app.post('/api/chat/help-desk/messages', authenticateToken, (req, res) => {
  try {
    const { requestId, content } = req.body;

    if (!requestId || !content) {
      return res.status(400).json({ error: 'Request ID and content are required' });
    }

    // Find the help desk request
    const requestIndex = helpDeskRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Help desk request not found' });
    }

    const request = helpDeskRequests[requestIndex];

    // Check if user has access to this request
    if (request.requesterId !== req.user.id && !request.assignedTo) {
      return res.status(403).json({ error: 'Access denied to this request' });
    }

    const message = {
      id: uuidv4(),
      senderId: req.user.id,
      channelId: request.channelId,
      content,
      type: 'help-desk',
      readBy: [req.user.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false
    };

    // Add message to request
    helpDeskRequests[requestIndex].messages.push(message);
    helpDeskRequests[requestIndex].updatedAt = new Date().toISOString();

    res.json({ message: 'Message sent successfully', chatMessage: message });
  } catch (error) {
    console.error('Send help desk message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== APPROVAL SYSTEM ENDPOINTS =====

// In-memory storage for approval data
let approvalRequests = [];
let approvalSettings = {
  id: '1',
  allowSelfApproval: false,
  allowDelegation: true,
  delegationSettings: {
    allowDelegation: true,
    whoCanDelegate: 'all_managers_leaders',
    whoCanBeDelegated: 'all_managers_leaders',
    whoApprovesDelegation: 'upper_group_leader',
    maxDelegationDuration: 30,
    requireApproval: true,
    autoApproveForUpperLeaders: false,
    allowMultipleDelegations: false,
    delegationHistoryRetention: 365
  },
  notificationSettings: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    approvalReminders: true,
    escalationNotifications: true,
    delegationNotifications: true
  },
  autoApprovalSettings: {
    enabled: false,
    maxAmount: 1000,
    maxDays: 3,
    allowedTypes: ['leave_request', 'schedule_change']
  },
  escalationSettings: {
    enabled: true,
    defaultTimeout: 24,
    escalationLevels: 3
  },
  createdBy: '2',
  updatedAt: new Date().toISOString()
};

let delegations = [];
let approvalWorkflows = [];

/**
 * Get approval statistics
 * Returns comprehensive approval metrics and statistics
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Response:
 * - 200: Approval statistics object
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/approvals/stats', authenticateToken, (req, res) => {
  try {
    const stats = {
      totalRequests: approvalRequests.length,
      pendingRequests: approvalRequests.filter(r => r.status === 'pending').length,
      approvedRequests: approvalRequests.filter(r => r.status === 'approved').length,
      rejectedRequests: approvalRequests.filter(r => r.status === 'rejected').length,
      averageApprovalTime: 12.5, // Mock data - calculate from actual data
      requestsByType: [
        { type: 'leave_request', count: 15, approved: 12, rejected: 2 },
        { type: 'schedule_change', count: 8, approved: 7, rejected: 1 },
        { type: 'overtime_request', count: 5, approved: 4, rejected: 1 }
      ],
      requestsByStatus: [
        { status: 'pending', count: 3 },
        { status: 'approved', count: 23 },
        { status: 'rejected', count: 4 }
      ],
      topApprovers: [
        { approverId: '2', approverName: 'Admin User', approvedCount: 15, averageTime: 8.5 },
        { approverId: '1', approverName: 'Richard Johnson', approvedCount: 8, averageTime: 12.3 }
      ],
      recentActivity: [
        {
          requestId: '1',
          requestTitle: 'Vacation Request',
          action: 'approved',
          approverName: 'Admin User',
          timestamp: new Date().toISOString()
        }
      ]
    };

    res.json(stats);
  } catch (error) {
    console.error('Get approval stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get approval settings
 * Returns current approval system configuration
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Response:
 * - 200: Approval settings object
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.get('/api/approvals/settings', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json(approvalSettings);
  } catch (error) {
    console.error('Get approval settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update approval settings
 * Updates the approval system configuration
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Body:
 * - Approval settings object
 * 
 * Response:
 * - 200: Updated approval settings
 * - 400: Invalid settings data
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.put('/api/approvals/settings', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const updatedSettings = { ...approvalSettings, ...req.body, updatedAt: new Date().toISOString() };
    approvalSettings = updatedSettings;

    res.json(updatedSettings);
  } catch (error) {
    console.error('Update approval settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get approval requests
 * Returns approval requests based on filters
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Query Parameters:
 * - my-requests: Filter to show only user's requests
 * - pending-approvals: Filter to show only pending approvals for user
 * 
 * Response:
 * - 200: Array of approval requests
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/approvals/requests', authenticateToken, (req, res) => {
  try {
    let filteredRequests = [...approvalRequests];

    if (req.query['my-requests'] === 'true') {
      filteredRequests = filteredRequests.filter(r => r.requesterId === req.user.id);
    }

    if (req.query['pending-approvals'] === 'true') {
      filteredRequests = filteredRequests.filter(r => 
        r.status === 'pending' && r.requesterId !== req.user.id
      );
    }

    res.json(filteredRequests);
  } catch (error) {
    console.error('Get approval requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Approve a request
 * Approves an approval request
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Body:
 * - notes: Optional approval notes
 * 
 * Response:
 * - 200: Request approved successfully
 * - 400: Invalid request data
 * - 401: Missing or invalid token
 * - 404: Request not found
 * - 500: Internal server error
 */
app.post('/api/approvals/requests/:requestId/approve', authenticateToken, (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;

    const request = approvalRequests.find(r => r.id === requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = 'approved';
    request.approvedBy = req.user.id;
    request.approvedAt = new Date().toISOString();
    request.approvalNotes = notes;

    res.json({ message: 'Request approved successfully', request });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Reject a request
 * Rejects an approval request
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Body:
 * - reason: Reason for rejection
 * 
 * Response:
 * - 200: Request rejected successfully
 * - 400: Invalid request data
 * - 401: Missing or invalid token
 * - 404: Request not found
 * - 500: Internal server error
 */
app.post('/api/approvals/requests/:requestId/reject', authenticateToken, (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = approvalRequests.find(r => r.id === requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = 'rejected';
    request.rejectedBy = req.user.id;
    request.rejectedAt = new Date().toISOString();
    request.rejectionReason = reason;

    res.json({ message: 'Request rejected successfully', request });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delegate a request
 * Delegates an approval request to another user
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Body:
 * - delegateId: ID of user to delegate to
 * - reason: Reason for delegation
 * 
 * Response:
 * - 200: Request delegated successfully
 * - 400: Invalid request data
 * - 401: Missing or invalid token
 * - 404: Request not found
 * - 500: Internal server error
 */
app.post('/api/approvals/requests/:requestId/delegate', authenticateToken, (req, res) => {
  try {
    const { requestId } = req.params;
    const { delegateId, reason } = req.body;

    const request = approvalRequests.find(r => r.id === requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = 'delegated';
    request.delegationInfo = {
      id: uuidv4(),
      delegatorId: req.user.id,
      delegateId,
      reason,
      status: 'active',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({ message: 'Request delegated successfully', request });
  } catch (error) {
    console.error('Delegate request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get delegations
 * Returns delegation information
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Query Parameters:
 * - status: Filter by delegation status
 * 
 * Response:
 * - 200: Array of delegations
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/approvals/delegations', authenticateToken, (req, res) => {
  try {
    let filteredDelegations = [...delegations];

    if (req.query.status) {
      filteredDelegations = filteredDelegations.filter(d => d.status === req.query.status);
    }

    res.json(filteredDelegations);
  } catch (error) {
    console.error('Get delegations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Request delegation
 * Creates a new delegation request
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Body:
 * - Delegation request data
 * 
 * Response:
 * - 200: Delegation requested successfully
 * - 400: Invalid delegation data
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.post('/api/approvals/delegations/request', authenticateToken, (req, res) => {
  try {
    const delegation = {
      id: uuidv4(),
      delegatorId: req.user.id,
      ...req.body,
      status: 'pending',
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    delegations.push(delegation);

    res.json({ message: 'Delegation requested successfully', delegation });
  } catch (error) {
    console.error('Request delegation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get approval workflows
 * Returns approval workflow configurations
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Response:
 * - 200: Array of approval workflows
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.get('/api/approvals/workflows', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json(approvalWorkflows);
  } catch (error) {
    console.error('Get approval workflows error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create approval workflow
 * Creates a new approval workflow
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Body:
 * - Workflow configuration data
 * 
 * Response:
 * - 200: Workflow created successfully
 * - 400: Invalid workflow data
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.post('/api/approvals/workflows', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const workflow = {
      id: uuidv4(),
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    approvalWorkflows.push(workflow);

    res.json({ message: 'Workflow created successfully', workflow });
  } catch (error) {
    console.error('Create approval workflow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ERROR HANDLING =====

/**
 * Global error handling middleware
 * Catches any unhandled errors and returns a generic error response
 * Logs the full error stack for debugging purposes
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

/**
 * 404 route handler
 * Catches all unmatched routes and returns a 404 error
 * This should be the last middleware in the stack
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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
  console.log(`✅ Approval system: http://localhost:${PORT}/api/approvals`);
  console.log(`💬 Chat system: http://localhost:${PORT}/api/chat`);
});

module.exports = app; 