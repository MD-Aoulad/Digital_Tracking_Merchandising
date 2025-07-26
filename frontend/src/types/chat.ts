// Enterprise Chat System Types
// Comprehensive type definitions for the chat system

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
}

export interface ChannelSettings {
  allowFileSharing: boolean;
  allowReactions: boolean;
  allowEditing: boolean;
  allowDeletion: boolean;
  editTimeLimit: number; // minutes
  deletionTimeLimit: number; // minutes
  messageRetentionDays: number;
  autoArchive: boolean;
  archiveAfterDays: number;
  requireApproval: boolean;
  moderationEnabled: boolean;
  profanityFilter: boolean;
  linkPreview: boolean;
  threadReplies: boolean;
  pinnedMessages: boolean;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'video' | 'audio' | 'location' | 'system';
  replyToId?: string;
  threadId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  isFlagged: boolean;
  flagReason?: string;
  flaggedBy?: string;
  flaggedAt?: string;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  deletedAt?: string;
  metadata: MessageMetadata;
  complianceData: ComplianceData;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  readBy?: string[];
  sender?: ChatUser;
  replyTo?: ChatMessage;
  threadMessages?: ChatMessage[];
}

export interface MessageMetadata {
  clientInfo?: {
    platform: string;
    version: string;
    userAgent: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  editHistory?: {
    previousContent: string;
    editedAt: string;
    editedBy: string;
  }[];
  flags?: {
    reason: string;
    flaggedBy: string;
    flaggedAt: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

export interface ComplianceData {
  gdprCompliant: boolean;
  retentionPolicy: string;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  encryptionLevel: 'none' | 'standard' | 'high' | 'military';
  auditTrail: boolean;
  legalHold: boolean;
  exportable: boolean;
  deletionAllowed: boolean;
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
  isEncrypted: boolean;
  encryptionKeyId?: string;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  reactionType: string;
  createdAt: string;
  user?: ChatUser;
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department?: string;
  status: UserStatus;
  isOnline: boolean;
  lastSeenAt: string;
  isTyping: boolean;
  typingInChannel?: string;
  customStatus?: string;
}

export interface UserStatus {
  status: 'online' | 'away' | 'busy' | 'offline' | 'invisible';
  customStatus?: string;
  lastSeenAt: string;
  isTyping: boolean;
  typingInChannel?: string;
  updatedAt: string;
}

export interface ChatSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  mobileNotifications: boolean;
  emailNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  messagePreview: boolean;
  readReceipts: boolean;
  typingIndicators: boolean;
  autoArchive: boolean;
  archiveAfterDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelMember {
  id: string;
  channelId: string;
  userId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  notificationSettings: NotificationSettings;
  permissions: MemberPermissions;
  user?: ChatUser;
}

export interface NotificationSettings {
  mentions: boolean;
  allMessages: boolean;
  importantOnly: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

export interface MemberPermissions {
  canSendMessages: boolean;
  canEditMessages: boolean;
  canDeleteMessages: boolean;
  canPinMessages: boolean;
  canInviteUsers: boolean;
  canRemoveUsers: boolean;
  canManageChannel: boolean;
  canViewHistory: boolean;
  canExportData: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'video' | 'audio';
  replyToId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  metadata: Record<string, any>;
  sender?: ChatUser;
  recipient?: ChatUser;
  replyTo?: DirectMessage;
}

// Compliance and Audit Types

export interface AuditLogEntry {
  id: string;
  action: string;
  userId?: string;
  channelId?: string;
  messageId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface GDPRRequest {
  id: string;
  userId: string;
  requestType: 'data_export' | 'data_deletion' | 'data_correction';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  dataUrl?: string;
  notes?: string;
  processedBy?: string;
}

export interface ContentModeration {
  id: string;
  messageId: string;
  flaggedBy: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: string;
  actionTaken?: string;
  notes?: string;
  createdAt: string;
}

// Analytics and Reporting Types

export interface ChatAnalytics {
  id: string;
  channelId?: string;
  date: string;
  totalMessages: number;
  activeUsers: number;
  newMembers: number;
  leftMembers: number;
  flaggedMessages: number;
  avgResponseTimeMinutes: number;
  peakHour: number;
  createdAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  date: string;
  messagesSent: number;
  messagesReceived: number;
  channelsJoined: number;
  channelsLeft: number;
  timeSpentMinutes: number;
  lastActivityAt: string;
  createdAt: string;
}

export interface ChatReport {
  id: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  channelId?: string;
  generatedBy: string;
  dateFrom: string;
  dateTo: string;
  reportData: ReportData;
  generatedAt: string;
  status: 'generated' | 'sent' | 'archived';
}

export interface ReportData {
  summary: {
    totalMessages: number;
    totalUsers: number;
    totalChannels: number;
    avgMessagesPerUser: number;
    avgMessagesPerChannel: number;
  };
  topUsers: {
    userId: string;
    userName: string;
    messagesSent: number;
    messagesReceived: number;
    timeSpentMinutes: number;
  }[];
  topChannels: {
    channelId: string;
    channelName: string;
    messagesCount: number;
    activeUsers: number;
    avgResponseTimeMinutes: number;
  }[];
  activityByHour: {
    hour: number;
    messagesCount: number;
    activeUsers: number;
  }[];
  flaggedContent: {
    messageId: string;
    reason: string;
    severity: string;
    flaggedBy: string;
    flaggedAt: string;
  }[];
  complianceMetrics: {
    gdprRequests: number;
    dataExports: number;
    dataDeletions: number;
    auditLogEntries: number;
  };
}

// Search and Filter Types

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
  messages: ChatMessage[];
  totalCount: number;
  hasMore: boolean;
  searchTime: number;
  filters: ChatSearchFilters;
}

// Real-time Types

export interface TypingIndicator {
  userId: string;
  channelId: string;
  isTyping: boolean;
  startedAt: string;
  user?: ChatUser;
}

export interface ChatEvent {
  type: 'message_sent' | 'message_edited' | 'message_deleted' | 'user_joined' | 'user_left' | 'typing_started' | 'typing_stopped' | 'reaction_added' | 'reaction_removed' | 'message_pinned' | 'message_flagged';
  data: any;
  timestamp: string;
  userId?: string;
  channelId?: string;
}

// API Response Types

export interface ChatApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ChatChannelResponse extends ChatApiResponse<ChatChannel> {}
export interface ChatChannelsResponse extends ChatApiResponse<ChatChannel[]> {}
export interface ChatMessageResponse extends ChatApiResponse<ChatMessage> {}
export interface ChatMessagesResponse extends ChatApiResponse<ChatMessage[]> {}
export interface ChatSearchResponse extends ChatApiResponse<ChatSearchResult> {}
export interface ChatAnalyticsResponse extends ChatApiResponse<ChatAnalytics[]> {}
export interface ChatReportResponse extends ChatApiResponse<ChatReport> {}

// Form Types

export interface CreateChannelForm {
  name: string;
  description?: string;
  type: 'general' | 'project' | 'department' | 'private' | 'announcement';
  isPrivate: boolean;
  maxMembers: number;
  initialMembers: string[];
  settings: Partial<ChannelSettings>;
}

export interface SendMessageForm {
  content: string;
  messageType: 'text' | 'image' | 'file' | 'video' | 'audio' | 'location';
  replyToId?: string;
  threadId?: string;
  attachments?: File[];
  metadata?: Record<string, any>;
}

export interface UpdateMessageForm {
  content: string;
  metadata?: Record<string, any>;
}

export interface FlagMessageForm {
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

export interface GDPRRequestForm {
  requestType: 'data_export' | 'data_deletion' | 'data_correction';
  notes?: string;
}

export interface GenerateReportForm {
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  channelId?: string;
  dateFrom: string;
  dateTo: string;
  includeAnalytics: boolean;
  includeCompliance: boolean;
  includeUserActivity: boolean;
} 