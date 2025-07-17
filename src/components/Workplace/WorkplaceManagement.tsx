import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Building2,
  Search,
  Filter,
  Download,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Target,
  BarChart3
} from 'lucide-react';
import { Workplace } from '../../types';

/**
 * Workplace Management Component
 * 
 * This component provides comprehensive workplace management functionality including:
 * - Add/Edit workplaces
 * - Search and filtering
 * - Workplace type management
 * - Location management
 * - Custom properties integration
 * - Dashboard statistics
 * - Location accuracy tracking
 * - Channel distribution
 * - Employee assignment tracking
 */
const WorkplaceManagement: React.FC = () => {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([
    {
      id: '1',
      name: 'BIG ONE Handels GmbH/ Os...',
      code: '20311',
      address: 'Pagenstecherstr. 63 a, 49090, Osnabrück, Niedersachsen, Germany',
      stateId: '1',
      cityId: '3',
      district: 'Nord',
      type: 'registered',
      isActive: true,
      isDefault: false,
      location: {
        lat: 52.2799,
        lng: 8.0472
      },
      customProperties: [],
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      name: '#SamsungZeil (Showcase)/ Fra...',
      code: '15235',
      address: 'Zeil 119, 60313, Frankfurt am Main, Hessen, Germany',
      stateId: '2',
      cityId: '4',
      district: 'West 1',
      type: 'registered',
      isActive: true,
      isDefault: false,
      location: {
        lat: 50.1109,
        lng: 8.6821
      },
      customProperties: [],
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '3',
      name: '3K-Kuechen Esslingen/ Essling...',
      code: '25280',
      address: 'Heilbronner Str. 50, 73728, Esslingen, Baden-Württemberg, Germany',
      stateId: '3',
      cityId: '5',
      district: 'Süd',
      type: 'registered',
      isActive: true,
      isDefault: false,
      location: {
        lat: 48.7426,
        lng: 9.3201
      },
      customProperties: [],
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '4',
      name: '4kitchen GmbH/ Neufahrn bei...',
      code: '22926',
      address: 'Dorfstraße 34, 85375, Neufahrn bei Freising, Bayern, Germany',
      stateId: '4',
      cityId: '6',
      district: 'Süd',
      type: 'registered',
      isActive: true,
      isDefault: false,
      location: {
        lat: 48.3158,
        lng: 11.6635
      },
      customProperties: [],
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '5',
      name: 'A & K 10.000 Hausgeräte u. Kü...',
      code: '21268',
      address: 'Neutorstraße 83, 26721, Emden, Niedersachsen, Germany',
      stateId: '1',
      cityId: '7',
      district: 'Nord',
      type: 'registered',
      isActive: true,
      isDefault: false,
      location: {
        lat: 53.3675,
        lng: 7.2078
      },
      customProperties: [],
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorkplace, setEditingWorkplace] = useState<Workplace | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'status' | 'settings'>('status');

  // Dashboard statistics
  const dashboardStats = {
    totalWorkplaces: 5741,
    locationAccuracy: {
      verifiedByAdmin: 1221,
      rooftopLevel: 4393,
      inaccurate: 127,
      total: 5741
    },
    channelDistribution: {
      mass: 2845,
      bg: 2060,
      others: 836,
      total: 5741
    },
    employeeAssignment: {
      allocated: 205,
      unallocated: 5536,
      total: 5741
    }
  };

  const handleAddWorkplace = () => {
    setEditingWorkplace(null);
    setShowAddModal(true);
  };

  const handleEdit = (workplace: Workplace) => {
    setEditingWorkplace(workplace);
    setShowAddModal(true);
  };

  const handleDelete = (workplaceId: string) => {
    setWorkplaces(workplaces.filter(w => w.id !== workplaceId));
  };

  const handleToggleActive = (workplaceId: string) => {
    setWorkplaces(workplaces.map(w => 
      w.id === workplaceId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const handleSetDefault = (workplaceId: string) => {
    setWorkplaces(workplaces.map(w => ({
      ...w,
      isDefault: w.id === workplaceId
    })));
  };

  const filteredWorkplaces = workplaces.filter(workplace => {
    const matchesSearch = workplace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workplace.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workplace.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || workplace.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && workplace.isActive) ||
                         (filterStatus === 'inactive' && !workplace.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'registered':
        return 'Registered';
      case 'fixed':
        return 'Fixed';
      case 'temporary':
        return 'Temporary';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'registered':
        return 'bg-blue-100 text-blue-800';
      case 'fixed':
        return 'bg-green-100 text-green-800';
      case 'temporary':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationAccuracyColor = (workplace: Workplace) => {
    // Mock location accuracy based on workplace ID
    const accuracyMap: { [key: string]: string } = {
      '1': 'bg-blue-100 text-blue-800', // Verified by admin
      '2': 'bg-green-100 text-green-800', // Rooftop level
      '3': 'bg-green-100 text-green-800', // Rooftop level
      '4': 'bg-green-100 text-green-800', // Rooftop level
      '5': 'bg-green-100 text-green-800'  // Rooftop level
    };
    return accuracyMap[workplace.id] || 'bg-gray-100 text-gray-800';
  };

  const getLocationAccuracyLabel = (workplace: Workplace) => {
    const accuracyMap: { [key: string]: string } = {
      '1': 'Location verified by admin',
      '2': 'Rooftop level accuracy',
      '3': 'Rooftop level accuracy',
      '4': 'Rooftop level accuracy',
      '5': 'Rooftop level accuracy'
    };
    return accuracyMap[workplace.id] || 'Unknown';
  };

  const getEmployeeCount = (workplace: Workplace) => {
    // Mock employee count based on workplace ID
    const employeeMap: { [key: string]: number } = {
      '1': 0,
      '2': 1,
      '3': 0,
      '4': 0,
      '5': 0
    };
    return employeeMap[workplace.id] || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Workplace Management</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage registered workplaces, fixed workplaces, and temporary workplace settings.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                Add a workplace
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                Add in bulk
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Pencil className="h-4 w-4 mr-2" />
                Edit in bulk
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('status')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'status'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Status
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'status' && (
        <>
          {/* Dashboard Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Workplace Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workplace</h3>
              <p className="text-sm text-gray-600 mb-2">No. of total workplaces</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalWorkplaces.toLocaleString()}</p>
            </div>

            {/* Location Accuracy */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location accuracy</h3>
              <p className="text-sm text-gray-600 mb-4">All {dashboardStats.totalWorkplaces.toLocaleString()} workplaces</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Location verified by admin</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardStats.locationAccuracy.verifiedByAdmin.toLocaleString()} ({((dashboardStats.locationAccuracy.verifiedByAdmin / dashboardStats.locationAccuracy.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Rooftop level accuracy</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardStats.locationAccuracy.rooftopLevel.toLocaleString()} ({((dashboardStats.locationAccuracy.rooftopLevel / dashboardStats.locationAccuracy.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Inaccurate</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardStats.locationAccuracy.inaccurate.toLocaleString()} ({((dashboardStats.locationAccuracy.inaccurate / dashboardStats.locationAccuracy.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Channel Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel</h3>
              <p className="text-sm text-gray-600 mb-4">All {dashboardStats.totalWorkplaces.toLocaleString()} workplaces</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Mass</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardStats.channelDistribution.mass.toLocaleString()} ({((dashboardStats.channelDistribution.mass / dashboardStats.channelDistribution.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">BG</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardStats.channelDistribution.bg.toLocaleString()} ({((dashboardStats.channelDistribution.bg / dashboardStats.channelDistribution.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Others</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardStats.channelDistribution.others.toLocaleString()} ({((dashboardStats.channelDistribution.others / dashboardStats.channelDistribution.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Assignment Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Workplaces assigned to employees</h3>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {((dashboardStats.employeeAssignment.allocated / dashboardStats.employeeAssignment.total) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-4 flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Allocated</span>
                <span className="text-sm font-medium text-gray-900">{dashboardStats.employeeAssignment.allocated.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Unallocated</span>
                <span className="text-sm font-medium text-gray-900">{dashboardStats.employeeAssignment.unallocated.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search workplaces by name, code, or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="registered">Registered</option>
                      <option value="fixed">Fixed</option>
                      <option value="temporary">Temporary</option>
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workplaces List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-600 cursor-pointer">All {filteredWorkplaces.length}</span>
                </div>
                <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              </div>
            </div>
            
            {filteredWorkplaces.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No workplaces found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Get started by creating a new workplace.'}
                </p>
                {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                  <div className="mt-6">
                    <button
                      onClick={handleAddWorkplace}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Workplace
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Workplace name Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distributor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        District
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        State
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWorkplaces.map((workplace, index) => (
                      <tr key={workplace.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{workplace.name}</div>
                            <div className="text-sm text-gray-500">Code: {workplace.code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workplace.district === 'Nord' ? 'EP' : workplace.district === 'West 1' ? 'VIP' : 'KSP'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workplace.district}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workplace.address.split(', ').slice(-2).join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workplace.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLocationAccuracyColor(workplace)}`}>
                            {getLocationAccuracyLabel(workplace)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getEmployeeCount(workplace) > 0 ? getEmployeeCount(workplace) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workplace Settings</h3>
          <p className="text-gray-600">Workplace management settings and configuration options will be displayed here.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingWorkplace ? 'Edit' : 'Add'} Workplace
              </h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workplace Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter workplace name"
                    defaultValue={editingWorkplace?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workplace Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter workplace code"
                    defaultValue={editingWorkplace?.code || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    placeholder="Enter full address"
                    defaultValue={editingWorkplace?.address || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workplace Type
                  </label>
                  <select
                    defaultValue={editingWorkplace?.type || 'registered'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="registered">Registered</option>
                    <option value="fixed">Fixed</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Enter latitude"
                    defaultValue={editingWorkplace?.location.lat || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Enter longitude"
                    defaultValue={editingWorkplace?.location.lng || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    defaultChecked={editingWorkplace?.isActive ?? true}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    defaultChecked={editingWorkplace?.isDefault ?? false}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                    Default Workplace
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingWorkplace ? 'Update' : 'Add'}
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

export default WorkplaceManagement; 