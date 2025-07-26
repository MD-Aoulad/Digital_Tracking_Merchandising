/**
 * Attendance API Service
 * 
 * Dedicated service for attendance-related API calls with proper error handling,
 * type safety, and integration with the attendance microservice.
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Attendance, CurrentAttendanceStatus, TeamStatus } from './api';

const ATTENDANCE_API_BASE = 'http://localhost:3007/api/attendance';

// ===== API RESPONSE INTERFACES =====

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface PunchInRequest {
  workplaceId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  notes?: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  shiftId?: string;
  photo?: File;
}

interface PunchOutRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  notes?: string;
}

interface BreakRequest {
  type: 'lunch' | 'coffee' | 'personal' | 'other';
  notes?: string;
}

// ===== UTILITY FUNCTIONS =====

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
};

// ===== ATTENDANCE API FUNCTIONS =====

/**
 * Get current attendance status
 */
export const getCurrentAttendance = async (): Promise<CurrentAttendanceStatus> => {
  try {
    const response = await fetch(`${ATTENDANCE_API_BASE}/current`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleApiResponse<ApiResponse<CurrentAttendanceStatus>>(response);
    return data.data || { isPunchedIn: false, currentAttendance: null };
  } catch (error) {
    console.error('Error fetching current attendance:', error);
    throw error;
  }
};

/**
 * Punch in to work
 */
export const punchIn = async (request: PunchInRequest): Promise<Attendance> => {
  try {
    const formData = new FormData();
    
    // Add text fields
    Object.entries(request).forEach(([key, value]) => {
      if (key !== 'photo' && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // Add photo if provided
    if (request.photo) {
      formData.append('photo', request.photo);
    }
    
    const response = await fetch(`${ATTENDANCE_API_BASE}/punch-in`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeaders().Authorization,
      },
      body: formData,
    });
    
    const data = await handleApiResponse<ApiResponse<Attendance>>(response);
    return data.data!;
  } catch (error) {
    console.error('Error punching in:', error);
    throw error;
  }
};

/**
 * Punch out from work
 */
export const punchOut = async (request: PunchOutRequest): Promise<Attendance> => {
  try {
    const response = await fetch(`${ATTENDANCE_API_BASE}/punch-out`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    
    const data = await handleApiResponse<ApiResponse<Attendance>>(response);
    return data.data!;
  } catch (error) {
    console.error('Error punching out:', error);
    throw error;
  }
};

/**
 * Start a break
 */
export const startBreak = async (request: BreakRequest): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${ATTENDANCE_API_BASE}/break/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    
    const data = await handleApiResponse<ApiResponse<{ message: string }>>(response);
    return data.data!;
  } catch (error) {
    console.error('Error starting break:', error);
    throw error;
  }
};

/**
 * End a break
 */
export const endBreak = async (): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${ATTENDANCE_API_BASE}/break/end`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await handleApiResponse<ApiResponse<{ message: string }>>(response);
    return data.data!;
  } catch (error) {
    console.error('Error ending break:', error);
    throw error;
  }
};

/**
 * Get attendance history
 */
export const getAttendanceHistory = async (params?: {
  startDate?: string;
  endDate?: string;
  workplaceId?: string;
  limit?: number;
  offset?: number;
}): Promise<Attendance[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const url = `${ATTENDANCE_API_BASE}/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleApiResponse<ApiResponse<Attendance[]>>(response);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    throw error;
  }
};

/**
 * Get team status (for managers/admins)
 */
export const getTeamStatus = async (params?: {
  workplaceId?: string;
  shiftId?: string;
  date?: string;
}): Promise<TeamStatus[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const url = `${ATTENDANCE_API_BASE}/team/status${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleApiResponse<ApiResponse<TeamStatus[]>>(response);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching team status:', error);
    throw error;
  }
};

/**
 * Request attendance approval
 */
export const requestApproval = async (request: {
  type: string;
  reason: string;
  startDate: string;
  endDate: string;
  notes?: string;
}): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${ATTENDANCE_API_BASE}/approval/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    
    const data = await handleApiResponse<ApiResponse<{ message: string }>>(response);
    return data.data!;
  } catch (error) {
    console.error('Error requesting approval:', error);
    throw error;
  }
};

/**
 * Approve or reject an attendance request
 */
export const handleApproval = async (requestId: string, action: 'approve' | 'reject', notes?: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${ATTENDANCE_API_BASE}/approval/${requestId}/action`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, notes }),
    });
    
    const data = await handleApiResponse<ApiResponse<{ message: string }>>(response);
    return data.data!;
  } catch (error) {
    console.error('Error handling approval:', error);
    throw error;
  }
};

// ===== REACT HOOKS =====

/**
 * Hook for current attendance status
 */
export const useCurrentAttendance = () => {
  const [data, setData] = useState<CurrentAttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCurrentAttendance();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for punch in operation
 */
export const usePunchIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const punchInUser = useCallback(async (request: PunchInRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await punchIn(request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { punchIn: punchInUser, loading, error };
};

/**
 * Hook for punch out operation
 */
export const usePunchOut = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const punchOutUser = useCallback(async (request: PunchOutRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await punchOut(request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { punchOut: punchOutUser, loading, error };
};

/**
 * Hook for break management
 */
export const useBreakManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startBreakUser = useCallback(async (request: BreakRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await startBreak(request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const endBreakUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await endBreak();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { startBreak: startBreakUser, endBreak: endBreakUser, loading, error };
};

/**
 * Hook for team status
 */
export const useTeamStatus = (params?: { workplaceId?: string; shiftId?: string; date?: string }) => {
  const [data, setData] = useState<TeamStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getTeamStatus(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}; 