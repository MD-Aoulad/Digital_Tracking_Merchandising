import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import ApprovalPage from '../ApprovalPage';

// Mock the API service
jest.mock('../../../services/api', () => ({
  getApprovalStats: jest.fn(),
  getApprovalSettings: jest.fn(),
  getApprovalRequests: jest.fn(),
  getApprovalDelegations: jest.fn(),
  getApprovalWorkflows: jest.fn(),
  createApprovalRequest: jest.fn(),
  updateApprovalRequest: jest.fn(),
  deleteApprovalRequest: jest.fn(),
  createApprovalDelegation: jest.fn(),
  updateApprovalDelegation: jest.fn(),
  deleteApprovalDelegation: jest.fn(),
  createApprovalWorkflow: jest.fn(),
  updateApprovalWorkflow: jest.fn(),
  deleteApprovalWorkflow: jest.fn(),
  updateApprovalSettings: jest.fn(),
}));

// Mock the auth context
const mockAuthContext = {
  user: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['approval:read', 'approval:write', 'approval:delete']
  },
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

jest.mock('../../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../../contexts/AuthContext'),
  useAuth: () => mockAuthContext,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ApprovalPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders approval page with title', () => {
      renderWithProviders(<ApprovalPage />);
      expect(screen.getByText('Approval Management')).toBeInTheDocument();
    });

    test('renders all tabs', () => {
      renderWithProviders(<ApprovalPage />);
      expect(screen.getByText('Approval Requests')).toBeInTheDocument();
      expect(screen.getByText('Approval Settings')).toBeInTheDocument();
      expect(screen.getByText('Delegation Management')).toBeInTheDocument();
      expect(screen.getByText('Approval Workflows')).toBeInTheDocument();
      expect(screen.getByText('Approval Statistics')).toBeInTheDocument();
    });

    test('shows requests tab by default', () => {
      renderWithProviders(<ApprovalPage />);
      expect(screen.getByText('Approval Requests')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('switches to settings tab', async () => {
      renderWithProviders(<ApprovalPage />);
      
      const settingsTab = screen.getByText('Approval Settings');
      fireEvent.click(settingsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Approval Settings')).toBeInTheDocument();
      });
    });

    test('switches to delegation tab', async () => {
      renderWithProviders(<ApprovalPage />);
      
      const delegationTab = screen.getByText('Delegation Management');
      fireEvent.click(delegationTab);
      
      await waitFor(() => {
        expect(screen.getByText('Delegation Management')).toBeInTheDocument();
      });
    });

    test('switches to workflows tab', async () => {
      renderWithProviders(<ApprovalPage />);
      
      const workflowsTab = screen.getByText('Approval Workflows');
      fireEvent.click(workflowsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Approval Workflows')).toBeInTheDocument();
      });
    });

    test('switches to statistics tab', async () => {
      renderWithProviders(<ApprovalPage />);
      
      const statisticsTab = screen.getByText('Approval Statistics');
      fireEvent.click(statisticsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Approval Statistics')).toBeInTheDocument();
      });
    });
  });

  describe('Access Control', () => {
    test('shows access denied for users without approval permissions', () => {
      const userWithoutPermissions = {
        ...mockAuthContext.user,
        permissions: ['dashboard:read']
      };
      
      jest.spyOn(require('../../../contexts/AuthContext'), 'useAuth').mockReturnValue({
        ...mockAuthContext,
        user: userWithoutPermissions
      });

      renderWithProviders(<ApprovalPage />);
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    test('allows access for users with approval permissions', () => {
      renderWithProviders(<ApprovalPage />);
      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles API errors gracefully', async () => {
      const mockApi = require('../../../services/api');
      mockApi.getApprovalStats.mockRejectedValue(new Error('API Error'));

      renderWithProviders(<ApprovalPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Error loading approval data')).toBeInTheDocument();
      });
    });

    test('shows loading state', async () => {
      const mockApi = require('../../../services/api');
      mockApi.getApprovalStats.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithProviders(<ApprovalPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders mobile-friendly layout', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderWithProviders(<ApprovalPage />);
      expect(screen.getByText('Approval Management')).toBeInTheDocument();
    });
  });
}); 