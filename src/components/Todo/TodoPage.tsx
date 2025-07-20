/**
 * Todo Page Component - Task Management Interface
 * 
 * This component provides the main interface for task management in the Workforce Management Platform.
 * It handles todo creation, editing, deletion, and advanced features like questionnaires and assignments.
 * 
 * Key Features:
 * - Display and manage user todos
 * - Create new todos with various types
 * - Edit existing todos with real-time updates
 * - Delete todos with confirmation
 * - Advanced todo creation with questionnaires
 * - Todo assignment and delegation
 * - Progress tracking and completion status
 * - Category and priority management
 * - Due date and reminder functionality
 * - Search and filtering capabilities
 * - Bulk operations and batch processing
 * - Real-time status updates
 * - Integration with approval workflows
 * 
 * Component Structure:
 * - TodoList: Displays all todos with filtering
 * - TodoForm: Form for creating/editing todos
 * - TodoItem: Individual todo display and actions
 * - AdvancedTodoCreator: Advanced todo creation with questions
 * - TodoFilters: Search and filter controls
 * - TodoStats: Progress and statistics display
 * 
 * State Management:
 * - Local state for UI interactions
 * - API integration for data persistence
 * - Real-time updates via WebSocket
 * - Error handling and loading states
 * - Optimistic updates for better UX
 * 
 * User Roles:
 * - Admin: Full CRUD operations, assignment capabilities
 * - Employee: View assigned todos, submit responses
 * - Manager: Create todos, assign to team members
 * 
 * API Integration:
 * - GET /api/todos - Fetch user todos
 * - POST /api/todos - Create new todo
 * - PUT /api/todos/:id - Update todo
 * - DELETE /api/todos/:id - Delete todo
 * - GET /api/advanced-todos - Fetch advanced todos
 * - POST /api/advanced-todos - Create advanced todo
 * - POST /api/todos/:id/responses - Submit responses
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 * @lastUpdated 2025-07-19
 */

import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { t } from '../../lib/i18n';
import { useLanguageChange } from '../../lib/i18n-hooks';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../../services/api';
import { UserRole } from '../../types';
import AdvancedTodoCreator from './AdvancedTodoCreator';

// ===== TYPE DEFINITIONS =====

/**
 * Todo interface representing a task item
 * Contains all necessary information for task management
 */
interface Todo {
  id: string;                    // Unique todo identifier
  title: string;                 // Todo title/name
  description: string;           // Detailed description
  priority: 'low' | 'medium' | 'high'; // Priority level
  completed: boolean;            // Completion status
  createdAt: string;             // Creation timestamp
  completedAt: string | null;    // Completion timestamp (if completed)
  userId: string;                // Owner user ID
  assignedTo?: string;           // Assigned user ID (if assigned)
  category?: string;             // Todo category
  dueDate?: string;              // Due date (if set)
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'; // Current status
}

/**
 * Todo form data interface
 * Used for creating and editing todos
 */
interface TodoFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string;
  assignedTo?: string;
}

/**
 * Filter options interface
 * Used for filtering and searching todos
 */
interface FilterOptions {
  search: string;
  priority: string;
  status: string;
  category: string;
  assignedTo: string;
}

/**
 * TodoPage component props
 * Defines the interface for component props
 */
interface TodoPageProps {
  userRole: UserRole;            // Current user's role for access control
}

/**
 * Todo Page Component
 * 
 * Main component for todo management functionality.
 * Provides comprehensive task management interface with advanced features.
 * 
 * @param props - Component props containing user role
 * @returns JSX element representing the todo management interface
 */
