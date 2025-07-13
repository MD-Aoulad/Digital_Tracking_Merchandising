/**
 * Workforce Management Platform - Mobile App
 * 
 * Main application component with navigation and authentication flow.
 * This app provides field employees with the ability to punch in at planned stores,
 * complete assigned tasks, and submit reports.
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
