/**
 * Journey Plan Page Component - Workforce Management Platform
 * 
 * Main interface for managing journey plans that allow administrators to assign
 * locations and times for employees visiting multiple sites on specific dates.
 * 
 * Features:
 * - Create and manage journey plans
 * - Assign employees to multiple locations
 * - Monitor visit status and routes on map
 * - Track completion and performance
 * - Route optimization and GPS verification
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 * @since 2025-01-10
 */

import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Play
} from 'lucide-react';
import { JourneyPlan, JourneyLocation } from '../../types';
import toast from 'react-hot-toast';

// Mock data - in real app, this would come from API
const mockEmployees = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', department: 'Sales' },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', department: 'Marketing' },
  { id: '3', name: 'Carol Lee', email: 'carol@example.com', department: 'Development' },
  { id: '4', name: 'David Wilson', email: 'david@example.com', department: 'Sales' },
  { id: '5', name: 'Eva Brown', email: 'eva@example.com', department: 'HR' },
];

const mockLocations: JourneyLocation[] = [
  {
    id: '1',
    name: 'Downtown Office',
    address: '123 Main St, Downtown, City',
    latitude: 40.7128,
    longitude: -74.0060,
    contactPerson: 'John Manager',
    contactPhone: '+1-555-0123',
    estimatedDuration: 60,
    priority: 'high',
  },
  {
    id: '2',
    name: 'Client A Office',
    address: '456 Business Ave, Midtown, City',
    latitude: 40.7589,
    longitude: -73.9851,
    contactPerson: 'Sarah Client',
    contactPhone: '+1-555-0456',
    estimatedDuration: 45,
    priority: 'medium',
  },
  {
    id: '3',
    name: 'Client B Office',
    address: '789 Corporate Blvd, Uptown, City',
    latitude: 40.7505,
    longitude: -73.9934,
    contactPerson: 'Mike Director',
    contactPhone: '+1-555-0789',
    estimatedDuration: 90,
    priority: 'high',
  },
];

const mockJourneyPlans: JourneyPlan[] = [
  {
    id: '1',
    title: 'Sales Team Route - Downtown',
    employeeId: '1',
    date: '2025-01-15',
    startTime: '09:00',
    endTime: '17:00',
    locations: [mockLocations[0], mockLocations[1]],
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
    locations: [mockLocations[1], mockLocations[2]],
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
    locations: [mockLocations[0]],
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
 * JourneyPlanPage Component
 * 
 * Main interface for managing journey plans. Provides comprehensive
 * functionality for creating, viewing, and managing employee journey
 * assignments with multiple location visits.
 * 
 * @returns JSX element with complete journey plan management interface
 */
const JourneyPlanPage: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /** List of all journey plans */
  const [journeyPlans, setJourneyPlans] = useState<JourneyPlan[]>(mockJourneyPlans);
  
  /** Search and filter state */
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  /** Modal states */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  /** Selected journey plan for modals */
  const [selectedPlan, setSelectedPlan] = useState<JourneyPlan | null>(null);

  // ============================================================================
  // FILTERING AND SEARCH
  // ============================================================================
  
  /**
   * Filter journey plans based on search and filter criteria
   */
  const filteredPlans = journeyPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mockEmployees.find(emp => emp.id === plan.employeeId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    
    const matchesDate = !dateFilter || plan.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

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

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  


  /**
   * Handle journey plan deletion
   */
  const handleDelete = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this journey plan?')) return;
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setJourneyPlans(prev => prev.filter(plan => plan.id !== planId));
      toast.success('Journey plan deleted successfully');
    } catch (error) {
      toast.error('Failed to delete journey plan');
    }
  };

  /**
   * Export journey plans to CSV
   */
  const handleExport = () => {
    const headers = 'Journey Plan ID,Title,Employee,Date,Status,Locations,Distance,Duration';
    const rows = filteredPlans.map(plan => 
      `${plan.id},"${plan.title}","${getEmployeeName(plan.employeeId)}","${plan.date}","${plan.status}","${plan.locations.length}","${plan.totalDistance}km","${plan.estimatedDuration}min"`
    ).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journey_plans_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Journey plans exported successfully');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Journey Plans</h1>
              <p className="text-gray-600">Manage employee journey assignments and location visits</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus size={16} />
            <span>Create Journey Plan</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900">{journeyPlans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {journeyPlans.filter(plan => plan.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Play size={16} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {journeyPlans.filter(plan => plan.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {journeyPlans.filter(plan => plan.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search journey plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Journey Plans Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Journey Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlans.map((plan) => {
                const statusInfo = getStatusInfo(plan.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{plan.title}</div>
                        <div className="text-sm text-gray-500">ID: {plan.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getEmployeeName(plan.employeeId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{plan.date}</div>
                      <div className="text-sm text-gray-500">{plan.startTime} - {plan.endTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{plan.locations.length} locations</div>
                      <div className="text-sm text-gray-500">
                        {plan.locations.map(loc => loc.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        <StatusIcon size={12} className="mr-1" />
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.totalDistance} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPlan(plan);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No journey plans found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || dateFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first journey plan.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && !dateFilter && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus size={16} className="mr-2" />
                Create Journey Plan
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Journey Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
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
                    Select Locations
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {mockLocations.map(location => (
                      <label key={location.id} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-sm text-gray-900">{location.name}</span>
                      </label>
                    ))}
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
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
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

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Location Details</h4>
                <div className="space-y-3">
                  {selectedPlan.locations.map((location, index) => (
                    <div key={location.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {index + 1}. {location.name}
                          </h5>
                          <p className="text-sm text-gray-600">{location.address}</p>
                          <p className="text-sm text-gray-500">
                            Duration: {location.estimatedDuration} min | Priority: {location.priority}
                          </p>
                        </div>
                        <div className="text-right">
                          {location.contactPerson && (
                            <p className="text-sm text-gray-600">{location.contactPerson}</p>
                          )}
                          {location.contactPhone && (
                            <p className="text-sm text-gray-500">{location.contactPhone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
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

export default JourneyPlanPage; 