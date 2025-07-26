const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Pool } = require('pg');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Environment variables
const PORT = process.env.PORT || 3007;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/attendance_db';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads/attendance';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
const DEFAULT_GEOFENCE_RADIUS = parseInt(process.env.DEFAULT_GEOFENCE_RADIUS) || 100;

// Database connection (optional for testing)
let pool = null;
let redis = null;

// For testing purposes, we'll skip database connections
if (process.env.NODE_ENV === 'production') {
  try {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: false // Disable SSL for local development
    });
    console.log('Database connection established');
  } catch (error) {
    console.warn('Database connection failed:', error.message);
  }

  try {
    redis = new Redis(REDIS_URL);
    console.log('Redis connection established');
  } catch (error) {
    console.warn('Redis connection failed:', error.message);
  }
} else {
  console.log('Running in development mode - database connections disabled for testing');
}

// Create upload directory if it doesn't exist
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_PATH);
  } catch {
    try {
      await fs.mkdir(UPLOAD_PATH, { recursive: true });
    } catch (error) {
      console.warn('Could not create upload directory:', error.message);
      // Use a fallback directory
      process.env.UPLOAD_PATH = '/tmp/uploads/attendance';
    }
  }
};

// Only create upload directory in production
if (process.env.NODE_ENV === 'production') {
  ensureUploadDir();
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const attendanceRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many attendance requests from this IP' }
});

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization
const authorizeRole = (roles) => {
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

// GPS spoofing detection middleware
const detectGPSSpoofing = (req, res, next) => {
  const { latitude, longitude, accuracy } = req.body;
  
  if (accuracy && accuracy < 1) {
    return res.status(400).json({ error: 'Suspicious GPS accuracy' });
  }
  
  // Additional GPS validation can be added here
  next();
};

// Geofencing service
const geofencingService = {
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  },

  isWithinGeofence: (userLat, userLon, workplaceLat, workplaceLon, radius) => {
    const distance = geofencingService.calculateDistance(
      userLat, userLon, workplaceLat, workplaceLon
    );
    return distance <= radius;
  }
};

// Work hours calculation service
const workHoursService = {
  calculateWorkHours: (punchIn, punchOut, breaks) => {
    const totalMinutes = (punchOut - punchIn) / (1000 * 60);
    const breakMinutes = breaks.reduce((total, breakRecord) => {
      return total + ((breakRecord.end_time - breakRecord.start_time) / (1000 * 60));
    }, 0);
    
    return {
      totalHours: totalMinutes / 60,
      breakHours: breakMinutes / 60,
      netHours: (totalMinutes - breakMinutes) / 60
    };
  },

  calculateOvertime: (netHours, standardHours = 8) => {
    return Math.max(0, netHours - standardHours);
  }
};

// Attendance validation rules
const attendanceValidationRules = {
  punchIn: {
    maxDistanceFromWorkplace: 100,
    allowedTimeWindow: {
      beforeShift: 30,
      afterShift: 15
    },
    requiredFields: ['workplaceId', 'latitude', 'longitude'],
    photoRequired: true,
    preventDuplicatePunchIn: true
  },
  punchOut: {
    requireActivePunchIn: true,
    minimumWorkHours: 0.5,
    maximumWorkHours: 16,
    photoRequired: false
  },
  breaks: {
    minimumBreakDuration: 15,
    maximumBreakDuration: 120,
    totalBreakTimePerDay: 120,
    breakTypes: ['lunch', 'coffee', 'rest', 'other']
  },
  approvals: {
    lateThreshold: 15,
    overtimeThreshold: 8,
    approvalTimeLimit: 48,
    autoApprovalForManagers: true
  }
};

