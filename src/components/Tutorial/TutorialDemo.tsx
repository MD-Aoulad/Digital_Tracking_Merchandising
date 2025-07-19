/**
 * Tutorial Demo Component
 * 
 * Simple demo component to showcase the tutorial overlay functionality
 * 
 * @author UI/UX Expert Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Play } from 'lucide-react';
import TutorialOverlay from './TutorialOverlay';

const TutorialDemo: React.FC = () => {
  const [tutorialOpen, setTutorialOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
            >
              <Info className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900">
              Tutorial Feature Demo
            </h1>
            
            <p className="text-gray-600 leading-relaxed">
              Click the button below to see the animated tutorial overlay in action. 
              This demonstrates how users can learn about your app's features.
            </p>
          </div>

          {/* Demo Button */}
          <motion.button
            onClick={() => setTutorialOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center space-x-3">
              <Play className="w-6 h-6" />
              <span>Launch Tutorial</span>
            </div>
          </motion.button>

          {/* Features List */}
          <div className="text-left space-y-3">
            <h3 className="font-semibold text-gray-900">Tutorial Features:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>8 comprehensive tutorial steps</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Smooth animations and transitions</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Auto-play functionality</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Keyboard navigation support</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Progress tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Accessibility features</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Tutorial Overlay */}
      {tutorialOpen && (
        <TutorialOverlay onClose={() => setTutorialOpen(false)} />
      )}
    </div>
  );
};

export default TutorialDemo; 