/**
 * Navbar Component - Workforce Management Platform
 * 
 * Top navigation bar component that provides:
 * - Global search functionality
 * - User notifications dropdown
 * - User profile dropdown with logout
 * - Application branding and navigation
 * - Logout confirmation integration
 * 
 * Features:
 * - Sticky positioning for always-visible navigation
 * - Mobile-responsive design
 * - Animated dropdowns using Framer Motion
 * - Real-time notification indicators
 * - User authentication state management
 * - Logout confirmation support
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../LanguageSelector';

/**
 * Navbar component props interface
 */
interface NavbarProps {
  onSidebarToggle?: () => void;    // Optional function to toggle sidebar visibility
  sidebarOpen?: boolean;           // Optional current sidebar open state
  onLogoutClick?: () => void;      // Optional function for logout confirmation
}

/**
 * Navbar Component
 * 
 * Main navigation bar that provides global navigation, search, notifications,
 * and user profile management. Includes responsive design for mobile devices.
 * 
 * @param onSidebarToggle - Optional function to toggle mobile sidebar
 * @param sidebarOpen - Optional current sidebar state
 * @param onLogoutClick - Optional function for logout confirmation
 * @returns JSX element with complete navigation bar
 */
const Navbar: React.FC<NavbarProps> = ({ onSidebarToggle, sidebarOpen, onLogoutClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management for dropdown menus
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  /**
   * Handle user logout
   * Uses logout confirmation if provided, otherwise calls logout directly
   */
  const handleLogout = () => {
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      // Fallback to direct logout if no confirmation handler provided
      logout();
    }
    setProfileDropdownOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-4">
          {/* Application logo and branding */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WM</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Workforce Manager</span>
          </button>
        </div>

        {/* Center - Global search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              aria-label="Search"
            />
          </div>
        </div>

        {/* Right side - Notifications, logout, and profile */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Notifications dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              aria-label="View notifications"
            >
              <Bell size={20} />
              {/* Notification indicator badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Notifications dropdown menu */}
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {/* Sample notification items */}
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-900">New task assigned to you</p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-900">Leave request approved</p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Standalone Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors border border-red-200 hover:border-red-300"
            aria-label="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:block text-sm font-medium">Logout</span>
          </button>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="User profile menu"
            >
              {/* User avatar */}
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              
              {/* User info (hidden on small screens) */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Profile dropdown menu */}
            {profileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                
                {/* Profile actions */}
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                </div>
                
                {/* Logout action */}
                <div className="py-1 border-t border-gray-200">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
