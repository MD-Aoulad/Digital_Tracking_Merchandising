import React, { useState } from 'react';
import { TodoTask, TodoTemplate, TodoSettings, TodoCompletion, UserRole } from '../../types';
import TodoSettingsComponent from './TodoSettings';

interface TodoPageProps {
  userRole: UserRole;
}

const TodoPage: React.FC<TodoPageProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'templates' | 'settings'>('tasks');
  const [selectedTask, setSelectedTask] = useState<TodoTask | null>(null);

  // Mock data for demonstration
  const mockTasks: TodoTask[] = [
    {
      id: '1',
      title: 'Daily Store Opening Checklist',
      description: 'Complete the daily opening checklist including cash register setup, inventory check, and store cleanliness',
      assignedBy: 'admin-1',
      assignedTo: ['user-1', 'user-2'],
      priority: 'high',
      status: 'in-progress',
      category: 'Daily Operations',
      dueDate: '2025-01-13',
      dueTime: '09:00',
      estimatedDuration: 30,
      isRepeating: true,
      repeatPattern: {
        frequency: 'daily',
        interval: 1,
        daysOfWeek: [1, 2, 3, 4, 5, 6]
      },
      reminders: [
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
      attachments: [],
      requiresPhoto: true,
      requiresLocation: true,
      requiresSignature: false,
      tags: ['opening', 'checklist', 'daily'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-13T08:30:00Z',
      startedAt: '2025-01-13T08:30:00Z'
    },
    {
      id: '2',
      title: 'Inventory Count - Electronics Section',
      description: 'Perform physical inventory count for all electronics items and update the system',
      assignedBy: 'admin-1',
      assignedTo: ['user-3'],
      assignedWorkplaces: ['workplace-1'],
      priority: 'medium',
      status: 'pending',
      category: 'Inventory',
      dueDate: '2025-01-14',
      dueTime: '17:00',
      estimatedDuration: 120,
      isRepeating: false,
      reminders: [
        {
          id: '2',
          taskId: '2',
          type: 'before-due',
          timeOffset: -60,
          message: 'Inventory count due in 1 hour',
          notificationMethods: {
            email: true,
            push: true,
            sms: true,
            inApp: true
          },
          isActive: true
        }
      ],
      attachments: [],
      requiresPhoto: true,
      requiresLocation: true,
      requiresSignature: true,
      tags: ['inventory', 'electronics', 'count'],
      createdAt: '2025-01-12T10:00:00Z',
      updatedAt: '2025-01-12T10:00:00Z'
    },
    {
      id: '3',
      title: 'Customer Complaint Resolution',
      description: 'Follow up with customer regarding product quality complaint and provide resolution',
      assignedBy: 'leader-1',
      assignedTo: ['user-4'],
      priority: 'urgent',
      status: 'completed',
      category: 'Customer Service',
      dueDate: '2025-01-13',
      dueTime: '16:00',
      estimatedDuration: 45,
      isRepeating: false,
      reminders: [],
      attachments: [],
      requiresPhoto: false,
      requiresLocation: false,
      requiresSignature: false,
      tags: ['customer', 'complaint', 'resolution'],
      createdAt: '2025-01-13T14:00:00Z',
      updatedAt: '2025-01-13T15:30:00Z',
      completedAt: '2025-01-13T15:30:00Z'
    }
  ];

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
    console.log('Saving settings:', settings);
    // In a real app, this would save to the backend
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (priority) {
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'medium':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'low':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'in-progress':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'overdue':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const isOverdue = (task: TodoTask) => {
    const now = new Date();
    const dueDate = new Date(`${task.dueDate} ${task.dueTime || '23:59'}`);
    return now > dueDate && task.status !== 'completed' && task.status !== 'cancelled';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">To-Do Management</h1>
          <p className="mt-2 text-gray-600">
            Assign tasks to employees with notifications and reminders. Track completion and request rework when needed.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Templates
            </button>
            {userRole === UserRole.ADMIN && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
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
          <div className="space-y-6">
            {/* Create New Task Button */}
            {(userRole === UserRole.ADMIN || mockSettings.allowLeadersToCreate) && (
              <div className="flex justify-end">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Task
                </button>
              </div>
            )}

            {/* Tasks List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {mockTasks.map((task) => (
                  <li key={task.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                            {task.isRepeating && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                🔄 Repeating
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={getPriorityBadge(task.priority)}>
                              {task.priority}
                            </span>
                            <span className={getStatusBadge(task.status)}>
                              {task.status.replace('-', ' ')}
                            </span>
                            {isOverdue(task) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ⏰ Overdue
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                            {task.dueTime && ` at ${task.dueTime}`}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {formatDuration(task.estimatedDuration)}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {task.category}
                          </div>
                          <div>
                            <span className="font-medium">Assigned:</span> {task.assignedTo.length} employee(s)
                          </div>
                        </div>

                        {task.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {task.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            {task.requiresPhoto && <span>📷 Photo Required</span>}
                            {task.requiresLocation && <span>📍 Location Required</span>}
                            {task.requiresSignature && <span>✍️ Signature Required</span>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                            {task.startedAt && (
                              <span>Started: {new Date(task.startedAt).toLocaleDateString()}</span>
                            )}
                            {task.completedAt && (
                              <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Create New Template Button */}
            {userRole === UserRole.ADMIN && (
              <div className="flex justify-end">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Template
                </button>
              </div>
            )}

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTask(null)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      </div>
                      {template.isRepeating && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🔄 Repeating
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{template.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Priority:</span>
                        <span className={getPriorityBadge(template.priority)}>
                          {template.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">{formatDuration(template.estimatedDuration)}</span>
                      </div>
                      {template.isRepeating && template.repeatPattern && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Repeat:</span>
                          <span className="font-medium">
                            {template.repeatPattern.frequency} ({template.repeatPattern.interval})
                          </span>
                        </div>
                      )}
                    </div>

                    {template.defaultTags.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {template.defaultTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && userRole === UserRole.ADMIN && (
          <TodoSettingsComponent
            settings={mockSettings}
            onSave={handleSaveSettings}
            isAdmin={true}
          />
        )}
      </div>
    </div>
  );
};

export default TodoPage; 