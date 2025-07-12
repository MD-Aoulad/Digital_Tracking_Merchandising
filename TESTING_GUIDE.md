# 🧪 **Testing Automation Guide**

## **Overview**

This guide provides comprehensive instructions for running the automated testing suite for the Digital Tracking Merchandising application. The testing system includes unit tests, integration tests, API tests, end-to-end tests, health checks, and smoke tests.

## **📋 Table of Contents**

1. [Quick Start](#quick-start)
2. [Test Types](#test-types)
3. [Running Tests](#running-tests)
4. [Test Configuration](#test-configuration)
5. [Writing Tests](#writing-tests)
6. [Test Reports](#test-reports)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## **🚀 Quick Start**

### **Prerequisites**

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Backend server** running on port 5000
4. **Frontend application** running on port 3000

### **Installation**

```bash
# Install dependencies
npm install

# Install testing dependencies
npm install --save-dev jest cypress @testing-library/react @testing-library/jest-dom
```

### **Quick Test Run**

```bash
# Run all tests
npm run test:all

# Run health check
npm run test:health

# Run smoke test
npm run test:smoke
```

## **🧪 Test Types**

### **1. Unit Tests**
- **Purpose**: Test individual functions and components in isolation
- **Location**: `src/**/__tests__/` and `src/**/*.test.ts`
- **Framework**: Jest + React Testing Library
- **Command**: `npm run test:unit`

### **2. Integration Tests**
- **Purpose**: Test component interactions and API integrations
- **Location**: `src/**/__tests__/` and `src/**/*.integration.test.ts`
- **Framework**: Jest + React Testing Library
- **Command**: `npm run test:integration`

### **3. API Tests**
- **Purpose**: Test backend API endpoints and responses
- **Location**: `tests/api/`
- **Framework**: Jest + Supertest
- **Command**: `npm run test:api`

### **4. End-to-End Tests**
- **Purpose**: Test complete user workflows
- **Location**: `cypress/e2e/`
- **Framework**: Cypress
- **Command**: `npm run test:e2e`

### **5. Health Checks**
- **Purpose**: Verify system health and connectivity
- **Location**: `scripts/health-check.js`
- **Command**: `npm run test:health`

### **6. Smoke Tests**
- **Purpose**: Basic functionality verification
- **Location**: `scripts/smoke-test.js`
- **Command**: `npm run test:smoke`

## **▶️ Running Tests**

### **Individual Test Commands**

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# API tests only
npm run test:api

# E2E tests only
npm run test:e2e

# Backend tests only
npm run test:backend

# All frontend tests
npm run test:all

# Full test suite (frontend + backend)
npm run test:full
```

### **Test Modes**

```bash
# Watch mode (for development)
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (no watch, with coverage)
npm run test:ci

# Cypress open (interactive)
npm run cypress:open

# Cypress run (headless)
npm run cypress:run
```

### **Health and Smoke Tests**

```bash
# Health check (system verification)
npm run test:health

# Smoke test (basic functionality)
npm run test:smoke
```

## **⚙️ Test Configuration**

### **Jest Configuration**

The Jest configuration is defined in `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    // ... more mappings
  },
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // ... more configuration
};
```

### **Cypress Configuration**

The Cypress configuration is defined in `cypress.config.js`:

```javascript
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      apiUrl: 'http://localhost:5000/api',
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    // ... more configuration
  },
});
```

### **Environment Variables**

Create a `.env.test` file for test-specific environment variables:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_TEST_MODE=true
NODE_ENV=test
```

## **✍️ Writing Tests**

### **Unit Test Example**

```typescript
// src/core/services/__tests__/auth.test.ts
import { login, logout } from '../auth';
import { apiPost } from '../../api/client';

jest.mock('../../api/client', () => ({
  apiPost: jest.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockResponse = { token: 'test-token', user: { id: '1' } };
    (apiPost as jest.Mock).mockResolvedValue(mockResponse);

    const result = await login({ email: 'test@example.com', password: 'password' });

    expect(apiPost).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });
    expect(result).toEqual(mockResponse);
  });
});
```

### **Integration Test Example**

```typescript
// src/components/__tests__/LoginForm.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import LoginForm from '../LoginForm';

describe('LoginForm Integration', () => {
  it('should handle login flow', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByText('Login successful')).toBeInTheDocument();
    });
  });
});
```

### **E2E Test Example**

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('should login with valid credentials', () => {
    cy.get('[data-testid="email-input"]').type('admin@example.com');
    cy.get('[data-testid="password-input"]').type('admin123');
    cy.get('[data-testid="login-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="dashboard"]').should('be.visible');
  });
});
```

### **API Test Example**

```typescript
// tests/api/auth.test.ts
import request from 'supertest';
import app from '../../backend/server';

