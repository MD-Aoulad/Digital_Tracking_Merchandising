/**
 * Dashboard Screen for Workforce Management Platform Mobile App
 * 
 * Main dashboard showing overview of assigned stores, tasks, and quick actions.
 * Matches the web platform dashboard functionality.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import authService from '../../services/auth/authService';
import { User, Store, Task } from '../../types';

interface DashboardStats {
  totalStores: number;
  completedTasks: number;
  pendingTasks: number;
  todayPunchIns: number;
}

export default function DashboardScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalStores: 0,
    completedTasks: 0,
    pendingTasks: 0,
    todayPunchIns: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const currentUser = authService.getAuthState().user;
      setUser(currentUser);

      // TODO: Load dashboard stats from API
      // For now, using mock data
      setStats({
        totalStores: 12,
        completedTasks: 8,
        pendingTasks: 4,
        todayPunchIns: 3,
      });
    } catch (error) {
      console.error('Dashboard load error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
          },
        },
      ]
    );
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  const QuickAction = ({ title, icon, onPress, color }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#ffffff" />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Stores"
              value={stats.totalStores}
              icon="business-outline"
              color="#3b82f6"
            />
            <StatCard
              title="Completed Tasks"
              value={stats.completedTasks}
              icon="checkmark-circle-outline"
              color="#10b981"
            />
            <StatCard
              title="Pending Tasks"
              value={stats.pendingTasks}
              icon="time-outline"
              color="#f59e0b"
            />
            <StatCard
              title="Punch-ins"
              value={stats.todayPunchIns}
              icon="location-outline"
              color="#8b5cf6"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Punch In"
              icon="location"
              color="#3b82f6"
              onPress={() => navigation.navigate('Stores')}
            />
            <QuickAction
              title="View Tasks"
              icon="list"
              color="#10b981"
              onPress={() => navigation.navigate('Tasks')}
            />
            <QuickAction
              title="Submit Report"
              icon="document-text"
              color="#f59e0b"
              onPress={() => navigation.navigate('Reports')}
            />
            <QuickAction
              title="My Profile"
              icon="person"
              color="#8b5cf6"
              onPress={() => Alert.alert('Profile', 'Profile screen coming soon')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              No recent activity to display
            </Text>
            <Text style={styles.activitySubtext}>
              Your recent punch-ins and task completions will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  activitySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
