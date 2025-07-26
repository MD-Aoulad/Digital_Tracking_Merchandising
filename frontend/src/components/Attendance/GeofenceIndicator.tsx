/**
 * Geofence Indicator Component - Workforce Management Platform
 * 
 * Geofence status indicator component that provides:
 * - Visual indicators for geofencing status
 * - Location validation and distance calculation
 * - Zone information and boundaries
 * - Real-time location updates
 * - Mobile-responsive design
 * 
 * Features:
 * - Real-time geofence status display
 * - Visual indicators for in/out of zone
 * - Distance calculation and display
 * - Zone information and boundaries
 * - Location accuracy indicators
 * - Mobile-optimized interface
 * - Accessibility support
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  Wifi,
  WifiOff,
  RefreshCw,
  Info,
  Target,
  Ruler
} from 'lucide-react';
import { GeofenceZone } from '../../types';
import toast from 'react-hot-toast';

/**
 * Location data structure
 */
interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
  address?: string;
}

/**
 * Geofence status
 */
interface GeofenceStatus {
  isWithinZone: boolean;
  currentZone: GeofenceZone | null;
  distance: number; // in meters
  accuracy: number; // in meters
  lastUpdated: string;
  isLocationEnabled: boolean;
  error?: string;
}

/**
 * Geofence Indicator Component
 * 
 * Visual indicator for geofence status and location validation
 * 
 * @returns JSX element with geofence status interface
 */
