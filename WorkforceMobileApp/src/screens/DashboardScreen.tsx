import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalHours: number;
  thisWeek: number;
  thisMonth: number;
  overtime: number;
  attendanceRate: number;
}

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalHours: 0,
    thisWeek: 0,
    thisMonth: 0,
    overtime: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    // Mock data - in production, fetch from API
    setStats({
      totalHours: 156.5,
      thisWeek: 42.5,
      thisMonth: 168.0,
      overtime: 8.5,
      attendanceRate: 95.2,
    });
  }, []);

  const StatCard = ({ title, value, subtitle, icon, color }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const QuickAction = ({ title, icon, onPress, color }: {
    title: string;
    icon: string;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color="#fff" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Good morning, {user?.name}!</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.avatar}>
          <Icon name="person" size={32} color="#007AFF" />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>This Week's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Hours This Week"
            value={`${stats.thisWeek}h`}
            subtitle="Target: 40h"
            icon="schedule"
            color="#4CAF50"
          />
          <StatCard
            title="Overtime"
            value={`${stats.overtime}h`}
            subtitle="This week"
            icon="timer"
            color="#FF9800"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            subtitle="This month"
            icon="trending-up"
            color="#2196F3"
          />
          <StatCard
            title="Total Hours"
            value={`${stats.totalHours}h`}
            subtitle="This month"
            icon="work"
            color="#9C27B0"
          />
        </View>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Clock In/Out"
            icon="access-time"
            color="#4CAF50"
            onPress={() => {}}
          />
          <QuickAction
            title="View Schedule"
            icon="calendar-today"
            color="#2196F3"
            onPress={() => {}}
          />
          <QuickAction
            title="Request Time Off"
            icon="event-busy"
            color="#FF9800"
            onPress={() => {}}
          />
          <QuickAction
            title="Report Issue"
            icon="report-problem"
            color="#F44336"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.recentActivityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityItem}>
          <View style={[styles.activityIcon, { backgroundColor: '#4CAF50' }]}>
            <Icon name="login" size={16} color="#fff" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Clock In</Text>
            <Text style={styles.activityTime}>Today at 9:00 AM</Text>
          </View>
        </View>
        <View style={styles.activityItem}>
          <View style={[styles.activityIcon, { backgroundColor: '#F44336' }]}>
            <Icon name="logout" size={16} color="#fff" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Clock Out</Text>
            <Text style={styles.activityTime}>Yesterday at 5:30 PM</Text>
          </View>
        </View>
        <View style={styles.activityItem}>
          <View style={[styles.activityIcon, { backgroundColor: '#2196F3' }]}>
            <Icon name="schedule" size={16} color="#fff" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Break Time</Text>
            <Text style={styles.activityTime}>Yesterday at 12:00 PM</Text>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: (width - 60) / 2,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  quickActionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: (width - 60) / 2,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  recentActivityContainer: {
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default DashboardScreen; 