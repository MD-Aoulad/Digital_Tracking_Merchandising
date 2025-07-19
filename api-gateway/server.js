const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createServer } = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const Redis = require('redis');
const fetch = require('node-fetch');

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Increase server timeout for auth service requests
app.use((req, res, next) => {
  // Set longer timeouts for auth endpoints
  if (req.path.startsWith('/api/auth')) {
    req.setTimeout(90000); // 90 seconds for auth requests
    res.setTimeout(90000); // 90 seconds for auth responses
  } else {
    req.setTimeout(60000); // 60 seconds for other requests
    res.setTimeout(60000); // 60 seconds for other responses
  }
  next();
});

// Add request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming requests
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
      ip: req.ip,
      duration: duration,
      statusCode: res.statusCode
    });
  });
  
  next();
});

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'api-gateway.log' })
  ]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting with higher limits for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for auth endpoints
  message: 'Too many auth requests from this IP, please try again later.'
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply different rate limits
app.use('/api/auth', authLimiter);
app.use(generalLimiter);

// Redis client for caching and session management
let redisClient = null;
let redisConnectionAttempts = 0;
const MAX_REDIS_RETRIES = 5;

// Enhanced Redis connection with retry logic
const initializeRedis = async () => {
  try {
    logger.info('Initializing Redis connection...');
    
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379',
      socket: {
        connectTimeout: 10000,
        lazyConnect: true,
        reconnectStrategy: (retries) => {
          if (retries > MAX_REDIS_RETRIES) {
            logger.error('Max Redis reconnection attempts reached');
            return false;
          }
          const delay = Math.min(retries * 1000, 5000);
          logger.warn(`Redis reconnection attempt ${retries} in ${delay}ms`);
          return delay;
        }
      },
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis server refused connection');
          return new Error('Redis server refused connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Redis retry time exhausted');
        }
        if (options.attempt > MAX_REDIS_RETRIES) {
          logger.error('Max Redis retry attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      redisConnectionAttempts++;
      
      if (redisConnectionAttempts >= MAX_REDIS_RETRIES) {
        logger.error('Max Redis connection attempts reached, disabling Redis');
        redisClient = null;
      }
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
      redisConnectionAttempts = 0;
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.warn('Redis connection ended');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });

    await redisClient.connect();
    logger.info('Redis connection established');
    
  } catch (error) {
    logger.error('Redis initialization failed:', error);
    redisClient = null;
    
    // Retry connection after delay
    if (redisConnectionAttempts < MAX_REDIS_RETRIES) {
      setTimeout(() => {
        logger.info(`Retrying Redis connection (attempt ${redisConnectionAttempts + 1})`);
        initializeRedis();
      }, 5000);
    }
  }
};

// Initialize Redis on startup
initializeRedis();

// Redis health check function
const checkRedisHealth = async () => {
  if (!redisClient) {
    return { status: 'disconnected', error: 'Redis client not initialized' };
  }
  
  try {
    const startTime = Date.now();
    await redisClient.ping();
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'connected',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Redis test endpoint
app.get('/api/test-redis', async (req, res) => {
  try {
    const health = await checkRedisHealth();
    res.json({
      service: 'Redis Health Check',
      ...health
    });
  } catch (error) {
    logger.error('Redis test endpoint error:', error);
    res.status(500).json({
      service: 'Redis Health Check',
      status: 'error',
      error: error.message
    });
  }
});

// JWT verification middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
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

// Circuit breaker for service health
const serviceHealth = {
  auth: { status: 'healthy', lastCheck: Date.now(), failures: 0 },
  user: { status: 'healthy', lastCheck: Date.now(), failures: 0 },
  chat: { status: 'healthy', lastCheck: Date.now(), failures: 0 },
  attendance: { status: 'healthy', lastCheck: Date.now(), failures: 0 },
  todo: { status: 'healthy', lastCheck: Date.now(), failures: 0 },
  report: { status: 'healthy', lastCheck: Date.now(), failures: 0 },
  approval: { status: 'healthy', lastCheck: Date.now(), failures: 0 },
  workplace: { status: 'healthy', lastCheck: Date.now(), failures: 0 },
  notification: { status: 'healthy', lastCheck: Date.now(), failures: 0 }
};

// Health check function with improved error handling
const checkServiceHealth = async (serviceName, serviceUrl) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased health check timeout
    
    const response = await fetch(`${serviceUrl}/health`, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'API-Gateway-Health-Check/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      serviceHealth[serviceName].status = 'healthy';
      serviceHealth[serviceName].failures = 0;
      serviceHealth[serviceName].lastCheck = Date.now();
      logger.debug(`Service ${serviceName} health check passed`);
    } else {
      throw new Error(`Health check failed: ${response.status}`);
    }
  } catch (error) {
    serviceHealth[serviceName].failures++;
    serviceHealth[serviceName].lastCheck = Date.now();
    
    logger.warn(`Service ${serviceName} health check failed: ${error.message}`);
    
    if (serviceHealth[serviceName].failures >= 3) {
      serviceHealth[serviceName].status = 'unhealthy';
      logger.error(`Service ${serviceName} marked as unhealthy after ${serviceHealth[serviceName].failures} failures`);
    }
  }
};

