import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import {
  ChatChannel,
  ChatUser,
  CreateChannelForm,
} from '../types/chat';

// Only import chat service on mobile platforms to avoid web warnings
let channelApi: any = null;
let wsApi: any = null;
let networkUtils: any = null;

if (Platform.OS !== 'web') {
  const chatService = require('../services/chatService');
  channelApi = chatService.channelApi;
  wsApi = chatService.wsApi;
  networkUtils = chatService.networkUtils;
}

interface ChannelsScreenProps {
  route?: {
    params?: {
      currentUser?: ChatUser;
    };
  };
}

const ChannelsScreen: React.FC<ChannelsScreenProps> = ({ route }) => {
  const currentUser = route?.params?.currentUser || {
    id: '1',
    name: 'Demo User',
    email: 'demo@company.com',
    role: 'employee',
    isOnline: true,
    lastSeenAt: new Date().toISOString(),
    isTyping: false,
    status: {
      status: 'online',
      lastSeenAt: new Date().toISOString(),
      isTyping: false,
      updatedAt: new Date().toISOString(),
    },
  };
  const navigation = useNavigation();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // On web, just show demo channels
      setChannels([
        {
          id: '1',
          name: 'general',
          description: 'General discussion',
          type: 'general',
          isPrivate: false,
          isArchived: false,
          maxMembers: 100,
          createdBy: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          memberCount: 5,
          userRole: 'member',
          isReadonly: false,
          settings: {
            allowFileSharing: true,
            allowReactions: true,
            allowEditing: true,
            allowDeletion: true,
            editTimeLimit: 15,
            deletionTimeLimit: 60,
            maxFileSize: 10485760,
            allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'mp4'],
            autoArchive: false,
            archiveAfterDays: 365,
          },
          metadata: {},
        },
        {
          id: '2',
          name: 'sales',
          description: 'Sales team channel',
          type: 'department',
          isPrivate: false,
          isArchived: false,
          maxMembers: 50,
          createdBy: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          memberCount: 3,
          userRole: 'member',
          isReadonly: false,
          settings: {
            allowFileSharing: true,
            allowReactions: true,
            allowEditing: true,
            allowDeletion: true,
            editTimeLimit: 15,
            deletionTimeLimit: 60,
            maxFileSize: 10485760,
            allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'mp4'],
            autoArchive: false,
            archiveAfterDays: 365,
          },
          metadata: {},
        }
      ]);
      setLoading(false);
    } else {
      loadChannels();
      setupNetworkListener();
    }
  }, []);

  const loadChannels = async () => {
    if (!channelApi) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userChannels = await channelApi.getChannels();
      setChannels(userChannels);
    } catch (error) {
      console.error('Error loading channels:', error);
      Alert.alert('Error', 'Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const setupNetworkListener = () => {
    if (networkUtils) {
      networkUtils.addNetworkListener((connected: boolean) => {
        setIsOnline(connected);
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (Platform.OS === 'web') {
      // Just simulate refresh on web
      setTimeout(() => setRefreshing(false), 1000);
    } else {
      await loadChannels();
      setRefreshing(false);
    }
  };

  const handleChannelPress = (channel: ChatChannel) => {
    // @ts-ignore - Navigation type issue
    navigation.navigate('Chat', {
      channel,
      currentUser,
    });
  };

  const handleCreateChannel = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Demo Mode', 'Channel creation is not available in web demo mode');
      return;
    }

    Alert.prompt(
      'Create New Channel',
      'Enter channel name:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          onPress: async (channelName) => {
            if (channelName && channelName.trim()) {
              await createChannel(channelName.trim());
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const createChannel = async (name: string) => {
    if (!channelApi) return;

    try {
      const form: CreateChannelForm = {
        name,
        description: '',
        type: 'general',
        isPrivate: false,
        maxMembers: 100,
      };

      const newChannel = await channelApi.createChannel(form);
      setChannels(prev => [newChannel, ...prev]);
      
      Alert.alert('Success', `Channel #${name} created successfully!`);
    } catch (error) {
      console.error('Error creating channel:', error);
      Alert.alert('Error', 'Failed to create channel');
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChannelItem = ({ item }: { item: ChatChannel }) => (
    <TouchableOpacity
      style={styles.channelItem}
      onPress={() => handleChannelPress(item)}
    >
      <View style={styles.channelIcon}>
        {item.isPrivate ? (
          <Ionicons name="lock-closed" size={20} color="#666" />
        ) : (
          <Ionicons name="chatbubbles" size={20} color="#666" />
        )}
      </View>
      
      <View style={styles.channelInfo}>
        <View style={styles.channelHeader}>
          <Text style={styles.channelName}>#{item.name}</Text>
          {item.unreadCount && item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.channelDescription} numberOfLines={1}>
          {item.description || `${item.memberCount || 0} members`}
        </Text>
        
        {item.lastMessage && (
          <View style={styles.lastMessageContainer}>
            <Text style={styles.lastMessageText} numberOfLines={1}>
              {item.lastMessage.content}
            </Text>
            <Text style={styles.lastMessageTime}>
              {formatTimestamp(item.lastMessage.createdAt)}
            </Text>
          </View>
        )}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const formatTimestamp = (timestamp: string): string => {
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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No channels yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Create a channel to start chatting with your team
      </Text>
      <TouchableOpacity
        style={styles.createChannelButton}
        onPress={handleCreateChannel}
      >
        <Text style={styles.createChannelButtonText}>Create Channel</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading channels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Channels</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name="search" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCreateChannel}
          >
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search channels..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="wifi-outline" size={16} color="#fff" />
          <Text style={styles.offlineText}>You're offline</Text>
        </View>
      )}

      {/* Channels List */}
      <FlatList
        data={filteredChannels}
        renderItem={renderChannelItem}
        keyExtractor={(item) => item.id}
        style={styles.channelsList}
        contentContainerStyle={channels.length === 0 ? styles.emptyList : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  channelsList: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  channelDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    fontSize: 13,
    color: '#999',
    flex: 1,
    marginRight: 8,
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createChannelButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createChannelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChannelsScreen; 