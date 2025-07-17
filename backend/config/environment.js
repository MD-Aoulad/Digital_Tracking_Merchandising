/**
 * Environment Configuration
 * 
 * Centralized configuration for all environment variables and settings.
 * This ensures consistent configuration across the application.
 */

// Load environment variables
require('dotenv').config();

/**
 * Environment configuration object
 */
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
    isTest: process.env.NODE_ENV === 'test'
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/workforce_management',
    ssl: process.env.DATABASE_SSL === 'true',
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS) || 20,
    idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT) || 2000
  },

  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 86400000 // 24 hours
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
    debug: process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development',
    enableConsole: process.env.LOG_CONSOLE !== 'false',
    enableFile: process.env.LOG_FILE === 'true',
    logFile: process.env.LOG_FILE_PATH || './logs/app.log'
  },

  // CORS configuration
  cors: {
    enabled: process.env.CORS_ENABLED !== 'false',
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS 
      ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
      : [
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
        ],
    credentials: process.env.CORS_CREDENTIALS !== 'false'
  },

  // Rate limiting configuration
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Security configuration
  security: {
    helmet: process.env.HELMET_ENABLED !== 'false',
    trustProxy: process.env.TRUST_PROXY === 'true',
    maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb'
  },

  // Chat system configuration
  chat: {
    enabled: process.env.CHAT_ENABLED !== 'false',
    maxFileSize: parseInt(process.env.CHAT_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    maxImageSize: parseInt(process.env.CHAT_MAX_IMAGE_SIZE) || 5 * 1024 * 1024, // 5MB
    websocketPath: process.env.WEBSOCKET_PATH || '/ws',
    heartbeatInterval: parseInt(process.env.CHAT_HEARTBEAT_INTERVAL) || 30000 // 30 seconds
  },

  // Email configuration (for future use)
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@company.com'
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES 
      ? process.env.UPLOAD_ALLOWED_TYPES.split(',') 
      : ['image/*', 'application/pdf', 'text/plain'],
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  }
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const required = [
    'database.url',
    'auth.jwtSecret'
  ];

  const missing = required.filter(key => {
    const value = key.split('.').reduce((obj, k) => obj && obj[k], config);
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
}

/**
 * Get configuration value by dot notation
 * @param {string} path - Configuration path (e.g., 'database.url')
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Configuration value
 */
function get(path, defaultValue = undefined) {
  return path.split('.').reduce((obj, key) => obj && obj[key], config) ?? defaultValue;
}

/**
 * Check if a feature is enabled
 * @param {string} feature - Feature name
 * @returns {boolean} True if enabled
 */
function isEnabled(feature) {
  return config[feature]?.enabled !== false;
}

// Validate configuration on load
if (config.server.isProduction) {
  validateConfig();
}

module.exports = {
  config,
  get,
  isEnabled,
  validateConfig
}; 