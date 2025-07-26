/**
 * TodoPage Component Tests
 * Tests the TodoPage component functionality, rendering, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import TodoPage from '../Todo/TodoPage';

// Mock the API service
jest.mock('../../services/api', () => ({
  getTodos: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn()
}));

// Mock the auth context
const mockAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'employee'
  },
  token: 'test-token',
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: true
};

// Mock the API module
const mockApi = require('../../services/api');

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('TodoPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    mockApi.getTodos.mockResolvedValue({
      todos: [
        {
          id: '1',
          title: 'Test Todo 1',
          description: 'Test description 1',
          priority: 'high',
          completed: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          userId: 'test-user-id'
        },
        {
          id: '2',
          title: 'Test Todo 2',
          description: 'Test description 2',
          priority: 'medium',
          completed: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          completedAt: '2024-01-02T00:00:00.000Z',
          userId: 'test-user-id'
        }
      ]
    });
  });

  describe('Rendering', () => {
    test('should render todo page with title', async () => {
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Todo Management')).toBeInTheDocument();
      });
    });

    test('should render add todo form', async () => {
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Add New Todo')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter todo title')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter todo description')).toBeInTheDocument();
        expect(screen.getByText('Add Todo')).toBeInTheDocument();
      });
    });

    test('should render todo list', async () => {
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
        expect(screen.getByText('Test description 1')).toBeInTheDocument();
        expect(screen.getByText('Test description 2')).toBeInTheDocument();
      });
    });

    test('should show loading state initially', () => {
      mockApi.getTodos.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProviders(<TodoPage />);
      
      expect(screen.getByText('Loading todos...')).toBeInTheDocument();
    });

    test('should show empty state when no todos', async () => {
      mockApi.getTodos.mockResolvedValue({ todos: [] });
      
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('No todos found')).toBeInTheDocument();
        expect(screen.getByText('Create your first todo to get started!')).toBeInTheDocument();
      });
    });
  });

  describe('Adding Todos', () => {
    test('should add new todo successfully', async () => {
      mockApi.createTodo.mockResolvedValue({
        message: 'Todo created successfully',
        todo: {
          id: '3',
          title: 'New Todo',
          description: 'New description',
          priority: 'medium',
          completed: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          userId: 'test-user-id'
        }
      });

      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Enter todo title'), {
        target: { value: 'New Todo' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter todo description'), {
        target: { value: 'New description' }
      });
      fireEvent.change(screen.getByDisplayValue('medium'), {
        target: { value: 'high' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Add Todo'));

      await waitFor(() => {
        expect(mockApi.createTodo).toHaveBeenCalledWith({
          title: 'New Todo',
          description: 'New description',
          priority: 'high'
        });
      });

      await waitFor(() => {
        expect(screen.getByText('New Todo')).toBeInTheDocument();
      });
    });

    test('should show error when adding todo fails', async () => {
      mockApi.createTodo.mockRejectedValue(new Error('Failed to create todo'));
      
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      // Fill and submit form
      fireEvent.change(screen.getByPlaceholderText('Enter todo title'), {
        target: { value: 'New Todo' }
      });
      fireEvent.click(screen.getByText('Add Todo'));

      await waitFor(() => {
        expect(screen.getByText('Failed to create todo')).toBeInTheDocument();
      });
    });

    test('should validate required fields', async () => {
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      // Try to submit empty form
      fireEvent.click(screen.getByText('Add Todo'));

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });
  });

  describe('Updating Todos', () => {
    test('should toggle todo completion status', async () => {
      mockApi.updateTodo.mockResolvedValue({
        message: 'Todo updated successfully',
        todo: {
          id: '1',
          title: 'Test Todo 1',
          description: 'Test description 1',
          priority: 'high',
          completed: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          completedAt: '2024-01-02T00:00:00.000Z',
          userId: 'test-user-id'
        }
      });

      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      // Find and click the checkbox
      const checkbox = screen.getByRole('checkbox', { name: /mark test todo 1 as complete/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(mockApi.updateTodo).toHaveBeenCalledWith('1', { completed: true });
      });
    });

    test('should edit todo title and description', async () => {
      mockApi.updateTodo.mockResolvedValue({
        message: 'Todo updated successfully',
        todo: {
          id: '1',
          title: 'Updated Todo',
          description: 'Updated description',
          priority: 'high',
          completed: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          userId: 'test-user-id'
        }
      });

      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit test todo 1/i });
      fireEvent.click(editButton);

      // Update fields
      const titleInput = screen.getByDisplayValue('Test Todo 1');
      const descriptionInput = screen.getByDisplayValue('Test description 1');
      
      fireEvent.change(titleInput, { target: { value: 'Updated Todo' } });
      fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

      // Save changes
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApi.updateTodo).toHaveBeenCalledWith('1', {
          title: 'Updated Todo',
          description: 'Updated description'
        });
      });
    });
  });

  describe('Deleting Todos', () => {
    test('should delete todo successfully', async () => {
      mockApi.deleteTodo.mockResolvedValue({ message: 'Todo deleted successfully' });
      
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete test todo 1/i });
      fireEvent.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByText('Delete');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockApi.deleteTodo).toHaveBeenCalledWith('1');
      });

      await waitFor(() => {
        expect(screen.queryByText('Test Todo 1')).not.toBeInTheDocument();
      });
    });

    test('should cancel deletion when user cancels', async () => {
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete test todo 1/i });
      fireEvent.click(deleteButton);

      // Cancel deletion
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      expect(mockApi.deleteTodo).not.toHaveBeenCalled();
    });
  });

  describe('Filtering and Sorting', () => {
    test('should filter todos by status', async () => {
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
      });

      // Filter by completed
      const completedFilter = screen.getByText('Completed');
      fireEvent.click(completedFilter);

      await waitFor(() => {
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
        expect(screen.queryByText('Test Todo 1')).not.toBeInTheDocument();
      });

      // Filter by pending
      const pendingFilter = screen.getByText('Pending');
      fireEvent.click(pendingFilter);

      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Todo 2')).not.toBeInTheDocument();
      });
    });

    test('should sort todos by priority', async () => {
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
      });

      // Sort by priority
      const sortSelect = screen.getByDisplayValue('Date Created');
      fireEvent.change(sortSelect, { target: { value: 'priority' } });

      // Verify sorting (high priority should come first)
      const todos = screen.getAllByTestId('todo-item');
      expect(todos[0]).toHaveTextContent('Test Todo 1'); // High priority
      expect(todos[1]).toHaveTextContent('Test Todo 2'); // Medium priority
    });
  });

  describe('Error Handling', () => {
    test('should show error when loading todos fails', async () => {
      mockApi.getTodos.mockRejectedValue(new Error('Failed to load todos'));
      
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Error loading todos')).toBeInTheDocument();
        expect(screen.getByText('Failed to load todos')).toBeInTheDocument();
      });
    });

    test('should show error when updating todo fails', async () => {
      mockApi.updateTodo.mockRejectedValue(new Error('Failed to update todo'));
      
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      // Try to toggle completion
      const checkbox = screen.getByRole('checkbox', { name: /mark test todo 1 as complete/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText('Failed to update todo')).toBeInTheDocument();
      });
    });

    test('should show error when deleting todo fails', async () => {
      mockApi.deleteTodo.mockRejectedValue(new Error('Failed to delete todo'));
      
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      // Try to delete
      const deleteButton = screen.getByRole('button', { name: /delete test todo 1/i });
      fireEvent.click(deleteButton);
      
      const confirmButton = screen.getByText('Delete');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to delete todo')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', async () => {
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      // Check for proper labels
      expect(screen.getByLabelText('Todo title')).toBeInTheDocument();
      expect(screen.getByLabelText('Todo description')).toBeInTheDocument();
      expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    });

    test('should be keyboard navigable', async () => {
      renderWithProviders(<TodoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });

      // Tab through interactive elements
      const titleInput = screen.getByPlaceholderText('Enter todo title');
      titleInput.focus();
      expect(titleInput).toHaveFocus();

      // Test tab navigation
      fireEvent.keyDown(titleInput, { key: 'Tab' });
      // Should focus next element
    });
  });
}); 