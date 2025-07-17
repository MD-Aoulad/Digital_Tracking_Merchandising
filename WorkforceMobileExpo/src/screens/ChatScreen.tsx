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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { shadowStyles } from '../utils/shadows';

// Mock chat data
const mockChannels = [
  {
    id: '1',
    name: 'General',
    description: 'General team discussions',
    type: 'general',
    memberCount: 12,
    lastMessage: 'Meeting scheduled for tomorrow at 10 AM',
    lastMessageTime: '2 hours ago',
    unreadCount: 3,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Sales Team',
    description: 'Sales and marketing updates',
    type: 'department',
    memberCount: 8,
    lastMessage: 'New leads added to the pipeline',
    lastMessageTime: '1 hour ago',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Operations',
    description: 'Operations and logistics',
    type: 'department',
    memberCount: 6,
    lastMessage: 'Inventory check completed',
    lastMessageTime: '30 min ago',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '4',
    name: 'Project Alpha',
    description: 'Project Alpha team discussions',
    type: 'project',
    memberCount: 5,
    lastMessage: 'Phase 1 deliverables ready for review',
    lastMessageTime: '15 min ago',
    unreadCount: 0,
    isOnline: false,
  },
];

const mockDirectMessages = [
  {
    id: 'dm1',
    name: 'Sarah Johnson',
    role: 'Sales Representative',
    lastMessage: 'Can you review the proposal?',
    lastMessageTime: '5 min ago',
    unreadCount: 1,
    isOnline: true,
    avatar: null,
  },
  {
    id: 'dm2',
    name: 'Mike Chen',
    role: 'Operations Specialist',
    lastMessage: 'Task completed successfully',
    lastMessageTime: '1 hour ago',
    unreadCount: 0,
    isOnline: true,
    avatar: null,
  },
  {
    id: 'dm3',
    name: 'Lisa Wang',
    role: 'Team Lead',
    lastMessage: 'Great work on the presentation!',
    lastMessageTime: '2 hours ago',
    unreadCount: 0,
    isOnline: false,
    avatar: null,
  },
];

const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'direct'>('channels');
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleChannelPress = (channel: any) => {
    Alert.alert('Channel Chat', `Opening ${channel.name} channel...`);
  };

  const handleDirectMessagePress = (contact: any) => {
    Alert.alert('Direct Message', `Opening chat with ${contact.name}...`);
  };

  const renderChannelItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.channelItem} onPress={() => handleChannelPress(item)}>
      <View style={styles.channelIcon}>
        <Ionicons name="chatbubbles" size={20} color="#fff" />
      </View>
             <View style={styles.channelInfo}>
         <Text style={styles.channelName}>{item.name}</Text>
         <Text style={styles.channelLastMessage}>{item.lastMessage}</Text>
        <View style={styles.channelMeta}>
          <Text style={styles.channelTime}>{item.lastMessageTime}</Text>
        </View>
      </View>
      <View style={styles.unreadBadge}>
        <Text style={styles.unreadCount}>{item.unreadCount}</Text>
      </View>
      <View style={[styles.onlineIndicator, { backgroundColor: item.isOnline ? '#10b981' : '#6b7280' }]} />
    </TouchableOpacity>
  );

  const renderDirectMessageItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.directMessageItem} onPress={() => handleDirectMessagePress(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
             <View style={styles.contactInfo}>
         <Text style={styles.contactName}>{item.name}</Text>
         <Text style={styles.contactRole}>{item.role}</Text>
         <Text style={styles.contactLastMessage}>{item.lastMessage}</Text>
        <View style={styles.contactMeta}>
          <Text style={styles.contactTime}>{item.lastMessageTime}</Text>
        </View>
      </View>
      <View style={styles.onlineIndicator} />
    </TouchableOpacity>
  );

  const getChannelColor = (type: string) => {
    switch (type) {
      case 'general': return '#3b82f6';
      case 'department': return '#10b981';
      case 'project': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Chat</Text>
        <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'New chat feature will be available soon!')}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'channels' && styles.activeTab]}
          onPress={() => setActiveTab('channels')}
        >
                     <Ionicons 
             name="chatbubbles" 
             size={20} 
             color={activeTab === 'channels' ? '#007AFF' : '#6b7280'} 
           />
          <Text style={[styles.tabText, activeTab === 'channels' && styles.activeTabText]}>
            Channels
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'direct' && styles.activeTab]}
          onPress={() => setActiveTab('direct')}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={activeTab === 'direct' ? '#007AFF' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'direct' && styles.activeTabText]}>
            Direct Messages
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={activeTab === 'channels' ? mockChannels : mockDirectMessages}
        renderItem={activeTab === 'channels' ? renderChannelItem : renderDirectMessageItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No conversations found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Start a new conversation'}
            </Text>
          </View>
        }
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Coming Soon', 'New channel creation will be available soon!')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="add-circle" size={16} color="#007AFF" />
          </View>
          <Text style={styles.quickActionText}>New Channel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Coming Soon', 'New direct message feature will be available soon!')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="person-add" size={16} color="#007AFF" />
          </View>
          <Text style={styles.quickActionText}>New Message</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f3f4f6',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    ...shadowStyles.small,
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  channelLastMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  channelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  directMessageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    ...shadowStyles.small,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  contactRole: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  contactLastMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactMeta: {
    alignItems: 'flex-end',
  },
  contactTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...shadowStyles.small,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
  },
});

export default ChatScreen; 