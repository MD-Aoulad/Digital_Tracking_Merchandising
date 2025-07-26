const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Increase server timeout
app.use((req, res, next) => {
  req.setTimeout(60000); // 60 seconds
  res.setTimeout(60000); // 60 seconds
  next();
});

// Database connection with optimized settings
const pool = new Pool({
  connectionString: process.env.AUTH_DB_URL || 'postgresql://auth_user:auth_password@auth-db:5432/auth_db',
  ssl: false, // Disable SSL for local development
  connectionTimeoutMillis: 30000, // 30 seconds
  idleTimeoutMillis: 60000, // 60 seconds
  max: 20, // Maximum number of clients
  min: 2,  // Minimum number of clients
  // Connection pool settings
  acquireTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  // Query timeout
  statement_timeout: 30000,
  query_timeout: 30000
});

// Database connection status
let dbConnected = false;

// Test database connection
pool.on('connect', (client) => {
  console.log('New client connected to auth database');
  dbConnected = true;
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  dbConnected = false;
});

// Test database connection on startup
const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Database URL:', process.env.AUTH_DB_URL || 'postgresql://auth_user:auth_password@auth-db:5432/auth_db');
    
    const client = await pool.connect();
    console.log('✅ Database client connected successfully');
    
    // Test basic query
    const result = await client.query('SELECT 1 as test, version() as version, current_database() as database, current_user as user');
    console.log('✅ Database query successful:', {
      test: result.rows[0].test,
      database: result.rows[0].database,
      user: result.rows[0].user,
      version: result.rows[0].version.split(' ')[0] // Just the version number
    });
    
    // Test auth_users table
    try {
      const tableResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'auth_users'
      `);
      
      if (tableResult.rows[0].count > 0) {
        console.log('✅ auth_users table exists');
        
        // Check if admin user exists
        const adminResult = await client.query(`
          SELECT COUNT(*) as count 
          FROM auth_users 
          WHERE email = 'admin@company.com'
        `);
        console.log(`📊 Admin user count: ${adminResult.rows[0].count}`);
      } else {
        console.log('⚠️ auth_users table does not exist');
      }
    } catch (tableError) {
      console.log('⚠️ Could not check auth_users table:', tableError.message);
    }
    
    client.release();
    dbConnected = true;
    console.log('✅ Database connection test completed successfully');
    return true;
  } catch (error) {
    dbConnected = false;
    console.error('❌ Database connection test failed:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    // Provide specific error guidance
    if (error.code === 'ECONNREFUSED') {
      console.error('🔧 Suggestion: Check if PostgreSQL container is running');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔧 Suggestion: Check if auth-db hostname is resolvable');
    } else if (error.code === '28P01') {
      console.error('🔧 Suggestion: Check database username/password');
    } else if (error.code === '3D000') {
      console.error('🔧 Suggestion: Check if auth_db database exists');
    }
    
    return false;
  }
};

// Database connection retry mechanism
const retryDatabaseConnection = async (maxRetries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting database connection (attempt ${attempt}/${maxRetries})...`);
      await testDatabaseConnection();
      
      if (dbConnected) {
        console.log('✅ Database connection established successfully');
        return true;
      }
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed:`, error.message);
    }
    
    if (attempt < maxRetries) {
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  console.error('❌ All database connection attempts failed');
  return false;
};

// Test connection on startup with retry
retryDatabaseConnection();

// Periodic database health check
setInterval(async () => {
  if (!dbConnected) {
    console.log('🔄 Periodic health check: Database disconnected, attempting reconnection...');
    await retryDatabaseConnection(1, 1000); // Single retry with 1s delay
  } else {
    // Quick health check
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
    } catch (error) {
      console.error('Periodic health check failed:', error.message);
      dbConnected = false;
    }
  }
}, 30000); // Check every 30 seconds

// Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Role']
}));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Error handling for request abortions and client disconnections
app.use((err, req, res, next) => {
  // Handle request abortions and client disconnections
  if (err.code === 'ECONNRESET' || err.message === 'request aborted' || err.code === 'ECONNABORTED') {
    console.log('Request aborted by client or connection reset');
    // Don't send response if headers already sent
    if (!res.headersSent) {
      return res.status(499).end(); // Client closed request
    }
    return;
  }
  
  // Handle other errors
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }
});

// Body parsing with error handling and request abortion detection
app.use(express.json({ 
  limit: '10mb'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));

// Request abortion detection middleware
app.use((req, res, next) => {
  // Detect if client disconnected
  req.on('aborted', () => {
    console.log('Request aborted by client');
  });
  
  req.on('close', () => {
    console.log('Request closed by client');
  });
  
  // Add timeout to prevent hanging requests
  req.setTimeout(25000, () => {
    console.log('Request timeout');
    if (!res.headersSent) {
      res.status(408).json({
        error: 'Request timeout',
        message: 'Request took too long to process',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  next();
});

// Health check with database connection test
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;
  
  try {
    // Test database connection
    const client = await pool.connect();
    await client.query('SELECT 1 as test');
    client.release();
    dbStatus = 'connected';
    dbConnected = true;
  } catch (error) {
    dbStatus = 'disconnected';
    dbError = error.message;
    dbConnected = false;
    console.error('Health check database error:', error.message);
  }
  
  res.json({
    status: 'OK',
    service: 'Auth Service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      error: dbError,
      pool: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      }
    }
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Auth service is working',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Test POST endpoint
app.post('/test', (req, res) => {
  res.json({
    message: 'POST request received',
    body: req.body,
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Simple login test endpoint (no database required)
app.post('/test-login', (req, res) => {
  const { email, password } = req.body;
  
  res.json({
    message: 'Login test endpoint reached',
    received: { email, password: password ? '***' : undefined },
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    service: 'Auth Service Test'
  });
});

// API Documentation
app.get('/docs', (req, res) => {
  res.json({
    name: 'Auth Microservice',
    version: '1.0.0',
    description: 'Authentication and authorization for Workforce Management',
    endpoints: {
      'GET /health': 'Service health check',
      'POST /login': 'User login',
      'POST /register': 'User registration',
      'POST /logout': 'User logout',
      'GET /profile': 'Get user profile',
      'PUT /profile': 'Update user profile',
      'POST /admin/setup': 'Setup admin user (development only)'
    }
  });
});

// Helper function to hash passwords
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Helper function to compare passwords
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: 'admin', // Default role for now
      permissions: ['*'] // All permissions for admin
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Setup admin user (development only)
app.post('/admin/setup', async (req, res) => {
  try {
    // Check if admin already exists
    const adminCheck = await pool.query(
      'SELECT id FROM auth_users WHERE email = $1',
      ['admin@company.com']
    );

    if (adminCheck.rows.length > 0) {
      return res.json({ 
        message: 'Admin user already exists',
        email: 'admin@company.com',
        password: 'password'
      });
    }

    // Create admin user with salt
    const hashedPassword = await hashPassword('password');
    const salt = Math.random().toString(36).substring(2, 15);
    const adminUser = await pool.query(
      `INSERT INTO auth_users (
        email, 
        password_hash, 
        salt, 
        is_active, 
        is_verified, 
        email_verified_at
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email`,
      [
        'admin@company.com',
        hashedPassword,
        salt,
        true,
        true,
        new Date()
      ]
    );

    res.json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser.rows[0].id,
        email: adminUser.rows[0].email,
        role: 'admin'
      },
      credentials: {
        email: 'admin@company.com',
        password: 'password'
      }
    });
  } catch (error) {
    console.error('Error setting up admin:', error);
    res.status(500).json({ 
      error: 'Failed to setup admin user',
      details: error.message 
    });
  }
});

// Complete Authentication System API Endpoints

// 1. LOGIN ENDPOINT (Enhanced)
app.post('/login', async (req, res) => {
  const startTime = Date.now();
  
  // Set response timeout
  res.setTimeout(20000, () => {
    if (!res.headersSent) {
      console.log('Login response timeout');
      res.status(408).json({
        error: 'Request timeout',
        message: 'Login request took too long to process',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    console.log(`Login attempt for email: ${email}`);

    // Validate database connection first
    if (!dbConnected) {
      console.error('Database not connected, attempting reconnection...');
      try {
        await testDatabaseConnection();
      } catch (dbError) {
        console.error('Database reconnection failed:', dbError);
        return res.status(503).json({
          error: 'Database service unavailable',
          details: 'Unable to connect to authentication database',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Use a client from the pool for transaction with timeout
    const client = await pool.connect();
    
    try {
      // Set query timeout
      await client.query('SET statement_timeout = 15000'); // 15 seconds
      
      // Start transaction
      await client.query('BEGIN');

      // Find user by email with optimized query
      const userResult = await client.query(
        'SELECT id, email, password_hash, locked_until, failed_login_attempts, is_active, is_verified FROM auth_users WHERE email = $1 LIMIT 1',
        [email]
      );

      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK');
        console.log(`Login failed: User not found for email: ${email}`);
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      const user = userResult.rows[0];

      // Check if account is active
      if (!user.is_active) {
        await client.query('ROLLBACK');
        console.log(`Login failed: Account inactive for email: ${email}`);
        return res.status(423).json({ 
          error: 'Account is deactivated. Please contact administrator.' 
        });
      }

      // Check if account is locked
      if (user.locked_until && user.locked_until > new Date()) {
        await client.query('ROLLBACK');
        console.log(`Login failed: Account locked for email: ${email}`);
        return res.status(423).json({ 
          error: 'Account is locked. Please contact administrator.' 
        });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        // Increment failed login attempts
        await client.query(
          'UPDATE auth_users SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1 WHERE id = $1',
          [user.id]
        );
        
        // Lock account after 5 failed attempts
        const failedAttempts = (user.failed_login_attempts || 0) + 1;
        if (failedAttempts >= 5) {
          await client.query(
            'UPDATE auth_users SET locked_until = NOW() + INTERVAL \'30 minutes\' WHERE id = $1',
            [user.id]
          );
        }
        
        await client.query('COMMIT');
        console.log(`Login failed: Invalid password for email: ${email}`);
        return res.status(401).json({ 
          error: 'Invalid credentials',
          remainingAttempts: Math.max(0, 5 - failedAttempts)
        });
      }

      // Reset failed login attempts and update last login
      await client.query(
        'UPDATE auth_users SET failed_login_attempts = 0, last_login_at = NOW() WHERE id = $1',
        [user.id]
      );

      // Generate JWT token
      const token = generateToken(user);

      // Create session (store token hash instead of full token)
      const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
      await client.query(
        'INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, tokenHash, new Date(Date.now() + 24 * 60 * 60 * 1000)] // 24 hours
      );

      // Commit transaction
      await client.query('COMMIT');

      const responseTime = Date.now() - startTime;
      console.log(`Login successful for email: ${email} - Response time: ${responseTime}ms`);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          permissions: ['*'],
          isVerified: user.is_verified
        },
        token: token,
        expiresIn: '24h',
        responseTime: responseTime
      });

    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Login error for email: ${req.body.email} - Response time: ${responseTime}ms:`, error);
    
    // Check if response was already sent
    if (res.headersSent) {
      return;
    }
    
    // Handle database-specific errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Database service unavailable',
        details: 'Unable to connect to authentication database',
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle query timeout
    if (error.code === '57014') { // PostgreSQL statement timeout
      return res.status(408).json({
        error: 'Database query timeout',
        details: 'Login request took too long to process',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message,
      responseTime: responseTime
    });
  }
});

