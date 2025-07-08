/**
 * Login Page Component - Workforce Management Platform
 * 
 * Authentication page that provides:
 * - User login functionality
 * - User registration functionality
 * - Form validation with Yup and React Hook Form
 * - Responsive design with hero section
 * - Demo credentials for quick testing
 * - Animated transitions using Framer Motion
 * 
 * Features:
 * - Toggle between login and register modes
 * - Real-time form validation
 * - Password visibility toggle
 * - Loading states during authentication
 * - Toast notifications for feedback
 * - Quick demo login buttons
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Lock, Mail, Users, Clock, Calendar, FileText, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Login form data interface
 */
interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Registration form data interface
 */
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

/**
 * Yup validation schema for login form
 */
const loginSchema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
}).required();

/**
 * Yup validation schema for registration form
 */
const registerSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  role: yup.string().required('Role is required'),
}).required();

/**
 * Login Page Component
 * 
 * Main authentication page that handles both login and registration.
 * Provides a modern, responsive interface with form validation and animations.
 * 
 * @returns JSX element with complete authentication interface
 */
const Login: React.FC = () => {
  // State management for password visibility and form modes
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // React Hook Form setup for login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  // React Hook Form setup for registration
  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  /**
   * Handle login form submission
   * 
   * @param data - Login form data
   */
  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  /**
   * Handle registration form submission
   * 
   * @param data - Registration form data
   */
  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      // For demo purposes, we'll just show a success message
      toast.success('Registration successful! Please log in with your new account.');
      setIsLoginMode(true);
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  /**
   * Demo credentials for quick testing
   */
  const demoCredentials = [
    { email: 'admin@company.com', password: 'password', role: 'Admin' },
    { email: 'editor@company.com', password: 'password', role: 'Editor' },
    { email: 'viewer@company.com', password: 'password', role: 'Viewer' },
  ];

  /**
   * Quick login function for demo credentials
   * 
   * @param email - Demo email
   * @param password - Demo password
   */
  const quickLogin = (email: string, password: string) => {
    const form = document.querySelector('form');
    if (form) {
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
      if (emailInput && passwordInput) {
        emailInput.value = email;
        passwordInput.value = password;
        // Trigger form submission
        const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
          submitButton.click();
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Workforce Management Platform
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Streamline your workforce operations with our comprehensive management solution. 
                From attendance tracking to task management, we've got you covered.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Attendance Tracking</h3>
                  <p className="text-sm text-gray-600">Real-time clock in/out</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Schedule Management</h3>
                  <p className="text-sm text-gray-600">Flexible shift planning</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Leave Management</h3>
                  <p className="text-sm text-gray-600">Automated workflows</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Team Collaboration</h3>
                  <p className="text-sm text-gray-600">Real-time communication</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login/Register Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Form header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">WM</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLoginMode ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-gray-600">
              {isLoginMode ? 'Sign in to your account' : 'Join our workforce management platform'}
            </p>
          </div>

          {/* Mode toggle buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLoginMode
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogIn size={16} className="inline mr-2" />
              Sign In
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLoginMode
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus size={16} className="inline mr-2" />
              Register
            </button>
          </div>

          {isLoginMode ? (
            // Login Form
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...registerLogin('email')}
                    type="email"
                    id="email"
                    name="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                {loginErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...registerLogin('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            // Register Form
            <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-6">
              {/* Name field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  {...registerForm('name')}
                  type="text"
                  id="name"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter your full name"
                />
                {registerErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.name.message}</p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...registerForm('email')}
                    type="email"
                    id="register-email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                {registerErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.email.message}</p>
                )}
              </div>

              {/* Role field */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  {...registerForm('role')}
                  id="role"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="">Select a role</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                {registerErrors.role && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.role.message}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...registerForm('password')}
                    type={showRegisterPassword ? 'text' : 'password'}
                    id="register-password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {registerErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.password.message}</p>
                )}
              </div>

              {/* Confirm password field */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...registerForm('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm-password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {registerErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <UserPlus size={20} />
                <span>Create Account</span>
              </button>
            </form>
          )}

          {/* Demo credentials section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Demo Login</h3>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  onClick={() => quickLogin(cred.email, cred.password)}
                  className="w-full text-left p-2 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  <span className="font-medium">{cred.role}:</span> {cred.email} / {cred.password}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
