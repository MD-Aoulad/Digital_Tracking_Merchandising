import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Target,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react';

/**
 * Sales Target Management Component
 * 
 * This component provides comprehensive sales target management functionality including:
 * - Set sales targets for workplaces
 * - Track target achievement
 * - Filter and search targets
 * - Analytics and reporting
 * - Target status monitoring
 * - Performance tracking
 */
const SalesTargetManagement: React.FC = () => {
  const [salesTargets, setSalesTargets] = useState([
    {
      id: '1',
      workplaceId: '1',
      workplaceName: 'BIG ONE Handels GmbH/ Os...',
      workplaceCode: '20311',
      targetAmount: 50000,
      achievedAmount: 42000,
      period: 'Q4 2025',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      status: 'in-progress',
      assignedTo: 'John Doe',
      notes: 'Focus on electronics and kitchen appliances',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      workplaceId: '2',
      workplaceName: '#SamsungZeil (Showcase)/ Fra...',
      workplaceCode: '15235',
      targetAmount: 75000,
      achievedAmount: 78000,
      period: 'Q4 2025',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      status: 'achieved',
      assignedTo: 'Jane Smith',
      notes: 'Premium location with high foot traffic',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '3',
      workplaceId: '3',
      workplaceName: '3K-Kuechen Esslingen/ Essling...',
      workplaceCode: '25280',
      targetAmount: 35000,
      achievedAmount: 28000,
      period: 'Q4 2025',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      status: 'at-risk',
      assignedTo: 'Mike Johnson',
      notes: 'Kitchen specialty store',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalTargets: 45,
    totalTargetAmount: 2500000,
    totalAchievedAmount: 2100000,
    achievementRate: 84,
    targetsByStatus: {
      achieved: 18,
      'in-progress': 20,
      'at-risk': 5,
      'not-started': 2
    }
  };

  const handleAddTarget = () => {
    setEditingTarget(null);
    setShowAddModal(true);
  };

  const handleEdit = (target: any) => {
    setEditingTarget(target);
    setShowAddModal(true);
  };

  const handleDelete = (targetId: string) => {
    setSalesTargets(salesTargets.filter(t => t.id !== targetId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'at-risk': return 'text-orange-600 bg-orange-100';
      case 'not-started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <TrendingUp className="h-4 w-4" />;
      case 'at-risk': return <AlertCircle className="h-4 w-4" />;
      case 'not-started': return <XCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const getAchievementPercentage = (target: any) => {
    return Math.round((target.achievedAmount / target.targetAmount) * 100);
  };

  const filteredTargets = salesTargets.filter(target => {
    const matchesSearch = target.workplaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.workplaceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || target.status === filterStatus;
    const matchesPeriod = filterPeriod === 'all' || target.period === filterPeriod;
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Target Management</h2>
          <p className="text-gray-600">Set and track sales targets for each workplace</p>
        </div>
        <button
          onClick={handleAddTarget}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Sales Target
        </button>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Targets</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalTargets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Target Amount</p>
              <p className="text-2xl font-bold text-gray-900">€{dashboardStats.totalTargetAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Achievement Rate</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.achievementRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">At Risk</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.targetsByStatus['at-risk']}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Target Status Breakdown</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dashboardStats.targetsByStatus.achieved}</div>
              <div className="text-sm text-gray-600">Achieved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dashboardStats.targetsByStatus['in-progress']}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{dashboardStats.targetsByStatus['at-risk']}</div>
              <div className="text-sm text-gray-600">At Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{dashboardStats.targetsByStatus['not-started']}</div>
              <div className="text-sm text-gray-600">Not Started</div>
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
                  placeholder="Search workplaces, codes, or assigned employees..."
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
                <option value="achieved">Achieved</option>
                <option value="in-progress">In Progress</option>
                <option value="at-risk">At Risk</option>
                <option value="not-started">Not Started</option>
              </select>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Periods</option>
                <option value="Q4 2025">Q4 2025</option>
                <option value="Q3 2025">Q3 2025</option>
                <option value="Q2 2025">Q2 2025</option>
                <option value="Q1 2025">Q1 2025</option>
              </select>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Targets List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workplace
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Achieved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTargets.map((target) => (
                <tr key={target.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{target.workplaceName}</div>
                      <div className="text-sm text-gray-500">{target.workplaceCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">€{target.targetAmount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">€{target.achievedAmount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            getAchievementPercentage(target) >= 100 ? 'bg-green-500' :
                            getAchievementPercentage(target) >= 75 ? 'bg-blue-500' :
                            getAchievementPercentage(target) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(getAchievementPercentage(target), 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{getAchievementPercentage(target)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(target.status)}`}>
                      {getStatusIcon(target.status)}
                      <span className="ml-1">{target.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {target.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {target.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(target)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(target.id)}
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
                {editingTarget ? 'Edit Sales Target' : 'Add Sales Target'}
              </h3>
              <form className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700">Target Amount (€)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Period</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Q4 2025</option>
                    <option>Q3 2025</option>
                    <option>Q2 2025</option>
                    <option>Q1 2025</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Employee name"
                  />
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
                    {editingTarget ? 'Update' : 'Create'}
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

export default SalesTargetManagement; 