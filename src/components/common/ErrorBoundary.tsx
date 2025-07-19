/**
 * Global Error Boundary Component - Workforce Management Platform
 * 
 * This component provides global error handling for the application,
 * catching JavaScript errors anywhere in the component tree and
 * displaying a fallback UI instead of crashing the entire app.
 * 
 * Features:
 * - Catches JavaScript errors in component tree
 * - Displays user-friendly error messages
 * - Provides error reporting and logging
 * - Automatic error recovery mechanisms
 * - Authentication error handling
 * - Network error detection
 * - Graceful degradation
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// ===== TYPES =====

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  isRecovering: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

// ===== UTILITY FUNCTIONS =====

const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const isNetworkError = (error: Error): boolean => {
  return (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError')
  );
};

const isAuthenticationError = (error: Error): boolean => {
  return (
    error.message.includes('401') ||
    error.message.includes('Unauthorized') ||
    error.message.includes('authentication') ||
    error.message.includes('token')
  );
};

const isTimeoutError = (error: Error): boolean => {
  return (
    error.message.includes('timeout') ||
    error.message.includes('408') ||
    error.message.includes('Request timeout')
  );
};

const logError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
  console.error('🚨 [ERROR BOUNDARY]', {
    errorId,
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });

  // Send to error reporting service if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      custom_map: {
        error_id: errorId,
        component_stack: errorInfo.componentStack
      }
    });
  }

  // Store error in localStorage for debugging
  const errors = JSON.parse(localStorage.getItem('appErrors') || '[]');
  errors.push({
    id: errorId,
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: Date.now(),
    url: window.location.href
  });

  // Keep only last 10 errors
  if (errors.length > 10) {
    errors.splice(0, errors.length - 10);
  }

  localStorage.setItem('appErrors', JSON.stringify(errors));
};

// ===== ERROR BOUNDARY COMPONENT =====

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    const errorId = this.state.errorId ?? generateErrorId();
    logError(error, errorInfo, errorId);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        isRecovering: false
      });
    }
  }

  handleRetry = () => {
    this.setState({ isRecovering: true });
    
    // Attempt to recover by reloading the page
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleClearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      this.handleRetry();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      this.handleRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId, isRecovering } = this.state;
      
      if (!error) {
        return this.renderDefaultError();
      }

      return this.renderErrorUI(error, errorId, isRecovering);
    }

    return this.props.children;
  }

  renderDefaultError() {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={this.handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  renderErrorUI(error: Error, errorId: string | null, isRecovering: boolean) {
    const isNetwork = isNetworkError(error);
    const isAuth = isAuthenticationError(error);
    const isTimeout = isTimeoutError(error);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {isNetwork ? (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              ) : isAuth ? (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : isTimeout ? (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {isNetwork ? 'Network Error' :
               isAuth ? 'Authentication Error' :
               isTimeout ? 'Connection Timeout' :
               'Something went wrong'}
            </h1>
            
            <p className="text-gray-600">
              {isNetwork ? 'Unable to connect to the server. Please check your internet connection.' :
               isAuth ? 'Your session has expired. Please log in again.' :
               isTimeout ? 'The request took too long to complete. Please try again.' :
               'An unexpected error occurred. Please try again.'}
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-gray-100 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Error Details:</h3>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Error ID:</strong> {errorId}
              </p>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Message:</strong> {error.message}
              </p>
              <details className="text-xs text-gray-600">
                <summary className="cursor-pointer hover:text-gray-800">Stack Trace</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs bg-gray-200 p-2 rounded">
                  {error.stack}
                </pre>
              </details>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isRecovering ? (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Recovering...</span>
              </div>
            ) : (
              <>
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {isNetwork ? 'Retry Connection' :
                   isAuth ? 'Go to Login' :
                   isTimeout ? 'Try Again' :
                   'Retry'}
                </button>
                
                {isAuth && (
                  <button
                    onClick={this.handleGoHome}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Go to Home
                  </button>
                )}
                
                <button
                  onClick={this.handleClearStorage}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Clear Data & Retry
                </button>
              </>
            )}
          </div>

          {/* Error ID for Support */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Error ID: {errorId}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              If this problem persists, please contact support with this error ID.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

// ===== HOOK FOR FUNCTIONAL COMPONENTS =====

export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (error: Error, context?: string) => {
    console.error(`🚨 [${context || 'APP'}] Error:`, error);
    
    // Log error for debugging
    const errors = JSON.parse(localStorage.getItem('appErrors') || '[]');
    errors.push({
      id: generateErrorId(),
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      url: window.location.href
    });

    if (errors.length > 10) {
      errors.splice(0, errors.length - 10);
    }

    localStorage.setItem('appErrors', JSON.stringify(errors));

    // Handle specific error types
    if (isAuthenticationError(error)) {
      navigate('/login', { replace: true });
    } else if (isNetworkError(error)) {
      // Show network error toast or notification
      console.warn('Network error detected');
    }
  };

  return { handleError };
};

export default ErrorBoundary; 