import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  RefreshCw,
  Award,
  FileText,
  Camera,
  Users,
  BarChart3,
  TrendingUp,
  Target,
  Calendar
} from 'lucide-react';

/**
 * Quality Assurance Component
 * 
 * This component provides comprehensive quality assurance functionality including:
 * - Quality checks and compliance audits
 * - Standards monitoring and enforcement
 * - Audit scheduling and tracking
 * - Compliance reporting and analytics
 * - Corrective action management
 * - Performance metrics tracking
 */
const QualityAssurance: React.FC = () => {
  const [audits, setAudits] = useState([
    {
      id: '1',
      workplaceId: '1',
      workplaceName: 'BIG ONE Handels GmbH/ Os...',
      workplaceCode: '20311',
      auditType: 'Store Compliance',
      auditorId: 'aud001',
      auditorName: 'Sarah Wilson',
      auditDate: '2025-01-15',
      status: 'completed',
      score: 92,
      maxScore: 100,
      compliance: 'excellent',
      findings: [
        {
          id: 'find1',
          category: 'Safety',
          description: 'Fire extinguisher properly maintained',
          status: 'compliant',
          priority: 'low',
          notes: 'All safety equipment in good condition'
        },
        {
          id: 'find2',
          category: 'Display Standards',
          description: 'Product displays meet brand guidelines',
          status: 'compliant',
          priority: 'medium',
          notes: 'Excellent visual merchandising standards'
        }
      ],
      correctiveActions: [],
      nextAudit: '2025-04-15',
      notes: 'Overall excellent compliance with all standards',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      workplaceId: '2',
      workplaceName: '#SamsungZeil (Showcase)/ Fra...',
      workplaceCode: '15235',
      auditType: 'Brand Standards',
      auditorId: 'aud002',
      auditorName: 'Michael Brown',
      auditDate: '2025-01-14',
      status: 'in-progress',
      score: 78,
      maxScore: 100,
      compliance: 'good',
      findings: [
        {
          id: 'find3',
          category: 'Brand Compliance',
          description: 'Logo placement needs adjustment',
          status: 'non-compliant',
          priority: 'high',
          notes: 'Logo positioned incorrectly on display materials'
        },
        {
          id: 'find4',
          category: 'Customer Service',
          description: 'Staff greeting standards met',
          status: 'compliant',
          priority: 'medium',
          notes: 'Excellent customer service observed'
        }
      ],
      correctiveActions: [
        {
          id: 'ca1',
          description: 'Reposition logo according to brand guidelines',
          assignedTo: 'Store Manager',
          dueDate: '2025-01-21',
          status: 'pending'
        }
      ],
      nextAudit: '2025-04-14',
      notes: 'Minor issues identified, corrective actions in progress',
      createdAt: '2025-01-14T00:00:00Z',
      updatedAt: '2025-01-14T00:00:00Z'
    },
    {
      id: '3',
      workplaceId: '3',
      workplaceName: '3K-Kuechen Esslingen/ Essling...',
      workplaceCode: '25280',
      auditType: 'Safety Inspection',
      auditorId: 'aud003',
      auditorName: 'Lisa Garcia',
      auditDate: '2025-01-13',
      status: 'scheduled',
      score: 0,
      maxScore: 100,
      compliance: 'pending',
      findings: [],
      correctiveActions: [],
      nextAudit: '2025-01-20',
      notes: 'Safety inspection scheduled for next week',
      createdAt: '2025-01-13T00:00:00Z',
      updatedAt: '2025-01-13T00:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAudit, setEditingAudit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCompliance, setFilterCompliance] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalAudits: 156,
    completedAudits: 89,
    inProgressAudits: 45,
    scheduledAudits: 22,
    averageScore: 87.5,
    complianceRate: 92.3,
    criticalFindings: 8,
    correctiveActions: 23
  };

  const handleAddAudit = () => {
    setEditingAudit(null);
    setShowAddModal(true);
  };

  const handleEdit = (audit: any) => {
    setEditingAudit(audit);
    setShowAddModal(true);
  };

  const handleDelete = (auditId: string) => {
    setAudits(audits.filter(a => a.id !== auditId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplianceIcon = (compliance: string) => {
    switch (compliance) {
      case 'excellent': return <Award className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'fair': return <AlertTriangle className="h-4 w-4" />;
      case 'poor': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getFindingStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100';
      case 'non-compliant': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.workplaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.auditorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.auditType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || audit.status === filterStatus;
    const matchesType = filterType === 'all' || audit.auditType === filterType;
    const matchesCompliance = filterCompliance === 'all' || audit.compliance === filterCompliance;
    
    return matchesSearch && matchesStatus && matchesType && matchesCompliance;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quality Assurance</h2>
          <p className="text-gray-600">Quality checks and compliance audits</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={handleAddAudit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Audit
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Audits</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalAudits}</p>
              <p className="text-sm text-blue-600">This quarter</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.averageScore}%</p>
              <p className="text-sm text-green-600">+2.3% from last quarter</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.complianceRate}%</p>
              <p className="text-sm text-indigo-600">Standards met</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Critical Findings</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.criticalFindings}</p>
              <p className="text-sm text-orange-600">Require attention</p>
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
                placeholder="Search audits, workplaces..."
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
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Audit Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Store Compliance">Store Compliance</option>
              <option value="Brand Standards">Brand Standards</option>
              <option value="Safety Inspection">Safety Inspection</option>
              <option value="Quality Check">Quality Check</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Compliance</label>
            <select
              value={filterCompliance}
              onChange={(e) => setFilterCompliance(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audits List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Quality Audits</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workplace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audit Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Findings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{audit.workplaceName}</div>
                      <div className="text-sm text-gray-500">{audit.workplaceCode}</div>
                      <div className="text-xs text-gray-400">{audit.auditDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{audit.auditType}</div>
                      <div className="text-sm text-gray-500">{audit.auditorName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${getScoreColor(audit.score)}`}>
                        {audit.score}/{audit.maxScore}
                      </div>
                      <div className="text-sm text-gray-500">
                        {audit.score > 0 ? `${Math.round((audit.score / audit.maxScore) * 100)}%` : 'Pending'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                      {getStatusIcon(audit.status)}
                      <span className="ml-1">{audit.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplianceColor(audit.compliance)}`}>
                      {getComplianceIcon(audit.compliance)}
                      <span className="ml-1">{audit.compliance}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{audit.findings.length} findings</div>
                      <div className="text-sm text-gray-500">
                        {audit.findings.filter(f => f.status === 'non-compliant').length} non-compliant
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(audit)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(audit.id)}
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
                {editingAudit ? 'Edit Audit' : 'Schedule Audit'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {editingAudit ? 'Update audit details' : 'Schedule new quality audit'}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingAudit ? 'Update' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityAssurance; 