const GeofenceIndicator: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [geofenceStatus, setGeofenceStatus] = useState<GeofenceStatus>({
    isWithinZone: false,
    currentZone: null,
    distance: 0,
    accuracy: 0,
    lastUpdated: new Date().toISOString(),
    isLocationEnabled: false
  });
  const [geofenceZones, setGeofenceZones] = useState<GeofenceZone[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showZoneInfo, setShowZoneInfo] = useState(false);

  /**
   * Initialize geofence zones and location tracking
   */
  useEffect(() => {
    initializeGeofenceZones();
    checkLocationPermission();
  }, []);

  /**
   * Initialize mock geofence zones
   */
  const initializeGeofenceZones = () => {
    const mockZones: GeofenceZone[] = [
      {
        id: 'zone1',
        name: 'Main Office',
        center: { lat: 37.7749, lng: -122.4194 },
        radius: 100,
        address: '123 Main St, San Francisco, CA',
        isActive: true,
        allowedMethods: ['geolocation', 'qr', 'facial']
      },
      {
        id: 'zone2',
        name: 'Branch Office',
        center: { lat: 37.7849, lng: -122.4094 },
        radius: 150,
        address: '456 Branch Ave, San Francisco, CA',
        isActive: true,
        allowedMethods: ['geolocation', 'qr']
      },
      {
        id: 'zone3',
        name: 'Warehouse',
        center: { lat: 37.7649, lng: -122.4294 },
        radius: 200,
        address: '789 Warehouse Blvd, San Francisco, CA',
        isActive: false,
        allowedMethods: ['geolocation']
      }
    ];
    setGeofenceZones(mockZones);
  };

  /**
   * Check location permission and enable tracking
   */
  const checkLocationPermission = async () => {
    try {
      if ('geolocation' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'granted') {
          setGeofenceStatus(prev => ({ ...prev, isLocationEnabled: true }));
          startLocationTracking();
        } else if (permission.state === 'prompt') {
          setGeofenceStatus(prev => ({ 
            ...prev, 
            isLocationEnabled: false,
            error: 'Location permission needed'
          }));
        } else {
          setGeofenceStatus(prev => ({ 
            ...prev, 
            isLocationEnabled: false,
            error: 'Location access denied'
          }));
        }
      } else {
        setGeofenceStatus(prev => ({ 
          ...prev, 
          isLocationEnabled: false,
          error: 'Geolocation not supported'
        }));
      }
    } catch (error) {
      setGeofenceStatus(prev => ({ 
        ...prev, 
        isLocationEnabled: false,
        error: 'Failed to check location permission'
      }));
    }
  };

  /**
   * Start location tracking
   */
  const startLocationTracking = () => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        setCurrentLocation(location);
        updateGeofenceStatus(location);
      },
      (error) => {
        setGeofenceStatus(prev => ({ 
          ...prev, 
          error: `Location error: ${error.message}`
        }));
        toast.error('Failed to get location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  };

  /**
   * Update geofence status based on current location
   */
  const updateGeofenceStatus = (location: LocationData) => {
    let closestZone: GeofenceZone | null = null;
    let minDistance = Infinity;

    // Find closest active zone
    geofenceZones.forEach(zone => {
      if (!zone.isActive) return;

      const distance = calculateDistance(
        location.lat,
        location.lng,
        zone.center.lat,
        zone.center.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestZone = zone;
      }
    });

    const isWithinZone = closestZone ? minDistance <= (closestZone as GeofenceZone).radius : false;

    setGeofenceStatus({
      isWithinZone,
      currentZone: closestZone,
      distance: minDistance,
      accuracy: location.accuracy,
      lastUpdated: new Date().toISOString(),
      isLocationEnabled: true
    });
  };

  /**
   * Calculate distance between two points using Haversine formula
   */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  /**
   * Refresh location manually
   */
  const refreshLocation = async () => {
    setIsUpdating(true);
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000
          });
        });

        const location: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        setCurrentLocation(location);
        updateGeofenceStatus(location);
        toast.success('Location updated');
      }
    } catch (error) {
      toast.error('Failed to update location');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (): string => {
    if (!geofenceStatus.isLocationEnabled) return 'text-gray-600 bg-gray-100';
    if (geofenceStatus.isWithinZone) return 'text-green-600 bg-green-100';
    return 'text-red-600 bg-red-100';
  };

  /**
   * Get status icon
   */
  const getStatusIcon = () => {
    if (!geofenceStatus.isLocationEnabled) return <WifiOff size={20} />;
    if (geofenceStatus.isWithinZone) return <CheckCircle size={20} />;
    return <XCircle size={20} />;
  };

  /**
   * Get status text
   */
  const getStatusText = (): string => {
    if (!geofenceStatus.isLocationEnabled) return 'Location Disabled';
    if (geofenceStatus.isWithinZone) return 'Within Zone';
    return 'Outside Zone';
  };

  /**
   * Format distance
   */
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  /**
   * Format accuracy
   */
  const formatAccuracy = (meters: number): string => {
    if (meters < 10) return 'High';
    if (meters < 50) return 'Medium';
    return 'Low';
  };

  /**
   * Get accuracy color
   */
  const getAccuracyColor = (meters: number): string => {
    if (meters < 10) return 'text-green-600';
    if (meters < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Geofence Status</h1>
          <p className="text-gray-600 mt-1">Monitor your location and zone status</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={refreshLocation}
            disabled={isUpdating}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={16} className={isUpdating ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowZoneInfo(true)}
            className="btn-secondary"
          >
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getStatusColor()} mb-4`}
          >
            {getStatusIcon()}
          </motion.div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {getStatusText()}
          </h3>
          
          {geofenceStatus.currentZone && (
            <p className="text-gray-600 mb-4">
              {geofenceStatus.currentZone.name}
            </p>
          )}

          {geofenceStatus.error && (
            <p className="text-red-600 mb-4">
              {geofenceStatus.error}
            </p>
          )}
        </div>
      </div>

      {/* Location Details */}
      {currentLocation && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Latitude:</span>
                <span className="font-mono text-gray-900">
                  {currentLocation.lat.toFixed(6)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Longitude:</span>
                <span className="font-mono text-gray-900">
                  {currentLocation.lng.toFixed(6)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Accuracy:</span>
                <span className={`font-medium ${getAccuracyColor(currentLocation.accuracy)}`}>
                  {formatAccuracy(currentLocation.accuracy)} ({Math.round(currentLocation.accuracy)}m)
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {geofenceStatus.currentZone && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Distance to Zone:</span>
                  <span className="font-medium text-gray-900">
                    {formatDistance(geofenceStatus.distance)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Zone Radius:</span>
                <span className="font-medium text-gray-900">
                  {geofenceStatus.currentZone ? formatDistance(geofenceStatus.currentZone.radius) : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-sm text-gray-500">
                  {new Date(geofenceStatus.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Zones</h3>
        
        <div className="space-y-4">
          {geofenceZones.map((zone) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 border rounded-lg ${
                geofenceStatus.currentZone?.id === zone.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{zone.name}</h4>
                  <p className="text-sm text-gray-600">{zone.address}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Radius: {formatDistance(zone.radius)}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      zone.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {geofenceStatus.currentZone?.id === zone.id && (
                    <div className="p-1 bg-blue-500 rounded-full">
                      <Target size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Zone Info Modal */}
      <AnimatePresence>
        {showZoneInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowZoneInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Zone Information</h3>
                <button
                  onClick={() => setShowZoneInfo(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How Geofencing Works</h4>
                  <p className="text-sm text-blue-800">
                    Geofencing uses GPS to determine if you're within a designated work zone. 
                    You must be within the zone radius to clock in/out successfully.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Zone Details</h4>
                  {geofenceZones.map((zone) => (
                    <div key={zone.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{zone.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          zone.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {zone.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{zone.address}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Radius: {formatDistance(zone.radius)}</span>
                        <span>Methods: {zone.allowedMethods.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeofenceIndicator; 