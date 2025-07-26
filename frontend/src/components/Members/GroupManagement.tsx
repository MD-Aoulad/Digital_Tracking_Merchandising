import React, { useState } from 'react';
import { Group, Member } from '../../types';

interface GroupManagementProps {
  groups: Group[];
  members: Member[];
}

interface GroupFormData {
  id?: string;
  name: string;
  description: string;
  parentGroupId?: string;
  leaderId?: string;
  members: string[];
  isActive: boolean;
}

const GroupManagement: React.FC<GroupManagementProps> = ({ groups, members }) => {
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupFormData, setGroupFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    parentGroupId: undefined,
    leaderId: undefined,
    members: [],
    isActive: true
  });

  const handleSaveGroup = (group: Group) => {
    console.log('Saving group:', group);
    setShowGroupModal(false);
    setSelectedGroup(null);
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setGroupFormData({
      id: group.id,
      name: group.name,
      description: group.description,
      parentGroupId: group.parentGroupId,
      leaderId: group.leaderId,
      members: group.members,
      isActive: group.isActive
    });
    setShowGroupModal(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      console.log('Deleting group:', groupId);
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'Unknown Member';
  };

  const getLeaderName = (leaderId?: string) => {
    if (!leaderId) return 'No Leader Assigned';
    const leader = members.find(m => m.id === leaderId);
    return leader ? leader.name : 'Unknown Leader';
  };

  const getParentGroupName = (parentGroupId?: string) => {
    if (!parentGroupId) return 'No Parent Group';
    const parentGroup = groups.find(g => g.id === parentGroupId);
    return parentGroup ? parentGroup.name : 'Unknown Parent Group';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Group Management</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage organizational groups and member assignments. Groups help organize employees and define leadership hierarchies.
          </p>
        </div>
        <button
          onClick={() => setShowGroupModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Group
        </button>
      </div>

      {/* Groups List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {groups.map((group) => (
            <li key={group.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      group.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {group.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{group.description}</p>
                  <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Leader:</span> {getLeaderName(group.leaderId)}
                    </div>
                    <div>
                      <span className="font-medium">Members:</span> {group.members.length}
                    </div>
                    <div>
                      <span className="font-medium">Parent Group:</span> {getParentGroupName(group.parentGroupId)}
                    </div>
                  </div>
                  {group.members.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-700">Members: </span>
                      <span className="text-sm text-gray-500">
                        {group.members.map(memberId => getMemberName(memberId)).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Group Hierarchy Visualization */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Group Hierarchy</h3>
        <div className="space-y-4">
          {groups.filter(group => !group.parentGroupId).map((group) => (
            <div key={group.id} className="border-l-2 border-blue-200 pl-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{group.name}</span>
                <span className="text-sm text-gray-500">({group.members.length} members)</span>
              </div>
              {groups.filter(subGroup => subGroup.parentGroupId === group.id).map((subGroup) => (
                <div key={subGroup.id} className="ml-6 mt-2 border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">{subGroup.name}</span>
                    <span className="text-sm text-gray-500">({subGroup.members.length} members)</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedGroup ? 'Edit Group' : 'Add New Group'}
              </h2>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setSelectedGroup(null);
                  setGroupFormData({
                    name: '',
                    description: '',
                    parentGroupId: undefined,
                    leaderId: undefined,
                    members: [],
                    isActive: true
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const groupToSave: Group = {
                id: groupFormData.id || `group-${Date.now()}`,
                name: groupFormData.name!,
                description: groupFormData.description!,
                parentGroupId: groupFormData.parentGroupId,
                leaderId: groupFormData.leaderId,
                members: groupFormData.members || [],
                depth: groupFormData.parentGroupId ? 1 : 0,
                isTopLevel: !groupFormData.parentGroupId,
                isActive: true,
                memberCount: groupFormData.members?.length || 0,
                leaderCount: groupFormData.leaderId ? 1 : 0,
                workplaceIds: [],
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
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              console.log('Saving group:', groupToSave);
              // TODO: Implement actual save logic
              setShowGroupModal(false);
              setSelectedGroup(null);
              setGroupFormData({
                name: '',
                description: '',
                parentGroupId: undefined,
                leaderId: undefined,
                members: [],
                isActive: true
              });
            }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  required
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  required
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter group description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Group
                  </label>
                  <select
                    value={groupFormData.parentGroupId || ''}
                    onChange={(e) => setGroupFormData({ 
                      ...groupFormData, 
                      parentGroupId: e.target.value || undefined 
                    })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">No Parent Group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Leader
                  </label>
                  <select
                    value={groupFormData.leaderId || ''}
                    onChange={(e) => setGroupFormData({ 
                      ...groupFormData, 
                      leaderId: e.target.value || undefined 
                    })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">No Leader Assigned</option>
                    {members.filter(m => m.isLeader || m.isAdmin).map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Members
                </label>
                <select
                  multiple
                  value={groupFormData.members}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setGroupFormData({ ...groupFormData, members: selected });
                  }}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  size={6}
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.position} ({member.role})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple members</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={groupFormData.isActive}
                    onChange={(e) => setGroupFormData({ ...groupFormData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active Group</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowGroupModal(false);
                    setSelectedGroup(null);
                    setGroupFormData({
                      name: '',
                      description: '',
                      parentGroupId: undefined,
                      leaderId: undefined,
                      members: [],
                      isActive: true
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {selectedGroup ? 'Update Group' : 'Add Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement; 