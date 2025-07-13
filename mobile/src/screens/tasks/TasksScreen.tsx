import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
}

export default function TasksScreen() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://192.168.178.150:5000/api';

  const getAuthHeaders = () => {
    const token = user?.token;
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const loadTodos = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTodos(data.todos || []);
    } catch (err) {
      console.error('Todo loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const toggleTodoComplete = async (todo: Todo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed: !todo.completed })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedTodo = await response.json();
      setTodos(prev => prev.map(t => t.id === todo.id ? updatedTodo.todo : t));
    } catch (error) {
      console.error('Toggle todo error:', error);
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodos();
    setRefreshing(false);
  };

  useEffect(() => {
    loadTodos();
  }, [user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const renderTodo = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => toggleTodoComplete(item)}
      >
        <View style={styles.todoHeader}>
          <View style={styles.todoTitleRow}>
            <Ionicons
              name={item.completed ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={item.completed ? "#10b981" : "#6b7280"}
            />
            <Text style={[
              styles.todoTitle,
              item.completed && styles.completedText
            ]}>
              {item.title}
            </Text>
          </View>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(item.priority) }
          ]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        </View>
        
        {item.description && (
          <Text style={[
            styles.todoDescription,
            item.completed && styles.completedText
          ]}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.todoFooter}>
          <Text style={styles.todoDate}>
            Assigned: {new Date(item.assignedAt).toLocaleDateString()}
          </Text>
          {item.completedAt && (
            <Text style={styles.todoDate}>
              Completed: {new Date(item.completedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>View and complete assigned tasks</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={32} color="#94a3b8" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.subtitle}>View and complete assigned tasks</Text>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Error loading tasks</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTodos}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No tasks assigned</Text>
          <Text style={styles.emptyMessage}>
            You don't have any tasks assigned to you yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          renderItem={renderTodo}
          keyExtractor={(item) => item.id}
          style={styles.todoList}
          contentContainerStyle={styles.todoListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  todoList: {
    flex: 1,
  },
  todoListContent: {
    padding: 16,
  },
  todoItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todoContent: {
    padding: 16,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  todoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  todoDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  todoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todoDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
