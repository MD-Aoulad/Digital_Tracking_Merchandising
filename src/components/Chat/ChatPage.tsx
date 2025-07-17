/**
 * Professional Enterprise Chat System - Workforce Management Platform
 * 
 * Modern team communication platform with:
 * - Real-time messaging with WebSocket support
 * - Professional channel management
 * - File sharing and media support
 * - Message reactions and threading
 * - Advanced search and filtering
 * - Compliance and moderation tools
 * - GDPR compliance features
 * - Analytics and reporting
 * 
 * @author Workforce Management Team
 * @version 3.0.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Search, 
  Plus, 
  MoreVertical, 
  Flag, 
  Edit, 
  Trash2, 
  Reply, 
  Download, 
  Users, 
  BarChart3, 
  Shield,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  X,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Settings,
  UserPlus,
  Hash,
  Lock,
  Globe,
  Wifi,
  WifiOff,
  Clock,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Video as VideoIcon,
  VideoOff,
  MoreHorizontal,
  Star,
  StarOff,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Clock as ClockIcon,
  User,
  UserCheck,
  UserX,
  Shield as ShieldIcon,
  Zap,
  ZapOff,
  Database,
  Download as DownloadIcon,
  Upload,
  Copy,
  ExternalLink,
  Link,
  Unlink,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  File,
  Folder,
  FolderOpen,
  Tag,
  Bookmark,
  BookmarkPlus,
  BookmarkMinus,
  Share,
  Share2,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Grid,
  List,
  Sidebar,
  SidebarClose,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Home,
  LogOut,
  LogIn,
  UserPlus as UserPlusIcon,
  UserMinus,
  Key,
  Lock as LockIcon,
  Unlock,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Cloud,
  CloudOff,
  Globe as GlobeIcon,
  Map,
  MapPin,
  Navigation,
  Compass,
  Target,
  Crosshair,
  Award,
  Trophy,
  Medal,
  Badge,
  GraduationCap,
  School,
  University,
  Building,
  Building2,
  Home as HomeIcon,
  Store,
  ShoppingCart,
  ShoppingBag,
  Package,
  Truck,
  Car,
  Bike,
  Plane,
  Ship,
  Train,
  Bus,
  Rocket,
  Satellite,
  Wifi as WifiIcon,
  Bluetooth,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Power,
  PowerOff,
  Zap as ZapIcon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Sun as SunIcon,
  Moon as MoonIcon,
  Star as StarIcon,
  Infinity,
  Pi,
  Sigma,
  Omega
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChatChannel, 
  ChatMessage, 
  ChatUser,
  CreateChannelForm,
  FlagMessageForm,
  GDPRRequestForm
} from '../../types/chat';
import { 
  useChannels, 
  useMessages, 
  useRealtimeUpdates, 
  wsApi,
  channelApi,
  messageApi,
  moderationApi,
  searchApi,
  analyticsApi,
  gdprApi
} from '../../services/chatApi';

// --- Professional Connection Status Component ---
const ConnectionStatus: React.FC<{ status: string }> = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return { 
          icon: Wifi, 
          color: 'text-emerald-500', 
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          text: 'Connected',
          description: 'Real-time messaging active'
        };
      case 'connecting':
        return { 
          icon: RefreshCw, 
          color: 'text-amber-500', 
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          text: 'Connecting...',
          description: 'Establishing connection'
        };
      case 'disconnected':
        return { 
          icon: WifiOff, 
          color: 'text-red-500', 
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Disconnected',
          description: 'Connection lost'
        };
      default:
        return { 
          icon: WifiOff, 
          color: 'text-gray-500', 
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Unknown',
          description: 'Connection status unknown'
        };
    }
  };

  const { icon: Icon, color, bgColor, borderColor, text, description } = getStatusInfo();

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${bgColor} ${borderColor}`}>
      <div className={`flex items-center space-x-1 ${color}`}>
        <Icon className={`w-4 h-4 ${status === 'connecting' ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">{text}</span>
      </div>
      <span className="text-xs text-gray-500">{description}</span>
    </div>
  );
};

// --- Professional Channel Creation Modal ---
const CreateChannelModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (formData: CreateChannelForm) => Promise<void>;
  loading: boolean;
}> = ({ isOpen, onClose, onCreateChannel, loading }) => {
  const [formData, setFormData] = useState<CreateChannelForm>({
    name: '',
    description: '',
    type: 'general',
    isPrivate: false,
    maxMembers: 100,
    initialMembers: [],
    settings: {
      allowFileSharing: true,
      allowReactions: true,
      allowEditing: true,
      allowDeletion: true,
      editTimeLimit: 60,
      deletionTimeLimit: 1440,
      messageRetentionDays: 365,
      autoArchive: false,
      archiveAfterDays: 30,
      requireApproval: false,
      moderationEnabled: false,
      profanityFilter: true,
      linkPreview: true,
      threadReplies: true,
      pinnedMessages: true
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      await onCreateChannel(formData);
      setFormData({
        name: '',
        description: '',
        type: 'general',
        isPrivate: false,
        maxMembers: 100,
        initialMembers: [],
        settings: {
          allowFileSharing: true,
          allowReactions: true,
          allowEditing: true,
          allowDeletion: true,
          editTimeLimit: 60,
          deletionTimeLimit: 1440,
          messageRetentionDays: 365,
          autoArchive: false,
          archiveAfterDays: 30,
          requireApproval: false,
          moderationEnabled: false,
          profanityFilter: true,
          linkPreview: true,
          threadReplies: true,
          pinnedMessages: true
        }
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Create New Channel</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel Name *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., general, announcements, projects"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this channel about?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-700">Private Channel</label>
                  <p className="text-xs text-gray-500">Only invited members can join</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isPrivate ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isPrivate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Paperclip className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-700">Allow File Uploads</label>
                  <p className="text-xs text-gray-500">Members can share files and images</p>
                </div>
              </div>
                             <button
                 type="button"
                 onClick={() => setFormData({ 
                   ...formData, 
                   settings: { 
                     ...formData.settings, 
                     allowFileSharing: !formData.settings.allowFileSharing 
                   } 
                 })}
                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                   formData.settings.allowFileSharing ? 'bg-blue-600' : 'bg-gray-200'
                 }`}
               >
                 <span
                   className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                     formData.settings.allowFileSharing ? 'translate-x-6' : 'translate-x-1'
                   }`}
                 />
               </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-700">Allow Reactions</label>
                  <p className="text-xs text-gray-500">Members can react to messages</p>
                </div>
              </div>
                             <button
                 type="button"
                 onClick={() => setFormData({ 
                   ...formData, 
                   settings: { 
                     ...formData.settings, 
                     allowReactions: !formData.settings.allowReactions 
                   } 
                 })}
                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                   formData.settings.allowReactions ? 'bg-blue-600' : 'bg-gray-200'
                 }`}
               >
                 <span
                   className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                     formData.settings.allowReactions ? 'translate-x-6' : 'translate-x-1'
                   }`}
                 />
               </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Channel'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Professional Channel Sidebar ---
const ChannelSidebar: React.FC<{
  channels: ChatChannel[];
  currentUser: ChatUser;
  selectedChannelId: string | null;
  onSelectChannel: (id: string) => void;
  onCreateChannel: () => void;
  onSearchChannels: (query: string) => void;
  connectionStatus: string;
  loading: boolean;
  error: string | null;
}> = ({ 
  channels, 
  currentUser, 
  selectedChannelId, 
  onSelectChannel, 
  onCreateChannel, 
  onSearchChannels,
  connectionStatus,
  loading,
  error
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearchChannels(query);
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm">
      {/* Professional Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Team Chat</h2>
              <p className="text-xs text-gray-500">Professional Communication</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ConnectionStatus status={connectionStatus} />
          </div>
        </div>
        
        {/* Search and Actions */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <button
            onClick={onCreateChannel}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Create new channel"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Channel List */}
      <nav className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <span className="text-gray-500 text-sm">Loading channels...</span>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {channels.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No channels yet</h3>
                <p className="text-gray-500 text-sm mb-4">Create your first channel to start team communication</p>
                <button
                  onClick={onCreateChannel}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Channel</span>
                </button>
              </div>
            ) : (
              channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                    selectedChannelId === channel.id
                      ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                      : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        channel.isPrivate 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {channel.isPrivate ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Hash className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate">#{channel.name}</span>
                          {channel.isPrivate && (
                            <Lock className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        {channel.description && (
                          <p className="text-sm text-gray-500 truncate">{channel.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{channel.memberCount || 0}</span>
                    </div>
                  </div>
                  {channel.lastMessage && (
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span className="truncate flex-1">{channel.lastMessage.content}</span>
                      <span className="ml-2 flex-shrink-0">
                        {new Date(channel.lastMessage.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </nav>

      {/* User Status Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">{currentUser.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Message Status Indicator (WhatsApp-like)
const MessageStatus: React.FC<{ message: ChatMessage; isOwnMessage: boolean }> = ({ 
  message, 
  isOwnMessage 
}) => {
  if (!isOwnMessage) return null;

  const getStatusIcon = () => {
    if (message.isDeleted) return null;
    
    // Check if message has been read
    if (message.readBy && message.readBy.length > 0) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }
    
    // Message sent but not read
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  const getStatusText = () => {
    if (message.isDeleted) return 'Deleted';
    if (message.readBy && message.readBy.length > 0) return 'Read';
    return 'Sent';
  };

  return (
    <div className="flex items-center space-x-1 text-xs text-gray-400">
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
};

// Enhanced ChatWindow with file upload, reactions, and real-time features
const ChatWindow: React.FC<{
  channel: ChatChannel | null;
  messages: ChatMessage[];
  currentUser: ChatUser;
  onSendMessage: (content: string, attachments?: File[]) => void;
  onFlagMessage: (messageId: string, reason: string) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onAddReaction: (messageId: string, reaction: string) => void;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  typingUsers: string[];
}> = ({ 
  channel, 
  messages, 
  currentUser, 
  onSendMessage, 
  onFlagMessage, 
  onEditMessage, 
  onDeleteMessage, 
  onAddReaction,
  loading,
  error,
  hasMore,
  onLoadMore,
  typingUsers
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing indicator management
  useEffect(() => {
    if (isTyping) {
      wsApi.sendTyping(channel?.id || '', true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        wsApi.sendTyping(channel?.id || '', false);
      }, 3000);
    } else {
      wsApi.sendTyping(channel?.id || '', false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, channel?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && attachments.length === 0) return;

    if (editingMessage) {
      onEditMessage(editingMessage.id, messageInput);
      setEditingMessage(null);
    } else {
      onSendMessage(messageInput, attachments);
    }

    setMessageInput('');
    setAttachments([]);
    setIsTyping(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const startEdit = (message: ChatMessage) => {
    setEditingMessage(message);
    setMessageInput(message.content);
  };

  const saveEdit = () => {
    if (editingMessage && messageInput.trim()) {
      onEditMessage(editingMessage.id, messageInput);
      setEditingMessage(null);
      setMessageInput('');
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setMessageInput('');
  };

  const handleUploadProgress = (fileId: string, progress: number) => {
    setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Hash className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Channel</h3>
          <p className="text-gray-500">Choose a channel from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Channel Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {channel.isPrivate ? (
              <Lock className="w-5 h-5 text-gray-400" />
            ) : (
              <Hash className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">#{channel.name}</h2>
              <p className="text-sm text-gray-500">
                {channel.memberCount || 0} members • {channel.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {typingUsers.length > 0 && (
              <div className="text-sm text-gray-500">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-500">Loading messages...</span>
          </div>
        )}

        {hasMore && (
          <button
            onClick={onLoadMore}
            className="w-full p-2 text-sm text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            Load more messages
          </button>
        )}

        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUser.id;
          const isEdited = message.isEdited && !message.isDeleted;

          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                {!isOwnMessage && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {message.sender?.name?.[0] || 'U'}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {message.sender?.name || 'Unknown User'}
                    </span>
                  </div>
                )}
                
                <div
                  className={`p-3 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.isDeleted ? (
                    <div className="flex items-center space-x-2 text-gray-400 italic">
                      <Trash2 className="w-3 h-3" />
                      <span>This message was deleted</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{message.content}</p>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center space-x-2 p-2 bg-black bg-opacity-10 rounded"
                            >
                              {attachment.mimeType.startsWith('image/') ? (
                                <ImageIcon className="w-4 h-4" />
                              ) : attachment.mimeType.startsWith('video/') ? (
                                <Video className="w-4 h-4" />
                              ) : attachment.mimeType.startsWith('audio/') ? (
                                <Music className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                              <span className="text-xs truncate">{attachment.fileName}</span>
                              <button
                                onClick={() => window.open(attachment.fileUrl, '_blank')}
                                className="text-xs underline hover:no-underline"
                              >
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message Metadata */}
                      <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                        <div className="flex items-center space-x-2">
                          <span>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isEdited && <span className="italic">(edited)</span>}
                        </div>
                        <MessageStatus message={message} isOwnMessage={isOwnMessage} />
                      </div>

                      {/* Message Actions */}
                      {!message.isDeleted && (
                        <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isOwnMessage && (
                            <>
                              <button
                                onClick={() => startEdit(message)}
                                className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteMessage(message.id)}
                                className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onFlagMessage(message.id, 'Inappropriate content')}
                            className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {editingMessage && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-800">Editing message</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={saveEdit}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Attachments ({attachments.length})</span>
              <button
                onClick={() => setAttachments([])}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                    ) : file.type.startsWith('video/') ? (
                      <Video className="w-4 h-4 text-purple-500" />
                    ) : file.type.startsWith('audio/') ? (
                      <Music className="w-4 h-4 text-green-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="p-1 text-red-500 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button
            type="submit"
            disabled={(!messageInput.trim() && attachments.length === 0) || loading}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

// Enhanced InfoPanel with compliance and analytics
const InfoPanel: React.FC<{
  channel: ChatChannel | null;
  currentUser: ChatUser;
  onRequestDataExport: () => void;
  onViewFlaggedMessages: () => void;
}> = ({ channel, currentUser, onRequestDataExport, onViewFlaggedMessages }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'analytics' | 'compliance'>('info');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (channel) {
      // Fetch channel analytics
      analyticsApi.getChannelAnalytics(channel.id, 30).then(setAnalytics);
    }
  }, [channel]);

  if (!channel) {
    return (
      <aside className="w-80 bg-gray-50 border-l border-gray-200 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Channel Info</h3>
        </div>
        <div className="p-4 text-gray-400 text-center">
          Select a channel to view information
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-gray-50 border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Channel Info</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'info'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'members'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'analytics'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'compliance'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Compliance
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700">{channel.description || 'No description provided.'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Channel Type</h4>
              <div className="flex items-center space-x-2">
                {channel.isPrivate ? (
                  <>
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Private Channel</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Public Channel</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Created</h4>
              <p className="text-gray-700">{new Date(channel.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Members ({channel.memberCount || 0})</h4>
              <button className="text-blue-600 hover:text-blue-700 text-sm">
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {/* TODO: Fetch and display actual members */}
              <div className="flex items-center space-x-3 p-2 bg-white rounded">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Alice Manager</p>
                  <p className="text-xs text-gray-500">Owner</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Channel Analytics</h4>
            {analytics ? (
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total_messages}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.active_users}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Avg Messages/Day</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.avg_messages_per_day}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading analytics...</p>
            )}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Compliance & Moderation</h4>
            <div className="space-y-3">
              <button
                onClick={onViewFlaggedMessages}
                className="w-full flex items-center space-x-2 p-3 bg-white rounded-lg hover:bg-gray-50"
              >
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700">View Flagged Messages</span>
              </button>
              <button
                onClick={onRequestDataExport}
                className="w-full flex items-center space-x-2 p-3 bg-white rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700">Request Data Export</span>
              </button>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm text-gray-500">Data Retention</p>
                <p className="text-sm font-medium text-gray-900">365 days</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm text-gray-500">Encryption</p>
                <p className="text-sm font-medium text-gray-900">Standard</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

// --- Main ChatPage Component ---

const ChatPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showFlaggedMessagesModal, setShowFlaggedMessagesModal] = useState(false);
  const [showGdprModal, setShowGdprModal] = useState(false);
  const [createChannelLoading, setCreateChannelLoading] = useState(false);

  // Convert user to ChatUser format
  const currentUser: ChatUser = {
    id: user?.id?.toString() || '0',
    name: user?.name || 'Unknown User',
    email: user?.email || 'unknown@example.com',
    role: user?.role || 'employee',
    status: {
      status: 'online',
      lastSeenAt: new Date().toISOString(),
      isTyping: false,
      updatedAt: new Date().toISOString()
    },
    isOnline: true,
    lastSeenAt: new Date().toISOString(),
    isTyping: false
  };

  // Use custom hooks for data management
  const { channels, loading: channelsLoading, error: channelsError, refreshChannels } = useChannels();
  const { 
    messages, 
    loading: messagesLoading, 
    error: messagesError, 
    hasMore, 
    loadMoreMessages, 
    addMessage, 
    updateMessage, 
    removeMessage, 
    refreshMessages 
  } = useMessages(selectedChannelId);
  
  // Real-time updates
  const { connectionStatus } = useRealtimeUpdates(selectedChannelId);

  // WebSocket connection
  useEffect(() => {
    if (user?.id) {
      wsApi.connect(user.id).catch((error: unknown) => {
        console.log('WebSocket connection failed:', error);
      });
      return () => wsApi.disconnect();
    }
  }, [user?.id]);

  // Handle channel creation
  const handleCreateChannel = async (formData: CreateChannelForm) => {
    try {
      setCreateChannelLoading(true);
      
      // Check if user is logged in
      if (!user) {
        throw new Error('You must be logged in to create a channel. Please log in first.');
      }
      
      // Debug: Check authentication status
      const token = localStorage.getItem('authToken');
      console.log('Auth token exists:', !!token);
      console.log('Current user:', currentUser);
      console.log('Auth context user:', user);
      console.log('Auth context loading:', isLoading);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      await channelApi.createChannel(formData);
      await refreshChannels();
      setShowCreateChannelModal(false);
    } catch (error) {
      console.error('Failed to create channel:', error);
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to create channel: ${errorMessage}`);
    } finally {
      setCreateChannelLoading(false);
    }
  };

  const selectedChannel = channels.find(c => c.id === selectedChannelId) || null;

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedChannelId) return;
    
    try {
      const form = { content, messageType: 'text' as const };
      const newMessage = await messageApi.sendMessage(selectedChannelId, form);
      
      // Handle file uploads if any
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          await messageApi.uploadAttachment(newMessage.id, file);
        }
      }
      
      addMessage(newMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFlagMessage = async (messageId: string, reason: string) => {
    try {
      await messageApi.flagMessage(messageId, { reason, severity: 'medium' });
      alert('Message flagged successfully');
    } catch (error) {
      console.error('Failed to flag message:', error);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await messageApi.updateMessage(messageId, content);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messageApi.deleteMessage(messageId);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  const handleAddReaction = async (messageId: string, reaction: string) => {
    try {
      await messageApi.addReaction(messageId, reaction);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleSearchChannels = async (query: string) => {
    if (query.trim()) {
      try {
        const results = await searchApi.searchChannels(query);
        // TODO: Update channels list with search results
      } catch (error) {
        console.error('Failed to search channels:', error);
      }
    }
  };

  const handleRequestDataExport = () => {
    setShowGdprModal(true);
  };

  const handleViewFlaggedMessages = () => {
    setShowFlaggedMessagesModal(true);
  };

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    // Debug: Check authentication status
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    console.log('=== AUTH DEBUG ===');
    console.log('Auth token exists:', !!token);
    console.log('User data exists:', !!userData);
    console.log('Auth context user:', user);
    console.log('Auth context loading:', isLoading);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('User data:', userData);
    console.log('==================');
    
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">You must be logged in to access the chat system.</p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-500">Token: {token ? 'Present' : 'Missing'}</p>
            <p className="text-sm text-gray-500">User Data: {userData ? 'Present' : 'Missing'}</p>
            <p className="text-sm text-gray-500">Loading: {isLoading ? 'Yes' : 'No'}</p>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (channelsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (channelsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Chat</h2>
          <p className="text-gray-600">{channelsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
      <ChannelSidebar
        channels={channels}
        currentUser={currentUser}
        selectedChannelId={selectedChannelId}
        onSelectChannel={setSelectedChannelId}
        onCreateChannel={() => setShowCreateChannelModal(true)}
        onSearchChannels={handleSearchChannels}
        connectionStatus={connectionStatus}
        loading={channelsLoading}
        error={channelsError}
      />
      <ChatWindow
        channel={selectedChannel}
        messages={messages}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
        onFlagMessage={handleFlagMessage}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onAddReaction={handleAddReaction}
        loading={messagesLoading}
        error={messagesError}
        hasMore={hasMore}
        onLoadMore={loadMoreMessages}
        typingUsers={wsApi.getTypingUsers()}
      />
      <InfoPanel
        channel={selectedChannel}
        currentUser={currentUser}
        onRequestDataExport={handleRequestDataExport}
        onViewFlaggedMessages={handleViewFlaggedMessages}
      />

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={showCreateChannelModal}
        onClose={() => setShowCreateChannelModal(false)}
        onCreateChannel={handleCreateChannel}
        loading={createChannelLoading}
      />
    </div>
  );
};

export default ChatPage;
