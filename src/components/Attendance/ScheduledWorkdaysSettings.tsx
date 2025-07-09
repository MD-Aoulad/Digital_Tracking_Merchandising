/**
 * Scheduled Workdays Settings Component - Workforce Management Platform
 * 
 * Administrative component for configuring punch-in restrictions to scheduled workdays only.
 * Allows administrators to enable/disable the feature and configure time-based punch-in permissions.
 * 
 * Features:
 * - Enable/disable scheduled workdays punch-in restriction
 * - Configure time-based punch-in permissions
 * - Set advance punch-in time allowance
 * - Configure target groups and employees
 * - Save and manage settings
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Clock, 
  Calendar,
  Save, 
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { 
  UserRole 
} from '../../types';
import type { ScheduledWorkdaysSettings } from '../../types';

/**
 * Scheduled Workdays Settings component props interface
 */
interface ScheduledWorkdaysSettingsProps {
  onSave: (settings: ScheduledWorkdaysSettings) => void;
  onCancel: () => void;
}

/**
 * Scheduled Workdays Settings Component
 * 
 * Administrative interface for configuring punch-in restrictions to scheduled workdays only.
 * Provides comprehensive configuration options for managing employee punch-in permissions
 * based on their scheduled workdays.
 * 
 * @param onSave - Function to save settings
 * @param onCancel - Function to cancel and close settings
 * @returns JSX element with scheduled workdays settings configuration
 */
const ScheduledWorkdaysSettingsComponent: React.FC<ScheduledWorkdaysSettingsProps> = ({ 
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
  const [settings, setSettings] = useState<ScheduledWorkdaysSettings>({
    id: '1',
    isEnabled: false,
    allowPunchInAtAnyTime: true,
    punchInAdvanceMinutes: 30,
    requireScheduleRegistration: true,
    targetType: 'all-employees',
    targetGroups: [],
    targetJobTitles: [],
    targetEmployees: [],
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
  const handleFieldChange = (field: keyof ScheduledWorkdaysSettings, value: any) => {
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
            <h2 className="text-xl font-bold text-gray-900">Scheduled Workdays Punch-In Settings</h2>
            <p className="text-sm text-gray-500">Configure punch-in restrictions to scheduled workdays only</p>
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
              <h3 className="text-lg font-semibold text-gray-900">Allow Punch In Only on Scheduled Workdays</h3>
              <p className="text-sm text-gray-600">
                Restrict employees to punch in only on days they are scheduled to work
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
            {/* Time-based Punch-in Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Punch-in Time Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="punchInTime"
                    checked={settings.allowPunchInAtAnyTime}
                    onChange={() => handleFieldChange('allowPunchInAtAnyTime', true)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Allow punch-in at any time</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="punchInTime"
                    checked={!settings.allowPunchInAtAnyTime}
                    onChange={() => handleFieldChange('allowPunchInAtAnyTime', false)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Restrict to scheduled times</span>
                  </div>
                </label>
              </div>

              {/* Advance Punch-in Configuration */}
              {!settings.allowPunchInAtAnyTime && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-900">
                      Allow punch-in from:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={settings.punchInAdvanceMinutes}
                        onChange={(e) => handleFieldChange('punchInAdvanceMinutes', parseInt(e.target.value))}
                        min="0"
                        max="120"
                        className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <span className="text-sm text-gray-600">minutes before scheduled start time</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Example: If set to 30 minutes and schedule starts at 9:00 AM, employees can punch in from 8:30 AM
                  </p>
                </div>
              )}

              {/* Schedule Registration Requirement */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.requireScheduleRegistration}
                    onChange={(e) => handleFieldChange('requireScheduleRegistration', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-900">Require individual schedule registration</span>
                </label>
                <p className="text-xs text-gray-500">
                  When enabled, employees must have their schedules registered to punch in. If disabled, 
                  employees can punch in on any day regardless of schedule.
                </p>
              </div>
            </div>

            {/* Target Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Target Configuration</h3>
              <p className="text-sm text-gray-600">Select which employees this restriction applies to</p>
              
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
                        <p className="text-sm text-gray-500">All employees of the company</p>
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

            {/* Information Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Important Information</h4>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• When enabled, employees cannot punch in on days they are not scheduled to work</li>
                    <li>• Individual schedules for employees must be registered if schedule registration is required</li>
                    <li>• This setting is restricted to administrators only</li>
                    <li>• Changes take effect immediately after saving</li>
                  </ul>
                </div>
              </div>
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

export default ScheduledWorkdaysSettingsComponent; 