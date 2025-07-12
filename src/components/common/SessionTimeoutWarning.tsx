import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SessionTimeoutWarningProps {
  warningTimeMinutes?: number; // Time before session expires to show warning
}

/**
 * Session Timeout Warning Component
 * 
 * Shows a warning when user's session is about to expire and provides
 * options to extend the session or logout.
 * 
 * @param warningTimeMinutes - Minutes before session expires to show warning (default: 5)
 * @returns JSX element with session timeout warning
 */
const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({ 
  warningTimeMinutes = 5 
}) => {
  const { user, logout, resetSessionTimer, sessionTimeout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!user) return;

    let warningTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    const startWarningTimer = () => {
      // Show warning 5 minutes before session expires
      const warningTimeMs = (sessionTimeout - warningTimeMinutes) * 60 * 1000;
      
      warningTimer = setTimeout(() => {
        setShowWarning(true);
        setTimeRemaining(warningTimeMinutes * 60); // Convert to seconds
        
        // Start countdown
        countdownTimer = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              // Time's up - logout (AuthContext will handle the redirect)
              logout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, warningTimeMs);
    };

    startWarningTimer();

    return () => {
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [user, sessionTimeout, warningTimeMinutes, logout]);

  const handleExtendSession = () => {
    resetSessionTimer();
    setShowWarning(false);
    setTimeRemaining(0);
  };

  const handleLogout = () => {
    logout();
    setShowWarning(false);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Session Timeout Warning
            </h3>
            <p className="text-sm text-gray-600">
              Your session will expire soon due to inactivity
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">Time remaining:</span>
            <span className={`text-lg font-mono font-bold ${
              timeRemaining <= 60 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeRemaining <= 60 ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ 
                width: `${(timeRemaining / (warningTimeMinutes * 60)) * 100}%` 
              }}
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleExtendSession}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Extend Session
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Click "Extend Session" to continue working, or you'll be automatically logged out.
        </p>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning; 