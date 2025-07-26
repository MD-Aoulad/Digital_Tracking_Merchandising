import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  Filter,
  Download,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

/**
 * Employee Assignment Management Component
 * 
 * This component provides comprehensive employee assignment management functionality including:
 * - Assign promoters and merchandisers to workplaces
 * - Track assignment status and performance
 * - Filter and search assignments
 * - Analytics and reporting
 * - Assignment scheduling
 * - Performance tracking
 */
const EmployeeAssignmentManagement: React.FC = () => {
  const [assignments, setAssignments] = useState([
    {
      id: '1',
      employeeId: 'emp001',
      employeeName: 'John Doe',
      employeeEmail: 'john.doe@company.com',
      employeePhone: '+49 123 456 789',
      employeeRole: 'Promoter',
      workplaceId: '1',
      workplaceName: 'BIG ONE Handels GmbH/ Os...',
      workplaceCode: '20311',
      assignmentType: 'full-time',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'active',
      performance: {
        visitsCompleted: 45,
        totalVisits: 50,
        completionRate: 90,
        averageRating: 4.2,
        lastVisit: '2025-01-15T10:30:00Z'
      },
      schedule: {
        workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '09:00',
        endTime: '17:00',
        breakDuration: 60
      },
      notes: 'Experienced promoter with strong customer service skills',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      employeeId: 'emp002',
      employeeName: 'Jane Smith',
      employeeEmail: 'jane.smith@company.com',
      employeePhone: '+49 987 654 321',
      employeeRole: 'Merchandiser',
      workplaceId: '2',
      workplaceName: '#SamsungZeil (Showcase)/ Fra...',
      workplaceCode: '15235',
      assignmentType: 'part-time',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      status: 'active',
      performance: {
        visitsCompleted: 28,
        totalVisits: 30,
        completionRate: 93,
        averageRating: 4.5,
        lastVisit: '2025-01-14T14:15:00Z'
      },
      schedule: {
        workDays: ['monday', 'wednesday', 'friday'],
        startTime: '10:00',
        endTime: '16:00',
        breakDuration: 30
      },
      notes: 'Specialized in visual merchandising and display setup',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-14T00:00:00Z'
    },
    {
      id: '3',
      employeeId: 'emp003',
      employeeName: 'Mike Johnson',
      employeeEmail: 'mike.johnson@company.com',
      employeePhone: '+49 555 123 456',
      employeeRole: 'Promoter',
      workplaceId: '3',
      workplaceName: '3K-Kuechen Esslingen/ Essling...',
      workplaceCode: '25280',
      assignmentType: 'full-time',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'pending',
      performance: {
        visitsCompleted: 0,
        totalVisits: 0,
        completionRate: 0,
        averageRating: 0,
        lastVisit: null
      },
      schedule: {
        workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '08:00',
        endTime: '16:00',
        breakDuration: 60
      },
      notes: 'New employee, requires training and supervision',
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalAssignments: 156,
    activeAssignments: 142,
    pendingAssignments: 8,
    completedAssignments: 6,
    assignmentsByRole: {
      promoter: 89,
      merchandiser: 67
    },
    assignmentsByType: {
      'full-time': 98,
      'part-time': 58
    },
    averagePerformance: 87.5
  };

  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setShowAddModal(true);
  };

  const handleEdit = (assignment: any) => {
    setEditingAssignment(assignment);
    setShowAddModal(true);
  };

  const handleDelete = (assignmentId: string) => {
    setAssignments(assignments.filter(a => a.id !== assignmentId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <Users className="h-4 w-4" />;
      case 'inactive': return <UserX className="h-4 w-4" />;
      default: return <UserX className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Promoter': return 'text-purple-600 bg-purple-100';
      case 'Merchandiser': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.workplaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    const matchesRole = filterRole === 'all' || assignment.employeeRole.toLowerCase() === filterRole;
    const matchesType = filterType === 'all' || assignment.assignmentType === filterType;
    
    return matchesSearch && matchesStatus && matchesRole && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Assignment Management</h2>
          <p className="text-gray-600">Assign promoters and merchandisers to workplaces</p>
        </div>
        <button
          onClick={handleAddAssignment}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Assignment
        </button>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.averagePerformance}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role and Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Assignments by Role</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Promoters</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{dashboardStats.assignmentsByRole.promoter}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Merchandisers</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{dashboardStats.assignmentsByRole.merchandiser}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Assignments by Type</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Full-time</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{dashboardStats.assignmentsByType['full-time']}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Part-time</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{dashboardStats.assignmentsByType['part-time']}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees, workplaces, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="promoter">Promoter</option>
                <option value="merchandiser">Merchandiser</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
              </select>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workplace
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{assignment.employeeName}</div>
                      <div className="text-sm text-gray-500">{assignment.employeeEmail}</div>
                      <div className="text-sm text-gray-500">{assignment.employeePhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{assignment.workplaceName}</div>
                      <div className="text-sm text-gray-500">{assignment.workplaceCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(assignment.employeeRole)}`}>
                        {assignment.employeeRole}
                      </span>
                      <div className="text-sm text-gray-500 capitalize">{assignment.assignmentType.replace('-', ' ')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.performance.visitsCompleted}/{assignment.performance.totalVisits} visits
                      </div>
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              assignment.performance.completionRate >= 90 ? 'bg-green-500' :
                              assignment.performance.completionRate >= 75 ? 'bg-blue-500' :
                              assignment.performance.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${assignment.performance.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{assignment.performance.completionRate}%</span>
                      </div>
                      {assignment.performance.averageRating > 0 && (
                        <div className="text-sm text-gray-500">Rating: {assignment.performance.averageRating}/5</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {getStatusIcon(assignment.status)}
                      <span className="ml-1">{assignment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>{assignment.schedule.workDays.length} days/week</div>
                      <div>{assignment.schedule.startTime} - {assignment.schedule.endTime}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAssignment ? 'Edit Assignment' : 'Add Assignment'}
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Select Employee</option>
                    <option>John Doe (Promoter)</option>
                    <option>Jane Smith (Merchandiser)</option>
                    <option>Mike Johnson (Promoter)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Workplace</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Select Workplace</option>
                    <option>BIG ONE Handels GmbH/ Os...</option>
                    <option>#SamsungZeil (Showcase)/ Fra...</option>
                    <option>3K-Kuechen Esslingen/ Essling...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assignment Type</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Full-time</option>
                    <option>Part-time</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingAssignment ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAssignmentManagement; 