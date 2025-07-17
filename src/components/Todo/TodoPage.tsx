import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TodoTemplate, TodoSettings, UserRole, AdvancedTodo, TodoSubmission, TodoTask } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import TodoSettingsComponent from './TodoSettings';
import AdvancedTodoCreator from './AdvancedTodoCreator';
import AdvancedTodoResponse from './AdvancedTodoResponse';
import { Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, Calendar, Tag, FileText, Users, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import TodoManagement from './TodoManagement'; // Added import for TodoManagement

/**
 * Props interface for TodoPage component
 * @interface TodoPageProps
 * @property {UserRole} userRole - The role of the current user (admin, employee, etc.)
 */
interface TodoPageProps {
  userRole: UserRole;
}

// Direct API functions for todo operations
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Creates authentication headers for API requests
 * @returns {Object} Headers object with Content-Type and Authorization
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Generic API request function with authentication
 * @param {string} url - API endpoint URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} API response data
 * @throws {Error} When API request fails
 */
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
/**
 * Fetches all todos for the authenticated user
 * @returns {Promise<any>} Array of todos
 */
const getTodos = async () => {
  return apiRequest('/todos');
};

/**
 * Creates a new todo item
 * @param {any} todoData - Todo data including title, description, priority, assignedTo
 * @returns {Promise<any>} Created todo object
 */
const createTodo = async (todoData: any) => {
  return apiRequest('/todos', {
    method: 'POST',
    body: JSON.stringify(todoData)
  });
};

/**
 * Updates an existing todo item
 * @param {string} id - Todo ID
 * @param {any} updates - Updated todo data
 * @returns {Promise<any>} Updated todo object
 */
