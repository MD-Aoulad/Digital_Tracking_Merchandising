/**
 * Dashboard Page Component - Workforce Management Platform
 * 
 * Main dashboard that provides:
 * - Key performance indicators and statistics
 * - Quick action buttons for common tasks
 * - Recent activity feed
 * - Performance overview with visual metrics
 * - Responsive grid layout with animations
 * 
 * Features:
 * - Real-time statistics display
 * - Animated cards using Framer Motion
 * - Interactive quick actions
 * - Activity timeline with status indicators
 * - Performance metrics visualization
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  Calendar,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardStats } from '../types';
import JourneyPlanManagement from '../components/Journey/JourneyPlanManagement';

/**
 * Dashboard Component
 * 
 * Main dashboard page that displays key metrics, quick actions, and recent activity.
 * Provides an overview of workforce management data and quick access to common functions.
 * 
 * @returns JSX element with complete dashboard interface
 */
const Dashboard: React.FC = () => {
  const { user } = useAuth();

  /**
   * Mock dashboard statistics data
   * In production, this would be fetched from an API
   */
  const stats: DashboardStats = {
    totalEmployees: 156,
    presentToday: 142,
    onLeave: 8,
    pendingTasks: 23,
    completedTasks: 89,
    activeReports: 12
  };

  /**
   * Recent activity data for the activity feed
   */
  const recentActivities = [
    {
      id: 1,
      type: 'attendance',
      message: 'John Doe clocked in',
      time: '2 minutes ago',
      status: 'success' as const
    },
    {
      id: 2,
      type: 'task',
      message: 'New task assigned to Marketing team',
      time: '15 minutes ago',
      status: 'info' as const
    },
    {
      id: 3,
      type: 'leave',
      message: 'Sarah Wilson requested leave',
      time: '1 hour ago',
      status: 'warning' as const
    },
    {
      id: 4,
      type: 'report',
      message: 'Monthly attendance report generated',
      time: '2 hours ago',
      status: 'success' as const
    }
  ];

  /**
   * Quick action buttons for common tasks
   */
  const quickActions = [
    {
      title: 'Clock In/Out',
      description: 'Record your attendance',
      icon: <Clock size={24} />,
      color: 'bg-blue-500',
      href: '/attendance'
    },
    {
      title: 'Request Leave',
      description: 'Submit leave application',
      icon: <Calendar size={24} />,
      color: 'bg-green-500',
      href: '/leave'
    },
    {
      title: 'View Tasks',
      description: 'Check your assignments',
      icon: <FileText size={24} />,
      color: 'bg-purple-500',
      href: '/tasks'
    },
    {
      title: 'To-Do Management',
      description: 'Assign and track tasks',
      icon: <ClipboardList size={24} />,
      color: 'bg-indigo-500',
      href: '/todo'
    },
    {
      title: 'Team Chat',
      description: 'Connect with colleagues',
      icon: <Users size={24} />,
      color: 'bg-orange-500',
      href: '/chat'
    }
  ];

  /**
   * StatCard Component
   * 
   * Displays a single statistic with icon, value, and optional change indicator
   * 
   * @param title - Statistic title
   * @param value - Statistic value
   * @param change - Percentage change from previous period
   * @param icon - Icon to display
   * @param color - Background color for icon
   */
  const StatCard: React.FC<{
    title: string;
    value: number;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <ArrowUpRight size={16} className="text-green-500" />
              ) : (
                <ArrowDownRight size={16} className="text-red-500" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </motion.div>
  );

  /**
   * ActivityItem Component
   * 
   * Displays a single activity item with status icon and timestamp
   * 
   * @param type - Activity type
   * @param message - Activity message
   * @param time - Time of activity
   * @param status - Activity status (success, info, warning, error)
   */
  const ActivityItem: React.FC<{
    type: string;
    message: string;
    time: string;
    status: 'success' | 'info' | 'warning' | 'error';
  }> = ({ type, message, time, status }) => {
    /**
     * Get appropriate status icon based on activity status
     */
    const getStatusIcon = () => {
      switch (status) {
        case 'success':
          return <CheckCircle size={16} className="text-green-500" />;
        case 'warning':
          return <AlertCircle size={16} className="text-yellow-500" />;
        case 'error':
          return <AlertCircle size={16} className="text-red-500" />;
        default:
          return <TrendingUp size={16} className="text-blue-500" />;
      }
    };

    return (
      <div className="flex items-center space-x-3 py-3">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{message}</p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.name}! Here's what's happening today.
        </p>
      </div>

      {/* Statistics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          change={5.2}
          icon={<Users size={24} />}
          color="bg-blue-500"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          change={-2.1}
          icon={<CheckCircle size={24} />}
          color="bg-green-500"
        />
        <StatCard
          title="On Leave"
          value={stats.onLeave}
          change={12.5}
          icon={<Calendar size={24} />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          change={-8.3}
          icon={<FileText size={24} />}
          color="bg-purple-500"
        />
      </div>

      {/* Quick actions and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.a
                  key={index}
                  href={action.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                    <div className="text-white">{action.icon}</div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent activity panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </button>
            </div>
            <div className="space-y-1">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <ActivityItem
                    type={activity.type}
                    message={activity.message}
                    time={activity.time}
                    status={activity.status}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance overview section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            <p className="text-sm text-gray-600">Tasks Completed</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={32} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">94.2%</p>
            <p className="text-sm text-gray-600">Attendance Rate</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText size={32} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeReports}</p>
            <p className="text-sm text-gray-600">Active Reports</p>
          </div>
        </div>
      </motion.div>

      {/* Journey Plans Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <JourneyPlanManagement />
      </motion.div>
    </div>
  );
};

export default Dashboard;
