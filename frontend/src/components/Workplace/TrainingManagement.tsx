import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
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
  Users,
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  BookOpen
} from 'lucide-react';

/**
 * Training Management Component
 * 
 * This component provides comprehensive training management functionality including:
 * - Employee training tracking and certification
 * - Training program management
 * - Skill assessment and development
 * - Training scheduling and completion tracking
 * - Certification renewal monitoring
 * - Performance improvement tracking
 */
const TrainingManagement: React.FC = () => {
  const [trainings, setTrainings] = useState([
    {
      id: '1',
      employeeId: 'emp001',
      employeeName: 'John Doe',
      workplaceId: '1',
      workplaceName: 'BIG ONE Handels GmbH/ Os...',
      workplaceCode: '20311',
      trainingProgram: 'Product Knowledge - Samsung',
      trainingType: 'Product Training',
      status: 'completed',
      startDate: '2025-01-10',
      completionDate: '2025-01-15',
      duration: 40, // hours
      score: 92,
      maxScore: 100,
      certification: {
        id: 'cert001',
        name: 'Samsung Product Specialist',
        issuedDate: '2025-01-15',
        expiryDate: '2026-01-15',
        status: 'active'
      },
      trainer: 'Sarah Wilson',
      modules: [
        {
          id: 'mod1',
          name: 'Samsung Galaxy Series',
          status: 'completed',
          score: 95
        },
        {
          id: 'mod2',
          name: 'Samsung TV Technology',
          status: 'completed',
          score: 88
        }
      ],
      notes: 'Excellent performance in product training',
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      employeeId: 'emp002',
      employeeName: 'Jane Smith',
      workplaceId: '2',
      workplaceName: '#SamsungZeil (Showcase)/ Fra...',
      workplaceCode: '15235',
      trainingProgram: 'Customer Service Excellence',
      trainingType: 'Soft Skills',
      status: 'in-progress',
      startDate: '2025-01-12',
      completionDate: null,
      duration: 24, // hours
      score: 0,
      maxScore: 100,
      certification: null,
      trainer: 'Michael Brown',
      modules: [
        {
          id: 'mod3',
          name: 'Communication Skills',
          status: 'completed',
          score: 90
        },
        {
          id: 'mod4',
          name: 'Conflict Resolution',
          status: 'in-progress',
          score: 0
        }
      ],
      notes: 'Making good progress in customer service training',
      createdAt: '2025-01-12T00:00:00Z',
      updatedAt: '2025-01-14T00:00:00Z'
    },
    {
      id: '3',
      employeeId: 'emp003',
      employeeName: 'Mike Johnson',
      workplaceId: '3',
      workplaceName: '3K-Kuechen Esslingen/ Essling...',
      workplaceCode: '25280',
      trainingProgram: 'Kitchen Appliance Installation',
      trainingType: 'Technical Training',
      status: 'scheduled',
      startDate: '2025-01-20',
      completionDate: null,
      duration: 60, // hours
      score: 0,
      maxScore: 100,
      certification: null,
      trainer: 'Lisa Garcia',
      modules: [],
      notes: 'Technical training scheduled for next week',
      createdAt: '2025-01-13T00:00:00Z',
      updatedAt: '2025-01-13T00:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterWorkplace, setFilterWorkplace] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalTrainings: 234,
    completedTrainings: 156,
    inProgressTrainings: 45,
    scheduledTrainings: 33,
    averageScore: 87.3,
    certificationRate: 78.5,
    expiringCertifications: 12,
    trainingHours: 2847
  };

  const handleAddTraining = () => {
    setEditingTraining(null);
    setShowAddModal(true);
  };

  const handleEdit = (training: any) => {
    setEditingTraining(training);
    setShowAddModal(true);
  };

  const handleDelete = (trainingId: string) => {
    setTrainings(trainings.filter(t => t.id !== trainingId));
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'expiring-soon': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCertificationStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Award className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      case 'expiring-soon': return <AlertTriangle className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getModuleStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'not-started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.trainingProgram.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.workplaceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || training.status === filterStatus;
    const matchesType = filterType === 'all' || training.trainingType === filterType;
    const matchesWorkplace = filterWorkplace === 'all' || training.workplaceId === filterWorkplace;
    
    return matchesSearch && matchesStatus && matchesType && matchesWorkplace;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Management</h2>
          <p className="text-gray-600">Employee training tracking and certification</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={handleAddTraining}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Training
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Trainings</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalTrainings}</p>
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
              <p className="text-sm text-green-600">+3.2% from last quarter</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Certification Rate</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.certificationRate}%</p>
              <p className="text-sm text-indigo-600">Employees certified</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.expiringCertifications}</p>
              <p className="text-sm text-orange-600">Certifications</p>
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
                placeholder="Search employees, programs..."
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Training Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Product Training">Product Training</option>
              <option value="Soft Skills">Soft Skills</option>
              <option value="Technical Training">Technical Training</option>
              <option value="Safety Training">Safety Training</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Workplace</label>
            <select
              value={filterWorkplace}
              onChange={(e) => setFilterWorkplace(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Workplaces</option>
              <option value="1">BIG ONE Handels GmbH</option>
              <option value="2">SamsungZeil Showcase</option>
              <option value="3">3K-Kuechen Esslingen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trainings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Training Programs</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrainings.map((training) => (
                <tr key={training.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{training.employeeName}</div>
                      <div className="text-sm text-gray-500">{training.workplaceName}</div>
                      <div className="text-xs text-gray-400">{training.workplaceCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{training.trainingProgram}</div>
                      <div className="text-sm text-gray-500">{training.trainingType}</div>
                      <div className="text-xs text-gray-400">{training.duration}h duration</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {training.modules.filter(m => m.status === 'completed').length}/{training.modules.length} modules
                      </div>
                      <div className="text-sm text-gray-500">{training.trainer}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            training.status === 'completed' ? 'bg-green-500' : 
                            training.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                          }`}
                          style={{ 
                            width: `${training.status === 'completed' ? 100 : 
                                   training.status === 'in-progress' ? 
                                   (training.modules.filter(m => m.status === 'completed').length / training.modules.length) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(training.status)}`}>
                      {getStatusIcon(training.status)}
                      <span className="ml-1">{training.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {training.certification ? (
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCertificationStatusColor(training.certification.status)}`}>
                          {getCertificationStatusIcon(training.certification.status)}
                          <span className="ml-1">{training.certification.status}</span>
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          Expires: {training.certification.expiryDate}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No certification</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${getScoreColor(training.score)}`}>
                        {training.score > 0 ? `${training.score}%` : 'Pending'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {training.startDate} - {training.completionDate || 'Ongoing'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(training)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(training.id)}
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
                {editingTraining ? 'Edit Training' : 'Schedule Training'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {editingTraining ? 'Update training details' : 'Schedule new training program'}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingTraining ? 'Update' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingManagement; 