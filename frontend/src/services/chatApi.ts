// Chat API Service Layer
// Comprehensive service for enterprise chat functionality

import { 
  ChatChannel, 
  ChatMessage, 
  ChatUser, 
  ChatApiResponse, 
  ChatMessagesResponse,
  CreateChannelForm,
  SendMessageForm,
  FlagMessageForm,
  GDPRRequestForm,
  ChatSearchFilters,
  ChatSearchResult,
  ChatAnalytics,
  ContentModeration
} from '../types/chat';
import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const API_BASE = (process.env.REACT_APP_CHAT_API_URL || 'http://localhost:8080/api/chat');

// ===== UTILITY FUNCTIONS =====

/**
 * Get authentication headers with JWT token
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  console.log('🔍 Debug - Token from localStorage:', token ? 'EXISTS' : 'MISSING');
  
  if (token) {
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      console.log('🔍 Debug - Token payload:', payload);
      console.log('🔍 Debug - Token expires at:', new Date(payload.exp * 1000));
      console.log('🔍 Debug - Current time:', new Date(currentTime * 1000));
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, clear it
        console.log('JWT token expired, clearing session');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        return { 'Content-Type': 'application/json' };
      }
    } catch (error) {
      // Invalid token format, clear it
      console.log('Invalid JWT token format, clearing session');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return { 'Content-Type': 'application/json' };
    }
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  
  console.log('🔍 Debug - Final headers:', headers);
  return headers;
};

/**
 * Check if user is authenticated
 */
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

// ===== SOCKET.IO MANAGER =====

// Socket.IO connection management with enhanced error handling
class SocketIOManager {
  private socket: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private userId: string | null = null;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  async connect(userId: string) {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    // Check if chat system is available first
    try {
      const healthCheck = await fetch(`http://localhost:8080/health/chat`);
      const health = await healthCheck.json();
      
      if (health.status !== 'OK') {
        console.log('Chat system not available:', health.message);
        return;
      }
    } catch (error) {
      console.log('Chat system health check failed:', error);
      return;
    }

    this.userId = userId;
    this.isConnecting = true;

    // Use the API Gateway for Socket.IO connections
    const socketUrl = `http://localhost:8080`;
    this.socket = io(socketUrl, {
      path: '/ws',
      query: { userId },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected successfully');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.startHeartbeat();
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket.IO disconnected:', reason);
      this.isConnecting = false;
      this.stopHeartbeat();
      
      // Only attempt reconnect if it wasn't a clean disconnect
      if (reason !== 'io client disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket.IO connection error:', error);
      this.isConnecting = false;
    });

    // Handle incoming messages
    this.socket.on('new-message', (data: any) => {
      this.handleMessage({ type: 'new-message', data });
    });

    this.socket.on('user-joined', (data: any) => {
      this.handleMessage({ type: 'user-joined', data });
    });

    this.socket.on('user-left', (data: any) => {
      this.handleMessage({ type: 'user-left', data });
    });

    this.socket.on('user-typing', (data: any) => {
      this.handleMessage({ type: 'user-typing', data });
    });

    this.socket.on('pong', () => {
      // Handle heartbeat response
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        this.connect(this.userId!);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(data: any) {
    const listeners = this.listeners.get(data.type) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in Socket.IO listener:', error);
      }
    });
  }

  addEventListener(type: string, callback: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  removeEventListener(type: string, callback: Function) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      try {
        this.socket.emit(event, data);
      } catch (error) {
        console.error('Error emitting Socket.IO event:', error);
      }
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.socket?.connected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }
}

// Global Socket.IO manager instance
export const socketManager = new SocketIOManager();

