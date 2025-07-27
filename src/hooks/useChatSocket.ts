// Chat Socket Hook for Real-time Communication
// Provides WebSocket connection management for chat functionality

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, ChatChannel } from '../types/chat';

interface UseChatSocketOptions {
  userId: string;
  token?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

interface TypingUser {
  userId: string;
  isTyping: boolean;
  timestamp: number;
}

interface UseChatSocketReturn {
  // Connection
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Channel Management
  joinChannel: (channelId: string) => Promise<void>;
  leaveChannel: (channelId: string) => void;
  currentChannel: string | null;
  
  // Messaging
  sendMessage: (channelId: string, message: string, attachments?: any[], messageType?: string) => Promise<void>;
  sendDirectMessage: (recipientId: string, message: string, attachments?: any[], messageType?: string) => Promise<void>;
  
  // Typing & Presence
  sendTyping: (channelId: string, isTyping: boolean) => void;
  sendDirectTyping: (recipientId: string, isTyping: boolean) => void;
  updateUserStatus: (status: string, customMessage?: string) => void;
  typingUsers: TypingUser[];
  
  // Reactions & Interactions
  addReaction: (messageId: string, reaction: string) => Promise<void>;
  removeReaction: (messageId: string) => Promise<void>;
  markMessageAsRead: (senderId: string) => void;
  
  // File Upload
  uploadFile: (channelId: string, file: File) => Promise<void>;
  
  // Event Listeners
  onMessage: (handler: (msg: ChatMessage) => void) => void;
  onDirectMessage: (handler: (msg: ChatMessage) => void) => void;
  onTyping: (handler: (data: { userId: string; isTyping: boolean }) => void) => void;
  onDirectTyping: (handler: (data: { userId: string; isTyping: boolean }) => void) => void;
  onUserJoined: (handler: (data: any) => void) => void;
  onUserLeft: (handler: (data: any) => void) => void;
  onUserStatusUpdate: (handler: (data: any) => void) => void;
  onMessageReaction: (handler: (data: any) => void) => void;
  onMessageRead: (handler: (data: any) => void) => void;
  onError: (handler: (error: any) => void) => void;
  onConnect: (handler: () => void) => void;
  onDisconnect: (handler: () => void) => void;
  
