import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Settings,
  Plus,
  FileText,
  Info
} from 'lucide-react';
import WorkplaceManagement from './WorkplaceManagement';
import WorkplaceSettings from './WorkplaceSettings';
import StateCityManagement from './StateCityManagement';
import AreaManagement from './AreaManagement';
import DistributorManagement from './DistributorManagement';
import CustomPropertyManagement from './CustomPropertyManagement';

/**
 * Main Workplace Page Component
 * 
 * This component provides comprehensive workplace management functionality including:
 * - Workplace concept explanation
 * - Property registration and management
 * - State/City management
 * - Area management
 * - Distributor management
 * - Custom property management
 * 
 * Features:
 * - Role-based access control (admin only for property registration)
 * - Tabbed interface for different management areas
 * - Search and filtering capabilities
 * - Bulk operations support
 * - Real-time updates and notifications
 */
const WorkplacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'management' | 'settings' | 'properties'>('overview');
  const [selectedProperty, setSelectedProperty] = useState<'state-city' | 'area' | 'distributor' | 'custom'>('state-city');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Info },
    { id: 'management', name: 'Workplace Management', icon: Building2 },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'properties', name: 'Property Registration', icon: FileText },
  ];

  const propertyTabs = [
    { id: 'state-city', name: 'State & City', description: 'Manage states and cities for workplace locations' },
    { id: 'area', name: 'Area', description: 'Manage areas for location-based workplace information' },
    { id: 'distributor', name: 'Distributor', description: 'Manage distributors and channels' },
    { id: 'custom', name: 'Custom Properties', description: 'Create and manage custom workplace properties' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Workplace Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Workplace
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Workplace Concept Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Workplace Concept</h2>
                <p className="text-sm text-gray-600 mt-1">Understanding workplace types and properties</p>
              </div>
              <div className="px-6 py-6">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">What is a Workplace?</h3>
                  <p className="text-gray-700 mb-4">
                    A <strong>Workplace</strong> refers to the location where employees work. Each workplace has its unique location 
                    and serves as the place where attendance, absence, return, movement, and arrival records are logged.
                  </p>
                  
                  <p className="text-gray-700 mb-6">
                    The concept of workplace in Shopl can be divided into three main categories:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Workplace</h4>
                      <p className="text-sm text-blue-700">
                        Registered workplaces in the Shopl app and dashboard.
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Fixed Workplace</h4>
                      <p className="text-sm text-green-700">
                        The default workplace where an employee works unless otherwise specified.
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-medium text-orange-900 mb-2">Temporary Workplace</h4>
                      <p className="text-sm text-orange-700">
                        A workplace not registered in Shopl.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mb-4">Workplace Properties</h3>
                  <p className="text-gray-700 mb-4">
                    <strong>Workplace properties</strong> are information that characterizes a registered workplace. 
                    The system provides default properties, including workplace name, code, address, distributor, 
                    state and city, district, and workplace representative photo. Administrators can also create custom properties.
                  </p>
                  
                  <p className="text-gray-700 mb-6">
                    When adding a workplace, you can select from the options for state, distributor, district, 
                    and custom properties that were registered beforehand.
                  </p>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                      <Info className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>NOTE:</strong> Only administrators can add or edit workplace properties.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('management')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Building2 className="h-8 w-8 text-blue-600 mr-3" />
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Manage Workplaces</h3>
                      <p className="text-sm text-gray-600">Add, edit, and manage workplace locations</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('properties');
                      setSelectedProperty('state-city');
                    }}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MapPin className="h-8 w-8 text-green-600 mr-3" />
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">State & City</h3>
                      <p className="text-sm text-gray-600">Manage states and cities for locations</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('properties');
                      setSelectedProperty('distributor');
                    }}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Building2 className="h-8 w-8 text-purple-600 mr-3" />
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Distributors</h3>
                      <p className="text-sm text-gray-600">Manage distributors and channels</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('properties');
                      setSelectedProperty('custom');
                    }}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-8 w-8 text-orange-600 mr-3" />
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Custom Properties</h3>
                      <p className="text-sm text-gray-600">Create custom workplace properties</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New workplace added</p>
                        <p className="text-xs text-gray-600">Main Office - Seoul Special City</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">State updated</p>
                        <p className="text-xs text-gray-600">Busan Metropolitan City</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Distributor added</p>
                        <p className="text-xs text-gray-600">ABC Distribution Co.</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <WorkplaceManagement />
        )}

        {activeTab === 'settings' && (
          <WorkplaceSettings />
        )}

        {activeTab === 'properties' && (
          <div className="space-y-6">
            {/* Property Registration Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Property Registration</h2>
                <p className="text-sm text-gray-600 mt-1">Manage workplace properties and settings</p>
              </div>
              <div className="px-6 py-4">
                <div className="flex space-x-1">
                  {propertyTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedProperty(tab.id as any)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        selectedProperty === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Content */}
            {selectedProperty === 'state-city' && <StateCityManagement />}
            {selectedProperty === 'area' && <AreaManagement />}
            {selectedProperty === 'distributor' && <DistributorManagement />}
            {selectedProperty === 'custom' && <CustomPropertyManagement />}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkplacePage; 