// Enhanced API request helper with authentication and retry logic
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {},
  retries: number = 3
): Promise<ChatApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, config);
      
      // Handle authentication errors
      if (response.status === 401) {
        console.log('Authentication failed, clearing session');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        throw new Error('Access token required. Please log in again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API request error (attempt ${attempt}/${retries}):`, error);
      
      // Don't retry on authentication errors or client errors
      if (error instanceof Error && (
        error.message.includes('Access token required') ||
        error.message.includes('HTTP 4')
      )) {
        throw error;
      }

      // Last attempt, throw the error
      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error('Max retry attempts reached');
}

// ============================================================================
// CHANNEL API FUNCTIONS
// ============================================================================

export const channelApi = {
  // Get user's channels
  async getChannels(): Promise<ChatChannel[]> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiRequest<ChatChannel[]>('/channels');
    return response.data || [];
  },

  // Create new channel
  async createChannel(form: CreateChannelForm): Promise<ChatChannel> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiRequest<ChatChannel>('/channels', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    return response.data!;
  },

  // Get channel details
  async getChannel(id: string): Promise<ChatChannel> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiRequest<ChatChannel>(`/channels/${id}`);
    return response.data!;
  },

  // Update channel
  async updateChannel(id: string, updates: Partial<ChatChannel>): Promise<ChatChannel> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiRequest<ChatChannel>(`/channels/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data!;
  },

  // Delete channel
  async deleteChannel(id: string): Promise<void> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    await apiRequest(`/channels/${id}`, {
      method: 'DELETE',
    });
  },

  // Join channel
  async joinChannel(channelId: string): Promise<void> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    await apiRequest(`/channels/${channelId}/join`, {
      method: 'POST',
    });
  },

  // Leave channel
  async leaveChannel(channelId: string): Promise<void> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    await apiRequest(`/channels/${channelId}/leave`, {
      method: 'POST',
    });
  },

  // Get channel members
  async getChannelMembers(channelId: string): Promise<ChatUser[]> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiRequest<ChatUser[]>(`/channels/${channelId}/members`);
    return response.data || [];
  },

  // Add member to channel
  async addMember(channelId: string, userId: string, role: string = 'member'): Promise<void> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    await apiRequest(`/channels/${channelId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  },

  // Remove member from channel
  async removeMember(channelId: string, userId: string): Promise<void> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    await apiRequest(`/channels/${channelId}/members/${userId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// MESSAGE API FUNCTIONS
// ============================================================================

export const messageApi = {
  // Get channel messages
  async getMessages(
    channelId: string, 
    page: number = 1, 
    limit: number = 50,
    before?: string
  ): Promise<ChatMessagesResponse> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (before) params.append('before', before);

    const response = await apiRequest<ChatMessage[]>(`/channels/${channelId}/messages?${params}`);
    return response as ChatMessagesResponse;
  },

  // Send message
  async sendMessage(channelId: string, form: SendMessageForm): Promise<ChatMessage> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiRequest<ChatMessage>(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify(form),
    });
    return response.data!;
  },

  // Update message
  async updateMessage(messageId: string, content: string): Promise<ChatMessage> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiRequest<ChatMessage>(`/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
    return response.data!;
  },

  // Delete message
  async deleteMessage(messageId: string): Promise<void> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    await apiRequest(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  },

  // Add reaction
  async addReaction(messageId: string, reactionType: string): Promise<void> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    await apiRequest(`/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    });
  },

  // Remove reaction
  async removeReaction(messageId: string, reactionType: string): Promise<void> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    await apiRequest(`/messages/${messageId}/reactions/${reactionType}`, {
      method: 'DELETE',
    });
  },

  // Upload file attachment with progress tracking
  async uploadAttachment(messageId: string, file: File, onProgress?: (progress: number) => void): Promise<any> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_BASE}/messages/${messageId}/attachments`);
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.send(formData);
    });
  },

  // Mark message as read
  async markAsRead(messageId: string): Promise<void> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    await apiRequest(`/messages/${messageId}/read`, {
      method: 'POST',
    });
  },

  // Flag message for moderation
  async flagMessage(messageId: string, form: FlagMessageForm): Promise<ContentModeration> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiRequest<ContentModeration>(`/messages/${messageId}/flag`, {
      method: 'POST',
      body: JSON.stringify(form),
    });
    return response.data!;
  },
};

// ============================================================================
// MODERATION API FUNCTIONS
// ============================================================================