// Periodic health checks
setInterval(() => {
  Object.keys(services).forEach(serviceName => {
    const serviceUrl = services[serviceName];
    checkServiceHealth(serviceName, serviceUrl);
  });
}, 30000); // Check every 30 seconds

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: serviceHealth,
    redis: redisClient ? 'connected' : 'disconnected'
  });
});

// Service discovery and health checks
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  user: process.env.USER_SERVICE_URL || 'http://user-service:3002',
  chat: process.env.CHAT_SERVICE_URL || 'http://chat-service:3003',
  attendance: process.env.ATTENDANCE_SERVICE_URL || 'http://attendance-service:3004',
  todo: process.env.TODO_SERVICE_URL || 'http://todo-service:3005',
  report: process.env.REPORT_SERVICE_URL || 'http://report-service:3006',
  approval: process.env.APPROVAL_SERVICE_URL || 'http://approval-service:3007',
  workplace: process.env.WORKPLACE_SERVICE_URL || 'http://workplace-service:3008',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3009'
};

// Proxy configuration with robust error handling and circuit breaker
const createProxy = (target, options = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    logLevel: 'silent',
    timeout: options.timeout || 60000, // Configurable timeout
    proxyTimeout: options.proxyTimeout || 60000,
    xfwd: true,
    secure: false,
    // Improved connection pooling
    agent: new (require('http').Agent)({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: options.maxSockets || 20,
      maxFreeSockets: options.maxFreeSockets || 10,
      timeout: options.agentTimeout || 60000,
      freeSocketTimeout: options.freeSocketTimeout || 60000
    }),
    onProxyReq: (proxyReq, req, res) => {
      // Add user info to request headers
      if (req.user) {
        try {
          // Use 'id' from JWT token (which is the user ID)
          const userId = req.user.id || req.user.userId;
          if (userId && userId !== 'undefined' && userId !== undefined && userId !== null) {
            proxyReq.setHeader('X-User-ID', userId.toString());
          }
          if (req.user.role && req.user.role !== 'undefined' && req.user.role !== undefined && req.user.role !== null) {
            proxyReq.setHeader('X-User-Role', req.user.role.toString());
          }
        } catch (error) {
          logger.error('Error setting user headers:', error);
        }
      }
      
      // Add request ID for tracking
      const requestId = Math.random().toString(36).substring(2, 15);
      proxyReq.setHeader('X-Request-ID', requestId);
      
      // Log request with request ID
      logger.info(`${req.method} ${req.path} -> ${target}`, {
        requestId: requestId,
        user: req.user?.id || req.user?.userId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log response with status
      logger.info(`Response from ${target}: ${proxyRes.statusCode}`, {
        path: req.path,
        method: req.method,
        statusCode: proxyRes.statusCode
      });
      
      // Update service health based on response
      const serviceName = Object.keys(services).find(key => services[key] === target);
      if (serviceName && proxyRes.statusCode >= 200 && proxyRes.statusCode < 500) {
        serviceHealth[serviceName].status = 'healthy';
        serviceHealth[serviceName].failures = 0;
      }
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${target}:`, err);
      
      // Don't send response if headers already sent
      if (res.headersSent) {
        return;
      }
      
      // Update service health on error
      const serviceName = Object.keys(services).find(key => services[key] === target);
      if (serviceName) {
        serviceHealth[serviceName].failures++;
        if (serviceHealth[serviceName].failures >= 3) {
          serviceHealth[serviceName].status = 'unhealthy';
          logger.error(`Service ${serviceName} marked as unhealthy after ${serviceHealth[serviceName].failures} failures`);
        }
      }
      
      // Handle specific error types
      if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
        logger.error(`Connection error to ${target}: ${err.code}`);
        res.status(503).json({
          error: 'Service temporarily unavailable',
          service: target.split('/').pop(),
          details: 'Connection reset by peer',
          timestamp: new Date().toISOString()
        });
      } else if (err.code === 'ETIMEDOUT') {
        res.status(504).json({
          error: 'Gateway timeout',
          service: target.split('/').pop(),
          details: 'Request timed out',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          error: 'Service temporarily unavailable',
          service: target.split('/').pop(),
          details: err.message,
          timestamp: new Date().toISOString()
        });
      }
    },
    ...options
  });
};

// Retry mechanism for failed requests
const retryProxy = (target, maxRetries = 2) => {
  return (req, res, next) => {
    let retryCount = 0;
    
    const attemptRequest = () => {
      const proxy = createProxy(target);
      
      proxy(req, res, (err) => {
        if (err && retryCount < maxRetries) {
          retryCount++;
          logger.warn(`Retrying request to ${target}, attempt ${retryCount}`);
          setTimeout(attemptRequest, 1000 * retryCount); // Exponential backoff
        } else if (err) {
          next(err);
        }
      });
    };
    
    attemptRequest();
  };
};

// Test endpoint for proxy verification
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API Gateway is working',
    timestamp: new Date().toISOString(),
    services: serviceHealth,
    config: {
      port: PORT,
      timeouts: {
        auth: '90s',
        general: '60s'
      },
      circuitBreaker: 'enabled'
    }
  });
});

// Test auth service connectivity
app.get('/api/test-auth', async (req, res) => {
  try {
    const response = await fetch(`${services.auth}/test`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'API-Gateway-Test/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        message: 'Auth service connectivity test successful',
        authService: data,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(502).json({
        error: 'Auth service connectivity test failed',
        status: response.status,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      error: 'Auth service connectivity test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test auth service database connectivity
app.get('/api/test-auth-db', async (req, res) => {
  try {
    const response = await fetch(`${services.auth}/db-test`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'API-Gateway-DB-Test/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        message: 'Auth service database connectivity test successful',
        authService: data,
        timestamp: new Date().toISOString()
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      res.status(502).json({
        error: 'Auth service database connectivity test failed',
        status: response.status,
        authServiceError: errorData,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      error: 'Auth service database connectivity test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test auth service database status
app.get('/api/auth-db-status', async (req, res) => {
  try {
    const response = await fetch(`${services.auth}/db-status`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'API-Gateway-DB-Status/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        message: 'Auth service database status retrieved',
        authService: data,
        timestamp: new Date().toISOString()
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      res.status(502).json({
        error: 'Auth service database status check failed',
        status: response.status,
        authServiceError: errorData,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      error: 'Auth service database status check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple retry mechanism for auth service
const retryAuthRequest = (req, res, next) => {
  let retryCount = 0;
  const maxRetries = 2;
  
  const attemptRequest = () => {
    const proxy = createProxy(services.auth, {
      timeout: 90000,
      proxyTimeout: 90000,
      maxSockets: 30,
      maxFreeSockets: 15,
      agentTimeout: 90000,
      freeSocketTimeout: 90000,
      onProxyReq: (proxyReq, req, res) => {
        // Add user info to request headers
        if (req.user) {
          const userId = req.user.id || req.user.userId;
          if (userId && userId !== 'undefined' && userId !== undefined && userId !== null) {
            proxyReq.setHeader('X-User-ID', userId.toString());
          }
          if (req.user.role && req.user.role !== 'undefined' && req.user.role !== undefined && req.user.role !== null) {
            proxyReq.setHeader('X-User-Role', req.user.role.toString());
          }
        }
        
        // Add request ID for tracking
        const requestId = Math.random().toString(36).substring(2, 15);
        proxyReq.setHeader('X-Request-ID', requestId);
        
        // Log request with more detail
        logger.info(`POST /api/auth/login -> ${services.auth}`, {
          requestId: requestId,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log response
        logger.info(`Response from ${services.auth}: ${proxyRes.statusCode}`, {
          path: req.path,
          method: req.method,
          statusCode: proxyRes.statusCode
        });
        
        // Mark auth service as healthy on successful response
        if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 500) {
          serviceHealth.auth.status = 'healthy';
          serviceHealth.auth.failures = 0;
        }
      },
      onError: (err, req, res) => {
        if (retryCount < maxRetries && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
          retryCount++;
          logger.warn(`Retrying auth request, attempt ${retryCount}/${maxRetries}`);
          setTimeout(attemptRequest, 1000 * retryCount); // Exponential backoff
        } else {
          // Final error handling
          logger.error(`Auth service proxy error after ${retryCount} retries:`, err);
          
          // Update auth service health
          serviceHealth.auth.failures++;
          if (serviceHealth.auth.failures >= 3) {
            serviceHealth.auth.status = 'unhealthy';
            logger.error(`Auth service marked as unhealthy after ${serviceHealth.auth.failures} failures`);
          }
          
          if (!res.headersSent) {
            if (err.code === 'ECONNRESET') {
              res.status(503).json({
                error: 'Authentication service connection reset',
                details: 'Please try again in a moment',
                timestamp: new Date().toISOString()
              });
            } else if (err.code === 'ETIMEDOUT') {
              res.status(504).json({
                error: 'Authentication service timeout',
                details: 'The authentication service is taking too long to respond',
                timestamp: new Date().toISOString()
              });
            } else {
              res.status(503).json({
                error: 'Authentication service unavailable',
                details: err.message,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      }
    });
    
    proxy(req, res, next);
  };
  
  attemptRequest();
};

// Authentication routes with health check and retry mechanism
app.use('/api/auth', (req, res, next) => {
  // Circuit breaker check
  if (serviceHealth.auth.status === 'unhealthy') {
    logger.warn('Auth service is unhealthy, returning error response');
    return res.status(503).json({
      error: 'Authentication service is temporarily unavailable',
      details: 'Service is currently experiencing issues. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
  
  // Log auth request
  logger.info(`Auth request: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Check for request abortion
  req.on('aborted', () => {
    logger.warn('Auth request aborted by client', {
      path: req.path,
      ip: req.ip
    });
  });
  
  // Check for client disconnect
  req.on('close', () => {
    logger.warn('Auth request closed by client', {
      path: req.path,
      ip: req.ip
    });
  });
  
  next();
}, createProxy(services.auth, {
  pathRewrite: {
    '^/api/auth': ''
  },
  timeout: 90000, // Increased timeout for auth service
  proxyTimeout: 90000,
  maxSockets: 50,
  maxFreeSockets: 25,
  agentTimeout: 90000,
  freeSocketTimeout: 90000,
  onProxyReq: (proxyReq, req, res) => {
    // Add user info to request headers
    if (req.user) {
      const userId = req.user.id || req.user.userId;
      if (userId && userId !== 'undefined' && userId !== undefined && userId !== null) {
        proxyReq.setHeader('X-User-ID', userId.toString());
      }
      if (req.user.role && req.user.role !== 'undefined' && req.user.role !== undefined && req.user.role !== null) {
        proxyReq.setHeader('X-User-Role', req.user.role.toString());
      }
    }
    
    // Add request ID for tracking
    const requestId = Math.random().toString(36).substring(2, 15);
    proxyReq.setHeader('X-Request-ID', requestId);
    
    // Set content length for POST requests
    if (req.body && req.method === 'POST') {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    
    // Log request with more detail
    logger.info(`Auth request -> ${services.auth}`, {
      requestId: requestId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log response
    logger.info(`Auth response: ${proxyRes.statusCode}`, {
      path: req.path,
      method: req.method,
      statusCode: proxyRes.statusCode,
      contentLength: proxyRes.headers['content-length']
    });
    
    // Mark auth service as healthy on successful response
    if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 500) {
      serviceHealth.auth.status = 'healthy';
      serviceHealth.auth.failures = 0;
    }
    
    // Handle empty responses
    if (proxyRes.statusCode === 200 && (!proxyRes.headers['content-length'] || proxyRes.headers['content-length'] === '0')) {
      logger.warn('Empty response from auth service', {
        path: req.path,
        method: req.method
      });
    }
  },
  onError: (err, req, res) => {
    logger.error(`Auth service proxy error:`, err);
    
    // Update auth service health
    serviceHealth.auth.failures++;
    if (serviceHealth.auth.failures >= 3) {
      serviceHealth.auth.status = 'unhealthy';
      logger.error(`Auth service marked as unhealthy after ${serviceHealth.auth.failures} failures`);
    }
    
    // Don't send response if headers already sent or request aborted
    if (res.headersSent || req.aborted) {
      return;
    }
    
    // Handle specific error types
    if (err.code === 'ECONNRESET') {
      res.status(503).json({
        error: 'Authentication service connection reset',
        details: 'Please try again in a moment',
        timestamp: new Date().toISOString()
      });
    } else if (err.code === 'ETIMEDOUT') {
      res.status(504).json({
        error: 'Authentication service timeout',
        details: 'The authentication service is taking too long to respond',
        timestamp: new Date().toISOString()
      });
    } else if (err.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'Authentication service connection refused',
        details: 'The authentication service is not available',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        error: 'Authentication service unavailable',
        details: err.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}));

// Enhanced service discovery with health checks
const serviceDiscovery = {
  // Service registry with health status
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
      health: { status: 'unknown', lastCheck: null, failures: 0 }
    },
    user: {
      url: process.env.USER_SERVICE_URL || 'http://user-service:3002',
      health: { status: 'unknown', lastCheck: null, failures: 0 }
    },
    chat: {
      url: process.env.CHAT_SERVICE_URL || 'http://chat-service:3003',
      health: { status: 'unknown', lastCheck: null, failures: 0 }
    },
    attendance: {
      url: process.env.ATTENDANCE_SERVICE_URL || 'http://attendance-service:3004',
      health: { status: 'unknown', lastCheck: null, failures: 0 }
    },
    todo: {
      url: process.env.TODO_SERVICE_URL || 'http://todo-service:3005',
      health: { status: 'unknown', lastCheck: null, failures: 0 }
    },
    report: {
      url: process.env.REPORT_SERVICE_URL || 'http://report-service:3006',
      health: { status: 'unknown', lastCheck: null, failures: 0 }
    },
    approval: {
      url: process.env.APPROVAL_SERVICE_URL || 'http://approval-service:3007',
      health: { status: 'unknown', lastCheck: null, failures: 0 }
    },
    workplace: {
      url: process.env.WORKPLACE_SERVICE_URL || 'http://workplace-service:3008',
      health: { status: 'unknown', lastCheck: null, failures: 0 }
    },
    notification: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3009',
      health: { status: 'unknown', lastCheck: null, failures: 0 }
    }
  },
  
  // Check service health
  async checkHealth(serviceName) {
    const service = this.services[serviceName];
    if (!service) return;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${service.url}/health`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'API-Gateway-Service-Discovery/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        service.health.status = 'healthy';
        service.health.failures = 0;
        service.health.lastCheck = new Date().toISOString();
        logger.debug(`Service ${serviceName} health check passed`);
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      service.health.failures++;
      service.health.lastCheck = new Date().toISOString();
      
      logger.warn(`Service ${serviceName} health check failed: ${error.message}`);
      
      if (service.health.failures >= 3) {
        service.health.status = 'unhealthy';
        logger.error(`Service ${serviceName} marked as unhealthy after ${service.health.failures} failures`);
      }
    }
  },
  
  // Get service URL with health check
  getServiceUrl(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    
    if (service.health.status === 'unhealthy') {
      logger.warn(`Service ${serviceName} is unhealthy, but attempting request`);
    }
    
    return service.url;
  },
  
  // Get all service statuses
  getStatus() {
    return Object.keys(this.services).reduce((acc, serviceName) => {
      acc[serviceName] = {
        url: this.services[serviceName].url,
        health: this.services[serviceName].health
      };
      return acc;
    }, {});
  }
};

// Service discovery health check endpoint
app.get('/api/service-discovery', (req, res) => {
  res.json({
    service: 'Service Discovery',
    timestamp: new Date().toISOString(),
    services: serviceDiscovery.getStatus()
  });
});

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const redisHealth = await checkRedisHealth();
  
  res.json({
    status: 'OK',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: serviceDiscovery.getStatus(),
    redis: redisHealth,
    config: {
      port: PORT,
      timeouts: {
        auth: '90s',
        general: '60s'
      },
      circuitBreaker: 'enabled',
      serviceDiscovery: 'enabled'
    }
  });
});

// Health check routes (no token required) - MUST come before protected routes
app.use('/health/users', createProxy(services.user, {
  pathRewrite: {
    '^/health/users': '/health'
  }
}));
app.use('/health/chat', createProxy(services.chat, {
  pathRewrite: {
    '^/health/chat': '/health'
  }
}));
app.use('/health/attendance', createProxy(services.attendance, {
  pathRewrite: {
    '^/health/attendance': '/health'
  }
}));
app.use('/health/todos', createProxy(services.todo, {
  pathRewrite: {
    '^/health/todos': '/health'
  }
}));
app.use('/health/reports', createProxy(services.report, {
  pathRewrite: {
    '^/health/reports': '/health'
  }
}));
app.use('/health/approvals', createProxy(services.approval, {
  pathRewrite: {
    '^/health/approvals': '/health'
  }
}));
app.use('/health/workplace', createProxy(services.workplace, {
  pathRewrite: {
    '^/health/workplace': '/health'
  }
}));
app.use('/health/notifications', createProxy(services.notification, {
  pathRewrite: {
    '^/health/notifications': '/health'
  }
}));



// Protected routes (require authentication)
app.use('/api/users', verifyToken, createProxy(services.user));
app.use('/api/chat', verifyToken, createProxy(services.chat));
app.use('/api/attendance', verifyToken, createProxy(services.attendance));
app.use('/api/todos', verifyToken, createProxy(services.todo));
app.use('/api/reports', verifyToken, createProxy(services.report));
app.use('/api/approvals', verifyToken, createProxy(services.approval));
app.use('/api/workplace', verifyToken, createProxy(services.workplace));
app.use('/api/notifications', verifyToken, createProxy(services.notification));

// Socket.IO proxy for chat service
const chatProxy = createProxy(services.chat, {
  ws: true,
  changeOrigin: true,
  pathRewrite: {
    '^/ws': '/socket.io'
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`Socket.IO proxy request: ${req.method} ${req.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Socket.IO proxy response: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error('Socket.IO proxy error:', err);
    // Only try to send JSON response for HTTP requests, not WebSocket
    if (res && typeof res.status === 'function' && !res.headersSent) {
      res.status(503).json({
        error: 'Socket.IO service unavailable',
        details: err.message,
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Apply Socket.IO proxy to both HTTP and WebSocket requests
app.use('/ws', chatProxy);
server.on('upgrade', (request, socket, head) => {
  if (request.url.startsWith('/ws')) {
    logger.info('Socket.IO upgrade request for /ws');
    chatProxy.upgrade(request, socket, head);
  }
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Workforce Management API Gateway',
    version: '1.0.0',
    description: 'API Gateway for Workforce Management Microservices',
    endpoints: {
      auth: `${services.auth}/docs`,
      user: `${services.user}/docs`,
      chat: `${services.chat}/docs`,
      attendance: `${services.attendance}/docs`,
      todo: `${services.todo}/docs`,
      report: `${services.report}/docs`,
      approval: `${services.approval}/docs`,
      workplace: `${services.workplace}/docs`,
      notification: `${services.notification}/docs`
    },
    health: '/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  // Don't send response if headers already sent
  if (res.headersSent) {
    return;
  }
  
  // Handle specific error types
  if (err.code === 'ECONNRESET') {
    res.status(503).json({
      error: 'Service connection reset',
      message: 'The service connection was reset. Please try again.',
      timestamp: new Date().toISOString()
    });
  } else if (err.code === 'ETIMEDOUT') {
    res.status(504).json({
      error: 'Gateway timeout',
      message: 'The request timed out. Please try again.',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/auth',
      '/api/users',
      '/api/chat',
      '/api/attendance',
      '/api/todos',
      '/api/reports',
      '/api/approvals',
      '/api/workplace',
      '/api/notifications',
      '/ws',
      '/health',
      '/api/docs'
    ]
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`📚 API docs: http://localhost:${PORT}/api/docs`);
  logger.info(`🔗 WebSocket: ws://localhost:${PORT}/ws`);
  logger.info(`🔗 Services:`, services);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (redisClient) {
    await redisClient.quit();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (redisClient) {
    await redisClient.quit();
  }
  process.exit(0);
});