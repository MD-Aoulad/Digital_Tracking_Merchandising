/**
 * Login Screen for Workforce Management Platform Mobile App
 * 
 * Handles user authentication with email and password.
 * Matches the web platform authentication flow.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    console.log('🚀 Login button pressed with:', { email, password });
    
    // Test network connectivity first (commented out for production)
    /*
    try {
      console.log('🌐 Testing network connectivity...');
      const testResponse = await fetch('http://192.168.178.150:5000/api/test');
      console.log('🌐 Test response:', testResponse.status);
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('🌐 Test data:', testData);
      }
    } catch (networkError) {
      console.log('❌ Network connectivity test failed:', networkError);
      Alert.alert('Network Error', 'Cannot connect to server. Please check your network connection.');
      return;
    }
    */
    
    clearError();
    const success = await login(email, password);
    
    console.log('📱 Login result:', { success, error });
    
    if (!success && error) {
      console.log('❌ Showing error alert:', error);
      Alert.alert('Login Failed', error);
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="business" size={80} color="#007AFF" />
          <Text style={styles.title}>Workforce Mobile</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.quickLoginContainer}>
            <Text style={styles.quickLoginTitle}>Quick Login (Demo):</Text>
            <TouchableOpacity
              style={styles.quickLoginButton}
              onPress={() => quickLogin('richard@company.com')}
            >
              <Text style={styles.quickLoginText}>Login as Richard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickLoginButton}
              onPress={() => quickLogin('admin@company.com')}
            >
              <Text style={styles.quickLoginText}>Login as Admin</Text>
            </TouchableOpacity>
            {/* Debug button - uncomment for testing */}
            <TouchableOpacity
              style={[styles.quickLoginButton, { backgroundColor: '#f59e0b' }]}
              onPress={async () => {
                console.log('🧪 Testing API connectivity...');
                try {
                  const response = await fetch('http://192.168.178.150:5000/api/test');
                  const data = await response.json();
                  console.log('🧪 API Test Result:', { status: response.status, data });
                  Alert.alert('API Test', `Status: ${response.status}\nData: ${JSON.stringify(data)}`);
                } catch (error) {
                  console.log('🧪 API Test Error:', error);
                  Alert.alert('API Test Error', error instanceof Error ? error.message : 'Unknown error');
                }
              }}
            >
              <Text style={styles.quickLoginText}>Test API Connection</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Demo Credentials:{'\n'}
            Email: admin@company.com{'\n'}
            Password: password
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 12,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickLoginContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  quickLoginTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickLoginButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  quickLoginText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
