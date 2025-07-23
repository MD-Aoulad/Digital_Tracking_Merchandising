# Backend Implementation Prompt: Industry-Grade Attendance System

## Overview
You are tasked with implementing the backend services for an industry-grade attendance management system for the Digital Tracking Merchandising platform. This system must provide real-time attendance tracking, comprehensive reporting, and seamless integration with existing microservices.

## Current System Analysis

### Existing Infrastructure
- **Main Backend**: Express.js with PostgreSQL (backend/server.js)
- **Microservices**: Separate attendance-service with basic functionality
- **Database**: PostgreSQL with existing attendance tables
- **Authentication**: JWT-based with role-based access control
- **File Storage**: Multer for photo uploads
- **Real-time**: Socket.io for live updates

### Current Attendance Implementation
- ✅ Basic punch in/out functionality
- ✅ GPS location tracking
- ✅ Photo upload capability
- ✅ Workplace management
- ✅ Basic reporting

## Technical Requirements

### 1. Database Schema Enhancements

#### 1.1 Core Attendance Tables (Enhanced)
```sql
-- Enhanced attendance_records table
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS:
- break_start_time TIMESTAMP WITH TIME ZONE,
- break_end_time TIMESTAMP WITH TIME ZONE,
- total_break_hours DECIMAL(5,2),
- net_work_hours DECIMAL(5,2),
- clock_in_method VARCHAR(50),
- clock_out_method VARCHAR(50),
- device_info JSONB,
- ip_address INET,
- user_agent TEXT,
- verification_status VARCHAR(20) DEFAULT 'pending',
- approved_by UUID,
- approved_at TIMESTAMP WITH TIME ZONE,
- rejection_reason TEXT,
- overtime_hours DECIMAL(5,2),
- shift_id UUID,
- geofence_zone_id UUID;

-- New breaks table
CREATE TABLE breaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id UUID REFERENCES attendance_records(id),
    type VARCHAR(20) NOT NULL, -- 'lunch', 'coffee', 'rest', 'other'
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    notes TEXT,
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- New approval_requests table
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id UUID REFERENCES attendance_records(id),
    requester_id UUID NOT NULL,
    approver_id UUID,
    type VARCHAR(20) NOT NULL, -- 'late', 'early_leave', 'overtime', 'break_extension'
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    evidence JSONB -- supporting documents/photos
);

-- New geofence_zones table
CREATE TABLE geofence_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workplace_id UUID REFERENCES workplaces(id),
    name VARCHAR(100) NOT NULL,
    center_latitude DECIMAL(10, 8) NOT NULL,
    center_longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER DEFAULT 100,
    allowed_methods TEXT[] DEFAULT ARRAY['gps', 'qr', 'facial'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- New shifts table
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workplace_id UUID REFERENCES workplaces(id),
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. API Endpoints Implementation

#### 2.1 Core Attendance Endpoints

**Enhanced Punch In**
```javascript
POST /api/attendance/punch-in
Content-Type: multipart/form-data
Authorization: Bearer <token>

Request Body:
{
  "workplaceId": "uuid",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 5,
  "timestamp": "2025-01-13T10:30:00Z",
  "notes": "Starting work",
  "deviceInfo": {
    "device": "iPhone 15",
    "os": "iOS 17.0",
    "appVersion": "1.0.0"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "photo": [file],
  "shiftId": "uuid" // optional
}

Response:
{
  "success": true,
  "message": "Punch in successful",
  "data": {
    "attendanceId": "uuid",
    "punchInTime": "2025-01-13T10:30:00Z",
    "workplace": {
      "id": "uuid",
      "name": "Main Office",
      "address": "123 Main St"
    },
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "accuracy": 5,
      "distance": 25.5,
      "isWithinRadius": true
    },
    "shift": {
      "id": "uuid",
      "name": "Morning Shift",
      "startTime": "09:00:00",
      "endTime": "17:00:00"
    },
    "status": "active",
    "photoUrl": "/uploads/attendance/photo-uuid.jpg",
    "verificationStatus": "pending"
  }
}
```

**Enhanced Punch Out**
```javascript
POST /api/attendance/punch-out
Content-Type: multipart/form-data
Authorization: Bearer <token>

