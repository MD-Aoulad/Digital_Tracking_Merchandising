import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { shadowStyles } from '../utils/shadows';
import { punchIn, punchOut, getCurrentAttendance, getWorkplaces, Attendance } from '../services/attendanceApi';

interface PunchRecord {
  id: string;
  type: 'clock-in' | 'clock-out';
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  photo?: string;
}

const PunchInScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'in' | 'out'>('out');
  const [todayRecords, setTodayRecords] = useState<PunchRecord[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [workplaces, setWorkplaces] = useState<any[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<any>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load current attendance status from API
  useEffect(() => {
    const loadCurrentAttendance = async () => {
      try {
        console.log('Loading current attendance from API...');
        const currentAttendance = await getCurrentAttendance();
        console.log('Current attendance response:', currentAttendance);
        if (currentAttendance) {
          setCurrentStatus('in');
        } else {
          setCurrentStatus('out');
        }
      } catch (error) {
        console.error('Error loading current attendance:', error);
        setCurrentStatus('out');
      }
    };

    loadCurrentAttendance();
  }, []);

  // Load available workplaces
  useEffect(() => {
    const loadWorkplaces = async () => {
      try {
        console.log('Loading workplaces from API...');
        const workplacesList = await getWorkplaces();
        console.log('Workplaces response:', workplacesList);
        setWorkplaces(workplacesList);
        if (workplacesList.length > 0) {
          setSelectedWorkplace(workplacesList[0]); // Select first workplace by default
        }
      } catch (error) {
        console.error('Error loading workplaces:', error);
      }
    };

    loadWorkplaces();
  }, []);

  const getCurrentLocation = async () => {
    try {
      // For now, use mock location until expo-location is properly configured
      // In production, this should use expo-location for real GPS
      const mockLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
        address: 'San Francisco, CA'
      };
      setLocation(mockLocation);
      return mockLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get your current location');
      return null;
    }
  };

  const takePhoto = async () => {
    try {
      // For now, use mock photo until expo-image-picker is properly configured
      // In production, this should use expo-image-picker for real photo capture
      const mockPhoto = 'data:image/jpeg;base64,mock-photo-data';
      return mockPhoto;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Photo Error', 'Unable to take photo');
      return null;
    }
  };

  const handlePunch = async () => {
    setIsLoading(true);
    
    try {
      // Get location
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        setIsLoading(false);
        return;
      }

      // Take photo
      const photo = await takePhoto();

      // Call real API instead of storing locally
      if (currentStatus === 'out') {
        // Punch in
        console.log('Attempting to punch in with real API...');
        const result = await punchIn({
          workplaceId: selectedWorkplace?.id || '550e8400-e29b-41d4-a716-446655440001', // Use selected workplace or fallback
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          accuracy: 5,
          notes: 'Punch in from mobile app',
          deviceInfo: 'Mobile App',
          photo: photo ? new File([photo], 'punchin.jpg') : undefined
        });
        console.log('Punch in result:', result);

        Alert.alert(
          'Success!',
          `Clock In recorded successfully at ${new Date().toLocaleTimeString()}`,
          [{ text: 'OK' }]
        );
      } else {
        // Punch out
        const result = await punchOut({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          accuracy: 5,
          notes: 'Punch out from mobile app',
          deviceInfo: 'Mobile App',
          photo: photo ? new File([photo], 'punchout.jpg') : undefined
        });

        Alert.alert(
          'Success!',
          `Clock Out recorded successfully at ${new Date().toLocaleTimeString()}`,
          [{ text: 'OK' }]
        );
      }

      // Refresh current attendance status
      const currentAttendance = await getCurrentAttendance();
      if (currentAttendance) {
        setCurrentStatus('in');
      } else {
        setCurrentStatus('out');
      }

    } catch (error) {
      console.error('Punch error:', error);
      Alert.alert('Error', 'Failed to record punch. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}!</Text>
        <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
      </View>

      <View style={styles.clockContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.statusText}>
          Status: {currentStatus === 'in' ? 'Clocked In' : 'Clocked Out'}
        </Text>
      </View>

      <View style={styles.punchContainer}>
        <TouchableOpacity
          style={[
            styles.punchButton,
            currentStatus === 'in' ? styles.clockOutButton : styles.clockInButton,
            isLoading && styles.punchButtonDisabled
          ]}
          onPress={handlePunch}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <>
              <Ionicons 
                name={currentStatus === 'in' ? 'log-out' : 'log-in'} 
                size={32} 
                color="#fff" 
              />
              <Text style={styles.punchButtonText}>
                {currentStatus === 'in' ? 'Clock Out' : 'Clock In'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Ionicons name="location" size={24} color="#007AFF" />
          <Text style={styles.infoTitle}>Location</Text>
          <Text style={styles.infoText}>
            {location ? location.address : 'Getting location...'}
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Ionicons name="business" size={24} color="#007AFF" />
          <Text style={styles.infoTitle}>Workplace</Text>
          <Text style={styles.infoText}>
            {selectedWorkplace ? selectedWorkplace.name : 'Loading workplaces...'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="camera" size={24} color="#007AFF" />
          <Text style={styles.infoTitle}>Photo Verification</Text>
          <Text style={styles.infoText}>Photo will be captured automatically</Text>
        </View>
      </View>

      <View style={styles.recordsContainer}>
        <Text style={styles.recordsTitle}>Today's Records</Text>
        {todayRecords.length === 0 ? (
          <Text style={styles.noRecordsText}>No punch records for today</Text>
        ) : (
          todayRecords.map((record, index) => (
            <View key={record.id} style={styles.recordItem}>
              <View style={styles.recordIcon}>
                <Ionicons 
                  name={record.type === 'clock-in' ? 'log-in' : 'log-out'} 
                  size={20} 
                  color={record.type === 'clock-in' ? '#4CAF50' : '#F44336'} 
                />
              </View>
              <View style={styles.recordDetails}>
                <Text style={styles.recordType}>
                  {record.type === 'clock-in' ? 'Clock In' : 'Clock Out'}
                </Text>
                <Text style={styles.recordTime}>
                  {new Date(record.timestamp).toLocaleTimeString()}
                </Text>
                {record.location && (
                  <Text style={styles.recordLocation}>{record.location.address}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  clockContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...shadowStyles.large,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  punchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  punchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 16,
    ...shadowStyles.medium,
  },
  clockInButton: {
    backgroundColor: '#4CAF50',
  },
  clockOutButton: {
    backgroundColor: '#F44336',
  },
  punchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  punchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...shadowStyles.small,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  recordsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  noRecordsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordDetails: {
    flex: 1,
  },
  recordType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  recordLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default PunchInScreen; 