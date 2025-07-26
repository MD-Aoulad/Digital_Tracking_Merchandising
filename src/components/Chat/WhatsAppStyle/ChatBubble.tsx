/**
 * WhatsApp-Style Chat Bubble Component
 * 
 * Enhanced message bubble with WhatsApp-like styling:
 * - Proper bubble alignment (left/right)
 * - Message status indicators (sent, delivered, read)
 * - Timestamp display
 * - Reply threading support
 * - Message reactions
 * - Media preview support
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { 
  Check, 
  CheckCheck, 
  Clock, 
  Reply, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Flag,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  MapPin,
  Mic,
  Play,
  Pause,
  Download
} from 'lucide-react';
import { ChatMessage, ChatUser } from '../../../types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
  currentUser: ChatUser;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onFlag: (messageId: string, reason: string) => void;
  onAddReaction: (messageId: string, reaction: string) => void;
  onDownloadAttachment: (attachmentId: string) => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
  onSaveEdit?: (content: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  onFlag,
  onAddReaction,
  onDownloadAttachment,
  isEditing = false,
  onCancelEdit,
  onSaveEdit
}) => {
  const [showActions, setShowActions] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);

  const isOwnMessage = message.senderId === currentUser.id;
  const isEdited = message.isEdited && !message.isDeleted;

  // Message status indicators
  const getStatusIcon = () => {
    if (message.isDeleted) return null;
    
    // For own messages, show delivery status
    if (isOwnMessage) {
      if (message.readBy && message.readBy.length > 0) {
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      } else if (message.metadata?.clientInfo) {
        // Assume message is delivered if we have client info
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      } else {
        return <Check className="w-3 h-3 text-gray-400" />;
      }
    }
    return null;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Handle edit submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim() && onSaveEdit) {
      onSaveEdit(editContent.trim());
    }
  };

  // Render media content
  const renderMediaContent = () => {
    if (!message.attachments || message.attachments.length === 0) return null;

    return (
      <div className="space-y-2">
        {message.attachments.map((attachment) => (
          <div key={attachment.id} className="relative">
            {attachment.mimeType.startsWith('image/') ? (
              <div className="relative group">
                <img
                  src={attachment.fileUrl}
                  alt={attachment.fileName}
                  className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(attachment.fileUrl, '_blank')}
                />
                <button
                  onClick={() => onDownloadAttachment(attachment.id)}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            ) : attachment.mimeType.startsWith('video/') ? (
              <div className="relative group">
                <video
                  src={attachment.fileUrl}
                  controls
                  className="max-w-xs rounded-lg"
                />
                <button
                  onClick={() => onDownloadAttachment(attachment.id)}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            ) : attachment.mimeType.startsWith('audio/') ? (
              <div className="flex items-center space-x-2 p-3 bg-black bg-opacity-10 rounded-lg">
                <Mic className="w-4 h-4" />
                <audio src={attachment.fileUrl} controls className="flex-1" />
                <button
                  onClick={() => onDownloadAttachment(attachment.id)}
                  className="p-1 text-gray-600 hover:text-gray-800"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-black bg-opacity-10 rounded-lg">
                <FileText className="w-4 h-4" />
                <span className="text-sm truncate">{attachment.fileName}</span>
                <button
                  onClick={() => onDownloadAttachment(attachment.id)}
                  className="p-1 text-gray-600 hover:text-gray-800"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render reply content
  const renderReplyContent = () => {
    if (!message.replyTo) return null;

    return (
      <div className={`mb-2 p-2 rounded-lg border-l-4 ${
        isOwnMessage 
          ? 'bg-white bg-opacity-20 border-white' 
          : 'bg-gray-100 border-gray-300'
      }`}>
        <div className="flex items-center space-x-1 mb-1">
          <Reply className="w-3 h-3" />
          <span className="text-xs font-medium">
            {message.replyTo.sender?.name || 'Unknown'}
          </span>
        </div>
        <p className="text-xs truncate">
          {message.replyTo.content}
        </p>
      </div>
    );
  };

  // Render reactions
  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    const reactionGroups = message.reactions.reduce((acc, reaction) => {
      acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactionGroups).map(([reaction, count]) => (
          <button
            key={reaction}
            onClick={() => onAddReaction(message.id, reaction)}
            className={`px-2 py-1 rounded-full text-xs ${
              message.reactions?.some(r => r.userId === currentUser.id && r.reactionType === reaction)
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {reaction} {count}
          </button>
        ))}
      </div>
    );
  };

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
          isOwnMessage 
            ? 'bg-gray-100 text-gray-500' 
            : 'bg-gray-50 text-gray-400'
        }`}>
          <div className="flex items-center space-x-2 text-xs italic">
            <Trash2 className="w-3 h-3" />
            <span>This message was deleted</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2 group`}>
      <div className={`max-w-xs lg:max-w-md relative ${
        isOwnMessage ? 'order-2' : 'order-1'
      }`}>
        {/* User Avatar (for received messages) */}
        {!isOwnMessage && (
          <div className="flex items-end space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {message.sender?.name?.[0] || 'U'}
            </div>
            <div className="flex-1">
              {/* Message Bubble */}
              <div className={`px-4 py-2 rounded-2xl ${
                isOwnMessage
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}>
                {/* Reply Content */}
                {renderReplyContent()}
                
                {/* Message Content */}
                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 text-sm border rounded-lg resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={onCancelEdit}
                        className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {renderMediaContent()}
                  </>
                )}
                
                {/* Reactions */}
                {renderReactions()}
              </div>
              
              {/* Message Metadata */}
              <div className={`flex items-center justify-between mt-1 px-1 ${
                isOwnMessage ? 'justify-end' : 'justify-start'
              }`}>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{formatTime(message.createdAt)}</span>
                  {isEdited && <span className="italic">(edited)</span>}
                  {getStatusIcon()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Own Messages */}
        {isOwnMessage && (
          <div className="flex-1">
            {/* Message Bubble */}
            <div className={`px-4 py-2 rounded-2xl ${
              isOwnMessage
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }`}>
              {/* Reply Content */}
              {renderReplyContent()}
              
              {/* Message Content */}
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 text-sm border rounded-lg resize-none text-gray-900"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs bg-white text-blue-500 rounded hover:bg-gray-100"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {renderMediaContent()}
                </>
              )}
              
              {/* Reactions */}
              {renderReactions()}
            </div>
            
            {/* Message Metadata */}
            <div className="flex items-center justify-end mt-1 px-1">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatTime(message.createdAt)}</span>
                {isEdited && <span className="italic">(edited)</span>}
                {getStatusIcon()}
              </div>
            </div>
          </div>
        )}

        {/* Message Actions Menu */}
        <div className={`absolute top-0 ${
          isOwnMessage ? 'left-0 transform -translate-x-full' : 'right-0 transform translate-x-full'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
          <div className="flex items-center space-x-1 bg-white border rounded-lg shadow-lg p-1">
            <button
              onClick={() => onReply(message)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Reply"
            >
              <Reply className="w-4 h-4" />
            </button>
            {isOwnMessage && (
              <>
                <button
                  onClick={() => onEdit(message)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => onFlag(message.id, 'Inappropriate content')}
              className="p-1 hover:bg-gray-100 rounded"
              title="Flag"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble; 