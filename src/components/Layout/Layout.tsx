/**
 * Layout Component - Workforce Management Platform
 * 
 * Main layout wrapper that provides the application structure including:
 * - Responsive navigation bar
 * - Always-visible sidebar navigation
 * - Main content area with routing outlet
 * - Mobile-friendly responsive design
 * - Logout confirmation integration
 * 
 * This component serves as the foundation for all authenticated pages
 * and manages the overall application layout.
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  onLogoutClick?: () => void;
}

/**
 * Layout Component
 * 
 * Main layout wrapper that provides the application structure.
 * Provides responsive layout with always-visible sidebar for all authenticated pages.
 * 
 * @param onLogoutClick - Callback function for logout button clicks
 * @returns JSX element with complete application layout
 */
const Layout: React.FC<LayoutProps> = ({ onLogoutClick }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <Navbar onLogoutClick={onLogoutClick} />
      
      {/* Main content area with sidebar */}
      <div className="flex">
        {/* Always visible sidebar navigation */}
        <Sidebar isOpen={true} onClose={() => {}} />
        
        {/* Main content area */}
        <main className="flex-1 ml-64">
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
