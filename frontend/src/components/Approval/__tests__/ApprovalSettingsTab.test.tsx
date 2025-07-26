import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import ApprovalSettingsTab from '../ApprovalSettingsTab';

// Mock the API service
jest.mock('../../../services/api', () => ({
  getApprovalSettings: jest.fn(),
  updateApprovalSettings: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockSettings = {
  general: {
    enabled: true,
    requireApproval: true,
    autoApprove: false,
    maxApprovers: 2,
    approvalTimeout: 7
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notifyOnPending: true,
    notifyOnApproved: true,
    notifyOnRejected: true
  },
  permissions: {
    allowSelfApproval: false,
    allowDelegation: true,
    requireManagerApproval: true,
    allowBulkApproval: false
  },
  workflow: {
    enableSequentialApproval: true,
    enableParallelApproval: false,
    requireAllApprovers: true,
    allowOverride: false
  }
};

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

describe('ApprovalSettingsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockApi = require('../../../services/api');
    mockApi.getApprovalSettings.mockResolvedValue(mockSettings);
  });

  describe('Component Rendering', () => {
    test('renders approval settings tab', async () => {
      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        expect(screen.getByText('Approval Settings')).toBeInTheDocument();
      });
    });

    test('renders all setting sections', async () => {
      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        expect(screen.getByText('General Settings')).toBeInTheDocument();
        expect(screen.getByText('Notification Settings')).toBeInTheDocument();
        expect(screen.getByText('Permission Settings')).toBeInTheDocument();
        expect(screen.getByText('Workflow Settings')).toBeInTheDocument();
      });
    });
  });

  describe('General Settings', () => {
    test('toggles approval system enabled', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const enabledToggle = screen.getByLabelText('Enable Approval System');
        fireEvent.click(enabledToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateApprovalSettings).toHaveBeenCalledWith({
          general: {
            ...mockSettings.general,
            enabled: false
          }
        });
      });
    });

    test('updates max approvers', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const maxApproversInput = screen.getByLabelText('Maximum Approvers');
        fireEvent.change(maxApproversInput, { target: { value: '5' } });
      });

      await waitFor(() => {
        expect(mockApi.updateApprovalSettings).toHaveBeenCalledWith({
          general: {
            ...mockSettings.general,
            maxApprovers: 5
          }
        });
      });
    });

    test('updates approval timeout', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const timeoutInput = screen.getByLabelText('Approval Timeout (days)');
        fireEvent.change(timeoutInput, { target: { value: '14' } });
      });

      await waitFor(() => {
        expect(mockApi.updateApprovalSettings).toHaveBeenCalledWith({
          general: {
            ...mockSettings.general,
            approvalTimeout: 14
          }
        });
      });
    });
  });

  describe('Notification Settings', () => {
    test('toggles email notifications', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const emailToggle = screen.getByLabelText('Email Notifications');
        fireEvent.click(emailToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateApprovalSettings).toHaveBeenCalledWith({
          notifications: {
            ...mockSettings.notifications,
            emailNotifications: false
          }
        });
      });
    });

    test('toggles push notifications', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const pushToggle = screen.getByLabelText('Push Notifications');
        fireEvent.click(pushToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateApprovalSettings).toHaveBeenCalledWith({
          notifications: {
            ...mockSettings.notifications,
            pushNotifications: false
          }
        });
      });
    });

    test('toggles SMS notifications', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const smsToggle = screen.getByLabelText('SMS Notifications');
        fireEvent.click(smsToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateApprovalSettings).toHaveBeenCalledWith({
          notifications: {
            ...mockSettings.notifications,
            smsNotifications: true
          }
        });
      });
    });
  });

  describe('Permission Settings', () => {
    test('toggles self approval', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const selfApprovalToggle = screen.getByLabelText('Allow Self Approval');
        fireEvent.click(selfApprovalToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateApprovalSettings).toHaveBeenCalledWith({
          permissions: {
            ...mockSettings.permissions,
            allowSelfApproval: true
          }
        });
      });
    });

    test('toggles delegation', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const delegationToggle = screen.getByLabelText('Allow Delegation');
        fireEvent.click(delegationToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateApprovalSettings).toHaveBeenCalledWith({
          permissions: {
            ...mockSettings.permissions,
            allowDelegation: false
          }
        });
      });
    });
  });

  describe('Workflow Settings', () => {
    test('toggles sequential approval', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const sequentialToggle = screen.getByLabelText('Enable Sequential Approval');
        fireEvent.click(sequentialToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateApprovalSettings).toHaveBeenCalledWith({
          workflow: {
            ...mockSettings.workflow,
            enableSequentialApproval: false
          }
        });
      });
    });

    test('toggles parallel approval', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const parallelToggle = screen.getByLabelText('Enable Parallel Approval');
        fireEvent.click(parallelToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateApprovalSettings).toHaveBeenCalledWith({
          workflow: {
            ...mockSettings.workflow,
            enableParallelApproval: true
          }
        });
      });
    });
  });

  describe('Save Settings', () => {
    test('saves all settings successfully', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const saveButton = screen.getByText('Save Settings');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockApi.updateApprovalSettings).toHaveBeenCalledWith(mockSettings);
        expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
      });
    });

    test('handles save error', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateApprovalSettings.mockRejectedValue(new Error('Save failed'));

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const saveButton = screen.getByText('Save Settings');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Error saving settings')).toBeInTheDocument();
      });
    });
  });

  describe('Reset Settings', () => {
    test('resets settings to defaults', async () => {
      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        const resetButton = screen.getByText('Reset to Defaults');
        fireEvent.click(resetButton);
      });

      // Confirm reset
      fireEvent.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(screen.getByText('Settings reset to defaults')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API errors', async () => {
      const mockApi = require('../../../services/api');
      mockApi.getApprovalSettings.mockRejectedValue(new Error('API Error'));

      renderWithProviders(<ApprovalSettingsTab />);
      
      await waitFor(() => {
        expect(screen.getByText('Error loading settings')).toBeInTheDocument();
      });
    });

    test('shows loading state', async () => {
      const mockApi = require('../../../services/api');
      mockApi.getApprovalSettings.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithProviders(<ApprovalSettingsTab />);
      expect(screen.getByText('Loading settings...')).toBeInTheDocument();
    });
  });
}); 