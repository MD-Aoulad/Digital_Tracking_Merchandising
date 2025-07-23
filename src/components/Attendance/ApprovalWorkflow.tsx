/**
 * Approval Workflow Component - Workforce Management Platform
 * 
 * Comprehensive approval workflow interface that provides:
 * - Approval request list with filtering and search
 * - Approval/rejection actions with comments
 * - Approval history view with audit trail
 * - Approval statistics and performance metrics
 * - Notification system for new requests
 * - Approval templates and automation
 * - Bulk approval capabilities
 * - Mobile-responsive design
 * 
 * Features:
 * - Real-time approval request management
 * - Approval workflow with multiple steps
 * - Approval history and audit logging
 * - Approval statistics and analytics
 * - Notification system integration
 * - Approval templates and automation
 * - Bulk approval operations
 * - Mobile-optimized interface
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Bell,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Calendar,
  User,
  FileText,
  BarChart3,
  Settings,
  RefreshCw,
  TrendingUp,
  Activity,
  Users,
  Timer
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { t } from '../../lib/i18n';
import { useLanguageChange } from '../../lib/i18n-hooks';
import { 
  AttendanceApproval,
  TeamStatus,
  User as UserType
} from '../../types';
import toast from 'react-hot-toast';

/**
 * Approval statistics
 */
interface ApprovalStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageResponseTime: number; // in hours
  approvalRate: number; // percentage
  todayRequests: number;
  todayApproved: number;
}

/**
 * Approval template
 */
interface ApprovalTemplate {
  id: string;
  name: string;
  description: string;
  type: AttendanceApproval['type'];
  autoApprove: boolean;
  conditions: string[];
  createdBy: string;
  createdAt: string;
}

/**
 * Approval Workflow Component
 * 
 * Comprehensive approval workflow interface with request management,
 * approval actions, history tracking, and analytics.
 * 
 * @returns JSX element with complete approval workflow interface
 */
