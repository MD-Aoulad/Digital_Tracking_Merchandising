import React from 'react';
import { Shield, Users, AlertTriangle } from 'lucide-react';
import AdminManagement from './AdminManagement';
import { MemberRole } from '../../types';

interface AdminTabProps {
  currentUserRole: MemberRole;
}

const AdminTab: React.FC<AdminTabProps> = ({ currentUserRole }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
            <p className="text-gray-600 mt-1">
              Manage admin permissions and system access controls
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Admins
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    2
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
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Available Leaders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    2
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
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Admin Limit
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    2/10
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Management Component */}
      <AdminManagement currentUserRole={currentUserRole} />

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">How to Manage Admins</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Adding an Admin</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Ensure the member is already a leader</li>
              <li>Click "Add Admin" button</li>
              <li>Select the leader from the list</li>
              <li>Click "Grant" to confirm</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Removing Admin Permissions</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Find the admin in the current admins list</li>
              <li>Click the remove button (UserMinus icon)</li>
              <li>Confirm the action</li>
              <li>The member will remain a leader</li>
            </ol>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> There must be at least one admin at all times. 
            Admins have full system access and can set usage policies, so assign this role carefully.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTab; 