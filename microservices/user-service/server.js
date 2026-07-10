const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

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

// ===== CROSS-SERVICE IDENTITY (auth-service) =====

/**
 * Mints a short-lived internal service token for server-to-server calls to
 * auth-service's admin endpoints, so lookups aren't gated by the end-user's own role.
 */
const getInternalServiceToken = () => {
  return jwt.sign(
    { id: 'user-service', role: 'admin', service: 'user-service' },
    JWT_SECRET,
    { expiresIn: '1m' }
  );
};

/**
 * Lists users from auth-service with optional filters. Returns { users: [], } shape.
 */
const authListUsers = async ({ role, isActive, search, page, limit } = {}) => {
  const token = getInternalServiceToken();
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (isActive !== undefined) params.set('isActive', isActive);
  if (search) params.set('search', search);
  if (page) params.set('page', page);
  if (limit) params.set('limit', limit);

  const response = await fetch(`${AUTH_SERVICE_URL}/admin/users?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    throw new Error(`auth-service returned ${response.status}`);
  }
  const data = await response.json();
  return data.users || [];
};

/**
 * Fetches a single user's identity from auth-service. Returns null if not found.
 */
const authGetUser = async (id) => {
  const token = getInternalServiceToken();
  const response = await fetch(`${AUTH_SERVICE_URL}/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`auth-service returned ${response.status}`);
  }
  const data = await response.json();
  return data.user;
};

/**
 * Updates identity fields (email/role/isActive) on auth-service. Returns updated user.
 */
const authUpdateUser = async (id, fields) => {
  const token = getInternalServiceToken();
  const response = await fetch(`${AUTH_SERVICE_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(fields)
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data.error || `auth-service returned ${response.status}`);
    error.status = response.status;
    throw error;
  }
  const data = await response.json();
  return data.user;
};

/**
 * Registers a new identity on auth-service (creates the auth_users row).
 */
const authRegisterUser = async ({ email, password, firstName, lastName, role }) => {
  const response = await fetch(`${AUTH_SERVICE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName, lastName, role })
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || `auth-service returned ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data.user;
};

/**
 * Merges an auth-service identity with the local user_profiles row (if any).
 */
const mergeProfile = (identity, profileRow) => ({
  ...identity,
  profile: profileRow ? {
    firstName: profileRow.first_name,
    lastName: profileRow.last_name,
    displayName: profileRow.display_name,
    avatarUrl: profileRow.avatar_url,
    phoneNumber: profileRow.phone_number,
    dateOfBirth: profileRow.date_of_birth,
    gender: profileRow.gender,
    address: profileRow.address,
    emergencyContact: profileRow.emergency_contact,
    employeeId: profileRow.employee_id,
    hireDate: profileRow.hire_date
  } : null
});

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
// Identity (email/role/isActive) is sourced from auth-service; extended
// profile fields (name/phone/address/etc) live in this service's own
// user_profiles table, keyed by auth_user_id.

// 1. GET ALL USERS (Admin only)
app.get('/users', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isActive, search } = req.query;

    const identities = await authListUsers({ role, isActive, search, page, limit });
    const ids = identities.map(u => u.id);

    let profileRows = [];
    if (ids.length > 0) {
      const result = await pool.query(
        'SELECT * FROM user_profiles WHERE auth_user_id = ANY($1)',
        [ids]
      );
      profileRows = result.rows;
    }
    const profilesByAuthId = new Map(profileRows.map(p => [p.auth_user_id, p]));

    const users = identities.map(identity => mergeProfile(identity, profilesByAuthId.get(identity.id)));

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
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

// 3. CREATE NEW USER (Admin only)
app.post('/users', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { email, firstName, lastName, role = 'user', password } = req.body;

    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({
        error: 'Email, firstName, lastName, and password are required'
      });
    }

    const identity = await authRegisterUser({ email, password, firstName, lastName, role });

    // Create the matching local profile row
    await pool.query(
      `INSERT INTO user_profiles (auth_user_id, first_name, last_name)
       VALUES ($1, $2, $3)`,
      [identity.id, firstName, lastName]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: identity
    });

  } catch (error) {
    console.error('Create user error:', error);
    const status = error.status === 409 ? 409 : 500;
    res.status(status).json({
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
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Only admins can change role and active status
    if (req.user.role !== 'admin' && (role !== undefined || isActive !== undefined)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    let identity = null;
    const identityFields = {};
    if (email !== undefined) identityFields.email = email;
    if (role !== undefined && req.user.role === 'admin') identityFields.role = role;
    if (isActive !== undefined && req.user.role === 'admin') identityFields.isActive = isActive;

    if (Object.keys(identityFields).length > 0) {
      identity = await authUpdateUser(id, identityFields);
      if (!identity) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    if (firstName || lastName) {
      const existing = await pool.query('SELECT id FROM user_profiles WHERE auth_user_id = $1', [id]);
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO user_profiles (auth_user_id, first_name, last_name) VALUES ($1, $2, $3)`,
          [id, firstName || 'Unknown', lastName || 'Unknown']
        );
      } else {
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
        updateFields.push(`updated_at = NOW()`);
        updateValues.push(id);
        await pool.query(
          `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE auth_user_id = $${paramCount}`,
          updateValues
        );
      }
    }

    if (!identity) {
      identity = await authGetUser(id);
      if (!identity) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    res.json({
      message: 'User updated successfully',
      user: identity
    });

  } catch (error) {
    console.error('Update user error:', error);
    const status = error.status === 409 ? 409 : 500;
    res.status(status).json({
      error: 'Failed to update user',
      details: error.message
    });
  }
});

