/**
 * Login Page Component - Workforce Management Platform
 * 
 * Simplified version for testing authentication flow
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Login Page Component
 * 
 * Simple authentication page for testing the login/logout flow.
 * 
 * @returns JSX element with login interface
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle login form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      console.log('🚀 Attempting login with:', { email, password });
      const success = await login(email, password);
      
      if (success) {
        console.log('✅ Login successful');
        navigate('/');
      } else {
        console.log('❌ Login failed');
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  /**
   * Quick login with demo credentials
   */
  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    try {
      console.log('🚀 Quick login with:', { demoEmail, demoPassword });
      const success = await login(demoEmail, demoPassword);
      
      if (success) {
        console.log('✅ Quick login successful');
        navigate('/');
      } else {
        console.log('❌ Quick login failed');
        setError('Quick login failed');
      }
    } catch (error) {
      console.error('❌ Quick login error:', error);
      setError('Quick login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">WM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Workforce Management
          </h1>
          <p className="text-gray-600">
            Sign in to your account
          </p>
        </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
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
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
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
              onClick={() => quickLogin('admin@company.com', 'password')}
              className="w-full text-left p-2 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="font-medium">Admin:</span> admin@company.com / password
            </button>
            <button
              onClick={() => quickLogin('richard@company.com', 'password')}
              className="w-full text-left p-2 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="font-medium">Employee:</span> richard@company.com / password
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <p><strong>Debug Info:</strong></p>
          <p>• Frontend: Running on localhost:3000</p>
          <p>• Backend: Should be on localhost:5000</p>
          <p>• Check browser console for errors</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
