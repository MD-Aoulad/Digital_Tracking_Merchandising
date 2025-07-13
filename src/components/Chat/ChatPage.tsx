/**
 * Enhanced Chat Page Component - Workforce Management Platform
 * 
 * Comprehensive team communication system with:
 * - Real-time messaging and chat rooms (Business Messenger)
 * - File and image sharing
 * - Group chat management
 * - Message search and history
 * - Online status indicators
 * - Message reactions and replies
 * - Help desk integration (Chat with Manager)
 * - Voice and video call integration
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  Phone,
  Video,
  UserPlus,
  Settings,
  Archive,
  Trash2,
  Edit,
  Reply,
  Heart,
  ThumbsUp,
  MessageSquare,
  Users,
  Hash,
  Bell,
  BellOff,
  HelpCircle,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Tag,
  Calendar,
  FileText,
  MapPin,
  Shield,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChatMessage, 
  ChatChannel, 
  HelpDeskChannel, 
  HelpDeskRequest, 
  ChatSettings,
  HelpDeskCategory,
  MessageType,
  AttachmentType,
  ChatGroup,
  ChatUserStatus,
  TypingIndicator
} from '../../types';
import toast from 'react-hot-toast';

/**
 * ChatPage Component
 * 
 * Enhanced team communication interface with business messenger
 * and help desk integration capabilities.
 * 
 * @returns JSX element with complete chat interface
 */
