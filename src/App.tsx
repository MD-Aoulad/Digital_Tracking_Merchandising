/**
 * Workforce Management Platform - Main Application Component
 * 
 * This is the root component of the workforce management application that provides:
 * - Authentication context and protected routing
 * - Main application layout with navigation
 * - Toast notifications for user feedback
 * - Route definitions for all application pages
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AttendancePage from './components/Attendance/AttendancePage';
import SchedulePage from './components/Schedule/SchedulePage';
import TasksPage from './components/Tasks/TasksPage';
import LeavePage from './components/Leave/LeavePage';
import ChatPage from './components/Chat/ChatPage';
import OperationsPage from './components/Operations/OperationsPage';
import ComingSoonPage from './components/ComingSoonPage';

/**
 * ProtectedRoute Component
 * 
 * Higher-order component that ensures users are authenticated before accessing protected routes.
 * Shows a loading spinner while checking authentication status and redirects to login if not authenticated.
 * 
 * @param children - React components to render if user is authenticated
 * @returns JSX element with authentication check
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Reports & Analytics Page Component
 * 
 * Placeholder component for reporting and analytics functionality.
 * Will include performance metrics, attendance reports, and data visualization.
 */
const ReportsPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      <p className="text-gray-600 mt-1">Generate and view detailed reports</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-gray-600">Reporting features coming soon...</p>
    </div>
  </div>
);

/**
 * Journey Planning Page Component
 * 
 * Placeholder component for field team route planning.
 * Will include map integration, route optimization, and location tracking.
 */
const JourneyPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Journey Planning</h1>
      <p className="text-gray-600 mt-1">Plan and track field team routes</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-gray-600">Journey planning features coming soon...</p>
    </div>
  </div>
);

/**
 * Document Management Page Component
 * 
 * Placeholder component for document creation and management.
 * Will include document templates, digital signatures, and file organization.
 */
const DocumentsPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
      <p className="text-gray-600 mt-1">Create, sign, and manage documents</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-gray-600">Document management features coming soon...</p>
    </div>
  </div>
);

/**
 * Surveys & Notices Page Component
 * 
 * Placeholder component for survey creation and announcement management.
 * Will include survey builder, response collection, and notification system.
 */
const SurveysPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Surveys & Notices</h1>
      <p className="text-gray-600 mt-1">Create and manage surveys and announcements</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-gray-600">Survey features coming soon...</p>
    </div>
  </div>
);

/**
 * AI Assistant Page Component
 * 
 * Placeholder component for AI-powered assistance functionality.
 * Will include chatbot, task automation, and intelligent recommendations.
 */
const AIAssistantPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
      <p className="text-gray-600 mt-1">Get help with your questions and tasks</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-gray-600">AI assistant features coming soon...</p>
    </div>
  </div>
);

/**
 * User Management Page Component
 * 
 * Placeholder component for user account and permission management.
 * Will include user creation, role assignment, and access control.
 */
const UsersPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-gray-600">User management features coming soon...</p>
    </div>
  </div>
);

/**
 * Settings Page Component
 * 
 * Placeholder component for system configuration and user preferences.
 * Will include application settings, notification preferences, and system configuration.
 */
const SettingsPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="text-gray-600 mt-1">Configure system settings and preferences</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-gray-600">Settings features coming soon...</p>
    </div>
  </div>
);

/**
 * AppContent Component
 * 
 * Main application content wrapper that defines all routes and their corresponding components.
 * Uses React Router for navigation and includes protected routes for authenticated users.
 * 
 * @returns JSX element with complete routing structure
 */
const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public route for authentication */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes wrapped in Layout component */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Redirect root to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Main application routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="journey" element={<JourneyPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="surveys" element={<SurveysPage />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Shoplworks extra features */}
          <Route path="overtime" element={<ComingSoonPage feature="Overtime" />} />
          <Route path="notice-survey" element={<ComingSoonPage feature="Notice & Survey" />} />
          <Route path="posting-board" element={<ComingSoonPage feature="Posting Board" />} />
          <Route path="to-do" element={<ComingSoonPage feature="To-Do" />} />
          <Route path="ai-chatbot" element={<ComingSoonPage feature="AI Chatbot" />} />
          <Route path="e-documents" element={<ComingSoonPage feature="E-documents" />} />
          <Route path="approval" element={<ComingSoonPage feature="Approval" />} />
          <Route path="in-store-data" element={<ComingSoonPage feature="In-store Data Collection" />} />
          <Route path="groups" element={<ComingSoonPage feature="Groups" />} />
          <Route path="workplaces" element={<ComingSoonPage feature="Workplaces" />} />
          <Route path="members" element={<ComingSoonPage feature="Members" />} />
          <Route path="company" element={<ComingSoonPage feature="Company" />} />
          <Route path="employee" element={<ComingSoonPage feature="Employee" />} />
          <Route path="admin" element={<ComingSoonPage feature="Admin" />} />        </Route>
      </Routes>
    </Router>
  );
};

/**
 * Main App Component
 * 
 * Root component that wraps the entire application with:
 * - Authentication context provider
 * - Toast notification system
 * - Main application content
 * 
 * @returns JSX element representing the complete application
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      {/* Global toast notification system */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
