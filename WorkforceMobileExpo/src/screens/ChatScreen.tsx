import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { shadowStyles } from '../utils/shadows';
import { apiService } from '../services/api';

// Chat types
interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender?: {
    name: string;
    email: string;
  };
}

interface ChatChannel {
  id: string | number;
  name: string;
  description?: string;
  type: string;
  memberCount?: number;
  lastMessage?: ChatMessage;
}

const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Get channel from navigation params
  const channel = (route.params as any)?.channel as ChatChannel;
  const currentUser = (route.params as any)?.currentUser;

  useEffect(() => {
    console.log('=== CHAT SCREEN USE EFFECT ===');
    console.log('Channel ID in useEffect:', channel?.id);
    console.log('Channel object in useEffect:', channel);
    
    if (channel?.id) {
      console.log('Calling loadMessages from useEffect');
      loadMessages();
    } else {
      console.log('No channel ID in useEffect, not calling loadMessages');
    }
  }, [channel?.id]);

  const loadMessages = async () => {
    console.log('=== CHAT DEBUG ===');
    console.log('Channel object:', channel);
    console.log('Channel ID:', channel?.id);
    console.log('Channel ID type:', typeof channel?.id);
    
    if (!channel?.id) {
      console.log('No channel ID, returning early');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Making API call to getChatMessages with channel ID:', channel.id.toString());
      
      const response = await apiService.getChatMessages(channel.id.toString());
      console.log('API Response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      console.log('Response error:', response.error);
      
      if (response.success && response.data) {
        console.log('Setting messages:', response.data);
        setMessages(response.data);
      } else {
        console.error('Failed to load messages:', response.error);
        // Show demo messages if API fails
        setMessages([
          {
            id: '1',
            content: 'Welcome to the channel!',
            senderId: 'system',
            createdAt: new Date().toISOString(),
            sender: { name: 'System', email: 'system@company.com' }
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Show demo messages on error
      setMessages([
        {
          id: '1',
          content: 'Welcome to the channel!',
          senderId: 'system',
          createdAt: new Date().toISOString(),
          sender: { name: 'System', email: 'system@company.com' }
        }
      ]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !channel?.id?.toString() || sending) return;
    
    try {
      setSending(true);
      const messageContent = newMessage.trim();
      setNewMessage('');
      // Optimistically add message to UI
      const optimisticMessage: ChatMessage = {
        id: Date.now().toString(),
        content: messageContent,
        senderId: user?.id?.toString() || '0',
        createdAt: new Date().toISOString(),
        sender: { name: user?.name || 'You', email: user?.email || '' }
      };
      setMessages(prev => [...prev, optimisticMessage]);
      // Call backend API to persist the message
      const response = await apiService.sendChatMessage(channel.id.toString(), {
        content: messageContent,
        messageType: 'text',
      });
      if (response.success) {
        // Reload messages from backend to ensure consistency
        await loadMessages();
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === user?.id?.toString();
    
    return (
      <View style={[styles.messageContainer, isOwnMessage && styles.ownMessage]}>
        <View style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}>
          {!isOwnMessage && item.sender && (
            <Text style={styles.senderName}>{item.sender.name}</Text>
          )}
          <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>#{channel?.name || 'Channel'}</Text>
          <Text style={styles.headerSubtitle}>
            {channel?.memberCount || 0} members
          </Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Channel Info', 'Channel information coming soon!')}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No messages yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start the conversation by sending a message
            </Text>
          </View>
        }
        inverted={false}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: '80%',
    ...shadowStyles.small,
  },
  ownMessageBubble: {
    backgroundColor: '#007AFF',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
});

export default ChatScreen; 