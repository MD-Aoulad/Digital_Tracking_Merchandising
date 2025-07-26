/**
 * WhatsApp-Style Chat Window Component
 * 
 * Complete WhatsApp-style chat interface with:
 * - Enhanced message bubbles with status indicators
 * - Voice message recording and playback
 * - Emoji picker integration
 * - File attachment support
 * - Reply to message functionality
 * - Typing indicators
 * - Message reactions
 * - Real-time status updates
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MoreVertical, 
  Phone, 
  Video, 
  Search, 
  Users, 
  Info,
  ArrowLeft,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ChatChannel, ChatMessage, ChatUser } from '../../../types/chat';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  channel: ChatChannel | null;
  messages: ChatMessage[];
  currentUser: ChatUser;
  onSendMessage: (content: string, attachments?: File[]) => void;
  onSendVoiceMessage: (audioBlob: Blob) => void;
  onFlagMessage: (messageId: string, reason: string) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onAddReaction: (messageId: string, reaction: string) => void;
  onRemoveReaction: (messageId: string) => void;
  onDownloadAttachment: (attachmentId: string) => void;
  onTyping: (isTyping: boolean) => void;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  typingUsers: { userId: string; isTyping: boolean; timestamp: number }[];
  onBack?: () => void;
  onShowChannelInfo?: () => void;
  onStartCall?: (type: 'voice' | 'video') => void;
  connectionStatus?: { connected: boolean; connecting: boolean; error: string | null; reconnectAttempts: number };
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  channel,
  messages,
  currentUser,
  onSendMessage,
  onSendVoiceMessage,
  onFlagMessage,
  onEditMessage,
  onDeleteMessage,
  onAddReaction,
  onDownloadAttachment,
  onTyping,
  loading,
  error,
  hasMore,
  onLoadMore,
  typingUsers,
  onBack,
  onShowChannelInfo,
  onStartCall,
  connectionStatus
}) => {
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle reply to message
  const handleReply = useCallback((message: ChatMessage) => {
    setReplyToMessage(message);
  }, []);

  // Handle edit message
  const handleEdit = useCallback((message: ChatMessage) => {
    setEditingMessageId(message.id);
  }, []);

  // Handle save edit
  const handleSaveEdit = useCallback((content: string) => {
    if (editingMessageId) {
      onEditMessage(editingMessageId, content);
      setEditingMessageId(null);
    }
  }, [editingMessageId, onEditMessage]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
  }, []);

  // Handle cancel reply
  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  // Handle message send
  const handleSendMessage = useCallback((content: string, attachments?: File[]) => {
    onSendMessage(content, attachments);
    setReplyToMessage(null);
  }, [onSendMessage]);

  // Handle voice message send
  const handleSendVoiceMessage = useCallback((audioBlob: Blob) => {
    onSendVoiceMessage(audioBlob);
  }, [onSendVoiceMessage]);

  // Handle typing
  const handleTyping = useCallback((isTyping: boolean) => {
    onTyping(isTyping);
  }, [onTyping]);

  // Format typing indicator text
  const getTypingText = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return 'Several people are typing...';
  };

  // Get channel status
  const getChannelStatus = () => {
    if (!channel) return '';
    
    if (channel.memberCount) {
      return `${channel.memberCount} members`;
    }
    
    return channel.description || '';
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Chat</h3>
          <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {channel.name[0].toUpperCase()}
            </div>
            
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {channel.isPrivate ? '🔒 ' : ''}{channel.name}
              </h2>
              <p className="text-sm text-gray-500">
                {getChannelStatus()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="text-sm text-gray-500 animate-pulse">
                {getTypingText()}
              </div>
            )}
            
            {/* Call Buttons */}
            <button
              onClick={() => onStartCall?.('voice')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Voice Call"
            >
              <Phone className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => onStartCall?.('video')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Video Call"
            >
              <Video className="w-5 h-5" />
            </button>
            
            {/* Channel Info */}
            <button
              onClick={onShowChannelInfo}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Channel Info"
            >
              <Info className="w-5 h-5" />
            </button>
            
            {/* More Options */}
            <div className="relative">
              <button
                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showHeaderMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-48">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    Search Messages
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    View Members
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Channel Info
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4"
      >
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

        {/* Messages */}
        <div className="space-y-2">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              currentUser={currentUser}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={onDeleteMessage}
              onFlag={onFlagMessage}
              onAddReaction={onAddReaction}
              onDownloadAttachment={onDownloadAttachment}
              isEditing={editingMessageId === message.id}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
            />
          ))}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleSendVoiceMessage}
        onTyping={handleTyping}
        replyToMessage={replyToMessage}
        onCancelReply={handleCancelReply}
        disabled={loading}
        placeholder="Type a message..."
      />
    </div>
  );
};

export default ChatWindow; 