/**
 * Layout Component - Workforce Management Platform
 * 
 * Main layout wrapper that provides the application structure including:
 * - Responsive navigation bar
 * - Collapsible sidebar navigation
 * - Main content area with routing outlet
 * - Mobile-friendly responsive design
 * 
 * This component serves as the foundation for all authenticated pages
 * and manages the overall application layout and navigation state.
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Layout Component
 * 
 * Main layout wrapper that provides the application structure.
 * Manages sidebar state and provides responsive layout for all authenticated pages.
 * 
 * @returns JSX element with complete application layout
 */
const Layout: React.FC = () => {
  // State to control sidebar visibility (mobile responsive)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /**
   * Toggle sidebar visibility
   * Used for mobile navigation and sidebar open/close functionality
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Close sidebar
   * Used when clicking outside sidebar or navigating on mobile
   */
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <Navbar onSidebarToggle={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      {/* Main content area with sidebar */}
      <div className="flex">
        {/* Collapsible sidebar navigation */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        {/* Main content area */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            {/* React Router outlet for nested routes */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
