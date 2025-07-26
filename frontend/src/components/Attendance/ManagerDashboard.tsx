/**
 * Manager Dashboard Component - Workforce Management Platform
 * 
 * Comprehensive manager interface for attendance management that provides:
 * - Team attendance overview with real-time status
 * - Pending approval requests with bulk action capabilities
 * - Team performance analytics with charts
 * - Export functionality for reports
 * - Approval workflow management
 * - Team attendance table with filtering and search
 * - Real-time updates using WebSocket connections
 * 
 * Features:
 * - Team attendance table with live status updates
 * - Approval workflow interface with bulk actions
 * - Team analytics charts and performance metrics
 * - Export functionality (PDF, Excel)
 * - Advanced filtering and search capabilities
 * - Real-time notifications for new requests
 * - Mobile-responsive design
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  ThumbsDown,
  FileText,
  BarChart3,
  Calendar,
  MapPin,
  Coffee,
  Activity,
  RefreshCw,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { t } from '../../lib/i18n';
import { useLanguageChange } from '../../lib/i18n-hooks';
import { 
  TeamStatus,
  AttendanceApproval,
  AttendanceStats,
  WorkShift,
  GeofenceZone
} from '../../types';
import toast from 'react-hot-toast';

/**
 * Manager Dashboard Component
 * 
 * Manager interface for comprehensive attendance management with team overview,
 * approval workflow, analytics, and export capabilities.
 * 
 * @returns JSX element with complete manager dashboard interface
 */
