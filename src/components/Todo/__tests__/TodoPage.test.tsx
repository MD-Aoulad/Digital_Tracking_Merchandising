import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import TodoPage from '../TodoPage';

// Mock the API functions
jest.mock('../../../services/api', () => ({
  apiRequest: jest.fn(),
}));

const mockApiRequest = require('../../../services/api').apiRequest;

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const mockToast = require('react-hot-toast');

describe('TodoPage Component', () => {
  const mockUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const,
  };

  const mockUsers = [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    { id: '2', name: 'Employee User', email: 'employee@example.com', role: 'employee' },
  ];

  const mockTodos = [
    {
      id: '1',
      title: 'Test Todo 1',
      description: 'Test description 1',
      priority: 'high',
      completed: false,
      createdAt: '2025-01-01T00:00:00Z',
      userId: '1',
      assignedTo: '2',
      assignedBy: '1',
      assignedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Todo 2',
      description: 'Test description 2',
      priority: 'medium',
      completed: true,
      createdAt: '2025-01-01T00:00:00Z',
      completedAt: '2025-01-01T01:00:00Z',
      userId: '1',
      assignedTo: '1',
      assignedBy: '1',
      assignedAt: '2025-01-01T00:00:00Z',
    },
  ];

  const renderTodoPage = (userRole: 'admin' | 'employee' = 'admin') => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <TodoPage userRole={userRole} />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify(mockUser)),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  describe('Admin User Tests', () => {
    beforeEach(() => {
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ users: mockUsers }); // getUsers
    });

    test('renders todo management page for admin', async () => {
      renderTodoPage('admin');

      await waitFor(() => {
        expect(screen.getByText('Todo Management')).toBeInTheDocument();
        expect(screen.getByText('Manage your tasks and track progress')).toBeInTheDocument();
      });
    });

    test('shows assignment dropdown for admin users', async () => {
      renderTodoPage('admin');

      // Click New Todo button
      await waitFor(() => {
        fireEvent.click(screen.getByText('New Todo'));
      });

      // Check if assignment dropdown is present
      await waitFor(() => {
        expect(screen.getByLabelText('Assign To')).toBeInTheDocument();
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('Employee User')).toBeInTheDocument();
      });
    });

    test('creates todo with assignment', async () => {
      const newTodo = {
        id: '3',
        title: 'New Assigned Todo',
        description: 'Test assigned todo',
        priority: 'medium',
        completed: false,
        createdAt: '2025-01-01T00:00:00Z',
        userId: '1',
        assignedTo: '2',
        assignedBy: '1',
        assignedAt: '2025-01-01T00:00:00Z',
      };

      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ users: mockUsers }) // getUsers
        .mockResolvedValueOnce({ message: 'Todo created successfully', todo: newTodo }); // createTodo

      renderTodoPage('admin');

      // Click New Todo button
      await waitFor(() => {
        fireEvent.click(screen.getByText('New Todo'));
      });

      // Fill form
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Title'), {
          target: { value: 'New Assigned Todo' },
        });
        fireEvent.change(screen.getByLabelText('Description'), {
          target: { value: 'Test assigned todo' },
        });
        fireEvent.change(screen.getByLabelText('Assign To'), {
          target: { value: '2' },
        });
      });

      // Submit form
      fireEvent.click(screen.getByText('Create Todo'));

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/todos', {
          method: 'POST',
          body: JSON.stringify({
            title: 'New Assigned Todo',
            description: 'Test assigned todo',
            priority: 'medium',
            assignedTo: '2',
          }),
        });
        expect(mockToast.success).toHaveBeenCalledWith('Todo created successfully!');
      });
    });

    test('displays assigned todos with assignment badge', async () => {
      renderTodoPage('admin');

      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
        expect(screen.getByText('Assigned')).toBeInTheDocument();
      });
    });

    test('toggles todo completion status', async () => {
      const updatedTodo = { ...mockTodos[0], completed: true };
      
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ users: mockUsers }) // getUsers
        .mockResolvedValueOnce({ message: 'Todo updated successfully', todo: updatedTodo }); // updateTodo

      renderTodoPage('admin');

      await waitFor(() => {
        const toggleButton = screen.getAllByRole('button').find(button => 
          button.textContent?.includes('Mark Complete') || button.textContent?.includes('Mark Incomplete')
        );
        if (toggleButton) {
          fireEvent.click(toggleButton);
        }
      });

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/todos/1', {
          method: 'PUT',
          body: JSON.stringify({ completed: true }),
        });
        expect(mockToast.success).toHaveBeenCalledWith('Todo completed!');
      });
    });

    test('deletes todo', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ users: mockUsers }) // getUsers
        .mockResolvedValueOnce({ message: 'Todo deleted successfully' }); // deleteTodo

      renderTodoPage('admin');

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button').filter(button => 
          button.textContent?.includes('Delete')
        );
        if (deleteButtons.length > 0) {
          fireEvent.click(deleteButtons[0]);
        }
      });

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
        expect(mockApiRequest).toHaveBeenCalledWith('/todos/1', {
          method: 'DELETE',
        });
        expect(mockToast.success).toHaveBeenCalledWith('Todo deleted successfully!');
      });
    });
  });

  describe('Employee User Tests', () => {
    const employeeUser = { ...mockUser, role: 'employee' as const };

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => JSON.stringify(employeeUser)),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      mockApiRequest.mockResolvedValueOnce({ todos: mockTodos }); // getTodos
    });

    test('renders todo management page for employee', async () => {
      renderTodoPage('employee');

      await waitFor(() => {
        expect(screen.getByText('Todo Management')).toBeInTheDocument();
        expect(screen.getByText('Manage your tasks and track progress')).toBeInTheDocument();
      });
    });

    test('does not show assignment dropdown for employee users', async () => {
      renderTodoPage('employee');

      // Click New Todo button
      await waitFor(() => {
        fireEvent.click(screen.getByText('New Todo'));
      });

      // Check that assignment dropdown is not present
      await waitFor(() => {
        expect(screen.queryByLabelText('Assign To')).not.toBeInTheDocument();
      });
    });

    test('creates todo without assignment (self-assigned)', async () => {
      const newTodo = {
        id: '3',
        title: 'New Employee Todo',
        description: 'Test employee todo',
        priority: 'medium',
        completed: false,
        createdAt: '2025-01-01T00:00:00Z',
        userId: '1',
        assignedTo: '1',
        assignedBy: '1',
        assignedAt: '2025-01-01T00:00:00Z',
      };

      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ message: 'Todo created successfully', todo: newTodo }); // createTodo

      renderTodoPage('employee');

      // Click New Todo button
      await waitFor(() => {
        fireEvent.click(screen.getByText('New Todo'));
      });

      // Fill form
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Title'), {
          target: { value: 'New Employee Todo' },
        });
        fireEvent.change(screen.getByLabelText('Description'), {
          target: { value: 'Test employee todo' },
        });
      });

      // Submit form
      fireEvent.click(screen.getByText('Create Todo'));

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/todos', {
          method: 'POST',
          body: JSON.stringify({
            title: 'New Employee Todo',
            description: 'Test employee todo',
            priority: 'medium',
            assignedTo: '',
          }),
        });
        expect(mockToast.success).toHaveBeenCalledWith('Todo created successfully!');
      });
    });

    test('displays assigned todos without assignment badge for self-assigned', async () => {
      renderTodoPage('employee');

      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
        // Should not show "Assigned" badge for self-assigned todos
        const assignedBadges = screen.queryAllByText('Assigned');
        expect(assignedBadges.length).toBeLessThan(mockTodos.length);
      });
    });
  });

  describe('Error Handling Tests', () => {
    test('handles todo loading error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed to load todos'));

      renderTodoPage('admin');

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to load todos');
      });
    });

    test('handles user loading error for admin', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockRejectedValueOnce(new Error('Failed to load users')); // getUsers

      renderTodoPage('admin');

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to load users for assignment');
      });
    });

    test('handles todo creation error', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ users: mockUsers }) // getUsers
        .mockRejectedValueOnce(new Error('Failed to create todo')); // createTodo

      renderTodoPage('admin');

      // Click New Todo button
      await waitFor(() => {
        fireEvent.click(screen.getByText('New Todo'));
      });

      // Fill and submit form
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Title'), {
          target: { value: 'Test Todo' },
        });
        fireEvent.click(screen.getByText('Create Todo'));
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to create todo');
      });
    });

    test('validates required fields', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ users: mockUsers }); // getUsers

      renderTodoPage('admin');

      // Click New Todo button
      await waitFor(() => {
        fireEvent.click(screen.getByText('New Todo'));
      });

      // Try to submit without title
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Todo'));
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Title is required');
        expect(mockApiRequest).not.toHaveBeenCalledWith('/todos', expect.any(Object));
      });
    });
  });

  describe('UI Interaction Tests', () => {
    beforeEach(() => {
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ users: mockUsers }); // getUsers
    });

    test('switches between tabs', async () => {
      renderTodoPage('admin');

      await waitFor(() => {
        expect(screen.getByText('Tasks')).toBeInTheDocument();
        expect(screen.getByText('Templates')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      // Click Templates tab
      fireEvent.click(screen.getByText('Templates'));
      await waitFor(() => {
        expect(screen.getByText('Daily Opening Checklist')).toBeInTheDocument();
      });

      // Click Settings tab (admin only)
      fireEvent.click(screen.getByText('Settings'));
      await waitFor(() => {
        expect(screen.getByText('Todo Settings')).toBeInTheDocument();
      });
    });

    test('filters todos by priority', async () => {
      renderTodoPage('admin');

      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
      });

      // Check priority badges
      const highPriorityBadge = screen.getByText('high');
      const mediumPriorityBadge = screen.getByText('medium');
      
      expect(highPriorityBadge).toHaveClass('bg-red-100', 'text-red-800');
      expect(mediumPriorityBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    test('shows todo details correctly', async () => {
      renderTodoPage('admin');

      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
        expect(screen.getByText('Test description 1')).toBeInTheDocument();
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
        expect(screen.getByText('Test description 2')).toBeInTheDocument();
      });
    });
  });
}); 