/**
 * Authentication E2E Tests
 * 
 * Tests for authentication flows including:
 * - Login/logout functionality
 * - Form validation
 * - Error handling
 * - Session management
 */

describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Login Flow', () => {
    it('should display login form', () => {
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="password-input"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('should login with valid credentials', () => {
      cy.get('[data-testid="email-input"]').type('admin@company.com');
      cy.get('[data-testid="password-input"]').type('password');
      cy.get('[data-testid="login-button"]').click();

      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="dashboard"]').should('be.visible');
      
      // Should show user info
      cy.get('[data-testid="user-info"]').should('contain', 'admin@example.com');
    });

    it('should show error with invalid credentials', () => {
      cy.get('[data-testid="email-input"]').type('invalid@example.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();

      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="password-error"]').should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();

      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="email-error"]').should('contain', 'Invalid email format');
    });
  });

  describe('Logout Flow', () => {
    beforeEach(() => {
      // Login first
      cy.login('admin@example.com', 'password');
    });

    it('should logout successfully', () => {
      cy.get('[data-testid="logout-button"]').click();
      
      // Should redirect to login page
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
      
      // Should clear user data
      cy.get('[data-testid="user-info"]').should('not.exist');
    });

    it('should prevent access to protected routes after logout', () => {
      cy.get('[data-testid="logout-button"]').click();
      
      // Try to access dashboard
      cy.visit('/dashboard');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'password');
    });

    it('should maintain session on page refresh', () => {
      cy.reload();
      
      // Should still be logged in
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="dashboard"]').should('be.visible');
    });

    it('should redirect to dashboard if already logged in', () => {
      cy.visit('/login');
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without auth', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
      
      cy.visit('/todos');
      cy.url().should('include', '/login');
      
      cy.visit('/reports');
      cy.url().should('include', '/login');
    });
  });
}); 