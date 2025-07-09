/**
 * Face Verification Setup Component - Workforce Management Platform
 * 
 * Admin-only component for configuring face verification settings.
 * This component allows administrators to:
 * - Enable/disable face verification
 * - Configure verification settings
 * - View face verification statistics
 * - Manage face image retention
 * 
 * Features:
 * - Face verification enable/disable toggle
 * - Image quality settings
 * - Retry attempt configuration
 * - Face image retention settings
 * - Verification statistics dashboard
 * - Employee face image management
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Camera,
  Shield,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  RefreshCw,
  Eye,
  Trash2,
  Download,
  Upload,
  Info,
  Lock,
  Unlock,
  Image as ImageIcon,
  BarChart3,
  Clock,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaceVerificationSettings, 
  FaceImage, 
  FaceVerificationAttempt,
  User,
  UserRole 
} from '../../types';
import toast from 'react-hot-toast';

/**
 * FaceVerificationSetup Component
 * 
 * Admin-only interface for configuring face verification settings
 * and managing employee face images.
 * 
 * @returns JSX element with face verification setup interface
 */
const FaceVerificationSetup: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [settings, setSettings] = useState<FaceVerificationSettings>({
    id: 'face-verification-settings',
    isEnabled: false,
    requireFaceVerification: false,
    maxRetryAttempts: 3,
    imageQuality: 'medium',
    allowedImageFormats: ['jpg', 'jpeg', 'png'],
    maxImageSize: 5 * 1024 * 1024, // 5MB
    retentionDays: 365,
    createdBy: user?.id || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [faceImages, setFaceImages] = useState<FaceImage[]>([]);
  const [verificationAttempts, setVerificationAttempts] = useState<FaceVerificationAttempt[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'images' | 'statistics'>('settings');

  // Statistics
  const [stats, setStats] = useState({
    totalEmployees: 0,
    registeredFaces: 0,
    activeFaces: 0,
    verificationSuccessRate: 0,
    totalAttempts: 0,
    successfulAttempts: 0,
    failedAttempts: 0
  });

  /**
   * Initialize mock data
   */
  useEffect(() => {
    // Mock face images
    const mockFaceImages: FaceImage[] = [
      {
        id: 'face-1',
        userId: '1',
        imageUrl: '/api/faces/employee-1.jpg',
        imageHash: 'hash-1',
        imageType: 'registration',
        capturedAt: '2024-01-15T09:00:00Z',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'New York, NY'
        },
        deviceInfo: {
          deviceId: 'device-1',
          deviceType: 'iPhone',
          appVersion: '1.0.0'
        },
        verificationResult: {
          success: true,
          confidence: 95,
          matchedWith: 'face-1'
        },
        isActive: true
      },
      {
        id: 'face-2',
        userId: '2',
        imageUrl: '/api/faces/employee-2.jpg',
        imageHash: 'hash-2',
        imageType: 'registration',
        capturedAt: '2024-01-15T08:45:00Z',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'New York, NY'
        },
        deviceInfo: {
          deviceId: 'device-2',
          deviceType: 'Android',
          appVersion: '1.0.0'
        },
        verificationResult: {
          success: true,
          confidence: 92,
          matchedWith: 'face-2'
        },
        isActive: true
      }
    ];
    setFaceImages(mockFaceImages);

    // Mock verification attempts
    const mockAttempts: FaceVerificationAttempt[] = [
      {
        id: 'attempt-1',
        userId: '1',
        attendanceId: 'att-1',
        attemptNumber: 1,
        capturedImageUrl: '/api/faces/attempt-1.jpg',
        verificationResult: {
          success: true,
          confidence: 95,
          matchedWith: 'face-1'
        },
        timestamp: '2024-01-15T09:00:00Z',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'New York, NY'
        },
        deviceInfo: {
          deviceId: 'device-1',
          deviceType: 'iPhone',
          appVersion: '1.0.0'
        }
      },
      {
        id: 'attempt-2',
        userId: '2',
        attendanceId: 'att-2',
        attemptNumber: 1,
        capturedImageUrl: '/api/faces/attempt-2.jpg',
        verificationResult: {
          success: false,
          confidence: 45,
          failureReason: 'Face not clearly visible'
        },
        timestamp: '2024-01-15T08:45:00Z',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'New York, NY'
        },
        deviceInfo: {
          deviceId: 'device-2',
          deviceType: 'Android',
          appVersion: '1.0.0'
        }
      }
    ];
    setVerificationAttempts(mockAttempts);

    // Mock employees
    const mockEmployees: User[] = [
      {
        id: '1',
        email: 'employee1@company.com',
        name: 'John Doe',
        role: UserRole.VIEWER,
        department: 'Sales',
        position: 'Sales Representative'
      },
      {
        id: '2',
        email: 'employee2@company.com',
        name: 'Jane Smith',
        role: UserRole.VIEWER,
        department: 'Marketing',
        position: 'Marketing Specialist'
      }
    ];
    setEmployees(mockEmployees);

    // Calculate statistics
    const totalEmployees = mockEmployees.length;
    const registeredFaces = mockFaceImages.length;
    const activeFaces = mockFaceImages.filter(img => img.isActive).length;
    const totalAttempts = mockAttempts.length;
    const successfulAttempts = mockAttempts.filter(att => att.verificationResult.success).length;
    const verificationSuccessRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

    setStats({
      totalEmployees,
      registeredFaces,
      activeFaces,
      verificationSuccessRate,
      totalAttempts,
      successfulAttempts,
      failedAttempts: totalAttempts - successfulAttempts
    });
  }, []);

  /**
   * Save face verification settings
   */
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedSettings = {
        ...settings,
        updatedAt: new Date().toISOString()
      };
      
      setSettings(updatedSettings);
      toast.success('Face verification settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Toggle face verification
   */
  const handleToggleFaceVerification = () => {
    setSettings(prev => ({
      ...prev,
      isEnabled: !prev.isEnabled
    }));
  };

  /**
   * Toggle required face verification
   */
  const handleToggleRequired = () => {
    setSettings(prev => ({
      ...prev,
      requireFaceVerification: !prev.requireFaceVerification
    }));
  };

  /**
   * Delete face image
   */
  const handleDeleteFaceImage = async (imageId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFaceImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Face image deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete face image. Please try again.');
    }
  };

  /**
   * Get employee name by ID
   */
  const getEmployeeName = (userId: string) => {
    const employee = employees.find(emp => emp.id === userId);
    return employee?.name || 'Unknown Employee';
  };

  /**
   * Get employee email by ID
   */
  const getEmployeeEmail = (userId: string) => {
    const employee = employees.find(emp => emp.id === userId);
    return employee?.email || 'Unknown Email';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Face Verification Setup</h1>
          <p className="text-gray-600 mt-1">Configure face verification settings for attendance</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-lg">
            <Lock size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Admin Only</span>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings size={16} className="inline mr-2" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'images'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ImageIcon size={16} className="inline mr-2" />
            Face Images
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'statistics'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 size={16} className="inline mr-2" />
            Statistics
          </button>
        </nav>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Face Verification Settings</h3>
            
            {/* Enable/Disable Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Enable Face Verification</h4>
                  <p className="text-sm text-gray-500">
                    Allow employees to use face verification for attendance
                  </p>
                </div>
                <button
                  onClick={handleToggleFaceVerification}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.isEnabled ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Required Face Verification */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Require Face Verification</h4>
                  <p className="text-sm text-gray-500">
                    Make face verification mandatory for all attendance records
                  </p>
                </div>
                <button
                  onClick={handleToggleRequired}
                  disabled={!settings.isEnabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.requireFaceVerification && settings.isEnabled ? 'bg-primary-600' : 'bg-gray-200'
                  } ${!settings.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.requireFaceVerification && settings.isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Retry Attempts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Retry Attempts
                </label>
                <select
                  value={settings.maxRetryAttempts}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxRetryAttempts: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={1}>1 attempt</option>
                  <option value={2}>2 attempts</option>
                  <option value={3}>3 attempts</option>
                  <option value={5}>5 attempts</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Number of attempts before requiring re-registration
                </p>
              </div>

              {/* Image Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Quality
                </label>
                <select
                  value={settings.imageQuality}
                  onChange={(e) => setSettings(prev => ({ ...prev, imageQuality: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">Low (faster processing)</option>
                  <option value="medium">Medium (balanced)</option>
                  <option value="high">High (better accuracy)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Higher quality improves accuracy but increases processing time
                </p>
              </div>

              {/* Max Image Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Image Size
                </label>
                <select
                  value={settings.maxImageSize / (1024 * 1024)}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxImageSize: parseInt(e.target.value) * 1024 * 1024 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={1}>1 MB</option>
                  <option value={2}>2 MB</option>
                  <option value={5}>5 MB</option>
                  <option value={10}>10 MB</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size for face images
                </p>
              </div>

              {/* Retention Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Retention Period
                </label>
                <select
                  value={settings.retentionDays}
                  onChange={(e) => setSettings(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                  <option value={365}>1 year</option>
                  <option value={730}>2 years</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How long to keep face images before automatic deletion
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="btn-primary flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Face Images Tab */}
      {activeTab === 'images' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Employee Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Employee:</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Employees</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Face Images Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Registered Face Images</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Face Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Captured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {faceImages
                    .filter(img => !selectedEmployee || img.userId === selectedEmployee)
                    .map((image) => (
                    <tr key={image.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {getEmployeeName(image.userId).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {getEmployeeName(image.userId)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {getEmployeeEmail(image.userId)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {image.isActive ? (
                            <CheckCircle size={16} className="text-green-500 mr-2" />
                          ) : (
                            <XCircle size={16} className="text-red-500 mr-2" />
                          )}
                          <span className={`text-sm font-medium ${
                            image.isActive ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {image.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(image.capturedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${image.verificationResult?.confidence || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900">
                            {image.verificationResult?.confidence || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-primary-600 hover:text-primary-900">
                            <Eye size={16} />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Download size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteFaceImage(image.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.totalEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Camera size={20} className="text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Registered Faces</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.registeredFaces}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle size={20} className="text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.verificationSuccessRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock size={20} className="text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.totalAttempts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Attempts Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Attempts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Success vs Failure</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Successful</span>
                    <span className="text-sm font-medium text-green-600">{stats.successfulAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Failed</span>
                    <span className="text-sm font-medium text-red-600">{stats.failedAttempts}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Registration Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Faces</span>
                    <span className="text-sm font-medium text-blue-600">{stats.activeFaces}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Inactive</span>
                    <span className="text-sm font-medium text-gray-600">{stats.registeredFaces - stats.activeFaces}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FaceVerificationSetup; 