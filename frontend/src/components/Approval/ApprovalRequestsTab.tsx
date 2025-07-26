/**
 * Approval Requests Tab Component
 * 
 * Displays and manages approval requests with filtering, searching,
 * and action capabilities for approvers and requesters.
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ApprovalRequest, 
  ApprovalStatus, 
  ApprovalRequestType,
  ApprovalFilters 
} from '../../types';

interface ApprovalRequestsTabProps {
  // Component props if needed
}

const ApprovalRequestsTab: React.FC<ApprovalRequestsTabProps> = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ApprovalRequestType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'my-requests' | 'pending-approvals' | 'all'>('pending-approvals');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadApprovalRequests();
  }, [viewMode]);

  useEffect(() => {
    filterRequests();
  }, [requests, selectedStatus, selectedType, searchTerm]);

  const loadApprovalRequests = async () => {
    try {
      setIsLoading(true);
      
      let endpoint = '/api/approvals/requests';
      if (viewMode === 'my-requests') {
        endpoint += '?my-requests=true';
      } else if (viewMode === 'pending-approvals') {
        endpoint += '?pending-approvals=true';
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        console.error('Failed to load approval requests');
      }
    } catch (error) {
      console.error('Error loading approval requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(request => request.status === selectedStatus);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(request => request.type === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requesterName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject' | 'delegate', notes?: string) => {
    try {
      const response = await fetch(`/api/approvals/requests/${requestId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        // Reload requests after action
        loadApprovalRequests();
        setSelectedRequests([]);
        setShowBulkActions(false);
      } else {
        console.error(`Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delegate') => {
    try {
      const response = await fetch(`/api/approvals/requests/bulk/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ requestIds: selectedRequests })
      });

      if (response.ok) {
        loadApprovalRequests();
        setSelectedRequests([]);
        setShowBulkActions(false);
      } else {
        console.error(`Failed to ${action} requests`);
      }
    } catch (error) {
      console.error(`Error ${action}ing requests:`, error);
    }
  };

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ApprovalStatus.IN_REVIEW:
        return 'bg-blue-100 text-blue-800';
      case ApprovalStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case ApprovalStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case ApprovalStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      case ApprovalStatus.EXPIRED:
        return 'bg-orange-100 text-orange-800';
      case ApprovalStatus.DELEGATED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading approval requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Requests</h2>
          <p className="text-gray-600">
            {filteredRequests.length} of {requests.length} requests
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={loadApprovalRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Mode
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending-approvals">Pending Approvals</option>
              <option value="my-requests">My Requests</option>
              <option value="all">All Requests</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value={ApprovalStatus.PENDING}>Pending</option>
              <option value={ApprovalStatus.IN_REVIEW}>In Review</option>
              <option value={ApprovalStatus.APPROVED}>Approved</option>
              <option value={ApprovalStatus.REJECTED}>Rejected</option>
              <option value={ApprovalStatus.CANCELLED}>Cancelled</option>
              <option value={ApprovalStatus.EXPIRED}>Expired</option>
              <option value={ApprovalStatus.DELEGATED}>Delegated</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value={ApprovalRequestType.LEAVE_REQUEST}>Leave Request</option>
              <option value={ApprovalRequestType.SCHEDULE_CHANGE}>Schedule Change</option>
              <option value={ApprovalRequestType.OVERTIME_REQUEST}>Overtime Request</option>
              <option value={ApprovalRequestType.ATTENDANCE_CORRECTION}>Attendance Correction</option>
              <option value={ApprovalRequestType.REPORT_SUBMISSION}>Report Submission</option>
              <option value={ApprovalRequestType.TASK_COMPLETION}>Task Completion</option>
              <option value={ApprovalRequestType.EXPENSE_CLAIM}>Expense Claim</option>
              <option value={ApprovalRequestType.PURCHASE_REQUEST}>Purchase Request</option>
              <option value={ApprovalRequestType.DELEGATION_REQUEST}>Delegation Request</option>
              <option value={ApprovalRequestType.CUSTOM_REQUEST}>Custom Request</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedRequests.length} request(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Approve All
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={() => setSelectedRequests([])}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'There are no approval requests to display.'}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                selectedRequests.includes(request.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRequests([...selectedRequests, request.id]);
                        } else {
                          setSelectedRequests(selectedRequests.filter(id => id !== request.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{request.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Requester:</span> {request.requesterName}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {request.type.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span> {formatDate(request.submittedAt)}
                    </div>
                    <div>
                      <span className="font-medium">Due:</span> {request.dueDate ? formatDate(request.dueDate) : 'No due date'}
                    </div>
                  </div>

                  {request.delegationInfo && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-600">🔄</span>
                        <span className="text-sm text-purple-800">
                          Delegated to {request.delegationInfo.delegateName} until {formatDate(request.delegationInfo.endDate)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {request.status === ApprovalStatus.PENDING && (
                    <>
                      <button
                        onClick={() => handleRequestAction(request.id, 'approve')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, 'reject')}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        ❌ Reject
                      </button>
                      {request.workflow.allowDelegation && (
                        <button
                          onClick={() => handleRequestAction(request.id, 'delegate')}
                          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                        >
                          🔄 Delegate
                        </button>
                      )}
                    </>
                  )}
                  
                  <button
                    onClick={() => {/* TODO: View details modal */}}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    👁️ View
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalRequestsTab; 