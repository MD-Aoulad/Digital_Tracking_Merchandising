const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3004;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Database connection
const pool = new Pool({
  connectionString: process.env.ATTENDANCE_DB_URL || 'postgresql://attendance_user:attendance_password@attendance-db:5432/attendance_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  min: 2,
  idleTimeoutMillis: 60000
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
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
    service: 'Attendance Tracking',
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
    name: 'Attendance Tracking Service',
    version: '1.0.0',
    description: 'GPS-based attendance tracking with photo verification for Workforce Management Platform',
    endpoints: {
      'GET /health': 'Service health check',
      'POST /attendance/punch-in': 'Punch in with GPS and photo',
      'POST /attendance/punch-out': 'Punch out with GPS and photo',
      'GET /attendance/history': 'Get attendance history',
      'GET /attendance/current': 'Get current attendance status',
      'GET /attendance/reports': 'Get attendance reports',
      'GET /attendance/stats': 'Get attendance statistics',
      'GET /workplaces': 'Get available workplaces',
      'GET /workplaces/:id': 'Get workplace details',
      'POST /workplaces': 'Create workplace (Admin)',
      'PUT /workplaces/:id': 'Update workplace (Admin)',
      'DELETE /workplaces/:id': 'Delete workplace (Admin)',
      'GET /attendance/verify-location': 'Verify location against workplace',
      'POST /attendance/photo-upload': 'Upload attendance photo',
      'GET /attendance/photo/:id': 'Get attendance photo'
    }
  });
});

// Complete Attendance Management API Endpoints

// 1. PUNCH IN WITH GPS AND PHOTO VERIFICATION
app.post('/attendance/punch-in', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { 
      workplaceId, 
      latitude, 
      longitude, 
      accuracy, 
      timestamp,
      notes,
      deviceInfo 
    } = req.body;
    
    // Validate required fields
    if (!workplaceId) {
      return res.status(400).json({ 
        error: 'Workplace ID is required' 
      });
    }
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'GPS coordinates are required' 
      });
    }
    
    // Check if user is already punched in
    const currentAttendance = await pool.query(
      'SELECT id FROM attendance WHERE user_id = $1 AND punch_out_time IS NULL',
      [req.user.id]
    );
    
    if (currentAttendance.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Already punched in. Please punch out first.' 
      });
    }
    
    // Verify workplace exists
    const workplaceResult = await pool.query(
      'SELECT id, name, latitude, longitude, radius FROM workplaces WHERE id = $1 AND is_active = true',
      [workplaceId]
    );
    
    if (workplaceResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid workplace or workplace is inactive' 
      });
    }
    
    const workplace = workplaceResult.rows[0];
    
    // Calculate distance from workplace
    const distance = calculateDistance(
      parseFloat(latitude), 
      parseFloat(longitude), 
      workplace.latitude, 
      workplace.longitude
    );
    
    // Check if within workplace radius (default 100 meters if not specified)
    const maxDistance = workplace.radius || 100;
    const isWithinRadius = distance <= maxDistance;
    
    // Handle photo upload
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }
    
    // Create attendance record
    const result = await pool.query(
      `INSERT INTO attendance (
        user_id,
        workplace_id,
        punch_in_time,
        punch_in_latitude,
        punch_in_longitude,
        punch_in_accuracy,
        punch_in_photo_url,
        punch_in_notes,
        device_info,
        distance_from_workplace,
        is_within_radius,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING id, punch_in_time, is_within_radius`,
      [
        req.user.id,
        workplaceId,
        timestamp || new Date(),
        parseFloat(latitude),
        parseFloat(longitude),
        accuracy ? parseFloat(accuracy) : null,
        photoUrl,
        notes || null,
        deviceInfo || null,
        distance,
        isWithinRadius,
        isWithinRadius ? 'active' : 'out_of_range'
      ]
    );
    
    const attendance = result.rows[0];
    
    res.status(201).json({
      message: 'Punch in successful',
      attendance: {
        id: attendance.id,
        punchInTime: attendance.punch_in_time,
        workplace: {
          id: workplace.id,
          name: workplace.name
        },
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy: accuracy ? parseFloat(accuracy) : null,
          distance: distance,
          isWithinRadius: attendance.is_within_radius
        },
        status: attendance.status,
        photoUrl: photoUrl
      }
    });
    
  } catch (error) {
    console.error('Punch in error:', error);
    res.status(500).json({ 
      error: 'Failed to punch in',
      details: error.message 
    });
  }
});

