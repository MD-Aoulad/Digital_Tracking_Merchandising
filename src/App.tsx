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
 * - Real authentication with protected routes
 * - Loading states and error handling
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
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
  ClipboardList
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
import Login from './pages/Login';

// Import type definitions
import { UserRole, MemberRole } from './types';

// Import AuthProvider and useAuth
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { t } from './lib/i18n';
import { useLanguageChange } from './lib/i18n-hooks';
import LanguageSelector from './components/LanguageSelector';
import SessionTimeoutWarning from './components/common/SessionTimeoutWarning';

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
 * Protected Route Component
 * Wraps routes that require authentication
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: UserRole }> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

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
  // This will trigger re-renders when language changes
  useLanguageChange();
  
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
        </div>
      </div>
    </nav>
  );
}

/**
 * Main App Layout Component
 * Handles the authenticated user interface
 */
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const handleLogoClick = () => {
    navigate('/'); // Navigate to dashboard (home page)
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Session Timeout Warning */}
      <SessionTimeoutWarning />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-900">Navigation</h1>
          </div>
          <button
            onClick={handleSidebarToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <Navigation
          currentUser={user}
          sidebarOpen={sidebarOpen}
          handleSidebarToggle={handleSidebarToggle}
          handleLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 bg-white shadow-sm px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSidebarToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Single Logo - Clickable for navigation */}
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">WM</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Workforce</h1>
                <p className="text-xs text-gray-500 leading-tight">Management</p>
              </div>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <LanguageSelector />
            
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Search */}
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors border border-red-200 hover:border-red-300"
                aria-label="Logout"
              >
                <LogOut size={16} />
                <span className="hidden sm:block text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            } />
            <Route path="/leave" element={
              <ProtectedRoute>
                <LeavePage />
              </ProtectedRoute>
            } />
            <Route path="/grant-leave" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <GrantLeavePage />
              </ProtectedRoute>
            } />
            <Route path="/journey" element={
              <ProtectedRoute>
                <JourneyPlanPage />
              </ProtectedRoute>
            } />
            <Route path="/journey/settings" element={
              <ProtectedRoute>
                <JourneyPlanSettings />
              </ProtectedRoute>
            } />
            <Route path="/todo" element={
              <ProtectedRoute>
                <TodoPage userRole={user?.role || UserRole.VIEWER} />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <ReportPage />
              </ProtectedRoute>
            } />
            <Route path="/members" element={
              <ProtectedRoute>
                <MembersPage userRole={user?.role || UserRole.VIEWER} />
              </ProtectedRoute>
            } />
            <Route path="/groups" element={
              <ProtectedRoute>
                <GroupPage />
              </ProtectedRoute>
            } />
            <Route path="/workplace" element={
              <ProtectedRoute>
                <WorkplacePage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminTab currentUserRole={user?.role === UserRole.ADMIN ? MemberRole.ADMIN : 
                                          user?.role === UserRole.EDITOR ? MemberRole.LEADER : 
                                          MemberRole.EMPLOYEE} />
              </ProtectedRoute>
            } />
            <Route path="/posting-board" element={
              <ProtectedRoute>
                <PostingBoardPage userRole={user?.role || UserRole.VIEWER} />
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                  <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
                  <Link to="/" className="text-primary-600 hover:text-primary-700">
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            } />
            <Route path="*" element={<ComingSoonPage feature="coming soon" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/**
 * Main App component
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
