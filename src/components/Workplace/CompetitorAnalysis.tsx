import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  BarChart3,
  Users,
  Building2,
  Target,
  DollarSign,
  Camera,
  FileText
} from 'lucide-react';

/**
 * Competitor Analysis Component
 * 
 * This component provides comprehensive competitor analysis functionality including:
 * - Monitor competitor activities at workplace locations
 * - Track competitor products and pricing
 * - Analyze market positioning
 * - Competitive intelligence gathering
 * - Performance comparison
 * - Market share analysis
 */
const CompetitorAnalysis: React.FC = () => {
  const [competitors, setCompetitors] = useState([
    {
      id: '1',
      workplaceId: '1',
      workplaceName: 'BIG ONE Handels GmbH/ Os...',
      workplaceCode: '20311',
      competitorName: 'MediaMarkt',
      competitorType: 'Electronics Retailer',
      location: 'Pagenstecherstr. 65, 49090, Osnabrück',
      distance: '0.2 km',
      activities: [
        {
          id: 'act1',
          type: 'product_launch',
          description: 'New iPhone 15 Pro display setup',
          date: '2025-01-15',
          impact: 'high',
          details: 'Large promotional display with demo units'
        },
        {
          id: 'act2',
          type: 'pricing_change',
          description: 'Samsung Galaxy S24 price reduction',
          date: '2025-01-14',
          impact: 'medium',
          details: 'Reduced price by €50 to €849'
        }
      ],
      products: [
        {
          id: 'prod1',
          name: 'Samsung Galaxy S24',
          ourPrice: 899.99,
          theirPrice: 849.99,
          difference: -50,
          status: 'higher'
        },
        {
          id: 'prod2',
          name: 'iPhone 15 Pro',
          ourPrice: 1199.99,
          theirPrice: 1249.99,
          difference: 50,
          status: 'lower'
        }
      ],
      marketShare: 35.2,
      threatLevel: 'high',
      lastVisit: '2025-01-15T10:30:00Z',
      nextVisit: '2025-01-22T10:30:00Z',
      notes: 'Aggressive pricing strategy, strong customer service',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      workplaceId: '2',
      workplaceName: '#SamsungZeil (Showcase)/ Fra...',
      workplaceCode: '15235',
      competitorName: 'Saturn',
      competitorType: 'Electronics Retailer',
      location: 'Zeil 106, 60313, Frankfurt am Main',
      distance: '0.1 km',
      activities: [
        {
          id: 'act3',
          type: 'store_renovation',
          description: 'Store renovation and layout change',
          date: '2025-01-10',
          impact: 'medium',
          details: 'Updated store layout with new Samsung section'
        }
      ],
      products: [
        {
          id: 'prod3',
          name: 'LG OLED TV 65"',
          ourPrice: 2499.99,
          theirPrice: 2399.99,
          difference: -100,
          status: 'higher'
        }
      ],
      marketShare: 28.7,
      threatLevel: 'medium',
      lastVisit: '2025-01-12T14:15:00Z',
      nextVisit: '2025-01-19T14:15:00Z',
      notes: 'Focusing on premium products, good location',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-12T00:00:00Z'
    },
    {
      id: '3',
      workplaceId: '3',
      workplaceName: '3K-Kuechen Esslingen/ Essling...',
      workplaceCode: '25280',
      competitorName: 'Küchen Aktuell',
      competitorType: 'Kitchen Specialist',
      location: 'Heilbronner Str. 45, 73728, Esslingen',
      distance: '0.3 km',
      activities: [
        {
          id: 'act4',
          type: 'promotion',
          description: 'Kitchen appliance bundle promotion',
          date: '2025-01-13',
          impact: 'high',
          details: '20% off on complete kitchen appliance sets'
        }
      ],
      products: [
        {
          id: 'prod4',
          name: 'Bosch Dishwasher',
          ourPrice: 649.99,
          theirPrice: 519.99,
          difference: -130,
          status: 'higher'
        }
      ],
      marketShare: 42.1,
      threatLevel: 'high',
      lastVisit: '2025-01-13T16:45:00Z',
      nextVisit: '2025-01-20T16:45:00Z',
      notes: 'Specialized kitchen retailer, strong local presence',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-13T00:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterThreatLevel, setFilterThreatLevel] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterWorkplace, setFilterWorkplace] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalCompetitors: 89,
    highThreatCompetitors: 23,
    mediumThreatCompetitors: 45,
    lowThreatCompetitors: 21,
    averageMarketShare: 31.2,
    priceAdvantage: 67,
    totalActivities: 156,
    recentActivities: 23
  };

  const handleAddCompetitor = () => {
    setEditingCompetitor(null);
    setShowAddModal(true);
  };

  const handleEdit = (competitor: any) => {
    setEditingCompetitor(competitor);
    setShowAddModal(true);
  };

  const handleDelete = (competitorId: string) => {
    setCompetitors(competitors.filter(c => c.id !== competitorId));
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getThreatLevelIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <TrendingUp className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getPriceStatusColor = (status: string) => {
    switch (status) {
      case 'lower': return 'text-green-600 bg-green-100';
      case 'higher': return 'text-red-600 bg-red-100';
      case 'same': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = competitor.competitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competitor.workplaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competitor.competitorType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesThreatLevel = filterThreatLevel === 'all' || competitor.threatLevel === filterThreatLevel;
    const matchesType = filterType === 'all' || competitor.competitorType === filterType;
    const matchesWorkplace = filterWorkplace === 'all' || competitor.workplaceId === filterWorkplace;
    
    return matchesSearch && matchesThreatLevel && matchesType && matchesWorkplace;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Competitor Analysis</h2>
          <p className="text-gray-600">Monitor competitor activities and market positioning</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={handleAddCompetitor}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Competitors</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalCompetitors}</p>
              <p className="text-sm text-blue-600">Across all locations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Threat</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.highThreatCompetitors}</p>
              <p className="text-sm text-red-600">Requires immediate attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Price Advantage</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.priceAdvantage}%</p>
              <p className="text-sm text-green-600">Competitive pricing</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Market Share</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.averageMarketShare}%</p>
              <p className="text-sm text-indigo-600">Industry average</p>
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
                placeholder="Search competitors, workplaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Threat Level</label>
            <select
              value={filterThreatLevel}
              onChange={(e) => setFilterThreatLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="high">High Threat</option>
              <option value="medium">Medium Threat</option>
              <option value="low">Low Threat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Competitor Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Electronics Retailer">Electronics Retailer</option>
              <option value="Kitchen Specialist">Kitchen Specialist</option>
              <option value="Department Store">Department Store</option>
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

      {/* Competitors List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Competitor Analysis</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workplace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threat Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Share</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Activities</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompetitors.map((competitor) => (
                <tr key={competitor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{competitor.competitorName}</div>
                      <div className="text-sm text-gray-500">{competitor.competitorType}</div>
                      <div className="text-xs text-gray-400">{competitor.distance} away</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{competitor.workplaceName}</div>
                      <div className="text-sm text-gray-500">{competitor.workplaceCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getThreatLevelColor(competitor.threatLevel)}`}>
                      {getThreatLevelIcon(competitor.threatLevel)}
                      <span className="ml-1">{competitor.threatLevel}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{competitor.marketShare}%</div>
                    <div className="text-sm text-gray-500">Market share</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {competitor.activities.slice(0, 2).map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getActivityImpactColor(activity.impact)}`}>
                            {activity.impact}
                          </span>
                          <span className="text-xs text-gray-600">{activity.description}</span>
                        </div>
                      ))}
                      {competitor.activities.length > 2 && (
                        <div className="text-xs text-gray-500">+{competitor.activities.length - 2} more</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(competitor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(competitor.id)}
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
                {editingCompetitor ? 'Edit Competitor' : 'Add Competitor'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {editingCompetitor ? 'Update competitor information' : 'Add new competitor to monitor'}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingCompetitor ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysis; 