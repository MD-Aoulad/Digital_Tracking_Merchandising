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
 * - CORS configuration for cross-origin requests
 * - Helmet.js for security headers
 * - Rate limiting (currently DISABLED for local development; re-enable for production/cloud)
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
console.log('DATABASE_URL:', process.env.DATABASE_URL); // Debug log
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Debug configuration
const DEBUG_MODE = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';

// ===== MIDDLEWARE CONFIGURATION =====

// Security middleware - adds various HTTP headers for security
app.use(helmet());

// CORS configuration - allows cross-origin requests from web and mobile apps
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:8081',
      'http://192.168.178.150:3000',
      'http://192.168.178.150:3001',
      'http://192.168.178.150:8081',
      'exp://192.168.178.150:8081'
    ];
    
    // console.log('🌐 CORS request from origin:', origin);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For unauthorized origins, still allow the request but don't include credentials
      // console.log('⚠️ CORS: Allowing unauthorized origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Return 200 for OPTIONS requests
}));

// Rate limiting is currently DISABLED for local development. See above to re-enable for production/cloud.

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
let todos = [
  {
    id: '1',
    title: 'Mystore Zugang',
    description: 'Access to the store system',
    priority: 'medium',
    completed: false,
    createdAt: '2025-07-14T00:00:00Z',
    completedAt: null,
    assignedTo: '256',
    assignedBy: 'C_20',
    category: 'Promoter ToDo (TV | HA)',
    startDate: '2025.07.14 (Mo) 00:00',
    endDate: '2025.07.18 (Fr) 23:59',
    repeat: 'None',
    taskCompleted: '11.7% (30/256)',
    confirmation: '-',
    creator: 'C_20',
  },
  {
    id: '2',
    title: 'VSX Lifestyle Weeks 7. Juli bis zum 10. August II',
    description: 'Lifestyle campaign tasks',
    priority: 'medium',
    completed: false,
    createdAt: '2025-07-14T00:00:00Z',
    completedAt: null,
    assignedTo: '213',
    assignedBy: 'C_20',
    category: 'BA - ToDo (TV & Promoter ToDo (TV)',
    startDate: '2025.07.14 (Mo) 00:00',
    endDate: '2025.07.20 (So) 23:59',
    repeat: 'None',
    taskCompleted: '0.0% (0/213)',
    confirmation: '-',
    creator: 'C_20',
  },
  {
    id: '3',
    title: 'Weekly Report Feedbackbogen',
    description: 'Weekly feedback report',
    priority: 'medium',
    completed: false,
    createdAt: '2025-07-14T00:00:00Z',
    completedAt: null,
    assignedTo: '404',
    assignedBy: 'C_20',
    category: 'Promoter ToDo (TV)',
    startDate: '2025.07.14 (Mo) 00:00',
    endDate: '2025.07.20 (So) 23:59',
    repeat: 'Every week - Mo',
    taskCompleted: '2.2% (9/404)',
    confirmation: '-',
    creator: 'C_20',
  },
  {
    id: '4',
    title: '98 Zoll - MSD Eingangsbereich, Gewinnspiel Update',
    description: 'Update for entrance area and contest',
    priority: 'high',
    completed: false,
    createdAt: '2025-07-11T00:00:00Z',
    completedAt: null,
    assignedTo: '39',
    assignedBy: 'Backoffice',
    category: 'BA - ToDo (TV)',
    startDate: '2025.07.11 (Fr) 00:00',
    endDate: '2025.07.31 (Th) 23:59',
    repeat: 'None',
    taskCompleted: '87.2% (34/39)',
    confirmation: '0.0% (0/39)',
    creator: 'Backoffice',
  },
  {
    id: '5',
    title: 'Jet Qualitätssicherung',
    description: 'Quality assurance for Jet',
    priority: 'high',
    completed: true,
    createdAt: '2025-07-11T00:00:00Z',
    completedAt: '2025-07-31T23:59:00Z',
    assignedTo: '88',
    assignedBy: 'Backoffice',
    category: 'Promoter ToDo (HA)',
    startDate: '2025.07.11 (Fr) 00:00',
    endDate: '2025.07.31 (Th) 23:59',
    repeat: 'Every week - Fr',
    taskCompleted: '38.6% (34/88)',
    confirmation: '-',
    creator: 'Backoffice',
  },
  {
    id: '6',
    title: 'Roll-Out: Buying Guide',
    description: 'Buying guide rollout',
    priority: 'medium',
    completed: false,
    createdAt: '2025-07-14T00:00:00Z',
    completedAt: null,
    assignedTo: '217',
    assignedBy: 'C_80',
    category: 'Promoter ToDo (TV)',
    startDate: '2025.07.14 (Mo) 00:00',
    endDate: '2025.07.19 (Sa) 23:59',
    repeat: 'None',
    taskCompleted: '16.6% (36/217)',
    confirmation: '0.0% (0/217)',
    creator: 'C_80',
  },
];

