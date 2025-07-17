import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Cloud,
  Search,
  Filter,
  Download,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Eye,
  RefreshCw,
  MapPin,
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Thermometer,
  Umbrella,
  AlertTriangle
} from 'lucide-react';

/**
 * Weather Integration Component
 * 
 * This component provides comprehensive weather integration functionality including:
 * - Weather impact on operations
 * - Weather-based planning and scheduling
 * - Weather alerts and notifications
 * - Operational adjustments based on weather
 * - Weather analytics and reporting
 * - Seasonal planning tools
 */
const WeatherIntegration: React.FC = () => {
  const [weatherData, setWeatherData] = useState([
    {
      id: '1',
      workplaceId: '1',
      workplaceName: 'BIG ONE Handels GmbH/ Os...',
      workplaceCode: '20311',
      location: 'Osnabrück, Germany',
      date: '2025-01-16',
      currentWeather: {
        temperature: 8,
        feelsLike: 5,
        humidity: 75,
        windSpeed: 15,
        condition: 'cloudy',
        description: 'Partly cloudy with light rain'
      },
      forecast: [
        {
          time: '09:00',
          temperature: 6,
          condition: 'cloudy',
          precipitation: 20
        },
        {
          time: '12:00',
          temperature: 9,
          condition: 'partly-cloudy',
          precipitation: 10
        },
        {
          time: '15:00',
          temperature: 7,
          condition: 'rainy',
          precipitation: 80
        }
      ],
      impact: {
        footTraffic: 'reduced',
        deliveryDelays: 'moderate',
        outdoorActivities: 'limited',
        energyUsage: 'increased'
      },
      alerts: [
        {
          type: 'rain',
          severity: 'moderate',
          description: 'Light rain expected in afternoon'
        }
      ],
      operationalAdjustments: [
        'Increase indoor marketing focus',
        'Prepare for delivery delays',
        'Adjust staffing for reduced foot traffic'
      ],
      createdAt: '2025-01-16T06:00:00Z',
      updatedAt: '2025-01-16T06:00:00Z'
    },
    {
      id: '2',
      workplaceId: '2',
      workplaceName: '#SamsungZeil (Showcase)/ Fra...',
      workplaceCode: '15235',
      location: 'Frankfurt am Main, Germany',
      date: '2025-01-16',
      currentWeather: {
        temperature: 12,
        feelsLike: 10,
        humidity: 65,
        windSpeed: 20,
        condition: 'sunny',
        description: 'Clear skies with moderate wind'
      },
      forecast: [
        {
          time: '09:00',
          temperature: 10,
          condition: 'sunny',
          precipitation: 0
        },
        {
          time: '12:00',
          temperature: 14,
          condition: 'sunny',
          precipitation: 0
        },
        {
          time: '15:00',
          temperature: 11,
          condition: 'partly-cloudy',
          precipitation: 5
        }
      ],
      impact: {
        footTraffic: 'normal',
        deliveryDelays: 'minimal',
        outdoorActivities: 'good',
        energyUsage: 'normal'
      },
      alerts: [],
      operationalAdjustments: [
        'Maintain normal operations',
        'Good conditions for outdoor displays'
      ],
      createdAt: '2025-01-16T06:00:00Z',
      updatedAt: '2025-01-16T06:00:00Z'
    },
    {
      id: '3',
      workplaceId: '3',
      workplaceName: '3K-Kuechen Esslingen/ Essling...',
      workplaceCode: '25280',
      location: 'Esslingen, Germany',
      date: '2025-01-16',
      currentWeather: {
        temperature: 5,
        feelsLike: 2,
        humidity: 85,
        windSpeed: 25,
        condition: 'snowy',
        description: 'Light snow with strong winds'
      },
      forecast: [
        {
          time: '09:00',
          temperature: 3,
          condition: 'snowy',
          precipitation: 90
        },
        {
          time: '12:00',
          temperature: 4,
          condition: 'snowy',
          precipitation: 70
        },
        {
          time: '15:00',
          temperature: 2,
          condition: 'cloudy',
          precipitation: 30
        }
      ],
      impact: {
        footTraffic: 'significantly-reduced',
        deliveryDelays: 'high',
        outdoorActivities: 'cancelled',
        energyUsage: 'high'
      },
      alerts: [
        {
          type: 'snow',
          severity: 'high',
          description: 'Heavy snow expected, travel disruptions likely'
        }
      ],
      operationalAdjustments: [
        'Reduce staffing due to weather',
        'Prepare for delivery cancellations',
        'Focus on online sales and support',
        'Ensure heating systems are working'
      ],
      createdAt: '2025-01-16T06:00:00Z',
      updatedAt: '2025-01-16T06:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWeather, setEditingWeather] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');
  const [filterWorkplace, setFilterWorkplace] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalLocations: 45,
    sunnyLocations: 18,
    rainyLocations: 15,
    snowyLocations: 8,
    cloudyLocations: 4,
    averageTemperature: 8.5,
    weatherAlerts: 6,
    operationalAdjustments: 23
  };

  const handleAddWeather = () => {
    setEditingWeather(null);
    setShowAddModal(true);
  };

  const handleEdit = (weather: any) => {
    setEditingWeather(weather);
    setShowAddModal(true);
  };

  const handleDelete = (weatherId: string) => {
    setWeatherData(weatherData.filter(w => w.id !== weatherId));
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'partly-cloudy': return <Cloud className="h-6 w-6 text-blue-400" />;
      case 'rainy': return <CloudRain className="h-6 w-6 text-blue-600" />;
      case 'snowy': return <CloudSnow className="h-6 w-6 text-blue-300" />;
      case 'windy': return <Wind className="h-6 w-6 text-gray-400" />;
      default: return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  const getWeatherColor = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'text-yellow-600 bg-yellow-100';
      case 'cloudy': return 'text-gray-600 bg-gray-100';
      case 'partly-cloudy': return 'text-blue-600 bg-blue-100';
      case 'rainy': return 'text-blue-600 bg-blue-100';
      case 'snowy': return 'text-blue-300 bg-blue-50';
      case 'windy': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'reduced': return 'text-orange-600 bg-orange-100';
      case 'significantly-reduced': return 'text-red-600 bg-red-100';
      case 'minimal': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredWeatherData = weatherData.filter(weather => {
    const matchesSearch = weather.workplaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         weather.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCondition = filterCondition === 'all' || weather.currentWeather.condition === filterCondition;
    const matchesImpact = filterImpact === 'all' || weather.impact.footTraffic === filterImpact;
    const matchesWorkplace = filterWorkplace === 'all' || weather.workplaceId === filterWorkplace;
    
    return matchesSearch && matchesCondition && matchesImpact && matchesWorkplace;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weather Integration</h2>
          <p className="text-gray-600">Weather impact on operations and planning</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
          <button
            onClick={handleAddWeather}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalLocations}</p>
              <p className="text-sm text-blue-600">Weather monitored</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Thermometer className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Temperature</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.averageTemperature}°C</p>
              <p className="text-sm text-orange-600">Across all locations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Weather Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.weatherAlerts}</p>
              <p className="text-sm text-red-600">Active alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Adjustments</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.operationalAdjustments}</p>
              <p className="text-sm text-indigo-600">Made today</p>
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
                placeholder="Search locations, workplaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weather Condition</label>
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Conditions</option>
              <option value="sunny">Sunny</option>
              <option value="cloudy">Cloudy</option>
              <option value="partly-cloudy">Partly Cloudy</option>
              <option value="rainy">Rainy</option>
              <option value="snowy">Snowy</option>
              <option value="windy">Windy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foot Traffic Impact</label>
            <select
              value={filterImpact}
              onChange={(e) => setFilterImpact(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Impacts</option>
              <option value="normal">Normal</option>
              <option value="reduced">Reduced</option>
              <option value="significantly-reduced">Significantly Reduced</option>
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

      {/* Weather Data List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Weather Data</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Weather</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWeatherData.map((weather) => (
                <tr key={weather.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{weather.workplaceName}</div>
                      <div className="text-sm text-gray-500">{weather.location}</div>
                      <div className="text-xs text-gray-400">{weather.date}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {getWeatherIcon(weather.currentWeather.condition)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {weather.currentWeather.temperature}°C
                        </div>
                        <div className="text-sm text-gray-500">
                          Feels like {weather.currentWeather.feelsLike}°C
                        </div>
                        <div className="text-xs text-gray-400">
                          {weather.currentWeather.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {weather.forecast.slice(0, 2).map((forecast, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{forecast.time}</span>
                          <span className="text-xs font-medium">{forecast.temperature}°C</span>
                          {getWeatherIcon(forecast.condition)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getImpactColor(weather.impact.footTraffic)}`}>
                          Traffic: {weather.impact.footTraffic}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getImpactColor(weather.impact.deliveryDelays)}`}>
                          Delivery: {weather.impact.deliveryDelays}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {weather.alerts.length > 0 ? (
                        weather.alerts.map((alert, index) => (
                          <span key={index} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getAlertSeverityColor(alert.severity)}`}>
                            {alert.type}: {alert.severity}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No alerts</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(weather)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(weather.id)}
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
                {editingWeather ? 'Edit Weather Data' : 'Add Weather Location'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {editingWeather ? 'Update weather information' : 'Add new location for weather monitoring'}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingWeather ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherIntegration; 