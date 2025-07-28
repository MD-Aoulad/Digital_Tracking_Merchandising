const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3010;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

// =============================================
// LOGGING CONFIGURATION
// =============================================

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'iam-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// =============================================
// MIDDLEWARE CONFIGURATION
// =============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Role', 'X-Request-ID']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Compression
app.use(compression());

// Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================
// DATABASE CONFIGURATION
// =============================================

const pool = new Pool({
  connectionString: process.env.IAM_DB_URL || 'postgresql://iam_user:iam_password@iam-db:5432/iam_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000,
  max: 20,
  min: 2,
  acquireTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  statement_timeout: 30000,
  query_timeout: 30000
});

// Database connection status
let dbConnected = false;

pool.on('connect', (client) => {
  logger.info('New client connected to IAM database');
  dbConnected = true;
});

pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  dbConnected = false;
});

// =============================================
// UTILITY FUNCTIONS
// =============================================

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user, expiresIn = '1h') => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles || [],
      permissions: user.permissions || []
    },
    JWT_SECRET,
    { expiresIn }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// =============================================
// AUTHENTICATION MIDDLEWARE
// =============================================

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  try {
    const user = await getUserById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

const requirePermission = (resource, action) => {
  return (req, res, next) => {
    const user = req.user;
    const permission = `${resource}:${action}`;
    
    if (!user.permissions || !user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        user_permissions: user.permissions || []
      });
    }
    
    next();
  };
};

const requireRole = (role) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user.roles || !user.roles.includes(role)) {
      return res.status(403).json({ 
        error: 'Insufficient role',
        required: role,
        user_roles: user.roles || []
      });
    }
    
    next();
  };
};

// =============================================
// DATABASE OPERATIONS
// =============================================

const getUserById = async (userId) => {
  const query = `
    SELECT 
      u.id, u.email, u.username, u.first_name, u.last_name, u.phone,
      u.avatar_url, u.is_active, u.is_verified, u.is_locked,
      u.mfa_enabled, u.created_at, u.updated_at,
      ARRAY_AGG(DISTINCT r.name) as roles,
      ARRAY_AGG(DISTINCT p.name) as permissions
    FROM iam_users u
    LEFT JOIN iam_user_roles ur ON u.id = ur.user_id
    LEFT JOIN iam_roles r ON ur.role_id = r.id
    LEFT JOIN iam_role_permissions rp ON r.id = rp.role_id
    LEFT JOIN iam_permissions p ON rp.permission_id = p.id
    WHERE u.id = $1 AND u.deleted_at IS NULL
    GROUP BY u.id
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const query = `
    SELECT 
      u.id, u.email, u.username, u.password_hash, u.salt,
      u.first_name, u.last_name, u.phone, u.avatar_url,
      u.is_active, u.is_verified, u.is_locked, u.mfa_enabled,
      u.failed_login_attempts, u.last_login_at, u.created_at,
      ARRAY_AGG(DISTINCT r.name) as roles,
      ARRAY_AGG(DISTINCT p.name) as permissions
    FROM iam_users u
    LEFT JOIN iam_user_roles ur ON u.id = ur.user_id
    LEFT JOIN iam_roles r ON ur.role_id = r.id
    LEFT JOIN iam_role_permissions rp ON r.id = rp.role_id
    LEFT JOIN iam_permissions p ON rp.permission_id = p.id
    WHERE u.email = $1 AND u.deleted_at IS NULL
    GROUP BY u.id
  `;
  
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const createUser = async (userData) => {
  const { email, username, password, firstName, lastName, phone, role = 'employee' } = userData;
  
  const hashedPassword = await hashPassword(password);
  const salt = hashedPassword.split('$')[2];
  
  const query = `
    INSERT INTO iam_users (email, username, password_hash, salt, first_name, last_name, phone)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, email, username, first_name, last_name, role
  `;
  
  const result = await pool.query(query, [email, username, hashedPassword, salt, firstName, lastName, phone]);
  return result.rows[0];
};

const updateUserLoginAttempts = async (userId, success) => {
  if (success) {
    await pool.query(`
      UPDATE iam_users 
      SET failed_login_attempts = 0, last_login_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userId]);
  } else {
    await pool.query(`
      UPDATE iam_users 
      SET failed_login_attempts = failed_login_attempts + 1
      WHERE id = $1
    `, [userId]);
  }
};

