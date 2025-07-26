import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Shield,
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  MapPin
} from 'lucide-react';

/**
 * Incident Management Component
 * 
 * This component provides comprehensive incident management functionality including:
 * - Handle workplace incidents and issues
 * - Incident reporting and tracking
 * - Resolution management and follow-up
 * - Safety incident monitoring
 * - Performance impact analysis
 * - Preventive measures tracking
 */
const IncidentManagement: React.FC = () => {
  const [incidents, setIncidents] = useState([
    {
      id: '1',
      workplaceId: '1',
      workplaceName: 'BIG ONE Handels GmbH/ Os...',
      workplaceCode: '20311',
      incidentType: 'Safety Incident',
      severity: 'medium',
      status: 'resolved',
      title: 'Minor slip and fall in electronics section',
      description: 'Customer slipped on wet floor near the TV display area. No injuries reported.',
      reportedBy: 'John Doe',
      reportedDate: '2025-01-15T10:30:00Z',
      resolvedDate: '2025-01-15T14:00:00Z',
      assignedTo: 'Store Manager',
      priority: 'medium',
      impact: {
        customers: 0,
        employees: 0,
        operations: 'minimal',
        financial: 0
      },
      actions: [
        {
          id: 'act1',
          description: 'Immediately cleaned and dried the floor',
          completedBy: 'Maintenance Staff',
          completedDate: '2025-01-15T11:00:00Z',
          status: 'completed'
        },
        {
          id: 'act2',
          description: 'Added warning signs in the area',
          completedBy: 'Store Manager',
          completedDate: '2025-01-15T11:30:00Z',
          status: 'completed'
        }
      ],
      preventiveMeasures: [
        'Regular floor inspection schedule',
        'Improved cleaning procedures',
        'Better signage placement'
      ],
      notes: 'Incident resolved quickly with no lasting impact',
      createdAt: '2025-01-15T10:30:00Z',
      updatedAt: '2025-01-15T14:00:00Z'
    },
    {
      id: '2',
      workplaceId: '2',
      workplaceName: '#SamsungZeil (Showcase)/ Fra...',
      workplaceCode: '15235',
      incidentType: 'Equipment Failure',
      severity: 'high',
      status: 'in-progress',
      title: 'Display screen malfunction during demo',
      description: 'Main demonstration screen stopped working during peak hours, affecting customer experience.',
      reportedBy: 'Jane Smith',
      reportedDate: '2025-01-14T15:45:00Z',
      resolvedDate: null,
      assignedTo: 'Technical Support',
      priority: 'high',
      impact: {
        customers: 25,
        employees: 2,
        operations: 'moderate',
        financial: 500
      },
      actions: [
        {
          id: 'act3',
          description: 'Contacted technical support',
          completedBy: 'Jane Smith',
          completedDate: '2025-01-14T16:00:00Z',
          status: 'completed'
        },
        {
          id: 'act4',
          description: 'Schedule repair visit',
          completedBy: 'Technical Support',
          completedDate: null,
          status: 'pending'
        }
      ],
      preventiveMeasures: [
        'Regular equipment maintenance',
        'Backup display systems',
        'Staff training on basic troubleshooting'
      ],
      notes: 'Technical support scheduled for tomorrow',
      createdAt: '2025-01-14T15:45:00Z',
      updatedAt: '2025-01-14T16:00:00Z'
    },
    {
      id: '3',
      workplaceId: '3',
      workplaceName: '3K-Kuechen Esslingen/ Essling...',
      workplaceCode: '25280',
      incidentType: 'Customer Complaint',
      severity: 'low',
      status: 'open',
      title: 'Product demonstration scheduling issue',
      description: 'Customer complained about difficulty scheduling kitchen appliance demonstration.',
      reportedBy: 'Mike Johnson',
      reportedDate: '2025-01-15T09:15:00Z',
      resolvedDate: null,
      assignedTo: 'Customer Service',
      priority: 'low',
      impact: {
        customers: 1,
        employees: 0,
        operations: 'minimal',
        financial: 0
      },
      actions: [
        {
          id: 'act5',
          description: 'Review scheduling system',
          completedBy: 'Customer Service',
          completedDate: null,
          status: 'in-progress'
        }
      ],
      preventiveMeasures: [
        'Improve online booking system',
        'Better staff training on scheduling',
        'Enhanced customer communication'
      ],
      notes: 'Customer service team investigating the issue',
      createdAt: '2025-01-15T09:15:00Z',
      updatedAt: '2025-01-15T09:15:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalIncidents: 45,
    openIncidents: 12,
    resolvedIncidents: 28,
    inProgressIncidents: 5,
    averageResolutionTime: 4.2, // hours
    incidentsBySeverity: {
      low: 15,
      medium: 20,
      high: 10
    },
    safetyIncidents: 8,
    customerComplaints: 22
  };

  const handleAddIncident = () => {
    setEditingIncident(null);
    setShowAddModal(true);
  };

  const handleEdit = (incident: any) => {
    setEditingIncident(incident);
    setShowAddModal(true);
  };

  const handleDelete = (incidentId: string) => {
    setIncidents(incidents.filter(i => i.id !== incidentId));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-orange-600';
      case 'high': return 'text-red-600';
      case 'critical': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.workplaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    const matchesType = filterType === 'all' || incident.incidentType === filterType;
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Incident Management</h2>
          <p className="text-gray-600">Handle workplace incidents and issues</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={handleAddIncident}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Report Incident
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalIncidents}</p>
              <p className="text-sm text-blue-600">This month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.openIncidents}</p>
              <p className="text-sm text-orange-600">Require attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.resolvedIncidents}</p>
              <p className="text-sm text-green-600">Successfully closed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.averageResolutionTime}h</p>
              <p className="text-sm text-indigo-600">Time to resolve</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search incidents, workplaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Safety Incident">Safety Incident</option>
              <option value="Equipment Failure">Equipment Failure</option>
              <option value="Customer Complaint">Customer Complaint</option>
              <option value="Security Issue">Security Issue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Incident Reports</h3>
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workplace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                      <div className="text-sm text-gray-500">{incident.incidentType}</div>
                      <div className="text-xs text-gray-400">Priority: <span className={getPriorityColor(incident.priority)}>{incident.priority}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{incident.workplaceName}</div>
                      <div className="text-sm text-gray-500">{incident.workplaceCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {getSeverityIcon(incident.severity)}
                      <span className="ml-1">{incident.severity}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {getStatusIcon(incident.status)}
                      <span className="ml-1">{incident.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{incident.assignedTo}</div>
                    <div className="text-sm text-gray-500">by {incident.reportedBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(incident.reportedDate)}</div>
                    {incident.resolvedDate && (
                      <div className="text-sm text-gray-500">Resolved: {formatDate(incident.resolvedDate)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(incident)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(incident.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingIncident ? 'Edit Incident' : 'Report Incident'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {editingIncident ? 'Update incident details' : 'Report new workplace incident'}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingIncident ? 'Update' : 'Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentManagement; 