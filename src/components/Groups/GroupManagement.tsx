import React, { useState } from 'react';
import { 
  Plus, 
  Pencil,
  Users, 
  Crown, 
  Star, 
  StarOff,
  Search,
  Filter,
  Building2,
  UserPlus,
  UserMinus,
  Settings,
  MapPin,
  Eye,
  CheckCircle
} from 'lucide-react';
import { Group, GroupMember, GroupLeader, GroupFilters, Workplace, GroupMemberRole } from '../../types';

interface GroupManagementProps {
  groups: Group[];
  selectedGroup: Group | null;
  onGroupSelect: (group: Group) => void;
  filters: GroupFilters;
  onFilterChange: (filters: GroupFilters) => void;
}

/**
 * Group Management Component
 * 
 * Provides comprehensive group management functionality:
 * - Group creation and editing
 * - Member management with drag and drop
 * - Leader assignments with approval authority
 * - Workplace assignments
 * - Member filtering and search
 */
const GroupManagement: React.FC<GroupManagementProps> = ({
  groups,
  selectedGroup,
  onGroupSelect,
  filters,
  onFilterChange,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'leaders' | 'workplaces' | 'settings'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Mock data for group members
  const mockGroupMembers: GroupMember[] = [
    {
      id: 'gm1',
      groupId: '1',
      memberId: '1',
      memberName: 'John Doe',
      memberEmail: 'john.doe@company.com',
      memberAvatar: '/avatars/john.jpg',
      role: GroupMemberRole.LEADER,
      isLeader: true,
      hasApprovalAuthority: true,
      assignedWorkplaces: ['wp1', 'wp2'],
      assignedAt: '2024-01-01T00:00:00Z',
      assignedBy: 'admin1',
      isActive: true,
      notes: 'Team leader with full authority'
    },
    {
      id: 'gm2',
      groupId: '1',
      memberId: '2',
      memberName: 'Jane Smith',
      memberEmail: 'jane.smith@company.com',
      memberAvatar: '/avatars/jane.jpg',
      role: GroupMemberRole.MEMBER,
      isLeader: false,
      hasApprovalAuthority: false,
      assignedWorkplaces: ['wp1'],
      assignedAt: '2024-01-01T00:00:00Z',
      assignedBy: 'admin1',
      isActive: true,
      notes: 'Regular team member'
    }
  ];

  const [groupLeaders] = useState<GroupLeader[]>([
    {
      id: '1',
      groupId: '2',
      memberId: 'member1',
      memberName: 'John Doe',
      memberEmail: 'john.doe@company.com',
      approvalAuthority: {
        canApproveScheduleChanges: true,
        canApproveLeaveRequests: true,
        canApproveOvertime: true,
        canApproveAttendance: true,
        canApproveReports: true,
        canApproveTasks: true,
        canViewAllGroupData: true,
        canViewGroupReports: true,
        canViewGroupAttendance: true,
        canViewGroupSchedules: true,
        canCreateGroupTasks: true,
        canManageGroupSettings: true,
      },
      assignedWorkplaces: ['wp1', 'wp2'],
      memberCount: 15,
      isActive: true,
      assignedAt: '2024-01-01T00:00:00Z',
      assignedBy: 'admin1',
      notes: 'Primary sales leader',
    },
  ]);

  const [workplaces] = useState<Workplace[]>([
    {
      id: 'wp1',
      name: 'Main Office',
      code: 'MO001',
      address: '123 Main St, City, State',
      type: 'registered',
      isActive: true,
      isDefault: true,
      location: { lat: 40.7128, lng: -74.0060 },
      customProperties: [],
      createdBy: 'admin1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'wp2',
      name: 'Branch Office',
      code: 'BO001',
      address: '456 Branch Ave, City, State',
      type: 'fixed',
      isActive: true,
      isDefault: false,
      location: { lat: 40.7589, lng: -73.9851 },
      customProperties: [],
      createdBy: 'admin1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ]);

  const tabs = [
    { id: 'members', name: 'Members', icon: Users },
    { id: 'leaders', name: 'Leaders', icon: Crown },
    { id: 'workplaces', name: 'Workplaces', icon: Building2 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredMembers = mockGroupMembers.filter(member =>
    member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeaders = groupLeaders.filter(leader =>
    leader.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leader.memberEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-900">Group Management</h2>
          {selectedGroup && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {selectedGroup.name}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddGroupModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </button>
          {selectedGroup && (
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </button>
          )}
        </div>
      </div>

      {/* Group Selection */}
      {!selectedGroup && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Eye className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Select a Group</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please select a group from the overview tab to manage its members, leaders, and settings.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedGroup && (
        <>
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'members' && (
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
                      />
                    </div>
                  </div>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </button>
                </div>

                {/* Members List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <li key={member.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {member.memberAvatar ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={member.memberAvatar}
                                  alt={member.memberName}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {member.memberName}
                                </p>
                                {member.isLeader && (
                                  <div className="flex items-center space-x-1">
                                    {member.hasApprovalAuthority ? (
                                      <Star className="h-4 w-4 text-yellow-500" />
                                    ) : (
                                      <StarOff className="h-4 w-4 text-gray-500" />
                                    )}
                                    <span className="text-xs text-gray-500">Leader</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">{member.memberEmail}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {member.assignedWorkplaces.length} workplaces
                                </span>
                                <span>Assigned {new Date(member.assignedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Eye className="h-4 w-4 text-gray-500" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Pencil className="h-4 w-4 text-gray-500" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <UserMinus className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'leaders' && (
              <div className="space-y-4">
                {/* Leaders List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {filteredLeaders.map((leader) => (
                      <li key={leader.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Crown className="h-5 w-5 text-yellow-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {leader.memberName}
                                </p>
                                <Star className="h-4 w-4 text-yellow-500" />
                              </div>
                              <p className="text-sm text-gray-500 truncate">{leader.memberEmail}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span>Manages {leader.memberCount} members</span>
                                <span>{leader.assignedWorkplaces.length} workplaces</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Settings className="h-4 w-4 text-gray-500" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Pencil className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'workplaces' && (
              <div className="space-y-4">
                {/* Workplaces List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {workplaces.map((workplace) => (
                      <li key={workplace.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <Building2 className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {workplace.name}
                                </p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {workplace.code}
                                </span>
                                {workplace.isDefault && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">{workplace.address}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span className="capitalize">{workplace.type}</span>
                                <span className="flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                  Active
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Eye className="h-4 w-4 text-gray-500" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Pencil className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Group Settings */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Group Settings</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Group Name</label>
                        <input
                          type="text"
                          value={selectedGroup.name}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input
                          type="text"
                          value={selectedGroup.description || ''}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Permissions</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Allow subgroups</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Allow member reassignment</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Require leader approval</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Auto-assign new members</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Cancel
                      </button>
                      <button className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GroupManagement; 