/**
 * Authentication Service Unit Tests
 * 
 * Tests for all authentication-related functionality including:
 * - Login/logout operations
 * - Token management
 * - Session validation
 * - Password validation
 */

import { 
  login, 
  logout, 
  getProfile, 
  refreshToken,
  requestPasswordReset,
  changePassword,
  checkAuthStatus,
  getStoredUser,
  updateStoredUser,
  clearAuthentication,
  getAuthToken,
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiration,
  isValidEmail,
  validatePassword,
  generateSecureToken
} from '../auth';
import { apiPost, apiGet, clearAuth } from '../../api/client';
import { UserRole } from '../../types';

// Mock the API client
jest.mock('../../api/client', () => ({
  apiPost: jest.fn(),
  apiGet: jest.fn(),
  clearAuth: jest.fn(),
  isAuthenticated: jest.fn(),
}));

describe('Auth Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Login Function', () => {
    it('should successfully login user and store credentials', async () => {
      const mockCredentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        message: 'Login successful',
        user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' },
        token: 'mock-jwt-token'
      };

      (apiPost as jest.Mock).mockResolvedValue(mockResponse);

      const result = await login(mockCredentials);

      expect(apiPost).toHaveBeenCalledWith('/auth/login', mockCredentials);
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-jwt-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockResponse.user));
      expect(result).toEqual(mockResponse);
    });

    it('should clear auth data on login failure', async () => {
      const mockCredentials = { email: 'test@example.com', password: 'wrongpassword' };
      const mockError = new Error('Invalid credentials');

      (apiPost as jest.Mock).mockRejectedValue(mockError);

      await expect(login(mockCredentials)).rejects.toThrow('Invalid credentials');
      expect(clearAuth).toHaveBeenCalled();
    });
  });

  describe('Logout Function', () => {
    it('should call logout endpoint and clear local data', async () => {
      (apiPost as jest.Mock).mockResolvedValue({});

      await logout();

      expect(apiPost).toHaveBeenCalledWith('/auth/logout');
      expect(clearAuth).toHaveBeenCalled();
    });

    it('should continue with local cleanup even if server call fails', async () => {
      (apiPost as jest.Mock).mockRejectedValue(new Error('Network error'));

      await logout();

      expect(clearAuth).toHaveBeenCalled();
    });
  });

  describe('Get Profile Function', () => {
    it('should fetch user profile successfully', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      (apiGet as jest.Mock).mockResolvedValue(mockUser);

      const result = await getProfile();

      expect(apiGet).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockUser);
    });
  });

  describe('Refresh Token Function', () => {
    it('should refresh token and update localStorage', async () => {
      const mockResponse = { token: 'new-jwt-token' };
      (apiPost as jest.Mock).mockResolvedValue(mockResponse);

      const result = await refreshToken();

      expect(apiPost).toHaveBeenCalledWith('/auth/refresh');
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'new-jwt-token');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Password Reset Functions', () => {
    it('should request password reset successfully', async () => {
      const mockResponse = { message: 'Reset email sent' };
      (apiPost as jest.Mock).mockResolvedValue(mockResponse);

      const result = await requestPasswordReset('test@example.com');

      expect(apiPost).toHaveBeenCalledWith('/auth/reset-password', { email: 'test@example.com' });
      expect(result).toEqual(mockResponse);
    });

    it('should change password successfully', async () => {
      const mockResponse = { message: 'Password changed successfully' };
      (apiPost as jest.Mock).mockResolvedValue(mockResponse);

      const result = await changePassword('oldpass', 'newpass');

      expect(apiPost).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'oldpass',
        newPassword: 'newpass'
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Session Management Functions', () => {
    it('should get stored user data', () => {
      const mockUser = { 
        id: '1', 
        name: 'Test User', 
        email: 'test@example.com',
        role: UserRole.ADMIN,
        department: 'IT',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00Z'
      };
      localStorage.setItem('userData', JSON.stringify(mockUser));

      const result = getStoredUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid stored user data', () => {
      localStorage.setItem('userData', 'invalid-json');

      const result = getStoredUser();

      expect(result).toBeNull();
    });

    it('should update stored user data', () => {
      const mockUser = { 
        id: '1', 
        name: 'Updated User',
        email: 'updated@example.com',
        role: UserRole.ADMIN,
        department: 'IT',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00Z'
      };

      updateStoredUser(mockUser);

      expect(localStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockUser));
    });

    it('should clear authentication data', () => {
      clearAuthentication();

      expect(clearAuth).toHaveBeenCalled();
    });
  });

  describe('Token Management Functions', () => {
    it('should get auth token', () => {
      localStorage.setItem('authToken', 'test-token');

      const result = getAuthToken();

      expect(result).toBe('test-token');
    });

    it('should check if token is expired', () => {
      // Mock a valid token (not expired)
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.signature';
      localStorage.setItem('authToken', validToken);

      const result = isTokenExpired();

      expect(result).toBe(false);
    });

    it('should return true for expired token', () => {
      // Mock an expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjF9.signature';
      localStorage.setItem('authToken', expiredToken);

      const result = isTokenExpired();

      expect(result).toBe(true);
    });

    it('should get token expiration time', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiO${expTime}.signature`;
      localStorage.setItem('authToken', token);

      const result = getTokenExpiration();

      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBeCloseTo(expTime * 1000, -2);
    });

    it('should get time until expiration', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiO${expTime}.signature`;
      localStorage.setItem('authToken', token);

      const result = getTimeUntilExpiration();

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(3600000); // 1 hour in milliseconds
    });
  });

  describe('Validation Functions', () => {
    describe('Email Validation', () => {
      it('should validate correct email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        expect(isValidEmail('test+tag@example.org')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        expect(isValidEmail('invalid-email')).toBe(false);
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('')).toBe(false);
      });
    });

    describe('Password Validation', () => {
      it('should validate strong passwords', () => {
        const result = validatePassword('StrongPass123!');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject weak passwords', () => {
        const result = validatePassword('weak');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should provide specific error messages', () => {
        const result = validatePassword('weak');
        expect(result.errors).toContain('Password must be at least 8 characters long');
        expect(result.errors).toContain('Password must contain at least one uppercase letter');
        expect(result.errors).toContain('Password must contain at least one number');
        expect(result.errors).toContain('Password must contain at least one special character');
      });
    });

    describe('Secure Token Generation', () => {
      it('should generate tokens of specified length', () => {
        const token = generateSecureToken(32);
        expect(token).toHaveLength(32);
      });

      it('should generate different tokens on each call', () => {
        const token1 = generateSecureToken(16);
        const token2 = generateSecureToken(16);
        expect(token1).not.toBe(token2);
      });

      it('should generate tokens with valid characters', () => {
        const token = generateSecureToken(20);
        expect(token).toMatch(/^[A-Za-z0-9]+$/);
      });
    });
  });
}); 