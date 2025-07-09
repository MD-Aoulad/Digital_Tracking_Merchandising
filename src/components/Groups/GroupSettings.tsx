import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Crown, 
  Building2, 
  Bell, 
  Save,
  Shield,
  Lock,
  Unlock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { GroupManagementSettings } from '../../types';

/**
 * Group Settings Component
 * 
 * Provides comprehensive configuration for group management:
 * - Group creation and editing permissions
 * - Hierarchical structure settings
 * - Member management permissions
 * - Notification preferences
 * - Default group assignments
 */
const GroupSettings: React.FC = () => {
  const [settings, setSettings] = useState<GroupManagementSettings>({
    id: '1',
    allowGroupCreation: true,
    requireApprovalForCreation: false,
    allowGroupEditing: true,
    requireApprovalForEditing: false,
    allowSubgroupCreation: true,
    maxGroupDepth: 7,
    allowMemberReassignment: true,
    requireLeaderApproval: false,
    autoAssignNewMembers: true,
    defaultGroupId: '1',
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      newGroupNotifications: true,
      groupUpdateNotifications: true,
      memberChangeNotifications: true,
      leaderChangeNotifications: true,
    },
    createdBy: 'admin1',
    updatedAt: '2024-01-15T00:00:00Z',
  });

  const [activeSection, setActiveSection] = useState<'permissions' | 'notifications' | 'defaults' | 'advanced'>('permissions');

  const sections = [
    { id: 'permissions', name: 'Permissions', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'defaults', name: 'Defaults', icon: Users },
    { id: 'advanced', name: 'Advanced', icon: Settings },
  ];

  const handleSettingChange = (key: keyof GroupManagementSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Group Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure group management permissions, notifications, and default settings
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{section.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeSection === 'permissions' && (
          <div className="space-y-6">
            {/* Group Creation Permissions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Group Creation & Editing</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Control who can create and edit groups in your organization
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.allowGroupCreation}
                      onChange={(e) => handleSettingChange('allowGroupCreation', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Allow group creation</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.requireApprovalForCreation}
                      onChange={(e) => handleSettingChange('requireApprovalForCreation', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Require approval for new groups</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.allowGroupEditing}
                      onChange={(e) => handleSettingChange('allowGroupEditing', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Allow editing existing groups</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.requireApprovalForEditing}
                      onChange={(e) => handleSettingChange('requireApprovalForEditing', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Require approval for group edits</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Hierarchical Structure */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Hierarchical Structure</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure how groups can be organized in your hierarchy
                </p>
              </div>
              <div className="p-6 space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.allowSubgroupCreation}
                    onChange={(e) => handleSettingChange('allowSubgroupCreation', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Allow creating subgroups</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum group depth</label>
                  <select
                    value={settings.maxGroupDepth}
                    onChange={(e) => handleSettingChange('maxGroupDepth', parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(depth => (
                      <option key={depth} value={depth}>{depth} levels</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum number of subgroup levels allowed (1-7)
                  </p>
                </div>
              </div>
            </div>

            {/* Member Management */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Member Management</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Control how members can be assigned and managed within groups
                </p>
              </div>
              <div className="p-6 space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.allowMemberReassignment}
                    onChange={(e) => handleSettingChange('allowMemberReassignment', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Allow moving members between groups</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.requireLeaderApproval}
                    onChange={(e) => handleSettingChange('requireLeaderApproval', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Require leader approval for member changes</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure how and when you receive notifications about group activities
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Notification Methods */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Methods</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.emailNotifications}
                        onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.pushNotifications}
                        onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Push notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.smsNotifications}
                        onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">SMS notifications</span>
                    </label>
                  </div>
                </div>

                {/* Notification Types */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.newGroupNotifications}
                        onChange={(e) => handleNotificationChange('newGroupNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">New group creation</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.groupUpdateNotifications}
                        onChange={(e) => handleNotificationChange('groupUpdateNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Group updates and changes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.memberChangeNotifications}
                        onChange={(e) => handleNotificationChange('memberChangeNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Member assignments and changes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.leaderChangeNotifications}
                        onChange={(e) => handleNotificationChange('leaderChangeNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Leader assignments and changes</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'defaults' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Default Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure default behaviors for new members and groups
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoAssignNewMembers}
                      onChange={(e) => handleSettingChange('autoAssignNewMembers', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Auto-assign new members to default group</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    When enabled, new members will be automatically assigned to the default group
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Group</label>
                  <select
                    value={settings.defaultGroupId || ''}
                    onChange={(e) => handleSettingChange('defaultGroupId', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a default group</option>
                    <option value="1">Acme Corporation</option>
                    <option value="2">Sales Department</option>
                    <option value="3">North Region</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    This group will be used as the default assignment for new members
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'advanced' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Advanced configuration options for power users
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          These settings affect the security and organization of your group structure. 
                          Changes should be made carefully and may require approval from system administrators.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">System Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Settings ID:</span>
                      <span className="ml-2 font-mono">{settings.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created by:</span>
                      <span className="ml-2">{settings.createdBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last updated:</span>
                      <span className="ml-2">{new Date(settings.updatedAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 inline-flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupSettings; 