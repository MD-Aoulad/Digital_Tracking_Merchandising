/**
 * Sidebar Component - Workforce Management Platform
 * 
 * Always-visible sidebar navigation component that provides:
 * - Main application navigation menu
 * - Role-based menu item filtering
 * - Responsive design that stays visible
 * - Smooth transitions and hover effects
 * - Badge indicators for notifications
 * - Admin section for administrative functions
 * 
 * Features:
 * - Permission-based menu visibility
 * - Active route highlighting
 * - Always visible navigation
 * - Smooth hover animations
 * - Version information in footer
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
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
  Bot,
  Gift,
  Building2,
  Home,
  Target
} from 'lucide-react';

/**
 * Sidebar component props interface
 */
interface SidebarProps {
  isOpen: boolean;                // Whether sidebar is open (mobile)
  onClose: () => void;            // Function to close sidebar
}



/**
 * Sidebar Component
 * 
 * Main navigation sidebar that provides access to all application features.
 * Always visible with role-based filtering and responsive design.
 * 
 * @param isOpen - Current sidebar open state (not used for visibility)
 * @param onClose - Function to close sidebar (not used)
 * @returns JSX element with complete sidebar navigation
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  // Always show all features for admin
  // Grouped as in Shoplworks UI
  const menuGroups = [
    {
      label: 'Workforce Management',
      items: [
        { title: 'Dashboard', path: '/', icon: <Home size={20} /> },
        { title: 'Attendance', path: '/attendance', icon: <Clock size={20} /> },
        { title: 'Schedule', path: '/schedule', icon: <Calendar size={20} /> },
        { title: 'Leave', path: '/leave', icon: <FileText size={20} /> },
        { title: 'Grant Leave', path: '/grant-leave', icon: <Gift size={20} /> },
        { title: 'Overtime', path: '/overtime', icon: <Clock size={20} /> },
        { title: 'Journey Plan', path: '/journey', icon: <Map size={20} /> },
        { title: 'Simulation', path: '/simulation', icon: <Target size={20} /> },
      ],
    },
    {
      label: 'Task & Communications',
      items: [
        { title: 'Notice & Survey', path: '/notice-survey', icon: <Mail size={20} /> },
        { title: 'Report', path: '/reports', icon: <BarChart3 size={20} /> },
        { title: 'Posting Board', path: '/posting-board', icon: <ClipboardList size={20} /> },
        { title: 'To-Do', path: '/todo', icon: <ClipboardList size={20} /> },
        { title: 'Chat', path: '/chat', icon: <MessageSquare size={20} /> },
        { title: 'AI Chatbot', path: '/ai-chatbot', icon: <Bot size={20} /> },
      ],
    },
    {
      label: 'Document',
      items: [
        { title: 'E-documents', path: '/e-documents', icon: <FileSignature size={20} /> },
      ],
    },
    {
      label: 'Approval',
      items: [
        { title: 'Approval', path: '/approval', icon: <UserCheck size={20} /> },
      ],
    },
    {
      label: 'In-store Data',
      items: [
        { title: 'In-store Data Collection', path: '/in-store-data', icon: <ClipboardList size={20} /> },
      ],
    },
    {
      label: 'Administration',
      items: [
        { title: 'Groups', path: '/groups', icon: <Users size={20} /> },
        { title: 'Workplaces', path: '/workplaces', icon: <Building2 size={20} /> },
        { title: 'Members', path: '/members', icon: <Users size={20} /> },
      ],
    },
    {
      label: 'Settings',
      items: [
        { title: 'Company', path: '/company', icon: <Settings size={20} /> },
        { title: 'Employee', path: '/employee', icon: <Settings size={20} /> },
        { title: 'Admin', path: '/admin', icon: <Settings size={20} /> },
      ],
    },
  ];

  return (
    <>
      {/* Always visible sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 shadow-sm">
        <div className="flex flex-col h-full">
          {/* Sidebar header with logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">WM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Workforce</h1>
                <p className="text-xs text-gray-500">Management</p>
              </div>
            </button>
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuGroups.map(group => (
              <div key={group.label} className="mb-4">
                <div className="pt-2 pb-1">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{group.label}</h3>
                </div>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
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
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar footer with version info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <UserCheck size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Workforce Manager</p>
                <p className="text-xs text-gray-500">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
