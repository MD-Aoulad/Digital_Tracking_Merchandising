import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Session Timeout Test Component
 * 
 * This component helps test and verify the session timeout functionality.
 * It shows current session information and provides test controls.
 * 
 * @returns JSX element with session timeout test interface
 */
const SessionTimeoutTest: React.FC = () => {
  const { user, sessionTimeout, resetSessionTimer } = useAuth();
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0);

  useEffect(() => {
    if (user) {
      setSessionStartTime(new Date());
      setLastActivity(new Date());
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const now = new Date();
      setLastActivity(now);
      
      // Calculate time until expiry (simplified - in real app this would be more complex)
      const sessionEndTime = new Date(sessionStartTime!.getTime() + (sessionTimeout * 60 * 1000));
      const timeLeft = Math.max(0, sessionEndTime.getTime() - now.getTime());
      setTimeUntilExpiry(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [user, sessionStartTime, sessionTimeout]);

  const handleResetSession = () => {
    resetSessionTimer();
    setSessionStartTime(new Date());
    setLastActivity(new Date());
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <div className="flex items-center space-x-3 mb-4">
        <Clock className="h-6 w-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Session Timeout Test</h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Session Timeout:</span>
          <span className="text-sm font-medium">{sessionTimeout} minutes</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Session Started:</span>
          <span className="text-sm font-medium">
            {sessionStartTime?.toLocaleTimeString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Last Activity:</span>
          <span className="text-sm font-medium">
            {lastActivity?.toLocaleTimeString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Time Until Expiry:</span>
          <span className={`text-sm font-medium ${
            timeUntilExpiry < 60000 ? 'text-red-600' : 'text-gray-900'
          }`}>
            {formatTime(timeUntilExpiry)}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              timeUntilExpiry < 60000 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ 
              width: `${Math.max(0, (timeUntilExpiry / (sessionTimeout * 60 * 1000)) * 100)}%` 
            }}
          />
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleResetSession}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Session</span>
          </button>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              This is a test component. In production, session timeout is handled automatically.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutTest; 