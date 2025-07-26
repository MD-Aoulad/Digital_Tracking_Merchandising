/**
 * WhatsApp-Style Chat Page Component
 * 
 * Main chat interface that integrates all WhatsApp-style components:
 * - Contact list with recent conversations
 * - Enhanced chat window with message bubbles
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

import React, { useState, useEffect, useCallback } from 'react';
import { ChatChannel, ChatMessage, ChatUser } from '../../../types/chat';
import ContactList from './ContactList';
import ChatWindow from './ChatWindow';
import { chatAPI } from '../../../services/api';
import { useChatSocket } from '../../../hooks/useChatSocket';

interface WhatsAppChatPageProps {
  currentUser: ChatUser;
  onBack?: () => void;
}

const WhatsAppChatPage: React.FC<WhatsAppChatPageProps> = ({
  currentUser,
  onBack
}) => {
  // State management
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // WebSocket integration
  const {
    connectionStatus,
    joinChannel,
    leaveChannel,
    sendMessage,
    sendTyping,
    onMessage,
    onTyping,
    onUserJoined,
    onUserLeft,
    onError,
    onConnect,
    onDisconnect,
    typingUsers,
    addReaction,
    removeReaction,
    uploadFile,
    cleanup: cleanupSocket
  } = useChatSocket({
    userId: currentUser.id,
    autoReconnect: true,
    maxReconnectAttempts: 10
  });

  // Get selected channel
  const selectedChannel = channels.find(channel => channel.id === selectedChannelId) || null;

  // Load channels on component mount
  useEffect(() => {
    loadChannels();
  }, []);

  // Load messages when channel changes
  useEffect(() => {
    if (selectedChannelId) {
      loadMessages(selectedChannelId);
      // Join channel via WebSocket
      joinChannel(selectedChannelId).catch(err => {
        console.error('Failed to join channel:', err);
        setError('Failed to join channel');
      });
    } else {
      setMessages([]);
    }

    // Cleanup: leave previous channel
    return () => {
      if (selectedChannelId) {
        leaveChannel(selectedChannelId);
      }
    };
  }, [selectedChannelId, joinChannel, leaveChannel]);

  // WebSocket event handlers
  useEffect(() => {
    // Handle new messages
    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      
      // Update channel's last message
      setChannels(prev => prev.map(channel => 
        channel.id === message.channelId 
          ? { ...channel, lastMessage: message }
          : channel
      ));
    };

    // Handle typing indicators
    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      // Typing users are now managed by the hook
      console.log('User typing:', data);
    };

    // Handle user joined
    const handleUserJoined = (data: any) => {
      console.log('User joined channel:', data);
      // Could update channel participants list here
    };

    // Handle user left
    const handleUserLeft = (data: any) => {
      console.log('User left channel:', data);
      // Could update channel participants list here
    };

    // Handle WebSocket errors
    const handleSocketError = (error: any) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Trying to reconnect...');
    };

    // Handle connection events
    const handleConnect = () => {
      console.log('WebSocket connected');
      setError(null);
    };

    const handleDisconnect = () => {
      console.log('WebSocket disconnected');
      setError('Connection lost. Reconnecting...');
    };

    // Register event handlers
    onMessage(handleNewMessage);
    onTyping(handleTyping);
    onUserJoined(handleUserJoined);
    onUserLeft(handleUserLeft);
    onError(handleSocketError);
    onConnect(handleConnect);
    onDisconnect(handleDisconnect);

    // Cleanup event handlers
    return () => {
      // Event handlers are automatically cleaned up by the hook
    };
  }, [onMessage, onTyping, onUserJoined, onUserLeft, onError, onConnect, onDisconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSocket();
    };
  }, [cleanupSocket]);

  // Load channels
  const loadChannels = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getChatChannels();
      if (response && Array.isArray(response)) {
        setChannels(response);
      }
    } catch (err) {
      setError('Failed to load channels');
      console.error('Error loading channels:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages
  const loadMessages = async (channelId: string, page = 1) => {
    try {
      setLoading(true);
      const response = await chatAPI.getChannelMessages(channelId);
      if (response && Array.isArray(response)) {
        if (page === 1) {
          setMessages(response);
        } else {
          setMessages(prev => [...response, ...prev]);
        }
        setHasMore(response.length === 50); // Assume 50 is the page size
      }
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load more messages
  const handleLoadMore = async () => {
    if (selectedChannelId && hasMore) {
      const currentPage = Math.ceil(messages.length / 20) + 1;
      await loadMessages(selectedChannelId, currentPage);
    }
  };

  // Send message via WebSocket
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedChannelId) return;

    try {
      // Send message via WebSocket
      await sendMessage(selectedChannelId, content, attachments);
      
      // Clear any previous errors
      setError(null);
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  // Send voice message
  const handleSendVoiceMessage = async (audioBlob: Blob) => {
    if (!selectedChannelId) return;

    try {
      // Convert blob to file
      const audioFile = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' });
      
      // Upload via WebSocket
      await uploadFile(selectedChannelId, audioFile);
      
      setError(null);
    } catch (err) {
      setError('Failed to send voice message');
      console.error('Error sending voice message:', err);
    }
  };

  // Flag message
  const handleFlagMessage = async (messageId: string, reason: string) => {
    try {
      // TODO: Implement flag message API endpoint
      console.log('Flagging message:', messageId, reason);
      // await chatAPI.flagMessage(messageId, reason);
      // Update message to show it's flagged
      setMessages(prev => prev.map(message => 
        message.id === messageId 
          ? { ...message, isFlagged: true, flagReason: reason }
          : message
      ));
    } catch (err) {
      setError('Failed to flag message');
      console.error('Error flagging message:', err);
    }
  };

  // Edit message
  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      // TODO: Implement edit message API endpoint
      console.log('Editing message:', messageId, content);
      // const response = await chatAPI.updateMessage(messageId, content);
      // if (response) {
      //   setMessages(prev => prev.map(message => 
      //     message.id === messageId ? response : message
      //   ));
      // }
    } catch (err) {
      setError('Failed to edit message');
      console.error('Error editing message:', err);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      // TODO: Implement delete message API endpoint
      console.log('Deleting message:', messageId);
      // await chatAPI.deleteMessage(messageId);
      setMessages(prev => prev.map(message => 
        message.id === messageId 
          ? { ...message, isDeleted: true, content: '' }
          : message
      ));
    } catch (err) {
      setError('Failed to delete message');
      console.error('Error deleting message:', err);
    }
  };

  // Add reaction via WebSocket
  const handleAddReaction = async (messageId: string, reaction: string) => {
    try {
      await addReaction(messageId, reaction);
      setError(null);
    } catch (err) {
      setError('Failed to add reaction');
      console.error('Error adding reaction:', err);
    }
  };

  // Remove reaction via WebSocket
  const handleRemoveReaction = async (messageId: string) => {
    try {
      await removeReaction(messageId);
      setError(null);
    } catch (err) {
      setError('Failed to remove reaction');
      console.error('Error removing reaction:', err);
    }
  };

  // Download attachment
  const handleDownloadAttachment = async (attachmentId: string) => {
    try {
      // TODO: Implement download attachment API endpoint
      console.log('Downloading attachment:', attachmentId);
      // const response = await chatAPI.downloadAttachment(attachmentId);
      // if (response) {
      //   // Create download link
      //   const link = document.createElement('a');
      //   link.href = response.downloadUrl;
      //   link.download = response.fileName;
      //   document.body.appendChild(link);
      //   link.click();
      //   document.body.removeChild(link);
      // }
    } catch (err) {
      setError('Failed to download attachment');
      console.error('Error downloading attachment:', err);
    }
  };

  // Handle typing with debouncing
  const handleTyping = useCallback((isTyping: boolean) => {
    if (selectedChannelId) {
      sendTyping(selectedChannelId, isTyping);
    }
  }, [selectedChannelId, sendTyping]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Filter channels based on search
    if (query.trim()) {
      const filtered = channels.filter(channel =>
        channel.name.toLowerCase().includes(query.toLowerCase()) ||
        channel.description?.toLowerCase().includes(query.toLowerCase())
      );
      setChannels(filtered);
    } else {
      loadChannels(); // Reload all channels
    }
  }, [channels]);

  // Create channel
  const handleCreateChannel = () => {
    // This would open a modal to create a new channel
    console.log('Create channel clicked');
  };

  // Archive channel
  const handleArchiveChannel = async (channelId: string) => {
    try {
      // TODO: Implement archive channel API endpoint
      console.log('Archiving channel:', channelId);
      // await chatAPI.archiveChannel(channelId);
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, isArchived: true }
          : channel
      ));
    } catch (err) {
      setError('Failed to archive channel');
      console.error('Error archiving channel:', err);
    }
  };

  // Delete channel
  const handleDeleteChannel = async (channelId: string) => {
    try {
      // TODO: Implement delete channel API endpoint
      console.log('Deleting channel:', channelId);
      // await chatAPI.deleteChannel(channelId);
      setChannels(prev => prev.filter(channel => channel.id !== channelId));
      if (selectedChannelId === channelId) {
        setSelectedChannelId(null);
      }
    } catch (err) {
      setError('Failed to delete channel');
      console.error('Error deleting channel:', err);
    }
  };

  // Edit channel
  const handleEditChannel = (channel: ChatChannel) => {
    // This would open a modal to edit the channel
    console.log('Edit channel:', channel);
  };

  // Start call
  const handleStartCall = (type: 'voice' | 'video') => {
    if (selectedChannelId) {
      console.log(`Starting ${type} call in channel:`, selectedChannelId);
      // This would integrate with WebRTC for voice/video calls
    }
  };

  // Show channel info
  const handleShowChannelInfo = () => {
    if (selectedChannel) {
      console.log('Show channel info:', selectedChannel);
      // This would open a sidebar with channel information
    }
  };

  // Connection status indicator
  const getConnectionStatusText = () => {
    if (connectionStatus.connecting) return 'Connecting...';
    if (connectionStatus.error) return connectionStatus.error;
    if (connectionStatus.connected) return 'Connected';
    return 'Disconnected';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Connection Status Indicator */}
      {connectionStatus.error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
          {getConnectionStatusText()}
        </div>
      )}

      {/* Connection Status Badge */}
      <div className="absolute top-4 right-4 z-40">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          connectionStatus.connected 
            ? 'bg-green-500 text-white' 
            : connectionStatus.connecting 
            ? 'bg-yellow-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {connectionStatus.connected ? '🟢 Connected' : 
           connectionStatus.connecting ? '🟡 Connecting...' : '🔴 Disconnected'}
        </div>
      </div>

      {/* Contact List */}
      <ContactList
        channels={channels}
        currentUser={currentUser}
        selectedChannelId={selectedChannelId}
        onSelectChannel={setSelectedChannelId}
        onSearch={handleSearch}
        onCreateChannel={handleCreateChannel}
        onArchiveChannel={handleArchiveChannel}
        onDeleteChannel={handleDeleteChannel}
        onEditChannel={handleEditChannel}
        loading={loading}
      />

      {/* Chat Window */}
      <ChatWindow
        channel={selectedChannel}
        messages={messages}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleSendVoiceMessage}
        onFlagMessage={handleFlagMessage}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onAddReaction={handleAddReaction}
        onRemoveReaction={handleRemoveReaction}
        onDownloadAttachment={handleDownloadAttachment}
        onTyping={handleTyping}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        typingUsers={typingUsers}
        onBack={onBack}
        onShowChannelInfo={handleShowChannelInfo}
        onStartCall={handleStartCall}
        connectionStatus={connectionStatus}
      />
    </div>
  );
};

export default WhatsAppChatPage; 