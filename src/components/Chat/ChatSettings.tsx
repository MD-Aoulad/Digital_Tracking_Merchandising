/**
 * Chat Settings Component - Workforce Management Platform
 * 
 * Administrative interface for configuring chat functionality including:
 * - Enable/disable chat function
 * - File sharing settings
 * - Message retention policies
 * - Help desk configuration
 * - Notification preferences
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  MessageSquare,
  FileText,
  Bell,
  Users,
  Shield,
  Save,
  RotateCcw,
  HelpCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ChatSettings, HelpDeskCategory } from '../../types';
import toast from 'react-hot-toast';

/**
 * ChatSettings Component
 * 
 * Administrative interface for configuring chat functionality.
 * Only administrators can access this component.
 * 
 * @returns JSX element with chat settings interface
 */
const ChatSettingsComponent: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ChatSettings>({
    id: '1',
    isEnabled: false,
    allowFileSharing: true,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
    allowReactions: true,
    allowEditing: true,
    editTimeLimit: 5,
    allowDeletion: true,
    deletionTimeLimit: 10,
    messageRetentionDays: 365,
    helpDeskEnabled: false,
    helpDeskSettings: {
      autoAssignEnabled: true,
      defaultResponseTime: 24,
      escalationEnabled: true,
      escalationTimeLimit: 48,
      allowEmployeeCreation: false,
      requireApproval: true,
      categories: [HelpDeskCategory.PERSONNEL, HelpDeskCategory.VMD, HelpDeskCategory.INVENTORY],
      priorityLevels: ['low', 'medium', 'high', 'urgent']
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      mentionNotifications: true,
      channelNotifications: true,
      helpDeskNotifications: true,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'UTC'
      }
    },
    createdBy: user?.id || '',
    updatedAt: new Date().toISOString()
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Load chat settings from backend
   */
  useEffect(() => {
    loadChatSettings();
  }, []);

  /**
   * Load chat settings
   */
  const loadChatSettings = async () => {
    try {
      // In a real app, this would fetch from backend
      // const response = await fetch('/api/chat/settings');
      // const data = await response.json();
      // setSettings(data);
      
      // For now, use mock data
      console.log('Loading chat settings...');
    } catch (error) {
      console.error('Error loading chat settings:', error);
      toast.error('Failed to load chat settings');
    }
  };

  /**
   * Save chat settings
   */
  const saveSettings = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Only administrators can save chat settings');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would save to backend
      // const response = await fetch('/api/chat/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      // For now, simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      toast.success('Chat settings saved successfully');
    } catch (error) {
      console.error('Error saving chat settings:', error);
      toast.error('Failed to save chat settings');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset settings to defaults
   */
  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all chat settings to defaults?')) {
      loadChatSettings();
      setHasChanges(false);
      toast.success('Settings reset to defaults');
    }
  };

  /**
   * Handle setting change
   */
  const handleSettingChange = (section: keyof ChatSettings, field: string, value: any) => {
    setSettings(prev => {
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
    setHasChanges(true);
  };

  const handleQuietHoursChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        quietHours: {
          ...prev.notificationSettings.quietHours,
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  /**
   * Handle help desk setting change
   */
  const handleHelpDeskChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      helpDeskSettings: {
        ...prev.helpDeskSettings,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h2>
          <p className="text-gray-500">Only administrators can access chat settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary-600" />
              Chat Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Configure chat functionality and help desk features for your organization
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={resetSettings}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={saveSettings}
              disabled={!hasChanges || isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Chat Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">General Chat Settings</h2>
            </div>

            {/* Enable Chat */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Enable Chat Function</label>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">[In Use]</span>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.isEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, isEnabled: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Allow team members to use chat features
                </span>
              </div>
            </div>

            {/* File Sharing */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                File Sharing Settings
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.allowFileSharing}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowFileSharing: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Allow file and image sharing</span>
                </div>
                
                {settings.allowFileSharing && (
                  <div className="ml-6 space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Maximum file size (MB)</label>
                      <input
                        type="number"
                        value={settings.maxFileSize}
                        onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        min="1"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Allowed file types</label>
                      <input
                        type="text"
                        value={settings.allowedFileTypes.join(', ')}
                        onChange={(e) => setSettings(prev => ({ ...prev, allowedFileTypes: e.target.value.split(', ') }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="jpg, png, pdf, doc"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message Settings */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Message Settings
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.allowReactions}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowReactions: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Allow message reactions</span>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.allowEditing}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowEditing: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Allow message editing</span>
                </div>
                
                {settings.allowEditing && (
                  <div className="ml-6">
                    <label className="text-xs text-gray-500 block mb-1">Edit time limit (minutes)</label>
                    <input
                      type="number"
                      value={settings.editTimeLimit}
                      onChange={(e) => setSettings(prev => ({ ...prev, editTimeLimit: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      min="1"
                      max="60"
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.allowDeletion}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowDeletion: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Allow message deletion</span>
                </div>
                
                {settings.allowDeletion && (
                  <div className="ml-6">
                    <label className="text-xs text-gray-500 block mb-1">Deletion time limit (minutes)</label>
                    <input
                      type="number"
                      value={settings.deletionTimeLimit}
                      onChange={(e) => setSettings(prev => ({ ...prev, deletionTimeLimit: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      min="1"
                      max="60"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Message Retention */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Message Retention (days)
              </label>
              <input
                type="number"
                value={settings.messageRetentionDays}
                onChange={(e) => setSettings(prev => ({ ...prev, messageRetentionDays: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                min="30"
                max="3650"
              />
              <p className="text-xs text-gray-500 mt-1">
                Messages will be automatically deleted after this period
              </p>
            </div>
          </motion.div>

          {/* Help Desk Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Help Desk Settings</h2>
            </div>

            {/* Enable Help Desk */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Enable Help Desk</label>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Chat with Manager</span>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.helpDeskEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, helpDeskEnabled: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Allow employees to contact managers by topic
                </span>
              </div>
            </div>

            {settings.helpDeskEnabled && (
              <div className="space-y-6">
                {/* Auto Assignment */}
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.helpDeskSettings.autoAssignEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, helpDeskSettings: { ...prev.helpDeskSettings, autoAssignEnabled: e.target.checked } }))}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Auto-assign requests</span>
                  </div>
                </div>

                {/* Response Time */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Default response time (hours)
                  </label>
                  <input
                    type="number"
                    value={settings.helpDeskSettings.defaultResponseTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, helpDeskSettings: { ...prev.helpDeskSettings, defaultResponseTime: parseInt(e.target.value) } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    max="168"
                  />
                </div>

                {/* Escalation */}
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.helpDeskSettings.escalationEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, helpDeskSettings: { ...prev.helpDeskSettings, escalationEnabled: e.target.checked } }))}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Enable escalation</span>
                  </div>
                  
                  {settings.helpDeskSettings.escalationEnabled && (
                    <div className="ml-6 mt-2">
                      <label className="text-xs text-gray-500 block mb-1">Escalation time limit (hours)</label>
                      <input
                        type="number"
                        value={settings.helpDeskSettings.escalationTimeLimit}
                        onChange={(e) => setSettings(prev => ({ ...prev, helpDeskSettings: { ...prev.helpDeskSettings, escalationTimeLimit: parseInt(e.target.value) } }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        min="1"
                        max="168"
                      />
                    </div>
                  )}
                </div>

                {/* Employee Creation */}
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.helpDeskSettings.allowEmployeeCreation}
                      onChange={(e) => setSettings(prev => ({ ...prev, helpDeskSettings: { ...prev.helpDeskSettings, allowEmployeeCreation: e.target.checked } }))}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Allow employees to create channels</span>
                  </div>
                  
                  {settings.helpDeskSettings.allowEmployeeCreation && (
                    <div className="ml-6 mt-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.helpDeskSettings.requireApproval}
                          onChange={(e) => setSettings(prev => ({ ...prev, helpDeskSettings: { ...prev.helpDeskSettings, requireApproval: e.target.checked } }))}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Require approval for new channels</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Available Categories
                  </label>
                  <div className="space-y-2">
                    {Object.values(HelpDeskCategory).map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.helpDeskSettings.categories.includes(category)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...settings.helpDeskSettings.categories, category]
                              : settings.helpDeskSettings.categories.filter(c => c !== category);
                            setSettings(prev => ({ ...prev, helpDeskSettings: { ...prev.helpDeskSettings, categories: newCategories } }));
                          }}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-600 capitalize">
                          {category.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Notifications */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notificationSettings.emailNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, emailNotifications: e.target.checked } }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Email notifications</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notificationSettings.mentionNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, mentionNotifications: e.target.checked } }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Mention notifications</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notificationSettings.helpDeskNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, helpDeskNotifications: e.target.checked } }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Help desk notifications</span>
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notificationSettings.pushNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, pushNotifications: e.target.checked } }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Push notifications</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notificationSettings.channelNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, channelNotifications: e.target.checked } }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Channel notifications</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notificationSettings.smsNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, smsNotifications: e.target.checked } }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">SMS notifications</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notificationSettings.quietHours.enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, quietHours: { ...prev.notificationSettings.quietHours, enabled: e.target.checked } } }))}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Enable quiet hours</span>
            </div>
            
            {settings.notificationSettings.quietHours.enabled && (
              <div className="mt-4 ml-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Start time</label>
                  <input
                    type="time"
                    value={settings.notificationSettings.quietHours.startTime}
                    onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">End time</label>
                  <input
                    type="time"
                    value={settings.notificationSettings.quietHours.endTime}
                    onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Timezone</label>
                  <select
                    value={settings.notificationSettings.quietHours.timezone}
                    onChange={(e) => handleQuietHoursChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ChatSettingsComponent; 