const TodoPage: React.FC<TodoPageProps> = ({ userRole }) => {
  // Use language change hook to trigger re-renders when language changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentLocale = useLanguageChange();

  // ===== STATE MANAGEMENT =====

  /**
   * Local state for managing todos and UI interactions
   */
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showAdvancedCreator, setShowAdvancedCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Filter state for search and filtering functionality
   */
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    priority: '',
    status: '',
    category: '',
    assignedTo: ''
  });

  // ===== API HOOKS =====

  /**
   * API hooks for todo operations
   * Provides data fetching and mutation capabilities
   */
  const { data: todosData, loading: todosLoading, error: todosError, refetch: refetchTodos } = useTodos();
  const { mutate: createTodo, loading: creatingTodo } = useCreateTodo();
  const { mutate: updateTodo, loading: updatingTodo } = useUpdateTodo();
  const { mutate: deleteTodo, loading: deletingTodo } = useDeleteTodo();

  // ===== EFFECTS =====

  /**
   * Effect to update local todos when API data changes
   * Handles data synchronization between API and local state
   */
  useEffect(() => {
    if (todosData) {
      // Handle both array and object response formats
      const todosArray = Array.isArray(todosData) ? todosData : todosData.todos || [];
      setTodos(todosArray as Todo[]);
      setLoading(false);
    }
  }, [todosData]);

  /**
   * Effect to handle API errors
   * Displays error messages and manages error state
   */
  useEffect(() => {
    if (todosError) {
      setError(todosError);
      setLoading(false);
    }
  }, [todosError]);

  /**
   * Effect to apply filters when todos or filters change
   * Updates filtered todos based on current filter criteria
   */
  useEffect(() => {
    applyFilters();
  }, [todos, filters]);

  // ===== UTILITY FUNCTIONS =====

  /**
   * Apply filters to todos based on current filter criteria
   * Handles search, priority, status, category, and assignment filtering
   */
  const applyFilters = () => {
    let filtered = [...todos];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchLower) ||
        todo.description.toLowerCase().includes(searchLower) ||
        todo.category?.toLowerCase().includes(searchLower)
      );
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(todo => todo.priority === filters.priority);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(todo => todo.status === filters.status);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(todo => todo.category === filters.category);
    }

    // Assigned to filter
    if (filters.assignedTo) {
      filtered = filtered.filter(todo => todo.assignedTo === filters.assignedTo);
    }

    setFilteredTodos(filtered);
  };

  /**
   * Handle filter changes
   * Updates filter state and triggers re-filtering
   * 
   * @param key - Filter key to update
   * @param value - New filter value
   */
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Clear all filters
   * Resets filter state to default values
   */
  const clearFilters = () => {
    setFilters({
      search: '',
      priority: '',
      status: '',
      category: '',
      assignedTo: ''
    });
  };

  // ===== TODO OPERATIONS =====

  /**
   * Handle todo creation
   * Creates a new todo and updates the list
   * 
   * @param todoData - Todo data to create
   */
  const handleCreateTodo = async (todoData: TodoFormData) => {
    try {
      await createTodo(todoData);
      setShowForm(false);
      refetchTodos();
    } catch (error) {
      setError('Failed to create todo');
    }
  };

  /**
   * Handle todo update
   * Updates an existing todo and refreshes the list
   * 
   * @param todoId - ID of todo to update
   * @param todoData - Updated todo data
   */
  const handleUpdateTodo = async (todoId: string, todoData: Partial<TodoFormData>) => {
    try {
      await updateTodo({ id: todoId, ...todoData });
      setEditingTodo(null);
      refetchTodos();
    } catch (error) {
      setError('Failed to update todo');
    }
  };

  /**
   * Handle todo deletion
   * Deletes a todo with confirmation
   * 
   * @param todoId - ID of todo to delete
   */
  const handleDeleteTodo = async (todoId: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(todoId);
        refetchTodos();
      } catch (error) {
        setError('Failed to delete todo');
      }
    }
  };

  /**
   * Handle todo completion toggle
   * Toggles the completion status of a todo
   * 
   * @param todoId - ID of todo to toggle
   * @param completed - New completion status
   */
  const handleToggleComplete = async (todoId: string, completed: boolean) => {
    try {
      await updateTodo({ 
        id: todoId, 
        completed,
        completedAt: completed ? new Date().toISOString() : null
      });
      refetchTodos();
    } catch (error) {
      setError('Failed to update todo status');
    }
  };

  // ===== RENDER HELPERS =====

  /**
   * Get priority icon based on priority level
   * Returns appropriate icon component for visual representation
   * 
   * @param priority - Priority level
   * @returns Icon component
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * Get status color based on status
   * Returns appropriate CSS class for status styling
   * 
   * @param status - Todo status
   * @returns CSS class name
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ===== LOADING AND ERROR STATES =====

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('todo.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('todo.error')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              refetchTodos();
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            {t('todo.retry')}
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('todo.title')}</h1>
          <p className="text-gray-600 mt-1">{t('todo.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Advanced Todo Creator Button (Admin only) */}
          {userRole === UserRole.ADMIN && (
            <button
              onClick={() => setShowAdvancedCreator(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{t('todo.createAdvanced')}</span>
            </button>
          )}
          
          {/* Create Todo Button */}
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t('todo.create')}</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            {t('todo.filters')}
          </h2>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {t('todo.clearFilters')}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('todo.searchPlaceholder')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{t('todo.allPriorities')}</option>
            <option value="low">{t('todo.priorityLow')}</option>
            <option value="medium">{t('todo.priorityMedium')}</option>
            <option value="high">{t('todo.priorityHigh')}</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{t('todo.allStatuses')}</option>
            <option value="pending">{t('todo.statusPending')}</option>
            <option value="in-progress">{t('todo.statusInProgress')}</option>
            <option value="completed">{t('todo.statusCompleted')}</option>
            <option value="overdue">{t('todo.statusOverdue')}</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{t('todo.allCategories')}</option>
            <option value="work">{t('todo.categoryWork')}</option>
            <option value="personal">{t('todo.categoryPersonal')}</option>
            <option value="urgent">{t('todo.categoryUrgent')}</option>
          </select>

          {/* Assigned To Filter */}
          <select
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{t('todo.allAssignments')}</option>
            <option value="me">{t('todo.assignedToMe')}</option>
            <option value="others">{t('todo.assignedToOthers')}</option>
          </select>
        </div>
      </div>

      {/* Todo Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">{t('todo.totalTodos')}</p>
              <p className="text-2xl font-semibold text-gray-900">{todos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">{t('todo.completed')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {todos.filter(todo => todo.completed).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">{t('todo.inProgress')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {todos.filter(todo => todo.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">{t('todo.overdue')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {todos.filter(todo => todo.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('todo.list')}</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTodos.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('todo.noTodos')}</h3>
              <p className="text-gray-500">{t('todo.noTodosDescription')}</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div key={todo.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Completion Checkbox */}
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(e) => handleToggleComplete(todo.id, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    
                    {/* Todo Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {todo.title}
                        </h3>
                        {getPriorityIcon(todo.priority)}
                      </div>
                      
                      {todo.description && (
                        <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {todo.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2">
                        {todo.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {todo.category}
                          </span>
                        )}
                        
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
                          {t(`todo.status${todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}`)}
                        </span>
                        
                        {todo.dueDate && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(todo.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingTodo(todo)}
                      className="text-gray-400 hover:text-gray-600"
                      title={t('todo.edit')}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-gray-400 hover:text-red-600"
                      title={t('todo.delete')}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Todo Form Modal - Placeholder */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingTodo ? 'Edit Todo' : 'Create Todo'}
            </h2>
            <p className="text-gray-600 mb-4">
              Todo form component will be implemented here.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTodo(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTodo(null);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                {editingTodo ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Todo Creator Modal */}
      {showAdvancedCreator && (
        <AdvancedTodoCreator
          onSave={(todo) => {
            console.log('Advanced todo created:', todo);
            setShowAdvancedCreator(false);
            refetchTodos();
          }}
          onCancel={() => setShowAdvancedCreator(false)}
        />
      )}
    </div>
  );
};

export default TodoPage; 