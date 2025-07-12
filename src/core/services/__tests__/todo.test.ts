/**
 * Todo Service Unit Tests
 * 
 * Tests for all todo-related functionality including:
 * - CRUD operations
 * - Status management
 * - Priority handling
 * - Filtering and sorting
 */

import { 
  getTodos, 
  createTodo, 
  updateTodo, 
  deleteTodo,
  completeTodo,
  incompleteTodo,
  searchTodos,
  getTodosByPriority,
  getCompletedTodos,
  getIncompleteTodos,
  getTodosDueToday,
  getOverdueTodos,
  bulkUpdateTodos,
  bulkDeleteTodos
} from '../todo';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client';
import { Todo } from '../../types';

// Mock the API client
jest.mock('../../api/client', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

describe('Todo Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    priority: 'medium',
    completed: false,
    createdAt: '2023-01-01T00:00:00Z',
    completedAt: null,
    userId: 'user1',
    dueDate: '2023-12-31T23:59:59Z',
    tags: ['test', 'important'],
    assignedTo: 'user1'
  };

  const mockPaginatedResponse = {
    data: [mockTodo],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1
  };

  describe('CRUD Operations', () => {
    describe('Get Todos', () => {
      it('should fetch todos successfully', async () => {
        (apiGet as jest.Mock).mockResolvedValue(mockPaginatedResponse);

        const result = await getTodos();

        expect(apiGet).toHaveBeenCalledWith('/todos?page=1&limit=10');
        expect(result).toEqual(mockPaginatedResponse);
      });

      it('should fetch todos with filters', async () => {
        const filters = { priority: 'high' as const, completed: false };
        (apiGet as jest.Mock).mockResolvedValue(mockPaginatedResponse);

        const result = await getTodos(1, 10, undefined, filters);

        expect(apiGet).toHaveBeenCalledWith('/todos?page=1&limit=10&priority=high&completed=false');
        expect(result).toEqual(mockPaginatedResponse);
      });

      it('should handle API errors gracefully', async () => {
        const error = new Error('Failed to fetch todos');
        (apiGet as jest.Mock).mockRejectedValue(error);

        await expect(getTodos()).rejects.toThrow('Failed to fetch todos');
      });
    });

    describe('Create Todo', () => {
      it('should create todo successfully', async () => {
        const newTodo = {
          title: 'New Todo',
          description: 'New Description',
          priority: 'high' as const,
          dueDate: '2023-12-31T23:59:59Z'
        };
        (apiPost as jest.Mock).mockResolvedValue(mockTodo);

        const result = await createTodo(newTodo);

        expect(apiPost).toHaveBeenCalledWith('/todos', newTodo);
        expect(result).toEqual(mockTodo);
      });
    });

    describe('Update Todo', () => {
      it('should update todo successfully', async () => {
        const updates = { title: 'Updated Todo', priority: 'high' as const };
        const updatedTodo = { ...mockTodo, ...updates };
        (apiPut as jest.Mock).mockResolvedValue(updatedTodo);

        const result = await updateTodo('1', updates);

        expect(apiPut).toHaveBeenCalledWith('/todos/1', updates);
        expect(result).toEqual(updatedTodo);
      });

      it('should handle non-existent todo', async () => {
        const error = new Error('Todo not found');
        (apiPut as jest.Mock).mockRejectedValue(error);

        await expect(updateTodo('999', { title: 'Test' })).rejects.toThrow('Todo not found');
      });
    });

    describe('Delete Todo', () => {
      it('should delete todo successfully', async () => {
        (apiDelete as jest.Mock).mockResolvedValue({ message: 'Todo deleted' });

        const result = await deleteTodo('1');

        expect(apiDelete).toHaveBeenCalledWith('/todos/1');
        expect(result).toEqual({ message: 'Todo deleted' });
      });

      it('should handle deletion of non-existent todo', async () => {
        const error = new Error('Todo not found');
        (apiDelete as jest.Mock).mockRejectedValue(error);

        await expect(deleteTodo('999')).rejects.toThrow('Todo not found');
      });
    });
  });

  describe('Status Management', () => {
    it('should complete todo successfully', async () => {
      const completedTodo = { ...mockTodo, completed: true, completedAt: '2023-01-01T12:00:00Z' };
      (apiPost as jest.Mock).mockResolvedValue(completedTodo);

      const result = await completeTodo('1');

      expect(apiPost).toHaveBeenCalledWith('/todos/1/complete');
      expect(result).toEqual(completedTodo);
    });

    it('should mark todo as incomplete', async () => {
      const incompleteTodoData = { ...mockTodo, completed: false, completedAt: null };
      (apiPost as jest.Mock).mockResolvedValue(incompleteTodoData);

      const result = await incompleteTodo('1');

      expect(apiPost).toHaveBeenCalledWith('/todos/1/incomplete');
      expect(result).toEqual(incompleteTodoData);
    });
  });

  describe('Priority Management', () => {
    it('should get todos by priority', async () => {
      (apiGet as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const result = await getTodosByPriority('high');

      expect(apiGet).toHaveBeenCalledWith('/todos?page=1&limit=10&priority=high');
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('Search and Filtering', () => {
    describe('Search Todos', () => {
      it('should search todos by title', async () => {
        (apiGet as jest.Mock).mockResolvedValue(mockPaginatedResponse);

        const result = await searchTodos('bug');

        expect(apiGet).toHaveBeenCalledWith('/todos?page=1&limit=10&search=bug');
        expect(result).toEqual(mockPaginatedResponse);
      });
    });

    describe('Filter Todos', () => {
      it('should get completed todos', async () => {
        (apiGet as jest.Mock).mockResolvedValue(mockPaginatedResponse);

        const result = await getCompletedTodos();

        expect(apiGet).toHaveBeenCalledWith('/todos?page=1&limit=10&completed=true');
        expect(result).toEqual(mockPaginatedResponse);
      });

      it('should get incomplete todos', async () => {
        (apiGet as jest.Mock).mockResolvedValue(mockPaginatedResponse);

        const result = await getIncompleteTodos();

        expect(apiGet).toHaveBeenCalledWith('/todos?page=1&limit=10&completed=false');
        expect(result).toEqual(mockPaginatedResponse);
      });
    });

    describe('Date-based Queries', () => {
      it('should get todos due today', async () => {
        (apiGet as jest.Mock).mockResolvedValue(mockPaginatedResponse);

        const result = await getTodosDueToday();

        expect(apiGet).toHaveBeenCalledWith(expect.stringContaining('/todos?page=1&limit=10&dueDate='));
        expect(result).toEqual(mockPaginatedResponse);
      });

      it('should get overdue todos', async () => {
        (apiGet as jest.Mock).mockResolvedValue(mockPaginatedResponse);

        const result = await getOverdueTodos();

        expect(apiGet).toHaveBeenCalledWith('/todos?page=1&limit=10&overdue=true');
        expect(result).toEqual(mockPaginatedResponse);
      });
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk update todos', async () => {
      const updates = { completed: true };
      const todoIds = ['1', '2', '3'];
      (apiPost as jest.Mock).mockResolvedValue({ updated: 3, failed: 0 });

      const result = await bulkUpdateTodos(todoIds, updates);

      expect(apiPost).toHaveBeenCalledWith('/todos/bulk', { todoIds, updates });
      expect(result).toEqual({ updated: 3, failed: 0 });
    });

    it('should bulk delete todos', async () => {
      const todoIds = ['1', '2', '3'];
      (apiPost as jest.Mock).mockResolvedValue({ deleted: 3, failed: 0 });

      const result = await bulkDeleteTodos(todoIds);

      expect(apiPost).toHaveBeenCalledWith('/todos/bulk-delete', { todoIds });
      expect(result).toEqual({ deleted: 3, failed: 0 });
    });

    it('should handle partial bulk operation failures', async () => {
      const todoIds = ['1', '2', '999']; // 999 doesn't exist
      (apiPost as jest.Mock).mockResolvedValue({ deleted: 2, failed: 1 });

      const result = await bulkDeleteTodos(todoIds);

      expect(result.data?.deleted).toBe(2);
      expect(result.data?.failed).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (apiGet as jest.Mock).mockRejectedValue(networkError);

      await expect(getTodos()).rejects.toThrow('Network error');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      (apiPost as jest.Mock).mockRejectedValue(serverError);

      await expect(createTodo({ title: 'Test', description: 'Test', priority: 'medium' })).rejects.toThrow('Internal server error');
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      (apiPost as jest.Mock).mockRejectedValue(validationError);

      await expect(createTodo({} as any)).rejects.toThrow('Validation failed');
    });
  });
}); 