// 2. PUNCH OUT WITH GPS AND PHOTO VERIFICATION
app.post('/attendance/punch-out', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      accuracy, 
      timestamp,
      notes,
      deviceInfo 
    } = req.body;
    
    // Validate GPS coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'GPS coordinates are required' 
      });
    }
    
    // Get current attendance record
    const currentAttendance = await pool.query(
      `SELECT 
        a.id,
        a.workplace_id,
        a.punch_in_time,
        a.punch_in_latitude,
        a.punch_in_longitude,
        w.name as workplace_name,
        w.latitude as workplace_lat,
        w.longitude as workplace_lng
      FROM attendance a
      LEFT JOIN workplaces w ON a.workplace_id = w.id
      WHERE a.user_id = $1 AND a.punch_out_time IS NULL`,
      [req.user.id]
    );
    
    if (currentAttendance.rows.length === 0) {
      return res.status(400).json({ 
        error: 'No active punch in found. Please punch in first.' 
      });
    }
    
    const attendance = currentAttendance.rows[0];
    
    // Calculate distance from workplace
    const distance = calculateDistance(
      parseFloat(latitude), 
      parseFloat(longitude), 
      attendance.workplace_lat, 
      attendance.workplace_lng
    );
    
    // Handle photo upload
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }
    
    // Calculate work duration
    const punchInTime = new Date(attendance.punch_in_time);
    const punchOutTime = timestamp ? new Date(timestamp) : new Date();
    const durationMinutes = Math.round((punchOutTime - punchInTime) / (1000 * 60));
    
    // Update attendance record
    const result = await pool.query(
      `UPDATE attendance SET 
        punch_out_time = $1,
        punch_out_latitude = $2,
        punch_out_longitude = $3,
        punch_out_accuracy = $4,
        punch_out_photo_url = $5,
        punch_out_notes = $6,
        work_duration_minutes = $7,
        status = 'completed',
        updated_at = NOW()
      WHERE id = $8 
      RETURNING *`,
      [
        punchOutTime,
        parseFloat(latitude),
        parseFloat(longitude),
        accuracy ? parseFloat(accuracy) : null,
        photoUrl,
        notes || null,
        durationMinutes,
        attendance.id
      ]
    );
    
    const updatedAttendance = result.rows[0];
    
    res.json({
      message: 'Punch out successful',
      attendance: {
        id: updatedAttendance.id,
        punchInTime: updatedAttendance.punch_in_time,
        punchOutTime: updatedAttendance.punch_out_time,
        workDurationMinutes: updatedAttendance.work_duration_minutes,
        workplace: {
          id: attendance.workplace_id,
          name: attendance.workplace_name
        },
        location: {
          punchIn: {
            latitude: updatedAttendance.punch_in_latitude,
            longitude: updatedAttendance.punch_in_longitude
          },
          punchOut: {
            latitude: updatedAttendance.punch_out_latitude,
            longitude: updatedAttendance.punch_out_longitude
          }
        },
        status: updatedAttendance.status
      }
    });
    
  } catch (error) {
    console.error('Punch out error:', error);
    res.status(500).json({ 
      error: 'Failed to punch out',
      details: error.message 
    });
  }
});

