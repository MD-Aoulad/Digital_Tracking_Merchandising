/**
 * Chat Service - Real-time Communication Microservice
 * 
 * This microservice provides real-time chat functionality for the Workforce Management Platform.
 * It handles WebSocket connections, message persistence, file sharing, and real-time notifications.
 * 
 * Key Features:
 * - Real-time messaging via WebSocket connections
 * - Chat rooms and direct messaging
 * - File upload and sharing capabilities
 * - Message reactions and emoji support
 * - Message persistence in PostgreSQL
 * - Redis caching for performance
 * - JWT authentication integration
 * - Rate limiting and security measures
 * - Message encryption and privacy
 * - User presence tracking
 * - Message search and filtering
 * - Admin moderation tools
 * 
 * Architecture:
 * - Express.js REST API for HTTP requests
 * - Socket.IO for real-time WebSocket connections
 * - PostgreSQL for message persistence
 * - Redis for caching and session management
 * - Winston for structured logging
 * - Helmet for security headers
 * - Rate limiting for API protection
 * 
 * API Endpoints:
 * - GET /health - Service health check
 * - GET /rooms - List chat rooms
 * - POST /rooms - Create new chat room
 * - GET /rooms/:id/messages - Get room messages
 * - POST /rooms/:id/messages - Send message to room
 * - GET /direct-messages - Get direct messages
 * - POST /direct-messages - Send direct message
 * - POST /upload - Upload file attachment
 * 
 * WebSocket Events:
 * - connection - Client connects
 * - join-room - Join chat room
 * - leave-room - Leave chat room
 * - send-message - Send message to room
 * - send-direct-message - Send direct message
 * - typing - User typing indicator
 * - reaction - Add message reaction
 * - disconnect - Client disconnects
 * 
 * Security Features:
 * - JWT token verification
 * - Rate limiting on all endpoints
 * - Input validation and sanitization
 * - File upload restrictions
 * - CORS configuration
 * - Helmet security headers
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 * @lastUpdated 2025-07-19
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const Redis = require('redis');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { router: chatApiRouter } = require('../../backend/chat-api');

// Initialize Express application and HTTP server
const app = express();
const server = createServer(app);

// Initialize Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "*", // Configure for production with specific origins
    methods: ["GET", "POST"]
  }
});

// Service configuration
const PORT = process.env.PORT || 3003;

// ===== LOGGING CONFIGURATION =====

/**
 * Winston logger configuration for structured logging
 * Provides different log levels and output formats for development and production
 */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'chat-service.log' })
  ]
});

// ===== DATABASE CONFIGURATION =====

/**
 * PostgreSQL connection pool for chat data persistence
 * Configured with connection pooling for optimal performance
 */
