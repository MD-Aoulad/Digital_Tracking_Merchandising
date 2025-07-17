#!/usr/bin/env node

/**
 * Mobile App API Call Monitor
 * 
 * This script monitors API calls from the mobile app to detect:
 * - Excessive polling
 * - Infinite loops
 * - Performance issues
 * - Authentication problems
 */

const fetch = require('node-fetch');
const { getApiUrl } = require('../src/config/api');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class ApiCallMonitor {
  constructor() {
    this.apiUrl = getApiUrl();
    this.callHistory = [];
    this.startTime = Date.now();
    this.isMonitoring = false;
  }

  /**
   * Start monitoring API calls
   */
  async startMonitoring() {
    log('\n🔍 Starting Mobile App API Call Monitor', 'cyan');
    log('==========================================', 'cyan');
    log(`📍 API URL: ${this.apiUrl}`, 'blue');
    log(`⏰ Started at: ${new Date().toISOString()}`, 'blue');
    log('==========================================\n', 'cyan');

    this.isMonitoring = true;
    
    // Test basic connectivity
    await this.testConnectivity();
    
    // Monitor for patterns
    await this.monitorPatterns();
  }

  /**
   * Test basic API connectivity
   */
  async testConnectivity() {
    log('🔌 Testing API Connectivity...', 'yellow');
    
    try {
      const response = await fetch(`${this.apiUrl.replace('/api', '')}/api/health`);
      const data = await response.json();
      
      if (response.ok) {
        log('✅ API is reachable', 'green');
        log(`   Status: ${data.status}`, 'blue');
        log(`   Message: ${data.message}`, 'blue');
      } else {
        log('❌ API health check failed', 'red');
        log(`   Status: ${response.status}`, 'red');
      }
    } catch (error) {
      log('❌ Cannot connect to API', 'red');
      log(`   Error: ${error.message}`, 'red');
      log('💡 Make sure the backend server is running', 'yellow');
      process.exit(1);
    }
  }

  /**
   * Monitor API call patterns
   */
  async monitorPatterns() {
    log('\n📊 Monitoring API Call Patterns...', 'yellow');
    log('Press Ctrl+C to stop monitoring\n', 'yellow');

    let callCount = 0;
    const interval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(interval);
        return;
      }

      callCount++;
      const timestamp = new Date().toISOString();
      
      // Simulate what the mobile app might be doing
      await this.simulateMobileAppCalls(timestamp, callCount);
      
      // Analyze patterns every 10 calls
      if (callCount % 10 === 0) {
        this.analyzePatterns();
      }
    }, 2000); // Check every 2 seconds

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log('\n🛑 Stopping monitor...', 'yellow');
      this.isMonitoring = false;
      clearInterval(interval);
      this.generateReport();
      process.exit(0);
    });
  }

  /**
   * Simulate mobile app API calls
   */
  async simulateMobileAppCalls(timestamp, callCount) {
    const calls = [
      { name: 'Health Check', url: '/api/health', method: 'GET' },
      { name: 'Profile', url: '/api/auth/profile', method: 'GET', auth: true },
      { name: 'Todos', url: '/api/todos', method: 'GET', auth: true },
      { name: 'Chat Channels', url: '/api/chat/channels', method: 'GET', auth: true }
    ];

    for (const call of calls) {
      try {
        const startTime = Date.now();
        const response = await this.makeApiCall(call, timestamp, callCount);
        const duration = Date.now() - startTime;
        
        this.recordCall({
          name: call.name,
          url: call.url,
          method: call.method,
          status: response.status,
          duration,
          timestamp,
          callCount
        });

        // Log suspicious patterns
        if (duration > 1000) {
          log(`⚠️  Slow API call: ${call.name} took ${duration}ms`, 'yellow');
        }
        
        if (response.status >= 400) {
          log(`❌ API error: ${call.name} returned ${response.status}`, 'red');
        }

      } catch (error) {
        log(`❌ API call failed: ${call.name} - ${error.message}`, 'red');
      }
    }
  }

  /**
   * Make an API call
   */
  async makeApiCall(call, timestamp, callCount) {
    const url = `${this.apiUrl.replace('/api', '')}${call.url}`;
    const options = {
      method: call.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MobileAppMonitor/1.0'
      }
    };

    // Add authentication if needed
    if (call.auth) {
      // Use a test token or skip auth calls for monitoring
      options.headers['Authorization'] = 'Bearer test-token';
    }

    const response = await fetch(url, options);
    return response;
  }

  /**
   * Record an API call
   */
  recordCall(callData) {
    this.callHistory.push(callData);
    
    // Keep only last 100 calls
    if (this.callHistory.length > 100) {
      this.callHistory.shift();
    }
  }

  /**
   * Analyze call patterns
   */
  analyzePatterns() {
    const recentCalls = this.callHistory.slice(-20);
    
    // Check for excessive calls
    const callsPerMinute = recentCalls.length / 2; // 2-second intervals
    if (callsPerMinute > 30) {
      log(`⚠️  High call rate detected: ${callsPerMinute} calls/minute`, 'yellow');
    }

    // Check for repeated errors
    const errors = recentCalls.filter(call => call.status >= 400);
    if (errors.length > 5) {
      log(`⚠️  Multiple API errors detected: ${errors.length} errors`, 'red');
    }

    // Check for slow responses
    const slowCalls = recentCalls.filter(call => call.duration > 1000);
    if (slowCalls.length > 3) {
      log(`⚠️  Multiple slow API calls detected: ${slowCalls.length} slow calls`, 'yellow');
    }
  }

  /**
   * Generate monitoring report
   */
  generateReport() {
    const duration = Date.now() - this.startTime;
    const totalCalls = this.callHistory.length;
    
    log('\n📋 API Call Monitoring Report', 'cyan');
    log('==============================', 'cyan');
    log(`⏱️  Monitoring Duration: ${Math.round(duration / 1000)}s`, 'blue');
    log(`📞 Total API Calls: ${totalCalls}`, 'blue');
    log(`📊 Average Calls/Minute: ${Math.round((totalCalls / (duration / 60000)) * 100) / 100}`, 'blue');
    
    // Analyze call distribution
    const callTypes = {};
    this.callHistory.forEach(call => {
      callTypes[call.name] = (callTypes[call.name] || 0) + 1;
    });
    
    log('\n📈 Call Distribution:', 'blue');
    Object.entries(callTypes).forEach(([name, count]) => {
      const percentage = Math.round((count / totalCalls) * 100);
      log(`   ${name}: ${count} calls (${percentage}%)`, 'blue');
    });
    
    // Performance analysis
    const avgDuration = this.callHistory.reduce((sum, call) => sum + call.duration, 0) / totalCalls;
    log(`\n⚡ Average Response Time: ${Math.round(avgDuration)}ms`, 'blue');
    
    const slowCalls = this.callHistory.filter(call => call.duration > 1000).length;
    if (slowCalls > 0) {
      log(`⚠️  Slow Calls (>1s): ${slowCalls}`, 'yellow');
    }
    
    const errors = this.callHistory.filter(call => call.status >= 400).length;
    if (errors > 0) {
      log(`❌ Error Calls: ${errors}`, 'red');
    }
    
    log('\n💡 Recommendations:', 'cyan');
    if (avgDuration > 500) {
      log('   • Consider optimizing API response times', 'yellow');
    }
    if (errors > 0) {
      log('   • Check for authentication or server issues', 'yellow');
    }
    if (totalCalls > 100) {
      log('   • Consider implementing request caching', 'yellow');
    }
    
    log('\n✅ Monitoring complete', 'green');
  }
}

// Start monitoring if run directly
if (require.main === module) {
  const monitor = new ApiCallMonitor();
  monitor.startMonitoring().catch(error => {
    log(`❌ Monitoring failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = ApiCallMonitor; 