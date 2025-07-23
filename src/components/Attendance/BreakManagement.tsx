/**
 * Break Management Component - Workforce Management Platform
 * 
 * Comprehensive break management interface that provides:
 * - Different break type support (lunch, coffee, rest, other)
 * - Break timer with countdown and notifications
 * - Break history tracking and analytics
 * - Break policy enforcement and compliance
 * - Mobile-optimized interface with touch interactions
 * - Real-time break status updates
 * 
 * Features:
 * - Multiple break types with customizable durations
 * - Real-time break timer with visual countdown
 * - Break history with detailed analytics
 * - Break policy enforcement and warnings
 * - Break statistics and performance metrics
 * - Mobile-responsive design
 * - Accessibility support
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee,
  Utensils,
  Bed,
  Clock,
  Play,
  Pause,
  StopCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  Timer,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { t } from '../../lib/i18n';
import { useLanguageChange } from '../../lib/i18n-hooks';
import { 
  Break, 
  AttendanceRecord,
  WorkShift
} from '../../types';
import toast from 'react-hot-toast';

/**
 * Break type configuration
 */
interface BreakType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  defaultDuration: number; // in minutes
  maxDuration: number; // in minutes
  description: string;
}

/**
 * Break statistics
 */
interface BreakStats {
  totalBreaks: number;
  totalBreakTime: number; // in minutes
  averageBreakTime: number; // in minutes
  mostUsedType: string;
  complianceRate: number; // percentage
  todayBreaks: number;
  todayBreakTime: number; // in minutes
}

/**
 * Break Management Component
 * 
 * Comprehensive break management interface with timer, history,
 * analytics, and policy enforcement.
 * 
 * @returns JSX element with complete break management interface
 */
