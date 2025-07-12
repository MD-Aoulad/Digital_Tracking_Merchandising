/**
 * Leave Management Page Component - Workforce Management Platform
 * 
 * Comprehensive leave management system with request workflows, approval processes,
 * and leave balance tracking. Features include:
 * - Leave request submission and approval
 * - Leave balance tracking and management
 * - Multiple leave types (vacation, sick, personal)
 * - Approval workflows and notifications
 * - Calendar integration
 * - Leave policy management
 * - Reporting and analytics
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {  } from 'framer-motion';
import {
  Calendar,
  Clock,
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Trash2,
  Eye
  
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LeaveRequest, LeaveType, LeaveBalance } from '../../types';
import toast from 'react-hot-toast';

/**
 * LeavePage Component
 * 
 * Main leave management interface with request submission, approval workflows,
 * and leave balance tracking capabilities.
 * 
 * @returns JSX element with complete leave management interface
 */
const LeavePage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'requests' | 'calendar' | 'balances'>('requests');

  /**
   * Initialize mock leave data
   */
  useEffect(() => {
    const mockLeaveTypes: LeaveType[] = [
      {
        id: '1',
        name: 'Vacation',
        maxDays: 20,
        color: '#10B981',
        requiresApproval: true
      },
      {
        id: '2',
        name: 'Sick Leave',
        maxDays: 10,
        color: '#EF4444',
        requiresApproval: false
      },
      {
        id: '3',
        name: 'Personal Leave',
        maxDays: 5,
        color: '#F59E0B',
        requiresApproval: true
      },
      {
        id: '4',
        name: 'Maternity Leave',
        maxDays: 90,
        color: '#8B5CF6',
        requiresApproval: true
      }
    ];

    const mockLeaveRequests: LeaveRequest[] = [
      {
        id: '1',
        userId: '1',
        type: mockLeaveTypes[0],
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        reason: 'Family vacation',
        status: 'pending',
        attachments: ['vacation-request.pdf']
      },
      {
        id: '2',
        userId: '2',
        type: mockLeaveTypes[1],
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        reason: 'Not feeling well',
        status: 'approved',
        approvedBy: '1',
        approvedAt: '2024-01-19T10:00:00Z'
      },
      {
        id: '3',
        userId: '3',
        type: mockLeaveTypes[2],
        startDate: '2024-02-10',
        endDate: '2024-02-12',
        reason: 'Personal matters',
        status: 'rejected',
        approvedBy: '1',
        approvedAt: '2024-01-25T14:30:00Z'
      }
    ];

    const mockLeaveBalances: LeaveBalance[] = [
      {
        userId: '1',
        leaveTypeId: '1',
        totalDays: 20,
        usedDays: 5,
        remainingDays: 15
      },
      {
        userId: '1',
        leaveTypeId: '2',
        totalDays: 10,
        usedDays: 2,
        remainingDays: 8
      },
      {
        userId: '2',
        leaveTypeId: '1',
        totalDays: 20,
        usedDays: 8,
        remainingDays: 12
      }
    ];

    setLeaveTypes(mockLeaveTypes);
    setLeaveRequests(mockLeaveRequests);
    setLeaveBalances(mockLeaveBalances);
  }, []);

  /**
   * Create new leave request
   */
  const createLeaveRequest = (requestData: Partial<LeaveRequest>) => {
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      userId: user?.id || '',
      type: requestData.type || leaveTypes[0],
      startDate: requestData.startDate || '',
      endDate: requestData.endDate || '',
      reason: requestData.reason || '',
      status: 'pending',
      attachments: requestData.attachments || []
    };

    setLeaveRequests(prev => [...prev, newRequest]);
    toast.success('Leave request submitted successfully');
    setShowRequestModal(false);
  };

  /**
   * Approve leave request
   */
  const approveRequest = (requestId: string) => {
    setLeaveRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: 'approved', 
            approvedBy: user?.id || '',
            approvedAt: new Date().toISOString()
          }
        : request
    ));
    toast.success('Leave request approved');
  };

  /**
   * Reject leave request
   */
  const rejectRequest = (requestId: string) => {
    setLeaveRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: 'rejected', 
            approvedBy: user?.id || '',
            approvedAt: new Date().toISOString()
          }
        : request
    ));
    toast.success('Leave request rejected');
  };

  /**
   * Delete leave request
   */
  const deleteRequest = (requestId: string) => {
    setLeaveRequests(prev => prev.filter(request => request.id !== requestId));
    toast.success('Leave request deleted');
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      case 'pending':
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  /**
   * Calculate leave duration
   */
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  /**
   * Filter requests based on search and filters
   */
  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.type.id === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">Manage leave requests, approvals, and balances</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setShowTypeModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <FileText size={16} />
            <span>Leave Types</span>
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Request Leave</span>
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['requests', 'calendar', 'balances'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'requests' && (
        <>
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search leave requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Types</option>
                  {leaveTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {request.userId.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Employee {request.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: request.type.color }}
                          ></div>
                          <span className="text-sm text-gray-900">{request.type.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <p>{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
                          <p className="text-gray-500">{calculateDuration(request.startDate, request.endDate)} days</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 truncate max-w-xs">{request.reason}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(request.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRequestModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye size={16} />
                          </button>
                          {request.status === 'pending' && hasPermission('leave:manage') && (
                            <>
                              <button
                                onClick={() => approveRequest(request.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => rejectRequest(request.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteRequest(request.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {viewMode === 'balances' && (
        /* Leave Balances */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Balances</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaveBalances.map((balance) => {
              const leaveType = leaveTypes.find(type => type.id === balance.leaveTypeId);
              if (!leaveType) return null;

              const usagePercentage = (balance.usedDays / balance.totalDays) * 100;

              return (
                <div key={`${balance.userId}-${balance.leaveTypeId}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{leaveType.name}</h4>
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: leaveType.color }}
                    ></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Days:</span>
                      <span className="font-medium">{balance.totalDays}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Used Days:</span>
                      <span className="font-medium text-red-600">{balance.usedDays}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium text-green-600">{balance.remainingDays}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${usagePercentage}%`,
                          backgroundColor: leaveType.color
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{usagePercentage.toFixed(1)}% used</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'calendar' && (
        /* Leave Calendar */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Calendar</h3>
          <div className="text-center text-gray-500 py-8">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Calendar view coming soon...</p>
            <p className="text-sm">This will show a visual calendar with approved leave dates</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{leaveRequests.length}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {leaveRequests.filter(r => r.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {leaveRequests.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {leaveRequests.filter(r => r.status === 'rejected').length}
              </p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavePage;