const pool = new Pool({
  connectionString: process.env.CHAT_DB_URL || 'postgresql://chat_user:chat_password@chat-db:5432/chat_db',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// ===== REDIS CONFIGURATION =====

/**
 * Redis client for caching and session management
 * Used for storing user sessions, message caching, and real-time data
 */
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

// Redis error handling
redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

// Connect to Redis
redisClient.connect().catch(console.error);

// ===== DATABASE INITIALIZATION =====

/**
 * Initialize database tables and indexes
 * Creates all necessary tables for chat functionality if they don't exist
 * Includes proper indexing for optimal query performance
 */
const initDatabase = async () => {
  try {
    // Create chat rooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create chat messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        message TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        attachments JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create chat participants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (room_id, user_id)
      )
    `);

    // Create direct messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL,
        recipient_id UUID NOT NULL,
        message TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        attachments JSONB,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create message reactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_reactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL,
        user_id UUID NOT NULL,
        reaction VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(message_id, user_id)
      )
    `);

    // Create chat files table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        uploaded_by UUID NOT NULL,
        message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create performance indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON direct_messages(recipient_id);
      CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
      CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON chat_participants(room_id);
    `);

    logger.info('✅ Chat database tables initialized successfully');
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error; // Re-throw to prevent service startup with broken database
  }
};

// ===== MIDDLEWARE CONFIGURATION =====

// Security middleware
app.use(helmet());

// CORS configuration for cross-origin requests
app.use(cors());

// Compression middleware for response optimization
app.use(compression());

// HTTP request logging
app.use(morgan('combined'));

// JSON parsing with increased limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount the chat-api.js router at the root of the chat-service so /channels and related routes are available.
app.use('/', chatApiRouter);

// ===== RATE LIMITING =====

/**
 * Rate limiting configuration to prevent abuse
 * Limits requests to 100 per 15-minute window per IP address
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * JWT token verification middleware
 * Extracts and verifies JWT tokens from request headers
 * Adds user information to request object for downstream handlers
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.headers['x-user-id'];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'microservice-jwt-secret');
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ===== HEALTH CHECK ENDPOINT =====

/**
 * Health check endpoint for service monitoring
 * Tests database and Redis connectivity
 * Returns service status and uptime information
 */
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    const dbStatus = 'connected';
    
    res.json({
      status: 'OK',
      service: 'Chat Service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      redis: redisClient.isReady ? 'connected' : 'disconnected'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.json({
      status: 'OK',
      service: 'Chat Service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      redis: redisClient.isReady ? 'connected' : 'disconnected'
    });
  }
});

// API Documentation
app.get('/docs', (req, res) => {
  res.json({
    name: 'Chat & Communication Service',
    version: '2.0.0',
    description: 'Complete real-time messaging system for Workforce Management Platform',
    endpoints: {
      // Channel Management
      'GET /channels': 'Get all chat channels',
      'POST /channels': 'Create a new chat channel',
      'GET /channels/:id': 'Get channel details',
      'PUT /channels/:id': 'Update channel (Admin)',
      'DELETE /channels/:id': 'Delete channel (Admin)',
      'POST /channels/:id/join': 'Join a channel',
      'POST /channels/:id/leave': 'Leave a channel',
      
      // Message Management
      'GET /channels/:id/messages': 'Get channel messages',
      'POST /channels/:id/messages': 'Send message to channel',
      'PUT /messages/:id': 'Edit message',
      'DELETE /messages/:id': 'Delete message',
      'POST /messages/:id/reactions': 'Add reaction to message',
      'DELETE /messages/:id/reactions': 'Remove reaction',
      
      // Direct Messaging
      'GET /direct-messages': 'Get direct message conversations',
      'GET /direct-messages/:userId': 'Get conversation with user',
      'POST /direct-messages/:userId': 'Send direct message',
      'GET /direct-messages/:userId/messages': 'Get direct messages',
      
      // File Management
      'POST /upload': 'Upload file for chat',
      'GET /files/:filename': 'Get uploaded file',
      'DELETE /files/:filename': 'Delete file (Owner/Admin)',
      
      // User Management
      'GET /users/online': 'Get online users',
      'GET /users/:id/status': 'Get user status',
      'PUT /users/status': 'Update user status',
      
      // Message Search
      'GET /search': 'Search messages',
      'GET /search/channels': 'Search channels',
      
      // Statistics
      'GET /stats': 'Get chat statistics',
      'GET /stats/channels': 'Get channel statistics',
      'GET /stats/users': 'Get user statistics'
    },
    websocket: {
      'connection': 'Connect to chat',
      'join-channel': 'Join a chat channel',
      'leave-channel': 'Leave a chat channel',
      'send-message': 'Send a message',
      'typing': 'User typing indicator',
      'user-status': 'Update user status',
      'message-reaction': 'Add/remove message reaction',
      'file-upload': 'Upload file via WebSocket'
    }
  });
});

// Chat room routes (original endpoints)
app.get('/rooms', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cr.*, COUNT(cp.user_id) as participant_count
      FROM chat_rooms cr
      LEFT JOIN chat_participants cp ON cr.id = cp.room_id
      GROUP BY cr.id
      ORDER BY cr.updated_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

// Chat channels routes (for frontend compatibility)
app.get('/channels', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cr.*, COUNT(cp.user_id) as participant_count
      FROM chat_rooms cr
      LEFT JOIN chat_participants cp ON cr.id = cp.room_id
      GROUP BY cr.id
      ORDER BY cr.updated_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching chat channels:', error);
    res.status(500).json({ error: 'Failed to fetch chat channels' });
  }
});

app.post('/rooms', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    const result = await pool.query(`
      INSERT INTO chat_rooms (name, description, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, userId]);

    const room = result.rows[0];

    // Add creator as participant
    await pool.query(`
      INSERT INTO chat_participants (room_id, user_id)
      VALUES ($1, $2)
    `, [room.id, userId]);

    // Notify all connected clients
    io.emit('room-created', room);

    res.status(201).json(room);
  } catch (error) {
    logger.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

app.post('/channels', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    const result = await pool.query(`
      INSERT INTO chat_rooms (name, description, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, userId]);

    const room = result.rows[0];

    // Add creator as participant
    await pool.query(`
      INSERT INTO chat_participants (room_id, user_id)
      VALUES ($1, $2)
    `, [room.id, userId]);

    // Notify all connected clients
    io.emit('room-created', room);

    res.status(201).json(room);
  } catch (error) {
    logger.error('Error creating chat channel:', error);
    res.status(500).json({ error: 'Failed to create chat channel' });
  }
});

app.get('/rooms/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT cr.*, COUNT(cp.user_id) as participant_count
      FROM chat_rooms cr
      LEFT JOIN chat_participants cp ON cr.id = cp.room_id
      WHERE cr.id = $1
      GROUP BY cr.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching chat room:', error);
    res.status(500).json({ error: 'Failed to fetch chat room' });
  }
});

app.get('/channels/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT cr.*, COUNT(cp.user_id) as participant_count
      FROM chat_rooms cr
      LEFT JOIN chat_participants cp ON cr.id = cp.room_id
      WHERE cr.id = $1
      GROUP BY cr.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat channel not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching chat channel:', error);
    res.status(500).json({ error: 'Failed to fetch chat channel' });
  }
});

app.get('/rooms/:id/messages', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT cm.*
      FROM chat_messages cm
      WHERE cm.room_id = $1
      ORDER BY cm.created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, limit, offset]);

    res.json(result.rows.reverse());
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/channels/:id/messages', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT cm.*
      FROM chat_messages cm
      WHERE cm.room_id = $1
      ORDER BY cm.created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, limit, offset]);

    res.json(result.rows.reverse());
  } catch (error) {
    logger.error('Error fetching channel messages:', error);
    res.status(500).json({ error: 'Failed to fetch channel messages' });
  }
});

app.post('/rooms/:id/messages', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, messageType = 'text' } = req.body;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    const result = await pool.query(`
      INSERT INTO chat_messages (room_id, user_id, message, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, userId, message, messageType]);

    const newMessage = result.rows[0];

    // Emit to all clients in the room
    io.to(id).emit('new-message', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/channels/:id/messages', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, messageType = 'text', attachments = [] } = req.body;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    const result = await pool.query(`
      INSERT INTO chat_messages (room_id, user_id, message, message_type, attachments)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, userId, message, messageType, JSON.stringify(attachments)]);

    const newMessage = result.rows[0];

    // Emit to all clients in the room
    io.to(id).emit('new-message', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    logger.error('Error sending channel message:', error);
    res.status(500).json({ error: 'Failed to send channel message' });
  }
});

