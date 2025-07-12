/**
 * Todo E2E Tests
 * 
 * Tests for todo management functionality including:
 * - CRUD operations
 * - Status management
 * - Priority handling
 * - Search and filtering
 */

describe('Todo Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Login before each test
    cy.get('[data-testid="email-input"]').type('admin@company.com');
    cy.get('[data-testid="password-input"]').type('password');
    cy.get('[data-testid="login-button"]').click();
    
    // Navigate to todos page
    cy.get('[data-testid="todos-nav"]').click();
  });

  describe('Todo List', () => {
    it('should display todo list', () => {
      cy.get('[data-testid="todo-list"]').should('be.visible');
      cy.get('[data-testid="add-todo-button"]').should('be.visible');
    });

    it('should show empty state when no todos', () => {
      cy.get('[data-testid="empty-todos"]').should('be.visible');
      cy.get('[data-testid="empty-todos"]').should('contain', 'No todos found');
    });
  });

  describe('Create Todo', () => {
    it('should create a new todo', () => {
      cy.get('[data-testid="add-todo-button"]').click();
      
      cy.get('[data-testid="todo-title-input"]').type('Test Todo');
      cy.get('[data-testid="todo-description-input"]').type('Test Description');
      cy.get('[data-testid="todo-priority-select"]').select('high');
      cy.get('[data-testid="save-todo-button"]').click();
      
      cy.get('[data-testid="todo-list"]').should('contain', 'Test Todo');
      cy.get('[data-testid="todo-list"]').should('contain', 'Test Description');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="add-todo-button"]').click();
      cy.get('[data-testid="save-todo-button"]').click();
      
      cy.get('[data-testid="title-error"]').should('be.visible');
      cy.get('[data-testid="description-error"]').should('be.visible');
    });

    it('should close modal on cancel', () => {
      cy.get('[data-testid="add-todo-button"]').click();
      cy.get('[data-testid="cancel-button"]').click();
      
      cy.get('[data-testid="todo-modal"]').should('not.exist');
    });
  });

  describe('Update Todo', () => {
    beforeEach(() => {
      // Create a todo first
      cy.get('[data-testid="add-todo-button"]').click();
      cy.get('[data-testid="todo-title-input"]').type('Update Test Todo');
      cy.get('[data-testid="todo-description-input"]').type('Original Description');
      cy.get('[data-testid="save-todo-button"]').click();
    });

    it('should update todo title and description', () => {
      cy.get('[data-testid="edit-todo-button"]').first().click();
      
      cy.get('[data-testid="todo-title-input"]').clear().type('Updated Todo Title');
      cy.get('[data-testid="todo-description-input"]').clear().type('Updated Description');
      cy.get('[data-testid="save-todo-button"]').click();
      
      cy.get('[data-testid="todo-list"]').should('contain', 'Updated Todo Title');
      cy.get('[data-testid="todo-list"]').should('contain', 'Updated Description');
    });

    it('should update todo priority', () => {
      cy.get('[data-testid="edit-todo-button"]').first().click();
      cy.get('[data-testid="todo-priority-select"]').select('low');
      cy.get('[data-testid="save-todo-button"]').click();
      
      cy.get('[data-testid="todo-priority"]').should('contain', 'low');
    });
  });

  describe('Delete Todo', () => {
    beforeEach(() => {
      // Create a todo first
      cy.get('[data-testid="add-todo-button"]').click();
      cy.get('[data-testid="todo-title-input"]').type('Delete Test Todo');
      cy.get('[data-testid="todo-description-input"]').type('Will be deleted');
      cy.get('[data-testid="save-todo-button"]').click();
    });

    it('should delete todo with confirmation', () => {
      cy.get('[data-testid="delete-todo-button"]').first().click();
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      cy.get('[data-testid="todo-list"]').should('not.contain', 'Delete Test Todo');
    });

    it('should cancel deletion', () => {
      cy.get('[data-testid="delete-todo-button"]').first().click();
      cy.get('[data-testid="cancel-delete-button"]').click();
      
      cy.get('[data-testid="todo-list"]').should('contain', 'Delete Test Todo');
    });
  });

  describe('Todo Status', () => {
    beforeEach(() => {
      // Create a todo first
      cy.get('[data-testid="add-todo-button"]').click();
      cy.get('[data-testid="todo-title-input"]').type('Status Test Todo');
      cy.get('[data-testid="todo-description-input"]').type('Test status changes');
      cy.get('[data-testid="save-todo-button"]').click();
    });

    it('should mark todo as complete', () => {
      cy.get('[data-testid="complete-todo-button"]').first().click();
      cy.get('[data-testid="todo-status"]').should('contain', 'completed');
    });

    it('should mark todo as incomplete', () => {
      // First complete it
      cy.get('[data-testid="complete-todo-button"]').first().click();
      
      // Then mark as incomplete
      cy.get('[data-testid="incomplete-todo-button"]').first().click();
      cy.get('[data-testid="todo-status"]').should('contain', 'pending');
    });
  });

  describe('Search and Filter', () => {
    beforeEach(() => {
      // Create multiple todos
      cy.get('[data-testid="add-todo-button"]').click();
      cy.get('[data-testid="todo-title-input"]').type('High Priority Todo');
      cy.get('[data-testid="todo-description-input"]').type('Important task');
      cy.get('[data-testid="todo-priority-select"]').select('high');
      cy.get('[data-testid="save-todo-button"]').click();
      
      cy.get('[data-testid="add-todo-button"]').click();
      cy.get('[data-testid="todo-title-input"]').type('Low Priority Todo');
      cy.get('[data-testid="todo-description-input"]').type('Less important task');
      cy.get('[data-testid="todo-priority-select"]').select('low');
      cy.get('[data-testid="save-todo-button"]').click();
    });

    it('should search todos by title', () => {
      cy.get('[data-testid="search-input"]').type('High Priority');
      cy.get('[data-testid="todo-list"]').should('contain', 'High Priority Todo');
      cy.get('[data-testid="todo-list"]').should('not.contain', 'Low Priority Todo');
    });

    it('should filter by priority', () => {
      cy.get('[data-testid="priority-filter"]').select('high');
      cy.get('[data-testid="todo-list"]').should('contain', 'High Priority Todo');
      cy.get('[data-testid="todo-list"]').should('not.contain', 'Low Priority Todo');
    });

    it('should filter by status', () => {
      cy.get('[data-testid="status-filter"]').select('pending');
      cy.get('[data-testid="todo-list"]').should('contain', 'High Priority Todo');
      cy.get('[data-testid="todo-list"]').should('contain', 'Low Priority Todo');
    });

    it('should clear filters', () => {
      cy.get('[data-testid="priority-filter"]').select('high');
      cy.get('[data-testid="clear-filters-button"]').click();
      
      cy.get('[data-testid="todo-list"]').should('contain', 'High Priority Todo');
      cy.get('[data-testid="todo-list"]').should('contain', 'Low Priority Todo');
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      // Create multiple todos
      for (let i = 1; i <= 3; i++) {
        cy.get('[data-testid="add-todo-button"]').click();
        cy.get('[data-testid="todo-title-input"]').type(`Bulk Todo ${i}`);
        cy.get('[data-testid="todo-description-input"]').type(`Description ${i}`);
        cy.get('[data-testid="save-todo-button"]').click();
      }
    });

    it('should select multiple todos', () => {
      cy.get('[data-testid="todo-checkbox"]').first().check();
      cy.get('[data-testid="todo-checkbox"]').eq(1).check();
      
      cy.get('[data-testid="bulk-actions"]').should('be.visible');
    });

    it('should complete multiple todos', () => {
      cy.get('[data-testid="todo-checkbox"]').first().check();
      cy.get('[data-testid="todo-checkbox"]').eq(1).check();
      cy.get('[data-testid="bulk-complete-button"]').click();
      
      cy.get('[data-testid="todo-status"]').first().should('contain', 'completed');
      cy.get('[data-testid="todo-status"]').eq(1).should('contain', 'completed');
    });

    it('should delete multiple todos', () => {
      cy.get('[data-testid="todo-checkbox"]').first().check();
      cy.get('[data-testid="todo-checkbox"]').eq(1).check();
      cy.get('[data-testid="bulk-delete-button"]').click();
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      cy.get('[data-testid="todo-list"]').should('not.contain', 'Bulk Todo 1');
      cy.get('[data-testid="todo-list"]').should('not.contain', 'Bulk Todo 2');
      cy.get('[data-testid="todo-list"]').should('contain', 'Bulk Todo 3');
    });
  });
}); 