const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Database connection
const pool = new Pool({
  connectionString: process.env.USER_DB_URL || 'postgresql://user_user:user_password@user-db:5432/user_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  min: 2,
  idleTimeoutMillis: 60000
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Role']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// JWT verification middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Health check
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1 as test');
    client.release();
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
    dbError = error.message;
  }
  
  res.json({
    status: 'OK',
    service: 'User Management',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      error: dbError
    }
  });
});

// API Documentation
app.get('/docs', (req, res) => {
  res.json({
    name: 'User Management Service',
    version: '1.0.0',
    description: 'Complete user management for Workforce Management Platform',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /users': 'Get all users (Admin only)',
      'GET /users/:id': 'Get user by ID',
      'POST /users': 'Create new user (Admin only)',
      'PUT /users/:id': 'Update user (Admin or self)',
      'DELETE /users/:id': 'Delete user (Admin only)',
      'GET /users/:id/profile': 'Get user profile',
      'PUT /users/:id/profile': 'Update user profile',
      'GET /users/search': 'Search users',
      'POST /users/:id/activate': 'Activate user (Admin only)',
      'POST /users/:id/deactivate': 'Deactivate user (Admin only)',
      'GET /users/stats': 'User statistics (Admin only)'
    }
  });
});

// Complete User Management API Endpoints

// 1. GET ALL USERS (Admin only)
app.get('/users', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isActive, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
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
      FROM users 
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Add filters
    if (role) {
      query += ` AND role = $${paramCount++}`;
      queryParams.push(role);
    }
    
    if (isActive !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      queryParams.push(isActive === 'true');
    }
    
    if (search) {
      query += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    paramCount = 1;
    
    if (role) {
      countQuery += ` AND role = $${paramCount++}`;
      countParams.push(role);
    }
    
    if (isActive !== undefined) {
      countQuery += ` AND is_active = $${paramCount++}`;
      countParams.push(isActive === 'true');
    }
    
    if (search) {
      countQuery += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      details: error.message 
    });
  }
});

// 2. GET USER BY ID
app.get('/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can access this profile (admin or self)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const result = await pool.query(
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
      FROM users WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user',
      details: error.message 
    });
  }
});

// 3. CREATE NEW USER (Admin only)
app.post('/users', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { email, firstName, lastName, role = 'user', password } = req.body;
    
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ 
        error: 'Email, firstName, lastName, and password are required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const result = await pool.query(
      `INSERT INTO users (
        email, 
        first_name, 
        last_name, 
        role, 
        password_hash,
        is_active,
        is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, first_name, last_name, role`,
      [email, firstName, lastName, role, hashedPassword, true, false]
    );
    
    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error.message 
    });
  }
});

