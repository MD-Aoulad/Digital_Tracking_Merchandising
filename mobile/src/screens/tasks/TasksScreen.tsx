import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedBy: string;
  store?: string;
  type: 'visit' | 'inventory' | 'report' | 'maintenance';
}

export default function TasksScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Store Inventory Check',
      description: 'Complete inventory check for Store #123',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-01-15',
      assignedBy: 'Manager',
      store: 'Store #123',
      type: 'inventory',
    },
    {
      id: '2',
      title: 'Sales Report Submission',
      description: 'Submit weekly sales report',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-01-14',
      assignedBy: 'Admin',
      type: 'report',
    },
    {
      id: '3',
      title: 'Store Visit',
      description: 'Visit Store #456 for routine check',
      status: 'completed',
      priority: 'low',
      dueDate: '2024-01-13',
      assignedBy: 'Supervisor',
      store: 'Store #456',
      type: 'visit',
    },
    {
      id: '4',
      title: 'Equipment Maintenance',
      description: 'Check and maintain store equipment',
      status: 'overdue',
      priority: 'high',
      dueDate: '2024-01-12',
      assignedBy: 'Manager',
      store: 'Store #789',
      type: 'maintenance',
    },
  ]);

  const filteredTasks = tasks.filter(task => {
    if (selectedFilter === 'all') return true;
    return task.status === selectedFilter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Refreshed', 'Tasks updated!');
    }, 1000);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'in_progress':
        return '#007AFF';
      case 'completed':
        return '#34C759';
      case 'overdue':
        return '#FF3B30';
      default:
        return '#666';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#666';
    }
  };

  const getTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'visit':
        return 'location';
      case 'inventory':
        return 'list';
      case 'report':
        return 'document-text';
      case 'maintenance':
        return 'construct';
      default:
        return 'help-circle';
    }
  };

  const handleTaskPress = (task: Task) => {
    Alert.alert(
      task.title,
      `Status: ${task.status}\nPriority: ${task.priority}\nDue: ${task.dueDate}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark Complete', onPress: () => markTaskComplete(task.id) },
        { text: 'View Details', onPress: () => viewTaskDetails(task) },
      ]
    );
  };

  const markTaskComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: 'completed' as const } : task
      )
    );
    Alert.alert('Success', 'Task marked as completed!');
  };

  const viewTaskDetails = (task: Task) => {
    Alert.alert('Coming Soon', 'Detailed task view will be available soon!');
  };

  const FilterButton = ({ 
    title, 
    filter, 
    isSelected 
  }: {
    title: string;
    filter: typeof selectedFilter;
    isSelected: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, isSelected && styles.filterButtonActive]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const TaskCard = ({ task }: { task: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(task)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Ionicons
            name={getTypeIcon(task.type)}
            size={20}
            color="#007AFF"
            style={styles.taskIcon}
          />
          <Text style={styles.taskTitle}>{task.title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
            {task.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.taskDescription}>{task.description}</Text>

      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
              {task.priority.toUpperCase()}
            </Text>
          </View>
          {task.store && (
            <Text style={styles.storeText}>{task.store}</Text>
          )}
        </View>
        <Text style={styles.dueDateText}>Due: {task.dueDate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Coming Soon', 'Create new task feature')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton title="All" filter="all" isSelected={selectedFilter === 'all'} />
          <FilterButton title="Pending" filter="pending" isSelected={selectedFilter === 'pending'} />
          <FilterButton title="In Progress" filter="in_progress" isSelected={selectedFilter === 'in_progress'} />
          <FilterButton title="Completed" filter="completed" isSelected={selectedFilter === 'completed'} />
        </ScrollView>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskCard task={item} />}
        contentContainerStyle={styles.tasksList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No tasks found</Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'all' 
                ? 'You have no tasks assigned yet.'
                : `No ${selectedFilter.replace('_', ' ')} tasks found.`
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  tasksList: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIcon: {
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
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
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  storeText: {
    fontSize: 12,
    color: '#666',
  },
  dueDateText: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
