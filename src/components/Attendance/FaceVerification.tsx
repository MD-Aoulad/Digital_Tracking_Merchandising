/**
 * Face Verification Component - Workforce Management Platform
 * 
 * Real-time face verification component for attendance clock in/out.
 * This component handles:
 * - Camera access and photo capture
 * - Face verification against registered images
 * - Multiple attempt handling
 * - Success/failure feedback
 * - Re-registration prompts
 * 
 * Features:
 * - Live camera feed
 * - Photo capture with quality check
 * - Face detection and verification
 * - Multiple retry attempts
 * - Real-time feedback
 * - Error handling and recovery
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CheckCircle,
  XCircle,
  Shield,
  Loader2,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaceVerificationSession, 
  FaceVerificationAttempt,
  FaceVerificationSettings 
} from '../../types';
import toast from 'react-hot-toast';

interface FaceVerificationProps {
  sessionType: 'clock-in' | 'clock-out';
  onSuccess: (imageUrl: string) => void;
  onFailure: (reason: string) => void;
  onCancel: () => void;
  settings: FaceVerificationSettings;
}

/**
 * FaceVerification Component
 * 
 * Real-time face verification interface for attendance
 * 
 * @param sessionType - Type of verification session (clock-in/out)
 * @param onSuccess - Callback when verification succeeds
 * @param onFailure - Callback when verification fails
 * @param onCancel - Callback when user cancels
 * @param settings - Face verification settings
 * @returns JSX element with face verification interface
 */
