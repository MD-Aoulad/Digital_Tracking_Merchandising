/**
 * Application Layout Component
 * 
 * This component provides the main layout structure for the application.
 * It includes the sidebar navigation, top header, and main content area.
 */

import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// ===== TYPES =====

interface AppLayoutProps {
  children: React.ReactNode;
}

// ===== LAYOUT COMPONENT =====

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { user, logout, sessionTimeout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ===== EVENT HANDLERS =====

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleSearchToggle = useCallback(() => {
    setSearchOpen(prev => !prev);
  }, []);

  const handleNotificationsToggle = useCallback(() => {
    setNotificationsOpen(prev => !prev);
  }, []);

  const handleUserMenuToggle = useCallback(() => {
    setUserMenuOpen(prev => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleSettingsClick = useCallback(() => {
    navigate('/settings');
    setUserMenuOpen(false);
  }, [navigate]);

  // ===== RENDER =====

  if (!user) {
    return null; // Don't render layout if user is not authenticated
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session Timeout Warning */}
      {sessionTimeout && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Session will expire soon. Click to extend.</p>
        </div>
      )}

      {/* Simple Top Bar */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="text-xl font-bold text-primary-600 hover:text-primary-700"
          >
            Workforce Management
          </button>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={handleSearchToggle}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button
              onClick={handleNotificationsToggle}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Bell className="h-5 w-5" />
            </button>

            {/* User Menu */}
            <button
              onClick={handleUserMenuToggle}
              className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block">{user.name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 border-none outline-none text-lg"
                  autoFocus
                />
                <button
                  onClick={handleSearchToggle}
                  className="ml-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-500 text-center">
                Search functionality coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <button
                onClick={handleNotificationsToggle}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-500 text-center">
                Notifications coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Menu Modal */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-end pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs mx-4">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={handleSettingsClick}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout; 