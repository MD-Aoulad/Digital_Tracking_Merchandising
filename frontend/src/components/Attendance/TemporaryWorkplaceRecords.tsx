/**
 * Temporary Workplace Records Component - Workforce Management Platform
 * 
 * Administrative interface for viewing and managing temporary workplace punch in/out records.
 * Provides comprehensive record management with filtering, search, and detailed information
 * about employee clock in/out from unregistered locations.
 * 
 * Features:
 * - View all temporary workplace records
 * - Filter by date range, employee, and punch type
 * - Search functionality
 * - Detailed record information
 * - Export capabilities
 * - Statistics and analytics
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MapPin,
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  FileText,
  Navigation
} from 'lucide-react';
import type { 
  TemporaryWorkplaceRecord, 
  ReusableTemporaryWorkplace,
  TemporaryWorkplaceStats 
} from '../../types';

/**
 * Temporary Workplace Records component props interface
 */
interface TemporaryWorkplaceRecordsProps {
  records: TemporaryWorkplaceRecord[];
  reusableLocations: ReusableTemporaryWorkplace[];
  stats: TemporaryWorkplaceStats;
  onViewRecord: (record: TemporaryWorkplaceRecord) => void;
  onEditRecord?: (record: TemporaryWorkplaceRecord) => void;
  onDeleteRecord?: (recordId: string) => void;
  onExportRecords?: (records: TemporaryWorkplaceRecord[]) => void;
}

/**
 * Filter interface for record filtering
 */
interface RecordFilter {
  dateFrom: string;
  dateTo: string;
  employeeId: string;
  punchType: 'all' | 'clock-in' | 'clock-out';
  searchTerm: string;
}

/**
 * Temporary Workplace Records Component
 * 
 * Administrative interface for managing temporary workplace records.
 * Provides comprehensive filtering, search, and record management capabilities.
 * 
 * @param records - Array of temporary workplace records
 * @param reusableLocations - Array of reusable locations
 * @param stats - Statistics data
 * @param onViewRecord - Function to view record details
 * @param onEditRecord - Function to edit record
 * @param onDeleteRecord - Function to delete record
 * @param onExportRecords - Function to export records
 * @returns JSX element with temporary workplace records management
 */
const TemporaryWorkplaceRecords: React.FC<TemporaryWorkplaceRecordsProps> = ({
  records,
  reusableLocations,
  stats,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onExportRecords
}) => {
  // Mock data - in real app, this would come from API
  const mockEmployees = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  // State
  const [filter, setFilter] = useState<RecordFilter>({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    dateTo: new Date().toISOString().split('T')[0],
    employeeId: '',
    punchType: 'all',
    searchTerm: '',
  });

  const [filteredRecords, setFilteredRecords] = useState<TemporaryWorkplaceRecord[]>(records);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  /**
   * Apply filters to records
   */
  useEffect(() => {
    let filtered = records;

    // Date range filter
    if (filter.dateFrom) {
      filtered = filtered.filter(record => record.date >= filter.dateFrom);
    }
    if (filter.dateTo) {
      filtered = filtered.filter(record => record.date <= filter.dateTo);
    }

    // Employee filter
    if (filter.employeeId) {
      filtered = filtered.filter(record => record.userId === filter.employeeId);
    }

    // Punch type filter
    if (filter.punchType !== 'all') {
      filtered = filtered.filter(record => record.type === filter.punchType);
    }

    // Search term filter
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.reason.toLowerCase().includes(searchLower) ||
        record.location.address.toLowerCase().includes(searchLower) ||
        record.location.placeName?.toLowerCase().includes(searchLower) ||
        record.notes?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredRecords(filtered);
  }, [records, filter]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (field: keyof RecordFilter, value: string) => {
    setFilter(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setFilter({
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      employeeId: '',
      punchType: 'all',
      searchTerm: '',
    });
  };

  /**
   * Handle record selection
   */
  const handleRecordSelect = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  /**
   * Handle select all records
   */
  const handleSelectAll = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map(record => record.id));
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Get employee name by ID
   */
  const getEmployeeName = (employeeId: string) => {
    const employee = mockEmployees.find(emp => emp.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Temporary Workplace Records</h2>
          <p className="text-sm text-gray-500">
            Manage and view punch in/out records from unregistered locations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {onExportRecords && (
            <button
              onClick={() => onExportRecords(filteredRecords)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Locations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueLocations}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Distance</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageDistance)}m</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Navigation size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reusable Locations</p>
              <p className="text-2xl font-bold text-gray-900">{reusableLocations.length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin size={20} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter size={16} />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by reason, location, or notes..."
              value={filter.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filter.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filter.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                value={filter.employeeId}
                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Employees</option>
                {mockEmployees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Punch Type</label>
              <select
                value={filter.punchType}
                onChange={(e) => handleFilterChange('punchType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="clock-in">Clock In</option>
                <option value="clock-out">Clock Out</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter Actions */}
        {showFilters && (
          <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Records ({filteredRecords.length})
            </h3>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Select All</span>
              </label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {getEmployeeName(record.userId).charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {getEmployeeName(record.userId)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(record.date)}</div>
                    <div className="text-sm text-gray-500">{record.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.type === 'clock-in' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.type === 'clock-in' ? 'Clock In' : 'Clock Out'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {record.location.placeName || 'Unknown Place'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.location.address}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {record.reason}
                    </div>
                    {record.notes && (
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {record.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewRecord(record)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {onEditRecord && (
                        <button
                          onClick={() => onEditRecord(record)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Record"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {onDeleteRecord && (
                        <button
                          onClick={() => onDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-500">
              No temporary workplace records match your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemporaryWorkplaceRecords; 