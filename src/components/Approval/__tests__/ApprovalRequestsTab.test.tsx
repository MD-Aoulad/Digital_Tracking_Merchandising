import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ApprovalRequestsTab from '../ApprovalRequestsTab';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
      department: 'IT',
      position: 'System Administrator',
      phone: '+1234567890'
    },
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    hasPermission: jest.fn().mockReturnValue(true),
    error: null,
    clearError: jest.fn(),
    sessionTimeout: 30,
    resetSessionTimer: jest.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the API service
jest.mock('../../../services/api', () => ({
  getApprovalRequests: jest.fn(),
  createApprovalRequest: jest.fn(),
  updateApprovalRequest: jest.fn(),
  deleteApprovalRequest: jest.fn(),
  approveRequest: jest.fn(),
  rejectRequest: jest.fn()
}));

// Create a wrapper component with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('ApprovalRequestsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Component Rendering', () => {
    test('renders refresh button', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <TestWrapper>
          <ApprovalRequestsTab />
        </TestWrapper>
      );
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
      });
    });

    test('renders filters', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <TestWrapper>
          <ApprovalRequestsTab />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('View Mode')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Request Type')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
      });
    });

    test('renders empty state when no requests', async () => {
      // Mock successful API response with empty array
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <TestWrapper>
          <ApprovalRequestsTab />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('No requests found')).toBeInTheDocument();
        expect(screen.getByText('There are no approval requests to display.')).toBeInTheDocument();
      });
    });
  });

  describe('Request Management', () => {
    test('displays requests in list', async () => {
      const mockRequests = [
        {
          id: '1',
          title: 'Test Request',
          description: 'Test Description',
          type: 'leave_request',
          status: 'pending',
          requesterId: '1',
          requesterName: 'Test User',
          submittedAt: '2024-01-01T00:00:00Z',
          priority: 'medium',
          workflow: {
            id: '1',
            name: 'Leave Request Workflow',
            steps: []
          }
        }
      ];
      
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRequests
      });
      
      render(
        <TestWrapper>
          <ApprovalRequestsTab />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Request')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    test('filters requests by status', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <TestWrapper>
          <ApprovalRequestsTab />
        </TestWrapper>
      );
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Status')).toBeInTheDocument();
      });
      
      const statusFilter = screen.getByDisplayValue('All Statuses');
      fireEvent.change(statusFilter, { target: { value: 'approved' } });
      
      expect(statusFilter).toHaveValue('approved');
    });

    test('filters requests by type', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <TestWrapper>
          <ApprovalRequestsTab />
        </TestWrapper>
      );
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Request Type')).toBeInTheDocument();
      });
      
      const typeFilter = screen.getByDisplayValue('All Types');
      fireEvent.change(typeFilter, { target: { value: 'leave_request' } });
      
      expect(typeFilter).toHaveValue('leave_request');
    });

    test('searches requests', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <TestWrapper>
          <ApprovalRequestsTab />
        </TestWrapper>
      );
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search requests...')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search requests...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      
      expect(searchInput).toHaveValue('test search');
    });

    test('refreshes requests list', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <TestWrapper>
          <ApprovalRequestsTab />
        </TestWrapper>
      );
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
      });
      
      const refreshButton = screen.getByText('🔄 Refresh');
      fireEvent.click(refreshButton);
      
      // Verify fetch was called again
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    test('handles API errors', async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      render(
        <TestWrapper>
          <ApprovalRequestsTab />
        </TestWrapper>
      );
      
      // Wait for loading to complete (should show empty state)
      await waitFor(() => {
        expect(screen.getByText('No requests found')).toBeInTheDocument();
      });
    });
  });
}); 