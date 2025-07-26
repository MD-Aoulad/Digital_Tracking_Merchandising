import React, { useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2,
  Settings,
  Eye,
  Edit
} from 'lucide-react';
import { WorkplaceCustomProperty } from '../../types';

/**
 * Custom Property Management Component
 * 
 * This component allows administrators to create and manage custom workplace properties.
 * Features:
 * - Add/Edit custom properties
 * - Different data types (select, manual, photo, document)
 * - Permission-based access control
 * - Required field settings
 * - Integration with workplace registration
 */
const CustomPropertyManagement: React.FC = () => {
  const [customProperties, setCustomProperties] = useState<WorkplaceCustomProperty[]>([
    {
      id: '1',
      name: 'Operating Hours',
      dataType: 'manual',
      viewPermission: 'employee',
      editPermission: 'admin',
      isRequired: false,
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'Phone Number',
      dataType: 'manual',
      viewPermission: 'employee',
      editPermission: 'admin',
      isRequired: true,
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '3',
      name: 'Workplace Guidelines',
      dataType: 'document',
      viewPermission: 'employee',
      editPermission: 'admin',
      isRequired: false,
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '4',
      name: 'Facility Type',
      dataType: 'select',
      options: ['Office', 'Warehouse', 'Retail Store', 'Factory', 'Distribution Center'],
      viewPermission: 'employee',
      editPermission: 'admin',
      isRequired: true,
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<WorkplaceCustomProperty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowAddModal(true);
  };

  const handleEdit = (property: WorkplaceCustomProperty) => {
    setEditingProperty(property);
    setShowAddModal(true);
  };

  const handleDelete = (propertyId: string) => {
    setCustomProperties(customProperties.filter(p => p.id !== propertyId));
  };

  const handleToggleActive = (propertyId: string) => {
    setCustomProperties(customProperties.map(p => 
      p.id === propertyId ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const filteredProperties = customProperties.filter(property => 
    property.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'select':
        return '📋';
      case 'manual':
        return '✏️';
      case 'photo':
        return '📷';
      case 'document':
        return '📄';
      default:
        return '⚙️';
    }
  };

  const getDataTypeLabel = (dataType: string) => {
    switch (dataType) {
      case 'select':
        return 'Select from options';
      case 'manual':
        return 'Enter manually';
      case 'photo':
        return 'Upload photo';
      case 'document':
        return 'Upload document';
      default:
        return dataType;
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'admin':
        return 'Admin only';
      case 'leader':
        return 'Admin & Leader';
      case 'employee':
        return 'All users';
      default:
        return permission;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Custom Properties</h3>
              <p className="text-sm text-gray-600 mt-1">
                Custom properties are additional properties you can use, apart from the default workplace properties 
                (e.g., operating hours, phone numbers). These properties can be created and used by administrators.
              </p>
            </div>
            <button
              onClick={handleAddProperty}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 py-4 bg-blue-50">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Registering Custom Properties</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Go to Dashboard &gt; Workplace &gt; Workplace Management.</li>
            <li>2. Select the <strong>Settings</strong> tab, then choose workplace properties &gt; Custom Properties.</li>
            <li>3. Click <strong>Add Property</strong>.</li>
            <li>4. Enter the property name (e.g., operating hours, phone number, workplace guidelines).</li>
            <li>5. Choose the data type:
              <ul className="ml-4 mt-1 space-y-1">
                <li>• <strong>Select from options:</strong> Choose an option that has been pre-registered.</li>
                <li>• <strong>Enter manually:</strong> Directly input data when registering the property (e.g., store phone number).</li>
                <li>• <strong>Photo:</strong> Upload a photo when registering the property.</li>
                <li>• <strong>Document:</strong> Upload a document when registering the property.</li>
              </ul>
            </li>
            <li>6. Set the "View Permission". Only administrators or leaders with view permissions can view this custom property. Administrators are included by default.</li>
            <li>7. Set the "Edit Permission". Only administrators or leaders with edit permissions can edit this custom property when adding a workplace. Administrators are included by default.</li>
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
                placeholder="Search custom properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Properties List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Custom Properties</h3>
            <span className="text-sm text-gray-600">{filteredProperties.length} properties</span>
          </div>
        </div>
        
        {filteredProperties.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No custom properties found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new custom property.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleAddProperty}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProperties.map((property) => (
              <div key={property.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getDataTypeIcon(property.dataType)}</div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{property.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Type: {getDataTypeLabel(property.dataType)}
                        </span>
                        <span className="text-sm text-gray-600">
                          Required: {property.isRequired ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Eye className="h-4 w-4 mr-1" />
                          View: {getPermissionLabel(property.viewPermission)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit: {getPermissionLabel(property.editPermission)}
                        </div>
                      </div>
                      {property.options && property.options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Options:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {property.options.map((option, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {option}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(property.id)}
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                        property.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {property.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleEdit(property)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
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
                {editingProperty ? 'Edit' : 'Add'} Custom Property
              </h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., operating hours, phone number, workplace guidelines"
                    defaultValue={editingProperty?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Type
                  </label>
                  <select
                    defaultValue={editingProperty?.dataType || 'manual'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="select">Select from options</option>
                    <option value="manual">Enter manually</option>
                    <option value="photo">Photo</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    View Permission
                  </label>
                  <select
                    defaultValue={editingProperty?.viewPermission || 'admin'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="admin">Admin only</option>
                    <option value="leader">Admin & Leader</option>
                    <option value="employee">All users</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Edit Permission
                  </label>
                  <select
                    defaultValue={editingProperty?.editPermission || 'admin'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="admin">Admin only</option>
                    <option value="leader">Admin & Leader</option>
                    <option value="employee">All users</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRequired"
                    defaultChecked={editingProperty?.isRequired ?? false}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                    Required field
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    defaultChecked={editingProperty?.isActive ?? true}
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
                    {editingProperty ? 'Update' : 'Add'}
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

export default CustomPropertyManagement; 