const FaceVerification: React.FC<FaceVerificationProps> = ({
  sessionType,
  onSuccess,
  onFailure,
  onCancel,
  settings
}) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State management
  const [session, setSession] = useState<FaceVerificationSession>({
    id: Date.now().toString(),
    userId: user?.id || '',
    attendanceId: '',
    sessionType,
    status: 'pending',
    currentAttempt: 0,
    maxAttempts: settings.maxRetryAttempts,
    attempts: [],
    startedAt: new Date().toISOString()
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    confidence: number;
    message: string;
  } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  /**
   * Initialize camera access
   */
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  /**
   * Start camera stream
   */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setSession(prev => ({ ...prev, status: 'capturing' }));
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
      onFailure('Camera access denied');
    }
  };

  /**
   * Stop camera stream
   */
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  /**
   * Capture photo from camera
   */
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setIsCapturing(false);
    setIsVerifying(true);

    // Simulate face verification
    simulateFaceVerification(imageData);
  };

  /**
   * Simulate face verification process
   */
  const simulateFaceVerification = async (imageData: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock verification result (in real app, this would call face recognition API)
      const success = Math.random() > 0.3; // 70% success rate for demo
      const confidence = success ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 40) + 30;

      const result = {
        success,
        confidence,
        message: success 
          ? 'Face verification successful!' 
          : 'Face verification failed. Please try again.'
      };

      setVerificationResult(result);

      // Create verification attempt
      const attempt: FaceVerificationAttempt = {
        id: Date.now().toString(),
        userId: user?.id || '',
        attendanceId: session.attendanceId,
        attemptNumber: session.currentAttempt + 1,
        capturedImageUrl: imageData,
        verificationResult: {
          success,
          confidence,
          failureReason: success ? undefined : 'Face not clearly visible'
        },
        timestamp: new Date().toISOString(),
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'Current Location'
        },
        deviceInfo: {
          deviceId: 'device-1',
          deviceType: 'Web Browser',
          appVersion: '1.0.0'
        }
      };

      // Update session
      const updatedSession = {
        ...session,
        currentAttempt: session.currentAttempt + 1,
        attempts: [...session.attempts, attempt]
      };

      setSession(updatedSession);

      if (success) {
        // Success - complete session
        const completedSession: FaceVerificationSession = {
          ...updatedSession,
          status: 'completed',
          completedAt: new Date().toISOString(),
          result: {
            success: true,
            finalImageUrl: imageData,
            totalAttempts: updatedSession.currentAttempt,
            averageConfidence: confidence
          }
        };
        setSession(completedSession);
        
        setTimeout(() => {
          onSuccess(imageData);
        }, 1500);
      } else {
                  // Failure - check if max attempts reached
          if (updatedSession.currentAttempt >= settings.maxRetryAttempts) {
            const failedSession: FaceVerificationSession = {
              ...updatedSession,
              status: 'failed',
              completedAt: new Date().toISOString(),
              result: {
                success: false,
                totalAttempts: updatedSession.currentAttempt,
                averageConfidence: confidence
              }
            };
          setSession(failedSession);
          
          setTimeout(() => {
            onFailure('Maximum verification attempts reached. Please re-register your face.');
          }, 2000);
        } else {
          // Reset for next attempt
          setIsVerifying(false);
          setCapturedImage(null);
          setVerificationResult(null);
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed. Please try again.');
      setIsVerifying(false);
    }
  };

  /**
   * Retry verification
   */
  const handleRetry = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    setIsVerifying(false);
    setIsCapturing(true);
  };

  /**
   * Cancel verification
   */
  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-primary-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Camera size={24} />
              <div>
                <h2 className="text-lg font-semibold">Face Verification</h2>
                <p className="text-sm text-primary-100">
                  {sessionType === 'clock-in' ? 'Clock In' : 'Clock Out'}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-primary-100 hover:text-white transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-4 bg-blue-50 border-b border-blue-200"
            >
              <div className="flex items-start space-x-3">
                <Info className="text-blue-600 mt-0.5" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Face Verification Instructions:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Position your face in the center of the frame</li>
                    <li>• Ensure good lighting and clear visibility</li>
                    <li>• Remove glasses or hats if verification fails</li>
                    <li>• You have {settings.maxRetryAttempts} attempts</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Got it, hide instructions
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera View */}
        <div className="relative">
          {isCameraActive && !capturedImage && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              
              {/* Face detection overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary-500 rounded-full relative">
                  <div className="absolute inset-0 border-2 border-primary-300 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Camera controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-colors disabled:opacity-50"
                >
                  {isCapturing ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Camera size={24} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Captured Image */}
          {capturedImage && (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured face"
                className="w-full h-64 object-cover"
              />
              
              {/* Verification overlay */}
              {isVerifying && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 size={48} className="animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium">Verifying face...</p>
                    <p className="text-sm text-gray-300">Please wait</p>
                  </div>
                </div>
              )}

              {/* Verification result */}
              {verificationResult && !isVerifying && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                  <div className="text-center text-white">
                    {verificationResult.success ? (
                      <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
                    ) : (
                      <XCircle size={64} className="text-red-400 mx-auto mb-4" />
                    )}
                    <p className="text-lg font-medium mb-2">
                      {verificationResult.message}
                    </p>
                    <p className="text-sm text-gray-300 mb-4">
                      Confidence: {verificationResult.confidence}%
                    </p>
                    
                    {!verificationResult.success && session.currentAttempt < settings.maxRetryAttempts && (
                      <button
                        onClick={handleRetry}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress and Status */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="space-y-3">
            {/* Attempt counter */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Attempt {session.currentAttempt + 1} of {settings.maxRetryAttempts}</span>
              <span className="text-gray-900 font-medium">
                {session.attempts.filter(a => a.verificationResult.success).length} successful
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((session.currentAttempt + 1) / settings.maxRetryAttempts) * 100}%` }}
              />
            </div>

            {/* Session status */}
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Shield size={16} className="text-primary-600" />
              <span className="text-gray-700">
                {session.status === 'pending' && 'Initializing...'}
                {session.status === 'capturing' && 'Ready to capture'}
                {session.status === 'verifying' && 'Verifying face...'}
                {session.status === 'completed' && 'Verification successful!'}
                {session.status === 'failed' && 'Verification failed'}
              </span>
            </div>
          </div>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </motion.div>
    </div>
  );
};

export default FaceVerification; 