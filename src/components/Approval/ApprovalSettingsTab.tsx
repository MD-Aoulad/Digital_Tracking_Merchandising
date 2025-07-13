/**
 * Approval Settings Tab Component
 * 
 * Allows administrators to configure approval policies including:
 * - Self-approval settings
 * - Delegation policies
 * - Auto-approval rules
 * - Escalation settings
 * - Notification preferences
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ApprovalSettings, 
  DelegationSettings,
  DelegationScope,
  DelegationApprovalType,
  ApprovalRequestType 
} from '../../types';

interface ApprovalSettingsTabProps {
  settings: ApprovalSettings | null;
  onSettingsUpdate: () => void;
}

const ApprovalSettingsTab: React.FC<ApprovalSettingsTabProps> = ({ 
  settings, 
  onSettingsUpdate 
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('self-approval');
  const [formData, setFormData] = useState<Partial<ApprovalSettings>>({
    allowSelfApproval: false,
    allowDelegation: false,
    delegationSettings: {
      allowDelegation: false,
      whoCanDelegate: DelegationScope.ALL_MANAGERS_LEADERS,
      whoCanBeDelegated: DelegationScope.ALL_MANAGERS_LEADERS,
      whoApprovesDelegation: DelegationApprovalType.UPPER_GROUP_LEADER,
      maxDelegationDuration: 30,
      requireApproval: true,
      autoApproveForUpperLeaders: false,
      allowMultipleDelegations: false,
      delegationHistoryRetention: 365
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      approvalReminders: true,
      escalationNotifications: true,
      delegationNotifications: true
    },
    autoApprovalSettings: {
      enabled: false,
      maxAmount: 1000,
      maxDays: 3,
      allowedTypes: [ApprovalRequestType.LEAVE_REQUEST, ApprovalRequestType.SCHEDULE_CHANGE]
    },
    escalationSettings: {
      enabled: true,
      defaultTimeout: 24,
      escalationLevels: 3
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSettingChange = (section: keyof ApprovalSettings, field: string, value: any) => {
    setFormData(prev => {
      const currentSection = prev[section];
      // Only spread if the section is an object, otherwise set directly
      if (typeof currentSection === 'object' && currentSection !== null) {
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [field]: value
          }
        };
      } else {
        // For primitive values, set directly
        return {
          ...prev,
          [section]: value
        };
      }
    });
  };

  const handleDelegationSettingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      delegationSettings: {
        ...prev.delegationSettings!,
        [field]: value
      }
    }));
  };

  const handleNotificationSettingChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings!,
        [field]: value
      }
    }));
  };

  const handleAutoApprovalSettingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      autoApprovalSettings: {
        ...prev.autoApprovalSettings!,
        [field]: value
      }
    }));
  };

  const handleEscalationSettingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      escalationSettings: {
        ...prev.escalationSettings!,
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/approvals/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSettingsUpdate();
        alert('Settings saved successfully!');
      } else {
        console.error('Failed to save settings');
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    {
      id: 'self-approval',
      label: 'Self-Approval Policy',
      icon: '✅',
      description: 'Configure whether approvers can approve their own requests'
    },
    {
      id: 'delegation',
      label: 'Delegation Settings',
      icon: '🔄',
      description: 'Configure approval authority delegation policies'
    },
    {
      id: 'auto-approval',
      label: 'Auto-Approval Rules',
      icon: '🤖',
      description: 'Configure automatic approval for certain requests'
    },
    {
      id: 'escalation',
      label: 'Escalation Settings',
      icon: '📈',
      description: 'Configure escalation rules for pending approvals'
    },
    {
      id: 'notifications',
      label: 'Notification Preferences',
      icon: '🔔',
      description: 'Configure notification settings for approval events'
    }
  ];

  const renderSelfApprovalSection = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-yellow-600 text-lg">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Self-Approval Policy
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Only administrators can configure self-approval permissions. When enabled, 
              approvers can approve requests they submitted themselves.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-900">Allow Self-Approval</h4>
            <p className="text-sm text-gray-600">
              Enable this setting to allow approvers to approve their own requests
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowSelfApproval}
              onChange={(e) => handleSettingChange('allowSelfApproval', 'allowSelfApproval', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {formData.allowSelfApproval && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-green-600 text-lg">✅</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">
                  Self-Approval Enabled
                </h4>
                <p className="mt-1 text-sm text-green-700">
                  Approvers can now approve requests they submitted themselves. 
                  This setting applies to all approval workflows.
                </p>
              </div>
            </div>
          </div>
        )}

        {!formData.allowSelfApproval && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-600 text-lg">❌</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">
                  Self-Approval Disabled
                </h4>
                <p className="mt-1 text-sm text-red-700">
                  Approvers cannot approve their own requests. Only superiors or 
                  other designated approvers can approve requests.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDelegationSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium text-gray-900">Allow Authorization Delegation</h4>
          <p className="text-sm text-gray-600">
            Enable this setting to allow approvers to delegate their approval authority
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.allowDelegation}
            onChange={(e) => handleSettingChange('allowDelegation', 'allowDelegation', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {formData.allowDelegation && (
        <div className="space-y-6">
          {/* Who can delegate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can delegate approval authority?
            </label>
            <select
              value={formData.delegationSettings?.whoCanDelegate}
              onChange={(e) => handleDelegationSettingChange('whoCanDelegate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={DelegationScope.ALL_MANAGERS_LEADERS}>All managers and leaders</option>
              <option value={DelegationScope.SPECIFIC_MANAGERS_LEADERS}>Specific managers and leaders</option>
              <option value={DelegationScope.GROUP_LEADERS}>Group leaders</option>
              <option value={DelegationScope.UPPER_GROUP_LEADERS}>Upper group leaders</option>
              <option value={DelegationScope.TOP_GROUP_LEADERS}>Top group leaders</option>
            </select>
          </div>

          {/* Who can be delegated */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can receive delegation?
            </label>
            <select
              value={formData.delegationSettings?.whoCanBeDelegated}
              onChange={(e) => handleDelegationSettingChange('whoCanBeDelegated', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={DelegationScope.ALL_MANAGERS_LEADERS}>All managers and leaders</option>
              <option value={DelegationScope.SPECIFIC_MANAGERS_LEADERS}>Specific managers and leaders</option>
              <option value={DelegationScope.GROUP_LEADERS}>Group leaders</option>
              <option value={DelegationScope.SAME_GROUP_LEADERS}>Leaders in the same group</option>
              <option value={DelegationScope.UPPER_GROUP_LEADERS}>Upper group leaders</option>
              <option value={DelegationScope.TOP_GROUP_LEADERS}>Top group leaders</option>
            </select>
          </div>

          {/* Who approves delegation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who approves delegation requests?
            </label>
            <select
              value={formData.delegationSettings?.whoApprovesDelegation}
              onChange={(e) => handleDelegationSettingChange('whoApprovesDelegation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={DelegationApprovalType.DELEGATE_DIRECT}>Delegate directly approves</option>
              <option value={DelegationApprovalType.UPPER_GROUP_LEADER}>Upper group leader approves</option>
              <option value={DelegationApprovalType.TOP_GROUP_LEADER}>Top group leader approves</option>
              <option value={DelegationApprovalType.ADMIN}>Administrator approves</option>
            </select>
          </div>

          {/* Max delegation duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum delegation duration (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.delegationSettings?.maxDelegationDuration}
              onChange={(e) => handleDelegationSettingChange('maxDelegationDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Additional delegation settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">Require approval for delegation</h5>
                <p className="text-xs text-gray-600">Delegation requests must be approved</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.delegationSettings?.requireApproval}
                  onChange={(e) => handleDelegationSettingChange('requireApproval', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">Auto-approve for upper leaders</h5>
                <p className="text-xs text-gray-600">Automatically approve delegations for upper group leaders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.delegationSettings?.autoApproveForUpperLeaders}
                  onChange={(e) => handleDelegationSettingChange('autoApproveForUpperLeaders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">Allow multiple delegations</h5>
                <p className="text-xs text-gray-600">Allow multiple active delegations per user</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.delegationSettings?.allowMultipleDelegations}
                  onChange={(e) => handleDelegationSettingChange('allowMultipleDelegations', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAutoApprovalSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium text-gray-900">Enable Auto-Approval</h4>
          <p className="text-sm text-gray-600">
            Automatically approve requests that meet certain criteria
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.autoApprovalSettings?.enabled}
            onChange={(e) => handleAutoApprovalSettingChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {formData.autoApprovalSettings?.enabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum amount for auto-approval
            </label>
            <input
              type="number"
              min="0"
              value={formData.autoApprovalSettings?.maxAmount}
              onChange={(e) => handleAutoApprovalSettingChange('maxAmount', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum days for auto-approval
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.autoApprovalSettings?.maxDays}
              onChange={(e) => handleAutoApprovalSettingChange('maxDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request types eligible for auto-approval
            </label>
            <div className="space-y-2">
              {Object.values(ApprovalRequestType).map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.autoApprovalSettings?.allowedTypes?.includes(type)}
                    onChange={(e) => {
                      const currentTypes = formData.autoApprovalSettings?.allowedTypes || [];
                      if (e.target.checked) {
                        handleAutoApprovalSettingChange('allowedTypes', [...currentTypes, type]);
                      } else {
                        handleAutoApprovalSettingChange('allowedTypes', currentTypes.filter(t => t !== type));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEscalationSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium text-gray-900">Enable Escalation</h4>
          <p className="text-sm text-gray-600">
            Automatically escalate pending approvals after timeout
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.escalationSettings?.enabled}
            onChange={(e) => handleEscalationSettingChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {formData.escalationSettings?.enabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default timeout (hours)
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={formData.escalationSettings?.defaultTimeout}
              onChange={(e) => handleEscalationSettingChange('defaultTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of escalation levels
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.escalationSettings?.escalationLevels}
              onChange={(e) => handleEscalationSettingChange('escalationLevels', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-gray-900">Notification Preferences</h4>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-900">Email notifications</h5>
            <p className="text-xs text-gray-600">Send approval notifications via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notificationSettings?.emailNotifications}
              onChange={(e) => handleNotificationSettingChange('emailNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-900">Push notifications</h5>
            <p className="text-xs text-gray-600">Send approval notifications via push</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notificationSettings?.pushNotifications}
              onChange={(e) => handleNotificationSettingChange('pushNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-900">SMS notifications</h5>
            <p className="text-xs text-gray-600">Send approval notifications via SMS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notificationSettings?.smsNotifications}
              onChange={(e) => handleNotificationSettingChange('smsNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-900">Approval reminders</h5>
            <p className="text-xs text-gray-600">Send reminder notifications for pending approvals</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notificationSettings?.approvalReminders}
              onChange={(e) => handleNotificationSettingChange('approvalReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-900">Escalation notifications</h5>
            <p className="text-xs text-gray-600">Send notifications when requests are escalated</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notificationSettings?.escalationNotifications}
              onChange={(e) => handleNotificationSettingChange('escalationNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-900">Delegation notifications</h5>
            <p className="text-xs text-gray-600">Send notifications for delegation events</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notificationSettings?.delegationNotifications}
              onChange={(e) => handleNotificationSettingChange('delegationNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'self-approval':
        return renderSelfApprovalSection();
      case 'delegation':
        return renderDelegationSection();
      case 'auto-approval':
        return renderAutoApprovalSection();
      case 'escalation':
        return renderEscalationSection();
      case 'notifications':
        return renderNotificationsSection();
      default:
        return renderSelfApprovalSection();
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            Only administrators can configure approval settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Approval Settings</h2>
        <p className="text-gray-600">
          Configure approval policies, delegation rules, and notification preferences
        </p>
      </div>

      {/* Section Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeSection === section.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Section Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {renderSectionContent()}
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={saveSettings}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default ApprovalSettingsTab; 