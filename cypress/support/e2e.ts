/**
 * Cypress E2E Support File
 * 
 * This file contains custom commands and configurations for E2E testing.
 */

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with email and password
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;
      
      /**
       * Custom command to create a todo
       * @example cy.createTodo('Test Todo', 'Test Description')
       */
      createTodo(title: string, description: string): Chainable<void>;
      
      /**
       * Custom command to clear all data
       * @example cy.clearAllData()
       */
      clearAllData(): Chainable<void>;
    }
  }
}

// Prevent TypeScript from reading file as legacy script
export {}; 