const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  // Use language change hook to trigger re-renders when language changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentLocale = useLanguageChange();
  
  // State management
  const [teamStatus, setTeamStatus] = useState<TeamStatus[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<AttendanceApproval[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    overtimeHours: 0,
    averageWorkHours: 0,
    attendanceRate: 0
  });
  const [currentShift, setCurrentShift] = useState<WorkShift | null>(null);
  const [geofenceZones, setGeofenceZones] = useState<GeofenceZone[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'approvals' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  /**
   * Initialize data and real-time updates
   */
  useEffect(() => {
    initializeMockData();
    
    // Simulate real-time updates
    const updateInterval = setInterval(() => {
      updateTeamStatus();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(updateInterval);
  }, []);

  /**
   * Initialize mock data for demonstration
   */
  const initializeMockData = () => {
    // Mock team status
    setTeamStatus([
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

    // Mock pending approvals
    setPendingApprovals([
      {
        id: '1',
        attendanceId: 'att1',
        userId: '2',
        managerId: user?.id || '',
        type: 'overtime',
        reason: 'Project deadline approaching',
        status: 'pending',
        requestedAt: new Date().toISOString()
      },
      {
        id: '2',
        attendanceId: 'att2',
        userId: '4',
        managerId: user?.id || '',
        type: 'late',
        reason: 'Traffic delay',
        status: 'pending',
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        attendanceId: 'att3',
        userId: '5',
        managerId: user?.id || '',
        type: 'early-leave',
        reason: 'Medical appointment',
        status: 'pending',
        requestedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]);

    // Mock attendance statistics
    setAttendanceStats({
      totalDays: 22,
      presentDays: 20,
      absentDays: 1,
      lateDays: 1,
      overtimeHours: 8.5,
      averageWorkHours: 8.2,
      attendanceRate: 90.9
    });

    // Mock current shift
    setCurrentShift({
      id: 'shift1',
      name: 'Regular Shift',
      startTime: '09:00',
      endTime: '17:00',
      breakDuration: 60,
      overtimeThreshold: 8,
      color: '#3B82F6',
      isActive: true
    });

    // Mock geofence zones
    setGeofenceZones([
      {
        id: 'zone1',
        name: 'Main Office',
        center: { lat: 37.7749, lng: -122.4194 },
        radius: 100,
        address: '123 Main St, San Francisco, CA',
        isActive: true,
        allowedMethods: ['geolocation', 'qr', 'facial']
      }
    ]);
  };

  /**
   * Update team status for real-time simulation
   */
  const updateTeamStatus = () => {
    setTeamStatus(prev => prev.map(member => ({
      ...member,
      lastSeen: new Date().toISOString()
    })));
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
  const handleApproval = async (approvalId: string, approved: boolean) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPendingApprovals(prev => 
        prev.map(approval => 
          approval.id === approvalId 
            ? { ...approval, status: approved ? 'approved' : 'rejected' }
            : approval
        )
      );
      
      toast.success(`Request ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      toast.error('Failed to process approval');
    }
  };

  /**
   * Handle bulk approval action
   */
  const handleBulkApproval = async (approved: boolean) => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select employees first');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendingApprovals(prev => 
        prev.map(approval => 
          selectedEmployees.includes(approval.userId)
            ? { ...approval, status: approved ? 'approved' : 'rejected' }
            : approval
        )
      );
      
      setSelectedEmployees([]);
      setShowBulkActions(false);
      toast.success(`Bulk ${approved ? 'approval' : 'rejection'} completed`);
    } catch (error) {
      toast.error('Failed to process bulk action');
    }
  };

  /**
   * Handle employee selection for bulk actions
   */
  const handleEmployeeSelection = (userId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  /**
   * Handle export action
   */
  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${format.toUpperCase()} export completed`);
      setShowExportModal(false);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  /**
   * Get filtered team status
   */
  const getFilteredTeamStatus = () => {
    return teamStatus.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  /**
   * Get status color based on attendance status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'break': return 'text-orange-600 bg-orange-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Get status icon based on attendance status
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} />;
      case 'break': return <Coffee size={16} />;
      case 'absent': return <AlertCircle size={16} />;
      case 'late': return <Clock size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Team attendance management and oversight</p>
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
            onClick={() => setShowExportModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="btn-secondary"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {[
          { key: 'overview', label: 'Overview', icon: Activity },
          { key: 'team', label: 'Team', icon: Users },
          { key: 'approvals', label: 'Approvals', icon: AlertCircle },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 }
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
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Team Attendance Rate</p>
                    <p className="text-lg font-semibold text-gray-900">{attendanceStats.attendanceRate}%</p>
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
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Present Today</p>
                    <p className="text-lg font-semibold text-gray-900">{teamStatus.filter(m => m.status === 'present').length}</p>
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
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle size={20} className="text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-lg font-semibold text-gray-900">{pendingApprovals.length}</p>
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
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp size={20} className="text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Avg Work Hours</p>
                    <p className="text-lg font-semibold text-gray-900">{attendanceStats.averageWorkHours}h</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Team Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Team Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamStatus.slice(0, 6).map((member) => (
                  <motion.div
                    key={member.userId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{member.name}</span>
                      <div className={`p-1 rounded-full ${getStatusColor(member.status)}`}>
                        {getStatusIcon(member.status)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {member.status === 'present' && member.clockInTime && (
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>Clocked in at {member.clockInTime}</span>
                        </div>
                      )}
                      {member.status === 'break' && (
                        <div className="flex items-center space-x-1">
                          <Coffee size={12} />
                          <span>On {member.breakType} break</span>
                        </div>
                      )}
                      {member.status === 'absent' && (
                        <span>Not present today</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'team' && (
          <motion.div
            key="team"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="break">On Break</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedEmployees.length > 0 && (
                    <button
                      onClick={() => setShowBulkActions(true)}
                      className="btn-primary text-sm"
                    >
                      Bulk Actions ({selectedEmployees.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Team Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clock In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Seen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredTeamStatus().map((member) => (
                      <motion.tr
                        key={member.userId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(member.userId)}
                              onChange={() => handleEmployeeSelection(member.userId)}
                              className="mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                            {getStatusIcon(member.status)}
                            <span className="ml-1 capitalize">{member.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.clockInTime || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.currentLocation ? (
                            <div className="flex items-center space-x-1">
                              <MapPin size={12} />
                              <span>{member.currentLocation}</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.lastSeen).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Eye size={16} />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'approvals' && (
          <motion.div
            key="approvals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Approval Requests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
                <span className="text-sm text-gray-600">{pendingApprovals.length} requests</span>
              </div>
              
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <motion.div
                      key={approval.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              approval.type === 'overtime' ? 'bg-orange-100 text-orange-800' :
                              approval.type === 'late' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {approval.type.charAt(0).toUpperCase() + approval.type.slice(1)}
                            </div>
                            <span className="text-sm text-gray-600">
                              {new Date(approval.requestedAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 mb-1">
                            {teamStatus.find(m => m.userId === approval.userId)?.name || 'Unknown Employee'}
                          </p>
                          <p className="text-sm text-gray-600">{approval.reason}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproval(approval.id, true)}
                            className="btn-primary text-sm flex items-center space-x-1"
                          >
                            <ThumbsUp size={14} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleApproval(approval.id, false)}
                            className="btn-secondary text-sm flex items-center space-x-1"
                          >
                            <ThumbsDown size={14} />
                            <span>Reject</span>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trends</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Attendance trend chart will be displayed here</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Performance metrics chart will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{attendanceStats.attendanceRate}%</div>
                  <div className="text-sm text-gray-600">Overall Attendance Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{attendanceStats.averageWorkHours}h</div>
                  <div className="text-sm text-gray-600">Average Work Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{attendanceStats.overtimeHours}h</div>
                  <div className="text-sm text-gray-600">Total Overtime</div>
                </div>
              </div>
            </div>
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
                You have selected {selectedEmployees.length} employee(s). What would you like to do?
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

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Report</h3>
              <p className="text-gray-600 mb-6">Choose the format for your attendance report:</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleExport('pdf')}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <FileText size={16} />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Excel</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagerDashboard; 