import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Users, 
  Crown, 
  Star, 
  StarOff,
  UserPlus,
  Settings,
  Eye,
  Building2
} from 'lucide-react';
import { Group, GroupHierarchy, GroupFilters } from '../../types';

interface GroupHierarchyViewProps {
  groups: Group[];
  selectedGroup: Group | null;
  onGroupSelect: (group: Group) => void;
  filters: GroupFilters;
}

/**
 * Group Hierarchy View Component
 * 
 * Displays the hierarchical group structure with:
 * - Expandable/collapsible tree view
 * - Leader indicators (yellow star for approval authority, black star for view only)
 * - Member counts and workplace assignments
 * - Drag and drop member reassignment
 * - Quick actions for each group
 */
const GroupHierarchyView: React.FC<GroupHierarchyViewProps> = ({
  groups,
  selectedGroup,
  onGroupSelect,
  filters,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['1'])); // Start with top-level expanded
  const [draggedMember, setDraggedMember] = useState<string | null>(null);

  // Build hierarchy from flat groups
  const buildHierarchy = (groups: Group[]): GroupHierarchy[] => {
    const groupMap = new Map<string, Group>();
    const hierarchy: GroupHierarchy[] = [];

    // Create map for quick lookup
    groups.forEach(group => groupMap.set(group.id, group));

    // Build hierarchy
    groups.forEach(group => {
      if (!group.parentGroupId) {
        // Top-level group
        hierarchy.push({
          id: group.id,
          name: group.name,
          depth: group.depth,
          isTopLevel: group.isTopLevel,
          memberCount: group.memberCount,
          leaderCount: group.leaderCount,
          children: [],
          path: [group.name],
        });
      }
    });

    // Add children recursively
    const addChildren = (parent: GroupHierarchy) => {
      const children = groups.filter(g => g.parentGroupId === parent.id);
      parent.children = children.map(child => ({
        id: child.id,
        name: child.name,
        depth: child.depth,
        isTopLevel: child.isTopLevel,
        memberCount: child.memberCount,
        leaderCount: child.leaderCount,
        children: [],
        path: [...parent.path, child.name],
      }));
      parent.children.forEach(addChildren);
    };

    hierarchy.forEach(addChildren);
    return hierarchy;
  };

  const hierarchy = buildHierarchy(groups);

  const toggleExpanded = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const isExpanded = (groupId: string) => expandedGroups.has(groupId);

  const handleDragStart = (e: React.DragEvent, memberId: string) => {
    setDraggedMember(memberId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    if (draggedMember && draggedMember !== targetGroupId) {
      // Handle member reassignment
      console.log(`Moving member ${draggedMember} to group ${targetGroupId}`);
      // TODO: Implement actual member reassignment logic
    }
    setDraggedMember(null);
  };

  const renderGroupNode = (group: GroupHierarchy, level: number = 0) => {
    const hasChildren = group.children.length > 0;
    const expanded = isExpanded(group.id);
    const isSelected = selectedGroup?.id === group.id;

    return (
      <div key={group.id} className="space-y-1">
        <div
          className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-50 border border-blue-200'
              : 'hover:bg-gray-50 border border-transparent'
          }`}
          onClick={() => onGroupSelect(groups.find(g => g.id === group.id)!)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, group.id)}
        >
          {/* Indentation */}
          <div className="flex items-center" style={{ marginLeft: `${level * 20}px` }}>
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(group.id);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
          </div>

          {/* Group Icon */}
          <div className="flex-shrink-0">
            {group.isTopLevel ? (
              <Building2 className="h-5 w-5 text-blue-600" />
            ) : (
              <Users className="h-5 w-5 text-gray-500" />
            )}
          </div>

          {/* Group Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {group.name}
              </h4>
              {group.isTopLevel && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Top Level
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {group.memberCount} members
              </span>
              <span className="flex items-center">
                <Crown className="h-3 w-3 mr-1" />
                {group.leaderCount} leaders
              </span>
              <span>Depth {group.depth}</span>
            </div>
          </div>

          {/* Leader Indicators */}
          <div className="flex items-center space-x-1">
            {group.leaderCount > 0 && (
                             <div className="flex items-center space-x-1">
                 <Star className="h-4 w-4 text-yellow-500" />
                 <span className="text-xs text-gray-500">{group.leaderCount}</span>
               </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement view members
                console.log('View members for group:', group.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="View members"
            >
              <Eye className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement add member
                console.log('Add member to group:', group.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Add member"
            >
              <UserPlus className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement group settings
                console.log('Group settings for:', group.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Group settings"
            >
              <Settings className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && expanded && (
          <div className="ml-6">
            {group.children.map(child => renderGroupNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Filter groups based on search term
  const filteredHierarchy = filters.searchTerm
    ? hierarchy.filter(group => 
        group.name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        group.path.some(path => path.toLowerCase().includes(filters.searchTerm!.toLowerCase()))
      )
    : hierarchy;

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Understanding Groups</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">
                <strong>Groups:</strong> Departments or teams with hierarchical structure (up to 7 levels deep).
                The top-level group is named after your company and cannot be deleted.
              </p>
              <p className="mb-2">
                <strong>Leaders:</strong> 
                <span className="inline-flex items-center ml-1">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  Yellow star = approval authority
                </span>
                <span className="inline-flex items-center ml-2">
                  <StarOff className="h-4 w-4 text-gray-500 mr-1" />
                  Black star = view only
                </span>
              </p>
              <p>
                <strong>Drag & Drop:</strong> Move members between groups by dragging them to the target group.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Tree */}
      <div className="space-y-1">
        {filteredHierarchy.length > 0 ? (
          filteredHierarchy.map(group => renderGroupNode(group))
        ) : (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first group.'}
            </p>
          </div>
        )}
      </div>

      {/* Selected Group Details */}
      {selectedGroup && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Group: {selectedGroup.name}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Members:</span>
              <span className="ml-1 font-medium">{selectedGroup.memberCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Leaders:</span>
              <span className="ml-1 font-medium">{selectedGroup.leaderCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Depth:</span>
              <span className="ml-1 font-medium">{selectedGroup.depth}</span>
            </div>
            <div>
              <span className="text-gray-500">Workplaces:</span>
              <span className="ml-1 font-medium">{selectedGroup.workplaceIds.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupHierarchyView; 