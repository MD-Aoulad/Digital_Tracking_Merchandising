import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Search,
  Filter,
  Download,
  Navigation,
  Clock,
  Car,
  Users,
  Calendar,
  BarChart3,
  Eye,
  RefreshCw,
  Route,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react';

/**
 * Route Optimization Component
 * 
 * This component provides comprehensive route optimization functionality including:
 * - Optimize employee travel routes between workplaces
 * - Multi-stop route planning
 * - Time and distance optimization
 * - Fuel cost calculation
 * - Route analytics and reporting
 * - Real-time traffic integration
 */
const RouteOptimization: React.FC = () => {
  const [routes, setRoutes] = useState([
    {
      id: '1',
      routeName: 'Osnabrück Circuit',
      employeeId: 'emp001',
      employeeName: 'John Doe',
      date: '2025-01-16',
      status: 'optimized',
      totalDistance: 45.2,
      totalTime: 85,
      fuelCost: 12.50,
      stops: [
        {
          id: 'stop1',
          workplaceId: '1',
          workplaceName: 'BIG ONE Handels GmbH/ Os...',
          workplaceCode: '20311',
          address: 'Pagenstecherstr. 63 a, 49090, Osnabrück',
          order: 1,
          estimatedTime: '09:00',
          duration: 120,
          coordinates: { lat: 52.2799, lng: 8.0472 }
        },
        {
          id: 'stop2',
          workplaceId: '4',
          workplaceName: 'MediaMarkt Osnabrück',
          workplaceCode: '20312',
          address: 'Pagenstecherstr. 65, 49090, Osnabrück',
          order: 2,
          estimatedTime: '11:30',
          duration: 90,
          coordinates: { lat: 52.2801, lng: 8.0475 }
        },
        {
          id: 'stop3',
          workplaceId: '5',
          workplaceName: 'Saturn Osnabrück',
          workplaceCode: '20313',
          address: 'Pagenstecherstr. 70, 49090, Osnabrück',
          order: 3,
          estimatedTime: '13:15',
          duration: 60,
          coordinates: { lat: 52.2805, lng: 8.0480 }
        }
      ],
      optimization: {
        algorithm: 'genetic',
        savings: 15.3,
        timeReduction: 12.5,
        fuelSavings: 8.2
      },
      notes: 'Optimized route reduces travel time by 12.5%',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      routeName: 'Frankfurt Showcase Tour',
      employeeId: 'emp002',
      employeeName: 'Jane Smith',
      date: '2025-01-16',
      status: 'pending',
      totalDistance: 28.7,
      totalTime: 65,
      fuelCost: 8.90,
      stops: [
        {
          id: 'stop4',
          workplaceId: '2',
          workplaceName: '#SamsungZeil (Showcase)/ Fra...',
          workplaceCode: '15235',
          address: 'Zeil 119, 60313, Frankfurt am Main',
          order: 1,
          estimatedTime: '10:00',
          duration: 180,
          coordinates: { lat: 50.1109, lng: 8.6821 }
        },
        {
          id: 'stop5',
          workplaceId: '6',
          workplaceName: 'Saturn Frankfurt',
          workplaceCode: '15236',
          address: 'Zeil 106, 60313, Frankfurt am Main',
          order: 2,
          estimatedTime: '13:30',
          duration: 120,
          coordinates: { lat: 50.1105, lng: 8.6815 }
        }
      ],
      optimization: {
        algorithm: 'nearest_neighbor',
        savings: 8.7,
        timeReduction: 5.2,
        fuelSavings: 3.1
      },
      notes: 'Route needs optimization for better efficiency',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '3',
      routeName: 'Esslingen Kitchen Route',
      employeeId: 'emp003',
      employeeName: 'Mike Johnson',
      date: '2025-01-16',
      status: 'completed',
      totalDistance: 32.1,
      totalTime: 75,
      fuelCost: 9.80,
      stops: [
        {
          id: 'stop6',
          workplaceId: '3',
          workplaceName: '3K-Kuechen Esslingen/ Essling...',
          workplaceCode: '25280',
          address: 'Heilbronner Str. 50, 73728, Esslingen',
          order: 1,
          estimatedTime: '08:00',
          duration: 240,
          coordinates: { lat: 48.7426, lng: 9.3201 }
        },
        {
          id: 'stop7',
          workplaceId: '7',
          workplaceName: 'Küchen Aktuell Esslingen',
          workplaceCode: '25281',
          address: 'Heilbronner Str. 45, 73728, Esslingen',
          order: 2,
          estimatedTime: '12:30',
          duration: 90,
          coordinates: { lat: 48.7420, lng: 9.3195 }
        }
      ],
      optimization: {
        algorithm: 'genetic',
        savings: 22.1,
        timeReduction: 18.7,
        fuelSavings: 12.5
      },
      notes: 'Excellent route optimization with 22.1% savings',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalRoutes: 156,
    optimizedRoutes: 89,
    pendingRoutes: 45,
    completedRoutes: 22,
    totalDistance: 2847.5,
    totalTime: 12450,
    totalFuelCost: 892.50,
    averageSavings: 18.7,
    totalSavings: 156.80
  };

  const handleAddRoute = () => {
    setEditingRoute(null);
    setShowAddModal(true);
  };

  const handleEdit = (route: any) => {
    setEditingRoute(route);
    setShowAddModal(true);
  };

  const handleDelete = (routeId: string) => {
    setRoutes(routes.filter(r => r.id !== routeId));
  };

  const handleOptimize = (routeId: string) => {
    // Placeholder for optimization logic
    console.log('Optimizing route:', routeId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimized': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimized': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <Target className="h-4 w-4" />;
      case 'in-progress': return <RefreshCw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || route.status === filterStatus;
    const matchesEmployee = filterEmployee === 'all' || route.employeeId === filterEmployee;
    const matchesDate = filterDate === 'all' || route.date === filterDate;
    
    return matchesSearch && matchesStatus && matchesEmployee && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Route Optimization</h2>
          <p className="text-gray-600">Optimize employee travel routes for maximum efficiency</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-optimize All
          </button>
          <button
            onClick={handleAddRoute}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Route
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Route className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Routes</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalRoutes}</p>
              <p className="text-sm text-green-600">+12% from last week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Optimized Routes</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.optimizedRoutes}</p>
              <p className="text-sm text-green-600">{Math.round((dashboardStats.optimizedRoutes / dashboardStats.totalRoutes) * 100)}% optimized</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Car className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Distance</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalDistance.toLocaleString()} km</p>
              <p className="text-sm text-orange-600">Avg: {Math.round(dashboardStats.totalDistance / dashboardStats.totalRoutes)} km/route</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Savings</p>
              <p className="text-2xl font-bold text-gray-900">€{dashboardStats.totalSavings}</p>
              <p className="text-sm text-indigo-600">{dashboardStats.averageSavings}% avg savings</p>
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
                placeholder="Search routes, employees..."
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
              <option value="optimized">Optimized</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Employees</option>
              <option value="emp001">John Doe</option>
              <option value="emp002">Jane Smith</option>
              <option value="emp003">Mike Johnson</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="2025-01-16">Today</option>
              <option value="2025-01-15">Yesterday</option>
              <option value="2025-01-14">2 days ago</option>
            </select>
          </div>
        </div>
      </div>

      {/* Routes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Optimized Routes</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stops</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{route.routeName}</div>
                      <div className="text-sm text-gray-500">{route.date}</div>
                      <div className="text-xs text-gray-400">€{route.fuelCost} fuel cost</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{route.employeeName}</div>
                      <div className="text-sm text-gray-500">{route.employeeId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{route.stops.length} stops</div>
                      <div className="text-sm text-gray-500">
                        {route.stops.map(stop => stop.workplaceName.split('/')[0]).join(' → ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{route.totalDistance} km</div>
                      <div className="text-sm text-gray-500">{formatTime(route.totalTime)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                      {getStatusIcon(route.status)}
                      <span className="ml-1">{route.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-green-600">{route.optimization.savings}%</div>
                      <div className="text-sm text-gray-500">€{route.optimization.fuelSavings.toFixed(1)} saved</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(route)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOptimize(route.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(route.id)}
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
                {editingRoute ? 'Edit Route' : 'Create Route'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {editingRoute ? 'Update route details' : 'Create new optimized route'}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingRoute ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteOptimization; 