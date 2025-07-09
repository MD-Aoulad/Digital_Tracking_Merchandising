import React, { useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2,
  MapPin,
  Info
} from 'lucide-react';
import { Area } from '../../types';

/**
 * Area Management Component
 * 
 * This component allows administrators to manage areas for location-based workplace information.
 * Features:
 * - Add/Edit areas
 * - Enable/disable area usage
 * - Search and filtering
 * - Bulk operations
 * - Integration with workplace registration
 */
const AreaManagement: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([
    {
      id: '1',
      name: 'Downtown Area',
      description: 'Central business district',
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'Industrial Zone',
      description: 'Manufacturing and industrial facilities',
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ]);

  const [useArea, setUseArea] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddArea = () => {
    setEditingArea(null);
    setShowAddModal(true);
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setShowAddModal(true);
  };

  const handleDelete = (areaId: string) => {
    setAreas(areas.filter(area => area.id !== areaId));
  };

  const handleToggleActive = (areaId: string) => {
    setAreas(areas.map(area => 
      area.id === areaId ? { ...area, isActive: !area.isActive } : area
    ));
  };

  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (area.description && area.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Area</h3>
              <p className="text-sm text-gray-600 mt-1">
                If your company uses location-based workplace information other than the state and city, you can use the "Area" property.
              </p>
            </div>
            <button
              onClick={handleAddArea}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Area
            </button>
          </div>
        </div>

        {/* Area Usage Toggle */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useArea"
                checked={useArea}
                onChange={(e) => setUseArea(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useArea" className="ml-2 block text-sm font-medium text-gray-900">
                Use Area
              </label>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Info className="h-4 w-4 mr-1" />
              {useArea ? 'Areas will be available when registering workplaces' : 'Areas will not be available'}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 py-4 bg-blue-50">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Registering an Area</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Go to Dashboard &gt; Workplace &gt; Workplace Management.</li>
            <li>2. Select the <strong>Settings</strong> tab, then choose workplace properties &gt; Area.</li>
            <li>3. Set the "Use Area" option to <strong>Yes</strong>.</li>
            <li>4. Enter the area name and click <strong>Add</strong>.</li>
            <li>5. The area will be available as a selectable input option when registering a workplace.</li>
          </ol>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Areas List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Registered Areas</h3>
            <span className="text-sm text-gray-600">{filteredAreas.length} areas</span>
          </div>
        </div>
        
        {filteredAreas.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No areas found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new area.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleAddArea}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Area
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAreas.map((area) => (
              <div key={area.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{area.name}</h4>
                      {area.description && (
                        <p className="text-sm text-gray-600">{area.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Created {new Date(area.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(area.id)}
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                        area.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {area.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleEdit(area)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(area.id)}
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
                {editingArea ? 'Edit' : 'Add'} Area
              </h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter area name"
                    defaultValue={editingArea?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter area description (optional)"
                    defaultValue={editingArea?.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    defaultChecked={editingArea?.isActive ?? true}
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
                    {editingArea ? 'Update' : 'Add'}
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

export default AreaManagement; 