// 5. DELETE USER (Admin only) - soft delete via deactivation
app.delete('/users/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const identity = await authUpdateUser(id, { isActive: false });

    if (!identity) {
      return res.status(404).json({ error: 'User not found' });
    }

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
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const identity = await authGetUser(id);
    if (!identity) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profileResult = await pool.query(
      'SELECT * FROM user_profiles WHERE auth_user_id = $1',
      [id]
    );

    res.json({ user: mergeProfile(identity, profileResult.rows[0]) });

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
    const { phone, address, city, state, country, postalCode, dateOfBirth, gender, avatarUrl, displayName } = req.body;

    // Check if user can update this profile (admin or self)
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const identity = await authGetUser(id);
    if (!identity) {
      return res.status(404).json({ error: 'User not found' });
    }

    // address is stored as JSONB; nest the flat request fields into it
    const addressJson = (address || city || state || country || postalCode)
      ? JSON.stringify({ street: address, city, state, country, postal_code: postalCode })
      : null;

    const existing = await pool.query('SELECT id FROM user_profiles WHERE auth_user_id = $1', [id]);

    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO user_profiles (
          auth_user_id, first_name, last_name, phone_number, address,
          date_of_birth, gender, avatar_url, display_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, identity.firstName || 'Unknown', identity.lastName || 'Unknown', phone, addressJson, dateOfBirth || null, gender, avatarUrl, displayName]
      );
    } else {
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (phone !== undefined) {
        updateFields.push(`phone_number = $${paramCount++}`);
        updateValues.push(phone);
      }
      if (addressJson !== null) {
        updateFields.push(`address = $${paramCount++}`);
        updateValues.push(addressJson);
      }
      if (dateOfBirth !== undefined) {
        updateFields.push(`date_of_birth = $${paramCount++}`);
        updateValues.push(dateOfBirth);
      }
      if (gender !== undefined) {
        updateFields.push(`gender = $${paramCount++}`);
        updateValues.push(gender);
      }
      if (avatarUrl !== undefined) {
        updateFields.push(`avatar_url = $${paramCount++}`);
        updateValues.push(avatarUrl);
      }
      if (displayName !== undefined) {
        updateFields.push(`display_name = $${paramCount++}`);
        updateValues.push(displayName);
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = NOW()`);
        updateValues.push(id);
        await pool.query(
          `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE auth_user_id = $${paramCount}`,
          updateValues
        );
      }
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

    const users = await authListUsers({ role, isActive, search: q, limit });

    res.json({
      users,
      count: users.length
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

    const identity = await authUpdateUser(id, { isActive: true });

    if (!identity) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User activated successfully',
      user: identity
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

    const identity = await authUpdateUser(id, { isActive: false });

    if (!identity) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deactivated successfully',
      user: identity
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
    const users = await authListUsers({ limit: 1000 });

    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const recent = users.filter(u => new Date(u.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

    const byRole = Object.entries(
      users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {})
    ).map(([role, count]) => ({ role, count }));

    const byVerification = Object.entries(
      users.reduce((acc, u) => {
        const key = u.isVerified ? 'true' : 'false';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).map(([is_verified, count]) => ({ is_verified: is_verified === 'true', count }));

    res.json({
      total,
      active,
      inactive: total - active,
      recentRegistrations: recent,
      byRole,
      byVerification
    });

  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      error: 'Failed to get user statistics',
      details: error.message
    });
  }
});

// 2. GET USER BY ID (registered after the static /users/* routes above so it
// doesn't shadow them, since Express matches routes in registration order)
app.get('/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can access this profile (admin or self)
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const identity = await authGetUser(id);
    if (!identity) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profileResult = await pool.query(
      'SELECT * FROM user_profiles WHERE auth_user_id = $1',
      [id]
    );

    res.json({ user: mergeProfile(identity, profileResult.rows[0]) });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
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