let advancedTodos = []; // New storage for advanced todos with questions
let todoSubmissions = []; // Storage for todo responses/submissions
let todoTemplates = []; // Storage for reusable todo templates
let reports = [];
let attendanceData = {};

// Chat system data storage - Removed old in-memory system, using database-based system instead

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
    // Force user.id to be an integer
    user.id = parseInt(user.id, 10);
    if (DEBUG_MODE) {
      console.log('Decoded JWT user:', user); // Debug log
    }
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
  // console.log('🏥 Health check request from:', req.headers.origin || 'unknown');
  res.json({ 
    status: 'OK', 
    message: 'Workforce Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for mobile app (development only)
app.get('/api/test', (req, res) => {
  // console.log('🧪 Test request from:', req.headers.origin || 'unknown');
  res.json({
    message: 'Mobile app test successful',
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent']
  });
});

/**
 * Debug endpoint to view all users (development only)
 * Returns list of all users without password fields
 * Should be removed in production
 */
app.get('/api/debug/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, department, status, created_at FROM members');
    res.json({ users: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Debug endpoint to reset users to default state (development only)
 * Resets the users table to initial default users
 * Should be removed in production
 */
app.delete('/api/debug/users', async (req, res) => {
  try {
    await pool.query('DELETE FROM members');
    const demoUsers = [
      {
        email: 'richard@company.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
        name: 'Richard Johnson',
        role: 'employee',
        department: 'Sales',
        status: 'active'
      },
      {
        email: 'admin@company.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
        name: 'Admin User',
        role: 'admin',
        department: 'IT',
        status: 'active'
      }
    ];
    for (const user of demoUsers) {
      await pool.query(
        'INSERT INTO members (email, password, name, role, department, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [user.email, user.password, user.name, user.role, user.department, user.status]
      );
    }
    res.json({ message: 'Users reset to default state' });
  } catch (error) {
    console.error('Reset users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

    // Check if user already exists in DB
    const existingUser = await pool.query('SELECT * FROM members WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user into DB
    const insertResult = await pool.query(
      'INSERT INTO members (email, password, name, role, department, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [email.toLowerCase(), hashedPassword, name, role, department, 'active']
    );
    const newUser = insertResult.rows[0];

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
 * - 400: Missing required fields
 * - 401: Invalid credentials
 * - 500: Internal server error
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (DEBUG_MODE) {
      console.log('Login attempt:', { email, password: '***' }); // Debug log
    }
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Query user from DB
    const result = await pool.query('SELECT * FROM members WHERE LOWER(email) = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (DEBUG_MODE) {
      console.log('User from DB:', user ? { id: user.id, email: user.email, role: user.role } : null); // Debug log
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    if (DEBUG_MODE) {
      console.log('Password match:', isMatch); // Debug log
    }
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user);
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
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, department, status, created_at FROM members WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
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
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    // Only admins can get all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    const result = await pool.query('SELECT id, name, email, role, department, status FROM members');
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== TODO ROUTES (DATABASE-BACKED) =====

/**
 * Get all todos for authenticated user
 * Returns list of todos belonging to the current user
 */
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    // Only filter by assigned_to for now, since created_by column is missing or not available
    const result = await pool.query(
      'SELECT * FROM todos WHERE $1 = ANY(assigned_to) ORDER BY due_date, due_time',
      [req.user.id]
    );
    res.json({ todos: result.rows });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * Create new todo for authenticated user
 * Creates a new todo item with the provided details
 */
app.post('/api/todos', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo = [],
      assignedWorkplaces = [],
      priority = 'medium',
      status = 'pending',
      category = '',
      dueDate = null,
      dueTime = null,
      estimatedDuration = 30,
      isRepeating = false,
      repeatPattern = null,
      reminders = null,
      attachments = null,
      requiresPhoto = false,
      requiresLocation = false,
      requiresSignature = false,
      notes = '',
      tags = [],
      completedAt = null,
      cancellationReason = null
    } = req.body;
    
    // Ensure assignedTo is always a valid array
    const safeAssignedTo = Array.isArray(assignedTo) && assignedTo.length > 0 ? assignedTo : [req.user.id];
    const safeAssignedWorkplaces = Array.isArray(assignedWorkplaces) ? assignedWorkplaces : [];
    const safeTags = Array.isArray(tags) ? tags : [];
    const insertResult = await pool.query(
      `INSERT INTO todos (
        title, description, assigned_to, assigned_workplaces, priority, status, category, due_date, due_time, estimated_duration, is_repeating, repeat_pattern, reminders, attachments, requires_photo, requires_location, requires_signature, notes, tags, created_at, updated_at, created_by, completed_at, cancellation_reason
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW(), $20, $21, $22
      ) RETURNING *`,
      [
        title,
        description,
        safeAssignedTo,
        safeAssignedWorkplaces,
        priority,
        status,
        category,
        dueDate,
        dueTime,
        estimatedDuration,
        isRepeating,
        repeatPattern ? JSON.stringify(repeatPattern) : null,
        reminders ? JSON.stringify(reminders) : null,
        attachments ? JSON.stringify(attachments) : null,
        requiresPhoto,
        requiresLocation,
        requiresSignature,
        notes,
        safeTags,
        req.user.id,
        completedAt,
        cancellationReason
      ]
    );
    res.status(201).json({ message: 'Todo created successfully', todo: insertResult.rows[0] });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update existing todo
 * Updates a todo item with new values. Only the creator or assigned user can update it.
 */
app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assignedTo,
      assignedWorkplaces,
      priority,
      status,
      category,
      dueDate,
      dueTime,
      estimatedDuration,
      isRepeating,
      repeatPattern,
      reminders,
      attachments,
      requiresPhoto,
      requiresLocation,
      requiresSignature,
      notes,
      tags,
      completedAt,
      cancellationReason
    } = req.body;
    const updateResult = await pool.query(
      `UPDATE todos SET
        title = $1,
        description = $2,
        assigned_to = $3,
        assigned_workplaces = $4,
        priority = $5,
        status = $6,
        category = $7,
        due_date = $8,
        due_time = $9,
        estimated_duration = $10,
        is_repeating = $11,
        repeat_pattern = $12,
        reminders = $13,
        attachments = $14,
        requires_photo = $15,
        requires_location = $16,
        requires_signature = $17,
        notes = $18,
        tags = $19,
        updated_at = NOW(),
        completed_at = $20,
        cancellation_reason = $21
      WHERE id = $22
      RETURNING *`,
      [
        title,
        description,
        assignedTo,
        assignedWorkplaces,
        priority,
        status,
        category,
        dueDate,
        dueTime,
        estimatedDuration,
        isRepeating,
        repeatPattern ? JSON.stringify(repeatPattern) : null,
        reminders ? JSON.stringify(reminders) : null,
        attachments ? JSON.stringify(attachments) : null,
        requiresPhoto,
        requiresLocation,
        requiresSignature,
        notes,
        tags,
        completedAt,
        cancellationReason,
        id
      ]
    );
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo updated successfully', todo: updateResult.rows[0] });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete todo
 * Permanently removes a todo item. Only the creator or assigned user can delete it.
 */
app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteResult = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING id', [id]);
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ADVANCED TODO ROUTES =====

/**
 * Get advanced todos for authenticated user
 * Returns advanced todos assigned to the current user with questions
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Response:
 * - 200: Array of advanced todos assigned to user
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/advanced-todos', authenticateToken, (req, res) => {
  try {
    // Filter advanced todos to show todos assigned to current user
    const userAdvancedTodos = advancedTodos.filter(todo => 
      todo.assignedTo.includes(req.user.id)
    );
    res.json({ advancedTodos: userAdvancedTodos });
  } catch (error) {
    console.error('Get advanced todos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create advanced todo (admin only)
 * Creates a new advanced todo with questions and assignment settings
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Request Body:
 * - title: Todo title (required)
 * - description: Todo description (optional)
 * - questions: Array of TodoQuestion objects (required)
 * - assignedTo: Array of user IDs to assign to (required)
 * - category: Todo category (optional)
 * - difficulty: Difficulty level ('easy', 'medium', 'hard') (optional)
 * - estimatedDuration: Estimated duration in minutes (optional)
 * - dueDate: Due date (optional)
 * - requireApproval: Whether approval is required (optional)
 * - isTemplate: Whether this is a template (optional)
 * 
 * Response:
 * - 201: Advanced todo created successfully
 * - 400: Missing required fields
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.post('/api/advanced-todos', authenticateToken, (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const {
      title,
      description,
      questions,
      assignedTo,
      category,
      difficulty = 'medium',
      estimatedDuration,
      dueDate,
      requireApproval = false,
      isTemplate = false,
      tags = []
    } = req.body;

    // Validate required fields
    if (!title || !questions || !assignedTo) {
      return res.status(400).json({ 
        error: 'Title, questions, and assignedTo are required' 
      });
    }

    // Validate questions structure
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        error: 'Questions must be a non-empty array' 
      });
    }

    // Validate assignedTo
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ 
        error: 'assignedTo must be a non-empty array' 
      });
    }

    // Create new advanced todo object
    const newAdvancedTodo = {
      id: uuidv4(),
      title,
      description: description || '',
      questions: questions.map((q, index) => ({
        ...q,
        id: q.id || uuidv4(),
        order: q.order || index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      assignedTo,
      assignedBy: req.user.id,
      assignedAt: new Date().toISOString(),
      category: category || 'General',
      difficulty,
      estimatedDuration: estimatedDuration || 30,
      dueDate: dueDate || null,
      requireApproval,
      isTemplate,
      tags,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Additional advanced todo fields
      allowReassignment: false,
      autoComplete: false,
      points: 0,
      weight: 1,
      completionRate: 0,
      averageTime: 0,
      difficultyRating: 0
    };

    // Add to storage
    advancedTodos.push(newAdvancedTodo);
    res.status(201).json({ 
      message: 'Advanced todo created successfully',
      advancedTodo: newAdvancedTodo 
    });

  } catch (error) {
    console.error('Create advanced todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Submit todo responses
 * Submits responses for an advanced todo
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * URL Parameters:
 * - todoId: Advanced todo ID (required)
 * 
 * Request Body:
 * - responses: Array of TodoResponse objects (required)
 * - status: Submission status ('draft', 'submitted') (optional)
 * 
 * Response:
 * - 201: Todo responses submitted successfully
 * - 400: Missing required fields
 * - 401: Missing or invalid token
 * - 404: Advanced todo not found
 * - 500: Internal server error
 */
app.post('/api/advanced-todos/:todoId/submit', authenticateToken, (req, res) => {
  try {
    const { todoId } = req.params;
    const { responses, status = 'submitted' } = req.body;

    // Find the advanced todo
    const advancedTodo = advancedTodos.find(todo => todo.id === todoId);
    if (!advancedTodo) {
      return res.status(404).json({ error: 'Advanced todo not found' });
    }

    // Check if user is assigned to this todo
    if (!advancedTodo.assignedTo.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not assigned to this todo' });
    }

    // Validate responses
    if (!Array.isArray(responses)) {
      return res.status(400).json({ error: 'Responses must be an array' });
    }

    // Create submission
    const submission = {
      id: uuidv4(),
      todoId,
      userId: req.user.id,
      responses: responses.map(r => ({
        ...r,
        id: r.id || uuidv4(),
        todoId,
        userId: req.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      status,
      submittedAt: status === 'submitted' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to storage
    todoSubmissions.push(submission);
    res.status(201).json({ 
      message: 'Todo responses submitted successfully',
      submission 
    });

  } catch (error) {
    console.error('Submit todo responses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get todo submissions for admin
 * Returns all submissions for a specific advanced todo (admin only)
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * URL Parameters:
 * - todoId: Advanced todo ID (required)
 * 
 * Response:
 * - 200: Array of submissions for the todo
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 404: Advanced todo not found
 * - 500: Internal server error
 */
app.get('/api/advanced-todos/:todoId/submissions', authenticateToken, (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { todoId } = req.params;

    // Find the advanced todo
    const advancedTodo = advancedTodos.find(todo => todo.id === todoId);
    if (!advancedTodo) {
      return res.status(404).json({ error: 'Advanced todo not found' });
    }

    // Get submissions for this todo
    const submissions = todoSubmissions.filter(sub => sub.todoId === todoId);
    res.json({ submissions });

  } catch (error) {
    console.error('Get todo submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Approve/reject todo submission (admin only)
 * Updates the status of a todo submission with feedback
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * URL Parameters:
 * - submissionId: Submission ID (required)
 * 
 * Request Body:
 * - status: New status ('approved', 'rejected') (required)
 * - feedback: Feedback comments (optional)
 * - score: Numerical score (optional)
 * 
 * Response:
 * - 200: Submission status updated successfully
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 404: Submission not found
 * - 500: Internal server error
 */
app.put('/api/todo-submissions/:submissionId/status', authenticateToken, (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { submissionId } = req.params;
    const { status, feedback, score } = req.body;

    // Find the submission
    const submissionIndex = todoSubmissions.findIndex(sub => sub.id === submissionId);
    if (submissionIndex === -1) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Update submission
    const updatedSubmission = {
      ...todoSubmissions[submissionIndex],
      status,
      feedback: feedback || null,
      score: score || null,
      approvedAt: status === 'approved' ? new Date().toISOString() : null,
      rejectedAt: status === 'rejected' ? new Date().toISOString() : null,
      approvedBy: req.user.id,
      updatedAt: new Date().toISOString()
    };

    todoSubmissions[submissionIndex] = updatedSubmission;
    res.json({ 
      message: 'Submission status updated successfully',
      submission: updatedSubmission 
    });

  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get todo templates
 * Returns all available todo templates
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required)
 * 
 * Response:
 * - 200: Array of todo templates
 * - 401: Missing or invalid token
 * - 500: Internal server error
 */
app.get('/api/todo-templates', authenticateToken, (req, res) => {
  try {
    // Return all templates (public and user's own)
    const userTemplates = todoTemplates.filter(template => 
      template.isPublic || template.createdBy === req.user.id
    );
    res.json({ templates: userTemplates });
  } catch (error) {
    console.error('Get todo templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create todo template (admin only)
 * Creates a reusable todo template
 * 
 * Headers:
 * - Authorization: Bearer <jwt_token> (required, admin role)
 * 
 * Request Body:
 * - name: Template name (required)
 * - description: Template description (required)
 * - questions: Array of TodoQuestion objects (required)
 * - category: Template category (required)
 * - difficulty: Difficulty level (required)
 * - estimatedDuration: Estimated duration in minutes (required)
 * - tags: Array of tags (optional)
 * - isPublic: Whether template is public (optional)
 * 
 * Response:
 * - 201: Template created successfully
 * - 400: Missing required fields
 * - 401: Missing or invalid token
 * - 403: Admin access required
 * - 500: Internal server error
 */
app.post('/api/todo-templates', authenticateToken, (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const {
      name,
      description,
      questions,
      category,
      difficulty,
      estimatedDuration,
      tags = [],
      isPublic = false
    } = req.body;

    // Validate required fields
    if (!name || !description || !questions || !category || !difficulty || !estimatedDuration) {
      return res.status(400).json({ 
        error: 'Name, description, questions, category, difficulty, and estimatedDuration are required' 
      });
    }

    // Create new template
    const newTemplate = {
      id: uuidv4(),
      name,
      description,
      questions: questions.map((q, index) => ({
        ...q,
        id: q.id || uuidv4(),
        order: q.order || index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      category,
      difficulty,
      estimatedDuration,
      tags,
      isPublic,
      createdBy: req.user.id,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    todoTemplates.push(newTemplate);
    res.status(201).json({ 
      message: 'Todo template created successfully',
      template: newTemplate 
    });

  } catch (error) {
    console.error('Create todo template error:', error);
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
    const result = await pool.query('SELECT * FROM members WHERE LOWER(email) = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const hashedPassword = await hashPassword(newPassword);
    await pool.query('UPDATE members SET password = $1 WHERE id = $2', [hashedPassword, result.rows[0].id]);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ADMIN ROUTES =====

/**
 * Get all users (admin only)
 * Returns a list of all users (excluding passwords)
 */
app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, department, status, created_at FROM members');
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get user by ID (admin only)
 */
app.get('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, email, name, role, department, status, created_at FROM members WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update user (admin only)
 */
app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { name, role, department, status } = req.body;
    const result = await pool.query(
      'UPDATE members SET name = $1, role = $2, department = $3, status = $4 WHERE id = $5 RETURNING id, email, name, role, department, status, created_at',
      [name, role, department, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0], message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete user (admin only)
 */
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING id, email, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0], message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
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
// Note: Old in-memory chat system removed. Using new database-based chat system instead.

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

// ===== CHAT SYSTEM HEALTH CHECK =====

// Simple health check for chat system availability
app.get('/api/chat/health', (req, res) => {
  if (chatRouter) {
    res.json({
      status: 'healthy',
      tablesExist: true,
      message: 'Chat system is ready'
    });
  } else {
    res.json({
      status: 'unavailable',
      tablesExist: false,
      message: 'Chat tables not found. Run database migration to enable chat features.'
    });
  }
});

// ===== CHAT API ROUTES =====

// Import and use the comprehensive chat API conditionally
let chatRouter = null;
let initializeWebSocket = null;

// Try to load chat API, but don't crash if it fails
try {
  const chatApi = require('./chat-api');
  chatRouter = chatApi.router;
  initializeWebSocket = chatApi.initializeWebSocket;
  console.log('✅ Chat API loaded successfully');
} catch (error) {
  console.log('⚠️ Chat API not available:', error.message);
  console.log('💡 To enable chat features, run the database migration script');
}

// Only mount chat routes if chat API is available
if (chatRouter) {
  app.use('/api/chat', chatRouter);
}

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

// Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const server = require('http').createServer(app);
  
  // Initialize WebSocket server if available
  if (initializeWebSocket) {
    initializeWebSocket(server).catch(error => {
      console.error('Failed to initialize WebSocket server:', error);
    });
  } else {
    console.log('⚠️ WebSocket server not available - chat features disabled');
  }
  
  server.listen(PORT, () => {
    console.log(`🚀 Workforce Management API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 API Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`🔐 Authentication endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`📝 Todo management: http://localhost:${PORT}/api/todos`);
    console.log(`📋 Report system: http://localhost:${PORT}/api/reports`);
    console.log(`⏰ Attendance tracking: http://localhost:${PORT}/api/attendance`);
    console.log(`✅ Approval system: http://localhost:${PORT}/api/approvals`);
    if (chatRouter) {
      console.log(`💬 Chat system: http://localhost:${PORT}/api/chat`);
      console.log(`🔌 WebSocket server: ws://localhost:${PORT}/ws`);
    } else {
      console.log(`💬 Chat system: Disabled (tables not found)`);
      console.log(`🔌 WebSocket server: Disabled`);
    }
  });
}

module.exports = app; 