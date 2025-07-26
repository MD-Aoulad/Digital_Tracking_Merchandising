/**
 * Real-Time Clock Component - Workforce Management Platform
 * 
 * Real-time clock display component that provides:
 * - Current time display with seconds
 * - Current date information
 * - Timezone support and display
 * - Real-time updates every second
 * - Mobile-responsive design
 * - Accessibility support
 * 
 * Features:
 * - Real-time clock with seconds precision
 * - Current date display
 * - Timezone information
 * - Smooth animations
 * - Mobile-optimized interface
 * - Accessibility features
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, MapPin } from 'lucide-react';

/**
 * Real-Time Clock Component
 * 
 * Displays current time and date with real-time updates
 * 
 * @returns JSX element with real-time clock display
 */
const RealTimeClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timezone, setTimezone] = useState('');

  /**
   * Initialize timezone and start clock updates
   */
  useEffect(() => {
    // Get timezone
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Format time for display
   */
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  /**
   * Format date for display
   */
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Format timezone for display
   */
  const formatTimezone = (tz: string): string => {
    return tz.replace(/_/g, ' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="text-center">
        {/* Time Display */}
        <motion.div
          key={currentTime.getTime()}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <div className="text-4xl font-bold text-gray-900 font-mono mb-2">
            {formatTime(currentTime)}
          </div>
          <div className="text-lg text-gray-600">
            {formatDate(currentTime)}
          </div>
        </motion.div>

        {/* Timezone Information */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <MapPin size={14} />
          <span>{formatTimezone(timezone)}</span>
        </div>

        {/* Visual Clock Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="mt-4 flex justify-center"
        >
          <Clock size={24} className="text-gray-400" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RealTimeClock; 