import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Eye,
  RefreshCw,
  CreditCard,
  Receipt,
  PiggyBank,
  Target
} from 'lucide-react';

/**
 * Budget Management Component
 * 
 * This component provides comprehensive budget management functionality including:
 * - Track operational costs and budgets
 * - Budget allocation and monitoring
 * - Expense tracking and categorization
 * - Financial reporting and analytics
 * - Cost optimization insights
 * - Budget vs actual analysis
 */
const BudgetManagement: React.FC = () => {
  const [budgets, setBudgets] = useState([
    {
      id: '1',
      workplaceId: '1',
      workplaceName: 'BIG ONE Handels GmbH/ Os...',
      workplaceCode: '20311',
      budgetPeriod: 'Q1 2025',
      category: 'Operations',
      allocatedBudget: 50000,
      spentAmount: 32450,
      remainingBudget: 17550,
      status: 'on-track',
      expenses: [
        {
          id: 'exp1',
          description: 'Employee training materials',
          amount: 2500,
          date: '2025-01-15',
          category: 'Training',
          approvedBy: 'Manager A'
        },
        {
          id: 'exp2',
          description: 'Store maintenance supplies',
          amount: 1800,
          date: '2025-01-14',
          category: 'Maintenance',
          approvedBy: 'Manager A'
        }
      ],
      notes: 'Budget utilization at 64.9%, within target range',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      workplaceId: '2',
      workplaceName: '#SamsungZeil (Showcase)/ Fra...',
      workplaceCode: '15235',
      budgetPeriod: 'Q1 2025',
      category: 'Marketing',
      allocatedBudget: 75000,
      spentAmount: 68900,
      remainingBudget: 6100,
      status: 'at-risk',
      expenses: [
        {
          id: 'exp3',
          description: 'Digital display advertising',
          amount: 45000,
          date: '2025-01-10',
          category: 'Advertising',
          approvedBy: 'Manager B'
        },
        {
          id: 'exp4',
          description: 'Event marketing materials',
          amount: 23900,
          date: '2025-01-12',
          category: 'Events',
          approvedBy: 'Manager B'
        }
      ],
      notes: 'High spending on marketing activities, monitor closely',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '3',
      workplaceId: '3',
      workplaceName: '3K-Kuechen Esslingen/ Essling...',
      workplaceCode: '25280',
      budgetPeriod: 'Q1 2025',
      category: 'Inventory',
      allocatedBudget: 120000,
      spentAmount: 45600,
      remainingBudget: 74400,
      status: 'under-budget',
      expenses: [
        {
          id: 'exp5',
          description: 'Kitchen appliance inventory',
          amount: 45600,
          date: '2025-01-08',
          category: 'Inventory',
          approvedBy: 'Manager C'
        }
      ],
      notes: 'Under budget due to delayed supplier deliveries',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterWorkplace, setFilterWorkplace] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalBudget: 245000,
    totalSpent: 146950,
    totalRemaining: 98050,
    utilizationRate: 60.0,
    budgetsByStatus: {
      'on-track': 45,
      'at-risk': 23,
      'over-budget': 8,
      'under-budget': 34
    },
    averageUtilization: 58.7,
    costSavings: 15600
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    setShowAddModal(true);
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setShowAddModal(true);
  };

  const handleDelete = (budgetId: string) => {
    setBudgets(budgets.filter(b => b.id !== budgetId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-100';
      case 'at-risk': return 'text-orange-600 bg-orange-100';
      case 'over-budget': return 'text-red-600 bg-red-100';
      case 'under-budget': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return <CheckCircle className="h-4 w-4" />;
      case 'at-risk': return <AlertTriangle className="h-4 w-4" />;
      case 'over-budget': return <XCircle className="h-4 w-4" />;
      case 'under-budget': return <TrendingDown className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getUtilizationPercentage = (budget: any) => {
    return Math.round((budget.spentAmount / budget.allocatedBudget) * 100);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage > 90) return 'text-red-600';
    if (percentage > 75) return 'text-orange-600';
    if (percentage > 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.workplaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.budgetPeriod.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || budget.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || budget.category === filterCategory;
    const matchesWorkplace = filterWorkplace === 'all' || budget.workplaceId === filterWorkplace;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesWorkplace;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>
          <p className="text-gray-600">Track operational costs and budget allocation</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={handleAddBudget}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PiggyBank className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">€{dashboardStats.totalBudget.toLocaleString()}</p>
              <p className="text-sm text-blue-600">Q1 2025 allocation</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Receipt className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">€{dashboardStats.totalSpent.toLocaleString()}</p>
              <p className="text-sm text-green-600">{dashboardStats.utilizationRate}% utilized</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">€{dashboardStats.totalRemaining.toLocaleString()}</p>
              <p className="text-sm text-orange-600">Available budget</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cost Savings</p>
              <p className="text-2xl font-bold text-gray-900">€{dashboardStats.costSavings.toLocaleString()}</p>
              <p className="text-sm text-indigo-600">vs. projected</p>
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
                placeholder="Search budgets, workplaces..."
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
              <option value="on-track">On Track</option>
              <option value="at-risk">At Risk</option>
              <option value="over-budget">Over Budget</option>
              <option value="under-budget">Under Budget</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Operations">Operations</option>
              <option value="Marketing">Marketing</option>
              <option value="Inventory">Inventory</option>
              <option value="Training">Training</option>
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

      {/* Budgets List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Budget Overview</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBudgets.map((budget) => {
                const utilizationPercentage = getUtilizationPercentage(budget);
                return (
                  <tr key={budget.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{budget.workplaceName}</div>
                        <div className="text-sm text-gray-500">{budget.workplaceCode}</div>
                        <div className="text-xs text-gray-400">{budget.budgetPeriod}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{budget.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">€{budget.allocatedBudget.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Allocated</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${getUtilizationColor(utilizationPercentage)}`}>
                          {utilizationPercentage}%
                        </div>
                        <div className="text-sm text-gray-500">€{budget.spentAmount.toLocaleString()} spent</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              utilizationPercentage > 90 ? 'bg-red-500' : 
                              utilizationPercentage > 75 ? 'bg-orange-500' : 
                              utilizationPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${utilizationPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                        {getStatusIcon(budget.status)}
                        <span className="ml-1">{budget.status.replace('-', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">€{budget.remainingBudget.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Available</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
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
                );
              })}
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
                {editingBudget ? 'Edit Budget' : 'Add Budget'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {editingBudget ? 'Update budget details' : 'Create new budget allocation'}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingBudget ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagement; 