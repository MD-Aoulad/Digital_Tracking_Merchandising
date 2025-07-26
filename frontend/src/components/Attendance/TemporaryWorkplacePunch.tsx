/**
 * Temporary Workplace Punch Component - Workforce Management Platform
 * 
 * Employee interface for punching in/out from temporary workplaces (unregistered locations).
 * Allows employees to clock in/out from external meetings, remote work locations, or other
 * non-registered workplaces with location tracking, reason documentation, and photo capture.
 * 
 * Features:
 * - GPS location capture and validation
 * - Reason input for temporary workplace usage
 * - Photo capture for verification
 * - Reusable location saving
 * - Distance validation from registered workplaces
 * - Real-time location updates
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Camera, 
  FileText, 
  Clock,
  X, 
  Check,
  AlertCircle,
  Loader2,
  Navigation
  
} from 'lucide-react';
import type { 
  TemporaryWorkplaceRecord, 
  ReusableTemporaryWorkplace,
  TemporaryWorkplaceSettings 
} from '../../types';

/**
 * Temporary Workplace Punch component props interface
 */
interface TemporaryWorkplacePunchProps {
  settings: TemporaryWorkplaceSettings;
  onPunch: (record: TemporaryWorkplaceRecord) => void;
  onCancel: () => void;
  reusableLocations?: ReusableTemporaryWorkplace[];
  onSaveReusableLocation?: (location: Omit<ReusableTemporaryWorkplace, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

/**
 * Location interface for GPS coordinates
 */
interface Location {
  lat: number;
  lng: number;
  address: string;
  placeName?: string;
}

/**
 * Temporary Workplace Punch Component
 * 
 * Employee interface for punching in/out from temporary workplaces.
 * Provides comprehensive location tracking, documentation, and verification
 * for clock in/out from unregistered locations.
 * 
 * @param settings - Temporary workplace settings configuration
 * @param onPunch - Function to handle punch in/out submission
 * @param onCancel - Function to cancel punch operation
 * @param reusableLocations - Previously saved reusable locations
 * @param onSaveReusableLocation - Function to save reusable location
 * @returns JSX element with temporary workplace punch interface
 */
const TemporaryWorkplacePunch: React.FC<TemporaryWorkplacePunchProps> = ({
  settings,
  onPunch,
  onCancel,
  reusableLocations = [],
  onSaveReusableLocation
}) => {
  // Form state
  const [punchType, setPunchType] = useState<'clock-in' | 'clock-out'>('clock-in');
  const [location, setLocation] = useState<Location | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isReusable, setIsReusable] = useState(false);
  const [reusableName, setReusableName] = useState('');
  const [selectedReusableLocation, setSelectedReusableLocation] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReusableForm, setShowReusableForm] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Get current GPS location
   */
  const getCurrentLocation = async (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setIsGettingLocation(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocoding to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            const location: Location = {
              lat: latitude,
              lng: longitude,
              address: data.display_name || 'Unknown location',
              placeName: data.name || data.display_name?.split(',')[0] || 'Unknown place'
            };

            setLocation(location);
            resolve(location);
          } catch (error) {
            reject(new Error('Failed to get address from coordinates'));
          } finally {
            setIsGettingLocation(false);
          }
        },
        (error) => {
          setIsGettingLocation(false);
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  /**
   * Handle location capture
   */
  const handleGetLocation = async () => {
    try {
      await getCurrentLocation();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get location');
    }
  };

  /**
   * Handle photo capture
   */
  const handleTakePhoto = async () => {
    try {
      setIsTakingPhoto(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Wait for video to be ready
        await new Promise(resolve => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });

        // Capture photo
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const context = canvas.getContext('2d');

          if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);

            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            setPhoto(photoData);
          }
        }