Request Body:
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 5,
  "timestamp": "2025-01-13T18:30:00Z",
  "notes": "Ending work",
  "deviceInfo": {...},
  "photo": [file]
}

Response:
{
  "success": true,
  "message": "Punch out successful",
  "data": {
    "attendanceId": "uuid",
    "punchOutTime": "2025-01-13T18:30:00Z",
    "totalWorkHours": 8.0,
    "netWorkHours": 7.0,
    "breakHours": 1.0,
    "overtimeHours": 0.5,
    "location": {...},
    "photoUrl": "/uploads/attendance/photo-uuid.jpg",
    "summary": {
      "totalBreaks": 2,
      "breakTypes": ["lunch", "coffee"],
      "onTime": true,
      "lateMinutes": 0
    }
  }
}
```

#### 2.2 Break Management Endpoints

**Start Break**
```javascript
POST /api/attendance/break/start
Authorization: Bearer <token>

Request Body:
{
  "type": "lunch", // 'lunch', 'coffee', 'rest', 'other'
  "notes": "Lunch break",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}

Response:
{
  "success": true,
  "message": "Break started",
  "data": {
    "breakId": "uuid",
    "startTime": "2025-01-13T12:00:00Z",
    "type": "lunch",
    "attendanceId": "uuid"
  }
}
```

**End Break**
```javascript
POST /api/attendance/break/end
Authorization: Bearer <token>

Request Body:
{
  "notes": "Back from lunch"
}

Response:
{
  "success": true,
  "message": "Break ended",
  "data": {
    "breakId": "uuid",
    "endTime": "2025-01-13T13:00:00Z",
    "durationMinutes": 60,
    "totalBreakTime": 60
  }
}
```

#### 2.3 Approval System Endpoints

**Request Approval**
```javascript
POST /api/attendance/approval/request
Authorization: Bearer <token>

Request Body:
{
  "type": "late", // 'late', 'early_leave', 'overtime', 'break_extension'
  "reason": "Traffic was heavy this morning",
  "evidence": {
    "photos": ["base64_photo_1", "base64_photo_2"],
    "documents": ["base64_doc_1"]
  },
  "requestedDate": "2025-01-13",
  "requestedTime": "10:30:00"
}

Response:
{
  "success": true,
  "message": "Approval request submitted",
  "data": {
    "requestId": "uuid",
    "status": "pending",
    "submittedAt": "2025-01-13T10:30:00Z",
    "estimatedResponseTime": "2-4 hours"
  }
}
```

**Approve/Reject Request**
```javascript
POST /api/attendance/approval/:requestId/action
Authorization: Bearer <admin-token>

Request Body:
{
  "action": "approve", // 'approve' or 'reject'
  "notes": "Approved due to traffic conditions",
  "effectiveDate": "2025-01-13"
}

Response:
{
  "success": true,
  "message": "Request approved",
  "data": {
    "requestId": "uuid",
    "status": "approved",
    "approvedAt": "2025-01-13T11:00:00Z",
    "approvedBy": "admin-uuid"
  }
}
```

#### 2.4 Real-time Endpoints

**Get Current Status**
```javascript
GET /api/attendance/current
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "isPunchedIn": true,
    "currentAttendance": {
      "id": "uuid",
      "punchInTime": "2025-01-13T09:00:00Z",
      "workplace": {...},
      "shift": {...},
      "currentBreak": {
        "id": "uuid",
        "type": "lunch",
        "startTime": "2025-01-13T12:00:00Z",
        "durationMinutes": 45
      },
      "totalWorkHours": 3.0,
      "status": "on_break"
    }
  }
}
```

**Get Team Status (Manager View)**
```javascript
GET /api/attendance/team/status
Authorization: Bearer <manager-token>