// 4. UPDATE USER
app.put('/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role, isActive } = req.body;
    
    // Check if user can update this profile (admin or self)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Only admins can change role and active status
    if (req.user.role !== 'admin') {
      if (role !== undefined || isActive !== undefined) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }
    
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
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ 
          error: 'Email is already taken' 
        });
      }
    }
    
    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;
    
    if (email) {
      updateFields.push(`email = $${paramCount++}`);
      updateValues.push(email);
    }
    
    if (firstName) {
      updateFields.push(`first_name = $${paramCount++}`);
      updateValues.push(firstName);
    }
    
    if (lastName) {
      updateFields.push(`last_name = $${paramCount++}`);
      updateValues.push(lastName);
    }
    
    if (role && req.user.role === 'admin') {
      updateFields.push(`role = $${paramCount++}`);
      updateValues.push(role);
    }
    
    if (isActive !== undefined && req.user.role === 'admin') {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(isActive);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'No fields to update' 
      });
    }
    
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);
    
    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, email, first_name, last_name, role, is_active`,
      updateValues
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      details: error.message 
    });
  }
});

// 5. DELETE USER (Admin only)
app.delete('/users/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Soft delete (mark as inactive instead of hard delete)
    await pool.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );
    
    res.json({
      message: 'User deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error.message 
    });
  }
});

// 6. GET USER PROFILE
app.get('/users/:id/profile', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can access this profile (admin or self)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const result = await pool.query(
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
      FROM users WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Get additional profile information
    const profileResult = await pool.query(
      `SELECT 
        phone,
        address,
        city,
        state,
        country,
        postal_code,
        date_of_birth,
        gender,
        avatar_url,
        bio
      FROM user_profiles WHERE user_id = $1`,
      [id]
    );
    
    const profile = profileResult.rows[0] || {};
    
    res.json({
      user: {
        ...user,
        profile
      }
    });
    
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get user profile',
      details: error.message 
    });
  }
});

// 7. UPDATE USER PROFILE
app.put('/users/:id/profile', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, address, city, state, country, postalCode, dateOfBirth, gender, bio } = req.body;
    
    // Check if user can update this profile (admin or self)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if profile exists
    const profileResult = await pool.query(
      'SELECT user_id FROM user_profiles WHERE user_id = $1',
      [id]
    );
    
    if (profileResult.rows.length === 0) {
      // Create new profile
      await pool.query(
        `INSERT INTO user_profiles (
          user_id, 
          phone, 
          address, 
          city, 
          state, 
          country, 
          postal_code, 
          date_of_birth, 
          gender, 
          bio
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, phone, address, city, state, country, postalCode, dateOfBirth, gender, bio]
      );
    } else {
      // Update existing profile
      await pool.query(
        `UPDATE user_profiles SET 
          phone = $1, 
          address = $2, 
          city = $3, 
          state = $4, 
          country = $5, 
          postal_code = $6, 
          date_of_birth = $7, 
          gender = $8, 
          bio = $9,
          updated_at = NOW()
        WHERE user_id = $10`,
        [phone, address, city, state, country, postalCode, dateOfBirth, gender, bio, id]
      );
    }
    
    res.json({
      message: 'User profile updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update user profile',
      details: error.message 
    });
  }
});

// 8. SEARCH USERS
app.get('/users/search', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { q, role, isActive, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    let query = `
      SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        is_active
      FROM users 
      WHERE (email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
    `;
    
    const queryParams = [`%${q}%`];
    let paramCount = 2;
    
    if (role) {
      query += ` AND role = $${paramCount++}`;
      queryParams.push(role);
    }
    
    if (isActive !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      queryParams.push(isActive === 'true');
    }
    
    query += ` ORDER BY first_name, last_name LIMIT $${paramCount++}`;
    queryParams.push(parseInt(limit));
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      users: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      error: 'Failed to search users',
      details: error.message 
    });
  }
});

// 9. ACTIVATE USER (Admin only)
app.post('/users/:id/activate', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING id, email, is_active',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User activated successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ 
      error: 'Failed to activate user',
      details: error.message 
    });
  }
});

// 10. DEACTIVATE USER (Admin only)
app.post('/users/:id/deactivate', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, email, is_active',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User deactivated successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ 
      error: 'Failed to deactivate user',
      details: error.message 
    });
  }
});

// 11. USER STATISTICS (Admin only)
app.get('/users/stats', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    // Get total users
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM users');
    const total = parseInt(totalResult.rows[0].total);
    
    // Get active users
    const activeResult = await pool.query('SELECT COUNT(*) as active FROM users WHERE is_active = true');
    const active = parseInt(activeResult.rows[0].active);
    
    // Get users by role
    const roleResult = await pool.query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    
    // Get users by verification status
    const verifiedResult = await pool.query(
      'SELECT is_verified, COUNT(*) as count FROM users GROUP BY is_verified'
    );
    
    // Get recent registrations (last 30 days)
    const recentResult = await pool.query(
      'SELECT COUNT(*) as recent FROM users WHERE created_at >= NOW() - INTERVAL \'30 days\''
    );
    const recent = parseInt(recentResult.rows[0].recent);
    
    res.json({
      total,
      active,
      inactive: total - active,
      recentRegistrations: recent,
      byRole: roleResult.rows,
      byVerification: verifiedResult.rows
    });
    
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get user statistics',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 User Management running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/docs`);
});
