// Location Service for Workforce Management Platform Mobile App
// Handles GPS location tracking and verification

import * as Location from 'expo-location';
import { LocationData } from '../../types';

export interface LocationPermission {
  granted: boolean;
  canAskAgain: boolean;
}

export interface LocationAccuracy {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

class LocationService {
  private static instance: LocationService;
  private locationSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Request location permissions
  async requestPermissions(): Promise<LocationPermission> {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
      };
    } catch (error) {
      console.error('Location permission request error:', error);
      return {
        granted: false,
        canAskAgain: false,
      };
    }
  }

  // Check if location permissions are granted
  async checkPermissions(): Promise<LocationPermission> {
    try {
      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
      };
    } catch (error) {
      console.error('Location permission check error:', error);
      return {
        granted: false,
        canAskAgain: false,
      };
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<LocationAccuracy | null> {
    try {
      const permission = await this.checkPermissions();
      
      if (!permission.granted) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Get current location error:', error);
      return null;
    }
  }

  // Start location tracking
  async startTracking(
    onLocationUpdate: (location: LocationAccuracy) => void,
    options: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    } = {}
  ): Promise<boolean> {
    try {
      if (this.isTracking) {
        return true; // Already tracking
      }

      const permission = await this.checkPermissions();
      
      if (!permission.granted) {
        throw new Error('Location permission not granted');
      }

      const {
        accuracy = Location.Accuracy.Balanced,
        timeInterval = 10000, // 10 seconds
        distanceInterval = 50, // 50 meters
      } = options;

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval,
          distanceInterval,
        },
        (location) => {
          const locationData: LocationAccuracy = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            timestamp: location.timestamp,
          };
          
          onLocationUpdate(locationData);
        }
      );

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Start location tracking error:', error);
      return false;
    }
  }

  // Stop location tracking
  stopTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    this.isTracking = false;
  }

  // Calculate distance between two points (in meters)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Check if user is within range of a store (for punch-in verification)
  async isWithinStoreRange(
    storeLatitude: number,
    storeLongitude: number,
    maxDistance: number = 100 // Default 100 meters
  ): Promise<{ withinRange: boolean; distance: number; location: LocationAccuracy | null }> {
    try {
      const currentLocation = await this.getCurrentLocation();
      
      if (!currentLocation) {
        return {
          withinRange: false,
          distance: -1,
          location: null,
        };
      }

      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        storeLatitude,
        storeLongitude
      );

      return {
        withinRange: distance <= maxDistance,
        distance,
        location: currentLocation,
      };
    } catch (error) {
      console.error('Check store range error:', error);
      return {
        withinRange: false,
        distance: -1,
        location: null,
      };
    }
  }

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const address = results[0];
        const parts = [
          address.street,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean);

        return parts.join(', ');
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Check if location services are enabled
  async isLocationEnabled(): Promise<boolean> {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      return enabled;
    } catch (error) {
      console.error('Check location services error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();
export default locationService;
