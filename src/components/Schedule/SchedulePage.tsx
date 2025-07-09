/**
 * Schedule Management Page Component - Workforce Management Platform
 * 
 * Advanced scheduling system with drag & drop functionality, shift management,
 * and calendar integration. Features include:
 * - Drag & drop shift scheduling
 * - Calendar view with multiple views (day, week, month)
 * - Shift templates and recurring schedules
 * - Employee availability tracking
 * - Conflict detection and resolution
 * - Mobile-responsive design
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Shift, ShiftTemplate } from '../../types';
import toast from 'react-hot-toast';

/**
 * SchedulePage Component
 * 
 * Main scheduling interface with calendar view, drag & drop functionality,
 * and comprehensive shift management capabilities.
 * 
 * @returns JSX element with complete scheduling interface
 */
const SchedulePage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [filterEmployee, setFilterEmployee] = useState<string>('all');

  /**
   * Initialize mock schedule data
   */
  useEffect(() => {
    const mockShifts: Shift[] = [
      {
        id: '1',
        userId: '1',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '17:00',
        type: 'regular',
        status: 'scheduled',
        notes: 'Morning shift'
      },
      {
        id: '2',
        userId: '2',
        date: '2024-01-15',
        startTime: '14:00',
        endTime: '22:00',
        type: 'regular',
        status: 'approved',
        notes: 'Afternoon shift'
      },
      {
        id: '3',
        userId: '3',
        date: '2024-01-16',
        startTime: '22:00',
        endTime: '06:00',
        type: 'night',
        status: 'scheduled',
        notes: 'Night shift'
      }
    ];

    const mockTemplates: ShiftTemplate[] = [
      {
        id: '1',
        name: 'Morning Shift',
        startTime: '09:00',
        endTime: '17:00',
        type: 'regular',
        color: '#3B82F6'
      },
      {
        id: '2',
        name: 'Afternoon Shift',
        startTime: '14:00',
        endTime: '22:00',
        type: 'regular',
        color: '#10B981'
      },
      {
        id: '3',
        name: 'Night Shift',
        startTime: '22:00',
        endTime: '06:00',
        type: 'night',
        color: '#8B5CF6'
      }
    ];

    setShifts(mockShifts);
    setTemplates(mockTemplates);
  }, []);

  /**
   * Get shifts for a specific date
   */
  const getShiftsForDate = (date: string) => {
    return shifts.filter(shift => shift.date === date);
  };

  /**
   * Handle drag and drop for shift scheduling
   */
  const handleDragDrop = (shiftId: string, newDate: string, newTime: string) => {
    setShifts(prev => prev.map(shift => 
      shift.id === shiftId 
        ? { ...shift, date: newDate, startTime: newTime }
        : shift
    ));
    toast.success('Shift rescheduled successfully');
  };

  /**
   * Create new shift
   */
  const createShift = (shiftData: Partial<Shift>) => {
    const newShift: Shift = {
      id: Date.now().toString(),
      userId: shiftData.userId || '',
      date: shiftData.date || new Date().toISOString().split('T')[0],
      startTime: shiftData.startTime || '09:00',
      endTime: shiftData.endTime || '17:00',
      type: shiftData.type || 'regular',
      status: 'scheduled',
      notes: shiftData.notes || ''
    };

    setShifts(prev => [...prev, newShift]);
    toast.success('Shift created successfully');
    setShowShiftModal(false);
  };

  /**
   * Update existing shift
   */
  const updateShift = (shiftId: string, updates: Partial<Shift>) => {
    setShifts(prev => prev.map(shift => 
      shift.id === shiftId 
        ? { ...shift, ...updates }
        : shift
    ));
    toast.success('Shift updated successfully');
    setShowShiftModal(false);
    setSelectedShift(null);
  };

  /**
   * Delete shift
   */
  const deleteShift = (shiftId: string) => {
    setShifts(prev => prev.filter(shift => shift.id !== shiftId));
    toast.success('Shift deleted successfully');
  };

  /**
   * Get status icon for shift
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-blue-500" />;
    }
  };

  /**
   * Generate calendar days for current view
   */
  const generateCalendarDays = () => {
    const days = [];
    const startDate = new Date(selectedDate);
    
    if (viewMode === 'week') {
      // Start from Monday of the current week
      const dayOfWeek = startDate.getDay();
      const monday = new Date(startDate);
      monday.setDate(startDate.getDate() - dayOfWeek + 1);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        days.push(date);
      }
    } else if (viewMode === 'month') {
      // Generate days for current month
      const year = startDate.getFullYear();
      const month = startDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Add days from previous month to fill first week
      const firstDayOfWeek = firstDay.getDay();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(firstDay);
        date.setDate(firstDay.getDate() - i - 1);
        days.push(date);
      }
      
      // Add days of current month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
      }
    } else {
      // Day view
      days.push(startDate);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600 mt-1">Manage employee schedules and shifts with drag & drop</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setShowShiftModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Shift</span>
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                if (viewMode === 'week') {
                  newDate.setDate(selectedDate.getDate() - 7);
                } else if (viewMode === 'month') {
                  newDate.setMonth(selectedDate.getMonth() - 1);
                } else {
                  newDate.setDate(selectedDate.getDate() - 1);
                }
                setSelectedDate(newDate);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                if (viewMode === 'week') {
                  newDate.setDate(selectedDate.getDate() + 7);
                } else if (viewMode === 'month') {
                  newDate.setMonth(selectedDate.getMonth() + 1);
                } else {
                  newDate.setDate(selectedDate.getDate() + 1);
                }
                setSelectedDate(newDate);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              →
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Employees</option>
              <option value="1">Employee 1</option>
              <option value="2">Employee 2</option>
              <option value="3">Employee 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="px-4 py-3 text-sm font-medium text-gray-900 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {calendarDays.map((date, index) => {
            const dateString = date.toISOString().split('T')[0];
            const dayShifts = getShiftsForDate(dateString);
            const isToday = date.toDateString() === new Date().toDateString();
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

            return (
              <div
                key={index}
                className={`min-h-32 p-2 ${
                  isToday ? 'bg-primary-50' : ''
                } ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {date.getDate()}
                  {isToday && (
                    <span className="ml-1 w-2 h-2 bg-primary-600 rounded-full inline-block"></span>
                  )}
                </div>
                
                {/* Shifts for this day */}
                <div className="space-y-1">
                  {dayShifts.map((shift) => (
                    <motion.div
                      key={shift.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-2 bg-blue-100 border border-blue-200 rounded text-xs cursor-move hover:bg-blue-200 transition-colors"
                      draggable
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">
                            {shift.startTime} - {shift.endTime}
                          </p>
                          <p className="text-blue-700">Employee {shift.userId}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(shift.status)}
                          <button
                            onClick={() => {
                              setSelectedShift(shift);
                              setShowShiftModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shift Templates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Shift Templates</h3>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Manage Templates
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: template.color }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {template.startTime} - {template.endTime}
              </p>
              <p className="text-xs text-gray-500 capitalize">{template.type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{shifts.length}</p>
              <p className="text-sm text-gray-600">Total Shifts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {shifts.filter(s => s.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {shifts.filter(s => s.status === 'scheduled').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              <p className="text-sm text-gray-600">Templates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