// 3. GET ATTENDANCE HISTORY
app.get('/attendance/history', verifyToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      workplaceId,
      status 
    } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        a.id,
        a.punch_in_time,
        a.punch_out_time,
        a.work_duration_minutes,
        a.status,
        a.punch_in_latitude,
        a.punch_in_longitude,
        a.punch_out_latitude,
        a.punch_out_longitude,
        a.punch_in_photo_url,
        a.punch_out_photo_url,
        a.punch_in_notes,
        a.punch_out_notes,
        a.is_within_radius,
        a.distance_from_workplace,
        w.id as workplace_id,
        w.name as workplace_name,
        w.address as workplace_address
      FROM attendance a
      LEFT JOIN workplaces w ON a.workplace_id = w.id
      WHERE a.user_id = $1
    `;
    
    const queryParams = [req.user.id];
    let paramCount = 2;
    
    // Add filters
    if (startDate) {
      query += ` AND DATE(a.punch_in_time) >= $${paramCount++}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND DATE(a.punch_in_time) <= $${paramCount++}`;
      queryParams.push(endDate);
    }
    
    if (workplaceId) {
      query += ` AND a.workplace_id = $${paramCount++}`;
      queryParams.push(workplaceId);
    }
    
    if (status) {
      query += ` AND a.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    // Add pagination
    query += ` ORDER BY a.punch_in_time DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM attendance WHERE user_id = $1';
    const countParams = [req.user.id];
    paramCount = 2;
    
    if (startDate) {
      countQuery += ` AND DATE(punch_in_time) >= $${paramCount++}`;
      countParams.push(startDate);
    }
    
    if (endDate) {
      countQuery += ` AND DATE(punch_in_time) <= $${paramCount++}`;
      countParams.push(endDate);
    }
    
    if (workplaceId) {
      countQuery += ` AND workplace_id = $${paramCount++}`;
      countParams.push(workplaceId);
    }
    
    if (status) {
      countQuery += ` AND status = $${paramCount++}`;
      countParams.push(status);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      attendance: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ 
      error: 'Failed to get attendance history',
      details: error.message 
    });
  }
});

// 4. GET CURRENT ATTENDANCE STATUS
app.get('/attendance/current', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.id,
        a.punch_in_time,
        a.status,
        a.punch_in_latitude,
        a.punch_in_longitude,
        a.punch_in_photo_url,
        a.punch_in_notes,
        a.is_within_radius,
        a.distance_from_workplace,
        w.id as workplace_id,
        w.name as workplace_name,
        w.address as workplace_address
      FROM attendance a
      LEFT JOIN workplaces w ON a.workplace_id = w.id
      WHERE a.user_id = $1 AND a.punch_out_time IS NULL
      ORDER BY a.punch_in_time DESC
      LIMIT 1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        isPunchedIn: false,
        currentAttendance: null
      });
    }
    
    const attendance = result.rows[0];
    
    res.json({
      isPunchedIn: true,
      currentAttendance: {
        id: attendance.id,
        punchInTime: attendance.punch_in_time,
        status: attendance.status,
        workplace: {
          id: attendance.workplace_id,
          name: attendance.workplace_name,
          address: attendance.workplace_address
        },
        location: {
          latitude: attendance.punch_in_latitude,
          longitude: attendance.punch_in_longitude,
          isWithinRadius: attendance.is_within_radius,
          distance: attendance.distance_from_workplace
        },
        photoUrl: attendance.punch_in_photo_url,
        notes: attendance.punch_in_notes
      }
    });
    
  } catch (error) {
    console.error('Get current attendance error:', error);
    res.status(500).json({ 
      error: 'Failed to get current attendance',
      details: error.message 
    });
  }
});

// 5. GET ATTENDANCE REPORTS (Admin only)
app.get('/attendance/reports', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      userId, 
      workplaceId,
      groupBy = 'day' 
    } = req.query;
    
    let query = `
      SELECT 
        a.id,
        a.user_id,
        a.punch_in_time,
        a.punch_out_time,
        a.work_duration_minutes,
        a.status,
        a.is_within_radius,
        u.first_name,
        u.last_name,
        u.email,
        w.name as workplace_name
      FROM attendance a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN workplaces w ON a.workplace_id = w.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (startDate) {
      query += ` AND DATE(a.punch_in_time) >= $${paramCount++}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND DATE(a.punch_in_time) <= $${paramCount++}`;
      queryParams.push(endDate);
    }
    
    if (userId) {
      query += ` AND a.user_id = $${paramCount++}`;
      queryParams.push(userId);
    }
    
    if (workplaceId) {
      query += ` AND a.workplace_id = $${paramCount++}`;
      queryParams.push(workplaceId);
    }
    
    query += ` ORDER BY a.punch_in_time DESC`;
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      reports: result.rows,
      filters: {
        startDate,
        endDate,
        userId,
        workplaceId,
        groupBy
      }
    });
    
  } catch (error) {
    console.error('Get attendance reports error:', error);
    res.status(500).json({ 
      error: 'Failed to get attendance reports',
      details: error.message 
    });
  }
});