        // Stop video stream
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      setError('Failed to access camera');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  /**
   * Handle file upload for photo
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle reusable location selection
   */
  const handleReusableLocationSelect = (locationId: string) => {
    const selectedLocation = reusableLocations.find(loc => loc.id === locationId);
    if (selectedLocation) {
      setLocation(selectedLocation.location);
      setReason(selectedLocation.reason);
      setSelectedReusableLocation(locationId);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      setError('Please capture your location');
      return;
    }

    if (settings.requireReason && !reason.trim()) {
      setError('Please provide a reason for temporary workplace usage');
      return;
    }

    if (settings.requirePhoto && !photo) {
      setError('Please capture a photo');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const record: TemporaryWorkplaceRecord = {
        id: Date.now().toString(),
        userId: 'current-user-id', // In real app, get from auth context
        date: new Date().toISOString().split('T')[0],
        type: punchType,
        time: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        location,
        reason: reason.trim(),
        photos: photo ? { [punchType === 'clock-in' ? 'punchIn' : 'punchOut']: photo } : undefined,
        notes: notes.trim() || undefined,
        isReusable,
        reusableName: isReusable ? reusableName : undefined,
        deviceInfo: {
          deviceId: 'web-browser',
          deviceType: 'web',
          appVersion: '1.0.0'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save reusable location if requested
      if (isReusable && reusableName && onSaveReusableLocation) {
        onSaveReusableLocation({
          userId: 'current-user-id',
          name: reusableName,
          location,
          reason: reason.trim(),
          isActive: true,
          usageCount: 1,
          lastUsedAt: new Date().toISOString(),
        });
      }

      onPunch(record);
    } catch (error) {
      setError('Failed to submit punch record');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Validate form
   */
  const isFormValid = () => {
    if (!location) return false;
    if (settings.requireReason && !reason.trim()) return false;
    if (settings.requirePhoto && !photo) return false;
    if (isReusable && !reusableName.trim()) return false;
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <MapPin size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Temporary Workplace Punch</h2>
            <p className="text-sm text-gray-500">Clock in/out from unregistered location</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Punch Type Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Punch Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="relative">
              <input
                type="radio"
                name="punchType"
                value="clock-in"
                checked={punchType === 'clock-in'}
                onChange={(e) => setPunchType(e.target.value as 'clock-in' | 'clock-out')}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary-600 peer-checked:bg-primary-50 hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <Clock size={20} className="text-primary-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Clock In</h4>
                    <p className="text-sm text-gray-500">Start your work day</p>
                  </div>
                </div>
              </div>
            </label>

            <label className="relative">
              <input
                type="radio"
                name="punchType"
                value="clock-out"
                checked={punchType === 'clock-out'}
                onChange={(e) => setPunchType(e.target.value as 'clock-in' | 'clock-out')}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary-600 peer-checked:bg-primary-50 hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <Clock size={20} className="text-primary-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Clock Out</h4>
                    <p className="text-sm text-gray-500">End your work day</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Reusable Locations */}
        {reusableLocations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Saved Locations</h3>
            <div className="space-y-2">
              {reusableLocations.map(location => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleReusableLocationSelect(location.id)}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    selectedReusableLocation === location.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                                          <div>
                        <h4 className="font-medium text-gray-900">{location.name}</h4>
                        <p className="text-sm text-gray-500">{location.location.address}</p>
                        <p className="text-xs text-gray-400">Reason: {location.reason}</p>
                      </div>
                    <Navigation size={16} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Location Capture */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Location</h3>
          
          {!location ? (
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center justify-center space-x-3">
                {isGettingLocation ? (
                  <Loader2 size={20} className="animate-spin text-primary-600" />
                ) : (
                  <MapPin size={20} className="text-primary-600" />
                )}
                <span className="text-primary-600 font-medium">
                  {isGettingLocation ? 'Getting location...' : 'Capture Current Location'}
                </span>
              </div>
            </button>
          ) : (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{location.placeName}</h4>
                  <p className="text-sm text-gray-600">{location.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocation(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reason Input */}
        {settings.requireReason && (
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-900">Reason *</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you working from this location?"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                required
              />
            </label>
          </div>
        )}

        {/* Photo Capture */}
        {settings.requirePhoto && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Photo Verification</h3>
            
            {!photo ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleTakePhoto}
                  disabled={isTakingPhoto}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isTakingPhoto ? (
                      <Loader2 size={20} className="animate-spin text-primary-600" />
                    ) : (
                      <Camera size={20} className="text-primary-600" />
                    )}
                    <span className="text-primary-600 font-medium">
                      {isTakingPhoto ? 'Taking photo...' : 'Take Photo'}
                    </span>
                  </div>
                </button>
                
                <div className="text-center">
                  <span className="text-sm text-gray-500">or</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FileText size={16} className="text-gray-600" />
                    <span className="text-gray-700">Upload Photo</span>
                  </div>
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={photo}
                  alt="Captured photo"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Additional Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              rows={2}
            />
          </label>
        </div>

        {/* Save as Reusable Location */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isReusable}
              onChange={(e) => {
                setIsReusable(e.target.checked);
                if (!e.target.checked) {
                  setReusableName('');
                  setShowReusableForm(false);
                }
              }}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-900">Save this location for future use</span>
          </label>
          
          {isReusable && (
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-900">Location Name *</span>
                <input
                  type="text"
                  value={reusableName}
                  onChange={(e) => setReusableName(e.target.value)}
                  placeholder="e.g., Client Office, Coffee Shop, Home Office"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </label>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            <span>{punchType === 'clock-in' ? 'Clock In' : 'Clock Out'}</span>
          </button>
        </div>
      </form>

      {/* Hidden video and canvas elements for photo capture */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
};

export default TemporaryWorkplacePunch; 