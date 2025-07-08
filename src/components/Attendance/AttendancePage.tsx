import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  QrCode,
  Camera,
  Download,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceRecord } from '../../types';
import toast from 'react-hot-toast';

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock attendance data
  useEffect(() => {
    const mockRecords: AttendanceRecord[] = [
      {
        id: '1',
        userId: '1',
        date: '2024-01-15',
        clockIn: '09:00',
        clockOut: '17:30',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'New York, NY'
        },
        method: 'geolocation',
        status: 'present'
      },
      {
        id: '2',
        userId: '2',
        date: '2024-01-15',
        clockIn: '08:45',
        clockOut: '17:15',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'New York, NY'
        },
        method: 'qr',
        status: 'present'
      },
      {
        id: '3',
        userId: '3',
        date: '2024-01-15',
        clockIn: '09:30',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'New York, NY'
        },
        method: 'facial',
        status: 'late'
      }
    ];
    setAttendanceRecords(mockRecords);
  }, []);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async () => {
    setIsClockingIn(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId: user?.id || '',
        date: new Date().toISOString().split('T')[0],
        clockIn: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'New York, NY'
        },
        method: 'geolocation',
        status: 'present'
      };
      
      setAttendanceRecords(prev => [newRecord, ...prev]);
      toast.success('Successfully clocked in!');
    } catch (error) {
      toast.error('Failed to clock in. Please try again.');
    } finally {
      setIsClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    setIsClockingIn(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const todayRecord = attendanceRecords.find(record => 
        record.userId === user?.id && 
        record.date === new Date().toISOString().split('T')[0]
      );
      
      if (todayRecord) {
        const updatedRecord = {
          ...todayRecord,
          clockOut: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
        
        setAttendanceRecords(prev => 
          prev.map(record => 
            record.id === todayRecord.id ? updatedRecord : record
          )
        );
        toast.success('Successfully clocked out!');
      }
    } catch (error) {
      toast.error('Failed to clock out. Please try again.');
    } finally {
      setIsClockingIn(false);
    }
  };

  const getCurrentStatus = () => {
    const todayRecord = attendanceRecords.find(record => 
      record.userId === user?.id && 
      record.date === new Date().toISOString().split('T')[0]
    );
    
    if (!todayRecord) return 'not-clocked-in';
    if (todayRecord.clockIn && !todayRecord.clockOut) return 'clocked-in';
    if (todayRecord.clockIn && todayRecord.clockOut) return 'clocked-out';
    return 'not-clocked-in';
  };

  const currentStatus = getCurrentStatus();

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'absent':
        return <XCircle size={16} className="text-red-500" />;
      case 'late':
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track employee attendance and manage clock in/out</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button className="btn-secondary flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Clock In/Out Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
            {currentTime.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </div>
          <p className="text-gray-600">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Clock size={24} className="text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Geolocation</p>
            <p className="text-xs text-gray-500">GPS-based tracking</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <QrCode size={24} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">QR Code</p>
            <p className="text-xs text-gray-500">Scan to clock in/out</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Camera size={24} className="text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Facial Recognition</p>
            <p className="text-xs text-gray-500">AI-powered verification</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentStatus === 'not-clocked-in' && (
            <button
              onClick={handleClockIn}
              disabled={isClockingIn}
              className="btn-primary flex items-center justify-center space-x-2 py-3 px-6"
            >
              {isClockingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Clocking In...</span>
                </>
              ) : (
                <>
                  <Clock size={20} />
                  <span>Clock In</span>
                </>
              )}
            </button>
          )}
          
          {currentStatus === 'clocked-in' && (
            <button
              onClick={handleClockOut}
              disabled={isClockingIn}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isClockingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Clocking Out...</span>
                </>
              ) : (
                <>
                  <Clock size={20} />
                  <span>Clock Out</span>
                </>
              )}
            </button>
          )}
          
          {currentStatus === 'clocked-out' && (
            <div className="text-center">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-2" />
              <p className="text-green-600 font-medium">Already clocked out for today</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {record.userId.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Employee {record.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.clockIn || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.clockOut || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {record.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{record.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-400 mr-1" />
                      {record.location?.address || 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage; 