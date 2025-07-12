#!/usr/bin/env node

/**
 * Smoke Test Script
 * 
 * This script performs basic functionality tests to ensure:
 * - Authentication flow works
 * - Todo CRUD operations work
 * - API endpoints are accessible
 * - Core features are functional
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  backend: {
    url: 'http://localhost:5000',
    timeout: 10000
  },
  testUser: {
    email: 'admin@company.com',
    password: 'password'
  }
};

// Colors for console output
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

// Utility functions
const log = {
  info: (message) => console.log(`${colors.blue}ℹ${colors.reset} ${message}`),
  success: (message) => console.log(`${colors.green}✓${colors.reset} ${message}`),
  warning: (message) => console.log(`${colors.yellow}⚠${colors.reset} ${message}`),
  error: (message) => console.log(`${colors.red}✗${colors.reset} ${message}`),
  header: (message) => console.log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}`),
  section: (message) => console.log(`\n${colors.magenta}${message}${colors.reset}`)
};

/**
 * Make HTTP request with timeout
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Smoke-Test-Script/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: options.timeout || 10000
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * Test authentication flow
 */
async function testAuthentication() {
  log.section('🔐 Authentication Flow Test');
  
  try {
    // Test login with valid credentials
    log.info('Testing login with valid credentials...');
    const loginResponse = await makeRequest(`${CONFIG.backend.url}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(CONFIG.testUser)
    });

    if (loginResponse.status === 200 && loginResponse.data.token) {
      log.success('Login successful - received authentication token');
      return loginResponse.data.token;
    } else {
      log.error(`Login failed: ${loginResponse.status} - ${JSON.stringify(loginResponse.data)}`);
      return null;
    }
  } catch (error) {
    log.error(`Authentication test failed: ${error.message}`);
    return null;
  }
}

/**
 * Test todo operations
 */
async function testTodoOperations(authToken) {
  log.section('📝 Todo Operations Test');
  
  if (!authToken) {
    log.error('No authentication token - skipping todo tests');
    return false;
  }

  try {
    const headers = {
      'Authorization': `Bearer ${authToken}`
    };

    // Test creating a todo
    log.info('Testing todo creation...');
    const createTodoData = {
      title: 'Smoke Test Todo',
      description: 'This is a test todo created by the smoke test script',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };

    const createResponse = await makeRequest(`${CONFIG.backend.url}/api/todos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(createTodoData)
    });

    if (createResponse.status === 201 || createResponse.status === 200) {
      log.success('Todo created successfully');
      const createdTodo = createResponse.data;
      const todoId = createdTodo.id || createdTodo.data?.id;

      if (todoId) {
        // Test reading todos
        log.info('Testing todo retrieval...');
        const getResponse = await makeRequest(`${CONFIG.backend.url}/api/todos`, {
          headers
        });

        if (getResponse.status === 200) {
          log.success('Todos retrieved successfully');
          
          // Test updating the todo
          log.info('Testing todo update...');
          const updateData = {
            title: 'Updated Smoke Test Todo',
            priority: 'high'
          };

          const updateResponse = await makeRequest(`${CONFIG.backend.url}/api/todos/${todoId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updateData)
          });

          if (updateResponse.status === 200) {
            log.success('Todo updated successfully');
          } else {
            log.warning(`Todo update returned status ${updateResponse.status}`);
          }

          // Test completing the todo
          log.info('Testing todo completion...');
          const completeResponse = await makeRequest(`${CONFIG.backend.url}/api/todos/${todoId}/complete`, {
            method: 'POST',
            headers
          });

          if (completeResponse.status === 200) {
            log.success('Todo completed successfully');
          } else {
            log.warning(`Todo completion returned status ${completeResponse.status}`);
          }

          // Test deleting the todo
          log.info('Testing todo deletion...');
          const deleteResponse = await makeRequest(`${CONFIG.backend.url}/api/todos/${todoId}`, {
            method: 'DELETE',
            headers
          });

          if (deleteResponse.status === 200 || deleteResponse.status === 204) {
            log.success('Todo deleted successfully');
          } else {
            log.warning(`Todo deletion returned status ${deleteResponse.status}`);
          }
        } else {
          log.error(`Todo retrieval failed: ${getResponse.status}`);
          return false;
        }
      } else {
        log.warning('Could not extract todo ID from response');
        log.info('Full todo creation response:');
        console.dir(createResponse.data, { depth: null });
      }
    } else {
      log.error(`Todo creation failed: ${createResponse.status} - ${JSON.stringify(createResponse.data)}`);
      return false;
    }

    return true;
  } catch (error) {
    log.error(`Todo operations test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test API endpoints
 */
async function testApiEndpoints(authToken) {
  log.section('🔗 API Endpoints Test');
  
  const endpoints = [
    { path: '/api/health', method: 'GET', requiresAuth: false },
    { path: '/api/auth/profile', method: 'GET', requiresAuth: true },
    { path: '/api/todos', method: 'GET', requiresAuth: true },
    { path: '/api/reports', method: 'GET', requiresAuth: true },
    { path: '/api/attendance', method: 'GET', requiresAuth: true }
  ];

  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};

  for (const endpoint of endpoints) {
    try {
      log.info(`Testing ${endpoint.method} ${endpoint.path}...`);
      
      const response = await makeRequest(`${CONFIG.backend.url}${endpoint.path}`, {
        method: endpoint.method,
        headers: endpoint.requiresAuth ? headers : {}
      });

      if (response.status === 200 || response.status === 401) {
        if (endpoint.requiresAuth && response.status === 401) {
          log.success(`${endpoint.path} is properly protected`);
        } else if (response.status === 200) {
          log.success(`${endpoint.path} is accessible`);
        }
      } else {
        log.warning(`${endpoint.path} returned status ${response.status}`);
      }
    } catch (error) {
      log.error(`${endpoint.path} test failed: ${error.message}`);
    }
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  log.section('⚠️ Error Handling Test');
  
  try {
    // Test invalid login
    log.info('Testing invalid login...');
    const invalidLoginResponse = await makeRequest(`${CONFIG.backend.url}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    });

    if (invalidLoginResponse.status === 401) {
      log.success('Invalid login properly rejected');
    } else {
      log.warning(`Invalid login returned unexpected status ${invalidLoginResponse.status}`);
    }

    // Test accessing protected endpoint without auth
    log.info('Testing protected endpoint without authentication...');
    const protectedResponse = await makeRequest(`${CONFIG.backend.url}/api/todos`);

    if (protectedResponse.status === 401) {
      log.success('Protected endpoint properly requires authentication');
    } else {
      log.warning(`Protected endpoint returned unexpected status ${protectedResponse.status}`);
    }

    // Test invalid todo creation
    log.info('Testing invalid todo creation...');
    const invalidTodoResponse = await makeRequest(`${CONFIG.backend.url}/api/todos`, {
      method: 'POST',
      body: JSON.stringify({}) // Missing required fields
    });

    if (invalidTodoResponse.status === 400) {
      log.success('Invalid todo creation properly rejected');
    } else {
      log.warning(`Invalid todo creation returned status ${invalidTodoResponse.status}`);
    }

    return true;
  } catch (error) {
    log.error(`Error handling test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test performance
 */
async function testPerformance() {
  log.section('⚡ Performance Test');
  
  try {
    const startTime = Date.now();
    
    // Test health endpoint response time
    log.info('Testing health endpoint response time...');
    const healthResponse = await makeRequest(`${CONFIG.backend.url}/api/health`);
    
    const responseTime = Date.now() - startTime;
    
    if (healthResponse.status === 200) {
      if (responseTime < 1000) {
        log.success(`Health endpoint responded in ${responseTime}ms (fast)`);
      } else if (responseTime < 3000) {
        log.success(`Health endpoint responded in ${responseTime}ms (acceptable)`);
      } else {
        log.warning(`Health endpoint responded in ${responseTime}ms (slow)`);
      }
    } else {
      log.error(`Health endpoint failed: ${healthResponse.status}`);
    }

    return true;
  } catch (error) {
    log.error(`Performance test failed: ${error.message}`);
    return false;
  }
}

/**
 * Run all smoke tests
 */
async function runSmokeTests() {
  log.header('🚬 Digital Tracking Merchandising - Smoke Test');
  log.info('Starting smoke tests...\n');
  
  const results = {
    authentication: false,
    todoOperations: false,
    apiEndpoints: false,
    errorHandling: false,
    performance: false
  };
  
  let authToken = null;
  
  // Run tests
  authToken = await testAuthentication();
  results.authentication = !!authToken;
  
  if (authToken) {
    results.todoOperations = await testTodoOperations(authToken);
    results.apiEndpoints = await testApiEndpoints(authToken);
  }
  
  results.errorHandling = await testErrorHandling();
  results.performance = await testPerformance();
  
  // Summary
  log.header('📊 Smoke Test Summary');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  log.info(`Total tests: ${totalTests}`);
  log.info(`Passed: ${passedTests}`);
  log.info(`Failed: ${totalTests - passedTests}`);
  
  // Detailed results
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      log.success(`${test}: PASSED`);
    } else {
      log.error(`${test}: FAILED`);
    }
  });
  
  if (passedTests === totalTests) {
    log.success('🎉 All smoke tests passed! Core functionality is working.');
    process.exit(0);
  } else {
    log.error('❌ Some smoke tests failed. Please review the issues above.');
    process.exit(1);
  }
}

// Run smoke tests if this script is executed directly
if (require.main === module) {
  runSmokeTests().catch(error => {
    log.error(`Smoke test script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runSmokeTests,
  testAuthentication,
  testTodoOperations,
  testApiEndpoints,
  testErrorHandling,
  testPerformance
}; 