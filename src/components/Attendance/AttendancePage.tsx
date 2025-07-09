/**
 * Enhanced Attendance Page Component - Workforce Management Platform
 * 
 * Comprehensive attendance management page that provides:
 * - Real-time clock in/out functionality with multiple authentication methods
 * - Break management with different break types
 * - Overtime tracking and approval workflow
 * - Shift management and geofencing
 * - Photo capture for clock in/out verification
 * - Team attendance view and manager approval
 * - Advanced filtering, search, and reporting
 * - Mobile-optimized interface
 * 
 * Features inspired by Shoplworks:
 * - GPS-based geolocation tracking with geofencing
 * - QR code scanning for clock in/out
 * - Facial recognition and photo capture
 * - Break management (lunch, coffee, rest)
 * - Overtime tracking and approval
 * - Shift-based attendance
 * - Manager approval workflow
 * - Team attendance overview
 * - Detailed reporting and analytics
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
  Users,
  Coffee,
  Utensils,
  Bed,
  Edit,
  Eye,
  FileText,
  Smartphone,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Pause,
  StopCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AttendanceRecord, 
  Break, 
  WorkShift, 
  GeofenceZone, 
  AttendanceApproval,
  AttendanceStats,
  FaceVerificationSettings,
  TemporaryWorkplaceRecord,
  ReusableTemporaryWorkplace,
  TemporaryWorkplaceStats
} from '../../types';
import type { TemporaryWorkplaceSettings, ScheduledWorkdaysSettings } from '../../types';
import FaceVerification from './FaceVerification';
import TemporaryWorkplaceSettingsComponent from './TemporaryWorkplaceSettings';
import TemporaryWorkplacePunch from './TemporaryWorkplacePunch';
import TemporaryWorkplaceRecords from './TemporaryWorkplaceRecords';
import ScheduledWorkdaysSettingsComponent from './ScheduledWorkdaysSettings';
import toast from 'react-hot-toast';

/**
 * Enhanced AttendancePage Component
 * 
 * Comprehensive attendance management interface with advanced features
 * including break management, overtime tracking, shift management,
 * geofencing, photo capture, and approval workflow.
 * 
 * @returns JSX element with complete attendance management interface
 */