// 2. REGISTER ENDPOINT (Enhanced)
app.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'user' } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, password, firstName, and lastName are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM auth_users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password and create salt
    const hashedPassword = await hashPassword(password);
    const salt = Math.random().toString(36).substring(2, 15);

    // Create user
    const newUser = await pool.query(
      `INSERT INTO auth_users (
        email, 
        password_hash, 
        salt, 
        is_active, 
        is_verified,
        first_name,
        last_name,
        role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, first_name, last_name, role`,
      [email, hashedPassword, salt, true, false, firstName, lastName, role]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        firstName: newUser.rows[0].first_name,
        lastName: newUser.rows[0].last_name,
        role: newUser.rows[0].role,
        isVerified: false
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

// 3. LOGOUT ENDPOINT (Enhanced)
app.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      // Invalidate session
      const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
      await pool.query(
        'UPDATE auth_sessions SET is_revoked = true, revoked_at = NOW() WHERE token_hash = $1',
        [tokenHash]
      );
    }

    res.json({ 
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      details: error.message 
    });
  }
});

// 4. GET PROFILE ENDPOINT (Enhanced)
app.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user profile with enhanced information
    const userResult = await pool.query(
      `SELECT 
        id, 
        email, 
        first_name,
        last_name,
        role,
        is_active,
        is_verified,
        email_verified_at,
        created_at,
        updated_at,
        last_login_at
      FROM auth_users WHERE id = $1`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name || 'Admin',
        lastName: user.last_name || 'User',
        role: user.role || 'admin',
        permissions: ['*'],
        isActive: user.is_active,
        isVerified: user.is_verified,
        emailVerifiedAt: user.email_verified_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ 
      error: 'Failed to get profile',
      details: error.message 
    });
  }
});

