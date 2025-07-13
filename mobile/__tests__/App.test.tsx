/**
 * Mobile App Tests
 * Tests the main App component and mobile-specific functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import App from '../App';

// Mock the authentication context
jest.mock('../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: null,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false,
    isLoading: false
  })
}));

// Mock the API client
jest.mock('../src/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock the location service
jest.mock('../src/services/location/locationService', () => ({
  requestLocationPermission: jest.fn(),
  getCurrentLocation: jest.fn(),
  startLocationTracking: jest.fn(),
  stopLocationTracking: jest.fn()
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock expo-camera instead of react-native-camera
jest.mock('expo-camera', () => ({
  Camera: 'Camera',
  CameraType: {
    front: 'front',
    back: 'back'
  }
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  LocationAccuracy: {
    High: 'high'
  }
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION'
    },
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE'
    }
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked'
  },
  request: jest.fn(),
  check: jest.fn()
}));

describe('Mobile App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('App Initialization', () => {
    test('should render app without crashing', () => {
      const { getByTestId } = render(<App />);
      expect(getByTestId('app-container')).toBeTruthy();
    });

    test('should show loading screen initially', () => {
      const { getByText } = render(<App />);
      expect(getByText('Loading...')).toBeTruthy();
    });

    test('should initialize navigation container', () => {
      const { getByTestId } = render(<App />);
      expect(getByTestId('navigation-container')).toBeTruthy();
    });
  });

  describe('Authentication Flow', () => {
    test('should show login screen when not authenticated', async () => {
      const { getByText, getByPlaceholderText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Login')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
      });
    });

    test('should handle login form submission', async () => {
      const { getByPlaceholderText, getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Login')).toBeTruthy();
      });

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password');
      fireEvent.press(loginButton);

      // Verify form submission
      expect(emailInput.props.value).toBe('test@example.com');
      expect(passwordInput.props.value).toBe('password');
    });

    test('should show error for invalid credentials', async () => {
      const { getByPlaceholderText, getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Login')).toBeTruthy();
      });

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'invalid@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Invalid credentials')).toBeTruthy();
      });
    });
  });

  describe('Dashboard Screen', () => {
    beforeEach(() => {
      // Mock authenticated state
      jest.requireMock('../src/contexts/AuthContext').useAuth = () => ({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'employee'
        },
        token: 'test-token',
        login: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: true,
        isLoading: false
      });
    });

    test('should show dashboard when authenticated', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
        expect(getByText('Welcome, Test User')).toBeTruthy();
      });
    });

    test('should display user information', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Test User')).toBeTruthy();
        expect(getByText('test@example.com')).toBeTruthy();
        expect(getByText('Employee')).toBeTruthy();
      });
    });

    test('should show navigation menu', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
        expect(getByText('Attendance')).toBeTruthy();
        expect(getByText('Tasks')).toBeTruthy();
        expect(getByText('Reports')).toBeTruthy();
        expect(getByText('Profile')).toBeTruthy();
      });
    });
  });

  describe('Attendance Screen', () => {
    beforeEach(() => {
      // Mock authenticated state
      jest.requireMock('../src/contexts/AuthContext').useAuth = () => ({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'employee'
        },
        token: 'test-token',
        login: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: true,
        isLoading: false
      });
    });

    test('should show attendance screen', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
      });

      // Navigate to attendance
      const attendanceButton = getByText('Attendance');
      fireEvent.press(attendanceButton);

      await waitFor(() => {
        expect(getByText('Attendance Tracking')).toBeTruthy();
      });
    });

    test('should handle punch in', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
      });

      // Navigate to attendance
      const attendanceButton = getByText('Attendance');
      fireEvent.press(attendanceButton);

      await waitFor(() => {
        expect(getByText('Punch In')).toBeTruthy();
      });

      const punchInButton = getByText('Punch In');
      fireEvent.press(punchInButton);

      await waitFor(() => {
        expect(getByText('Punch In Successful')).toBeTruthy();
      });
    });

    test('should handle punch out', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
      });

      // Navigate to attendance
      const attendanceButton = getByText('Attendance');
      fireEvent.press(attendanceButton);

      await waitFor(() => {
        expect(getByText('Punch Out')).toBeTruthy();
      });

      const punchOutButton = getByText('Punch Out');
      fireEvent.press(punchOutButton);

      await waitFor(() => {
        expect(getByText('Punch Out Successful')).toBeTruthy();
      });
    });
  });

  describe('Tasks Screen', () => {
    beforeEach(() => {
      // Mock authenticated state
      jest.requireMock('../src/contexts/AuthContext').useAuth = () => ({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'employee'
        },
        token: 'test-token',
        login: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: true,
        isLoading: false
      });
    });

    test('should show tasks screen', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
      });

      // Navigate to tasks
      const tasksButton = getByText('Tasks');
      fireEvent.press(tasksButton);

      await waitFor(() => {
        expect(getByText('My Tasks')).toBeTruthy();
      });
    });

    test('should display task list', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
      });

      // Navigate to tasks
      const tasksButton = getByText('Tasks');
      fireEvent.press(tasksButton);

      await waitFor(() => {
        expect(getByText('Task 1')).toBeTruthy();
        expect(getByText('Task 2')).toBeTruthy();
      });
    });

    test('should handle task completion', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
      });

      // Navigate to tasks
      const tasksButton = getByText('Tasks');
      fireEvent.press(tasksButton);

      await waitFor(() => {
        expect(getByText('Task 1')).toBeTruthy();
      });

      // Mark task as complete
      const completeButton = getByText('Complete');
      fireEvent.press(completeButton);

      await waitFor(() => {
        expect(getByText('Task completed successfully')).toBeTruthy();
      });
    });
  });

  describe('Profile Screen', () => {
    beforeEach(() => {
      // Mock authenticated state
      jest.requireMock('../src/contexts/AuthContext').useAuth = () => ({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'employee'
        },
        token: 'test-token',
        login: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: true,
        isLoading: false
      });
    });

    test('should show profile screen', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
      });

      // Navigate to profile
      const profileButton = getByText('Profile');
      fireEvent.press(profileButton);

      await waitFor(() => {
        expect(getByText('Profile')).toBeTruthy();
        expect(getByText('Test User')).toBeTruthy();
        expect(getByText('test@example.com')).toBeTruthy();
      });
    });

    test('should handle logout', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
      });

      // Navigate to profile
      const profileButton = getByText('Profile');
      fireEvent.press(profileButton);

      await waitFor(() => {
        expect(getByText('Logout')).toBeTruthy();
      });

      const logoutButton = getByText('Logout');
      fireEvent.press(logoutButton);

      await waitFor(() => {
        expect(getByText('Login')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network error
      jest.requireMock('../src/services/api/client').apiClient.get.mockRejectedValue(
        new Error('Network error')
      );

      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Network error')).toBeTruthy();
      });
    });

    test('should handle authentication errors', async () => {
      // Mock authentication error
      jest.requireMock('../src/contexts/AuthContext').useAuth = () => ({
        user: null,
        token: null,
        login: jest.fn().mockRejectedValue(new Error('Authentication failed')),
        logout: jest.fn(),
        isAuthenticated: false,
        isLoading: false
      });

      const { getByText, getByPlaceholderText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Login')).toBeTruthy();
      });

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Authentication failed')).toBeTruthy();
      });
    });
  });

  describe('Permissions', () => {
    test('should request camera permission for attendance', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
      });

      // Navigate to attendance
      const attendanceButton = getByText('Attendance');
      fireEvent.press(attendanceButton);

      await waitFor(() => {
        expect(getByText('Camera permission required')).toBeTruthy();
      });
    });

    test('should request location permission for attendance', async () => {
      const { getByText } = render(<App />);
      
      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
      });

      // Navigate to attendance
      const attendanceButton = getByText('Attendance');
      fireEvent.press(attendanceButton);

      await waitFor(() => {
        expect(getByText('Location permission required')).toBeTruthy();
      });
    });
  });
}); 