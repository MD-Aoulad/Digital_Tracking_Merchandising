/**
 * Login Page Demo Component
 * 
 * Demo component to showcase the new enhanced login page
 * with animated retail visualization and professional design.
 * 
 * @author UI/UX Expert Team
 * @version 1.0.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Play, MapPin, Truck, Store, Users } from 'lucide-react';

const LoginDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold">Enhanced Login Page</h1>
            <p className="text-xl text-blue-100">
              Professional retail-themed login with interactive animations
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side Preview */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">Interactive Retail Visualization</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">German Store Network</h3>
                    <p className="text-sm text-gray-600">Interactive map with 10 major cities</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <Truck className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Live Delivery Tracking</h3>
                    <p className="text-sm text-gray-600">Animated trucks moving between cities</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <Store className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Store Statistics</h3>
                    <p className="text-sm text-gray-600">Real-time store and worker metrics</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Hover Interactions</h3>
                    <p className="text-sm text-gray-600">Interactive city and route highlights</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Animation Features:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Smooth entrance animations</li>
                  <li>• Hover effects on cities and routes</li>
                  <li>• Real-time delivery truck animations</li>
                  <li>• Floating package and route icons</li>
                  <li>• Progress bars and loading states</li>
                  <li>• Responsive design for all devices</li>
                </ul>
              </div>
            </motion.div>

            {/* Right Side Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">Enhanced Login Form</h2>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg">WM</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Workforce Management</h3>
                    <p className="text-sm text-gray-600">Sign in to your account</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="h-10 bg-gray-100 rounded-md flex items-center px-3">
                        <span className="text-gray-500 text-sm">Enter your email</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="h-10 bg-gray-100 rounded-md flex items-center px-3">
                        <span className="text-gray-500 text-sm">Enter your password</span>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium">
                      Sign In
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-md p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Admin: admin@company.com / password</div>
                      <div>Employee: richard@company.com / password</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-2">Form Features:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Enhanced error handling</li>
                  <li>• Timeout detection and retry</li>
                  <li>• Service status indicators</li>
                  <li>• Demo credentials for testing</li>
                  <li>• Accessibility improvements</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Ready to Experience?</h3>
              <p className="text-blue-100 mb-4">
                Navigate to the login page to see the full interactive experience
              </p>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                <Play className="w-4 h-4 inline mr-2" />
                View Login Page
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginDemo; 