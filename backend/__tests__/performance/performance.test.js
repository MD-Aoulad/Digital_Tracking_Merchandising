/**
 * Performance Tests
 * Tests API response times, load handling, and performance characteristics
 */

const request = require('supertest');
const app = require('../../server');

describe('Performance Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Get authentication token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@company.com', password: 'password' });
    authToken = response.body.token;
  });

  describe('Response Time Tests', () => {
    test('health endpoint should respond within 100ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/health')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
    });

    test('authentication endpoints should respond within 200ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@company.com', password: 'password' })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200);
    });

    test('protected endpoints should respond within 150ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(150);
    });
  });

  describe('Load Testing', () => {
    test('should handle multiple concurrent requests', async () => {
      const concurrentRequests = 10;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/health')
            .expect(200)
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(responses).toHaveLength(concurrentRequests);
      expect(totalTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle concurrent authenticated requests', async () => {
      const concurrentRequests = 5;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200)
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(responses).toHaveLength(concurrentRequests);
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    test('should handle rapid sequential requests', async () => {
      const requests = 20;
      const startTime = Date.now();

      for (let i = 0; i < requests; i++) {
        await request(app)
          .get('/api/health')
          .expect(200);
      }

      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / requests;

      expect(averageTime).toBeLessThan(50); // Average response time should be under 50ms
    });
  });

  describe('Memory Usage Tests', () => {
    test('should not have memory leaks with repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make multiple requests
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/api/health')
          .expect(200);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should handle large request bodies efficiently', async () => {
      const largeData = {
        title: 'A'.repeat(1000), // Large title
        description: 'B'.repeat(5000), // Large description
        priority: 'high'
      };

      const startTime = Date.now();
      
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largeData)
        .expect(201);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500); // Should handle large data within 500ms
    });
  });

  describe('Database Performance (In-Memory)', () => {
    test('should handle bulk operations efficiently', async () => {
      const todos = [];
      for (let i = 0; i < 50; i++) {
        todos.push({
          title: `Todo ${i}`,
          description: `Description ${i}`,
          priority: 'medium'
        });
      }

      const startTime = Date.now();

      // Create todos in parallel
      const promises = todos.map(todo =>
        request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(todo)
          .expect(201)
      );

      await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(3000); // Should complete within 3 seconds
    });

    test('should retrieve large datasets efficiently', async () => {
      // First, create some todos
      for (let i = 0; i < 20; i++) {
        await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: `Performance Todo ${i}`,
            description: `Description ${i}`,
            priority: 'medium'
          });
      }

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(response.body.todos.length).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(200); // Should retrieve data within 200ms
    });
  });

  describe('Rate Limiting Performance', () => {
    test('should handle rate limiting efficiently', async () => {
      const requests = 20;
      const promises = [];

      for (let i = 0; i < requests; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All should fail with 401, but rate limiting should work efficiently
      responses.forEach(response => {
        expect(response.status).toBe(401);
      });

      expect(totalTime).toBeLessThan(2000); // Should handle rate limiting within 2 seconds
    });
  });

  describe('Error Handling Performance', () => {
    test('should handle errors efficiently', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/nonexistent')
        .expect(404);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100); // Error responses should be fast
    });

    test('should handle validation errors efficiently', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/auth/login')
        .send({}) // Missing required fields
        .expect(400);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
    });
  });

  describe('CORS Performance', () => {
    test('should handle CORS preflight requests efficiently', async () => {
      const startTime = Date.now();
      
      await request(app)
        .options('/api/todos')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type, Authorization')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(50); // CORS should be very fast
    });
  });
}); 