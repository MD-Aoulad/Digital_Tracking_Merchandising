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
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { shadowStyles } from '../utils/shadows';

const { width } = Dimensions.get('window');

// Mock data for demonstration
const mockEmployees = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Sales Representative',
    department: 'Sales & Marketing',
    status: 'active',
    avatar: null,
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: '2023-01-15',
    manager: 'John Smith',
    lastActive: '2 hours ago',
    attendanceRate: 95.2,
    performanceScore: 87.5,
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'Operations Specialist',
    department: 'Operations',
    status: 'active',
    avatar: null,
    phone: '+1 (555) 234-5678',
    location: 'Los Angeles, CA',
    joinDate: '2023-03-20',
    manager: 'Lisa Wang',
    lastActive: '1 hour ago',
    attendanceRate: 92.8,
    performanceScore: 91.2,
  },
  {
    id: '3',
    name: 'Lisa Wang',
    email: 'lisa.wang@company.com',
    role: 'Team Lead',
    department: 'Operations',
    status: 'active',
    avatar: null,
    phone: '+1 (555) 345-6789',
    location: 'Chicago, IL',
    joinDate: '2022-11-10',
    manager: 'David Kim',
    lastActive: '30 min ago',
    attendanceRate: 98.5,
    performanceScore: 94.8,
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@company.com',
    role: 'Manager',
    department: 'Operations',
    status: 'active',
    avatar: null,
    phone: '+1 (555) 456-7890',
    location: 'Houston, TX',
    joinDate: '2022-08-05',
    manager: 'CEO',
    lastActive: '5 min ago',
    attendanceRate: 96.7,
    performanceScore: 89.3,
  },
  {
    id: '5',
    name: 'Emma Davis',
    email: 'emma.davis@company.com',
    role: 'Sales Representative',
    department: 'Sales & Marketing',
    status: 'inactive',
    avatar: null,
    phone: '+1 (555) 567-8901',
    location: 'Miami, FL',
    joinDate: '2023-06-12',
    manager: 'John Smith',
    lastActive: '1 week ago',
    attendanceRate: 78.9,
    performanceScore: 72.1,
  },
];

const EmployeesScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState(mockEmployees);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesTab = activeTab === 'all' || employee.status === activeTab;
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const handleEmployeeAction = (employeeId: string, action: string) => {
    Alert.alert(
      'Employee Action',
      `Are you sure you want to ${action} this employee?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: action.charAt(0).toUpperCase() + action.slice(1), 
          onPress: () => {
            // Update employee status
            setEmployees(prevEmployees => 
              prevEmployees.map(employee => 
                employee.id === employeeId 
                  ? { ...employee, status: action === 'activate' ? 'active' : 'inactive' }
                  : employee
              )
            );
          }
        },
      ]
    );
  };

  const EmployeeCard = ({ employee }: { employee: any }) => (
    <TouchableOpacity 
      style={styles.employeeCard}
      onPress={() => navigation.navigate('EmployeeDetails' as never)}
    >
      <View style={styles.employeeHeader}>
        <View style={styles.employeeInfo}>
          {employee.avatar ? (
            <Image source={{ uri: employee.avatar }} style={styles.employeeAvatar} />
          ) : (
            <View style={styles.employeeAvatarPlaceholder}>
              <Ionicons name="person" size={24} color="#6b7280" />
            </View>
          )}
          <View style={styles.employeeDetails}>
            <Text style={styles.employeeName}>{employee.name}</Text>
            <Text style={styles.employeeRole}>{employee.role}</Text>
            <Text style={styles.employeeEmail}>{employee.email}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(employee.status) }]}>
          <Text style={styles.statusText}>{getStatusText(employee.status)}</Text>
        </View>
      </View>
      
      <View style={styles.employeeStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Attendance</Text>
          <Text style={styles.statValue}>{employee.attendanceRate}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Performance</Text>
          <Text style={styles.statValue}>{employee.performanceScore}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Last Active</Text>
          <Text style={styles.statValue}>{employee.lastActive}</Text>
        </View>
      </View>

      <View style={styles.employeeActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
          onPress={() => navigation.navigate('EmployeeDetails' as never)}
        >
          <Ionicons name="eye" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#10b981' }]}
          onPress={() => navigation.navigate('AssignTask' as never)}
        >
          <Ionicons name="add-circle" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Assign Task</Text>
        </TouchableOpacity>
        {employee.status === 'active' ? (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
            onPress={() => handleEmployeeAction(employee.id, 'deactivate')}
          >
            <Ionicons name="pause" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Deactivate</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => handleEmployeeAction(employee.id, 'activate')}
          >
            <Ionicons name="play" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Activate</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Management</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddEmployee' as never)}>
          <Ionicons name="person-add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['all', 'active', 'inactive'].map((tab) => (
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

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{employees.filter(e => e.status === 'active').length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{employees.filter(e => e.status === 'inactive').length}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{employees.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {(employees.reduce((sum, e) => sum + e.attendanceRate, 0) / employees.length).toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Avg Attendance</Text>
        </View>
      </View>

      {/* Employees List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredEmployees.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No employees found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'No employees in this category'}
            </Text>
          </View>
        ) : (
          filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddEmployee' as never)}
      >
        <Ionicons name="person-add" size={24} color="#fff" />
      </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...shadowStyles.small,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  employeeInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  employeeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  employeeAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  employeeRole: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  employeeEmail: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  employeeStats: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  employeeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 12,
    ...shadowStyles.medium,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default EmployeesScreen; 