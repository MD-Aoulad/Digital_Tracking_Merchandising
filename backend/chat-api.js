const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');

const router = express.Router();

// JWT Secret - should match the main server
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware for chat routes
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

// Database connection - but don't test it immediately
let pool = null;

// Initialize database connection lazily
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/workforce_management',
    });
  }
  return pool;
}

// WebSocket server setup - will be attached to main server
let wss = null;

// Store active connections
const connections = new Map();

// Check if chat tables exist
async function checkChatTables() {
  try {
    // If no DATABASE_URL is provided, use in-memory storage
    if (!process.env.DATABASE_URL) {
      console.log('📝 Using in-memory chat storage (no database configured)');
      return true; // Allow WebSocket to work with in-memory storage
    }
    
    const dbPool = getPool();
    const result = await dbPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_channels'
      );
    `);
    return result.rows[0].exists;
  } catch (error) {
    console.log('Chat tables check failed:', error.message);
    console.log('📝 Falling back to in-memory chat storage');
    return true; // Allow WebSocket to work even if database check fails
  }
}

// Function to initialize WebSocket server with main server
async function initializeWebSocket(server) {
  try {
    // Check if chat tables exist before initializing WebSocket
    const tablesExist = await checkChatTables();
    if (!tablesExist) {
      console.log('⚠️ Chat tables not found - WebSocket server will not be initialized');
      return;
    }

    wss = new WebSocket.Server({ server });
    
    // WebSocket connection handling
    wss.on('connection', (ws, req) => {
      const userId = req.url.split('=')[1]; // Extract user ID from query string
      if (userId) {
        connections.set(userId, ws);
        console.log(`🔌 WebSocket connected for user ${userId}`);
      }

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          handleWebSocketMessage(userId, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        if (userId) {
          connections.delete(userId);
          console.log(`🔌 WebSocket disconnected for user ${userId}`);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (userId) {
          connections.delete(userId);
        }
      });
    });

    console.log('✅ WebSocket server initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize WebSocket server:', error);
  }
}

// Handle WebSocket messages
function handleWebSocketMessage(userId, data) {
  switch (data.type) {
    case 'typing_start':
      broadcastToChannel(data.channelId, {
        type: 'typing_start',
        userId,
        channelId: data.channelId
      });
      break;
    case 'typing_stop':
      broadcastToChannel(data.channelId, {
        type: 'typing_stop',
        userId,
        channelId: data.channelId
      });
      break;
    case 'message_read':
      broadcastToChannel(data.channelId, {
        type: 'message_read',
        userId,
        messageId: data.messageId,
        channelId: data.channelId
      });
      break;
  }
}

// Broadcast to channel members
async function broadcastToChannel(channelId, data) {
  try {
    // Check if tables exist first
    const tablesExist = await checkChatTables();
    if (!tablesExist) {
      console.log('Chat tables not available for broadcasting');
      return;
    }

    // If no database, broadcast to all connected users (simple in-memory approach)
    if (!process.env.DATABASE_URL) {
      connections.forEach((ws, userId) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      });
      return;
    }

    // Get channel members and broadcast to them
    const dbPool = getPool();
    const result = await dbPool.query(
      'SELECT user_id FROM chat_channel_members WHERE channel_id = $1 AND is_active = true',
      [channelId]
    );
    
    result.rows.forEach(row => {
      const ws = connections.get(row.user_id);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  } catch (error) {
    console.error('Broadcast error:', error);
  }
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/chat');
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
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Helper to sanitize integer input
function sanitizeInt(value, defaultValue = null) {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return defaultValue;
    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed) && Number.isInteger(parsed)) return parsed;
  }
  return defaultValue;
}

// Helper to sanitize array of integers
function sanitizeIntArray(arr, defaultValue = []) {
  if (!Array.isArray(arr)) return defaultValue;
  const sanitized = [];
  for (const item of arr) {
    const sanitizedItem = sanitizeInt(item);
    if (sanitizedItem !== null) {
      sanitized.push(sanitizedItem);
    }
  }
  return sanitized;
}

// Helper to validate required integer
function validateRequiredInt(value, fieldName) {
  // Handle null/undefined
  if (value === null || value === undefined) {
    throw new Error(`Invalid ${fieldName}: value is null or undefined`);
  }
  
  // Handle empty string
  if (value === '') {
    throw new Error(`Invalid ${fieldName}: value is empty string`);
  }
  
  // Handle string numbers and convert to integer
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  // Handle numbers directly
  if (typeof value === 'number' && !isNaN(value)) {
    return Math.floor(value);
  }
  
  const sanitized = sanitizeInt(value);
  if (sanitized === null) {
    throw new Error(`Invalid ${fieldName}: must be a valid integer (received: ${value}, type: ${typeof value})`);
  }
  return sanitized;
}

// ============================================================================
// CHAT SYSTEM HEALTH CHECK
// ============================================================================

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const tablesExist = await checkChatTables();
    res.json({
      status: tablesExist ? 'healthy' : 'unavailable',
      tablesExist,
      message: tablesExist ? 'Chat system is ready' : 'Chat tables not found. Run database migration to enable chat features.'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// ============================================================================
// CHANNEL ENDPOINTS
// ============================================================================

// Middleware to check if chat tables exist
async function requireChatTables(req, res, next) {
  const tablesExist = await checkChatTables();
  if (!tablesExist) {
    return res.status(503).json({ 
      error: 'Chat system is not available. Please contact administrator to set up chat tables.' 
    });
  }
  next();
}

// Get user's channels
router.get('/channels', authenticateToken, requireChatTables, async (req, res) => {
  try {
    const userId = parseInt(req.user?.id, 10);
    if (!userId) {
      console.error('Invalid user ID for chat API:', req.user?.id);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const dbPool = getPool();
    const result = await dbPool.query(`
      SELECT 
        c.*,
        COUNT(cm.id) as member_count,
        (SELECT json_build_object(
          'id', m.id,
          'content', m.content,
          'senderId', m.sender_id,
          'createdAt', m.created_at
        ) FROM chat_messages m 
        WHERE m.channel_id = c.id 
        ORDER BY m.created_at DESC 
        LIMIT 1) as last_message
      FROM chat_channels c
      INNER JOIN chat_channel_members ccm ON c.id = ccm.channel_id
      LEFT JOIN chat_channel_members cm ON c.id = cm.channel_id AND cm.is_active = true
      WHERE ccm.user_id = $1 AND ccm.is_active = true
      GROUP BY c.id
      ORDER BY c.last_activity_at DESC
    `, [userId]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new channel
router.post('/channels', authenticateToken, requireChatTables, async (req, res) => {
  try {
    const userId = validateRequiredInt(req.user?.id, 'user ID');
    const { name, description, type, isPrivate, maxMembers, initialMembers } = req.body;
    const maxMembersNum = sanitizeInt(maxMembers, 100);

    const dbPool = getPool();
    const result = await dbPool.query(`
      INSERT INTO chat_channels (name, description, type, is_private, max_members, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, description, type, isPrivate, maxMembersNum, userId]);

    const channel = result.rows[0];

    // Add creator as owner
    await dbPool.query(`
      INSERT INTO chat_channel_members (channel_id, user_id, role)
      VALUES ($1, $2, 'owner')
    `, [channel.id, userId]);

    // Add initial members
    if (initialMembers && Array.isArray(initialMembers)) {
      const sanitizedMembers = sanitizeIntArray(initialMembers);
      for (const memberId of sanitizedMembers) {
        await dbPool.query(`
          INSERT INTO chat_channel_members (channel_id, user_id, role)
          VALUES ($1, $2, 'member')
        `, [channel.id, memberId]);
      }
    }

    res.json({ success: true, data: channel });
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get channel details
router.get('/channels/:id', authenticateToken, requireChatTables, async (req, res) => {
  try {
    const userId = validateRequiredInt(req.user?.id, 'user ID');
    const channelId = validateRequiredInt(req.params.id, 'channel ID');

    // Check if user is member of channel
    const dbPool = getPool();
    const memberCheck = await dbPool.query(`
      SELECT role FROM chat_channel_members 
      WHERE channel_id = $1 AND user_id = $2 AND is_active = true
    `, [channelId, userId]);

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await dbPool.query(`
      SELECT 
        c.*,
        COUNT(cm.id) as member_count,
        ccm.role as user_role
      FROM chat_channels c
      LEFT JOIN chat_channel_members cm ON c.id = cm.channel_id AND cm.is_active = true
      INNER JOIN chat_channel_members ccm ON c.id = ccm.channel_id AND ccm.user_id = $2
      WHERE c.id = $1
      GROUP BY c.id, ccm.role
    `, [channelId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching channel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// MESSAGE ENDPOINTS
// ============================================================================

// Get channel messages
router.get('/channels/:id/messages', authenticateToken, requireChatTables, async (req, res) => {
  try {
    const userId = validateRequiredInt(req.user?.id, 'user ID');
    const channelId = validateRequiredInt(req.params.id, 'channel ID');
    const page = sanitizeInt(req.query.page, 1);
    const limit = sanitizeInt(req.query.limit, 50);
    const { before } = req.query;

    // Check if user is member of channel
    const dbPool = getPool();
    const memberCheck = await dbPool.query(`
      SELECT 1 FROM chat_channel_members 
      WHERE channel_id = $1 AND user_id = $2 AND is_active = true
    `, [channelId, userId]);

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let query = `
      SELECT 
        m.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'role', u.role
        ) as sender,
        json_agg(
          json_build_object(
            'id', mr.id,
            'reactionType', mr.reaction_type,
            'userId', mr.user_id
          )
        ) FILTER (WHERE mr.id IS NOT NULL) as reactions,
        json_agg(
          json_build_object(
            'id', ma.id,
            'fileName', ma.file_name,
            'fileType', ma.file_type,
            'fileSize', ma.file_size,
            'fileUrl', ma.file_url,
            'thumbnailUrl', ma.thumbnail_url,
            'mimeType', ma.mime_type
          )
        ) FILTER (WHERE ma.id IS NOT NULL) as attachments
      FROM chat_messages m
      LEFT JOIN members u ON m.sender_id = u.id
      LEFT JOIN chat_message_reactions mr ON m.id = mr.message_id
      LEFT JOIN chat_message_attachments ma ON m.id = ma.message_id
      WHERE m.channel_id = $1 AND m.is_deleted = false
    `;

    const params = [channelId];
    let paramIndex = 2;

    if (before) {
      query += ` AND m.created_at < $${paramIndex}`;
      params.push(before);
      paramIndex++;
    }

    query += `
      GROUP BY m.id, u.id
      ORDER BY m.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, (page - 1) * limit);

    const result = await dbPool.query(query, params);

    // Mark messages as read
    await dbPool.query(`
      INSERT INTO chat_message_reads (message_id, user_id)
      SELECT m.id, $1
      FROM chat_messages m
      WHERE m.channel_id = $2 AND m.sender_id != $1
      ON CONFLICT (message_id, user_id) DO NOTHING
    `, [userId, channelId]);

    res.json({
      success: true,
      data: result.rows.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: result.rows.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/channels/:id/messages', authenticateToken, requireChatTables, async (req, res) => {
  try {
    const userId = validateRequiredInt(req.user?.id, 'user ID');
    const channelId = validateRequiredInt(req.params.id, 'channel ID');
    const { content, messageType = 'text' } = req.body;
    const replyToId = sanitizeInt(req.body.replyToId);
    const threadId = sanitizeInt(req.body.threadId);

    // Check if user is member of channel
    const dbPool = getPool();
    const memberCheck = await dbPool.query(`
      SELECT role FROM chat_channel_members 
      WHERE channel_id = $1 AND user_id = $2 AND is_active = true
    `, [channelId, userId]);

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await dbPool.query(`
      INSERT INTO chat_messages (channel_id, sender_id, content, message_type, reply_to_id, thread_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [channelId, userId, content, messageType, replyToId, threadId]);

    const message = result.rows[0];

    // Update channel last activity
    await dbPool.query(`
      UPDATE chat_channels 
      SET last_activity_at = NOW() 
      WHERE id = $1
    `, [channelId]);

    // Log audit
    await dbPool.query(`
      INSERT INTO chat_audit_log (action, user_id, channel_id, message_id, details)
      VALUES ('message_sent', $1, $2, $3, $4)
    `, [userId, channelId, message.id, { content, messageType }]);

    // Broadcast to channel members
    await broadcastToChannel(channelId, {
      type: 'message_sent',
      message: {
        ...message,
        sender: {
          id: userId,
          name: req.user?.name,
          email: req.user?.email,
          role: req.user?.role
        }
      }
    });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload file attachment
router.post('/messages/:id/attachments', authenticateToken, requireChatTables, upload.single('file'), async (req, res) => {
  try {
    const userId = validateRequiredInt(req.user?.id, 'user ID');
    const messageId = validateRequiredInt(req.params.id, 'message ID');
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const dbPool = getPool();
    const result = await dbPool.query(`
      INSERT INTO chat_message_attachments (message_id, file_name, file_type, file_size, file_url, mime_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [messageId, file.originalname, path.extname(file.originalname), file.size, `/uploads/chat/${file.filename}`, file.mimetype]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add reaction to message
router.post('/messages/:id/reactions', authenticateToken, requireChatTables, async (req, res) => {
  try {
    const userId = validateRequiredInt(req.user?.id, 'user ID');
    const messageId = validateRequiredInt(req.params.id, 'message ID');
    const { reactionType } = req.body;

    const dbPool = getPool();
    const result = await dbPool.query(`
      INSERT INTO chat_message_reactions (message_id, user_id, reaction_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (message_id, user_id, reaction_type) DO NOTHING
      RETURNING *
    `, [messageId, userId, reactionType]);

    if (result.rows.length > 0) {
      // Broadcast reaction
      const message = await dbPool.query('SELECT channel_id FROM chat_messages WHERE id = $1', [messageId]);
      if (message.rows.length > 0) {
        await broadcastToChannel(message.rows[0].channel_id, {
          type: 'reaction_added',
          messageId,
          userId,
          reactionType
        });
      }
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// MODERATION ENDPOINTS
// ============================================================================

// Flag message
router.post('/messages/:id/flag', authenticateToken, requireChatTables, async (req, res) => {
  try {
    const userId = validateRequiredInt(req.user?.id, 'user ID');
    const messageId = validateRequiredInt(req.params.id, 'message ID');
    const { reason, severity = 'medium' } = req.body;

    // Update message as flagged
    const dbPool = getPool();
    await dbPool.query(`
      UPDATE chat_messages 
      SET is_flagged = true, flag_reason = $1, flagged_by = $2, flagged_at = NOW()
      WHERE id = $3
    `, [reason, userId, messageId]);

    // Create moderation record
    const result = await dbPool.query(`
      INSERT INTO chat_content_moderation (message_id, flagged_by, reason, severity)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [messageId, userId, reason, severity]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error flagging message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get flagged messages (for HR/management)
router.get('/moderation/flagged', authenticateToken, requireChatTables, async (req, res) => {
  try {
    const userId = validateRequiredInt(req.user?.id, 'user ID');
    const { status = 'pending' } = req.query;
    const page = sanitizeInt(req.query.page, 1);
    const limit = sanitizeInt(req.query.limit, 20);

    // Check if user has moderation permissions
    const dbPool = getPool();
    const userCheck = await dbPool.query('SELECT role FROM members WHERE id = $1', [userId]);
    if (!['admin', 'hr'].includes(userCheck.rows[0]?.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await dbPool.query(`
      SELECT 
        cm.*,
        m.content as message_content,
        m.created_at as message_created_at,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as flagged_by_user
      FROM chat_content_moderation cm
      JOIN chat_messages m ON cm.message_id = m.id
      JOIN members u ON cm.flagged_by = u.id
      WHERE cm.status = $1
      ORDER BY cm.created_at DESC
      LIMIT $2 OFFSET $3
    `, [status, limit, (page - 1) * limit]);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: result.rows.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching flagged messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

// Get channel analytics
router.get('/channels/:id/analytics', authenticateToken, requireChatTables, async (req, res) => {
  try {
    const userId = validateRequiredInt(req.user?.id, 'user ID');
    const channelId = validateRequiredInt(req.params.id, 'channel ID');
    const days = sanitizeInt(req.query.days, 30);

    // Check if user is member of channel
    const dbPool = getPool();
    const memberCheck = await dbPool.query(`
      SELECT role FROM chat_channel_members 
      WHERE channel_id = $1 AND user_id = $2 AND is_active = true
    `, [channelId, userId]);

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await dbPool.query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT sender_id) as active_users,
        ROUND(COUNT(*)::DECIMAL / $2, 2) as avg_messages_per_day,
        COUNT(CASE WHEN is_flagged THEN 1 END) as flagged_messages
      FROM chat_messages 
      WHERE channel_id = $1 
      AND created_at >= NOW() - INTERVAL '1 day' * $2
    `, [channelId, days]);

    // Get peak hour separately to avoid GROUP BY issues
    const peakHourResult = await dbPool.query(`
      SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as message_count
      FROM chat_messages 
      WHERE channel_id = $1 
      AND created_at >= NOW() - INTERVAL '1 day' * $2
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY message_count DESC
      LIMIT 1
    `, [channelId, days]);

    const analytics = result.rows[0];
    analytics.peak_hour = peakHourResult.rows[0]?.hour || 0;

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// GDPR ENDPOINTS
// ============================================================================

// Request data export
router.post('/gdpr/export', authenticateToken, requireChatTables, async (req, res) => {
  try {
    const userId = validateRequiredInt(req.user?.id, 'user ID');
    const { requestType = 'data_export' } = req.body;

    const dbPool = getPool();
    const result = await dbPool.query(`
      INSERT INTO chat_gdpr_requests (user_id, request_type)
      VALUES ($1, $2)
      RETURNING *
    `, [userId, requestType]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating GDPR request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// SEARCH ENDPOINTS
// ============================================================================

// Search messages
router.get('/search', authenticateToken, requireChatTables, async (req, res) => {
  try {
    const userId = validateRequiredInt(req.user?.id, 'user ID');
    const { q, dateFrom, dateTo } = req.query;
    const channelId = sanitizeInt(req.query.channelId);
    const page = sanitizeInt(req.query.page, 1);
    const limit = sanitizeInt(req.query.limit, 20);

    let query = `
      SELECT 
        m.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as sender,
        c.name as channel_name
      FROM chat_messages m
      JOIN members u ON m.sender_id = u.id
      JOIN chat_channels c ON m.channel_id = c.id
      JOIN chat_channel_members ccm ON c.id = ccm.channel_id
      WHERE ccm.user_id = $1 AND ccm.is_active = true
      AND m.is_deleted = false
    `;

    const params = [userId];
    let paramIndex = 2;

    if (q) {
      query += ` AND m.content ILIKE $${paramIndex}`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (channelId) {
      query += ` AND m.channel_id = $${paramIndex}`;
      params.push(channelId);
      paramIndex++;
    }

    if (dateFrom) {
      query += ` AND m.created_at >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      query += ` AND m.created_at <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }

    query += `
      ORDER BY m.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, (page - 1) * limit);

    const result = await getPool().query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: result.rows.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Global error handler for validation errors
router.use((error, req, res, next) => {
  if (error.message && error.message.includes('Invalid')) {
    return res.status(400).json({ error: error.message });
  }
  console.error('Chat API Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = { router, initializeWebSocket }; 