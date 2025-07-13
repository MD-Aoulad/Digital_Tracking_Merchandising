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
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import AuthContext
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Import screens
import LoginScreen from './src/screens/auth/LoginScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import StoresScreen from './src/screens/stores/StoresScreen';
import TasksScreen from './src/screens/tasks/TasksScreen';
import ReportsScreen from './src/screens/reports/ReportsScreen';

// Navigation types
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type MainTabParamList = {
  Dashboard: undefined;
  Stores: undefined;
  Tasks: undefined;
  Reports: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Stores') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Stores" 
        component={StoresScreen}
        options={{ title: 'Stores' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
    </Tab.Navigator>
  );
}

// Loading component
function LoadingScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={{ 
        marginTop: 16, 
        fontSize: 16, 
        color: '#64748b',
        fontWeight: '500'
      }}>
        Loading Workforce Management Platform...
      </Text>
    </View>
  );
}

// Main App component with AuthContext
function AppContent() {
  const { user, isLoading } = useAuth();

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Root App component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
