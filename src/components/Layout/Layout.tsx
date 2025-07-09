/**
 * Layout Component - Workforce Management Platform
 * 
 * Main layout wrapper that provides the application structure including:
 * - Responsive navigation bar
 * - Always-visible sidebar navigation
 * - Main content area with routing outlet
 * - Mobile-friendly responsive design
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

/**
 * Layout Component
 * 
 * Main layout wrapper that provides the application structure.
 * Provides responsive layout with always-visible sidebar for all authenticated pages.
 * 
 * @returns JSX element with complete application layout
 */
const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <Navbar />
      
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
