const request = require('supertest');
const app = require('../server');

describe('Todo Assignment API Tests', () => {
  let adminToken;
  let employeeToken;
  let adminId;
  let employeeId;

  beforeAll(async () => {
    // Login as admin to get token
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@company.com',
        password: 'password'
      });
    
    adminToken = adminResponse.body.token;
    adminId = adminResponse.body.user.id;

    // Login as employee to get token
    const employeeResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'richard@company.com',
        password: 'password'
      });
    
    employeeToken = employeeResponse.body.token;
    employeeId = employeeResponse.body.user.id;
  });

  describe('GET /api/users', () => {
    test('admin can get all users for assignment', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
      
      // Check user structure
      const user = response.body.users[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).not.toHaveProperty('password'); // Should not expose password
    });

    test('employee cannot get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied. Admin only.');
    });

    test('requires authentication', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('POST /api/todos', () => {
    test('admin can create todo and assign to employee', async () => {
      const todoData = {
        title: 'Test Assigned Todo',
        description: 'This is a test todo assigned to an employee',
        priority: 'high',
        assignedTo: employeeId
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(todoData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Todo created successfully');
      expect(response.body.todo).toBeDefined();
      
      const todo = response.body.todo;
      expect(todo.title).toBe(todoData.title);
      expect(todo.description).toBe(todoData.description);
      expect(todo.priority).toBe(todoData.priority);
      expect(todo.assignedTo).toBe(employeeId);
      expect(todo.assignedBy).toBe(adminId);
      expect(todo.assignedAt).toBeDefined();
      expect(todo.completed).toBe(false);
      expect(todo.userId).toBe(adminId); // Creator
    });

    test('admin can create todo without assignment (self-assigned)', async () => {
      const todoData = {
        title: 'Test Self-Assigned Todo',
        description: 'This is a test todo assigned to self',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(todoData);

      expect(response.status).toBe(201);
      expect(response.body.todo).toBeDefined();
      
      const todo = response.body.todo;
      expect(todo.assignedTo).toBe(adminId); // Should default to creator
      expect(todo.assignedBy).toBe(adminId);
    });

    test('employee can create todo (self-assigned)', async () => {
      const todoData = {
        title: 'Employee Todo',
        description: 'This is an employee-created todo',
        priority: 'low'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(todoData);

      expect(response.status).toBe(201);
      expect(response.body.todo).toBeDefined();
      
      const todo = response.body.todo;
      expect(todo.assignedTo).toBe(employeeId);
      expect(todo.assignedBy).toBe(employeeId);
      expect(todo.userId).toBe(employeeId);
    });

    test('validates required fields', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Missing title',
          priority: 'high'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required');
    });

    test('requires authentication', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Test Todo',
          description: 'Test description'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('GET /api/todos', () => {
    let assignedTodoId;

    beforeAll(async () => {
      // Create a todo assigned to employee
      const todoData = {
        title: 'Todo for Employee',
        description: 'This todo is assigned to employee',
        priority: 'medium',
        assignedTo: employeeId
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(todoData);

      assignedTodoId = response.body.todo.id;
    });

    test('employee sees todos assigned to them', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.todos).toBeDefined();
      expect(Array.isArray(response.body.todos)).toBe(true);
      
      // Employee should see todos assigned to them
      const employeeTodos = response.body.todos.filter(todo => todo.assignedTo === employeeId);
      expect(employeeTodos.length).toBeGreaterThan(0);
      
      // Check that all returned todos are assigned to the employee
      response.body.todos.forEach(todo => {
        expect(todo.assignedTo).toBe(employeeId);
      });
    });

    test('admin sees todos assigned to them', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.todos).toBeDefined();
      
      // Admin should see todos assigned to them
      const adminTodos = response.body.todos.filter(todo => todo.assignedTo === adminId);
      expect(adminTodos.length).toBeGreaterThan(0);
      
      // Check that all returned todos are assigned to the admin
      response.body.todos.forEach(todo => {
        expect(todo.assignedTo).toBe(adminId);
      });
    });

    test('requires authentication', async () => {
      const response = await request(app)
        .get('/api/todos');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('PUT /api/todos/:id', () => {
    let todoId;

    beforeAll(async () => {
      // Create a todo for testing updates
      const todoData = {
        title: 'Todo for Update Test',
        description: 'This todo will be updated',
        priority: 'low',
        assignedTo: employeeId
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(todoData);

      todoId = response.body.todo.id;
    });

    test('employee can update assigned todo', async () => {
      const updateData = {
        title: 'Updated Todo Title',
        description: 'Updated description',
        priority: 'high',
        completed: true
      };

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Todo updated successfully');
      expect(response.body.todo).toBeDefined();
      
      const updatedTodo = response.body.todo;
      expect(updatedTodo.title).toBe(updateData.title);
      expect(updatedTodo.description).toBe(updateData.description);
      expect(updatedTodo.priority).toBe(updateData.priority);
      expect(updatedTodo.completed).toBe(updateData.completed);
      expect(updatedTodo.completedAt).toBeDefined();
    });

    test('employee cannot update todo not assigned to them', async () => {
      // Create a todo assigned to admin
      const adminTodoData = {
        title: 'Admin Todo',
        description: 'This todo belongs to admin',
        priority: 'medium',
        assignedTo: adminId
      };

      const createResponse = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminTodoData);

      const adminTodoId = createResponse.body.todo.id;

      // Try to update as employee
      const updateResponse = await request(app)
        .put(`/api/todos/${adminTodoId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          title: 'Unauthorized Update',
          completed: true
        });

      expect(updateResponse.status).toBe(404);
      expect(updateResponse.body.error).toBe('Todo not found');
    });

    test('validates todo exists', async () => {
      const response = await request(app)
        .put('/api/todos/nonexistent-id')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          title: 'Test Update'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });

    test('requires authentication', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({
          title: 'Test Update'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let todoId;

    beforeAll(async () => {
      // Create a todo for testing deletion
      const todoData = {
        title: 'Todo for Delete Test',
        description: 'This todo will be deleted',
        priority: 'medium',
        assignedTo: employeeId
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(todoData);

      todoId = response.body.todo.id;
    });

    test('employee can delete assigned todo', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Todo deleted successfully');
    });

    test('employee cannot delete todo not assigned to them', async () => {
      // Create a todo assigned to admin
      const adminTodoData = {
        title: 'Admin Todo for Delete Test',
        description: 'This todo belongs to admin',
        priority: 'medium',
        assignedTo: adminId
      };

      const createResponse = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminTodoData);

      const adminTodoId = createResponse.body.todo.id;

      // Try to delete as employee
      const deleteResponse = await request(app)
        .delete(`/api/todos/${adminTodoId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.body.error).toBe('Todo not found');
    });

    test('validates todo exists', async () => {
      const response = await request(app)
        .delete('/api/todos/nonexistent-id')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });

    test('requires authentication', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('Assignment Tracking', () => {
    test('tracks assignment metadata correctly', async () => {
      const todoData = {
        title: 'Assignment Tracking Test',
        description: 'Testing assignment metadata',
        priority: 'high',
        assignedTo: employeeId
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(todoData);

      expect(response.status).toBe(201);
      
      const todo = response.body.todo;
      expect(todo.assignedTo).toBe(employeeId);
      expect(todo.assignedBy).toBe(adminId);
      expect(todo.assignedAt).toBeDefined();
      expect(new Date(todo.assignedAt).getTime()).toBeGreaterThan(0);
      
      // Verify assignment timestamp is recent
      const assignedTime = new Date(todo.assignedAt).getTime();
      const now = Date.now();
      expect(now - assignedTime).toBeLessThan(5000); // Within 5 seconds
    });

    test('defaults to self-assignment when no assignedTo provided', async () => {
      const todoData = {
        title: 'Self Assignment Test',
        description: 'Testing default self-assignment',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(todoData);

      expect(response.status).toBe(201);
      
      const todo = response.body.todo;
      expect(todo.assignedTo).toBe(employeeId);
      expect(todo.assignedBy).toBe(employeeId);
      expect(todo.assignedAt).toBeDefined();
    });
  });

  describe('Data Integrity', () => {
    test('maintains data consistency across operations', async () => {
      // Create todo
      const createResponse = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Data Integrity Test',
          description: 'Testing data consistency',
          priority: 'medium',
          assignedTo: employeeId
        });

      expect(createResponse.status).toBe(201);
      const createdTodo = createResponse.body.todo;

      // Update todo
      const updateResponse = await request(app)
        .put(`/api/todos/${createdTodo.id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          completed: true
        });

      expect(updateResponse.status).toBe(200);
      const updatedTodo = updateResponse.body.todo;

      // Verify assignment data is preserved
      expect(updatedTodo.assignedTo).toBe(createdTodo.assignedTo);
      expect(updatedTodo.assignedBy).toBe(createdTodo.assignedBy);
      expect(updatedTodo.assignedAt).toBe(createdTodo.assignedAt);
      expect(updatedTodo.userId).toBe(createdTodo.userId);
      expect(updatedTodo.completed).toBe(true);
      expect(updatedTodo.completedAt).toBeDefined();
    });
  });
}); 