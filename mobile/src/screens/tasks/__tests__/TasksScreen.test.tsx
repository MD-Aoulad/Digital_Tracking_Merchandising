import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../../../contexts/AuthContext';
import TasksScreen from '../TasksScreen';

// Mock the API functions
jest.mock('../../../services/api/client', () => ({
  apiRequest: jest.fn(),
}));

const mockApiRequest = require('../../../services/api/client').apiRequest;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('TasksScreen Component', () => {
  const mockUser = {
    id: '2',
    name: 'Employee User',
    email: 'employee@example.com',
    role: 'employee' as const,
  };

  const mockTodos = [
    {
      id: '1',
      title: 'Assigned Todo 1',
      description: 'This todo was assigned by admin',
      priority: 'high',
      completed: false,
      createdAt: '2025-01-01T00:00:00Z',
      assignedTo: '2',
      assignedBy: '1',
      assignedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Assigned Todo 2',
      description: 'Another assigned todo',
      priority: 'medium',
      completed: true,
      createdAt: '2025-01-01T00:00:00Z',
      completedAt: '2025-01-01T01:00:00Z',
      assignedTo: '2',
      assignedBy: '1',
      assignedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: '3',
      title: 'Self-Created Todo',
      description: 'Todo created by employee',
      priority: 'low',
      completed: false,
      createdAt: '2025-01-01T00:00:00Z',
      assignedTo: '2',
      assignedBy: '2',
      assignedAt: '2025-01-01T00:00:00Z',
    },
  ];

  const renderTasksScreen = () => {
    return render(
      <AuthProvider>
        <TasksScreen />
      </AuthProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock AsyncStorage to return user
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));
  });

  describe('Todo Loading and Display', () => {
    test('loads and displays assigned todos', async () => {
      mockApiRequest.mockResolvedValueOnce({ todos: mockTodos });

      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Assigned Todo 1')).toBeTruthy();
        expect(screen.getByText('Assigned Todo 2')).toBeTruthy();
        expect(screen.getByText('Self-Created Todo')).toBeTruthy();
      });
    });

    test('shows loading state while fetching todos', async () => {
      // Delay the API response to test loading state
      mockApiRequest.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({ todos: mockTodos }), 100))
      );

      renderTasksScreen();

      // Should show loading indicator
      expect(screen.getByText('Loading tasks...')).toBeTruthy();

      await waitFor(() => {
        expect(screen.getByText('Assigned Todo 1')).toBeTruthy();
      });
    });

    test('handles empty todo list', async () => {
      mockApiRequest.mockResolvedValueOnce({ todos: [] });

      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('No tasks assigned')).toBeTruthy();
        expect(screen.getByText('You don\'t have any tasks assigned to you yet.')).toBeTruthy();
      });
    });

    test('handles API error gracefully', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed to load todos'));

      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Error loading tasks')).toBeTruthy();
        expect(screen.getByText('Failed to load todos')).toBeTruthy();
      });
    });
  });

  describe('Todo Interaction', () => {
    beforeEach(() => {
      mockApiRequest.mockResolvedValueOnce({ todos: mockTodos });
    });

    test('toggles todo completion status', async () => {
      const updatedTodo = { ...mockTodos[0], completed: true };
      mockApiRequest.mockResolvedValueOnce({ todos: mockTodos }); // Initial load
      mockApiRequest.mockResolvedValueOnce({ message: 'Todo updated successfully', todo: updatedTodo }); // Update

      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Assigned Todo 1')).toBeTruthy();
      });

      // Find and tap the toggle button
      const toggleButton = screen.getByTestId('toggle-todo-1');
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/todos/1', {
          method: 'PUT',
          body: JSON.stringify({ completed: true }),
        });
      });
    });

    test('shows todo details when tapped', async () => {
      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Assigned Todo 1')).toBeTruthy();
      });

      // Tap on a todo to view details
      const todoItem = screen.getByText('Assigned Todo 1');
      fireEvent.press(todoItem);

      // Should show todo details
      await waitFor(() => {
        expect(screen.getByText('This todo was assigned by admin')).toBeTruthy();
        expect(screen.getByText('Priority: High')).toBeTruthy();
        expect(screen.getByText('Status: Pending')).toBeTruthy();
      });
    });

    test('displays priority badges correctly', async () => {
      renderTasksScreen();

      await waitFor(() => {
        // High priority todo
        const highPriorityBadge = screen.getByText('HIGH');
        expect(highPriorityBadge).toBeTruthy();
        expect(highPriorityBadge.props.style).toMatchObject({
          backgroundColor: '#ef4444',
          color: '#ffffff',
        });

        // Medium priority todo
        const mediumPriorityBadge = screen.getByText('MEDIUM');
        expect(mediumPriorityBadge).toBeTruthy();
        expect(mediumPriorityBadge.props.style).toMatchObject({
          backgroundColor: '#f59e0b',
          color: '#ffffff',
        });

        // Low priority todo
        const lowPriorityBadge = screen.getByText('LOW');
        expect(lowPriorityBadge).toBeTruthy();
        expect(lowPriorityBadge.props.style).toMatchObject({
          backgroundColor: '#10b981',
          color: '#ffffff',
        });
      });
    });

    test('shows completion status correctly', async () => {
      renderTasksScreen();

      await waitFor(() => {
        // Pending todo
        expect(screen.getByText('Status: Pending')).toBeTruthy();
        
        // Completed todo
        expect(screen.getByText('Status: Completed')).toBeTruthy();
        expect(screen.getByText('Completed: 1/1/2025')).toBeTruthy();
      });
    });
  });

  describe('Pull to Refresh', () => {
    test('refreshes todo list on pull', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // Initial load
        .mockResolvedValueOnce({ todos: [...mockTodos, { id: '4', title: 'New Todo' }] }); // Refresh

      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Assigned Todo 1')).toBeTruthy();
      });

      // Simulate pull to refresh
      const refreshControl = screen.getByTestId('refresh-control');
      fireEvent(refreshControl, 'refresh');

      await waitFor(() => {
        expect(screen.getByText('New Todo')).toBeTruthy();
      });
    });

    test('handles refresh error', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ todos: mockTodos }) // Initial load
        .mockRejectedValueOnce(new Error('Refresh failed')); // Refresh error

      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Assigned Todo 1')).toBeTruthy();
      });

      // Simulate pull to refresh
      const refreshControl = screen.getByTestId('refresh-control');
      fireEvent(refreshControl, 'refresh');

      await waitFor(() => {
        expect(screen.getByText('Error refreshing tasks')).toBeTruthy();
      });
    });
  });

  describe('Todo Filtering and Sorting', () => {
    test('filters todos by status', async () => {
      mockApiRequest.mockResolvedValueOnce({ todos: mockTodos });

      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Assigned Todo 1')).toBeTruthy();
        expect(screen.getByText('Assigned Todo 2')).toBeTruthy();
      });

      // Tap on "Completed" filter
      const completedFilter = screen.getByText('Completed');
      fireEvent.press(completedFilter);

      await waitFor(() => {
        // Should only show completed todos
        expect(screen.queryByText('Assigned Todo 1')).toBeFalsy(); // Pending
        expect(screen.getByText('Assigned Todo 2')).toBeTruthy(); // Completed
        expect(screen.queryByText('Self-Created Todo')).toBeFalsy(); // Pending
      });

      // Tap on "Pending" filter
      const pendingFilter = screen.getByText('Pending');
      fireEvent.press(pendingFilter);

      await waitFor(() => {
        // Should only show pending todos
        expect(screen.getByText('Assigned Todo 1')).toBeTruthy(); // Pending
        expect(screen.queryByText('Assigned Todo 2')).toBeFalsy(); // Completed
        expect(screen.getByText('Self-Created Todo')).toBeTruthy(); // Pending
      });
    });

    test('sorts todos by priority', async () => {
      mockApiRequest.mockResolvedValueOnce({ todos: mockTodos });

      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Assigned Todo 1')).toBeTruthy();
      });

      // Tap on sort button
      const sortButton = screen.getByTestId('sort-button');
      fireEvent.press(sortButton);

      // Select priority sort
      const prioritySort = screen.getByText('Sort by Priority');
      fireEvent.press(prioritySort);

      // Verify high priority todos appear first
      const todoItems = screen.getAllByTestId(/todo-item/);
      expect(todoItems[0]).toHaveTextContent('Assigned Todo 1'); // High priority
    });
  });

  describe('Error Handling', () => {
    test('shows network error message', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Network error'));

      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeTruthy();
        expect(screen.getByText('Please check your internet connection and try again.')).toBeTruthy();
      });
    });

    test('shows retry button on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed to load todos'));

      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeTruthy();
      });

      // Mock successful retry
      mockApiRequest.mockResolvedValueOnce({ todos: mockTodos });

      // Tap retry button
      const retryButton = screen.getByText('Retry');
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Assigned Todo 1')).toBeTruthy();
      });
    });

    test('handles authentication errors', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Access token required'));

      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Authentication Error')).toBeTruthy();
        expect(screen.getByText('Please log in again to continue.')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    test('provides proper accessibility labels', async () => {
      mockApiRequest.mockResolvedValueOnce({ todos: mockTodos });

      renderTasksScreen();

      await waitFor(() => {
        const todoItem = screen.getByTestId('todo-item-1');
        expect(todoItem.props.accessibilityLabel).toBe('Assigned Todo 1, High priority, Pending');
      });
    });

    test('supports screen reader navigation', async () => {
      mockApiRequest.mockResolvedValueOnce({ todos: mockTodos });

      renderTasksScreen();

      await waitFor(() => {
        const toggleButton = screen.getByTestId('toggle-todo-1');
        expect(toggleButton.props.accessibilityRole).toBe('button');
        expect(toggleButton.props.accessibilityLabel).toBe('Mark Assigned Todo 1 as complete');
      });
    });
  });

  describe('Performance', () => {
    test('handles large todo lists efficiently', async () => {
      const largeTodoList = Array.from({ length: 100 }, (_, i) => ({
        id: `todo-${i}`,
        title: `Todo ${i}`,
        description: `Description for todo ${i}`,
        priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
        completed: i % 2 === 0,
        createdAt: '2025-01-01T00:00:00Z',
        assignedTo: '2',
        assignedBy: '1',
        assignedAt: '2025-01-01T00:00:00Z',
      }));

      mockApiRequest.mockResolvedValueOnce({ todos: largeTodoList });

      const startTime = Date.now();
      renderTasksScreen();

      await waitFor(() => {
        expect(screen.getByText('Todo 0')).toBeTruthy();
        expect(screen.getByText('Todo 99')).toBeTruthy();
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });
  });
}); 