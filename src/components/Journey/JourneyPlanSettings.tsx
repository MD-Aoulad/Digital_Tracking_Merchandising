/**
 * Journey Plan Settings Component - Workforce Management Platform
 * 
 * Administrative interface for configuring the Journey Plan feature.
 * Allows administrators to enable/disable the feature and configure
 * various settings like GPS verification, route optimization, and notifications.
 * 
 * Features:
 * - Enable/disable journey plan feature
 * - GPS verification requirements
 * - Route optimization settings
 * - Location limits and duration defaults
 * - Notification preferences
 * - Auto-assignment options
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 * @since 2025-01-10
 */

import React, { useState } from 'react';
import {
  Settings,
  MapPin,
  Route,
  Bell,
  Users,
  Save,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { JourneyPlanSettings } from '../../types';
import toast from 'react-hot-toast';

/**
 * JourneyPlanSettings Component
 * 
 * Administrative interface for configuring journey plan feature settings.
 * Provides comprehensive configuration options for GPS verification,
 * route optimization, notifications, and other journey plan features.
 * 
 * @returns JSX element with complete settings interface
 */
const JourneyPlanSettingsComponent: React.FC = () => {
  const { user } = useAuth();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /** Current settings configuration */
  const [settings, setSettings] = useState<JourneyPlanSettings>({
    id: 'journey-plan-settings',
    isEnabled: false,
    requireGpsVerification: true,
    allowRouteOptimization: true,
    maxLocationsPerDay: 10,
    defaultVisitDuration: 30,
    autoAssignRoutes: false,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
    },
    createdBy: user?.id || '',
    updatedAt: new Date().toISOString(),
  });

  /** Processing state for save operations */
  const [isSaving, setIsSaving] = useState(false);
  
  /** Whether settings have been modified */
  const [hasChanges, setHasChanges] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle setting changes and track modifications
   * 
   * @param key - Setting key to update
   * @param value - New value for the setting
   */
  const handleSettingChange = (key: keyof JourneyPlanSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }));
    setHasChanges(true);
  };

  /**
   * Handle notification setting changes
   * 
   * @param key - Notification setting key
   * @param value - New value for the notification setting
   */
  const handleNotificationChange = (key: keyof typeof settings.notificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
    setHasChanges(true);
  };

  /**
   * Save settings to backend
   * 
   * @returns Promise<void> - Async save operation
   */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mock API call - simulate backend processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Journey plan settings saved:', settings);
      toast.success('Journey plan settings saved successfully!');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Reset settings to default values
   */
  const handleReset = () => {
    setSettings({
      id: 'journey-plan-settings',
      isEnabled: false,
      requireGpsVerification: true,
      allowRouteOptimization: true,
      maxLocationsPerDay: 10,
      defaultVisitDuration: 30,
      autoAssignRoutes: false,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
      },
      createdBy: user?.id || '',
      updatedAt: new Date().toISOString(),
    });
    setHasChanges(false);
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Journey Plan Settings</h1>
            <p className="text-gray-600">Configure journey plan feature settings and preferences</p>
          </div>
        </div>
        
        {/* Feature Status Banner */}
        <div className={`mt-4 p-4 rounded-lg border ${
          settings.isEnabled 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            {settings.isEnabled ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <AlertCircle size={20} className="text-gray-600" />
            )}
            <div>
              <h3 className={`font-medium ${
                settings.isEnabled ? 'text-green-900' : 'text-gray-900'
              }`}>
                Journey Plan Feature: {settings.isEnabled ? 'Enabled' : 'Disabled'}
              </h3>
              <p className={`text-sm ${
                settings.isEnabled ? 'text-green-700' : 'text-gray-600'
              }`}>
                {settings.isEnabled 
                  ? 'Employees can now access journey planning features and receive assignments.'
                  : 'Journey planning features are currently disabled for all employees.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Feature Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">
            Control how the journey plan feature works for your organization
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Feature Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Enable Journey Plan Feature</h3>
                <p className="text-sm text-gray-600">
                  Allow employees to receive and manage journey assignments
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isEnabled}
                onChange={(e) => handleSettingChange('isEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* GPS Verification */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Require GPS Verification</h3>
                <p className="text-sm text-gray-600">
                  Employees must verify their location when visiting assigned locations
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireGpsVerification}
                onChange={(e) => handleSettingChange('requireGpsVerification', e.target.checked)}
                className="sr-only peer"
                disabled={!settings.isEnabled}
              />
              <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                settings.requireGpsVerification 
                  ? 'bg-blue-600 peer-checked:after:translate-x-full' 
                  : 'bg-gray-200'
              } ${!settings.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
            </label>
          </div>

          {/* Route Optimization */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Route size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Allow Route Optimization</h3>
                <p className="text-sm text-gray-600">
                  Automatically optimize routes for the most efficient journey
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRouteOptimization}
                onChange={(e) => handleSettingChange('allowRouteOptimization', e.target.checked)}
                className="sr-only peer"
                disabled={!settings.isEnabled}
              />
              <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                settings.allowRouteOptimization 
                  ? 'bg-green-600 peer-checked:after:translate-x-full' 
                  : 'bg-gray-200'
              } ${!settings.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
            </label>
          </div>

          {/* Auto Assign Routes */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Auto-Assign Optimal Routes</h3>
                <p className="text-sm text-gray-600">
                  Automatically assign the most efficient route to employees
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoAssignRoutes}
                onChange={(e) => handleSettingChange('autoAssignRoutes', e.target.checked)}
                className="sr-only peer"
                disabled={!settings.isEnabled}
              />
              <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                settings.autoAssignRoutes 
                  ? 'bg-purple-600 peer-checked:after:translate-x-full' 
                  : 'bg-gray-200'
              } ${!settings.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
            </label>
          </div>
        </div>

        {/* Limits and Defaults */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Limits & Defaults</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Max Locations Per Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Locations Per Day
              </label>
              <input
                type="number"
                value={settings.maxLocationsPerDay}
                onChange={(e) => handleSettingChange('maxLocationsPerDay', parseInt(e.target.value) || 1)}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={!settings.isEnabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum number of locations an employee can be assigned per day
              </p>
            </div>

            {/* Default Visit Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Visit Duration (minutes)
              </label>
              <input
                type="number"
                value={settings.defaultVisitDuration}
                onChange={(e) => handleSettingChange('defaultVisitDuration', parseInt(e.target.value) || 15)}
                min="5"
                max="480"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={!settings.isEnabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Default duration for each location visit in minutes
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          
          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <Bell size={12} className="text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Send journey updates via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.emailNotifications}
                  onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                  disabled={!settings.isEnabled}
                />
                <div className={`w-9 h-5 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                  settings.notificationSettings.emailNotifications 
                    ? 'bg-blue-600 peer-checked:after:translate-x-full' 
                    : 'bg-gray-200'
                } ${!settings.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
              </label>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                  <Bell size={12} className="text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-600">Send real-time push notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.pushNotifications}
                  onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                  disabled={!settings.isEnabled}
                />
                <div className={`w-9 h-5 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                  settings.notificationSettings.pushNotifications 
                    ? 'bg-green-600 peer-checked:after:translate-x-full' 
                    : 'bg-gray-200'
                } ${!settings.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                  <Bell size={12} className="text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                  <p className="text-sm text-gray-600">Send journey updates via SMS</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.smsNotifications}
                  onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                  className="sr-only peer"
                  disabled={!settings.isEnabled}
                />
                <div className={`w-9 h-5 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                  settings.notificationSettings.smsNotifications 
                    ? 'bg-purple-600 peer-checked:after:translate-x-full' 
                    : 'bg-gray-200'
                } ${!settings.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
              </label>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6 border-t border-gray-200 bg-blue-50">
          <div className="flex items-start space-x-3">
            <Info size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Important Notes</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Journey plan settings can only be managed by administrators</li>
                <li>• GPS verification helps ensure employees visit assigned locations</li>
                <li>• Route optimization reduces travel time and improves efficiency</li>
                <li>• Notification settings apply to all journey plan activities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Reset to Defaults
        </button>

        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-orange-600 flex items-center space-x-1">
              <AlertCircle size={14} />
              <span>Unsaved changes</span>
            </span>
          )}
          
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JourneyPlanSettingsComponent; 