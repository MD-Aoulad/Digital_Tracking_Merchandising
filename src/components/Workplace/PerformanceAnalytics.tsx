import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search,
  PieChart,
  Activity,
  Award,
  Clock,
  Building2
} from 'lucide-react';

/**
 * Performance Analytics Component
 * 
 * This component provides comprehensive performance analytics functionality including:
 * - Workplace performance metrics
 * - Employee performance tracking
 * - Sales performance analysis
 * - Location accuracy tracking
 * - Compliance and efficiency metrics
 * - Custom reports and insights
 */
const PerformanceAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'workplace' | 'employee' | 'sales' | 'location' | 'reports'>('overview');
  const [dateRange, setDateRange] = useState<string>('last-30-days');

  // Dashboard statistics
  const dashboardStats = {
    totalWorkplaces: 5741,
    activeWorkplaces: 5420,
    totalEmployees: 205,
    totalSales: 8500000,
    averagePerformance: 87.5,
    locationAccuracy: 94.2,
    complianceRate: 91.8,
    efficiencyScore: 88.3
  };

  // Performance breakdowns
  const performanceBreakdown = {
    workplacePerformance: {
      excellent: 1245,
      good: 2845,
      average: 1234,
      needsImprovement: 417
    },
    employeePerformance: {
      topPerformers: 45,
      goodPerformers: 89,
      averagePerformers: 56,
      needsSupport: 15
    },
    salesPerformance: {
      exceeded: 2341,
      met: 2845,
      below: 555
    }
  };

  // Recent activity
  const recentActivity = [
    {
      id: '1',
      type: 'workplace',
      action: 'Performance improved',
      details: 'BIG ONE Handels GmbH/ Os... achieved 95% efficiency',
      timestamp: '2025-01-15T10:30:00Z',
      status: 'positive'
    },
    {
      id: '2',
      type: 'employee',
      action: 'Employee assigned',
      details: 'John Doe assigned to Samsung Store - performance tracking started',
      timestamp: '2025-01-15T09:15:00Z',
      status: 'neutral'
    },
    {
      id: '3',
      type: 'sales',
      action: 'Sales target exceeded',
      details: 'LG Electronics Store exceeded Q4 target by 15%',
      timestamp: '2025-01-14T16:45:00Z',
      status: 'positive'
    },
    {
      id: '4',
      type: 'location',
      action: 'Location accuracy updated',
      details: '3K-Kuechen Esslingen location verified with 98% accuracy',
      timestamp: '2025-01-14T14:20:00Z',
      status: 'positive'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'positive': return <TrendingUp className="h-4 w-4" />;
      case 'negative': return <TrendingDown className="h-4 w-4" />;
      case 'neutral': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'workplace', name: 'Workplace Performance', icon: Building2 },
    { id: 'employee', name: 'Employee Performance', icon: Users },
    { id: 'sales', name: 'Sales Performance', icon: DollarSign },
    { id: 'location', name: 'Location Accuracy', icon: MapPin },
    { id: 'reports', name: 'Reports', icon: Download }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="last-7-days">Last 7 days</option>
            <option value="last-30-days">Last 30 days</option>
            <option value="last-90-days">Last 90 days</option>
            <option value="last-year">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Workplaces</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalWorkplaces.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+2.3% from last month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalEmployees}</p>
                  <p className="text-sm text-green-600">+5.1% from last month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">€{(dashboardStats.totalSales / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-green-600">+8.7% from last month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Performance</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.averagePerformance}%</p>
                  <p className="text-sm text-green-600">+1.2% from last month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workplace Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Excellent</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{performanceBreakdown.workplacePerformance.excellent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Good</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{performanceBreakdown.workplacePerformance.good}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Average</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{performanceBreakdown.workplacePerformance.average}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Needs Improvement</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{performanceBreakdown.workplacePerformance.needsImprovement}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Top Performers</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{performanceBreakdown.employeePerformance.topPerformers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Good Performers</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{performanceBreakdown.employeePerformance.goodPerformers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Average Performers</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{performanceBreakdown.employeePerformance.averagePerformers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Needs Support</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{performanceBreakdown.employeePerformance.needsSupport}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Exceeded Targets</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{performanceBreakdown.salesPerformance.exceeded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Met Targets</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{performanceBreakdown.salesPerformance.met}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Below Targets</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{performanceBreakdown.salesPerformance.below}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {getStatusIcon(activity.status)}
                        <span className="ml-1">{activity.action}</span>
                      </span>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{activity.details}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workplace Performance Tab */}
      {activeTab === 'workplace' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workplace Performance Analytics</h3>
          <p className="text-gray-600 mb-6">Detailed analytics on workplace performance, efficiency, and productivity metrics.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Performance Trends</h3>
              <p className="mt-1 text-sm text-gray-500">Workplace performance trends over time will be displayed here.</p>
            </div>
            
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <PieChart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Efficiency Distribution</h3>
              <p className="mt-1 text-sm text-gray-500">Distribution of workplace efficiency scores will be shown here.</p>
            </div>
          </div>
        </div>
      )}

      {/* Employee Performance Tab */}
      {activeTab === 'employee' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Performance Analytics</h3>
          <p className="text-gray-600 mb-6">Comprehensive employee performance tracking and analysis.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Employee Rankings</h3>
              <p className="mt-1 text-sm text-gray-500">Employee performance rankings and leaderboards will be displayed here.</p>
            </div>
            
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Performance Metrics</h3>
              <p className="mt-1 text-sm text-gray-500">Individual employee performance metrics and KPIs will be shown here.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sales Performance Tab */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance Analytics</h3>
          <p className="text-gray-600 mb-6">Sales performance analysis and revenue tracking.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Revenue Trends</h3>
              <p className="mt-1 text-sm text-gray-500">Sales revenue trends and projections will be displayed here.</p>
            </div>
            
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Target Achievement</h3>
              <p className="mt-1 text-sm text-gray-500">Sales target achievement rates and analysis will be shown here.</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Accuracy Tab */}
      {activeTab === 'location' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Accuracy Analytics</h3>
          <p className="text-gray-600 mb-6">GPS location accuracy and verification tracking.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Location Accuracy</h3>
              <p className="mt-1 text-sm text-gray-500">GPS location accuracy metrics and verification rates will be displayed here.</p>
            </div>
            
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Verification Status</h3>
              <p className="mt-1 text-sm text-gray-500">Location verification status and compliance tracking will be shown here.</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Reports</h3>
          <p className="text-gray-600 mb-6">Generate and download custom performance reports.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Download className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Report Generator</h3>
              <p className="mt-1 text-sm text-gray-500">Custom report generation tools will be available here.</p>
            </div>
            
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Eye className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Report Library</h3>
              <p className="mt-1 text-sm text-gray-500">Pre-built report templates and saved reports will be shown here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceAnalytics; 