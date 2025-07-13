import React, { useState, useEffect } from 'react';
import { TodoTemplate, TodoSettings, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import TodoSettingsComponent from './TodoSettings';
import { Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, Calendar, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface TodoPageProps {
  userRole: UserRole;
}

// Direct API functions for todo operations
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  return response.json();
};

// Todo API functions
const getTodos = async () => {
  return apiRequest('/todos');
};

const createTodo = async (todoData: any) => {
  return apiRequest('/todos', {
    method: 'POST',
    body: JSON.stringify(todoData)
  });
};

const updateTodo = async (id: string, updates: any) => {
  return apiRequest(`/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
};

const deleteTodo = async (id: string) => {
  return apiRequest(`/todos/${id}`, {
    method: 'DELETE'
  });
};

const TodoPage: React.FC<TodoPageProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'templates' | 'settings'>('tasks');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Authentication and state
  const { user } = useAuth();
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load todos on component mount
  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);
  
  const loadTodos = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getTodos();
      setTodos(response.todos || response || []);
    } catch (err) {
      console.error('Todo loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load todos');
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: ''
  });

  // Users for assignment dropdown
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users for assignment dropdown (admin only)
  const loadUsers = async () => {
    if (userRole !== 'admin') return;
    
    setLoadingUsers(true);
    try {
      const response = await apiRequest('/users');
      setUsers(response.users || response || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users for assignment');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load users when component mounts (admin only)
  useEffect(() => {
    if (userRole === 'admin') {
      loadUsers();
    }
  }, [userRole]);

  // Handle form submission
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const response = await createTodo(formData);
      // Handle backend response format: { message: '...', todo: {...} }
      const newTodo = response.todo || response;
      // Optimistic update - add the new todo to the list
      setTodos(prev => [...prev, newTodo]);
      toast.success('Todo created successfully!');
      setFormData({ title: '', description: '', priority: 'medium', assignedTo: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Create todo error:', error);
      toast.error('Failed to create todo');
    }
  };

  const handleUpdateTodo = async (id: string, updates: any) => {
    try {
      const response = await updateTodo(id, updates);
      // Handle backend response format: { message: '...', todo: {...} }
      const updatedTodo = response.todo || response;
      // Optimistic update - update the todo in the list
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
      toast.success('Todo updated successfully!');
    } catch (error) {
      console.error('Update todo error:', error);
      toast.error('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await deleteTodo(id);
      // Optimistic update - remove the todo from the list
      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast.success('Todo deleted successfully!');
    } catch (error) {
      console.error('Delete todo error:', error);
      toast.error('Failed to delete todo');
    }
  };

  const handleToggleComplete = async (todo: any) => {
    try {
      const response = await updateTodo(todo.id, { completed: !todo.completed });
      // Handle backend response format: { message: '...', todo: {...} }
      const updatedTodo = response.todo || response;
      // Optimistic update - update the todo in the list
      setTodos(prev => prev.map(t => t.id === todo.id ? updatedTodo : t));
      toast.success(todo.completed ? 'Todo marked as incomplete' : 'Todo completed!');
    } catch (error) {
      console.error('Toggle todo error:', error);
      toast.error('Failed to update todo');
    }
  };

  // Mock data for templates and settings (keeping existing structure)
  const mockTemplates: TodoTemplate[] = [
    {
      id: '1',
      name: 'Daily Opening Checklist',
      description: 'Standard daily opening procedures for retail stores',
      category: 'Daily Operations',
      priority: 'high',
      estimatedDuration: 30,
      isRepeating: true,
      repeatPattern: {
        frequency: 'daily',
        interval: 1,
        daysOfWeek: [1, 2, 3, 4, 5, 6]
      },
      defaultReminders: [
        {
          id: '1',
          taskId: '1',
          type: 'before-due',
          timeOffset: -15,
          message: 'Store opening checklist due in 15 minutes',
          notificationMethods: {
            email: true,
            push: true,
            sms: false,
            inApp: true
          },
          isActive: true
        }
      ],
      requiresPhoto: true,
      requiresLocation: true,
      requiresSignature: false,
      defaultTags: ['opening', 'checklist', 'daily'],
      createdBy: 'admin-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ];

  // Mock settings for demo
  const mockSettings: TodoSettings = {
    id: '1',
    isEnabled: true,
    allowLeadersToCreate: true,
    allowedLeaderRoles: ['manager', 'supervisor', 'team-lead'],
    defaultPriority: 'medium',
    defaultReminders: {
      beforeDueMinutes: 15,
      atDueTime: true,
      afterDueMinutes: 30
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      inAppNotifications: true
    },
    completionSettings: {
      requirePhoto: false,
      requireLocation: false,
      requireSignature: false,
      autoApprove: true
    },
    reminderSettings: {
      maxRemindersPerTask: 3,
      reminderInterval: 60,
      escalationEnabled: true
    },
    createdBy: '1',
    updatedAt: new Date().toISOString()
  };

  const handleSaveSettings = (settings: TodoSettings) => {
    console.log('Saving settings:', settings);
    toast.success('Settings saved successfully!');
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Authentication Required</h2>
          <p className="text-gray-500">Please log in to access the todo feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Todo Management</h1>
              <p className="mt-2 text-gray-600">Manage your tasks and track progress</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Todo
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Templates
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Settings
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading todos...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading todos</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={loadTodos}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Try again
                </button>
              </div>
            ) : todos.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No todos yet</h3>
                <p className="text-gray-600 mb-4">Create your first todo to get started</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Create Todo
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {todos.map((todo) => (
                  <div key={todo.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <button
                          onClick={() => handleToggleComplete(todo)}
                          className={`mt-1 p-1 rounded-full ${
                            todo.completed
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {todo.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-lg font-medium ${
                              todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                            }`}>
                              {todo.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(todo.priority)}`}>
                              {todo.priority}
                            </span>
                          </div>
                          {todo.description && (
                            <p className={`text-sm ${
                              todo.completed ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {todo.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
                            {todo.assignedTo !== todo.userId && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Assigned
                              </span>
                            )}
                            {todo.completedAt && (
                              <span>Completed: {new Date(todo.completedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleUpdateTodo(todo.id, { priority: todo.priority === 'high' ? 'medium' : 'high' })}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Todo Templates</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockTemplates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(template.priority)}`}>
                      {template.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.category}</span>
                    <span>{formatDuration(template.estimatedDuration)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && userRole === 'admin' && (
          <TodoSettingsComponent settings={mockSettings} onSave={handleSaveSettings} isAdmin={userRole === 'admin'} />
        )}

        {/* Create Todo Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Todo</h2>
                <form onSubmit={handleCreateTodo}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter todo title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter todo description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    {userRole === 'admin' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assign To
                        </label>
                        <select
                          value={formData.assignedTo}
                          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Unassigned</option>
                          {loadingUsers ? (
                            <option value="">Loading users...</option>
                          ) : users.length === 0 ? (
                            <option value="">No users found</option>
                          ) : (
                            users.map(user => (
                              <option key={user.id} value={user.id}>{user.name}</option>
                            ))
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Create Todo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoPage; 