const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [helpDeskRequests, setHelpDeskRequests] = useState<HelpDeskRequest[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<HelpDeskRequest | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'channels' | 'help-desk' | 'direct'>('channels');
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null);
  const [userStatuses, setUserStatuses] = useState<ChatUserStatus[]>([]);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Initialize enhanced chat data
   */
  useEffect(() => {
    loadChatData();
  }, []);

  /**
   * Load comprehensive chat data
   */
  const loadChatData = async () => {
    try {
      // Mock chat settings
      const mockSettings: ChatSettings = {
        id: '1',
        isEnabled: true,
        allowFileSharing: true,
        maxFileSize: 10,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
        allowReactions: true,
        allowEditing: true,
        editTimeLimit: 5,
        allowDeletion: true,
        deletionTimeLimit: 10,
        messageRetentionDays: 365,
        helpDeskEnabled: true,
        helpDeskSettings: {
          autoAssignEnabled: true,
          defaultResponseTime: 24,
          escalationEnabled: true,
          escalationTimeLimit: 48,
          allowEmployeeCreation: false,
          requireApproval: true,
          categories: [HelpDeskCategory.PERSONNEL, HelpDeskCategory.VMD, HelpDeskCategory.INVENTORY],
          priorityLevels: ['low', 'medium', 'high', 'urgent']
        },
        notificationSettings: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          mentionNotifications: true,
          channelNotifications: true,
          helpDeskNotifications: true,
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00',
            timezone: 'UTC'
          }
        },
        createdBy: '1',
        updatedAt: new Date().toISOString()
      };

      // Mock channels
      const mockChannels: ChatChannel[] = [
        {
          id: '1',
          name: 'General',
          description: 'Company-wide announcements and general discussions',
          type: 'general',
          members: ['1', '2', '3'],
          admins: ['1'],
          createdBy: '1',
          isPrivate: false,
          isArchived: false,
          notificationSettings: {
            mentions: true,
            allMessages: false,
            importantOnly: true,
            quietHours: {
              enabled: false,
              startTime: '22:00',
              endTime: '08:00',
              timezone: 'UTC'
            }
          },
          memberCount: 3,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          lastMessage: {
            id: '1',
            senderId: '2',
            channelId: '1',
            content: 'Good morning team!',
            type: 'text',
            readBy: ['1', '3'],
            createdAt: '2024-01-15T09:00:00Z',
            updatedAt: '2024-01-15T09:00:00Z',
            isEdited: false,
            isDeleted: false
          }
        },
        {
          id: '2',
          name: 'Development Team',
          description: 'Development and technical discussions',
          type: 'project',
          members: ['1', '2'],
          admins: ['1'],
          createdBy: '1',
          isPrivate: true,
          isArchived: false,
          notificationSettings: {
            mentions: true,
            allMessages: true,
            importantOnly: false,
            quietHours: {
              enabled: false,
              startTime: '22:00',
              endTime: '08:00',
              timezone: 'UTC'
            }
          },
          memberCount: 2,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          lastMessage: {
            id: '2',
            senderId: '1',
            channelId: '2',
            content: 'Code review completed',
            type: 'text',
            readBy: ['2'],
            createdAt: '2024-01-15T14:30:00Z',
            updatedAt: '2024-01-15T14:30:00Z',
            isEdited: false,
            isDeleted: false
          }
        }
      ];

      // Mock help desk channels
      const mockHelpDeskChannels: HelpDeskChannel[] = [
        {
          id: 'hd1',
          name: 'Personnel Manager',
          description: 'Contact for vacation/annual leave, HR issues, and personnel matters',
          category: HelpDeskCategory.PERSONNEL,
          assignedManagers: ['1'],
          contactPersons: ['1'],
          topics: ['Vacation Request', 'Annual Leave', 'HR Issues', 'Benefits'],
          priority: 'medium',
          responseTime: 24,
          isActive: true,
          autoAssign: true,
          createdBy: '1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'hd2',
          name: 'VMD Manager',
          description: 'Contact for visual merchandising, store layout, and display issues',
          category: HelpDeskCategory.VMD,
          assignedManagers: ['2'],
          contactPersons: ['2'],
          topics: ['Store Layout', 'Display Issues', 'Visual Merchandising', 'Product Placement'],
          priority: 'high',
          responseTime: 12,
          isActive: true,
          autoAssign: true,
          createdBy: '1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      // Mock help desk requests
      const mockHelpDeskRequests: HelpDeskRequest[] = [
        {
          id: '1',
          channelId: 'hd1',
          requesterId: user?.id || '',
          requesterName: user?.name || '',
          requesterEmail: user?.email || '',
          title: 'Annual Leave Request',
          description: 'I would like to request annual leave for the week of March 15-19, 2024.',
          category: HelpDeskCategory.PERSONNEL,
          priority: 'medium',
          status: 'open',
          messages: [
            {
              id: '1',
              senderId: user?.id || '',
              channelId: 'hd1',
              content: 'I would like to request annual leave for the week of March 15-19, 2024.',
              type: 'help-desk',
              readBy: [user?.id || ''],
              createdAt: '2024-01-15T09:00:00Z',
              updatedAt: '2024-01-15T09:00:00Z',
              isEdited: false,
              isDeleted: false
            }
          ],
          tags: ['leave', 'annual'],
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z'
        }
      ];

      // Mock messages
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          senderId: '2',
          channelId: '1',
          content: 'Good morning team! How is everyone doing today?',
          type: 'text',
          readBy: ['1', '3'],
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z',
          isEdited: false,
          isDeleted: false
        },
        {
          id: '2',
          senderId: '1',
          channelId: '1',
          content: 'Morning! I\'m working on the new feature. Should be ready by EOD.',
          type: 'text',
          readBy: ['2', '3'],
          createdAt: '2024-01-15T09:05:00Z',
          updatedAt: '2024-01-15T09:05:00Z',
          isEdited: false,
          isDeleted: false
        },
        {
          id: '3',
          senderId: '3',
          channelId: '1',
          content: 'Great! I\'ll review it once it\'s ready.',
          type: 'text',
          readBy: ['1', '2'],
          createdAt: '2024-01-15T09:10:00Z',
          updatedAt: '2024-01-15T09:10:00Z',
          isEdited: false,
          isDeleted: false
        }
      ];

      setChatSettings(mockSettings);
      setChannels(mockChannels);
      setHelpDeskRequests(mockHelpDeskRequests);
      setMessages(mockMessages);
      setSelectedChannel(mockChannels[0]);
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast.error('Failed to load chat data');
    }
  };

  /**
   * Scroll to bottom of messages
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Send new message
   */
  const sendMessage = () => {
    if (!newMessage.trim() || (!selectedChannel && !selectedGroup)) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      channelId: selectedChannel?.id,
      receiverId: selectedGroup?.id,
      content: newMessage,
      type: 'text',
      readBy: [user?.id || ''],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setReplyTo(null);
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || (!selectedChannel && !selectedGroup)) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      channelId: selectedChannel?.id,
      receiverId: selectedGroup?.id,
      content: `📎 ${file.name}`,
      type: 'file',
      attachments: [{
        id: Date.now().toString(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size,
        url: URL.createObjectURL(file),
        mimeType: file.type,
        uploadedAt: new Date().toISOString()
      }],
      readBy: [user?.id || ''],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false
    };

    setMessages(prev => [...prev, message]);
    toast.success('File uploaded successfully');
  };

  /**
   * Trigger file upload
   */
  const triggerFileUpload = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  /**
   * Add reaction to message
   */
  const addReaction = (messageId: string, reaction: string) => {
    if (!chatSettings?.allowReactions) return;
    
    setMessages(prev => prev.map(message => 
      message.id === messageId 
        ? {
            ...message,
            reactions: [
              ...(message.reactions || []),
              {
                id: Date.now().toString(),
                emoji: reaction,
                userId: user?.id || '',
                messageId,
                createdAt: new Date().toISOString()
              }
            ]
          }
        : message
    ));
    toast.success(`Added ${reaction} reaction`);
  };

  /**
   * Get user display name
   */
  const getUserName = (userId: string) => {
    const userNames: Record<string, string> = {
      '1': 'Admin User',
      '2': 'Editor User',
      '3': 'Viewer User'
    };
    return userNames[userId] || `User ${userId}`;
  };

  /**
   * Get user avatar
   */
  const getUserAvatar = (userId: string) => {
    return (
      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
        <span className="text-white font-medium text-sm">
          {getUserName(userId).charAt(0)}
        </span>
      </div>
    );
  };

  /**
   * Filter messages based on search
   */
  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Get status icon for help desk requests
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Check if chat is enabled
  if (!chatSettings?.isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Chat Function Disabled</h2>
          <p className="text-gray-500">
            The chat function is currently disabled. Please contact your administrator to enable it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              Chat
            </h1>
            <div className="flex items-center gap-2">
              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowNewChannelModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'channels'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Channels
          </button>
          {chatSettings?.helpDeskEnabled && (
            <button
              onClick={() => setActiveTab('help-desk')}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === 'help-desk'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Help Desk
            </button>
          )}
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'direct'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Direct
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'channels' && (
            <div className="p-4 space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChannel?.id === channel.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      {channel.name}
                    </h3>
                    {channel.isPrivate && (
                      <Shield className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  {channel.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {channel.lastMessage.content}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{channel.memberCount} members</span>
                    {channel.lastMessage && (
                      <span>
                        {new Date(channel.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'help-desk' && chatSettings?.helpDeskEnabled && (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">My Requests</h3>
                <button
                  onClick={() => setShowNewRequestModal(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  New Request
                </button>
              </div>
              
              {helpDeskRequests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRequest?.id === request.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(request.status)}
                    <h4 className="font-medium text-gray-900 text-sm">{request.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">
                    {request.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'direct' && (
            <div className="p-4">
              <p className="text-sm text-gray-500 text-center">
                Direct messaging feature coming soon...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-gray-400" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedChannel.name}</h2>
                    <p className="text-sm text-gray-500">{selectedChannel.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages
                .filter(message => message.channelId === selectedChannel.id)
                .map((message) => (
                  <div key={message.id} className="flex items-start gap-3">
                    {getUserAvatar(message.senderId)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {getUserName(message.senderId)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-gray-900">{message.content}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{attachment.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {chatSettings?.allowReactions && (
                        <div className="flex items-center gap-1 mt-2">
                          <button
                            onClick={() => addReaction(message.id, '👍')}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            👍
                          </button>
                          <button
                            onClick={() => addReaction(message.id, '❤️')}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            ❤️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={triggerFileUpload}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : selectedRequest ? (
          <HelpDeskRequestView
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onSendMessage={(content) => {
              // Handle sending message to help desk request
              console.log('Sending message to help desk request:', content);
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Select a Channel</h2>
              <p className="text-gray-500">
                Choose a channel from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        onChange={handleFileUpload}
        id="file-upload"
        style={{ display: 'none' }}
        accept={chatSettings?.allowedFileTypes.map(type => `.${type}`).join(',')}
      />

      {/* Modals */}
      {showSettings && user?.role === 'admin' && (
        <ChatSettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showNewChannelModal && (
        <NewChannelModal onClose={() => setShowNewChannelModal(false)} />
      )}

      {showNewRequestModal && (
        <NewRequestModal onClose={() => setShowNewRequestModal(false)} />
      )}
    </div>
  );
};

/**
 * Help Desk Request View Component
 */
interface HelpDeskRequestViewProps {
  request: HelpDeskRequest;
  onClose: () => void;
  onSendMessage: (content: string) => void;
}

const HelpDeskRequestView: React.FC<HelpDeskRequestViewProps> = ({ request, onClose, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-primary-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{request.title}</h2>
              <p className="text-sm text-gray-500">
                {request.category} • {request.status} • {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {request.messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {(message.senderId === user?.id ? 'You' : 'Mgr').charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">
                  {message.senderId === user?.id ? 'You' : 'Manager'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-gray-900">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Chat Settings Modal Component
 */
const ChatSettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Chat Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-500">Chat settings configuration will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

/**
 * New Channel Modal Component
 */
const NewChannelModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Channel</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-500">New channel creation will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

/**
 * New Request Modal Component
 */
const NewRequestModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">New Help Desk Request</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-500">New help desk request creation will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
