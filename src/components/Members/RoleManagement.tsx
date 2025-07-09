import React, { useState } from 'react';
import { Member, MemberRole, Group } from '../../types';

interface RoleManagementProps {
  members: Member[];
}

const RoleManagement: React.FC<RoleManagementProps> = ({ members }) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

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

  const getPermissionDescription = (permission: string) => {
    const descriptions: Record<string, string> = {
      canManageAllGroups: 'Can manage all groups in the system',
      canManageAllMembers: 'Can manage all members and their roles',
      canViewAllData: 'Can view all company data and reports',
      canApproveAllRequests: 'Can approve all types of requests',
      canManageSystemSettings: 'Can manage system-wide settings',
      canManageAssignedGroups: 'Can manage groups they are assigned to',
      canViewGroupMembers: 'Can view members in their managed groups',
      canViewGroupReports: 'Can view reports for their managed groups',
      canViewGroupAttendance: 'Can view attendance for their managed groups',
      canViewGroupSchedules: 'Can view schedules for their managed groups',
      canApproveGroupRequests: 'Can approve requests from group members',
      canCreateGroupTasks: 'Can create tasks for group members',
      canManageGroupSettings: 'Can manage group-specific settings',
      canViewOwnData: 'Can view their own data and records',
      canSubmitRequests: 'Can submit approval requests',
      canCreateReports: 'Can create and submit reports',
      canUseAttendance: 'Can use attendance features',
      canViewOwnSchedule: 'Can view their own schedule',
      canUseChat: 'Can use chat and communication features',
      canUsePostingBoard: 'Can use posting board features'
    };
    return descriptions[permission] || permission;
  };

  const handleRoleChange = (member: Member, newRole: MemberRole) => {
    console.log(`Changing role for ${member.name} from ${member.role} to ${newRole}`);
    setSelectedMember(member);
    setShowRoleModal(true);
  };

  const handleToggleApprovalAuthority = (member: Member) => {
    console.log(`Toggling approval authority for ${member.name}`);
    // In a real app, this would update the member's approval authority
  };

  const roleStats = {
    admins: members.filter(m => m.role === MemberRole.ADMIN).length,
    leaders: members.filter(m => m.role === MemberRole.LEADER).length,
    employees: members.filter(m => m.role === MemberRole.EMPLOYEE).length,
    withApprovalAuthority: members.filter(m => m.approvalAuthority).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage member roles and permissions. Admins have full access, leaders manage their groups, and employees have basic access.
        </p>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-semibold text-gray-900">{roleStats.admins}</p>
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
              <p className="text-sm font-medium text-gray-500">Leaders</p>
              <p className="text-2xl font-semibold text-gray-900">{roleStats.leaders}</p>
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
              <p className="text-sm font-medium text-gray-500">Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{roleStats.employees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">With Approval Authority</p>
              <p className="text-2xl font-semibold text-gray-900">{roleStats.withApprovalAuthority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Comparison Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Role Comparison</h3>
          <p className="mt-1 text-sm text-gray-600">Overview of permissions for each role type</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leader
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries({
                'View Own Data': 'canViewOwnData',
                'Submit Requests': 'canSubmitRequests',
                'Create Reports': 'canCreateReports',
                'Use Attendance': 'canUseAttendance',
                'View Own Schedule': 'canViewOwnSchedule',
                'Use Chat': 'canUseChat',
                'Use Posting Board': 'canUsePostingBoard',
                'View Group Members': 'canViewGroupMembers',
                'View Group Reports': 'canViewGroupReports',
                'View Group Attendance': 'canViewGroupAttendance',
                'View Group Schedules': 'canViewGroupSchedules',
                'Create Group Tasks': 'canCreateGroupTasks',
                'Manage Group Settings': 'canManageGroupSettings',
                'Approve Group Requests': 'canApproveGroupRequests',
                'Manage All Groups': 'canManageAllGroups',
                'Manage All Members': 'canManageAllMembers',
                'View All Data': 'canViewAllData',
                'Approve All Requests': 'canApproveAllRequests',
                'Manage System Settings': 'canManageSystemSettings'
              }).map(([permissionName, permissionKey]) => (
                <tr key={permissionKey}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {permissionName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {permissionKey.startsWith('canViewOwn') || 
                     permissionKey.startsWith('canSubmit') || 
                     permissionKey.startsWith('canCreate') || 
                     permissionKey.startsWith('canUse') ? (
                      <svg className="h-5 w-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {permissionKey.startsWith('canViewGroup') || 
                     permissionKey.startsWith('canCreateGroup') || 
                     permissionKey.startsWith('canManageGroup') || 
                     permissionKey.startsWith('canApproveGroup') || 
                     permissionKey.startsWith('canViewOwn') || 
                     permissionKey.startsWith('canSubmit') || 
                     permissionKey.startsWith('canCreate') || 
                     permissionKey.startsWith('canUse') ? (
                      <svg className="h-5 w-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Role Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Member Role Management</h3>
          <p className="mt-1 text-sm text-gray-600">Manage individual member roles and permissions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval Authority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
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
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getRoleBadge(member.role)}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.approvalAuthority ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member, e.target.value as MemberRole)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={MemberRole.EMPLOYEE}>Employee</option>
                        <option value={MemberRole.LEADER}>Leader</option>
                        <option value={MemberRole.ADMIN}>Admin</option>
                      </select>
                      {(member.role === MemberRole.LEADER || member.role === MemberRole.ADMIN) && (
                        <button
                          onClick={() => handleToggleApprovalAuthority(member)}
                          className={`text-sm px-2 py-1 rounded ${
                            member.approvalAuthority
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {member.approvalAuthority ? 'Remove' : 'Grant'} Approval
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Role</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Full system access and administrative rights</p>
            <p>• Can manage all groups and members</p>
            <p>• Can view all company data and reports</p>
            <p>• Can approve all types of requests</p>
            <p>• Can manage system-wide settings</p>
            <p>• Can be selected among leaders</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Leader Role</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Administrative rights for assigned groups</p>
            <p>• Can view members in managed groups</p>
            <p>• Can view group reports and attendance</p>
            <p>• Can create tasks for group members</p>
            <p>• Optional approval authority for requests</p>
            <p>• Can manage group-specific settings</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Role</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Basic employee access</p>
            <p>• Can view own data and schedule</p>
            <p>• Can submit approval requests</p>
            <p>• Can create and submit reports</p>
            <p>• Can use attendance features</p>
            <p>• Can use chat and posting board</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement; 