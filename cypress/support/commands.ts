/**
 * Cypress Custom Commands
 * 
 * This file contains custom commands for common testing operations.
 */

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Custom command to create a todo
Cypress.Commands.add('createTodo', (title: string, description: string) => {
  cy.get('[data-testid="add-todo-button"]').click();
  cy.get('[data-testid="todo-title-input"]').type(title);
  cy.get('[data-testid="todo-description-input"]').type(description);
  cy.get('[data-testid="save-todo-button"]').click();
  cy.get('[data-testid="todo-list"]').should('contain', title);
});

// Custom command to clear all data
Cypress.Commands.add('clearAllData', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
}); 