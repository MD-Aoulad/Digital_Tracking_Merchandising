import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Brain,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  RefreshCw,
  Target,
  BarChart3,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Activity,
  Zap,
  Lightbulb
} from 'lucide-react';

/**
 * Predictive Analytics Component
 * 
 * This component provides comprehensive predictive analytics functionality including:
 * - AI-powered performance predictions
 * - Sales forecasting and trend analysis
 * - Employee performance predictions
 * - Operational efficiency insights
 * - Risk assessment and mitigation
 * - Strategic planning recommendations
 */
const PredictiveAnalytics: React.FC = () => {
  const [predictions, setPredictions] = useState([
    {
      id: '1',
      workplaceId: '1',
      workplaceName: 'BIG ONE Handels GmbH/ Os...',
      workplaceCode: '20311',
      predictionType: 'sales-forecast',
      metric: 'Monthly Sales',
      currentValue: 125000,
      predictedValue: 142000,
      confidence: 87,
      timeframe: 'next-month',
      factors: [
        {
          name: 'Seasonal Trends',
          impact: 'positive',
          weight: 0.3,
          description: 'Q1 typically shows 15% increase'
        },
        {
          name: 'Marketing Campaign',
          impact: 'positive',
          weight: 0.25,
          description: 'New product launch expected'
        },
        {
          name: 'Economic Conditions',
          impact: 'neutral',
          weight: 0.2,
          description: 'Stable economic indicators'
        }
      ],
      recommendations: [
        'Increase inventory for new products',
        'Schedule additional staff for peak hours',
        'Prepare marketing materials for launch'
      ],
      riskFactors: [
        {
          name: 'Supply Chain Delays',
          probability: 15,
          impact: 'medium',
          mitigation: 'Order inventory 2 weeks early'
        }
      ],
      lastUpdated: '2025-01-15T10:00:00Z',
      nextUpdate: '2025-01-22T10:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      workplaceId: '2',
      workplaceName: '#SamsungZeil (Showcase)/ Fra...',
      workplaceCode: '15235',
      predictionType: 'employee-performance',
      metric: 'Customer Satisfaction Score',
      currentValue: 4.2,
      predictedValue: 4.5,
      confidence: 92,
      timeframe: 'next-quarter',
      factors: [
        {
          name: 'Training Completion',
          impact: 'positive',
          weight: 0.4,
          description: 'Staff completed customer service training'
        },
        {
          name: 'Product Knowledge',
          impact: 'positive',
          weight: 0.35,
          description: 'Enhanced product expertise'
        }
      ],
      recommendations: [
        'Continue training programs',
        'Implement customer feedback system',
        'Recognize top performers'
      ],
      riskFactors: [
        {
          name: 'Staff Turnover',
          probability: 10,
          impact: 'low',
          mitigation: 'Improve employee retention programs'
        }
      ],
      lastUpdated: '2025-01-14T14:30:00Z',
      nextUpdate: '2025-01-21T14:30:00Z',
      status: 'active'
    },
    {
      id: '3',
      workplaceId: '3',
      workplaceName: '3K-Kuechen Esslingen/ Essling...',
      workplaceCode: '25280',
      predictionType: 'operational-efficiency',
      metric: 'Inventory Turnover Rate',
      currentValue: 8.5,
      predictedValue: 7.2,
      confidence: 78,
      timeframe: 'next-quarter',
      factors: [
        {
          name: 'Seasonal Demand',
          impact: 'negative',
          weight: 0.45,
          description: 'Winter slowdown expected'
        },
        {
          name: 'Supplier Performance',
          impact: 'neutral',
          weight: 0.3,
          description: 'Stable supplier relationships'
        }
      ],
      recommendations: [
        'Reduce inventory levels',
        'Focus on high-turnover items',
        'Negotiate better supplier terms'
      ],
      riskFactors: [
        {
          name: 'Supply Chain Disruption',
          probability: 25,
          impact: 'high',
          mitigation: 'Diversify supplier base'
        }
      ],
      lastUpdated: '2025-01-13T16:00:00Z',
      nextUpdate: '2025-01-20T16:00:00Z',
      status: 'active'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrediction, setEditingPrediction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTimeframe, setFilterTimeframe] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalPredictions: 89,
    highConfidencePredictions: 67,
    averageConfidence: 85.7,
    accuracyRate: 92.3,
    predictionsByType: {
      'sales-forecast': 34,
      'employee-performance': 28,
      'operational-efficiency': 27
    },
    activeInsights: 156,
    riskAlerts: 12
  };

  const handleAddPrediction = () => {
    setEditingPrediction(null);
    setShowAddModal(true);
  };

  const handleEdit = (prediction: any) => {
    setEditingPrediction(prediction);
    setShowAddModal(true);
  };

  const handleDelete = (predictionId: string) => {
    setPredictions(predictions.filter(p => p.id !== predictionId));
  };

  const getPredictionTypeColor = (type: string) => {
    switch (type) {
      case 'sales-forecast': return 'text-blue-600 bg-blue-100';
      case 'employee-performance': return 'text-green-600 bg-green-100';
      case 'operational-efficiency': return 'text-purple-600 bg-purple-100';
      case 'risk-assessment': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPredictionTypeIcon = (type: string) => {
    switch (type) {
      case 'sales-forecast': return <DollarSign className="h-4 w-4" />;
      case 'employee-performance': return <Users className="h-4 w-4" />;
      case 'operational-efficiency': return <Activity className="h-4 w-4" />;
      case 'risk-assessment': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 80) return 'text-blue-600 bg-blue-100';
    if (confidence >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <TrendingUp className="h-4 w-4" />;
    if (confidence >= 80) return <Target className="h-4 w-4" />;
    if (confidence >= 70) return <AlertTriangle className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const filteredPredictions = predictions.filter(prediction => {
    const matchesSearch = prediction.workplaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prediction.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prediction.predictionType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || prediction.predictionType === filterType;
    const matchesTimeframe = filterTimeframe === 'all' || prediction.timeframe === filterTimeframe;
    const matchesConfidence = filterConfidence === 'all' || 
      (filterConfidence === 'high' && prediction.confidence >= 90) ||
      (filterConfidence === 'medium' && prediction.confidence >= 80 && prediction.confidence < 90) ||
      (filterConfidence === 'low' && prediction.confidence < 80);
    
    return matchesSearch && matchesType && matchesTimeframe && matchesConfidence;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
          <p className="text-gray-600">AI-powered performance predictions and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Models
          </button>
          <button
            onClick={handleAddPrediction}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Prediction
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Predictions</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalPredictions}</p>
              <p className="text-sm text-blue-600">Active models</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.averageConfidence}%</p>
              <p className="text-sm text-green-600">Model accuracy</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Accuracy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.accuracyRate}%</p>
              <p className="text-sm text-indigo-600">Prediction success</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Lightbulb className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Insights</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeInsights}</p>
              <p className="text-sm text-orange-600">Generated today</p>
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
                placeholder="Search predictions, metrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prediction Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="sales-forecast">Sales Forecast</option>
              <option value="employee-performance">Employee Performance</option>
              <option value="operational-efficiency">Operational Efficiency</option>
              <option value="risk-assessment">Risk Assessment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              value={filterTimeframe}
              onChange={(e) => setFilterTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Timeframes</option>
              <option value="next-week">Next Week</option>
              <option value="next-month">Next Month</option>
              <option value="next-quarter">Next Quarter</option>
              <option value="next-year">Next Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confidence</label>
            <select
              value={filterConfidence}
              onChange={(e) => setFilterConfidence(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="high">High (90%+)</option>
              <option value="medium">Medium (80-89%)</option>
              <option value="low">Low (&lt;80%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Predictions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">AI Predictions</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workplace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Factors</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPredictions.map((prediction) => (
                <tr key={prediction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{prediction.metric}</div>
                      <div className="text-sm text-gray-500">{prediction.timeframe.replace('-', ' ')}</div>
                      <div className="text-xs text-gray-400">
                        Current: {typeof prediction.currentValue === 'number' && prediction.currentValue > 1000 
                          ? formatCurrency(prediction.currentValue) 
                          : prediction.currentValue}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{prediction.workplaceName}</div>
                      <div className="text-sm text-gray-500">{prediction.workplaceCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPredictionTypeColor(prediction.predictionType)}`}>
                      {getPredictionTypeIcon(prediction.predictionType)}
                      <span className="ml-1">{prediction.predictionType.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {typeof prediction.predictedValue === 'number' && prediction.predictedValue > 1000 
                          ? formatCurrency(prediction.predictedValue) 
                          : prediction.predictedValue}
                      </div>
                      <div className="text-sm text-gray-500">
                        {prediction.predictedValue > prediction.currentValue ? '+' : ''}
                        {((prediction.predictedValue - prediction.currentValue) / prediction.currentValue * 100).toFixed(1)}% change
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                      {getConfidenceIcon(prediction.confidence)}
                      <span className="ml-1">{prediction.confidence}%</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {prediction.riskFactors.slice(0, 2).map((risk, index) => (
                        <span key={index} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRiskImpactColor(risk.impact)}`}>
                          {risk.impact}: {risk.probability}%
                        </span>
                      ))}
                      {prediction.riskFactors.length > 2 && (
                        <div className="text-xs text-gray-500">+{prediction.riskFactors.length - 2} more</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(prediction)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prediction.id)}
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
                {editingPrediction ? 'Edit Prediction' : 'New Prediction'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {editingPrediction ? 'Update prediction details' : 'Create new AI prediction model'}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingPrediction ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics; 