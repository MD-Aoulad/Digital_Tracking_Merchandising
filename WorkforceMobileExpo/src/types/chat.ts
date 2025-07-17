// Mobile Chat System Types
// Comprehensive type definitions for the mobile chat system

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'general' | 'project' | 'department' | 'private' | 'announcement';
  isPrivate: boolean;
  isArchived: boolean;
  isReadonly: boolean;
  maxMembers: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  settings: ChannelSettings;
  metadata: Record<string, any>;
  memberCount?: number;
  lastMessage?: ChatMessage;
  userRole?: 'owner' | 'admin' | 'moderator' | 'member';
  unreadCount?: number;
}

export interface ChannelSettings {
  allowFileSharing: boolean;
  allowReactions: boolean;
  allowEditing: boolean;
  allowDeletion: boolean;
  editTimeLimit: number; // minutes
  deletionTimeLimit: number; // minutes
  maxFileSize: number; // bytes
  allowedFileTypes: string[];
  autoArchive: boolean;
  archiveAfterDays: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'system' | 'announcement';
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
  sender?: ChatUser;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  replyTo?: ChatMessage;
  threadId?: string;
  threadCount?: number;
  isRead?: boolean;
  readBy?: string[];
  localId?: string; // For offline messages
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  mimeType: string;
  localPath?: string; // For mobile file handling
  downloadProgress?: number;
  isDownloading?: boolean;
}

export interface MessageReaction {
  id: string;
  reactionType: string;
  userId: string;
  userName?: string;
  count?: number;
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isOnline: boolean;
  lastSeenAt: string;
  isTyping: boolean;
  status: UserStatus;
  avatar?: string;
  phoneNumber?: string;
}

export interface UserStatus {
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  lastSeenAt: string;
  isTyping: boolean;
  updatedAt: string;
}

export interface CreateChannelForm {
  name: string;
  description?: string;
  type: 'general' | 'project' | 'department' | 'private' | 'announcement';
  isPrivate: boolean;
  maxMembers: number;
  initialMembers?: string[];
}

export interface SendMessageForm {
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
  replyToId?: string;
  threadId?: string;
  attachments?: File[];
}

export interface FlagMessageForm {
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: string;
}

export interface GDPRRequestForm {
  requestType: 'data_export' | 'data_deletion' | 'data_correction';
  reason?: string;
  dataTypes?: string[];
}

export interface ChatSearchFilters {
  channelId?: string;
  userId?: string;
  messageType?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean;
  isFlagged?: boolean;
  isEdited?: boolean;
  content?: string;
  tags?: string[];
}

export interface ChatSearchResult {
  data: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ChatAnalytics {
  totalMessages: number;
  activeUsers: number;
  avgMessagesPerDay: number;
  peakHour: number;
  flaggedMessages: number;
  fileShares: number;
  reactionsCount: number;
}

export interface ContentModeration {
  id: string;
  messageId: string;
  flaggedBy: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: string;
  actionTaken?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ChatChannelsResponse {
  data: ChatChannel[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ChatMessagesResponse {
  data: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Mobile-specific types
export interface MobileChatSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showMessagePreview: boolean;
  autoDownloadMedia: boolean;
  downloadOverWifiOnly: boolean;
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  timezone: string;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data: Record<string, any>;
  channelId?: string;
  messageId?: string;
  senderId?: string;
  type: 'message' | 'mention' | 'reaction' | 'channel_invite' | 'system';
  timestamp: string;
  isRead: boolean;
}

export interface OfflineMessage {
  localId: string;
  channelId: string;
  content: string;
  messageType: string;
  attachments?: MessageAttachment[];
  replyToId?: string;
  threadId?: string;
  createdAt: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
}

export interface MediaUpload {
  id: string;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
}

export interface ChatNotification {
  id: string;
  type: 'message' | 'mention' | 'reaction' | 'channel_invite' | 'system';
  title: string;
  body: string;
  data: Record<string, any>;
  timestamp: string;
  isRead: boolean;
  channelId?: string;
  messageId?: string;
  senderId?: string;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'message_sent' | 'message_updated' | 'message_deleted' | 'typing_start' | 'typing_stop' | 'message_read' | 'reaction_added' | 'reaction_removed' | 'user_joined' | 'user_left' | 'channel_updated' | 'notification';
  data: any;
  timestamp: string;
}

// File handling types
export interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  path?: string;
}

export interface ImageInfo extends FileInfo {
  width: number;
  height: number;
  orientation?: number;
}

export interface VideoInfo extends FileInfo {
  duration: number;
  width: number;
  height: number;
  thumbnail?: string;
}

export interface AudioInfo extends FileInfo {
  duration: number;
  bitrate?: number;
  sampleRate?: number;
} 