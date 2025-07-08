import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AttendancePage from './components/Attendance/AttendancePage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Placeholder components for other pages
const SchedulePage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
      <p className="text-gray-600 mt-1">Manage employee schedules and shifts</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-gray-600">Schedule management features coming soon...</p>
    </div>
  </div>
);

const LeavePage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
      <p className="text-gray-600 mt-1">Manage employee leave requests and approvals</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-gray-600">Leave management features coming soon...</p>
    </div>
  </div>
);

const TasksPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
      <p className="text-gray-600 mt-1">Assign and track tasks across your team</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-gray-600">Task management features coming soon...</p>
    </div>
  </div>
);

const ChatPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Team Chat</h1>
      <p className="text-gray-600 mt-1">Real-time communication with your team</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-gray-600">Chat features coming soon...</p>
    </div>
  </div>
);

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

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="journey" element={<JourneyPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="surveys" element={<SurveysPage />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
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