export const moderationApi = {
  // Get flagged messages
  async getFlaggedMessages(status: string = 'pending', page: number = 1): Promise<ContentModeration[]> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const params = new URLSearchParams({ status, page: page.toString() });
    const response = await apiRequest<ContentModeration[]>(`/moderation/flagged?${params}`);
    return response.data || [];
  },

  // Review flagged message
  async reviewFlaggedMessage(
    moderationId: string, 
    status: string, 
    actionTaken?: string, 
    notes?: string
  ): Promise<ContentModeration> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiRequest<ContentModeration>(`/moderation/${moderationId}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, actionTaken, notes }),
    });
    return response.data!;
  },
};

// ============================================================================
// ANALYTICS API FUNCTIONS
// ============================================================================

export const analyticsApi = {
  // Get channel analytics
  async getChannelAnalytics(channelId: string, days: number = 30): Promise<ChatAnalytics> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiRequest<ChatAnalytics>(`/channels/${channelId}/analytics?days=${days}`);
    return response.data!;
  },

  // Get user activity (now implemented in backend)
  async getUserActivity({ channelId, dateFrom, dateTo }: { channelId?: string, dateFrom?: string, dateTo?: string } = {}): Promise<any> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    const params = new URLSearchParams();
    if (channelId) params.append('channelId', channelId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    const response = await apiRequest<any>(`/user-activity?${params.toString()}`);
    return response.data;
  },

  // Get chat statistics (placeholder - endpoint not implemented in backend)
  async getChatStats(): Promise<any> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    // TODO: Implement chat stats endpoint in backend
    console.warn('Chat stats endpoint not implemented in backend');
    return { stats: {} };
  },
};

// ============================================================================
// GDPR API FUNCTIONS
// ============================================================================

export const gdprApi = {
  // Request data export
  async requestDataExport(form: GDPRRequestForm): Promise<any> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiRequest<any>('/gdpr/export', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    return response.data;
  },

  // Request data deletion (placeholder - endpoint not implemented in backend)
  async requestDataDeletion(form: GDPRRequestForm): Promise<any> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    // TODO: Implement GDPR deletion endpoint in backend
    console.warn('GDPR deletion endpoint not implemented in backend');
    return { success: true, message: 'Request submitted' };
  },

  // Get GDPR request status (placeholder - endpoint not implemented in backend)
  async getGdprRequestStatus(requestId: string): Promise<any> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    // TODO: Implement GDPR request status endpoint in backend
    console.warn('GDPR request status endpoint not implemented in backend');
    return { status: 'pending' };
  },
};

// ============================================================================
// SEARCH API FUNCTIONS
// ============================================================================

export const searchApi = {
  // Search messages
  async searchMessages(filters: ChatSearchFilters, page: number = 1): Promise<ChatSearchResult> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const params = new URLSearchParams({
      page: page.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    });

    const response = await apiRequest<ChatSearchResult>(`/search?${params}`);
    return response.data!;
  },

  // Search channels (placeholder - using general search endpoint)
  async searchChannels(query: string): Promise<ChatChannel[]> {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    // TODO: Implement channel-specific search in backend
    console.warn('Channel search using general search endpoint');
    const response = await apiRequest<ChatChannel[]>(`/search?q=${encodeURIComponent(query)}`);
    return response.data || [];
  },
};

// ============================================================================
// WEBSOCKET API FUNCTIONS
// ============================================================================

export const wsApi = {
  // Connect to WebSocket
  async connect(userId: string) {
    return socketManager.connect(userId);
  },

  // Disconnect from WebSocket
  disconnect() {
    socketManager.disconnect();
  },

  // Send typing indicator
  sendTyping(channelId: string, isTyping: boolean) {
    socketManager.emit('typing_start', { channelId, isTyping });
  },

  // Mark message as read
  markMessageRead(messageId: string, channelId: string) {
    socketManager.emit('message_read', { messageId, channelId });
  },

  // Add event listener
  on(eventType: string, callback: Function) {
    socketManager.addEventListener(eventType, callback);
  },

  // Remove event listener
  off(eventType: string, callback: Function) {
    socketManager.removeEventListener(eventType, callback);
  },

  // Get connection status
  getConnectionStatus() {
    return socketManager.getConnectionStatus();
  },

  // Get typing users (placeholder - would be implemented with real-time tracking)
  getTypingUsers(): string[] {
    return []; // TODO: Implement real-time typing user tracking
  }
};

// ============================================================================
// REACT HOOKS
// ============================================================================

export function useChannels() {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await channelApi.getChannels();
      setChannels(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch channels';
      setError(errorMessage);
      console.error('Error fetching channels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const refreshChannels = useCallback(() => {
    fetchChannels();
  }, [fetchChannels]);

  return {
    channels,
    loading,
    error,
    refreshChannels
  };
}

export function useMessages(channelId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchMessages = useCallback(async (reset: boolean = false) => {
    if (!channelId) return;

    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const response = await messageApi.getMessages(channelId, currentPage);
      
             if (reset) {
         setMessages(response.data || []);
         setPage(1);
       } else {
         setMessages(prev => [...(response.data || []), ...prev]);
         setPage(currentPage + 1);
       }
       
       setHasMore((response.data || []).length === 50); // Assuming 50 is the page size
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(errorMessage);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [channelId, page]);

  useEffect(() => {
    if (channelId) {
      fetchMessages(true);
    } else {
      setMessages([]);
      setPage(1);
      setHasMore(true);
    }
  }, [channelId, fetchMessages]);

  const loadMoreMessages = useCallback(() => {
    if (hasMore && !loading) {
      fetchMessages(false);
    }
  }, [hasMore, loading, fetchMessages]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ));
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMoreMessages,
    addMessage,
    updateMessage,
    removeMessage,
    refreshMessages: () => fetchMessages(true)
  };
}

export function useRealtimeUpdates(channelId: string | null) {
  const { addMessage, updateMessage, removeMessage } = useMessages(channelId);

  useEffect(() => {
    const handleNewMessage = (data: any) => {
      if (data.channelId === channelId) {
        addMessage(data.message);
      }
    };

    const handleTyping = (data: any) => {
      // Handle typing indicators
      console.log('Typing indicator:', data);
    };

    const handleMessageUpdate = (data: any) => {
      if (data.channelId === channelId) {
        updateMessage(data.messageId, data.updates);
      }
    };

    const handleMessageDelete = (data: any) => {
      if (data.channelId === channelId) {
        removeMessage(data.messageId);
      }
    };

    // Add event listeners
    wsApi.on('new_message', handleNewMessage);
    wsApi.on('typing_start', handleTyping);
    wsApi.on('typing_stop', handleTyping);
    wsApi.on('message_update', handleMessageUpdate);
    wsApi.on('message_delete', handleMessageDelete);

    return () => {
      // Remove event listeners
      wsApi.off('new_message', handleNewMessage);
      wsApi.off('typing_start', handleTyping);
      wsApi.off('typing_stop', handleTyping);
      wsApi.off('message_update', handleMessageUpdate);
      wsApi.off('message_delete', handleMessageDelete);
    };
  }, [channelId, addMessage, updateMessage, removeMessage]);

  return {
    connectionStatus: wsApi.getConnectionStatus()
  };
} 

// No export for chatApi; getUserActivity is part of analyticsApi 