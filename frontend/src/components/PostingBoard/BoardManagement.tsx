import React, { useState } from 'react';
import { PostingBoard, UserRole } from '../../types';

interface BoardManagementProps {
  board?: PostingBoard;
  onSave: (board: PostingBoard) => void;
  onCancel: () => void;
  isAdmin: boolean;
}

const BoardManagement: React.FC<BoardManagementProps> = ({
  board,
  onSave,
  onCancel,
  isAdmin
}) => {
  const isEditing = !!board;
  const [formData, setFormData] = useState<Partial<PostingBoard>>(
    board || {
      name: '',
      description: '',
      type: 'general',
      category: 'custom',
      isActive: true,
      isDefault: false,
      allowFileUploads: true,
      allowedFileTypes: ['jpg', 'png', 'pdf'],
      maxFileSize: 10,
      requireApproval: false,
      allowComments: true,
      allowReactions: true,
      assignedRoles: ['admin', 'editor', 'viewer'],
      moderators: []
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PostingBoard, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Board name is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Board description is required';
    }

    if (formData.maxFileSize && (formData.maxFileSize < 1 || formData.maxFileSize > 100)) {
      newErrors.maxFileSize = 'File size must be between 1 and 100 MB';
    }

    if (formData.allowedFileTypes && formData.allowedFileTypes.length === 0) {
      newErrors.allowedFileTypes = 'At least one file type must be allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const boardData: PostingBoard = {
      id: board?.id || `board-${Date.now()}`,
      name: formData.name!,
      description: formData.description!,
      type: formData.type!,
      category: formData.category!,
      isActive: formData.isActive!,
      isDefault: formData.isDefault!,
      allowFileUploads: formData.allowFileUploads!,
      allowedFileTypes: formData.allowedFileTypes!,
      maxFileSize: formData.maxFileSize!,
      requireApproval: formData.requireApproval!,
      allowComments: formData.allowComments!,
      allowReactions: formData.allowReactions!,
      assignedRoles: formData.assignedRoles!,
      assignedEmployees: formData.assignedEmployees,
      moderators: formData.moderators!,
      createdBy: board?.createdBy || 'admin-1',
      createdAt: board?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(boardData);
  };

  const boardCategories = [
    { value: 'end-of-day', label: 'End-of-Day Report Board', icon: '📊' },
    { value: 'handover', label: 'Handover Board', icon: '🔄' },
    { value: 'voice-of-customer', label: 'Voice of the Customer Board', icon: '🎤' },
    { value: 'team-social', label: 'Team Social Board', icon: '👥' },
    { value: 'custom', label: 'Custom Board', icon: '📋' }
  ];

  const boardTypes = [
    { value: 'general', label: 'General Bulletin Board' },
    { value: 'issue-resolution', label: 'Issue & Resolution Board' }
  ];

  const roleOptions = [
    { value: 'admin', label: 'Administrators' },
    { value: 'editor', label: 'Editors' },
    { value: 'viewer', label: 'Viewers' }
  ];

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">
            Only administrators can manage posting boards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Board' : 'Create New Board'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Board Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter board name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Board Type *
              </label>
              <select
                value={formData.type || 'general'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {boardTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the purpose of this board"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Board Category *
            </label>
            <select
              value={formData.category || 'custom'}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {boardCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Board Settings */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Board Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Active Board</h4>
                <p className="text-sm text-gray-500">Enable this board for use</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive || false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Default Board</h4>
                <p className="text-sm text-gray-500">Set as the default board</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault || false}
                  onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Require Approval</h4>
                <p className="text-sm text-gray-500">Posts require approval before publication</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requireApproval || false}
                  onChange={(e) => handleInputChange('requireApproval', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Allow Comments</h4>
                <p className="text-sm text-gray-500">Users can comment on posts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowComments || false}
                  onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Allow Reactions</h4>
                <p className="text-sm text-gray-500">Users can react to posts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowReactions || false}
                  onChange={(e) => handleInputChange('allowReactions', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* File Upload Settings */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">File Upload Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Allow File Uploads</h4>
                <p className="text-sm text-gray-500">Users can attach files to posts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowFileUploads || false}
                  onChange={(e) => handleInputChange('allowFileUploads', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum File Size (MB)</label>
              <input
                type="number"
                value={formData.maxFileSize || 10}
                onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.maxFileSize ? 'border-red-300' : 'border-gray-300'
                }`}
                min="1"
                max="100"
              />
              {errors.maxFileSize && (
                <p className="mt-1 text-sm text-red-600">{errors.maxFileSize}</p>
              )}
            </div>
          </div>

          {formData.allowFileUploads && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Allowed File Types</label>
              <input
                type="text"
                value={formData.allowedFileTypes?.join(', ') || ''}
                onChange={(e) => handleInputChange('allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
                className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.allowedFileTypes ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="jpg, png, pdf, doc, docx"
              />
              {errors.allowedFileTypes && (
                <p className="mt-1 text-sm text-red-600">{errors.allowedFileTypes}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Comma-separated list of file extensions</p>
            </div>
          )}
        </div>

        {/* Access Control */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Access Control</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Roles
            </label>
            <div className="space-y-2">
              {roleOptions.map((role) => (
                <label key={role.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.assignedRoles?.includes(role.value) || false}
                    onChange={(e) => {
                      const currentRoles = formData.assignedRoles || [];
                      const newRoles = e.target.checked
                        ? [...currentRoles, role.value]
                        : currentRoles.filter(r => r !== role.value);
                      handleInputChange('assignedRoles', newRoles);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{role.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isEditing ? 'Update Board' : 'Create Board'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardManagement; 