const logLoginAttempt = async (email, ipAddress, userAgent, success, failureReason = null) => {
  await pool.query(`
    INSERT INTO iam_login_attempts (email, ip_address, user_agent, success, failure_reason)
    VALUES ($1, $2, $3, $4, $5)
  `, [email, ipAddress, userAgent, success, failureReason]);
};

const auditLog = async (userId, action, resourceType, resourceId, oldValues, newValues, ipAddress, userAgent) => {
  await pool.query(`
    INSERT INTO iam_audit_log (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [userId, action, resourceType, resourceId, oldValues, newValues, ipAddress, userAgent]);
};

// =============================================
// ROUTES
// =============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'iam-service',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Authentication routes
app.post('/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
  body('mfaCode').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, mfaCode } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      await logLoginAttempt(email, ipAddress, userAgent, false, 'User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.is_locked) {
      await logLoginAttempt(email, ipAddress, userAgent, false, 'Account locked');
      return res.status(423).json({ error: 'Account is locked' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      await updateUserLoginAttempts(user.id, false);
      await logLoginAttempt(email, ipAddress, userAgent, false, 'Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check MFA if enabled
    if (user.mfa_enabled) {
      if (!mfaCode) {
        return res.status(400).json({ error: 'MFA code required' });
      }
      
      const isValidMFA = speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: 'base32',
        token: mfaCode,
        window: 2
      });
      
      if (!isValidMFA) {
        await logLoginAttempt(email, ipAddress, userAgent, false, 'Invalid MFA code');
        return res.status(401).json({ error: 'Invalid MFA code' });
      }
    }

    // Update login attempts and create session
    await updateUserLoginAttempts(user.id, true);
    await logLoginAttempt(email, ipAddress, userAgent, true);

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create session
    await pool.query(`
      INSERT INTO iam_sessions (user_id, session_token, refresh_token, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [user.id, accessToken, refreshToken, ipAddress, userAgent, moment().add(1, 'hour').toDate()]);

    // Audit log
    await auditLog(user.id, 'login', 'session', null, null, { ip_address: ipAddress }, ipAddress, userAgent);

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.roles || [],
        permissions: user.permissions || []
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refresh_token);
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Verify session exists
    const sessionResult = await pool.query(`
      SELECT * FROM iam_sessions 
      WHERE refresh_token = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP
    `, [refresh_token]);

    if (sessionResult.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid or expired session' });
    }

    const user = await getUserById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    // Generate new tokens
    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update session
    await pool.query(`
      UPDATE iam_sessions 
      SET session_token = $1, refresh_token = $2, last_activity_at = CURRENT_TIMESTAMP
      WHERE refresh_token = $3
    `, [newAccessToken, newRefreshToken, refresh_token]);

    res.json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

app.post('/auth/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    // Invalidate session
    await pool.query(`
      UPDATE iam_sessions 
      SET is_active = false 
      WHERE session_token = $1
    `, [token]);

    // Audit log
    await auditLog(req.user.id, 'logout', 'session', null, null, null, req.ip, req.get('User-Agent'));

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// User management routes
app.get('/users', authenticateToken, requirePermission('user', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id, u.email, u.username, u.first_name, u.last_name, u.phone,
        u.avatar_url, u.is_active, u.is_verified, u.is_locked,
        u.mfa_enabled, u.created_at, u.updated_at,
        ARRAY_AGG(DISTINCT r.name) as roles
      FROM iam_users u
      LEFT JOIN iam_user_roles ur ON u.id = ur.user_id
      LEFT JOIN iam_roles r ON ur.role_id = r.id
      WHERE u.deleted_at IS NULL
    `;

    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (u.email ILIKE $${paramCount} OR u.username ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      query += ` AND r.name = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (status) {
      query += ` AND u.is_active = $${paramCount}`;
      params.push(status === 'active');
      paramCount++;
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.post('/users', authenticateToken, requirePermission('user', 'create'), [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 50 }),
  body('password').isLength({ min: 8 }),
  body('firstName').isLength({ min: 1, max: 100 }),
  body('lastName').isLength({ min: 1, max: 100 }),
  body('phone').optional().isMobilePhone(),
  body('role').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const newUser = await createUser(userData);
    
    // Assign role if specified
    if (userData.role) {
      await pool.query(`
        INSERT INTO iam_user_roles (user_id, role_id, assigned_by)
        SELECT $1, r.id, $2
        FROM iam_roles r
        WHERE r.name = $3
      `, [newUser.id, req.user.id, userData.role]);
    }

    // Audit log
    await auditLog(req.user.id, 'create', 'user', newUser.id, null, newUser, req.ip, req.get('User-Agent'));

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });

  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Role management routes
app.get('/roles', authenticateToken, requirePermission('role', 'read'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id, r.name, r.display_name, r.description, r.is_system_role,
        r.is_active, r.priority, r.created_at,
        COUNT(DISTINCT ur.user_id) as user_count,
        COUNT(DISTINCT rp.permission_id) as permission_count
      FROM iam_roles r
      LEFT JOIN iam_user_roles ur ON r.id = ur.role_id
      LEFT JOIN iam_role_permissions rp ON r.id = rp.role_id
      WHERE r.deleted_at IS NULL
      GROUP BY r.id
      ORDER BY r.priority DESC, r.name
    `);

    res.json({ roles: result.rows });
  } catch (error) {
    logger.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to get roles' });
  }
});

// Permission management routes
app.get('/permissions', authenticateToken, requirePermission('permission', 'read'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, p.name, p.display_name, p.description, p.resource, p.action,
        p.is_system_permission, p.is_active, p.created_at,
        COUNT(DISTINCT rp.role_id) as role_count
      FROM iam_permissions p
      LEFT JOIN iam_role_permissions rp ON p.id = rp.permission_id
      WHERE p.deleted_at IS NULL
      GROUP BY p.id
      ORDER BY p.resource, p.action
    `);

    res.json({ permissions: result.rows });
  } catch (error) {
    logger.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to get permissions' });
  }
});

// Audit log routes
app.get('/audit', authenticateToken, requirePermission('system', 'audit'), async (req, res) => {
  try {
    const { page = 1, limit = 50, user_id, action, resource_type, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        al.id, al.action, al.resource_type, al.resource_id,
        al.old_values, al.new_values, al.ip_address, al.user_agent,
        al.created_at,
        u.email as user_email, u.username as user_username
      FROM iam_audit_log al
      LEFT JOIN iam_users u ON al.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (user_id) {
      query += ` AND al.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    if (action) {
      query += ` AND al.action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }

    if (resource_type) {
      query += ` AND al.resource_type = $${paramCount}`;
      params.push(resource_type);
      paramCount++;
    }

    if (start_date) {
      query += ` AND al.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND al.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({
      audit_logs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });

  } catch (error) {
    logger.error('Get audit log error:', error);
    res.status(500).json({ error: 'Failed to get audit log' });
  }
});

// =============================================
// START SERVER
// =============================================

const startServer = async () => {
  try {
    // Test database connection
    const client = await pool.connect();
    logger.info('✅ IAM Service database connected successfully');
    client.release();

    app.listen(PORT, () => {
      logger.info(`🚀 IAM Service running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start IAM Service:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
}); 