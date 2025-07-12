/**
 * Unit tests for authentication utilities
 * Tests password hashing, JWT generation, and token verification
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import the functions we want to test (these would be extracted from server.js)
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

describe('Authentication Utilities', () => {
  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    test('should hash different passwords differently', async () => {
      const password1 = 'password1';
      const password2 = 'password2';
      
      const hash1 = await hashPassword(password1);
      const hash2 = await hashPassword(password2);
      
      expect(hash1).not.toBe(hash2);
    });

    test('should hash same password differently each time', async () => {
      const password = 'samepassword';
      
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Password Comparison', () => {
    test('should return true for correct password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      const result = await comparePassword(password, hashedPassword);
      expect(result).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await hashPassword(password);
      
      const result = await comparePassword(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });

    test('should handle empty password', async () => {
      const password = '';
      const hashedPassword = await hashPassword(password);
      
      const result = await comparePassword(password, hashedPassword);
      expect(result).toBe(true);
    });
  });

  describe('JWT Token Generation', () => {
    test('should generate valid JWT token', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'employee',
        name: 'Test User'
      };
      
      const token = generateToken(user);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should include user data in token', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin',
        name: 'Admin User'
      };
      
      const token = generateToken(user);
      const decoded = verifyToken(token);
      
      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
      expect(decoded.name).toBe(user.name);
    });

    test('should generate different tokens for different users', () => {
      const user1 = { id: 'user1', email: 'user1@example.com', role: 'employee', name: 'User 1' };
      const user2 = { id: 'user2', email: 'user2@example.com', role: 'admin', name: 'User 2' };
      
      const token1 = generateToken(user1);
      const token2 = generateToken(user2);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('JWT Token Verification', () => {
    test('should verify valid token', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'employee',
        name: 'Test User'
      };
      
      const token = generateToken(user);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(user.id);
    });

    test('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    test('should throw error for expired token', () => {
      const user = { id: 'user123', email: 'test@example.com', role: 'employee', name: 'Test User' };
      
      // Generate token with short expiration
      const expiredToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1ms' });
      
      // Wait for token to expire
      setTimeout(() => {
        expect(() => {
          verifyToken(expiredToken);
        }).toThrow();
      }, 10);
    });
  });

  describe('Token Security', () => {
    test('should not include sensitive data in token', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'employee',
        name: 'Test User',
        password: 'sensitivepassword', // This should not be in token
        secretKey: 'secret' // This should not be in token
      };
      
      const token = generateToken(user);
      const decoded = verifyToken(token);
      
      expect(decoded.password).toBeUndefined();
      expect(decoded.secretKey).toBeUndefined();
      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
    });
  });
}); 