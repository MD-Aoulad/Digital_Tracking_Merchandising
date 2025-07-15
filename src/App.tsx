/**
 * Workforce Management Platform - Main Application Component
 * 
 * This is the root component of the workforce management platform inspired by Shoplworks.
 * It handles routing, navigation, and the overall application structure.
 * 
 * Features:
 * - Role-based routing and access control
 * - Responsive sidebar navigation using Layout component
 * - Protected routes for admin-only features
 * - Integration with all major platform modules
 * - Real authentication with protected routes
 * - Loading states and error handling
 * - Logout confirmation dialog
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
import ApprovalPage from './components/Approval/ApprovalPage';
import ChatPage from './components/Chat/ChatPage';
import ComingSoonPage from './components/ComingSoonPage';
import Login from './pages/Login';

// Import type definitions
import { UserRole, MemberRole } from './types';

// Import AuthProvider and useAuth
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import Layout component
import Layout from './components/Layout/Layout';

// Import LogoutConfirmation component
import { LogoutConfirmation, useLogoutConfirmation } from './components/common/LogoutConfirmation';

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
 * TodoPage Wrapper Component
 * Gets the user role from auth context and passes it to TodoPage
 */
const TodoPageWrapper: React.FC = () => {
  const { user } = useAuth();
  return <TodoPage userRole={user?.role || UserRole.VIEWER} />;
};

/**
 * App Content Component
 * Contains the main app content with logout confirmation
 */
const AppContent: React.FC = () => {
  const { isOpen, showLogoutConfirmation, hideLogoutConfirmation, confirmLogout } = useLogoutConfirmation();

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout onLogoutClick={showLogoutConfirmation} />}>
          <Route index element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="attendance" element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          } />
          <Route path="schedule" element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          } />
          <Route path="leave" element={
            <ProtectedRoute>
              <LeavePage />
            </ProtectedRoute>
          } />
          <Route path="grant-leave" element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <GrantLeavePage />
            </ProtectedRoute>
          } />
          <Route path="journey" element={
            <ProtectedRoute>
              <JourneyPlanPage />
            </ProtectedRoute>
          } />
          <Route path="journey/settings" element={
            <ProtectedRoute>
              <JourneyPlanSettings />
            </ProtectedRoute>
          } />
          <Route path="todo" element={
            <ProtectedRoute>
              <TodoPageWrapper />
            </ProtectedRoute>
          } />
          <Route path="chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <ReportPage />
            </ProtectedRoute>
          } />
          <Route path="approval" element={
            <ProtectedRoute>
              <ApprovalPage />
            </ProtectedRoute>
          } />
          <Route path="members" element={
            <ProtectedRoute>
              <MembersPage userRole={UserRole.VIEWER} />
            </ProtectedRoute>
          } />
          <Route path="groups" element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          } />
          <Route path="workplace" element={
            <ProtectedRoute>
              <WorkplacePage />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="admin" element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <AdminTab currentUserRole={MemberRole.EMPLOYEE} />
            </ProtectedRoute>
          } />
          <Route path="posting-board" element={
            <ProtectedRoute>
              <PostingBoardPage userRole={UserRole.VIEWER} />
            </ProtectedRoute>
          } />
          <Route path="unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
                <a href="/" className="text-primary-600 hover:text-primary-700">
                  Return to Dashboard
                </a>
              </div>
            </div>
          } />
          <Route path="*" element={<ComingSoonPage feature="coming soon" />} />
        </Route>
      </Routes>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation
        isOpen={isOpen}
        onClose={hideLogoutConfirmation}
        onConfirm={confirmLogout}
      />
    </>
  );
};

/**
 * Main App component
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
