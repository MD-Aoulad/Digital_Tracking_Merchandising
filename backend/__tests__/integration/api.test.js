/**
 * API Integration Tests
 * Tests all API endpoints with real HTTP requests
 */

const request = require('supertest');
const app = require('../../server');

describe('API Integration Tests', () => {
  let authToken;
  let adminToken;
  let testUserId;
  let testTodoId;
  let testReportId;

  beforeAll(async () => {
    // Setup test data
    testUserId = 'test-user-' + Date.now();
    
    // Login as admin for tests that need admin access
    const adminLoginData = {
      email: 'admin@company.com',
      password: 'password'
    };

    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send(adminLoginData)
      .expect(200);

    adminToken = adminResponse.body.token;
  });

  describe('Health Check', () => {
    test('GET /api/health should return server status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Authentication Endpoints', () => {
    test('POST /api/auth/register should create new user', async () => {
      const userData = {
        email: 'testuser@example.com',
        password: 'testpassword123',
        name: 'Test User',
        role: 'employee',
        department: 'Test Department'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    test('POST /api/auth/login should authenticate user', async () => {
      const loginData = {
        email: 'admin@company.com',
        password: 'password'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
      
      authToken = response.body.token; // Save for other tests
    });

    test('POST /api/auth/login should reject invalid credentials', async () => {
      const loginData = {
        email: 'admin@company.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('GET /api/auth/profile should return user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user).toHaveProperty('role');
      expect(response.body.user.password).toBeUndefined();
    });

    test('GET /api/auth/profile should reject without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('Todo Endpoints', () => {
    test('POST /api/todos should create new todo', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test description',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('todo');
      expect(response.body.todo.title).toBe(todoData.title);
      expect(response.body.todo.description).toBe(todoData.description);
      expect(response.body.todo.priority).toBe(todoData.priority);
      expect(response.body.todo.completed).toBe(false);
      
      testTodoId = response.body.todo.id; // Save for other tests
    });

    test('GET /api/todos should return user todos', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('todos');
      expect(Array.isArray(response.body.todos)).toBe(true);
      expect(response.body.todos.length).toBeGreaterThan(0);
    });

    test('PUT /api/todos/:id should update todo', async () => {
      const updateData = {
        title: 'Updated Todo',
        completed: true
      };

      const response = await request(app)
        .put(`/api/todos/${testTodoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('todo');
      expect(response.body.todo.title).toBe(updateData.title);
      expect(response.body.todo.completed).toBe(updateData.completed);
    });

    test('DELETE /api/todos/:id should delete todo', async () => {
      const response = await request(app)
        .delete(`/api/todos/${testTodoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Todo deleted successfully');
    });
  });

  describe('Report Endpoints', () => {
    test('POST /api/reports should create new report', async () => {
      const reportData = {
        title: 'Test Report',
        type: 'daily',
        content: 'Test report content'
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('report');
      expect(response.body.report.title).toBe(reportData.title);
      expect(response.body.report.type).toBe(reportData.type);
      expect(response.body.report.content).toBe(reportData.content);
      expect(response.body.report.status).toBe('pending');
      
      testReportId = response.body.report.id; // Save for other tests
    });

    test('GET /api/reports should return user reports', async () => {
      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('reports');
      expect(Array.isArray(response.body.reports)).toBe(true);
      expect(response.body.reports.length).toBeGreaterThan(0);
    });
  });

  describe('Attendance Endpoints', () => {
    beforeEach(async () => {
      // Reset attendance data before each test
      await request(app)
        .post('/api/test/reset-attendance')
        .expect(200);
    });

    test('POST /api/attendance/punch-in should record punch in', async () => {
      const punchInData = {
        workplace: 'Office Building A',
        photo: 'base64-photo-data'
      };

      const response = await request(app)
        .post('/api/attendance/punch-in')
        .set('Authorization', `Bearer ${authToken}`)
        .send(punchInData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('punchInTime');
      expect(response.body).toHaveProperty('workplace');
      expect(response.body).toHaveProperty('attendance');
      expect(response.body.attendance.punchIn).toBeDefined();
      expect(response.body.attendance.workplace).toBe(punchInData.workplace);
    });

    test('POST /api/attendance/punch-out should record punch out', async () => {
      // First ensure we have a punch-in for today
      const punchInData = {
        workplace: 'Office Building A',
        photo: 'base64-photo-data'
      };

      await request(app)
        .post('/api/attendance/punch-in')
        .set('Authorization', `Bearer ${authToken}`)
        .send(punchInData)
        .expect(200);

      // Add a longer delay to ensure hoursWorked > 0
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await request(app)
        .post('/api/attendance/punch-out')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('punchOutTime');
      expect(response.body).toHaveProperty('workplace');
      expect(response.body).toHaveProperty('hoursWorked');
      expect(response.body.attendance.punchOut).toBeDefined();
      expect(response.body.attendance.hoursWorked).toBeGreaterThan(0);
    });

    test('Admin users should be able to punch in and out', async () => {
      // Test that admin users can also punch in
      const punchInData = {
        workplace: 'Admin Office',
        photo: 'base64-photo-data'
      };

      const punchInResponse = await request(app)
        .post('/api/attendance/punch-in')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(punchInData)
        .expect(200);

      expect(punchInResponse.body).toHaveProperty('message');
      expect(punchInResponse.body).toHaveProperty('workplace');
      expect(punchInResponse.body.attendance.punchIn).toBeDefined();

      // Add delay for hours calculation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test that admin users can punch out
      const punchOutResponse = await request(app)
        .post('/api/attendance/punch-out')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(punchOutResponse.body).toHaveProperty('message');
      expect(punchOutResponse.body).toHaveProperty('workplace');
      expect(punchOutResponse.body).toHaveProperty('hoursWorked');
      expect(punchOutResponse.body.attendance.hoursWorked).toBeGreaterThan(0);
    });

    test('GET /api/attendance should return attendance data', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('attendance');
      expect(typeof response.body.attendance).toBe('object');
    });
  });

  describe('Admin Endpoints', () => {
    let regularUserToken; // Token for regular (non-admin) user
    
    beforeAll(async () => {
      // Login as regular user (employee)
      const regularLoginData = {
        email: 'richard@company.com',
        password: 'password'
      };

      const regularResponse = await request(app)
        .post('/api/auth/login')
        .send(regularLoginData)
        .expect(200);

      regularUserToken = regularResponse.body.token;
    });

    test('GET /api/admin/users should return all users (admin only)', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
      
      // Check that passwords are not included
      response.body.users.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });

    test('GET /api/admin/todos should return all todos (admin only)', async () => {
      const response = await request(app)
        .get('/api/admin/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('todos');
      expect(Array.isArray(response.body.todos)).toBe(true);
    });

    test('GET /api/admin/reports should return all reports (admin only)', async () => {
      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('reports');
      expect(Array.isArray(response.body.reports)).toBe(true);
    });

    test('GET /api/admin/attendance should return all attendance (admin only)', async () => {
      const response = await request(app)
        .get('/api/admin/attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('attendance');
      expect(typeof response.body.attendance).toBe('object');
    });

    test('Admin endpoints should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${regularUserToken}`) // Regular user token
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Admin access required');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Route not found');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' }) // Missing password
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Email and password are required');
    });
  });
}); 