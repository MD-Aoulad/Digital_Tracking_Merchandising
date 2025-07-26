import {
  getChatSettings,
  updateChatSettings,
  getChatChannels,
  createChatChannel,
  getChatMessages,
  sendChatMessage,
  getHelpDeskChannels,
  getHelpDeskRequests,
  createHelpDeskRequest,
  sendHelpDeskMessage
} from '../../services/api';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('Chat API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    localStorageMock.getItem.mockReturnValue('test-token');
  });

  describe('Chat Settings', () => {
    test('fetches chat settings successfully', async () => {
      const mockSettings = {
        enabled: true,
        fileSharing: { enabled: true, maxFileSize: 5, allowedTypes: ['image', 'document'] }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings
      });

      const result = await getChatSettings();

      expect(fetch).toHaveBeenCalledWith('/api/chat/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
      expect(result).toEqual(mockSettings);
    });

    test('updates chat settings successfully', async () => {
      const updatedSettings = {
        enabled: false,
        fileSharing: { enabled: false, maxFileSize: 5, allowedTypes: ['image', 'document'] }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await updateChatSettings(updatedSettings);

      expect(fetch).toHaveBeenCalledWith('/api/chat/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(updatedSettings)
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('Chat Channels', () => {
    test('fetches chat channels successfully', async () => {
      const mockChannels = [
        { id: '1', name: 'General', type: 'general' },
        { id: '2', name: 'Development', type: 'project' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannels
      });

      const result = await getChatChannels();

      expect(fetch).toHaveBeenCalledWith('/api/chat/channels', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
      expect(result).toEqual(mockChannels);
    });

    test('creates chat channel successfully', async () => {
      const newChannel = {
        name: 'New Channel',
        description: 'New channel description',
        type: 'public'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '3', ...newChannel })
      });

      const result = await createChatChannel(newChannel);

      expect(fetch).toHaveBeenCalledWith('/api/chat/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(newChannel)
      });
      expect(result).toEqual({ id: '3', ...newChannel });
    });
  });

  describe('Chat Messages', () => {
    test('fetches chat messages successfully', async () => {
      const mockMessages = [
        { id: '1', content: 'Hello', senderId: '1' },
        { id: '2', content: 'Hi there', senderId: '2' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessages
      });

      const result = await getChatMessages('1');

      expect(fetch).toHaveBeenCalledWith('/api/chat/channels/1/messages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
      expect(result).toEqual(mockMessages);
    });

    test('sends chat message successfully', async () => {
      const newMessage = {
        content: 'Hello world!',
        type: 'text'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '3', ...newMessage })
      });

      const result = await sendChatMessage('1', newMessage);

      expect(fetch).toHaveBeenCalledWith('/api/chat/channels/1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(newMessage)
      });
      expect(result).toEqual({ id: '3', ...newMessage });
    });

    test('sends file message successfully', async () => {
      const newMessage = {
        content: '',
        type: 'file',
        attachments: [{}]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '4', ...newMessage })
      });

      const result = await sendChatMessage('1', newMessage);

      expect(fetch).toHaveBeenCalledWith('/api/chat/channels/1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(newMessage)
      });
      expect(result).toEqual({ id: '4', ...newMessage });
    });
  });

  describe('Help Desk Channels', () => {
    test('fetches help desk channels successfully', async () => {
      const mockChannels = [
        { id: 'hd1', name: 'Personnel', category: 'personnel' },
        { id: 'hd2', name: 'VMD', category: 'vmd' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannels
      });

      const result = await getHelpDeskChannels();

      expect(fetch).toHaveBeenCalledWith('/api/chat/helpdesk/channels', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
      expect(result).toEqual(mockChannels);
    });
  });

  describe('Help Desk Requests', () => {
    test('fetches help desk requests successfully', async () => {
      const mockRequests = [
        { id: '1', title: 'Help Request', status: 'open' },
        { id: '2', title: 'Another Request', status: 'closed' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRequests
      });

      const result = await getHelpDeskRequests();

      expect(fetch).toHaveBeenCalledWith('/api/chat/helpdesk/requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
      expect(result).toEqual(mockRequests);
    });

    test('creates help desk request successfully', async () => {
      const newRequest = {
        title: 'New Help Request',
        description: 'Need assistance with something',
        category: 'personnel',
        priority: 'high'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '3', ...newRequest })
      });

      const result = await createHelpDeskRequest(newRequest);

      expect(fetch).toHaveBeenCalledWith('/api/chat/helpdesk/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(newRequest)
      });
      expect(result).toEqual({ id: '3', ...newRequest });
    });

    test('sends help desk message successfully', async () => {
      const newMessage = {
        content: 'Follow up message'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '4', ...newMessage })
      });

      const result = await sendHelpDeskMessage('1', newMessage);

      expect(fetch).toHaveBeenCalledWith('/api/chat/helpdesk/requests/1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(newMessage)
      });
      expect(result).toEqual({ id: '4', ...newMessage });
    });
  });

  describe('Error Handling', () => {
    test('handles 401 unauthorized error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(getChatSettings()).rejects.toThrow('Unauthorized');
    });

    test('handles 403 forbidden error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      await expect(getChatSettings()).rejects.toThrow('Forbidden');
    });

    test('handles 500 server error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(getChatSettings()).rejects.toThrow('Internal Server Error');
    });

    test('handles network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getChatSettings()).rejects.toThrow('Network error');
    });

    test('handles rate limiting', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      await expect(getChatMessages('1')).rejects.toThrow('Too Many Requests');
    });
  });

  describe('Authentication', () => {
    test('includes authorization header with token', async () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await getChatSettings();

      expect(fetch).toHaveBeenCalledWith('/api/chat/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
    });

    test('handles missing token', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await getChatSettings();

      expect(fetch).toHaveBeenCalledWith('/api/chat/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer null'
        }
      });
    });
  });

  describe('Validation', () => {
    test('validates message content length', async () => {
      const longMessage = {
        content: 'a'.repeat(1001),
        type: 'text'
      };

      await expect(sendChatMessage('1', longMessage)).rejects.toThrow('Message too long');
    });

    test('validates file size', async () => {
      const largeFileMessage = {
        content: '',
        type: 'file',
        attachments: [{ size: 11 * 1024 * 1024 }] // 11MB
      };

      await expect(sendChatMessage('1', largeFileMessage)).rejects.toThrow('File too large');
    });

    test('validates file type', async () => {
      const invalidFileMessage = {
        content: '',
        type: 'file',
        attachments: [{ type: 'exe' }]
      };

      await expect(sendChatMessage('1', invalidFileMessage)).rejects.toThrow('File type not allowed');
    });
  });

  describe('Performance', () => {
    test('handles large message history', async () => {
      const largeMessageHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        content: `Message ${i}`,
        senderId: '1'
      }));

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => largeMessageHistory
      });

      const startTime = performance.now();
      const result = await getChatMessages('1');
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('handles concurrent requests', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      const promises = Array.from({ length: 10 }, () => getChatSettings());
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(fetch).toHaveBeenCalledTimes(10);
    });
  });
}); 