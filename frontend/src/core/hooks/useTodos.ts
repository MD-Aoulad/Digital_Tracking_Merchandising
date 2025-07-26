/**
 * Todo Hooks
 * 
 * This module provides React hooks for todo operations.
 * It uses the todo service and API hooks for data management.
 */

import { useState, useCallback } from 'react';
import { 
  Todo, 
  CreateTodoRequest, 
  UpdateTodoRequest
} from '../types';
import { useApiQuery, useApiMutation, usePaginatedQuery } from '../api/hooks';
import { 
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  completeTodo,
  incompleteTodo,
  getTodosByPriority,
  getCompletedTodos,
  getIncompleteTodos,
  searchTodos,
  validateTodo,
  getPriorityColor,
  getPriorityIcon,
  formatDueDate,
  isOverdue,
  calculateCompletionPercentage
} from '../services/todo';

// ===== BASIC TODO HOOKS =====

/**
 * Hook for fetching all todos
 */
export const useTodos = () => {
  const { data, loading, error, refetch } = useApiQuery<{ todos: Todo[] }>('/todos');

  return {
    todos: data?.todos || [],
    loading,
    error,
    refetch
  };
};

/**
 * Hook for creating a new todo
 */
export const useCreateTodo = () => {
  const { mutate, loading, error, reset } = useApiMutation<Todo>('/todos', 'POST');

  const create = useCallback(async (todoData: CreateTodoRequest) => {
    const validation = validateTodo(todoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return await mutate(todoData);
  }, [mutate]);

  return { create, loading, error, reset };
};

/**
 * Hook for updating a todo
 */
export const useUpdateTodo = () => {
  const { mutate, loading, error, reset } = useApiMutation<Todo>('/todos', 'PUT');

  const update = useCallback(async (id: string, todoData: UpdateTodoRequest) => {
    return await mutate({ id, ...todoData });
  }, [mutate]);

  return { update, loading, error, reset };
};

/**
 * Hook for deleting a todo
 */
export const useDeleteTodo = () => {
  const { mutate, loading, error, reset } = useApiMutation('/todos', 'DELETE');

  const remove = useCallback(async (id: string) => {
    return await mutate({ id });
  }, [mutate]);

  return { remove, loading, error, reset };
};

/**
 * Hook for completing a todo
 */
export const useCompleteTodo = () => {
  const { mutate, loading, error, reset } = useApiMutation<Todo>('/todos/complete', 'POST');

  const complete = useCallback(async (id: string) => {
    return await mutate({ id });
  }, [mutate]);

  return { complete, loading, error, reset };
};

/**
 * Hook for marking a todo as incomplete
 */
export const useIncompleteTodo = () => {
  const { mutate, loading, error, reset } = useApiMutation<Todo>('/todos/incomplete', 'POST');

  const incomplete = useCallback(async (id: string) => {
    return await mutate({ id });
  }, [mutate]);

  return { incomplete, loading, error, reset };
};

// ===== SPECIALIZED TODO HOOKS =====

/**
 * Hook for todos by priority
 */
export const useTodosByPriority = (priority: 'low' | 'medium' | 'high') => {
  const { data, loading, error, refetch } = useApiQuery<{ todos: Todo[] }>('/todos');

  const filteredTodos = data?.todos?.filter(todo => todo.priority === priority) || [];

  return {
    todos: filteredTodos,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for completed todos
 */
export const useCompletedTodos = () => {
  const { data, loading, error, refetch } = useApiQuery<{ todos: Todo[] }>('/todos');

  const completedTodos = data?.todos?.filter(todo => todo.completed) || [];

  return {
    todos: completedTodos,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for incomplete todos
 */
export const useIncompleteTodos = () => {
  const { data, loading, error, refetch } = useApiQuery<{ todos: Todo[] }>('/todos');

  const incompleteTodos = data?.todos?.filter(todo => !todo.completed) || [];

  return {
    todos: incompleteTodos,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for searching todos
 */
export const useSearchTodos = (searchTerm: string) => {
  const { data, loading, error, refetch } = useApiQuery<{ todos: Todo[] }>('/todos');

  const searchLower = searchTerm.toLowerCase();
  const filteredTodos = data?.todos?.filter(todo => 
    todo.title.toLowerCase().includes(searchLower) ||
    todo.description.toLowerCase().includes(searchLower)
  ) || [];

  return {
    todos: filteredTodos,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for todos due today
 */
export const useTodosDueToday = () => {
  const { data, loading, error, refetch } = useApiQuery<{ todos: Todo[] }>('/todos');

  const today = new Date().toISOString().split('T')[0];
  const dueTodayTodos = data?.todos?.filter(todo => {
    if (!todo.dueDate) return false;
    const todoDate = new Date(todo.dueDate).toISOString().split('T')[0];
    return todoDate === today;
  }) || [];

  return {
    todos: dueTodayTodos,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for overdue todos
 */
export const useOverdueTodos = () => {
  const { data, loading, error, refetch } = useApiQuery<{ todos: Todo[] }>('/todos');

  const now = new Date();
  const overdueTodos = data?.todos?.filter(todo => {
    if (!todo.dueDate) return false;
    const dueDate = new Date(todo.dueDate);
    return dueDate < now && !todo.completed;
  }) || [];

  return {
    todos: overdueTodos,
    loading,
    error,
    refetch
  };
};

// ===== UTILITY HOOKS =====

/**
 * Hook for todo statistics
 */
export const useTodoStats = () => {
  const { data: allTodosData } = useApiQuery<{ todos: Todo[] }>('/todos');

  const allTodos = allTodosData?.todos || [];
  const completedTodos = allTodos.filter(todo => todo.completed);
  const overdueTodos = allTodos.filter(todo => {
    if (!todo.dueDate) return false;
    const dueDate = new Date(todo.dueDate);
    return dueDate < new Date() && !todo.completed;
  });

  const stats = {
    total: allTodos.length,
    completed: completedTodos.length,
    incomplete: allTodos.length - completedTodos.length,
    overdue: overdueTodos.length,
    completionPercentage: calculateCompletionPercentage(allTodos)
  };

  return stats;
};

/**
 * Hook for todo validation
 */
export const useTodoValidation = () => {
  const validate = useCallback((todo: CreateTodoRequest) => {
    return validateTodo(todo);
  }, []);

  return { validate };
};

/**
 * Hook for todo UI utilities
 */
export const useTodoUI = () => {
  const getPriorityColorClass = useCallback((priority: 'low' | 'medium' | 'high') => {
    return getPriorityColor(priority);
  }, []);

  const getPriorityIconSymbol = useCallback((priority: 'low' | 'medium' | 'high') => {
    return getPriorityIcon(priority);
  }, []);

  const formatDueDateDisplay = useCallback((dueDate: string) => {
    return formatDueDate(dueDate);
  }, []);

  const checkIfOverdue = useCallback((todo: Todo) => {
    return isOverdue(todo);
  }, []);

  return {
    getPriorityColorClass,
    getPriorityIconSymbol,
    formatDueDateDisplay,
    checkIfOverdue
  };
};

// ===== OPTIMISTIC UPDATE HOOKS =====

/**
 * Hook for optimistic todo updates
 */
export const useOptimisticTodoUpdate = () => {
  const { update, loading, error, reset } = useUpdateTodo();

  const optimisticUpdate = useCallback(async (
    id: string,
    updates: UpdateTodoRequest,
    optimisticData: Todo
  ) => {
    // This would need to be implemented with a cache update mechanism
    // For now, we just call the regular update
    return await update(id, updates);
  }, [update]);

  return { optimisticUpdate, loading, error, reset };
};

/**
 * Hook for optimistic todo completion
 */
export const useOptimisticTodoComplete = () => {
  const { complete, loading, error, reset } = useCompleteTodo();

  const optimisticComplete = useCallback(async (id: string) => {
    // This would need to be implemented with a cache update mechanism
    // For now, we just call the regular complete
    return await complete(id);
  }, [complete]);

  return { optimisticComplete, loading, error, reset };
};

// ===== BULK OPERATION HOOKS =====

/**
 * Hook for bulk todo operations
 */
export const useBulkTodoOperations = () => {
  const { mutate: bulkUpdate, loading: bulkUpdateLoading, error: bulkUpdateError } = useApiMutation('/todos/bulk', 'POST');
  const { mutate: bulkDelete, loading: bulkDeleteLoading, error: bulkDeleteError } = useApiMutation('/todos/bulk-delete', 'POST');

  const bulkUpdateTodos = useCallback(async (
    todoIds: string[],
    updates: Partial<UpdateTodoRequest>
  ) => {
    return await bulkUpdate({ todoIds, updates });
  }, [bulkUpdate]);

  const bulkDeleteTodos = useCallback(async (todoIds: string[]) => {
    return await bulkDelete({ todoIds });
  }, [bulkDelete]);

  return {
    bulkUpdateTodos,
    bulkDeleteTodos,
    loading: bulkUpdateLoading || bulkDeleteLoading,
    error: bulkUpdateError || bulkDeleteError
  };
}; 