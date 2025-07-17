/**
 * Professional Logging Configuration
 * 
 * This module provides centralized logging configuration for the backend server.
 * It replaces console.log statements with proper logging levels and formatting.
 */

// Environment-based debug configuration
const DEBUG_MODE = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (DEBUG_MODE ? 'debug' : 'info');

// Log levels (from most to least verbose)
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Current log level
const CURRENT_LOG_LEVEL = LOG_LEVELS[LOG_LEVEL] || LOG_LEVELS.info;

/**
 * Professional logger class
 */
class Logger {
  constructor(module = 'app') {
    this.module = module;
  }

  /**
   * Log error messages (always shown)
   */
  error(message, ...args) {
    if (LOG_LEVELS.error <= CURRENT_LOG_LEVEL) {
      console.error(`[ERROR] [${this.module}] ${message}`, ...args);
    }
  }

  /**
   * Log warning messages
   */
  warn(message, ...args) {
    if (LOG_LEVELS.warn <= CURRENT_LOG_LEVEL) {
      console.warn(`[WARN] [${this.module}] ${message}`, ...args);
    }
  }

  /**
   * Log info messages
   */
  info(message, ...args) {
    if (LOG_LEVELS.info <= CURRENT_LOG_LEVEL) {
      console.info(`[INFO] [${this.module}] ${message}`, ...args);
    }
  }

  /**
   * Log debug messages (only in debug mode)
   */
  debug(message, ...args) {
    if (LOG_LEVELS.debug <= CURRENT_LOG_LEVEL) {
      console.log(`[DEBUG] [${this.module}] ${message}`, ...args);
    }
  }

  /**
   * Log authentication events (with sensitive data redacted)
   */
  auth(event, data = {}) {
    const sanitizedData = { ...data };
    
    // Redact sensitive information
    if (sanitizedData.password) sanitizedData.password = '***';
    if (sanitizedData.token) sanitizedData.token = '***';
    if (sanitizedData.user && sanitizedData.user.password) {
      sanitizedData.user = { ...sanitizedData.user, password: '***' };
    }

    this.info(`AUTH: ${event}`, sanitizedData);
  }

  /**
   * Log API requests (with sensitive data redacted)
   */
  api(method, endpoint, statusCode, duration = null) {
    const logData = { method, endpoint, statusCode };
    if (duration) logData.duration = `${duration}ms`;
    
    if (statusCode >= 400) {
      this.warn(`API: ${method} ${endpoint} - ${statusCode}`, logData);
    } else {
      this.debug(`API: ${method} ${endpoint} - ${statusCode}`, logData);
    }
  }

  /**
   * Log WebSocket events
   */
  ws(event, data = {}) {
    this.debug(`WS: ${event}`, data);
  }

  /**
   * Log database operations
   */
  db(operation, table, duration = null) {
    const logData = { operation, table };
    if (duration) logData.duration = `${duration}ms`;
    this.debug(`DB: ${operation} on ${table}`, logData);
  }
}

// Create default logger instances
const defaultLogger = new Logger('app');
const authLogger = new Logger('auth');
const apiLogger = new Logger('api');
const wsLogger = new Logger('websocket');
const dbLogger = new Logger('database');

// Export logger factory and instances
module.exports = {
  Logger,
  defaultLogger,
  authLogger,
  apiLogger,
  wsLogger,
  dbLogger,
  DEBUG_MODE,
  LOG_LEVEL,
  LOG_LEVELS,
  CURRENT_LOG_LEVEL
}; 