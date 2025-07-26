import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  User, 
  Database, 
  Globe, 
  Lock,
  Palette,
  Download,
  Upload,
  Building2
} from 'lucide-react';
import AdminTab from '../Admin/AdminTab';
import CompanyInfo from './CompanyInfo';
import { MemberRole } from '../../types';

interface SettingsPageProps {
  userRole?: MemberRole;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ userRole = MemberRole.ADMIN }) => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    {
      id: 'general',
      name: 'General',
      icon: Settings,
      description: 'Basic application settings'
    },
    {
      id: 'company',
      name: 'Company Info',
      icon: Building2,
      description: 'Company information and preferences',
      adminOnly: true
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: Shield,
      description: 'Admin permissions and access control',
      adminOnly: true
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'Email and push notification preferences'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      description: 'Personal profile and account settings'
    },
    {
      id: 'data',
      name: 'Data Management',
      icon: Database,
      description: 'Data export, import, and backup settings'
    },
    {
      id: 'regional',
      name: 'Regional',
      icon: Globe,
      description: 'Language, timezone, and regional settings'
    },
    {
      id: 'security',
      name: 'Security',
      icon: Lock,
      description: 'Password, 2FA, and security settings'
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: Palette,
      description: 'Theme, colors, and display preferences'
    }
  ];

  const filteredTabs = tabs.filter(tab => 
    !tab.adminOnly || userRole === MemberRole.ADMIN
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return <CompanyInfo userRole={userRole} />;
      case 'admin':
        return <AdminTab currentUserRole={userRole} />;
      case 'general':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
              <p className="text-gray-600 mt-1">Configure basic application settings</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600">General settings configuration coming soon...</p>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
              <p className="text-gray-600 mt-1">Configure email and push notification preferences</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600">Notification settings configuration coming soon...</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
              <p className="text-gray-600 mt-1">Manage your personal profile and account</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600">Profile settings configuration coming soon...</p>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
              <p className="text-gray-600 mt-1">Export, import, and backup your data</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Download className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-900">Export Data</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Download your data in various formats for backup or migration.
                  </p>
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Export Data
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Upload className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium text-gray-900">Import Data</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Import data from external sources or restore from backup.
                  </p>
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                    Import Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'regional':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Regional Settings</h2>
              <p className="text-gray-600 mt-1">Configure language, timezone, and regional preferences</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600">Regional settings configuration coming soon...</p>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
              <p className="text-gray-600 mt-1">Manage password, 2FA, and security preferences</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600">Security settings configuration coming soon...</p>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Appearance Settings</h2>
              <p className="text-gray-600 mt-1">Customize theme, colors, and display preferences</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600">Appearance settings configuration coming soon...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-gray-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Configure system settings and preferences</p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:w-64">
              <nav className="space-y-1">
                {filteredTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{tab.name}</div>
                        <div className="text-xs text-gray-500">{tab.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white shadow rounded-lg">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 