/**
 * Dashboard Page Component
 * 
 * Main dashboard view for the workforce management platform.
 * Provides overview of key metrics, quick actions, and recent activity.
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  CheckSquare, 
  Plus,
  Download,
  Bell
} from 'lucide-react';
import { t } from '../../lib/i18n';
import { useLanguageChange } from '../../lib/i18n-hooks';
import SessionTimeoutTest from '../common/SessionTimeoutTest';
import AuthDebug from '../common/AuthDebug';

/**
 * Dashboard Page Component
 * 
 * Displays:
 * - Key performance metrics
 * - Quick action buttons
 * - Recent activity feed
 * - System status indicators
 */
const DashboardPage: React.FC = () => {
  // Use language change hook to trigger re-renders when language changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentLocale = useLanguageChange();
  
  // Mock data - in real app this would come from API
  const stats = [
    {
      name: t('dashboard.totalEmployees'),
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: Users
    },
    {
      name: t('dashboard.presentToday'),
      value: '142',
      change: '+5%',
      changeType: 'positive',
      icon: Clock
    },
    {
      name: t('dashboard.onLeave'),
      value: '8',
      change: '-2%',
      changeType: 'negative',
      icon: Calendar
    },
    {
      name: t('dashboard.tasksCompleted'),
      value: '89',
      change: '+18%',
      changeType: 'positive',
      icon: CheckSquare
    }
  ];

  const quickActions = [
    {
      name: t('dashboard.addEmployee'),
      description: t('dashboard.registerNewMember'),
      icon: Plus,
      href: '/members',
      color: 'bg-blue-500'
    },
    {
      name: t('dashboard.exportReport'),
      description: t('dashboard.downloadAttendanceData'),
      icon: Download,
      href: '/reports',
      color: 'bg-green-500'
    },
    {
      name: t('dashboard.sendNotification'),
      description: t('dashboard.notifyTeamMembers'),
      icon: Bell,
      href: '/notifications',
      color: 'bg-purple-500'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'John Doe',
      action: 'clocked in',
      time: '2 minutes ago',
      type: 'attendance'
    },
    {
      id: 2,
      user: 'Jane Smith',
      action: 'submitted leave request',
      time: '15 minutes ago',
      type: 'leave'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'completed task',
      time: '1 hour ago',
      type: 'task'
    },
    {
      id: 4,
      user: 'Sarah Wilson',
      action: 'updated schedule',
      time: '2 hours ago',
      type: 'schedule'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-600 mt-1">{t('dashboard.welcomeBack')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <span className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.quickActions')}</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.name}
                className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-gray-900">{action.name}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.recentActivity')}</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-gray-500"> {activity.action}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status and Session Test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-green-400"></div>
              <span className="text-sm text-gray-700">Attendance System</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-green-400"></div>
              <span className="text-sm text-gray-700">Database</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
              <span className="text-sm text-gray-700">API Services</span>
            </div>
          </div>
        </div>

        {/* Session Timeout Test */}
        <SessionTimeoutTest />
      </div>

      {/* Authentication Debug */}
      <div className="mt-6">
        <AuthDebug />
      </div>
    </div>
  );
};

export default DashboardPage; 