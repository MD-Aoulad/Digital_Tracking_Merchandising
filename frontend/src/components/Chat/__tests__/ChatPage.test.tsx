import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import ChatPage from '../ChatPage';
import * as chatApiModule from '../../../services/chatApi';

// Mock the API service
jest.mock('../../../services/api', () => ({
  getChatSettings: jest.fn(),
  updateChatSettings: jest.fn(),
  getChatChannels: jest.fn(),
  createChatChannel: jest.fn(),
  getChatMessages: jest.fn(),
  sendChatMessage: jest.fn(),
  getHelpDeskChannels: jest.fn(),
  getHelpDeskRequests: jest.fn(),
  createHelpDeskRequest: jest.fn(),
  sendHelpDeskMessage: jest.fn(),
}));

// Mock the auth context
const mockAuthContext = {
  user: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['chat:read', 'chat:write', 'chat:admin']
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

const mockChatSettings = {
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
  }
};

const mockChannels = [
  {
    id: '1',
    name: 'General',
    description: 'General discussion channel',
    type: 'public',
    members: ['1', '2', '3'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockMessages = [
  {
    id: '1',
    channelId: '1',
    senderId: '1',
    senderName: 'John Doe',
    content: 'Hello everyone!',
    type: 'text',
    timestamp: '2024-01-01T00:00:00Z',
    attachments: [],
    reactions: []
  }
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockApi = require('../../../services/api');
    mockApi.getChatSettings.mockResolvedValue(mockChatSettings);
    mockApi.getChatChannels.mockResolvedValue(mockChannels);
    mockApi.getChatMessages.mockResolvedValue(mockMessages);
  });

  describe('Component Rendering', () => {
    test('renders chat page with title', async () => {
      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        expect(screen.getByText('ShapleChat')).toBeInTheDocument();
      });
    });

    test('renders both tabs', async () => {
      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Business Messenger')).toBeInTheDocument();
        expect(screen.getByText('Help Desk')).toBeInTheDocument();
      });
    });

    test('shows business messenger tab by default', async () => {
      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Channels')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    test('switches to help desk tab', async () => {
      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        const helpDeskTab = screen.getByText('Help Desk');
        fireEvent.click(helpDeskTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Help Desk Requests')).toBeInTheDocument();
      });
    });
  });

  describe('Business Messenger', () => {
    test('displays channels list', async () => {
      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        expect(screen.getByText('General')).toBeInTheDocument();
        expect(screen.getByText('General discussion channel')).toBeInTheDocument();
      });
    });

    test('creates new channel', async () => {
      const mockApi = require('../../../services/api');
      mockApi.createChatChannel.mockResolvedValue({ success: true });

      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        const createButton = screen.getByText('Create Channel');
        fireEvent.click(createButton);
      });

      // Fill form
      fireEvent.change(screen.getByLabelText('Channel Name'), { target: { value: 'New Channel' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New channel description' } });
      fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'public' } });

      // Submit form
      fireEvent.click(screen.getByText('Create Channel'));

      await waitFor(() => {
        expect(mockApi.createChatChannel).toHaveBeenCalledWith({
          name: 'New Channel',
          description: 'New channel description',
          type: 'public'
        });
      });
    });

    test('sends message', async () => {
      const mockApi = require('../../../services/api');
      mockApi.sendChatMessage.mockResolvedValue({ success: true });

      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(messageInput, { target: { value: 'Hello world!' } });
        fireEvent.click(screen.getByText('Send'));
      });

      await waitFor(() => {
        expect(mockApi.sendChatMessage).toHaveBeenCalledWith('1', {
          content: 'Hello world!',
          type: 'text'
        });
      });
    });

    test('uploads file', async () => {
      const mockApi = require('../../../services/api');
      mockApi.sendChatMessage.mockResolvedValue({ success: true });

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        const fileInput = screen.getByLabelText('Upload file');
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(mockApi.sendChatMessage).toHaveBeenCalledWith('1', {
          content: '',
          type: 'file',
          attachments: [file]
        });
      });
    });
  });

  describe('Help Desk', () => {
    test('displays help desk requests', async () => {
      const mockApi = require('../../../services/api');
      mockApi.getHelpDeskRequests.mockResolvedValue([
        {
          id: '1',
          title: 'Help Request',
          description: 'Need help with something',
          category: 'personnel',
          priority: 'medium',
          status: 'open',
          requesterId: '1',
          requesterName: 'John Doe',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]);

      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        const helpDeskTab = screen.getByText('Help Desk');
        fireEvent.click(helpDeskTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Help Request')).toBeInTheDocument();
        expect(screen.getByText('Need help with something')).toBeInTheDocument();
      });
    });

    test('creates help desk request', async () => {
      const mockApi = require('../../../services/api');
      mockApi.createHelpDeskRequest.mockResolvedValue({ success: true });

      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        const helpDeskTab = screen.getByText('Help Desk');
        fireEvent.click(helpDeskTab);
      });

      await waitFor(() => {
        const createButton = screen.getByText('Create Request');
        fireEvent.click(createButton);
      });

      // Fill form
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Help Request' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Need assistance' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'personnel' } });
      fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'high' } });

      // Submit form
      fireEvent.click(screen.getByText('Submit Request'));

      await waitFor(() => {
        expect(mockApi.createHelpDeskRequest).toHaveBeenCalledWith({
          title: 'New Help Request',
          description: 'Need assistance',
          category: 'personnel',
          priority: 'high'
        });
      });
    });
  });

  describe('Chat Settings', () => {
    test('opens settings modal', async () => {
      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        const settingsButton = screen.getByText('Settings');
        fireEvent.click(settingsButton);
      });

      expect(screen.getByText('Chat Settings')).toBeInTheDocument();
    });

    test('updates chat settings', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateChatSettings.mockResolvedValue({ success: true });

      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        const settingsButton = screen.getByText('Settings');
        fireEvent.click(settingsButton);
      });

      // Toggle file sharing
      const fileSharingToggle = screen.getByLabelText('Enable File Sharing');
      fireEvent.click(fileSharingToggle);

      // Save settings
      fireEvent.click(screen.getByText('Save Settings'));

      await waitFor(() => {
        expect(mockApi.updateChatSettings).toHaveBeenCalledWith({
          ...mockChatSettings,
          fileSharing: {
            ...mockChatSettings.fileSharing,
            enabled: false
          }
        });
      });
    });
  });

  describe('Access Control', () => {
    test('shows access denied for users without chat permissions', () => {
      const userWithoutPermissions = {
        ...mockAuthContext.user,
        permissions: ['dashboard:read']
      };
      
      jest.spyOn(require('../../../contexts/AuthContext'), 'useAuth').mockReturnValue({
        ...mockAuthContext,
        user: userWithoutPermissions
      });

      renderWithProviders(<ChatPage />);
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    test('allows access for users with chat permissions', async () => {
      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API errors gracefully', async () => {
      const mockApi = require('../../../services/api');
      mockApi.getChatSettings.mockRejectedValue(new Error('API Error'));

      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Error loading chat data')).toBeInTheDocument();
      });
    });

    test('shows loading state', async () => {
      const mockApi = require('../../../services/api');
      mockApi.getChatSettings.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithProviders(<ChatPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Real-time Features', () => {
    test('handles real-time message updates', async () => {
      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
      });
    });

    test('handles typing indicators', async () => {
      renderWithProviders(<ChatPage />);
      
      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(messageInput, { target: { value: 'Typing...' } });
      });

      // Should show typing indicator
      expect(screen.getByText('Typing...')).toBeInTheDocument();
    });
  });

  it('displays user activity when API returns data', async () => {
    jest.spyOn(chatApiModule.analyticsApi, 'getUserActivity').mockResolvedValueOnce([
      {
        messages_sent: 5,
        messages_read: 10,
        reactions_given: 2,
        files_shared: 1,
        time_spent_minutes: 15
      }
    ]);
    renderWithProviders(<BrowserRouter><ChatPage /></BrowserRouter>);
    // Simulate selecting a channel
    // (You may need to trigger channel selection depending on implementation)
    await waitFor(() => {
      expect(screen.getByText(/User Activity/)).toBeInTheDocument();
      expect(screen.getByText(/Messages Sent: 5/)).toBeInTheDocument();
      expect(screen.getByText(/Messages Read: 10/)).toBeInTheDocument();
      expect(screen.getByText(/Reactions: 2/)).toBeInTheDocument();
      expect(screen.getByText(/Files Shared: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Time Spent: 15 min/)).toBeInTheDocument();
    });
  });
}); 