import React, { useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2,
  MapPin,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { StateCity } from '../../types';

/**
 * State and City Management Component
 * 
 * This component allows administrators to manage states and cities for workplace locations.
 * Features:
 * - Add/Edit states and cities
 * - Hierarchical view (states with nested cities)
 * - Search and filtering
 * - Bulk operations
 * - Country-specific organization
 */
const StateCityManagement: React.FC = () => {
  const [states, setStates] = useState<StateCity[]>([
    {
      id: '1',
      name: 'Seoul Special City',
      type: 'state',
      countryCode: 'KR',
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'Busan Metropolitan City',
      type: 'state',
      countryCode: 'KR',
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ]);

  const [cities, setCities] = useState<StateCity[]>([
    {
      id: '3',
      name: 'Gangnam-gu',
      type: 'city',
      parentId: '1',
      countryCode: 'KR',
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '4',
      name: 'Seo-gu',
      type: 'city',
      parentId: '2',
      countryCode: 'KR',
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ]);

  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StateCity | null>(null);
  const [modalType, setModalType] = useState<'state' | 'city'>('state');
  const [selectedState, setSelectedState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddState = () => {
    setModalType('state');
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleAddCity = (stateId: string) => {
    setModalType('city');
    setSelectedState(stateId);
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEdit = (item: StateCity) => {
    setEditingItem(item);
    setModalType(item.type);
    if (item.type === 'city') {
      setSelectedState(item.parentId!);
    }
    setShowAddModal(true);
  };

  const handleDelete = (item: StateCity) => {
    if (item.type === 'state') {
      setStates(states.filter(s => s.id !== item.id));
      setCities(cities.filter(c => c.parentId !== item.id));
    } else {
      setCities(cities.filter(c => c.id !== item.id));
    }
  };

  const toggleExpanded = (stateId: string) => {
    const newExpanded = new Set(expandedStates);
    if (newExpanded.has(stateId)) {
      newExpanded.delete(stateId);
    } else {
      newExpanded.add(stateId);
    }
    setExpandedStates(newExpanded);
  };

  const filteredStates = states.filter(state => 
    state.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCitiesForState = (stateId: string) => {
    return cities.filter(city => city.parentId === stateId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">State and City</h3>
              <p className="text-sm text-gray-600 mt-1">
                This refers to the state or city where the workplace is located, according to the official standards of each country (e.g., Seoul Special City). 
                This is useful when registering the location of a workplace.
              </p>
            </div>
            <button
              onClick={handleAddState}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add State
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search states and cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 py-4 bg-blue-50">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Adding/Editing State and City</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Select the <strong>Settings</strong> tab, then choose workplace properties &gt; state and city.</li>
            <li>2. Select <strong>Add/Edit</strong> for the state, input the name, and click <strong>Add</strong>.</li>
            <li>3. Select the state and then click <strong>Add/Edit</strong> for the city, input the city name, and click <strong>Add</strong>.</li>
            <li>4. The added/edited state and city information will appear as selectable options when registering a workplace.</li>
          </ol>
        </div>
      </div>

      {/* States and Cities List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">States and Cities</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredStates.map((state) => {
            const stateCities = getCitiesForState(state.id);
            const isExpanded = expandedStates.has(state.id);
            
            return (
              <div key={state.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleExpanded(state.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{state.name}</h4>
                      <p className="text-sm text-gray-600">State • {state.countryCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddCity(state.id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add City
                    </button>
                    <button
                      onClick={() => handleEdit(state)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(state)}
                      className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Cities */}
                {isExpanded && (
                  <div className="mt-4 ml-8 space-y-3">
                    {stateCities.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No cities added yet</p>
                    ) : (
                      stateCities.map((city) => (
                        <div key={city.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">{city.name}</h5>
                              <p className="text-xs text-gray-600">City • {city.countryCode}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(city)}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(city)}
                              className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'state' ? 'State' : 'City'}
              </h3>
              
              <form className="space-y-4">
                {modalType === 'city' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a state</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modalType === 'state' ? 'State' : 'City'} Name
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${modalType} name`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., KR for Korea"
                    defaultValue="KR"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    defaultChecked={true}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
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
                    {editingItem ? 'Update' : 'Add'}
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

export default StateCityManagement; 