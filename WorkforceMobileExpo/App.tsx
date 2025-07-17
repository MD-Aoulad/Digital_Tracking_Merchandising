import React from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PunchInScreen from './src/screens/PunchInScreen';
import ChannelsScreen from './src/screens/ChannelsScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TasksScreen from './src/screens/TasksScreen';
import EmployeesScreen from './src/screens/EmployeesScreen';
import NewChatScreen from './src/screens/NewChatScreen';
import NewChannelScreen from './src/screens/NewChannelScreen';
import NewDirectMessageScreen from './src/screens/NewDirectMessageScreen';
import FocusManager from './src/components/FocusManager';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const Stack = createStackNavigator();

// Main app component that handles navigation based on auth state
function AppContent() {
  const { user, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await AsyncStorage.getItem('onboardingComplete');
      setShowOnboarding(completed !== 'true' && !user);
    };
    checkOnboarding();
  }, [user]);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
  };

  if (isLoading || showOnboarding === null) {
    return (
      <View 
        style={styles.loadingContainer}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading application"
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <FocusManager>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Stack.Navigator
          initialRouteName={showOnboarding ? "Onboarding" : (user ? "Dashboard" : "Login")}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#007AFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {showOnboarding && (
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
              initialParams={{ onComplete: handleOnboardingComplete }}
            />
          )}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: 'Dashboard' }}
          />
          <Stack.Screen
            name="PunchIn"
            component={PunchInScreen}
            options={{ title: 'Punch In/Out' }}
          />
          <Stack.Screen
            name="Channels"
            component={ChannelsScreen}
            options={{ title: 'Chat Channels' }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NewChat"
            component={NewChatScreen}
            options={{ 
              headerShown: true,
              title: 'New Chat'
            }}
          />
          <Stack.Screen
            name="NewChannel"
            component={NewChannelScreen}
            options={{ 
              headerShown: true,
              title: 'New Channel'
            }}
          />
          <Stack.Screen
            name="NewDirectMessage"
            component={NewDirectMessageScreen}
            options={{ 
              headerShown: true,
              title: 'New Direct Message'
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Tasks"
            component={TasksScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MyTasks"
            component={TasksScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Employees"
            component={EmployeesScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FocusManager>
  );
}

// Main App component with AuthProvider
export default function App() {
  return (
    <View 
      style={styles.appContainer}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel="Workforce Mobile Application"
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
});
