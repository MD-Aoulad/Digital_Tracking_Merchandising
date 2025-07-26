import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import HelpDeskPage from '../HelpDeskPage';

// Mock the API service
jest.mock('../../../services/api', () => ({
  getHelpDeskChannels: jest.fn(),
  getHelpDeskRequests: jest.fn(),
  createHelpDeskRequest: jest.fn(),
  sendHelpDeskMessage: jest.fn(),
  updateHelpDeskRequest: jest.fn(),
}));

// Mock the auth context
const mockAuthContext = {
  user: {
    id: '1',
    username: 'employee',
    email: 'employee@example.com',
    role: 'employee',
    permissions: ['helpdesk:read', 'helpdesk:write']
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

const mockHelpDeskChannels = [
  {
    id: '1',
    name: 'Personnel Manager',
    description: 'Contact for vacation/annual leave, HR issues, and personnel matters',
    category: 'personnel',
    assignedManagers: ['1'],
    contactPersons: ['1'],
    topics: ['Vacation Request', 'Annual Leave', 'HR Issues', 'Benefits'],
    responseTime: '24h',
    availability: '9:00 AM - 5:00 PM'
  }
];

const mockHelpDeskRequests = [
  {
    id: '1',
    title: 'Annual Leave Request',
    description: 'I would like to request annual leave for the week of March 15-19, 2024.',
    category: 'personnel',
    priority: 'medium',
    status: 'open',
    requesterId: '1',
    requesterName: 'John Doe',
    assignedTo: '2',
    assignedToName: 'Manager Name',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    messages: [
      {
        id: '1',
        requestId: '1',
        senderId: '1',
        senderName: 'John Doe',
        content: 'Initial request',
        timestamp: '2024-01-01T00:00:00Z'
      }
    ]
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

describe('HelpDeskPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockApi = require('../../../services/api');
    mockApi.getHelpDeskChannels.mockResolvedValue(mockHelpDeskChannels);
    mockApi.getHelpDeskRequests.mockResolvedValue(mockHelpDeskRequests);
  });

  describe('Component Rendering', () => {
    test('renders help desk page with title', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Help Desk')).toBeInTheDocument();
      });
    });

    test('renders help desk channels', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Personnel Manager')).toBeInTheDocument();
        expect(screen.getByText('Contact for vacation/annual leave, HR issues, and personnel matters')).toBeInTheDocument();
      });
    });

    test('renders help desk requests', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Annual Leave Request')).toBeInTheDocument();
        expect(screen.getByText('I would like to request annual leave for the week of March 15-19, 2024.')).toBeInTheDocument();
      });
    });
  });

  describe('Help Desk Channels', () => {
    test('displays channel information', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Personnel Manager')).toBeInTheDocument();
        expect(screen.getByText('personnel')).toBeInTheDocument();
        expect(screen.getByText('24h')).toBeInTheDocument();
        expect(screen.getByText('9:00 AM - 5:00 PM')).toBeInTheDocument();
      });
    });

    test('shows channel topics', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Vacation Request')).toBeInTheDocument();
        expect(screen.getByText('Annual Leave')).toBeInTheDocument();
        expect(screen.getByText('HR Issues')).toBeInTheDocument();
        expect(screen.getByText('Benefits')).toBeInTheDocument();
      });
    });

    test('filters channels by category', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const categoryFilter = screen.getByLabelText('Filter by Category');
        fireEvent.change(categoryFilter, { target: { value: 'vmd' } });
      });

      // Should show filtered results
      expect(screen.getByText('Filtered Results')).toBeInTheDocument();
    });
  });

  describe('Help Desk Requests', () => {
    test('creates new help desk request', async () => {
      const mockApi = require('../../../services/api');
      mockApi.createHelpDeskRequest.mockResolvedValue({ success: true });

      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const createButton = screen.getByText('Create Request');
        fireEvent.click(createButton);
      });

      // Fill form
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Help Request' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Need assistance with something' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'personnel' } });
      fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'high' } });

      // Submit form
      fireEvent.click(screen.getByText('Submit Request'));

      await waitFor(() => {
        expect(mockApi.createHelpDeskRequest).toHaveBeenCalledWith({
          title: 'New Help Request',
          description: 'Need assistance with something',
          category: 'personnel',
          priority: 'high'
        });
      });
    });

    test('displays request details', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Annual Leave Request')).toBeInTheDocument();
        expect(screen.getByText('medium')).toBeInTheDocument();
        expect(screen.getByText('open')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    test('filters requests by status', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const statusFilter = screen.getByLabelText('Filter by Status');
        fireEvent.change(statusFilter, { target: { value: 'closed' } });
      });

      // Should show filtered results
      expect(screen.getByText('Filtered Results')).toBeInTheDocument();
    });

    test('filters requests by priority', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const priorityFilter = screen.getByLabelText('Filter by Priority');
        fireEvent.change(priorityFilter, { target: { value: 'high' } });
      });

      // Should show filtered results
      expect(screen.getByText('Filtered Results')).toBeInTheDocument();
    });

    test('sends message to request', async () => {
      const mockApi = require('../../../services/api');
      mockApi.sendHelpDeskMessage.mockResolvedValue({ success: true });

      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const request = screen.getByText('Annual Leave Request');
        fireEvent.click(request);
      });

      // Send message
      const messageInput = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(messageInput, { target: { value: 'Follow up message' } });
      fireEvent.click(screen.getByText('Send'));

      await waitFor(() => {
        expect(mockApi.sendHelpDeskMessage).toHaveBeenCalledWith('1', {
          content: 'Follow up message'
        });
      });
    });

    test('updates request status', async () => {
      const mockApi = require('../../../services/api');
      mockApi.updateHelpDeskRequest.mockResolvedValue({ success: true });

      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const request = screen.getByText('Annual Leave Request');
        fireEvent.click(request);
      });

      // Update status
      const statusSelect = screen.getByLabelText('Status');
      fireEvent.change(statusSelect, { target: { value: 'in_progress' } });

      await waitFor(() => {
        expect(mockApi.updateHelpDeskRequest).toHaveBeenCalledWith('1', {
          status: 'in_progress'
        });
      });
    });
  });

  describe('Request Details Modal', () => {
    test('opens request details modal', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const request = screen.getByText('Annual Leave Request');
        fireEvent.click(request);
      });

      expect(screen.getByText('Request Details')).toBeInTheDocument();
      expect(screen.getByText('Initial request')).toBeInTheDocument();
    });

    test('displays request messages', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const request = screen.getByText('Annual Leave Request');
        fireEvent.click(request);
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Initial request')).toBeInTheDocument();
    });

    test('closes modal', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const request = screen.getByText('Annual Leave Request');
        fireEvent.click(request);
      });

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(screen.queryByText('Request Details')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('searches requests by title', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search requests...');
        fireEvent.change(searchInput, { target: { value: 'Annual Leave' } });
      });

      // Should show filtered results
      expect(screen.getByText('Annual Leave Request')).toBeInTheDocument();
    });

    test('searches requests by description', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search requests...');
        fireEvent.change(searchInput, { target: { value: 'vacation' } });
      });

      // Should show filtered results
      expect(screen.getByText('Annual Leave Request')).toBeInTheDocument();
    });
  });

  describe('Access Control', () => {
    test('shows access denied for users without help desk permissions', () => {
      const userWithoutPermissions = {
        ...mockAuthContext.user,
        permissions: ['dashboard:read']
      };
      
      jest.spyOn(require('../../../contexts/AuthContext'), 'useAuth').mockReturnValue({
        ...mockAuthContext,
        user: userWithoutPermissions
      });

      renderWithProviders(<HelpDeskPage />);
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    test('allows access for users with help desk permissions', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API errors gracefully', async () => {
      const mockApi = require('../../../services/api');
      mockApi.getHelpDeskChannels.mockRejectedValue(new Error('API Error'));

      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Error loading help desk data')).toBeInTheDocument();
      });
    });

    test('shows loading state', async () => {
      const mockApi = require('../../../services/api');
      mockApi.getHelpDeskChannels.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithProviders(<HelpDeskPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    test('validates required fields in request form', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const createButton = screen.getByText('Create Request');
        fireEvent.click(createButton);
      });

      // Try to submit empty form
      fireEvent.click(screen.getByText('Submit Request'));

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Description is required')).toBeInTheDocument();
        expect(screen.getByText('Category is required')).toBeInTheDocument();
      });
    });

    test('validates message content', async () => {
      renderWithProviders(<HelpDeskPage />);
      
      await waitFor(() => {
        const request = screen.getByText('Annual Leave Request');
        fireEvent.click(request);
      });

      // Try to send empty message
      fireEvent.click(screen.getByText('Send'));

      await waitFor(() => {
        expect(screen.getByText('Message content is required')).toBeInTheDocument();
      });
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

      renderWithProviders(<HelpDeskPage />);
      expect(screen.getByText('Help Desk')).toBeInTheDocument();
    });
  });
}); 