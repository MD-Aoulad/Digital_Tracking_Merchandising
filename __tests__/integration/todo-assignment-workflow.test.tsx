import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import TodoPage from '../../src/components/Todo/TodoPage';

// Mock the API functions
jest.mock('../../src/services/api', () => ({
  apiRequest: jest.fn(),
}));

const mockApiRequest = require('../../src/services/api').apiRequest;

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const mockToast = require('react-hot-toast');

describe('Todo Assignment Workflow Integration Tests', () => {
  const mockAdminUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const,
  };

  const mockEmployeeUser = {
    id: '2',
    name: 'Employee User',
    email: 'employee@example.com',
    role: 'employee' as const,
  };

  const mockUsers = [
    mockAdminUser,
    mockEmployeeUser,
  ];

  const mockTodos = [
    {
      id: '1',
      title: 'Existing Admin Todo',
      description: 'Admin created todo',
      priority: 'high',
      completed: false,
      createdAt: '2025-01-01T00:00:00Z',
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
        getItem: jest.fn(() => JSON.stringify(mockAdminUser)),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  describe('Complete Todo Assignment Workflow', () => {
    test('admin creates todo and assigns to employee, employee completes it', async () => {
      // Step 1: Admin loads page and sees existing todos
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ users: mockUsers }); // getUsers

      renderTodoPage('admin');

      await waitFor(() => {
        expect(screen.getByText('Todo Management')).toBeInTheDocument();
        expect(screen.getByText('Existing Admin Todo')).toBeInTheDocument();
      });

      // Step 2: Admin creates new todo and assigns to employee
      const newTodo = {
        id: '2',
        title: 'Employee Task Assignment',
        description: 'This task is assigned to the employee',
        priority: 'medium',
        completed: false,
        createdAt: '2025-01-01T00:00:00Z',
        userId: '1',
        assignedTo: '2',
        assignedBy: '1',
        assignedAt: '2025-01-01T00:00:00Z',
      };

      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos (reload)
        .mockResolvedValueOnce({ users: mockUsers }) // getUsers (reload)
        .mockResolvedValueOnce({ message: 'Todo created successfully', todo: newTodo }); // createTodo

      // Click New Todo button
      fireEvent.click(screen.getByText('New Todo'));

      // Fill form
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Title'), {
          target: { value: 'Employee Task Assignment' },
        });
        fireEvent.change(screen.getByLabelText('Description'), {
          target: { value: 'This task is assigned to the employee' },
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
            title: 'Employee Task Assignment',
            description: 'This task is assigned to the employee',
            priority: 'medium',
            assignedTo: '2',
          }),
        });
        expect(mockToast.success).toHaveBeenCalledWith('Todo created successfully!');
      });

      // Step 3: Switch to employee view
      // Update localStorage to employee user
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => JSON.stringify(mockEmployeeUser)),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      // Mock employee's todo list (should only see assigned todos)
      const employeeTodos = [newTodo];
      mockApiRequest.mockResolvedValueOnce({ todos: employeeTodos }); // getTodos for employee

      // Re-render as employee
      renderTodoPage('employee');

      await waitFor(() => {
        expect(screen.getByText('Employee Task Assignment')).toBeInTheDocument();
        expect(screen.queryByText('Existing Admin Todo')).not.toBeInTheDocument(); // Should not see admin's todo
      });

      // Step 4: Employee completes the assigned todo
      const completedTodo = { ...newTodo, completed: true, completedAt: '2025-01-01T01:00:00Z' };
      mockApiRequest.mockResolvedValueOnce({ message: 'Todo updated successfully', todo: completedTodo }); // updateTodo

      // Find and click the complete button
      const completeButton = screen.getByText('Mark Complete');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/todos/2', {
          method: 'PUT',
          body: JSON.stringify({ completed: true }),
        });
        expect(mockToast.success).toHaveBeenCalledWith('Todo completed!');
      });

      // Step 5: Verify completion status
      await waitFor(() => {
        expect(screen.getByText('Status: Completed')).toBeInTheDocument();
        expect(screen.getByText('Completed: 1/1/2025')).toBeInTheDocument();
      });
    });

    test('admin can assign multiple todos to different employees', async () => {
      // Setup initial state
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ users: mockUsers }); // getUsers

      renderTodoPage('admin');

      await waitFor(() => {
        expect(screen.getByText('Todo Management')).toBeInTheDocument();
      });

      // Create first todo assigned to employee
      const todo1 = {
        id: '2',
        title: 'First Employee Task',
        description: 'First task for employee',
        priority: 'high',
        completed: false,
        createdAt: '2025-01-01T00:00:00Z',
        userId: '1',
        assignedTo: '2',
        assignedBy: '1',
        assignedAt: '2025-01-01T00:00:00Z',
      };

      mockApiRequest
        .mockResolvedValueOnce({ todos: [...mockTodos, todo1] }) // getTodos (reload)
        .mockResolvedValueOnce({ users: mockUsers }) // getUsers (reload)
        .mockResolvedValueOnce({ message: 'Todo created successfully', todo: todo1 }); // createTodo

      // Create first todo
      fireEvent.click(screen.getByText('New Todo'));
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Title'), {
          target: { value: 'First Employee Task' },
        });
        fireEvent.change(screen.getByLabelText('Description'), {
          target: { value: 'First task for employee' },
        });
        fireEvent.change(screen.getByLabelText('Assign To'), {
          target: { value: '2' },
        });
        fireEvent.click(screen.getByText('Create Todo'));
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Todo created successfully!');
      });

      // Create second todo assigned to admin (self-assigned)
      const todo2 = {
        id: '3',
        title: 'Admin Self Task',
        description: 'Task for admin',
        priority: 'medium',
        completed: false,
        createdAt: '2025-01-01T00:00:00Z',
        userId: '1',
        assignedTo: '1',
        assignedBy: '1',
        assignedAt: '2025-01-01T00:00:00Z',
      };

      mockApiRequest
        .mockResolvedValueOnce({ todos: [...mockTodos, todo1, todo2] }) // getTodos (reload)
        .mockResolvedValueOnce({ users: mockUsers }) // getUsers (reload)
        .mockResolvedValueOnce({ message: 'Todo created successfully', todo: todo2 }); // createTodo

      // Create second todo
      fireEvent.click(screen.getByText('New Todo'));
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Title'), {
          target: { value: 'Admin Self Task' },
        });
        fireEvent.change(screen.getByLabelText('Description'), {
          target: { value: 'Task for admin' },
        });
        fireEvent.change(screen.getByLabelText('Assign To'), {
          target: { value: '1' },
        });
        fireEvent.click(screen.getByText('Create Todo'));
      });

      await waitFor(() => {
        expect(screen.getByText('First Employee Task')).toBeInTheDocument();
        expect(screen.getByText('Admin Self Task')).toBeInTheDocument();
      });

      // Verify assignment badges
      const assignedBadges = screen.getAllByText('Assigned');
      expect(assignedBadges.length).toBe(1); // Only the employee-assigned todo should show badge
    });

    test('employee cannot see or modify todos not assigned to them', async () => {
      // Setup admin todos (including one assigned to employee)
      const adminTodos = [
        {
          id: '1',
          title: 'Admin Only Todo',
          description: 'This todo belongs only to admin',
          priority: 'high',
          completed: false,
          createdAt: '2025-01-01T00:00:00Z',
          userId: '1',
          assignedTo: '1',
          assignedBy: '1',
          assignedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Employee Assigned Todo',
          description: 'This todo is assigned to employee',
          priority: 'medium',
          completed: false,
          createdAt: '2025-01-01T00:00:00Z',
          userId: '1',
          assignedTo: '2',
          assignedBy: '1',
          assignedAt: '2025-01-01T00:00:00Z',
        },
      ];

      // Mock employee's view (should only see assigned todos)
      const employeeTodos = [adminTodos[1]]; // Only the assigned todo
      mockApiRequest.mockResolvedValueOnce({ todos: employeeTodos });

      // Switch to employee view
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => JSON.stringify(mockEmployeeUser)),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      renderTodoPage('employee');

      await waitFor(() => {
        expect(screen.getByText('Employee Assigned Todo')).toBeInTheDocument();
        expect(screen.queryByText('Admin Only Todo')).not.toBeInTheDocument(); // Should not see admin's todo
      });

      // Employee should not have assignment dropdown
      fireEvent.click(screen.getByText('New Todo'));
      await waitFor(() => {
        expect(screen.queryByLabelText('Assign To')).not.toBeInTheDocument();
      });
    });

    test('assignment tracking maintains audit trail', async () => {
      // Admin creates todo with assignment
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ users: mockUsers }); // getUsers

      renderTodoPage('admin');

      const assignedTodo = {
        id: '2',
        title: 'Audit Trail Test',
        description: 'Testing assignment audit trail',
        priority: 'high',
        completed: false,
        createdAt: '2025-01-01T00:00:00Z',
        userId: '1',
        assignedTo: '2',
        assignedBy: '1',
        assignedAt: '2025-01-01T00:00:00Z',
      };

      mockApiRequest
        .mockResolvedValueOnce({ todos: [...mockTodos, assignedTodo] }) // getTodos (reload)
        .mockResolvedValueOnce({ users: mockUsers }) // getUsers (reload)
        .mockResolvedValueOnce({ message: 'Todo created successfully', todo: assignedTodo }); // createTodo

      // Create assigned todo
      fireEvent.click(screen.getByText('New Todo'));
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Title'), {
          target: { value: 'Audit Trail Test' },
        });
        fireEvent.change(screen.getByLabelText('Description'), {
          target: { value: 'Testing assignment audit trail' },
        });
        fireEvent.change(screen.getByLabelText('Assign To'), {
          target: { value: '2' },
        });
        fireEvent.click(screen.getByText('Create Todo'));
      });

      // Verify assignment metadata was sent
      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/todos', {
          method: 'POST',
          body: JSON.stringify({
            title: 'Audit Trail Test',
            description: 'Testing assignment audit trail',
            priority: 'medium',
            assignedTo: '2',
          }),
        });
      });

      // Employee completes the todo
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => JSON.stringify(mockEmployeeUser)),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      const completedTodo = { ...assignedTodo, completed: true, completedAt: '2025-01-01T01:00:00Z' };
      mockApiRequest
        .mockResolvedValueOnce({ todos: [assignedTodo] }) // getTodos for employee
        .mockResolvedValueOnce({ message: 'Todo updated successfully', todo: completedTodo }); // updateTodo

      renderTodoPage('employee');

      await waitFor(() => {
        expect(screen.getByText('Audit Trail Test')).toBeInTheDocument();
      });

      // Complete the todo
      const completeButton = screen.getByText('Mark Complete');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/todos/2', {
          method: 'PUT',
          body: JSON.stringify({ completed: true }),
        });
      });

      // Verify completion timestamp
      await waitFor(() => {
        expect(screen.getByText('Completed: 1/1/2025')).toBeInTheDocument();
      });
    });
  });

  describe('Error Scenarios in Workflow', () => {
    test('handles network errors during assignment creation', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockResolvedValueOnce({ users: mockUsers }) // getUsers
        .mockRejectedValueOnce(new Error('Network error')); // createTodo fails

      renderTodoPage('admin');

      await waitFor(() => {
        expect(screen.getByText('Todo Management')).toBeInTheDocument();
      });

      // Try to create assigned todo
      fireEvent.click(screen.getByText('New Todo'));
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Title'), {
          target: { value: 'Network Error Test' },
        });
        fireEvent.change(screen.getByLabelText('Assign To'), {
          target: { value: '2' },
        });
        fireEvent.click(screen.getByText('Create Todo'));
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to create todo');
      });
    });

    test('handles user loading failure for admin', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // getTodos
        .mockRejectedValueOnce(new Error('Failed to load users')); // getUsers fails

      renderTodoPage('admin');

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to load users for assignment');
      });

      // Assignment dropdown should not be available
      fireEvent.click(screen.getByText('New Todo'));
      await waitFor(() => {
        expect(screen.queryByLabelText('Assign To')).not.toBeInTheDocument();
      });
    });

    test('handles todo completion failure for employee', async () => {
      // Setup employee with assigned todo
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => JSON.stringify(mockEmployeeUser)),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      const assignedTodo = {
        id: '1',
        title: 'Completion Error Test',
        description: 'Testing completion error handling',
        priority: 'medium',
        completed: false,
        createdAt: '2025-01-01T00:00:00Z',
        userId: '1',
        assignedTo: '2',
        assignedBy: '1',
        assignedAt: '2025-01-01T00:00:00Z',
      };

      mockApiRequest
        .mockResolvedValueOnce({ todos: [assignedTodo] }) // getTodos
        .mockRejectedValueOnce(new Error('Update failed')); // updateTodo fails

      renderTodoPage('employee');

      await waitFor(() => {
        expect(screen.getByText('Completion Error Test')).toBeInTheDocument();
      });

      // Try to complete todo
      const completeButton = screen.getByText('Mark Complete');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to update todo');
      });
    });
  });
}); 