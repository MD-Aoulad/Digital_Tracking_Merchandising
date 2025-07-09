/**
 * Journey Plan Management Component - Workforce Management Platform
 * 
 * Compact management interface for journey plans that provides quick access
 * to key features and statistics. Designed for integration into dashboard
 * and main navigation areas.
 * 
 * Features:
 * - Quick journey plan statistics
 * - Recent journey plans overview
 * - Quick actions for common tasks
 * - Status monitoring and alerts
 * - Integration with main journey plan page
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 * @since 2025-01-10
 */

import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Play,
  TrendingUp,
  BarChart3,
  Clock,
  Users,
  Calendar,
  Route
} from 'lucide-react';
import { JourneyPlan } from '../../types';
import toast from 'react-hot-toast';

// Mock data - in real app, this would come from API
const mockEmployees = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', department: 'Sales' },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', department: 'Marketing' },
  { id: '3', name: 'Carol Lee', email: 'carol@example.com', department: 'Development' },
  { id: '4', name: 'David Wilson', email: 'david@example.com', department: 'Sales' },
  { id: '5', name: 'Eva Brown', email: 'eva@example.com', department: 'HR' },
];

const mockJourneyPlans: JourneyPlan[] = [
  {
    id: '1',
    title: 'Sales Team Route - Downtown',
    employeeId: '1',
    date: '2025-01-15',
    startTime: '09:00',
    endTime: '17:00',
    locations: [],
    status: 'completed',
    totalDistance: 12.5,
    estimatedDuration: 180,
    actualStartTime: '09:15',
    actualEndTime: '16:45',
    notes: 'Successful visits to all locations',
    createdBy: 'admin',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T16:45:00Z',
  },
  {
    id: '2',
    title: 'Marketing Tour - Uptown',
    employeeId: '2',
    date: '2025-01-16',
    startTime: '10:00',
    endTime: '18:00',
    locations: [],
    status: 'in-progress',
    totalDistance: 8.2,
    estimatedDuration: 240,
    actualStartTime: '10:05',
    notes: 'Currently visiting Client A',
    createdBy: 'admin',
    createdAt: '2025-01-11T14:30:00Z',
    updatedAt: '2025-01-16T12:30:00Z',
  },
  {
    id: '3',
    title: 'Development Site Visit',
    employeeId: '3',
    date: '2025-01-17',
    startTime: '08:00',
    endTime: '16:00',
    locations: [],
    status: 'pending',
    totalDistance: 5.0,
    estimatedDuration: 120,
    notes: 'Single location visit for project review',
    createdBy: 'admin',
    createdAt: '2025-01-12T09:15:00Z',
    updatedAt: '2025-01-12T09:15:00Z',
  },
];

/**
 * JourneyPlanManagement Component
 * 
 * Compact management interface for journey plans that provides quick access
 * to key features, statistics, and recent activity. Designed for dashboard
 * integration and quick overview of journey plan status.
 * 
 * @returns JSX element with compact journey plan management interface
 */
const JourneyPlanManagement: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /** List of all journey plans */
  const [journeyPlans] = useState<JourneyPlan[]>(mockJourneyPlans);
  
  /** Modal states */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  /** Selected journey plan for modals */
  const [selectedPlan, setSelectedPlan] = useState<JourneyPlan | null>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  /**
   * Calculate journey plan statistics
   */
  const stats = {
    total: journeyPlans.length,
    completed: journeyPlans.filter(plan => plan.status === 'completed').length,
    inProgress: journeyPlans.filter(plan => plan.status === 'in-progress').length,
    pending: journeyPlans.filter(plan => plan.status === 'pending').length,
    cancelled: journeyPlans.filter(plan => plan.status === 'cancelled').length,
  };

  /**
   * Get recent journey plans (last 5)
   */
  const recentPlans = journeyPlans
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  /**
   * Get employee name by ID
   */
  const getEmployeeName = (employeeId: string) => {
    return mockEmployees.find(emp => emp.id === employeeId)?.name || 'Unknown Employee';
  };

  /**
   * Get status color and icon
   */
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
      case 'in-progress':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Play };
      case 'pending':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock };
      case 'cancelled':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: AlertCircle };
    }
  };

  /**
   * Calculate completion rate
   */
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <MapPin size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Journey Plans</h2>
            <p className="text-sm text-gray-600">Manage employee journey assignments</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus size={16} />
          <span>New Plan</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-lg font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Play size={16} className="text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-lg font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-lg font-bold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Journey Plans */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Journey Plans</h3>
            <button
              onClick={() => window.location.href = '/journey-plans'}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {recentPlans.map((plan) => {
            const statusInfo = getStatusInfo(plan.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={plan.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {plan.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        <StatusIcon size={10} className="mr-1" />
                        {plan.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users size={12} className="mr-1" />
                        {getEmployeeName(plan.employeeId)}
                      </span>
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {plan.date}
                      </span>
                      <span className="flex items-center">
                        <Route size={12} className="mr-1" />
                        {plan.totalDistance} km
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowViewModal(true);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {recentPlans.length === 0 && (
          <div className="text-center py-8">
            <MapPin size={32} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No journey plans yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first journey plan to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus size={14} className="mr-2" />
              Create Journey Plan
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus size={20} className="text-primary-600 mb-2" />
            <span>New Plan</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/journey-plans'}
            className="flex flex-col items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Eye size={20} className="text-blue-600 mb-2" />
            <span>View All</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/journey-plans/settings'}
            className="flex flex-col items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <BarChart3 size={20} className="text-green-600 mb-2" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/journey-plans/analytics'}
            className="flex flex-col items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <TrendingUp size={20} className="text-purple-600 mb-2" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Create Journey Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Journey Plan</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Journey Plan Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Sales Team Route - Downtown"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Employee
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Choose an employee...</option>
                    {mockEmployees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add any additional notes or instructions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success('Journey plan created successfully!');
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  Create Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Journey Plan Modal */}
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Journey Plan Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Plan Information</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Title</dt>
                      <dd className="text-sm text-gray-900">{selectedPlan.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Employee</dt>
                      <dd className="text-sm text-gray-900">{getEmployeeName(selectedPlan.employeeId)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="text-sm text-gray-900">{selectedPlan.date}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Time</dt>
                      <dd className="text-sm text-gray-900">{selectedPlan.startTime} - {selectedPlan.endTime}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusInfo(selectedPlan.status).bgColor
                        } ${getStatusInfo(selectedPlan.status).color}`}>
                          {selectedPlan.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Route Information</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Distance</dt>
                      <dd className="text-sm text-gray-900">{selectedPlan.totalDistance} km</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estimated Duration</dt>
                      <dd className="text-sm text-gray-900">{selectedPlan.estimatedDuration} minutes</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Locations</dt>
                      <dd className="text-sm text-gray-900">{selectedPlan.locations.length} stops</dd>
                    </div>
                    {selectedPlan.notes && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="text-sm text-gray-900">{selectedPlan.notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => window.location.href = `/journey-plans/${selectedPlan.id}`}
                  className="px-4 py-2 text-sm font-medium text-primary-600 bg-white border border-primary-600 rounded-md hover:bg-primary-50"
                >
                  View Full Details
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyPlanManagement; 