  // Cleanup
  off: (event: string, handler: (...args: any[]) => void) => void;
  cleanup: () => void;
}

// Configuration
const CHAT_SOCKET_URL = process.env.REACT_APP_CHAT_SOCKET_URL || 'http://localhost:8080';
const TYPING_DEBOUNCE_MS = 1000; // 1 second debounce for typing events

export function useChatSocket({
  userId,
  token,
  autoReconnect = true,
  maxReconnectAttempts = 10,
  reconnectDelay = 1000
}: UseChatSocketOptions): UseChatSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0
  });
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventHandlersRef = useRef<Map<string, Set<Function>>>(new Map());

  // Create Socket.IO instance
  const createSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    console.log('Creating Socket.IO connection with:', { userId, token: token ? 'present' : 'missing' });
    
    const socket = io(CHAT_SOCKET_URL, {
      auth: { userId, token },
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: autoReconnect,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: reconnectDelay,
      timeout: 20000,
      forceNew: true
    });

    socketRef.current = socket;
    return socket;
  }, [userId, token, autoReconnect, maxReconnectAttempts, reconnectDelay]);

  // Connection management
  const connect = useCallback(async (): Promise<void> => {
    if (!userId) {
      throw new Error('User ID is required for connection');
    }

    setConnectionStatus(prev => ({ ...prev, connecting: true, error: null }));

    try {
      const socket = createSocket();

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        socket.on('connect', () => {
          clearTimeout(timeout);
          setConnectionStatus({
            connected: true,
            connecting: false,
            error: null,
            reconnectAttempts: 0
          });
          resolve();
        });

        socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          setConnectionStatus(prev => ({
            ...prev,
            connecting: false,
            error: error.message,
            reconnectAttempts: prev.reconnectAttempts + 1
          }));
          reject(error);
        });

        socket.on('disconnect', (reason) => {
          setConnectionStatus(prev => ({
            ...prev,
            connected: false,
            connecting: false,
            error: reason === 'io server disconnect' ? 'Server disconnected' : null
          }));
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
          setConnectionStatus(prev => ({
            ...prev,
            reconnectAttempts: attemptNumber
          }));
        });

        socket.on('reconnect_failed', () => {
          setConnectionStatus(prev => ({
            ...prev,
            error: 'Failed to reconnect after maximum attempts'
          }));
        });
      });
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      throw error;
    }
  }, [userId, createSocket]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setConnectionStatus({
      connected: false,
      connecting: false,
      error: null,
      reconnectAttempts: 0
    });
    setCurrentChannel(null);
    setTypingUsers([]);
  }, []);

  // Channel management
  const joinChannel = useCallback(async (channelId: string): Promise<void> => {
    if (!socketRef.current?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      socketRef.current!.emit('join-channel', channelId, (error: any) => {
        if (error) {
          reject(new Error(error.message || 'Failed to join channel'));
        } else {
          setCurrentChannel(channelId);
          resolve();
        }
      });
    });
  }, []);

  const leaveChannel = useCallback((channelId: string) => {
    socketRef.current?.emit('leave-channel', channelId);
    if (currentChannel === channelId) {
      setCurrentChannel(null);
    }
  }, [currentChannel]);

  // Messaging with enhanced error handling
  const sendMessage = useCallback(async (
    channelId: string, 
    message: string, 
    attachments: any[] = [], 
    messageType = 'text'
  ): Promise<void> => {
    if (!socketRef.current?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      socketRef.current!.emit('send-message', {
        channelId,
        message,
        messageType,
        attachments
      }, (error: any) => {
        if (error) {
          reject(new Error(error.message || 'Failed to send message'));
        } else {
          resolve();
        }
      });
    });
  }, []);

  const sendDirectMessage = useCallback(async (
    recipientId: string,
    message: string,
    attachments: any[] = [],
    messageType = 'text'
  ): Promise<void> => {
    if (!socketRef.current?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      socketRef.current!.emit('send-direct-message', {
        recipientId,
        message,
        messageType,
        attachments
      }, (error: any) => {
        if (error) {
          reject(new Error(error.message || 'Failed to send direct message'));
        } else {
          resolve();
        }
      });
    });
  }, []);

  // Typing with debouncing
  const sendTyping = useCallback((channelId: string, isTyping: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      socketRef.current?.emit('typing', { channelId, isTyping: true });
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', { channelId, isTyping: false });
      }, TYPING_DEBOUNCE_MS);
    } else {
      socketRef.current?.emit('typing', { channelId, isTyping: false });
    }
  }, []);

  const sendDirectTyping = useCallback((recipientId: string, isTyping: boolean) => {
    socketRef.current?.emit('direct-typing', { recipientId, isTyping });
  }, []);

  // User status
  const updateUserStatus = useCallback((status: string, customMessage?: string) => {
    socketRef.current?.emit('user-status', { status, customMessage });
  }, []);

  // Reactions
  const addReaction = useCallback(async (messageId: string, reaction: string): Promise<void> => {
    if (!socketRef.current?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      socketRef.current!.emit('message-reaction', { messageId, reaction }, (error: any) => {
        if (error) {
          reject(new Error(error.message || 'Failed to add reaction'));
        } else {
          resolve();
        }
      });
    });
  }, []);

  const removeReaction = useCallback(async (messageId: string): Promise<void> => {
    if (!socketRef.current?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      socketRef.current!.emit('remove-reaction', { messageId }, (error: any) => {
        if (error) {
          reject(new Error(error.message || 'Failed to remove reaction'));
        } else {
          resolve();
        }
      });
    });
  }, []);

  // Message read receipts
  const markMessageAsRead = useCallback((senderId: string) => {
    socketRef.current?.emit('mark-read', { senderId });
  }, []);

  // File upload
  const uploadFile = useCallback(async (channelId: string, file: File): Promise<void> => {
    if (!socketRef.current?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = reader.result as string;
        socketRef.current!.emit('file-upload', {
          channelId,
          fileName: file.name,
          fileData,
          mimeType: file.type,
          fileSize: file.size
        }, (error: any) => {
          if (error) {
            reject(new Error(error.message || 'Failed to upload file'));
          } else {
            resolve();
          }
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  // Event listener management with cleanup
  const addEventListener = useCallback((event: string, handler: Function) => {
    if (!eventHandlersRef.current.has(event)) {
      eventHandlersRef.current.set(event, new Set());
    }
    eventHandlersRef.current.get(event)!.add(handler);
    socketRef.current?.on(event, handler as any);
  }, []);

  const removeEventListener = useCallback((event: string, handler: Function) => {
    const handlers = eventHandlersRef.current.get(event);
    if (handlers) {
      handlers.delete(handler);
      socketRef.current?.off(event, handler as any);
    }
  }, []);

  // Event listeners
  const onMessage = useCallback((handler: (msg: ChatMessage) => void) => {
    addEventListener('new-message', handler);
  }, [addEventListener]);

  const onDirectMessage = useCallback((handler: (msg: ChatMessage) => void) => {
    addEventListener('new-direct-message', handler);
  }, [addEventListener]);

  const onTyping = useCallback((handler: (data: { userId: string; isTyping: boolean }) => void) => {
    addEventListener('user-typing', handler);
  }, [addEventListener]);

  const onDirectTyping = useCallback((handler: (data: { userId: string; isTyping: boolean }) => void) => {
    addEventListener('user-direct-typing', handler);
  }, [addEventListener]);

  const onUserJoined = useCallback((handler: (data: any) => void) => {
    addEventListener('user-joined-channel', handler);
  }, [addEventListener]);

  const onUserLeft = useCallback((handler: (data: any) => void) => {
    addEventListener('user-left-channel', handler);
  }, [addEventListener]);

  const onUserStatusUpdate = useCallback((handler: (data: any) => void) => {
    addEventListener('user-status-updated', handler);
  }, [addEventListener]);

  const onMessageReaction = useCallback((handler: (data: any) => void) => {
    addEventListener('message-reaction', handler);
  }, [addEventListener]);

  const onMessageRead = useCallback((handler: (data: any) => void) => {
    addEventListener('messages-read', handler);
  }, [addEventListener]);

  const onError = useCallback((handler: (error: any) => void) => {
    addEventListener('error', handler);
  }, [addEventListener]);

  const onConnect = useCallback((handler: () => void) => {
    addEventListener('connect', handler);
  }, [addEventListener]);

  const onDisconnect = useCallback((handler: () => void) => {
    addEventListener('disconnect', handler);
  }, [addEventListener]);

  const off = useCallback((event: string, handler: (...args: any[]) => void) => {
    removeEventListener(event, handler);
  }, [removeEventListener]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Remove all event listeners
    eventHandlersRef.current.forEach((handlers, event) => {
      handlers.forEach(handler => {
        socketRef.current?.off(event, handler as any);
      });
    });
    eventHandlersRef.current.clear();
    
    disconnect();
  }, [disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    if (userId) {
      connect().catch(console.error);
    }

    return () => {
      cleanup();
    };
  }, [userId, connect, cleanup]);

  // Handle typing users updates
  useEffect(() => {
    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const now = Date.now();
        const filtered = prev.filter(user => 
          user.userId !== data.userId || now - user.timestamp < 5000
        );
        
        if (data.isTyping) {
          return [...filtered, { ...data, timestamp: now }];
        } else {
          return filtered.filter(user => user.userId !== data.userId);
        }
      });
    };

    onTyping(handleTyping);
    onDirectTyping(handleTyping);

    return () => {
      off('user-typing', handleTyping);
      off('user-direct-typing', handleTyping);
    };
  }, [onTyping, onDirectTyping, off]);

  return {
    // Connection
    socket: socketRef.current,
    connectionStatus,
    connect,
    disconnect,
    
    // Channel Management
    joinChannel,
    leaveChannel,
    currentChannel,
    
    // Messaging
    sendMessage,
    sendDirectMessage,
    
    // Typing & Presence
    sendTyping,
    sendDirectTyping,
    updateUserStatus,
    typingUsers,
    
    // Reactions & Interactions
    addReaction,
    removeReaction,
    markMessageAsRead,
    
    // File Upload
    uploadFile,
    
    // Event Listeners
    onMessage,
    onDirectMessage,
    onTyping,
    onDirectTyping,
    onUserJoined,
    onUserLeft,
    onUserStatusUpdate,
    onMessageReaction,
    onMessageRead,
    onError,
    onConnect,
    onDisconnect,
    
    // Cleanup
    off,
    cleanup,
  };
} 