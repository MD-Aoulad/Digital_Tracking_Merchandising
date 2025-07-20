/**
 * Enhanced Login Form Component - Workforce Management Platform
 * 
 * Comprehensive login form with advanced error handling, timeout management,
 * retry mechanisms, and progressive enhancement features.
 * 
 * Features:
 * - Timeout detection and handling (408 errors)
 * - Retry mechanisms for failed attempts
 * - Progressive loading states with timeout indicators
 * - Offline detection and graceful degradation
 * - Service status indicators
 * - Cached login attempts
 * - Comprehensive error messaging
 * - Accessibility improvements
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// ===== TYPES =====

interface LoginError {
  type: 'timeout' | 'network' | 'credentials' | 'server' | 'validation' | 'unknown';
  message: string;
  retryable: boolean;
  code?: number;
}

interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
}

// ===== CONSTANTS =====

const LOGIN_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds
const OFFLINE_CHECK_INTERVAL = 5000; // 5 seconds

// ===== UTILITY FUNCTIONS =====

const isOnline = (): boolean => {
  return navigator.onLine;
};

const getErrorMessage = (error: LoginError): string => {
  switch (error.type) {
    case 'timeout':
      return 'Login request timed out. Please check your connection and try again.';
    case 'network':
      return 'Network connection issue. Please check your internet connection.';
    case 'credentials':
      return 'Invalid email or password. Please check your credentials.';
    case 'server':
      return 'Server is temporarily unavailable. Please try again later.';
    case 'validation':
      return 'Please check your input and try again.';
    case 'unknown':
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

const getRetryMessage = (attempts: number): string => {
  if (attempts === 0) return '';
  if (attempts === 1) return 'Retrying...';
  if (attempts === 2) return 'Second attempt...';
  return 'Final attempt...';
};

// ===== MAIN COMPONENT =====

const LoginForm: React.FC = () => {
  // ===== STATE MANAGEMENT =====
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [timeoutProgress, setTimeoutProgress] = useState(0);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [serviceStatus, setServiceStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [cachedAttempts, setCachedAttempts] = useState<LoginAttempt[]>([]);
  
  // ===== REFS =====
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // ===== HOOKS =====
  const { login } = useAuth();
  const navigate = useNavigate();

  // ===== EFFECTS =====

  // Load cached login attempts
  useEffect(() => {
    const cached = localStorage.getItem('loginAttempts');
    if (cached) {
      try {
        const attempts: LoginAttempt[] = JSON.parse(cached);
        // Keep only attempts from last 24 hours
        const recentAttempts = attempts.filter(
          attempt => Date.now() - attempt.timestamp < 24 * 60 * 60 * 1000
        );
        setCachedAttempts(recentAttempts);
      } catch (error) {
        console.warn('Failed to parse cached login attempts:', error);
      }
    }
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setServiceStatus('checking');
      checkServiceStatus();
    };

    const handleOffline = () => {
      setIsOffline(true);
      setServiceStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial service status check
    checkServiceStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service status polling
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOffline) {
        checkServiceStatus();
      }
    }, OFFLINE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isOffline]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressRef.current) clearTimeout(progressRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  // ===== SERVICE FUNCTIONS =====

  const checkServiceStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3010/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      setServiceStatus(response.ok ? 'online' : 'offline');
    } catch (error) {
      setServiceStatus('offline');
    }
  }, []);

  const cacheLoginAttempt = useCallback((email: string, success: boolean) => {
    const attempt: LoginAttempt = {
      email,
      timestamp: Date.now(),
      success
    };

    const updatedAttempts = [...cachedAttempts, attempt].slice(-10); // Keep last 10
    setCachedAttempts(updatedAttempts);
    localStorage.setItem('loginAttempts', JSON.stringify(updatedAttempts));
  }, [cachedAttempts]);

  const startTimeoutProgress = useCallback(() => {
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / LOGIN_TIMEOUT_MS) * 100, 100);
      setTimeoutProgress(progress);

      if (progress < 100) {
        progressRef.current = setTimeout(updateProgress, 100);
      }
    };
    updateProgress();
  }, []);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (progressRef.current) {
      clearTimeout(progressRef.current);
      progressRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setTimeoutProgress(0);
  }, []);

  // ===== LOGIN HANDLERS =====

  const handleLogin = useCallback(async (loginEmail: string, loginPassword: string, isRetry = false): Promise<boolean> => {
    if (!isRetry) {
      setRetryAttempts(0);
      setError(null);
    }

    setIsLoading(true);
    startTimeoutProgress();

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('timeout'));
        }, LOGIN_TIMEOUT_MS);
      });

      // Create login promise
      const loginPromise = login(loginEmail, loginPassword);

      // Race between login and timeout
      await Promise.race([loginPromise, timeoutPromise]);

      // Success
      clearTimeouts();
      setIsLoading(false);
      cacheLoginAttempt(loginEmail, true);
      console.log('🔐 [LOGIN] Success - navigating to dashboard');
      navigate('/');
      return true;

    } catch (error) {
      clearTimeouts();
      setIsLoading(false);

      // Determine error type
      let loginError: LoginError;

      if (error instanceof Error) {
        if (error.message === 'timeout') {
          loginError = {
            type: 'timeout',
            message: 'Login request timed out',
            retryable: true,
            code: 408
          };
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          loginError = {
            type: 'network',
            message: 'Network connection failed',
            retryable: true,
            code: 0
          };
        } else if (error.message.includes('401') || error.message.includes('credentials')) {
          loginError = {
            type: 'credentials',
            message: 'Invalid credentials',
            retryable: false,
            code: 401
          };
        } else if (error.message.includes('500') || error.message.includes('server')) {
          loginError = {
            type: 'server',
            message: 'Server error',
            retryable: true,
            code: 500
          };
        } else {
          loginError = {
            type: 'unknown',
            message: 'Unexpected error',
            retryable: true,
            code: 0
          };
        }
      } else {
        loginError = {
          type: 'unknown',
          message: 'Unknown error',
          retryable: true,
          code: 0
        };
      }

      setError(loginError);
      cacheLoginAttempt(loginEmail, false);

      // Handle retry logic
      if (loginError.retryable && retryAttempts < MAX_RETRY_ATTEMPTS) {
        const newAttempts = retryAttempts + 1;
        setRetryAttempts(newAttempts);

        if (newAttempts < MAX_RETRY_ATTEMPTS) {
          retryTimeoutRef.current = setTimeout(() => {
            handleLogin(loginEmail, loginPassword, true);
          }, RETRY_DELAY_MS);
        }
      }

      return false;
    }
  }, [login, navigate, retryAttempts, clearTimeouts, startTimeoutProgress, cacheLoginAttempt]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError({
        type: 'validation',
        message: 'Please enter both email and password',
        retryable: false
      });
      return;
    }

    if (isOffline) {
      setError({
        type: 'network',
        message: 'You are currently offline. Please check your connection.',
        retryable: false
      });
      return;
    }

    await handleLogin(email, password);
  }, [email, password, isOffline, handleLogin]);

  const handleRetry = useCallback(() => {
    if (error?.retryable) {
      setRetryAttempts(0);
      setError(null);
      handleLogin(email, password);
    }
  }, [error, email, password, handleLogin]);

  const handleQuickLogin = useCallback(async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    await handleLogin(demoEmail, demoPassword);
  }, [handleLogin]);

  // ===== RENDER HELPERS =====

  const renderError = () => {
    if (!error) return null;

    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              {error.type === 'timeout' ? 'Connection Timeout' :
               error.type === 'network' ? 'Network Error' :
               error.type === 'credentials' ? 'Authentication Failed' :
               error.type === 'server' ? 'Server Error' :
               error.type === 'validation' ? 'Validation Error' :
               'Error'}
            </h3>
            <p className="mt-1 text-sm text-red-700">{getErrorMessage(error)}</p>
            {error.retryable && retryAttempts < MAX_RETRY_ATTEMPTS && (
              <div className="mt-3">
                <button
                  onClick={handleRetry}
                  className="text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingState = () => {
    if (!isLoading) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">
            {retryAttempts > 0 ? getRetryMessage(retryAttempts) : 'Signing in...'}
          </span>
        </div>
        
        {/* Timeout Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-100"
            style={{ width: `${timeoutProgress}%` }}
          ></div>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          {timeoutProgress > 50 ? 'This is taking longer than usual...' : 'Connecting to server...'}
        </p>
      </div>
    );
  };

  const renderServiceStatus = () => {
    if (serviceStatus === 'checking') return null;

    return (
      <div className={`flex items-center space-x-2 text-sm ${
        serviceStatus === 'online' ? 'text-green-600' : 'text-red-600'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          serviceStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span>
          {serviceStatus === 'online' ? 'Service Online' : 'Service Offline'}
        </span>
      </div>
    );
  };

  const renderCachedAttempts = () => {
    if (cachedAttempts.length === 0) return null;

    const recentAttempts = cachedAttempts.slice(-3); // Show last 3 attempts
    const successRate = cachedAttempts.filter(a => a.success).length / cachedAttempts.length;

    return (
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Recent Login Activity</h4>
        <div className="space-y-1">
          {recentAttempts.map((attempt, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{attempt.email}</span>
              <span className={`px-2 py-1 rounded ${
                attempt.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {attempt.success ? 'Success' : 'Failed'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Success rate: {Math.round(successRate * 100)}%
        </p>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">WM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Workforce Management
          </h1>
          <p className="text-gray-600 mb-2">
            Sign in to your account
          </p>
          {renderServiceStatus()}
        </div>

        {/* Error Display */}
        {renderError()}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Enter your email"
              required
              disabled={isLoading}
              data-testid="email-input"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="Enter your password"
                required
                disabled={isLoading}
                data-testid="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                disabled={isLoading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {renderLoadingState()}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isOffline}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center disabled:cursor-not-allowed"
            data-testid="login-button"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {retryAttempts > 0 ? getRetryMessage(retryAttempts) : 'Signing in...'}
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Credentials</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickLogin('admin@company.com', 'password')}
              disabled={isLoading}
              className="w-full text-left p-2 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-medium">Admin:</span> admin@company.com / password
            </button>
            <button
              onClick={() => handleQuickLogin('richard@company.com', 'password')}
              disabled={isLoading}
              className="w-full text-left p-2 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-medium">Employee:</span> richard@company.com / password
            </button>
          </div>
        </div>

        {/* Cached Attempts */}
        {renderCachedAttempts()}

        {/* Debug Info */}
        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <p><strong>Debug Info:</strong></p>
          <p>• Frontend: Running on localhost:3000</p>
          <p>• Auth Service: localhost:3010</p>
          <p>• Network: {isOffline ? 'Offline' : 'Online'}</p>
          <p>• Service: {serviceStatus}</p>
          <p>• Retry Attempts: {retryAttempts}/{MAX_RETRY_ATTEMPTS}</p>
          <p>• Check browser console for detailed errors</p>
        </div>
      </div>
  );
};

export default LoginForm; 