// 6. GET ATTENDANCE STATISTICS
app.get('/attendance/stats', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const queryParams = [req.user.id];
    let paramCount = 2;
    
    if (startDate) {
      dateFilter += ` AND DATE(punch_in_time) >= $${paramCount++}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      dateFilter += ` AND DATE(punch_in_time) <= $${paramCount++}`;
      queryParams.push(endDate);
    }
    
    // Get total attendance days
    const totalDaysResult = await pool.query(
      `SELECT COUNT(DISTINCT DATE(punch_in_time)) as total_days 
       FROM attendance 
       WHERE user_id = $1${dateFilter}`,
      queryParams
    );
    
    // Get total work hours
    const totalHoursResult = await pool.query(
      `SELECT COALESCE(SUM(work_duration_minutes), 0) as total_minutes 
       FROM attendance 
       WHERE user_id = $1 AND punch_out_time IS NOT NULL${dateFilter}`,
      queryParams
    );
    
    // Get average work hours per day
    const avgHoursResult = await pool.query(
      `SELECT COALESCE(AVG(work_duration_minutes), 0) as avg_minutes 
       FROM attendance 
       WHERE user_id = $1 AND punch_out_time IS NOT NULL${dateFilter}`,
      queryParams
    );
    
    // Get on-time percentage
    const onTimeResult = await pool.query(
      `SELECT 
         COUNT(*) as total_records,
         COUNT(CASE WHEN EXTRACT(HOUR FROM punch_in_time) <= 9 THEN 1 END) as on_time
       FROM attendance 
       WHERE user_id = $1${dateFilter}`,
      queryParams
    );
    
    // Get workplace breakdown
    const workplaceResult = await pool.query(
      `SELECT 
         w.name as workplace_name,
         COUNT(*) as attendance_count
       FROM attendance a
       LEFT JOIN workplaces w ON a.workplace_id = w.id
       WHERE a.user_id = $1${dateFilter}
       GROUP BY w.id, w.name
       ORDER BY attendance_count DESC`,
      queryParams
    );
    
    const totalDays = parseInt(totalDaysResult.rows[0].total_days);
    const totalMinutes = parseInt(totalHoursResult.rows[0].total_minutes);
    const avgMinutes = parseFloat(avgHoursResult.rows[0].avg_minutes);
    const totalRecords = parseInt(onTimeResult.rows[0].total_records);
    const onTimeRecords = parseInt(onTimeResult.rows[0].on_time);
    
    res.json({
      totalDays,
      totalHours: Math.round(totalMinutes / 60 * 100) / 100,
      averageHoursPerDay: Math.round(avgMinutes / 60 * 100) / 100,
      onTimePercentage: totalRecords > 0 ? Math.round((onTimeRecords / totalRecords) * 100) : 0,
      workplaceBreakdown: workplaceResult.rows,
      period: {
        startDate,
        endDate
      }
    });
    
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get attendance statistics',
      details: error.message 
    });
  }
});

// 7. GET AVAILABLE WORKPLACES
app.get('/workplaces', verifyToken, async (req, res) => {
  try {
    const { active = true } = req.query;
    
    let query = `
      SELECT 
        id,
        name,
        address,
        latitude,
        longitude,
        radius,
        description,
        is_active,
        created_at
      FROM workplaces
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (active === 'true') {
      query += ` AND is_active = true`;
    }
    
    query += ` ORDER BY name`;
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      workplaces: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Get workplaces error:', error);
    res.status(500).json({ 
      error: 'Failed to get workplaces',
      details: error.message 
    });
  }
});

// 8. GET WORKPLACE DETAILS
app.get('/workplaces/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        id,
        name,
        address,
        latitude,
        longitude,
        radius,
        description,
        is_active,
        created_at,
        updated_at
      FROM workplaces 
      WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workplace not found' });
    }
    
    res.json({
      workplace: result.rows[0]
    });
    
  } catch (error) {
    console.error('Get workplace error:', error);
    res.status(500).json({ 
      error: 'Failed to get workplace',
      details: error.message 
    });
  }
});

