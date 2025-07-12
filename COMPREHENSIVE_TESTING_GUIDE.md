# Comprehensive Testing Guide

## Overview

This guide covers the complete testing infrastructure for the Digital Tracking Merchandising platform, including frontend, backend, API, mobile, and performance testing.

## Testing Architecture

```
├── Frontend Tests (React/TypeScript)
│   ├── Unit Tests (Jest + React Testing Library)
│   ├── Integration Tests
│   ├── E2E Tests (Cypress)
│   └── Component Tests
├── Backend Tests (Node.js/Express)
│   ├── Unit Tests (Jest)
│   ├── Integration Tests (Supertest)
│   ├── Security Tests
│   └── Performance Tests
├── Mobile Tests (React Native)
│   ├── Unit Tests (Jest)
│   ├── Component Tests
│   └── Integration Tests
└── API Tests
    ├── Contract Tests
    ├── Load Tests
    └── Security Tests
```

## Frontend Testing

### Unit Tests

**Location**: `src/core/services/__tests__/`

**Coverage**:
- Authentication service
- Todo service
- API hooks
- Utility functions

**Running Tests**:
```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm test -- auth.test.ts

# Run with coverage
npm run test:coverage
```

**Example Test Structure**:
```typescript
describe('AuthService', () => {
  describe('login', () => {
    test('should authenticate user with valid credentials', async () => {
      // Test implementation
    });
    
    test('should reject invalid credentials', async () => {
      // Test implementation
    });
  });
});
```

### Component Tests

**Location**: `src/components/__tests__/`

**Coverage**:
- TodoPage component
- Login component
- Dashboard component
- Navigation components

**Running Tests**:
```bash
# Run component tests
npm test -- TodoPage.test.tsx

# Run with watch mode
npm run test:watch
```

**Example Component Test**:
```typescript
describe('TodoPage Component', () => {
  test('should render todo list', async () => {
    render(<TodoPage />);
    await waitFor(() => {
      expect(screen.getByText('Todo Management')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

**Location**: `cypress/e2e/`

**Coverage**:
- User authentication flow
- Todo management workflow
- Navigation between pages
- Error handling

**Running Tests**:
```bash
# Run E2E tests
npm run test:e2e

# Open Cypress UI
npm run cypress:open

# Run specific test
npx cypress run --spec "cypress/e2e/auth.cy.ts"
```

**Example E2E Test**:
```typescript
describe('Authentication Flow', () => {
  it('should login and navigate to dashboard', () => {
    cy.visit('/login');
    cy.get('[data-testid=email]').type('admin@company.com');
    cy.get('[data-testid=password]').type('password');
    cy.get('[data-testid=login-button]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Backend Testing

### Unit Tests

**Location**: `backend/__tests__/unit/`

**Coverage**:
- Authentication utilities
- Password hashing
- JWT token generation/verification
- Input validation

**Running Tests**:
```bash
cd backend
npm run test:unit
```

**Example Unit Test**:
```javascript
describe('Authentication Utilities', () => {
  test('should hash password correctly', async () => {
    const password = 'testpassword123';
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).not.toBe(password);
  });
});
```

### Integration Tests

**Location**: `backend/__tests__/integration/`

**Coverage**:
- API endpoints
- Database operations
- Authentication flow
- Error handling

**Running Tests**:
```bash
cd backend
npm run test:integration
```

**Example Integration Test**:
```javascript
describe('API Integration Tests', () => {
  test('should create new todo', async () => {
    const response = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Todo' })
      .expect(201);
    
    expect(response.body.todo.title).toBe('Test Todo');
  });
});
```

### Security Tests

**Location**: `backend/__tests__/security/`

**Coverage**:
- Authentication security
- Authorization checks
- Input validation
- Rate limiting
- CORS configuration

**Running Tests**:
```bash
cd backend
npm run test:security
```

**Example Security Test**:
```javascript
describe('Security Tests', () => {
  test('should reject requests without authentication', async () => {
    const response = await request(app)
      .get('/api/todos')
      .expect(401);
    
    expect(response.body.error).toBe('Access token required');
  });
});
```

### Performance Tests

**Location**: `backend/__tests__/performance/`

**Coverage**:
- Response time benchmarks
- Load testing
- Memory usage
- Concurrent request handling

**Running Tests**:
```bash
cd backend
npm run test:performance
```

**Example Performance Test**:
```javascript
describe('Performance Tests', () => {
  test('should respond within 100ms', async () => {
    const startTime = Date.now();
    await request(app).get('/api/health').expect(200);
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(100);
  });
});
```

## Mobile Testing

### Unit Tests

**Location**: `mobile/__tests__/`

**Coverage**:
- App initialization
- Authentication flow
- Navigation
- Component rendering

**Running Tests**:
```bash
cd mobile
npm test
```

**Example Mobile Test**:
```typescript
describe('Mobile App', () => {
  test('should render app without crashing', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('app-container')).toBeTruthy();
  });
});
```

## API Testing

### Contract Tests

**Purpose**: Ensure API contracts are maintained between frontend and backend.

**Tools**: Jest + Supertest

**Location**: `tests/api/`

**Running Tests**:
```bash
npm run test:api
```

### Load Testing

**Purpose**: Verify system performance under load.

**Tools**: Artillery, k6, or custom Jest tests

**Location**: `tests/load/`

**Running Tests**:
```bash
npm run test:load
```

## Test Configuration

### Jest Configuration

**Frontend** (`jest.config.js`):
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ]
};
```

**Backend** (`backend/package.json`):
```json
{
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "**/*.{js,ts}",
      "!**/node_modules/**"
    ],
    "setupFilesAfterEnv": [
      "<rootDir>/__tests__/setup/jest.setup.js"
    ]
  }
}
```

### Cypress Configuration

**Location**: `cypress.config.js`

```javascript
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true
  }
};
```

## Test Data Management

### Test Users

**Backend Test Users**:
```javascript
const testUsers = {
  admin: {
    email: 'admin@company.com',
    password: 'password',
    role: 'admin'
  },
  employee: {
    email: 'richard@company.com',
    password: 'password',
    role: 'employee'
  }
};
```

### Test Utilities

**Location**: `backend/__tests__/setup/jest.setup.js`

```javascript
global.testUtils = {
  generateTestToken: (user = {}) => {
    // Generate JWT token for testing
  },
  createTestUser: (overrides = {}) => {
    // Create test user data
  },
  createTestTodo: (overrides = {}) => {
    // Create test todo data
  }
};
```

## Continuous Integration

### GitHub Actions

**Location**: `.github/workflows/test.yml`

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run backend tests
        run: cd backend && npm test
      - name: Run frontend tests
        run: npm test -- --coverage --watchAll=false
      - name: Run E2E tests
        run: npm run test:e2e
```

