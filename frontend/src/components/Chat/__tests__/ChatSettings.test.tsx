import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import ChatSettingsComponent from '../ChatSettings';

// Mock the API service
jest.mock('../../../services/api', () => ({
  getChatSettings: jest.fn(),
  updateChatSettings: jest.fn(),
}));

// Create a wrapper component with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

const mockSettings = {
  id: '1',
  enabled: true,
  fileSharing: {
    enabled: true,
    maxFileSize: 10,
    allowedTypes: ['image', 'document', 'video']
  },
  messageRetention: {
    enabled: true,
    retentionDays: 30,
    autoDelete: true
  },
  helpDesk: {
    enabled: true,
    allowEmployeeCreation: false,
    requireApproval: true,
    categories: ['personnel', 'vmd', 'inventory'],
    priorityLevels: ['low', 'medium', 'high', 'urgent']
  },
  notificationSettings: {
    emailNotifications: true,
    pushNotifications: true,
    soundNotifications: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'UTC'
    }
  },
  createdBy: '1',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('ChatSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockApi = require('../../../services/api');
    mockApi.getChatSettings.mockResolvedValue(mockSettings);
  });

  describe('Component Rendering', () => {
    test('renders chat settings component', async () => {
      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Chat Settings')).toBeInTheDocument();
      });
    });

    test('renders all setting sections', async () => {
      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('General Settings')).toBeInTheDocument();
        expect(screen.getByText('File Sharing Settings')).toBeInTheDocument();
        expect(screen.getByText('Message Retention')).toBeInTheDocument();
        expect(screen.getByText('Help Desk Settings')).toBeInTheDocument();
        expect(screen.getByText('Notification Settings')).toBeInTheDocument();
      });
    });
  });

  describe('General Settings', () => {
    test('toggles chat system enabled', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const enabledToggle = screen.getByLabelText('Enable Chat System');
        fireEvent.click(enabledToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          enabled: false
        });
      });
    });
  });

  describe('File Sharing Settings', () => {
    test('toggles file sharing enabled', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const fileSharingToggle = screen.getByLabelText('Enable File Sharing');
        fireEvent.click(fileSharingToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          fileSharing: {
            ...mockSettings.fileSharing,
            enabled: false
          }
        });
      });
    });

    test('updates max file size', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const maxFileSizeInput = screen.getByLabelText('Maximum File Size (MB)');
        fireEvent.change(maxFileSizeInput, { target: { value: '20' } });
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          fileSharing: {
            ...mockSettings.fileSharing,
            maxFileSize: 20
          }
        });
      });
    });

    test('updates allowed file types', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const imageCheckbox = screen.getByLabelText('Image');
        fireEvent.click(imageCheckbox);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          fileSharing: {
            ...mockSettings.fileSharing,
            allowedTypes: ['document', 'video']
          }
        });
      });
    });
  });

  describe('Message Retention Settings', () => {
    test('toggles message retention enabled', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const retentionToggle = screen.getByLabelText('Enable Message Retention');
        fireEvent.click(retentionToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          messageRetention: {
            ...mockSettings.messageRetention,
            enabled: false
          }
        });
      });
    });

    test('updates retention days', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const retentionDaysInput = screen.getByLabelText('Retention Period (days)');
        fireEvent.change(retentionDaysInput, { target: { value: '60' } });
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          messageRetention: {
            ...mockSettings.messageRetention,
            retentionDays: 60
          }
        });
      });
    });
  });

  describe('Help Desk Settings', () => {
    test('toggles help desk enabled', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const helpDeskToggle = screen.getByLabelText('Enable Help Desk');
        fireEvent.click(helpDeskToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          helpDesk: {
            ...mockSettings.helpDesk,
            enabled: false
          }
        });
      });
    });

    test('toggles employee creation', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const employeeCreationToggle = screen.getByLabelText('Allow Employee Creation');
        fireEvent.click(employeeCreationToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          helpDesk: {
            ...mockSettings.helpDesk,
            allowEmployeeCreation: true
          }
        });
      });
    });

    test('toggles approval requirement', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const approvalToggle = screen.getByLabelText('Require Approval');
        fireEvent.click(approvalToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          helpDesk: {
            ...mockSettings.helpDesk,
            requireApproval: false
          }
        });
      });
    });
  });

  describe('Notification Settings', () => {
    test('toggles email notifications', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const emailToggle = screen.getByLabelText('Email Notifications');
        fireEvent.click(emailToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          notificationSettings: {
            ...mockSettings.notificationSettings,
            emailNotifications: false
          }
        });
      });
    });

    test('toggles push notifications', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const pushToggle = screen.getByLabelText('Push Notifications');
        fireEvent.click(pushToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          notificationSettings: {
            ...mockSettings.notificationSettings,
            pushNotifications: false
          }
        });
      });
    });

    test('toggles sound notifications', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const soundToggle = screen.getByLabelText('Sound Notifications');
        fireEvent.click(soundToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          notificationSettings: {
            ...mockSettings.notificationSettings,
            soundNotifications: false
          }
        });
      });
    });

    test('toggles quiet hours', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const quietHoursToggle = screen.getByLabelText('Enable quiet hours');
        fireEvent.click(quietHoursToggle);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          notificationSettings: {
            ...mockSettings.notificationSettings,
            quietHours: {
              ...mockSettings.notificationSettings.quietHours,
              enabled: true
            }
          }
        });
      });
    });

    test('updates quiet hours time', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const startTimeInput = screen.getByLabelText('Start Time');
        fireEvent.change(startTimeInput, { target: { value: '23:00' } });
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockSettings,
          notificationSettings: {
            ...mockSettings.notificationSettings,
            quietHours: {
              ...mockSettings.notificationSettings.quietHours,
              startTime: '23:00'
            }
          }
        });
      });
    });
  });

  describe('Save Settings', () => {
    test('saves all settings successfully', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const saveButton = screen.getByText('Save Settings');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith(mockSettings);
        expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
      });
    });

    test('handles save error', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockRejectedValue(new Error('Save failed'));

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
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
      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
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
      mockApi.getChatSettings.mockRejectedValue(new Error('API Error'));

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Error loading settings')).toBeInTheDocument();
      });
    });

    test('shows loading state', async () => {
      const mockApi = require('../../../services/api');
      mockApi.getChatSettings.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      expect(screen.getByText('Loading settings...')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    test('validates file size limits', async () => {
      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const maxFileSizeInput = screen.getByLabelText('Maximum File Size (MB)');
        fireEvent.change(maxFileSizeInput, { target: { value: '1000' } });
      });

      expect(screen.getByText('File size must be between 1 and 100 MB')).toBeInTheDocument();
    });

    test('validates retention days', async () => {
      render(
        <TestWrapper>
          <ChatSettingsComponent />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const retentionDaysInput = screen.getByLabelText('Retention Period (days)');
        fireEvent.change(retentionDaysInput, { target: { value: '0' } });
      });

      expect(screen.getByText('Retention period must be between 1 and 365 days')).toBeInTheDocument();
    });
  });
}); 