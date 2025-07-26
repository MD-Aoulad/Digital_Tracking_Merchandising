/**
 * API Hooks
 * 
 * This module provides reusable React hooks for API operations.
 * It handles loading states, error handling, and data management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ApiHookState, 
  ApiMutationState, 
  ApiResponse 
} from '../types';
import { 
  apiRequest, 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  handleApiError 
} from './client';

// ===== GENERIC API HOOKS =====

/**
 * Generic hook for API queries with automatic refetching
 */
export const useApiQuery = <T>(
  url: string,
  dependencies: any[] = []
): ApiHookState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<T>(url, {
        signal: abortControllerRef.current.signal
      });
      setData(response);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    
    // Cleanup function to cancel pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, ...dependencies]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Generic hook for API mutations (POST, PUT, DELETE)
 */
export const useApiMutation = <T>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST'
): ApiMutationState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (requestData?: any) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      let response: T;
      
      switch (method) {
        case 'POST':
          response = await apiPost<T>(url, requestData);
          break;
        case 'PUT':
          response = await apiPut<T>(url, requestData);
          break;
        case 'DELETE':
          response = await apiDelete<T>(url);
          break;
        case 'PATCH':
          response = await apiRequest<T>(url, {
            method: 'PATCH',
            body: requestData ? JSON.stringify(requestData) : undefined
          });
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      setData(response);
      return response;
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url, method]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, mutate, reset };
};

// ===== SPECIALIZED HOOKS =====

/**
 * Hook for paginated data with search and filtering
 */
export const usePaginatedQuery = <T>(
  url: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: Record<string, any>
) => {
  const [queryParams, setQueryParams] = useState(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...filters
    });
    return params.toString();
  });

  const fullUrl = `${url}?${queryParams}`;
  const { data, loading, error, refetch } = useApiQuery<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(fullUrl, [queryParams]);

  const updateQuery = useCallback((newParams: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
  }) => {
    const params = new URLSearchParams({
      page: (newParams.page || page).toString(),
      limit: (newParams.limit || limit).toString(),
      ...(newParams.search && { search: newParams.search }),
      ...(newParams.filters || filters)
    });
    setQueryParams(params.toString());
  }, [page, limit, search, filters]);

  return {
    data: data?.data || [],
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
 * Hook for real-time data with polling
 */
export const usePollingQuery = <T>(
  url: string,
  interval: number = 5000, // 5 seconds
  enabled: boolean = true
) => {
  const { data, loading, error, refetch } = useApiQuery<T>(url);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      refetch();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, refetch]);

  return { data, loading, error, refetch };
};

/**
 * Hook for optimistic updates
 */
export const useOptimisticMutation = <T>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  updateQuery?: (data: T) => void
) => {
  const { mutate, loading, error, reset } = useApiMutation<T>(url, method);

  const optimisticMutate = useCallback(async (
    requestData: any,
    optimisticData: T
  ) => {
    // Apply optimistic update immediately
    if (updateQuery) {
      updateQuery(optimisticData);
    }

    try {
      const result = await mutate(requestData);
      return result;
    } catch (err) {
      // Revert optimistic update on error
      if (updateQuery) {
        // This would need to be implemented based on the specific use case
        // For now, we just reset the mutation state
        reset();
      }
      throw err;
    }
  }, [mutate, updateQuery, reset]);

  return { optimisticMutate, loading, error, reset };
};

// ===== UTILITY HOOKS =====

/**
 * Hook for managing form submission state
 */
export const useFormSubmission = <T>(
  url: string,
  method: 'POST' | 'PUT' = 'POST'
) => {
  const { mutate, loading, error, reset } = useApiMutation<T>(url, method);

  const submit = useCallback(async (formData: any) => {
    try {
      const result = await mutate(formData);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [mutate]);

  return { submit, loading, error, reset };
};

/**
 * Hook for managing file uploads
 */
export const useFileUpload = <T>(url: string) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutate, loading, error, reset } = useApiMutation<T>(url, 'POST');

  const upload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploadProgress(0);
    
    try {
      const result = await apiRequest<T>(url, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it
        }
      });
      
      setUploadProgress(100);
      return result;
    } catch (err) {
      setUploadProgress(0);
      throw err;
    }
  }, [url]);

  return { upload, uploadProgress, loading, error, reset };
}; 