// 5. UPDATE PROFILE ENDPOINT (Enhanced)
app.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { firstName, lastName, email } = req.body;

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Invalid email format' 
        });
      }

      // Check if email is already taken
      const existingUser = await pool.query(
        'SELECT id FROM auth_users WHERE email = $1 AND id != $2',
        [email, decoded.id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ 
          error: 'Email is already taken' 
        });
      }
    }

    // Update user profile
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (firstName) {
      updateFields.push(`first_name = $${paramCount++}`);
      updateValues.push(firstName);
    }

    if (lastName) {
      updateFields.push(`last_name = $${paramCount++}`);
      updateValues.push(lastName);
    }

    if (email) {
      updateFields.push(`email = $${paramCount++}`);
      updateValues.push(email);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'No fields to update' 
      });
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(decoded.id);

    const updatedUser = await pool.query(
      `UPDATE auth_users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, email, first_name, last_name, role`,
      updateValues
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = updatedUser.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    });
  }
});

// 6. CHANGE PASSWORD ENDPOINT
app.post('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters long' 
      });
    }

    // Get current user
    const userResult = await pool.query(
      'SELECT password_hash FROM auth_users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await pool.query(
      'UPDATE auth_users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedNewPassword, decoded.id]
    );

    res.json({
      message: 'Password changed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Change password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ 
      error: 'Failed to change password',
      details: error.message 
    });
  }
});