const updateTodo = async (id: string, updates: any) => {
  return apiRequest(`/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
};

/**
 * Deletes a todo item
 * @param {string} id - Todo ID to delete
 * @returns {Promise<any>} Deletion confirmation
 */
const deleteTodo = async (id: string) => {
  return apiRequest(`/todos/${id}`, {
    method: 'DELETE'
  });
};

/**
 * TodoPage Component
 * 
 * Main component for managing todos. Provides functionality for:
 * - Viewing todos assigned to the current user
 * - Creating new todos (with assignment for admins)
 * - Creating advanced todos with questions (admin only)
 * - Responding to advanced todos (employees)
 * - Updating todo status and details
 * - Deleting todos
 * - Managing todo settings and templates
 * 
 * @param {TodoPageProps} props - Component props
 * @returns {JSX.Element} TodoPage component
 */
const TodoPage: React.FC<TodoPageProps> = ({ userRole }) => {
  // State management for tabs and forms
  const [activeTab, setActiveTab] = useState<'tasks' | 'advanced' | 'templates' | 'settings'>('tasks');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAdvancedCreator, setShowAdvancedCreator] = useState(false);
  const [selectedAdvancedTodo, setSelectedAdvancedTodo] = useState<AdvancedTodo | null>(null);

  // Authentication and state
  const { user } = useAuth();
  const [todos, setTodos] = useState<any[]>([]);
  const [advancedTodos, setAdvancedTodos] = useState<AdvancedTodo[]>([]);
  const [todoSubmissions, setTodoSubmissions] = useState<TodoSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Loads todos from the API for the authenticated user
   * Handles loading states and error handling
   */
  const loadTodos = useCallback(async () => {
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
  }, [user]);

  /**
   * Loads advanced todos from the API
   */
  const loadAdvancedTodos = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await apiRequest('/advanced-todos');
      setAdvancedTodos(response.advancedTodos || []);
    } catch (err) {
      console.error('Advanced todo loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load advanced todos');
      toast.error('Failed to load advanced todos');
    }
  }, [user]);

  /**
   * Creates a new advanced todo
   */
  const handleCreateAdvancedTodo = async (advancedTodo: AdvancedTodo) => {
    try {
      console.log('Creating advanced todo:', advancedTodo);
      
      const response = await apiRequest('/advanced-todos', {
        method: 'POST',
        body: JSON.stringify(advancedTodo)
      });
      
      console.log('Advanced todo created successfully:', response);
      setAdvancedTodos(prev => [...prev, response.advancedTodo]);
      setShowAdvancedCreator(false);
      toast.success('Advanced todo created successfully');
    } catch (err) {
      console.error('Advanced todo creation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create advanced todo';
      toast.error(errorMessage);
      alert(`Failed to create advanced todo: ${errorMessage}`);
    }
  };

  /**
   * Handles advanced todo submission
   */
  const handleAdvancedTodoSubmit = async (submission: TodoSubmission) => {
    try {
      const response = await apiRequest(`/advanced-todos/${submission.todoId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          responses: submission.responses,
          status: submission.status
        })
      });
      
      setTodoSubmissions(prev => [...prev, response.submission]);
      setSelectedAdvancedTodo(null);
      toast.success('Todo submitted successfully');
    } catch (err) {
      console.error('Todo submission error:', err);
      toast.error('Failed to submit todo');
    }
  };

  /**
   * Saves advanced todo as draft
   */
  const handleSaveDraft = async (submission: TodoSubmission) => {
    try {
      const response = await apiRequest(`/advanced-todos/${submission.todoId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          responses: submission.responses,
          status: 'draft'
        })
      });
      
      setTodoSubmissions(prev => [...prev, response.submission]);
      toast.success('Draft saved successfully');
    } catch (err) {
      console.error('Draft save error:', err);
      toast.error('Failed to save draft');
    }
  };

  // Load data on component mount - FIXED: Only depend on user ID to prevent loops
  useEffect(() => {
    console.log('useEffect fired for todos/advancedTodos', user?.id);
    if (user) {
      loadTodos();
      loadAdvancedTodos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Form state for creating new todos
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: ''
  });

  // Users for assignment dropdown (admin only)
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  /**
   * Loads users for the assignment dropdown (admin only)
   * Fetches all users that can be assigned todos
   */
  const loadUsers = useCallback(async () => {
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
  }, [userRole]);

  // Load users when component mounts (admin only) - FIXED: Added userRole to dependencies
  useEffect(() => {
    if (userRole === 'admin') {
      loadUsers();
    }
  }, [userRole, loadUsers]);

  /**
   * Handles form submission for creating new todos
   * Validates required fields and creates todo via API
   * @param {React.FormEvent} e - Form submission event
   */
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

  /**
   * Updates an existing todo item
   * Handles optimistic updates for better UX
   * @param {string} id - Todo ID to update
   * @param {any} updates - Updated todo data
   */
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

  /**
   * Deletes a todo item after user confirmation
   * Handles optimistic updates for better UX
   * @param {string} id - Todo ID to delete
   */
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

  /**
   * Toggles the completion status of a todo
   * Updates the completedAt timestamp when completed
   * @param {any} todo - Todo object to toggle
   */
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
  /**
   * Mock todo templates for demonstration purposes
   * In a real application, these would be fetched from the API
   */
  const mockTemplates: TodoTemplate[] = useMemo(() => [
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
      updatedAt: '2025-01-01T00:00:00Z',
      questions: [],
      difficulty: 'medium',
      tags: ['opening', 'checklist', 'daily'],
      isPublic: true,
      usageCount: 0
    }
  ], []);

  // Mock settings for demo
  /**
   * Mock todo settings for demonstration purposes
   * In a real application, these would be fetched from the API
   */
  const mockSettings: TodoSettings = useMemo(() => ({
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
  }), []);

  /**
   * Handles saving todo settings
   * Currently logs to console and shows success message
   * In a real application, this would save to the API
   * @param {TodoSettings} settings - Settings to save
   */
  const handleSaveSettings = (settings: TodoSettings) => {
    console.log('Saving settings:', settings);
    toast.success('Settings saved successfully!');
  };

  /**
   * Returns CSS classes for priority badge styling
   * @param {string} priority - Priority level (low, medium, high)
   * @returns {string} CSS classes for the priority badge
   */
  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  /**
   * Formats duration in minutes to human-readable format
   * @param {number} minutes - Duration in minutes
   * @returns {string} Formatted duration (e.g., "2h 30m" or "45m")
   */
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  /**
   * Renders the advanced todos tab content
   */
  const renderAdvancedTodosTab = () => {
    if (userRole === 'admin') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Advanced Todos</h2>
            <button
              onClick={() => setShowAdvancedCreator(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Create Advanced Todo</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading advanced todos...</p>
            </div>
          ) : advancedTodos.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Advanced Todos</h3>
              <p className="text-gray-600 mb-4">Create your first advanced todo with custom questions.</p>
              <button
                onClick={() => setShowAdvancedCreator(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Advanced Todo
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {advancedTodos.map(todo => (
                <div key={todo.id} className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{todo.title}</h3>
                      {todo.description && (
                        <p className="text-gray-600 mb-3">{todo.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <Tag size={14} className="mr-1" />
                          {todo.category}
                        </span>
                        <span className="flex items-center">
                          <Users size={14} className="mr-1" />
                          {todo.assignedTo.length} assigned
                        </span>
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {todo.estimatedDuration} min
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          todo.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          todo.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {todo.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {todo.questions.length} questions
                        </span>
                        {todo.requireApproval && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            Requires Approval
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          // TODO: View submissions
                        }}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Responses
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Edit todo
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Delete todo
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      // Employee view - show assigned advanced todos
      const assignedTodos = advancedTodos.filter(todo => 
        todo.assignedTo.includes(user?.id || '')
      );

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">My Advanced Todos</h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading advanced todos...</p>
            </div>
          ) : assignedTodos.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Advanced Todos Assigned</h3>
              <p className="text-gray-600">You don't have any advanced todos assigned to you.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {assignedTodos.map(todo => {
                const submission = todoSubmissions.find(sub => 
                  sub.todoId === todo.id && sub.userId === user?.id
                );

                return (
                  <div key={todo.id} className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{todo.title}</h3>
                        {todo.description && (
                          <p className="text-gray-600 mb-3">{todo.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center">
                            <Tag size={14} className="mr-1" />
                            {todo.category}
                          </span>
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {todo.estimatedDuration} min
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            todo.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            todo.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {todo.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {todo.questions.length} questions
                          </span>
                          {submission && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              submission.status === 'completed' ? 'bg-green-100 text-green-800' :
                              submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {submission.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {submission ? (
                          <button
                            onClick={() => setSelectedAdvancedTodo(todo)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            {submission.status === 'completed' ? 'View' : 'Continue'}
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedAdvancedTodo(todo)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
  };

  // Add handleSaveTodo to handle full todo object
  const handleSaveTodo = async (todo: TodoTask) => {
    try {
      await createTodo(todo);
      await loadTodos();
      setShowCreateForm(false);
      toast.success('Todo created successfully!');
    } catch (error) {
      console.error('Create todo error:', error);
      toast.error('Failed to create todo');
    }
  };

  // Mock workplaces for TodoManagement
  const mockWorkplaces = useMemo(() => [
    { id: 'wp1', name: 'Store 1' },
    { id: 'wp2', name: 'Store 2' },
    { id: 'wp3', name: 'Store 3' }
  ], []);

  // Authentication check - show login prompt if user is not authenticated
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Todo Management</h1>
              <p className="text-gray-600">
                {userRole === 'admin' 
                  ? 'Create and manage todos for your team' 
                  : 'View and complete your assigned todos'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Quick Create Todo Button - Always Visible */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2 shadow-sm"
              >
                <Plus size={16} />
                <span>Create Todo</span>
              </button>
              
              {/* Advanced Create Button - Admin Only */}
              {userRole === 'admin' && (
                <button
                  onClick={() => setShowAdvancedCreator(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 shadow-sm"
                >
                  <FileText size={16} />
                  <span>Create Advanced</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'tasks', label: 'My Todos', icon: CheckCircle, description: 'Simple task management' },
              { id: 'advanced', label: 'Advanced Tasks', icon: FileText, description: 'Complex workflows & forms' },
              { id: 'templates', label: 'Templates', icon: Calendar, description: 'Reusable task templates' },
              { id: 'settings', label: 'Settings', icon: Settings, description: 'Configure preferences' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-start space-y-1 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                title={tab.description}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </div>
                <span className={`text-xs ${
                  activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  {tab.description}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to get organized?</h3>
                <p className="text-gray-600 mb-4">Create your first todo to start tracking your tasks and stay productive.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Create Your First Todo</span>
                  </button>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setShowAdvancedCreator(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                    >
                      <FileText size={16} />
                      <span>Create Advanced Task</span>
                    </button>
                  )}
                </div>
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

        {activeTab === 'advanced' && renderAdvancedTodosTab()}

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

        {activeTab === 'settings' && (
          <TodoSettingsComponent onSave={handleSaveSettings} settings={mockSettings} isAdmin={userRole === 'admin'} />
        )}

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 flex items-center justify-center"
            title="Create Todo"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Create Todo Modal */}
        {showCreateForm && (
          <TodoManagement
            onSave={handleSaveTodo}
            onCancel={() => setShowCreateForm(false)}
            templates={mockTemplates}
            employees={users}
            workplaces={mockWorkplaces}
            userRole={userRole}
          />
        )}

        {/* Modals */}
        {showAdvancedCreator && (
          <AdvancedTodoCreator
            onSave={handleCreateAdvancedTodo}
            onCancel={() => setShowAdvancedCreator(false)}
          />
        )}

        {selectedAdvancedTodo && (
          <AdvancedTodoResponse
            todo={selectedAdvancedTodo}
            onSubmit={handleAdvancedTodoSubmit}
            onSaveDraft={handleSaveDraft}
            initialResponses={todoSubmissions.find(sub => 
              sub.todoId === selectedAdvancedTodo.id && sub.userId === user?.id
            )?.responses || []}
          />
        )}
      </div>
    </div>
  );
};

export default TodoPage; 