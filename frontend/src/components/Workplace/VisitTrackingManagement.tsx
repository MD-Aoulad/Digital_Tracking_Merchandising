import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Search,
  Filter,
  Download,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Building2,
  Camera,
  FileText,
  BarChart3,
  TrendingUp,
  Eye
} from 'lucide-react';

/**
 * Visit Tracking Management Component
 * 
 * This component provides comprehensive visit tracking functionality including:
 * - Track all visits to each workplace
 * - Visit details and status monitoring
 * - Compliance and performance tracking
 * - Filter and search visits
 * - Analytics and reporting
 * - Photo and document management
 */
const VisitTrackingManagement: React.FC = () => {
  const [visits, setVisits] = useState([
    {
      id: '1',
      employeeId: 'emp001',
      employeeName: 'John Doe',
      workplaceId: '1',
      workplaceName: 'BIG ONE Handels GmbH/ Os...',
      workplaceCode: '20311',
      visitDate: '2025-01-15',
      startTime: '09:30',
      endTime: '17:45',
      duration: 495, // minutes
      status: 'completed',
      visitType: 'scheduled',
      purpose: 'Product demonstration and customer support',
      location: {
        lat: 52.2799,
        lng: 8.0472,
        address: 'Pagenstecherstr. 63 a, 49090, Osnabrück, Niedersachsen, Germany'
      },
      compliance: {
        onTime: true,
        photosTaken: true,
        reportSubmitted: true,
        locationVerified: true
      },
      performance: {
        customerInteractions: 12,
        productsDemonstrated: 8,
        salesGenerated: 2500,
        customerSatisfaction: 4.5
      },
      photos: [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg'
      ],
      notes: 'Successful visit with high customer engagement. Store manager was very cooperative.',
      createdAt: '2025-01-15T09:30:00Z',
      updatedAt: '2025-01-15T17:45:00Z'
    },
    {
      id: '2',
      employeeId: 'emp002',
      employeeName: 'Jane Smith',
      workplaceId: '2',
      workplaceName: '#SamsungZeil (Showcase)/ Fra...',
      workplaceCode: '15235',
      visitDate: '2025-01-14',
      startTime: '10:15',
      endTime: '16:30',
      duration: 375, // minutes
      status: 'completed',
      visitType: 'scheduled',
      purpose: 'Display maintenance and product arrangement',
      location: {
        lat: 50.1109,
        lng: 8.6821,
        address: 'Zeil 119, 60313, Frankfurt am Main, Hessen, Germany'
      },
      compliance: {
        onTime: true,
        photosTaken: true,
        reportSubmitted: true,
        locationVerified: true
      },
      performance: {
        customerInteractions: 8,
        productsDemonstrated: 5,
        salesGenerated: 1800,
        customerSatisfaction: 4.3
      },
      photos: [
        'https://example.com/photo3.jpg'
      ],
      notes: 'Display was updated according to new guidelines. Store traffic was moderate.',
      createdAt: '2025-01-14T10:15:00Z',
      updatedAt: '2025-01-14T16:30:00Z'
    },
    {
      id: '3',
      employeeId: 'emp003',
      employeeName: 'Mike Johnson',
      workplaceId: '3',
      workplaceName: '3K-Kuechen Esslingen/ Essling...',
      workplaceCode: '25280',
      visitDate: '2025-01-15',
      startTime: '08:00',
      endTime: null,
      duration: null,
      status: 'in-progress',
      visitType: 'scheduled',
      purpose: 'Kitchen appliance demonstration',
      location: {
        lat: 48.7426,
        lng: 9.3201,
        address: 'Heilbronner Str. 50, 73728, Esslingen, Baden-Württemberg, Germany'
      },
      compliance: {
        onTime: true,
        photosTaken: false,
        reportSubmitted: false,
        locationVerified: true
      },
      performance: {
        customerInteractions: 0,
        productsDemonstrated: 0,
        salesGenerated: 0,
        customerSatisfaction: 0
      },
      photos: [],
      notes: 'Visit started on time. Currently in progress.',
      createdAt: '2025-01-15T08:00:00Z',
      updatedAt: '2025-01-15T08:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalVisits: 1247,
    completedVisits: 1189,
    inProgressVisits: 45,
    cancelledVisits: 13,
    visitsByStatus: {
      completed: 1189,
      'in-progress': 45,
      cancelled: 13
    },
    averageDuration: 420, // minutes
    complianceRate: 94.5,
    totalPhotos: 3567
  };

  const handleAddVisit = () => {
    setEditingVisit(null);
    setShowAddModal(true);
  };

  const handleEdit = (visit: any) => {
    setEditingVisit(visit);
    setShowAddModal(true);
  };

  const handleDelete = (visitId: string) => {
    setVisits(visits.filter(v => v.id !== visitId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getComplianceColor = (compliant: boolean) => {
    return compliant ? 'text-green-600' : 'text-red-600';
  };

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.workplaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || visit.status === filterStatus;
    const matchesType = filterType === 'all' || visit.visitType === filterType;
    const matchesDate = filterDate === 'all' || visit.visitDate === filterDate;
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visit Tracking Management</h2>
          <p className="text-gray-600">Track all visits to each workplace</p>
        </div>
        <button
          onClick={handleAddVisit}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Visit
        </button>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.completedVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(dashboardStats.averageDuration)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.complianceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Visit Status Breakdown</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dashboardStats.visitsByStatus.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dashboardStats.visitsByStatus['in-progress']}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{dashboardStats.visitsByStatus.cancelled}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{dashboardStats.totalPhotos}</div>
              <div className="text-sm text-gray-600">Photos Taken</div>
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
                  placeholder="Search employees, workplaces, or visit purposes..."
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
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="cancelled">Cancelled</option>
                <option value="scheduled">Scheduled</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="scheduled">Scheduled</option>
                <option value="unscheduled">Unscheduled</option>
                <option value="emergency">Emergency</option>
              </select>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="2025-01-15">Today</option>
                <option value="2025-01-14">Yesterday</option>
                <option value="2025-01-13">2 days ago</option>
              </select>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Visits List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee & Workplace
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visit Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVisits.map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{visit.employeeName}</div>
                      <div className="text-sm text-gray-500">{visit.workplaceName}</div>
                      <div className="text-sm text-gray-500">{visit.workplaceCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{visit.visitDate}</div>
                      <div className="text-sm text-gray-500">{visit.startTime} - {visit.endTime || 'Ongoing'}</div>
                      <div className="text-sm text-gray-500">{visit.purpose}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDuration(visit.duration)}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                        {getStatusIcon(visit.status)}
                        <span className="ml-1">{visit.status}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className={`${getComplianceColor(visit.compliance.onTime)}`}>
                          {getComplianceIcon(visit.compliance.onTime)}
                        </span>
                        <span className="ml-1 text-sm text-gray-900">On Time</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`${getComplianceColor(visit.compliance.photosTaken)}`}>
                          {getComplianceIcon(visit.compliance.photosTaken)}
                        </span>
                        <span className="ml-1 text-sm text-gray-900">Photos</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`${getComplianceColor(visit.compliance.reportSubmitted)}`}>
                          {getComplianceIcon(visit.compliance.reportSubmitted)}
                        </span>
                        <span className="ml-1 text-sm text-gray-900">Report</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        {visit.performance.customerInteractions} interactions
                      </div>
                      <div className="text-sm text-gray-500">
                        €{visit.performance.salesGenerated.toLocaleString()}
                      </div>
                      {visit.performance.customerSatisfaction > 0 && (
                        <div className="text-sm text-gray-500">
                          {visit.performance.customerSatisfaction}/5 rating
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(visit)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(visit)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(visit.id)}
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
                {editingVisit ? 'Edit Visit' : 'Add Visit'}
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Select Employee</option>
                    <option>John Doe</option>
                    <option>Jane Smith</option>
                    <option>Mike Johnson</option>
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
                  <label className="block text-sm font-medium text-gray-700">Visit Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Visit purpose and objectives..."
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
                    {editingVisit ? 'Update' : 'Create'}
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

export default VisitTrackingManagement; 