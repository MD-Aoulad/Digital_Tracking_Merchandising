/**
 * Task Management Page Component - Workforce Management Platform
 * 
 * Comprehensive task management system with Kanban board, task assignment,
 * progress tracking, and collaboration features. Features include:
 * - Kanban board with drag & drop
 * - Task assignment and delegation
 * - Progress tracking and time estimation
 * - File attachments and comments
 * - Priority levels and due dates
 * - Task categories and labels
 * - Team collaboration tools
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  User,
  Flag,
  Paperclip,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Archive
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Task, TaskCategory } from '../../types';
import toast from 'react-hot-toast';

/**
 * TasksPage Component
 * 
 * Main task management interface with Kanban board, task creation,
 * assignment, and progress tracking capabilities.
 * 
 * @returns JSX element with complete task management interface
 */
const TasksPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  /**
   * Initialize mock task data
   */
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new feature',
        assignedTo: ['1', '2'],
        assignedBy: '1',
        dueDate: '2024-01-20',
        priority: 'high',
        status: 'in-progress',
        category: 'documentation',
        attachments: ['doc1.pdf', 'image1.png'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        title: 'Review code changes',
        description: 'Review pull request #123 for the authentication module',
        assignedTo: ['3'],
        assignedBy: '1',
        dueDate: '2024-01-18',
        priority: 'medium',
        status: 'todo',
        category: 'development',
        attachments: [],
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z'
      },
      {
        id: '3',
        title: 'Client meeting preparation',
        description: 'Prepare presentation and materials for client meeting',
        assignedTo: ['2'],
        assignedBy: '1',
        dueDate: '2024-01-22',
        priority: 'urgent',
        status: 'review',
        category: 'meeting',
        attachments: ['presentation.pptx'],
        createdAt: '2024-01-14T16:00:00Z',
        updatedAt: '2024-01-15T11:00:00Z'
      },
      {
        id: '4',
        title: 'Bug fix in login system',
        description: 'Fix authentication issue reported by users',
        assignedTo: ['1'],
        assignedBy: '2',
        dueDate: '2024-01-16',
        priority: 'urgent',
        status: 'completed',
        category: 'bug-fix',
        attachments: ['bug-report.pdf'],
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-15T17:00:00Z'
      }
    ];

    const mockCategories: TaskCategory[] = [
      { id: '1', name: 'Development', color: '#3B82F6', description: 'Software development tasks' },
      { id: '2', name: 'Documentation', color: '#10B981', description: 'Documentation and writing tasks' },
      { id: '3', name: 'Meeting', color: '#F59E0B', description: 'Meeting and presentation tasks' },
      { id: '4', name: 'Bug Fix', color: '#EF4444', description: 'Bug fixing and maintenance tasks' },
      { id: '5', name: 'Design', color: '#8B5CF6', description: 'UI/UX design tasks' }
    ];

    setTasks(mockTasks);
    setCategories(mockCategories);
  }, []);

  /**
   * Get tasks by status for Kanban board
   */
  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  /**
   * Handle drag and drop for task status changes
   */
  const handleTaskMove = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus as any, updatedAt: new Date().toISOString() }
        : task
    ));
    toast.success('Task status updated');
  };

  /**
   * Create new task
   */
  const createTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || '',
      description: taskData.description || '',
      assignedTo: taskData.assignedTo || [],
      assignedBy: user?.id || '',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      priority: taskData.priority || 'medium',
      status: 'todo',
      category: taskData.category || 'development',
      attachments: taskData.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, newTask]);
    toast.success('Task created successfully');
    setShowTaskModal(false);
  };

  /**
   * Update existing task
   */
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
    toast.success('Task updated successfully');
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  /**
   * Delete task
   */
  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success('Task deleted successfully');
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'review':
        return 'text-purple-600 bg-purple-100';
      case 'todo':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Filter tasks based on search and filters
   */
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || task.assignedTo.includes(filterAssignee);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const statusColumns = [
    { key: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { key: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
    { key: 'review', title: 'Review', color: 'bg-purple-100' },
    { key: 'completed', title: 'Completed', color: 'bg-green-100' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Organize, assign, and track tasks across your team</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
            className="btn-secondary flex items-center space-x-2"
          >
            {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Assignees</option>
              <option value="1">Employee 1</option>
              <option value="2">Employee 2</option>
              <option value="3">Employee 3</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        /* Kanban Board */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {statusColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.key);
            return (
              <div key={column.key} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className={`p-4 ${column.color} border-b border-gray-200`}>
                  <h3 className="font-semibold text-gray-900">
                    {column.title}
                    <span className="ml-2 text-sm text-gray-600">({columnTasks.length})</span>
                  </h3>
                </div>
                <div className="p-4 space-y-3 min-h-96">
                  {columnTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move"
                      draggable
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar size={12} />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User size={12} />
                          <span>{task.assignedTo.length} assigned</span>
                        </div>
                      </div>
                      
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Paperclip size={12} />
                          <span className="ml-1">{task.attachments.length} attachments</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{task.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {task.assignedTo.length}
                          </span>
                        </div>
                        <span className="ml-2 text-sm text-gray-900">{task.assignedTo.length} assigned</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTaskModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              <p className="text-sm text-gray-600">Total Tasks</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.priority === 'urgent').length}
              </p>
              <p className="text-sm text-gray-600">Urgent</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
