import React, { useState, useEffect } from 'react';
import { TodoTemplate, TodoSettings, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { createTodo, updateTodo, deleteTodo, getTodos } from '../../core/services/todo';
import { Todo } from '../../core/types';
import TodoSettingsComponent from './TodoSettings';
import { Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, Calendar, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface TodoPageProps {
  userRole: UserRole;
}

const TodoPage: React.FC<TodoPageProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'templates' | 'settings'>('tasks');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [rateLimitRetry, setRateLimitRetry] = useState(false);

  // Authentication and state
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);
  
  const loadTodos = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getTodos();
      setTodos(response.todos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };
  
  // Add retry mechanism for rate limiting
  const handleRetry = () => {
    if (error?.includes('Rate limit exceeded')) {
      if (!rateLimitRetry) {
        setRateLimitRetry(true);
        toast.success('Retrying after rate limit... Please wait 1 minute.');
        setTimeout(() => {
          loadTodos();
          setRateLimitRetry(false);
        }, 60000); // Wait 60 seconds before retrying
      } else {
        toast.error('Please wait before retrying again.');
      }
    } else {
      loadTodos();
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Handle form submission
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      await createTodo(formData);
      toast.success('Todo created successfully!');
      setFormData({ title: '', description: '', priority: 'medium' });
      setShowCreateForm(false);
      loadTodos();
    } catch (error) {
      toast.error('Failed to create todo');
    }
  };

  const handleUpdateTodo = async (id: string, updates: any) => {
    try {
      await updateTodo(id, updates);
      toast.success('Todo updated successfully!');
      loadTodos();
    } catch (error) {
      toast.error('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await deleteTodo(id);
      toast.success('Todo deleted successfully!');
      loadTodos();
    } catch (error) {
      toast.error('Failed to delete todo');
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      await updateTodo(todo.id, { completed: !todo.completed });
      toast.success(todo.completed ? 'Todo marked as incomplete' : 'Todo completed!');
      loadTodos();
    } catch (error) {
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
    },
    {
      id: '2',
      name: 'Weekly Inventory Count',
      description: 'Weekly inventory count template for different sections',
      category: 'Inventory',
      priority: 'medium',
      estimatedDuration: 120,
      isRepeating: true,
      repeatPattern: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [5]
      },
      defaultReminders: [
        {
          id: '2',
          taskId: '2',
          type: 'before-due',
          timeOffset: -60,
          message: 'Weekly inventory count due in 1 hour',
          notificationMethods: {
            email: true,
            push: true,
            sms: true,
            inApp: true
          },
          isActive: true
        }
      ],
      requiresPhoto: true,
      requiresLocation: true,
      requiresSignature: true,
      defaultTags: ['inventory', 'weekly', 'count'],
      createdBy: 'admin-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ];

  const mockSettings: TodoSettings = {
    id: '1',
    isEnabled: true,
    allowLeadersToCreate: true,
    allowedLeaderRoles: ['leader', 'admin'],
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
      requirePhoto: true,
      requireLocation: true,
      requireSignature: false,
      autoApprove: false
    },
    reminderSettings: {
      maxRemindersPerTask: 3,
      reminderInterval: 30,
      escalationEnabled: true
    },
    createdBy: 'admin-1',
    updatedAt: '2025-01-01T00:00:00Z'
  };

  const handleSaveSettings = (settings: TodoSettings) => {
    // TODO: Implement settings save with API
    console.log('Saving settings:', settings);
    toast.success('Settings saved successfully!');
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      urgent: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority as keyof typeof styles] || styles.medium}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };



  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };



  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading todos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading todos</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const todosData = { todos };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Todo Management</h1>
          <p className="text-gray-600">Manage tasks and track progress</p>
        </div>
        {userRole === UserRole.ADMIN && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Todo
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'tasks', label: 'Tasks', count: todos.length },
            { id: 'templates', label: 'Templates', count: mockTemplates.length },
            { id: 'settings', label: 'Settings', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {todos.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No todos</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new todo.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                    todo.completed ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <button
                          onClick={() => handleToggleComplete(todo)}
                          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                            todo.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {todo.completed && <CheckCircle className="w-3 h-3" />}
                        </button>
                        <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {todo.title}
                        </h3>
                        {getPriorityBadge(todo.priority)}
                      </div>
                      
                      {todo.description && (
                        <p className="text-gray-600 mb-3">{todo.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(todo.createdAt).toLocaleDateString()}
                        </div>
                        {todo.completed && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                                             <button
                         onClick={() => handleUpdateTodo(todo.id, { title: todo.title + ' (Updated)' })}
                         className="p-2 text-gray-400 hover:text-gray-600"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
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
        <div className="space-y-4">
          {mockTemplates.map((template) => (
            <div key={template.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      {template.category}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(template.estimatedDuration)}
                    </span>
                    {getPriorityBadge(template.priority)}
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 border border-primary-300 text-primary-700 rounded-md hover:bg-primary-50">
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

             {activeTab === 'settings' && (
         <TodoSettingsComponent settings={mockSettings} onSave={handleSaveSettings} isAdmin={userRole === UserRole.ADMIN} />
       )}

      {/* Create Todo Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Todo</h3>
              <form onSubmit={handleCreateTodo}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter todo title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter description (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
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
  );
};

export default TodoPage; 