const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'personal' | 'team'>('personal');
  
  // Break management
  const [currentBreak, setCurrentBreak] = useState<Break | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  
  // Photo capture
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  
  // Face verification
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [faceVerificationSettings, setFaceVerificationSettings] = useState<FaceVerificationSettings>({
    id: 'face-verification-settings',
    isEnabled: true,
    requireFaceVerification: false,
    maxRetryAttempts: 3,
    imageQuality: 'medium',
    allowedImageFormats: ['jpg', 'jpeg', 'png'],
    maxImageSize: 5 * 1024 * 1024,
    retentionDays: 365,
    createdBy: user?.id || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // Shift management
  const [currentShift, setCurrentShift] = useState<WorkShift | null>(null);
  const [availableShifts, setAvailableShifts] = useState<WorkShift[]>([]);
  
  // Geofencing
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [geofenceZones, setGeofenceZones] = useState<GeofenceZone[]>([]);
  const [withinGeofence, setWithinGeofence] = useState(false);
  
  // Approval workflow
  const [pendingApprovals, setPendingApprovals] = useState<AttendanceApproval[]>([]);
  
  // Statistics
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    overtimeHours: 0,
    averageWorkHours: 0,
    attendanceRate: 0
  });

  // Temporary workplace features
  const [temporaryWorkplaceSettings, setTemporaryWorkplaceSettings] = useState<TemporaryWorkplaceSettings>({
    id: 'temp-workplace-settings',
    isEnabled: true,
    targetType: 'all-employees',
    targetGroups: [],
    targetJobTitles: [],
    targetEmployees: [],
    requireReason: true,
    requirePhoto: false,
    requireLocation: true,
    maxDistanceFromWorkplace: 5000,
    createdBy: user?.id || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [temporaryWorkplaceRecords, setTemporaryWorkplaceRecords] = useState<TemporaryWorkplaceRecord[]>([]);
  const [reusableLocations, setReusableLocations] = useState<ReusableTemporaryWorkplace[]>([]);
  const [showTemporaryWorkplaceSettings, setShowTemporaryWorkplaceSettings] = useState(false);
  const [showTemporaryWorkplacePunch, setShowTemporaryWorkplacePunch] = useState(false);
  const [showTemporaryWorkplaceRecords, setShowTemporaryWorkplaceRecords] = useState(false);

  // Scheduled workdays features
  const [scheduledWorkdaysSettings, setScheduledWorkdaysSettings] = useState<ScheduledWorkdaysSettings>({
    id: 'scheduled-workdays-settings',
    isEnabled: false,
    allowPunchInAtAnyTime: true,
    punchInAdvanceMinutes: 30,
    requireScheduleRegistration: true,
    targetType: 'all-employees',
    targetGroups: [],
    targetJobTitles: [],
    targetEmployees: [],
    createdBy: user?.id || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [showScheduledWorkdaysSettings, setShowScheduledWorkdaysSettings] = useState(false);

  /**
   * Initialize mock data for enhanced features
   */
  useEffect(() => {
    // Mock attendance records with enhanced data
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
        status: 'present',
        shiftId: 'shift-1',
        breaks: [
          {
            id: 'break-1',
            type: 'lunch',
            startTime: '12:00',
            endTime: '13:00',
            duration: 60,
            notes: 'Lunch break'
          },
          {
            id: 'break-2',
            type: 'coffee',
            startTime: '15:30',
            endTime: '15:45',
            duration: 15,
            notes: 'Coffee break'
          }
        ],
        overtime: {
          hours: 0.5,
          reason: 'Project deadline'
        },
        photos: {
          clockIn: '/api/photos/clockin-1.jpg',
          clockOut: '/api/photos/clockout-1.jpg'
        },
        notes: 'Productive day, completed all tasks',
        approvedBy: 'manager-1',
        approvedAt: '2024-01-15T17:30:00Z',
        requiresApproval: false,
        geofence: {
          zoneId: 'zone-1',
          zoneName: 'Main Office',
          withinZone: true
        }
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
        status: 'present',
        shiftId: 'shift-1',
        breaks: [
          {
            id: 'break-3',
            type: 'lunch',
            startTime: '12:30',
            endTime: '13:30',
            duration: 60
          }
        ],
        photos: {
          clockIn: '/api/photos/clockin-2.jpg'
        },
        requiresApproval: false,
        geofence: {
          zoneId: 'zone-1',
          zoneName: 'Main Office',
          withinZone: true
        }
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
        status: 'late',
        shiftId: 'shift-1',
        breaks: [],
        requiresApproval: true,
        geofence: {
          zoneId: 'zone-1',
          zoneName: 'Main Office',
          withinZone: true
        }
      }
    ];
    setAttendanceRecords(mockRecords);

    // Mock shifts
    const mockShifts: WorkShift[] = [
      {
        id: 'shift-1',
        name: 'Morning Shift',
        startTime: '09:00',
        endTime: '17:00',
        breakDuration: 60,
        overtimeThreshold: 8,
        color: '#3B82F6',
        isActive: true
      },
      {
        id: 'shift-2',
        name: 'Night Shift',
        startTime: '22:00',
        endTime: '06:00',
        breakDuration: 45,
        overtimeThreshold: 8,
        color: '#1F2937',
        isActive: true
      }
    ];
    setAvailableShifts(mockShifts);
    setCurrentShift(mockShifts[0]);

    // Mock geofence zones
    const mockGeofences: GeofenceZone[] = [
      {
        id: 'zone-1',
        name: 'Main Office',
        center: { lat: 40.7128, lng: -74.0060 },
        radius: 100,
        address: '123 Main St, New York, NY',
        isActive: true,
        allowedMethods: ['geolocation', 'qr', 'facial', 'photo']
      }
    ];
    setGeofenceZones(mockGeofences);

    // Mock pending approvals
    const mockApprovals: AttendanceApproval[] = [
      {
        id: 'approval-1',
        attendanceId: '3',
        userId: '3',
        managerId: 'manager-1',
        type: 'late',
        reason: 'Traffic delay',
        status: 'pending',
        requestedAt: '2024-01-15T09:30:00Z'
      }
    ];
    setPendingApprovals(mockApprovals);

    // Calculate statistics
    const stats: AttendanceStats = {
      totalDays: 22,
      presentDays: 20,
      absentDays: 1,
      lateDays: 1,
      overtimeHours: 8.5,
      averageWorkHours: 7.8,
      attendanceRate: 90.9
    };
    setAttendanceStats(stats);
  }, []);

  /**
   * Update current time every second
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Get current location for geofencing
   */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          
          // Check if within any geofence zone
          const withinZone = geofenceZones.some(zone => {
            const distance = calculateDistance(
              latitude, longitude,
              zone.center.lat, zone.center.lng
            );
            return distance <= zone.radius;
          });
          setWithinGeofence(withinZone);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get location. Please check permissions.');
        }
      );
    }
  }, [geofenceZones]);

  /**
   * Calculate distance between two points using Haversine formula
   */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  /**
   * Enhanced clock in with photo capture and geofencing
   */
  const handleClockIn = async () => {
    if (!withinGeofence) {
      toast.error('You must be within the designated work zone to clock in.');
      return;
    }

    // Check if face verification is required
    if (faceVerificationSettings.isEnabled && faceVerificationSettings.requireFaceVerification) {
      setShowFaceVerification(true);
      return;
    }

    setIsClockingIn(true);
    try {
      // Simulate photo capture
      if (showPhotoCapture) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCapturedPhoto('/api/photos/clockin-' + Date.now() + '.jpg');
      }

      // Simulate API call delay
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
        location: currentLocation ? {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address: 'Current Location'
        } : undefined,
        method: capturedPhoto ? 'photo' : 'geolocation',
        status: 'present',
        shiftId: currentShift?.id,
        breaks: [],
        photos: capturedPhoto ? { clockIn: capturedPhoto } : undefined,
        requiresApproval: false,
        geofence: {
          zoneId: geofenceZones[0]?.id || '',
          zoneName: geofenceZones[0]?.name || '',
          withinZone: withinGeofence
        }
      };
      
      setAttendanceRecords(prev => [newRecord, ...prev]);
      toast.success('Successfully clocked in!');
      setCapturedPhoto(null);
      setShowPhotoCapture(false);
    } catch (error) {
      toast.error('Failed to clock in. Please try again.');
    } finally {
      setIsClockingIn(false);
    }
  };

  /**
   * Enhanced clock out with break calculation
   */
  const handleClockOut = async () => {
    // Check if face verification is required
    if (faceVerificationSettings.isEnabled && faceVerificationSettings.requireFaceVerification) {
      setShowFaceVerification(true);
      return;
    }

    setIsClockingIn(true);
    try {
      // Simulate photo capture
      if (showPhotoCapture) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCapturedPhoto('/api/photos/clockout-' + Date.now() + '.jpg');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const todayRecord = attendanceRecords.find(record => 
        record.userId === user?.id && 
        record.date === new Date().toISOString().split('T')[0]
      );
      
      if (todayRecord) {
        // Calculate total break time
        const totalBreakTime = todayRecord.breaks.reduce((total, break_) => 
          total + (break_.duration || 0), 0
        );

        // Calculate overtime
        const clockInTime = new Date(`2024-01-15T${todayRecord.clockIn}:00`);
        const clockOutTime = new Date();
        const workHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        const netWorkHours = workHours - (totalBreakTime / 60);
        
        const overtime = currentShift && netWorkHours > currentShift.overtimeThreshold ? {
          hours: netWorkHours - currentShift.overtimeThreshold,
          reason: 'Regular work hours exceeded'
        } : undefined;

        const updatedRecord = {
          ...todayRecord,
          clockOut: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          overtime,
          photos: {
            ...todayRecord.photos,
            clockOut: capturedPhoto
          }
        };
        
        setAttendanceRecords(prev => 
          prev.map(record => 
            record.id === todayRecord.id ? updatedRecord : record
          )
        );
        toast.success('Successfully clocked out!');
        setCapturedPhoto(null);
        setShowPhotoCapture(false);
      }
    } catch (error) {
      toast.error('Failed to clock out. Please try again.');
    } finally {
      setIsClockingIn(false);
    }
  };

  /**
   * Start a break
   */
  const handleStartBreak = (breakType: Break['type']) => {
    const newBreak: Break = {
      id: Date.now().toString(),
      type: breakType,
      startTime: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    
    setCurrentBreak(newBreak);
    setIsOnBreak(true);
    
    // Update current attendance record
    const todayRecord = attendanceRecords.find(record => 
      record.userId === user?.id && 
      record.date === new Date().toISOString().split('T')[0]
    );
    
    if (todayRecord) {
      const updatedRecord = {
        ...todayRecord,
        breaks: [...todayRecord.breaks, newBreak]
      };
      
      setAttendanceRecords(prev => 
        prev.map(record => 
          record.id === todayRecord.id ? updatedRecord : record
        )
      );
    }
    
    toast.success(`${breakType.charAt(0).toUpperCase() + breakType.slice(1)} break started`);
  };

  /**
   * End current break
   */
  const handleEndBreak = () => {
    if (!currentBreak) return;
    
    const endTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const startTime = new Date(`2024-01-15T${currentBreak.startTime}:00`);
    const endTimeDate = new Date(`2024-01-15T${endTime}:00`);
    const duration = Math.round((endTimeDate.getTime() - startTime.getTime()) / (1000 * 60));
    
    const updatedBreak = {
      ...currentBreak,
      endTime,
      duration
    };
    
    // Update attendance record
    const todayRecord = attendanceRecords.find(record => 
      record.userId === user?.id && 
      record.date === new Date().toISOString().split('T')[0]
    );
    
    if (todayRecord) {
      const updatedRecord = {
        ...todayRecord,
        breaks: todayRecord.breaks.map(break_ => 
          break_.id === currentBreak.id ? updatedBreak : break_
        )
      };
      
      setAttendanceRecords(prev => 
        prev.map(record => 
          record.id === todayRecord.id ? updatedRecord : record
        )
      );
    }
    
    setCurrentBreak(null);
    setIsOnBreak(false);
    toast.success('Break ended');
  };

  /**
   * Get current attendance status for the logged-in user
   */
  const getCurrentStatus = () => {
    const todayRecord = attendanceRecords.find(record => 
      record.userId === user?.id && 
      record.date === new Date().toISOString().split('T')[0]
    );
    
    if (!todayRecord) return 'not-clocked-in';
    if (todayRecord.clockIn && !todayRecord.clockOut) {
      if (isOnBreak) return 'on-break';
      return 'clocked-in';
    }
    if (todayRecord.clockIn && todayRecord.clockOut) return 'clocked-out';
    return 'not-clocked-in';
  };

  const currentStatus = getCurrentStatus();

  /**
   * Filter attendance records based on search term and status
   */
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  /**
   * Get status icon based on attendance status
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'absent':
        return <XCircle size={16} className="text-red-500" />;
      case 'late':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'overtime':
        return <Clock size={16} className="text-blue-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  /**
   * Get break icon based on break type
   */
  const getBreakIcon = (type: Break['type']) => {
    switch (type) {
      case 'lunch':
        return <Utensils size={16} className="text-orange-500" />;
      case 'coffee':
        return <Coffee size={16} className="text-brown-500" />;
      case 'rest':
        return <Bed size={16} className="text-purple-500" />;
      default:
        return <Pause size={16} className="text-gray-500" />;
    }
  };

  /**
   * Handle face verification success
   */
  const handleFaceVerificationSuccess = (imageUrl: string) => {
    setCapturedPhoto(imageUrl);
    setShowFaceVerification(false);
    
    // Continue with clock in/out process
    if (currentStatus === 'not-clocked-in') {
      handleClockInProcess();
    } else if (currentStatus === 'clocked-in') {
      handleClockOutProcess();
    }
  };

  /**
   * Handle face verification failure
   */
  const handleFaceVerificationFailure = (reason: string) => {
    setShowFaceVerification(false);
    toast.error(`Face verification failed: ${reason}`);
  };

  /**
   * Handle face verification cancel
   */
  const handleFaceVerificationCancel = () => {
    setShowFaceVerification(false);
    toast.success('Face verification cancelled');
  };

  // Temporary workplace handlers
  const handleTemporaryWorkplaceSettingsSave = (settings: TemporaryWorkplaceSettings) => {
    setTemporaryWorkplaceSettings(settings);
    setShowTemporaryWorkplaceSettings(false);
    toast.success('Temporary workplace settings saved successfully');
  };

  const handleTemporaryWorkplacePunch = (record: TemporaryWorkplaceRecord) => {
    setTemporaryWorkplaceRecords(prev => [...prev, record]);
    setShowTemporaryWorkplacePunch(false);
    toast.success(`${record.type === 'clock-in' ? 'Clock in' : 'Clock out'} from temporary workplace recorded successfully`);
  };

  const handleSaveReusableLocation = (location: Omit<ReusableTemporaryWorkplace, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLocation: ReusableTemporaryWorkplace = {
      ...location,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setReusableLocations(prev => [...prev, newLocation]);
    toast.success('Location saved for future use');
  };

  const handleViewTemporaryWorkplaceRecord = (record: TemporaryWorkplaceRecord) => {
    // In a real app, this would open a detailed view modal
    console.log('View record:', record);
    toast('Record details would be displayed here');
  };

  const handleExportTemporaryWorkplaceRecords = (records: TemporaryWorkplaceRecord[]) => {
    // In a real app, this would export to CSV/Excel
    console.log('Export records:', records);
    toast.success(`Exported ${records.length} records`);
  };

  // Scheduled workdays handlers
  const handleScheduledWorkdaysSettingsSave = (settings: ScheduledWorkdaysSettings) => {
    setScheduledWorkdaysSettings(settings);
    setShowScheduledWorkdaysSettings(false);
    toast.success('Scheduled workdays settings saved successfully');
  };

  /**
   * Handle clock in process (after face verification)
   */
  const handleClockInProcess = async () => {
    setIsClockingIn(true);
    try {
      // Simulate API call delay
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
        location: currentLocation ? {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address: 'Current Location'
        } : undefined,
        method: capturedPhoto ? 'photo' : 'geolocation',
        status: 'present',
        shiftId: currentShift?.id,
        breaks: [],
        photos: capturedPhoto ? { clockIn: capturedPhoto } : undefined,
        requiresApproval: false,
        geofence: {
          zoneId: geofenceZones[0]?.id || '',
          zoneName: geofenceZones[0]?.name || '',
          withinZone: withinGeofence
        }
      };
      
      setAttendanceRecords(prev => [newRecord, ...prev]);
      toast.success('Successfully clocked in!');
      setCapturedPhoto(null);
    } catch (error) {
      toast.error('Failed to clock in. Please try again.');
    } finally {
      setIsClockingIn(false);
    }
  };

  /**
   * Handle clock out process (after face verification)
   */
  const handleClockOutProcess = async () => {
    setIsClockingIn(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const todayRecord = attendanceRecords.find(record => 
        record.userId === user?.id && 
        record.date === new Date().toISOString().split('T')[0]
      );
      
      if (todayRecord) {
        // Calculate total break time
        const totalBreakTime = todayRecord.breaks.reduce((total, break_) => 
          total + (break_.duration || 0), 0
        );

        // Calculate overtime
        const clockInTime = new Date(`2024-01-15T${todayRecord.clockIn}:00`);
        const clockOutTime = new Date();
        const workHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        const netWorkHours = workHours - (totalBreakTime / 60);
        
        const overtime = currentShift && netWorkHours > currentShift.overtimeThreshold ? {
          hours: netWorkHours - currentShift.overtimeThreshold,
          reason: 'Regular work hours exceeded'
        } : undefined;

        const updatedRecord = {
          ...todayRecord,
          clockOut: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          overtime,
          photos: {
            ...todayRecord.photos,
            clockOut: capturedPhoto
          }
        };
        
        setAttendanceRecords(prev => 
          prev.map(record => 
            record.id === todayRecord.id ? updatedRecord : record
          )
        );
        toast.success('Successfully clocked out!');
        setCapturedPhoto(null);
      }
    } catch (error) {
      toast.error('Failed to clock out. Please try again.');
    } finally {
      setIsClockingIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header with view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track employee attendance with advanced features</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('personal')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'personal'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setViewMode('team')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'team'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Team
            </button>
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-lg font-semibold text-gray-900">{attendanceStats.attendanceRate}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Work Hours</p>
              <p className="text-lg font-semibold text-gray-900">{attendanceStats.averageWorkHours}h</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle size={20} className="text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
              <p className="text-lg font-semibold text-gray-900">{attendanceStats.overtimeHours}h</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users size={20} className="text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-lg font-semibold text-gray-900">{attendanceStats.presentDays}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Clock In/Out Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        {/* Current time and shift info */}
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
            {currentTime.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </div>
          <p className="text-gray-600 mb-2">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          {currentShift && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Clock size={14} className="mr-1" />
              {currentShift.name} ({currentShift.startTime} - {currentShift.endTime})
            </div>
          )}
        </div>

        {/* Geofence status */}
        <div className="mb-6">
          <div className={`flex items-center justify-center p-3 rounded-lg ${
            withinGeofence 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <MapPin size={20} className={`mr-2 ${withinGeofence ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm font-medium ${
              withinGeofence ? 'text-green-800' : 'text-red-800'
            }`}>
              {withinGeofence ? 'Within work zone' : 'Outside work zone'}
            </span>
          </div>
        </div>

        {/* Authentication methods */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Smartphone size={24} className="text-orange-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Photo Capture</p>
            <p className="text-xs text-gray-500">Take photo for verification</p>
          </div>
        </div>

        {/* Photo capture and face verification toggles */}
        <div className="mb-6 space-y-3">
          <label className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={showPhotoCapture}
              onChange={(e) => setShowPhotoCapture(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Capture photo during clock in/out</span>
          </label>
          
          <label className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={faceVerificationSettings.requireFaceVerification}
              onChange={(e) => setFaceVerificationSettings(prev => ({
                ...prev,
                requireFaceVerification: e.target.checked
              }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Require face verification for attendance</span>
          </label>
        </div>

        {/* Clock in/out buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          {currentStatus === 'not-clocked-in' && (
            <button
              onClick={handleClockIn}
              disabled={isClockingIn || !withinGeofence}
              className="btn-primary flex items-center justify-center space-x-2 py-3 px-6 disabled:opacity-50"
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
                  <StopCircle size={20} />
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

        {/* Break management */}
        {currentStatus === 'clocked-in' && !isOnBreak && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Take a Break</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleStartBreak('lunch')}
                className="flex items-center justify-center space-x-2 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <Utensils size={20} className="text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Lunch Break</span>
              </button>
              <button
                onClick={() => handleStartBreak('coffee')}
                className="flex items-center justify-center space-x-2 p-3 bg-brown-50 hover:bg-brown-100 rounded-lg transition-colors"
              >
                <Coffee size={20} className="text-brown-600" />
                <span className="text-sm font-medium text-brown-800">Coffee Break</span>
              </button>
              <button
                onClick={() => handleStartBreak('rest')}
                className="flex items-center justify-center space-x-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <Bed size={20} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Rest Break</span>
              </button>
            </div>
          </div>
        )}

        {/* Current break status */}
        {isOnBreak && currentBreak && (
          <div className="border-t pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getBreakIcon(currentBreak.type)}
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      On {currentBreak.type.charAt(0).toUpperCase() + currentBreak.type.slice(1)} Break
                    </p>
                    <p className="text-xs text-blue-700">
                      Started at {currentBreak.startTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleEndBreak}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Pause size={16} />
                  <span>End Break</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
          <div className="space-y-3">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    {approval.type.charAt(0).toUpperCase() + approval.type.slice(1)} Request
                  </p>
                  <p className="text-xs text-yellow-700">{approval.reason}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-green-100 hover:bg-green-200 rounded-lg">
                    <ThumbsUp size={16} className="text-green-600" />
                  </button>
                  <button className="p-2 bg-red-100 hover:bg-red-200 rounded-lg">
                    <ThumbsDown size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Enhanced Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search input */}
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
          
          {/* Filter controls */}
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
              <option value="overtime">Overtime</option>
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

      {/* Enhanced Attendance Records Table */}
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
                  Breaks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                    <div className="flex flex-wrap gap-1">
                      {record.breaks.map((break_) => (
                        <span
                          key={break_.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {getBreakIcon(break_.type)}
                          <span className="ml-1">{break_.duration || 0}m</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.overtime ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {record.overtime.hours}h
                      </span>
                    ) : '-'}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Face Verification Modal */}
      <AnimatePresence>
        {showFaceVerification && (
          <FaceVerification
            sessionType={currentStatus === 'not-clocked-in' ? 'clock-in' : 'clock-out'}
            onSuccess={handleFaceVerificationSuccess}
            onFailure={handleFaceVerificationFailure}
            onCancel={handleFaceVerificationCancel}
            settings={faceVerificationSettings}
          />
        )}
      </AnimatePresence>

      {/* Temporary Workplace Features */}
      {temporaryWorkplaceSettings.isEnabled && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Temporary Workplace</h3>
              <p className="text-sm text-gray-500">Punch in/out from unregistered locations</p>
            </div>
            <div className="flex items-center space-x-3">
              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowTemporaryWorkplaceSettings(true)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Settings
                </button>
              )}
              <button
                onClick={() => setShowTemporaryWorkplacePunch(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Punch In/Out
              </button>
              <button
                onClick={() => setShowTemporaryWorkplaceRecords(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View Records
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-lg font-semibold text-gray-900">{temporaryWorkplaceRecords.length}</p>
                </div>
                <FileText size={20} className="text-gray-400" />
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saved Locations</p>
                  <p className="text-lg font-semibold text-gray-900">{reusableLocations.length}</p>
                </div>
                <MapPin size={20} className="text-gray-400" />
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {temporaryWorkplaceRecords.filter(record => {
                      const recordDate = new Date(record.date);
                      const now = new Date();
                      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Calendar size={20} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Workdays Features */}
      {scheduledWorkdaysSettings.isEnabled && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Workdays</h3>
              <p className="text-sm text-gray-500">Punch in only on scheduled workdays</p>
            </div>
            <div className="flex items-center space-x-3">
              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowScheduledWorkdaysSettings(true)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Settings
                </button>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>
                  {scheduledWorkdaysSettings.allowPunchInAtAnyTime 
                    ? 'Any time on scheduled days' 
                    : `${scheduledWorkdaysSettings.punchInAdvanceMinutes} min before start`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Target Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {scheduledWorkdaysSettings.targetType.replace('-', ' ')}
                  </p>
                </div>
                <Users size={20} className="text-gray-400" />
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Schedule Required</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {scheduledWorkdaysSettings.requireScheduleRegistration ? 'Yes' : 'No'}
                  </p>
                </div>
                <Calendar size={20} className="text-gray-400" />
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </div>
                <CheckCircle size={20} className="text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Workplace Modals */}
      <AnimatePresence>
        {showTemporaryWorkplaceSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <TemporaryWorkplaceSettingsComponent
              onSave={handleTemporaryWorkplaceSettingsSave}
              onCancel={() => setShowTemporaryWorkplaceSettings(false)}
            />
          </div>
        )}

        {showTemporaryWorkplacePunch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <TemporaryWorkplacePunch
              settings={temporaryWorkplaceSettings}
              onPunch={handleTemporaryWorkplacePunch}
              onCancel={() => setShowTemporaryWorkplacePunch(false)}
              reusableLocations={reusableLocations}
              onSaveReusableLocation={handleSaveReusableLocation}
            />
          </div>
        )}

        {showTemporaryWorkplaceRecords && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-7xl">
              <TemporaryWorkplaceRecords
                records={temporaryWorkplaceRecords}
                reusableLocations={reusableLocations}
                stats={{
                  totalRecords: temporaryWorkplaceRecords.length,
                  uniqueLocations: new Set(temporaryWorkplaceRecords.map(r => `${r.location.lat},${r.location.lng}`)).size,
                  mostUsedLocations: [],
                  averageDistance: 0,
                  topReasons: []
                }}
                onViewRecord={handleViewTemporaryWorkplaceRecord}
                onExportRecords={handleExportTemporaryWorkplaceRecords}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowTemporaryWorkplaceRecords(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Workdays Settings Modal */}
        {showScheduledWorkdaysSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <ScheduledWorkdaysSettingsComponent
              onSave={handleScheduledWorkdaysSettingsSave}
              onCancel={() => setShowScheduledWorkdaysSettings(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendancePage;
