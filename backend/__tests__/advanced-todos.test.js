/**
 * Advanced Todo API Tests
 * 
 * Comprehensive test suite for advanced todo endpoints covering:
 * - Creating advanced todos with questions
 * - Submitting todo responses
 * - Managing todo submissions
 * - Template creation and management
 * - Error handling and validation
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

const request = require('supertest');
const app = require('../server');

describe('Advanced Todo API', () => {
  let adminToken, employeeToken, todoId;

  // Test data
  const testQuestions = [
    {
      id: 'q1',
      type: 'text_answer',
      title: 'What is your name?',
      description: 'Please enter your full name',
      required: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'q2',
      type: 'multiple_choice',
      title: 'Select your preferences',
      description: 'Choose all that apply',
      required: false,
      order: 2,
      options: [
        { id: 'opt1', label: 'Option 1', value: 'option1' },
        { id: 'opt2', label: 'Option 2', value: 'option2' },
        { id: 'opt3', label: 'Option 3', value: 'option3' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'q3',
      type: 'photo_upload',
      title: 'Upload a photo',
      description: 'Take or upload a photo',
      required: true,
      order: 3,
      maxFiles: 1,
      maxFileSize: 5 * 1024 * 1024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  beforeAll(async () => {
    // Create test users and get valid tokens
    const adminUser = {
      email: 'admin@test.com',
      password: 'adminpass123',
      role: 'admin'
    };

    const employeeUser = {
      email: 'employee@test.com',
      password: 'employeepass123',
      role: 'employee'
    };

    // Register admin user
    await request(app)
      .post('/api/auth/register')
      .send(adminUser);

    // Register employee user
    await request(app)
      .post('/api/auth/register')
      .send(employeeUser);

    // Login to get tokens
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password
      });

    const employeeResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: employeeUser.email,
        password: employeeUser.password
      });

    adminToken = adminResponse.body.token;
    employeeToken = employeeResponse.body.token;
  });

  describe('GET /api/advanced-todos', () => {
    it('should return advanced todos assigned to the user', async () => {
      const response = await request(app)
        .get('/api/advanced-todos')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('advancedTodos');
      expect(Array.isArray(response.body.advancedTodos)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/advanced-todos');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/advanced-todos', () => {
    const validAdvancedTodo = {
      title: 'Test Advanced Todo',
      description: 'Test description',
      questions: testQuestions,
      assignedTo: ['employee_test'],
      category: 'General',
      difficulty: 'medium',
      estimatedDuration: 30,
      requireApproval: false,
      isTemplate: false,
      tags: ['test', 'advanced']
    };

    it('should create an advanced todo successfully', async () => {
      const response = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validAdvancedTodo);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Advanced todo created successfully');
      expect(response.body).toHaveProperty('advancedTodo');
      expect(response.body.advancedTodo.title).toBe(validAdvancedTodo.title);
      expect(response.body.advancedTodo.questions).toHaveLength(3);
      expect(response.body.advancedTodo.assignedTo).toContain('employee_test');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(validAdvancedTodo);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Admin access required');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidTodo = {
        description: 'Test description',
        questions: testQuestions,
        assignedTo: ['employee_test']
      };

      const response = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidTodo);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Title');
    });

    it('should return 400 for empty questions array', async () => {
      const invalidTodo = {
        ...validAdvancedTodo,
        questions: []
      };

      const response = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidTodo);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Questions must be a non-empty array');
    });

    it('should return 400 for empty assignedTo array', async () => {
      const invalidTodo = {
        ...validAdvancedTodo,
        assignedTo: []
      };

      const response = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidTodo);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('assignedTo must be a non-empty array');
    });

    it('should create todo with default values', async () => {
      const minimalTodo = {
        title: 'Minimal Todo',
        questions: [testQuestions[0]],
        assignedTo: ['employee_test']
      };

      const response = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(minimalTodo);

      expect(response.status).toBe(201);
      expect(response.body.advancedTodo.difficulty).toBe('medium');
      expect(response.body.advancedTodo.estimatedDuration).toBe(30);
      expect(response.body.advancedTodo.requireApproval).toBe(false);
      expect(response.body.advancedTodo.isTemplate).toBe(false);
    });
  });

  describe('POST /api/advanced-todos/:todoId/submit', () => {
    let todoId;

    beforeAll(async () => {
      // Create a test todo
      const createResponse = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Todo for Submission',
          questions: testQuestions,
          assignedTo: ['employee_test']
        });

      todoId = createResponse.body.advancedTodo.id;
    });

    it('should submit todo responses successfully', async () => {
      const responses = [
        {
          questionId: 'q1',
          answer: 'John Doe'
        },
        {
          questionId: 'q2',
          answer: ['option1', 'option2']
        },
        {
          questionId: 'q3',
          answer: ['photo1.jpg']
        }
      ];

      const response = await request(app)
        .post(`/api/advanced-todos/${todoId}/submit`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          responses,
          status: 'submitted'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Todo responses submitted successfully');
      expect(response.body).toHaveProperty('submission');
      expect(response.body.submission.responses).toHaveLength(3);
      expect(response.body.submission.status).toBe('submitted');
    });

    it('should save draft responses', async () => {
      const responses = [
        {
          questionId: 'q1',
          answer: 'Jane Doe'
        }
      ];

      const response = await request(app)
        .post(`/api/advanced-todos/${todoId}/submit`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          responses,
          status: 'draft'
        });

      expect(response.status).toBe(201);
      expect(response.body.submission.status).toBe('draft');
      expect(response.body.submission.submittedAt).toBeNull();
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .post('/api/advanced-todos/non-existent-id/submit')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          responses: [],
          status: 'submitted'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Advanced todo not found');
    });

    it('should return 403 if user is not assigned to todo', async () => {
      const otherEmployeeToken = 'other_employee_token';
      
      const response = await request(app)
        .post(`/api/advanced-todos/${todoId}/submit`)
        .set('Authorization', `Bearer ${otherEmployeeToken}`)
        .send({
          responses: [],
          status: 'submitted'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Not assigned to this todo');
    });

    it('should return 400 for invalid responses format', async () => {
      const response = await request(app)
        .post(`/api/advanced-todos/${todoId}/submit`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          responses: 'invalid',
          status: 'submitted'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Responses must be an array');
    });
  });

  describe('GET /api/advanced-todos/:todoId/submissions', () => {
    let todoId;

    beforeAll(async () => {
      // Create a test todo
      const createResponse = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Todo for Submissions',
          questions: testQuestions,
          assignedTo: ['employee_test']
        });

      todoId = createResponse.body.advancedTodo.id;

      // Submit a response
      await request(app)
        .post(`/api/advanced-todos/${todoId}/submit`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          responses: [
            { questionId: 'q1', answer: 'Test Answer' }
          ],
          status: 'submitted'
        });
    });

    it('should return submissions for a todo (admin only)', async () => {
      const response = await request(app)
        .get(`/api/advanced-todos/${todoId}/submissions`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('submissions');
      expect(Array.isArray(response.body.submissions)).toBe(true);
      expect(response.body.submissions.length).toBeGreaterThan(0);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get(`/api/advanced-todos/${todoId}/submissions`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Admin access required');
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .get('/api/advanced-todos/non-existent-id/submissions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Advanced todo not found');
    });
  });

  describe('PUT /api/todo-submissions/:submissionId/status', () => {
    let submissionId;

    beforeAll(async () => {
      // Create a test todo and submission
      const createResponse = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Todo for Approval',
          questions: testQuestions,
          assignedTo: ['employee_test'],
          requireApproval: true
        });

      const todoId = createResponse.body.advancedTodo.id;

      const submitResponse = await request(app)
        .post(`/api/advanced-todos/${todoId}/submit`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          responses: [
            { questionId: 'q1', answer: 'Test Answer' }
          ],
          status: 'submitted'
        });

      submissionId = submitResponse.body.submission.id;
    });

    it('should approve a submission successfully', async () => {
      const response = await request(app)
        .put(`/api/todo-submissions/${submissionId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved',
          feedback: 'Great work!',
          score: 95
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Submission status updated successfully');
      expect(response.body.submission.status).toBe('approved');
      expect(response.body.submission.feedback).toBe('Great work!');
      expect(response.body.submission.score).toBe(95);
      expect(response.body.submission.approvedAt).toBeTruthy();
    });

    it('should reject a submission', async () => {
      const response = await request(app)
        .put(`/api/todo-submissions/${submissionId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected',
          feedback: 'Please provide more details',
          score: 60
        });

      expect(response.status).toBe(200);
      expect(response.body.submission.status).toBe('rejected');
      expect(response.body.submission.feedback).toBe('Please provide more details');
      expect(response.body.submission.rejectedAt).toBeTruthy();
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/todo-submissions/${submissionId}/status`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          status: 'approved'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Admin access required');
    });

    it('should return 404 for non-existent submission', async () => {
      const response = await request(app)
        .put('/api/todo-submissions/non-existent-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Submission not found');
    });
  });

  describe('GET /api/todo-templates', () => {
    beforeAll(async () => {
      // Create a test template
      await request(app)
        .post('/api/todo-templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Template',
          description: 'A test template',
          questions: testQuestions,
          category: 'General',
          difficulty: 'medium',
          estimatedDuration: 30,
          tags: ['test'],
          isPublic: true
        });
    });

    it('should return todo templates', async () => {
      const response = await request(app)
        .get('/api/todo-templates')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/todo-templates');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/todo-templates', () => {
    const validTemplate = {
      name: 'Test Template',
      description: 'A test template for advanced todos',
      questions: testQuestions,
      category: 'General',
      difficulty: 'medium',
      estimatedDuration: 30,
      tags: ['test', 'template'],
      isPublic: false
    };

    it('should create a todo template successfully', async () => {
      const response = await request(app)
        .post('/api/todo-templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validTemplate);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Todo template created successfully');
      expect(response.body).toHaveProperty('template');
      expect(response.body.template.name).toBe(validTemplate.name);
      expect(response.body.template.questions).toHaveLength(3);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/todo-templates')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(validTemplate);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Admin access required');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidTemplate = {
        description: 'A test template',
        questions: testQuestions,
        category: 'General'
      };

      const response = await request(app)
        .post('/api/todo-templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidTemplate);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Name');
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // This test would require mocking the database to throw an error
      // For now, we'll test with invalid data that should cause validation errors
      const response = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test',
          questions: null, // Invalid questions
          assignedTo: ['employee_test']
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });
  });

  describe('Question Type Validation', () => {
    it('should validate question types', async () => {
      const invalidQuestions = [
        {
          id: 'q1',
          type: 'invalid_type',
          title: 'Invalid Question',
          required: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const response = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Todo',
          questions: invalidQuestions,
          assignedTo: ['employee_test']
        });

      expect(response.status).toBe(400);
    });

    it('should validate question options for choice questions', async () => {
      const invalidChoiceQuestion = [
        {
          id: 'q1',
          type: 'multiple_choice',
          title: 'Choice Question',
          required: true,
          order: 1,
          // Missing options
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const response = await request(app)
        .post('/api/advanced-todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Todo',
          questions: invalidChoiceQuestion,
          assignedTo: ['employee_test']
        });

      expect(response.status).toBe(400);
    });
  });
}); 