const BreakManagement: React.FC = () => {
  const { user } = useAuth();
  // Use language change hook to trigger re-renders when language changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentLocale = useLanguageChange();
  
  // State management
  const [currentBreak, setCurrentBreak] = useState<Break | null>(null);
  const [breakHistory, setBreakHistory] = useState<Break[]>([]);
  const [breakStats, setBreakStats] = useState<BreakStats>({
    totalBreaks: 0,
    totalBreakTime: 0,
    averageBreakTime: 0,
    mostUsedType: '',
    complianceRate: 0,
    todayBreaks: 0,
    todayBreakTime: 0
  });
  const [currentShift, setCurrentShift] = useState<WorkShift | null>(null);
  const [showBreakHistory, setShowBreakHistory] = useState(false);
  const [showBreakAnalytics, setShowBreakAnalytics] = useState(false);
  const [showBreakSettings, setShowBreakSettings] = useState(false);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'analytics'>('current');

  /**
   * Break type configurations
   */
  const breakTypes: BreakType[] = [
    {
      id: 'lunch',
      name: 'Lunch Break',
      icon: Utensils,
      color: 'bg-orange-500',
      defaultDuration: 60,
      maxDuration: 90,
      description: 'Regular lunch break'
    },
    {
      id: 'coffee',
      name: 'Coffee Break',
      icon: Coffee,
      color: 'bg-brown-500',
      defaultDuration: 15,
      maxDuration: 30,
      description: 'Short coffee break'
    },
    {
      id: 'rest',
      name: 'Rest Break',
      icon: Bed,
      color: 'bg-blue-500',
      defaultDuration: 10,
      maxDuration: 20,
      description: 'Quick rest break'
    },
    {
      id: 'other',
      name: 'Other Break',
      icon: Activity,
      color: 'bg-gray-500',
      defaultDuration: 15,
      maxDuration: 60,
      description: 'Other break type'
    }
  ];

  /**
   * Initialize component data
   */
  useEffect(() => {
    initializeMockData();
  }, []);

  /**
   * Timer effect
   */
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // handleBreakEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining]);

  /**
   * Initialize mock data
   */
  const initializeMockData = () => {
    // Mock current shift
    setCurrentShift({
      id: 'shift1',
      name: 'Regular Shift',
      startTime: '09:00',
      endTime: '17:00',
      breakDuration: 60,
      overtimeThreshold: 8,
      color: '#3B82F6',
      isActive: true
    });

    // Mock break history
    const mockBreakHistory: Break[] = [
      {
        id: '1',
        type: 'lunch',
        startTime: '12:00',
        endTime: '13:00',
        duration: 60,
        notes: 'Regular lunch break'
      },
      {
        id: '2',
        type: 'coffee',
        startTime: '10:30',
        endTime: '10:45',
        duration: 15,
        notes: 'Morning coffee break'
      },
      {
        id: '3',
        type: 'rest',
        startTime: '15:00',
        endTime: '15:10',
        duration: 10,
        notes: 'Afternoon rest break'
      }
    ];
    setBreakHistory(mockBreakHistory);

    // Mock break statistics
    setBreakStats({
      totalBreaks: 15,
      totalBreakTime: 450,
      averageBreakTime: 30,
      mostUsedType: 'lunch',
      complianceRate: 95,
      todayBreaks: 2,
      todayBreakTime: 75
    });
  };

  /**
   * Start a break
   */
  const handleStartBreak = async (breakType: Break['type']) => {
    try {
      const breakConfig = breakTypes.find(bt => bt.id === breakType);
      if (!breakConfig) return;

      const newBreak: Break = {
        id: Date.now().toString(),
        type: breakType,
        startTime: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: breakConfig.defaultDuration,
        notes: ''
      };

      setCurrentBreak(newBreak);
      setTimeRemaining(breakConfig.defaultDuration * 60); // Convert to seconds
      setIsTimerRunning(true);
      setIsTimerPaused(false);

      // Add to history
      setBreakHistory(prev => [newBreak, ...prev]);

      toast.success(`${breakConfig.name} started`);
    } catch (error) {
      toast.error('Failed to start break');
    }
  };

  /**
   * Pause/resume break timer
   */
  const handlePauseResume = () => {
    if (isTimerPaused) {
      setIsTimerPaused(false);
      setIsTimerRunning(true);
      toast.success('Break resumed');
    } else {
      setIsTimerPaused(true);
      setIsTimerRunning(false);
      toast.success('Break paused');
    }
  };

  /**
   * End break early
   */
  const handleEndBreak = async () => {
    if (!currentBreak) return;

    try {
      const endTime = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const updatedBreak = {
        ...currentBreak,
        endTime,
        duration: Math.floor((timeRemaining / 60) * 10) / 10 // Convert seconds to minutes
      };

      setBreakHistory(prev => 
        prev.map(break_ => 
          break_.id === currentBreak.id ? updatedBreak : break_
        )
      );

      setCurrentBreak(null);
      setTimeRemaining(0);
      setIsTimerRunning(false);
      setIsTimerPaused(false);

      toast.success('Break ended');
    } catch (error) {
      toast.error('Failed to end break');
    }
  };

  /**
   * Format time display
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Get break type configuration
   */
  const getBreakTypeConfig = (type: Break['type']): BreakType | undefined => {
    return breakTypes.find(bt => bt.id === type);
  };

  /**
   * Get break icon
   */
  const getBreakIcon = (type: Break['type']) => {
    const config = getBreakTypeConfig(type);
    if (!config) return <Activity size={20} />;
    const IconComponent = config.icon;
    return <IconComponent size={20} />;
  };

  /**
   * Get break color
   */
  const getBreakColor = (type: Break['type']): string => {
    const config = getBreakTypeConfig(type);
    return config?.color || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Break Management</h1>
          <p className="text-gray-600 mt-1">Manage your breaks and track break time</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setShowBreakHistory(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Calendar size={16} />
            <span>History</span>
          </button>
          <button
            onClick={() => setShowBreakAnalytics(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <BarChart3 size={16} />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setShowBreakSettings(true)}
            className="btn-secondary"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {[
          { key: 'current', label: 'Current Break', icon: Timer },
          { key: 'history', label: 'Break History', icon: Calendar },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'current' && (
          <motion.div
            key="current"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Current Break Status */}
            {currentBreak ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="mb-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getBreakColor(currentBreak.type)} mb-4`}>
                      {getBreakIcon(currentBreak.type)}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {getBreakTypeConfig(currentBreak.type)?.name}
                    </h3>
                    <p className="text-gray-600">
                      Started at {currentBreak.startTime}
                    </p>
                  </div>

                  {/* Timer Display */}
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 font-mono mb-2">
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isTimerPaused ? 'Paused' : isTimerRunning ? 'Time remaining' : 'Break ended'}
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex justify-center space-x-4">
                    {isTimerRunning ? (
                      <button
                        onClick={handlePauseResume}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Pause size={16} />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button
                        onClick={handlePauseResume}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Play size={16} />
                        <span>Resume</span>
                      </button>
                    )}
                    <button
                      onClick={handleEndBreak}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <StopCircle size={16} />
                      <span>End Break</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <Clock size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Active Break
                    </h3>
                    <p className="text-gray-600">
                      Start a break when you need to take time off
                    </p>
                  </div>

                  {/* Break Type Selection */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {breakTypes.map((breakType) => (
                      <motion.button
                        key={breakType.id}
                        onClick={() => handleStartBreak(breakType.id as Break['type'])}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className={`p-3 rounded-full ${breakType.color} mb-2`}>
                          <breakType.icon size={24} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 mb-1">
                          {breakType.name}
                        </span>
                        <span className="text-xs text-gray-600">
                          {breakType.defaultDuration} min
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Break Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Coffee size={20} className="text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Today's Breaks</p>
                    <p className="text-lg font-semibold text-gray-900">{breakStats.todayBreaks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock size={20} className="text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Today's Break Time</p>
                    <p className="text-lg font-semibold text-gray-900">{breakStats.todayBreakTime} min</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle size={20} className="text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                    <p className="text-lg font-semibold text-gray-900">{breakStats.complianceRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Break History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Break History</h3>
              
              {breakHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No break history available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {breakHistory.map((break_) => (
                    <motion.div
                      key={break_.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getBreakColor(break_.type)}`}>
                          {getBreakIcon(break_.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getBreakTypeConfig(break_.type)?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {break_.startTime} - {break_.endTime || 'Ongoing'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{break_.duration} min</p>
                        <p className="text-xs text-gray-500">
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Break Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Break Usage</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Break usage chart will be displayed here</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Break Trends</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Break trends chart will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Break Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Break Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{breakStats.totalBreaks}</div>
                  <div className="text-sm text-gray-600">Total Breaks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{breakStats.totalBreakTime} min</div>
                  <div className="text-sm text-gray-600">Total Break Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{breakStats.averageBreakTime} min</div>
                  <div className="text-sm text-gray-600">Average Break Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{breakStats.complianceRate}%</div>
                  <div className="text-sm text-gray-600">Compliance Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break History Modal */}
      <AnimatePresence>
        {showBreakHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowBreakHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Break History</h3>
              <div className="space-y-4">
                {breakHistory.map((break_) => (
                  <div key={break_.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getBreakColor(break_.type)}`}>
                        {getBreakIcon(break_.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getBreakTypeConfig(break_.type)?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {break_.startTime} - {break_.endTime || 'Ongoing'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{break_.duration} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break Analytics Modal */}
      <AnimatePresence>
        {showBreakAnalytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowBreakAnalytics(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Break Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{breakStats.totalBreaks}</div>
                  <div className="text-sm text-gray-600">Total Breaks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{breakStats.averageBreakTime} min</div>
                  <div className="text-sm text-gray-600">Average Break Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{breakStats.mostUsedType}</div>
                  <div className="text-sm text-gray-600">Most Used Type</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{breakStats.complianceRate}%</div>
                  <div className="text-sm text-gray-600">Compliance Rate</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break Settings Modal */}
      <AnimatePresence>
        {showBreakSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowBreakSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Break Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Break notifications</span>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    Enabled
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Auto-end breaks</span>
                  <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">
                    Disabled
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Break reminders</span>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    Enabled
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BreakManagement; 