Query Parameters:
- workplaceId: string
- shiftId: string
- date: string

Response:
{
  "success": true,
  "data": {
    "teamStatus": [
      {
        "userId": "uuid",
        "employeeName": "John Doe",
        "status": "active", // 'active', 'on_break', 'absent', 'late'
        "punchInTime": "2025-01-13T09:00:00Z",
        "currentBreak": {...},
        "workHours": 3.0,
        "location": {...},
        "lastSeen": "2025-01-13T12:30:00Z"
      }
    ],
    "summary": {
      "totalEmployees": 25,
      "present": 22,
      "absent": 2,
      "late": 1,
      "onBreak": 5
    }
  }
}
```

### 3. Business Logic Implementation

#### 3.1 Attendance Validation Rules
```javascript
// Implement these validation rules in your service layer

const attendanceValidationRules = {
  // Punch In Rules
  punchIn: {
    maxDistanceFromWorkplace: 100, // meters
    allowedTimeWindow: {
      beforeShift: 30, // minutes before shift start
      afterShift: 15   // minutes after shift start
    },
    requiredFields: ['workplaceId', 'latitude', 'longitude'],
    photoRequired: true,
    preventDuplicatePunchIn: true
  },

  // Punch Out Rules
  punchOut: {
    requireActivePunchIn: true,
    minimumWorkHours: 0.5, // hours
    maximumWorkHours: 16,  // hours
    photoRequired: false
  },

  // Break Rules
  breaks: {
    minimumBreakDuration: 15, // minutes
    maximumBreakDuration: 120, // minutes
    totalBreakTimePerDay: 120, // minutes
    breakTypes: ['lunch', 'coffee', 'rest', 'other']
  },

  // Approval Rules
  approvals: {
    lateThreshold: 15, // minutes
    overtimeThreshold: 8, // hours
    approvalTimeLimit: 48, // hours
    autoApprovalForManagers: true
  }
};
```

#### 3.2 Geofencing Logic
```javascript
// Implement geofencing validation