// 7. FORGOT PASSWORD ENDPOINT
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email FROM auth_users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if user exists or not for security
      return res.json({
        message: 'If the email exists, a password reset link has been sent',
        timestamp: new Date().toISOString()
      });
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenHash = require('crypto').createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await pool.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetTokenHash, expiresAt]
    );

    // In production, send email here
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      message: 'If the email exists, a password reset link has been sent',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Failed to process password reset request',
      details: error.message 
    });
  }
});

// 8. RESET PASSWORD ENDPOINT
app.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Token and new password are required' 
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters long' 
      });
    }

    const resetTokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const resetResult = await pool.query(
      'SELECT user_id, expires_at FROM password_resets WHERE token_hash = $1 AND is_used = false AND expires_at > NOW()',
      [resetTokenHash]
    );

    if (resetResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    const reset = resetResult.rows[0];

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password and mark token as used
    await pool.query('BEGIN');

    await pool.query(
      'UPDATE auth_users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedNewPassword, reset.user_id]
    );

    await pool.query(
      'UPDATE password_resets SET is_used = true, used_at = NOW() WHERE token_hash = $1',
      [resetTokenHash]
    );

    await pool.query('COMMIT');

    res.json({
      message: 'Password reset successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password',
      details: error.message 
    });
  }
});

