/**
 * Tutorial Overlay Component
 * 
 * Animated tutorial overlay that guides users through the app features
 * with smooth animations, interactive elements, and comprehensive guidance.
 * 
 * Features:
 * - Step-by-step tutorial with progress indicator
 * - Smooth animations and transitions
 * - Interactive highlights and tooltips
 * - Responsive design for all screen sizes
 * - Accessibility features for all users
 * 
 * @author UI/UX Expert Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  SkipForward,
  Home,
  CheckSquare,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  MapPin,
  Calendar,
  FileText,
  Star
} from 'lucide-react';

interface TutorialOverlayProps {
  onClose: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  tips: string[];
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  // Tutorial steps with comprehensive app guidance
  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "Welcome to Workforce Manager",
      description: "Your comprehensive platform for managing retail operations, field teams, and merchandising tasks.",
      icon: <Home className="w-8 h-8" />,
      color: "bg-blue-500",
      features: [
        "Real-time dashboard with live updates",
        "Multi-role access (Admin, Manager, Employee)",
        "Mobile-responsive design for field work",
        "Secure authentication and data protection"
      ],
      tips: [
        "Use the sidebar to navigate between features",
        "Check notifications for important updates",
        "Switch languages using the language selector"
      ]
    },
    {
      id: 2,
      title: "Task Management & Todo System",
      description: "Create, assign, and track merchandising tasks with advanced features for retail operations.",
      icon: <CheckSquare className="w-8 h-8" />,
      color: "bg-green-500",
      features: [
        "8 specialized task types for merchandising",
        "Photo requirements and visual documentation",
        "Real-time task assignment and tracking",
        "Progress monitoring and completion reports"
      ],
      tips: [
        "Use the Advanced Todo Creator for detailed tasks",
        "Attach photos to provide visual evidence",
        "Set priorities and deadlines for urgent tasks"
      ]
    },
    {
      id: 3,
      title: "Communication & Chat System",
      description: "Stay connected with your team through real-time messaging and help desk support.",
      icon: <MessageSquare className="w-8 h-8" />,
      color: "bg-purple-500",
      features: [
        "Real-time messaging with channels",
        "File sharing with size limits",
        "Help desk system for manager inquiries",
        "Message reactions and read receipts"
      ],
      tips: [
        "Create channels for different topics or teams",
        "Use the help desk for technical support",
        "Share files directly in conversations"
      ]
    },
    {
      id: 4,
      title: "Team & Member Management",
      description: "Manage your workforce with hierarchical groups and comprehensive member profiles.",
      icon: <Users className="w-8 h-8" />,
      color: "bg-orange-500",
      features: [
        "Hierarchical group organization",
        "Member profiles and role management",
        "Group analytics and performance metrics",
        "Team collaboration tools"
      ],
      tips: [
        "Organize teams by regions or departments",
        "Assign roles based on responsibilities",
        "Monitor team performance through analytics"
      ]
    },
    {
      id: 5,
      title: "Reporting & Analytics",
      description: "Get insights into performance, attendance, and operational efficiency with detailed reports.",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "bg-indigo-500",
      features: [
        "Comprehensive performance reports",
        "Attendance tracking and analytics",
        "Task completion statistics",
        "Export to PDF and Excel formats"
      ],
      tips: [
        "Schedule regular report generation",
        "Use filters to focus on specific data",
        "Export reports for presentations"
      ]
    },
    {
      id: 6,
      title: "Attendance & Scheduling",
      description: "Track attendance with GPS verification and manage work schedules efficiently.",
      icon: <Calendar className="w-8 h-8" />,
      color: "bg-pink-500",
      features: [
        "GPS-based attendance tracking",
        "Face verification for security",
        "Work schedule management",
        "Leave request and approval system"
      ],
      tips: [
        "Enable location services for accurate tracking",
        "Set up face verification for enhanced security",
        "Plan schedules in advance for better coordination"
      ]
    },
    {
      id: 7,
      title: "Workplace & Area Management",
      description: "Manage geographic areas, budgets, and workplace resources effectively.",
      icon: <MapPin className="w-8 h-8" />,
      color: "bg-teal-500",
      features: [
        "Geographic area assignment",
        "Budget tracking and allocation",
        "Resource management and tracking",
        "Communication hub for teams"
      ],
      tips: [
        "Define clear boundaries for work areas",
        "Monitor budget usage regularly",
        "Track equipment and resource allocation"
      ]
    },
    {
      id: 8,
      title: "Posting Board & Announcements",
      description: "Share important information and announcements through organized posting boards.",
      icon: <FileText className="w-8 h-8" />,
      color: "bg-yellow-500",
      features: [
        "Multiple board types and categories",
        "File attachments and media sharing",
        "Comments and reactions system",
        "Moderation and approval workflows"
      ],
      tips: [
        "Use appropriate board categories for organization",
        "Attach relevant files to posts",
        "Enable moderation for quality control"
      ]
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % tutorialSteps.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, tutorialSteps.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentStep(prev => prev > 0 ? prev - 1 : tutorialSteps.length - 1);
      if (e.key === 'ArrowRight') setCurrentStep(prev => (prev + 1) % tutorialSteps.length);
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose, isPlaying, tutorialSteps.length]);

  const currentStepData = tutorialSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black bg-opacity-75 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"
            />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`p-3 rounded-xl ${currentStepData.color} bg-opacity-90`}
                >
                  {currentStepData.icon}
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold">App Tutorial</h2>
                  <p className="text-blue-100">Learn how to use Workforce Manager effectively</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                aria-label="Close tutorial"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Step Title and Description */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {currentStepData.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>Key Features</span>
                  </h4>
                  <ul className="space-y-3">
                    {currentStepData.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    <span>Pro Tips</span>
                  </h4>
                  <ul className="space-y-3">
                    {currentStepData.tips.map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interactive Demo Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Play className="w-5 h-5 text-blue-600" />
                  <span>Try It Now</span>
                </h4>
                <p className="text-gray-600 mb-4">
                  Explore the {currentStepData.title.toLowerCase()} feature in the sidebar to get hands-on experience.
                </p>
                <button
                  onClick={() => setShowHighlights(!showHighlights)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showHighlights ? 'Hide' : 'Show'} Feature Highlights
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* Navigation */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentStep(prev => prev > 0 ? prev - 1 : tutorialSteps.length - 1)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label="Previous step"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label={isPlaying ? 'Pause tutorial' : 'Play tutorial'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <button
                  onClick={() => setCurrentStep(prev => (prev + 1) % tutorialSteps.length)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label="Next step"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Step Indicators */}
              <div className="flex items-center space-x-2">
                {tutorialSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep 
                        ? 'bg-blue-600' 
                        : index < currentStep 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              {/* Skip Button */}
              <button
                onClick={onClose}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                aria-label="Skip tutorial"
              >
                <SkipForward size={16} />
                <span>Skip Tutorial</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialOverlay; 