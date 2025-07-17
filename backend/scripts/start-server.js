#!/usr/bin/env node

/**
 * Professional Server Startup Script
 * 
 * This script provides a robust way to start the backend server with:
 * - Environment validation
 * - Graceful shutdown handling
 * - Health monitoring
 * - Professional logging
 */

const { spawn } = require('child_process');
const { config } = require('../config/environment');
const { defaultLogger } = require('../config/logging');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Print colored console message
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Validate environment before starting
 */
function validateEnvironment() {
  log('\n🔍 Validating Environment...', 'cyan');
  
  const required = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log(`❌ Missing required environment variables: ${missing.join(', ')}`, 'red');
    log('💡 Please check your .env file or environment configuration', 'yellow');
    process.exit(1);
  }

  log('✅ Environment validation passed', 'green');
}

/**
 * Check if port is available
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
}

/**
 * Start the server
 */
async function startServer() {
  try {
    // Validate environment
    validateEnvironment();
    
    const port = config.server.port;
    
    // Check if port is available
    log(`🔍 Checking if port ${port} is available...`, 'cyan');
    const portAvailable = await checkPort(port);
    
    if (!portAvailable) {
      log(`❌ Port ${port} is already in use`, 'red');
      log('💡 Please stop the existing server or use a different port', 'yellow');
      process.exit(1);
    }
    
    log(`✅ Port ${port} is available`, 'green');
    
    // Display startup information
    log('\n🚀 Starting Workforce Management Backend Server', 'bright');
    log('================================================', 'bright');
    log(`📍 Environment: ${config.server.environment}`, 'blue');
    log(`🌐 Host: ${config.server.host}`, 'blue');
    log(`🔌 Port: ${port}`, 'blue');
    log(`📊 Log Level: ${config.logging.level}`, 'blue');
    log(`🐛 Debug Mode: ${config.logging.debug ? 'Enabled' : 'Disabled'}`, 'blue');
    log('================================================\n', 'bright');
    
    // Start the server process
    const serverProcess = spawn('node', ['server.js'], {
      stdio: 'inherit',
      env: process.env
    });
    
    // Handle process events
    serverProcess.on('error', (error) => {
      log(`❌ Failed to start server: ${error.message}`, 'red');
      process.exit(1);
    });
    
    serverProcess.on('exit', (code) => {
      if (code === 0) {
        log('\n✅ Server stopped gracefully', 'green');
      } else {
        log(`\n❌ Server stopped with code: ${code}`, 'red');
      }
      process.exit(code);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log('\n🛑 Received SIGINT, shutting down gracefully...', 'yellow');
      serverProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      log('\n🛑 Received SIGTERM, shutting down gracefully...', 'yellow');
      serverProcess.kill('SIGTERM');
    });
    
  } catch (error) {
    log(`❌ Startup error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Start the server if this script is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer, validateEnvironment }; 