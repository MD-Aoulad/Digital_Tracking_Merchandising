/**
 * Delegation Management Tab Component
 * 
 * Allows users to manage approval authority delegations:
 * - View active delegations
 * - Request new delegations
 * - Approve/reject delegation requests
 * - Manage delegation history
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DelegationInfo, 
  DelegationStatus,
  ApprovalRequestType,
  UserRole 
} from '../../types';

interface DelegationManagementTabProps {
  // Component props if needed
}

const DelegationManagementTab: React.FC<DelegationManagementTabProps> = () => {
  const { user } = useAuth();
  const [delegations, setDelegations] = useState<DelegationInfo[]>([]);
  const [filteredDelegations, setFilteredDelegations] = useState<DelegationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'history'>('active');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDelegation, setSelectedDelegation] = useState<DelegationInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New delegation form state
  const [newDelegation, setNewDelegation] = useState({
    delegateId: '',
    delegateName: '',
    delegateEmail: '',
    requestType: ApprovalRequestType.LEAVE_REQUEST,
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    loadDelegations();
  }, [activeTab]);

  useEffect(() => {
    filterDelegations();
  }, [delegations, searchTerm]);

  const loadDelegations = async () => {
    try {
      setIsLoading(true);
      
      let endpoint = '/api/approvals/delegations';
      if (activeTab === 'active') {
        endpoint += '?status=active';
      } else if (activeTab === 'pending') {
        endpoint += '?status=pending';
      } else if (activeTab === 'history') {
        endpoint += '?status=expired,cancelled,rejected';
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDelegations(data);
      } else {
        console.error('Failed to load delegations');
      }
    } catch (error) {
      console.error('Error loading delegations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDelegations = () => {
    let filtered = [...delegations];

    if (searchTerm) {
      filtered = filtered.filter(delegation =>
        delegation.delegateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delegation.delegateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delegation.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDelegations(filtered);
  };

  const handleDelegationAction = async (delegationId: string, action: 'approve' | 'reject' | 'cancel', notes?: string) => {
    try {
      const response = await fetch(`/api/approvals/delegations/${delegationId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        loadDelegations();
        setShowDetailsModal(false);
        setSelectedDelegation(null);
      } else {
        console.error(`Failed to ${action} delegation`);
      }
    } catch (error) {
      console.error(`Error ${action}ing delegation:`, error);
    }
  };

  const handleRequestDelegation = async () => {
    try {
      const response = await fetch('/api/approvals/delegations/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newDelegation)
      });

      if (response.ok) {
        setShowRequestModal(false);
        setNewDelegation({
          delegateId: '',
          delegateName: '',
          delegateEmail: '',
          requestType: ApprovalRequestType.LEAVE_REQUEST,
          startDate: '',
          endDate: '',
          reason: ''
        });
        loadDelegations();
      } else {
        console.error('Failed to request delegation');
      }
    } catch (error) {
      console.error('Error requesting delegation:', error);
    }
  };

  const getStatusColor = (status: DelegationStatus) => {
    switch (status) {
      case DelegationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case DelegationStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case DelegationStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case DelegationStatus.ACTIVE:
        return 'bg-blue-100 text-blue-800';
      case DelegationStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      case DelegationStatus.CANCELLED:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDelegationActive = (delegation: DelegationInfo) => {
    const now = new Date();
    const startDate = new Date(delegation.startDate);
    const endDate = new Date(delegation.endDate);
    return delegation.status === DelegationStatus.ACTIVE && now >= startDate && now <= endDate;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading delegations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delegation Management</h2>
          <p className="text-gray-600">
            Manage approval authority delegations and requests
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Request Delegation
          </button>
          <button
            onClick={loadDelegations}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔄 Active Delegations
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⏳ Pending Requests
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 History
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search delegations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Delegations List */}
      <div className="space-y-4">
        {filteredDelegations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No delegations found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms.'
                : `There are no ${activeTab} delegations to display.`}
            </p>
          </div>
        ) : (
          filteredDelegations.map((delegation) => (
            <div
              key={delegation.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {delegation.delegateName}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delegation.status)}`}>
                      {delegation.status.replace('_', ' ')}
                    </span>
                    {isDelegationActive(delegation) && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{delegation.reason}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Delegate:</span> {delegation.delegateName}
                    </div>
                    <div>
                      <span className="font-medium">Request Type:</span> {delegation.requestType.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Start Date:</span> {formatDate(delegation.startDate)}
                    </div>
                    <div>
                      <span className="font-medium">End Date:</span> {formatDate(delegation.endDate)}
                    </div>
                  </div>

                  {delegation.approvedBy && (
                    <div className="mt-3 text-sm text-gray-500">
                      <span className="font-medium">Approved by:</span> {delegation.approvedBy} on {formatDate(delegation.approvedAt!)}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {delegation.status === DelegationStatus.PENDING && (
                    <>
                      <button
                        onClick={() => handleDelegationAction(delegation.id, 'approve')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleDelegationAction(delegation.id, 'reject')}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                  
                  {delegation.status === DelegationStatus.ACTIVE && isDelegationActive(delegation) && (
                    <button
                      onClick={() => handleDelegationAction(delegation.id, 'cancel')}
                      className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
                    >
                      🚫 Cancel
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedDelegation(delegation);
                      setShowDetailsModal(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Delegation Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Delegation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delegate Name
                </label>
                <input
                  type="text"
                  value={newDelegation.delegateName}
                  onChange={(e) => setNewDelegation(prev => ({ ...prev, delegateName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter delegate name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delegate Email
                </label>
                <input
                  type="email"
                  value={newDelegation.delegateEmail}
                  onChange={(e) => setNewDelegation(prev => ({ ...prev, delegateEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter delegate email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Type
                </label>
                <select
                  value={newDelegation.requestType}
                  onChange={(e) => setNewDelegation(prev => ({ ...prev, requestType: e.target.value as ApprovalRequestType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(ApprovalRequestType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newDelegation.startDate}
                  onChange={(e) => setNewDelegation(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={newDelegation.endDate}
                  onChange={(e) => setNewDelegation(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={newDelegation.reason}
                  onChange={(e) => setNewDelegation(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter reason for delegation"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDelegation}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Request Delegation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delegation Details Modal */}
      {showDetailsModal && selectedDelegation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delegation Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Delegate:</span>
                  <p className="text-sm text-gray-900">{selectedDelegation.delegateName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <p className="text-sm text-gray-900">{selectedDelegation.delegateEmail}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDelegation.status)}`}>
                    {selectedDelegation.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Request Type:</span>
                  <p className="text-sm text-gray-900">{selectedDelegation.requestType.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Start Date:</span>
                  <p className="text-sm text-gray-900">{formatDate(selectedDelegation.startDate)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">End Date:</span>
                  <p className="text-sm text-gray-900">{formatDate(selectedDelegation.endDate)}</p>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Reason:</span>
                <p className="text-sm text-gray-900 mt-1">{selectedDelegation.reason}</p>
              </div>

              {selectedDelegation.approvedBy && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Approved by:</span>
                  <p className="text-sm text-gray-900">{selectedDelegation.approvedBy} on {formatDate(selectedDelegation.approvedAt!)}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedDelegation(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelegationManagementTab; 