import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  UserPlus, 
  UserMinus, 
  Edit, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { MemberRole } from '../../types';

interface AdminManagementProps {
  currentUserRole: MemberRole;
}

interface AdminCandidate {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  position?: string;
  isLeader: boolean;
  isAdmin: boolean;
  groups: string[];
  lastLoginAt?: string;
  createdAt: string;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ currentUserRole }) => {
  const [admins, setAdmins] = useState<AdminCandidate[]>([]);
  const [leaders, setLeaders] = useState<AdminCandidate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminCandidate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockAdmins: AdminCandidate[] = [
      {
        id: '1',
        name: 'John Admin',
        email: 'john.admin@company.com',
        avatar: '/avatars/john.jpg',
        department: 'IT',
        position: 'System Administrator',
        isLeader: true,
        isAdmin: true,
        groups: ['IT Department', 'System Management'],
        lastLoginAt: '2024-01-15T10:30:00Z',
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Sarah Manager',
        email: 'sarah.manager@company.com',
        avatar: '/avatars/sarah.jpg',
        department: 'HR',
        position: 'HR Director',
        isLeader: true,
        isAdmin: true,
        groups: ['HR Department', 'Management'],
        lastLoginAt: '2024-01-15T09:15:00Z',
        createdAt: '2023-03-15T00:00:00Z'
      }
    ];

    const mockLeaders: AdminCandidate[] = [
      {
        id: '3',
        name: 'Mike Leader',
        email: 'mike.leader@company.com',
        avatar: '/avatars/mike.jpg',
        department: 'Sales',
        position: 'Sales Manager',
        isLeader: true,
        isAdmin: false,
        groups: ['Sales Department'],
        lastLoginAt: '2024-01-14T16:45:00Z',
        createdAt: '2023-06-01T00:00:00Z'
      },
      {
        id: '4',
        name: 'Lisa Coordinator',
        email: 'lisa.coordinator@company.com',
        avatar: '/avatars/lisa.jpg',
        department: 'Marketing',
        position: 'Marketing Coordinator',
        isLeader: true,
        isAdmin: false,
        groups: ['Marketing Department'],
        lastLoginAt: '2024-01-14T14:20:00Z',
        createdAt: '2023-08-15T00:00:00Z'
      }
    ];

    setAdmins(mockAdmins);
    setLeaders(mockLeaders);
  }, []);

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.department?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(admin => 
    !filterDepartment || admin.department === filterDepartment
  );

  const filteredLeaders = leaders.filter(leader => 
    leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leader.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leader.department?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(leader => 
    !filterDepartment || leader.department === filterDepartment
  );

  const handleAddAdmin = async (leaderId: string) => {
    if (admins.length >= 10) {
      setMessage({ type: 'warning', text: 'Maximum number of admins (10) reached.' });
      return;
    }

    setIsLoading(true);
    try {
      const leader = leaders.find(l => l.id === leaderId);
      if (!leader) throw new Error('Leader not found');

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAdmin: AdminCandidate = {
        ...leader,
        isAdmin: true
      };

      setAdmins(prev => [...prev, newAdmin]);
      setLeaders(prev => prev.filter(l => l.id !== leaderId));
      setShowAddModal(false);
      setMessage({ type: 'success', text: `${leader.name} has been granted admin permissions.` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to grant admin permissions.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (admins.length <= 1) {
      setMessage({ type: 'warning', text: 'Cannot remove the last admin. There must be at least one admin.' });
      return;
    }

    setIsLoading(true);
    try {
      const admin = admins.find(a => a.id === adminId);
      if (!admin) throw new Error('Admin not found');

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const formerAdmin: AdminCandidate = {
        ...admin,
        isAdmin: false
      };

      setAdmins(prev => prev.filter(a => a.id !== adminId));
      setLeaders(prev => [...prev, formerAdmin]);
      setMessage({ type: 'success', text: `${admin.name}'s admin permissions have been removed.` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove admin permissions.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAdmin = (admin: AdminCandidate) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (currentUserRole !== MemberRole.ADMIN) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">Only administrators can manage admin permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
            <p className="text-gray-600 mt-1">
              Manage admin permissions for leaders. Only admins can add or edit admins.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              There must be at least one admin. Admins can set usage policy and access all information, 
              so please decide carefully. Admins can only be selected among leaders.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search admins by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            ) : message.type === 'error' ? (
              <XCircle className="h-5 w-5 text-red-400 mr-3" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
            )}
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-800' :
              message.type === 'error' ? 'text-red-800' :
              'text-yellow-800'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Current Admins */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Current Admins ({filteredAdmins.length})
        </h3>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredAdmins.map((admin) => (
              <li key={admin.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {admin.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={admin.avatar}
                          alt={admin.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {getInitials(admin.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                      <p className="text-sm text-gray-500">
                        {admin.department} • {admin.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Last login: {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : 'Never'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Admin since: {formatDate(admin.createdAt)}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit admin"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveAdmin(admin.id)}
                        disabled={isLoading || admins.length <= 1}
                        className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                        title="Remove admin permissions"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {filteredAdmins.length === 0 && (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No admins found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Available Leaders */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Available Leaders ({filteredLeaders.length})
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Leaders who can be granted admin permissions. To register a member as an admin, 
          make the member a leader first.
        </p>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredLeaders.map((leader) => (
              <li key={leader.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {leader.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={leader.avatar}
                          alt={leader.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {getInitials(leader.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{leader.name}</p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Leader
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{leader.email}</p>
                      <p className="text-sm text-gray-500">
                        {leader.department} • {leader.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Last login: {leader.lastLoginAt ? formatDate(leader.lastLoginAt) : 'Never'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Leader since: {formatDate(leader.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddAdmin(leader.id)}
                      disabled={isLoading || admins.length >= 10}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Grant Admin
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {filteredLeaders.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No leaders found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Grant Admin Permissions</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select a leader to grant admin permissions. Admins can set usage policy and access all information.
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {filteredLeaders.map((leader) => (
                  <div
                    key={leader.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {leader.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={leader.avatar}
                            alt={leader.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {getInitials(leader.name)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{leader.name}</p>
                        <p className="text-xs text-gray-500">{leader.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddAdmin(leader.id)}
                      disabled={isLoading}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
                    >
                      Grant
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Admin</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    {selectedAdmin.avatar ? (
                      <img
                        className="h-12 w-12 rounded-full"
                        src={selectedAdmin.avatar}
                        alt={selectedAdmin.name}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {getInitials(selectedAdmin.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{selectedAdmin.name}</p>
                    <p className="text-sm text-gray-500">{selectedAdmin.email}</p>
                    <p className="text-sm text-gray-500">
                      {selectedAdmin.department} • {selectedAdmin.position}
                    </p>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> To remove admin permissions, use the remove button in the admin list.
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement; 