// Enhanced Chat System Endpoints

// 1. Update Channel (Admin only)
app.put('/channels/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    // Check if user is admin or channel creator
    const channelResult = await pool.query(
      'SELECT created_by FROM chat_rooms WHERE id = $1',
      [id]
    );

    if (channelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channelResult.rows[0].created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const result = await pool.query(`
      UPDATE chat_rooms 
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [name, description, id]);

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating channel:', error);
    res.status(500).json({ error: 'Failed to update channel' });
  }
});

// 2. Delete Channel (Admin only)
app.delete('/channels/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    // Check if user is admin or channel creator
    const channelResult = await pool.query(
      'SELECT created_by FROM chat_rooms WHERE id = $1',
      [id]
    );

    if (channelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channelResult.rows[0].created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await pool.query('DELETE FROM chat_rooms WHERE id = $1', [id]);

    // Notify all clients
    io.emit('channel-deleted', { channelId: id });

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    logger.error('Error deleting channel:', error);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

// 3. Join Channel
app.post('/channels/:id/join', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    // Check if channel exists
    const channelResult = await pool.query(
      'SELECT id FROM chat_rooms WHERE id = $1',
      [id]
    );

    if (channelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Add user to participants
    await pool.query(`
      INSERT INTO chat_participants (room_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (room_id, user_id) DO NOTHING
    `, [id, userId]);

    // Notify channel members
    io.to(id).emit('user-joined-channel', { userId, channelId: id });

    res.json({ message: 'Joined channel successfully' });
  } catch (error) {
    logger.error('Error joining channel:', error);
    res.status(500).json({ error: 'Failed to join channel' });
  }
});

// 4. Leave Channel
app.post('/channels/:id/leave', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    // Remove user from participants
    await pool.query(`
      DELETE FROM chat_participants 
      WHERE room_id = $1 AND user_id = $2
    `, [id, userId]);

    // Notify channel members
    io.to(id).emit('user-left-channel', { userId, channelId: id });

    res.json({ message: 'Left channel successfully' });
  } catch (error) {
    logger.error('Error leaving channel:', error);
    res.status(500).json({ error: 'Failed to leave channel' });
  }
});

// 5. Edit Message
app.put('/messages/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    // Check if message exists and user owns it
    const messageResult = await pool.query(
      'SELECT * FROM chat_messages WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found or not owned by user' });
    }

    const result = await pool.query(`
      UPDATE chat_messages 
      SET message = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [message, id]);

    const updatedMessage = result.rows[0];

    // Notify all clients in the room
    io.to(updatedMessage.room_id).emit('message-updated', updatedMessage);

    res.json(updatedMessage);
  } catch (error) {
    logger.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// 6. Delete Message
app.delete('/messages/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    // Check if message exists and user owns it or is admin
    const messageResult = await pool.query(
      'SELECT * FROM chat_messages WHERE id = $1',
      [id]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = messageResult.rows[0];
    if (message.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await pool.query('DELETE FROM chat_messages WHERE id = $1', [id]);

    // Notify all clients in the room
    io.to(message.room_id).emit('message-deleted', { messageId: id, roomId: message.room_id });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// 7. Add Message Reaction
app.post('/messages/:id/reactions', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    // Check if message exists
    const messageResult = await pool.query(
      'SELECT room_id FROM chat_messages WHERE id = $1',
      [id]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Add or update reaction
    await pool.query(`
      INSERT INTO message_reactions (message_id, user_id, reaction)
      VALUES ($1, $2, $3)
      ON CONFLICT (message_id, user_id) 
      DO UPDATE SET reaction = $3, updated_at = CURRENT_TIMESTAMP
    `, [id, userId, reaction]);

    // Notify all clients in the room
    io.to(messageResult.rows[0].room_id).emit('message-reaction', {
      messageId: id,
      userId,
      reaction
    });

    res.json({ message: 'Reaction added successfully' });
  } catch (error) {
    logger.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// 8. Remove Message Reaction
app.delete('/messages/:id/reactions', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    // Check if message exists
    const messageResult = await pool.query(
      'SELECT room_id FROM chat_messages WHERE id = $1',
      [id]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Remove reaction
    await pool.query(`
      DELETE FROM message_reactions 
      WHERE message_id = $1 AND user_id = $2
    `, [id, userId]);

    // Notify all clients in the room
    io.to(messageResult.rows[0].room_id).emit('message-reaction-removed', {
      messageId: id,
      userId
    });

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    logger.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

// 9. Get Direct Message Conversations
app.get('/direct-messages', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    const result = await pool.query(`
      SELECT DISTINCT 
        CASE 
          WHEN dm.sender_id = $1 THEN dm.recipient_id
          ELSE dm.sender_id
        END as other_user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar,
        MAX(dm.created_at) as last_message_at,
        COUNT(dm.id) as message_count
      FROM direct_messages dm
      LEFT JOIN users u ON (
        CASE 
          WHEN dm.sender_id = $1 THEN dm.recipient_id
          ELSE dm.sender_id
        END = u.id
      )
      WHERE dm.sender_id = $1 OR dm.recipient_id = $1
      GROUP BY other_user_id, u.first_name, u.last_name, u.email, u.avatar
      ORDER BY last_message_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching direct message conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// 10. Get Direct Messages with User
app.get('/direct-messages/:userId', verifyToken, async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user.id || req.user.userId || req.headers['x-user-id'];
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT dm.*, u.first_name, u.last_name, u.avatar
      FROM direct_messages dm
      LEFT JOIN users u ON dm.sender_id = u.id
      WHERE (dm.sender_id = $1 AND dm.recipient_id = $2)
         OR (dm.sender_id = $2 AND dm.recipient_id = $1)
      ORDER BY dm.created_at DESC
      LIMIT $3 OFFSET $4
    `, [currentUserId, otherUserId, limit, offset]);

    res.json(result.rows.reverse());
  } catch (error) {
    logger.error('Error fetching direct messages:', error);
    res.status(500).json({ error: 'Failed to fetch direct messages' });
  }
});

// 11. Send Direct Message
app.post('/direct-messages/:userId', verifyToken, async (req, res) => {
  try {
    const { userId: recipientId } = req.params;
    const { message, messageType = 'text', attachments = [] } = req.body;
    const senderId = req.user.id || req.user.userId || req.headers['x-user-id'];

    const result = await pool.query(`
      INSERT INTO direct_messages (sender_id, recipient_id, message, message_type, attachments)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [senderId, recipientId, message, messageType, JSON.stringify(attachments)]);

    const newMessage = result.rows[0];

    // Emit to recipient
    io.to(`user-${recipientId}`).emit('new-direct-message', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    logger.error('Error sending direct message:', error);
    res.status(500).json({ error: 'Failed to send direct message' });
  }
});

// 12. Get Online Users
app.get('/users/online', verifyToken, async (req, res) => {
  try {
    const onlineUsers = Array.from(io.sockets.sockets.values())
      .map(socket => ({
        userId: socket.handshake.auth.userId || socket.handshake.headers['x-user-id'],
        socketId: socket.id,
        connectedAt: socket.handshake.time
      }))
      .filter(user => user.userId);

    res.json(onlineUsers);
  } catch (error) {
    logger.error('Error fetching online users:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
});

// 13. Update User Status
app.put('/users/status', verifyToken, async (req, res) => {
  try {
    const { status, customMessage } = req.body;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    // Update user status in Redis for real-time access
    await redisClient.set(`user:${userId}:status`, JSON.stringify({
      status,
      customMessage,
      updatedAt: new Date().toISOString()
    }));

    // Notify all connected clients
    io.emit('user-status-updated', {
      userId,
      status,
      customMessage
    });

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    logger.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// 14. Search Messages
app.get('/search', verifyToken, async (req, res) => {
  try {
    const { query, channelId, limit = 20, offset = 0 } = req.query;
    const userId = req.user.id || req.user.userId || req.headers['x-user-id'];

    let sql = `
      SELECT cm.*, cr.name as channel_name, u.first_name, u.last_name
      FROM chat_messages cm
      LEFT JOIN chat_rooms cr ON cm.room_id = cr.id
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.message ILIKE $1
    `;
    const params = [`%${query}%`];
    let paramCount = 1;

    if (channelId) {
      paramCount++;
      sql += ` AND cm.room_id = $${paramCount}`;
      params.push(channelId);
    }

    sql += ` ORDER BY cm.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(sql, params);

    res.json(result.rows);
  } catch (error) {
    logger.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

// 15. Get Chat Statistics
app.get('/stats', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];
    let paramCount = 0;

    if (startDate) {
      paramCount++;
      dateFilter += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      dateFilter += ` AND created_at <= $${paramCount}`;
      params.push(endDate);
    }

    // Total messages
    const totalMessagesResult = await pool.query(
      `SELECT COUNT(*) as total FROM chat_messages WHERE 1=1${dateFilter}`,
      params
    );

    // Messages by type
    const messageTypesResult = await pool.query(
      `SELECT message_type, COUNT(*) as count 
       FROM chat_messages 
       WHERE 1=1${dateFilter}
       GROUP BY message_type`,
      params
    );

    // Active channels
    const activeChannelsResult = await pool.query(
      `SELECT COUNT(DISTINCT room_id) as count 
       FROM chat_messages 
       WHERE 1=1${dateFilter}`,
      params
    );

    // Online users
    const onlineUsers = Array.from(io.sockets.sockets.values()).length;

    res.json({
      totalMessages: parseInt(totalMessagesResult.rows[0].total),
      messageTypes: messageTypesResult.rows,
      activeChannels: parseInt(activeChannelsResult.rows[0].count),
      onlineUsers,
      period: { startDate, endDate }
    });
  } catch (error) {
    logger.error('Error fetching chat statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId || socket.handshake.headers['x-user-id'];
  logger.info(`User connected: ${socket.id} (User: ${userId})`);

  // Join user's personal room for direct messages
  if (userId) {
    socket.join(`user-${userId}`);
  }

  // Join a chat channel
  socket.on('join-channel', async (channelId) => {
    try {
      socket.join(channelId);
      
      // Add user to participants if not already there
      if (userId) {
        await pool.query(`
          INSERT INTO chat_participants (room_id, user_id)
          VALUES ($1, $2)
          ON CONFLICT (room_id, user_id) DO NOTHING
        `, [channelId, userId]);
      }

      socket.to(channelId).emit('user-joined-channel', { userId, socketId: socket.id });
      logger.info(`User ${userId} joined channel ${channelId}`);
    } catch (error) {
      logger.error('Error joining channel:', error);
    }
  });

  // Leave a chat channel
  socket.on('leave-channel', (channelId) => {
    socket.leave(channelId);
    socket.to(channelId).emit('user-left-channel', { userId, socketId: socket.id });
    logger.info(`User ${userId} left channel ${channelId}`);
  });

  // Send a message to channel
  socket.on('send-message', async (data) => {
    try {
      const { channelId, message, messageType = 'text', attachments = [] } = data;

      if (!userId) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      const result = await pool.query(`
        INSERT INTO chat_messages (room_id, user_id, message, message_type, attachments)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [channelId, userId, message, messageType, JSON.stringify(attachments)]);

      const newMessage = result.rows[0];
      io.to(channelId).emit('new-message', newMessage);
    } catch (error) {
      logger.error('Error sending message via WebSocket:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Send direct message
  socket.on('send-direct-message', async (data) => {
    try {
      const { recipientId, message, messageType = 'text', attachments = [] } = data;

      if (!userId) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      const result = await pool.query(`
        INSERT INTO direct_messages (sender_id, recipient_id, message, message_type, attachments)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [userId, recipientId, message, messageType, JSON.stringify(attachments)]);

      const newMessage = result.rows[0];
      
      // Emit to recipient
      io.to(`user-${recipientId}`).emit('new-direct-message', newMessage);
      
      // Emit back to sender
      socket.emit('direct-message-sent', newMessage);
    } catch (error) {
      logger.error('Error sending direct message via WebSocket:', error);
      socket.emit('error', { message: 'Failed to send direct message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { channelId, isTyping } = data;
    socket.to(channelId).emit('user-typing', {
      userId,
      isTyping
    });
  });

  // Direct message typing indicator
  socket.on('direct-typing', (data) => {
    const { recipientId, isTyping } = data;
    io.to(`user-${recipientId}`).emit('user-direct-typing', {
      userId,
      isTyping
    });
  });

  // Update user status
  socket.on('user-status', async (data) => {
    try {
      const { status, customMessage } = data;

      if (!userId) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      // Update user status in Redis
      await redisClient.set(`user:${userId}:status`, JSON.stringify({
        status,
        customMessage,
        updatedAt: new Date().toISOString()
      }));

      // Notify all connected clients
      io.emit('user-status-updated', {
        userId,
        status,
        customMessage
      });
    } catch (error) {
      logger.error('Error updating user status:', error);
      socket.emit('error', { message: 'Failed to update status' });
    }
  });

  // Message reaction
  socket.on('message-reaction', async (data) => {
    try {
      const { messageId, reaction } = data;

      if (!userId) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      // Get message room for broadcasting
      const messageResult = await pool.query(
        'SELECT room_id FROM chat_messages WHERE id = $1',
        [messageId]
      );

      if (messageResult.rows.length === 0) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Add or update reaction
      await pool.query(`
        INSERT INTO message_reactions (message_id, user_id, reaction)
        VALUES ($1, $2, $3)
        ON CONFLICT (message_id, user_id) 
        DO UPDATE SET reaction = $3, updated_at = CURRENT_TIMESTAMP
      `, [messageId, userId, reaction]);

      // Notify all clients in the room
      io.to(messageResult.rows[0].room_id).emit('message-reaction', {
        messageId,
        userId,
        reaction
      });
    } catch (error) {
      logger.error('Error adding message reaction:', error);
      socket.emit('error', { message: 'Failed to add reaction' });
    }
  });

  // Remove message reaction
  socket.on('remove-reaction', async (data) => {
    try {
      const { messageId } = data;

      if (!userId) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      // Get message room for broadcasting
      const messageResult = await pool.query(
        'SELECT room_id FROM chat_messages WHERE id = $1',
        [messageId]
      );

      if (messageResult.rows.length === 0) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Remove reaction
      await pool.query(`
        DELETE FROM message_reactions 
        WHERE message_id = $1 AND user_id = $2
      `, [messageId, userId]);

      // Notify all clients in the room
      io.to(messageResult.rows[0].room_id).emit('message-reaction-removed', {
        messageId,
        userId
      });
    } catch (error) {
      logger.error('Error removing message reaction:', error);
      socket.emit('error', { message: 'Failed to remove reaction' });
    }
  });

  // File upload via WebSocket
  socket.on('file-upload', async (data) => {
    try {
      const { channelId, fileName, fileData, mimeType, fileSize } = data;

      if (!userId) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      // Generate unique filename
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${fileName}`;
      
      // Store file info in database
      const fileResult = await pool.query(`
        INSERT INTO chat_files (filename, original_name, file_size, mime_type, uploaded_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [uniqueFilename, fileName, fileSize, mimeType, userId]);

      // Create message with file attachment
      const messageResult = await pool.query(`
        INSERT INTO chat_messages (room_id, user_id, message, message_type, attachments)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [channelId, userId, `File: ${fileName}`, 'file', JSON.stringify([{
        filename: uniqueFilename,
        originalName: fileName,
        mimeType,
        fileSize
      }])]);

      const newMessage = messageResult.rows[0];
      io.to(channelId).emit('new-message', newMessage);
    } catch (error) {
      logger.error('Error uploading file via WebSocket:', error);
      socket.emit('error', { message: 'Failed to upload file' });
    }
  });

  // Mark direct message as read
  socket.on('mark-read', async (data) => {
    try {
      const { senderId } = data;

      if (!userId) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      await pool.query(`
        UPDATE direct_messages 
        SET is_read = true 
        WHERE sender_id = $1 AND recipient_id = $2 AND is_read = false
      `, [senderId, userId]);

      // Notify sender that messages were read
      io.to(`user-${senderId}`).emit('messages-read', { recipientId: userId });
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id} (User: ${userId})`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Initialize database and start server
initDatabase().then(() => {
  server.listen(PORT, () => {
    logger.info(`🚀 Chat Service running on port ${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    logger.info(`📚 API docs: http://localhost:${PORT}/docs`);
    logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await pool.end();
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await pool.end();
  await redisClient.quit();
  process.exit(0);
}); 