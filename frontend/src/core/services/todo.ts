/**
 * Todo Service
 * 
 * This module provides todo-related API operations and utilities.
 * It handles CRUD operations for todos with proper error handling.
 */

import { 
  Todo, 
  CreateTodoRequest, 
  UpdateTodoRequest, 
  ApiResponse
} from '../types';
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client';

// ===== TODO ENDPOINTS =====

const TODO_ENDPOINTS = {
  LIST: '/todos',
  CREATE: '/todos',
  GET: (id: string) => `/todos/${id}`,
  UPDATE: (id: string) => `/todos/${id}`,
  DELETE: (id: string) => `/todos/${id}`,
  COMPLETE: (id: string) => `/todos/${id}/complete`,
  INCOMPLETE: (id: string) => `/todos/${id}/incomplete`,
  BULK_UPDATE: '/todos/bulk',
  BULK_DELETE: '/todos/bulk-delete',
} as const;

// ===== TODO API FUNCTIONS =====

/**
 * Get all todos for the current user
 */
export const getTodos = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: {
    priority?: 'low' | 'medium' | 'high';
    completed?: boolean;
    dueDate?: string;
    overdue?: boolean;
  }
): Promise<{
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  let url = `${TODO_ENDPOINTS.LIST}?page=${page}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  if (filters) {
    if (filters.priority) {
      url += `&priority=${filters.priority}`;
    }
    if (filters.completed !== undefined) {
      url += `&completed=${filters.completed}`;
    }
    if (filters.dueDate) {
      url += `&dueDate=${encodeURIComponent(filters.dueDate)}`;
    }
    if (filters.overdue) {
      url += `&overdue=${filters.overdue}`;
    }
  }
  
  return await apiGet<{
    todos: Todo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(url);
};

/**
 * Get a single todo by ID
 */
export const getTodo = async (id: string): Promise<Todo> => {
  return await apiGet<Todo>(TODO_ENDPOINTS.GET(id));
};

/**
 * Create a new todo
 */
export const createTodo = async (todoData: CreateTodoRequest): Promise<Todo> => {
  return await apiPost<Todo>(TODO_ENDPOINTS.CREATE, todoData);
};

/**
 * Update an existing todo
 */
export const updateTodo = async (id: string, todoData: UpdateTodoRequest): Promise<Todo> => {
  return await apiPut<Todo>(TODO_ENDPOINTS.UPDATE(id), todoData);
};

/**
 * Delete a todo
 */
export const deleteTodo = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  return await apiDelete<ApiResponse<{ message: string }>>(TODO_ENDPOINTS.DELETE(id));
};

/**
 * Mark a todo as completed
 */
export const completeTodo = async (id: string): Promise<Todo> => {
  return await apiPost<Todo>(TODO_ENDPOINTS.COMPLETE(id));
};

/**
 * Mark a todo as incomplete
 */
export const incompleteTodo = async (id: string): Promise<Todo> => {
  return await apiPost<Todo>(TODO_ENDPOINTS.INCOMPLETE(id));
};

/**
 * Bulk update multiple todos
 */
export const bulkUpdateTodos = async (
  todoIds: string[],
  updates: Partial<UpdateTodoRequest>
): Promise<{ updated: number; failed: number }> => {
  const response = await apiPost<{ updated: number; failed: number }>(
    TODO_ENDPOINTS.BULK_UPDATE,
    { todoIds, updates }
  );
  return response;
};

/**
 * Bulk delete multiple todos
 */
export const bulkDeleteTodos = async (
  todoIds: string[]
): Promise<{ deleted: number; failed: number }> => {
  const response = await apiPost<{ deleted: number; failed: number }>(
    TODO_ENDPOINTS.BULK_DELETE,
    { todoIds }
  );
  return response;
};

// ===== TODO UTILITY FUNCTIONS =====

/**
 * Get todos by priority
 */
export const getTodosByPriority = async (
  priority: 'low' | 'medium' | 'high'
): Promise<{
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  return await getTodos(1, 10, undefined, { priority });
};

/**
 * Get completed todos
 */
export const getCompletedTodos = async (): Promise<{
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  return await getTodos(1, 10, undefined, { completed: true });
};

/**
 * Get incomplete todos
 */
export const getIncompleteTodos = async (): Promise<{
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  return await getTodos(1, 10, undefined, { completed: false });
};

/**
 * Search todos by title or description
 */
export const searchTodos = async (
  searchTerm: string
): Promise<{
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  return await getTodos(1, 10, searchTerm);
};

/**
 * Get todos due today
 */
export const getTodosDueToday = async (): Promise<{
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const today = new Date().toISOString().split('T')[0];
  return await getTodos(1, 10, undefined, { dueDate: today });
};

/**
 * Get overdue todos
 */
export const getOverdueTodos = async (): Promise<{
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  return await getTodos(1, 10, undefined, { overdue: true });
};

// ===== TODO VALIDATION FUNCTIONS =====

/**
 * Validate todo data before submission
 */
export const validateTodo = (todo: CreateTodoRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!todo.title || todo.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (todo.title && todo.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (todo.description && todo.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  if (todo.dueDate) {
    const dueDate = new Date(todo.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due date format');
    }
  }

  if (todo.priority && !['low', 'medium', 'high'].includes(todo.priority)) {
    errors.push('Invalid priority level');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get priority color for UI display
 */
export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Get priority icon for UI display
 */
export const getPriorityIcon = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'low':
      return '⬇️';
    case 'medium':
      return '➡️';
    case 'high':
      return '⬆️';
    default:
      return '📋';
  }
};

/**
 * Format due date for display
 */
export const formatDueDate = (dueDate: string): string => {
  const date = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else if (date < today) {
    return `Overdue (${date.toLocaleDateString()})`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Check if todo is overdue
 */
export const isOverdue = (todo: Todo): boolean => {
  if (!todo.dueDate || todo.completed) return false;
  
  const dueDate = new Date(todo.dueDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  return dueDate < today;
};

/**
 * Calculate completion percentage for a list of todos
 */
export const calculateCompletionPercentage = (todos: Todo[]): number => {
  if (todos.length === 0) return 0;
  
  const completedCount = todos.filter(todo => todo.completed).length;
  return Math.round((completedCount / todos.length) * 100);
}; 