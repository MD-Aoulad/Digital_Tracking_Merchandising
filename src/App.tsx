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
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ComingSoonPage from './components/ComingSoonPage';

// Import type definitions
import { UserRole, MemberRole } from './types';

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
 * Main Application Component
 * 
 * Handles the overall application structure including:
 * - Sidebar navigation with role-based visibility
 * - Main content area with routing
 * - Top navigation bar with user controls
 * - Responsive design for mobile and desktop
 */
function App() {
  // State for sidebar visibility (mobile responsive)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Mock user data - in real app this would come from authentication context
  const currentUser = {
    name: 'Admin User',
    email: 'admin@company.com',
    role: UserRole.ADMIN,
    avatar: null
  };

  /**
   * Navigation items configuration
   * Items are filtered based on user role for proper access control
   */
  const navigation: NavItem[] = [
    // Main dashboard - accessible to all users
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      current: true
    },
    // Attendance management - core feature for all employees
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Clock,
      current: false
    },
    // Schedule management - managers and admins
    {
      name: 'Schedule',
      href: '/schedule',
      icon: Calendar,
      current: false
    },
    // Leave management - all users can view, admins can manage
    {
      name: 'Leave',
      href: '/leave',
      icon: FileText,
      current: false
    },
    // Grant leave - admin only feature
    {
      name: 'Grant Leave',
      href: '/grant-leave',
      icon: FileSpreadsheet,
      current: false
    },
    // Journey planning - for field workers and managers
    {
      name: 'Journey Plan',
      href: '/journey',
      icon: RouteIcon,
      current: false
    },
    // To-do tasks - all users
    {
      name: 'To-Do',
      href: '/todo',
      icon: CheckSquare,
      current: false
    },
    // Member management - admin and leaders
    {
      name: 'Members',
      href: '/members',
      icon: Users,
      current: false
    },
    // Group management - organizational structure
    {
      name: 'Groups',
      href: '/groups',
      icon: Building2,
      current: false
    },
    // Workplace management - location configuration
    {
      name: 'Workplaces',
      href: '/workplaces',
      icon: MapPin,
      current: false
    },
    // Settings - admin only
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: false
    },
    // Admin panel - admin only
    {
      name: 'Admin',
      href: '/admin',
      icon: Shield,
      current: false
    },
    // Additional features (Shoplworks-inspired)
    {
      name: 'Posting Board',
      href: '/posting-board',
      icon: ClipboardList,
      current: false
    },
    {
      name: 'AI Assistant',
      href: '/ai-assistant',
      icon: Zap,
      current: false
    },
    {
      name: 'Users',
      href: '/users',
      icon: User,
      current: false
    },
    // Coming soon features
    {
      name: 'Overtime',
      href: '/overtime',
      icon: Clock,
      current: false
    },
    {
      name: 'Notice & Survey',
      href: '/notice-survey',
      icon: MessageSquare,
      current: false
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      current: false
    }
  ];

  /**
   * Filter navigation items based on user role
   * Ensures proper access control and UI consistency
   */
  const filteredNavigation = navigation.filter(item => {
    // Admin has access to everything
    if (currentUser.role === UserRole.ADMIN) return true;
    
    // Filter out admin-only features for non-admin users
    const adminOnlyFeatures = ['/grant-leave', '/settings', '/admin', '/users'];
    if (adminOnlyFeatures.includes(item.href)) return false;
    
    return true;
  });

  /**
   * Handle sidebar toggle for mobile responsiveness
   */
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Handle user logout
   * In a real application, this would clear authentication tokens and redirect
   */
  const handleLogout = () => {
    // TODO: Implement proper logout logic
    console.log('User logged out');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={handleSidebarToggle}
          />
        )}

        {/* Sidebar Navigation */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Workforce
              </span>
            </div>
            <button
              onClick={handleSidebarToggle}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${item.current 
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className={`
                  mr-3 h-5 w-5 transition-colors
                  ${item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {item.name}
                {item.badge && (
                  <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {currentUser.avatar ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={currentUser.avatar}
                    alt={currentUser.name}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Top Navigation Bar */}
          <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
              onClick={handleSidebarToggle}
              className="lg:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex">
                {/* Search Bar */}
                <div className="w-full flex md:ml-0">
                  <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                      <Search className="h-5 w-5" />
                    </div>
                    <input
                      className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                      placeholder="Search..."
                      type="search"
                    />
                  </div>
                </div>
              </div>
              
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                {/* Notifications */}
                <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                  <Bell className="h-6 w-6" />
                </button>
                
                {/* Help */}
                <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                  <HelpCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1">
            <Routes>
              {/* Main Dashboard */}
              <Route path="/" element={<DashboardPage />} />
              
              {/* Core Features */}
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="leave" element={<LeavePage />} />
              <Route path="grant-leave" element={<GrantLeavePage userRole={UserRole.ADMIN} />} />
              <Route path="journey" element={<JourneyPlanPage />} />
              <Route path="journey/settings" element={<JourneyPlanSettings />} />
              <Route path="todo" element={<TodoPage userRole={UserRole.ADMIN} />} />
              
              {/* Management Features */}
              <Route path="members" element={<MembersPage userRole={UserRole.ADMIN} />} />
              <Route path="groups" element={<GroupPage />} />
              <Route path="workplaces" element={<WorkplacePage />} />
              <Route path="posting-board" element={<PostingBoardPage userRole={UserRole.ADMIN} />} />
              
              {/* Administrative Features */}
              <Route path="settings" element={<SettingsPage userRole={MemberRole.ADMIN} />} />
              <Route path="admin" element={<AdminTab currentUserRole={MemberRole.ADMIN} />} />
              <Route path="ai-assistant" element={<ComingSoonPage feature="AI Assistant" />} />
              <Route path="users" element={<ComingSoonPage feature="User Management" />} />
              
              {/* Shoplworks extra features */}
              <Route path="overtime" element={<ComingSoonPage feature="Overtime" />} />
              <Route path="notice-survey" element={<ComingSoonPage feature="Notice & Survey" />} />
              <Route path="reports" element={<ComingSoonPage feature="Reports & Analytics" />} />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
