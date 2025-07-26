import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  RefreshCw,
  Truck,
  Warehouse,
  ShoppingCart
} from 'lucide-react';

/**
 * Inventory Management Component
 * 
 * This component provides comprehensive inventory management functionality including:
 * - Track product inventory at workplaces
 * - Stock level monitoring and alerts
 * - Inventory movement tracking
 * - Reorder management
 * - Analytics and reporting
 * - Supplier management
 */
const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState([
    {
      id: '1',
      workplaceId: '1',
      workplaceName: 'BIG ONE Handels GmbH/ Os...',
      workplaceCode: '20311',
      productId: 'PROD001',
      productName: 'Samsung Galaxy S24',
      category: 'Smartphones',
      sku: 'SAMS-S24-128GB',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      reorderPoint: 25,
      unitCost: 899.99,
      totalValue: 40499.55,
      supplier: 'Samsung Electronics',
      lastRestocked: '2025-01-10',
      nextRestock: '2025-01-25',
      status: 'healthy',
      location: 'Aisle 3, Shelf 2',
      notes: 'High demand product, monitor closely',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      workplaceId: '2',
      workplaceName: '#SamsungZeil (Showcase)/ Fra...',
      workplaceCode: '15235',
      productId: 'PROD002',
      productName: 'LG OLED TV 65"',
      category: 'Televisions',
      sku: 'LG-OLED-65C3',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      reorderPoint: 20,
      unitCost: 2499.99,
      totalValue: 19999.92,
      supplier: 'LG Electronics',
      lastRestocked: '2025-01-05',
      nextRestock: '2025-01-20',
      status: 'low-stock',
      location: 'Display Area 1',
      notes: 'Premium display item, low stock alert',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '3',
      workplaceId: '3',
      workplaceName: '3K-Kuechen Esslingen/ Essling...',
      workplaceCode: '25280',
      productId: 'PROD003',
      productName: 'Bosch Dishwasher',
      category: 'Kitchen Appliances',
      sku: 'BOSCH-DISH-SMS2',
      currentStock: 0,
      minStock: 5,
      maxStock: 25,
      reorderPoint: 8,
      unitCost: 649.99,
      totalValue: 0,
      supplier: 'Bosch Home Appliances',
      lastRestocked: '2025-01-08',
      nextRestock: '2025-01-18',
      status: 'out-of-stock',
      location: 'Kitchen Section',
      notes: 'Out of stock, urgent restock needed',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterWorkplace, setFilterWorkplace] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalProducts: 1247,
    totalValue: 2850000,
    lowStockItems: 45,
    outOfStockItems: 12,
    reorderItems: 23,
    inventoryByStatus: {
      healthy: 892,
      'low-stock': 343,
      'out-of-stock': 12
    },
    averageTurnover: 15.2,
    totalSuppliers: 28
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDelete = (itemId: string) => {
    setInventory(inventory.filter(i => i.id !== itemId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'low-stock': return 'text-orange-600 bg-orange-100';
      case 'out-of-stock': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'low-stock': return <AlertTriangle className="h-4 w-4" />;
      case 'out-of-stock': return <XCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const getStockPercentage = (item: any) => {
    return Math.round((item.currentStock / item.maxStock) * 100);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.workplaceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesWorkplace = filterWorkplace === 'all' || item.workplaceId === filterWorkplace;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesWorkplace;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Track product inventory across all workplaces</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Inventory
          </button>
          <button
            onClick={handleAddItem}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Inventory Item
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalProducts.toLocaleString()}</p>
              <p className="text-sm text-green-600">+5.2% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">€{dashboardStats.totalValue.toLocaleString()}</p>
              <p className="text-sm text-green-600">+3.8% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.lowStockItems}</p>
              <p className="text-sm text-orange-600">Requires attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.outOfStockItems}</p>
              <p className="text-sm text-red-600">Urgent restock needed</p>
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
                placeholder="Search products, SKU, workplace..."
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
              <option value="healthy">Healthy</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Smartphones">Smartphones</option>
              <option value="Televisions">Televisions</option>
              <option value="Kitchen Appliances">Kitchen Appliances</option>
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

      {/* Inventory List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Inventory Items</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workplace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-500">{item.sku}</div>
                      <div className="text-xs text-gray-400">{item.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.workplaceName}</div>
                      <div className="text-sm text-gray-500">{item.workplaceCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.currentStock}</div>
                      <div className="text-sm text-gray-500">Min: {item.minStock} | Max: {item.maxStock}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            getStockPercentage(item) > 50 ? 'bg-green-500' : 
                            getStockPercentage(item) > 20 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${getStockPercentage(item)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{item.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">€{item.totalValue.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">€{item.unitCost} per unit</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.supplier}</div>
                    <div className="text-sm text-gray-500">Next: {item.nextRestock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
                {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {editingItem ? 'Update inventory item details' : 'Add new inventory item to workplace'}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement; 