// 9. CREATE WORKPLACE (Admin only)
app.post('/workplaces', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { 
      name, 
      address, 
      latitude, 
      longitude, 
      radius = 100,
      description 
    } = req.body;
    
    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Name, address, latitude, and longitude are required' 
      });
    }
    
    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ 
        error: 'Invalid latitude or longitude' 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO workplaces (
        name, 
        address, 
        latitude, 
        longitude, 
        radius, 
        description,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, true) 
      RETURNING id, name, address, latitude, longitude, radius`,
      [
        name,
        address,
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius),
        description || null
      ]
    );
    
    res.status(201).json({
      message: 'Workplace created successfully',
      workplace: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create workplace error:', error);
    res.status(500).json({ 
      error: 'Failed to create workplace',
      details: error.message 
    });
  }
});

// 10. UPDATE WORKPLACE (Admin only)
app.put('/workplaces/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      address, 
      latitude, 
      longitude, 
      radius,
      description,
      isActive 
    } = req.body;
    
    // Check if workplace exists
    const existingResult = await pool.query(
      'SELECT id FROM workplaces WHERE id = $1',
      [id]
    );
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workplace not found' });
    }
    
    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;
    
    if (name) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(name);
    }
    
    if (address) {
      updateFields.push(`address = $${paramCount++}`);
      updateValues.push(address);
    }
    
    if (latitude) {
      updateFields.push(`latitude = $${paramCount++}`);
      updateValues.push(parseFloat(latitude));
    }
    
    if (longitude) {
      updateFields.push(`longitude = $${paramCount++}`);
      updateValues.push(parseFloat(longitude));
    }
    
    if (radius !== undefined) {
      updateFields.push(`radius = $${paramCount++}`);
      updateValues.push(parseInt(radius));
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    
    if (isActive !== undefined) {
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
      `UPDATE workplaces SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );
    
    res.json({
      message: 'Workplace updated successfully',
      workplace: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update workplace error:', error);
    res.status(500).json({ 
      error: 'Failed to update workplace',
      details: error.message 
    });
  }
});

// 11. DELETE WORKPLACE (Admin only)
app.delete('/workplaces/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if workplace has attendance records
    const attendanceResult = await pool.query(
      'SELECT COUNT(*) as count FROM attendance WHERE workplace_id = $1',
      [id]
    );
    
    if (parseInt(attendanceResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete workplace with existing attendance records' 
      });
    }
    
    await pool.query('DELETE FROM workplaces WHERE id = $1', [id]);
    
    res.json({
      message: 'Workplace deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Delete workplace error:', error);
    res.status(500).json({ 
      error: 'Failed to delete workplace',
      details: error.message 
    });
  }
});

// 12. VERIFY LOCATION AGAINST WORKPLACE
app.get('/attendance/verify-location', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude, workplaceId } = req.query;
    
    if (!latitude || !longitude || !workplaceId) {
      return res.status(400).json({ 
        error: 'Latitude, longitude, and workplace ID are required' 
      });
    }
    
    // Get workplace details
    const workplaceResult = await pool.query(
      'SELECT id, name, latitude, longitude, radius FROM workplaces WHERE id = $1 AND is_active = true',
      [workplaceId]
    );
    
    if (workplaceResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Workplace not found or inactive' 
      });
    }
    
    const workplace = workplaceResult.rows[0];
    
    // Calculate distance
    const distance = calculateDistance(
      parseFloat(latitude), 
      parseFloat(longitude), 
      workplace.latitude, 
      workplace.longitude
    );
    
    // Check if within radius
    const maxDistance = workplace.radius || 100;
    const isWithinRadius = distance <= maxDistance;
    
    res.json({
      workplace: {
        id: workplace.id,
        name: workplace.name,
        radius: maxDistance
      },
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        distance: distance,
        isWithinRadius: isWithinRadius
      },
      verification: {
        isValid: isWithinRadius,
        message: isWithinRadius ? 'Location is within workplace radius' : 'Location is outside workplace radius'
      }
    });
    
  } catch (error) {
    console.error('Verify location error:', error);
    res.status(500).json({ 
      error: 'Failed to verify location',
      details: error.message 
    });
  }
});

// 13. UPLOAD ATTENDANCE PHOTO
app.post('/attendance/photo-upload', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Photo file is required' 
      });
    }
    
    const photoUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Photo uploaded successfully',
      photoUrl: photoUrl,
      filename: req.file.filename,
      size: req.file.size
    });
    
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload photo',
      details: error.message 
    });
  }
});

// 14. GET ATTENDANCE PHOTO
app.get('/attendance/photo/:filename', verifyToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const photoPath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(photoPath)) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    res.sendFile(photoPath);
    
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ 
      error: 'Failed to get photo',
      details: error.message 
    });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

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
  console.log(`🚀 Attendance Tracking running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/docs`);
});
