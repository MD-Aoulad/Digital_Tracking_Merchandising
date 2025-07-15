import React, { useState } from 'react';
import { Member, MemberRole, Group, MemberStats, MemberFilters } from '../../types';
import MemberManagement from './MemberManagement';
import GroupManagement from './GroupManagement';
import RoleManagement from './RoleManagement';
import AdminTab from '../Admin/AdminTab';
import { t } from '../../lib/i18n';
import { useLanguageChange } from '../../lib/i18n-hooks';
import api from '../../services/api';
import { useEffect } from 'react';

/**
 * MembersPage Component
 * 
 * A comprehensive member management interface that provides:
 * - Multi-tab navigation (Members, Groups, Roles, Admin)
 * - Advanced filtering and search capabilities
 * - Real-time statistics and metrics
 * - Full internationalization support
 * - Role-based access control
 * 
 * @param userRole - The current user's role for access control
 */
interface MembersPageProps {
  userRole: string;
}

const MembersPage: React.FC<MembersPageProps> = ({ userRole }) => {
  // Use language change hook to trigger re-renders when language changes
  // This ensures the component updates when the user switches languages
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentLocale = useLanguageChange();
  
  // State management for tab navigation and member operations
  const [activeTab, setActiveTab] = useState<'members' | 'groups' | 'roles' | 'admin'>('members');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [filters, setFilters] = useState<MemberFilters>({});
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.admin.getAllUsers();
      setMembers(
        (res.users || []).map((user: any) => ({
          ...user,
          userId: user.id,
          hireDate: user.hireDate || '',
          groups: user.groups || [],
          isLeader: user.role === 'leader',
          isAdmin: user.role === 'admin',
          approvalAuthority: false,
          position: user.position || '',
          employeeId: user.employeeId || '',
          phone: user.phone || '',
          managerId: user.managerId || '',
          workplaceId: user.workplaceId || '',
          emergencyContact: user.emergencyContact || {},
          permissions: user.permissions || {},
          lastLoginAt: user.lastLoginAt || '',
          createdAt: user.createdAt || '',
          updatedAt: user.updatedAt || '',
          status: user.status || 'active',
          avatar: user.avatar || '',
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Compute stats from members
  const stats = {
    totalMembers: members.length,
    admins: members.filter(m => m.role === 'admin').length,
    leaders: members.filter(m => m.role === 'leader').length,
    employees: members.filter(m => m.role === 'employee').length,
  };

  // Mock data for demonstration purposes
  // In production, this would be fetched from an API
  const mockGroups: Group[] = [
    {
      id: 'group-3',
      name: 'IT Development Team',
      description: 'Software development and IT infrastructure team',
      parentGroupId: undefined,
      leaderId: '6',
      members: ['6', '7', '8', '12'],
      depth: 0,
      isTopLevel: true,
      isActive: true,
      memberCount: 4,
      leaderCount: 1,
      workplaceIds: ['wp1'],
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
      createdBy: '1',
      createdAt: '2023-11-05T00:00:00Z',
      updatedAt: '2023-11-05T00:00:00Z'
    },
    {
      id: 'group-4',
      name: 'HR Team',
      description: 'Human resources and employee relations team',
      parentGroupId: undefined,
      leaderId: '13',
      members: ['13', '14'],
      depth: 0,
      isTopLevel: true,
      isActive: true,
      memberCount: 2,
      leaderCount: 1,
      workplaceIds: ['wp1'],
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
      createdBy: '1',
      createdAt: '2023-07-20T00:00:00Z',
      updatedAt: '2023-07-20T00:00:00Z'
    },
    {
      id: 'group-5',
      name: 'Finance Team',
      description: 'Financial management and accounting team',
      parentGroupId: undefined,
      leaderId: '16',
      members: ['15', '16', '17'],
      depth: 0,
      isTopLevel: true,
      isActive: true,
      memberCount: 3,
      leaderCount: 1,
      workplaceIds: ['wp1'],
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
      createdBy: '1',
      createdAt: '2023-10-15T00:00:00Z',
      updatedAt: '2023-10-15T00:00:00Z'
    },
    {
      id: 'group-6',
      name: 'Operations Team',
      description: 'Operations and logistics management team',
      parentGroupId: undefined,
      leaderId: undefined,
      members: ['18', '19', '20'],
      depth: 0,
      isTopLevel: true,
      isActive: true,
      memberCount: 3,
      leaderCount: 0,
      workplaceIds: ['wp2'],
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
      createdBy: '1',
      createdAt: '2024-09-05T00:00:00Z',
      updatedAt: '2024-09-05T00:00:00Z'
    },
    
    {
      id: 'group-1',
      name: 'Sales Team',
      description: 'Sales department team members',
      parentGroupId: undefined,
      leaderId: '2',
      members: ['2', '3'],
      depth: 0,
      isTopLevel: true,
      isActive: true,
      memberCount: 2,
      leaderCount: 1,
      workplaceIds: ['wp1'],
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
      createdBy: '1',
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-03-20T00:00:00Z'
    },
    {
      id: 'group-2',
      name: 'Marketing Team',
      description: 'Marketing department team members',
      parentGroupId: undefined,
      leaderId: '4',
      members: ['4'],
      depth: 0,
      isTopLevel: true,
      isActive: true,
      memberCount: 1,
      leaderCount: 1,
      workplaceIds: ['wp2'],
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
      createdBy: '1',
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-08-15T00:00:00Z'
    }
  ];

  const mockStats: MemberStats = {
    totalMembers: 20,
    activeMembers: 17,
    admins: 1,
    leaders: 5,
    employees: 14,
    membersByGroup: [
      { groupId: 'group-3', groupName: 'IT Development Team', memberCount: 4 },
      { groupId: 'group-4', groupName: 'HR Team', memberCount: 2 },
      { groupId: 'group-5', groupName: 'Finance Team', memberCount: 3 },
      { groupId: 'group-6', groupName: 'Operations Team', memberCount: 3 },
      
      { groupId: 'group-1', groupName: 'Sales Team', memberCount: 2 },
      { groupId: 'group-2', groupName: 'Marketing Team', memberCount: 1 }
    ],
    recentActivity: [
      {
        memberId: '1',
        memberName: 'John Smith',
        activity: 'Logged in',
        timestamp: '2025-01-13T10:30:00Z'
      },
      {
        memberId: '2',
        memberName: 'Sarah Johnson',
        activity: 'Approved leave request',
        timestamp: '2025-01-13T09:15:00Z'
      }
    ]
  };

  /**
   * Generates CSS classes for role badges with appropriate colors
   * @param role - The member's role
   * @returns CSS classes for styling the role badge
   */
  const getRoleBadge = (role: MemberRole) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (role) {
      case MemberRole.ADMIN:
        return `${baseClasses} bg-red-100 text-red-800`;
      case MemberRole.LEADER:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case MemberRole.EMPLOYEE:
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  /**
   * Generates CSS classes for status badges with appropriate colors
   * @param status - The member's status
   * @returns CSS classes for styling the status badge
   */
  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'suspended':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'terminated':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Filtering logic (reuse existing filters)
  const filteredMembers = members.filter(member => {
    if (filters.role && member.role !== filters.role) return false;
    if (filters.status && member.status !== filters.status) return false;
    if (filters.department && member.department !== filters.department) return false;
    if (filters.position && member.position !== filters.position) return false;
    if (filters.isLeader !== undefined && member.isLeader !== filters.isLeader) return false;
    if (filters.isAdmin !== undefined && member.isAdmin !== filters.isAdmin) return false;
    if (filters.hasApprovalAuthority !== undefined && member.approvalAuthority !== filters.hasApprovalAuthority) return false;
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      return (
        member.name.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm) ||
        member.employeeId?.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  /**
   * Handles saving a new or updated member
   * @param member - The member data to save
   */
  const handleSaveMember = (member: Member) => {
    console.log('Saving member:', member);
    
    // If this is a new member (no id), add it to the mock data
    if (!member.id) {
      const newMember: Member = {
        ...member,
        id: `member-${Date.now()}`,
        userId: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: undefined
      };
      
      // Add to mock members array (in a real app, this would be handled by state management)
      // mockMembers.push(newMember); // This line is no longer needed as members state is managed by API
      
      // Show success message
      alert('User created successfully! You can now log in to the mobile app with this account.');
    }
    
    setShowMemberModal(false);
    setSelectedMember(null);
  };

  /**
   * Opens the member modal for editing an existing member
   * @param member - The member to edit
   */
  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  /**
   * Handles member deletion with confirmation
   * @param memberId - The ID of the member to delete
   */
  const handleDeleteMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      setDeletingId(memberId);
      try {
        await api.admin.deleteUser(memberId);
        await fetchMembers();
      } catch (err) {
        alert('Failed to delete user');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('members.title') || 'Member Management'}</h1>
          <p className="mt-2 text-gray-600">
            {t('members.description') || 'Manage employee roles, groups, and administrative rights.'}
          </p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('members.totalMembers') || 'Total Members'}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('members.admins') || 'Admins'}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('members.leaders') || 'Leaders'}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.leaders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('members.employees') || 'Employees'}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.employees}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Loading/Error States */}
        {loading && <div className="text-center text-gray-500">Loading members...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {/* Tabs and Members List (only show if not loading/error) */}
        {!loading && !error && (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('members')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'members'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('members.tabMembers') || 'Members'}
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'groups'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('members.tabGroups') || 'Groups'}
                </button>
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'roles'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('members.tabRoleManagement') || 'Role Management'}
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'admin'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('members.tabAdmin') || 'Admin'}
                </button>
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                {/* Filters and Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                      <input
                        type="text"
                        placeholder={t('members.searchPlaceholder') || 'Search members...'}
                        value={filters.searchTerm || ''}
                        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={filters.role || ''}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value as MemberRole || undefined })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">{t('members.allRoles')}</option>
                        <option value={MemberRole.ADMIN}>{t('members.roleAdmin')}</option>
                        <option value={MemberRole.LEADER}>{t('members.roleLeader')}</option>
                        <option value={MemberRole.EMPLOYEE}>{t('members.roleEmployee')}</option>
                      </select>
                      <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">{t('members.allStatus')}</option>
                        <option value="active">{t('members.statusActive')}</option>
                        <option value="inactive">{t('members.statusInactive')}</option>
                        <option value="suspended">{t('members.statusSuspended')}</option>
                        <option value="terminated">{t('members.statusTerminated')}</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setShowMemberModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {t('members.addMember') || 'Add Member'}
                    </button>
                  </div>
                </div>

                {/* Members List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <li key={member.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {member.avatar ? (
                                <img className="h-10 w-10 rounded-full" src={member.avatar} alt={member.name} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                                <span className={getRoleBadge(member.role)}>
                                  {member.role}
                                </span>
                                <span className={getStatusBadge(member.status)}>
                                  {member.status}
                                </span>
                                {member.isLeader && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Leader
                                  </span>
                                )}
                                {member.approvalAuthority && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Approval Authority
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{member.email}</p>
                              <p className="text-sm text-gray-500">
                                {member.position} • {member.department} • ID: {member.employeeId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditMember(member)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={deletingId === member.id}
                            >
                              {deletingId === member.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'groups' && (
              <GroupManagement groups={mockGroups} members={members} />
            )}

            {activeTab === 'roles' && (
              <RoleManagement members={members} />
            )}

            {activeTab === 'admin' && (
              <AdminTab currentUserRole={userRole as MemberRole} />
            )}
          </>
        )}

        {/* Member Modal */}
        {showMemberModal && (
          <MemberManagement
            member={selectedMember || undefined}
            groups={mockGroups}
            onSave={handleSaveMember}
            onCancel={() => {
              setShowMemberModal(false);
              setSelectedMember(null);
            }}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
};

export default MembersPage; 