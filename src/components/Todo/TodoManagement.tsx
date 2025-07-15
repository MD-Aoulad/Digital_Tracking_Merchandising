import React, { useState } from 'react';
import { TodoTask, TodoTemplate, User, UserRole } from '../../types';

interface TodoManagementProps {
  task?: TodoTask;
  templates: TodoTemplate[];
  employees: User[];
  workplaces: { id: string; name: string }[];
  onSave: (task: TodoTask) => void;
  onCancel: () => void;
  userRole: UserRole;
}

const TodoManagement: React.FC<TodoManagementProps> = ({
  task,
  templates,
  employees,
  workplaces,
  onSave,
  onCancel,
  userRole
}) => {
  const isEditing = !!task;
  const [formData, setFormData] = useState<TodoTask>(
    task || {
      id: '',
      title: '',
      description: '',
      assignedBy: '',
      assignedTo: [],
      assignedWorkplaces: [],
      priority: 'medium',
      difficulty: 'medium',
      status: 'pending',
      category: '',
      dueDate: '',
      dueTime: '',
      estimatedDuration: 30,
      isRepeating: false,
      repeatPattern: undefined,
      reminders: [],
      attachments: [],
      requiresPhoto: false,
      requiresLocation: false,
      requiresSignature: false,
      notes: '',
      tags: [],
      createdAt: '',
      updatedAt: ''
    }
  );

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof TodoTask, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof TodoTask, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.name,
        description: template.description,
        category: template.category,
        priority: template.priority,
        difficulty: template.difficulty,
        estimatedDuration: template.estimatedDuration,
        isRepeating: template.isRepeating,
        repeatPattern: template.repeatPattern,
        reminders: template.defaultReminders,
        requiresPhoto: template.requiresPhoto,
        requiresLocation: template.requiresLocation,
        requiresSignature: template.requiresSignature,
        notes: template.defaultNotes || '',
        tags: template.defaultTags
      }));
      setSelectedTemplate(templateId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskToSave: TodoTask = {
      ...formData,
      id: formData.id || `task-${Date.now()}`,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(taskToSave);
  };

  const addReminder = () => {
    const newReminder = {
      id: `reminder-${Date.now()}`,
      taskId: formData.id,
      type: 'before-due' as const,
      timeOffset: -15,
      message: 'Task reminder',
      notificationMethods: {
        email: true,
        push: true,
        sms: false,
        inApp: true
      },
      isActive: true
    };

    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, newReminder]
    }));
  };

  const removeReminder = (reminderId: string) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== reminderId)
    }));
  };

  const updateReminder = (reminderId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map(r =>
        r.id === reminderId ? { ...r, [field]: value } : r
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          {!isEditing && templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use Template (Optional)
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Daily Operations, Inventory"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              rows={3}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Describe the task in detail"
            />
          </div>

          {/* Priority and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                required
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty || 'medium'}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assign to Employees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Employees *
              </label>
              <select
                multiple
                value={formData.assignedTo}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleArrayChange('assignedTo', selected);
                }}
                required
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                size={4}
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.role})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple employees</p>
            </div>
            {/* Assign to Workplaces */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Workplaces
              </label>
              <select
                multiple
                value={formData.assignedWorkplaces}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleArrayChange('assignedWorkplaces', selected);
                }}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                size={4}
              >
                {workplaces.map((wp) => (
                  <option key={wp.id} value={wp.id}>{wp.name}</option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple workplaces</p>
            </div>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                required
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Time
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => handleInputChange('dueTime', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                min="1"
                max="1440"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Repeating Task */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Repeating Task</h3>
                <p className="text-sm text-gray-500">Set up recurring tasks with automatic scheduling</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRepeating}
                  onChange={(e) => handleInputChange('isRepeating', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {formData.isRepeating && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.repeatPattern?.frequency || 'daily'}
                      onChange={(e) => handleInputChange('repeatPattern', {
                        ...formData.repeatPattern,
                        frequency: e.target.value
                      })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interval
                    </label>
                    <input
                      type="number"
                      value={formData.repeatPattern?.interval || 1}
                      onChange={(e) => handleInputChange('repeatPattern', {
                        ...formData.repeatPattern,
                        interval: parseInt(e.target.value)
                      })}
                      min="1"
                      max="365"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.repeatPattern?.endDate || ''}
                      onChange={(e) => handleInputChange('repeatPattern', {
                        ...formData.repeatPattern,
                        endDate: e.target.value
                      })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                const attachments = files.map((file, idx) => ({
                  id: `file-${Date.now()}-${idx}`,
                  fileName: file.name,
                  fileType: file.type,
                  fileUrl: '', // Placeholder, should be set after upload
                  fileSize: file.size,
                  uploadedAt: new Date().toISOString(),
                  uploadedBy: '',
                }));
                setFormData(prev => ({ ...prev, attachments }));
              }}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">You can upload multiple files (photos, docs, etc.)</p>
          </div>

          {/* Advanced Options Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              <svg
                className={`ml-2 h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-6 p-4 bg-gray-50 rounded-md">
              {/* Completion Requirements */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Completion Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiresPhoto}
                      onChange={(e) => handleInputChange('requiresPhoto', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Require Photo</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiresLocation}
                      onChange={(e) => handleInputChange('requiresLocation', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Require Location</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiresSignature}
                      onChange={(e) => handleInputChange('requiresSignature', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Require Signature</span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleArrayChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Additional notes or instructions"
                />
              </div>

              {/* Reminders */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Reminders</h4>
                  <button
                    type="button"
                    onClick={addReminder}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Reminder
                  </button>
                </div>

                {formData.reminders.map((reminder, index) => (
                  <div key={reminder.id} className="mb-4 p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Reminder {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeReminder(reminder.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={reminder.type}
                          onChange={(e) => updateReminder(reminder.id, 'type', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                        >
                          <option value="before-due">Before Due</option>
                          <option value="at-due">At Due Time</option>
                          <option value="after-due">After Due</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Time Offset (minutes)
                        </label>
                        <input
                          type="number"
                          value={reminder.timeOffset}
                          onChange={(e) => updateReminder(reminder.id, 'timeOffset', parseInt(e.target.value))}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                          placeholder="-15 for 15 minutes before"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Message
                        </label>
                        <input
                          type="text"
                          value={reminder.message}
                          onChange={(e) => updateReminder(reminder.id, 'message', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                          placeholder="Reminder message"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoManagement; 