// 9. VERIFY EMAIL ENDPOINT
app.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Verification token is required' 
      });
    }

    // Find valid verification token
    const verificationResult = await pool.query(
      'SELECT user_id FROM email_verifications WHERE token_hash = $1 AND is_used = false AND expires_at > NOW()',
      [token]
    );

    if (verificationResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification token' 
      });
    }

    const verification = verificationResult.rows[0];

    // Mark email as verified
    await pool.query('BEGIN');

    await pool.query(
      'UPDATE auth_users SET is_verified = true, email_verified_at = NOW() WHERE id = $1',
      [verification.user_id]
    );

    await pool.query(
      'UPDATE email_verifications SET is_used = true, used_at = NOW() WHERE token_hash = $1',
      [token]
    );

    await pool.query('COMMIT');

    res.json({
      message: 'Email verified successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify email',
      details: error.message 
    });
  }
});

// 10. REFRESH TOKEN ENDPOINT
app.post('/refresh-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify current token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session is still valid
    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
    const sessionResult = await pool.query(
      'SELECT user_id FROM auth_sessions WHERE token_hash = $1 AND is_revoked = false AND expires_at > NOW()',
      [tokenHash]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Get user information
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM auth_users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Generate new token
    const newToken = generateToken(user);
    const newTokenHash = require('crypto').createHash('sha256').update(newToken).digest('hex');

    // Update session
    await pool.query(
      'UPDATE auth_sessions SET token_hash = $1, expires_at = $2 WHERE token_hash = $3',
      [newTokenHash, new Date(Date.now() + 24 * 60 * 60 * 1000), tokenHash]
    );

    res.json({
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        permissions: ['*']
      },
      token: newToken,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ 
      error: 'Failed to refresh token',
      details: error.message 
    });
  }
});

// Database status endpoint
app.get('/db-status', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;
  let dbInfo = null;
  let poolInfo = null;
  
  try {
    // Test database connection
    const client = await pool.connect();
    
    // Get database information
    const dbResult = await client.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version,
        pg_backend_pid() as pid
    `);
    
    // Get pool information
    poolInfo = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    };
    
    // Test auth_users table
    let tableExists = false;
    let adminUserCount = 0;
    
    try {
      const tableResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'auth_users'
      `);
      
      tableExists = tableResult.rows[0].count > 0;
      
      if (tableExists) {
        const adminResult = await client.query(`
          SELECT COUNT(*) as count 
          FROM auth_users 
          WHERE email = 'admin@company.com'
        `);
        adminUserCount = parseInt(adminResult.rows[0].count);
      }
    } catch (tableError) {
      console.log('Could not check auth_users table:', tableError.message);
    }
    
    client.release();
    
    dbStatus = 'connected';
    dbConnected = true;
    dbInfo = {
      ...dbResult.rows[0],
      tableExists,
      adminUserCount
    };
    
  } catch (error) {
    dbStatus = 'disconnected';
    dbError = {
      message: error.message,
      code: error.code,
      detail: error.detail
    };
    dbConnected = false;
    console.error('Database status check failed:', error.message);
  }
  
  res.json({
    status: 'OK',
    service: 'Auth Service Database Status',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      error: dbError,
      info: dbInfo,
      pool: poolInfo
    },
    connectionString: process.env.AUTH_DB_URL ? '***' : 'postgresql://auth_user:auth_password@auth-db:5432/auth_db'
  });
});

// Simple database test endpoint
app.get('/db-test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as test, current_database() as db');
    client.release();
    
    res.json({
      message: 'Database connection test successful',
      test: result.rows[0].test,
      database: result.rows[0].db,
      timestamp: new Date().toISOString(),
      connected: true
    });
  } catch (error) {
    res.status(503).json({
      message: 'Database connection test failed',
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      connected: false
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Auth Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/docs`);
  console.log(`🔑 Admin setup: POST http://localhost:${PORT}/admin/setup`);
}); 