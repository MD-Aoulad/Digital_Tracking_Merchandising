/**
 * Jest setup file for backend testing
 * Configures test environment and global test utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '5001'; // Use different port for testing

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Generate test JWT token
  generateTestToken: (user = {}) => {
    const jwt = require('jsonwebtoken');
    const testUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'employee',
      name: 'Test User',
      ...user
    };
    return jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
  },

  // Create test user data
  createTestUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    name: 'Test User',
    role: 'employee',
    department: 'Test Department',
    status: 'active',
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  // Create test todo data
  createTestTodo: (overrides = {}) => ({
    id: 'test-todo-id',
    title: 'Test Todo',
    description: 'Test description',
    priority: 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    userId: 'test-user-id',
    ...overrides
  }),

  // Create test report data
  createTestReport: (overrides = {}) => ({
    id: 'test-report-id',
    title: 'Test Report',
    type: 'daily',
    content: 'Test report content',
    status: 'pending',
    submittedAt: new Date().toISOString(),
    userId: 'test-user-id',
    userName: 'Test User',
    ...overrides
  }),

  // Mock console methods to reduce noise in tests
  mockConsole: () => {
    const originalConsole = { ...console };
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
    };
  }
};

// Suppress console output during tests unless explicitly needed
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
} 