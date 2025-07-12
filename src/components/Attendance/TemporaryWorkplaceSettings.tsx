/**
 * Temporary Workplace Settings Component - Workforce Management Platform
 * 
 * Administrative component for configuring temporary workplace punch in/out settings.
 * Allows administrators to enable/disable the feature and configure target groups,
 * requirements, and restrictions for employees to punch in/out from unregistered locations.
 * 
 * Features:
 * - Enable/disable temporary workplace feature
 * - Configure target groups (all employees, specific groups, specific employees)
 * - Set requirements (reason, photo, location)
 * - Configure distance restrictions
 * - Save and manage settings
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  MapPin, 
  Camera, 
  FileText, 
  Save, 
  X
  
} from 'lucide-react';
import { 
   
  UserRole 
} from '../../types';
import type { TemporaryWorkplaceSettings } from '../../types';

/**
 * Temporary Workplace Settings component props interface
 */
interface TemporaryWorkplaceSettingsProps {
  onSave: (settings: TemporaryWorkplaceSettings) => void;
  onCancel: () => void;
}

/**
 * Temporary Workplace Settings Component
 * 
 * Administrative interface for configuring temporary workplace punch in/out settings.
 * Provides comprehensive configuration options for managing employee access to
 * temporary workplace functionality.
 * 
 * @param onSave - Function to save settings
 * @param onCancel - Function to cancel and close settings
 * @returns JSX element with temporary workplace settings configuration
 */
const TemporaryWorkplaceSettingsComponent: React.FC<TemporaryWorkplaceSettingsProps> = ({ 
  onSave, 
  onCancel 
}) => {
  // Mock data - in real app, this would come from API
  const mockGroups = [
    { id: '1', name: 'Sales Team' },
    { id: '2', name: 'Marketing Team' },
    { id: '3', name: 'Development Team' },
    { id: '4', name: 'Support Team' },
  ];

  const mockEmployees = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: UserRole.EDITOR },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: UserRole.VIEWER },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: UserRole.EDITOR },
  ];

  // Form state
  const [settings, setSettings] = useState<TemporaryWorkplaceSettings>({
    id: '1',
    isEnabled: false,
    targetType: 'all-employees',
    targetGroups: [],
    targetJobTitles: [],
    targetEmployees: [],
    requireReason: true,
    requirePhoto: false,
    requireLocation: true,
    maxDistanceFromWorkplace: 5000,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);

  // Available job titles
  const jobTitles = ['Manager', 'Supervisor', 'Employee', 'Intern', 'Contractor'];

  /**
   * Handle form field changes
   */
  const handleFieldChange = (field: keyof TemporaryWorkplaceSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  /**
   * Handle target type change
   */
  const handleTargetTypeChange = (targetType: 'all-employees' | 'specific-groups' | 'specific-employees') => {
    setSettings(prev => ({
      ...prev,
      targetType,
      targetGroups: targetType === 'specific-groups' ? selectedGroups : [],
      targetEmployees: targetType === 'specific-employees' ? selectedEmployees : [],
      targetJobTitles: targetType === 'specific-groups' ? selectedJobTitles : [],
      updatedAt: new Date().toISOString(),
    }));
  };

  /**
   * Handle group selection
   */
  const handleGroupToggle = (groupId: string) => {
    const newSelected = selectedGroups.includes(groupId)
      ? selectedGroups.filter(id => id !== groupId)
      : [...selectedGroups, groupId];
    
    setSelectedGroups(newSelected);
    handleFieldChange('targetGroups', newSelected);
  };

  /**
   * Handle employee selection
   */
  const handleEmployeeToggle = (employeeId: string) => {
    const newSelected = selectedEmployees.includes(employeeId)
      ? selectedEmployees.filter(id => id !== employeeId)
      : [...selectedEmployees, employeeId];
    
    setSelectedEmployees(newSelected);
    handleFieldChange('targetEmployees', newSelected);
  };

  /**
   * Handle job title selection
   */
  const handleJobTitleToggle = (jobTitle: string) => {
    const newSelected = selectedJobTitles.includes(jobTitle)
      ? selectedJobTitles.filter(title => title !== jobTitle)
      : [...selectedJobTitles, jobTitle];
    
    setSelectedJobTitles(newSelected);
    handleFieldChange('targetJobTitles', newSelected);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Temporary Workplace Settings</h2>
            <p className="text-sm text-gray-500">Configure punch in/out from non-workplaces</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enable/Disable Feature */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Allow Punch In/Out from Any Places</h3>
              <p className="text-sm text-gray-600">
                Enable employees to clock in/out from unregistered locations (temporary workplaces)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isEnabled}
                onChange={(e) => handleFieldChange('isEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        {settings.isEnabled && (
          <>
            {/* Target Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Target Configuration</h3>
              
              {/* Target Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    name="targetType"
                    value="all-employees"
                    checked={settings.targetType === 'all-employees'}
                    onChange={() => handleTargetTypeChange('all-employees')}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary-600 peer-checked:bg-primary-50 hover:border-gray-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">All Employees</h4>
                        <p className="text-sm text-gray-500">All company employees</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="targetType"
                    value="specific-groups"
                    checked={settings.targetType === 'specific-groups'}
                    onChange={() => handleTargetTypeChange('specific-groups')}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary-600 peer-checked:bg-primary-50 hover:border-gray-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Specific Groups</h4>
                        <p className="text-sm text-gray-500">Selected groups and job titles</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="targetType"
                    value="specific-employees"
                    checked={settings.targetType === 'specific-employees'}
                    onChange={() => handleTargetTypeChange('specific-employees')}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary-600 peer-checked:bg-primary-50 hover:border-gray-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Specific Employees</h4>
                        <p className="text-sm text-gray-500">Selected employees only</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Specific Groups Configuration */}
              {settings.targetType === 'specific-groups' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Select Groups</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mockGroups.map(group => (
                        <label key={group.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={() => handleGroupToggle(group.id)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium text-gray-900">{group.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Select Job Titles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {jobTitles.map(jobTitle => (
                        <label key={jobTitle} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedJobTitles.includes(jobTitle)}
                            onChange={() => handleJobTitleToggle(jobTitle)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium text-gray-900">{jobTitle}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Specific Employees Configuration */}
              {settings.targetType === 'specific-employees' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Select Employees</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {mockEmployees.map(employee => (
                      <label key={employee.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => handleEmployeeToggle(employee.id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-xs text-gray-500">{employee.email}</div>
                        </div>
                        <span className="text-xs text-gray-400 capitalize">{employee.role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Requirements Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireReason}
                    onChange={(e) => handleFieldChange('requireReason', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Require Reason</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requirePhoto}
                    onChange={(e) => handleFieldChange('requirePhoto', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Camera size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Require Photo</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireLocation}
                    onChange={(e) => handleFieldChange('requireLocation', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Require GPS Location</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Distance Restriction */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Distance Restriction</h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={!!settings.maxDistanceFromWorkplace}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        handleFieldChange('maxDistanceFromWorkplace', undefined);
                      } else {
                        handleFieldChange('maxDistanceFromWorkplace', 5000);
                      }
                    }}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-900">Maximum distance from workplace</span>
                </label>
                
                {settings.maxDistanceFromWorkplace && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={settings.maxDistanceFromWorkplace}
                      onChange={(e) => handleFieldChange('maxDistanceFromWorkplace', parseInt(e.target.value))}
                      min="100"
                      max="50000"
                      className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="text-sm text-gray-600">meters</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Restrict punch in/out to locations within this distance from registered workplaces
              </p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemporaryWorkplaceSettingsComponent; 