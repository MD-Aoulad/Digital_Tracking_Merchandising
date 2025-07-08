import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  FileText,
  Users,
  MessageSquare,
  ClipboardList,
  Map,
  FileSignature,
  BarChart3,
  Settings,
  UserCheck,
  Mail,
  Bot
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  permission: string;
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { hasPermission } = useAuth();

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      permission: 'dashboard:view'
    },
    {
      title: 'Attendance',
      path: '/attendance',
      icon: <Clock size={20} />,
      permission: 'attendance:view'
    },
    {
      title: 'Schedule',
      path: '/schedule',
      icon: <Calendar size={20} />,
      permission: 'schedule:view'
    },
    {
      title: 'Leave Management',
      path: '/leave',
      icon: <FileText size={20} />,
      permission: 'leave:view'
    },
    {
      title: 'Tasks',
      path: '/tasks',
      icon: <ClipboardList size={20} />,
      permission: 'tasks:view'
    },
    {
      title: 'Chat',
      path: '/chat',
      icon: <MessageSquare size={20} />,
      permission: 'chat:view',
      badge: 3
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: <BarChart3 size={20} />,
      permission: 'reports:view'
    },
    {
      title: 'Journey Plan',
      path: '/journey',
      icon: <Map size={20} />,
      permission: 'attendance:view'
    },
    {
      title: 'Documents',
      path: '/documents',
      icon: <FileSignature size={20} />,
      permission: 'documents:view'
    },
    {
      title: 'Surveys',
      path: '/surveys',
      icon: <Mail size={20} />,
      permission: 'surveys:view'
    },
    {
      title: 'AI Assistant',
      path: '/ai-assistant',
      icon: <Bot size={20} />,
      permission: 'chat:view'
    }
  ];

  const adminItems: MenuItem[] = [
    {
      title: 'User Management',
      path: '/users',
      icon: <Users size={20} />,
      permission: 'users:manage'
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <Settings size={20} />,
      permission: 'settings:manage'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));
  const filteredAdminItems = adminItems.filter(item => hasPermission(item.permission));

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`fixed left-0 top-0 h-full w-70 bg-white border-r border-gray-200 z-50 lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">WM</span>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-bold text-gray-900">Workforce</h1>
                <p className="text-xs text-gray-500">Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Main Menu */}
            <div className="space-y-1">
              {filteredMenuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Admin Section */}
            {filteredAdminItems.length > 0 && (
              <>
                <div className="pt-6 pb-2">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administration
                  </h3>
                </div>
                <div className="space-y-1">
                  {filteredAdminItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="flex-1">{item.title}</span>
                    </NavLink>
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <UserCheck size={16} className="text-white" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">Workforce Manager</p>
                <p className="text-xs text-gray-500">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar; 