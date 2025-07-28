import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Lock, 
  Eye, 
  Settings, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Key,
  Database,
  Activity
} from 'lucide-react';
import { MemberRole } from '../../types';

interface IAMFeatureProps {
  currentUserRole: MemberRole;
}

const IAMFeature: React.FC<IAMFeatureProps> = ({ currentUserRole }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Role-Based Access Control",
      description: "Assign roles (Admin, Manager, Supervisor, Employee, Viewer) to control access to every merchandising feature",
      status: "Active"
    },
    {
      icon: <Lock className="h-6 w-6 text-green-600" />,
      title: "Multi-Factor Authentication",
      description: "Enhanced security with MFA, password policies, and account lockout protection",
      status: "Active"
    },
    {
      icon: <Eye className="h-6 w-6 text-purple-600" />,
      title: "Audit & Compliance",
      description: "Complete audit trail for all actions with compliance reporting (SOX, GDPR, PCI-DSS)",
      status: "Active"
    },
    {
      icon: <Users className="h-6 w-6 text-orange-600" />,
      title: "User Management",
      description: "Create, manage, and organize users with hierarchical groups and permissions",
      status: "Active"
    },
    {
      icon: <Settings className="h-6 w-6 text-indigo-600" />,
      title: "Security Policies",
      description: "Configurable password policies, session management, and rate limiting",
      status: "Active"
    },
    {
      icon: <Database className="h-6 w-6 text-teal-600" />,
      title: "Enterprise Database",
      description: "Dedicated IAM database with secure storage and backup capabilities",
      status: "Active"
    }
  ];

  const permissions = [
    { feature: "Todo Management", admin: "Full", manager: "Full", supervisor: "Create/Edit", employee: "View/Complete", viewer: "View Only" },
    { feature: "Chat System", admin: "Full", manager: "Full", supervisor: "Full", employee: "Participate", viewer: "View Only" },
    { feature: "Attendance Tracking", admin: "Full", manager: "Full", supervisor: "Manage Team", employee: "Punch In/Out", viewer: "View Only" },
    { feature: "Reporting & Analytics", admin: "Full", manager: "Full", supervisor: "Team Reports", employee: "Personal Reports", viewer: "View Only" },
    { feature: "Approval System", admin: "Full", manager: "Full", supervisor: "Team Approvals", employee: "Submit Requests", viewer: "View Only" },
    { feature: "Workplace Management", admin: "Full", manager: "Full", supervisor: "Area Management", employee: "View Assigned", viewer: "View Only" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Identity & Access Management (IAM)</h2>
            <p className="text-gray-600 mt-1">
              Enterprise-grade security and access control for your merchandising platform
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    156
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Key className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    MFA Enabled
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    142
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Audit Events
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    2,847
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Compliance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    100%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: <Shield className="h-4 w-4" /> },
            { id: 'permissions', name: 'Permissions', icon: <Lock className="h-4 w-4" /> },
            { id: 'audit', name: 'Audit Log', icon: <FileText className="h-4 w-4" /> },
            { id: 'settings', name: 'Settings', icon: <Settings className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        <div className="mt-3 flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-600 font-medium">{feature.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Communication Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">
                How to Communicate IAM to Your Customers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Key Messages</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Control who can access every merchandising feature
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Assign roles and permissions for security
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Meet compliance requirements (SOX, GDPR, PCI-DSS)
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Track every action with full audit trail
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Where to Direct Customers</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Product website features section
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Admin dashboard user management
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      API documentation for developers
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Customer support and onboarding
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Role-Based Permissions Matrix</h3>
                <p className="text-sm text-gray-600 mt-1">Control access to merchandising features by role</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feature
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manager
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supervisor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Viewer
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {permissions.map((permission, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {permission.feature}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {permission.admin}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {permission.manager}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {permission.supervisor}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {permission.employee}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {permission.viewer}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Audit Events</h3>
                <p className="text-sm text-gray-600 mt-1">Track all user actions and system events</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { action: "User Login", user: "john.admin@company.com", timestamp: "2024-01-15 10:30:00", status: "Success" },
                    { action: "Role Assignment", user: "sarah.manager@company.com", timestamp: "2024-01-15 09:15:00", status: "Success" },
                    { action: "Permission Update", user: "admin@digitaltracking.com", timestamp: "2024-01-15 08:45:00", status: "Success" },
                    { action: "Failed Login Attempt", user: "unknown@company.com", timestamp: "2024-01-15 08:30:00", status: "Failed" },
                    { action: "User Creation", user: "admin@digitaltracking.com", timestamp: "2024-01-15 08:00:00", status: "Success" }
                  ].map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          event.status === 'Success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.action}</p>
                          <p className="text-xs text-gray-500">{event.user}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{event.timestamp}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.status === 'Success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">MFA Required</span>
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Password Policy</span>
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Account Lockout</span>
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Session Timeout</span>
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Audit Logging</span>
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">GDPR Compliance</span>
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">SOX Compliance</span>
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">PCI-DSS Compliance</span>
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
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

export default IAMFeature; 