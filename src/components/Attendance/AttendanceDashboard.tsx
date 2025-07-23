/**
 * Attendance Dashboard Component - Workforce Management Platform
 * 
 * Comprehensive attendance dashboard that provides:
 * - Real-time attendance status and statistics
 * - Team attendance overview with live updates
 * - Quick action buttons for common tasks
 * - Notification center for pending approvals
 * - Settings panel for attendance configuration
 * - Mobile-responsive design with touch interactions
 * 
 * Features:
 * - Real-time clock display
 * - Attendance status cards with animations
 * - Team overview with live status updates
 * - Quick action buttons (clock in/out, break management)
 * - Notification center for pending approvals
 * - Settings panel for attendance configuration
 * - WebSocket integration for real-time updates
 * - Mobile-optimized interface
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Coffee,
  Settings,
  Bell,
  MapPin,
  Calendar,
  TrendingUp,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { t } from '../../lib/i18n';
import { useLanguageChange } from '../../lib/i18n-hooks';
import { 
  AttendanceRecord, 
  AttendanceStats, 
  TeamStatus,
  AttendanceApproval,
  WorkShift,
  GeofenceZone
} from '../../types';
import toast from 'react-hot-toast';

/**
 * Attendance Dashboard Component
 * 
 * Main dashboard interface for attendance management with real-time updates
 * and comprehensive team overview.
 * 
 * @returns JSX element with complete attendance dashboard interface
 */
const AttendanceDashboard: React.FC = () => {
  const { user } = useAuth();
  // Use language change hook to trigger re-renders when language changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentLocale = useLanguageChange();
  
  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentStatus, setCurrentStatus] = useState<'in' | 'out' | 'break'>('out');
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    overtimeHours: 0,
    averageWorkHours: 0,
    attendanceRate: 0
  });
  const [teamStatus, setTeamStatus] = useState<TeamStatus[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<AttendanceApproval[]>([]);
  const [currentShift, setCurrentShift] = useState<WorkShift | null>(null);
  const [geofenceZones, setGeofenceZones] = useState<GeofenceZone[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'approvals'>('overview');

  /**
   * Initialize real-time clock and data
   */
  useEffect(() => {
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Initialize mock data
    initializeMockData();

    // Simulate WebSocket connection
    const connectionInterval = setInterval(() => {
      setIsOnline(Math.random() > 0.1); // 90% uptime simulation
    }, 5000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(connectionInterval);
    };
  }, []);

  /**
   * Initialize mock data for demonstration
   */
  const initializeMockData = () => {
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
      }
    ]);

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
   * Handle quick action button clicks
   */
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'clock-in':
        toast.success('Redirecting to clock in...');
        // Navigate to clock in page
        break;
      case 'clock-out':
        toast.success('Redirecting to clock out...');
        // Navigate to clock out page
        break;
      case 'break':
        toast.success('Redirecting to break management...');
        // Navigate to break management
        break;
      case 'reports':
        toast.success('Redirecting to reports...');
        // Navigate to reports
        break;
      default:
        break;
    }
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

  /**
   * Format time for display
   */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  /**
   * Format date for display
   */
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with real-time clock and connection status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 font-mono">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-600">
                {formatDate(currentTime)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi size={16} className="text-green-600" />
              ) : (
                <WifiOff size={16} className="text-red-600" />
              )}
              <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-secondary relative"
            >
              <Bell size={16} />
              {pendingApprovals.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn-secondary"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {[
          { key: 'overview', label: 'Overview', icon: Activity },
          { key: 'team', label: 'Team', icon: Users },
          { key: 'approvals', label: 'Approvals', icon: AlertCircle }
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
                    <p className="text-sm font-medium text-gray-600">{t('attendance.attendanceRate')}</p>
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
                    <Clock size={20} className="text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('attendance.avgWorkHours')}</p>
                    <p className="text-lg font-semibold text-gray-900">{attendanceStats.averageWorkHours}h</p>
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
                    <TrendingUp size={20} className="text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('attendance.overtimeHours')}</p>
                    <p className="text-lg font-semibold text-gray-900">{attendanceStats.overtimeHours}h</p>
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
                    <Users size={20} className="text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('attendance.presentToday')}</p>
                    <p className="text-lg font-semibold text-gray-900">{attendanceStats.presentDays}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { action: 'clock-in', label: 'Clock In', icon: CheckCircle, color: 'bg-green-500' },
                  { action: 'clock-out', label: 'Clock Out', icon: AlertCircle, color: 'bg-red-500' },
                  { action: 'break', label: 'Break', icon: Coffee, color: 'bg-orange-500' },
                  { action: 'reports', label: 'Reports', icon: TrendingUp, color: 'bg-blue-500' }
                ].map((item) => (
                  <motion.button
                    key={item.action}
                    onClick={() => handleQuickAction(item.action)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className={`p-3 rounded-full ${item.color} mb-2`}>
                      <item.icon size={24} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Current Shift Information */}
            {currentShift && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Shift</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Shift Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {currentShift.startTime} - {currentShift.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Coffee size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Break Duration</p>
                      <p className="text-lg font-semibold text-gray-900">{currentShift.breakDuration} min</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TrendingUp size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overtime Threshold</p>
                      <p className="text-lg font-semibold text-gray-900">{currentShift.overtimeThreshold}h</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            {/* Team Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Status</h3>
              <div className="space-y-4">
                {teamStatus.map((member) => (
                  <motion.div
                    key={member.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(member.status)}`}>
                        {getStatusIcon(member.status)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">
                          {member.status === 'present' && member.clockInTime && `Clocked in at ${member.clockInTime}`}
                          {member.status === 'break' && `On ${member.breakType} break`}
                          {member.status === 'absent' && 'Not present today'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {member.currentLocation && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <MapPin size={14} />
                          <span>{member.currentLocation}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Last seen: {new Date(member.lastSeen).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
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
            {/* Pending Approvals */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
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
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {approval.type.charAt(0).toUpperCase() + approval.type.slice(1)} Request
                        </p>
                        <p className="text-sm text-gray-600">{approval.reason}</p>
                        <p className="text-xs text-gray-500">
                          Requested: {new Date(approval.requestedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="btn-primary text-sm">Approve</button>
                        <button className="btn-secondary text-sm">Reject</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="p-3 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {approval.type.charAt(0).toUpperCase() + approval.type.slice(1)} Request
                    </p>
                    <p className="text-sm text-gray-600">{approval.reason}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Real-time updates</span>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    Enabled
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Geofencing</span>
                  <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">
                    Disabled
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Photo verification</span>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    Enabled
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceDashboard; 