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
import { useAuth } from '../../contexts/AuthContext';

interface DashboardMetric {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'task' | 'report' | 'attendance' | 'notification';
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetric[]>([
    {
      title: 'Active Tasks',
      value: '5',
      icon: 'list',
      color: '#007AFF',
    },
    {
      title: 'Completed Today',
      value: '3',
      icon: 'checkmark-circle',
      color: '#34C759',
    },
    {
      title: 'Hours Worked',
      value: '8.5',
      icon: 'time',
      color: '#FF9500',
    },
    {
      title: 'Reports Due',
      value: '2',
      icon: 'document-text',
      color: '#FF3B30',
    },
  ]);

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      title: 'Task Completed',
      description: 'Store inventory check completed',
      time: '2 hours ago',
      type: 'task',
    },
    {
      id: '2',
      title: 'Report Submitted',
      description: 'Weekly sales report submitted',
      time: '4 hours ago',
      type: 'report',
    },
    {
      id: '3',
      title: 'Clock In',
      description: 'You clocked in at 9:00 AM',
      time: '8 hours ago',
      type: 'attendance',
    },
    {
      id: '4',
      title: 'New Task Assigned',
      description: 'New task: Store visit scheduled',
      time: '1 day ago',
      type: 'notification',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Refreshed', 'Dashboard data updated!');
    }, 1000);
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'task':
        return 'list';
      case 'report':
        return 'document-text';
      case 'attendance':
        return 'time';
      case 'notification':
        return 'notifications';
      default:
        return 'information-circle';
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'task':
        return '#007AFF';
      case 'report':
        return '#34C759';
      case 'attendance':
        return '#FF9500';
      case 'notification':
        return '#FF3B30';
      default:
        return '#666';
    }
  };

  const QuickAction = ({ 
    icon, 
    title, 
    onPress 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={24} color="#007AFF" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <TouchableOpacity
              key={index}
              style={styles.metricCard}
              onPress={metric.onPress}
            >
              <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
                <Ionicons name={metric.icon} size={24} color={metric.color} />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricTitle}>{metric.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon="add-circle"
            title="New Task"
            onPress={() => Alert.alert('Coming Soon', 'Create new task feature')}
          />
          <QuickAction
            icon="camera"
            title="Clock In/Out"
            onPress={() => Alert.alert('Coming Soon', 'Time tracking feature')}
          />
          <QuickAction
            icon="document-text"
            title="Submit Report"
            onPress={() => Alert.alert('Coming Soon', 'Report submission feature')}
          />
          <QuickAction
            icon="location"
            title="Store Visit"
            onPress={() => Alert.alert('Coming Soon', 'Store visit feature')}
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[
              styles.activityIcon,
              { backgroundColor: getActivityColor(activity.type) + '20' }
            ]}>
              <Ionicons
                name={getActivityIcon(activity.type)}
                size={20}
                color={getActivityColor(activity.type)}
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  welcomeSection: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  metricsSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: -20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activitySection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  bottomSpacing: {
    height: 20,
  },
});
