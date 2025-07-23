/**
 * Employee Attendance Card Component - Workforce Management Platform
 * 
 * Individual employee attendance card component that provides:
 * - Employee attendance status and information
 * - Current location and last seen time
 * - Break status and type
 * - Quick action buttons
 * - Mobile-responsive design
 * 
 * Features:
 * - Employee attendance status display
 * - Current location and activity
 * - Break management integration
 * - Quick action buttons
 * - Mobile-optimized interface
 * - Accessibility support
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Clock,
  Coffee,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { TeamStatus } from '../../types';

/**
 * Employee Attendance Card Props
 */
interface EmployeeAttendanceCardProps {
  employee: TeamStatus;
  onViewDetails?: (employeeId: string) => void;
  onSendMessage?: (employeeId: string) => void;
  onCallEmployee?: (employeeId: string) => void;
  onEmailEmployee?: (employeeId: string) => void;
  onViewSchedule?: (employeeId: string) => void;
}

/**
 * Employee Attendance Card Component
 * 
 * Individual employee attendance status card with actions
 * 
 * @param props Component props
 * @returns JSX element with employee attendance card
 */
const EmployeeAttendanceCard: React.FC<EmployeeAttendanceCardProps> = ({
  employee,
  onViewDetails,
  onSendMessage,
  onCallEmployee,
  onEmailEmployee,
  onViewSchedule
}) => {
  const [showActions, setShowActions] = useState(false);

  /**
   * Get status color based on attendance status
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'break': return 'text-orange-600 bg-orange-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Get status icon based on attendance status
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} />;
      case 'break': return <Coffee size={16} />;
      case 'absent': return <AlertCircle size={16} />;
      case 'late': return <Clock size={16} />;
      default: return <User size={16} />;
    }
  };

  /**
   * Get status text
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'present': return 'Present';
      case 'break': return 'On Break';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      default: return 'Unknown';
    }
  };

  /**
   * Format time difference
   */
  const formatTimeDifference = (timestamp: string): string => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  /**
   * Get break type text
   */
  const getBreakTypeText = (breakType: string | null): string => {
    if (!breakType) return '';
    return breakType.charAt(0).toUpperCase() + breakType.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        {/* Employee Info */}
        <div className="flex items-start space-x-3 flex-1">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 truncate">
                {employee.name}
              </h3>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                {getStatusIcon(employee.status)}
                <span className="ml-1">{getStatusText(employee.status)}</span>
              </div>
            </div>

            {/* Status Details */}
            <div className="space-y-1 text-sm text-gray-600">
              {employee.status === 'present' && employee.clockInTime && (
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>Clocked in at {employee.clockInTime}</span>
                </div>
              )}
              
              {employee.status === 'break' && employee.breakType && (
                <div className="flex items-center space-x-1">
                  <Coffee size={12} />
                  <span>On {getBreakTypeText(employee.breakType)} break</span>
                </div>
              )}
              
              {employee.status === 'absent' && (
                <span>Not present today</span>
              )}

              {/* Location */}
              {employee.currentLocation && (
                <div className="flex items-center space-x-1">
                  <MapPin size={12} />
                  <span className="truncate">{employee.currentLocation}</span>
                </div>
              )}

              {/* Last Seen */}
              <div className="text-xs text-gray-500">
                Last seen {formatTimeDifference(employee.lastSeen)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal size={16} className="text-gray-600" />
          </button>

          {/* Action Menu */}
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
            >
              {onViewDetails && (
                <button
                  onClick={() => {
                    onViewDetails(employee.userId);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye size={14} />
                  <span>View Details</span>
                </button>
              )}

              {onSendMessage && (
                <button
                  onClick={() => {
                    onSendMessage(employee.userId);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <MessageCircle size={14} />
                  <span>Send Message</span>
                </button>
              )}

              {onCallEmployee && (
                <button
                  onClick={() => {
                    onCallEmployee(employee.userId);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Phone size={14} />
                  <span>Call Employee</span>
                </button>
              )}

              {onEmailEmployee && (
                <button
                  onClick={() => {
                    onEmailEmployee(employee.userId);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Mail size={14} />
                  <span>Send Email</span>
                </button>
              )}

              {onViewSchedule && (
                <button
                  onClick={() => {
                    onViewSchedule(employee.userId);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Calendar size={14} />
                  <span>View Schedule</span>
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex space-x-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(employee.userId)}
              className="flex-1 btn-secondary text-xs py-1"
            >
              Details
            </button>
          )}
          
          {onSendMessage && (
            <button
              onClick={() => onSendMessage(employee.userId)}
              className="flex-1 btn-secondary text-xs py-1"
            >
              Message
            </button>
          )}
          
          {onViewSchedule && (
            <button
              onClick={() => onViewSchedule(employee.userId)}
              className="flex-1 btn-secondary text-xs py-1"
            >
              Schedule
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeAttendanceCard; 