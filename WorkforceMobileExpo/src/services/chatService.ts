/**
 * Mobile Chat Service - Workforce Management Platform
 * 
 * Comprehensive chat service for mobile app with:
 * - Real-time messaging via WebSocket
 * - File upload/download with progress tracking
 * - Push notifications
 * - Offline message queuing
 * - Media handling (images, videos, audio, documents)
 * - WhatsApp-like UX features
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ===== TYPES =====

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'video' | 'audio' | 'location';
  replyToId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  metadata: Record<string, any>;
  sender?: ChatUser;
  replyTo?: ChatMessage;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  isOnline: boolean;
  lastSeenAt: string;
  isTyping: boolean;
  typingInChannel?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'general' | 'project' | 'department' | 'private' | 'announcement';
  isPrivate: boolean;
  isArchived: boolean;
  maxMembers: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  memberCount?: number;
  lastMessage?: ChatMessage;
  userRole?: 'owner' | 'admin' | 'moderator' | 'member';
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  mimeType: string;
  localPath?: string;
  downloadProgress?: number;
  isDownloaded: boolean;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  reactionType: string;
  createdAt: string;
  user?: ChatUser;
}

export interface TypingIndicator {
  userId: string;
  channelId: string;
  isTyping: boolean;
  startedAt: string;
  user?: ChatUser;
}

export interface ChatSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoDownloadMedia: boolean;
  maxFileSize: number; // in MB
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

// ===== CONFIGURATION =====

const API_BASE = 'http://localhost:3012';
const WS_BASE = 'ws://localhost:3012/ws';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ===== WEB SOCKET MANAGER =====

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private userId: string | null = null;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private typingUsers: Map<string, Set<string>> = new Map(); // channelId -> Set of userIds

  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.userId = userId;
    this.isConnecting = true;

    const wsUrl = `${WS_BASE}?userId=${userId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Mobile WebSocket connected successfully');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Mobile WebSocket message parsing error:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('Mobile WebSocket disconnected:', event.code, event.reason);
      this.isConnecting = false;
      this.stopHeartbeat();
      
      if (event.code !== 1000) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('Mobile WebSocket error:', error);
      this.isConnecting = false;
    };
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000);
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
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Mobile WebSocket attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        this.connect(this.userId!);
      }, delay);
    }
  }

  private handleMessage(data: any) {
    if (data.type === 'pong') return;

    // Handle typing indicators
    if (data.type === 'typing_start') {
      this.addTypingUser(data.channelId, data.userId);
    } else if (data.type === 'typing_stop') {
      this.removeTypingUser(data.channelId, data.userId);
    }

    const listeners = this.listeners.get(data.type) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in mobile WebSocket listener:', error);
      }
    });
  }

  private addTypingUser(channelId: string, userId: string) {
    if (!this.typingUsers.has(channelId)) {
      this.typingUsers.set(channelId, new Set());
    }
    this.typingUsers.get(channelId)!.add(userId);
  }

  private removeTypingUser(channelId: string, userId: string) {
    const users = this.typingUsers.get(channelId);
    if (users) {
      users.delete(userId);
      if (users.size === 0) {
        this.typingUsers.delete(channelId);
      }
    }
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

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending mobile WebSocket message:', error);
      }
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }
    this.userId = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.typingUsers.clear();
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.ws?.readyState === WebSocket.OPEN) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }

  getTypingUsers(channelId: string): string[] {
    const users = this.typingUsers.get(channelId);
    return users ? Array.from(users) : [];
  }

  sendTyping(channelId: string, isTyping: boolean) {
    this.send({
      type: isTyping ? 'typing_start' : 'typing_stop',
      channelId
    });
  }

  markMessageRead(messageId: string, channelId: string) {
    this.send({
      type: 'message_read',
      messageId,
      channelId
    });
  }
}

// ===== API CLIENT =====

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config);
        
        if (response.status === 401) {
          console.log('Authentication failed, clearing token');
          this.token = null;
          await AsyncStorage.removeItem('authToken');
          throw new Error('Access token required. Please log in again.');
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
      } catch (error) {
        console.error(`Mobile API request error (attempt ${attempt}/${retries}):`, error);
        
        if (error instanceof Error && (
          error.message.includes('Access token required') ||
          error.message.includes('HTTP 4')
        )) {
          throw error;
        }

        if (attempt === retries) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('Max retry attempts reached');
  }

  // Channel API
  async getChannels(): Promise<ChatChannel[]> {
    const response = await this.request<{ data: ChatChannel[] }>('/channels');
    return response.data || [];
  }

  async getChannel(id: string): Promise<ChatChannel> {
    const response = await this.request<{ data: ChatChannel }>(`/channels/${id}`);
    return response.data!;
  }

  async createChannel(form: any): Promise<ChatChannel> {
    const response = await this.request<{ data: ChatChannel }>('/channels', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    return response.data!;
  }

  // Message API
  async getMessages(
    channelId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await this.request<{ data: ChatMessage[]; pagination: any }>(
      `/channels/${channelId}/messages?${params}`
    );
    
    return {
      messages: response.data || [],
      hasMore: response.pagination?.hasMore || false
    };
  }

  async sendMessage(channelId: string, form: any): Promise<ChatMessage> {
    const response = await this.request<{ data: ChatMessage }>(
      `/channels/${channelId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(form),
      }
    );
    return response.data!;
  }

  async updateMessage(messageId: string, content: string): Promise<ChatMessage> {
    const response = await this.request<{ data: ChatMessage }>(`/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
    return response.data!;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.request(`/messages/${messageId}/read`, {
      method: 'POST',
    });
  }

  // File upload with progress tracking
  async uploadAttachment(messageId: string, fileUri: string, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    const fileName = fileUri.split('/').pop() || 'file';
    const mimeType = this.getMimeType(fileName);

    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

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
      xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      xhr.send(formData);
    });
  }

  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

// ===== FILE MANAGER =====

class FileManager {
  private downloadQueue: Map<string, Promise<string>> = new Map();

  async downloadFile(fileUrl: string, fileName: string): Promise<string> {
    const fileId = `${fileName}_${Date.now()}`;
    
    if (this.downloadQueue.has(fileId)) {
      return this.downloadQueue.get(fileId)!;
    }

    const downloadPromise = this.performDownload(fileUrl, fileName);
    this.downloadQueue.set(fileId, downloadPromise);
    
    try {
      const result = await downloadPromise;
      this.downloadQueue.delete(fileId);
      return result;
    } catch (error) {
      this.downloadQueue.delete(fileId);
      throw error;
    }
  }

  private async performDownload(fileUrl: string, fileName: string): Promise<string> {
    const downloadDir = `${FileSystem.documentDirectory}downloads/`;
    const fileUri = `${downloadDir}${fileName}`;

    // Ensure download directory exists
    const dirInfo = await FileSystem.getInfoAsync(downloadDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
    }

    // Download file
    const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);
    
    if (downloadResult.status !== 200) {
      throw new Error(`Download failed with status ${downloadResult.status}`);
    }

    return downloadResult.uri;
  }

  async saveToGallery(fileUri: string): Promise<void> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    await MediaLibrary.saveToLibraryAsync(fileUri);
  }

  async shareFile(fileUri: string): Promise<void> {
    // This would integrate with the device's share functionality
    // Implementation depends on the specific sharing library used
    console.log('Sharing file:', fileUri);
  }
}

// ===== NOTIFICATION MANAGER =====

class NotificationManager {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    // Only initialize notifications on mobile platforms
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web platform');
      this.isInitialized = true;
      return;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    this.isInitialized = true;
  }

  async scheduleLocalNotification(title: string, body: string, data?: any) {
    await this.initialize();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Immediate
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// ===== MAIN CHAT SERVICE =====

class MobileChatService {
  private wsManager = new WebSocketManager();
  private apiClient = new ApiClient();
  private fileManager = new FileManager();
  private notificationManager = new NotificationManager();
  private settings: ChatSettings = {
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    autoDownloadMedia: true,
    maxFileSize: 10,
    theme: 'auto',
    language: 'en',
  };

  // Initialize the service
  async initialize(token: string) {
    this.apiClient.setToken(token);
    await this.loadSettings();
    await this.notificationManager.initialize();
  }

  // Settings management
  async loadSettings() {
    try {
      const stored = await AsyncStorage.getItem('chatSettings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load chat settings:', error);
    }
  }

  async saveSettings(settings: Partial<ChatSettings>) {
    this.settings = { ...this.settings, ...settings };
    try {
      await AsyncStorage.setItem('chatSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save chat settings:', error);
    }
  }

  getSettings(): ChatSettings {
    return { ...this.settings };
  }

  // WebSocket management
  connect(userId: string) {
    this.wsManager.connect(userId);
  }

  disconnect() {
    this.wsManager.disconnect();
  }

  getConnectionStatus() {
    return this.wsManager.getConnectionStatus();
  }

  getTypingUsers(channelId: string) {
    return this.wsManager.getTypingUsers(channelId);
  }

  // Event listeners
  on(eventType: string, callback: Function) {
    this.wsManager.addEventListener(eventType, callback);
  }

  off(eventType: string, callback: Function) {
    this.wsManager.removeEventListener(eventType, callback);
  }

  // Channel operations
  async getChannels(): Promise<ChatChannel[]> {
    return this.apiClient.getChannels();
  }

  async getChannel(id: string): Promise<ChatChannel> {
    return this.apiClient.getChannel(id);
  }

  async createChannel(form: any): Promise<ChatChannel> {
    return this.apiClient.createChannel(form);
  }

  // Message operations
  async getMessages(channelId: string, page: number = 1): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    return this.apiClient.getMessages(channelId, page);
  }

  async sendMessage(channelId: string, content: string, attachments?: string[]): Promise<ChatMessage> {
    const form = { content, messageType: 'text' as const };
    const message = await this.apiClient.sendMessage(channelId, form);

    // Handle attachments
    if (attachments && attachments.length > 0) {
      for (const fileUri of attachments) {
        await this.apiClient.uploadAttachment(message.id, fileUri);
      }
    }

    return message;
  }

  async updateMessage(messageId: string, content: string): Promise<ChatMessage> {
    return this.apiClient.updateMessage(messageId, content);
  }

  async deleteMessage(messageId: string): Promise<void> {
    return this.apiClient.deleteMessage(messageId);
  }

  async markAsRead(messageId: string): Promise<void> {
    return this.apiClient.markAsRead(messageId);
  }

  // File operations
  async pickImage(): Promise<string | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  }

  async pickVideo(): Promise<string | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  }

  async pickDocument(): Promise<string | null> {
    // Document picker functionality would be implemented here
    // For now, return null as placeholder
    console.log('Document picker not implemented yet');
    return null;
  }

  async downloadFile(fileUrl: string, fileName: string, onProgress?: (progress: number) => void): Promise<string> {
    return this.fileManager.downloadFile(fileUrl, fileName);
  }

  async saveToGallery(fileUri: string): Promise<void> {
    return this.fileManager.saveToGallery(fileUri);
  }

  async shareFile(fileUri: string): Promise<void> {
    return this.fileManager.shareFile(fileUri);
  }

  // Notification operations
  async sendNotification(title: string, body: string, data?: any): Promise<void> {
    if (this.settings.notificationsEnabled) {
      await this.notificationManager.scheduleLocalNotification(title, body, data);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await this.notificationManager.cancelAllNotifications();
  }

  // Typing indicators
  sendTyping(channelId: string, isTyping: boolean) {
    this.wsManager.sendTyping(channelId, isTyping);
  }

  markMessageRead(messageId: string, channelId: string) {
    this.wsManager.markMessageRead(messageId, channelId);
  }
}

// Export singleton instance
export const mobileChatService = new MobileChatService();