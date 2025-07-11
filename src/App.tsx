/**
 * Workforce Management Platform - Main Application Component
 * 
 * This is the root component of the workforce management platform inspired by Shoplworks.
 * It handles routing, navigation, and the overall application structure.
 * 
 * Features:
 * - Role-based routing and access control
 * - Responsive sidebar navigation
 * - Protected routes for admin-only features
 * - Integration with all major platform modules
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
  Building2,
  MapPin,
  CheckSquare,
  Route as RouteIcon,
  Shield,
  BarChart3,
  MessageSquare,
  FileSpreadsheet,
  ClipboardList,
  HelpCircle,
  Zap
} from 'lucide-react';

// Import all page components
import DashboardPage from './components/Dashboard/DashboardPage';
import AttendancePage from './components/Attendance/AttendancePage';
import SchedulePage from './components/Schedule/SchedulePage';
import LeavePage from './components/Leave/LeavePage';
import GrantLeavePage from './components/Leave/GrantLeavePage';
import JourneyPlanPage from './components/Journey/JourneyPlanPage';
import JourneyPlanSettings from './components/Journey/JourneyPlanSettings';
import TodoPage from './components/Todo/TodoPage';
import MembersPage from './components/Members/MembersPage';
import SettingsPage from './components/Settings/SettingsPage';
import AdminTab from './components/Admin/AdminTab';
import WorkplacePage from './components/Workplace/WorkplacePage';
import GroupPage from './components/Groups/GroupPage';
import PostingBoardPage from './components/PostingBoard/PostingBoardPage';
import ReportPage from './components/Report/ReportPage';
import ComingSoonPage from './components/ComingSoonPage';

// Import type definitions
import { UserRole, MemberRole } from './types';

// Import AuthProvider
import { AuthProvider } from './contexts/AuthContext';
import { t } from './lib/i18n';
import { useLanguageChange } from './lib/i18n-hooks';
import LanguageSelector from './components/LanguageSelector';

/**
 * Navigation item interface for sidebar menu
 */
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current: boolean;
  badge?: string;
  children?: NavItem[];
}

/**
 * Navigation component that handles the sidebar
 */
function Navigation({ currentUser, sidebarOpen, handleSidebarToggle, handleLogout }: {
  currentUser: any;
  sidebarOpen: boolean;
  handleSidebarToggle: () => void;
  handleLogout: () => void;
}) {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentLocale = useLanguageChange(); // This will trigger re-renders when language changes
  
  /**
   * Navigation items configuration
   * Items are filtered based on user role for proper access control
   * Navigation will be recreated when language changes
   */
  const navigation: NavItem[] = [
    // Main dashboard - accessible to all users
    {
      name: t('nav.dashboard'),
      href: '/',
      icon: LayoutDashboard,
      current: location.pathname === '/'
    },
    // Attendance management - core feature for all employees
    {
      name: t('nav.attendance'),
      href: '/attendance',
      icon: Clock,
      current: location.pathname === '/attendance'
    },
    // Schedule management - managers and admins
    {
      name: t('nav.schedule'),
      href: '/schedule',
      icon: Calendar,
      current: location.pathname === '/schedule'
    },
    // Leave management - all users can view, admins can manage
    {
      name: t('nav.leave'),
      href: '/leave',
      icon: FileText,
      current: location.pathname === '/leave'
    },
    // Grant leave - admin only feature
    ...(currentUser?.role === UserRole.ADMIN ? [{
      name: t('nav.grantLeave'),
      href: '/grant-leave',
      icon: CheckSquare,
      current: location.pathname === '/grant-leave'
    }] : []),
    // Journey planning - for field workers and managers
    {
      name: t('nav.journey'),
      href: '/journey',
      icon: RouteIcon,
      current: location.pathname === '/journey'
    },
    // To-do tasks - all users
    {
      name: t('nav.tasks'),
      href: '/todo',
      icon: ClipboardList,
      current: location.pathname === '/todo'
    },
    // Reports - admin only (as per retail manager requirements)
    ...(currentUser?.role === UserRole.ADMIN ? [{
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      current: location.pathname === '/reports'
    }] : []),
    // Member management - admin and leaders
    {
      name: t('nav.members'),
      href: '/members',
      icon: Users,
      current: location.pathname === '/members'
    },
    // Group management - organizational structure
    {
      name: t('nav.groups'),
      href: '/groups',
      icon: Building2,
      current: location.pathname === '/groups'
    },
    // Workplace management - location configuration
    {
      name: t('nav.workplaces'),
      href: '/workplace',
      icon: MapPin,
      current: location.pathname === '/workplace'
    },
    // Settings - admin only
    ...(currentUser?.role === UserRole.ADMIN ? [{
      name: t('nav.settings'),
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings'
    }] : []),
    // Admin panel - admin only
    ...(currentUser?.role === UserRole.ADMIN ? [{
      name: t('nav.admin'),
      href: '/admin',
      icon: Shield,
      current: location.pathname === '/admin'
    }] : [])
  ];

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
              item.current
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 flex-shrink-0 ${
                item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            {item.name}
            {item.badge && (
              <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
      
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700">
              {currentUser?.name || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500">
              {currentUser?.role || 'No Role'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

/**
 * Main App component
 */
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser] = useState({
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN
  });

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout clicked');
  };

  return (
    <AuthProvider>
      <Router>
        <div className="h-screen flex overflow-hidden bg-gray-100">
          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:static lg:inset-0`}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900">
                Workforce Management
              </h1>
              <button
                onClick={handleSidebarToggle}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <Navigation
              currentUser={currentUser}
              sidebarOpen={sidebarOpen}
              handleSidebarToggle={handleSidebarToggle}
              handleLogout={handleLogout}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between h-16 bg-white shadow-sm px-4 lg:px-6">
              <button
                onClick={handleSidebarToggle}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex-1 flex items-center justify-center lg:justify-end space-x-4">
                <LanguageSelector />
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Bell className="h-6 w-6" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Search className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/leave" element={<LeavePage />} />
                <Route path="/grant-leave" element={<GrantLeavePage />} />
                <Route path="/journey" element={<JourneyPlanPage />} />
                <Route path="/journey/settings" element={<JourneyPlanSettings />} />
                <Route path="/todo" element={<TodoPage userRole={currentUser.role} />} />
                <Route path="/reports" element={<ReportPage />} />
                <Route path="/members" element={<MembersPage userRole={currentUser.role} />} />
                <Route path="/groups" element={<GroupPage />} />
                <Route path="/workplace" element={<WorkplacePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminTab currentUserRole={currentUser.role as any} />} />
                <Route path="/posting-board" element={<PostingBoardPage userRole={currentUser.role} />} />
                <Route path="*" element={<ComingSoonPage feature="coming soon" />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
