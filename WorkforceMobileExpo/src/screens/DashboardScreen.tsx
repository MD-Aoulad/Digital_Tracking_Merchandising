import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { shadowStyles } from '../utils/shadows';

const { width } = Dimensions.get('window');

// Mock data for demonstration
const mockStats = {
  totalEmployees: 45,
  activeEmployees: 38,
  pendingApprovals: 7,
  todayTasks: 23,
  completedTasks: 18,
  activeProjects: 5,
  attendanceRate: 94.2,
  productivityScore: 87.5,
};

const mockRecentActivity = [
  { id: 1, type: 'task', message: 'Sarah completed "Store Visit Report"', time: '2 min ago', status: 'completed' },
  { id: 2, type: 'attendance', message: 'Mike punched in at 8:45 AM', time: '15 min ago', status: 'active' },
  { id: 3, type: 'leave', message: 'Leave request from John approved', time: '1 hour ago', status: 'approved' },
  { id: 4, type: 'task', message: 'New task assigned to Team A', time: '2 hours ago', status: 'assigned' },
];

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'tasks' | 'analytics'>('overview');
  const [activeNav, setActiveNav] = useState<'dashboard' | 'tasks' | 'chat' | 'profile'>('dashboard');

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ item }: any) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityDot, { backgroundColor: getStatusColor(item.status) }]} />
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{item.message}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'active': return '#3B82F6';
      case 'approved': return '#10B981';
      case 'assigned': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  // Admin Dashboard
  if (isAdmin) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, {user?.name}</Text>
            <Text style={styles.subtitle}>Operations Manager Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile' as never)}>
            <Ionicons name="person-circle" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {['overview', 'employees', 'tasks', 'analytics'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {activeTab === 'overview' && (
            <>
              {/* Key Stats */}
              <View style={styles.statsGrid}>
                <StatCard
                  title="Active Employees"
                  value={mockStats.activeEmployees}
                  icon="people"
                  color="#3B82F6"
                  onPress={() => navigation.navigate('Employees' as never)}
                />
                <StatCard
                  title="Pending Approvals"
                  value={mockStats.pendingApprovals}
                  icon="time"
                  color="#F59E0B"
                  onPress={() => navigation.navigate('Approvals' as never)}
                />
                <StatCard
                  title="Today's Tasks"
                  value={mockStats.todayTasks}
                  icon="checkmark-circle"
                  color="#10B981"
                  onPress={() => navigation.navigate('Tasks' as never)}
                />
                <StatCard
                  title="Attendance Rate"
                  value={`${mockStats.attendanceRate}%`}
                  icon="trending-up"
                  color="#8B5CF6"
                  onPress={() => navigation.navigate('Attendance' as never)}
                />
              </View>

              {/* Quick Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                  <QuickAction
                    title="Assign Task"
                    icon="add-circle"
                    color="#10B981"
                    onPress={() => Alert.alert('Coming Soon', 'Task assignment feature will be available soon!')}
                  />
                  <QuickAction
                    title="View Reports"
                    icon="bar-chart"
                    color="#3B82F6"
                    onPress={() => Alert.alert('Coming Soon', 'Reports feature will be available soon!')}
                  />
                  <QuickAction
                    title="Team Chat"
                    icon="chatbubbles"
                    color="#8B5CF6"
                    onPress={() => navigation.navigate('Chat' as never)}
                  />
                  <QuickAction
                    title="Location Map"
                    icon="map"
                    color="#F59E0B"
                    onPress={() => Alert.alert('Coming Soon', 'Location tracking feature will be available soon!')}
                  />
                </View>
              </View>

              {/* Recent Activity */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {mockRecentActivity.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))}
              </View>
            </>
          )}

          {activeTab === 'employees' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Employee Management</Text>
              <View style={styles.quickActionsGrid}>
                <QuickAction
                  title="View All Employees"
                  icon="people"
                  color="#3B82F6"
                  onPress={() => navigation.navigate('Employees' as never)}
                />
                <QuickAction
                  title="Add Employee"
                  icon="person-add"
                  color="#10B981"
                  onPress={() => Alert.alert('Coming Soon', 'Add employee feature will be available soon!')}
                />
                <QuickAction
                  title="Attendance"
                  icon="time"
                  color="#F59E0B"
                  onPress={() => Alert.alert('Coming Soon', 'Attendance tracking feature will be available soon!')}
                />
                <QuickAction
                  title="Performance"
                  icon="trending-up"
                  color="#8B5CF6"
                  onPress={() => Alert.alert('Coming Soon', 'Performance analytics feature will be available soon!')}
                />
              </View>
            </View>
          )}

          {activeTab === 'tasks' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Task Management</Text>
              <View style={styles.quickActionsGrid}>
                <QuickAction
                  title="Create Task"
                  icon="add-circle"
                  color="#10B981"
                  onPress={() => Alert.alert('Coming Soon', 'Create task feature will be available soon!')}
                />
                <QuickAction
                  title="View Tasks"
                  icon="list"
                  color="#3B82F6"
                  onPress={() => navigation.navigate('Tasks' as never)}
                />
                <QuickAction
                  title="Task Templates"
                  icon="document-text"
                  color="#F59E0B"
                  onPress={() => Alert.alert('Coming Soon', 'Task templates feature will be available soon!')}
                />
                <QuickAction
                  title="Progress Report"
                  icon="bar-chart"
                  color="#8B5CF6"
                  onPress={() => Alert.alert('Coming Soon', 'Progress reports feature will be available soon!')}
                />
              </View>
            </View>
          )}

          {activeTab === 'analytics' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Analytics & Reports</Text>
              <View style={styles.quickActionsGrid}>
                <QuickAction
                  title="Performance"
                  icon="trending-up"
                  color="#10B981"
                  onPress={() => Alert.alert('Coming Soon', 'Performance analytics feature will be available soon!')}
                />
                <QuickAction
                  title="Attendance"
                  icon="time"
                  color="#3B82F6"
                  onPress={() => Alert.alert('Coming Soon', 'Attendance analytics feature will be available soon!')}
                />
                <QuickAction
                  title="Productivity"
                  icon="speedometer"
                  color="#F59E0B"
                  onPress={() => Alert.alert('Coming Soon', 'Productivity analytics feature will be available soon!')}
                />
                <QuickAction
                  title="Reports"
                  icon="document-text"
                  color="#8B5CF6"
                  onPress={() => Alert.alert('Coming Soon', 'Reports feature will be available soon!')}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav} accessible accessibilityRole="tablist">
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveNav('dashboard'); navigation.navigate('Dashboard' as never); }} accessible accessibilityRole="tab" accessibilityLabel="Dashboard">
            <Ionicons name="home" size={28} color={activeNav === 'dashboard' ? '#007AFF' : '#6B7280'} />
            <Text style={[styles.navText, activeNav === 'dashboard' && { color: '#007AFF', fontWeight: 'bold' }]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveNav('tasks'); navigation.navigate('Tasks' as never); }} accessible accessibilityRole="tab" accessibilityLabel="Tasks">
            <Ionicons name="list" size={28} color={activeNav === 'tasks' ? '#007AFF' : '#6B7280'} />
            <Text style={[styles.navText, activeNav === 'tasks' && { color: '#007AFF', fontWeight: 'bold' }]}>Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveNav('chat'); navigation.navigate('Chat' as never); }} accessible accessibilityRole="tab" accessibilityLabel="Chat">
            <Ionicons name="chatbubbles" size={28} color={activeNav === 'chat' ? '#007AFF' : '#6B7280'} />
            <Text style={[styles.navText, activeNav === 'chat' && { color: '#007AFF', fontWeight: 'bold' }]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveNav('profile'); navigation.navigate('Profile' as never); }} accessible accessibilityRole="tab" accessibilityLabel="Profile">
            <Ionicons name="person" size={28} color={activeNav === 'profile' ? '#007AFF' : '#6B7280'} />
            <Text style={[styles.navText, activeNav === 'profile' && { color: '#007AFF', fontWeight: 'bold' }]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Employee Dashboard
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, {user?.name}</Text>
          <Text style={styles.subtitle}>Employee Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile' as never)}>
          <Ionicons name="person-circle" size={32} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Employee Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="My Tasks"
            value="5"
            icon="checkmark-circle"
            color="#10B981"
            onPress={() => navigation.navigate('MyTasks' as never)}
          />
          <StatCard
            title="Hours Today"
            value="6.5"
            icon="time"
            color="#3B82F6"
            onPress={() => navigation.navigate('TimeTracking' as never)}
          />
          <StatCard
            title="Leave Balance"
            value="12"
            icon="calendar"
            color="#F59E0B"
            onPress={() => navigation.navigate('Leave' as never)}
          />
          <StatCard
            title="Performance"
            value="92%"
            icon="trending-up"
            color="#8B5CF6"
            onPress={() => navigation.navigate('Performance' as never)}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Punch In/Out"
              icon="time"
              color="#10B981"
              onPress={() => navigation.navigate('PunchIn' as never)}
            />
            <QuickAction
              title="My Tasks"
              icon="list"
              color="#3B82F6"
              onPress={() => navigation.navigate('Tasks' as never)}
            />
            <QuickAction
              title="Team Chat"
              icon="chatbubbles"
              color="#8B5CF6"
              onPress={() => navigation.navigate('Chat' as never)}
            />
            <QuickAction
              title="Request Leave"
              icon="calendar"
              color="#F59E0B"
              onPress={() => Alert.alert('Coming Soon', 'Leave request feature will be available soon!')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {mockRecentActivity.slice(0, 3).map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveNav('dashboard'); navigation.navigate('Dashboard' as never); }}>
          <Ionicons name="home" size={24} color="#007AFF" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => { setActiveNav('tasks'); navigation.navigate('Tasks' as never); }}>
            <Ionicons name="list" size={24} color="#6B7280" />
            <Text style={styles.navText}>Tasks</Text>
          </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveNav('chat'); navigation.navigate('Chat' as never); }}>
          <Ionicons name="chatbubbles" size={24} color="#6B7280" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveNav('profile'); navigation.navigate('Profile' as never); }}>
          <Ionicons name="person" size={24} color="#6B7280" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  profileButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f3f4f6',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    ...shadowStyles.medium,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...shadowStyles.small,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    ...shadowStyles.small,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default DashboardScreen; 