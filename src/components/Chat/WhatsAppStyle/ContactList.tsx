/**
 * WhatsApp-Style Contact List Component
 * 
 * Enhanced contact list with WhatsApp-like features:
 * - Recent conversations with last message preview
 * - Online/offline status indicators
 * - Unread message counters
 * - Typing indicators
 * - Search functionality
 * - Contact avatars and status
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  Circle, 
  MessageCircle, 
  Hash,
  Lock,
  Users,
  Star,
  Archive,
  Trash2,
  Edit,
  Settings
} from 'lucide-react';
import { ChatChannel, ChatUser, ChatMessage } from '../../../types/chat';

interface ContactListProps {
  channels: ChatChannel[];
  currentUser: ChatUser;
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  onSearch: (query: string) => void;
  onCreateChannel: () => void;
  onArchiveChannel?: (channelId: string) => void;
  onDeleteChannel?: (channelId: string) => void;
  onEditChannel?: (channel: ChatChannel) => void;
  loading?: boolean;
}

const ContactList: React.FC<ContactListProps> = ({
  channels,
  currentUser,
  selectedChannelId,
  onSelectChannel,
  onSearch,
  onCreateChannel,
  onArchiveChannel,
  onDeleteChannel,
  onEditChannel,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChannels, setFilteredChannels] = useState<ChatChannel[]>(channels);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Filter channels based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChannels(filtered);
    } else {
      setFilteredChannels(channels);
    }
  }, [channels, searchQuery]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  // Format last message preview
  const formatLastMessage = (message?: ChatMessage) => {
    if (!message) return 'No messages yet';
    
    if (message.isDeleted) return 'This message was deleted';
    
    const content = message.content;
    if (content.length > 30) {
      return content.substring(0, 30) + '...';
    }
    return content;
  };

  // Format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { minute: '2-digit' });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get channel icon
  const getChannelIcon = (channel: ChatChannel) => {
    if (channel.isPrivate) {
      return <Lock className="w-4 h-4" />;
    }
    
    switch (channel.type) {
      case 'announcement':
        return <Star className="w-4 h-4" />;
      case 'department':
        return <Users className="w-4 h-4" />;
      case 'project':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  // Get unread count
  const getUnreadCount = (channel: ChatChannel) => {
    // This would be calculated based on user's read status
    // For now, we'll use a placeholder
    return Math.floor(Math.random() * 5); // Placeholder
  };

  // Handle channel menu
  const handleChannelMenu = (channelId: string, action: string) => {
    setShowMenu(null);
    
    switch (action) {
      case 'archive':
        onArchiveChannel?.(channelId);
        break;
      case 'delete':
        onDeleteChannel?.(channelId);
        break;
      case 'edit':
        const channel = channels.find(c => c.id === channelId);
        if (channel) onEditChannel?.(channel);
        break;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onCreateChannel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="New Chat"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search or start new chat..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading chats...</p>
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={onCreateChannel}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600"
              >
                Start your first chat
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChannels.map((channel) => {
              const isSelected = selectedChannelId === channel.id;
              const unreadCount = getUnreadCount(channel);
              const lastMessage = channel.lastMessage;
              const isOnline = channel.memberCount && channel.memberCount > 0; // Placeholder logic
              
              return (
                <div
                  key={channel.id}
                  className={`relative group cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-r-2 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectChannel(channel.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Channel Avatar/Icon */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          channel.isPrivate 
                            ? 'bg-purple-100 text-purple-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {getChannelIcon(channel)}
                        </div>
                        
                        {/* Online Status Indicator */}
                        {isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      {/* Channel Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {channel.isPrivate ? '🔒 ' : ''}{channel.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(lastMessage.createdAt)}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(showMenu === channel.id ? null : channel.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {formatLastMessage(lastMessage)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2">
                            {channel.memberCount && (
                              <span className="text-xs text-gray-400">
                                {channel.memberCount} members
                              </span>
                            )}
                            {channel.isArchived && (
                              <span className="text-xs text-gray-400 flex items-center">
                                <Archive className="w-3 h-3 mr-1" />
                                Archived
                              </span>
                            )}
                          </div>
                          
                          {/* Unread Count */}
                          {unreadCount > 0 && (
                            <div className="flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-medium rounded-full">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Channel Menu */}
                  {showMenu === channel.id && (
                    <div className="absolute top-0 right-0 mt-2 mr-2 bg-white border rounded-lg shadow-lg py-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChannelMenu(channel.id, 'edit');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChannelMenu(channel.id, 'archive');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChannelMenu(channel.id, 'delete');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{filteredChannels.length} chats</span>
          <div className="flex items-center space-x-1">
            <Circle className="w-2 h-2 text-green-500" />
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactList; 