const geofencingService = {
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    // Haversine formula implementation
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
```

#### 3.3 Work Hours Calculation
```javascript
// Implement accurate work hours calculation

const workHoursService = {
  calculateWorkHours: (punchIn, punchOut, breaks) => {
    const totalMinutes = (punchOut - punchIn) / (1000 * 60);
    const breakMinutes = breaks.reduce((total, break) => {
      return total + ((break.endTime - break.startTime) / (1000 * 60));
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
```

### 4. Real-time Features Implementation

#### 4.1 WebSocket Events
```javascript
// Implement these WebSocket events for real-time updates

const socketEvents = {
  // Client events (from frontend)
  'attendance:punch-in': (data) => {
    // Handle punch in and broadcast to team
    socket.broadcast.to(`workplace:${data.workplaceId}`).emit('attendance:user-punched-in', {
      userId: data.userId,
      employeeName: data.employeeName,
      punchInTime: data.punchInTime,
      location: data.location
    });
  },

  'attendance:punch-out': (data) => {
    // Handle punch out and broadcast to team
    socket.broadcast.to(`workplace:${data.workplaceId}`).emit('attendance:user-punched-out', {
      userId: data.userId,
      employeeName: data.employeeName,
      punchOutTime: data.punchOutTime,
      workHours: data.workHours
    });
  },

  'attendance:break-start': (data) => {
    // Handle break start
    socket.broadcast.to(`workplace:${data.workplaceId}`).emit('attendance:user-break-start', {
      userId: data.userId,
      employeeName: data.employeeName,
      breakType: data.breakType,
      startTime: data.startTime
    });
  },

  'attendance:break-end': (data) => {
    // Handle break end
    socket.broadcast.to(`workplace:${data.workplaceId}`).emit('attendance:user-break-end', {
      userId: data.userId,
      employeeName: data.employeeName,
      breakDuration: data.breakDuration
    });
  }
};
```

#### 4.2 Push Notifications
```javascript
// Implement push notification service

const notificationService = {
  sendAttendanceNotification: async (userId, type, data) => {
    const user = await getUserById(userId);
    
    const notifications = {
      'punch-in-success': {
        title: 'Punch In Successful',
        body: `You punched in at ${data.workplace} at ${data.time}`,
        data: { type: 'attendance', action: 'punch-in' }
      },
      'punch-out-success': {
        title: 'Punch Out Successful',
        body: `You worked ${data.hours} hours today`,
        data: { type: 'attendance', action: 'punch-out' }
      },
      'approval-request': {
        title: 'Approval Request',
        body: `${data.employeeName} requested ${data.type} approval`,
        data: { type: 'approval', requestId: data.requestId }
      },
      'approval-response': {
        title: 'Approval Response',
        body: `Your ${data.type} request was ${data.status}`,
        data: { type: 'approval', requestId: data.requestId }
      }
    };

    const notification = notifications[type];
    if (notification && user.pushToken) {
      await sendPushNotification(user.pushToken, notification);
    }
  }
};
```

### 5. Security & Performance Requirements

#### 5.1 Security Measures
```javascript
// Implement these security features

const securityMiddleware = {
  // Rate limiting for attendance endpoints
  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many attendance requests from this IP'
  }),

  // GPS spoofing detection
  detectGPSSpoofing: (req, res, next) => {
    const { latitude, longitude, accuracy, timestamp } = req.body;
    
    // Check for unrealistic accuracy
    if (accuracy && accuracy < 1) {
      return res.status(400).json({ error: 'Suspicious GPS accuracy' });
    }
    
    // Check for unrealistic location changes
    const lastLocation = req.user.lastKnownLocation;
    if (lastLocation) {
      const distance = calculateDistance(
        lastLocation.latitude, lastLocation.longitude,
        latitude, longitude
      );
      const timeDiff = Date.now() - lastLocation.timestamp;
      
      // If distance is too large for time difference, flag as suspicious
      if (distance > (timeDiff / 1000) * 50) { // 50 m/s max speed
        return res.status(400).json({ error: 'Suspicious location change' });
      }
    }
    
    next();
  },

  // Photo verification
  verifyPhoto: async (req, res, next) => {
    if (req.file) {
      // Check file size
      if (req.file.size > 5 * 1024 * 1024) { // 5MB limit
        return res.status(400).json({ error: 'Photo file too large' });
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Invalid photo format' });
      }
      
      // Optional: Add face detection
      // const hasFace = await detectFace(req.file.path);
      // if (!hasFace) {
      //   return res.status(400).json({ error: 'No face detected in photo' });
      // }
    }
    
    next();
  }
};
```

#### 5.2 Performance Optimizations
```javascript
// Implement these performance optimizations

const performanceOptimizations = {
  // Database indexing
  createIndexes: async () => {
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_attendance_user_date 
      ON attendance_records(user_id, date);
      
      CREATE INDEX IF NOT EXISTS idx_attendance_workplace_date 
      ON attendance_records(workplace_id, date);
      
      CREATE INDEX IF NOT EXISTS idx_attendance_status 
      ON attendance_records(status);
      
      CREATE INDEX IF NOT EXISTS idx_breaks_attendance 
      ON breaks(attendance_id);
      
      CREATE INDEX IF NOT EXISTS idx_approvals_status 
      ON approval_requests(status);
    `);
  },

  // Caching strategy
  cacheAttendanceData: async (userId, date) => {
    const cacheKey = `attendance:${userId}:${date}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const data = await getAttendanceData(userId, date);
    await redis.setex(cacheKey, 3600, JSON.stringify(data)); // 1 hour cache
    
    return data;
  },

  // Pagination optimization
  optimizePagination: (query, page, limit) => {
    const offset = (page - 1) * limit;
    return {
      ...query,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
  }
};
```

### 6. Testing Requirements

#### 6.1 Unit Tests
```javascript
// Implement comprehensive unit tests

describe('Attendance Service', () => {
  describe('Punch In', () => {
    it('should successfully punch in with valid data', async () => {
      // Test implementation
    });
    
    it('should reject punch in outside geofence', async () => {
      // Test implementation
    });
    
    it('should prevent duplicate punch in', async () => {
      // Test implementation
    });
  });
  
  describe('Work Hours Calculation', () => {
    it('should calculate correct work hours with breaks', async () => {
      // Test implementation
    });
    
    it('should handle overtime calculation', async () => {
      // Test implementation
    });
  });
  
  describe('Approval System', () => {
    it('should create approval request for late punch in', async () => {
      // Test implementation
    });
    
    it('should auto-approve manager requests', async () => {
      // Test implementation
    });
  });
});
```

#### 6.2 Integration Tests
```javascript
// Implement integration tests

describe('Attendance API Integration', () => {
  it('should handle complete attendance workflow', async () => {
    // Test complete punch in -> break -> punch out workflow
  });
  
  it('should handle real-time updates via WebSocket', async () => {
    // Test WebSocket event handling
  });
  
  it('should handle approval workflow', async () => {
    // Test approval request and response workflow
  });
});
```

### 7. Deployment & Monitoring

#### 7.1 Environment Configuration
```javascript
// Required environment variables

const requiredEnvVars = {
  // Database
  DATABASE_URL: 'postgresql://user:pass@host:port/db',
  
  // Redis for caching and sessions
  REDIS_URL: 'redis://localhost:6379',
  
  // File storage
  UPLOAD_PATH: '/uploads/attendance',
  MAX_FILE_SIZE: '5242880', // 5MB
  
  // Geofencing
  DEFAULT_GEOFENCE_RADIUS: '100', // meters
  
  // Notifications
  PUSH_NOTIFICATION_KEY: 'your-push-key',
  
  // Security
  JWT_SECRET: 'your-jwt-secret',
  RATE_LIMIT_WINDOW: '900000', // 15 minutes
  RATE_LIMIT_MAX: '100'
};
```

#### 7.2 Health Checks
```javascript
// Implement health check endpoints

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check Redis connection
    await redis.ping();
    
    // Check file system
    const uploadPath = process.env.UPLOAD_PATH || '/uploads';
    await fs.access(uploadPath);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        fileSystem: 'accessible'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

### 8. Implementation Priority

#### Phase 1: Core Functionality (Week 1-2)
1. Enhanced database schema
2. Basic punch in/out with GPS validation
3. Photo upload and storage
4. Basic reporting endpoints

#### Phase 2: Advanced Features (Week 3-4)
1. Break management system
2. Approval workflow
3. Real-time WebSocket integration
4. Push notifications

#### Phase 3: Optimization (Week 5-6)
1. Performance optimizations
2. Security enhancements
3. Comprehensive testing
4. Monitoring and logging

### 9. Success Criteria

- ✅ All employees can punch in/out with GPS validation
- ✅ Real-time attendance dashboard updates
- ✅ Break management with automatic calculations
- ✅ Approval system for exceptions
- ✅ Comprehensive reporting and analytics
- ✅ Mobile-responsive API endpoints
- ✅ 99.9% uptime with proper error handling
- ✅ Sub-second response times for all endpoints
- ✅ Complete test coverage (>90%)
- ✅ Security audit compliance

### 10. Integration Points

- **User Service**: Employee data and authentication
- **Workplace Service**: Location and geofence data
- **Notification Service**: Push notifications and alerts
- **Reporting Service**: Analytics and data export
- **Mobile App**: Real-time sync and offline support

This implementation will provide a robust, scalable, and feature-rich attendance management system that meets enterprise requirements and provides excellent user experience. 