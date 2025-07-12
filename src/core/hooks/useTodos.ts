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
  UpdateTodoRequest,
  PaginatedResponse 
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
  getTodosDueToday,
  getOverdueTodos,
  validateTodo,
  getPriorityColor,
  getPriorityIcon,
  formatDueDate,
  isOverdue,
  calculateCompletionPercentage
} from '../services/todo';

// ===== BASIC TODO HOOKS =====

/**
 * Hook for fetching all todos with pagination
 */
export const useTodos = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: {
    priority?: 'low' | 'medium' | 'high';
    completed?: boolean;
    userId?: string;
  }
) => {
  const [queryParams, setQueryParams] = useState(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.completed !== undefined && { completed: filters.completed.toString() }),
      ...(filters?.userId && { userId: filters.userId })
    });
    return params.toString();
  });

  const { data, loading, error, refetch } = useApiQuery<PaginatedResponse<Todo>>(
    `/todos?${queryParams}`,
    [queryParams]
  );

  const updateQuery = useCallback((newParams: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: typeof filters;
  }) => {
    const params = new URLSearchParams({
      page: (newParams.page || page).toString(),
      limit: (newParams.limit || limit).toString(),
      ...(newParams.search && { search: newParams.search }),
      ...(newParams.filters?.priority && { priority: newParams.filters.priority }),
      ...(newParams.filters?.completed !== undefined && { completed: newParams.filters.completed.toString() }),
      ...(newParams.filters?.userId && { userId: newParams.filters.userId })
    });
    setQueryParams(params.toString());
  }, [page, limit, search, filters]);

  return {
    todos: data?.data || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 0,
    loading,
    error,
    refetch,
    updateQuery
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
export const useTodosByPriority = (
  priority: 'low' | 'medium' | 'high',
  page: number = 1,
  limit: number = 10
) => {
  return useTodos(page, limit, undefined, { priority });
};

/**
 * Hook for completed todos
 */
export const useCompletedTodos = (page: number = 1, limit: number = 10) => {
  return useTodos(page, limit, undefined, { completed: true });
};

/**
 * Hook for incomplete todos
 */
export const useIncompleteTodos = (page: number = 1, limit: number = 10) => {
  return useTodos(page, limit, undefined, { completed: false });
};

/**
 * Hook for searching todos
 */
export const useSearchTodos = (searchTerm: string, page: number = 1, limit: number = 10) => {
  return useTodos(page, limit, searchTerm);
};

/**
 * Hook for todos due today
 */
export const useTodosDueToday = (page: number = 1, limit: number = 10) => {
  const { data, loading, error, refetch } = useApiQuery<PaginatedResponse<Todo>>(
    `/todos?dueDate=${new Date().toISOString().split('T')[0]}&page=${page}&limit=${limit}`,
    [page, limit]
  );

  return {
    todos: data?.data || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 0,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for overdue todos
 */
export const useOverdueTodos = (page: number = 1, limit: number = 10) => {
  const { data, loading, error, refetch } = useApiQuery<PaginatedResponse<Todo>>(
    `/todos?overdue=true&page=${page}&limit=${limit}`,
    [page, limit]
  );

  return {
    todos: data?.data || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 0,
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
  const { data: allTodos } = useApiQuery<Todo[]>('/todos?limit=1000');
  const { data: completedTodos } = useApiQuery<Todo[]>('/todos?completed=true&limit=1000');
  const { data: overdueTodos } = useApiQuery<Todo[]>('/todos?overdue=true&limit=1000');

  const stats = {
    total: allTodos?.length || 0,
    completed: completedTodos?.length || 0,
    incomplete: (allTodos?.length || 0) - (completedTodos?.length || 0),
    overdue: overdueTodos?.length || 0,
    completionPercentage: calculateCompletionPercentage(allTodos || [])
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