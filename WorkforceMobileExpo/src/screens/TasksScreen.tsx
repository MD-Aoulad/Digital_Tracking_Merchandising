import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { shadowStyles } from '../utils/shadows';

const { width } = Dimensions.get('window');

// Mock data for demonstration
const mockTasks = [
  {
    id: '1',
    title: 'Store Visit Report',
    description: 'Complete store visit report for downtown location',
    priority: 'high',
    status: 'in-progress',
    assignedTo: 'Sarah Johnson',
    assignedBy: 'Manager',
    dueDate: '2024-07-18',
    createdAt: '2024-07-15',
    category: 'Sales',
    estimatedHours: 2,
    completedAt: null,
  },
  {
    id: '2',
    title: 'Inventory Check',
    description: 'Check inventory levels at warehouse A',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'Mike Chen',
    assignedBy: 'Manager',
    dueDate: '2024-07-19',
    createdAt: '2024-07-16',
    category: 'Operations',
    estimatedHours: 1.5,
    completedAt: null,
  },
  {
    id: '3',
    title: 'Customer Meeting',
    description: 'Meet with key client for Q3 review',
    priority: 'high',
    status: 'completed',
    assignedTo: 'Lisa Wang',
    assignedBy: 'Manager',
    dueDate: '2024-07-17',
    createdAt: '2024-07-14',
    category: 'Sales',
    estimatedHours: 1,
    completedAt: '2024-07-17T14:30:00Z',
  },
  {
    id: '4',
    title: 'Training Session',
    description: 'Attend new software training session',
    priority: 'low',
    status: 'pending',
    assignedTo: 'David Kim',
    assignedBy: 'HR',
    dueDate: '2024-07-20',
    createdAt: '2024-07-16',
    category: 'Training',
    estimatedHours: 3,
    completedAt: null,
  },
];

const TasksScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState(mockTasks);

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'all' || task.status === activeTab;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const handleTaskAction = (taskId: string, action: string) => {
    Alert.alert(
      'Task Action',
      `Are you sure you want to ${action} this task?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: action.charAt(0).toUpperCase() + action.slice(1), 
          onPress: () => {
            // Update task status
            setTasks(prevTasks => 
              prevTasks.map(task => 
                task.id === taskId 
                  ? { ...task, status: action === 'complete' ? 'completed' : 'in-progress' }
                  : task
              )
            );
          }
        },
      ]
    );
  };

  const handleTaskPress = (task: any) => {
    // For now, just show an alert since TaskDetails screen doesn't exist
    Alert.alert('Task Details', `Viewing details for: ${task.title}`);
  };

  const renderTaskItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.taskCard, { borderLeftColor: getStatusColor(item.status) }]} 
      onPress={() => handleTaskPress(item)}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.status} status`}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </View>
      
      <Text style={styles.taskDescription} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          <Ionicons name="person" size={16} color="#6b7280" />       <Text style={styles.taskAssignee}>{item.assignedTo}</Text>
        </View>
        <View style={styles.taskMeta}>
          <Ionicons name="calendar" size={16} color="#6b7280" />       <Text style={styles.taskDueDate}>Due: {item.dueDate}</Text>
        </View>
        <View style={styles.taskMeta}>
          <Ionicons name="time" size={16} color="#6b7280" />       <Text style={styles.taskPriority}>{item.priority}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isAdmin ? 'Task Management' : 'My Tasks'}
        </Text>
        {isAdmin && (
          <TouchableOpacity onPress={() => navigation.navigate('CreateTask' as never)}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
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
        {['all', 'pending', 'in-progress', 'completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'in-progress').length}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'completed').length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Tasks List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="list" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No tasks found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'All caught up!'}
            </Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {filteredTasks.map((task) => (
              renderTaskItem({ item: task })
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button for Admin */}
      {isAdmin && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('CreateTask' as never)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
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
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f3f4f6',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    textTransform: 'capitalize',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskAssignee: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  taskPriority: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowStyles.large,
  },
});

export default TasksScreen; 