describe('Auth API', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });
});
```

## **📊 Test Reports**

### **Coverage Reports**

After running tests with coverage, reports are generated in the `coverage/` directory:

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

### **Jest Reports**

Jest generates detailed reports in the console and can be configured to output to files:

```bash
# Run tests with verbose output
npm run test -- --verbose

# Run tests with JSON output
npm run test -- --json --outputFile=test-results.json
```

### **Cypress Reports**

Cypress generates reports in the `cypress/results/` directory:

```bash
# Run Cypress with JUnit reporter
npm run cypress:run --reporter junit

# View Cypress dashboard
npm run cypress:open
```

## **🔧 Troubleshooting**

### **Common Issues**

#### **1. Tests Failing Due to Missing Dependencies**

```bash
# Clear Jest cache
npm run test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **2. Cypress Tests Failing**

```bash
# Clear Cypress cache
npx cypress cache clear

# Reset Cypress
npx cypress install --force
```

#### **3. Backend Not Running**

```bash
# Start backend server
cd backend && npm start

# Check if port 5000 is available
lsof -i :5000
```

#### **4. Frontend Not Running**

```bash
# Start frontend server
npm start

# Check if port 3000 is available
lsof -i :3000
```

### **Debug Mode**

```bash
# Run tests in debug mode
npm run test -- --debug

# Run Cypress in debug mode
DEBUG=cypress:* npm run cypress:run
```

### **Verbose Output**

```bash
# Verbose Jest output
npm run test -- --verbose

# Verbose Cypress output
npm run cypress:run -- --config video=false
```

## **📋 Best Practices**

### **1. Test Organization**

- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Keep tests independent and isolated
- Use `beforeEach` and `afterEach` for setup and cleanup

### **2. Test Data**

- Use factories or fixtures for test data
- Avoid hardcoded values in tests
- Clean up test data after each test
- Use meaningful test data that represents real scenarios

### **3. Assertions**

- Test one thing per test case
- Use specific assertions rather than generic ones
- Test both positive and negative cases
- Verify the actual behavior, not implementation details

### **4. Performance**

- Keep tests fast and efficient
- Use mocks for external dependencies
- Avoid unnecessary setup and teardown
- Run tests in parallel when possible

### **5. Maintenance**

- Update tests when changing functionality
- Remove obsolete tests
- Keep test code clean and readable
- Document complex test scenarios

## **🔄 Continuous Integration**

### **GitHub Actions Example**

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run health check
      run: npm run test:health
      
    - name: Run unit tests
      run: npm run test:ci
      
    - name: Run E2E tests
      run: |
        npm start &
        npm run cypress:run
      
    - name: Upload coverage
      uses: codecov/codecov-action@v1
```

## **📞 Support**

For issues with the testing system:

1. Check the troubleshooting section above
2. Review the test logs and error messages
3. Ensure all dependencies are installed
4. Verify that backend and frontend servers are running
5. Check the test configuration files

## **📚 Additional Resources**

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Happy Testing! 🎉** 