const ApprovalWorkflow: React.FC = () => {
  const { user } = useAuth();
  // Use language change hook to trigger re-renders when language changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentLocale = useLanguageChange();
  
  // State management
  const [approvalRequests, setApprovalRequests] = useState<AttendanceApproval[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<AttendanceApproval[]>([]);
  const [approvalStats, setApprovalStats] = useState<ApprovalStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    averageResponseTime: 0,
    approvalRate: 0,
    todayRequests: 0,
    todayApproved: 0
  });
  const [teamMembers, setTeamMembers] = useState<TeamStatus[]>([]);
  const [approvalTemplates, setApprovalTemplates] = useState<ApprovalTemplate[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'analytics' | 'templates'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AttendanceApproval | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  /**
   * Initialize component data
   */
  useEffect(() => {
    initializeMockData();
  }, []);

  /**
   * Initialize mock data
   */
  const initializeMockData = () => {
    // Mock approval requests
    const mockRequests: AttendanceApproval[] = [
      {
        id: '1',
        attendanceId: 'att1',
        userId: '2',
        managerId: user?.id || '',
        type: 'overtime',
        reason: 'Project deadline approaching, need to work extra hours',
        status: 'pending',
        requestedAt: new Date().toISOString(),
        notes: ''
      },
      {
        id: '2',
        attendanceId: 'att2',
        userId: '4',
        managerId: user?.id || '',
        type: 'late',
        reason: 'Traffic delay due to road construction',
        status: 'pending',
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        notes: ''
      },
      {
        id: '3',
        attendanceId: 'att3',
        userId: '5',
        managerId: user?.id || '',
        type: 'early-leave',
        reason: 'Medical appointment scheduled',
        status: 'pending',
        requestedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        notes: ''
      },
      {
        id: '4',
        attendanceId: 'att4',
        userId: '1',
        managerId: user?.id || '',
        type: 'break-extension',
        reason: 'Extended lunch break due to client meeting',
        status: 'approved',
        requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        notes: 'Approved due to client meeting'
      },
      {
        id: '5',
        attendanceId: 'att5',
        userId: '3',
        managerId: user?.id || '',
        type: 'overtime',
        reason: 'System maintenance required',
        status: 'rejected',
        requestedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
        notes: 'Rejected - not enough justification'
      }
    ];

    setApprovalRequests(mockRequests.filter(req => req.status === 'pending'));
    setApprovalHistory(mockRequests.filter(req => req.status !== 'pending'));

    // Mock approval statistics
    setApprovalStats({
      totalRequests: 25,
      pendingRequests: 3,
      approvedRequests: 18,
      rejectedRequests: 4,
      averageResponseTime: 2.5,
      approvalRate: 81.8,
      todayRequests: 3,
      todayApproved: 2
    });

    // Mock team members
    setTeamMembers([
      {
        userId: '1',
        name: 'John Doe',
        status: 'present',
        clockInTime: '09:00',
        currentLocation: 'Office Building A',
        isOnBreak: false,
        breakType: undefined,
        lastSeen: new Date().toISOString()
      },
      {
        userId: '2',
        name: 'Jane Smith',
        status: 'break',
        clockInTime: '08:45',
        currentLocation: 'Break Room',
        isOnBreak: true,
        breakType: 'lunch',
        lastSeen: new Date().toISOString()
      },
      {
        userId: '3',
        name: 'Mike Johnson',
        status: 'absent',
        clockInTime: undefined,
        currentLocation: undefined,
        isOnBreak: false,
        breakType: undefined,
        lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        userId: '4',
        name: 'Sarah Wilson',
        status: 'present',
        clockInTime: '08:30',
        currentLocation: 'Conference Room B',
        isOnBreak: false,
        breakType: undefined,
        lastSeen: new Date().toISOString()
      },
      {
        userId: '5',
        name: 'David Brown',
        status: 'late',
        clockInTime: '09:15',
        currentLocation: 'Office Building A',
        isOnBreak: false,
        breakType: undefined,
        lastSeen: new Date().toISOString()
      }
    ]);

    // Mock approval templates
    setApprovalTemplates([
      {
        id: '1',
        name: 'Standard Overtime',
        description: 'Standard overtime approval for project work',
        type: 'overtime',
        autoApprove: false,
        conditions: ['Project deadline', 'Manager approval required'],
        createdBy: user?.id || '',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Medical Leave',
        description: 'Automatic approval for medical appointments',
        type: 'early-leave',
        autoApprove: true,
        conditions: ['Medical appointment', 'Advance notice'],
        createdBy: user?.id || '',
        createdAt: new Date().toISOString()
      }
    ]);
  };

  /**
   * Handle refresh action
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      initializeMockData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Handle approval action
   */
  const handleApproval = async (requestId: string, approved: boolean, notes?: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedRequest = approvalRequests.find(req => req.id === requestId);
      if (!updatedRequest) return;

      const processedRequest: AttendanceApproval = {
        ...updatedRequest,
        status: approved ? 'approved' : 'rejected',
        approvedAt: new Date().toISOString(),
        notes: notes || ''
      };

      setApprovalRequests(prev => prev.filter(req => req.id !== requestId));
      setApprovalHistory(prev => [processedRequest, ...prev]);

      // Update statistics
      setApprovalStats(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests - 1,
        approvedRequests: approved ? prev.approvedRequests + 1 : prev.approvedRequests,
        rejectedRequests: approved ? prev.rejectedRequests : prev.rejectedRequests + 1,
        todayApproved: approved ? prev.todayApproved + 1 : prev.todayApproved
      }));

      setShowApprovalModal(false);
      setSelectedRequest(null);
      toast.success(`Request ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      toast.error('Failed to process approval');
    }
  };

  /**
   * Handle bulk approval action
   */
  const handleBulkApproval = async (approved: boolean) => {
    if (selectedRequests.length === 0) {
      toast.error('Please select requests first');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const requestsToProcess = approvalRequests.filter(req => 
        selectedRequests.includes(req.id)
      );

      const processedRequests: AttendanceApproval[] = requestsToProcess.map(req => ({
        ...req,
        status: approved ? 'approved' : 'rejected',
        approvedAt: new Date().toISOString(),
        notes: `Bulk ${approved ? 'approval' : 'rejection'}`
      }));

      setApprovalRequests(prev => 
        prev.filter(req => !selectedRequests.includes(req.id))
      );
      setApprovalHistory(prev => [...processedRequests, ...prev]);

      setSelectedRequests([]);
      setShowBulkActions(false);
      toast.success(`Bulk ${approved ? 'approval' : 'rejection'} completed`);
    } catch (error) {
      toast.error('Failed to process bulk action');
    }
  };

  /**
   * Handle request selection for bulk actions
   */
  const handleRequestSelection = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  /**
   * Get filtered approval requests
   */
  const getFilteredRequests = () => {
    const requests = activeTab === 'pending' ? approvalRequests : approvalHistory;
    
    return requests.filter(request => {
      const matchesSearch = 
        teamMembers.find(m => m.userId === request.userId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.reason.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || request.type === filterType;
      const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  /**
   * Get request type color
   */
  const getRequestTypeColor = (type: AttendanceApproval['type']): string => {
    switch (type) {
      case 'overtime': return 'bg-orange-100 text-orange-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'early-leave': return 'bg-blue-100 text-blue-800';
      case 'break-extension': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: AttendanceApproval['status']): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: AttendanceApproval['status']) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  /**
   * Format time difference
   */
  const formatTimeDifference = (timestamp: string): string => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Workflow</h1>
          <p className="text-gray-600 mt-1">Manage attendance approval requests</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="btn-secondary"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-lg font-semibold text-gray-900">{approvalStats.pendingRequests}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-lg font-semibold text-gray-900">{approvalStats.approvedRequests}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-lg font-semibold text-gray-900">{approvalStats.rejectedRequests}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-lg font-semibold text-gray-900">{approvalStats.approvalRate}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {[
          { key: 'pending', label: 'Pending', icon: AlertCircle, count: approvalStats.pendingRequests },
          { key: 'history', label: 'History', icon: Calendar },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 },
          { key: 'templates', label: 'Templates', icon: FileText }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="overtime">Overtime</option>
              <option value="late">Late</option>
              <option value="early-leave">Early Leave</option>
              <option value="break-extension">Break Extension</option>
            </select>
            {activeTab === 'history' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeTab === 'pending' && selectedRequests.length > 0 && (
              <button
                onClick={() => setShowBulkActions(true)}
                className="btn-primary text-sm"
              >
                Bulk Actions ({selectedRequests.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Pending Requests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {getFilteredRequests().length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending requests</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {getFilteredRequests().map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(request.id)}
                            onChange={() => handleRequestSelection(request.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRequestTypeColor(request.type)}`}>
                                {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                              </div>
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                <span className="ml-1 capitalize">{request.status}</span>
                              </div>
                            </div>
                            <p className="font-medium text-gray-900 mb-1">
                              {teamMembers.find(m => m.userId === request.userId)?.name || 'Unknown Employee'}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                            <p className="text-xs text-gray-500">
                              Requested {formatTimeDifference(request.requestedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApprovalModal(true);
                            }}
                            className="btn-primary text-sm flex items-center space-x-1"
                          >
                            <Eye size={14} />
                            <span>Review</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Approval History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {getFilteredRequests().length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No approval history</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {getFilteredRequests().map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRequestTypeColor(request.type)}`}>
                              {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                            </div>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status}</span>
                            </div>
                          </div>
                          <p className="font-medium text-gray-900 mb-1">
                            {teamMembers.find(m => m.userId === request.userId)?.name || 'Unknown Employee'}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Requested {formatTimeDifference(request.requestedAt)}</span>
                            {request.approvedAt && (
                              <span>Processed {formatTimeDifference(request.approvedAt)}</span>
                            )}
                          </div>
                          {request.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              Notes: {request.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Trends</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Approval trends chart will be displayed here</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Timer size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Response time chart will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{approvalStats.averageResponseTime}h</div>
                  <div className="text-sm text-gray-600">Average Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{approvalStats.approvalRate}%</div>
                  <div className="text-sm text-gray-600">Approval Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{approvalStats.todayRequests}</div>
                  <div className="text-sm text-gray-600">Today's Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{approvalStats.todayApproved}</div>
                  <div className="text-sm text-gray-600">Today's Approved</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Approval Templates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Approval Templates</h3>
                <button className="btn-primary text-sm">Create Template</button>
              </div>
              
              <div className="space-y-4">
                {approvalTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRequestTypeColor(template.type)}`}>
                            {template.type}
                          </span>
                          <span className={template.autoApprove ? 'text-green-600' : 'text-orange-600'}>
                            {template.autoApprove ? 'Auto-approve' : 'Manual approval'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="btn-secondary text-sm">Edit</button>
                        <button className="btn-secondary text-sm">Delete</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Request</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <p className="text-gray-900">
                    {teamMembers.find(m => m.userId === selectedRequest.userId)?.name || 'Unknown Employee'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRequestTypeColor(selectedRequest.type)}`}>
                    {selectedRequest.type.charAt(0).toUpperCase() + selectedRequest.type.slice(1)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <p className="text-gray-900">{selectedRequest.reason}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested</label>
                  <p className="text-gray-900">{formatTimeDifference(selectedRequest.requestedAt)}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApproval(selectedRequest.id, true)}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <ThumbsUp size={16} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleApproval(selectedRequest.id, false)}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <ThumbsDown size={16} />
                  <span>Reject</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Modal */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowBulkActions(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
              <p className="text-gray-600 mb-6">
                You have selected {selectedRequests.length} request(s). What would you like to do?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleBulkApproval(true)}
                  className="btn-primary flex-1"
                >
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkApproval(false)}
                  className="btn-secondary flex-1"
                >
                  Reject All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApprovalWorkflow; 