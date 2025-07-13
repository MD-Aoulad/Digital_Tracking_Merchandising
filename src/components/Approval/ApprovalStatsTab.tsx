/**
 * Approval Statistics Tab Component
 * 
 * Displays comprehensive approval statistics and metrics:
 * - Request counts by status and type
 * - Average approval times
 * - Top approvers performance
 * - Recent activity
 * - Approval trends and analytics
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ApprovalStats, 
  ApprovalRequestType,
  ApprovalStatus 
} from '../../types';

interface ApprovalStatsTabProps {
  stats: ApprovalStats | null;
}

const ApprovalStatsTab: React.FC<ApprovalStatsTabProps> = ({ stats }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedView, setSelectedView] = useState('overview');

  const periods = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: '1y', label: 'Last Year' }
  ];

  const views = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'performance', label: 'Performance', icon: '📈' },
    { id: 'trends', label: 'Trends', icon: '📉' },
    { id: 'activity', label: 'Recent Activity', icon: '🕒' }
  ];

  const loadStats = async () => {
    if (!stats) return;
    
    try {
      setIsLoading(true);
      // Additional stats loading logic can be added here
    } catch (error) {
      console.error('Error loading additional stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    } else if (hours < 24) {
      return `${Math.round(hours)} hours`;
    } else {
      const days = Math.round(hours / 24);
      return `${days} days`;
    }
  };

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.PENDING:
        return 'text-yellow-600 bg-yellow-100';
      case ApprovalStatus.IN_REVIEW:
        return 'text-blue-600 bg-blue-100';
      case ApprovalStatus.APPROVED:
        return 'text-green-600 bg-green-100';
      case ApprovalStatus.REJECTED:
        return 'text-red-600 bg-red-100';
      case ApprovalStatus.CANCELLED:
        return 'text-gray-600 bg-gray-100';
      case ApprovalStatus.EXPIRED:
        return 'text-orange-600 bg-orange-100';
      case ApprovalStatus.DELEGATED:
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: ApprovalRequestType) => {
    const colors = [
      'text-blue-600 bg-blue-100',
      'text-green-600 bg-green-100',
      'text-purple-600 bg-purple-100',
      'text-orange-600 bg-orange-100',
      'text-red-600 bg-red-100',
      'text-indigo-600 bg-indigo-100',
      'text-pink-600 bg-pink-100',
      'text-yellow-600 bg-yellow-100'
    ];
    const index = Object.values(ApprovalRequestType).indexOf(type);
    return colors[index % colors.length];
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalRequests || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingRequests || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.approvedRequests || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.rejectedRequests || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Average Approval Time */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Average Approval Time</h3>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">
            {formatTime(stats?.averageApprovalTime || 0)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Average time from submission to approval/rejection
          </p>
        </div>
      </div>

      {/* Requests by Type */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Requests by Type</h3>
        <div className="space-y-3">
          {stats?.requestsByType.map((typeStats) => (
            <div key={typeStats.type} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(typeStats.type)}`}>
                  {typeStats.type.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-600">
                  {typeStats.approved} approved, {typeStats.rejected} rejected
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {typeStats.count} total
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Requests by Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Requests by Status</h3>
        <div className="space-y-3">
          {stats?.requestsByStatus.map((statusStats) => (
            <div key={statusStats.status} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(statusStats.status)}`}>
                  {statusStats.status.replace('_', ' ')}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {statusStats.count} requests
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* Top Approvers */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Approvers</h3>
        <div className="space-y-4">
          {stats?.topApprovers.map((approver, index) => (
            <div key={approver.approverId} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{approver.approverName}</p>
                  <p className="text-xs text-gray-600">
                    {approver.approvedCount} approvals • {formatTime(approver.averageTime)} avg
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{approver.approvedCount}</p>
                <p className="text-xs text-gray-600">approvals</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Rate</h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {stats ? Math.round((stats.approvedRequests / stats.totalRequests) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {stats?.approvedRequests || 0} of {stats?.totalRequests || 0} requests approved
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rejection Rate</h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">
              {stats ? Math.round((stats.rejectedRequests / stats.totalRequests) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {stats?.rejectedRequests || 0} of {stats?.totalRequests || 0} requests rejected
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Trends</h3>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📈</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Trend Analysis</h3>
          <p className="text-gray-600">
            Detailed trend analysis and charts will be implemented here.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Volume Trends</h3>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Volume Analysis</h3>
          <p className="text-gray-600">
            Request volume trends and patterns will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {stats?.recentActivity.map((activity) => (
            <div key={activity.requestId} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📋</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.action} - {activity.requestTitle}
                </p>
                <p className="text-sm text-gray-600">
                  by {activity.approverName} • {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {stats?.recentActivity.filter(a => a.action === 'approved').length || 0}
            </p>
            <p className="text-sm text-gray-600">Approvals Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {stats?.recentActivity.filter(a => a.action === 'rejected').length || 0}
            </p>
            <p className="text-sm text-gray-600">Rejections Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {stats?.recentActivity.filter(a => a.action === 'submitted').length || 0}
            </p>
            <p className="text-sm text-gray-600">New Requests Today</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedView) {
      case 'overview':
        return renderOverview();
      case 'performance':
        return renderPerformance();
      case 'trends':
        return renderTrends();
      case 'activity':
        return renderActivity();
      default:
        return renderOverview();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Statistics</h2>
          <p className="text-gray-600">
            Comprehensive analytics and metrics for approval processes
          </p>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedView === view.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{view.icon}</span>
                <span>{view.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Export Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Reports</h3>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            📊 Export to Excel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            📄 Export to PDF
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            📈 Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalStatsTab; 