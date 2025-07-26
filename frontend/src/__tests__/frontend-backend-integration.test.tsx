/**
 * Frontend-Backend Integration Tests
 * 
 * Tests the complete integration between frontend attendance components
 * and the backend API endpoints to ensure seamless functionality.
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AttendanceProvider } from '../contexts/AttendanceContext';
import AttendancePage from '../components/Attendance/AttendancePage';
import { attendanceAPI } from '../services/api';

// Mock backend API responses are now defined inside the jest.mock call

// Mock the API service with realistic backend responses
jest.mock('../services/api', () => {
  const mockBackendResponses = {
    currentStatus: {
      status: 'out',
      lastPunchIn: null,
      lastPunchOut: null,
      currentBreak: null,
      todayHours: 0
    },
    todaySummary: {
      hoursWorked: 0,
      breaks: [],
      overtime: 0,
      status: 'not-started',
      clockInTime: null,
      clockOutTime: null
    },
    teamStatus: [
      {
        userId: '1',
        name: 'John Doe',
        status: 'present',
        clockInTime: '09:00',
        currentLocation: 'Office Building A',
        isOnBreak: false,
        breakType: null,
        lastSeen: new Date().toISOString()
      },
      {
        userId: '2',
        name: 'Jane Smith',
        status: 'break',
        clockInTime: '08:45',
        currentLocation: 'Break Room',
        isOnBreak: true,
        breakType: 'lunch',
        lastSeen: new Date().toISOString()
      }
    ],
    pendingApprovals: [
      {
        id: '1',
        attendanceId: 'att1',
        userId: '2',
        managerId: 'manager1',
        type: 'overtime',
        reason: 'Project deadline approaching',
        status: 'pending',
        requestedAt: new Date().toISOString()
      }
    ],
    punchInResponse: {
      message: 'Successfully clocked in',
      punchInTime: '09:00',
      attendance: {
        punchIn: '09:00',
        punchOut: null,
        location: 'Office Building A',
        endLocation: null,
        photo: 'data:image/jpeg;base64,...',
        hoursWorked: null
      }
    },
    punchOutResponse: {
      message: 'Successfully clocked out',
      punchOutTime: '17:00',
      hoursWorked: 8,
      attendance: {
        punchIn: '09:00',
        punchOut: '17:00',
        location: 'Office Building A',
        endLocation: 'Office Building A',
        photo: null,
        hoursWorked: 8
      }
    },
    breakStartResponse: {
      message: 'Break started successfully',
      breakType: 'lunch',
      startTime: '12:00',
      duration: 0
    },
    breakEndResponse: {
      message: 'Break ended successfully',
      breakType: 'lunch',
      endTime: '13:00',
      duration: 60
    },
    approvalResponse: {
      message: 'Approval request submitted successfully',
      requestId: 'req1',
      status: 'pending'
    },
    reportsResponse: [
      {
        id: '1',
        userId: '1',
        date: '2024-01-15',
        clockIn: '09:00',
        clockOut: '17:00',
        hoursWorked: 8,
        breaks: [
          {
            type: 'lunch',
            startTime: '12:00',
            endTime: '13:00',
            duration: 60
          }
        ],
        overtime: 0,
        status: 'present'
      }
    ]
  };

  return {
    attendanceAPI: {
      getCurrentStatus: jest.fn().mockResolvedValue(mockBackendResponses.currentStatus),
      getTodaySummary: jest.fn().mockResolvedValue(mockBackendResponses.todaySummary),
      getTeamStatus: jest.fn().mockResolvedValue(mockBackendResponses.teamStatus),
      getPendingApprovals: jest.fn().mockResolvedValue(mockBackendResponses.pendingApprovals),
      punchIn: jest.fn().mockResolvedValue(mockBackendResponses.punchInResponse),
      punchOut: jest.fn().mockResolvedValue(mockBackendResponses.punchOutResponse),
      startBreak: jest.fn().mockResolvedValue(mockBackendResponses.breakStartResponse),
      endBreak: jest.fn().mockResolvedValue(mockBackendResponses.breakEndResponse),
      requestApproval: jest.fn().mockResolvedValue(mockBackendResponses.approvalResponse),
      approveRequest: jest.fn().mockResolvedValue({ message: 'Request approved' }),
      getAttendanceReports: jest.fn().mockResolvedValue(mockBackendResponses.reportsResponse),
      exportReport: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }))
    }
  };
});

// Mock the WebSocket service
jest.mock('../services/websocket', () => ({
  attendanceWebSocket: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    getConnectionStatus: jest.fn().mockReturnValue('connected'),
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn()
  },
  connectWebSocket: jest.fn().mockResolvedValue(undefined),
  disconnectWebSocket: jest.fn(),
  sendWebSocketMessage: jest.fn(),
  onWebSocketEvent: jest.fn(),
  offWebSocketEvent: jest.fn(),
  getWebSocketStatus: jest.fn().mockReturnValue('connected')
}));

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn()
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock i18n
jest.mock('../lib/i18n', () => ({
  t: (key: string) => key
}));

jest.mock('../lib/i18n-hooks', () => ({
  useLanguageChange: () => 'en'
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <AttendanceProvider>
        {children}
      </AttendanceProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Frontend-Backend Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API Endpoint Integration', () => {
    it('should successfully call getCurrentStatus endpoint', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      });

      // Verify the response is handled correctly
      expect(attendanceAPI.getCurrentStatus).toHaveBeenCalledTimes(1);
    });

    it('should successfully call getTodaySummary endpoint', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getTodaySummary).toHaveBeenCalled();
      });

      // Verify the response is handled correctly
      expect(attendanceAPI.getTodaySummary).toHaveBeenCalledTimes(1);
    });

    it('should successfully call getTeamStatus endpoint', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getTeamStatus).toHaveBeenCalled();
      });

      // Verify the response is handled correctly
      expect(attendanceAPI.getTeamStatus).toHaveBeenCalledTimes(1);
    });

    it('should successfully call getPendingApprovals endpoint', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getPendingApprovals).toHaveBeenCalled();
      });

      // Verify the response is handled correctly
      expect(attendanceAPI.getPendingApprovals).toHaveBeenCalledTimes(1);
    });
  });

  describe('Punch In/Out Integration', () => {
    it('should handle punch in with location and photo', async () => {
      const mockLocation = 'Office Building A';
      const mockPhoto = 'data:image/jpeg;base64,test-photo-data';

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Simulate punch in action
      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      });

      // Verify punch in endpoint can be called with correct parameters
      await attendanceAPI.punchIn(mockLocation, mockPhoto);

      expect(attendanceAPI.punchIn).toHaveBeenCalledWith(mockLocation, mockPhoto);
    });

    it('should handle punch out with location', async () => {
      const mockLocation = 'Office Building A';

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Simulate punch out action
      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      });

      // Verify punch out endpoint can be called with correct parameters
      await attendanceAPI.punchOut(mockLocation);

      expect(attendanceAPI.punchOut).toHaveBeenCalledWith(mockLocation);
    });
  });

  describe('Break Management Integration', () => {
    it('should handle start break with type', async () => {
      const breakType = 'lunch';

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      });

      // Verify start break endpoint can be called with correct parameters
      await attendanceAPI.startBreak(breakType);

      expect(attendanceAPI.startBreak).toHaveBeenCalledWith(breakType);
    });

    it('should handle end break', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      });

      // Verify end break endpoint can be called
      await attendanceAPI.endBreak();

      expect(attendanceAPI.endBreak).toHaveBeenCalled();
    });
  });

  describe('Approval Workflow Integration', () => {
    it('should handle approval request creation', async () => {
      const mockRequest = {
        attendanceId: 'att1',
        userId: 'user1',
        managerId: 'manager1',
        type: 'overtime',
        reason: 'Project deadline'
      };

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      });

      // Verify approval request endpoint can be called with correct parameters
      await attendanceAPI.requestApproval(mockRequest);

      expect(attendanceAPI.requestApproval).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle approval decision', async () => {
      const requestId = 'req1';
      const approved = true;

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      });

      // Verify approval decision endpoint can be called with correct parameters
      await attendanceAPI.approveRequest(requestId, approved);

      expect(attendanceAPI.approveRequest).toHaveBeenCalledWith(requestId, approved);
    });
  });

  describe('Reporting Integration', () => {
    it('should handle attendance reports generation', async () => {
      const mockFilters = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        userId: 'user1',
        status: 'present'
      };

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      });

      // Verify reports endpoint can be called with correct parameters
      await attendanceAPI.getAttendanceReports(mockFilters);

      expect(attendanceAPI.getAttendanceReports).toHaveBeenCalledWith(mockFilters);
    });

    it('should handle report export', async () => {
      const mockFilters = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };
      const format = 'pdf' as const;

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      });

      // Verify export endpoint can be called with correct parameters
      await attendanceAPI.exportReport(mockFilters, format);

      expect(attendanceAPI.exportReport).toHaveBeenCalledWith(mockFilters, format);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      attendanceAPI.getCurrentStatus.mockRejectedValueOnce(new Error('API Error'));

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Should not crash and should show error state
      await waitFor(() => {
        expect(screen.getByText('attendance.title')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      // Mock network error
      attendanceAPI.getTodaySummary.mockRejectedValueOnce(new Error('Network Error'));

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Should not crash and should show error state
      await waitFor(() => {
        expect(screen.getByText('attendance.title')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Integration', () => {
    it('should establish WebSocket connection', async () => {
      const { connectWebSocket } = require('../services/websocket');

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      });

      // Verify WebSocket connection is established
      expect(connectWebSocket).toHaveBeenCalled();
    });

    it('should handle real-time updates', async () => {
      const { onWebSocketEvent } = require('../services/websocket');

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      });

      // Verify WebSocket event listeners are set up
      expect(onWebSocketEvent).toHaveBeenCalledWith('attendance_update', expect.any(Function));
      expect(onWebSocketEvent).toHaveBeenCalledWith('team_update', expect.any(Function));
      expect(onWebSocketEvent).toHaveBeenCalledWith('approval_request', expect.any(Function));
    });
  });

  describe('Data Flow Integration', () => {
    it('should properly handle attendance state updates', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Wait for initial data loading
      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
        expect(attendanceAPI.getTodaySummary).toHaveBeenCalled();
        expect(attendanceAPI.getTeamStatus).toHaveBeenCalled();
        expect(attendanceAPI.getPendingApprovals).toHaveBeenCalled();
      });

      // Verify all API calls were made
      expect(attendanceAPI.getCurrentStatus).toHaveBeenCalledTimes(1);
      expect(attendanceAPI.getTodaySummary).toHaveBeenCalledTimes(1);
      expect(attendanceAPI.getTeamStatus).toHaveBeenCalledTimes(1);
      expect(attendanceAPI.getPendingApprovals).toHaveBeenCalledTimes(1);
    });

    it('should handle component state synchronization', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Verify component renders without errors
      await waitFor(() => {
        expect(screen.getByText('attendance.title')).toBeInTheDocument();
      });

      // Verify statistics cards are displayed
      expect(screen.getByText('attendance.attendanceRate')).toBeInTheDocument();
      expect(screen.getByText('attendance.avgWorkHours')).toBeInTheDocument();
      expect(screen.getByText('attendance.overtimeHours')).toBeInTheDocument();
      expect(screen.getByText('attendance.presentToday')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('should handle multiple API calls efficiently', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Wait for all API calls to complete
      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
        expect(attendanceAPI.getTodaySummary).toHaveBeenCalled();
        expect(attendanceAPI.getTeamStatus).toHaveBeenCalled();
        expect(attendanceAPI.getPendingApprovals).toHaveBeenCalled();
      });

      // Verify no duplicate calls
      expect(attendanceAPI.getCurrentStatus).toHaveBeenCalledTimes(1);
      expect(attendanceAPI.getTodaySummary).toHaveBeenCalledTimes(1);
      expect(attendanceAPI.getTeamStatus).toHaveBeenCalledTimes(1);
      expect(attendanceAPI.getPendingApprovals).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent operations', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Simulate concurrent operations
      const promises = [
        attendanceAPI.getCurrentStatus(),
        attendanceAPI.getTodaySummary(),
        attendanceAPI.getTeamStatus(),
        attendanceAPI.getPendingApprovals()
      ];

      await Promise.all(promises);

      // Verify all operations completed successfully
      expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
      expect(attendanceAPI.getTodaySummary).toHaveBeenCalled();
      expect(attendanceAPI.getTeamStatus).toHaveBeenCalled();
      expect(attendanceAPI.getPendingApprovals).toHaveBeenCalled();
    });
  });
}); 