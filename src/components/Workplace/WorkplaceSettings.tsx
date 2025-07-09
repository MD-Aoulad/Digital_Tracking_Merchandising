import React, { useState } from 'react';
import {
  Bell,
  ShieldCheck
} from 'lucide-react';
import { WorkplaceSettings } from '../../types';

/**
 * Workplace Settings Component
 * 
 * This component allows administrators to configure workplace system settings including:
 * - Area usage settings
 * - Representative photo requirements
 * - Custom property settings
 * - Permission defaults
 * - Notification preferences
 */
const WorkplaceSettingsComponent: React.FC = () => {
  const [settings, setSettings] = useState<WorkplaceSettings>({
    id: '1',
    useArea: true,
    requireRepresentativePhoto: false,
    allowCustomProperties: true,
    maxCustomProperties: 10,
    defaultViewPermission: 'employee',
    defaultEditPermission: 'admin',
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false
    },
    createdBy: 'admin',
    updatedAt: '2025-01-15T00:00:00Z'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSettings({ ...settings, updatedAt: new Date().toISOString() });
    setIsSaving(false);
  };

  const updateSetting = (key: keyof WorkplaceSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNotificationSetting = (key: keyof typeof settings.notificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Workplace Settings</h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure workplace system settings and preferences.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
        </div>
        <div className="px-6 py-6 space-y-6">
          {/* Area Usage */}
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="useArea"
                  checked={settings.useArea}
                  onChange={(e) => updateSetting('useArea', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="useArea" className="text-sm font-medium text-gray-900">
                  Use Area Property
                </label>
                <p className="text-sm text-gray-600">
                  Enable area-based workplace information for location-based workplace data.
                </p>
              </div>
            </div>
            <ShieldCheck className="h-5 w-5 text-gray-400" />
          </div>

          {/* Representative Photo */}
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="requireRepresentativePhoto"
                  checked={settings.requireRepresentativePhoto}
                  onChange={(e) => updateSetting('requireRepresentativePhoto', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="requireRepresentativePhoto" className="text-sm font-medium text-gray-900">
                  Require Representative Photo
                </label>
                <p className="text-sm text-gray-600">
                  Require a representative photo when registering workplaces.
                </p>
              </div>
            </div>
            <ShieldCheck className="h-5 w-5 text-gray-400" />
          </div>

          {/* Custom Properties */}
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="allowCustomProperties"
                  checked={settings.allowCustomProperties}
                  onChange={(e) => updateSetting('allowCustomProperties', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="allowCustomProperties" className="text-sm font-medium text-gray-900">
                  Allow Custom Properties
                </label>
                <p className="text-sm text-gray-600">
                  Enable creation and use of custom workplace properties.
                </p>
              </div>
            </div>
            <ShieldCheck className="h-5 w-5 text-gray-400" />
          </div>

          {/* Max Custom Properties */}
          {settings.allowCustomProperties && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Custom Properties per Workplace
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.maxCustomProperties}
                onChange={(e) => updateSetting('maxCustomProperties', parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-600 mt-1">
                Maximum number of custom properties that can be assigned to each workplace.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Permission Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <ShieldCheck className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Permission Settings</h3>
          </div>
        </div>
        <div className="px-6 py-6 space-y-6">
          {/* Default View Permission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default View Permission
            </label>
            <select
              value={settings.defaultViewPermission}
              onChange={(e) => updateSetting('defaultViewPermission', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="admin">Admin only</option>
              <option value="leader">Admin & Leader</option>
              <option value="employee">All users</option>
            </select>
            <p className="text-sm text-gray-600 mt-1">
              Default permission level for viewing workplace information.
            </p>
          </div>

          {/* Default Edit Permission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Edit Permission
            </label>
            <select
              value={settings.defaultEditPermission}
              onChange={(e) => updateSetting('defaultEditPermission', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="admin">Admin only</option>
              <option value="leader">Admin & Leader</option>
              <option value="employee">All users</option>
            </select>
            <p className="text-sm text-gray-600 mt-1">
              Default permission level for editing workplace information.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
          </div>
        </div>
        <div className="px-6 py-6 space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.notificationSettings.emailNotifications}
                  onChange={(e) => updateNotificationSetting('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-900">
                  Email Notifications
                </label>
                <p className="text-sm text-gray-600">
                  Send email notifications for workplace-related events.
                </p>
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  checked={settings.notificationSettings.pushNotifications}
                  onChange={(e) => updateNotificationSetting('pushNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="pushNotifications" className="text-sm font-medium text-gray-900">
                  Push Notifications
                </label>
                <p className="text-sm text-gray-600">
                  Send push notifications for workplace-related events.
                </p>
              </div>
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={settings.notificationSettings.smsNotifications}
                  onChange={(e) => updateNotificationSetting('smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-900">
                  SMS Notifications
                </label>
                <p className="text-sm text-gray-600">
                  Send SMS notifications for workplace-related events.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <ShieldCheck className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-900">Last Updated</p>
              <p className="text-sm text-gray-600">
                {new Date(settings.updatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Created By</p>
              <p className="text-sm text-gray-600">{settings.createdBy}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving Settings...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
};

export default WorkplaceSettingsComponent; 