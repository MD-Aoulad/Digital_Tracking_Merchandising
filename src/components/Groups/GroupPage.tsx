import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  Star, 
  StarOff, 
  Plus, 
  Settings, 
  BarChart3,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  UserPlus,
  UserMinus,
  Crown,
  MapPin
} from 'lucide-react';
import { Group, GroupHierarchy, GroupStats, GroupFilters, GroupType } from '../../types';
import GroupHierarchyView from './GroupHierarchyView';
import GroupManagement from './GroupManagement';
import GroupSettings from './GroupSettings';
import GroupAnalytics from './GroupAnalytics';

/**
 * Group Management Page Component
 * 
 * This component provides comprehensive group management functionality including:
 * - Hierarchical group structure (up to 7 levels deep)
 * - Leader assignments with approval authority
 * - Member management and workplace assignments
 * - Group settings and analytics
 * 
 * Features:
 * - Top-level group (company name) that cannot be deleted
 * - Subgroups with hierarchical structure
 * - Leader assignments with yellow star (approval authority) or black star (view only)
 * - Drag and drop member reassignment
 * - Workplace integration
 * - Role-based access control
 */
const GroupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'management' | 'settings' | 'analytics'>('overview');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [filters, setFilters] = useState<GroupFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API calls
  const [groups] = useState<Group[]>([
    {
      id: '1',
      name: 'Acme Corporation',
      description: 'Main company group',
      depth: 0,
      isTopLevel: true,
      isActive: true,
      memberCount: 150,
      leaderCount: 5,
      members: ['1', '2', '3', '4', '5'],
      workplaceIds: ['wp1', 'wp2', 'wp3'],
      settings: {
        allowSubgroups: true,
        maxDepth: 7,
        allowMemberReassignment: true,
        requireLeaderApproval: false,
        autoAssignNewMembers: true,
        notificationSettings: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          memberChangeNotifications: true,
          leaderChangeNotifications: true,
        },
      },
      createdBy: 'admin1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      name: 'Sales Department',
      description: 'Sales and marketing team',
      parentGroupId: '1',
      depth: 1,
      isTopLevel: false,
      isActive: true,
      memberCount: 45,
      leaderCount: 3,
      members: ['6', '7', '8', '9', '10'],
      workplaceIds: ['wp1', 'wp2'],
      settings: {
        allowSubgroups: true,
        maxDepth: 6,
        allowMemberReassignment: true,
        requireLeaderApproval: true,
        autoAssignNewMembers: false,
        notificationSettings: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          memberChangeNotifications: true,
          leaderChangeNotifications: true,
        },
      },
      createdBy: 'admin1',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '3',
      name: 'North Region',
      description: 'North region sales team',
      parentGroupId: '2',
      depth: 2,
      isTopLevel: false,
      isActive: true,
      memberCount: 20,
      leaderCount: 2,
      members: ['11', '12', '13', '14', '15'],
      workplaceIds: ['wp1'],
      settings: {
        allowSubgroups: false,
        maxDepth: 5,
        allowMemberReassignment: true,
        requireLeaderApproval: true,
        autoAssignNewMembers: false,
        notificationSettings: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          memberChangeNotifications: true,
          leaderChangeNotifications: true,
        },
      },
      createdBy: 'admin1',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
  ]);

  const [groupStats] = useState<GroupStats>({
    totalGroups: 3,
    activeGroups: 3,
    topLevelGroups: 1,
    subgroups: 2,
    totalMembers: 150,
    totalLeaders: 5,
    averageGroupSize: 50,
    groupsByDepth: [
      { depth: 0, count: 1 },
      { depth: 1, count: 1 },
      { depth: 2, count: 1 },
    ],
    membersByGroup: [
      { groupId: '1', groupName: 'Acme Corporation', memberCount: 150, leaderCount: 5 },
      { groupId: '2', groupName: 'Sales Department', memberCount: 45, leaderCount: 3 },
      { groupId: '3', groupName: 'North Region', memberCount: 20, leaderCount: 2 },
    ],
    recentActivity: [
      { groupId: '2', groupName: 'Sales Department', activity: 'New member added', timestamp: '2024-01-15T10:30:00Z' },
      { groupId: '3', groupName: 'North Region', activity: 'Leader assigned', timestamp: '2024-01-14T15:45:00Z' },
    ],
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Users },
    { id: 'management', name: 'Management', icon: Settings },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  const handleFilterChange = (newFilters: GroupFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage organizational groups, assign leaders, and configure approval authorities
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Group
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Groups</dt>
                        <dd className="text-lg font-medium text-gray-900">{groupStats.totalGroups}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Groups</dt>
                        <dd className="text-lg font-medium text-gray-900">{groupStats.activeGroups}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Crown className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Leaders</dt>
                        <dd className="text-lg font-medium text-gray-900">{groupStats.totalLeaders}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MapPin className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Avg Group Size</dt>
                        <dd className="text-lg font-medium text-gray-900">{groupStats.averageGroupSize}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Group Hierarchy */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Group Hierarchy</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search groups..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <GroupHierarchyView
                  groups={groups}
                  selectedGroup={selectedGroup}
                  onGroupSelect={handleGroupSelect}
                  filters={filters}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {groupStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.groupName}</span>
                          <span className="ml-1 text-gray-500">{activity.activity}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <GroupManagement
            groups={groups}
            selectedGroup={selectedGroup}
            onGroupSelect={handleGroupSelect}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}

        {activeTab === 'settings' && (
          <GroupSettings />
        )}

        {activeTab === 'analytics' && (
          <GroupAnalytics stats={groupStats} />
        )}
      </div>
    </div>
  );
};

export default GroupPage; 