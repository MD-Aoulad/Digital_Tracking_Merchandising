/**
 * Attendance Context Provider - Workforce Management Platform
 * 
 * Global state management for attendance system with real-time updates
 * and comprehensive attendance data management.
 * 
 * Features:
 * - Real-time attendance status management
 * - Team status synchronization
 * - Break management
 * - Approval workflow
 * - WebSocket integration
 * - Offline data caching
 * - Error handling and recovery
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  AttendanceRecord, 
  AttendanceStats, 
  TeamStatus,
  AttendanceApproval,
  WorkShift,
  GeofenceZone,
  Break
} from '../types';
import { 
  getCurrentAttendance, 
  punchIn, 
  punchOut, 
  startBreak as startBreakApi, 
  endBreak, 
  getTeamStatus,
  requestApproval,
  handleApproval
} from '../services/attendanceApi';
import { 
  attendanceWebSocket, 
  onWebSocketEvent, 
  offWebSocketEvent,
  connectWebSocket,
  disconnectWebSocket,
  joinWorkplaceRoom,
  leaveWorkplaceRoom
} from '../services/websocket';
import toast from 'react-hot-toast';

// ===== STATE INTERFACES =====

export interface AttendanceState {
  // Current user status
  currentStatus: 'in' | 'out' | 'break';
  todaySummary: {
    hoursWorked: number;
    breaks: Break[];
    overtime: number;
    status: string;
  };
  
  // Team data
  teamStatus: TeamStatus[];
  pendingApprovals: AttendanceApproval[];
  
  // Real-time updates
  realTimeUpdates: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Current shift and geofence
  currentShift: WorkShift | null;
  geofenceZones: GeofenceZone[];
  
  // Statistics
  attendanceStats: AttendanceStats;
}

// ===== ACTION TYPES =====

export type AttendanceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_STATUS'; payload: 'in' | 'out' | 'break' }
  | { type: 'SET_TODAY_SUMMARY'; payload: any }
  | { type: 'SET_TEAM_STATUS'; payload: TeamStatus[] }
  | { type: 'SET_PENDING_APPROVALS'; payload: AttendanceApproval[] }
  | { type: 'SET_REAL_TIME_UPDATES'; payload: boolean }
  | { type: 'SET_CONNECTION_STATUS'; payload: 'disconnected' | 'connecting' | 'connected' }
  | { type: 'SET_CURRENT_SHIFT'; payload: WorkShift | null }
  | { type: 'SET_GEOFENCE_ZONES'; payload: GeofenceZone[] }
  | { type: 'SET_ATTENDANCE_STATS'; payload: AttendanceStats }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: TeamStatus }
  | { type: 'ADD_APPROVAL_REQUEST'; payload: AttendanceApproval }
  | { type: 'UPDATE_APPROVAL_REQUEST'; payload: { id: string; status: string } }
  | { type: 'RESET_STATE' };

// ===== CONTEXT INTERFACE =====

export interface AttendanceContextType {
  state: AttendanceState;
  updateAttendanceStatus: (status: 'in' | 'out' | 'break') => Promise<void>;
  startBreak: (type: Break['type']) => Promise<void>;
  endBreak: () => Promise<void>;
  requestApproval: (request: Omit<AttendanceApproval, 'id' | 'status' | 'requestedAt'>) => Promise<void>;
  approveRequest: (requestId: string, approved: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
}

// ===== INITIAL STATE =====

const initialState: AttendanceState = {
  currentStatus: 'out',
  todaySummary: {
    hoursWorked: 0,
    breaks: [],
    overtime: 0,
    status: 'not-started'
  },
  teamStatus: [],
  pendingApprovals: [],
  realTimeUpdates: false,
  connectionStatus: 'disconnected',
  loading: false,
  error: null,
  currentShift: null,
  geofenceZones: [],
  attendanceStats: {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    overtimeHours: 0,
    averageWorkHours: 0,
    attendanceRate: 0
  }
};

// ===== REDUCER =====

function attendanceReducer(state: AttendanceState, action: AttendanceAction): AttendanceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CURRENT_STATUS':
      return { ...state, currentStatus: action.payload };
    
    case 'SET_TODAY_SUMMARY':
      return { ...state, todaySummary: action.payload };
    
    case 'SET_TEAM_STATUS':
      return { ...state, teamStatus: action.payload };
    
    case 'SET_PENDING_APPROVALS':
      return { ...state, pendingApprovals: action.payload };
    
    case 'SET_REAL_TIME_UPDATES':
      return { ...state, realTimeUpdates: action.payload };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    
    case 'SET_CURRENT_SHIFT':
      return { ...state, currentShift: action.payload };
    
    case 'SET_GEOFENCE_ZONES':
      return { ...state, geofenceZones: action.payload };
    
    case 'SET_ATTENDANCE_STATS':
      return { ...state, attendanceStats: action.payload };
    
    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        teamStatus: state.teamStatus.map(member =>
          member.userId === action.payload.userId ? action.payload : member
        )
      };
    
    case 'ADD_APPROVAL_REQUEST':
      return {
        ...state,
        pendingApprovals: [...state.pendingApprovals, action.payload]
      };
    
    case 'UPDATE_APPROVAL_REQUEST':
      return {
        ...state,
        pendingApprovals: state.pendingApprovals.map(request =>
          request.id === action.payload.id
            ? { ...request, status: action.payload.status as 'pending' | 'approved' | 'rejected' }
            : request
        )
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// ===== CONTEXT CREATION =====

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// ===== PROVIDER COMPONENT =====

interface AttendanceProviderProps {
  children: ReactNode;
}

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);

  // Assume workplaceId is available (replace with actual logic as needed)
  const workplaceId = 'default-workplace'; // TODO: get from user context or API

  // Initialize data on mount
  useEffect(() => {
    initializeData();
    connectWebSocket().then(() => {
      joinWorkplaceRoom(workplaceId);
      setupWebSocketListeners();
    });
    return () => {
      cleanupWebSocketListeners();
      leaveWorkplaceRoom(workplaceId);
      disconnectWebSocket();
    };
  }, []);

  // Monitor connection status
  useEffect(() => {
    const interval = setInterval(() => {
      const status = attendanceWebSocket.getConnectionStatus();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Initialize attendance data
   */
  const initializeData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Load current status
      const currentStatus = await getCurrentAttendance();
      dispatch({ type: 'SET_CURRENT_STATUS', payload: currentStatus.isPunchedIn ? 'in' : 'out' });

      // Load today's summary (using current attendance data)
      const todaySummary = {
        hoursWorked: currentStatus.currentAttendance?.totalWorkHours || 0,
        breaks: currentStatus.currentAttendance?.currentBreak ? [currentStatus.currentAttendance.currentBreak] : [],
        overtime: 0, // TODO: Calculate overtime
        status: currentStatus.isPunchedIn ? 'active' : 'out'
      };
      dispatch({ type: 'SET_TODAY_SUMMARY', payload: todaySummary });

      // Load team status (if user is manager)
      try {
        const teamStatus = await getTeamStatus();
        // Convert API TeamStatus to internal TeamStatus format
        const convertedTeamStatus = teamStatus.map(member => ({
          ...member,
          name: member.employeeName,
          isOnBreak: member.status === 'on_break',
          lastSeen: new Date().toISOString(),
          status: (member.status === 'on_break' ? 'break' : 
                  member.status === 'late' ? 'late' : 
                  member.status === 'overtime' ? 'overtime' : 
                  member.status === 'present' ? 'present' : 'absent') as 'break' | 'late' | 'overtime' | 'present' | 'absent'
        }));
        dispatch({ type: 'SET_TEAM_STATUS', payload: convertedTeamStatus });
      } catch (error) {
        // User might not have manager permissions
        console.log('Could not load team status:', error);
      }

      // Load pending approvals
      try {
        const pendingApprovals: any[] = []; // TODO: Implement pending approvals API
        dispatch({ type: 'SET_PENDING_APPROVALS', payload: pendingApprovals });
      } catch (error) {
        // User might not have approval permissions
        console.log('Could not load pending approvals:', error);
      }

    } catch (error) {
      console.error('Error initializing attendance data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load attendance data' });
      toast.error('Failed to load attendance data');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Setup WebSocket event listeners (listen for backend event names)
   */
  const setupWebSocketListeners = () => {
    onWebSocketEvent('attendance:user-punched-in', (data) => {
      // Optionally, check if data.userId === current user or team
      refreshData();
      toast.success(`${data.employeeName} punched in`);
    });
    onWebSocketEvent('attendance:user-punched-out', (data) => {
      refreshData();
      toast.success(`${data.employeeName} punched out`);
    });
    onWebSocketEvent('attendance:user-break-start', (data) => {
      refreshData();
      toast.success(`${data.employeeName} started a break (${data.breakType})`);
    });
    onWebSocketEvent('attendance:user-break-end', (data) => {
      refreshData();
      toast.success(`${data.employeeName} ended a break`);
    });
  };

  /**
   * Cleanup WebSocket event listeners
   */
  const cleanupWebSocketListeners = () => {
    offWebSocketEvent('attendance:user-punched-in', () => {});
    offWebSocketEvent('attendance:user-punched-out', () => {});
    offWebSocketEvent('attendance:user-break-start', () => {});
    offWebSocketEvent('attendance:user-break-end', () => {});
  };

  /**
   * Update attendance status
   */
  const updateAttendanceStatus = async (status: 'in' | 'out' | 'break'): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Update local state immediately for optimistic UI
      dispatch({ type: 'SET_CURRENT_STATUS', payload: status });
      
      // Send update to server
      await getCurrentAttendance();
      
      toast.success(`Status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating attendance status:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update status' });
      toast.error('Failed to update status');
      
      // Revert optimistic update
      dispatch({ type: 'SET_CURRENT_STATUS', payload: state.currentStatus });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Start a break
   */
  const startBreak = async (type: Break['type']): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await startBreakApi({ type: type as 'lunch' | 'coffee' | 'personal' | 'other', notes: '' });
      dispatch({ type: 'SET_CURRENT_STATUS', payload: 'break' });
      
      toast.success(`${type} break started`);
    } catch (error) {
      console.error('Error starting break:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start break' });
      toast.error('Failed to start break');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * End current break
   */
  const endBreak = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await endBreak();
      dispatch({ type: 'SET_CURRENT_STATUS', payload: 'in' });
      
      toast.success('Break ended');
    } catch (error) {
      console.error('Error ending break:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to end break' });
      toast.error('Failed to end break');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Request approval
   */
  const requestApproval = async (request: Omit<AttendanceApproval, 'id' | 'status' | 'requestedAt'>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await requestApproval(request);
      
      toast.success('Approval request submitted');
    } catch (error) {
      console.error('Error requesting approval:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to submit approval request' });
      toast.error('Failed to submit approval request');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Approve or reject request
   */
  const approveRequest = async (requestId: string, approved: boolean): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await handleApproval(requestId, approved ? 'approve' : 'reject');
      
      const status = approved ? 'approved' : 'rejected';
      dispatch({ type: 'UPDATE_APPROVAL_REQUEST', payload: { id: requestId, status } });
      
      toast.success(`Request ${status}`);
    } catch (error) {
      console.error('Error updating approval request:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update approval request' });
      toast.error('Failed to update approval request');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Refresh all data
   */
  const refreshData = async (): Promise<void> => {
    await initializeData();
  };

  /**
   * Connect to WebSocket
   */
  const connectWebSocket = async (): Promise<void> => {
    try {
      await attendanceWebSocket.connect();
      dispatch({ type: 'SET_REAL_TIME_UPDATES', payload: true });
      toast.success('Real-time updates connected');
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      toast.error('Failed to connect to real-time updates');
    }
  };

  /**
   * Disconnect from WebSocket
   */
  const disconnectWebSocket = (): void => {
    attendanceWebSocket.disconnect();
    dispatch({ type: 'SET_REAL_TIME_UPDATES', payload: false });
  };

  const contextValue: AttendanceContextType = {
    state,
    updateAttendanceStatus,
    startBreak,
    endBreak,
    requestApproval,
    approveRequest,
    refreshData,
    connectWebSocket,
    disconnectWebSocket
  };

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  );
};

// ===== HOOK =====

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}; 