## Test Coverage Goals

### Frontend Coverage
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Backend Coverage
- **Statements**: 95%
- **Branches**: 90%
- **Functions**: 95%
- **Lines**: 95%

### API Coverage
- **Endpoints**: 100%
- **Error scenarios**: 100%
- **Authentication**: 100%

## Best Practices

### Test Organization
1. **Arrange**: Set up test data and conditions
2. **Act**: Execute the function/component being tested
3. **Assert**: Verify the expected outcomes

### Naming Conventions
- Test files: `*.test.ts` or `*.spec.ts`
- Test suites: Describe the feature being tested
- Test cases: Describe the specific scenario

### Mocking Strategy
- Mock external dependencies (APIs, databases)
- Mock time-dependent functions
- Use realistic test data

### Error Testing
- Test both success and failure scenarios
- Verify error messages and status codes
- Test edge cases and boundary conditions

## Running All Tests

### Complete Test Suite
```bash
# Run all tests (frontend + backend + E2E)
npm run test:full

# Run with coverage report
npm run test:coverage

# Run in CI mode
npm run test:ci
```

### Health Checks
```bash
# Check if servers are running
npm run test:health

# Run smoke tests
npm run test:smoke
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure test servers use different ports
2. **Database conflicts**: Use separate test databases
3. **Async timing**: Use proper waitFor and timeout configurations
4. **Mock cleanup**: Clear mocks between tests

### Debug Mode
```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with debug
DEBUG=* npm test -- --testNamePattern="should login"
```

## Performance Benchmarks

### Response Time Targets
- **Health check**: < 50ms
- **Authentication**: < 200ms
- **CRUD operations**: < 150ms
- **Complex queries**: < 500ms

### Load Testing Targets
- **Concurrent users**: 100+
- **Requests per second**: 1000+
- **Error rate**: < 1%
- **Response time 95th percentile**: < 500ms

## Security Testing Checklist

- [ ] Authentication bypass attempts
- [ ] Authorization boundary testing
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting effectiveness
- [ ] Sensitive data exposure
- [ ] CORS configuration
- [ ] Security headers

## Maintenance

### Regular Tasks
1. **Update test dependencies** monthly
2. **Review test coverage** weekly
3. **Update test data** when schemas change
4. **Performance regression testing** weekly
5. **Security test updates** monthly

### Test Data Cleanup
```bash
# Clean test data
npm run test:cleanup

# Reset test database
npm run test:reset
```

This comprehensive testing guide ensures robust quality assurance across all components of the Digital Tracking Merchandising platform. 