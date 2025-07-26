import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/api';

// API Configuration
const ATTENDANCE_API_BASE = getApiUrl();

// Types
export interface PunchInRequest {
  workplaceId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp?: string;
  notes?: string;
  deviceInfo?: string;
  photo?: File;
}

export interface PunchOutRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp?: string;
  notes?: string;
  deviceInfo?: string;
  photo?: File;
}

export interface Attendance {
  id: string;
  punchInTime: string;
  punchOutTime: string | null;
  workplace: {
    id: string;
    name: string;
    address: string;
  };
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    isWithinRadius: boolean;
  };
  photoUrl: string | null;
  status: 'active' | 'on_break' | 'completed';
  totalWorkHours?: number;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = AsyncStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Punch in to work with real GPS and photo data
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
    
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${ATTENDANCE_API_BASE}/punch-in`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await handleApiResponse<ApiResponse<Attendance>>(response);
    if (!data.data) {
      throw new Error('No data received from server');
    }
    return data.data;
  } catch (error) {
    console.error('Error punching in:', error);
    throw error;
  }
};

/**
 * Punch out from work with real GPS and photo data
 */
export const punchOut = async (request: PunchOutRequest): Promise<Attendance> => {
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
    
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${ATTENDANCE_API_BASE}/punch-out`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await handleApiResponse<ApiResponse<Attendance>>(response);
    if (!data.data) {
      throw new Error('No data received from server');
    }
    return data.data;
  } catch (error) {
    console.error('Error punching out:', error);
    throw error;
  }
};

/**
 * Get current attendance status
 */
export const getCurrentAttendance = async (): Promise<Attendance | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${ATTENDANCE_API_BASE}/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.status === 404) {
      return null; // No current attendance
    }
    
    const data = await handleApiResponse<ApiResponse<Attendance>>(response);
    return data.data || null;
  } catch (error) {
    console.error('Error getting current attendance:', error);
    throw error;
  }
};

/**
 * Get attendance history
 */
export const getAttendanceHistory = async (
  page: number = 1,
  limit: number = 20,
  startDate?: string,
  endDate?: string
): Promise<{ data: Attendance[]; pagination: any }> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${ATTENDANCE_API_BASE}/history?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await handleApiResponse<ApiResponse<{ data: Attendance[]; pagination: any }>>(response);
    if (!data.data) {
      throw new Error('No data received from server');
    }
    return data.data;
  } catch (error) {
    console.error('Error getting attendance history:', error);
    throw error;
  }
};

/**
 * Get available workplaces
 */
export const getWorkplaces = async (): Promise<any[]> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${ATTENDANCE_API_BASE}/workplaces`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await handleApiResponse<ApiResponse<any[]>>(response);
    return data.data || [];
  } catch (error) {
    console.error('Error getting workplaces:', error);
    throw error;
  }
}; 