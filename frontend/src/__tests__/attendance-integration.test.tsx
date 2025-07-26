/**
 * Attendance System Integration Tests
 * 
 * Tests the integration between attendance components and services
 * to ensure the complete attendance system works as expected.
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
import AttendanceDashboard from '../components/Attendance/AttendanceDashboard';
import ManagerDashboard from '../components/Attendance/ManagerDashboard';

// Mock the API service
jest.mock('../services/api', () => ({
  attendanceAPI: {
    getCurrentStatus: jest.fn().mockResolvedValue({ status: 'out' }),
    getTodaySummary: jest.fn().mockResolvedValue({
      hoursWorked: 0,
      breaks: [],
      overtime: 0,
      status: 'not-started'
    }),
    getTeamStatus: jest.fn().mockResolvedValue([]),
    getPendingApprovals: jest.fn().mockResolvedValue([]),
    punchIn: jest.fn().mockResolvedValue({
      message: 'Successfully clocked in',
      punchInTime: '09:00',
      attendance: {}
    }),
    punchOut: jest.fn().mockResolvedValue({
      message: 'Successfully clocked out',
      punchOutTime: '17:00',
      hoursWorked: 8,
      attendance: {}
    }),
    startBreak: jest.fn().mockResolvedValue({ message: 'Break started' }),
    endBreak: jest.fn().mockResolvedValue({ message: 'Break ended' }),
    requestApproval: jest.fn().mockResolvedValue({ message: 'Approval requested' }),
    approveRequest: jest.fn().mockResolvedValue({ message: 'Request approved' }),
    getAttendanceReports: jest.fn().mockResolvedValue([]),
    exportReport: jest.fn().mockResolvedValue(new Blob())
  }
}));

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

describe('Attendance System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AttendancePage Component', () => {
    it('should render attendance page with all main sections', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Check for main sections
      expect(screen.getByText('attendance.title')).toBeInTheDocument();
      expect(screen.getByText('attendance.description')).toBeInTheDocument();
      
      // Check for statistics cards
      expect(screen.getByText('attendance.attendanceRate')).toBeInTheDocument();
      expect(screen.getByText('attendance.avgWorkHours')).toBeInTheDocument();
      expect(screen.getByText('attendance.overtimeHours')).toBeInTheDocument();
      expect(screen.getByText('attendance.presentToday')).toBeInTheDocument();

      // Check for clock in/out section
      expect(screen.getByText('attendance.personal')).toBeInTheDocument();
      expect(screen.getByText('attendance.team')).toBeInTheDocument();
    });

    it('should handle view mode toggle', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      const teamButton = screen.getByText('attendance.team');
      fireEvent.click(teamButton);

      // Should show team view
      expect(teamButton).toHaveClass('bg-white');
    });

    it('should display real-time clock', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Check for clock display (should show current time)
      const clockElement = screen.getByText(/\d{2}:\d{2}:\d{2}/);
      expect(clockElement).toBeInTheDocument();
    });
  });

  describe('AttendanceDashboard Component', () => {
    it('should render dashboard with real-time updates', async () => {
      render(
        <TestWrapper>
          <AttendanceDashboard />
        </TestWrapper>
      );

      // Check for dashboard elements
      expect(screen.getByText('attendance.title')).toBeInTheDocument();
      
      // Check for connection status
      await waitFor(() => {
        expect(screen.getByText('connected')).toBeInTheDocument();
      });
    });

    it('should handle quick actions', async () => {
      render(
        <TestWrapper>
          <AttendanceDashboard />
        </TestWrapper>
      );

      // Check for quick action buttons
      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('ManagerDashboard Component', () => {
    it('should render manager interface', async () => {
      render(
        <TestWrapper>
          <ManagerDashboard />
        </TestWrapper>
      );

      // Check for manager-specific elements
      expect(screen.getByText('attendance.title')).toBeInTheDocument();
      
      // Check for tabs
      expect(screen.getByText('overview')).toBeInTheDocument();
      expect(screen.getByText('team')).toBeInTheDocument();
      expect(screen.getByText('approvals')).toBeInTheDocument();
      expect(screen.getByText('analytics')).toBeInTheDocument();
    });

    it('should handle tab switching', async () => {
      render(
        <TestWrapper>
          <ManagerDashboard />
        </TestWrapper>
      );

      const teamTab = screen.getByText('team');
      fireEvent.click(teamTab);

      // Should show team tab as active
      expect(teamTab).toHaveClass('bg-white');
    });
  });

  describe('Attendance Context Integration', () => {
    it('should provide attendance state to components', async () => {
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // The component should be able to access attendance context
      // without throwing errors
      await waitFor(() => {
        expect(screen.getByText('attendance.title')).toBeInTheDocument();
      });
    });

    it('should handle WebSocket connection status', async () => {
      render(
        <TestWrapper>
          <AttendanceDashboard />
        </TestWrapper>
      );

      // Should show connection status
      await waitFor(() => {
        expect(screen.getByText('connected')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call API methods when actions are performed', async () => {
      const { attendanceAPI } = require('../services/api');
      
      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Wait for initial API calls
      await waitFor(() => {
        expect(attendanceAPI.getCurrentStatus).toHaveBeenCalled();
        expect(attendanceAPI.getTodaySummary).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { attendanceAPI } = require('../services/api');
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
  });

  describe('Mobile Responsiveness', () => {
    it('should render properly on mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <AttendancePage />
        </TestWrapper>
      );

      // Should render without errors on mobile
      await waitFor(() => {
        expect(screen.getByText('attendance.title')).toBeInTheDocument();
      });
    });
  });
}); 