// Database initialization
const initializeDatabase = async () => {
  if (!pool) {
    console.log('Database not available, skipping initialization');
    return;
  }
  
  try {
    // Enhanced attendance_records table
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS break_start_time TIMESTAMP WITH TIME ZONE`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS break_end_time TIMESTAMP WITH TIME ZONE`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS total_break_hours DECIMAL(5,2)`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS net_work_hours DECIMAL(5,2)`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS clock_in_method VARCHAR(50)`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS clock_out_method VARCHAR(50)`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS device_info JSONB`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS ip_address INET`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS user_agent TEXT`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending'`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS approved_by UUID`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS rejection_reason TEXT`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS overtime_hours DECIMAL(5,2)`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS shift_id UUID`);
    await pool.query(`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS geofence_zone_id UUID`);

    // Create breaks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS breaks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        attendance_id UUID REFERENCES attendance_records(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('lunch', 'coffee', 'rest', 'other')),
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE,
        duration_minutes INTEGER,
        notes TEXT,
        location JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create approval_requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS approval_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        attendance_id UUID REFERENCES attendance_records(id) ON DELETE CASCADE,
        requester_id UUID NOT NULL,
        approver_id UUID,
        type VARCHAR(20) NOT NULL CHECK (type IN ('late', 'early_leave', 'overtime', 'break_extension')),
        reason TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        approved_at TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        evidence JSONB
      );
    `);

    // Create geofence_zones table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS geofence_zones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workplace_id UUID REFERENCES workplaces(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        center_latitude DECIMAL(10, 8) NOT NULL,
        center_longitude DECIMAL(11, 8) NOT NULL,
        radius_meters INTEGER DEFAULT 100,
        allowed_methods TEXT[] DEFAULT ARRAY['gps', 'qr', 'facial'],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create shifts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workplace_id UUID REFERENCES workplaces(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        break_duration_minutes INTEGER DEFAULT 60,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance_records(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_attendance_workplace_date ON attendance_records(workplace_id, date);
      CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
      CREATE INDEX IF NOT EXISTS idx_breaks_attendance ON breaks(attendance_id);
      CREATE INDEX IF NOT EXISTS idx_approvals_status ON approval_requests(status);
      CREATE INDEX IF NOT EXISTS idx_geofence_workplace ON geofence_zones(workplace_id);
      CREATE INDEX IF NOT EXISTS idx_shifts_workplace ON shifts(workplace_id);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Initialize database on startup
initializeDatabase();

// API Routes

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const services = {
      database: 'disconnected',
      redis: 'disconnected',
      fileSystem: 'inaccessible'
    };
    
    if (pool) {
      try {
        await pool.query('SELECT 1');
        services.database = 'connected';
      } catch (error) {
        console.warn('Database health check failed:', error.message);
      }
    }
    
    if (redis) {
      try {
        await redis.ping();
        services.redis = 'connected';
      } catch (error) {
        console.warn('Redis health check failed:', error.message);
      }
    }
    
    try {
      await fs.access(UPLOAD_PATH);
      services.fileSystem = 'accessible';
    } catch (error) {
      console.warn('File system health check failed:', error.message);
    }
    
    const isHealthy = services.database === 'connected' || services.redis === 'connected';
    
    if (isHealthy) {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services
      });
    } else {
      res.status(503).json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        services,
        message: 'Service running in test mode without database/redis'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Enhanced Punch In
app.post('/api/attendance/punch-in', 
  authenticateToken, 
  attendanceRateLimit, 
  detectGPSSpoofing,
  upload.single('photo'),
  async (req, res) => {
    // Mock response for testing when database is not available
    if (!pool) {
      return res.json({
        success: true,
        message: 'Punch in successful (test mode)',
        data: {
          attendanceId: 'mock-attendance-123',
          punchInTime: new Date().toISOString(),
          workplace: {
            id: req.body.workplaceId || 'test-workplace',
            name: 'Test Workplace',
            address: '123 Test Street'
          },
          location: {
            latitude: parseFloat(req.body.latitude || 40.7128),
            longitude: parseFloat(req.body.longitude || -74.0060),
            accuracy: parseFloat(req.body.accuracy || 5),
            isWithinRadius: true
          },
          shift: null,
          status: 'active',
          photoUrl: req.file ? `/uploads/attendance/${req.file.filename}` : null,
          verificationStatus: 'pending'
        }
      });
    }
    try {
      const {
        workplaceId,
        latitude,
        longitude,
        accuracy,
        timestamp,
        notes,
        deviceInfo,
        ipAddress,
        userAgent,
        shiftId
      } = req.body;

      const userId = req.user.id;

      // Validate required fields
      if (!workplaceId || !latitude || !longitude) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check for existing active punch in
      const existingAttendance = await pool.query(
        'SELECT * FROM attendance_records WHERE user_id = $1 AND date = CURRENT_DATE AND punch_out_time IS NULL',
        [userId]
      );

      if (existingAttendance.rows.length > 0) {
        return res.status(400).json({ error: 'Already punched in today' });
      }

      // Get workplace and geofence information
      const workplaceResult = await pool.query(
        'SELECT * FROM workplaces WHERE id = $1',
        [workplaceId]
      );

      if (workplaceResult.rows.length === 0) {
        return res.status(404).json({ error: 'Workplace not found' });
      }

      const workplace = workplaceResult.rows[0];

      // Check geofencing
      const isWithinGeofence = geofencingService.isWithinGeofence(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(workplace.latitude),
        parseFloat(workplace.longitude),
        DEFAULT_GEOFENCE_RADIUS
      );

      if (!isWithinGeofence) {
        return res.status(400).json({ error: 'Location outside workplace geofence' });
      }

      // Get shift information if provided
      let shift = null;
      if (shiftId) {
        const shiftResult = await pool.query(
          'SELECT * FROM shifts WHERE id = $1 AND is_active = true',
          [shiftId]
        );
        shift = shiftResult.rows[0] || null;
      }

      // Insert attendance record
      const attendanceResult = await pool.query(
        `INSERT INTO attendance_records (
          user_id, workplace_id, punch_in_time, punch_in_latitude, punch_in_longitude,
          punch_in_accuracy, notes, device_info, ip_address, user_agent,
          photo_url, shift_id, status, verification_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          userId,
          workplaceId,
          timestamp || new Date(),
          latitude,
          longitude,
          accuracy,
          notes,
          deviceInfo ? JSON.stringify(deviceInfo) : null,
          ipAddress || req.ip,
          userAgent || req.get('User-Agent'),
          req.file ? `/uploads/attendance/${req.file.filename}` : null,
          shiftId,
          'active',
          'pending'
        ]
      );

      const attendance = attendanceResult.rows[0];

      // Emit real-time event
      io.to(`workplace:${workplaceId}`).emit('attendance:user-punched-in', {
        userId: userId,
        employeeName: req.user.name,
        punchInTime: attendance.punch_in_time,
        location: { latitude, longitude, accuracy },
        workplace: workplace.name
      });

      // Cache attendance data
      const cacheKey = `attendance:${userId}:${new Date().toISOString().split('T')[0]}`;
      await redis.setex(cacheKey, 3600, JSON.stringify(attendance));

      res.json({
        success: true,
        message: 'Punch in successful',
        data: {
          attendanceId: attendance.id,
          punchInTime: attendance.punch_in_time,
          workplace: {
            id: workplace.id,
            name: workplace.name,
            address: workplace.address
          },
          location: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            accuracy: parseFloat(accuracy),
            isWithinRadius: isWithinGeofence
          },
          shift: shift ? {
            id: shift.id,
            name: shift.name,
            startTime: shift.start_time,
            endTime: shift.end_time
          } : null,
          status: 'active',
          photoUrl: attendance.photo_url,
          verificationStatus: 'pending'
        }
      });

    } catch (error) {
      console.error('Punch in error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Enhanced Punch Out
app.post('/api/attendance/punch-out',
  authenticateToken,
  attendanceRateLimit,
  detectGPSSpoofing,
  upload.single('photo'),
  async (req, res) => {
    try {
      const {
        latitude,
        longitude,
        accuracy,
        timestamp,
        notes,
        deviceInfo
      } = req.body;

      const userId = req.user.id;

      // Get current active attendance
      const attendanceResult = await pool.query(
        'SELECT * FROM attendance_records WHERE user_id = $1 AND date = CURRENT_DATE AND punch_out_time IS NULL',
        [userId]
      );

      if (attendanceResult.rows.length === 0) {
        return res.status(400).json({ error: 'No active punch in found' });
      }

      const attendance = attendanceResult.rows[0];

      // Get breaks for this attendance
      const breaksResult = await pool.query(
        'SELECT * FROM breaks WHERE attendance_id = $1',
        [attendance.id]
      );

      const breaks = breaksResult.rows;

      // Calculate work hours
      const punchOutTime = timestamp || new Date();
      const workHours = workHoursService.calculateWorkHours(
        new Date(attendance.punch_in_time).getTime(),
        new Date(punchOutTime).getTime(),
        breaks
      );

      // Update attendance record
      const updateResult = await pool.query(
        `UPDATE attendance_records SET 
          punch_out_time = $1,
          punch_out_latitude = $2,
          punch_out_longitude = $3,
          punch_out_accuracy = $4,
          notes = CASE WHEN notes IS NULL THEN $5 ELSE notes || ' | ' || $5 END,
          device_info = CASE WHEN device_info IS NULL THEN $6 ELSE device_info || $6 END,
          photo_url = CASE WHEN photo_url IS NULL THEN $7 ELSE photo_url || ' | ' || $7 END,
          total_work_hours = $8,
          net_work_hours = $9,
          total_break_hours = $10,
          overtime_hours = $11,
          status = 'completed'
        WHERE id = $12 RETURNING *`,
        [
          punchOutTime,
          latitude,
          longitude,
          accuracy,
          notes,
          deviceInfo ? JSON.stringify(deviceInfo) : null,
          req.file ? `/uploads/attendance/${req.file.filename}` : null,
          workHours.totalHours,
          workHours.netHours,
          workHours.breakHours,
          workHours.netHours > 8 ? workHours.netHours - 8 : 0,
          attendance.id
        ]
      );

      const updatedAttendance = updateResult.rows[0];

      // Emit real-time event
      io.to(`workplace:${attendance.workplace_id}`).emit('attendance:user-punched-out', {
        userId: userId,
        employeeName: req.user.name,
        punchOutTime: updatedAttendance.punch_out_time,
        workHours: workHours.netHours
      });

      // Clear cache
      const cacheKey = `attendance:${userId}:${new Date().toISOString().split('T')[0]}`;
      await redis.del(cacheKey);

      res.json({
        success: true,
        message: 'Punch out successful',
        data: {
          attendanceId: updatedAttendance.id,
          punchOutTime: updatedAttendance.punch_out_time,
          totalWorkHours: workHours.totalHours,
          netWorkHours: workHours.netHours,
          breakHours: workHours.breakHours,
          overtimeHours: workHours.netHours > 8 ? workHours.netHours - 8 : 0,
          location: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            accuracy: parseFloat(accuracy)
          },
          photoUrl: updatedAttendance.photo_url,
          summary: {
            totalBreaks: breaks.length,
            breakTypes: [...new Set(breaks.map(b => b.type))],
            onTime: true, // Add logic to determine if on time
            lateMinutes: 0 // Add logic to calculate late minutes
          }
        }
      });

    } catch (error) {
      console.error('Punch out error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Start Break
app.post('/api/attendance/break/start',
  authenticateToken,
  attendanceRateLimit,
  async (req, res) => {
    try {
      const { type, notes, location } = req.body;
      const userId = req.user.id;

      // Validate break type
      if (!attendanceValidationRules.breaks.breakTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid break type' });
      }

      // Get current active attendance
      const attendanceResult = await pool.query(
        'SELECT * FROM attendance_records WHERE user_id = $1 AND date = CURRENT_DATE AND punch_out_time IS NULL',
        [userId]
      );

      if (attendanceResult.rows.length === 0) {
        return res.status(400).json({ error: 'No active attendance found' });
      }

      const attendance = attendanceResult.rows[0];

      // Check if already on break
      const activeBreakResult = await pool.query(
        'SELECT * FROM breaks WHERE attendance_id = $1 AND end_time IS NULL',
        [attendance.id]
      );

      if (activeBreakResult.rows.length > 0) {
        return res.status(400).json({ error: 'Already on break' });
      }

      // Insert break record
      const breakResult = await pool.query(
        `INSERT INTO breaks (
          attendance_id, type, start_time, notes, location
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          attendance.id,
          type,
          new Date(),
          notes,
          location ? JSON.stringify(location) : null
        ]
      );

      const breakRecord = breakResult.rows[0];

      // Update attendance record
      await pool.query(
        'UPDATE attendance_records SET break_start_time = $1, status = $2 WHERE id = $3',
        [breakRecord.start_time, 'on_break', attendance.id]
      );

      // Emit real-time event
      io.to(`workplace:${attendance.workplace_id}`).emit('attendance:user-break-start', {
        userId: userId,
        employeeName: req.user.name,
        breakType: type,
        startTime: breakRecord.start_time
      });

      res.json({
        success: true,
        message: 'Break started',
        data: {
          breakId: breakRecord.id,
          startTime: breakRecord.start_time,
          type: breakRecord.type,
          attendanceId: attendance.id
        }
      });

    } catch (error) {
      console.error('Start break error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// End Break
app.post('/api/attendance/break/end',
  authenticateToken,
  attendanceRateLimit,
  async (req, res) => {
    try {
      const { notes } = req.body;
      const userId = req.user.id;

      // Get current active attendance
      const attendanceResult = await pool.query(
        'SELECT * FROM attendance_records WHERE user_id = $1 AND date = CURRENT_DATE AND punch_out_time IS NULL',
        [userId]
      );

      if (attendanceResult.rows.length === 0) {
        return res.status(400).json({ error: 'No active attendance found' });
      }

      const attendance = attendanceResult.rows[0];

      // Get active break
      const breakResult = await pool.query(
        'SELECT * FROM breaks WHERE attendance_id = $1 AND end_time IS NULL',
        [attendance.id]
      );

      if (breakResult.rows.length === 0) {
        return res.status(400).json({ error: 'No active break found' });
      }

      const breakRecord = breakResult.rows[0];
      const endTime = new Date();
      const durationMinutes = Math.round((endTime - new Date(breakRecord.start_time)) / (1000 * 60));

      // Update break record
      const updateResult = await pool.query(
        `UPDATE breaks SET 
          end_time = $1, 
          duration_minutes = $2,
          notes = CASE WHEN notes IS NULL THEN $3 ELSE notes || ' | ' || $3 END
        WHERE id = $4 RETURNING *`,
        [endTime, durationMinutes, notes, breakRecord.id]
      );

      const updatedBreak = updateResult.rows[0];

      // Update attendance record
      await pool.query(
        'UPDATE attendance_records SET break_end_time = $1, status = $2 WHERE id = $3',
        [endTime, 'active', attendance.id]
      );

      // Emit real-time event
      io.to(`workplace:${attendance.workplace_id}`).emit('attendance:user-break-end', {
        userId: userId,
        employeeName: req.user.name,
        breakDuration: durationMinutes
      });

      res.json({
        success: true,
        message: 'Break ended',
        data: {
          breakId: updatedBreak.id,
          endTime: updatedBreak.end_time,
          durationMinutes: updatedBreak.duration_minutes,
          totalBreakTime: durationMinutes
        }
      });

    } catch (error) {
      console.error('End break error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get Current Status
app.get('/api/attendance/current',
  authenticateToken,
  async (req, res) => {
    // Mock response for testing when database is not available
    if (!pool) {
      return res.json({
        success: true,
        data: {
          isPunchedIn: false,
          currentAttendance: null
        }
      });
    }
    try {
      const userId = req.user.id;

      // Get current attendance
      const attendanceResult = await pool.query(
        `SELECT ar.*, w.name as workplace_name, w.address as workplace_address
         FROM attendance_records ar
         LEFT JOIN workplaces w ON ar.workplace_id = w.id
         WHERE ar.user_id = $1 AND ar.date = CURRENT_DATE AND ar.punch_out_time IS NULL`,
        [userId]
      );

      if (attendanceResult.rows.length === 0) {
        return res.json({
          success: true,
          data: {
            isPunchedIn: false,
            currentAttendance: null
          }
        });
      }

      const attendance = attendanceResult.rows[0];

      // Get current break if any
      const breakResult = await pool.query(
        'SELECT * FROM breaks WHERE attendance_id = $1 AND end_time IS NULL',
        [attendance.id]
      );

      const currentBreak = breakResult.rows[0] || null;

      // Calculate current work hours
      const currentTime = new Date();
      const workHours = workHoursService.calculateWorkHours(
        new Date(attendance.punch_in_time).getTime(),
        currentTime.getTime(),
        currentBreak ? [currentBreak] : []
      );

      res.json({
        success: true,
        data: {
          isPunchedIn: true,
          currentAttendance: {
            id: attendance.id,
            punchInTime: attendance.punch_in_time,
            workplace: {
              id: attendance.workplace_id,
              name: attendance.workplace_name,
              address: attendance.workplace_address
            },
            currentBreak: currentBreak ? {
              id: currentBreak.id,
              type: currentBreak.type,
              startTime: currentBreak.start_time,
              durationMinutes: Math.round((currentTime - new Date(currentBreak.start_time)) / (1000 * 60))
            } : null,
            totalWorkHours: workHours.totalHours,
            status: currentBreak ? 'on_break' : 'active'
          }
        }
      });

    } catch (error) {
      console.error('Get current status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get Team Status (Manager View)
app.get('/api/attendance/team/status',
  authenticateToken,
  authorizeRole(['manager', 'admin']),
  async (req, res) => {
    try {
      const { workplaceId, shiftId, date } = req.query;
      const managerId = req.user.id;

      let query = `
        SELECT 
          u.id as user_id,
          u.name as employee_name,
          ar.status,
          ar.punch_in_time,
          ar.total_work_hours,
          ar.punch_in_latitude,
          ar.punch_in_longitude,
          ar.last_updated
        FROM users u
        LEFT JOIN attendance_records ar ON u.id = ar.user_id AND ar.date = $1
        WHERE u.role = 'employee'
      `;

      const queryParams = [date || new Date().toISOString().split('T')[0]];
      let paramIndex = 2;

      if (workplaceId) {
        query += ` AND ar.workplace_id = $${paramIndex}`;
        queryParams.push(workplaceId);
        paramIndex++;
      }

      if (shiftId) {
        query += ` AND ar.shift_id = $${paramIndex}`;
        queryParams.push(shiftId);
        paramIndex++;
      }

      const result = await pool.query(query, queryParams);

      const teamStatus = result.rows.map(row => ({
        userId: row.user_id,
        employeeName: row.employee_name,
        status: row.status || 'absent',
        punchInTime: row.punch_in_time,
        workHours: row.total_work_hours || 0,
        location: row.punch_in_latitude ? {
          latitude: row.punch_in_latitude,
          longitude: row.punch_in_longitude
        } : null,
        lastSeen: row.last_updated
      }));

      const summary = {
        totalEmployees: teamStatus.length,
        present: teamStatus.filter(s => s.status === 'active' || s.status === 'on_break').length,
        absent: teamStatus.filter(s => s.status === 'absent').length,
        late: teamStatus.filter(s => s.status === 'late').length,
        onBreak: teamStatus.filter(s => s.status === 'on_break').length
      };

      res.json({
        success: true,
        data: {
          teamStatus,
          summary
        }
      });

    } catch (error) {
      console.error('Get team status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Request Approval
app.post('/api/attendance/approval/request',
  authenticateToken,
  attendanceRateLimit,
  async (req, res) => {
    try {
      const { type, reason, evidence, requestedDate, requestedTime } = req.body;
      const userId = req.user.id;

      // Validate approval type
      if (!['late', 'early_leave', 'overtime', 'break_extension'].includes(type)) {
        return res.status(400).json({ error: 'Invalid approval type' });
      }

      // Get attendance record for the requested date
      const attendanceResult = await pool.query(
        'SELECT * FROM attendance_records WHERE user_id = $1 AND date = $2',
        [userId, requestedDate]
      );

      if (attendanceResult.rows.length === 0) {
        return res.status(404).json({ error: 'No attendance record found for the specified date' });
      }

      const attendance = attendanceResult.rows[0];

      // Check if approval already exists
      const existingApproval = await pool.query(
        'SELECT * FROM approval_requests WHERE attendance_id = $1 AND type = $2 AND status = $3',
        [attendance.id, type, 'pending']
      );

      if (existingApproval.rows.length > 0) {
        return res.status(400).json({ error: 'Approval request already exists for this type' });
      }

      // Insert approval request
      const approvalResult = await pool.query(
        `INSERT INTO approval_requests (
          attendance_id, requester_id, type, reason, evidence
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          attendance.id,
          userId,
          type,
          reason,
          evidence ? JSON.stringify(evidence) : null
        ]
      );

      const approval = approvalResult.rows[0];

      // Auto-approve for managers
      if (req.user.role === 'manager' && attendanceValidationRules.approvals.autoApprovalForManagers) {
        await pool.query(
          `UPDATE approval_requests SET 
            status = 'approved', 
            approver_id = $1, 
            approved_at = $2 
          WHERE id = $3`,
          [userId, new Date(), approval.id]
        );

        approval.status = 'approved';
        approval.approver_id = userId;
        approval.approved_at = new Date();
      }

      res.json({
        success: true,
        message: 'Approval request submitted',
        data: {
          requestId: approval.id,
          status: approval.status,
          submittedAt: approval.requested_at,
          estimatedResponseTime: '2-4 hours'
        }
      });

    } catch (error) {
      console.error('Request approval error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Approve/Reject Request
app.post('/api/attendance/approval/:requestId/action',
  authenticateToken,
  authorizeRole(['manager', 'admin']),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { action, notes, effectiveDate } = req.body;
      const approverId = req.user.id;

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      // Get approval request
      const approvalResult = await pool.query(
        'SELECT * FROM approval_requests WHERE id = $1',
        [requestId]
      );

      if (approvalResult.rows.length === 0) {
        return res.status(404).json({ error: 'Approval request not found' });
      }

      const approval = approvalResult.rows[0];

      if (approval.status !== 'pending') {
        return res.status(400).json({ error: 'Approval request already processed' });
      }

      // Update approval request
      const updateResult = await pool.query(
        `UPDATE approval_requests SET 
          status = $1, 
          approver_id = $2, 
          approved_at = $3,
          notes = $4
        WHERE id = $5 RETURNING *`,
        [action === 'approve' ? 'approved' : 'rejected', approverId, new Date(), notes, requestId]
      );

      const updatedApproval = updateResult.rows[0];

      // Update attendance record if approved
      if (action === 'approve') {
        await pool.query(
          `UPDATE attendance_records SET 
            verification_status = 'approved',
            approved_by = $1,
            approved_at = $2
          WHERE id = $3`,
          [approverId, new Date(), approval.attendance_id]
        );
      }

      res.json({
        success: true,
        message: `Request ${action}d`,
        data: {
          requestId: updatedApproval.id,
          status: updatedApproval.status,
          approvedAt: updatedApproval.approved_at,
          approvedBy: approverId
        }
      });

    } catch (error) {
      console.error('Approve/reject error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get available workplaces
app.get('/api/attendance/workplaces', authenticateToken, async (req, res) => {
  try {
    if (!pool) {
      // Mock response for testing when database is not available
      return res.json({
        success: true,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Main Office',
            address: '123 Main Street, New York, NY 10001',
            latitude: 40.7128,
            longitude: -74.0060,
            radius: 100,
            isActive: true
          }
        ]
      });
    }

    const result = await pool.query(
      'SELECT id, name, address, latitude, longitude, radius, is_active FROM workplaces WHERE is_active = true ORDER BY name'
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        address: row.address,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        radius: row.radius,
        isActive: row.is_active
      }))
    });

  } catch (error) {
    console.error('Error getting workplaces:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Attendance History
app.get('/api/attendance/history',
  authenticateToken,
  async (req, res) => {
    try {
      const { startDate, endDate, page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          ar.*,
          w.name as workplace_name,
          s.name as shift_name,
          COUNT(b.id) as break_count,
          SUM(b.duration_minutes) as total_break_minutes
        FROM attendance_records ar
        LEFT JOIN workplaces w ON ar.workplace_id = w.id
        LEFT JOIN shifts s ON ar.shift_id = s.id
        LEFT JOIN breaks b ON ar.id = b.attendance_id
        WHERE ar.user_id = $1
      `;

      const queryParams = [userId];
      let paramIndex = 2;

      if (startDate) {
        query += ` AND ar.date >= $${paramIndex}`;
        queryParams.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND ar.date <= $${paramIndex}`;
        queryParams.push(endDate);
        paramIndex++;
      }

      query += ` GROUP BY ar.id, w.name, s.name ORDER BY ar.date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit), offset);

      const result = await pool.query(query, queryParams);

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) FROM attendance_records 
        WHERE user_id = $1
        ${startDate ? 'AND date >= $2' : ''}
        ${endDate ? `AND date <= $${startDate ? '3' : '2'}` : ''}
      `;

      const countParams = [userId];
      if (startDate) countParams.push(startDate);
      if (endDate) countParams.push(endDate);

      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          attendance: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get attendance history error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join workplace room
  socket.on('join-workplace', (workplaceId) => {
    socket.join(`workplace:${workplaceId}`);
    console.log(`Client ${socket.id} joined workplace ${workplaceId}`);
  });

  // Leave workplace room
  socket.on('leave-workplace', (workplaceId) => {
    socket.leave(`workplace:${workplaceId}`);
    console.log(`Client ${socket.id} left workplace ${workplaceId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Attendance Service running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;
