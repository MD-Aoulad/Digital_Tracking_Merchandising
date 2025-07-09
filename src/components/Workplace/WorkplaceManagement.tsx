import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Building2,
  Search,
  Filter
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
 */
const WorkplaceManagement: React.FC = () => {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([
    {
      id: '1',
      name: 'Main Office',
      code: 'MO-001',
      address: '123 Business St, Gangnam-gu, Seoul',
      stateId: '1',
      cityId: '3',
      district: 'Gangnam-gu',
      type: 'registered',
      isActive: true,
      isDefault: true,
      location: {
        lat: 37.5665,
        lng: 126.9780
      },
      customProperties: [],
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'Busan Branch',
      code: 'BB-001',
      address: '456 Harbor Ave, Seo-gu, Busan',
      stateId: '2',
      cityId: '4',
      district: 'Seo-gu',
      type: 'registered',
      isActive: true,
      isDefault: false,
      location: {
        lat: 35.1796,
        lng: 129.0756
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
            <button
              onClick={handleAddWorkplace}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Workplace
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
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

      {/* Workplaces List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Workplaces</h3>
            <span className="text-sm text-gray-600">{filteredWorkplaces.length} workplaces</span>
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
          <div className="divide-y divide-gray-200">
            {filteredWorkplaces.map((workplace) => (
              <div key={workplace.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">{workplace.name}</h4>
                        <span className="text-sm text-gray-500">({workplace.code})</span>
                        {workplace.isDefault && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{workplace.address}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(workplace.type)}`}>
                          {getTypeLabel(workplace.type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Lat: {workplace.location.lat.toFixed(4)}, Lng: {workplace.location.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(workplace.id)}
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                        workplace.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {workplace.isActive ? 'Active' : 'Inactive'}
                    </button>
                    {!workplace.isDefault && (
                      <button
                        onClick={() => handleSetDefault(workplace.id)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(workplace)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(workplace.id)}
                      className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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